"""Validación temprana de reCAPTCHA y autorización del entorno remoto de desarrollo."""

from backend.tests import _environment as _test_environment  # noqa: F401

import unittest
from pathlib import Path

from pydantic import ValidationError

from backend.core.config import Settings


PROJECT_ROOT = Path(__file__).resolve().parents[2]


def valid_settings_values() -> dict[str, object]:
    """Devuelve la configuración mínima válida para comprobar reCAPTCHA aisladamente."""
    return {
        "SMTP_SERVER": "smtp.test.local",
        "SMTP_PORT": 587,
        "SMTP_USERNAME": "tests@example.com",
        "SMTP_PASSWORD": "secret",
        "CONTACT_EMAIL_RECIPIENTS": "general@example.com",
        "CONTACT_ERROR_EMAIL_RECIPIENTS": "errors@example.com",
        "DATABASE_URL": "mysql+aiomysql://u:p@127.0.0.1/db",
        "secret_key": "test-secret-key-with-at-least-32-characters",
        "token_interval_seconds": 60,
        "RECAPTCHA_SECRET_KEY": "clave-real-recaptcha",
    }


class RecaptchaStartupConfigurationTests(unittest.TestCase):
    def test_recaptcha_exige_la_clave_privada_durante_el_arranque(self) -> None:
        self.assertTrue(Settings.model_fields["RECAPTCHA_SECRET_KEY"].is_required())

        for invalid_secret in (
            "",
            "   ",
            "cambiar_por_clave_secreta_de_recaptcha",
            "clave\ninyectada",
        ):
            with self.subTest(secret=repr(invalid_secret)), self.assertRaises(ValidationError):
                Settings.model_validate(
                    valid_settings_values() | {"RECAPTCHA_SECRET_KEY": invalid_secret}
                )

        configured = Settings.model_validate(
            valid_settings_values()
            | {"RECAPTCHA_SECRET_KEY": "  clave-real-recaptcha  "}
        )
        self.assertEqual(configured.RECAPTCHA_SECRET_KEY, "clave-real-recaptcha")

    def test_el_entorno_remoto_de_desarrollo_esta_autorizado_para_cors_y_recaptcha(self) -> None:
        configured = Settings.model_validate(valid_settings_values())
        self.assertIn("https://galenn.asuscomm.com", configured.cors_allowed_origins)
        self.assertIn("galenn.asuscomm.com", configured.recaptcha_allowed_hostnames)

        env_example = (PROJECT_ROOT / "backend" / ".env.example").read_text(encoding="utf-8")
        self.assertIn("https://galenn.asuscomm.com", env_example)
        self.assertIn(
            "RECAPTCHA_ALLOWED_HOSTNAMES=galenn.asuscomm.com,",
            env_example,
        )


if __name__ == "__main__":
    unittest.main()
