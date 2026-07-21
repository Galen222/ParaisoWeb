# backend/main.py

"""
main.py

Módulo principal de la aplicación FastAPI.

Este archivo se encarga de:
- Configurar la instancia de FastAPI.
- Aplicar middlewares como CORS y logging.
- Registrar rutas (routers) para manejar la API.
- Manejar el ciclo de vida de la aplicación (inicio y cierre).
- Compartir mediante Redis el rate limiting entre varios workers de Uvicorn.

Dependencias:
- FastAPI: Para la creación y configuración de la aplicación.
- Middleware: Para logging y manejo de CORS.
- SQLAlchemy: Para comprobar y utilizar la conexión con la base de datos.
- Redis: Para compartir el estado del rate limiting entre procesos.
"""

from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from redis.asyncio import Redis
from .middleware.cache_control import ApiNoStoreMiddleware
from .middleware.contact_auth import ContactTokenGuardMiddleware
from .middleware.logging import LoggingMiddleware
from .middleware.rate_limit import (
    RateLimiter,
    RateLimitMiddleware,
    RateLimitRule,
    RedisRateLimiter,
)
from .middleware.request_size import RequestSizeLimitMiddleware, RequestSizeRule
from contextlib import asynccontextmanager
from .routers import contacto, charcuteria, blog, sitemap, token
from .database import engine
from .core.config import settings
from .core.logging_config import configure_logging
from .core.redis_client import create_redis_client
import asyncio
import logging
from sqlalchemy import text

