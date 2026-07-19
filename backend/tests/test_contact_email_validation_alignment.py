"""Pruebas de las reglas literales del correo del formulario de contacto."""

from backend.tests import _environment as _test_environment  # noqa: F401

import unittest

from pydantic import ValidationError

from backend.models.schemas import ContactEmail, ContactForm, validate_contact_email


VALID_CONTACT_EMAILS = (
    "usuario@example.com",
    "A.B+C@example-domain.es",
    "o'hara@example.com",
    "usuario@xn--bcher-kva.de",
    "usuario@bücher.de",
    "usuario@例子.公司",
    "usuario@παράδειγμα.δοκιμή",
    "usuario@bu\u0308cher.de",
    "usuario@123.example",
    "usuario@example.c3",
)

INVALID_CONTACT_EMAILS = (
    "",
    " usuario@example.com",
    "usuario@example.com ",
    "usuario @example.com",
    "usuario@example .com",
    "Nombre <correo@example.com>",
    '"Nombre" <correo@example.com>',
    "usuario",
    "@example.com",
    "usuario@",
    "usuario@@example.com",
    "用户@example.com",
    '"usuario"@example.com',
    ".usuario@example.com",
    "usuario.@example.com",
    "usu..ario@example.com",
    "usuario@localhost",
    "usuario@.example.com",
    "usuario@example..com",
    "usuario@-example.com",
    "usuario@example-.com",
    "usuario@exam_ple.com",
    "usuario@😀.com",
    "usuario@\u0308example.com",
    "usuario@example-\u0308.com",
    "usuario@example.c",
    "usuario@example.1",
    "usuario@example。com",
    f"{'a' * 65}@example.com",
    f"usuario@{'a' * 64}.com",
)


class ContactEmailValidationAlignmentTests(unittest.TestCase):
    def test_el_formulario_hereda_el_unico_esquema_de_correo(self) -> None:
        self.assertTrue(issubclass(ContactForm, ContactEmail))

    def test_acepta_y_conserva_los_correos_validos(self) -> None:
        for email in VALID_CONTACT_EMAILS:
            with self.subTest(email=email):
                self.assertEqual(validate_contact_email(email), email)
                self.assertEqual(ContactEmail(email=email).email, email)

    def test_rechaza_los_formatos_excluidos(self) -> None:
        for email in INVALID_CONTACT_EMAILS:
            with self.subTest(email=repr(email)):
                with self.assertRaises(ValueError):
                    validate_contact_email(email)
                with self.assertRaises(ValidationError):
                    ContactEmail(email=email)

    def test_el_envio_aplica_las_mismas_reglas_sin_modificar_el_correo(self) -> None:
        form = ContactForm(
            name="Ana Pérez",
            reason="informacion",
            email="Usuario@bücher.de",
            message="Consulta válida",
        )
        self.assertEqual(form.email, "Usuario@bücher.de")

    def test_respeta_los_limites_exactos(self) -> None:
        local_64 = "a" * 64
        label_63 = "b" * 63
        self.assertEqual(
            validate_contact_email(f"{local_64}@{label_63}.com"),
            f"{local_64}@{label_63}.com",
        )

        with self.assertRaises(ValueError):
            validate_contact_email(f"{'a' * 65}@example.com")
        with self.assertRaises(ValueError):
            validate_contact_email(f"usuario@{'b' * 64}.com")


if __name__ == "__main__":
    unittest.main()
