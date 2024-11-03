# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import contacto
from .routers import charcuteria
from .routers import blog
from .routers import token
from .core.config import ENVIRONMENT  # Importa la variable de entorno

# Creación de la instancia de FastAPI
app = FastAPI()

# Configurar CORS si es necesario
origins = [
    "http://localhost:3000",
    "https://galenn.asuscomm.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar los routers
app.include_router(contacto.router, prefix="/api")
app.include_router(charcuteria.router, prefix="/api")
app.include_router(blog.router, prefix="/api")
app.include_router(token.router, prefix="/api") 

# Crear las tablas en la base de datos al iniciar la aplicación
from .database import engine
from .models.models import Base

@app.on_event("startup")
async def startup():
    print(f"----------------------------------------------------")
    print(f"SERVIDOR BACKEND FUNCIONANDO EN MODO {ENVIRONMENT}")
    print(f"----------------------------------------------------")    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)