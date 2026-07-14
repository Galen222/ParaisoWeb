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

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .middleware.logging import LoggingMiddleware
from .middleware.rate_limit import RateLimitMiddleware, RateLimitRule
from contextlib import asynccontextmanager
from .routers import contacto, charcuteria, blog, token
from .database import engine
from .models.models import Base
from .core.config import settings
import asyncio
import logging
from sqlalchemy import text

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
    try:
        # Intentar establecer una conexión con la base de datos y crear las tablas
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        app.state.database_available = True
        logger.info("Aplicación iniciada y base de datos configurada.")
    except Exception:
        # La API continúa disponible para endpoints que no dependen de la base de datos.
        logger.exception(
            "No se ha podido conectar a la base de datos; la aplicación continúa en modo degradado."
        )
    yield
    # Liberar los recursos relacionados con la base de datos
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
    )

    @app.get("/health", tags=["Health"])
    async def health() -> dict[str, str]:
        """Informa si la API está operativa y comprueba el estado actual de la base de datos."""
        previous_database_available = getattr(app.state, "database_available", False)

        async def check_database_connection() -> None:
            async with engine.connect() as connection:
                await connection.execute(text("SELECT 1"))

        try:
            # El estado de arranque puede quedar obsoleto si MySQL cae o se recupera después.
            # El límite evita que un pool sin conexión bloquee durante demasiado tiempo el health check.
            await asyncio.wait_for(check_database_connection(), timeout=2.0)
            database_available = True
        except Exception:
            database_available = False

        app.state.database_available = database_available

        # Registra únicamente cambios de estado para no llenar los logs cuando el health check es frecuente.
        if database_available and not previous_database_available:
            logger.info("La conexión con la base de datos se ha recuperado.")
        elif previous_database_available and not database_available:
            logger.warning("Se ha perdido la conexión con la base de datos; la API continúa en modo degradado.")

        return {
            "status": "ok" if database_available else "degraded",
            "database": "available" if database_available else "unavailable",
        }

    # Límites independientes para los dos endpoints públicos más sensibles.
    # Se añaden antes del middleware de logging para que los bloqueos 429 también queden registrados.
    app.add_middleware(
        RateLimitMiddleware,
        rules=[
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
        ],
        secret_key=settings.secret_key,
    )

    # Middleware de logging
    app.add_middleware(LoggingMiddleware)

    # Configuración de CORS
    origins = [
        "http://localhost:3000",  # Desarrollo local
        "https://galenn.asuscomm.com",
        "http://paraisodeljamon.com",  # Producción
        "https://paraisodeljamon.com",
        "http://www.paraisodeljamon.com",
        "https://www.paraisodeljamon.com",
    ]

    # Añade el Middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["Content-Type", "x-timed-token"],
    )

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
        token.router, prefix="/api", tags=["Token"]
    )  # Endpoint para obtener tokens temporales

    return app


# Crear instancia de la aplicación
app = create_app()
