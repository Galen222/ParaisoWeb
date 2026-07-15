"""Cabeceras de caché seguras para respuestas de la API backend."""

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.responses import Response


class ApiNoStoreMiddleware(BaseHTTPMiddleware):
    """Impide que navegadores o proxies compartidos reutilicen respuestas de `/api`."""

    async def dispatch(
        self,
        request: Request,
        call_next: RequestResponseEndpoint,
    ) -> Response:
        response = await call_next(request)
        path = request.url.path.rstrip("/") or "/"

        if path == "/api" or path.startswith("/api/"):
            response.headers["Cache-Control"] = "no-store, max-age=0"
            response.headers["Pragma"] = "no-cache"

        return response
