"""Regresiones de formato de token, cabeceras proxy y separadores Unicode."""

from backend.tests import _environment as _test_environment  # noqa: F401

import base64
import unittest
from unittest.mock import patch

from fastapi import HTTPException, Request
from pydantic import ValidationError

from backend.core import auth_utils
from backend.core.client_ip import resolve_client_host
from backend.dependencies import verify_local_request
from backend.models.schemas import ContactForm


class TimedTokenCanonicalFormatTests(unittest.TestCase):
    def test_rechaza_base64_estandar_aunque_represente_un_hmac_valido(self) -> None:
        """Solo se acepta el alfabeto URL-safe que genera y valida también el frontend."""
        interval_seconds = auth_utils.settings.token_interval_seconds

        for interval in range(1, 10_000):
            timestamp = interval * interval_seconds
            with patch("backend.core.auth_utils.time.time", return_value=timestamp):
                urlsafe_token = auth_utils.generate_timed_token()

            raw_token = base64.urlsafe_b64decode(urlsafe_token)
            standard_token = base64.b64encode(raw_token).decode("ascii")
            if standard_token != urlsafe_token:
                break
        else:  # pragma: no cover - la probabilidad de no encontrarlo es despreciable
            self.fail("No se encontró un HMAC cuya codificación estándar difiera de URL-safe")

        with patch("backend.core.auth_utils.time.time", return_value=timestamp):
            self.assertTrue(auth_utils.verify_timed_token(urlsafe_token))
            self.assertFalse(auth_utils.verify_timed_token(standard_token))


class ForwardingHeaderAmbiguityTests(unittest.IsolatedAsyncioTestCase):
    @staticmethod
    def _request(headers: list[tuple[bytes, bytes]]) -> Request:
        return Request(
            {
                "type": "http",
                "method": "GET",
                "path": "/api/sitemap/blog",
                "headers": headers,
                "client": ("127.0.0.1", 50000),
                "server": ("127.0.0.1", 8000),
                "scheme": "http",
                "query_string": b"",
            }
        )

    def test_rate_limit_no_elige_una_ip_de_cabeceras_proxy_duplicadas(self) -> None:
        request = self._request(
            [
                (b"x-forwarded-for", b"203.0.113.10"),
                (b"x-forwarded-for", b"198.51.100.20"),
            ]
        )

        self.assertEqual(resolve_client_host(request, ["127.0.0.1"]), "127.0.0.1")

    async def test_sitemap_rechaza_cabeceras_proxy_duplicadas(self) -> None:
        request = self._request(
            [
                (b"x-real-ip", b"127.0.0.1"),
                (b"x-real-ip", b"203.0.113.50"),
            ]
        )

        with self.assertRaises(HTTPException) as raised:
            await verify_local_request(request)

        self.assertEqual(raised.exception.status_code, 403)

    async def test_sitemap_rechaza_direcciones_proxy_malformadas(self) -> None:
        for header_name, header_value in (
            (b"x-forwarded-for", b"203.0.113.10, no-es-una-ip"),
            (b"x-forwarded-for", b"203.0.113.10,,127.0.0.1"),
            (b"x-real-ip", b"localhost"),
            (b"x-real-ip", b"   "),
        ):
            with self.subTest(header=header_name.decode("ascii"), value=header_value):
                request = self._request([(header_name, header_value)])

                with self.assertRaises(HTTPException) as raised:
                    await verify_local_request(request)

                self.assertEqual(raised.exception.status_code, 403)


class ContactMessageSeparatorTests(unittest.TestCase):
    def test_rechaza_separadores_unicode_de_linea_y_parrafo(self) -> None:
        for separator in ("\u2028", "\u2029"):
            with self.subTest(separator=repr(separator)):
                with self.assertRaises(ValidationError):
                    ContactForm(
                        name="José",
                        reason="informacion",
                        email="jose@example.com",
                        message=f"Primera línea{separator}Segunda línea",
                    )


if __name__ == "__main__":
    unittest.main()
