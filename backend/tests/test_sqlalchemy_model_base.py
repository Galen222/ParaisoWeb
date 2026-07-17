"""Prueba de regresión para la creación de la base declarativa de SQLAlchemy."""

from pathlib import Path
import subprocess
import sys
import unittest


class SqlAlchemyModelBaseTests(unittest.TestCase):
    def test_models_importa_sin_avisos_obsoletos(self) -> None:
        project_root = Path(__file__).resolve().parents[2]
        result = subprocess.run(
            [sys.executable, "-W", "error", "-c", "import backend.models.models"],
            cwd=project_root,
            capture_output=True,
            text=True,
            check=False,
        )

        self.assertEqual(result.returncode, 0, result.stderr)


if __name__ == "__main__":
    unittest.main()
