# backend/models/schemas.py

"""
Módulo de esquemas de Pydantic para la validación y serialización de datos.
Define los esquemas utilizados para la validación de entradas y la respuesta de la API.
"""

from pydantic import BaseModel, EmailStr, validator
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

    @validator('name')
    def name_validator(cls, v):
        """
        Validador para el campo 'name'.
        Asegura que el nombre solo contenga letras y espacios.
        
        Args:
            v (str): Valor del campo 'name' a validar.
        
        Raises:
            ValueError: Si el nombre contiene caracteres no permitidos.
        
        Returns:
            str: Valor validado del campo 'name'.
        """
        if not all(char.isalpha() or char.isspace() for char in v):
            raise ValueError('El nombre solo debe contener letras y espacios')
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
