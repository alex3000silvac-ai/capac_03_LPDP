"""
Configuración de base de datos y conexiones - SEGURO CONTRA INYECCIÓN SQL
"""
from sqlalchemy import create_engine, MetaData, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool
from contextlib import contextmanager
from fastapi import HTTPException
from app.core.security_enhanced import input_validator, audit_logger
import logging
import re

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

def validate_tenant_id(tenant_id: str) -> str:
    """
    Valida y sanitiza el tenant_id para prevenir inyección SQL
    """
    if not tenant_id or not isinstance(tenant_id, str):
        raise ValueError("tenant_id debe ser una cadena válida")
    
    # Solo permitir caracteres alfanuméricos, guiones y guiones bajos
    if not re.match(r'^[a-zA-Z0-9_-]+$', tenant_id):
        raise ValueError("tenant_id contiene caracteres no válidos")
    
    # Longitud máxima para prevenir ataques
    if len(tenant_id) > 50:
        raise ValueError("tenant_id demasiado largo")
    
    return tenant_id

def create_tenant_schema(tenant_id: str):
    """
    Crea el esquema de base de datos para un nuevo tenant - SEGURO
    """
    try:
        # VALIDAR Y SANITIZAR TENANT_ID PARA PREVENIR SQL INJECTION
        if not input_validator.validate_tenant_id(tenant_id):
            raise ValueError(f"Tenant ID inválido: {tenant_id}")
        
        # Sanitizar para uso seguro en SQL
        safe_tenant_id = input_validator.sanitize_sql_identifier(tenant_id)
        schema_name = f"{settings.TENANT_SCHEMA_PREFIX}{safe_tenant_id}"
        
        # Log de auditoría
        audit_logger.log_security_event(
            "database_schema_creation", safe_tenant_id, "system",
            {"original_tenant_id": tenant_id, "schema_name": schema_name},
            "INFO"
        )
        
        with get_master_db_context() as db:
            # CREAR ESQUEMA CON NOMBRE SANITIZADO
            db.execute(text(f"CREATE SCHEMA IF NOT EXISTS {schema_name}"))
            
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
            
    except ValueError as e:
        logger.error(f"Error de validación para tenant {tenant_id}: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creando esquema {tenant_id}: {e}")
        raise

def drop_tenant_schema(tenant_id: str):
    """
    Elimina el esquema de base de datos de un tenant - SEGURO
    """
    try:
        # VALIDAR Y SANITIZAR TENANT_ID PARA PREVENIR SQL INJECTION
        if not input_validator.validate_tenant_id(tenant_id):
            raise ValueError(f"Tenant ID inválido: {tenant_id}")
        
        # Sanitizar para uso seguro en SQL
        safe_tenant_id = input_validator.sanitize_sql_identifier(tenant_id)
        schema_name = f"{settings.TENANT_SCHEMA_PREFIX}{safe_tenant_id}"
        
        # Log de auditoría CRÍTICO (eliminación)
        audit_logger.log_security_event(
            "database_schema_deletion", safe_tenant_id, "system",
            {"original_tenant_id": tenant_id, "schema_name": schema_name},
            "CRITICAL"
        )
        
        with get_master_db_context() as db:
            # ELIMINAR ESQUEMA CON NOMBRE SANITIZADO
            db.execute(text(f"DROP SCHEMA IF EXISTS {schema_name} CASCADE"))
            db.commit()
            
            logger.info(f"Esquema {schema_name} eliminado exitosamente")
            
    except ValueError as e:
        logger.error(f"Error de validación para tenant {tenant_id}: {e}")
        raise HTTPException(status_code=400, detail=str(e))
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