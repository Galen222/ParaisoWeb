# backend/services/blog_service.py

"""
services/blog_service.py

Servicio para manejar la lógica de negocio relacionada con el blog.
Separa la lógica de base de datos y procesamiento de la capa HTTP.
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from typing import List, Optional
from ..models import models

class BlogService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all_posts(self, idioma: str) -> List[models.Blog]:
        """
        Obtiene todas las publicaciones del blog en un idioma específico.
        
        Args:
            idioma (str): Idioma de las publicaciones a obtener.
            
        Returns:
            List[models.Blog]: Lista de publicaciones del blog.
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
        return result.scalars().all()

    async def get_post_by_slug(self, slug: str, idioma: Optional[str] = None) -> Optional[models.Blog]:
        """
        Obtiene una publicación específica por su slug y opcionalmente por idioma.
        
        Args:
            slug (str): Slug único de la publicación.
            idioma (Optional[str]): Idioma de la publicación.
            
        Returns:
            Optional[models.Blog]: Publicación encontrada o None.
        """
        query = select(models.Blog).where(models.Blog.slug == slug)
        if idioma:
            query = query.where(models.Blog.idioma == idioma)
        
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_post_by_id(self, id_noticia: int, idioma: str) -> Optional[models.Blog]:
        """
        Obtiene una publicación específica por su ID y idioma.
        
        Args:
            id_noticia (int): ID de la noticia.
            idioma (str): Idioma de la publicación.
            
        Returns:
            Optional[models.Blog]: Publicación encontrada o None.
        """
        result = await self.db.execute(
            select(models.Blog)
            .where(
                models.Blog.id_noticia == id_noticia,
                models.Blog.idioma == idioma
            )
        )
        return result.scalar_one_or_none()