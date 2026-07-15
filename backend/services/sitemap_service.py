"""Servicio de lectura mínima para generar el sitemap público."""

import logging
import unicodedata
from datetime import datetime

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models import models, schemas

logger = logging.getLogger(__name__)
SUPPORTED_LANGUAGES = {"es", "en", "de"}
MAX_SLUG_LENGTH = 150


def _normalize_valid_slug(value: str) -> str | None:
    """Normaliza un slug almacenado y descarta filas que no pueden formar una URL pública."""
    slug = unicodedata.normalize("NFC", value)
    if not slug or len(slug) > MAX_SLUG_LENGTH:
        return None

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
        return None

    return slug


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
            slug = _normalize_valid_slug(row.slug)
            if slug is None or not isinstance(row.lastmod, datetime):
                logger.warning(
                    "Entrada de blog omitida del sitemap por datos no válidos: id=%s idioma=%s",
                    row.id_noticia,
                    row.idioma,
                )
                continue

            entries.append(
                schemas.SitemapBlogEntry(
                    id_noticia=row.id_noticia,
                    idioma=row.idioma,
                    slug=slug,
                    lastmod=row.lastmod,
                )
            )

        return entries
