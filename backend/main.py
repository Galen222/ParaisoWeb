# backend/main.py

"""
main.py

Módulo principal de la aplicación FastAPI.
Configura la instancia de FastAPI, aplica middleware, registra routers y maneja eventos de inicio.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .middleware.logging import LoggingMiddleware
from contextlib import asynccontextmanager
from .routers import contacto, charcuteria, blog, token
from .database import engine
from .models.models import Base

# -----------------------------
# Lifespan Event Handlers
# -----------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan event handler para manejar el ciclo de vida de la aplicación.
    """
    # Evento de inicio (startup)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Aplicación iniciada y base de datos configurada.")
    
    # Yield para indicar que la app está lista para funcionar
    yield

    # Evento de cierre (shutdown)
    await engine.dispose()
    print("Conexión a la base de datos cerrada.")

# -----------------------------
# Creación de la instancia de FastAPI
# -----------------------------
app = FastAPI(
    title="ParaisoWeb Backend",
    description="Gestionar el envío de formularios, base de datos de charcutería y blogs y tokens API temporales.",
    version="0.999.1",
    lifespan=lifespan  # Usa el lifespan handler en lugar de on_event
)
app.add_middleware(LoggingMiddleware)

# -----------------------------
# Configuración de CORS
# -----------------------------
# Lista de orígenes permitidos para realizar solicitudes a la API.
origins = [
    "http://localhost:3000",          # Origen para desarrollo local
    "https://galenn.asuscomm.com",    # Origen de producción
]

# Añade el middleware de CORS a la aplicación FastAPI.
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,              # Orígenes permitidos
    allow_credentials=True,             # Permite el envío de credenciales (cookies, headers, etc.)
    allow_methods=["*"],                # Permite todos los métodos HTTP (GET, POST, etc.)
    allow_headers=["*"],                # Permite todos los encabezados HTTP
)

# -----------------------------
# Registro de Routers
# -----------------------------
# Incluye los routers para manejar diferentes secciones de la API bajo el prefijo "/api".
app.include_router(contacto.router, prefix="/api")      # Endpoints para formularios de contacto
app.include_router(charcuteria.router, prefix="/api")   # Endpoints para productos de charcutería
app.include_router(blog.router, prefix="/api")          # Endpoints para publicaciones de blog
app.include_router(token.router, prefix="/api")         # Endpoint para obtener tokens temporales

