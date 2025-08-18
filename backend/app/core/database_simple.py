"""
Configuración simplificada de base de datos para Render
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
import logging

logger = logging.getLogger(__name__)

# URL de base de datos desde variable de entorno
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/lpdp")

# Verificar que la URL existe
if not DATABASE_URL:
    logger.error("❌ DATABASE_URL no está configurada")
    raise Exception("DATABASE_URL es requerida")

# Crear engine con configuración para Render
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=3600,
    pool_size=5,
    max_overflow=10,
    echo=False  # Cambiar a True para debug
)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base para modelos
Base = declarative_base()

def get_db():
    """
    Dependency para obtener sesión de base de datos
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def test_connection():
    """
    Prueba la conexión a la base de datos
    """
    try:
        db = SessionLocal()
        db.execute("SELECT 1")
        db.close()
        logger.info("✅ Conexión a base de datos exitosa")
        return True
    except Exception as e:
        logger.error(f"❌ Error de conexión: {e}")
        return False

def init_db():
    """
    Inicializa las tablas de la base de datos
    """
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("✅ Tablas creadas/verificadas")
        return True
    except Exception as e:
        logger.error(f"❌ Error creando tablas: {e}")
        return False