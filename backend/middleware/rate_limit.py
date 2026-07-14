# backend/middleware/rate_limit.py

"""
middleware/rate_limit.py

Middleware para limitar solicitudes repetidas a endpoints sensibles.

Este módulo mantiene contadores temporales en memoria por proceso para:
- Reducir el abuso del formulario de contacto antes de procesar el cuerpo o el archivo.
- Evitar solicitudes masivas al endpoint público de generación de tokens.
- Registrar los bloqueos sin guardar la dirección IP en claro.

La limitación en memoria es una primera barrera de aplicación. En despliegues con varios
procesos debe complementarse con el límite equivalente en el proxy o con un almacén compartido.
"""

import asyncio
import hashlib
import hmac
import logging
import math
from ipaddress import ip_address
import time
from collections import defaultdict, deque
from dataclasses import dataclass
from typing import Callable, Deque, Dict, Iterable, Set, Tuple

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.responses import JSONResponse, Response

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
        """
        Registra una solicitud permitida o calcula cuánto debe esperar una bloqueada.

        Returns:
            tuple[bool, int]: ``(permitida, segundos_para_reintentar)``.
        """
        now = self._clock()
        cutoff = now - rule.window_seconds
        bucket_key = (rule.name, client_key)

        async with self._lock:
            self._cleanup_expired_buckets(now)
            bucket = self._requests[bucket_key]
            self._window_seconds[bucket_key] = rule.window_seconds

            while bucket and bucket[0] <= cutoff:
                bucket.popleft()

            if len(bucket) >= rule.max_requests:
                retry_after = max(1, math.ceil(rule.window_seconds - (now - bucket[0])))
                return False, retry_after

            bucket.append(now)
            return True, 0

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
        clock: Callable[[], float] = time.monotonic,
    ) -> None:
        super().__init__(app)
        self._rules = {
            (rule.method.upper(), self._normalize_path(rule.path)): rule
            for rule in rules
        }
        self._secret_key = secret_key.encode("utf-8")
        self._trusted_proxy_ips: Set[str] = {value.strip() for value in trusted_proxy_ips if value.strip()}
        self._limiter = InMemoryRateLimiter(clock=clock)

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        normalized_path = self._normalize_path(request.url.path)
        rule = self._rules.get((request.method.upper(), normalized_path))

        if rule is None:
            return await call_next(request)

        client_key = self._build_anonymous_client_key(request)
        allowed, retry_after = await self._limiter.check(rule, client_key)
        if allowed:
            return await call_next(request)

        # El identificador está derivado mediante HMAC y no permite recuperar la IP original.
        logger.warning(
            "Límite de solicitudes excedido | endpoint=%s | cliente=%s | reintento=%ss",
            rule.name,
            client_key,
            retry_after,
        )
        return JSONResponse(
            status_code=429,
            content={"detail": "Demasiadas solicitudes. Inténtalo de nuevo más tarde."},
            headers={
                "Retry-After": str(retry_after),
                "Cache-Control": "no-store",
            },
        )

    def _build_anonymous_client_key(self, request: Request) -> str:
        client_host = self._resolve_client_host(request)
        return hmac.new(
            self._secret_key,
            client_host.encode("utf-8", errors="replace"),
            hashlib.sha256,
        ).hexdigest()[:16]

    def _resolve_client_host(self, request: Request) -> str:
        """Usa X-Forwarded-For solo cuando la conexión procede de un proxy confiable."""
        direct_host = request.client.host if request.client else "unknown"
        if direct_host not in self._trusted_proxy_ips:
            return direct_host

        forwarded_for = request.headers.get("x-forwarded-for", "")
        forwarded_chain = [value.strip() for value in forwarded_for.split(",") if value.strip()]
        if not forwarded_chain:
            return direct_host

        # Recorre la cadena desde el proxy más cercano hacia el cliente. Elegir el primer
        # valor de la cabecera permitiría que un visitante antepusiera una IP falsa cuando
        # Nginx utiliza ``$proxy_add_x_forwarded_for``.
        for candidate in reversed(forwarded_chain):
            try:
                normalized_candidate = str(ip_address(candidate))
            except ValueError:
                logger.warning("Entrada inválida de X-Forwarded-For ignorada desde proxy confiable")
                continue

            if normalized_candidate not in self._trusted_proxy_ips:
                return normalized_candidate

        return direct_host

    @staticmethod
    def _normalize_path(path: str) -> str:
        normalized = path.rstrip("/")
        return normalized or "/"
