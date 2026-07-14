# backend/middleware/request_size.py

"""
middleware/request_size.py

Middleware ASGI para rechazar cuerpos HTTP excesivos antes de que FastAPI procese
formularios multipart y archivos adjuntos.
"""

import logging
from dataclasses import dataclass
from typing import Iterable

from starlette.types import ASGIApp, Message, Receive, Scope, Send

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class RequestSizeRule:
    """Describe un límite de cuerpo aplicable a un método y una ruta."""

    method: str
    path: str
    max_bytes: int

    def __post_init__(self) -> None:
        if self.max_bytes <= 0:
            raise ValueError("max_bytes debe ser mayor que cero")


class RequestBodyTooLarge(Exception):
    """Indica que el cuerpo recibido supera el límite configurado."""


class RequestSizeLimitMiddleware:
    """Limita el cuerpo de endpoints concretos antes del parseo multipart."""

    def __init__(self, app: ASGIApp, rules: Iterable[RequestSizeRule]) -> None:
        self.app = app
        self._rules = {
            (rule.method.upper(), self._normalize_path(rule.path)): rule
            for rule in rules
        }

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        method = str(scope.get("method", "")).upper()
        path = self._normalize_path(str(scope.get("path", "/")))
        rule = self._rules.get((method, path))
        if rule is None:
            await self.app(scope, receive, send)
            return

        raw_headers = scope.get("headers", [])
        content_length_values = [
            value for key, value in raw_headers if key.lower() == b"content-length"
        ]
        transfer_encoding_values = [
            value for key, value in raw_headers if key.lower() == b"transfer-encoding"
        ]
        # Varias cabeceras Content-Length hacen ambiguo qué tamaño procesan el proxy,
        # el servidor ASGI y la aplicación. Se rechazan antes de leer el cuerpo.
        if len(content_length_values) > 1:
            await self._send_json_error(send, 400, "Cabecera Content-Length duplicada")
            return

        # Content-Length y Transfer-Encoding describen dos encuadres de cuerpo distintos.
        # Aceptarlos juntos permitiría que el proxy y la aplicación discrepasen sobre dónde
        # termina la petición, por lo que se rechaza la combinación antes de leer el cuerpo.
        if content_length_values and transfer_encoding_values:
            await self._send_json_error(
                send,
                400,
                "Content-Length y Transfer-Encoding no pueden enviarse juntos",
            )
            return

        content_length_value = content_length_values[0] if content_length_values else None
        if content_length_value is not None:
            try:
                content_length = int(content_length_value.decode("ascii"))
            except (UnicodeDecodeError, ValueError):
                await self._send_json_error(send, 400, "Cabecera Content-Length no válida")
                return

            if content_length < 0:
                await self._send_json_error(send, 400, "Cabecera Content-Length no válida")
                return

            if content_length > rule.max_bytes:
                logger.warning(
                    "Cuerpo de solicitud rechazado antes del parseo | ruta=%s | bytes=%s | máximo=%s",
                    path,
                    content_length,
                    rule.max_bytes,
                )
                await self._send_json_error(send, 413, "La solicitud excede el tamaño máximo permitido")
                return

        received_bytes = 0
        response_started = False

        async def limited_receive() -> Message:
            nonlocal received_bytes
            message = await receive()
            if message["type"] == "http.request":
                received_bytes += len(message.get("body", b""))
                if received_bytes > rule.max_bytes:
                    raise RequestBodyTooLarge
            return message

        async def tracked_send(message: Message) -> None:
            nonlocal response_started
            if message["type"] == "http.response.start":
                response_started = True
            await send(message)

        try:
            await self.app(scope, limited_receive, tracked_send)
        except RequestBodyTooLarge:
            logger.warning(
                "Cuerpo de solicitud rechazado durante la lectura | ruta=%s | bytes>%s",
                path,
                rule.max_bytes,
            )
            if not response_started:
                await self._send_json_error(send, 413, "La solicitud excede el tamaño máximo permitido")
                return
            raise

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
                    (b"cache-control", b"no-store"),
                ],
            }
        )
        await send({"type": "http.response.body", "body": body})

    @staticmethod
    def _normalize_path(path: str) -> str:
        normalized = path.rstrip("/")
        return normalized or "/"
