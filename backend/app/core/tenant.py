"""
Sistema de gestión multi-tenant
"""
from typing import Optional, Dict, Any
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session, sessionmaker, scoped_session
from sqlalchemy.pool import NullPool
from contextlib import contextmanager
import logging
from ..models.base import Base
from ..models.tenant import Tenant
from .config import settings

logger = logging.getLogger(__name__)

# Cache de conexiones por tenant
_tenant_engines: Dict[str, Any] = {}
_tenant_sessions: Dict[str, Any] = {}


def get_master_db() -> Session:
    """Obtiene una sesión a la base de datos master"""
    engine = create_engine(
        settings.DATABASE_URL,
        pool_size=5,
        max_overflow=10
    )
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    return SessionLocal()


def create_tenant_schema(tenant_id: str, db: Session) -> bool:
    """
    Crea un nuevo esquema para un tenant
    """
    try:
        schema_name = f"{settings.TENANT_SCHEMA_PREFIX}{tenant_id}"
        
        # Crear esquema
        db.execute(text(f"CREATE SCHEMA IF NOT EXISTS {schema_name}"))
        db.commit()
        
        # Crear tablas en el esquema
        engine = create_engine(
            settings.DATABASE_URL,
            connect_args={"options": f"-csearch_path={schema_name}"}
        )
        
        # Crear todas las tablas del tenant
        Base.metadata.create_all(bind=engine, tables=[
            table for table in Base.metadata.tables.values()
            if table.schema is None  # Solo tablas de tenant
        ])
        
        logger.info(f"Schema created successfully for tenant: {tenant_id}")
        return True
        
    except Exception as e:
        logger.error(f"Error creating schema for tenant {tenant_id}: {str(e)}")
        db.rollback()
        return False


def drop_tenant_schema(tenant_id: str, db: Session) -> bool:
    """
    Elimina el esquema de un tenant (CUIDADO: elimina todos los datos)
    """
    try:
        schema_name = f"{settings.TENANT_SCHEMA_PREFIX}{tenant_id}"
        
        # Cerrar conexiones existentes
        if tenant_id in _tenant_engines:
            _tenant_engines[tenant_id].dispose()
            del _tenant_engines[tenant_id]
        
        if tenant_id in _tenant_sessions:
            del _tenant_sessions[tenant_id]
        
        # Eliminar esquema
        db.execute(text(f"DROP SCHEMA IF EXISTS {schema_name} CASCADE"))
        db.commit()
        
        logger.info(f"Schema dropped successfully for tenant: {tenant_id}")
        return True
        
    except Exception as e:
        logger.error(f"Error dropping schema for tenant {tenant_id}: {str(e)}")
        db.rollback()
        return False


def get_tenant_db(tenant_id: str) -> Session:
    """
    Obtiene una sesión de base de datos para un tenant específico
    """
    if tenant_id not in _tenant_engines:
        schema_name = f"{settings.TENANT_SCHEMA_PREFIX}{tenant_id}"
        
        # Crear engine con schema específico
        engine = create_engine(
            settings.DATABASE_URL,
            poolclass=NullPool,  # Sin pool para tenants
            connect_args={
                "options": f"-csearch_path={schema_name},{settings.MASTER_SCHEMA}"
            }
        )
        
        _tenant_engines[tenant_id] = engine
        
        # Crear session factory
        session_factory = sessionmaker(
            autocommit=False,
            autoflush=False,
            bind=engine
        )
        
        _tenant_sessions[tenant_id] = scoped_session(session_factory)
    
    return _tenant_sessions[tenant_id]()


