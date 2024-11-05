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

# Crea el motor asíncrono de SQLAlchemy
# `echo=True` habilita el registro de todas las consultas SQL para propósitos de depuración
# `future=True` habilita las características futuras de SQLAlchemy
engine = create_async_engine(DATABASE_URL, echo=True, future=True)

# Crea la fábrica de sesiones asíncronas
# `expire_on_commit=False` evita que los objetos se marquen como expirados después de cada commit
# `class_=AsyncSession` especifica el uso de sesiones asíncronas
async_session = sessionmaker(
    engine, expire_on_commit=False, class_=AsyncSession
)
