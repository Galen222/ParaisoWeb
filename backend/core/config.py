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

import math
from ipaddress import IPv6Address, ip_address
from pathlib import Path
from typing import Literal
from urllib.parse import urlsplit

from pydantic import EmailStr, Field, field_validator
from pydantic_settings import BaseSettings
from sqlalchemy.engine import make_url
from sqlalchemy.exc import ArgumentError


EXAMPLE_SMTP_SERVER = "smtp.example.com"
EXAMPLE_SMTP_USERNAME = "usuario@example.com"
EXAMPLE_SMTP_PASSWORD = "cambiar_por_secreto"
EXAMPLE_DATABASE_USERNAME = "usuario"
EXAMPLE_DATABASE_PASSWORD = "contrasena"
EXAMPLE_SECRET_KEY = "cambiar_por_una_clave_aleatoria_de_32_caracteres_o_mas"
MIN_CONTACT_REQUEST_BYTES = 11 * 1024 * 1024


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
    CONTACT_MAX_REQUEST_BYTES: int = Field(
        default=MIN_CONTACT_REQUEST_BYTES,
        ge=MIN_CONTACT_REQUEST_BYTES,
    )
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

    @field_validator(
        "DATABASE_STARTUP_TIMEOUT_SECONDS",
        "SMTP_TIMEOUT_SECONDS",
        "HEALTHCHECK_DATABASE_TIMEOUT_SECONDS",
    )
    @classmethod
    def validate_finite_timeout(cls, value: float) -> float:
        """Rechaza infinito y NaN para que los límites de espera sigan siendo efectivos."""
        if not math.isfinite(value):
            raise ValueError("Los tiempos máximos deben ser números finitos")
        return value

    @field_validator("SMTP_SERVER")
    @classmethod
    def validate_smtp_server(cls, value: str) -> str:
        """Normaliza el host SMTP y rechaza URLs, puertos y nombres inválidos."""
        normalized = value.strip()
        if not normalized or any(character.isspace() for character in normalized):
            raise ValueError("SMTP_SERVER debe contener un host sin espacios")
        if normalized.lower().rstrip(".") == EXAMPLE_SMTP_SERVER:
            raise ValueError("SMTP_SERVER debe sustituir el valor del archivo .env.example")

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

    @field_validator("SMTP_USERNAME")
    @classmethod
    def validate_smtp_username(cls, value: EmailStr) -> EmailStr:
        """Evita arrancar con la cuenta pública usada únicamente como ejemplo."""
        if str(value).lower() == EXAMPLE_SMTP_USERNAME:
            raise ValueError("SMTP_USERNAME debe sustituir el valor del archivo .env.example")
        return value

    @field_validator("SMTP_PASSWORD")
    @classmethod
    def validate_smtp_password(cls, value: str) -> str:
        """Evita aceptar una contraseña vacía o el valor público del archivo de ejemplo."""
        normalized = value.strip()
        if not normalized:
            raise ValueError("SMTP_PASSWORD no puede estar vacía")
        if normalized == EXAMPLE_SMTP_PASSWORD:
            raise ValueError("SMTP_PASSWORD debe sustituir el valor del archivo .env.example")
        return value


    @field_validator("DATABASE_URL")
    @classmethod
    def validate_database_url(cls, value: str) -> str:
        """Exige la URL asíncrona que utiliza el motor y una base de datos concreta."""
        normalized = value.strip()
        if not normalized:
            raise ValueError("DATABASE_URL no puede estar vacía")

        try:
            parsed = make_url(normalized)
        except (ArgumentError, TypeError, ValueError) as error:
            raise ValueError("DATABASE_URL no contiene una URL de conexión válida") from error

        if parsed.drivername != "mysql+aiomysql":
            raise ValueError("DATABASE_URL debe usar el driver asíncrono mysql+aiomysql")
        if not parsed.database:
            raise ValueError("DATABASE_URL debe incluir el nombre de la base de datos")
        if parsed.username == EXAMPLE_DATABASE_USERNAME or parsed.password == EXAMPLE_DATABASE_PASSWORD:
            raise ValueError("DATABASE_URL debe sustituir las credenciales del archivo .env.example")

        return normalized

    @field_validator("secret_key")
    @classmethod
    def validate_secret_key(cls, value: str) -> str:
        """Exige una clave HMAC real, suficientemente larga, y elimina espacios accidentales."""
        normalized = value.strip()
        if len(normalized) < 32:
            raise ValueError("secret_key debe contener al menos 32 caracteres")
        if normalized == EXAMPLE_SECRET_KEY:
            raise ValueError("secret_key debe sustituir el valor público del archivo .env.example")
        return normalized

    @field_validator("CORS_ALLOWED_ORIGINS")
    @classmethod
    def validate_cors_allowed_origins(cls, value: str) -> str:
        """Valida y normaliza orígenes CORS para que coincidan con el formato del navegador."""
        raw_origins = [origin.strip() for origin in value.split(",") if origin.strip()]
        if not raw_origins:
            raise ValueError("CORS_ALLOWED_ORIGINS debe contener al menos un origen")

        normalized_origins: list[str] = []
        for origin in raw_origins:
            if origin == "*":
                raise ValueError("CORS_ALLOWED_ORIGINS no puede usar '*' con credenciales")

            try:
                parsed = urlsplit(origin)
                port = parsed.port
            except ValueError as error:
                raise ValueError(f"Origen CORS no válido: {origin}") from error

            if (
                parsed.scheme.lower() not in {"http", "https"}
                or not parsed.netloc
                or parsed.hostname is None
                or parsed.username is not None
                or parsed.password is not None
                or parsed.path not in {"", "/"}
                or parsed.query
                or parsed.fragment
            ):
                raise ValueError(f"Origen CORS no válido: {origin}")

            hostname = parsed.hostname
            try:
                parsed_ip = ip_address(hostname)
                normalized_host = (
                    f"[{parsed_ip.compressed}]" if isinstance(parsed_ip, IPv6Address) else str(parsed_ip)
                )
            except ValueError:
                candidate = hostname[:-1] if hostname.endswith(".") else hostname
                try:
                    ascii_host = candidate.encode("idna").decode("ascii").lower()
                except UnicodeError as error:
                    raise ValueError(f"Origen CORS no válido: {origin}") from error

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
                    raise ValueError(f"Origen CORS no válido: {origin}")
                normalized_host = f"{ascii_host}." if hostname.endswith(".") else ascii_host

            scheme = parsed.scheme.lower()
            default_port = 80 if scheme == "http" else 443
            port_suffix = "" if port is None or port == default_port else f":{port}"
            normalized_origin = f"{scheme}://{normalized_host}{port_suffix}"
            if normalized_origin not in normalized_origins:
                normalized_origins.append(normalized_origin)

        return ",".join(normalized_origins)


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