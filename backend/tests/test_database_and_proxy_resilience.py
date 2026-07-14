"""Pruebas de resiliencia de base de datos y resolución de clientes tras proxy."""

from backend.tests import _environment as _test_environment  # noqa: F401  # Importación con efecto de configuración.

import unittest
from unittest.mock import AsyncMock, patch

from fastapi import FastAPI, HTTPException, Request
from sqlalchemy.exc import InterfaceError, TimeoutError as SQLAlchemyTimeoutError

from backend.middleware.rate_limit import RateLimitMiddleware, RateLimitRule
from backend.routers import blog, charcuteria


class DatabaseAvailabilityRegressionTests(unittest.IsolatedAsyncioTestCase):
    async def test_blog_devuelve_503_ante_un_error_dbapi_distinto_de_operational_error(self) -> None:
        database_error = InterfaceError("SELECT 1", {}, Exception("conexión cerrada"))
        with patch.object(blog.BlogService, "get_all_posts", new=AsyncMock(side_effect=database_error)):
            with self.assertRaises(HTTPException) as raised:
                await blog.get_blog_posts(idioma="es", token_verification=None, db=AsyncMock())

        self.assertEqual(raised.exception.status_code, 503)

    async def test_charcuteria_devuelve_503_si_se_agota_el_pool_de_conexiones(self) -> None:
        with patch.object(
            charcuteria.CharcuteriaService,
            "get_all_products",
            new=AsyncMock(side_effect=SQLAlchemyTimeoutError("pool agotado")),
        ):
            with self.assertRaises(HTTPException) as raised:
                await charcuteria.get_charcuteria_products(
                    idioma="es",
                    token_verification=None,
                    db=AsyncMock(),
                )

        self.assertEqual(raised.exception.status_code, 503)


class TrustedProxyRegressionTests(unittest.TestCase):
    def setUp(self) -> None:
        self.middleware = RateLimitMiddleware(
            FastAPI(),
            rules=[
                RateLimitRule(
                    name="proxy",
                    method="GET",
                    path="/proxy",
                    max_requests=1,
                    window_seconds=60,
                )
            ],
            secret_key="clave-pruebas",
            trusted_proxy_ips={"127.0.0.1"},
        )

    @staticmethod
    def build_request(*, client_host: str, headers: list[tuple[bytes, bytes]]) -> Request:
        return Request(
            {
                "type": "http",
                "http_version": "1.1",
                "method": "GET",
                "scheme": "http",
                "path": "/proxy",
                "raw_path": b"/proxy",
                "query_string": b"",
                "headers": headers,
                "client": (client_host, 50000),
                "server": ("localhost", 80),
            }
        )

    def test_ipv4_mapeada_en_ipv6_sigue_reconociendo_el_proxy_confiable(self) -> None:
        request = self.build_request(
            client_host="::ffff:127.0.0.1",
            headers=[(b"x-forwarded-for", b"203.0.113.25")],
        )

        self.assertEqual(self.middleware._resolve_client_host(request), "203.0.113.25")

    def test_x_real_ip_se_usa_solo_detras_de_un_proxy_confiable(self) -> None:
        trusted_request = self.build_request(
            client_host="127.0.0.1",
            headers=[(b"x-real-ip", b"198.51.100.40")],
        )
        untrusted_request = self.build_request(
            client_host="198.51.100.10",
            headers=[(b"x-real-ip", b"198.51.100.41")],
        )

        self.assertEqual(self.middleware._resolve_client_host(trusted_request), "198.51.100.40")
        self.assertEqual(self.middleware._resolve_client_host(untrusted_request), "198.51.100.10")


if __name__ == "__main__":
    unittest.main()
