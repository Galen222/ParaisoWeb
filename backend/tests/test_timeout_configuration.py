"""Validación de límites temporales configurables del backend."""

from backend.tests import _environment as _test_environment  # noqa: F401

import unittest

from pydantic import ValidationError

from backend.core.config import Settings


class TimeoutConfigurationTests(unittest.TestCase):
    """Evita configuraciones que desactiven de facto los timeouts."""

    @staticmethod
    def common_settings() -> dict[str, object]:
        return {
            "_env_file": None,
            "SMTP_SERVER": "smtp.test.local",
            "SMTP_PORT": 587,
            "SMTP_USERNAME": "tests@example.com",
            "SMTP_PASSWORD": "secret",
            "DATABASE_URL": "mysql+aiomysql://u:p@127.0.0.1/db",
            "secret_key": "test-secret-key-with-at-least-32-characters",
            "token_interval_seconds": 60,
        }

    def test_los_timeouts_rechazan_infinito(self) -> None:
        for field_name in (
            "DATABASE_STARTUP_TIMEOUT_SECONDS",
            "SMTP_TIMEOUT_SECONDS",
            "HEALTHCHECK_DATABASE_TIMEOUT_SECONDS",
        ):
            with self.subTest(field=field_name), self.assertRaises(ValidationError):
                Settings(**self.common_settings(), **{field_name: float("inf")})

    def test_los_timeouts_finitos_positivos_se_conservan(self) -> None:
        configured = Settings(
            **self.common_settings(),
            DATABASE_STARTUP_TIMEOUT_SECONDS=3.5,
            SMTP_TIMEOUT_SECONDS=7.25,
            HEALTHCHECK_DATABASE_TIMEOUT_SECONDS=1.5,
        )

        self.assertEqual(configured.DATABASE_STARTUP_TIMEOUT_SECONDS, 3.5)
        self.assertEqual(configured.SMTP_TIMEOUT_SECONDS, 7.25)
        self.assertEqual(configured.HEALTHCHECK_DATABASE_TIMEOUT_SECONDS, 1.5)


if __name__ == "__main__":
    unittest.main()
