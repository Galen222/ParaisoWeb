"""Regresiones de autenticación temprana, acceso local y cierre del lifespan."""

from backend.tests import _environment as _test_environment  # noqa: F401

import unittest
from unittest.mock import AsyncMock, patch

from fastapi import FastAPI, HTTPException, Request
from fastapi.testclient import TestClient

from backend import main
from backend.dependencies import verify_local_request
from backend.middleware.contact_auth import ContactTokenGuardMiddleware


class ContactTokenGuardTests(unittest.IsolatedAsyncioTestCase):
    @staticmethod
    def _scope(
        headers: list[tuple[bytes, bytes]],
        method: str = "POST",
        path: str = "/api/contacto",
    ) -> dict[str, object]:
        return {
            "type": "http",
            "method": method,
            "path": path,
            "headers": headers,
            "client": ("203.0.113.10", 50000),
            "server": ("127.0.0.1", 8000),
            "scheme": "https",
            "query_string": b"",
        }

    async def test_contacto_sin_token_se_rechaza_sin_leer_el_multipart(self) -> None:
        inner_called = False
        receive_called = False
        sent: list[dict[str, object]] = []

        async def inner_app(scope, receive, send) -> None:
            nonlocal inner_called
            inner_called = True

        async def receive() -> dict[str, object]:
            nonlocal receive_called
            receive_called = True
            raise AssertionError("El cuerpo no debe leerse sin token")

        async def send(message) -> None:
            sent.append(message)

        middleware = ContactTokenGuardMiddleware(inner_app)
        await middleware(self._scope([]), receive, send)

        self.assertFalse(inner_called)
        self.assertFalse(receive_called)
        self.assertEqual(sent[0]["status"], 401)

    def test_contacto_sin_token_se_rechaza_antes_de_validar_content_length(self) -> None:
        app = main.create_app()
        client = TestClient(app)

        response = client.post(
            "/api/contacto",
            headers={"Content-Length": str(main.settings.CONTACT_MAX_REQUEST_BYTES + 1)},
        )

        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.json(), {"detail": "Token no proporcionado"})

    async def test_contacto_con_cabeceras_de_token_duplicadas_no_lee_el_cuerpo(self) -> None:
        receive_called = False
        sent: list[dict[str, object]] = []

        async def inner_app(scope, receive, send) -> None:
            raise AssertionError("La aplicación no debe recibir una autenticación ambigua")

        async def receive() -> dict[str, object]:
            nonlocal receive_called
            receive_called = True
            raise AssertionError("El cuerpo no debe leerse con tokens duplicados")

        async def send(message) -> None:
            sent.append(message)

        middleware = ContactTokenGuardMiddleware(inner_app)
        await middleware(
            self._scope(
                [
                    (b"x-timed-token", b"invalid-one"),
                    (b"x-timed-token", b"invalid-two"),
                ]
            ),
            receive,
            send,
        )

        self.assertFalse(receive_called)
        self.assertEqual(sent[0]["status"], 403)

    async def test_blog_con_cabeceras_de_token_duplicadas_se_rechaza_antes_de_la_ruta(self) -> None:
        inner_called = False
        sent: list[dict[str, object]] = []

        async def inner_app(scope, receive, send) -> None:
            nonlocal inner_called
            inner_called = True

        async def receive() -> dict[str, object]:
            return {"type": "http.request", "body": b"", "more_body": False}

        async def send(message) -> None:
            sent.append(message)

        middleware = ContactTokenGuardMiddleware(inner_app)
        await middleware(
            self._scope(
                [
                    (b"x-timed-token", b"first"),
                    (b"x-timed-token", b"second"),
                ],
                method="GET",
                path="/api/blog/articulo",
            ),
            receive,
            send,
        )

        self.assertFalse(inner_called)
        self.assertEqual(sent[0]["status"], 403)


class LocalAccessFailClosedTests(unittest.IsolatedAsyncioTestCase):
    async def test_loopback_con_forwarded_for_y_proxy_no_configurado_se_rechaza(self) -> None:
        request = Request(
            {
                "type": "http",
                "method": "GET",
                "path": "/api/sitemap/blog",
                "headers": [(b"x-forwarded-for", b"203.0.113.50")],
                "client": ("127.0.0.1", 50000),
                "server": ("127.0.0.1", 8000),
                "scheme": "http",
                "query_string": b"",
            }
        )

        with patch.object(main.settings, "TRUSTED_PROXY_IPS", ""):
            with self.assertRaises(HTTPException) as raised:
                await verify_local_request(request)

        self.assertEqual(raised.exception.status_code, 403)


class LifespanCleanupTests(unittest.IsolatedAsyncioTestCase):
    async def test_engine_se_cierra_aunque_la_aplicacion_termine_con_excepcion(self) -> None:
        class FakeConnection:
            async def run_sync(self, callback) -> None:
                return None

        class BeginContext:
            async def __aenter__(self):
                return FakeConnection()

            async def __aexit__(self, exc_type, exc, traceback) -> None:
                return None

        class FakeEngine:
            def __init__(self) -> None:
                self.dispose = AsyncMock()

            def begin(self) -> BeginContext:
                return BeginContext()

        fake_engine = FakeEngine()
        app = FastAPI()

        with patch.object(main, "engine", fake_engine):
            with self.assertRaisesRegex(RuntimeError, "fallo durante la ejecución"):
                async with main.lifespan(app):
                    raise RuntimeError("fallo durante la ejecución")

        fake_engine.dispose.assert_awaited_once()


if __name__ == "__main__":
    unittest.main()
