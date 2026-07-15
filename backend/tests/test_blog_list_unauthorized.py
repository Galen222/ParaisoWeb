"""Prueba el listado del blog sin token y espera un 401."""

from backend.tests import _environment as _test_environment  # noqa: F401

import unittest

from fastapi.testclient import TestClient

from backend import main


class BlogListUnauthorizedTests(unittest.TestCase):
    """El listado del blog debe rechazar peticiones sin token."""

    def test_blog_list_sin_token(self) -> None:
        with TestClient(main.create_app()) as client:
            response = client.get("/api/blog")

        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.json(), {"detail": "Token no proporcionado"})


if __name__ == "__main__":
    unittest.main()