configure_logging(settings)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Maneja el ciclo de vida de la aplicación FastAPI.

    Este método se ejecuta en dos momentos:
    - `startup`: Comprobación de las conexiones con MySQL y con el almacén Redis
      compartido por los workers.
    - `shutdown`: Liberación de recursos, como el cierre de las conexiones a MySQL y Redis.

    Args:
        app (FastAPI): Instancia de la aplicación FastAPI.

    Yields:
        None: Indica que la aplicación está lista para recibir solicitudes.
    """
    app.state.database_available = False
    app.state.redis_available = False

    redis_client = getattr(app.state, "redis_client", None)
    if redis_client is None:
        redis_client = create_redis_client(settings)
        app.state.redis_client = redis_client
        app.state.redis_client_owned = True

    if getattr(app.state, "rate_limiter", None) is None:
        app.state.rate_limiter = RedisRateLimiter(
            redis_client,
            settings.REDIS_RATE_LIMIT_PREFIX,
        )

    async def initialize_database() -> None:
        # Comprueba que MySQL acepta conexiones antes de declarar disponible este worker.
        # La creación y evolución del esquema no forman parte del arranque de la API.
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))

    async def initialize_redis() -> None:
        # Verifica que el almacén compartido acepta operaciones antes de declarar
        # disponible el rate limiting distribuido de este worker.
        pong = await redis_client.ping()
        if pong is not True:
            raise RuntimeError("Redis no respondió correctamente a PING")

    try:
        database_result, redis_result = await asyncio.gather(
            asyncio.wait_for(
                initialize_database(),
                timeout=settings.DATABASE_STARTUP_TIMEOUT_SECONDS,
            ),
            asyncio.wait_for(
                initialize_redis(),
                timeout=settings.REDIS_STARTUP_TIMEOUT_SECONDS,
            ),
            return_exceptions=True,
        )

        if isinstance(database_result, BaseException):
            if isinstance(database_result, TimeoutError):
                # Evita que un servidor MySQL inaccesible bloquee indefinidamente el arranque de la API.
                logger.error(
                    "La comprobación de la base de datos superó el tiempo máximo de %.1fs; "
                    "la aplicación continúa en modo degradado.",
                    settings.DATABASE_STARTUP_TIMEOUT_SECONDS,
                )
            else:
                # La API continúa disponible para endpoints que no dependen de la base de datos.
                logger.error(
                    "No se ha podido conectar a la base de datos; "
                    "la aplicación continúa en modo degradado.",
                    exc_info=(
                        type(database_result),
                        database_result,
                        database_result.__traceback__,
                    ),
                )
        else:
            app.state.database_available = True
            logger.info(
                "Aplicación iniciada y conexión con la base de datos verificada."
            )

        if isinstance(redis_result, BaseException):
            if isinstance(redis_result, TimeoutError):
                logger.error(
                    "La comprobación de Redis superó el tiempo máximo de %.1fs; "
                    "el rate limit fallará cerrado.",
                    settings.REDIS_STARTUP_TIMEOUT_SECONDS,
                )
            else:
                logger.error(
                    "No se ha podido conectar a Redis; el rate limit fallará cerrado.",
                    exc_info=(
                        type(redis_result),
                        redis_result,
                        redis_result.__traceback__,
                    ),
                )
        else:
            app.state.redis_available = True
            logger.info("Conexión con Redis verificada para el worker actual.")

        yield
    finally:
        # El cierre también debe ejecutarse si el servidor cancela el lifespan o se produce
        # una excepción mientras la aplicación está activa.
        try:
            if getattr(app.state, "redis_client_owned", True):
                await redis_client.aclose()
                logger.info("Conexiones Redis cerradas.")
        except Exception:
            logger.exception("No se ha podido cerrar limpiamente el cliente Redis.")
        finally:
            await engine.dispose()
            logger.info("Conexiones de base de datos cerradas.")


def create_app(
    *,
    rate_limiter: RateLimiter | None = None,
    redis_client: Redis | None = None,
) -> FastAPI:
    """
    Crea y configura la aplicación FastAPI.

    Args:
        rate_limiter (RateLimiter | None): Limitador alternativo para pruebas aisladas.
        redis_client (Redis | None): Cliente Redis alternativo para pruebas aisladas.

    Returns:
        FastAPI: Instancia configurada de FastAPI.
    """
    app = FastAPI(
        title="ParaisoWeb Backend",
        description=(
            "API para gestionar formularios de contacto, productos de charcutería, "
            "publicaciones de blog y autenticación mediante tokens temporales."
        ),
        version="2.1.0",
        lifespan=lifespan,
        docs_url="/docs" if settings.ENABLE_API_DOCS else None,
        redoc_url="/redoc" if settings.ENABLE_API_DOCS else None,
        openapi_url="/openapi.json" if settings.ENABLE_API_DOCS else None,
    )

    # Cada proceso Uvicorn crea su propio pool de conexiones Redis, pero todos
    # comparten las mismas claves y, por tanto, los mismos contadores de frecuencia.
    app.state.redis_client = (
        redis_client if redis_client is not None else create_redis_client(settings)
    )
    app.state.redis_client_owned = redis_client is None
    app.state.rate_limiter = (
        rate_limiter
        if rate_limiter is not None
        else RedisRateLimiter(
            app.state.redis_client,
            settings.REDIS_RATE_LIMIT_PREFIX,
        )
    )
    app.state.redis_available = rate_limiter is not None
    app.state.database_available = False

    @app.api_route("/livez", methods=["GET", "HEAD"], tags=["Health"])
    async def livez(response: Response) -> dict[str, str]:
        """Confirma que el proceso FastAPI responde sin consultar dependencias externas."""
        response.headers["Cache-Control"] = "no-store, max-age=0"
        response.headers["Pragma"] = "no-cache"
        return {"status": "alive"}

    @app.api_route("/health", methods=["GET", "HEAD"], tags=["Health"])
    async def health(response: Response) -> dict[str, str]:
        """Informa si la API está operativa y comprueba el estado actual de MySQL y Redis."""
        # El resultado depende del estado actual de MySQL y Redis y no debe reutilizarse desde cachés.
        response.headers["Cache-Control"] = "no-store, max-age=0"
        response.headers["Pragma"] = "no-cache"

        previous_database_available = getattr(app.state, "database_available", False)
        previous_redis_available = getattr(app.state, "redis_available", False)

        async def check_database_connection() -> bool:
            try:

                async def execute_database_check() -> None:
                    async with engine.connect() as connection:
                        await connection.execute(text("SELECT 1"))

                await asyncio.wait_for(
                    execute_database_check(),
                    timeout=settings.HEALTHCHECK_DATABASE_TIMEOUT_SECONDS,
                )
                return True
            except Exception:
                return False

        async def check_redis_connection() -> bool:
            try:
                pong = await asyncio.wait_for(
                    app.state.redis_client.ping(),
                    timeout=settings.HEALTHCHECK_REDIS_TIMEOUT_SECONDS,
                )
                return pong is True
            except Exception:
                return False

        # El estado de arranque puede quedar obsoleto si MySQL o Redis caen o se
        # recuperan después. Los límites evitan que una dependencia inaccesible
        # bloquee durante demasiado tiempo el health check.
        database_available, redis_available = await asyncio.gather(
            check_database_connection(),
            check_redis_connection(),
        )

        app.state.database_available = database_available
        app.state.redis_available = redis_available

        # Registra únicamente cambios de estado para no llenar los logs cuando el health check es frecuente.
        if database_available and not previous_database_available:
            logger.info("La conexión con la base de datos se ha recuperado.")
        elif previous_database_available and not database_available:
            logger.warning(
                "Se ha perdido la conexión con la base de datos; la API continúa en modo degradado."
            )

        if redis_available and not previous_redis_available:
            logger.info("La conexión con Redis se ha recuperado.")
        elif previous_redis_available and not redis_available:
            logger.warning(
                "Se ha perdido la conexión con Redis; el rate limit falla cerrado."
            )

        dependencies_available = database_available and redis_available
        if not dependencies_available:
            # /livez indica que el proceso está vivo; /health actúa como readiness y
            # debe señalar con 503 que una dependencia necesaria no está disponible.
            response.status_code = 503

        return {
            "status": "ok" if dependencies_available else "degraded",
            "database": "available" if database_available else "unavailable",
            "redis": "available" if redis_available else "unavailable",
        }

    # Rechaza cuerpos excesivos antes de que el parser multipart procese el adjunto.
    # Se registra antes que la barrera de token porque Starlette ejecuta los middlewares
    # en orden inverso al alta: así la autenticación sigue siendo la primera comprobación.
    app.add_middleware(
        RequestSizeLimitMiddleware,
        rules=[
            RequestSizeRule(
                method="POST",
                path="/api/contacto",
                max_bytes=settings.CONTACT_MAX_REQUEST_BYTES,
            )
        ],
    )

    # FastAPI parsea formularios y archivos antes de ejecutar dependencias de ruta.
    # Esta barrera valida todos los endpoints protegidos y, en contacto, rechaza el
    # token antes de validar el encuadre o leer el cuerpo multipart.
    app.add_middleware(ContactTokenGuardMiddleware)

    # Impide que respuestas autenticadas o con datos de la API queden almacenadas
    # en navegadores, proxies o CDN. El sitemap público de Next.js mantiene su propia caché.
    app.add_middleware(ApiNoStoreMiddleware)

    # CORS se coloca dentro del rate limiter para que también las peticiones OPTIONS
    # consuman el límite global. El limitador añade las cabeceras CORS necesarias a
    # sus propias respuestas 429 o 503 para que el navegador pueda leer el error.
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_allowed_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["Content-Type", "x-timed-token"],
    )

    # Cada petición consume el límite global y, cuando corresponde, el límite específico
    # de su endpoint. Las comprobaciones se realizan de forma atómica para que una
    # petición bloqueada por la regla específica no agote también rutas no relacionadas.
    app.add_middleware(
        RateLimitMiddleware,
        rules=[
            RateLimitRule(
                name="global",
                method="*",
                path="*",
                max_requests=settings.GLOBAL_RATE_LIMIT_REQUESTS,
                window_seconds=settings.GLOBAL_RATE_LIMIT_WINDOW_SECONDS,
            ),
            RateLimitRule(
                name="health",
                method="GET",
                path="/health",
                max_requests=settings.STATUS_RATE_LIMIT_REQUESTS,
                window_seconds=settings.STATUS_RATE_LIMIT_WINDOW_SECONDS,
            ),
            RateLimitRule(
                name="health-head",
                method="HEAD",
                path="/health",
                max_requests=settings.STATUS_RATE_LIMIT_REQUESTS,
                window_seconds=settings.STATUS_RATE_LIMIT_WINDOW_SECONDS,
            ),
            RateLimitRule(
                name="livez",
                method="GET",
                path="/livez",
                max_requests=settings.STATUS_RATE_LIMIT_REQUESTS,
                window_seconds=settings.STATUS_RATE_LIMIT_WINDOW_SECONDS,
            ),
            RateLimitRule(
                name="livez-head",
                method="HEAD",
                path="/livez",
                max_requests=settings.STATUS_RATE_LIMIT_REQUESTS,
                window_seconds=settings.STATUS_RATE_LIMIT_WINDOW_SECONDS,
            ),
            RateLimitRule(
                name="contacto",
                method="POST",
                path="/api/contacto",
                max_requests=settings.CONTACT_RATE_LIMIT_REQUESTS,
                window_seconds=settings.CONTACT_RATE_LIMIT_WINDOW_SECONDS,
            ),
            RateLimitRule(
                name="token",
                method="GET",
                path="/api/get-token",
                max_requests=settings.TOKEN_RATE_LIMIT_REQUESTS,
                window_seconds=settings.TOKEN_RATE_LIMIT_WINDOW_SECONDS,
            ),
            RateLimitRule(
                name="blog-listado",
                method="GET",
                path="/api/blog",
                max_requests=settings.READ_RATE_LIMIT_REQUESTS,
                window_seconds=settings.READ_RATE_LIMIT_WINDOW_SECONDS,
            ),
            RateLimitRule(
                name="blog-slug",
                method="GET",
                path="/api/blog/{slug}",
                max_requests=settings.READ_RATE_LIMIT_REQUESTS,
                window_seconds=settings.READ_RATE_LIMIT_WINDOW_SECONDS,
            ),
            RateLimitRule(
                name="blog-id",
                method="GET",
                path="/api/blog/by-id/{id_noticia}",
                max_requests=settings.READ_RATE_LIMIT_REQUESTS,
                window_seconds=settings.READ_RATE_LIMIT_WINDOW_SECONDS,
            ),
            RateLimitRule(
                name="charcuteria",
                method="GET",
                path="/api/charcuteria",
                max_requests=settings.READ_RATE_LIMIT_REQUESTS,
                window_seconds=settings.READ_RATE_LIMIT_WINDOW_SECONDS,
            ),
            RateLimitRule(
                name="sitemap",
                method="GET",
                path="/api/sitemap/blog",
                max_requests=settings.SITEMAP_RATE_LIMIT_REQUESTS,
                window_seconds=settings.SITEMAP_RATE_LIMIT_WINDOW_SECONDS,
            ),
        ],
        secret_key=settings.secret_key,
        trusted_proxy_ips=settings.trusted_proxy_ips,
        cors_allowed_origins=settings.cors_allowed_origins,
        cors_allow_credentials=True,
        limiter=app.state.rate_limiter,
    )

    # Logging queda como capa exterior para registrar también respuestas 429, 503 y preflight.
    app.add_middleware(LoggingMiddleware)

    # Registro de Routers
    app.include_router(
        contacto.router, prefix="/api", tags=["Contacto"]
    )  # Endpoints para formularios de contacto
    app.include_router(
        charcuteria.router, prefix="/api", tags=["Charcutería"]
    )  # Endpoints para productos de charcutería
    app.include_router(
        blog.router, prefix="/api", tags=["Blog"]
    )  # Endpoints para publicaciones de blog
    app.include_router(
        sitemap.router, prefix="/api", tags=["Sitemap"]
    )  # Datos mínimos del sitemap protegidos mediante token temporal
    app.include_router(
        token.router, prefix="/api", tags=["Token"]
    )  # Endpoint para obtener tokens temporales

    return app


# Crear instancia de la aplicación
app = create_app()
