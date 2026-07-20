"""Configuración mínima y no sensible para ejecutar los tests sin un `.env` real."""

import os


def configure_test_environment() -> None:
    """Define valores de prueba solo cuando la variable no existe en el entorno."""
    defaults = {
        "SMTP_SERVER": "smtp.test.local",
        "SMTP_PORT": "587",
        "SMTP_USERNAME": "tests@example.com",
        "SMTP_PASSWORD": "test-password",
        "CONTACT_EMAIL_RECIPIENTS": "general@example.com,operations@example.com",
        "CONTACT_ERROR_EMAIL_RECIPIENTS": "errors@example.com",
        "RECAPTCHA_SECRET_KEY": "test-recaptcha-secret-key",
        # El motor se crea al importar el backend, pero estas pruebas sustituyen las conexiones
        # antes de usarlas y no necesitan una base de datos real disponible.
        "DATABASE_URL": "mysql+aiomysql://tests:tests@127.0.0.1:3306/paraisoweb_tests",
        "secret_key": "test-secret-key-for-paraisoweb-regression-tests",
        "token_interval_seconds": "60",
    }

    for name, value in defaults.items():
        os.environ.setdefault(name, value)


# Configura el entorno al importar este módulo para que los tests mantengan todos los imports arriba.
configure_test_environment()
