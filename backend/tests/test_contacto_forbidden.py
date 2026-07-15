"""Prueba el endpoint de contacto con token inválido y espera un 403."""

from backend.tests import _environment as _test_environment  # noqa: F401

import unittest

from fastapi.testclient import TestClient

from backend import main


class ContactoForbiddenTests(unittest.TestCase):
    """Contacto debe rechazar un token inválido antes de procesar el cuerpo."""

    def test_contacto_token_invalido(self) -> None:
        with TestClient(main.create_app()) as client:
            response = client.post(
                "/api/contacto",
                data={
                    "name": "Test User",
                    "reason": "informacion",
                    "email": "test@example.com",
                    "message": "Este es un mensaje de prueba",
                },
                headers={"x-timed-token": "token_invalido_123"},
            )

        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.json(), {"detail": "Token inválido o expirado"})


if __name__ == "__main__":
    unittest.main()
