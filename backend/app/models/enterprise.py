"""
Modelos para gestión empresarial multi-tenant escalable
Diseñado para 200 empresas con ~3 usuarios promedio (600 usuarios totales)
"""
from sqlalchemy import Column, String, Boolean, DateTime, JSON, Text, Integer, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime, timedelta
import uuid
import enum

from .base import BaseModel


class PlanType(enum.Enum):
    """Tipos de planes disponibles"""
    TRIAL = "trial"
    BASIC = "basic"
    PROFESSIONAL = "professional"
    ENTERPRISE = "enterprise"


class TenantStatus(enum.Enum):
    """Estados del tenant"""
    PENDING = "pending"
    ACTIVE = "active"
    SUSPENDED = "suspended"
    EXPIRED = "expired"
    CANCELLED = "cancelled"


class Enterprise(BaseModel):
    """
    Modelo principal de empresa - optimizado para escalabilidad
    Esquema: public (master database)
    """
    __tablename__ = "enterprises"
    __table_args__ = {'schema': 'public'}
    
    # Identificadores únicos
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(String(50), unique=True, nullable=False, index=True)
    schema_name = Column(String(63), unique=True, nullable=False, index=True)
    
    # Información legal de la empresa
    company_name = Column(String(255), nullable=False, index=True)
    legal_name = Column(String(255))  # Razón social completa
    rut = Column(String(20), unique=True, nullable=False, index=True)
    tax_id = Column(String(50))  # ID fiscal para empresas extranjeras
    
    # Información de negocio
    industry = Column(String(100), index=True)
    business_type = Column(String(100))  # SPA, LTDA, SA, etc.
    employee_count_range = Column(String(50))  # "1-10", "11-50", "51-200", etc.
    
    # Ubicación
    address = Column(Text)
    city = Column(String(100))
    region = Column(String(100))
    country = Column(String(100), default="Chile")
    postal_code = Column(String(20))
    
    # Contacto principal
    primary_contact_name = Column(String(255))
    primary_contact_email = Column(String(255), nullable=False)
    primary_contact_phone = Column(String(50))
    primary_contact_position = Column(String(100))
    
    # Estado y configuración
    status = Column(Enum(TenantStatus), default=TenantStatus.PENDING, nullable=False, index=True)
    is_active = Column(Boolean, default=False, nullable=False, index=True)
    
    # Plan y billing
    plan_type = Column(Enum(PlanType), default=PlanType.TRIAL, nullable=False)
    plan_started_at = Column(DateTime(timezone=True), default=func.now())
    plan_ends_at = Column(DateTime(timezone=True))
    billing_email = Column(String(255))
    
    # Límites operacionales
    max_users = Column(Integer, default=3)
    max_data_subjects = Column(Integer, default=1000)
    max_activities = Column(Integer, default=50)
    storage_quota_gb = Column(Integer, default=1)
    
    # Uso actual (para monitoring)
    current_users = Column(Integer, default=0)
    current_data_subjects = Column(Integer, default=0)
    current_activities = Column(Integer, default=0)
    storage_used_mb = Column(Integer, default=0)
    
    # Configuración técnica
    database_schema_created = Column(Boolean, default=False)
    schema_version = Column(String(20), default="1.0")
    timezone = Column(String(50), default="America/Santiago")
    locale = Column(String(10), default="es_CL")
    
    # Onboarding y setup
    onboarding_completed = Column(Boolean, default=False)
    onboarding_step = Column(Integer, default=0)
    setup_wizard_completed = Column(Boolean, default=False)
    
    # Seguridad
    allowed_ip_ranges = Column(JSON)
    require_mfa = Column(Boolean, default=False)
    password_policy = Column(JSON)
    session_timeout_minutes = Column(Integer, default=480)  # 8 horas
    
    # Compliance settings
    data_retention_years = Column(Integer, default=5)
    enable_audit_log = Column(Boolean, default=True)
    enable_encryption = Column(Boolean, default=True)
    
    # Metadata
    created_by = Column(UUID(as_uuid=True))
    notes = Column(Text)
    tags = Column(JSON)  # Para categorización y búsqueda
    
    # Performance tracking
    last_activity_at = Column(DateTime(timezone=True))
    login_count = Column(Integer, default=0)
    
    def __repr__(self):
        return f"<Enterprise(id={self.id}, name={self.company_name}, status={self.status})>"
    
    @property
    def days_until_expiry(self):
        """Días hasta que expire el plan"""
        if not self.plan_ends_at:
            return None
        delta = self.plan_ends_at - datetime.now(self.plan_ends_at.tzinfo)
        return delta.days
    
    @property
    def is_trial_expired(self):
        """Verifica si el trial ha expirado"""
        if self.plan_type != PlanType.TRIAL:
            return False
        return self.plan_ends_at and datetime.now(self.plan_ends_at.tzinfo) > self.plan_ends_at
    
    @property
    def usage_stats(self):
        """Estadísticas de uso"""
        return {
            "users": {
                "current": self.current_users,
                "max": self.max_users,
                "percentage": (self.current_users / self.max_users * 100) if self.max_users > 0 else 0
            },
            "data_subjects": {
                "current": self.current_data_subjects,
                "max": self.max_data_subjects,
                "percentage": (self.current_data_subjects / self.max_data_subjects * 100) if self.max_data_subjects > 0 else 0
            },
            "storage": {
                "used_mb": self.storage_used_mb,
                "quota_gb": self.storage_quota_gb,
                "percentage": (self.storage_used_mb / (self.storage_quota_gb * 1024) * 100) if self.storage_quota_gb > 0 else 0
            }
        }


