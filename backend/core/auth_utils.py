# backend/app/core/auth_utils.py

"""
Módulo de utilidades para la generación y verificación de tokens temporales.
"""

import time
import hmac
import hashlib
import base64
import os
from typing import Optional

# Cargar variables de entorno
SECRET_KEY = os.getenv("SECRET_KEY", "clave_secreta_predeterminada")
TOKEN_INTERVAL_SECONDS = int(os.getenv("TOKEN_INTERVAL_SECONDS", "300"))  # 5 minutos por defecto

def generate_timed_token() -> str:
    """
    Genera un token temporal basado en el tiempo actual dividido por el intervalo.

    Returns:
        str: Token temporal codificado en base64.
    """
    interval = int(time.time()) // TOKEN_INTERVAL_SECONDS
    message = f"{interval}".encode()
    key = SECRET_KEY.encode()
    token = hmac.new(key, message, hashlib.sha256).digest()
    return base64.urlsafe_b64encode(token).decode()

def verify_timed_token(token: str) -> bool:
    """
    Verifica si el token proporcionado es válido para el intervalo actual o el anterior.
    Esto permite una ventana de tolerancia para la sincronización de tiempo.

    Args:
        token (str): Token temporal a verificar.

    Returns:
        bool: True si el token es válido, False de lo contrario.
    """
    current_interval = int(time.time()) // TOKEN_INTERVAL_SECONDS
    key = SECRET_KEY.encode()

    # Verificar el token para el intervalo actual y el anterior
    for interval in [current_interval, current_interval - 1]:
        message = f"{interval}".encode()
        expected_token = base64.urlsafe_b64encode(hmac.new(key, message, hashlib.sha256).digest()).decode()
        if hmac.compare_digest(token, expected_token):
            return True
    return False
