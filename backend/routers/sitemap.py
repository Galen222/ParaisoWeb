"""Endpoint mínimo protegido utilizado por el sitemap dinámico del frontend."""

import logging

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.exc import DBAPIError, TimeoutError as SQLAlchemyTimeoutError
from sqlalchemy.ext.asyncio import AsyncSession

from ..dependencies import get_db, verify_local_request, verify_token
from ..models import schemas
from ..services.sitemap_service import SitemapService

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/sitemap/blog", response_model=list[schemas.SitemapBlogEntry])
async def get_sitemap_blog_entries(
    response: Response,
    token_verification: None = Depends(verify_token),
    local_verification: None = Depends(verify_local_request),
    db: AsyncSession = Depends(get_db),
) -> list[schemas.SitemapBlogEntry]:
    """Devuelve los datos mínimos tras validar token y origen local."""
    response.headers["Cache-Control"] = "public, max-age=300, stale-while-revalidate=600"

    try:
        return await SitemapService(db).get_blog_entries()
    except (DBAPIError, SQLAlchemyTimeoutError):
        logger.exception("Base de datos no disponible al generar las entradas del sitemap")
        raise HTTPException(
            status_code=503,
            detail="Sitemap temporalmente no disponible",
        ) from None
    except Exception:
        logger.exception("Error inesperado al generar las entradas del sitemap")
        raise HTTPException(
            status_code=500,
            detail="Error interno al generar el sitemap",
        ) from None
