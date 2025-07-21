# backend/core/config.py

"""
core/config.py

Módulo de configuración para la aplicación backend.

Este módulo se encarga de:
- Cargar las variables de entorno necesarias para la aplicación.
- Validar los valores de las variables mediante `BaseSettings` de Pydantic.
- Proveer una instancia de configuración accesible desde toda la aplicación.

Dependencias:
- Pydantic: Para cargar y validar las variables de entorno.
- Pathlib: Para manejar rutas al archivo `.env`.
"""

from pydantic_settings import BaseSettings
from pathlib import Path


class Settings(BaseSettings):
    """
    Clase de configuración que gestiona las variables de entorno de la aplicación.

    Esta clase utiliza `BaseSettings` de Pydantic para:
    - Cargar las variables desde un archivo `.env` o el entorno del sistema.
    - Validar los valores proporcionados.

    Atributos:
        SMTP_SERVER (str): Dirección del servidor SMTP para el envío de correos.
        SMTP_PORT (int): Puerto del servidor SMTP.
        SMTP_USERNAME (str): Nombre de usuario para autenticación SMTP.
        SMTP_PASSWORD (str): Contraseña para autenticación SMTP.
        DATABASE_URL (str): URL de conexión a la base de datos.
        secret_key (str): Clave secreta para operaciones de autenticación y tokens.
        token_interval_seconds (int): Intervalo de tiempo para la validez de los tokens.
    """
    SMTP_SERVER: str
    SMTP_PORT: int
    SMTP_USERNAME: str
    SMTP_PASSWORD: str
    DATABASE_URL: str
    secret_key: str
    token_interval_seconds: int

    model_config = {
        "from_attributes": True,  # Permite inicializar la configuración desde atributos
        "env_file": str(Path(__file__).resolve().parent.parent / ".env")  # Ruta al archivo `.env`
    }


# -----------------------------
# Instancia de configuración
# -----------------------------
settings = Settings() # type: ignore
"""
Instancia global de la clase `Settings`.

Esta instancia:
- Carga automáticamente las variables de entorno desde el archivo `.env` o el sistema.
- Valida las variables según las definiciones de la clase `Settings`.

Se utiliza en toda la aplicación para acceder a las configuraciones de manera centralizada.
"""