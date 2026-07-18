"""Pruebas de configuración, ejemplos de entorno y transporte SMTP/CORS."""

from backend.tests import _environment as _test_environment  # noqa: F401

import re
import unittest
from pathlib import Path
from unittest.mock import AsyncMock, patch

from pydantic import ValidationError

from backend.core.config import Settings
from backend.services.email_service import EmailService


PROJECT_ROOT = Path(__file__).resolve().parents[2]


def read_env_example_names(path: Path) -> set[str]:
    """Obtiene nombres definidos en un archivo .env.example."""
    names: set[str] = set()
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        names.add(line.split("=", 1)[0].strip())
    return names


def env_variables_without_explanatory_comment(path: Path) -> set[str]:
    """Detecta asignaciones que no tienen un comentario inmediatamente anterior."""
    missing: set[str] = set()
    previous_non_empty = ""
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line:
            previous_non_empty = ""
            continue
        if line.startswith("#"):
            previous_non_empty = line
            continue
        if "=" in line:
            name = line.split("=", 1)[0].strip()
            if not previous_non_empty.startswith("#"):
                missing.add(name)
        previous_non_empty = line
    return missing


class EnvironmentExampleTests(unittest.TestCase):
    def test_backend_env_example_documenta_todos_los_settings(self) -> None:
        documented = read_env_example_names(PROJECT_ROOT / "backend" / ".env.example")
        expected = set(Settings.model_fields)
        self.assertEqual(expected - documented, set())

    def test_frontend_env_example_documenta_todas_las_variables_publicas_usadas(self) -> None:
        frontend_root = PROJECT_ROOT / "frontend"
        documented = read_env_example_names(frontend_root / ".env.example")
        pattern = re.compile(r"process\.env\.((?:NEXT_PUBLIC_|SITEMAP_)[A-Z0-9_]+)")
        referenced: set[str] = set()

        for path in (frontend_root / "src").rglob("*"):
            if path.suffix not in {".ts", ".tsx"}:
                continue
            referenced.update(pattern.findall(path.read_text(encoding="utf-8")))

        self.assertEqual(referenced - documented, set())

    def test_cada_variable_de_entorno_tiene_un_comentario_explicativo(self) -> None:
        for relative_path in ("backend/.env.example", "frontend/.env.example"):
            with self.subTest(path=relative_path):
                self.assertEqual(
                    env_variables_without_explanatory_comment(PROJECT_ROOT / relative_path),
                    set(),
                )

    def test_el_log_sql_esta_desactivado_por_defecto_y_puede_activarse(self) -> None:
        common = {
            "_env_file": None,
            "SMTP_SERVER": "smtp.test.local",
            "SMTP_PORT": 587,
            "SMTP_USERNAME": "tests@example.com",
            "SMTP_PASSWORD": "secret",
            "DATABASE_URL": "mysql+aiomysql://u:p@127.0.0.1/db",
            "secret_key": "test-secret-key-with-at-least-32-characters",
            "token_interval_seconds": 60,
        }

        self.assertFalse(Settings(**common).DATABASE_ECHO_SQL)
        self.assertTrue(Settings(**common, DATABASE_ECHO_SQL=True).DATABASE_ECHO_SQL)


    def test_database_url_rechaza_valores_vacios_drivers_sincronos_y_base_ausente(self) -> None:
        common = {
            "_env_file": None,
            "SMTP_SERVER": "smtp.test.local",
            "SMTP_PORT": 587,
            "SMTP_USERNAME": "tests@example.com",
            "SMTP_PASSWORD": "secret",
            "secret_key": "test-secret-key-with-at-least-32-characters",
            "token_interval_seconds": 60,
        }

        invalid_urls = (
            "",
            "   ",
            "mysql://u:p@127.0.0.1/db",
            "mysql+pymysql://u:p@127.0.0.1/db",
            "mysql+aiomysql://u:p@127.0.0.1",
        )
        for invalid_url in invalid_urls:
            with self.subTest(database_url=repr(invalid_url)), self.assertRaises(ValidationError):
                Settings(**common, DATABASE_URL=invalid_url)

        configured = Settings(
            **common,
            DATABASE_URL="  mysql+aiomysql://u:p@127.0.0.1/db  ",
        )
        self.assertEqual(configured.DATABASE_URL, "mysql+aiomysql://u:p@127.0.0.1/db")

    def test_database_url_exige_servidor_y_usuario(self) -> None:
        common = {
            "_env_file": None,
            "SMTP_SERVER": "smtp.test.local",
            "SMTP_PORT": 587,
            "SMTP_USERNAME": "tests@example.com",
            "SMTP_PASSWORD": "secret",
            "secret_key": "test-secret-key-with-at-least-32-characters",
            "token_interval_seconds": 60,
        }

        for invalid_url in (
            "mysql+aiomysql:///db",
            "mysql+aiomysql://tests@/db",
            "mysql+aiomysql://@127.0.0.1/db",
        ):
            with self.subTest(database_url=invalid_url), self.assertRaises(ValidationError):
                Settings(**common, DATABASE_URL=invalid_url)

    def test_database_url_rechaza_servidor_y_puerto_no_validos(self) -> None:
        common = {
            "_env_file": None,
            "SMTP_SERVER": "smtp.test.local",
            "SMTP_PORT": 587,
            "SMTP_USERNAME": "tests@example.com",
            "SMTP_PASSWORD": "secret",
            "secret_key": "test-secret-key-with-at-least-32-characters",
            "token_interval_seconds": 60,
        }

        for invalid_url in (
            "mysql+aiomysql://tests:secret@host con espacios/db",
            "mysql+aiomysql://tests:secret@-mysql.example.com/db",
            "mysql+aiomysql://tests:secret@127.0.0.1:65536/db",
            "mysql+aiomysql://tests:secret@127.0.0.1:abc/db",
        ):
            with self.subTest(database_url=invalid_url), self.assertRaises(ValidationError):
                Settings(**common, DATABASE_URL=invalid_url)

        configured = Settings(
            **common,
            DATABASE_URL="mysql+aiomysql://tests:secret@[::1]:3306/db",
        )
        self.assertEqual(configured.DATABASE_URL, "mysql+aiomysql://tests:secret@[::1]:3306/db")

    def test_secret_key_rechaza_valores_cortos_y_recorta_espacios(self) -> None:
        common = {
            "_env_file": None,
            "SMTP_SERVER": "smtp.test.local",
            "SMTP_PORT": 587,
            "SMTP_USERNAME": "tests@example.com",
            "SMTP_PASSWORD": "secret",
            "DATABASE_URL": "mysql+aiomysql://u:p@127.0.0.1/db",
            "token_interval_seconds": 60,
        }

        with self.assertRaises(ValidationError):
            Settings(**common, secret_key="demasiado-corta")
        with self.assertRaises(ValidationError):
            Settings(
                **common,
                secret_key="cambiar_por_una_clave_aleatoria_de_32_caracteres_o_mas",
            )

        expected = "a" * 32
        configured = Settings(**common, secret_key=f"  {expected}  ")
        self.assertEqual(configured.secret_key, expected)

    def test_smtp_rechaza_puertos_fuera_del_rango_tcp(self) -> None:
        common = {
            "_env_file": None,
            "SMTP_SERVER": "smtp.test.local",
            "SMTP_USERNAME": "tests@example.com",
            "SMTP_PASSWORD": "secret",
            "DATABASE_URL": "mysql+aiomysql://u:p@127.0.0.1/db",
            "secret_key": "test-secret-key-with-at-least-32-characters",
            "token_interval_seconds": 60,
        }

        for invalid_port in (0, 65536):
            with self.subTest(port=invalid_port), self.assertRaises(ValidationError):
                Settings(**common, SMTP_PORT=invalid_port)

    def test_smtp_rechaza_host_o_remitente_no_validos(self) -> None:
        common = {
            "_env_file": None,
            "SMTP_PORT": 587,
            "SMTP_PASSWORD": "secret",
            "DATABASE_URL": "mysql+aiomysql://u:p@127.0.0.1/db",
            "secret_key": "test-secret-key-with-at-least-32-characters",
            "token_interval_seconds": 60,
        }

        with self.assertRaises(ValidationError):
            Settings(**common, SMTP_SERVER="smtp.test.local\nmalicioso", SMTP_USERNAME="tests@example.com")
        with self.assertRaises(ValidationError):
            Settings(**common, SMTP_SERVER="smtp.test.local", SMTP_USERNAME="no-es-un-correo")

        configured = Settings(
            **common,
            SMTP_SERVER="  smtp.test.local  ",
            SMTP_USERNAME="tests@example.com",
        )
        self.assertEqual(configured.SMTP_SERVER, "smtp.test.local")
        self.assertEqual(str(configured.SMTP_USERNAME), "tests@example.com")

    def test_smtp_rechaza_url_puerto_y_password_vacia(self) -> None:
        common = {
            "_env_file": None,
            "SMTP_PORT": 587,
            "SMTP_USERNAME": "tests@example.com",
            "DATABASE_URL": "mysql+aiomysql://u:p@127.0.0.1/db",
            "secret_key": "test-secret-key-with-at-least-32-characters",
            "token_interval_seconds": 60,
        }

        for invalid_host in ("https://smtp.test.local", "smtp.test.local:587"):
            with self.subTest(host=invalid_host), self.assertRaises(ValidationError):
                Settings(
                    **common,
                    SMTP_SERVER=invalid_host,
                    SMTP_PASSWORD="secret",
                )

        for invalid_password in ("", "   ", "\t\n", "cambiar_por_secreto"):
            with self.subTest(password=repr(invalid_password)), self.assertRaises(ValidationError):
                Settings(
                    **common,
                    SMTP_SERVER="smtp.test.local",
                    SMTP_PASSWORD=invalid_password,
                )

        configured = Settings(
            **common,
            SMTP_SERVER="2001:db8::1",
            SMTP_PASSWORD=" secret con espacios ",
        )
        self.assertEqual(configured.SMTP_SERVER, "2001:db8::1")
        self.assertEqual(configured.SMTP_PASSWORD, " secret con espacios ")

    def test_rechaza_valores_publicos_del_env_example_que_no_son_configuracion_real(self) -> None:
        common = {
            "_env_file": None,
            "SMTP_SERVER": "smtp.test.local",
            "SMTP_PORT": 587,
            "SMTP_USERNAME": "tests@example.com",
            "SMTP_PASSWORD": "secret",
            "DATABASE_URL": "mysql+aiomysql://tests:secret@127.0.0.1/db",
            "secret_key": "test-secret-key-with-at-least-32-characters",
            "token_interval_seconds": 60,
        }

        invalid_overrides = (
            {"SMTP_SERVER": "smtp.example.com"},
            {"SMTP_USERNAME": "usuario@example.com"},
            {"DATABASE_URL": "mysql+aiomysql://usuario:secret@127.0.0.1/db"},
            {"DATABASE_URL": "mysql+aiomysql://tests:contrasena@127.0.0.1/db"},
        )
        for overrides in invalid_overrides:
            with self.subTest(overrides=overrides), self.assertRaises(ValidationError):
                Settings(**(common | overrides))

    def test_tamano_multipart_no_puede_ser_inferior_al_adjunto_permitido(self) -> None:
        common = {
            "_env_file": None,
            "SMTP_SERVER": "smtp.test.local",
            "SMTP_PORT": 587,
            "SMTP_USERNAME": "tests@example.com",
            "SMTP_PASSWORD": "secret",
            "DATABASE_URL": "mysql+aiomysql://tests:secret@127.0.0.1/db",
            "secret_key": "test-secret-key-with-at-least-32-characters",
            "token_interval_seconds": 60,
        }

        with self.assertRaises(ValidationError):
            Settings(**common, CONTACT_MAX_REQUEST_BYTES=10 * 1024 * 1024)

        configured = Settings(**common, CONTACT_MAX_REQUEST_BYTES=11 * 1024 * 1024)
        self.assertEqual(configured.CONTACT_MAX_REQUEST_BYTES, 11 * 1024 * 1024)

    def test_cors_normaliza_barras_finales_y_elimina_duplicados(self) -> None:
        settings = Settings(
            _env_file=None,
            SMTP_SERVER="smtp.test.local",
            SMTP_PORT=587,
            SMTP_USERNAME="tests@example.com",
            SMTP_PASSWORD="secret",
            DATABASE_URL="mysql+aiomysql://u:p@127.0.0.1/db",
            secret_key="test-secret-key-with-at-least-32-characters",
            token_interval_seconds=60,
            CORS_ALLOWED_ORIGINS=(
                "HTTPS://EXAMPLE.COM:443/, http://localhost:3000, https://example.com"
            ),
        )

        self.assertEqual(
            settings.cors_allowed_origins,
            ["https://example.com", "http://localhost:3000"],
        )

    def test_cors_rechaza_comodin_y_origen_con_ruta(self) -> None:
        common = {
            "_env_file": None,
            "SMTP_SERVER": "smtp.test.local",
            "SMTP_PORT": 587,
            "SMTP_USERNAME": "tests@example.com",
            "SMTP_PASSWORD": "secret",
            "DATABASE_URL": "mysql+aiomysql://u:p@127.0.0.1/db",
            "secret_key": "test-secret-key-with-at-least-32-characters",
            "token_interval_seconds": 60,
        }

        with self.assertRaises(ValidationError):
            Settings(**common, CORS_ALLOWED_ORIGINS="*")
        with self.assertRaises(ValidationError):
            Settings(**common, CORS_ALLOWED_ORIGINS="https://example.com/api")

        for invalid_origin in (
            "https://example.com:abc",
            "https://example.com:70000",
            "https://example.com:0",
            "https://exa_mple.com",
        ):
            with self.subTest(origin=invalid_origin), self.assertRaises(ValidationError):
                Settings(**common, CORS_ALLOWED_ORIGINS=invalid_origin)


    def test_trusted_proxy_ips_rechaza_hosts_y_normaliza_ipv4_mapeada(self) -> None:
        common = {
            "_env_file": None,
            "SMTP_SERVER": "smtp.test.local",
            "SMTP_PORT": 587,
            "SMTP_USERNAME": "tests@example.com",
            "SMTP_PASSWORD": "secret",
            "DATABASE_URL": "mysql+aiomysql://u:p@127.0.0.1/db",
            "secret_key": "test-secret-key-with-at-least-32-characters",
            "token_interval_seconds": 60,
        }

        with self.assertRaises(ValidationError):
            Settings(**common, TRUSTED_PROXY_IPS="localhost")

        settings = Settings(
            **common,
            TRUSTED_PROXY_IPS="::ffff:127.0.0.1, 127.0.0.1, ::1",
        )
        self.assertEqual(settings.TRUSTED_PROXY_IPS, "127.0.0.1,::1")

    def test_reCAPTCHA_rechaza_hosts_invalidos_y_normaliza_dns_e_ip(self) -> None:
        common = {
            "_env_file": None,
            "SMTP_SERVER": "smtp.test.local",
            "SMTP_PORT": 587,
            "SMTP_USERNAME": "tests@example.com",
            "SMTP_PASSWORD": "secret",
            "DATABASE_URL": "mysql+aiomysql://u:p@127.0.0.1/db",
            "secret_key": "test-secret-key-with-at-least-32-characters",
            "token_interval_seconds": 60,
        }

        for invalid_hosts in (
            "example.com:443",
            "-example.com",
            "example..com",
            "*.example.com",
            "exa_mple.com",
        ):
            with self.subTest(hosts=invalid_hosts), self.assertRaises(ValidationError):
                Settings(**common, RECAPTCHA_ALLOWED_HOSTNAMES=invalid_hosts)

        configured = Settings(
            **common,
            RECAPTCHA_ALLOWED_HOSTNAMES="BÜCHER.EXAMPLE.,::ffff:127.0.0.1,127.0.0.1",
        )
        self.assertEqual(
            configured.RECAPTCHA_ALLOWED_HOSTNAMES,
            "xn--bcher-kva.example,127.0.0.1",
        )


class SmtpTransportTests(unittest.IsolatedAsyncioTestCase):
    async def test_tls_implicito_no_intenta_starttls(self) -> None:
        service = EmailService()
        service.smtp_tls_mode = "tls"

        with patch("backend.services.email_service.aiosmtplib.send", new=AsyncMock()) as send_mock:
            await service.send_contact_email(
                name="Juan Pérez",
                reason="informacion",
                email="juan@example.com",
                message="Mensaje de prueba",
            )

        await_args = send_mock.await_args
        self.assertIsNotNone(await_args)
        assert await_args is not None
        self.assertTrue(await_args.kwargs["use_tls"])
        self.assertFalse(await_args.kwargs["start_tls"])


if __name__ == "__main__":
    unittest.main()
