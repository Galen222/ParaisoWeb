# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import contact

# Creación de la instancia de FastAPI
app = FastAPI()

# Configurar CORS si es necesario
origins = [
    "http://localhost:3000",  # Reemplaza con la URL de tu frontend
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar los routers
app.include_router(contact.router, prefix="/api")
