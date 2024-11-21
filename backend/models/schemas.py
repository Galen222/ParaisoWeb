# backend/models/schemas.py

"""
models/schemas.py

Módulo de esquemas de Pydantic para la validación y serialización de datos.
Define los esquemas utilizados para la validación de entradas y la respuesta de la API.

Este archivo incluye:
- Esquemas para el formulario de contacto.
- Esquemas para la tabla 'charcuteria'.
- Esquemas para la tabla 'blog'.
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

    Atributos:
        name (str): Nombre del remitente.
        reason (str): Motivo del contacto.
        email (EmailStr): Correo electrónico validado del remitente.
        message (str): Mensaje enviado en el formulario.
    """
    name: str
    reason: str
    email: EmailStr
    message: str

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
        valid_characters = set(" -'")
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

    Atributos:
        idioma (str): Idioma del producto (ejemplo: 'es').
        nombre (str): Nombre del producto.
        empresa (str): Empresa del producto.
        descripcion (str): Descripción detallada del producto.
        imagen_url (str): URL de la imagen del producto.
        categoria (str): Categoría del producto (ejemplo: 'Embutidos').
    """
    idioma: str
    nombre: str
    empresa: str
    descripcion: str
    imagen_url: str
    categoria: str


class CharcuteriaCreate(CharcuteriaBase):
    """
    Esquema para crear nuevos registros en la tabla 'charcuteria'.

    Hereda todos los campos de 'CharcuteriaBase'.
    """
    pass


class Charcuteria(CharcuteriaBase):
    """
    Esquema para representar los datos de un producto de charcutería.

    Atributos adicionales:
        id_producto (int): Identificador único del producto.
        fecha (datetime): Fecha de creación del registro.
    """
    id_producto: int
    fecha: datetime

    model_config = {"from_attributes": True}


# -----------------------------
# Esquemas para la Tabla 'blog'
# -----------------------------
class BlogBase(BaseModel):
    """
    Esquema base para las publicaciones de blog.

    Atributos:
        idioma (str): Idioma de la publicación (ejemplo: 'es', 'en').
        slug (str): Slug único para la URL amigable.
        titulo (str): Título de la publicación.
        contenido (str): Contenido completo de la publicación.
        autor (str): Autor de la publicación.
        imagen_url (str): URL de la imagen principal de la publicación.
        imagen_url_2 (Optional[str]): URL de una segunda imagen (opcional).
    """
    idioma: str
    slug: str
    titulo: str
    contenido: str
    autor: str
    imagen_url: str
    imagen_url_2: Optional[str] = None


class BlogCreate(BlogBase):
    """
    Esquema para crear nuevas publicaciones en la tabla 'blog'.

    Hereda todos los campos de 'BlogBase'.
    """
    pass


class Blog(BlogBase):
    """
    Esquema para representar los datos de una publicación de blog.

    Atributos adicionales:
        id_noticia (int): Identificador único de la noticia.
        fecha_publicacion (datetime): Fecha de publicación de la noticia.
        fecha_actualizacion (datetime): Fecha de última actualización de la noticia.
    """
    id_noticia: int
    fecha_publicacion: datetime
    fecha_actualizacion: datetime

    model_config = {"from_attributes": True}
