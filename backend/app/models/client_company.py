"""
Modelos para manejar empresas cliente del sistema LPDP
Diseñado para 200 empresas con ~3 usuarios cada una (600 usuarios totales)
"""
from sqlalchemy import Column, String, Boolean, DateTime, JSON, Text, ForeignKey, Integer, Date, Index
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import JSONB
from .base import Base
import enum
from datetime import datetime, date


class ContractType(enum.Enum):
    BASIC = "basic"
    PROFESSIONAL = "professional" 
    ENTERPRISE = "enterprise"
    CUSTOM = "custom"


class CompanySize(enum.Enum):
    SMALL = "small"          # 1-50 empleados
    MEDIUM = "medium"        # 51-200 empleados  
    LARGE = "large"          # 201-1000 empleados
    ENTERPRISE = "enterprise" # 1000+ empleados


class CertificationStatus(enum.Enum):
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    EXPIRED = "expired"
    SUSPENDED = "suspended"


class ClientCompany(Base):
    """
    Empresas cliente del sistema - cada empresa es un tenant
    200 empresas objetivo con capacitación especializada
    """
    __tablename__ = "client_companies"
    
    id = Column(String(36), primary_key=True)
    
    # Información básica de la empresa
    company_name = Column(String(255), nullable=False)
    company_rut = Column(String(20), unique=True, nullable=False)
    company_sector = Column(String(100))  # "aquaculture", "banking", "retail", "manufacturing"
    company_size = Column(String(50))     # CompanySize enum as string
    company_description = Column(Text)
    
    # Información comercial del contrato
    contract_type = Column(String(100))   # ContractType enum as string
    contract_start_date = Column(Date)
    contract_end_date = Column(Date)
    is_active = Column(Boolean, default=True)
    is_trial = Column(Boolean, default=False)
    trial_end_date = Column(Date)
    
    # Límites de usuarios y uso (importante para facturación)
    max_users = Column(Integer, default=5)
    current_users = Column(Integer, default=0)
    max_sandbox_sessions = Column(Integer, default=10)
    current_sandbox_sessions = Column(Integer, default=0)
    max_monthly_exports = Column(Integer, default=50)
    current_monthly_exports = Column(Integer, default=0)
    
    # Módulos y características habilitadas
    allowed_modules = Column(JSONB)       # ["modulo1", "modulo3", "sandbox"]  
    features_enabled = Column(JSONB)      # ["export_rat", "multi_user", "custom_templates", "api_access"]
    custom_branding_enabled = Column(Boolean, default=False)
    
    # Información de contacto principal
    primary_contact_name = Column(String(255))
    primary_contact_email = Column(String(255))
    primary_contact_phone = Column(String(50))
    primary_contact_role = Column(String(100))  # "DPO", "Legal Manager", "IT Director"
    
    # Dirección y ubicación
    address_street = Column(String(255))
    address_city = Column(String(100))
    address_region = Column(String(100))
    address_country = Column(String(100), default="Chile")
    address_postal_code = Column(String(20))
    
    # Configuración específica de la empresa
    timezone = Column(String(50), default="America/Santiago")
    language = Column(String(10), default="es")
    currency = Column(String(3), default="CLP")
    
    # Métricas de uso y progreso
    total_training_hours = Column(Integer, default=0)
    completed_certifications = Column(Integer, default=0)
    sandbox_documents_generated = Column(Integer, default=0)
    last_activity_date = Column(DateTime(timezone=True))
    
    # Estado de facturación
    billing_status = Column(String(50), default="active")  # "active", "overdue", "suspended"
    last_invoice_date = Column(Date)
    next_billing_date = Column(Date)
    
    # Metadatos
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(String(36))  # ID del usuario administrador que creó la empresa
    
    # Relaciones
    users = relationship("CompanyUser", back_populates="company", cascade="all, delete-orphan")
    workspaces = relationship("CompanyWorkspace", back_populates="company", cascade="all, delete-orphan")
    usage_metrics = relationship("CompanyUsageMetrics", back_populates="company", cascade="all, delete-orphan")
    quotas = relationship("CompanyQuota", back_populates="company", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<ClientCompany(name={self.company_name}, rut={self.company_rut})>"


class CompanyUser(Base):
    """
    Usuarios dentro de cada empresa cliente
    Aproximadamente 3 usuarios por empresa = 600 usuarios totales
    """
    __tablename__ = "company_users"
    
    id = Column(String(36), primary_key=True)
    company_id = Column(String(36), ForeignKey('client_companies.id'), nullable=False)
    
    # Autenticación
    email = Column(String(255), nullable=False)
    password_hash = Column(String(255), nullable=False)
    
    # Información personal
    first_name = Column(String(100))
    last_name = Column(String(100))
    phone = Column(String(50))
    
    # Rol en la empresa
    role_in_company = Column(String(100))  # "dpo", "legal_counsel", "it_engineer", "manager", "employee"
    department = Column(String(100))
    job_title = Column(String(255))
    reports_to = Column(String(36), ForeignKey('company_users.id'))  # Usuario superior
    
    # Estado de acceso
    is_active = Column(Boolean, default=True)
    is_company_admin = Column(Boolean, default=False)  # Puede gestionar otros usuarios de su empresa
    can_create_workspaces = Column(Boolean, default=True)
    can_export_documents = Column(Boolean, default=True)
    
    # Permisos específicos
    permissions = Column(JSONB)  # ["manage_users", "export_data", "admin_sandbox"]
    
    # Progreso de capacitación
    modules_completed = Column(JSONB)  # ["modulo1", "modulo3"]
    current_module = Column(String(50))
    total_hours_completed = Column(Integer, default=0)
    certification_status = Column(String(50))  # CertificationStatus enum as string
    certification_date = Column(Date)
    certification_expiry_date = Column(Date)
    
    # Uso del Sandbox
    sandbox_sessions_created = Column(Integer, default=0)
    sandbox_documents_exported = Column(Integer, default=0)
    last_sandbox_session = Column(DateTime(timezone=True))
    preferred_export_format = Column(String(50), default="pdf")
    
    # Configuración personal
    preferred_language = Column(String(10), default="es")
    timezone = Column(String(50), default="America/Santiago")
    email_notifications = Column(Boolean, default=True)
    
    # Actividad
    last_login = Column(DateTime(timezone=True))
    login_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relaciones
    company = relationship("ClientCompany", back_populates="users")
    subordinates = relationship("CompanyUser", remote_side=[reports_to])
    owned_workspaces = relationship("CompanyWorkspace", foreign_keys="CompanyWorkspace.owner_user_id")
    
    def __repr__(self):
        return f"<CompanyUser(email={self.email}, company={self.company_id})>"


class CompanyWorkspace(Base):
    """
    Espacios de trabajo colaborativo por empresa
    Permite a los 3 usuarios de cada empresa trabajar juntos en proyectos RAT
    """
    __tablename__ = "company_workspaces"
    
    id = Column(String(36), primary_key=True)
    company_id = Column(String(36), ForeignKey('client_companies.id'), nullable=False)
    
    # Información del workspace
    workspace_name = Column(String(255), nullable=False)
    workspace_description = Column(Text)
    workspace_type = Column(String(100))  # "sandbox_project", "real_rat", "training", "assessment"
    
    # Configuración colaborativa
    owner_user_id = Column(String(36), ForeignKey('company_users.id'), nullable=False)
    collaborators = Column(JSONB)  # Lista de company_user_ids que pueden colaborar
    max_collaborators = Column(Integer, default=3)  # Límite de 3 usuarios por empresa
    
    # Estado del proyecto
    project_status = Column(String(50))  # "planning", "in_progress", "review", "completed", "archived"
    progress_percentage = Column(Integer, default=0)
    target_completion_date = Column(Date)
    actual_completion_date = Column(Date)
    
    # Configuración de datos
    contains_real_company_data = Column(Boolean, default=False)
    confidentiality_level = Column(String(50))  # "public", "internal", "confidential", "restricted"
    
    # Recursos compartidos
    shared_templates = Column(JSONB)
    shared_documents = Column(JSONB) 
    shared_assessments = Column(JSONB)
    
    # Configuración de exportación
    export_permissions = Column(JSONB)  # Qué usuarios pueden exportar
    auto_backup_enabled = Column(Boolean, default=True)
    backup_frequency = Column(String(50), default="daily")
    
    # Actividad
    last_activity_date = Column(DateTime(timezone=True))
    last_activity_user_id = Column(String(36))
    total_activities = Column(Integer, default=0)
    
    # Metadatos
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relaciones
    company = relationship("ClientCompany", back_populates="workspaces")
    owner = relationship("CompanyUser", foreign_keys=[owner_user_id])
    
    def __repr__(self):
        return f"<CompanyWorkspace(name={self.workspace_name}, company={self.company_id})>"


class CompanyUsageMetrics(Base):
    """
    Métricas de uso por empresa para facturación y análisis
    Critical para manejar 200 empresas cliente
    """
    __tablename__ = "company_usage_metrics"
    
    id = Column(String(36), primary_key=True)
    company_id = Column(String(36), ForeignKey('client_companies.id'), nullable=False)
    
    # Período de medición
    measurement_date = Column(Date, nullable=False)
    measurement_type = Column(String(50))  # "daily", "weekly", "monthly"
    
    # Métricas de usuarios
    active_users_count = Column(Integer, default=0)
    new_users_count = Column(Integer, default=0)
    total_login_hours = Column(Integer, default=0)
    unique_logins = Column(Integer, default=0)
    
    # Métricas de Sandbox
    sandbox_sessions_created = Column(Integer, default=0)
    sandbox_sessions_completed = Column(Integer, default=0)
    sandbox_documents_generated = Column(Integer, default=0)
    sandbox_exports_count = Column(Integer, default=0)
    
    # Métricas de capacitación
    modules_started = Column(Integer, default=0)
    modules_completed = Column(Integer, default=0)
    certifications_issued = Column(Integer, default=0)
    total_learning_hours = Column(Integer, default=0)
    
    # Métricas de colaboración
    workspaces_created = Column(Integer, default=0)
    collaborative_sessions = Column(Integer, default=0)
    documents_shared = Column(Integer, default=0)
    
    # Datos para facturación
    billable_users = Column(Integer, default=0)
    billable_sessions = Column(Integer, default=0)
    billable_exports = Column(Integer, default=0)
    overage_charges = Column(Integer, default=0)
    
    # Metadatos
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    
    # Relaciones
    company = relationship("ClientCompany", back_populates="usage_metrics")
    
    def __repr__(self):
        return f"<CompanyUsageMetrics(company={self.company_id}, date={self.measurement_date})>"


class CompanyQuota(Base):
    """
    Límites y cuotas por contrato de empresa
    Define qué puede hacer cada empresa cliente
    """
    __tablename__ = "company_quotas"
    
    id = Column(String(36), primary_key=True)
    company_id = Column(String(36), ForeignKey('client_companies.id'), nullable=False)
    
    # Límites de usuarios (crítico para el modelo de 3 usuarios/empresa)
    max_users = Column(Integer, nullable=False)
    max_concurrent_users = Column(Integer)
    max_company_admins = Column(Integer, default=1)
    
    # Límites de Sandbox y documentos
    max_sandbox_sessions_per_month = Column(Integer)
    max_sandbox_exports_per_month = Column(Integer)
    max_documents_generated_per_month = Column(Integer)
    max_workspaces = Column(Integer, default=5)
    
    # Límites de almacenamiento
    max_storage_mb = Column(Integer)
    max_session_duration_hours = Column(Integer)
    max_document_size_mb = Column(Integer, default=50)
    
    # Características habilitadas por contrato
    features_enabled = Column(JSONB)
    modules_allowed = Column(JSONB)
    export_formats_allowed = Column(JSONB)  # ["pdf", "excel", "word", "json"]
    
    # Características premium
    custom_branding_enabled = Column(Boolean, default=False)
    api_access_enabled = Column(Boolean, default=False)
    priority_support = Column(Boolean, default=False)
    dedicated_account_manager = Column(Boolean, default=False)
    
    # Vigencia del contrato
    valid_from = Column(Date, nullable=False)
    valid_until = Column(Date)
    auto_renewal = Column(Boolean, default=True)
    
    # Metadatos
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relaciones
    company = relationship("ClientCompany", back_populates="quotas")
    
    def __repr__(self):
        return f"<CompanyQuota(company={self.company_id}, max_users={self.max_users})>"


# Índices optimizados para 200 empresas + 600 usuarios
Index('idx_client_companies_active', ClientCompany.is_active)
Index('idx_client_companies_contract_type', ClientCompany.contract_type)
Index('idx_client_companies_sector', ClientCompany.company_sector)
Index('idx_client_companies_rut', ClientCompany.company_rut)

Index('idx_company_users_company_email', CompanyUser.company_id, CompanyUser.email)
Index('idx_company_users_active', CompanyUser.is_active)
Index('idx_company_users_role', CompanyUser.role_in_company)
Index('idx_company_users_certification', CompanyUser.certification_status)

Index('idx_company_workspaces_company', CompanyWorkspace.company_id)
Index('idx_company_workspaces_owner', CompanyWorkspace.owner_user_id)
Index('idx_company_workspaces_status', CompanyWorkspace.project_status)

Index('idx_usage_metrics_company_date', CompanyUsageMetrics.company_id, CompanyUsageMetrics.measurement_date)
Index('idx_usage_metrics_type', CompanyUsageMetrics.measurement_type)

Index('idx_company_quotas_company', CompanyQuota.company_id)
Index('idx_company_quotas_validity', CompanyQuota.valid_from, CompanyQuota.valid_until)