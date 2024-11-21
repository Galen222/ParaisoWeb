# backend/core/auth_utils.py

"""
core/auth_utils.py

Módulo de utilidades para la generación y verificación de tokens temporales.

Este módulo incluye:
- Generación de tokens seguros basados en HMAC y SHA-256.
- Verificación de tokens con una ventana de tiempo tolerante para evitar errores
  debido a desincronizaciones entre cliente y servidor.

Dependencias:
- Configuración: Utiliza valores como `secret_key` y `token_interval_seconds` definidos en `settings`.
"""

import time
import hmac
import hashlib
import base64
from .config import settings

def generate_timed_token() -> str:
    """
    Genera un token temporal basado en un intervalo de tiempo fijo.

    Este token es generado utilizando HMAC con SHA-256, y está codificado en base64
    para facilitar su uso en encabezados o URLs. Cambia automáticamente en función
    del intervalo de tiempo definido en la configuración.

    Returns:
        str: Token temporal codificado en base64.

    Ejemplo:
        >>> token = generate_timed_token()
        >>> print(token)
    """
    interval = int(time.time()) // settings.token_interval_seconds
    message = f"{interval}".encode()
    key = settings.secret_key.encode()
    token_bytes = hmac.new(key, message, hashlib.sha256).digest()
    token_encoded = base64.urlsafe_b64encode(token_bytes).decode()
    return token_encoded

def verify_timed_token(token: str) -> bool:
    """
    Verifica si el token proporcionado es válido dentro de una ventana de tiempo definida.

    Este método verifica el token para el intervalo de tiempo actual y el anterior,
    permitiendo tolerancia en caso de desincronizaciones menores.

    Args:
        token (str): Token temporal a verificar.

    Returns:
        bool: True si el token es válido, False en caso contrario.

    Ejemplo:
        >>> is_valid = verify_timed_token("mi_token")
        >>> print(is_valid)
    """
    current_interval = int(time.time()) // settings.token_interval_seconds
    key = settings.secret_key.encode()

    # Verificar el token para el intervalo actual y el anterior
    for interval in [current_interval, current_interval - 1]:
        message = f"{interval}".encode()
        expected_token_bytes = hmac.new(key, message, hashlib.sha256).digest()
        expected_token = base64.urlsafe_b64encode(expected_token_bytes).decode()
        if hmac.compare_digest(token, expected_token):
            return True
    return False
