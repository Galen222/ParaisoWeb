"""
test_settings.py

Configuración centralizada para los tests de la API.
Define las constantes y configuraciones utilizadas por los tests.
"""

# Lista de todos los módulos de test
TEST_MODULES = [
    # Tests para error 401 (sin token)
    "test_charcuteria_unauthorized",
    "test_blog_list_unauthorized",
    "test_blog_by_slug_unauthorized",
    "test_blog_by_id_unauthorized",
    "test_contacto_unauthorized",
    # Tests para error 403 (token inválido)
    "test_charcuteria_forbidden",
    "test_blog_list_forbidden",
    "test_blog_by_slug_forbidden",
    "test_blog_by_id_forbidden",
    "test_contacto_forbidden",
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