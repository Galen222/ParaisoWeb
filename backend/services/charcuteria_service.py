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

import logging
from typing import List

from pydantic import ValidationError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from ..models import models, schemas

logger = logging.getLogger(__name__)


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

    @staticmethod
    def _validate_public_product(
        product: models.Charcuteria,
    ) -> schemas.Charcuteria | None:
        """Convierte una fila ORM en una respuesta pública o la omite si está dañada."""
        try:
            return schemas.Charcuteria.model_validate(product)
        except ValidationError:
            logger.warning(
                "Producto de charcutería omitido por datos públicos no válidos: id=%s idioma=%s",
                getattr(product, "id_producto", None),
                getattr(product, "idioma", None),
            )
            return None

    async def get_all_products(self, idioma: str) -> List[schemas.Charcuteria]:
        """
        Obtiene todos los productos de charcutería en un idioma específico.

        Los productos se ordenan primero por categoría en orden ascendente y luego
        por nombre en orden alfabético.

        Args:
            idioma (str): Idioma de los productos a obtener.

        Returns:
            List[schemas.Charcuteria]: Productos válidos del idioma solicitado.
        """
        result = await self.db.execute(
            select(models.Charcuteria)
            .where(models.Charcuteria.idioma == idioma)
            .order_by(
                models.Charcuteria.categoria.asc(),
                models.Charcuteria.nombre.asc(),
                models.Charcuteria.id_producto.asc(),
            )
        )

        products: list[schemas.Charcuteria] = []
        for row in result.scalars().all():
            validated_product = self._validate_public_product(row)
            if validated_product is not None:
                products.append(validated_product)
        return products
