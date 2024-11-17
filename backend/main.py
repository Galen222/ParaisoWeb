# app/main.py

"""
Módulo principal de la aplicación FastAPI.
Configura la instancia de FastAPI, aplica middleware, registra routers y maneja eventos de inicio.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import contacto, charcuteria, blog, token

# -----------------------------
# Creación de la instancia de FastAPI
# -----------------------------
app = FastAPI(
    title="ParaisoWeb Backend",
    description="Gestionar el envío de formularios, base de datos de charcutería y blogs y tokens API temporales.",
    version="0.9.9"
)

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

# -----------------------------
# Creación de las tablas en la base de datos al iniciar la aplicación
# -----------------------------
from .database import engine
from .models.models import Base

@app.on_event("startup")
async def startup():
    """
    Evento que se ejecuta al iniciar la aplicación.
    - Crea las tablas de la base de datos si no existen.
    """
    # Inicia una conexión asíncrona con la base de datos.
    async with engine.begin() as conn:
        # Crea todas las tablas definidas en Base.metadata si no existen.
        await conn.run_sync(Base.metadata.create_all)
