# backend/routers/blog.py

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from ..models import models, schemas
from ..dependencies import get_db

router = APIRouter()

@router.get("/blog", response_model=List[schemas.Blog])
async def get_blog_posts(
    idioma: str = Query("es"),  # Parámetro de idioma con valor predeterminado "es"
    db: AsyncSession = Depends(get_db)
):
    try:
        # Consulta para obtener las entradas de blog filtradas por idioma
        result = await db.execute(
            select(models.Blog).where(models.Blog.idioma == idioma)
        )
        blog_posts = result.scalars().all()
        return blog_posts
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
