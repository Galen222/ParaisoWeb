# backend/services/blog_service.py

"""
services/blog_service.py

Servicio para manejar la lógica de negocio relacionada con el blog.
Este módulo separa la lógica de acceso a la base de datos de la capa HTTP, permitiendo
un manejo más estructurado y reutilizable.

Funcionalidades principales:
- Obtener todas las publicaciones en un idioma específico.
- Buscar publicaciones por su slug.
- Buscar publicaciones por su ID y idioma.

Dependencias:
- SQLAlchemy: Para consultas y operaciones en la base de datos.
- Models: Modelos de datos definidos en la capa ORM.
"""

import logging
from typing import List, Optional

from pydantic import ValidationError
from sqlalchemy import func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from ..models import models, schemas

logger = logging.getLogger(__name__)


class BlogService:
    """
    Servicio para manejar las publicaciones del blog.

    Este servicio encapsula toda la lógica relacionada con las publicaciones
    del blog, interactuando con la base de datos a través de SQLAlchemy.
    """

    def __init__(self, db: AsyncSession):
        """
        Inicializa el servicio con una sesión de base de datos.

        Args:
            db (AsyncSession): Sesión de base de datos asíncrona.
        """
        self.db = db

    @staticmethod
    def _validate_public_post(post: models.Blog) -> schemas.Blog | None:
        """Convierte una fila ORM en una respuesta pública o la omite si está dañada."""
        try:
            return schemas.Blog.model_validate(post)
        except ValidationError:
            logger.warning(
                "Publicación omitida por datos públicos no válidos: id=%s idioma=%s",
                getattr(post, "id_noticia", None),
                getattr(post, "idioma", None),
            )
            return None

    async def get_all_posts(self, idioma: str) -> List[schemas.Blog]:
        """
        Obtiene todas las publicaciones del blog en un idioma específico.

        Las publicaciones se ordenan por la fecha de última actualización
        (o por fecha de publicación si no hay actualizaciones).

        Args:
            idioma (str): Idioma de las publicaciones a obtener.

        Returns:
            List[schemas.Blog]: Publicaciones válidas del blog en el idioma solicitado.
        """
        result = await self.db.execute(
            select(models.Blog)
            .where(models.Blog.idioma == idioma)
            .order_by(
                func.coalesce(
                    models.Blog.fecha_actualizacion,
                    models.Blog.fecha_publicacion,
                ).desc(),
                models.Blog.id_noticia.desc(),
            )
        )

        posts: list[schemas.Blog] = []
        for row in result.scalars().all():
            validated_post = self._validate_public_post(row)
            if validated_post is not None:
                posts.append(validated_post)
        return posts

    async def get_post_by_slug(
        self,
        slug: str,
        idioma: Optional[str] = None,
    ) -> Optional[schemas.Blog]:
        """
        Obtiene una publicación específica por su slug y opcionalmente por idioma.

        Args:
            slug (str): Slug único de la publicación.
            idioma (Optional[str]): Idioma de la publicación. Si no se especifica,
            buscará el slug sin filtrar por idioma.

        Returns:
            Optional[schemas.Blog]: Primera publicación válida o None si no existe.
        """
        query = select(models.Blog).where(models.Blog.slug == slug)
        if idioma:
            query = query.where(models.Blog.idioma == idioma)

        # La base de datos no impone unicidad sobre ``slug`` e ``idioma``. Se recorren
        # las coincidencias por orden editorial para que una fila dañada no oculte una
        # copia válida posterior ni convierta la lectura pública en un error 500.
        query = query.order_by(
            func.coalesce(
                models.Blog.fecha_actualizacion,
                models.Blog.fecha_publicacion,
            ).desc(),
            models.Blog.id_noticia.asc(),
        )

        result = await self.db.execute(query)
        for row in result.scalars().all():
            validated_post = self._validate_public_post(row)
            if validated_post is not None:
                return validated_post
        return None

    async def get_post_by_id(
        self,
        id_noticia: int,
        idioma: str,
    ) -> Optional[schemas.Blog]:
        """
        Obtiene una publicación específica por su ID y idioma.

        Args:
            id_noticia (int): ID único de la noticia.
            idioma (str): Idioma de la publicación.

        Returns:
            Optional[schemas.Blog]: Publicación válida o None si no existe o está dañada.
        """
        result = await self.db.execute(
            select(models.Blog).where(
                models.Blog.id_noticia == id_noticia,
                models.Blog.idioma == idioma,
            )
        )
        post = result.scalar_one_or_none()
        return self._validate_public_post(post) if post is not None else None
