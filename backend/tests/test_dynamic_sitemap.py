"""Pruebas del endpoint mínimo utilizado por el sitemap dinámico."""

from backend.tests import _environment as _test_environment  # noqa: F401

import unittest
from datetime import datetime
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

from fastapi import FastAPI, Response
from fastapi.testclient import TestClient

from backend.core.auth_utils import generate_timed_token
from backend.dependencies import get_db
from backend.routers import sitemap
from backend.routers.sitemap import get_sitemap_blog_entries
from backend.services.sitemap_service import SitemapService


class _ScalarResult:
    def __init__(self, rows: list[SimpleNamespace]):
        self._rows = rows

    def scalars(self) -> "_ScalarResult":
        return self

    def all(self) -> list[SimpleNamespace]:
        return self._rows


def _blog_row(**overrides) -> SimpleNamespace:
    values = {
        "id_noticia": 7,
        "idioma": "es",
        "slug": "cafe\u0301-iberico",
        "titulo": "Café ibérico",
        "contenido": "Contenido público",
        "autor": "Equipo editorial",
        "imagen_url": "articulos/cafe-iberico.webp",
        "imagen_url_2": None,
        "fecha_publicacion": datetime(2026, 7, 15, 9, 0, 0),
        "fecha_actualizacion": datetime(2026, 7, 15, 10, 0, 0),
    }
    values.update(overrides)
    return SimpleNamespace(**values)


class SitemapServiceTests(unittest.IsolatedAsyncioTestCase):
    async def test_devuelve_solo_los_campos_publicos_necesarios(self) -> None:
        db = AsyncMock()
        db.execute.return_value = _ScalarResult([_blog_row()])

        entries = await SitemapService(db).get_blog_entries()

        self.assertEqual(len(entries), 1)
        self.assertEqual(entries[0].slug, "café-iberico")
        self.assertEqual(
            set(entries[0].model_dump()),
            {"id_noticia", "idioma", "slug", "lastmod"},
        )

    async def test_omite_articulos_que_la_api_publica_tampoco_puede_servir(self) -> None:
        db = AsyncMock()
        db.execute.return_value = _ScalarResult(
            [
                _blog_row(id_noticia=1, slug="slug con espacios"),
                _blog_row(id_noticia=2, titulo="   "),
                _blog_row(id_noticia=3, imagen_url="../privado.webp"),
                _blog_row(id_noticia=4, fecha_publicacion=None, fecha_actualizacion=None),
                _blog_row(id_noticia=5, idioma="fr"),
            ]
        )

        entries = await SitemapService(db).get_blog_entries()

        self.assertEqual(entries, [])

    async def test_endpoint_protegido_no_permite_cache_con_token_valido(self) -> None:
        response = Response()
        with patch(
            "backend.routers.sitemap.SitemapService.get_blog_entries",
            new=AsyncMock(return_value=[]),
        ):
            entries = await get_sitemap_blog_entries(
                response=response,
                token_verification=None,
                local_verification=None,
                db=AsyncMock(),
            )

        self.assertEqual(entries, [])
        self.assertEqual(
            response.headers["cache-control"],
            "no-store, max-age=0",
        )
        self.assertEqual(response.headers["pragma"], "no-cache")

    def test_endpoint_rechaza_peticion_sin_token(self) -> None:
        app = FastAPI()
        app.include_router(sitemap.router, prefix="/api")

        response = TestClient(app).get("/api/sitemap/blog")

        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.json()["detail"], "Token no proporcionado")

    def test_endpoint_rechaza_cliente_externo_aunque_el_token_sea_valido(self) -> None:
        app = FastAPI()
        app.include_router(sitemap.router, prefix="/api")

        response = TestClient(app).get(
            "/api/sitemap/blog",
            headers={"x-timed-token": generate_timed_token()},
        )

        self.assertEqual(response.status_code, 403)
        self.assertEqual(
            response.json()["detail"],
            "Endpoint disponible únicamente desde el servidor local",
        )

    def test_endpoint_local_acepta_token_y_devuelve_datos(self) -> None:
        app = FastAPI()
        app.include_router(sitemap.router, prefix="/api")

        async def fake_db():
            yield AsyncMock()

        app.dependency_overrides[get_db] = fake_db
        with patch(
            "backend.routers.sitemap.SitemapService.get_blog_entries",
            new=AsyncMock(return_value=[]),
        ):
            response = TestClient(app, client=("127.0.0.1", 50000)).get(
                "/api/sitemap/blog",
                headers={"x-timed-token": generate_timed_token()},
            )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), [])


if __name__ == "__main__":
    unittest.main()
