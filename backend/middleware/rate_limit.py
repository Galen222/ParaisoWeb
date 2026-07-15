# backend/middleware/rate_limit.py

"""
middleware/rate_limit.py

Middleware para limitar solicitudes repetidas a endpoints sensibles.

Este módulo mantiene contadores temporales en memoria por proceso para:
- Aplicar un límite global que cubra también rutas añadidas en el futuro.
- Aplicar límites específicos según el coste y riesgo de cada endpoint.
- Reducir el abuso antes de procesar formularios, archivos o consultas de base de datos.
- Registrar los bloqueos sin guardar la dirección IP en claro.

La limitación en memoria es una primera barrera de aplicación. En despliegues con varios
procesos debe complementarse con el límite equivalente en el proxy o con un almacén compartido.
"""

import asyncio
import hashlib
import hmac
import logging
import math
import re
import time
from collections import defaultdict, deque
from dataclasses import dataclass
from typing import Callable, Deque, Dict, Iterable, Pattern, Sequence, Set, Tuple

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.responses import JSONResponse, Response

from ..core.client_ip import normalize_host, resolve_client_host

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class RateLimitRule:
    """Describe un límite aplicable a un método y una ruta concretos."""

    name: str
    method: str
    path: str
    max_requests: int
    window_seconds: int

    def __post_init__(self) -> None:
        if not self.name.strip():
            raise ValueError("name no puede estar vacío")
        if not self.method.strip():
            raise ValueError("method no puede estar vacío")
        if not self.path.strip():
            raise ValueError("path no puede estar vacío")
        if self.max_requests <= 0:
            raise ValueError("max_requests debe ser mayor que cero")
        if self.window_seconds <= 0:
            raise ValueError("window_seconds debe ser mayor que cero")


