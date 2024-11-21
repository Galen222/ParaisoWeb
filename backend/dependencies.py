# backend/dependencies.py

"""
dependencies.py

Módulo de dependencias para FastAPI.

Este módulo define:
- La gestión de la sesión de la base de datos.
- La verificación de tokens temporales para proteger endpoints.

Dependencias:
- FastAPI: Para manejar dependencias en los endpoints.
- SQLAlchemy: Para gestionar sesiones de base de datos asíncronas.
- Utilidades de autenticación: Para verificar tokens temporales.
"""

from fastapi import Header, HTTPException, status, Depends
from .database import async_session
from .core.auth_utils import verify_timed_token

async def get_db():
    """
    Proporciona una sesión de base de datos asíncrona.

    Este método asegura que la sesión de base de datos se gestione de manera eficiente,
    cerrándose automáticamente una vez finalizada su utilización.

    Yields:
        AsyncSession: Instancia de la sesión de la base de datos.

    Raises:
        HTTPException:
            - 500: Si ocurre un error al conectar con la base de datos.
    """
    try:
        async with async_session() as session:
            yield session
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Error al conectar con la base de datos"
        )

async def verify_token(x_timed_token: str = Header(...)):
    """
    Verifica el token temporal proporcionado en el encabezado `x-timed-token`.

    Este método se utiliza como dependencia para endpoints que requieren autenticación,
    garantizando que solo las solicitudes con tokens válidos tengan acceso.

    Args:
        x_timed_token (str): Token temporal incluido en el encabezado de la solicitud.

    Raises:
        HTTPException:
            - 403: Si el token es inválido o ha expirado.

    Returns:
        None
    """
    if not verify_timed_token(x_timed_token):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Token inválido o expirado"
        )
