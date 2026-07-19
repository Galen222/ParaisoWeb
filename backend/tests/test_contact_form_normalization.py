"""Pruebas de normalización de campos del formulario de contacto."""

import unittest

from pydantic import ValidationError

from backend.models.schemas import ContactForm


class ContactFormNormalizationTests(unittest.TestCase):
    def test_reason_strip_outer_whitespace_without_changing_email(self) -> None:
        form = ContactForm(
            name="María Pérez",
            reason="  informacion  ",
            email="maria@example.com",
            message="Consulta válida",
        )

        self.assertEqual(form.reason, "informacion")
        self.assertEqual(form.email, "maria@example.com")

    def test_email_rejects_outer_whitespace_instead_of_trimming_it(self) -> None:
        with self.assertRaises(ValidationError):
            ContactForm(
                name="María Pérez",
                reason="informacion",
                email="  maria@example.com  ",
                message="Consulta válida",
            )

    def test_message_permite_emojis_compuestos_y_joiners_legitimos(self) -> None:
        message = "Familia 👨‍👩‍👧 y texto con unión: می‌خواهم"
        form = ContactForm(
            name="Ana Pérez",
            reason="informacion",
            email="ana@example.com",
            message=message,
        )
        self.assertEqual(form.message, message)

    def test_message_sigue_rechazando_controles_peligrosos(self) -> None:
        for message in ("texto\x00oculto", "texto\u202eoculto"):
            with self.subTest(message=repr(message)), self.assertRaises(ValidationError):
                ContactForm(
                    name="Ana Pérez",
                    reason="informacion",
                    email="ana@example.com",
                    message=message,
                )


if __name__ == "__main__":
    unittest.main()
