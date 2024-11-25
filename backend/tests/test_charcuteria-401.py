"""
test_charcuteria-401.py

Script para probar el endpoint de charcutería sin token.
Verifica que se reciba un error 401 cuando no se proporciona token.

Dependencias:
- requests: Para realizar peticiones HTTP.
- test_settings: Configuración común para los tests.
"""

import requests
import sys
from .test_settings import API_CONFIG

def test_charcuteria_sin_token():
    """
    Realiza una petición GET al endpoint de charcutería sin proporcionar token.
    Verifica que se reciba un error 401 Unauthorized.
    """
    # URL del endpoint
    url = f"{API_CONFIG['base_url']}/charcuteria"
    
    try:
        # Realizar petición sin token
        response = requests.get(url, headers=API_CONFIG['default_headers'])
        
        # Verificar el código de respuesta
        if response.status_code == 401:
            print("✅ Test exitoso: Se recibió el error 401 esperado")
            print(f"Mensaje: {response.json().get('detail')}")
        else:
            print(f"❌ Test fallido: Se esperaba código 401, se recibió {response.status_code}")
            print(f"Respuesta: {response.text}")
            sys.exit(1)
            
    except requests.RequestException as e:
        print(f"❌ Error al realizar la petición: {e}")
        sys.exit(1)

if __name__ == "__main__":
    test_charcuteria_sin_token()