"""Prueba el detalle del blog por ID con token inválido y espera un 403."""

from backend.tests import _environment as _test_environment  # noqa: F401

import unittest

from fastapi.testclient import TestClient

from backend import main


class BlogByIdForbiddenTests(unittest.TestCase):
    """El detalle por ID debe rechazar un token inválido."""

    def test_blog_by_id_token_invalido(self) -> None:
        with TestClient(main.create_app()) as client:
            response = client.get(
                "/api/blog/by-id/1",
                params={"idioma": "es"},
                headers={"x-timed-token": "token_invalido_123"},
            )

        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.json(), {"detail": "Token inválido o expirado"})


if __name__ == "__main__":
    unittest.main()
