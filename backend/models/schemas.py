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

from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Literal, Optional
from datetime import datetime
import unicodedata


# Esquema para el Formulario de Contacto
class ContactForm(BaseModel):
    """
    Esquema para validar los datos del formulario de contacto.

    Atributos:
        name (str): Nombre del remitente.
        reason (str): Motivo del contacto.
        email (EmailStr): Correo electrónico validado del remitente.
        message (str): Mensaje enviado en el formulario.
    """
    name: str = Field(min_length=1, max_length=100)
    reason: str = Field(min_length=1, max_length=20)
    email: EmailStr = Field(max_length=254)
    message: str = Field(min_length=1, max_length=5000)

    @field_validator('name', mode='before')
    @classmethod
    def strip_name(cls, v: str) -> str:
        """Elimina espacios exteriores y normaliza Unicode antes de validar el nombre."""
        return unicodedata.normalize("NFC", v.strip()) if isinstance(v, str) else v

    @field_validator('email', mode='before')
    @classmethod
    def strip_email(cls, v: str) -> str:
        """Elimina espacios exteriores antes de aplicar la validación EmailStr."""
        return v.strip() if isinstance(v, str) else v

    @field_validator('reason', mode='before')
    @classmethod
    def strip_reason(cls, v: str) -> str:
        """Normaliza espacios accidentales sin alterar los valores permitidos."""
        return v.strip() if isinstance(v, str) else v

    @field_validator('name')
    @classmethod
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
        valid_characters = set(" -'’ʼ")
        has_letter = False
        previous_was_letter_or_mark = False

        for char in v:
            # El apóstrofe modificador U+02BC pertenece a la categoría Unicode Lm,
            # pero en un nombre actúa como separador y no debe contar como letra.
            if char in valid_characters:
                previous_was_letter_or_mark = False
                continue

            category = unicodedata.category(char)
            is_letter = category.startswith("L")
            is_mark = category.startswith("M")

            if is_letter:
                has_letter = True
                previous_was_letter_or_mark = True
                continue

            # Algunas escrituras válidas usan marcas combinadas que no siempre se
            # componen mediante NFC. Solo se admiten después de una letra u otra marca,
            # evitando nombres que empiecen por una marca huérfana.
            if is_mark and previous_was_letter_or_mark:
                continue

            raise ValueError(
                "El nombre solo puede contener letras, marcas combinadas, espacios, guiones (-) y apóstrofes."
            )

        if not has_letter:
            raise ValueError("El nombre debe contener al menos una letra")
        return v

    @field_validator('message')
    @classmethod
    def validate_message(cls, v: str) -> str:
        """Rechaza mensajes vacíos o con controles invisibles incompatibles con el correo."""
        if not v.strip():
            raise ValueError("El mensaje no puede estar vacío")

        # Se conservan tabuladores y saltos de línea normales. Otros caracteres Unicode
        # de control o formato pueden romper el cuerpo MIME o hacer que el texto mostrado
        # difiera del texto validado, por lo que se rechazan antes de construir el correo.
        allowed_controls = {"\t", "\n", "\r"}
        if any(
            (
                unicodedata.category(character).startswith("C")
                or unicodedata.category(character) in {"Zl", "Zp"}
            )
            and character not in allowed_controls
            for character in v
        ):
            raise ValueError("El mensaje contiene caracteres de control no permitidos")

        return v

    @field_validator('reason')
    @classmethod
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
        motivos_validos = {"informacion", "comercial", "factura", "curriculum", "reclamacion", "error", "otro"}
        if v not in motivos_validos:
            raise ValueError(f"El motivo debe ser uno de: {', '.join(motivos_validos)}")
        return v


class SitemapBlogEntry(BaseModel):
    """Datos públicos mínimos de una publicación incluidos en el sitemap."""

    id_noticia: int = Field(gt=0)
    idioma: Literal["es", "en", "de"]
    slug: str = Field(min_length=1, max_length=150)
    lastmod: datetime


# Esquemas para la Tabla 'charcuteria'
class CharcuteriaBase(BaseModel):
    """
    Esquema base para los productos de charcutería.

    Atributos:
        idioma (str): Idioma del producto (ejemplo: 'es').
        nombre (str): Nombre del producto.
        empresa (Optional[str]): Empresa del producto, si está informada.
        descripcion (str): Descripción detallada del producto.
        imagen_url (str): URL de la imagen del producto.
        categoria (str): Categoría del producto (ejemplo: 'Embutidos').
    """
    idioma: str
    nombre: str
    empresa: Optional[str] = None
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
    fecha: Optional[datetime] = None

    model_config = {"from_attributes": True}


# Esquemas para la Tabla 'blog'
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
    fecha_actualizacion: Optional[datetime] = None

    model_config = {"from_attributes": True}
