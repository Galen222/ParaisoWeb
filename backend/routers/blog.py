# backend/routers/blog.py

"""
routers/blog.py

Router para manejar las publicaciones del blog.

Este módulo define los endpoints para:
- Obtener una lista de publicaciones de blog.
- Recuperar publicaciones individuales por su slug o ID.
- Gestionar las publicaciones de blog con filtrado por idioma.

Dependencias:
- FastAPI: Para definir los endpoints y manejar las solicitudes.
- SQLAlchemy: Para interactuar con la base de datos.
- Schemas: Para validar y estructurar las respuestas de la API.
- Servicios: Lógica de negocio implementada en `BlogService`.
"""

import logging
import unicodedata

from fastapi import APIRouter, Depends, HTTPException, Query, Path
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import DBAPIError, TimeoutError as SQLAlchemyTimeoutError
from typing import List, Literal
from ..models import schemas
from ..dependencies import verify_token, get_db
from ..services.blog_service import BlogService

# Inicializa el router para los endpoints relacionados con el blog
router = APIRouter()
logger = logging.getLogger(__name__)

# Idiomas disponibles en el frontend y almacenados en la base de datos.
SupportedLanguage = Literal["es", "en", "de"]


def _is_valid_blog_slug(slug: str) -> bool:
    """Valida el mismo conjunto Unicode de caracteres admitido por las rutas del frontend."""
    if not slug:
        return False

    previous_was_alphanumeric_or_mark = False
    for character in slug:
        if character == "-":
            previous_was_alphanumeric_or_mark = False
            continue
        if character.isalnum():
            previous_was_alphanumeric_or_mark = True
            continue
        if (
            unicodedata.category(character).startswith("M")
            and previous_was_alphanumeric_or_mark
        ):
            continue
        return False

    return True

@router.get("/blog", response_model=List[schemas.Blog])
async def get_blog_posts(
    idioma: SupportedLanguage = Query("es"),
    token_verification: None = Depends(verify_token),  # Verifica el token temporal
    db: AsyncSession = Depends(get_db)
):
    """
    Obtiene una lista de publicaciones de blog filtradas por idioma y ordenadas por fecha.

    Este endpoint permite consultar todas las publicaciones de un idioma específico,
    ordenándolas por la fecha de publicación más reciente.

    Args:
        idioma (str, optional): Idioma de las publicaciones. Por defecto "es".
        token_verification (None): Verificación del token proporcionado.
        db (AsyncSession): Sesión de base de datos proporcionada por la dependencia.

    Raises:
        HTTPException:
            - 401: Si no se proporciona token.
            - 403: Si el token proporcionado es inválido.
            - 503: Si la base de datos no está disponible temporalmente.
            - 500: Si ocurre algún error interno.

    Returns:
        List[schemas.Blog]: Lista de publicaciones de blog.
    """
    try:
        blog_service = BlogService(db)
        return await blog_service.get_all_posts(idioma)
    except (DBAPIError, SQLAlchemyTimeoutError):
        logger.exception("Base de datos no disponible al obtener la lista de publicaciones del blog")
        raise HTTPException(
            status_code=503,
            detail="Servicio de datos temporalmente no disponible",
        ) from None
    except Exception:
        logger.exception("Error inesperado al obtener la lista de publicaciones del blog")
        raise HTTPException(
            status_code=500,
            detail="Error interno al obtener las publicaciones del blog",
        ) from None


@router.get("/blog/{slug}", response_model=schemas.Blog)
async def get_blog_post_by_slug(
    slug: str = Path(..., min_length=1, max_length=150),
    idioma: SupportedLanguage = Query("es"),
    token_verification: None = Depends(verify_token),  # Verifica el token temporal
    db: AsyncSession = Depends(get_db)  # Luego obtiene la conexión a BD
):
    """
    Obtiene una publicación de blog específica por su slug y opcionalmente por idioma.

    Este endpoint permite recuperar una publicación específica identificada por su slug,
    con la posibilidad de filtrar por idioma.

    Args:
        slug (str): Slug único de la publicación.
        idioma (str, optional): Idioma de la publicación. Por defecto "es".
        token_verification (None): Verificación del token proporcionado.
        db (AsyncSession): Sesión de base de datos proporcionada por la dependencia.

    Raises:
        HTTPException:
            - 401: Si no se proporciona token.
            - 403: Si el token proporcionado es inválido.
            - 404: Si la publicación no se encuentra.
            - 503: Si la base de datos no está disponible temporalmente.
            - 500: Si ocurre algún error interno.

    Returns:
        schemas.Blog: La publicación de blog encontrada.
    """
    try:
        # Evita consultas a MySQL con slugs que nunca puede generar el frontend.
        if not _is_valid_blog_slug(slug):
            raise HTTPException(status_code=422, detail="Slug de blog no válido")

        blog_service = BlogService(db)
        post = await blog_service.get_post_by_slug(slug, idioma)
        
        if post is None:
            raise HTTPException(status_code=404, detail="Blog no encontrado")
        return post
    except HTTPException:
        raise
    except (DBAPIError, SQLAlchemyTimeoutError):
        logger.exception("Base de datos no disponible al obtener una publicación del blog por slug")
        raise HTTPException(
            status_code=503,
            detail="Servicio de datos temporalmente no disponible",
        ) from None
    except Exception:
        logger.exception(
            "Error inesperado al obtener una publicación del blog por slug"
        )
        raise HTTPException(
            status_code=500,
            detail="Error interno al obtener la publicación del blog",
        ) from None


@router.get("/blog/by-id/{id_noticia}", response_model=schemas.Blog)
async def get_blog_post_by_id(
    id_noticia: int = Path(..., ge=1),
    idioma: SupportedLanguage = Query(...),
    token_verification: None = Depends(verify_token),  # Verifica el token temporal
    db: AsyncSession = Depends(get_db)  # Luego obtiene la conexión a BD
):
    """
    Obtiene una publicación de blog específica por su ID y idioma.

    Este endpoint permite recuperar una publicación específica identificada por su ID
    y filtrada por idioma.

    Args:
        id_noticia (int): ID único de la noticia.
        idioma (str): Idioma de la noticia.
        token_verification (None): Verificación del token proporcionado.
        db (AsyncSession): Sesión de base de datos proporcionada por la dependencia.

    Raises:
        HTTPException:
            - 401: Si no se proporciona token.
            - 403: Si el token proporcionado es inválido.
            - 404: Si la publicación no se encuentra.
            - 503: Si la base de datos no está disponible temporalmente.
            - 500: Si ocurre algún error interno.

    Returns:
        schemas.Blog: La publicación de blog encontrada.
    """
    try:
        blog_service = BlogService(db)
        post = await blog_service.get_post_by_id(id_noticia, idioma)
        
        if post is None:
            raise HTTPException(status_code=404, detail="Blog no encontrado")
        return post
    except HTTPException:
        raise
    except (DBAPIError, SQLAlchemyTimeoutError):
        logger.exception("Base de datos no disponible al obtener una publicación del blog por ID")
        raise HTTPException(
            status_code=503,
            detail="Servicio de datos temporalmente no disponible",
        ) from None
    except Exception:
        logger.exception(
            "Error inesperado al obtener una publicación del blog por ID"
        )
        raise HTTPException(
            status_code=500,
            detail="Error interno al obtener la publicación del blog",
        ) from None
