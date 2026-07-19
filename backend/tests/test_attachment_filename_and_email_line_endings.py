"""Pruebas descriptivas para adjuntos y saltos de línea del correo."""

from io import BytesIO
import unittest

from fastapi import HTTPException, UploadFile

from backend.core.email_templates import contacto_email_template
from backend.services.file_service import FileService


class AttachmentFilenameValidationTests(unittest.IsolatedAsyncioTestCase):
    async def test_rechaza_nombres_de_adjunto_con_controles_o_rutas(self) -> None:
        service = FileService()
        for filename in ("factura\u202efdp.pdf", "carpeta/factura.pdf", " factura.pdf"):
            upload = UploadFile(file=BytesIO(b"%PDF-1.7\n"), filename=filename)
            with self.assertRaises(HTTPException) as raised:
                await service.validate_file_headers(upload)
            self.assertEqual(raised.exception.status_code, 400)


class ContactEmailLineEndingTests(unittest.TestCase):
    def test_el_html_convierte_crlf_y_cr_en_un_unico_salto_visible(self) -> None:
        rendered = contacto_email_template("Ana", "ana@example.com", "otro", "uno\r\ndos\rtres\ncuatro")
        self.assertIn("uno<br>dos<br>tres<br>cuatro", rendered)
        self.assertNotIn("\r", rendered)


if __name__ == "__main__":
    unittest.main()
