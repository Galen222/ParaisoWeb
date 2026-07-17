"""Regresiones de separación de logs entre desarrollo y producción."""

from backend.tests import _environment as _test_environment  # noqa: F401

import logging
from logging.handlers import RotatingFileHandler
from pathlib import Path
from tempfile import TemporaryDirectory
from types import SimpleNamespace
import unittest

from backend.core.config import settings
from backend.core.logging_config import configure_logging


class EnvironmentLoggingTests(unittest.TestCase):
    def tearDown(self) -> None:
        """Restaura la configuración habitual de los tests tras modificar el logger raíz."""
        configure_logging(settings)

    def test_produccion_escribe_backend_log_rotado_sin_ansi(self) -> None:
        with TemporaryDirectory() as directory:
            production_settings = SimpleNamespace(
                APP_ENV="production",
                BACKEND_LOG_DIR=directory,
                BACKEND_LOG_MAX_BYTES=180,
                BACKEND_LOG_BACKUP_COUNT=2,
                backend_log_level="DEBUG",
            )
            configure_logging(production_settings)

            root_logger = logging.getLogger()
            self.assertEqual(len(root_logger.handlers), 1)
            handler = root_logger.handlers[0]
            self.assertIsInstance(handler, RotatingFileHandler)
            self.assertEqual(Path(handler.baseFilename).name, "backend.log")

            for index in range(8):
                root_logger.info("entrada-%s-%s", index, "x" * 60)
            handler.flush()

            log_files = sorted(Path(directory).glob("backend.log*"))
            self.assertTrue((Path(directory) / "backend.log").exists())
            self.assertTrue((Path(directory) / "backend.log.1").exists())
            self.assertLessEqual(len(log_files), 3)
            combined = "\n".join(path.read_text(encoding="utf-8") for path in log_files)
            self.assertNotIn("\x1b[", combined)

    def test_desarrollo_usa_consola_y_no_filehandler(self) -> None:
        development_settings = SimpleNamespace(
            APP_ENV="development",
            BACKEND_LOG_DIR="logs",
            BACKEND_LOG_MAX_BYTES=1024,
            BACKEND_LOG_BACKUP_COUNT=1,
            backend_log_level="DEBUG",
        )
        configure_logging(development_settings)

        root_handler = logging.getLogger().handlers[0]
        self.assertIsInstance(root_handler, logging.StreamHandler)
        self.assertNotIsInstance(root_handler, RotatingFileHandler)

    def test_nombres_y_valores_por_defecto_de_logging(self) -> None:
        self.assertEqual(settings.backend_log_level, "DEBUG")
        self.assertTrue(settings.backend_log_healthchecks)
