@echo off

echo.
echo Ejecutando todos los tests...
python -m tests.run_all_token_tests
if errorlevel 1 (
    echo Tests fallidos
    exit /b 1
) else (
    echo Todos los tests pasaron
    exit /b 0
)