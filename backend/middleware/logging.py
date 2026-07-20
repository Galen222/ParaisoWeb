# backend/middleware/logging.py

"""
middleware/logging.py

Middleware para logging detallado de peticiones HTTP en FastAPI.

Este módulo proporciona un middleware personalizado para FastAPI que implementa
logging detallado de todas las peticiones HTTP y sus respuestas. Incluye:
- Destino y formato distintos para desarrollo y producción
- Información detallada de cada petición y respuesta
- Tiempos de proceso
- Detalles específicos de errores cuando ocurren
- Formateo consistente y legible de la salida

Example:
    Para usar este middleware en tu aplicación FastAPI:

    ```python
    from fastapi import FastAPI
    from .middleware.logging import LoggingMiddleware

    app = FastAPI()
    app.add_middleware(LoggingMiddleware)
    ```
"""

import json
import logging
import time
import unicodedata
from http import HTTPStatus
from typing import AsyncIterator, Callable

from fastapi import Request, Response

from ..core.config import settings
from starlette.middleware.base import BaseHTTPMiddleware

# Límite del cuerpo usado únicamente para describir errores en logs.
# La respuesta completa continúa enviándose al cliente sin almacenarla en memoria.
MAX_ERROR_LOG_BODY_BYTES = 8 * 1024

# El handler, el nivel y el destino se configuran una sola vez al arrancar la API.
logger = logging.getLogger(__name__)


def get_status_text(status_code: int) -> str:
    """Obtiene el texto descriptivo de un código HTTP sin introducir colores en archivos."""
    try:
        status = HTTPStatus(status_code)
        return f"{status_code} {status.phrase}"
    except ValueError:
        return str(status_code)



def sanitize_log_value(value: object, max_length: int = 1000) -> str:
    """Neutraliza controles y saltos de línea sin eliminar la información diagnóstica."""
    sanitized: list[str] = []
    for character in str(value):
        category = unicodedata.category(character)
        if character in {"\r", "\n", "\t"} or category.startswith("C") or category in {"Zl", "Zp"}:
            sanitized.append(" ")
        else:
            sanitized.append(character)

    compact = " ".join("".join(sanitized).split())
    if len(compact) > max_length:
        return f"{compact[:max_length]}…"
    return compact

def _summarize_validation_detail(detail: list[object]) -> str:
    """Resume errores de validación sin registrar los valores enviados por el cliente."""
    summaries: list[str] = []

    for item in detail:
        if not isinstance(item, dict):
            continue

        raw_location = item.get("loc")
        if isinstance(raw_location, (list, tuple)):
            location = ".".join(str(part) for part in raw_location)
        else:
            location = "campo desconocido"

        error_type = item.get("type")
        if isinstance(error_type, str) and error_type:
            summaries.append(f"{location} ({error_type})")
        else:
            summaries.append(location)

    if not summaries:
        return "Error de validación"

    return f"Errores de validación: {', '.join(summaries[:10])}"


def _summarize_operational_error(payload: dict[object, object]) -> str | None:
    """Resume únicamente estados operativos conocidos sin registrar contenido arbitrario."""
    status = payload.get("status")
    database = payload.get("database")
    if isinstance(status, str) and isinstance(database, str):
        return f"status={status}, database={database}"
    return None


def get_error_message(
    response_body: bytes,
    truncated: bool,
    fallback_message: str = "No detail provided",
) -> str:
    """Obtiene un detalle seguro y acotado para el log sin alterar la respuesta."""
    decoded_body = response_body.decode("utf-8", errors="replace")

    try:
        parsed_body = json.loads(decoded_body)
    except json.JSONDecodeError:
        error_message = decoded_body.strip() or fallback_message
    else:
        if isinstance(parsed_body, dict):
            detail = parsed_body.get("detail")
            if isinstance(detail, str):
                error_message = detail
            elif isinstance(detail, list):
                # FastAPI incluye el valor recibido en los errores 422. Solo se registran
                # ubicación y tipo para conservar diagnóstico sin filtrar nombre, correo o mensaje.
                error_message = _summarize_validation_detail(detail)
            elif detail is not None:
                error_message = "Detalle de error estructurado"
            else:
                error_message = _summarize_operational_error(parsed_body) or fallback_message
        elif isinstance(parsed_body, str):
            error_message = parsed_body
        else:
            error_message = "Respuesta de error estructurada"

    if truncated:
        error_message = f"{error_message} [detalle truncado]"
    return sanitize_log_value(error_message)


class LoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware que implementa logging detallado para peticiones HTTP en FastAPI.

    Este middleware intercepta todas las peticiones HTTP y registra información
    detallada sobre las mismas, incluyendo:
    - Dirección IP del cliente
    - Método HTTP
    - Ruta de la petición
    - Código de estado de la respuesta
    - Tiempo de proceso
    - Detalles específicos de errores cuando ocurren

    El formato y el destino final se deciden en la configuración centralizada.
    """

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """
        Procesa una petición HTTP y registra información detallada sobre la misma.

        Args:
            request (Request): Objeto Request de FastAPI con los detalles de la petición
            call_next (Callable): Función para procesar la siguiente parte del middleware

        Returns:
            Response: Objeto Response de FastAPI con la respuesta HTTP

        Este método:
        1. Registra el tiempo de inicio
        2. Procesa la petición
        3. Calcula el tiempo de proceso
        4. Registra la información según el resultado:
           - Para respuestas exitosas: información básica
           - Para errores: información detallada incluyendo el mensaje de error
        """
        # Capturar tiempo de inicio y datos básicos de la petición
        start_time = time.time()
        client_host = sanitize_log_value(request.client.host if request.client else "unknown")
        request_method = sanitize_log_value(request.method, max_length=32)
        request_path = sanitize_log_value(request.url.path)

        try:
            # Procesar la petición
            response = await call_next(request)
        except Exception:
            # Las excepciones sin respuesta HTTP también deben quedar registradas.
            process_time = time.time() - start_time
            logger.exception(
                f"HOST: {client_host} | "
                f"METHOD: {request_method} | "
                f"PATH: {request_path} | "
                "STATUS: 500 Internal Server Error | "
                "ERROR: Excepción no controlada | "
                f"TIME: {process_time:.2f}s"
            )
            raise

        # Obtener el texto legible del estado HTTP
        status_text = get_status_text(response.status_code)

        # Si es una respuesta de error (4xx o 5xx), conserva el streaming original y
        # recoge solo una vista previa acotada para el log. No reconstruye la respuesta.
        if response.status_code >= 400:
            original_body_iterator = response.body_iterator

            async def iter_and_log_error() -> AsyncIterator[bytes]:
                response_preview = bytearray()
                truncated = False

                try:
                    async for chunk in original_body_iterator:
                        # Starlette puede entregar fragmentos como bytes o str. Normalizarlos
                        # a bytes mantiene el contrato de body_iterator y evita devolver str.
                        chunk_bytes: bytes
                        if isinstance(chunk, bytes):
                            chunk_bytes = chunk
                        elif isinstance(chunk, str):
                            chunk_bytes = chunk.encode("utf-8")
                        else:
                            chunk_bytes = bytes(chunk)

                        remaining = MAX_ERROR_LOG_BODY_BYTES - len(response_preview)
                        if remaining > 0:
                            response_preview.extend(chunk_bytes[:remaining])
                        if len(chunk_bytes) > max(remaining, 0):
                            truncated = True
                        yield chunk_bytes
                finally:
                    process_time = time.time() - start_time
                    error_message = get_error_message(
                        bytes(response_preview),
                        truncated,
                        fallback_message=status_text,
                    )
                    logger.error(
                        f"HOST: {client_host} | "
                        f"METHOD: {request_method} | "
                        f"PATH: {request_path} | "
                        f"STATUS: {status_text} | "
                        f"ERROR: {error_message} | "
                        f"TIME: {process_time:.2f}s"
                    )

            response.body_iterator = iter_and_log_error()
            return response

        process_time = time.time() - start_time
        is_successful_healthcheck = request_path in {"/health", "/livez"}
        if settings.backend_log_healthchecks or not is_successful_healthcheck:
            logger.info(
                f"HOST: {client_host} | "
                f"METHOD: {request_method} | "
                f"PATH: {request_path} | "
                f"STATUS: {status_text} | "
                f"TIME: {process_time:.2f}s"
            )

        return response
