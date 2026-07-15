"""Pruebas de seguridad para nombres de archivos adjuntos en correo."""

import unittest

from backend.services.email_service import sanitize_attachment_filename


class AttachmentFilenameSafetyTests(unittest.TestCase):
    """Evita nombres engañosos o inválidos en cabeceras MIME."""

    def test_elimina_controles_unicode_y_marcas_bidireccionales(self) -> None:
        filename = "factura.pdf\u202egpj\u200b\n"

        sanitized = sanitize_attachment_filename(filename)

        self.assertEqual(sanitized, "factura.pdfgpj")
        self.assertNotIn("\u202e", sanitized)
        self.assertNotIn("\u200b", sanitized)
        self.assertNotIn("\n", sanitized)

    def test_normaliza_unicode_y_conserva_un_nombre_legitimo(self) -> None:
        filename = "Jose\u0301-curriculum.pdf"

        sanitized = sanitize_attachment_filename(filename)

        self.assertEqual(sanitized, "José-curriculum.pdf")


if __name__ == "__main__":
    unittest.main()
