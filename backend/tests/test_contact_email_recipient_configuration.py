"""Pruebas de destinatarios configurables para el formulario de contacto."""

from backend.tests import _environment as _test_environment  # noqa: F401

import unittest
from unittest.mock import AsyncMock, patch

from pydantic import ValidationError

from backend.core.config import Settings
from backend.services.email_service import EmailService


class ContactEmailRecipientSettingsTests(unittest.TestCase):
    @staticmethod
    def build_settings(**overrides: object) -> Settings:
        """Valida una configuración mínima sin depender del `.env` real."""
        values: dict[str, object] = {
            "SMTP_SERVER": "smtp.test.local",
            "SMTP_PORT": 587,
            "SMTP_USERNAME": "tests@example.com",
            "SMTP_PASSWORD": "secret",
            "CONTACT_EMAIL_RECIPIENTS": "general@example.com",
            "CONTACT_ERROR_EMAIL_RECIPIENTS": "errors@example.com",
            "DATABASE_URL": "mysql+aiomysql://u:p@127.0.0.1/db",
            "secret_key": "test-secret-key-with-at-least-32-characters",
            "token_interval_seconds": 60,
        }
        values.update(overrides)
        return Settings.model_validate(values)

    def test_los_destinatarios_se_normalizan_y_eliminan_duplicados(self) -> None:
        configured = self.build_settings(
            CONTACT_EMAIL_RECIPIENTS=(
                " ventas@example.com,soporte@example.com,ventas@example.com "
            ),
            CONTACT_ERROR_EMAIL_RECIPIENTS=" incidencias@example.com ",
        )

        self.assertEqual(
            configured.contact_email_recipients,
            ["ventas@example.com", "soporte@example.com"],
        )
        self.assertEqual(
            configured.contact_error_email_recipients,
            ["incidencias@example.com"],
        )

    def test_los_destinatarios_rechazan_listas_vacias_correos_invalidos_e_inyeccion(self) -> None:
        for invalid_value in (
            "",
            "   ",
            ",",
            "correo-no-valido",
            "correcto@example.com,",
            "correcto@example.com\nBcc: atacante@example.com",
        ):
            with self.subTest(value=repr(invalid_value)), self.assertRaises(ValidationError):
                self.build_settings(CONTACT_EMAIL_RECIPIENTS=invalid_value)


class ContactEmailRoutingTests(unittest.IsolatedAsyncioTestCase):
    async def test_el_motivo_error_y_los_demás_motivos_usan_sus_destinatarios_configurados(self) -> None:
        service = EmailService()
        service.contact_email_recipients = ["general@example.com", "copia@example.com"]
        service.contact_error_email_recipients = ["incidencias@example.com"]

        with patch("backend.services.email_service.aiosmtplib.send", new=AsyncMock()) as send_mock:
            await service.send_contact_email(
                name="Ana",
                reason="informacion",
                email="ana@example.com",
                message="Consulta general",
            )
            await service.send_contact_email(
                name="Ana",
                reason="error",
                email="ana@example.com",
                message="Incidencia",
            )
        general_message = send_mock.await_args_list[0].args[0]
        error_message = send_mock.await_args_list[1].args[0]

        self.assertEqual(str(general_message["To"]), "general@example.com, copia@example.com")
        self.assertEqual(str(error_message["To"]), "incidencias@example.com")


if __name__ == "__main__":
    unittest.main()
