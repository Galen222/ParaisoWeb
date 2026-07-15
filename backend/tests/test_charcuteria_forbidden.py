"""Prueba el endpoint de charcutería con token inválido y espera un 403."""

from backend.tests import _environment as _test_environment  # noqa: F401

import unittest

from fastapi.testclient import TestClient

from backend import main


class CharcuteriaForbiddenTests(unittest.TestCase):
    """Charcutería debe rechazar un token inválido."""

    def test_charcuteria_token_invalido(self) -> None:
        with TestClient(main.create_app()) as client:
            response = client.get(
                "/api/charcuteria",
                headers={"x-timed-token": "token_invalido_123"},
            )

        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.json(), {"detail": "Token inválido o expirado"})


if __name__ == "__main__":
    unittest.main()
