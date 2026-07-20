"""Constructores tipados de configuración usados únicamente por las pruebas."""

from pydantic_core import PydanticUndefined

from backend.core.config import Settings


def _default_test_settings() -> dict[str, object]:
    """Fija los defaults del modelo para que el `.env` real no contamine los tests."""
    values: dict[str, object] = {}
    for name, field in Settings.model_fields.items():
        if field.default is not PydanticUndefined:
            values[name] = field.default
    return values


_DEFAULT_TEST_SETTINGS: dict[str, object] = {
    **_default_test_settings(),
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
    """Valida datos dinámicos sin cargar valores del `.env` real del proyecto."""
    values = _DEFAULT_TEST_SETTINGS | overrides
    values.pop("_env_file", None)
    return Settings.model_validate(values)
