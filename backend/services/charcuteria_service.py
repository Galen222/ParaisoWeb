# backend/services/charcuteria_service.py

"""
services/charcuteria_service.py

Servicio para manejar la lógica de negocio relacionada con los productos de charcutería.

Este módulo separa la lógica de acceso a la base de datos de la capa HTTP, permitiendo
un manejo más estructurado y reutilizable.

Funcionalidades principales:
- Obtener todos los productos de charcutería filtrados por idioma.

Dependencias:
- SQLAlchemy: Para consultas y operaciones en la base de datos.
- Models: Modelos de datos definidos en la capa ORM.
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from ..models import models

class CharcuteriaService:
    """
    Servicio para manejar la lógica relacionada con los productos de charcutería.

    Este servicio encapsula toda la lógica de negocio relacionada con los productos
    de charcutería, interactuando con la base de datos a través de SQLAlchemy.
    """

    def __init__(self, db: AsyncSession):
        """
        Inicializa el servicio con una sesión de base de datos.

        Args:
            db (AsyncSession): Sesión de base de datos asíncrona.
        """
        self.db = db

    async def get_all_products(self, idioma: str) -> List[models.Charcuteria]:
        """
        Obtiene todos los productos de charcutería en un idioma específico.

        Los productos se ordenan primero por categoría en orden ascendente y luego
        por nombre en orden alfabético.

        Args:
            idioma (str): Idioma de los productos a obtener.

        Returns:
            List[models.Charcuteria]: Lista de productos de charcutería en el idioma solicitado.
        """
        result = await self.db.execute(
            select(models.Charcuteria)
            .where(models.Charcuteria.idioma == idioma)
            .order_by(
                models.Charcuteria.categoria.asc(),
                models.Charcuteria.nombre.asc()
            )
        )
        return list(result.scalars().all())
