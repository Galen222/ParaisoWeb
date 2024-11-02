# backend/routers/blog.py

from fastapi import APIRouter, Depends, HTTPException, Query, Path
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from ..models import models, schemas
from ..dependencies import get_db

router = APIRouter()

@router.get("/blog", response_model=List[schemas.Blog])
async def get_blog_posts(
    idioma: str = Query("es"),
    db: AsyncSession = Depends(get_db)
):
    try:
        result = await db.execute(
            select(models.Blog).where(models.Blog.idioma == idioma)
        )
        return result.scalars().all()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/blog/{slug}", response_model=schemas.Blog)
async def get_blog_post_by_slug(
    slug: str = Path(...),
    db: AsyncSession = Depends(get_db)
):
    try:
        result = await db.execute(
            select(models.Blog).where(models.Blog.slug == slug)
        )
        blog_post = result.scalar_one_or_none()
        if blog_post is None:
            raise HTTPException(status_code=404, detail="Blog not found")
        return blog_post
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

