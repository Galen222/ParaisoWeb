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

import logging
from fastapi import Request, Response
import time
from starlette.middleware.base import BaseHTTPMiddleware
from typing import Callable
import json
from http import HTTPStatus

# Códigos ANSI para colorear la salida en terminal
ANSI_GREEN = "\033[32m"  # Color verde para éxitos
ANSI_RED = "\033[31m"    # Color rojo para errores
ANSI_RESET = "\033[0m"   # Resetear colores a los por defecto

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
        else:
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
    def format(self, record):
        """
        Formatea un registro de log añadiendo colores según el nivel.

        Args:
            record: Registro de logging a formatear

        Returns:
            str: Mensaje formateado con los colores apropiados
        """
        if record.levelno == logging.ERROR:
            return f"{ANSI_RED}ERROR-LOG:{ANSI_RESET} {record.getMessage()}"
        elif record.levelno == logging.INFO:
            return f"{ANSI_GREEN}INFO-LOG:{ANSI_RESET} {record.getMessage()}"
        return record.getMessage()

# Configurar el logger personalizado
logger = logging.getLogger("custom_middleware")
logger.propagate = False  # Evitar que los mensajes se propaguen al logger raíz
logger.setLevel(logging.INFO)

# Configurar el handler con el formateador personalizado
handler = logging.StreamHandler()
handler.setFormatter(ColoredFormatter())
logger.addHandler(handler)

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
    - Detalles de error (en caso de respuestas 4xx o 5xx)

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
        
        # Procesar la petición
        response = await call_next(request)
        process_time = time.time() - start_time
        
        # Obtener el estado HTTP formateado con colores
        status_text = get_status_text(response.status_code)
        
        # Si es una respuesta de error (4xx o 5xx)
        if response.status_code >= 400:
            # Leer y restaurar el body de la respuesta para obtener detalles del error
            response_body = b""
            async for chunk in response.body_iterator:
                response_body += chunk
            
            # Decodificar el contenido JSON para obtener el mensaje de error
            try:
                error_detail = json.loads(response_body.decode())
                error_message = error_detail.get('detail', 'No detail provided')
            except json.JSONDecodeError:
                error_message = response_body.decode()
            
            # Registrar el error con todos los detalles
            logger.error(
                f"HOST: {client_host} | "
                f"METHOD: {request.method} | "
                f"PATH: {request.url.path} | "
                f"STATUS: {status_text} | "
                f"{ANSI_RED}ERROR:{ANSI_RESET} {error_message} | "
                f"TIME: {process_time:.2f}s"
            )
            
            # Crear una nueva respuesta con el mismo contenido
            return Response(
                content=response_body,
                status_code=response.status_code,
                headers=dict(response.headers),
                media_type=response.media_type
            )
        else:
            # Log para respuestas exitosas
            logger.info(
                f"HOST: {client_host} | "
                f"METHOD: {request.method} | "
                f"PATH: {request.url.path} | "
                f"STATUS: {status_text} | "
                f"TIME: {process_time:.2f}s"
            )
            
        return response