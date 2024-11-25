"""
test_settings.py

Configuración centralizada para los tests de la API.
Define las constantes y configuraciones utilizadas por los tests.
"""

# Lista de todos los módulos de test
TEST_MODULES = [
    # Tests para error 401 (sin token)
    'test_charcuteria-401',
    'test_blog1-401',
    'test_blog2-401',
    'test_blog3-401',
    'test_contacto-401',
    # Tests para error 403 (token inválido)
    'test_charcuteria-403',
    'test_blog1-403',
    'test_blog2-403',
    'test_blog3-403',
    'test_contacto-403'
]

# Categorías de test y sus descripciones
TEST_CATEGORIES = {
    "401": "Sin token de autenticación",
    "403": "Token de autenticación inválido"
}

# Configuración de la API
API_CONFIG = {
    "base_url": "http://localhost:8000/api",
    "default_headers": {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
}