class EnterpriseUser(BaseModel):
    """
    Usuarios específicos de cada empresa
    Esquema: public (para queries cross-tenant eficientes)
    """
    __tablename__ = "enterprise_users"
    __table_args__ = {'schema': 'public'}
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    enterprise_id = Column(UUID(as_uuid=True), ForeignKey('public.enterprises.id'), nullable=False, index=True)
    
    # Información personal
    username = Column(String(50), nullable=False, index=True)
    email = Column(String(255), nullable=False, index=True)
    first_name = Column(String(100))
    last_name = Column(String(100))
    
    # Autenticación
    hashed_password = Column(String(255), nullable=False)
    
    # Estado y permisos
    is_active = Column(Boolean, default=True, nullable=False)
    is_admin = Column(Boolean, default=False)  # Admin de la empresa
    is_dpo = Column(Boolean, default=False)    # Delegado de Protección de Datos
    
    # Información de cargo
    position = Column(String(100))
    department = Column(String(100))
    
    # Seguridad
    mfa_enabled = Column(Boolean, default=False)
    mfa_secret = Column(String(255))
    last_login_at = Column(DateTime(timezone=True))
    failed_login_attempts = Column(Integer, default=0)
    password_changed_at = Column(DateTime(timezone=True), default=func.now())
    
    # Acceso y permisos
    permissions = Column(JSON)  # Permisos específicos
    allowed_ip_ranges = Column(JSON)
    
    # Metadata
    invited_by = Column(UUID(as_uuid=True))
    invitation_accepted_at = Column(DateTime(timezone=True))
    last_activity_at = Column(DateTime(timezone=True))
    
    # Relationships
    enterprise = relationship("Enterprise")
    
    # Constraint para unicidad de username por empresa
    __table_args__ = (
        {'schema': 'public'},
    )
    
    def __repr__(self):
        return f"<EnterpriseUser(id={self.id}, username={self.username}, enterprise={self.enterprise_id})>"
    
    @property
    def full_name(self):
        """Nombre completo"""
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        return self.username
    
    @property
    def is_locked(self):
        """Verifica si la cuenta está bloqueada por intentos fallidos"""
        return self.failed_login_attempts >= 5


class EnterprisePlan(BaseModel):
    """
    Planes disponibles para las empresas
    """
    __tablename__ = "enterprise_plans"
    __table_args__ = {'schema': 'public'}
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Identificación del plan
    plan_code = Column(String(50), unique=True, nullable=False)
    plan_name = Column(String(100), nullable=False)
    plan_type = Column(Enum(PlanType), nullable=False)
    
    # Límites
    max_users = Column(Integer, nullable=False)
    max_data_subjects = Column(Integer, nullable=False)
    max_activities = Column(Integer, nullable=False)
    storage_quota_gb = Column(Integer, nullable=False)
    
    # Características
    features = Column(JSON)  # Lista de características incluidas
    
    # Precios
    monthly_price = Column(Integer, default=0)  # En centavos
    yearly_price = Column(Integer, default=0)   # En centavos
    currency = Column(String(3), default="CLP")
    
    # Estado
    is_active = Column(Boolean, default=True)
    is_public = Column(Boolean, default=True)  # Visible para nuevos clientes
    
    # Metadata
    description = Column(Text)
    created_for_enterprise = Column(UUID(as_uuid=True))  # Plan customizado
    
    def __repr__(self):
        return f"<EnterprisePlan(code={self.plan_code}, name={self.plan_name})>"


class EnterpriseInvitation(BaseModel):
    """
    Invitaciones pendientes para usuarios
    """
    __tablename__ = "enterprise_invitations"
    __table_args__ = {'schema': 'public'}
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    enterprise_id = Column(UUID(as_uuid=True), ForeignKey('public.enterprises.id'), nullable=False)
    
    # Información de la invitación
    email = Column(String(255), nullable=False, index=True)
    invited_by = Column(UUID(as_uuid=True), nullable=False)
    
    # Permisos asignados
    will_be_admin = Column(Boolean, default=False)
    will_be_dpo = Column(Boolean, default=False)
    position = Column(String(100))
    department = Column(String(100))
    permissions = Column(JSON)
    
    # Estado de la invitación
    invitation_token = Column(String(255), unique=True, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    accepted_at = Column(DateTime(timezone=True))
    cancelled_at = Column(DateTime(timezone=True))
    
    # Metadata
    invitation_message = Column(Text)
    
    # Relationships
    enterprise = relationship("Enterprise")
    
    def __repr__(self):
        return f"<EnterpriseInvitation(id={self.id}, email={self.email})>"
    
    @property
    def is_expired(self):
        """Verifica si la invitación ha expirado"""
        return datetime.now(self.expires_at.tzinfo) > self.expires_at
    
    @property
    def is_pending(self):
        """Verifica si la invitación está pendiente"""
        return not self.accepted_at and not self.cancelled_at and not self.is_expired


class EnterpriseAuditLog(BaseModel):
    """
    Log de auditoría para acciones administrativas
    """
    __tablename__ = "enterprise_audit_log"
    __table_args__ = {'schema': 'public'}
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    enterprise_id = Column(UUID(as_uuid=True), ForeignKey('public.enterprises.id'), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), index=True)
    
    # Información del evento
    action = Column(String(100), nullable=False, index=True)
    resource_type = Column(String(50), nullable=False)
    resource_id = Column(String(255))
    
    # Detalles
    description = Column(Text)
    changes = Column(JSON)  # Cambios realizados
    metadata = Column(JSON)  # Información adicional
    
    # Contexto
    ip_address = Column(String(45))
    user_agent = Column(Text)
    session_id = Column(String(255))
    
    # Severity
    severity = Column(String(20), default="info")  # info, warning, error, critical
    
    # Relationships
    enterprise = relationship("Enterprise")
    
    def __repr__(self):
        return f"<EnterpriseAuditLog(id={self.id}, action={self.action})>"