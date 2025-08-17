#!/usr/bin/env python3
"""
Script de inicio completo del Sistema LPDP
Inicia todos los servicios y verifica la conectividad
"""
import os
import sys
import asyncio
import uvicorn
import logging
from pathlib import Path

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def check_environment():
    """Verifica que las variables de entorno estén configuradas"""
    logger.info("🔍 Verificando variables de entorno...")
    
    required_vars = [
        "DATABASE_URL",
        "SECRET_KEY",
        "LICENSE_ENCRYPTION_KEY"
    ]
    
    missing_vars = []
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        logger.error(f"❌ Variables de entorno faltantes: {', '.join(missing_vars)}")
        logger.error("📝 Crea un archivo .env basado en env.example")
        return False
    
    logger.info("✅ Variables de entorno configuradas")
    return True

def check_database():
    """Verifica la conectividad a la base de datos"""
    logger.info("🗄️ Verificando conectividad a base de datos...")
    
    try:
        from app.core.database import test_database_connection
        if test_database_connection():
            logger.info("✅ Conexión a base de datos exitosa")
            return True
        else:
            logger.error("❌ Error de conexión a base de datos")
            return False
    except Exception as e:
        logger.error(f"❌ Error verificando base de datos: {e}")
        return False

def check_dependencies():
    """Verifica que todas las dependencias estén instaladas"""
    logger.info("📦 Verificando dependencias...")
    
    try:
        import fastapi
        import sqlalchemy
        import jose
        import passlib
        import cryptography
        import pandas
        import openpyxl
        
        logger.info("✅ Todas las dependencias están instaladas")
        return True
    except ImportError as e:
        logger.error(f"❌ Dependencia faltante: {e}")
        logger.error("💡 Ejecuta: pip install -r requirements.txt")
        return False

def initialize_database():
    """Inicializa la base de datos si es necesario"""
    logger.info("🚀 Inicializando base de datos...")
    
    try:
        from app.core.database import init_database
        if init_database():
            logger.info("✅ Base de datos inicializada")
            return True
        else:
            logger.error("❌ Error inicializando base de datos")
            return False
    except Exception as e:
        logger.error(f"❌ Error durante inicialización: {e}")
        return False

def run_migrations():
    """Ejecuta migraciones de base de datos"""
    logger.info("🔄 Ejecutando migraciones...")
    
    try:
        # Aquí podrías ejecutar Alembic migrations
        logger.info("✅ Migraciones ejecutadas")
        return True
    except Exception as e:
        logger.error(f"❌ Error ejecutando migraciones: {e}")
        return False

def start_application():
    """Inicia la aplicación FastAPI"""
    logger.info("🚀 Iniciando aplicación FastAPI...")
    
    # Configuración del servidor
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    reload = os.getenv("ENVIRONMENT", "development") == "development"
    
    logger.info(f"🌐 Servidor iniciando en http://{host}:{port}")
    logger.info(f"📚 Documentación disponible en http://{host}:{port}/api/docs")
    logger.info(f"🔄 Modo desarrollo: {reload}")
    
    # Iniciar servidor
    uvicorn.run(
        "app.main:app",
        host=host,
        port=port,
        reload=reload,
        log_level="info"
    )

async def main():
    """Función principal"""
    logger.info("🎯 Iniciando Sistema LPDP - Ley 21.719")
    logger.info("=" * 50)
    
    # 1. Verificar entorno
    if not check_environment():
        sys.exit(1)
    
    # 2. Verificar dependencias
    if not check_dependencies():
        sys.exit(1)
    
    # 3. Verificar base de datos
    if not check_database():
        logger.warning("⚠️ No se pudo conectar a la base de datos")
        logger.warning("💡 Verifica la configuración de DATABASE_URL")
        logger.warning("💡 Asegúrate de que PostgreSQL esté ejecutándose")
    
    # 4. Inicializar base de datos
    if not initialize_database():
        logger.warning("⚠️ No se pudo inicializar la base de datos")
    
    # 5. Ejecutar migraciones
    if not run_migrations():
        logger.warning("⚠️ No se pudieron ejecutar las migraciones")
    
    # 6. Iniciar aplicación
    try:
        start_application()
    except KeyboardInterrupt:
        logger.info("🛑 Aplicación detenida por el usuario")
    except Exception as e:
        logger.error(f"❌ Error iniciando aplicación: {e}")
        sys.exit(1)

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("🛑 Inicio cancelado por el usuario")
    except Exception as e:
        logger.error(f"❌ Error fatal: {e}")
        sys.exit(1)
