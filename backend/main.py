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
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Aplicación iniciada y base de datos configurada.")
    yield
    await engine.dispose()
    print("Conexión a la base de datos cerrada.")

# -----------------------------
# Configuración de la aplicación
# -----------------------------
app = FastAPI(
    title="ParaisoWeb Backend",
    description=(
        "API para gestionar formularios de contacto, productos de charcutería, "
        "publicaciones de blog y autenticación mediante tokens temporales."
    ),
    version="0.999.1",
    lifespan=lifespan,
)

# -----------------------------
# Middleware de logging
# -----------------------------
app.add_middleware(LoggingMiddleware)

# -----------------------------
# Configuración de CORS
# -----------------------------
origins = [
    "http://localhost:3000",          # Desarrollo local
    "https://galenn.asuscomm.com",    # Producción
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Registro de Routers
# -----------------------------
app.include_router(contacto.router, prefix="/api", tags=["Contacto"])        # Endpoints para formularios de contacto
app.include_router(charcuteria.router, prefix="/api", tags=["Charcutería"])  # Endpoints para productos de charcutería
app.include_router(blog.router, prefix="/api", tags=["Blog"])                # Endpoints para publicaciones de blog
app.include_router(token.router, prefix="/api", tags=["Token"])              # Endpoint para obtener tokens temporales
