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

from pydantic import BaseModel, Field, field_validator
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
    if any(
        unicodedata.category(character).startswith("C")
        or unicodedata.category(character) in {"Zl", "Zp"}
        for character in value
    ):
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
            or any(
                unicodedata.category(character).startswith("C")
                or unicodedata.category(character) in {"Zl", "Zp"}
                for character in decoded_segment
            )
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


def _has_orphan_public_mark(value: str) -> bool:
    """Detecta marcas combinantes sin una base visible anterior en la misma palabra."""
    has_visible_base = False
    for character in value:
        category_group = unicodedata.category(character)[0]
        if category_group == "M":
            if not has_visible_base:
                return True
            continue
        if category_group in {"L", "N", "P", "S"}:
            has_visible_base = True
            continue
        if character not in {"\u200c", "\u200d"}:
            has_visible_base = False
    return False


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
    if _has_orphan_public_mark(value):
        raise ValueError(f"{field_name} contiene una marca combinante sin base")

    allowed_controls = {"\t", "\n", "\r"} if multiline else set()
    for character in value:
        category = unicodedata.category(character)
        if (
            (
                category.startswith("C")
                and character not in allowed_controls
                and character not in ALLOWED_PUBLIC_FORMAT_CHARACTERS
            )
            or category in {"Zl", "Zp"}
            or character in BIDI_CONTROL_CHARACTERS
        ):
            raise ValueError(f"{field_name} contiene caracteres de control no permitidos")

    return value


def _require_non_blank(value: object, field_name: str) -> object:
    """Compatibilidad interna para validaciones que solo requieren contenido visible."""
    return _require_safe_public_text(value, field_name)


CONTACT_EMAIL_MAX_LENGTH = 254
CONTACT_EMAIL_MAX_LOCAL_PART_LENGTH = 64
CONTACT_EMAIL_MAX_DOMAIN_LENGTH = 253
CONTACT_EMAIL_MAX_DOMAIN_LABEL_LENGTH = 63
CONTACT_EMAIL_MIN_TOP_LEVEL_DOMAIN_LENGTH = 2
CONTACT_EMAIL_LOCAL_PATTERN = re.compile(r"^[A-Za-z0-9!#$%&'*+/=?^_`{|}~.-]+$")


def _is_domain_initial_character(character: str) -> bool:
    """Una etiqueta de dominio debe comenzar por una letra o un número."""
    return unicodedata.category(character)[0] in {"L", "N"}


def _is_domain_character(character: str) -> bool:
    """Admite letras, números y marcas Unicode dentro de una etiqueta."""
    return unicodedata.category(character)[0] in {"L", "N", "M"}


def _is_domain_letter(character: str) -> bool:
    """Identifica letras Unicode para comprobar el sufijo final."""
    return unicodedata.category(character)[0] == "L"


def _is_domain_mark(character: str) -> bool:
    """Identifica marcas combinantes Unicode."""
    return unicodedata.category(character)[0] == "M"


def validate_contact_email(value: object) -> str:
    """
    Valida y devuelve exactamente el correo recibido.

    No recorta espacios, no cambia mayúsculas/minúsculas, no normaliza Unicode y
    no transforma el dominio a punycode. Estas reglas equivalen a las aplicadas
    localmente por el frontend antes de enviar el formulario.
    """
    if not isinstance(value, str):
        raise ValueError("La dirección de correo debe ser texto")

    if not value or len(value) > CONTACT_EMAIL_MAX_LENGTH:
        raise ValueError("La dirección de correo es demasiado larga")

    if value.count("@") != 1:
        raise ValueError("Debe indicarse una dirección de correo simple")

    local_part, domain = value.split("@", 1)
    if (
        not local_part
        or not domain
        or len(local_part) > CONTACT_EMAIL_MAX_LOCAL_PART_LENGTH
        or len(domain) > CONTACT_EMAIL_MAX_DOMAIN_LENGTH
        or CONTACT_EMAIL_LOCAL_PATTERN.fullmatch(local_part) is None
        or local_part.startswith(".")
        or local_part.endswith(".")
        or ".." in local_part
    ):
        raise ValueError("La parte local del correo no es válida")

    labels = domain.split(".")
    if len(labels) < 2:
        raise ValueError("El dominio del correo debe incluir un sufijo")

    for label in labels:
        if not label or len(label) > CONTACT_EMAIL_MAX_DOMAIN_LABEL_LENGTH:
            raise ValueError("El dominio del correo no es válido")

        if not _is_domain_initial_character(label[0]):
            raise ValueError("El dominio del correo no es válido")

        if label.endswith("-"):
            raise ValueError("El dominio del correo no es válido")

        previous_was_hyphen = False
        for character in label:
            if character == "-":
                previous_was_hyphen = True
                continue

            if not _is_domain_character(character):
                raise ValueError("El dominio del correo no es válido")
            if previous_was_hyphen and _is_domain_mark(character):
                raise ValueError("El dominio del correo no es válido")
            previous_was_hyphen = False

    top_level_domain = labels[-1]
    if (
        len(top_level_domain) < CONTACT_EMAIL_MIN_TOP_LEVEL_DOMAIN_LENGTH
        or not any(_is_domain_letter(character) for character in top_level_domain)
    ):
        raise ValueError("El sufijo del dominio no es válido")

    return value

class ContactEmail(BaseModel):
    """Dirección validada por las reglas literales del formulario."""

    email: str = Field(max_length=254)

    @field_validator("email", mode="before")
    @classmethod
    def validate_contact_email(cls, value: object) -> str:
        """Aplica las mismas reglas literales que usa el navegador."""
        return validate_contact_email(value)


# Esquema para el Formulario de Contacto
class ContactForm(ContactEmail):
    """
    Esquema para validar los datos del formulario de contacto.

    Atributos:
        name (str): Nombre del remitente.
        reason (str): Motivo del contacto.
        email (str): Correo electrónico validado sin modificar el valor recibido.
        message (str): Mensaje enviado en el formulario.
    """
    name: str = Field(min_length=1, max_length=100)
    reason: str = Field(min_length=1, max_length=20)
    message: str = Field(min_length=1, max_length=5000)

    @field_validator('name', mode='before')
    @classmethod
    def strip_name(cls, v: str) -> str:
        """Normaliza el nombre y elimina únicamente espacios normales exteriores."""
        if not isinstance(v, str):
            return v

        normalized_value = unicodedata.normalize("NFC", v)
        if any(
            character != " "
            and unicodedata.category(character)[0] in {"C", "Z"}
            for character in normalized_value
        ):
            raise ValueError("El nombre contiene caracteres de control no permitidos")

        return normalized_value.strip(" ")

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
        if not v.strip() or not _has_visible_public_character(v):
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
    idioma: Literal["es", "en", "de", "fr"]
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
    idioma: Literal["es", "en", "de", "fr"]
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
    idioma: Literal["es", "en", "de", "fr"]
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
