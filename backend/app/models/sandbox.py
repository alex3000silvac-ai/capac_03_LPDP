"""
Modelos para el Sandbox Profesional - Motor de Datos Real
Sistema completo para generar RATs descargables según Ley 21.719
"""
from sqlalchemy import Column, String, Boolean, DateTime, JSON, Text, ForeignKey, Integer, Enum, Index
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import JSONB
from .base import TenantBaseModel
import enum
from datetime import datetime


class SandboxSessionStatus(enum.Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    EXPORTED = "exported"
    ARCHIVED = "archived"


class ValidationStatus(enum.Enum):
    DRAFT = "draft"
    VALIDATED = "validated"
    APPROVED = "approved"
    NEEDS_REVIEW = "needs_review"


class RiskLevel(enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    VERY_HIGH = "very_high"


class DocumentType(enum.Enum):
    RAT_COMPLETE = "rat_complete"
    PRIVACY_POLICY = "privacy_policy"
    CONSENT_FORM = "consent_form"
    DPIA_TEMPLATE = "dpia_template"
    INTERVIEW_GUIDE = "interview_guide"
    SECURITY_POLICY = "security_policy"
    RETENTION_POLICY = "retention_policy"


class SandboxSession(TenantBaseModel):
    """
    Sesiones de trabajo profesional en Sandbox
    Cada sesión representa un proyecto completo de mapeo de datos
    Diseñado para 200 empresas cliente con 3 usuarios promedio c/u
    """
    __tablename__ = "sandbox_sessions"
    
    # Usuario y empresa cliente
    user_id = Column(String(36), ForeignKey('users.id'), nullable=False)
    company_id = Column(String(36), ForeignKey('client_companies.id'), nullable=False)
    
    # Información del proyecto/organización simulada
    organization_name = Column(String(255), nullable=False)
    organization_rut = Column(String(20))
    organization_sector = Column(String(100))
    project_name = Column(String(255), nullable=False)
    project_description = Column(Text)
    
    # Estado de la sesión
    status = Column(Enum(SandboxSessionStatus), default=SandboxSessionStatus.ACTIVE)
    completed_at = Column(DateTime(timezone=True))
    
    # Configuración de la simulación
    scenario_type = Column(String(100))  # professional_mapping, compliance_audit, etc.
    is_real_simulation = Column(Boolean, default=True)
    complexity_level = Column(String(50))  # basic, intermediate, advanced, expert
    
    # Configuración de exportación
    export_format = Column(String(50))  # json, excel, pdf, word
    last_export_at = Column(DateTime(timezone=True))
    export_count = Column(Integer, default=0)
    
    # Metadatos del proyecto
    project_metadata = Column(JSONB)  # Configuraciones específicas, objetivos, etc.
    
    # Colaboración empresarial (hasta 3 usuarios por empresa)
    is_company_shared = Column(Boolean, default=False)
    shared_with_users = Column(JSONB)  # ["user_id1", "user_id2"] - máximo 3 usuarios por empresa
    collaborators_count = Column(Integer, default=1)
    
    # Límites por empresa cliente
    company_session_limit = Column(Integer, default=10)  # Límite de sesiones por empresa
    company_current_sessions = Column(Integer, default=1)
    
    # Progreso
    progress_percentage = Column(Integer, default=0)
    activities_count = Column(Integer, default=0)
    completed_activities_count = Column(Integer, default=0)
    
    # Relaciones
    activities = relationship("SandboxRATActivity", back_populates="session", cascade="all, delete-orphan")
    data_flows = relationship("SandboxDataFlow", back_populates="session", cascade="all, delete-orphan")
    documents = relationship("SandboxGeneratedDocument", back_populates="session", cascade="all, delete-orphan")
    assessments = relationship("SandboxAssessment", back_populates="session", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<SandboxSession(id={self.id}, organization={self.organization_name}, status={self.status})>"


class SandboxRATActivity(TenantBaseModel):
    """
    Actividades RAT generadas en el Sandbox
    Estas pueden ser exportadas como RAT real para usar en organizaciones
    """
    __tablename__ = "sandbox_rat_activities"
    
    session_id = Column(String(36), ForeignKey('sandbox_sessions.id'), nullable=False)
    
    # Identificación de la actividad
    activity_code = Column(String(100), nullable=False)
    activity_name = Column(String(255), nullable=False)
    activity_description = Column(Text)
    
    # Responsabilidad
    responsible_area = Column(String(255))
    responsible_person = Column(String(255))
    responsible_email = Column(String(255))
    responsible_phone = Column(String(50))
    
    # Propósito y justificación
    primary_purpose = Column(Text, nullable=False)
    secondary_purposes = Column(JSONB)  # ["purpose1", "purpose2"]
    business_justification = Column(Text)
    
    # Base legal
    legal_basis = Column(String(100), nullable=False)  # consentimiento, contrato, etc.
    legal_justification = Column(Text)
    legal_article_reference = Column(String(200))  # Artículo específico de Ley 21.719
    
    # Categorías de datos procesados
    data_categories = Column(JSONB, nullable=False)  # {"personal_data": [], "sensitive_data": [], "special_categories": []}
    data_subjects = Column(JSONB)  # ["employees", "customers", "suppliers", "minors"]
    data_volume = Column(String(100))  # "< 1000 registros", "1000-10000", etc.
    processing_frequency = Column(String(100))  # "diario", "semanal", etc.
    
    # Sistemas y tecnología
    systems_involved = Column(JSONB)  # ["CRM", "ERP", "Cloud storage", "IoT sensors"]
    data_sources = Column(JSONB)  # ["direct_collection", "third_parties", "public_sources"]
    storage_locations = Column(JSONB)  # ["local_servers", "cloud_aws", "third_party"]
    
    # Destinatarios internos y externos
    internal_recipients = Column(JSONB)  # ["HR", "Finance", "Management"]
    external_recipients = Column(JSONB)  # [{"name": "Previred", "type": "legal_obligation"}]
    
    # Transferencias internacionales
    has_international_transfer = Column(Boolean, default=False)
    transfer_countries = Column(JSONB)  # ["USA", "Spain", "Norway"]
    transfer_guarantees = Column(Text)
    transfer_mechanisms = Column(JSONB)  # ["adequacy_decision", "standard_clauses"]
    
    # Retención y eliminación
    retention_period = Column(String(200))
    retention_criteria = Column(Text)
    deletion_process = Column(Text)
    deletion_responsible = Column(String(255))
    
    # Seguridad
    security_measures = Column(JSONB)  # {"technical": [], "organizational": []}
    access_controls = Column(JSONB)
    encryption_used = Column(Boolean, default=False)
    audit_logs = Column(Boolean, default=False)
    
    # Evaluación de riesgos
    risk_level = Column(Enum(RiskLevel), default=RiskLevel.MEDIUM)
    risk_assessment = Column(JSONB)  # Evaluación detallada de riesgos
    requires_dpia = Column(Boolean, default=False)
    dpia_completed = Column(Boolean, default=False)
    dpia_date = Column(DateTime(timezone=True))
    
    # Estado y validación
    is_complete = Column(Boolean, default=False)
    validation_status = Column(Enum(ValidationStatus), default=ValidationStatus.DRAFT)
    validation_feedback = Column(JSONB)
    completeness_score = Column(Integer)  # 0-100
    
    # Metadatos adicionales
    tags = Column(JSONB)  # ["IoT", "sensitive_data", "international_transfer"]
    notes = Column(Text)
    
    # Relaciones
    session = relationship("SandboxSession", back_populates="activities")
    data_flows = relationship("SandboxDataFlow", back_populates="activity", cascade="all, delete-orphan")
    assessments = relationship("SandboxAssessment", back_populates="activity")
    
    def __repr__(self):
        return f"<SandboxRATActivity(code={self.activity_code}, name={self.activity_name})>"


class SandboxDataFlow(TenantBaseModel):
    """
    Flujos de datos mapeados dentro de las actividades
    Documenta cómo se mueven los datos entre sistemas, personas y organizaciones
    """
    __tablename__ = "sandbox_data_flows"
    
    session_id = Column(String(36), ForeignKey('sandbox_sessions.id'), nullable=False)
    activity_id = Column(String(36), ForeignKey('sandbox_rat_activities.id'))
    
    # Origen del flujo
    source_type = Column(String(100))  # "system", "person", "external_entity", "iot_sensor"
    source_name = Column(String(255))
    source_details = Column(JSONB)  # Detalles específicos del origen
    
    # Destino del flujo
    destination_type = Column(String(100))
    destination_name = Column(String(255))
    destination_details = Column(JSONB)
    
    # Datos transferidos
    data_transferred = Column(JSONB)  # ["personal_data", "sensitive_health", "financial"]
    transfer_purpose = Column(String(255))
    
    # Método y frecuencia
    transfer_method = Column(String(100))  # "api", "file_transfer", "manual_entry", "automated_sync"
    transfer_frequency = Column(String(100))  # "real_time", "daily", "weekly", "on_demand"
    
    # Seguridad del flujo
    is_encrypted = Column(Boolean, default=False)
    encryption_method = Column(String(100))
    access_controls = Column(JSONB)
    monitoring_measures = Column(JSONB)
    
    # Volumen y duración
    data_volume_per_transfer = Column(String(100))
    estimated_duration = Column(String(100))
    
    # Validación
    is_validated = Column(Boolean, default=False)
    validation_notes = Column(Text)
    
    # Relaciones
    session = relationship("SandboxSession", back_populates="data_flows")
    activity = relationship("SandboxRATActivity", back_populates="data_flows")
    
    def __repr__(self):
        return f"<SandboxDataFlow(from={self.source_name} to={self.destination_name})>"


class SandboxGeneratedDocument(TenantBaseModel):
    """
    Documentos generados y descargables desde el Sandbox
    Incluye RATs, políticas, formularios y plantillas
    """
    __tablename__ = "sandbox_generated_documents"
    
    session_id = Column(String(36), ForeignKey('sandbox_sessions.id'), nullable=False)
    
    # Información del documento
    document_type = Column(Enum(DocumentType), nullable=False)
    document_name = Column(String(255), nullable=False)
    document_description = Column(Text)
    file_name = Column(String(255))  # Nombre del archivo para descarga
    
    # Contenido estructurado
    content = Column(JSONB, nullable=False)  # Contenido en formato estructurado
    formatted_content = Column(Text)  # Contenido formateado para exportar (HTML, Markdown, etc.)
    
    # Metadatos de generación
    template_used = Column(String(255))
    generation_parameters = Column(JSONB)
    generator_version = Column(String(50))
    
    # Estado y estadísticas
    is_finalized = Column(Boolean, default=False)
    download_count = Column(Integer, default=0)
    last_downloaded_at = Column(DateTime(timezone=True))
    
    # Formato de exportación
    available_formats = Column(JSONB)  # ["pdf", "word", "excel", "json"]
    default_format = Column(String(50))
    
    # Validación legal
    legal_compliance_checked = Column(Boolean, default=False)
    compliance_notes = Column(Text)
    
    # Relaciones
    session = relationship("SandboxSession", back_populates="documents")
    
    def __repr__(self):
        return f"<SandboxGeneratedDocument(type={self.document_type}, name={self.document_name})>"


class SandboxAssessment(TenantBaseModel):
    """
    Evaluaciones y retroalimentación del trabajo en Sandbox
    Sistema de scoring y recomendaciones profesionales
    """
    __tablename__ = "sandbox_assessments"
    
    session_id = Column(String(36), ForeignKey('sandbox_sessions.id'), nullable=False)
    activity_id = Column(String(36), ForeignKey('sandbox_rat_activities.id'))
    
    # Tipo de evaluación
    assessment_type = Column(String(100))  # "completeness", "legal_compliance", "best_practices", "security"
    score = Column(Integer)  # 0-100
    max_score = Column(Integer, default=100)
    
    # Feedback detallado
    strengths = Column(JSONB)  # Aspectos positivos identificados
    improvements = Column(JSONB)  # Áreas que necesitan mejora
    recommendations = Column(JSONB)  # Recomendaciones específicas
    
    # Criterios evaluados
    criteria_evaluated = Column(JSONB)  # {"legal_basis": "excellent", "data_minimization": "needs_improvement"}
    
    # Detalles de evaluación
    evaluation_details = Column(JSONB)
    compliance_gaps = Column(JSONB)  # Brechas de cumplimiento identificadas
    
    # Automático vs manual
    is_automated = Column(Boolean, default=True)
    evaluator_id = Column(String(36), ForeignKey('users.id'))
    evaluation_algorithm = Column(String(100))  # Algoritmo usado para evaluación automática
    
    # Seguimiento
    previous_score = Column(Integer)  # Score anterior para tracking de mejora
    improvement_percentage = Column(Integer)
    
    # Relaciones
    session = relationship("SandboxSession", back_populates="assessments")
    activity = relationship("SandboxRATActivity", back_populates="assessments")
    
    def __repr__(self):
        return f"<SandboxAssessment(type={self.assessment_type}, score={self.score})>"


class SandboxProfessionalTemplate(TenantBaseModel):
    """
    Plantillas profesionales para diferentes industrias y casos de uso
    """
    __tablename__ = "sandbox_professional_templates"
    
    # Información básica
    template_name = Column(String(255), nullable=False)
    template_type = Column(String(100), nullable=False)  # "rat_template", "interview_guide", "policy_template"
    industry_sector = Column(String(100))  # "aquaculture", "finance", "healthcare", "general"
    complexity_level = Column(String(50))  # "basic", "intermediate", "advanced", "expert"
    
    # Contenido de la plantilla
    template_structure = Column(JSONB, nullable=False)
    default_values = Column(JSONB)
    validation_rules = Column(JSONB)
    
    # Configuración de uso
    is_active = Column(Boolean, default=True)
    is_public = Column(Boolean, default=False)
    usage_count = Column(Integer, default=0)
    
    # Metadatos de creación
    created_by = Column(String(36), ForeignKey('users.id'))
    description = Column(Text)
    tags = Column(JSONB)
    
    # Versioning
    version = Column(String(20), default='1.0')
    parent_template_id = Column(String(36), ForeignKey('sandbox_professional_templates.id'))
    
    # Compatibilidad
    compatible_with = Column(JSONB)  # Sistemas compatibles
    export_formats = Column(JSONB)  # Formatos de exportación soportados
    
    # Relaciones
    child_templates = relationship("SandboxProfessionalTemplate", remote_side=[parent_template_id])
    
    def __repr__(self):
        return f"<SandboxProfessionalTemplate(name={self.template_name}, type={self.template_type})>"


# Índices para optimización de consultas
Index('idx_sandbox_sessions_user_tenant', SandboxSession.user_id, SandboxSession.tenant_id)
Index('idx_sandbox_sessions_status', SandboxSession.status)
Index('idx_sandbox_sessions_organization', SandboxSession.organization_name)

Index('idx_sandbox_rat_activities_session', SandboxRATActivity.session_id)
Index('idx_sandbox_rat_activities_complete', SandboxRATActivity.is_complete)
Index('idx_sandbox_rat_activities_validation', SandboxRATActivity.validation_status)
Index('idx_sandbox_rat_activities_risk', SandboxRATActivity.risk_level)

Index('idx_sandbox_data_flows_session', SandboxDataFlow.session_id)
Index('idx_sandbox_data_flows_activity', SandboxDataFlow.activity_id)

Index('idx_sandbox_documents_session', SandboxGeneratedDocument.session_id)
Index('idx_sandbox_documents_type', SandboxGeneratedDocument.document_type)

Index('idx_sandbox_assessments_session', SandboxAssessment.session_id)
Index('idx_sandbox_assessments_activity', SandboxAssessment.activity_id)
Index('idx_sandbox_assessments_type', SandboxAssessment.assessment_type)

Index('idx_sandbox_templates_type_sector', SandboxProfessionalTemplate.template_type, SandboxProfessionalTemplate.industry_sector)
Index('idx_sandbox_templates_active', SandboxProfessionalTemplate.is_active)