@contextmanager
def tenant_context(tenant_id: str):
    """
    Context manager para operaciones en un tenant
    """
    db = get_tenant_db(tenant_id)
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def get_tenant_from_request(request) -> Optional[str]:
    """
    Extrae el tenant_id de una request
    
    Puede venir de:
    1. Header X-Tenant-ID
    2. JWT token
    3. Subdominio
    4. Query parameter
    """
    # 1. Header
    tenant_id = request.headers.get("X-Tenant-ID")
    if tenant_id:
        return tenant_id
    
    # 2. JWT Token
    if hasattr(request.state, "user") and request.state.user:
        return request.state.user.get("tenant_id")
    
    # 3. Subdominio (ejemplo: empresa1.app.juridicadigital.cl)
    host = request.headers.get("host", "")
    if "." in host:
        subdomain = host.split(".")[0]
        if subdomain not in ["app", "www", "api"]:
            return subdomain
    
    # 4. Query parameter (solo para ciertas rutas públicas)
    return request.query_params.get("tenant_id")


def validate_tenant(tenant_id: str, db: Session) -> Optional[Tenant]:
    """
    Valida que un tenant existe y está activo
    """
    tenant = db.query(Tenant).filter(
        Tenant.tenant_id == tenant_id,
        Tenant.is_active == True
    ).first()
    
    return tenant


def get_tenant_config(tenant_id: str, category: str, key: str, db: Session) -> Any:
    """
    Obtiene una configuración específica del tenant
    """
    from ..models.tenant import TenantConfig
    
    config = db.query(TenantConfig).filter(
        TenantConfig.tenant_id == tenant_id,
        TenantConfig.category == category,
        TenantConfig.key == key
    ).first()
    
    if config:
        return config.value
    
    # Retornar valor por defecto según la clave
    defaults = {
        "security": {
            "require_mfa": False,
            "session_timeout": 3600,
            "max_login_attempts": 5
        },
        "ui": {
            "theme": "light",
            "language": "es",
            "date_format": "DD/MM/YYYY"
        },
        "features": {
            "enable_api": True,
            "enable_webhooks": False,
            "enable_exports": True
        }
    }
    
    return defaults.get(category, {}).get(key)


def set_tenant_config(
    tenant_id: str,
    category: str,
    key: str,
    value: Any,
    db: Session
) -> bool:
    """
    Establece una configuración del tenant
    """
    from ..models.tenant import TenantConfig
    
    try:
        config = db.query(TenantConfig).filter(
            TenantConfig.tenant_id == tenant_id,
            TenantConfig.category == category,
            TenantConfig.key == key
        ).first()
        
        if config:
            config.value = value
        else:
            config = TenantConfig(
                tenant_id=tenant_id,
                category=category,
                key=key,
                value=value
            )
            db.add(config)
        
        db.commit()
        return True
        
    except Exception as e:
        logger.error(f"Error setting tenant config: {str(e)}")
        db.rollback()
        return False


def cleanup_tenant_connections():
    """
    Limpia conexiones inactivas de tenants
    """
    for tenant_id, engine in list(_tenant_engines.items()):
        try:
            # Verificar si hay conexiones activas
            pool_status = engine.pool.status()
            if "0 connections" in pool_status:
                engine.dispose()
                del _tenant_engines[tenant_id]
                if tenant_id in _tenant_sessions:
                    del _tenant_sessions[tenant_id]
                logger.info(f"Cleaned up connections for tenant: {tenant_id}")
        except Exception as e:
            logger.error(f"Error cleaning up tenant {tenant_id}: {str(e)}")


def get_tenant_stats(tenant_id: str, db: Session) -> Dict[str, Any]:
    """
    Obtiene estadísticas de uso del tenant
    """
    with tenant_context(tenant_id) as tenant_db:
        stats = {
            "users": tenant_db.execute(
                text("SELECT COUNT(*) FROM users WHERE is_active = true")
            ).scalar(),
            "data_subjects": tenant_db.execute(
                text("SELECT COUNT(*) FROM titulares_datos")
            ).scalar(),
            "consents": tenant_db.execute(
                text("SELECT COUNT(*) FROM consentimientos WHERE estado = 'activo'")
            ).scalar(),
            "arcopol_requests": tenant_db.execute(
                text("SELECT COUNT(*) FROM solicitudes_arcopol WHERE estado != 'completada'")
            ).scalar(),
            "storage_mb": tenant_db.execute(
                text("""
                    SELECT pg_database_size(current_database()) / 1024 / 1024
                """)
            ).scalar()
        }
        
        return stats