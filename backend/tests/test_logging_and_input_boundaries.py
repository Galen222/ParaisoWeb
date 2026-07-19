"""Pruebas de privacidad de logs y límites de entradas públicas."""

from backend.tests import _environment as _test_environment  # noqa: F401  # Importación con efecto de configuración.

import json
import unittest
from io import BytesIO
from unittest.mock import AsyncMock, patch

from fastapi import FastAPI, HTTPException, UploadFile
from fastapi.testclient import TestClient

from backend.middleware.logging import get_error_message, sanitize_log_value
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


class AttachmentHeaderValidationTests(unittest.IsolatedAsyncioTestCase):
    async def test_pdf_con_comentario_inicial_valido_se_acepta_y_rebobina(self) -> None:
        service = FileService()
        upload = UploadFile(
            file=BytesIO(b"% comentario previo\n%PDF-1.7\ncontenido"),
            filename="documento.pdf",
        )

        mime_type = await service.validate_file_headers(upload)

        self.assertEqual(mime_type, "application/pdf")
        self.assertEqual(await upload.read(5), b"% com")

    async def test_pdf_con_contenido_arbitrario_antes_de_la_cabecera_se_rechaza(self) -> None:
        service = FileService()
        upload = UploadFile(
            file=BytesIO(b"contenido ejecutable\n%PDF-1.7\ncontenido"),
            filename="documento.pdf",
        )

        with self.assertRaises(HTTPException) as raised:
            await service.validate_file_headers(upload)

        self.assertEqual(raised.exception.status_code, 400)

    async def test_pdf_con_cabecera_dentro_de_un_comentario_se_rechaza(self) -> None:
        service = FileService()
        upload = UploadFile(
            file=BytesIO(b"% comentario que contiene %PDF-1.7\ncontenido"),
            filename="documento.pdf",
        )

        with self.assertRaises(HTTPException) as raised:
            await service.validate_file_headers(upload)

        self.assertEqual(raised.exception.status_code, 400)


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

    async def test_hash_del_adjunto_no_se_escribe_en_logs(self) -> None:
        service = FileService()
        upload = UploadFile(file=BytesIO(b"contenido privado"), size=17, filename="documento.pdf")

        with patch("backend.services.file_service.logger.info") as log_info:
            file_hash = await service.scan_file_content(upload)

        messages = " ".join(
            str(call.args[0]) % tuple(call.args[1:]) if len(call.args) > 1 else str(call.args[0])
            for call in log_info.call_args_list
            if call.args
        )
        self.assertNotIn(file_hash, messages)
        self.assertIn("Archivo limpio", messages)
        self.assertIn("bytes=17", messages)
        self.assertIn("extensión=.pdf", messages)


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


class LogValueSanitizationTests(unittest.TestCase):
    def test_neutraliza_saltos_de_linea_y_controles(self) -> None:
        value = sanitize_log_value("/ruta\nERROR-LOG:\tforjado\u202e")

        self.assertNotIn("\n", value)
        self.assertNotIn("\r", value)
        self.assertNotIn("\t", value)
        self.assertNotIn("\u202e", value)
        self.assertIn("ERROR-LOG:", value)

    def test_detalle_de_error_texto_no_inyecta_otra_linea(self) -> None:
        detail = get_error_message(b"fallo\r\nERROR-LOG: falso", truncated=False)

        self.assertNotIn("\r", detail)
        self.assertNotIn("\n", detail)
        self.assertEqual(detail, "fallo ERROR-LOG: falso")


if __name__ == "__main__":
    unittest.main()
