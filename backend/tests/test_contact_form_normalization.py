"""Pruebas de normalización de campos del formulario de contacto."""

import unittest

from backend.models.schemas import ContactForm


class ContactFormNormalizationTests(unittest.TestCase):
    def test_email_and_reason_strip_outer_whitespace(self) -> None:
        form = ContactForm(
            name="María Pérez",
            reason="  informacion  ",
            email="  maria@example.com  ",
            message="Consulta válida",
        )

        self.assertEqual(form.reason, "informacion")
        self.assertEqual(str(form.email), "maria@example.com")


if __name__ == "__main__":
    unittest.main()
