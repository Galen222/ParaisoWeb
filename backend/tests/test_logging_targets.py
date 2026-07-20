"""Regresiones del destino de logs independiente del entorno de ejecución."""

from backend.tests import _environment as _test_environment  # noqa: F401

import logging
from logging.handlers import RotatingFileHandler
from dataclasses import dataclass
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest

from backend.core.config import settings
from backend.core.logging_config import configure_logging


@dataclass(frozen=True)
class _LoggingSettings:
    BACKEND_LOG_TARGET: str
    BACKEND_LOG_DIR: str
    BACKEND_LOG_MAX_BYTES: int
    BACKEND_LOG_BACKUP_COUNT: int
    backend_log_level: str


class LoggingTargetTests(unittest.TestCase):
    def tearDown(self) -> None:
        """Restaura la configuración habitual de los tests tras modificar el logger raíz."""
        configure_logging(settings)

    def test_archivo_escribe_backend_log_rotado_aunque_el_entorno_sea_desarrollo(self) -> None:
        with TemporaryDirectory() as directory:
            file_settings = _LoggingSettings(
                BACKEND_LOG_TARGET="archivo",
                BACKEND_LOG_DIR=directory,
                BACKEND_LOG_MAX_BYTES=180,
                BACKEND_LOG_BACKUP_COUNT=2,
                backend_log_level="DEBUG",
            )
            configure_logging(file_settings)

            root_logger = logging.getLogger()
            self.assertEqual(len(root_logger.handlers), 1)
            handler = root_logger.handlers[0]
            self.assertIsInstance(handler, RotatingFileHandler)
            assert isinstance(handler, RotatingFileHandler)
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


    def test_una_entrada_sobredimensionada_respeta_el_limite_del_archivo(self) -> None:
        with TemporaryDirectory() as directory:
            max_bytes = 180
            file_settings = _LoggingSettings(
                BACKEND_LOG_TARGET="archivo",
                BACKEND_LOG_DIR=directory,
                BACKEND_LOG_MAX_BYTES=max_bytes,
                BACKEND_LOG_BACKUP_COUNT=2,
                backend_log_level="INFO",
            )
            configure_logging(file_settings)

            root_logger = logging.getLogger()
            root_logger.error("entrada-%s", "🙂" * 5000)
            handler = root_logger.handlers[0]
            handler.flush()

            log_path = Path(directory) / "backend.log"
            contents = log_path.read_text(encoding="utf-8")
            self.assertLessEqual(log_path.stat().st_size, max_bytes)
            self.assertNotIn("�", contents)
            self.assertTrue(contents.endswith("\n"))

    def test_consola_no_crea_filehandler_aunque_el_entorno_sea_produccion(self) -> None:
        console_settings = _LoggingSettings(
            BACKEND_LOG_TARGET="consola",
            BACKEND_LOG_DIR="logs",
            BACKEND_LOG_MAX_BYTES=1024,
            BACKEND_LOG_BACKUP_COUNT=1,
            backend_log_level="INFO",
        )
        configure_logging(console_settings)

        root_handler = logging.getLogger().handlers[0]
        self.assertIsInstance(root_handler, logging.StreamHandler)
        self.assertNotIsInstance(root_handler, RotatingFileHandler)

    def test_nombres_y_valores_por_defecto_de_logging(self) -> None:
        self.assertEqual(settings.BACKEND_LOG_TARGET, "consola")
        self.assertEqual(settings.backend_log_level, "DEBUG")
        self.assertTrue(settings.backend_log_healthchecks)
