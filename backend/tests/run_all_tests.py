"""Ejecuta de forma reproducible toda la suite automatizada del backend.

Uso desde la raíz del proyecto:
    python -m backend.tests.run_all_tests

También se invoca desde ``frontend/package.json`` mediante ``npm run test``.
"""

from __future__ import annotations

import os
import sys
import unittest
from pathlib import Path


def configure_quiet_test_logging() -> None:
    """Silencia logs esperados sin ocultar fallos reales de ``unittest``.

    Estas variables solo afectan al proceso que ejecuta la suite. Producción y
    desarrollo siguen usando sus propios valores de entorno sin modificación.
    """
    os.environ["BACKEND_LOG_TARGET"] = "consola"
    os.environ["BACKEND_LOG_LEVEL"] = "CRITICAL"
    os.environ["BACKEND_LOG_HEALTHCHECKS"] = "False"


def build_suite() -> unittest.TestSuite:
    """Descubre todos los módulos ``test_*.py`` del paquete backend.tests."""
    project_root = Path(__file__).resolve().parents[2]
    tests_directory = project_root / "backend" / "tests"

    return unittest.defaultTestLoader.discover(
        start_dir=str(tests_directory),
        pattern="test_*.py",
        top_level_dir=str(project_root),
    )


def main() -> int:
    """Ejecuta la suite completa y devuelve un código de salida apto para CI."""
    configure_quiet_test_logging()
    result = unittest.TextTestRunner(verbosity=2).run(build_suite())
    return 0 if result.wasSuccessful() else 1


if __name__ == "__main__":
    sys.exit(main())
