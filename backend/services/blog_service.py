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

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from typing import List, Optional
from ..models import models

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

    async def get_all_posts(self, idioma: str) -> List[models.Blog]:
        """
        Obtiene todas las publicaciones del blog en un idioma específico.

        Las publicaciones se ordenan por la fecha de última actualización 
        (o por fecha de publicación si no hay actualizaciones).

        Args:
            idioma (str): Idioma de las publicaciones a obtener.

        Returns:
            List[models.Blog]: Lista de publicaciones del blog en el idioma solicitado.
        """
        result = await self.db.execute(
            select(models.Blog)
            .where(models.Blog.idioma == idioma)
            .order_by(
                func.coalesce(
                    models.Blog.fecha_actualizacion, 
                    models.Blog.fecha_publicacion
                ).desc()
            )
        )
        return list(result.scalars().all())

    async def get_post_by_slug(self, slug: str, idioma: Optional[str] = None) -> Optional[models.Blog]:
        """
        Obtiene una publicación específica por su slug y opcionalmente por idioma.

        Args:
            slug (str): Slug único de la publicación.
            idioma (Optional[str]): Idioma de la publicación. Si no se especifica, 
            buscará el slug sin filtrar por idioma.

        Returns:
            Optional[models.Blog]: Publicación encontrada o None si no existe.
        """
        query = select(models.Blog).where(models.Blog.slug == slug)
        if idioma:
            query = query.where(models.Blog.idioma == idioma)
        
        result = await self.db.execute(query)
        post = result.scalar_one_or_none()
        return post

    async def get_post_by_id(self, id_noticia: int, idioma: str) -> Optional[models.Blog]:
        """
        Obtiene una publicación específica por su ID y idioma.

        Args:
            id_noticia (int): ID único de la noticia.
            idioma (str): Idioma de la publicación.

        Returns:
            Optional[models.Blog]: Publicación encontrada o None si no existe.
        """
        result = await self.db.execute(
            select(models.Blog)
            .where(
                models.Blog.id_noticia == id_noticia,
                models.Blog.idioma == idioma
            )
        )
        post = result.scalar_one_or_none()
        return post
