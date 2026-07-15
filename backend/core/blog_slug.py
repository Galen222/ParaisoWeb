"""Normalización y validación canónica de slugs públicos del blog."""

import unicodedata

MAX_BLOG_SLUG_LENGTH = 150


def normalize_blog_slug(value: object) -> str | None:
    """Devuelve el slug NFC si tiene la misma forma canónica que genera el frontend."""
    if not isinstance(value, str):
        return None

    slug = unicodedata.normalize("NFC", value)
    if not slug or len(slug) > MAX_BLOG_SLUG_LENGTH:
        return None

    previous_was_alphanumeric_or_mark = False
    has_alphanumeric = False

    for character in slug:
        if character == "-":
            # Un slug generado correctamente no empieza por guion, no contiene
            # guiones consecutivos y tampoco termina en guion.
            if not previous_was_alphanumeric_or_mark:
                return None
            previous_was_alphanumeric_or_mark = False
            continue

        if character.isalnum():
            has_alphanumeric = True
            previous_was_alphanumeric_or_mark = True
            continue

        if (
            unicodedata.category(character).startswith("M")
            and previous_was_alphanumeric_or_mark
        ):
            continue

        return None

    if not has_alphanumeric or not previous_was_alphanumeric_or_mark:
        return None

    return slug
