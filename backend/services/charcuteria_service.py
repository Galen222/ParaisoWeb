# backend/services/charcuteria_service.py

"""
services/charcuteria_service.py

Servicio para manejar la lógica de negocio relacionada con los productos de charcutería.
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from ..models import models

class CharcuteriaService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all_products(self, idioma: str) -> List[models.Charcuteria]:
        """
        Obtiene todos los productos de charcutería en un idioma específico.
        
        Args:
            idioma (str): Idioma de los productos a obtener.
            
        Returns:
            List[models.Charcuteria]: Lista de productos de charcutería.
        """
        result = await self.db.execute(
            select(models.Charcuteria)
            .where(models.Charcuteria.idioma == idioma)
            .order_by(
                models.Charcuteria.categoria.asc(),
                models.Charcuteria.nombre.asc()
            )
        )
        return result.scalars().all()