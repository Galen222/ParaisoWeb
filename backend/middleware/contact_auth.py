"""Autenticación temprana del formulario antes de parsear el cuerpo multipart."""

from collections.abc import Iterable

from starlette.types import ASGIApp, Scope, Receive, Send

from ..core.auth_utils import verify_timed_token


class ContactTokenGuardMiddleware:
    """Rechaza contacto sin token válido antes de leer campos o adjuntos."""

    def __init__(
        self,
        app: ASGIApp,
        protected_paths: Iterable[str] = ("/api/contacto",),
    ) -> None:
        self.app = app
        self._protected_paths = {
            self._normalize_path(path)
            for path in protected_paths
            if path.strip()
        }

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        method = str(scope.get("method", "")).upper()
        path = self._normalize_path(str(scope.get("path", "/")))
        if method != "POST" or path not in self._protected_paths:
            await self.app(scope, receive, send)
            return

        token_values = [
            value
            for key, value in scope.get("headers", [])
            if key.lower() == b"x-timed-token"
        ]
        if not token_values:
            await self._send_json_error(send, 401, "Token no proporcionado")
            return

        # Varias cabeceras del mismo token pueden ser combinadas de forma distinta por
        # el proxy y el servidor ASGI. Se rechazan antes de leer el multipart.
        if len(token_values) != 1:
            await self._send_json_error(send, 403, "Token inválido o expirado")
            return

        try:
            token = token_values[0].decode("ascii")
        except UnicodeDecodeError:
            await self._send_json_error(send, 403, "Token inválido o expirado")
            return

        if not verify_timed_token(token):
            await self._send_json_error(send, 403, "Token inválido o expirado")
            return

        await self.app(scope, receive, send)

    @staticmethod
    async def _send_json_error(send: Send, status_code: int, detail: str) -> None:
        body = ('{"detail":"' + detail + '"}').encode("utf-8")
        await send(
            {
                "type": "http.response.start",
                "status": status_code,
                "headers": [
                    (b"content-type", b"application/json; charset=utf-8"),
                    (b"content-length", str(len(body)).encode("ascii")),
                    (b"cache-control", b"no-store, max-age=0"),
                    (b"pragma", b"no-cache"),
                ],
            }
        )
        await send({"type": "http.response.body", "body": body})

    @staticmethod
    def _normalize_path(path: str) -> str:
        normalized = path.rstrip("/")
        return normalized or "/"
