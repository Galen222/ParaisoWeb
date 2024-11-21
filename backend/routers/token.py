# backend/app/routers/token.py

"""
routers/token.py

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
        dict: Token generado.
        
    Raises:
        HTTPException: Si hay un error al generar el token.
    """
    try:
        token = generate_timed_token()
        return {"token": token}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error al generar el token")