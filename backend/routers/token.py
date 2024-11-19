# backend/app/routers/token.py

"""
Router para la generación de tokens temporales.
"""

from fastapi import APIRouter, HTTPException
from ..core.auth_utils import generate_timed_token

router = APIRouter()

@router.get("/get-token")
async def get_token():
    """
    Endpoint para obtener un token temporal.

    Returns:
        dict: Diccionario con el token generado.
    """
    try:
        token = generate_timed_token()
        # Añadimos print para depurar
        # print(f"[get_token] Token generado y devuelto: {token}")
        return {"token": token}
    except Exception as e:
        # print(f"[get_token] Error al generar el token: {e}")
        raise HTTPException(status_code=500, detail="Error al generar el token")
