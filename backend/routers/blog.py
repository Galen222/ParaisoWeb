# backend/routers/blog.py

"""
routers/blog.py

Router para manejar las publicaciones del blog.
"""

from fastapi import APIRouter, Depends, HTTPException, Query, Path
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from ..models import schemas
from ..dependencies import verify_token, get_db
from ..services.blog_service import BlogService

# Inicializa el router para los endpoints relacionados con el blog
router = APIRouter()

@router.get("/blog", response_model=List[schemas.Blog])
async def get_blog_posts(
    idioma: str = Query("es"),
    db: AsyncSession = Depends(get_db),
    token_verification: None = Depends(verify_token)  # Verifica el token temporal
):
    """
    Obtiene una lista de publicaciones de blog filtradas por idioma 
    y ordenadas por la fecha más reciente primero.

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
        blog_service = BlogService(db)
        return await blog_service.get_all_posts(idioma)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/blog/{slug}", response_model=schemas.Blog)
async def get_blog_post_by_slug(
    slug: str = Path(...),
    idioma: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    token_verification: None = Depends(verify_token)  # Verifica el token temporal
):
    """
    Obtiene una publicación de blog específica por su slug 
    y opcionalmente por idioma.

    Args:
        slug (str): Slug único de la publicación.
        idioma (str, optional): Idioma de la publicación.
        db (AsyncSession): Sesión de base de datos.
        token_verification (None): Resultado de la verificación del token.

    Raises:
        HTTPException: Si la publicación no se encuentra o en caso de errores.

    Returns:
        schemas.Blog: Publicación de blog encontrada.
    """
    try:
        blog_service = BlogService(db)
        post = await blog_service.get_post_by_slug(slug, idioma)
        
        # Si no se encuentra la publicación, lanza un error 404
        if post is None:
            raise HTTPException(status_code=404, detail="Blog no encontrado")
        return post
    except HTTPException:
        raise
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
        blog_service = BlogService(db)
        post = await blog_service.get_post_by_id(id_noticia, idioma)
        
        # Si no se encuentra la publicación, lanza un error 404
        if post is None:
            raise HTTPException(status_code=404, detail="Blog not found")
        return post
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
