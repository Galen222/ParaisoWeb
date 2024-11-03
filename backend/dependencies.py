# backend/dependencies.py

"""
Módulo de dependencias para FastAPI.
Incluye funciones para manejar la sesión de la base de datos y la verificación de tokens temporales.
"""

from fastapi import Header, HTTPException, status
from .database import async_session
from .core.auth_utils import verify_timed_token

async def get_db():
    """
    Proporciona una sesión de base de datos asíncrona.
    
    Utiliza el contexto de `async_session` para garantizar que la sesión se cierre correctamente después de su uso.
    
    Yields:
        AsyncSession: Instancia de la sesión de la base de datos.
    """
    async with async_session() as session:
        yield session

async def verify_token(x_timed_token: str = Header(...)):
    """
    Verifica el token temporal pasado en el encabezado `x-timed-token`.
    
    Esta dependencia asegura que solo las solicitudes con un token válido puedan acceder a los endpoints protegidos.
    
    Args:
        x_timed_token (str): Token temporal proporcionado en el encabezado de la solicitud.
    
    Raises:
        HTTPException: Si el token es inválido o ha expirado.
    
    Returns:
        None
    """
    if not verify_timed_token(x_timed_token):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Token inválido o expirado"
        )
