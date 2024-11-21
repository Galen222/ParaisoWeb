# backend/models/schemas.py

"""
models/schemas.py

Módulo de esquemas de Pydantic para la validación y serialización de datos.
Define los esquemas utilizados para la validación de entradas y la respuesta de la API.
"""

from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from datetime import datetime


# -----------------------------
# Esquema para el Formulario de Contacto
# -----------------------------
class ContactForm(BaseModel):
    """
    Esquema para validar los datos del formulario de contacto.
    """
    name: str            # Nombre del remitente.
    reason: str          # Motivo del contacto.
    email: EmailStr      # Correo electrónico del remitente, validado como un EmailStr.
    message: str         # Mensaje enviado en el formulario.

    @field_validator('name')
    def validate_name(cls, v: str) -> str:
        """
        Validador para el campo 'name'.
        Permite caracteres alfabéticos, espacios, guiones y apóstrofes,
        asegurando compatibilidad con nombres en múltiples idiomas.

        Args:
            v (str): Valor del campo 'name' a validar.

        Raises:
            ValueError: Si el nombre contiene caracteres no permitidos.

        Returns:
            str: Valor validado del campo 'name'.
        """
        # Permitir letras, espacios, guiones y apóstrofes en cualquier idioma
        valid_characters = set(" -'")  # Espacios, guiones y apóstrofes permitidos
        if not all(char.isalpha() or char in valid_characters for char in v):
            raise ValueError(
                "El nombre solo puede contener letras, espacios, guiones (-) y apóstrofes (')."
            )
        return v.strip()

    @field_validator('reason')
    def validate_reason(cls, v: str) -> str:
        """
        Validador para el campo 'reason'.
        Asegura que el motivo esté dentro de los motivos permitidos.

        Args:
            v (str): Valor del campo 'reason' a validar.

        Raises:
            ValueError: Si el motivo no está en la lista permitida.

        Returns:
            str: Valor validado del campo 'reason'.
        """
        motivos_validos = {"informacion", "comercial", "factura", "curriculum", "error", "otro"}
        if v not in motivos_validos:
            raise ValueError(f"El motivo debe ser uno de: {', '.join(motivos_validos)}")
        return v


# -----------------------------
# Esquemas para la Tabla 'charcuteria'
# -----------------------------
class CharcuteriaBase(BaseModel):
    """
    Esquema base para los productos de charcutería.
    Contiene los campos comunes utilizados para crear y responder datos.
    """
    idioma: str            # Idioma del producto (ejemplo: 'es').
    nombre: str            # Nombre del producto.
    empresa: str           # Empresa del producto
    descripcion: str       # Descripción detallada del producto.
    imagen_url: str        # URL de la imagen del producto.
    categoria: str         # Categoría del producto (ejemplo: 'Embutidos').


class CharcuteriaCreate(CharcuteriaBase):
    """
    Esquema para crear nuevos registros en la tabla 'charcuteria'.
    Hereda todos los campos de 'CharcuteriaBase'.
    """
    pass  # Este esquema puede usarse para crear registros nuevos


class Charcuteria(CharcuteriaBase):
    """
    Esquema para representar los datos de un producto de charcutería.
    Incluye campos adicionales que se generan automáticamente.
    """
    id_producto: int       # Identificador único del producto.
    fecha: datetime        # Fecha de creación del registro.

    model_config = {"from_attributes": True}


# -----------------------------
# Esquemas para la Tabla 'blog'
# -----------------------------
class BlogBase(BaseModel):
    """
    Esquema base para las publicaciones de blog.
    Contiene los campos comunes utilizados para crear y responder datos.
    """
    idioma: str                # Idioma de la publicación (ejemplo: 'es', 'en').
    slug: str                  # Slug único para la URL amigable.
    titulo: str                # Título de la publicación.
    contenido: str             # Contenido completo de la publicación.
    autor: str                 # Autor de la publicación.
    imagen_url: str            # URL de la imagen principal de la publicación.
    imagen_url_2: Optional[str] = None  # URL de una segunda imagen (opcional).


class BlogCreate(BlogBase):
    """
    Esquema para crear nuevas publicaciones en la tabla 'blog'.
    Hereda todos los campos de 'BlogBase'.
    """
    pass  # Este esquema puede usarse para crear registros nuevos


class Blog(BlogBase):
    """
    Esquema para representar los datos de una publicación de blog.
    Incluye campos adicionales que se generan automáticamente.
    """
    id_noticia: int                 # Identificador único de la noticia.
    fecha_publicacion: datetime     # Fecha de publicación de la noticia.
    fecha_actualizacion: datetime   # Fecha de última actualización de la noticia.

    model_config = {"from_attributes": True}
