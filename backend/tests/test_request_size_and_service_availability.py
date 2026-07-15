"""Pruebas de límites de cuerpo, timeouts y disponibilidad de servicios."""

from backend.tests import _environment as _test_environment  # noqa: F401  # Importación con efecto de configuración.

import asyncio
import unittest
from unittest.mock import AsyncMock, patch

from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.testclient import TestClient
from sqlalchemy.exc import OperationalError

from backend.middleware.request_size import RequestSizeLimitMiddleware, RequestSizeRule
from backend.services.email_service import EmailService
from backend.routers import blog, charcuteria


class RequestSizeLimitMiddlewareTests(unittest.TestCase):
    def setUp(self) -> None:
        app = FastAPI()
        app.add_middleware(
            RequestSizeLimitMiddleware,
            rules=[RequestSizeRule(method="POST", path="/contacto", max_bytes=5)],
        )

        @app.post("/contacto")
        async def contacto(request: Request) -> dict[str, int]:
            body = await request.body()
            return {"size": len(body)}

        self.client = TestClient(app)

    def test_permite_un_cuerpo_dentro_del_limite(self) -> None:
        response = self.client.post("/contacto", content=b"12345")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"size": 5})

    def test_rechaza_por_content_length_antes_de_leer_el_cuerpo(self) -> None:
        response = self.client.post("/contacto", content=b"123456")
        self.assertEqual(response.status_code, 413)
        self.assertEqual(response.headers["cache-control"], "no-store")

    def test_rechaza_streaming_sin_content_length_al_superar_el_limite(self) -> None:
        messages = [
            {"type": "http.request", "body": b"123", "more_body": True},
            {"type": "http.request", "body": b"456", "more_body": False},
        ]
        sent = []

        async def receive():
            return messages.pop(0)

        async def send(message):
            sent.append(message)

        async def downstream(scope, receive_limited, send_limited):
            while True:
                message = await receive_limited()
                if not message.get("more_body", False):
                    break
            await send_limited({"type": "http.response.start", "status": 200, "headers": []})
            await send_limited({"type": "http.response.body", "body": b"ok"})

        middleware = RequestSizeLimitMiddleware(
            downstream,
            rules=[RequestSizeRule(method="POST", path="/contacto", max_bytes=5)],
        )
        scope = {
            "type": "http",
            "method": "POST",
            "path": "/contacto",
            "headers": [],
        }

        asyncio.run(middleware(scope, receive, send))
        self.assertEqual(sent[0]["status"], 413)


class TimeoutAndDatabaseErrorTests(unittest.IsolatedAsyncioTestCase):
    async def test_email_service_pasa_timeout_configurado_al_cliente_smtp(self) -> None:
        service = EmailService()
        service.smtp_timeout = 7.5

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
        self.assertEqual(await_args.kwargs["timeout"], 7.5)
        self.assertFalse(await_args.kwargs["use_tls"])
        self.assertTrue(await_args.kwargs["start_tls"])

    async def test_lifespan_no_se_bloquea_si_mysql_no_responde(self) -> None:
        from backend import main

        class HangingBegin:
            async def __aenter__(self):
                await asyncio.sleep(1)
                return self

            async def __aexit__(self, exc_type, exc, traceback):
                return False

        class FakeEngine:
            def begin(self):
                return HangingBegin()

            async def dispose(self):
                return None

        app = FastAPI()
        with (
            patch.object(main.settings, "DATABASE_STARTUP_TIMEOUT_SECONDS", 0.01),
            patch.object(main, "engine", FakeEngine()),
        ):
            async with main.lifespan(app):
                self.assertFalse(app.state.database_available)

    async def test_health_usa_el_timeout_configurado(self) -> None:
        from backend import main

        app = main.create_app()
        health_route = next(route for route in app.routes if getattr(route, "path", None) == "/health")
        captured_timeouts: list[float] = []

        async def fake_wait_for(awaitable, timeout):
            captured_timeouts.append(timeout)
            awaitable.close()
            raise TimeoutError

        with (
            patch.object(main.settings, "HEALTHCHECK_DATABASE_TIMEOUT_SECONDS", 0.25),
            patch.object(main.asyncio, "wait_for", new=fake_wait_for),
        ):
            result = await health_route.endpoint(Response())

        self.assertEqual(captured_timeouts, [0.25])
        self.assertEqual(result["status"], "degraded")

    async def test_blog_devuelve_503_cuando_mysql_no_esta_disponible(self) -> None:
        database_error = OperationalError("SELECT 1", {}, Exception("sin conexión"))
        with patch.object(blog.BlogService, "get_all_posts", new=AsyncMock(side_effect=database_error)):
            with self.assertRaises(HTTPException) as raised:
                await blog.get_blog_posts(idioma="es", token_verification=None, db=AsyncMock())

        self.assertEqual(raised.exception.status_code, 503)

    async def test_charcuteria_devuelve_503_cuando_mysql_no_esta_disponible(self) -> None:
        database_error = OperationalError("SELECT 1", {}, Exception("sin conexión"))
        with patch.object(
            charcuteria.CharcuteriaService,
            "get_all_products",
            new=AsyncMock(side_effect=database_error),
        ):
            with self.assertRaises(HTTPException) as raised:
                await charcuteria.get_charcuteria_products(
                    idioma="es",
                    token_verification=None,
                    db=AsyncMock(),
                )

        self.assertEqual(raised.exception.status_code, 503)


if __name__ == "__main__":
    unittest.main()
