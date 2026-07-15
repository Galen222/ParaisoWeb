"""Regresiones para nombres Unicode y límites de slugs del blog."""

from backend.tests import _environment  # noqa: F401

import unittest
from unittest.mock import AsyncMock, patch

from fastapi import HTTPException

from backend.models.schemas import ContactForm
from backend.routers.blog import _is_valid_blog_slug, get_blog_post_by_slug
from pydantic import ValidationError


class ContactNameUnicodeTests(unittest.TestCase):
    def test_acepta_marcas_combinadas_validas_de_escrituras_no_latinas(self) -> None:
        form = ContactForm(
            name="कि",
            reason="informacion",
            email="persona@example.com",
            message="Consulta válida",
        )

        self.assertEqual(form.name, "कि")

    def test_rechaza_una_marca_combinada_huerfana_al_inicio(self) -> None:
        with self.assertRaises(ValidationError):
            ContactForm(
                name="िक",
                reason="informacion",
                email="persona@example.com",
                message="Consulta válida",
            )


class BlogSlugValidationTests(unittest.IsolatedAsyncioTestCase):
    def test_rechaza_caracteres_que_el_frontend_no_genera(self) -> None:
        self.assertFalse(_is_valid_blog_slug("articulo_con_guion_bajo"))
        self.assertFalse(_is_valid_blog_slug("articulo con espacios"))
        self.assertFalse(_is_valid_blog_slug("\u0301articulo"))

    def test_acepta_letras_numeros_marcas_y_guiones(self) -> None:
        self.assertTrue(_is_valid_blog_slug("jamon-iberico-2026"))
        self.assertTrue(_is_valid_blog_slug("कि-विशेष"))

    async def test_endpoint_rechaza_slug_invalido_antes_de_consultar_mysql(self) -> None:
        db = AsyncMock()

        with patch("backend.routers.blog.BlogService") as service_class:
            with self.assertRaises(HTTPException) as raised:
                await get_blog_post_by_slug(
                    slug="articulo_con_guion_bajo",
                    idioma="es",
                    token_verification=None,
                    db=db,
                )

        self.assertEqual(raised.exception.status_code, 422)
        service_class.assert_not_called()


if __name__ == "__main__":
    unittest.main()
