"""Prueba el endpoint de contacto sin token y espera un 401."""

from backend.tests import _environment as _test_environment  # noqa: F401

import unittest

from fastapi.testclient import TestClient

from backend import main


class ContactoUnauthorizedTests(unittest.TestCase):
    """Contacto debe rechazar peticiones sin token antes de procesar el cuerpo."""

    def test_contacto_sin_token(self) -> None:
        with TestClient(main.create_app()) as client:
            response = client.post(
                "/api/contacto",
                data={
                    "name": "Test User",
                    "reason": "informacion",
                    "email": "test@example.com",
                    "message": "Este es un mensaje de prueba",
                },
            )

        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.json(), {"detail": "Token no proporcionado"})


if __name__ == "__main__":
    unittest.main()
