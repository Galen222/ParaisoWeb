"""Regresiones de la salida limpia del runner backend."""

from __future__ import annotations

import os
from unittest.mock import patch
import unittest

from backend.tests.run_all_tests import configure_quiet_test_logging


class TestRunnerLoggingTests(unittest.TestCase):
    def test_el_runner_silencia_solo_el_proceso_de_pruebas(self) -> None:
        with patch.dict(
            os.environ,
            {
                "BACKEND_LOG_TARGET": "archivo",
                "BACKEND_LOG_LEVEL": "DEBUG",
                "BACKEND_LOG_HEALTHCHECKS": "True",
            },
            clear=False,
        ):
            configure_quiet_test_logging()

            self.assertEqual(os.environ["BACKEND_LOG_TARGET"], "consola")
            self.assertEqual(os.environ["BACKEND_LOG_LEVEL"], "CRITICAL")
            self.assertEqual(os.environ["BACKEND_LOG_HEALTHCHECKS"], "False")


if __name__ == "__main__":
    unittest.main()
