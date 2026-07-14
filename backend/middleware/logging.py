# backend/middleware/logging.py

"""
middleware/logging.py

Middleware para logging detallado de peticiones HTTP en FastAPI.

Este módulo proporciona un middleware personalizado para FastAPI que implementa
logging detallado de todas las peticiones HTTP y sus respuestas. Incluye:
- Logs coloreados para distinguir entre éxitos y errores
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

import datetime  # Importar datetime para obtener la hora actual
import json
import logging
import time
from http import HTTPStatus
from typing import AsyncIterator, Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

# Códigos ANSI para colorear la salida en terminal
ANSI_GREEN = "\033[32m"  # Color verde para éxitos
ANSI_RED = "\033[31m"    # Color rojo para errores
ANSI_RESET = "\033[0m"   # Resetear colores a los por defecto

# Límite del cuerpo usado únicamente para describir errores en logs.
# La respuesta completa continúa enviándose al cliente sin almacenarla en memoria.
MAX_ERROR_LOG_BODY_BYTES = 8 * 1024

# Configurar loggers
# Desactivar solo los logs de acceso de Uvicorn
logging.getLogger("uvicorn.access").disabled = True

# Configurar el logger personalizado
logger = logging.getLogger("custom_middleware")
logger.propagate = False
logger.setLevel(logging.INFO)


def get_status_text(status_code: int) -> str:
    """
    Obtiene el texto descriptivo del código de estado HTTP y lo colorea según sea éxito o error.

    Args:
        status_code (int): Código de estado HTTP (ej: 200, 404, 500)

    Returns:
        str: Texto formateado y coloreado del estado HTTP (ej: "200 OK" en verde)

    Example:
        >>> get_status_text(200)
        '[verde]200 OK[/verde]'
        >>> get_status_text(404)
        '[rojo]404 Not Found[/rojo]'
    """
    try:
        status = HTTPStatus(status_code)
        if status_code < 400:
            return f"{ANSI_GREEN}{status_code} {status.phrase}{ANSI_RESET}"
        return f"{ANSI_RED}{status_code} {status.phrase}{ANSI_RESET}"
    except ValueError:
        return str(status_code)


class ColoredFormatter(logging.Formatter):
    """
    Formateador personalizado para colorear los mensajes de log.

    Este formateador añade prefijos coloreados a los mensajes según su nivel:
    - INFO: Prefijo verde "INFO-LOG:"
    - ERROR: Prefijo rojo "ERROR-LOG:"

    """

    def format(self, record: logging.LogRecord) -> str:
        """
        Formatea un registro de log añadiendo colores según su nivel.

        Args:
            record: Registro de logging a formatear

        Returns:
            str: Mensaje formateado con los colores apropiados
        """
        message = super().format(record)
        if record.levelno == logging.ERROR:
            return f"{ANSI_RED}ERROR-LOG{ANSI_RESET}: {message}"
        if record.levelno == logging.INFO:
            return f"{ANSI_GREEN}INFO-LOG{ANSI_RESET}: {message}"
        return message


# Configurar el handler con el formateador personalizado una sola vez.
# Evita mensajes duplicados al recargar la aplicación o importar el módulo en tests.
if not logger.handlers:
    handler = logging.StreamHandler()
    handler.setFormatter(ColoredFormatter())
    logger.addHandler(handler)


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


def get_error_message(response_body: bytes, truncated: bool) -> str:
    """Obtiene un detalle seguro y acotado para el log sin alterar la respuesta."""
    decoded_body = response_body.decode("utf-8", errors="replace")

    try:
        parsed_body = json.loads(decoded_body)
    except json.JSONDecodeError:
        error_message = decoded_body.strip() or "No detail provided"
    else:
        if isinstance(parsed_body, dict):
            detail = parsed_body.get("detail", "No detail provided")
            if isinstance(detail, str):
                error_message = detail
            elif isinstance(detail, list):
                # FastAPI incluye el valor recibido en los errores 422. Solo se registran
                # ubicación y tipo para conservar diagnóstico sin filtrar nombre, correo o mensaje.
                error_message = _summarize_validation_detail(detail)
            else:
                error_message = "Detalle de error estructurado"
        elif isinstance(parsed_body, str):
            error_message = parsed_body
        else:
            error_message = "Respuesta de error estructurada"

    if truncated:
        return f"{error_message} [detalle truncado]"
    return error_message


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

    Los logs se colorean según el tipo de respuesta:
    - Verde para respuestas exitosas (2xx)
    - Rojo para errores (4xx, 5xx)
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
        client_host = request.client.host if request.client else "unknown"
        current_time = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")  # Hora actual

        try:
            # Procesar la petición
            response = await call_next(request)
        except Exception:
            # Las excepciones sin respuesta HTTP también deben quedar registradas.
            process_time = time.time() - start_time
            logger.exception(
                f"CURRENT TIME: {current_time} | "
                f"HOST: {client_host} | "
                f"METHOD: {request.method} | "
                f"PATH: {request.url.path} | "
                f"STATUS: {ANSI_RED}500 Internal Server Error{ANSI_RESET} | "
                f"{ANSI_RED}ERROR{ANSI_RESET}: Excepción no controlada | "
                f"TIME: {process_time:.2f}s"
            )
            raise

        # Obtener el estado HTTP formateado con colores
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
                    error_message = get_error_message(bytes(response_preview), truncated)
                    logger.error(
                        f"CURRENT TIME: {current_time} | "
                        f"HOST: {client_host} | "
                        f"METHOD: {request.method} | "
                        f"PATH: {request.url.path} | "
                        f"STATUS: {status_text} | "
                        f"{ANSI_RED}ERROR{ANSI_RESET}: {error_message} | "
                        f"TIME: {process_time:.2f}s"
                    )

            response.body_iterator = iter_and_log_error()
            return response

        process_time = time.time() - start_time
        logger.info(
            f"CURRENT TIME: {current_time} | "
            f"HOST: {client_host} | "
            f"METHOD: {request.method} | "
            f"PATH: {request.url.path} | "
            f"STATUS: {status_text} | "
            f"TIME: {process_time:.2f}s"
        )

        return response
