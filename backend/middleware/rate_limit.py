# backend/middleware/rate_limit.py

"""
middleware/rate_limit.py

Middleware para limitar solicitudes repetidas a endpoints sensibles.

Este módulo mantiene contadores temporales compartidos en Redis para:
- Aplicar un límite global que cubra también rutas añadidas en el futuro.
- Aplicar límites específicos según el coste y riesgo de cada endpoint.
- Reducir el abuso antes de procesar formularios, archivos o consultas de base de datos.
- Registrar los bloqueos sin guardar la dirección IP en claro.

La limitación distribuida actúa como barrera común para todos los workers. Redis y un
script Lua atómico evitan que cada proceso mantenga contadores independientes.
"""

import asyncio
import hashlib
import hmac
import logging
import math
import os
import re
import secrets
import time
from collections import defaultdict, deque
from dataclasses import dataclass
from typing import (
    Callable,
    Deque,
    Dict,
    Iterable,
    Pattern,
    Protocol,
    Sequence,
    Set,
    Tuple,
)

from fastapi import Request
from redis.asyncio import Redis
from redis.exceptions import RedisError
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.responses import JSONResponse, Response

from ..core.client_ip import normalize_host, resolve_client_host

logger = logging.getLogger(__name__)


# Comprueba todas las reglas aplicables y registra la petición en una única operación.
# KEYS contiene un sorted set por regla. ARGV contiene el instante, un miembro único
# y, por cada clave, el máximo de peticiones y la ventana en milisegundos.
RATE_LIMIT_LUA_SCRIPT = r"""
local now_ms = tonumber(ARGV[1])
local member = ARGV[2]

for index = 1, #KEYS do
    local argument_offset = 3 + ((index - 1) * 2)
    local max_requests = tonumber(ARGV[argument_offset])
    local window_ms = tonumber(ARGV[argument_offset + 1])
    local cutoff_ms = now_ms - window_ms

    redis.call('ZREMRANGEBYSCORE', KEYS[index], '-inf', cutoff_ms)
    local current_count = redis.call('ZCARD', KEYS[index])

    if current_count >= max_requests then
        local oldest = redis.call('ZRANGE', KEYS[index], 0, 0, 'WITHSCORES')
        local retry_ms = window_ms
        if oldest[2] ~= nil then
            retry_ms = tonumber(oldest[2]) + window_ms - now_ms
        end
        local retry_seconds = math.max(1, math.ceil(retry_ms / 1000))
        return {0, retry_seconds, index}
    end
end

for index = 1, #KEYS do
    local argument_offset = 3 + ((index - 1) * 2)
    local window_ms = tonumber(ARGV[argument_offset + 1])
    redis.call('ZADD', KEYS[index], now_ms, member)
    redis.call('PEXPIRE', KEYS[index], window_ms)
end

return {1, 0, 0}
"""


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
    """Implementa una ventana deslizante por regla y cliente.

    Se conserva para pruebas unitarias y ejecuciones deliberadas de un solo proceso.
    El backend de producción inyecta ``RedisRateLimiter`` para compartir los contadores.
    """

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


class RateLimiterUnavailableError(RuntimeError):
    """Indica que Redis no ha podido aplicar el límite de forma segura."""


class RateLimiter(Protocol):
    """Contrato común para los limitadores en memoria y Redis."""

    async def check_many(
        self,
        rules: Sequence[RateLimitRule],
        client_key: str,
    ) -> tuple[bool, int, RateLimitRule | None]:
        """Comprueba conjuntamente todas las reglas aplicables a una petición."""
        ...


