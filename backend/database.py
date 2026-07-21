# backend/database.py

"""
database.py

Módulo de configuración de la base de datos para FastAPI.

Este módulo incluye:
- Configuración del motor de base de datos asíncrona utilizando SQLAlchemy.
- Creación de una fábrica de sesiones asíncronas para interactuar con la base de datos.

Dependencias:
- SQLAlchemy: Para manejar el motor de la base de datos y las sesiones.
- Configuración: URL de conexión y otras configuraciones definidas en `settings`.
"""

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from backend.core.config import settings  # Configuración de la aplicación

# Configuración del Motor de Base de Datos
"""
URL de conexión a la base de datos, definida en la configuración.

Ejemplo:
    - Para SQLite: `sqlite+aiosqlite:///./test.db`
    - Para PostgreSQL: `postgresql+asyncpg://user:password@host:port/database`
"""
DATABASE_URL = settings.DATABASE_URL

"""
Motor de base de datos asíncrono.

Este motor utiliza la URL de conexión definida en `DATABASE_URL`. Está configurado
para manejar conexiones de forma eficiente mediante un pool, con soporte para conexiones
perdidas y reciclaje automático.
"""
engine = create_async_engine(
    DATABASE_URL,
    echo=settings.DATABASE_ECHO_SQL,  # Solo registra SQL cuando se activa de forma explícita
    future=True,       # Activa características futuras de SQLAlchemy
    pool_pre_ping=True,  # Verifica la conexión antes de usarla (manejo de conexiones caídas)
    # Cada worker de Uvicorn crea su propio pool. Estos límites evitan multiplicar
    # sin control las conexiones cuando el backend se ejecuta con cuatro procesos.
    pool_size=settings.DATABASE_POOL_SIZE,
    max_overflow=settings.DATABASE_MAX_OVERFLOW,
    pool_timeout=settings.DATABASE_POOL_TIMEOUT_SECONDS,
    pool_recycle=settings.DATABASE_POOL_RECYCLE_SECONDS,  # Recicla conexiones antiguas
    pool_reset_on_return='rollback',  # Limpia el estado de la conexión
    pool_use_lifo=True  # Reutiliza primero las conexiones más recientes del pool
)

# Configuración de la Fábrica de Sesiones
"""
Fábrica de sesiones asíncronas.

Proporciona sesiones configuradas para interactuar con la base de datos usando
el motor definido. Las sesiones son necesarias para ejecutar operaciones CRUD
y deben gestionarse correctamente en los endpoints o servicios.
"""
async_session = sessionmaker(  # type: ignore
    engine,  # type: ignore
    expire_on_commit=False,  # Evita que los objetos se marquen como expirados tras un commit
    class_=AsyncSession      # Especifica el uso de sesiones asíncronas
)
