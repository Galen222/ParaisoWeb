# backend/routers/charcuteria.py

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from ..models import models, schemas
from ..dependencies import get_db

router = APIRouter()

@router.get("/charcuteria", response_model=List[schemas.Charcuteria])
async def get_charcuteria_products(
    idioma: str = Query("es"),  # Parámetro de idioma con valor predeterminado "es"
    db: AsyncSession = Depends(get_db)
):
    try:
        # Modificar la consulta para filtrar por idioma
        result = await db.execute(
            select(models.Charcuteria).where(models.Charcuteria.idioma == idioma)
        )
        products = result.scalars().all()
        return products
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
