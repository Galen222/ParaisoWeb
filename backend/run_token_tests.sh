#!/bin/bash

echo ""
echo "Ejecutando todos los tests..."
python -m tests.run_all_token_tests
if [ $? -eq 0 ]; then
    echo "Todos los tests pasaron"
    exit 0
else
    echo "Tests fallidos"
    exit 1
fi