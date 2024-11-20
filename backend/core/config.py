# backend/core/config.py

"""
Módulo de configuración para la aplicación backend.
Gestiona la carga y validación de las variables de entorno necesarias para la aplicación.
"""

from pydantic_settings import BaseSettings
from pathlib import Path


class Settings(BaseSettings):
    """
    Clase de configuración que extiende `BaseSettings` de Pydantic.
    Define y valida las variables de entorno necesarias para la aplicación.
    """
    SMTP_SERVER: str        # Dirección del servidor SMTP para el envío de correos electrónicos.
    SMTP_PORT: int           # Puerto del servidor SMTP.
    SMTP_USERNAME: str      # Nombre de usuario para autenticarse en el servidor SMTP.
    SMTP_PASSWORD: str      # Contraseña para autenticarse en el servidor SMTP.
    DATABASE_URL: str       # URL de conexión a la base de datos.
    secret_key: str         # Clave secreta para la aplicación.
    token_interval_seconds: int  # Intervalo de tiempo para tokens.

    model_config = {
        "from_attributes": True,
        "env_file": str(Path(__file__).resolve().parent.parent / ".env")
    }

# -----------------------------
# Instancia de configuración
# -----------------------------
# Crea una instancia de la clase `Settings`, lo que desencadena la carga y validación
# de las variables de entorno definidas.
settings = Settings()
