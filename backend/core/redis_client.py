# backend/core/redis_client.py

"""
redis_client.py

Módulo de configuración del cliente Redis asíncrono.

Este módulo incluye:
- Creación de un pool Redis independiente para cada worker de Uvicorn.
- Configuración de tiempos máximos y comprobación de conexiones inactivas.
- Uso de un almacén compartido para que todos los procesos consulten las mismas claves.

Aunque cada worker mantiene su propio pool de conexiones, Redis centraliza los
contadores utilizados por el rate limiting distribuido.
"""

from redis.asyncio import Redis

from .config import Settings


def create_redis_client(settings: Settings) -> Redis:
    """
    Crea el cliente Redis asíncrono del proceso Uvicorn actual.

    Args:
        settings (Settings): Configuración validada de la aplicación.

    Returns:
        Redis: Cliente respaldado por un pool de conexiones propio del worker.
    """
    return Redis.from_url(
        settings.REDIS_URL,
        decode_responses=False,  # Conserva respuestas binarias compatibles con los scripts Lua
        socket_connect_timeout=settings.REDIS_CONNECT_TIMEOUT_SECONDS,
        socket_timeout=settings.REDIS_SOCKET_TIMEOUT_SECONDS,
        health_check_interval=settings.REDIS_HEALTHCHECK_INTERVAL_SECONDS,
        max_connections=settings.REDIS_MAX_CONNECTIONS,
    )
