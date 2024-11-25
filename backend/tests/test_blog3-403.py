"""
test_blog3-403.py

Script para probar el endpoint de detalle de blog por ID con un token inválido.
Verifica que se reciba un error 403 cuando se proporciona un token inválido.

Dependencias:
- requests: Para realizar peticiones HTTP.
- test_settings: Configuración común para los tests.
"""

import requests
import sys
from .test_settings import API_CONFIG

def test_blog_by_id_token_invalido():
    """
    Realiza una petición GET al endpoint de detalle de blog por ID con un token inválido.
    Este endpoint requiere tanto un ID numérico como un parámetro de idioma.
    Verifica que se reciba un error 403 Forbidden.
    """
    # ID de ejemplo para la prueba
    test_id = 1
    
    # URL del endpoint
    url = f"{API_CONFIG['base_url']}/blog/by-id/{test_id}"
    
    # Parámetros de query requeridos
    params = {
        "idioma": "es"  # El idioma es obligatorio para este endpoint
    }
    
    # Headers con token inválido
    headers = {
        **API_CONFIG['default_headers'],
        'x-timed-token': 'token_invalido_123'
    }
    
    try:
        # Realizar petición con token inválido
        response = requests.get(url, params=params, headers=headers)
        
        # Verificar el código de respuesta
        if response.status_code == 403:
            print("✅ Test exitoso: Se recibió el error 403 esperado")
            print(f"Mensaje: {response.json().get('detail')}")
        else:
            print(f"❌ Test fallido: Se esperaba código 403, se recibió {response.status_code}")
            print(f"Respuesta: {response.text}")
            sys.exit(1)
            
    except requests.RequestException as e:
        print(f"❌ Error al realizar la petición: {e}")
        sys.exit(1)

if __name__ == "__main__":
    test_blog_by_id_token_invalido()