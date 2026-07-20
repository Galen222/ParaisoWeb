"""Constructores tipados de configuración usados únicamente por las pruebas."""

from backend.core.config import Settings


_DEFAULT_TEST_SETTINGS: dict[str, object] = {
    "SMTP_SERVER": "smtp.test.local",
    "SMTP_PORT": 587,
    "SMTP_USERNAME": "tests@example.com",
    "SMTP_PASSWORD": "secret",
    "CONTACT_EMAIL_RECIPIENTS": "general@example.com,operations@example.com",
    "CONTACT_ERROR_EMAIL_RECIPIENTS": "errors@example.com",
    "DATABASE_URL": "mysql+aiomysql://u:p@127.0.0.1/db",
    "secret_key": "test-secret-key-with-at-least-32-characters",
    "token_interval_seconds": 60,
    "RECAPTCHA_SECRET_KEY": "test-recaptcha-secret-key",
}


def build_test_settings(**overrides: object) -> Settings:
    """Valida datos dinámicos sin forzar a Pyright a inferir un tipo común erróneo."""
    values = _DEFAULT_TEST_SETTINGS | overrides
    values.pop("_env_file", None)
    return Settings.model_validate(values)
