"""
Configuración de base de datos y conexiones
"""
from sqlalchemy import create_engine, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool
from contextlib import contextmanager
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)

# Configuración de la base de datos master
MASTER_DATABASE_URL = settings.DATABASE_URL

# Engine para la base de datos master
master_engine = create_engine(
    MASTER_DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=300,
    echo=settings.DEBUG
)

# Engine global para compatibilidad
engine = master_engine

# Session factory para la base de datos master
MasterSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=master_engine
)

# Base para todos los modelos
Base = declarative_base()

# Metadata para la base de datos master
master_metadata = MetaData()

def get_master_db():
    """
    Obtiene una sesión de base de datos para la base master
    """
    db = MasterSessionLocal()
    try:
        yield db
    finally:
        db.close()

@contextmanager
def get_master_db_context() -> Session:
    """
    Context manager para la base de datos master
    """
    db = MasterSessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_tenant_db(tenant_id: str) -> Session:
    """
    Obtiene una sesión de base de datos para un tenant específico
    """
    # Construir URL del tenant
    tenant_schema = f"{settings.TENANT_SCHEMA_PREFIX}{tenant_id}"
    
    # Crear engine específico para el tenant
    tenant_engine = create_engine(
        MASTER_DATABASE_URL,
        pool_pre_ping=True,
        pool_recycle=300,
        echo=settings.DEBUG,
        options={
            "-c": f"search_path={tenant_schema},public"
        }
    )
    
    # Crear session factory para el tenant
    TenantSessionLocal = sessionmaker(
        autocommit=False,
        autoflush=False,
        bind=tenant_engine
    )
    
    return TenantSessionLocal()

@contextmanager
def get_tenant_db_context(tenant_id: str) -> Session:
    """
    Context manager para la base de datos de un tenant
    """
    db = get_tenant_db(tenant_id)
    try:
        yield db
    finally:
        db.close()

def create_tenant_schema(tenant_id: str):
    """
    Crea el esquema de base de datos para un nuevo tenant
    """
    try:
        with get_master_db_context() as db:
            schema_name = f"{settings.TENANT_SCHEMA_PREFIX}{tenant_id}"
            
            # Crear esquema
            db.execute(f"CREATE SCHEMA IF NOT EXISTS {schema_name}")
            
            # Crear todas las tablas en el esquema
            # Importar modelos de forma segura
            from app.models.base import Base
            from app.models.user import User
            from app.models.tenant import Tenant
            from app.models.empresa import Empresa
            
            # Crear tablas en el esquema del tenant
            for table in Base.metadata.tables.values():
                table.create(bind=master_engine, checkfirst=True)
            
            db.commit()
            logger.info(f"Esquema {schema_name} creado exitosamente")
            
    except Exception as e:
        logger.error(f"Error creando esquema {tenant_id}: {e}")
        raise

def drop_tenant_schema(tenant_id: str):
    """
    Elimina el esquema de base de datos de un tenant
    """
    try:
        with get_master_db_context() as db:
            schema_name = f"{settings.TENANT_SCHEMA_PREFIX}{tenant_id}"
            
            # Eliminar esquema (esto elimina todas las tablas)
            db.execute(f"DROP SCHEMA IF EXISTS {schema_name} CASCADE")
            db.commit()
            
            logger.info(f"Esquema {schema_name} eliminado exitosamente")
            
    except Exception as e:
        logger.error(f"Error eliminando esquema {tenant_id}: {e}")
        raise

def test_database_connection():
    """
    Prueba la conexión a la base de datos
    """
    try:
        with get_master_db_context() as db:
            db.execute("SELECT 1")
            logger.info("✅ Conexión a base de datos exitosa")
            return True
    except Exception as e:
        logger.error(f"❌ Error de conexión a base de datos: {e}")
        return False

def init_database():
    """
    Inicializa la base de datos master con todas las tablas
    """
    try:
        # Crear todas las tablas en la base master
        Base.metadata.create_all(bind=master_engine)
        logger.info("✅ Base de datos inicializada exitosamente")
        return True
    except Exception as e:
        logger.error(f"❌ Error inicializando base de datos: {e}")
        return False

# Función de compatibilidad para endpoints existentes
def get_db():
    """
    Función de compatibilidad - retorna la base master
    """
    return get_master_db()