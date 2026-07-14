"""Pruebas de caché HTTP y validación del formulario de contacto."""

from backend.tests import _environment as _test_environment  # noqa: F401  # Importación con efecto de configuración.

import unittest
from unittest.mock import AsyncMock, patch

from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient

from backend.models.schemas import ContactForm
from backend.routers import token
from backend.services.contacto_service import ContactoService


class CacheControlTests(unittest.TestCase):
    def test_token_temporal_no_se_puede_cachear(self) -> None:
        app = FastAPI()
        app.include_router(token.router, prefix="/api")

        with patch.object(token, "generate_timed_token", return_value="token-prueba"):
            response = TestClient(app).get("/api/get-token")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"token": "token-prueba"})
        self.assertEqual(response.headers["cache-control"], "no-store, max-age=0")
        self.assertEqual(response.headers["pragma"], "no-cache")

    def test_health_no_devuelve_un_estado_cacheable(self) -> None:
        from backend import main

        class FakeConnection:
            async def execute(self, statement):
                return statement

        class FakeConnectionContext:
            async def __aenter__(self):
                return FakeConnection()

            async def __aexit__(self, exc_type, exc, traceback):
                return False

        class FakeEngine:
            def connect(self):
                return FakeConnectionContext()

        app = main.create_app()
        with patch.object(main, "engine", FakeEngine()):
            response = TestClient(app).get("/health")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["database"], "available")
        self.assertEqual(response.headers["cache-control"], "no-store, max-age=0")
        self.assertEqual(response.headers["pragma"], "no-cache")


class ContactFormRegressionTests(unittest.IsolatedAsyncioTestCase):
    async def test_caida_smtp_se_devuelve_como_servicio_temporalmente_no_disponible(self) -> None:
        service = ContactoService()

        with patch.object(
            service.email_service,
            "send_contact_email",
            new=AsyncMock(side_effect=OSError("SMTP no disponible")),
        ):
            with self.assertRaises(HTTPException) as raised:
                await service.process_contact_form(
                    name="Juan Pérez",
                    reason="informacion",
                    email="juan@example.com",
                    message="Mensaje de prueba",
                )

        self.assertEqual(raised.exception.status_code, 503)
        self.assertEqual(raised.exception.detail, "Servicio de correo temporalmente no disponible")

    async def test_nombre_unicode_descompuesto_se_normaliza_antes_de_validar(self) -> None:
        contact_form = ContactForm(
            name="Jose\u0301",
            reason="informacion",
            email="jose@example.com",
            message="Mensaje de prueba",
        )

        self.assertEqual(contact_form.name, "José")


if __name__ == "__main__":
    unittest.main()
