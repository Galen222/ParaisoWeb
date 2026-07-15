"""Servicio de lectura mínima para generar el sitemap público."""

import logging
from datetime import datetime

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.blog_slug import normalize_blog_slug
from ..models import models, schemas

logger = logging.getLogger(__name__)
SUPPORTED_LANGUAGES = {"es", "en", "de"}
class SitemapService:
    """Obtiene únicamente los campos públicos necesarios para el sitemap."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_blog_entries(self) -> list[schemas.SitemapBlogEntry]:
        """Lista las URLs de blog activas sin cargar títulos, contenido ni imágenes."""
        result = await self.db.execute(
            select(
                models.Blog.id_noticia,
                models.Blog.idioma,
                models.Blog.slug,
                func.coalesce(
                    models.Blog.fecha_actualizacion,
                    models.Blog.fecha_publicacion,
                ).label("lastmod"),
            )
            .where(models.Blog.idioma.in_(SUPPORTED_LANGUAGES))
            .order_by(models.Blog.id_noticia, models.Blog.idioma)
        )

        entries: list[schemas.SitemapBlogEntry] = []
        for row in result.all():
            id_noticia = row.id_noticia
            idioma = row.idioma
            slug = normalize_blog_slug(row.slug)
            if (
                not isinstance(id_noticia, int)
                or isinstance(id_noticia, bool)
                or id_noticia <= 0
                or not isinstance(idioma, str)
                or idioma not in SUPPORTED_LANGUAGES
                or slug is None
                or not isinstance(row.lastmod, datetime)
            ):
                logger.warning(
                    "Entrada de blog omitida del sitemap por datos no válidos: id=%s idioma=%s",
                    id_noticia,
                    idioma,
                )
                continue

            entries.append(
                schemas.SitemapBlogEntry(
                    id_noticia=id_noticia,
                    idioma=idioma,
                    slug=slug,
                    lastmod=row.lastmod,
                )
            )

        return entries
