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

from pydantic import EmailStr, Field, field_validator
from pydantic_settings import BaseSettings
from ipaddress import IPv6Address, ip_address
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
        DATABASE_ECHO_SQL (bool): Activa el log detallado de consultas SQL solo para diagnóstico.
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
        ENABLE_API_DOCS (bool): Habilita OpenAPI, Swagger UI y ReDoc de forma explícita.
    """
    SMTP_SERVER: str
    SMTP_PORT: int = Field(ge=1, le=65535)
    SMTP_USERNAME: EmailStr
    SMTP_PASSWORD: str
    DATABASE_URL: str
    DATABASE_ECHO_SQL: bool = False
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
    ENABLE_API_DOCS: bool = False

    @field_validator("SMTP_SERVER")
    @classmethod
    def validate_smtp_server(cls, value: str) -> str:
        """Normaliza el host SMTP y rechaza URLs, puertos y nombres inválidos."""
        normalized = value.strip()
        if not normalized or any(character.isspace() for character in normalized):
            raise ValueError("SMTP_SERVER debe contener un host sin espacios")

        # Las direcciones IP literales son válidas, incluidas IPv6. Para nombres DNS,
        # se rechazan esquemas, credenciales, puertos y etiquetas no válidas antes de
        # que aiosmtplib falle durante el primer envío.
        try:
            return str(ip_address(normalized))
        except ValueError:
            pass

        candidate = normalized[:-1] if normalized.endswith(".") else normalized
        try:
            ascii_host = candidate.encode("idna").decode("ascii")
        except UnicodeError as error:
            raise ValueError("SMTP_SERVER no contiene un nombre de host válido") from error

        labels = ascii_host.split(".")
        if (
            len(ascii_host) > 253
            or not labels
            or any(
                not label
                or len(label) > 63
                or label.startswith("-")
                or label.endswith("-")
                or any(not (character.isalnum() or character == "-") for character in label)
                for label in labels
            )
        ):
            raise ValueError("SMTP_SERVER no contiene un nombre de host válido")

        return f"{ascii_host}." if normalized.endswith(".") else ascii_host

    @field_validator("SMTP_PASSWORD")
    @classmethod
    def validate_smtp_password(cls, value: str) -> str:
        """Evita aceptar una contraseña vacía que solo fallaría al enviar el correo."""
        if value == "":
            raise ValueError("SMTP_PASSWORD no puede estar vacía")
        return value

    @field_validator("secret_key")
    @classmethod
    def validate_secret_key(cls, value: str) -> str:
        """Exige una clave HMAC suficientemente larga y elimina espacios accidentales."""
        normalized = value.strip()
        if len(normalized) < 32:
            raise ValueError("secret_key debe contener al menos 32 caracteres")
        return normalized

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


    @field_validator("TRUSTED_PROXY_IPS")
    @classmethod
    def validate_trusted_proxy_ips(cls, value: str) -> str:
        """Acepta únicamente direcciones IP literales y normaliza duplicados."""
        normalized_values: list[str] = []
        for raw_value in value.split(","):
            candidate = raw_value.strip()
            if not candidate:
                continue

            try:
                parsed = ip_address(candidate)
            except ValueError as error:
                raise ValueError(
                    f"TRUSTED_PROXY_IPS contiene una dirección IP no válida: {candidate}"
                ) from error

            if isinstance(parsed, IPv6Address) and parsed.ipv4_mapped is not None:
                normalized = str(parsed.ipv4_mapped)
            else:
                normalized = str(parsed)

            if normalized not in normalized_values:
                normalized_values.append(normalized)

        return ",".join(normalized_values)

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