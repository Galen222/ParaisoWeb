# backend/app/routers/token.py

"""
routers/token.py

Router para la generación de tokens temporales.

Este módulo define un endpoint para:
- Generar y devolver un token temporal basado en HMAC y SHA-256.

Dependencias:
- FastAPI: Para definir el endpoint.
- auth_utils: Para la lógica de generación de tokens.
"""

import logging

from fastapi import APIRouter, HTTPException, Response
from ..core.auth_utils import generate_timed_token

# Inicializa el router para el manejo de tokens
router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/get-token")
async def get_token(response: Response):
    """
    Endpoint para obtener un token temporal.

    Este endpoint genera un token basado en el tiempo actual y lo devuelve en formato JSON.
    Los tokens generados son útiles para validaciones temporales o accesos limitados.

    Returns:
        dict: Un diccionario que contiene el token generado.

    Args:
        response (Response): Respuesta en la que se desactiva la caché del token temporal.

    Raises:
        HTTPException:
            - 500: Si ocurre un error durante la generación del token.
    """
    # Un token temporal cacheado puede devolverse después de expirar y provocar falsos 403.
    response.headers["Cache-Control"] = "no-store, max-age=0"
    response.headers["Pragma"] = "no-cache"

    try:
        token = generate_timed_token()
        return {"token": token}
    except Exception:
        logger.exception("Error inesperado al generar el token temporal")
        raise HTTPException(
            status_code=500,
            detail="Error al generar el token",
        ) from None
