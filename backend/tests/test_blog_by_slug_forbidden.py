"""Prueba el detalle del blog por slug con token inválido y espera un 403."""

from backend.tests import _environment as _test_environment  # noqa: F401

import unittest

from fastapi.testclient import TestClient

from backend import main


class BlogBySlugForbiddenTests(unittest.TestCase):
    """El detalle por slug debe rechazar un token inválido."""

    def test_blog_detail_token_invalido(self) -> None:
        with TestClient(main.create_app()) as client:
            response = client.get(
                "/api/blog/ejemplo-slug",
                headers={"x-timed-token": "token_invalido_123"},
            )

        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.json(), {"detail": "Token inválido o expirado"})


if __name__ == "__main__":
    unittest.main()
