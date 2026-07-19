"""Configuración centralizada del destino y formato de los logs."""

from __future__ import annotations

import logging
import logging.config
import os
from pathlib import Path
from typing import Protocol


class LoggingSettings(Protocol):
    """Atributos de configuración necesarios para inicializar logging."""

    BACKEND_LOG_TARGET: str
    BACKEND_LOG_DIR: str
    BACKEND_LOG_MAX_BYTES: int
    BACKEND_LOG_BACKUP_COUNT: int

    @property
    def backend_log_level(self) -> str: ...


def _truncate_utf8(value: str, max_bytes: int) -> str:
    """Recorta sin dividir puntos de código ni producir UTF-8 inválido."""
    if max_bytes <= 0:
        return ""
    if len(value.encode("utf-8")) <= max_bytes:
        return value

    suffix = "…"
    suffix_bytes = len(suffix.encode("utf-8"))
    content_budget = max(0, max_bytes - suffix_bytes)
    output: list[str] = []
    used_bytes = 0

    for character in value:
        character_bytes = len(character.encode("utf-8"))
        if used_bytes + character_bytes > content_budget:
            break
        output.append(character)
        used_bytes += character_bytes

    if suffix_bytes <= max_bytes:
        output.append(suffix)
    return "".join(output)


class BoundedFileFormatter(logging.Formatter):
    """Impide que una sola entrada supere el tamaño máximo del archivo."""

    def __init__(self, *args: object, max_bytes: int, **kwargs: object) -> None:
        super().__init__(*args, **kwargs)
        self.max_bytes = max_bytes

    def format(self, record: logging.LogRecord) -> str:
        formatted = super().format(record)
        terminator_bytes = len(os.linesep.encode("utf-8"))
        return _truncate_utf8(formatted, max(0, self.max_bytes - terminator_bytes))


class ConsoleFormatter(logging.Formatter):
    """Añade color por nivel únicamente a la salida interactiva de desarrollo."""

    COLORS = {
        logging.DEBUG: "\033[36m",
        logging.INFO: "\033[32m",
        logging.WARNING: "\033[33m",
        logging.ERROR: "\033[31m",
        logging.CRITICAL: "\033[35m",
    }
    RESET = "\033[0m"

    def format(self, record: logging.LogRecord) -> str:
        formatted = super().format(record)
        color = self.COLORS.get(record.levelno)
        return f"{color}{formatted}{self.RESET}" if color else formatted


def _resolve_log_directory(configured_directory: str) -> Path:
    """Resuelve rutas relativas desde la raíz del proyecto, no desde el proceso."""
    directory = Path(configured_directory).expanduser()
    if directory.is_absolute():
        return directory
    return Path(__file__).resolve().parents[1] / directory


def configure_logging(settings: LoggingSettings) -> None:
    """Configura consola o ``backend.log`` según ``BACKEND_LOG_TARGET``."""
    writes_to_file = settings.BACKEND_LOG_TARGET == "archivo"
    handlers: dict[str, dict[str, object]]

    if writes_to_file:
        log_directory = _resolve_log_directory(settings.BACKEND_LOG_DIR)
        log_directory.mkdir(parents=True, exist_ok=True)
        handlers = {
            "application": {
                "class": "logging.handlers.RotatingFileHandler",
                "formatter": "file",
                "filename": str(log_directory / "backend.log"),
                "maxBytes": settings.BACKEND_LOG_MAX_BYTES,
                "backupCount": settings.BACKEND_LOG_BACKUP_COUNT,
                "encoding": "utf-8",
                "delay": True,
            }
        }
    else:
        handlers = {
            "application": {
                "class": "logging.StreamHandler",
                "formatter": "console",
                "stream": "ext://sys.stdout",
            }
        }

    logging.config.dictConfig(
        {
            "version": 1,
            "disable_existing_loggers": False,
            "formatters": {
                "console": {
                    "()": ConsoleFormatter,
                    "format": "%(asctime)s | %(levelname)s | %(name)s | %(message)s",
                    "datefmt": "%Y-%m-%d %H:%M:%S",
                },
                "file": {
                    "()": BoundedFileFormatter,
                    "format": "%(asctime)s | %(levelname)s | %(name)s | %(message)s",
                    "datefmt": "%Y-%m-%dT%H:%M:%S%z",
                    "max_bytes": settings.BACKEND_LOG_MAX_BYTES,
                },
            },
            "handlers": handlers,
            "root": {
                "handlers": ["application"],
                "level": settings.backend_log_level,
            },
            "loggers": {
                # El middleware propio ya registra accesos con duración y detalle seguro.
                "uvicorn.access": {
                    "handlers": [],
                    "propagate": False,
                    "disabled": True,
                },
                "uvicorn.error": {
                    "handlers": ["application"],
                    "level": settings.backend_log_level,
                    "propagate": False,
                },
            },
        }
    )
