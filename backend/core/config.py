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

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings
from pathlib import Path
from typing import Literal
from urllib.parse import urlsplit


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
        GLOBAL_RATE_LIMIT_REQUESTS (int): Solicitudes totales permitidas por cliente y ventana.
        GLOBAL_RATE_LIMIT_WINDOW_SECONDS (int): Duración de la ventana global.
        STATUS_RATE_LIMIT_REQUESTS (int): Consultas permitidas a health y livez por ventana.
        STATUS_RATE_LIMIT_WINDOW_SECONDS (int): Duración de la ventana de estado.
        READ_RATE_LIMIT_REQUESTS (int): Lecturas permitidas por endpoint y ventana.
        READ_RATE_LIMIT_WINDOW_SECONDS (int): Duración de la ventana de lecturas.
        SITEMAP_RATE_LIMIT_REQUESTS (int): Consultas permitidas al origen de datos del sitemap.
        SITEMAP_RATE_LIMIT_WINDOW_SECONDS (int): Duración de la ventana del sitemap.
        CONTACT_RATE_LIMIT_REQUESTS (int): Envíos permitidos al formulario por ventana.
        CONTACT_RATE_LIMIT_WINDOW_SECONDS (int): Duración de la ventana del formulario.
        TOKEN_RATE_LIMIT_REQUESTS (int): Solicitudes permitidas de token por ventana.
        TOKEN_RATE_LIMIT_WINDOW_SECONDS (int): Duración de la ventana de tokens.
        CONTACT_MAX_REQUEST_BYTES (int): Tamaño máximo del cuerpo multipart de contacto.
        DATABASE_STARTUP_TIMEOUT_SECONDS (float): Tiempo máximo para inicializar MySQL.
        SMTP_TIMEOUT_SECONDS (float): Tiempo máximo de conexión y envío SMTP.
        SMTP_TLS_MODE (str): Modo TLS SMTP: starttls, tls o none.
        HEALTHCHECK_DATABASE_TIMEOUT_SECONDS (float): Tiempo máximo de comprobación de MySQL.
        CORS_ALLOWED_ORIGINS (str): Orígenes frontend autorizados, separados por comas.
        TRUSTED_PROXY_IPS (str): Proxies autorizados para aportar X-Forwarded-For.
    """
    SMTP_SERVER: str
    SMTP_PORT: int
    SMTP_USERNAME: str
    SMTP_PASSWORD: str
    DATABASE_URL: str
    secret_key: str
    token_interval_seconds: int = Field(gt=0)
    GLOBAL_RATE_LIMIT_REQUESTS: int = Field(default=300, gt=0)
    GLOBAL_RATE_LIMIT_WINDOW_SECONDS: int = Field(default=60, gt=0)
    STATUS_RATE_LIMIT_REQUESTS: int = Field(default=120, gt=0)
    STATUS_RATE_LIMIT_WINDOW_SECONDS: int = Field(default=60, gt=0)
    READ_RATE_LIMIT_REQUESTS: int = Field(default=120, gt=0)
    READ_RATE_LIMIT_WINDOW_SECONDS: int = Field(default=60, gt=0)
    SITEMAP_RATE_LIMIT_REQUESTS: int = Field(default=12, gt=0)
    SITEMAP_RATE_LIMIT_WINDOW_SECONDS: int = Field(default=60, gt=0)
    CONTACT_RATE_LIMIT_REQUESTS: int = Field(default=5, gt=0)
    CONTACT_RATE_LIMIT_WINDOW_SECONDS: int = Field(default=600, gt=0)
    TOKEN_RATE_LIMIT_REQUESTS: int = Field(default=120, gt=0)
    TOKEN_RATE_LIMIT_WINDOW_SECONDS: int = Field(default=60, gt=0)
    CONTACT_MAX_REQUEST_BYTES: int = Field(default=11 * 1024 * 1024, gt=0)
    DATABASE_STARTUP_TIMEOUT_SECONDS: float = Field(default=10.0, gt=0)
    SMTP_TIMEOUT_SECONDS: float = Field(default=15.0, gt=0)
    SMTP_TLS_MODE: Literal["starttls", "tls", "none"] = "starttls"
    HEALTHCHECK_DATABASE_TIMEOUT_SECONDS: float = Field(default=2.0, gt=0)
    CORS_ALLOWED_ORIGINS: str = (
        "http://localhost:3000,https://galenn.asuscomm.com,"
        "http://paraisodeljamon.com,https://paraisodeljamon.com,"
        "http://www.paraisodeljamon.com,https://www.paraisodeljamon.com"
    )
    TRUSTED_PROXY_IPS: str = "127.0.0.1,::1"

    @field_validator("CORS_ALLOWED_ORIGINS")
    @classmethod
    def validate_cors_allowed_origins(cls, value: str) -> str:
        """Rechaza orígenes CORS ambiguos o incompatibles con credenciales."""
        origins = [origin.strip().rstrip("/") for origin in value.split(",") if origin.strip()]
        if not origins:
            raise ValueError("CORS_ALLOWED_ORIGINS debe contener al menos un origen")

        for origin in origins:
            if origin == "*":
                raise ValueError("CORS_ALLOWED_ORIGINS no puede usar '*' con credenciales")

            parsed = urlsplit(origin)
            if (
                parsed.scheme not in {"http", "https"}
                or not parsed.netloc
                or parsed.username is not None
                or parsed.password is not None
                or parsed.path not in {"", "/"}
                or parsed.query
                or parsed.fragment
            ):
                raise ValueError(f"Origen CORS no válido: {origin}")

        return ",".join(dict.fromkeys(origins))

    @property
    def cors_allowed_origins(self) -> list[str]:
        """Devuelve orígenes CORS normalizados y sin duplicados."""
        return [origin for origin in self.CORS_ALLOWED_ORIGINS.split(",") if origin]

    @property
    def trusted_proxy_ips(self) -> set[str]:
        """Devuelve los proxies configurados sin aceptar entradas vacías."""
        return {value.strip() for value in self.TRUSTED_PROXY_IPS.split(",") if value.strip()}

    model_config = {
        "from_attributes": True,  # Permite inicializar la configuración desde atributos
        "env_file": str(Path(__file__).resolve().parent.parent / ".env")  # Ruta al archivo `.env`
    }


# Instancia de configuración
"""
Instancia global de la clase `Settings`.

Esta instancia:
- Carga automáticamente las variables de entorno desde el archivo `.env` o el sistema.
- Valida las variables según las definiciones de la clase `Settings`.

Se utiliza en toda la aplicación para acceder a las configuraciones de manera centralizada.
"""
settings = Settings() # type: ignore