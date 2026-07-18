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
from .core.client_ip import (
    has_ambiguous_forwarding_headers,
    has_invalid_forwarding_headers,
    normalize_host,
    resolve_client_host,
)
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


async def verify_token(
    request: Request,
    x_timed_token: Optional[str] = Header(None),
):
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
    # El middleware ASGI ya validó los endpoints protegidos antes de leer su cuerpo.
    # Reutilizar ese resultado evita falsos 403 si una subida lenta cruza varios
    # intervalos del token entre la primera comprobación y el parseo de FastAPI.
    if getattr(request.state, "timed_token_verified", False):
        return

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
    trusted_proxy_ips = settings.trusted_proxy_ips
    direct_host = normalize_host(request.client.host if request.client else "unknown")
    raw_headers = request.scope.get("headers", [])
    has_forwarding_metadata = any(
        key.lower() in {b"x-forwarded-for", b"x-real-ip"} and value.strip()
        for key, value in raw_headers
    )

    # Una cabecera de reenvío repetida puede ser interpretada de forma distinta por
    # Plesk, Uvicorn y Starlette. En un endpoint exclusivamente local se rechaza la
    # ambigüedad en vez de escoger una representación potencialmente insegura.
    if has_ambiguous_forwarding_headers(request, logger):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Endpoint disponible únicamente desde el servidor local",
        )

    # Un proxy confiable con una cabecera presente pero malformada no demuestra que
    # el cliente final sea loopback. Se rechaza antes de que el resolvedor ignore el
    # valor inválido y termine devolviendo por descarte la IP local del propio proxy.
    if has_invalid_forwarding_headers(request, logger):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Endpoint disponible únicamente desde el servidor local",
        )

    # Una petición local real de Next.js no envía cabeceras de proxy. Si aparecen
    # cabeceras de reenvío desde un peer no configurado como proxy, no se puede asumir
    # que 127.0.0.1 sea el cliente final: se rechaza en lugar de fallar en modo abierto.
    if has_forwarding_metadata and direct_host not in trusted_proxy_ips:
        logger.warning(
            "Acceso local rechazado por cabeceras de proxy desde un peer no confiable"
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Endpoint disponible únicamente desde el servidor local",
        )

    client_host = resolve_client_host(request, trusted_proxy_ips, logger)
    try:
        is_loopback = ip_address(client_host).is_loopback
    except ValueError:
        is_loopback = False

    if not is_loopback:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Endpoint disponible únicamente desde el servidor local",
        )
