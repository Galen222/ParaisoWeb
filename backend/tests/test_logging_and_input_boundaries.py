"""Pruebas de privacidad de logs y límites de entradas públicas."""

from backend.tests import _environment as _test_environment  # noqa: F401  # Importación con efecto de configuración.

import json
import unittest
from io import BytesIO
from unittest.mock import AsyncMock, patch

from fastapi import FastAPI, HTTPException, UploadFile
from fastapi.testclient import TestClient

from backend.middleware.logging import get_error_message
from backend.models.schemas import ContactForm
from backend.routers import blog
from backend.services.file_service import FileService


class LoggingPrivacyTests(unittest.TestCase):
    def test_error_422_no_incluye_el_valor_recibido_en_el_log(self) -> None:
        response_body = json.dumps(
            {
                "detail": [
                    {
                        "type": "value_error",
                        "loc": ["body", "email"],
                        "msg": "Value error",
                        "input": "correo-personal@example.com",
                    },
                    {
                        "type": "string_too_long",
                        "loc": ["body", "message"],
                        "input": "mensaje privado que no debe registrarse",
                    },
                ]
            }
        ).encode("utf-8")

        log_message = get_error_message(response_body, truncated=False)

        self.assertIn("body.email (value_error)", log_message)
        self.assertIn("body.message (string_too_long)", log_message)
        self.assertNotIn("correo-personal@example.com", log_message)
        self.assertNotIn("mensaje privado", log_message)


class ContactNameValidationTests(unittest.TestCase):
    def test_acepta_apostrofes_unicode_habituales_en_nombres(self) -> None:
        curved = ContactForm(
            name="O’Connor",
            reason="informacion",
            email="oconnor@example.com",
            message="Mensaje de prueba",
        )
        modifier = ContactForm(
            name="DʼAngelo",
            reason="informacion",
            email="dangelo@example.com",
            message="Mensaje de prueba",
        )

        self.assertEqual(curved.name, "O’Connor")
        self.assertEqual(modifier.name, "DʼAngelo")


class AttachmentSizeStatusTests(unittest.IsolatedAsyncioTestCase):
    async def test_archivo_sobredimensionado_devuelve_413_si_el_tamano_es_conocido(self) -> None:
        service = FileService()
        service.MAX_FILE_SIZE = 5
        upload = UploadFile(file=BytesIO(b"123456"), size=6, filename="documento.pdf")

        with self.assertRaises(HTTPException) as raised:
            await service.scan_file_content(upload)

        self.assertEqual(raised.exception.status_code, 413)

    async def test_archivo_sobredimensionado_devuelve_413_durante_streaming(self) -> None:
        service = FileService()
        service.MAX_FILE_SIZE = 5
        service.SCAN_CHUNK_SIZE = 3
        upload = UploadFile(file=BytesIO(b"123456"), size=None, filename="documento.pdf")

        with self.assertRaises(HTTPException) as raised:
            await service.scan_file_content(upload)

        self.assertEqual(raised.exception.status_code, 413)


class BlogSlugBoundaryTests(unittest.TestCase):
    def test_slug_mas_largo_que_la_columna_se_rechaza_antes_de_consultar_mysql(self) -> None:
        app = FastAPI()

        async def override_get_db():
            yield AsyncMock()

        async def override_verify_token() -> None:
            return None

        app.dependency_overrides[blog.get_db] = override_get_db
        app.dependency_overrides[blog.verify_token] = override_verify_token
        app.include_router(blog.router)

        with patch.object(blog.BlogService, "get_post_by_slug", new=AsyncMock()) as get_post:
            response = TestClient(app).get(f"/blog/{'a' * 151}?idioma=es")

        self.assertEqual(response.status_code, 422)
        get_post.assert_not_awaited()


if __name__ == "__main__":
    unittest.main()
