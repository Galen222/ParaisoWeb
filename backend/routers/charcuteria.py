# backend/routers/charcuteria.py

"""
routers/charcuteria.py

Router para manejar los productos de charcutería.

Este módulo define los endpoints para:
- Obtener una lista de productos de charcutería filtrados por idioma.

Dependencias:
- FastAPI: Para definir los endpoints y manejar las solicitudes.
- SQLAlchemy: Para interactuar con la base de datos.
- Schemas: Para estructurar las respuestas de la API.
- Servicios: Lógica de negocio implementada en `CharcuteriaService`.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import OperationalError
from typing import List
from ..models import schemas
from ..dependencies import verify_token, get_db
from ..services.charcuteria_service import CharcuteriaService

# Inicializa el router para los endpoints relacionados con charcutería
router = APIRouter()

@router.get("/charcuteria", response_model=List[schemas.Charcuteria])
async def get_charcuteria_products(
    idioma: str = Query("es"),  # Parámetro de idioma con valor predeterminado "es"
    db: AsyncSession = Depends(get_db),
    token_verification: None = Depends(verify_token)  # Verifica el token temporal
):
    """
    Obtiene una lista de productos de charcutería filtrados por idioma.

    Los productos están ordenados por categoría y luego por nombre en orden alfabético.

    Args:
        idioma (str, optional): Idioma de los productos. Por defecto "es".
        db (AsyncSession): Sesión de base de datos proporcionada por la dependencia.
        token_verification (None): Verificación del token proporcionado.

    Raises:
        HTTPException:
            - 500: Si hay un error de conexión con la base de datos.
            - 500: Si ocurre un error interno del servidor.

    Returns:
        List[schemas.Charcuteria]: Lista de productos de charcutería en el idioma solicitado.
    """
    try:
        charcuteria_service = CharcuteriaService(db)
        return await charcuteria_service.get_all_products(idioma)
    except OperationalError:
        raise HTTPException(status_code=500, detail="Error de conexión con la base de datos")
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error interno del servidor")
