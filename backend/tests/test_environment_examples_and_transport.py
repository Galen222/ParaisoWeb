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

    def test_cors_normaliza_barras_finales_y_elimina_duplicados(self) -> None:
        settings = Settings(
            _env_file=None,
            SMTP_SERVER="smtp.example.com",
            SMTP_PORT=587,
            SMTP_USERNAME="tests@example.com",
            SMTP_PASSWORD="secret",
            DATABASE_URL="mysql+aiomysql://u:p@127.0.0.1/db",
            secret_key="test-secret",
            token_interval_seconds=60,
            CORS_ALLOWED_ORIGINS=(
                "https://example.com/, http://localhost:3000, https://example.com"
            ),
        )

        self.assertEqual(
            settings.cors_allowed_origins,
            ["https://example.com", "http://localhost:3000"],
        )

    def test_cors_rechaza_comodin_y_origen_con_ruta(self) -> None:
        common = {
            "_env_file": None,
            "SMTP_SERVER": "smtp.example.com",
            "SMTP_PORT": 587,
            "SMTP_USERNAME": "tests@example.com",
            "SMTP_PASSWORD": "secret",
            "DATABASE_URL": "mysql+aiomysql://u:p@127.0.0.1/db",
            "secret_key": "test-secret",
            "token_interval_seconds": 60,
        }

        with self.assertRaises(ValidationError):
            Settings(**common, CORS_ALLOWED_ORIGINS="*")
        with self.assertRaises(ValidationError):
            Settings(**common, CORS_ALLOWED_ORIGINS="https://example.com/api")


    def test_trusted_proxy_ips_rechaza_hosts_y_normaliza_ipv4_mapeada(self) -> None:
        common = {
            "_env_file": None,
            "SMTP_SERVER": "smtp.example.com",
            "SMTP_PORT": 587,
            "SMTP_USERNAME": "tests@example.com",
            "SMTP_PASSWORD": "secret",
            "DATABASE_URL": "mysql+aiomysql://u:p@127.0.0.1/db",
            "secret_key": "test-secret",
            "token_interval_seconds": 60,
        }

        with self.assertRaises(ValidationError):
            Settings(**common, TRUSTED_PROXY_IPS="localhost")

        settings = Settings(
            **common,
            TRUSTED_PROXY_IPS="::ffff:127.0.0.1, 127.0.0.1, ::1",
        )
        self.assertEqual(settings.TRUSTED_PROXY_IPS, "127.0.0.1,::1")


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
