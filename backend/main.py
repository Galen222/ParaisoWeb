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
from contextlib import asynccontextmanager
from .routers import contacto, charcuteria, blog, token
from .database import engine
from .models.models import Base
import logging

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
        """Informa si la API está operativa y si la base de datos arrancó correctamente."""
        database_available = getattr(app.state, "database_available", False)
        return {
            "status": "ok" if database_available else "degraded",
            "database": "available" if database_available else "unavailable",
        }

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
