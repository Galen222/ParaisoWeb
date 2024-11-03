# backend/app/routers/token.py

"""
Router para la generación de tokens temporales.
"""

from fastapi import APIRouter
from ..core.auth_utils import generate_timed_token

router = APIRouter()

@router.get("/get-token")
async def get_token():
    """
    Endpoint para obtener un token temporal.

    Returns:
        dict: Diccionario con el token generado.
    """
    token = generate_timed_token()
    return {"token": token}
