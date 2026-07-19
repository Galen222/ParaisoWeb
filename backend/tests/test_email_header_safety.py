"""Pruebas de seguridad para nombres de archivos adjuntos en correo."""

import unittest

from backend.services.email_service import mask_email_for_log, sanitize_attachment_filename


class AttachmentFilenameSafetyTests(unittest.TestCase):
    """Evita nombres engañosos o inválidos en cabeceras MIME."""

    def test_elimina_controles_unicode_y_marcas_bidireccionales(self) -> None:
        filename = "factura.pdf\u202egpj\u200b\n"

        sanitized = sanitize_attachment_filename(filename)

        self.assertEqual(sanitized, "factura.pdfgpj")
        self.assertNotIn("\u202e", sanitized)
        self.assertNotIn("\u200b", sanitized)
        self.assertNotIn("\n", sanitized)

    def test_elimina_separadores_unicode_del_nombre_del_adjunto(self) -> None:
        filename = "factura\u2028julio\u2029.pdf"

        sanitized = sanitize_attachment_filename(filename)

        self.assertEqual(sanitized, "facturajulio.pdf")
        self.assertNotIn("\u2028", sanitized)
        self.assertNotIn("\u2029", sanitized)

    def test_elimina_separadores_de_espacio_unicode_sin_borrar_el_espacio_normal(self) -> None:
        filename = "factura\u00a0julio\u2007 final.pdf"

        sanitized = sanitize_attachment_filename(filename)

        self.assertEqual(sanitized, "facturajulio final.pdf")

    def test_normaliza_unicode_y_conserva_un_nombre_legitimo(self) -> None:
        filename = "Jose\u0301-curriculum.pdf"

        sanitized = sanitize_attachment_filename(filename)

        self.assertEqual(sanitized, "José-curriculum.pdf")


class EmailLogMaskingTests(unittest.TestCase):
    """Evita que los logs revelen subdominios u organizaciones del remitente."""

    def test_enmascara_todas_las_etiquetas_salvo_el_sufijo_final(self) -> None:
        masked = mask_email_for_log("john@department.example.com")

        self.assertEqual(masked, "j**n@d********t.e*****e.com")
        self.assertNotIn("department", masked)
        self.assertNotIn("example", masked)

    def test_mantiene_el_formato_existente_para_un_dominio_simple(self) -> None:
        self.assertEqual(mask_email_for_log("john@example.com"), "j**n@e*****e.com")


if __name__ == "__main__":
    unittest.main()
