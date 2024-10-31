# backend/routers/charcuteria.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from ..models import models, schemas
from ..dependencies import get_db

router = APIRouter()

@router.get("/charcuteria", response_model=List[schemas.Charcuteria])
async def get_charcuteria_products(db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(select(models.Charcuteria))
        products = result.scalars().all()
        return products
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
