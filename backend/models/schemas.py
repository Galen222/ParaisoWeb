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
from urllib.parse import unquote
import re
import unicodedata

from ..core.blog_slug import normalize_blog_slug


MAX_ASSET_DECODE_PASSES = 5
ALLOWED_CONTACT_MESSAGE_FORMAT_CHARACTERS = {"\u200c", "\u200d"}


def _is_safe_public_asset_path(value: object) -> bool:
    """Valida rutas relativas de recursos con el mismo criterio defensivo del frontend."""
    if not isinstance(value, str) or not value or value.strip() != value:
        return False
    if value.startswith("/") or "\\" in value or any(character in value for character in "?#"):
        return False
    if any(unicodedata.category(character) in {"Cc", "Cf"} for character in value):
        return False

    for segment in value.split("/"):
        if not segment:
            return False

        decoded_segment = segment
        try:
            for _ in range(MAX_ASSET_DECODE_PASSES):
                if re.search(r"%(?![0-9A-Fa-f]{2})", decoded_segment):
                    return False
                next_value = unquote(decoded_segment, errors="strict")
                if next_value == decoded_segment:
                    break
                decoded_segment = next_value
            else:
                return False
        except (UnicodeDecodeError, ValueError):
            return False

        if (
            decoded_segment in {".", ".."}
            or "/" in decoded_segment
            or "\\" in decoded_segment
            or any(character in decoded_segment for character in "?#")
            or any(unicodedata.category(character) in {"Cc", "Cf"} for character in decoded_segment)
        ):
            return False

    return True


ALLOWED_PUBLIC_FORMAT_CHARACTERS = {"\u00ad", "\u200c", "\u200d"}
BIDI_CONTROL_CHARACTERS = {
    "\u061c",
    "\u200e",
    "\u200f",
    *map(chr, range(0x202A, 0x202F)),
    *map(chr, range(0x2066, 0x206A)),
}


def _has_visible_public_character(value: str) -> bool:
    """Exige alguna letra, número, signo o puntuación realmente visible."""
    return any(unicodedata.category(character)[0] in {"L", "N", "P", "S"} for character in value)


def _require_safe_public_text(
    value: object,
    field_name: str,
    *,
    multiline: bool = False,
) -> object:
    """Rechaza textos públicos vacíos, controles y marcas bidireccionales peligrosas."""
    if not isinstance(value, str):
        return value

    if not value.strip() or not _has_visible_public_character(value):
        raise ValueError(f"{field_name} no puede estar vacío")

    allowed_controls = {"\t", "\n", "\r"} if multiline else set()
    for character in value:
        category = unicodedata.category(character)
        if (
            (category == "Cc" and character not in allowed_controls)
            or (category == "Cf" and character not in ALLOWED_PUBLIC_FORMAT_CHARACTERS)
            or category in {"Zl", "Zp"}
            or character in BIDI_CONTROL_CHARACTERS
        ):
            raise ValueError(f"{field_name} contiene caracteres de control no permitidos")

    return value


def _require_non_blank(value: object, field_name: str) -> object:
    """Compatibilidad interna para validaciones que solo requieren contenido visible."""
    return _require_safe_public_text(value, field_name)


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
            and character not in ALLOWED_CONTACT_MESSAGE_FORMAT_CHARACTERS
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
    idioma: Literal["es", "en", "de"]
    nombre: str
    empresa: Optional[str] = None
    descripcion: str
    imagen_url: str
    categoria: str

    @field_validator("nombre", "categoria", mode="before")
    @classmethod
    def validate_required_single_line_text(cls, value: object, info) -> object:
        """Protege los textos de una línea usados como encabezados públicos."""
        return _require_safe_public_text(value, info.field_name)

    @field_validator("descripcion", mode="before")
    @classmethod
    def validate_required_multiline_text(cls, value: object, info) -> object:
        """Permite saltos normales, pero no controles invisibles en la descripción."""
        return _require_safe_public_text(value, info.field_name, multiline=True)

    @field_validator("empresa", mode="before")
    @classmethod
    def normalize_optional_company(cls, value: object) -> object:
        """Representa empresas heredadas vacías como ausencia real y valida las informadas."""
        if isinstance(value, str) and not value.strip():
            return None
        if value is not None:
            return _require_safe_public_text(value, "empresa")
        return value

    @field_validator("imagen_url")
    @classmethod
    def validate_image_path(cls, value: str) -> str:
        """Solo expone imágenes relativas que permanezcan dentro del directorio público."""
        if not _is_safe_public_asset_path(value):
            raise ValueError("imagen_url no contiene una ruta pública segura")
        return value


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
    id_producto: int = Field(gt=0)
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
    idioma: Literal["es", "en", "de"]
    slug: str
    titulo: str
    contenido: str
    autor: str
    imagen_url: str
    imagen_url_2: Optional[str] = None

    @field_validator("slug", mode="before")
    @classmethod
    def validate_slug(cls, value: object) -> str:
        """Normaliza el slug y rechaza rutas que el frontend no puede representar."""
        normalized_slug = normalize_blog_slug(value)
        if normalized_slug is None:
            raise ValueError("slug no válido")
        return normalized_slug

    @field_validator("titulo", "autor", mode="before")
    @classmethod
    def validate_required_single_line_text(cls, value: object, info) -> object:
        """Protege títulos y autores usados en tarjetas y metadatos públicos."""
        return _require_safe_public_text(value, info.field_name)

    @field_validator("contenido", mode="before")
    @classmethod
    def validate_required_multiline_text(cls, value: object, info) -> object:
        """Conserva el formato normal del artículo y rechaza controles peligrosos."""
        return _require_safe_public_text(value, info.field_name, multiline=True)

    @field_validator("imagen_url")
    @classmethod
    def validate_primary_image_path(cls, value: str) -> str:
        """Valida la ruta pública obligatoria de la imagen principal."""
        if not _is_safe_public_asset_path(value):
            raise ValueError("imagen_url no contiene una ruta pública segura")
        return value

    @field_validator("imagen_url_2", mode="before")
    @classmethod
    def validate_optional_image_path(cls, value: object) -> object:
        """Normaliza imágenes opcionales vacías y valida las rutas informadas."""
        if isinstance(value, str) and not value.strip():
            return None
        if value is not None and not _is_safe_public_asset_path(value):
            raise ValueError("imagen_url_2 no contiene una ruta pública segura")
        return value


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
    id_noticia: int = Field(gt=0)
    fecha_publicacion: datetime
    fecha_actualizacion: Optional[datetime] = None

    model_config = {"from_attributes": True}
