# backend/app/routers/charcuteria.py

"""
Router para manejar los productos de charcutería.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from ..models import models, schemas
from ..dependencies import get_db, verify_token  # Importa la dependencia

router = APIRouter()

@router.get("/charcuteria", response_model=List[schemas.Charcuteria])
async def get_charcuteria_products(
    idioma: str = Query("es"),  # Parámetro de idioma con valor predeterminado "es"
    db: AsyncSession = Depends(get_db),
    token_verification: None = Depends(verify_token)  # Verifica el token temporal
):
    """
    Obtiene una lista de productos de charcutería filtrados por idioma.

    Args:
        idioma (str, optional): Idioma de los productos. Por defecto "es".
        db (AsyncSession): Sesión de base de datos.
        token_verification (None): Resultado de la verificación del token.

    Raises:
        HTTPException: En caso de errores en la consulta.

    Returns:
        List[schemas.Charcuteria]: Lista de productos de charcutería.
    """
    try:
        # Modificar la consulta para filtrar por idioma
        result = await db.execute(
            select(models.Charcuteria).where(models.Charcuteria.idioma == idioma)
        )
        products = result.scalars().all()
        return products
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
