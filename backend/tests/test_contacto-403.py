"""
test_contacto-403.py

Script para probar el endpoint de contacto con un token inválido.
Verifica que se reciba un error 403 cuando se proporciona un token inválido.

Dependencias:
- requests: Para realizar peticiones HTTP.
- test_settings: Configuración común para los tests.
"""

import requests
import sys
from .test_settings import API_CONFIG

def test_contacto_token_invalido():
    """
    Realiza una petición POST al endpoint de contacto con un token inválido.
    Verifica que se reciba un error 403 Forbidden.
    """
    # URL del endpoint
    url = f"{API_CONFIG['base_url']}/contacto"
    
    # Datos de prueba para el formulario
    data = {
        "name": "Test User",
        "reason": "informacion",
        "email": "test@example.com",
        "message": "Este es un mensaje de prueba"
    }
    
    # Headers con token inválido
    headers = {
        **API_CONFIG['default_headers'],
        'x-timed-token': 'token_invalido_123'
    }
    
    try:
        # Realizar petición con token inválido
        response = requests.post(url, json=data, headers=headers)
        
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
    test_contacto_token_invalido()