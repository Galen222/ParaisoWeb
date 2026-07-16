"""Servicio de lectura validada para generar el sitemap público."""

import logging
from pydantic import ValidationError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models import models, schemas

logger = logging.getLogger(__name__)
SUPPORTED_LANGUAGES = {"es", "en", "de"}
class SitemapService:
    """Obtiene únicamente las publicaciones que también son accesibles públicamente."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_blog_entries(self) -> list[schemas.SitemapBlogEntry]:
        """Lista URLs de artículos que superan el mismo contrato que la API pública."""
        result = await self.db.execute(
            select(models.Blog)
            .where(models.Blog.idioma.in_(SUPPORTED_LANGUAGES))
            .order_by(models.Blog.id_noticia, models.Blog.idioma)
        )

        entries: list[schemas.SitemapBlogEntry] = []
        for row in result.scalars().all():
            try:
                post = schemas.Blog.model_validate(row)
            except ValidationError:
                logger.warning(
                    "Entrada de blog omitida del sitemap por datos no válidos: id=%s idioma=%s",
                    getattr(row, "id_noticia", None),
                    getattr(row, "idioma", None),
                )
                continue

            entries.append(
                schemas.SitemapBlogEntry(
                    id_noticia=post.id_noticia,
                    idioma=post.idioma,
                    slug=post.slug,
                    lastmod=post.fecha_actualizacion or post.fecha_publicacion,
                )
            )

        return entries
