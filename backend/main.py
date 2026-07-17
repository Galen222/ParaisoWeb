# backend/main.py

"""
main.py

Módulo principal de la aplicación FastAPI.

Este archivo se encarga de:
- Configurar la instancia de FastAPI.
- Aplicar middlewares como CORS y logging.
- Registrar rutas (routers) para manejar la API.
- Manejar el ciclo de vida de la aplicación (inicio y cierre).

Dependencias:
- FastAPI: Para la creación y configuración de la aplicación.
- Middleware: Para logging y manejo de CORS.
- SQLAlchemy: Para la inicialización de la base de datos.
"""

from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from .middleware.cache_control import ApiNoStoreMiddleware
from .middleware.contact_auth import ContactTokenGuardMiddleware
from .middleware.logging import LoggingMiddleware
from .middleware.rate_limit import RateLimitMiddleware, RateLimitRule
from .middleware.request_size import RequestSizeLimitMiddleware, RequestSizeRule
from contextlib import asynccontextmanager
from .routers import contacto, charcuteria, blog, sitemap, token
from .database import engine
from .models.models import Base
from .core.config import settings
from .core.logging_config import configure_logging
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
    - `startup`: Configuración inicial, como la creación de tablas en la base de datos.
    - `shutdown`: Liberación de recursos, como el cierre de la conexión a la base de datos.

    Args:
        app (FastAPI): Instancia de la aplicación FastAPI.

    Yields:
        None: Indica que la aplicación está lista para recibir solicitudes.
    """
    app.state.database_available = False

    async def initialize_database() -> None:
        # Intentar establecer una conexión con la base de datos y crear las tablas.
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

    try:
        try:
            # Evita que un servidor MySQL inaccesible bloquee indefinidamente el arranque de la API.
            await asyncio.wait_for(
                initialize_database(),
                timeout=settings.DATABASE_STARTUP_TIMEOUT_SECONDS,
            )
            app.state.database_available = True
            logger.info("Aplicación iniciada y base de datos configurada.")
        except TimeoutError:
            logger.error(
                "La inicialización de la base de datos superó el tiempo máximo de %.1fs; "
                "la aplicación continúa en modo degradado.",
                settings.DATABASE_STARTUP_TIMEOUT_SECONDS,
            )
        except Exception:
            # La API continúa disponible para endpoints que no dependen de la base de datos.
            logger.exception(
                "No se ha podido conectar a la base de datos; la aplicación continúa en modo degradado."
            )

        yield
    finally:
        # El cierre también debe ejecutarse si el servidor cancela el lifespan o se produce
        # una excepción mientras la aplicación está activa.
        await engine.dispose()
        logger.info("Conexiones de base de datos cerradas.")


def create_app() -> FastAPI:
    """
    Crea y configura la aplicación FastAPI.

    Returns:
        FastAPI: Instancia configurada de FastAPI.
    """
    app = FastAPI(
        title="ParaisoWeb Backend",
        description=(
            "API para gestionar formularios de contacto, productos de charcutería, "
            "publicaciones de blog y autenticación mediante tokens temporales."
        ),
        version="2.0.0",
        lifespan=lifespan,
        docs_url="/docs" if settings.ENABLE_API_DOCS else None,
        redoc_url="/redoc" if settings.ENABLE_API_DOCS else None,
        openapi_url="/openapi.json" if settings.ENABLE_API_DOCS else None,
    )

    @app.api_route("/livez", methods=["GET", "HEAD"], tags=["Health"])
    async def livez(response: Response) -> dict[str, str]:
        """Confirma que el proceso FastAPI responde sin consultar dependencias externas."""
        response.headers["Cache-Control"] = "no-store, max-age=0"
        response.headers["Pragma"] = "no-cache"
        return {"status": "alive"}

    @app.api_route("/health", methods=["GET", "HEAD"], tags=["Health"])
    async def health(response: Response) -> dict[str, str]:
        """Informa si la API está operativa y comprueba el estado actual de la base de datos."""
        # El resultado depende del estado actual de MySQL y no debe reutilizarse desde cachés.
        response.headers["Cache-Control"] = "no-store, max-age=0"
        response.headers["Pragma"] = "no-cache"

        previous_database_available = getattr(app.state, "database_available", False)

        async def check_database_connection() -> None:
            async with engine.connect() as connection:
                await connection.execute(text("SELECT 1"))

        try:
            # El estado de arranque puede quedar obsoleto si MySQL cae o se recupera después.
            # El límite evita que un pool sin conexión bloquee durante demasiado tiempo el health check.
            await asyncio.wait_for(
                check_database_connection(),
                timeout=settings.HEALTHCHECK_DATABASE_TIMEOUT_SECONDS,
            )
            database_available = True
        except Exception:
            database_available = False

        app.state.database_available = database_available

        # Registra únicamente cambios de estado para no llenar los logs cuando el health check es frecuente.
        if database_available and not previous_database_available:
            logger.info("La conexión con la base de datos se ha recuperado.")
        elif previous_database_available and not database_available:
            logger.warning("Se ha perdido la conexión con la base de datos; la API continúa en modo degradado.")

        if not database_available:
            # /livez indica que el proceso está vivo; /health actúa como readiness y
            # debe señalar con 503 que una dependencia necesaria no está disponible.
            response.status_code = 503

        return {
            "status": "ok" if database_available else "degraded",
            "database": "available" if database_available else "unavailable",
        }

    # FastAPI parsea formularios y archivos antes de ejecutar dependencias de ruta.
    # Esta barrera valida todos los endpoints protegidos y, en contacto, rechaza el
    # token antes de que Starlette lea o escriba el cuerpo multipart.
    app.add_middleware(ContactTokenGuardMiddleware)

    # Rechaza cuerpos excesivos antes de que el parser multipart procese el adjunto.
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

    # Impide que respuestas autenticadas o con datos de la API queden almacenadas
    # en navegadores, proxies o CDN. El sitemap público de Next.js mantiene su propia caché.
    app.add_middleware(ApiNoStoreMiddleware)

    # CORS se coloca dentro del rate limiter para que también las peticiones OPTIONS
    # consuman el límite global. El limitador añade las cabeceras CORS necesarias a
    # sus propias respuestas 429 para que el navegador pueda leer el error.
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
    )

    # Logging queda como capa exterior para registrar también respuestas 429 y preflight.
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
