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

from fastapi import APIRouter, HTTPException
from ..core.auth_utils import generate_timed_token

# Inicializa el router para el manejo de tokens
router = APIRouter()

@router.get("/get-token")
async def get_token():
    """
    Endpoint para obtener un token temporal.

    Este endpoint genera un token basado en el tiempo actual y lo devuelve en formato JSON.
    Los tokens generados son útiles para validaciones temporales o accesos limitados.

    Returns:
        dict: Un diccionario que contiene el token generado.

    Raises:
        HTTPException:
            - 500: Si ocurre un error durante la generación del token.
    """
    try:
        token = generate_timed_token()
        return {"token": token}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error al generar el token")
