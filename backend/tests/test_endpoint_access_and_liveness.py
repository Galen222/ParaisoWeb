"""Pruebas de liveness, acceso local del sitemap y cobertura de rate limits."""

from backend.tests import _environment as _test_environment  # noqa: F401

import unittest
from unittest.mock import patch

from fastapi import HTTPException, Request
from fastapi.testclient import TestClient

from backend import main
from backend.dependencies import verify_local_request
from backend.middleware.rate_limit import RateLimitMiddleware


class EndpointAccessTests(unittest.IsolatedAsyncioTestCase):
    async def test_acceso_local_acepta_loopback_directo(self) -> None:
        request = Request(
            {
                "type": "http",
                "method": "GET",
                "path": "/api/sitemap/blog",
                "headers": [],
                "client": ("127.0.0.1", 50000),
                "server": ("127.0.0.1", 8000),
                "scheme": "http",
                "query_string": b"",
            }
        )

        await verify_local_request(request)

    async def test_acceso_local_rechaza_cliente_externo_tras_proxy_confiable(self) -> None:
        request = Request(
            {
                "type": "http",
                "method": "GET",
                "path": "/api/sitemap/blog",
                "headers": [(b"x-forwarded-for", b"203.0.113.10")],
                "client": ("127.0.0.1", 50000),
                "server": ("127.0.0.1", 8000),
                "scheme": "http",
                "query_string": b"",
            }
        )

        with patch.object(main.settings, "TRUSTED_PROXY_IPS", "127.0.0.1,::1"):
            with self.assertRaises(HTTPException) as raised:
                await verify_local_request(request)

        self.assertEqual(raised.exception.status_code, 403)


class LivenessAndRulesTests(unittest.TestCase):
    def test_livez_no_consulta_la_base_de_datos_y_no_se_cachea(self) -> None:
        class FakeEngine:
            def connect(self):
                raise AssertionError("No debe consultar MySQL")

        app = main.create_app()
        with patch.object(main, "engine", FakeEngine()):
            response = TestClient(app).get("/livez")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"status": "alive"})
        self.assertEqual(response.headers["cache-control"], "no-store, max-age=0")
        self.assertEqual(response.headers["pragma"], "no-cache")

    def test_head_status_funciona_sin_cuerpo_y_con_limite_especifico(self) -> None:
        class FakeConnection:
            async def __aenter__(self):
                return self

            async def __aexit__(self, exc_type, exc, traceback):
                return False

            async def execute(self, statement):
                return None

        class FakeEngine:
            def connect(self):
                return FakeConnection()

        app = main.create_app()
        with patch.object(main, "engine", FakeEngine()):
            livez_response = TestClient(app).head("/livez")
            health_response = TestClient(app).head("/health")

        self.assertEqual(livez_response.status_code, 200)
        self.assertEqual(health_response.status_code, 200)
        self.assertEqual(livez_response.content, b"")
        self.assertEqual(health_response.content, b"")
        self.assertEqual(livez_response.headers["cache-control"], "no-store, max-age=0")
        self.assertEqual(health_response.headers["cache-control"], "no-store, max-age=0")

    def test_todos_los_endpoints_tienen_regla_especifica_y_existe_limite_global(self) -> None:
        app = main.create_app()
        middleware = next(
            item for item in app.user_middleware if item.cls is RateLimitMiddleware
        )
        rules = middleware.kwargs["rules"]
        configured = {(rule.method, rule.path) for rule in rules}

        expected = {
            ("*", "*"),
            ("GET", "/health"),
            ("HEAD", "/health"),
            ("GET", "/livez"),
            ("HEAD", "/livez"),
            ("GET", "/api/get-token"),
            ("POST", "/api/contacto"),
            ("GET", "/api/blog"),
            ("GET", "/api/blog/{slug}"),
            ("GET", "/api/blog/by-id/{id_noticia}"),
            ("GET", "/api/charcuteria"),
            ("GET", "/api/sitemap/blog"),
        }

        self.assertTrue(expected.issubset(configured))


if __name__ == "__main__":
    unittest.main()
