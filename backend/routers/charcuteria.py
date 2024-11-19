# backend/routers/charcuteria.py

"""
Router para manejar los productos de charcutería.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import OperationalError
from typing import List
import traceback

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
    Obtiene una lista de productos de charcutería filtrados por idioma,
    ordenados por categoría y luego por nombre en orden alfabético.

    Args:
        idioma (str, optional): Idioma de los productos. Por defecto "es".
        db (AsyncSession): Sesión de base de datos.

    Raises:
        HTTPException: En caso de errores en la consulta.

    Returns:
        List[schemas.Charcuteria]: Lista de productos de charcutería.
    """
    try:
        # Consulta SQL para ordenar por categoría y luego por nombre alfabéticamente
        result = await db.execute(
            select(models.Charcuteria)
            .where(models.Charcuteria.idioma == idioma)
            .order_by(models.Charcuteria.categoria.asc(), models.Charcuteria.nombre.asc())
        )
        products = result.scalars().all()
        return products
    except OperationalError as e:
        # print(f"OperationalError en get_charcuteria_products: {e}")
        raise HTTPException(status_code=500, detail="Error de conexión con la base de datos")
    except Exception as e:
        # print("Excepción en get_charcuteria_products:", traceback.format_exc())
        raise HTTPException(status_code=500, detail="Error interno del servidor")
