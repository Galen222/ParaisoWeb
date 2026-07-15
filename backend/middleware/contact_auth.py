"""Autenticación temprana de endpoints protegidos mediante token temporal."""

import re
from collections.abc import Iterable
from typing import Pattern

from starlette.types import ASGIApp, Receive, Scope, Send

from ..core.auth_utils import verify_timed_token


class ContactTokenGuardMiddleware:
    """Rechaza tokens ausentes, duplicados o inválidos antes de entrar en FastAPI.

    El nombre de la clase se conserva para no romper imports existentes, aunque la
    protección se aplica también a blog, charcutería y sitemap. En contacto evita
    además que Starlette lea el cuerpo multipart antes de autenticar la petición.
    """

    DEFAULT_PROTECTED_ROUTES: tuple[tuple[str, str], ...] = (
        ("POST", "/api/contacto"),
        ("GET", "/api/blog"),
        ("GET", "/api/blog/{slug}"),
        ("GET", "/api/blog/by-id/{id_noticia}"),
        ("GET", "/api/charcuteria"),
        ("GET", "/api/sitemap/blog"),
    )

    def __init__(
        self,
        app: ASGIApp,
        protected_routes: Iterable[tuple[str, str]] = DEFAULT_PROTECTED_ROUTES,
    ) -> None:
        self.app = app
        self._protected_routes: list[tuple[str, Pattern[str]]] = [
            (method.upper(), self._compile_path_pattern(path))
            for method, path in protected_routes
            if method.strip() and path.strip()
        ]

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        method = str(scope.get("method", "")).upper()
        path = self._normalize_path(str(scope.get("path", "/")))
        if not self._is_protected(method, path):
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
        # el proxy y el servidor ASGI. Se rechazan en todos los endpoints protegidos.
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

        # La autenticación se realiza antes de leer el cuerpo. Conservar el resultado en
        # el scope evita verificar de nuevo después de un multipart lento, cuando el
        # intervalo del token ya podría haber cambiado aunque fuese válido al comenzar.
        state = scope.setdefault("state", {})
        state["timed_token_verified"] = True

        await self.app(scope, receive, send)

    def _is_protected(self, method: str, path: str) -> bool:
        return any(
            configured_method == method and path_pattern.fullmatch(path)
            for configured_method, path_pattern in self._protected_routes
        )

    @classmethod
    def _compile_path_pattern(cls, path: str) -> Pattern[str]:
        normalized = cls._normalize_path(path)
        pattern_segments: list[str] = []
        for segment in normalized.split("/"):
            if segment.startswith("{") and segment.endswith("}") and len(segment) > 2:
                pattern_segments.append(r"[^/]+")
            else:
                pattern_segments.append(re.escape(segment))
        return re.compile(r"^" + "/".join(pattern_segments) + r"$")

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
