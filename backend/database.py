# backend/database.py

"""
Módulo de configuración de la base de datos para FastAPI.
Configura el motor de la base de datos asíncrona y la sesión de la base de datos.
"""

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from backend.core.config import settings  # Importa la configuración de settings

# URL de la base de datos obtenida desde la configuración
DATABASE_URL = settings.DATABASE_URL

# Crea el motor asíncrono de SQLAlchemy con opciones para manejar conexiones caducadas
engine = create_async_engine(
    DATABASE_URL,
    echo=True,        # Habilita el registro de todas las consultas SQL para depuración
    future=True,      # Habilita características futuras de SQLAlchemy
    pool_pre_ping=True,   # Verifica la conexión antes de usarla
    pool_recycle=3600     # Recicla conexiones cada 1 hora (3600 segundos)
)

# Crea la fábrica de sesiones asíncronas
# `expire_on_commit=False` evita que los objetos se marquen como expirados después de cada commit
# `class_=AsyncSession` especifica el uso de sesiones asíncronas
async_session = sessionmaker(
    engine,
    expire_on_commit=False,  # Evita que los objetos expiren después de cada commit
    class_=AsyncSession      # Especifica el uso de sesiones asíncronas
)