class RedisRateLimiter:
    """Implementa una ventana deslizante compartida por todos los workers.

    El script Lua comprueba primero todas las reglas y solo registra la petición
    cuando ninguna está agotada. Así se conserva la atomicidad que ya ofrecía el
    limitador en memoria, pero utilizando un estado común entre procesos.
    """

    def __init__(
        self,
        redis_client: Redis,
        key_prefix: str,
        *,
        clock: Callable[[], float] = time.time,
    ) -> None:
        self._redis = redis_client
        self._key_prefix = key_prefix.rstrip(":")
        self._clock = clock
        self._script = redis_client.register_script(RATE_LIMIT_LUA_SCRIPT)

    async def check_many(
        self,
        rules: Sequence[RateLimitRule],
        client_key: str,
    ) -> tuple[bool, int, RateLimitRule | None]:
        """Comprueba todas las reglas mediante una única operación atómica en Redis."""
        if not rules:
            return True, 0, None

        now_ms = int(self._clock() * 1000)
        # El miembro debe ser único incluso cuando dos workers reciben una petición
        # durante el mismo milisegundo; de lo contrario ZADD sobrescribiría una entrada.
        member = f"{now_ms}:{os.getpid()}:{secrets.token_hex(8)}"
        keys = [f"{self._key_prefix}:{rule.name}:{client_key}" for rule in rules]
        arguments: list[str | int] = [now_ms, member]
        for rule in rules:
            arguments.extend((rule.max_requests, rule.window_seconds * 1000))

        try:
            raw_result = await self._script(keys=keys, args=arguments)
        except RedisError as error:
            raise RateLimiterUnavailableError("Redis no está disponible") from error

        if not isinstance(raw_result, (list, tuple)) or len(raw_result) != 3:
            raise RateLimiterUnavailableError(
                "Redis devolvió una respuesta de rate limit no válida"
            )

        try:
            allowed = int(raw_result[0]) == 1
            retry_after = max(0, int(raw_result[1]))
            blocked_index = int(raw_result[2])
        except (TypeError, ValueError) as error:
            raise RateLimiterUnavailableError(
                "Redis devolvió datos de rate limit no válidos"
            ) from error

        if allowed:
            return True, 0, None

        if blocked_index < 1 or blocked_index > len(rules):
            raise RateLimiterUnavailableError(
                "Redis devolvió una regla bloqueada no válida"
            )

        return False, max(1, retry_after), rules[blocked_index - 1]


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Aplica reglas de frecuencia antes de que FastAPI lea formularios o adjuntos."""

    _DEPENDENCY_STATUS_PATHS = frozenset({"/health", "/livez"})

    def __init__(
        self,
        app,
        rules: Iterable[RateLimitRule],
        secret_key: str,
        trusted_proxy_ips: Iterable[str] = (),
        cors_allowed_origins: Iterable[str] = (),
        cors_allow_credentials: bool = False,
        clock: Callable[[], float] = time.monotonic,
        limiter: RateLimiter | None = None,
    ) -> None:
        super().__init__(app)
        raw_rules = list(rules)
        rule_names = [rule.name for rule in raw_rules]
        if len(rule_names) != len(set(rule_names)):
            raise ValueError("Los nombres de las reglas de rate limit deben ser únicos")

        self._rules: list[tuple[RateLimitRule, Pattern[str]]] = [
            (rule, self._compile_path_pattern(rule.path))
            for rule in raw_rules
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
        # Las pruebas y usos de un solo proceso mantienen el comportamiento anterior.
        # Producción inyecta RedisRateLimiter desde ``create_app``.
        self._limiter: RateLimiter = (
            limiter if limiter is not None else InMemoryRateLimiter(clock=clock)
        )

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
        try:
            allowed, retry_after, blocked_rule = await self._limiter.check_many(
                matching_rules,
                client_key,
            )
            self._set_redis_state(request, available=True)
        except RateLimiterUnavailableError:
            self._set_redis_state(request, available=False)
            return await self._handle_unavailable_limiter(
                request,
                call_next,
                normalized_path,
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

    async def _handle_unavailable_limiter(
        self,
        request: Request,
        call_next: RequestResponseEndpoint,
        normalized_path: str,
    ) -> Response:
        """Mantiene diagnósticos accesibles y falla cerrado en las rutas de negocio."""
        # Los endpoints operativos deben seguir accesibles para diagnosticar la caída.
        # El resto falla cerrado: continuar sin el límite compartido permitiría abuso.
        if normalized_path in self._DEPENDENCY_STATUS_PATHS:
            return await call_next(request)

        headers = {
            "Retry-After": "1",
            "Cache-Control": "no-store",
            "Pragma": "no-cache",
        }
        self._add_cors_headers(request, headers)
        return JSONResponse(
            status_code=503,
            content={"detail": "Servicio temporalmente no disponible."},
            headers=headers,
        )

    @staticmethod
    def _set_redis_state(request: Request, *, available: bool) -> None:
        """Actualiza el estado visible por /health y registra solo sus transiciones."""
        previous = getattr(request.app.state, "redis_available", None)
        request.app.state.redis_available = available
        if previous is True and not available:
            logger.warning(
                "Se ha perdido la conexión con Redis; el rate limit falla cerrado."
            )
        elif previous is False and available:
            logger.info("La conexión con Redis se ha recuperado.")

    def _add_cors_headers(self, request: Request, headers: dict[str, str]) -> None:
        """Permite que el navegador lea un 429 o 503 generado antes de CORSMiddleware.

        En solicitudes normales se expone ``Retry-After`` para que el frontend pueda
        conocer la espera. En preflight se añaden también métodos y cabeceras
        autorizados; sin ellos el navegador transforma el error en una respuesta CORS opaca.
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
