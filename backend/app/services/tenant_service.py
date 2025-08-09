"""
Servicio de gestión de tenants
"""
from typing import List, Optional, Dict, Any
from datetime import datetime
from sqlalchemy import text, create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.exc import SQLAlchemyError
import uuid
import json

from app.core.config import settings
from app.models import Tenant, TenantConfig, User, Role
from app.services.auth_service import AuthService
from app.core.database import engine


class TenantService:
    def __init__(self):
        self.auth_service = AuthService()
        self.engine = engine
    
    def create_tenant(
        self, 
        db: Session,
        name: str,
        domain: str,
        admin_email: str,
        admin_password: str,
        config: Optional[Dict[str, Any]] = None
    ) -> Tenant:
        """Crea un nuevo tenant con su esquema y usuario administrador"""
        
        # Generar ID único para el tenant
        tenant_id = str(uuid.uuid4())
        schema_name = f"{settings.TENANT_SCHEMA_PREFIX}{tenant_id.replace('-', '_')}"
        
        try:
            # Crear registro del tenant
            tenant = Tenant(
                id=tenant_id,
                name=name,
                domain=domain,
                schema_name=schema_name,
                is_active=True,
                created_at=datetime.utcnow()
            )
            db.add(tenant)
            
            # Crear configuración del tenant
            tenant_config = TenantConfig(
                tenant_id=tenant_id,
                max_users=10,  # Por defecto
                max_storage_gb=10,  # Por defecto
                features_enabled=config.get("features", {}) if config else {},
                custom_settings=config.get("settings", {}) if config else {}
            )
            db.add(tenant_config)
            
            db.commit()
            
            # Crear esquema para el tenant
            self._create_tenant_schema(schema_name)
            
            # Crear usuario administrador
            self._create_admin_user(
                db, 
                tenant_id, 
                admin_email, 
                admin_password
            )
            
            return tenant
            
        except Exception as e:
            db.rollback()
            # Si falla, intentar limpiar el esquema si se creó
            try:
                self._drop_tenant_schema(schema_name)
            except:
                pass
            raise e
    
    def _create_tenant_schema(self, schema_name: str):
        """Crea el esquema de base de datos para un tenant"""
        with self.engine.connect() as conn:
            # Crear esquema
            conn.execute(text(f"CREATE SCHEMA IF NOT EXISTS {schema_name}"))
            conn.commit()
            
            # Ejecutar función de creación de tablas del tenant
            conn.execute(text(f"SELECT create_tenant_schema('{schema_name}')"))
            conn.commit()
    
    def _drop_tenant_schema(self, schema_name: str):
        """Elimina el esquema de un tenant"""
        with self.engine.connect() as conn:
            conn.execute(text(f"DROP SCHEMA IF EXISTS {schema_name} CASCADE"))
            conn.commit()
    
    def _create_admin_user(
        self, 
        db: Session, 
        tenant_id: str, 
        email: str, 
        password: str
    ):
        """Crea el usuario administrador para un tenant"""
        # Crear rol de administrador si no existe
        admin_role = db.query(Role).filter(
            Role.tenant_id == tenant_id,
            Role.code == "admin"
        ).first()
        
        if not admin_role:
            admin_role = Role(
                tenant_id=tenant_id,
                name="Administrador",
                code="admin",
                description="Administrador del sistema",
                permissions=["*"],  # Todos los permisos
                is_system=True
            )
            db.add(admin_role)
            db.commit()
        
        # Crear usuario administrador
        admin_user = User(
            tenant_id=tenant_id,
            username=email.split("@")[0],
            email=email,
            password_hash=self.auth_service.get_password_hash(password),
            is_active=True,
            is_superuser=False,  # No es superadmin del sistema
            is_dpo=True,  # Es DPO por defecto
            first_name="Administrador",
            last_name="Sistema",
            email_verified=True
        )
        admin_user.roles.append(admin_role)
        db.add(admin_user)
        db.commit()
    
    def get_tenant_by_domain(self, db: Session, domain: str) -> Optional[Tenant]:
        """Obtiene un tenant por su dominio"""
        return db.query(Tenant).filter(
            Tenant.domain == domain,
            Tenant.is_active == True
        ).first()
    
    def get_tenant_by_id(self, db: Session, tenant_id: str) -> Optional[Tenant]:
        """Obtiene un tenant por su ID"""
        return db.query(Tenant).filter(Tenant.id == tenant_id).first()
    
    def list_tenants(
        self, 
        db: Session, 
        skip: int = 0, 
        limit: int = 100
    ) -> List[Tenant]:
        """Lista todos los tenants"""
        return db.query(Tenant).offset(skip).limit(limit).all()
    
    def update_tenant(
        self, 
        db: Session, 
        tenant_id: str, 
        updates: Dict[str, Any]
    ) -> Optional[Tenant]:
        """Actualiza un tenant"""
        tenant = self.get_tenant_by_id(db, tenant_id)
        if not tenant:
            return None
        
        for field, value in updates.items():
            if hasattr(tenant, field):
                setattr(tenant, field, value)
        
        tenant.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(tenant)
        
        return tenant
    
    def suspend_tenant(self, db: Session, tenant_id: str) -> bool:
        """Suspende un tenant"""
        tenant = self.get_tenant_by_id(db, tenant_id)
        if not tenant:
            return False
        
        tenant.is_active = False
        tenant.suspended_at = datetime.utcnow()
        db.commit()
        
        return True
    
    def reactivate_tenant(self, db: Session, tenant_id: str) -> bool:
        """Reactiva un tenant suspendido"""
        tenant = self.get_tenant_by_id(db, tenant_id)
        if not tenant:
            return False
        
        tenant.is_active = True
        tenant.suspended_at = None
        db.commit()
        
        return True
    
    def delete_tenant(self, db: Session, tenant_id: str) -> bool:
        """Elimina completamente un tenant (PELIGROSO)"""
        tenant = self.get_tenant_by_id(db, tenant_id)
        if not tenant:
            return False
        
        try:
            # Eliminar esquema
            self._drop_tenant_schema(tenant.schema_name)
            
            # Eliminar registros del tenant
            db.query(TenantConfig).filter(
                TenantConfig.tenant_id == tenant_id
            ).delete()
            
            db.delete(tenant)
            db.commit()
            
            return True
            
        except Exception as e:
            db.rollback()
            raise e
    
    def get_tenant_stats(self, db: Session, tenant_id: str) -> Dict[str, Any]:
        """Obtiene estadísticas de uso de un tenant"""
        tenant = self.get_tenant_by_id(db, tenant_id)
        if not tenant:
            return {}
        
        # Contar usuarios
        user_count = db.query(User).filter(
            User.tenant_id == tenant_id
        ).count()
        
        # Obtener configuración
        config = db.query(TenantConfig).filter(
            TenantConfig.tenant_id == tenant_id
        ).first()
        
        return {
            "tenant_id": tenant_id,
            "name": tenant.name,
            "domain": tenant.domain,
            "is_active": tenant.is_active,
            "created_at": tenant.created_at.isoformat(),
            "user_count": user_count,
            "max_users": config.max_users if config else 0,
            "storage_used_gb": config.storage_used_gb if config else 0,
            "max_storage_gb": config.max_storage_gb if config else 0,
            "last_activity": config.last_activity_at.isoformat() if config and config.last_activity_at else None
        }
    
    def create_tenant_session(self, tenant_id: str) -> Session:
        """Crea una sesión de base de datos para un tenant específico"""
        tenant = self.get_tenant_by_id(Session(), tenant_id)
        if not tenant:
            raise ValueError(f"Tenant {tenant_id} no encontrado")
        
        # Crear engine con el esquema del tenant
        SessionLocal = sessionmaker(
            autocommit=False, 
            autoflush=False, 
            bind=self.engine
        )
        
        session = SessionLocal()
        
        # Establecer el search_path para usar el esquema del tenant
        session.execute(
            text(f"SET search_path TO {tenant.schema_name}, public")
        )
        
        return session