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

from ipaddress import ip_address
import logging
from typing import Optional, cast

from fastapi import Header, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from .core.auth_utils import verify_timed_token
from .core.client_ip import resolve_client_host
from .core.config import settings
from .database import async_session

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
    session = cast(AsyncSession, async_session())
    async with session:
        yield session


async def verify_token(x_timed_token: Optional[str] = Header(None)):
    """
    Verifica la presencia y validez del token temporal en el encabezado `x-timed-token`.

    Este método se utiliza como dependencia para endpoints que requieren autenticación,
    diferenciando entre peticiones sin token y con token inválido.

    Args:
        x_timed_token (Optional[str]): Token temporal incluido en el encabezado de la solicitud.

    Raises:
        HTTPException:
            - 401: Si no se proporciona token (Unauthorized).
            - 403: Si el token proporcionado es inválido o ha expirado (Forbidden).

    Returns:
        None
    """
    if x_timed_token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token no proporcionado"
        )
    
    if not verify_timed_token(x_timed_token):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Token inválido o expirado"
        )


logger = logging.getLogger(__name__)


async def verify_local_request(request: Request) -> None:
    """Permite únicamente clientes loopback tras resolver proxies confiables."""
    client_host = resolve_client_host(request, settings.trusted_proxy_ips, logger)
    try:
        is_loopback = ip_address(client_host).is_loopback
    except ValueError:
        is_loopback = False

    if not is_loopback:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Endpoint disponible únicamente desde el servidor local",
        )
