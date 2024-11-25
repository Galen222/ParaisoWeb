"""
run_all_tests.py

Script principal para ejecutar todos los tests de la API.
Ejecuta las pruebas de errores 401 y 403 para todos los endpoints.

Este script:
1. Ejecuta todos los tests de endpoints sin token (401)
2. Ejecuta todos los tests de endpoints con token inválido (403)
3. Muestra un resumen detallado de los resultados
4. Establece un código de salida apropiado basado en los resultados

Uso:
    python -m tests.run_all_tests
"""

import sys
import importlib
from typing import List, Tuple, Dict
import time
from termcolor import colored
from .test_settings import TEST_MODULES, TEST_CATEGORIES

class TestRunner:
    """
    Clase para ejecutar y gestionar todos los tests.
    """
    
    def __init__(self):
        """Inicializa el runner con la configuración de los tests."""
        self.test_modules = TEST_MODULES
        self.results: Dict[str, List[Tuple[str, bool]]] = {
            "401": [],  # Resultados de tests sin token
            "403": []   # Resultados de tests con token inválido
        }

    def run_test(self, module_name: str) -> bool:
        """
        Ejecuta un módulo de test individual.
        
        Args:
            module_name (str): Nombre del módulo de test a ejecutar

        Returns:
            bool: True si el test fue exitoso, False en caso contrario
        """
        try:
            # Importar y ejecutar el test
            module = importlib.import_module(f'.{module_name}', package='tests')
            
            # Obtener la función de test
            test_functions = [
                func for func in dir(module) 
                if func.startswith('test_') and callable(getattr(module, func))
            ]
            
            if not test_functions:
                print(colored(f"❌ No se encontraron funciones de test en {module_name}", 'red'))
                return False
            
            # Ejecutar cada función de test en el módulo
            for func_name in test_functions:
                test_func = getattr(module, func_name)
                test_func()
            
            return True
            
        except Exception as e:
            print(colored(f"❌ Error ejecutando {module_name}: {str(e)}", 'red'))
            return False

    def run_category_tests(self, category: str):
        """
        Ejecuta todos los tests de una categoría específica (401 o 403).
        
        Args:
            category (str): Categoría de tests a ejecutar ('401' o '403')
        """
        print(f"\n{'='*80}")
        print(colored(f"Ejecutando tests de error {category} ({TEST_CATEGORIES[category]})", 'cyan'))
        print(f"{'='*80}")
        
        for module_name in [m for m in self.test_modules if m.endswith(f'-{category}')]:
            success = self.run_test(module_name)
            self.results[category].append((module_name, success))

    def run_all_tests(self) -> bool:
        """
        Ejecuta todos los tests y genera el reporte.
        
        Returns:
            bool: True si todos los tests fueron exitosos, False si alguno falló
        """
        start_time = time.time()
        
        # Ejecutar tests por categoría
        for category in ['401', '403']:
            self.run_category_tests(category)
        
        execution_time = time.time() - start_time
        self.print_summary(execution_time)
        
        # Retornar True solo si todos los tests pasaron
        return all(success for category_results in self.results.values() 
                  for _, success in category_results)

    def print_summary(self, execution_time: float):
        """
        Imprime un resumen detallado de los resultados de los tests.
        
        Args:
            execution_time (float): Tiempo total de ejecución en segundos
        """
        print("\n" + "="*80)
        print(colored("RESUMEN DE TESTS", 'yellow', attrs=['bold']))
        print("="*80)
        
        total_tests = 0
        total_success = 0
        
        # Imprimir resultados por categoría
        for category in ['401', '403']:
            category_results = self.results[category]
            successful = sum(1 for _, success in category_results if success)
            total = len(category_results)
            
            print(f"\nTests {category} ({TEST_CATEGORIES[category]}):")
            print("-" * 40)
            
            for module_name, success in category_results:
                status = colored("✅ PASÓ", 'green') if success else colored("❌ FALLÓ", 'red')
                print(f"{status} - {module_name}")
            
            print(f"\nResumen {category}:")
            print(f"  Total: {total}")
            print(f"  Exitosos: {successful}")
            print(f"  Fallidos: {total - successful}")
            
            total_tests += total
            total_success += successful
        
        # Resumen global
        print("\n" + "="*80)
        print(colored("RESUMEN GLOBAL", 'yellow', attrs=['bold']))
        print(f"Total de tests ejecutados: {total_tests}")
        print(f"Tests exitosos: {total_success}")
        print(f"Tests fallidos: {total_tests - total_success}")
        print(f"Tiempo de ejecución: {execution_time:.2f} segundos")
        
        # Resultado final
        if total_success == total_tests:
            print(colored("\n✅ TODOS LOS TESTS PASARON", 'green', attrs=['bold']))
        else:
            print(colored(f"\n❌ FALLARON {total_tests - total_success} TESTS", 'red', attrs=['bold']))
        print("="*80)

if __name__ == "__main__":
    runner = TestRunner()
    success = runner.run_all_tests()
    sys.exit(0 if success else 1)