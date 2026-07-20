"""Regresiones de readiness, documentación y caché de respuestas API."""

from backend.tests import _environment as _test_environment  # noqa: F401

import unittest
from unittest.mock import patch

from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient

from backend import main
from backend.middleware.cache_control import ApiNoStoreMiddleware


class ReadinessTests(unittest.TestCase):
    def test_health_devuelve_503_cuando_mysql_no_esta_disponible(self) -> None:
        class UnavailableEngine:
            def connect(self):
                raise ConnectionError("MySQL no disponible")

        app = main.create_app()
        with patch.object(main, "engine", UnavailableEngine()):
            response = TestClient(app).get("/health")

        self.assertEqual(response.status_code, 503)
        self.assertEqual(
            response.json(),
            {"status": "degraded", "database": "unavailable"},
        )
        self.assertEqual(response.headers["cache-control"], "no-store, max-age=0")


class ApiDocumentationTests(unittest.TestCase):
    def test_documentacion_esta_desactivada_por_defecto(self) -> None:
        with patch.object(main.settings, "ENABLE_API_DOCS", False):
            app = main.create_app()

        paths = {getattr(route, "path", None) for route in app.routes}
        self.assertNotIn("/docs", paths)
        self.assertNotIn("/redoc", paths)
        self.assertNotIn("/openapi.json", paths)

    def test_documentacion_puede_habilitarse_explicita_en_desarrollo(self) -> None:
        with patch.object(main.settings, "ENABLE_API_DOCS", True):
            app = main.create_app()

        paths = {getattr(route, "path", None) for route in app.routes}
        self.assertTrue({"/docs", "/redoc", "/openapi.json"}.issubset(paths))


class ApiCacheControlTests(unittest.TestCase):
    def test_respuestas_api_exitosas_y_de_error_no_se_cachean(self) -> None:
        app = FastAPI()
        app.add_middleware(ApiNoStoreMiddleware)

        @app.get("/api/value")
        async def api_value() -> dict[str, bool]:
            return {"ok": True}

        @app.get("/api/error")
        async def api_error() -> None:
            raise HTTPException(status_code=503, detail="No disponible")

        client = TestClient(app)
        for path in ("/api/value", "/api/error"):
            with self.subTest(path=path):
                response = client.get(path)
                self.assertEqual(response.headers["cache-control"], "no-store, max-age=0")
                self.assertEqual(response.headers["pragma"], "no-cache")

    def test_rutas_ajenas_a_api_no_se_modifican(self) -> None:
        app = FastAPI()
        app.add_middleware(ApiNoStoreMiddleware)

        @app.get("/public")
        async def public() -> dict[str, bool]:
            return {"ok": True}

        response = TestClient(app).get("/public")
        self.assertNotIn("cache-control", response.headers)
        self.assertNotIn("pragma", response.headers)


if __name__ == "__main__":
    unittest.main()
