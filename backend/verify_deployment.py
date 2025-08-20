#!/usr/bin/env python3
"""
Script de verificación de deployment para Render
Verifica que todas las configuraciones estén correctas
"""
import os
import sys
import logging
from pathlib import Path

# Agregar el directorio raíz al path para importar módulos
sys.path.append(str(Path(__file__).parent))

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def verify_environment():
    """Verificar variables de entorno requeridas"""
    logger.info("🔍 Verificando variables de entorno...")
    
    required_vars = [
        "DATABASE_URL",
        "SECRET_KEY"
    ]
    
    optional_vars = [
        "ENVIRONMENT",
        "DEBUG",
        "ALLOWED_ORIGINS",
        "HOST",
        "PORT"
    ]
    
    missing_vars = []
    
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
            logger.error(f"❌ Variable requerida {var} no encontrada")
        else:
            logger.info(f"✅ {var} configurada")
    
    for var in optional_vars:
        if os.getenv(var):
            logger.info(f"✅ {var} = {os.getenv(var)}")
        else:
            logger.warning(f"⚠️ Variable opcional {var} no configurada")
    
    return len(missing_vars) == 0

def verify_database_connection():
    """Verificar conexión a la base de datos"""
    logger.info("🔍 Verificando conexión a la base de datos...")
    
    try:
        from app.core.database import test_database_connection
        if test_database_connection():
            logger.info("✅ Conexión a base de datos exitosa")
            return True
        else:
            logger.error("❌ Error conectando a la base de datos")
            return False
    except Exception as e:
        logger.error(f"❌ Error verificando base de datos: {e}")
        return False

def verify_imports():
    """Verificar que todas las importaciones funcionan"""
    logger.info("🔍 Verificando importaciones...")
    
    try:
        from app.main import app
        logger.info("✅ App principal importada correctamente")
        
        from app.api.v1.api import api_router
        logger.info("✅ Router API importado correctamente")
        
        from app.core.config import settings
        logger.info("✅ Configuración importada correctamente")
        
        return True
    except Exception as e:
        logger.error(f"❌ Error en importaciones: {e}")
        return False

def verify_modules():
    """Verificar módulos específicos"""
    logger.info("🔍 Verificando módulos específicos...")
    
    try:
        from app.api.v1.endpoints import modulo_cero
        logger.info("✅ Módulo Cero disponible")
        
        from app.api.v1.endpoints import auth
        logger.info("✅ Módulo Auth disponible")
        
        return True
    except Exception as e:
        logger.error(f"❌ Error verificando módulos: {e}")
        return False

def main():
    """Función principal de verificación"""
    logger.info("🚀 Iniciando verificación de deployment...")
    
    checks = [
        ("Variables de Entorno", verify_environment),
        ("Importaciones", verify_imports),
        ("Módulos", verify_modules),
        ("Base de Datos", verify_database_connection),
    ]
    
    results = []
    
    for check_name, check_func in checks:
        logger.info(f"\n{'='*50}")
        logger.info(f"Verificando: {check_name}")
        logger.info('='*50)
        
        try:
            result = check_func()
            results.append((check_name, result))
            
            if result:
                logger.info(f"✅ {check_name}: PASSED")
            else:
                logger.error(f"❌ {check_name}: FAILED")
        except Exception as e:
            logger.error(f"❌ {check_name}: ERROR - {e}")
            results.append((check_name, False))
    
    # Resumen final
    logger.info(f"\n{'='*50}")
    logger.info("RESUMEN DE VERIFICACIÓN")
    logger.info('='*50)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for check_name, result in results:
        status = "✅ PASSED" if result else "❌ FAILED"
        logger.info(f"{check_name}: {status}")
    
    logger.info(f"\nResultado: {passed}/{total} verificaciones exitosas")
    
    if passed == total:
        logger.info("🎉 ¡Todas las verificaciones pasaron! El deployment debería funcionar correctamente.")
        return 0
    else:
        logger.error("⚠️ Algunas verificaciones fallaron. Revisar la configuración antes del deployment.")
        return 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)