"""
Modelos para gestión de tenants (empresas)
"""
from sqlalchemy import Column, String, Boolean, DateTime, JSON, Text, Integer
from sqlalchemy.sql import func
from .base import BaseModel


class Tenant(BaseModel):
    """
    Representa una empresa/organización en el sistema multi-tenant
    Almacenado en el esquema master (public)
    """
    __tablename__ = "tenants"
    __table_args__ = {'schema': 'public'}
    
    # Identificación única
    tenant_id = Column(String(50), unique=True, nullable=False, index=True)
    schema_name = Column(String(63), unique=True, nullable=False)
    
    # Información de la empresa
    company_name = Column(String(255), nullable=False)
    rut = Column(String(20), unique=True, nullable=False)
    razon_social = Column(String(255))
    giro = Column(String(255))
    
    # Contacto
    email = Column(String(255), nullable=False)
    phone = Column(String(50))
    address = Column(Text)
    city = Column(String(100))
    region = Column(String(100))
    country = Column(String(100), default="Chile")
    
    # Estado y configuración
    is_active = Column(Boolean, default=True, nullable=False)
    is_trial = Column(Boolean, default=False, nullable=False)
    trial_ends_at = Column(DateTime(timezone=True))
    
    # Límites y cuotas
    max_users = Column(Integer, default=10)
    max_data_subjects = Column(Integer, default=10000)
    storage_quota_mb = Column(Integer, default=1024)  # 1GB por defecto
    
    # Billing
    billing_plan = Column(String(50), default="basic")
    billing_cycle = Column(String(20), default="monthly")
    next_billing_date = Column(DateTime(timezone=True))
    
    # Configuración técnica
    database_created = Column(Boolean, default=False)
    schema_version = Column(String(20))
    
    # Metadata
    onboarding_completed = Column(Boolean, default=False)
    industry = Column(String(100))
    employee_count = Column(String(50))
    
    # Seguridad
    allowed_ip_ranges = Column(JSON)  # Lista de rangos IP permitidos
    require_mfa = Column(Boolean, default=False)
    
    def __repr__(self):
        return f"<Tenant(tenant_id={self.tenant_id}, company={self.company_name})>"


class TenantConfig(BaseModel):
    """
    Configuraciones específicas por tenant
    """
    __tablename__ = "tenant_configs"
    __table_args__ = {'schema': 'public'}
    
    tenant_id = Column(String(50), nullable=False, index=True)
    
    # Categoría de configuración
    category = Column(String(50), nullable=False)  # 'security', 'ui', 'features', etc.
    key = Column(String(100), nullable=False)
    value = Column(JSON)
    
    # Control
    is_encrypted = Column(Boolean, default=False)
    is_system = Column(Boolean, default=False)  # No editable por usuario
    
    # Descripción para UI
    description = Column(Text)
    
    def __repr__(self):
        return f"<TenantConfig(tenant_id={self.tenant_id}, key={self.key})>"