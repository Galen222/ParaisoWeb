"""Regresiones de estado de autenticación temprana y configuración de loggers de servicio."""

from backend.tests import _environment as _test_environment  # noqa: F401

import importlib
import logging
import unittest
from unittest.mock import patch

from fastapi import Request

from backend import dependencies
from backend.middleware.contact_auth import ContactTokenGuardMiddleware


class EarlyAuthenticationStateTests(unittest.IsolatedAsyncioTestCase):
    @staticmethod
    def _scope() -> dict[str, object]:
        return {
            "type": "http",
            "method": "POST",
            "path": "/api/contacto",
            "headers": [(b"x-timed-token", b"A" * 43 + b"=")],
            "client": ("203.0.113.10", 50000),
            "server": ("127.0.0.1", 8000),
            "scheme": "https",
            "query_string": b"",
        }

    async def test_el_middleware_marca_el_token_como_verificado(self) -> None:
        captured_state: dict[str, object] = {}

        async def inner_app(scope, receive, send) -> None:
            captured_state.update(scope.get("state", {}))

        async def receive() -> dict[str, object]:
            return {"type": "http.request", "body": b"", "more_body": False}

        async def send(message) -> None:
            return None

        middleware = ContactTokenGuardMiddleware(inner_app)
        with patch("backend.middleware.contact_auth.verify_timed_token", return_value=True):
            await middleware(self._scope(), receive, send)

        self.assertIs(captured_state.get("timed_token_verified"), True)

    async def test_la_dependencia_no_revalida_un_token_ya_comprobado(self) -> None:
        request = Request(
            {
                "type": "http",
                "method": "POST",
                "path": "/api/contacto",
                "headers": [],
                "client": ("203.0.113.10", 50000),
                "server": ("127.0.0.1", 8000),
                "scheme": "https",
                "query_string": b"",
                "state": {"timed_token_verified": True},
            }
        )

        with patch.object(
            dependencies,
            "verify_timed_token",
            side_effect=AssertionError("No debe verificarse una segunda vez"),
        ):
            await dependencies.verify_token(request, "token-ya-expirado")


class ServiceLoggerConfigurationTests(unittest.TestCase):
    def _assert_reload_creates_local_handler(self, module_name: str) -> None:
        module = importlib.import_module(module_name)
        service_logger = module.logger
        root_logger = logging.getLogger()
        original_service_handlers = list(service_logger.handlers)
        root_handler = logging.NullHandler()

        try:
            service_logger.handlers.clear()
            root_logger.addHandler(root_handler)
            reloaded = importlib.reload(module)
            self.assertTrue(
                reloaded.logger.handlers,
                "Un logger con propagate=False necesita al menos un handler propio",
            )
        finally:
            service_logger.handlers.clear()
            service_logger.handlers.extend(original_service_handlers)
            root_logger.removeHandler(root_handler)

    def test_email_service_no_pierde_logs_si_root_tiene_handler(self) -> None:
        self._assert_reload_creates_local_handler("backend.services.email_service")

    def test_file_service_no_pierde_logs_si_root_tiene_handler(self) -> None:
        self._assert_reload_creates_local_handler("backend.services.file_service")


if __name__ == "__main__":
    unittest.main()