class InMemoryRateLimiter:
    """Implementa una ventana deslizante por regla y cliente."""

    def __init__(self, clock: Callable[[], float] = time.monotonic) -> None:
        self._clock = clock
        self._requests: Dict[Tuple[str, str], Deque[float]] = defaultdict(deque)
        self._window_seconds: Dict[Tuple[str, str], int] = {}
        self._lock = asyncio.Lock()
        self._last_cleanup = self._clock()

    async def check(self, rule: RateLimitRule, client_key: str) -> tuple[bool, int]:
        """Comprueba una única regla conservando la API usada por pruebas y consumidores."""
        allowed, retry_after, _ = await self.check_many([rule], client_key)
        return allowed, retry_after

    async def check_many(
        self,
        rules: Sequence[RateLimitRule],
        client_key: str,
    ) -> tuple[bool, int, RateLimitRule | None]:
        """Comprueba todas las reglas de forma atómica y solo contabiliza peticiones permitidas.

        Una petición suele consumir una regla global y otra específica. Antes se añadía
        al contador global antes de comprobar la específica, por lo que peticiones ya
        bloqueadas podían agotar también el límite global para rutas no relacionadas.
        """
        if not rules:
            return True, 0, None

        now = self._clock()
        prepared_buckets: list[tuple[RateLimitRule, Deque[float]]] = []

        async with self._lock:
            self._cleanup_expired_buckets(now)

            for rule in rules:
                bucket_key = (rule.name, client_key)
                bucket = self._requests[bucket_key]
                self._window_seconds[bucket_key] = rule.window_seconds
                cutoff = now - rule.window_seconds

                while bucket and bucket[0] <= cutoff:
                    bucket.popleft()

                if len(bucket) >= rule.max_requests:
                    retry_after = max(1, math.ceil(rule.window_seconds - (now - bucket[0])))
                    return False, retry_after, rule

                prepared_buckets.append((rule, bucket))

            for _, bucket in prepared_buckets:
                bucket.append(now)

        return True, 0, None

    def _cleanup_expired_buckets(self, now: float) -> None:
        """Elimina periódicamente clientes inactivos para evitar crecimiento indefinido."""
        if now - self._last_cleanup < 60:
            return

        empty_keys = []
        for bucket_key, bucket in self._requests.items():
            window_seconds = self._window_seconds.get(bucket_key, 60)
            cutoff = now - window_seconds
            while bucket and bucket[0] <= cutoff:
                bucket.popleft()
            if not bucket:
                empty_keys.append(bucket_key)

        for bucket_key in empty_keys:
            self._requests.pop(bucket_key, None)
            self._window_seconds.pop(bucket_key, None)

        self._last_cleanup = now


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Aplica reglas de frecuencia antes de que FastAPI lea formularios o adjuntos."""

    def __init__(
        self,
        app,
        rules: Iterable[RateLimitRule],
        secret_key: str,
        trusted_proxy_ips: Iterable[str] = (),
        cors_allowed_origins: Iterable[str] = (),
        cors_allow_credentials: bool = False,
        clock: Callable[[], float] = time.monotonic,
    ) -> None:
        super().__init__(app)
        self._rules: list[tuple[RateLimitRule, Pattern[str]]] = [
            (rule, self._compile_path_pattern(rule.path))
            for rule in rules
        ]
        self._secret_key = secret_key.encode("utf-8")
        self._trusted_proxy_ips: Set[str] = {
            normalize_host(value)
            for value in trusted_proxy_ips
            if value.strip()
        }
        self._cors_allowed_origins = {
            origin.strip()
            for origin in cors_allowed_origins
            if origin.strip()
        }
        self._cors_allow_credentials = cors_allow_credentials
        self._limiter = InMemoryRateLimiter(clock=clock)

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        normalized_path = self._normalize_path(request.url.path)
        request_method = request.method.upper()
        matching_rules = [
            rule
            for rule, path_pattern in self._rules
            if (rule.method == "*" or rule.method.upper() == request_method)
            and path_pattern.fullmatch(normalized_path)
        ]

        if not matching_rules:
            return await call_next(request)

        client_key = self._build_anonymous_client_key(request)
        allowed, retry_after, blocked_rule = await self._limiter.check_many(
            matching_rules,
            client_key,
        )
        if allowed:
            return await call_next(request)

        # El identificador está derivado mediante HMAC y no permite recuperar la IP original.
        logger.warning(
            "Límite de solicitudes excedido | endpoint=%s | cliente=%s | reintento=%ss",
            blocked_rule.name if blocked_rule is not None else "desconocido",
            client_key,
            retry_after,
        )
        headers = {
            "Retry-After": str(retry_after),
            "Cache-Control": "no-store",
            "Pragma": "no-cache",
        }
        self._add_cors_headers(request, headers)
        return JSONResponse(
            status_code=429,
            content={"detail": "Demasiadas solicitudes. Inténtalo de nuevo más tarde."},
            headers=headers,
        )

    def _add_cors_headers(self, request: Request, headers: dict[str, str]) -> None:
        """Permite que el navegador lea un 429 generado antes de CORSMiddleware.

        En solicitudes normales se expone ``Retry-After`` para que el frontend pueda
        conocer la espera. En preflight se añaden también métodos y cabeceras
        autorizados; sin ellos el navegador transforma el 429 en un error CORS opaco.
        """
        origin = request.headers.get("origin", "").strip()
        if not origin or origin not in self._cors_allowed_origins:
            return

        headers["Access-Control-Allow-Origin"] = origin
        headers["Access-Control-Expose-Headers"] = "Retry-After"
        headers["Vary"] = "Origin"
        if self._cors_allow_credentials:
            headers["Access-Control-Allow-Credentials"] = "true"

        if request.method.upper() == "OPTIONS":
            headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
            headers["Access-Control-Allow-Headers"] = "Content-Type, x-timed-token"
            headers["Vary"] = (
                "Origin, Access-Control-Request-Method, "
                "Access-Control-Request-Headers"
            )

    def _build_anonymous_client_key(self, request: Request) -> str:
        client_host = self._resolve_client_host(request)
        return hmac.new(
            self._secret_key,
            client_host.encode("utf-8", errors="replace"),
            hashlib.sha256,
        ).hexdigest()[:16]

    def _resolve_client_host(self, request: Request) -> str:
        """Usa cabeceras de proxy solo cuando la conexión procede de un proxy confiable."""
        return resolve_client_host(request, self._trusted_proxy_ips, logger)

    @classmethod
    def _compile_path_pattern(cls, path: str) -> Pattern[str]:
        """Compila rutas exactas, globales o con parámetros ``{nombre}``."""
        if path.strip() == "*":
            return re.compile(r"^.*$")

        normalized = cls._normalize_path(path)
        segments = normalized.split("/")
        pattern_segments: list[str] = []
        for segment in segments:
            if segment.startswith("{") and segment.endswith("}") and len(segment) > 2:
                pattern_segments.append(r"[^/]+")
            else:
                pattern_segments.append(re.escape(segment))

        return re.compile(r"^" + "/".join(pattern_segments) + r"$")

    @staticmethod
    def _normalize_path(path: str) -> str:
        normalized = path.rstrip("/")
        return normalized or "/"
