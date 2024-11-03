# backend/app/routers/blog.py

"""
Router para manejar las publicaciones del blog.
"""

from fastapi import APIRouter, Depends, HTTPException, Query, Path
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from ..models import models, schemas
from ..dependencies import get_db, verify_token  # Importa la dependencia

router = APIRouter()

@router.get("/blog", response_model=List[schemas.Blog])
async def get_blog_posts(
    idioma: str = Query("es"),
    db: AsyncSession = Depends(get_db),
    token_verification: None = Depends(verify_token)  # Verifica el token temporal
):
    """
    Obtiene una lista de publicaciones de blog filtradas por idioma.

    Args:
        idioma (str, optional): Idioma de las publicaciones. Por defecto "es".
        db (AsyncSession): Sesión de base de datos.
        token_verification (None): Resultado de la verificación del token.

    Raises:
        HTTPException: En caso de errores en la consulta.

    Returns:
        List[schemas.Blog]: Lista de publicaciones de blog.
    """
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
    db: AsyncSession = Depends(get_db),
    token_verification: None = Depends(verify_token)  # Verifica el token temporal
):
    """
    Obtiene una publicación de blog específica por su slug.

    Args:
        slug (str): Slug único de la publicación.
        db (AsyncSession): Sesión de base de datos.
        token_verification (None): Resultado de la verificación del token.

    Raises:
        HTTPException: Si la publicación no se encuentra o en caso de errores.

    Returns:
        schemas.Blog: Publicación de blog encontrada.
    """
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

@router.get("/blog/by-id/{id_noticia}", response_model=schemas.Blog)
async def get_blog_post_by_id(
    id_noticia: int = Path(...),
    idioma: str = Query(...),
    db: AsyncSession = Depends(get_db),
    token_verification: None = Depends(verify_token)  # Verifica el token temporal
):
    """
    Obtiene una publicación de blog específica por su ID y idioma.

    Args:
        id_noticia (int): ID único de la noticia.
        idioma (str): Idioma de la noticia.
        db (AsyncSession): Sesión de base de datos.
        token_verification (None): Resultado de la verificación del token.

    Raises:
        HTTPException: Si la publicación no se encuentra o en caso de errores.

    Returns:
        schemas.Blog: Publicación de blog encontrada.
    """
    try:
        result = await db.execute(
            select(models.Blog).where(models.Blog.id_noticia == id_noticia, models.Blog.idioma == idioma)
        )
        blog_post = result.scalar_one_or_none()
        if blog_post is None:
            raise HTTPException(status_code=404, detail="Blog not found")
        return blog_post
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
