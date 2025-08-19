# Diseño de Base de Datos para Sandbox como Motor de Datos Real

## Análisis de Necesidades

El usuario requiere que el módulo Sandbox sea "prácticamente el motor de los datos, es una simulación real que luego se puede descargar". Esto significa que necesitamos:

1. **Capacidad de crear RATs reales y completos**
2. **Sistema de exportación descargable** 
3. **Simulaciones que generen documentos aplicables en la práctica**
4. **Base de datos robusta que almacene sesiones de trabajo**

## Modificaciones Requeridas en la Base de Datos

### 1. Nuevas Tablas para Sandbox Profesional

```sql
-- Sesiones de trabajo en Sandbox
CREATE TABLE sandbox_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    tenant_id VARCHAR(36) NOT NULL,
    
    -- Información del proyecto
    organization_name VARCHAR(255) NOT NULL,
    organization_rut VARCHAR(20),
    project_name VARCHAR(255) NOT NULL,
    project_description TEXT,
    
    -- Estado de la sesión
    status VARCHAR(50) DEFAULT 'active', -- active, completed, exported
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Configuración
    scenario_type VARCHAR(100), -- professional_mapping, compliance_audit, etc.
    is_real_simulation BOOLEAN DEFAULT true,
    
    -- Metadatos de exportación
    export_format VARCHAR(50), -- json, excel, pdf, word
    last_export_at TIMESTAMP WITH TIME ZONE,
    export_count INTEGER DEFAULT 0
);

-- Actividades RAT generadas en Sandbox
CREATE TABLE sandbox_rat_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES sandbox_sessions(id) ON DELETE CASCADE,
    tenant_id VARCHAR(36) NOT NULL,
    
    -- Datos completos de la actividad
    activity_code VARCHAR(100) NOT NULL,
    activity_name VARCHAR(255) NOT NULL,
    activity_description TEXT,
    
    -- Responsabilidad
    responsible_area VARCHAR(255),
    responsible_person VARCHAR(255),
    responsible_email VARCHAR(255),
    
    -- Propósito y base legal
    primary_purpose TEXT NOT NULL,
    secondary_purposes JSONB,
    legal_basis VARCHAR(100) NOT NULL,
    legal_justification TEXT,
    
    -- Datos procesados
    data_categories JSONB NOT NULL, -- {"personal_data": [], "sensitive_data": [], "special_categories": []}
    data_subjects JSONB, -- ["employees", "customers", "suppliers"]
    data_volume VARCHAR(100),
    processing_frequency VARCHAR(100),
    
    -- Sistemas y flujos
    systems_involved JSONB, -- ["CRM", "ERP", "Cloud storage"]
    data_sources JSONB, -- ["direct_collection", "third_parties", "public_sources"]
    internal_recipients JSONB,
    external_recipients JSONB,
    
    -- Transferencias
    has_international_transfer BOOLEAN DEFAULT false,
    transfer_countries JSONB,
    transfer_guarantees TEXT,
    transfer_mechanisms JSONB,
    
    -- Retención y eliminación
    retention_period VARCHAR(200),
    retention_criteria TEXT,
    deletion_process TEXT,
    
    -- Seguridad y riesgo
    security_measures JSONB,
    risk_level VARCHAR(50), -- low, medium, high, very_high
    risk_assessment JSONB,
    requires_dpia BOOLEAN DEFAULT false,
    
    -- Estado y validación
    is_complete BOOLEAN DEFAULT false,
    validation_status VARCHAR(50) DEFAULT 'draft', -- draft, validated, approved
    validation_feedback JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Flujos de datos mapeados
CREATE TABLE sandbox_data_flows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES sandbox_sessions(id) ON DELETE CASCADE,
    activity_id UUID REFERENCES sandbox_rat_activities(id) ON DELETE CASCADE,
    tenant_id VARCHAR(36) NOT NULL,
    
    -- Flujo
    source_type VARCHAR(100), -- system, person, external_entity
    source_name VARCHAR(255),
    source_details JSONB,
    
    destination_type VARCHAR(100),
    destination_name VARCHAR(255), 
    destination_details JSONB,
    
    -- Datos del flujo
    data_transferred JSONB,
    transfer_method VARCHAR(100), -- api, file, manual, automated
    transfer_frequency VARCHAR(100),
    
    -- Seguridad del flujo
    is_encrypted BOOLEAN DEFAULT false,
    access_controls JSONB,
    monitoring_measures JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Documentos generados
CREATE TABLE sandbox_generated_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES sandbox_sessions(id) ON DELETE CASCADE,
    tenant_id VARCHAR(36) NOT NULL,
    
    -- Información del documento
    document_type VARCHAR(100), -- rat_complete, privacy_policy, consent_form, dpia_template
    document_name VARCHAR(255),
    document_description TEXT,
    
    -- Contenido
    content JSONB NOT NULL, -- Contenido estructurado del documento
    formatted_content TEXT, -- Versión en texto/HTML para exportar
    
    -- Metadatos
    template_used VARCHAR(255),
    generation_parameters JSONB,
    
    -- Estado
    is_finalized BOOLEAN DEFAULT false,
    download_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Evaluaciones y retroalimentación
CREATE TABLE sandbox_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES sandbox_sessions(id) ON DELETE CASCADE,
    activity_id UUID REFERENCES sandbox_rat_activities(id),
    tenant_id VARCHAR(36) NOT NULL,
    
    -- Evaluación
    assessment_type VARCHAR(100), -- completeness, legal_compliance, best_practices
    score INTEGER, -- 0-100
    max_score INTEGER DEFAULT 100,
    
    -- Feedback detallado
    strengths JSONB, -- Areas where the user did well
    improvements JSONB, -- Areas needing improvement
    recommendations JSONB, -- Specific recommendations
    
    -- Criterios evaluados
    criteria_evaluated JSONB, -- {"legal_basis": "correct", "data_minimization": "needs_improvement"}
    
    -- Automático vs manual
    is_automated BOOLEAN DEFAULT true,
    evaluator_id UUID REFERENCES users(id),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Plantillas profesionales
CREATE TABLE sandbox_professional_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(36) NOT NULL,
    
    -- Información de la plantilla
    template_name VARCHAR(255) NOT NULL,
    template_type VARCHAR(100), -- rat_template, interview_guide, policy_template
    industry_sector VARCHAR(100), -- aquaculture, finance, healthcare, general
    complexity_level VARCHAR(50), -- basic, intermediate, advanced, expert
    
    -- Contenido
    template_structure JSONB NOT NULL,
    default_values JSONB,
    validation_rules JSONB,
    
    -- Metadatos
    created_by UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    is_public BOOLEAN DEFAULT false,
    usage_count INTEGER DEFAULT 0,
    
    -- Versioning
    version VARCHAR(20) DEFAULT '1.0',
    parent_template_id UUID REFERENCES sandbox_professional_templates(id),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Índices para Performance

```sql
-- Índices principales
CREATE INDEX idx_sandbox_sessions_user_tenant ON sandbox_sessions(user_id, tenant_id);
CREATE INDEX idx_sandbox_sessions_status ON sandbox_sessions(status);
CREATE INDEX idx_sandbox_rat_activities_session ON sandbox_rat_activities(session_id);
CREATE INDEX idx_sandbox_rat_activities_complete ON sandbox_rat_activities(is_complete);
CREATE INDEX idx_sandbox_data_flows_session ON sandbox_data_flows(session_id);
CREATE INDEX idx_sandbox_data_flows_activity ON sandbox_data_flows(activity_id);
CREATE INDEX idx_sandbox_documents_session ON sandbox_generated_documents(session_id);
CREATE INDEX idx_sandbox_assessments_session ON sandbox_assessments(session_id);
CREATE INDEX idx_sandbox_templates_type_sector ON sandbox_professional_templates(template_type, industry_sector);
```

## Funcionalidades del Motor de Datos Real

### 1. Simulación Profesional
- **RAT Completo**: Genera registros de actividades de tratamiento que cumplen 100% con Ley 21.719
- **Mapeo de Flujos**: Documenta flujos de datos entre sistemas, personas y terceros
- **Evaluación de Riesgos**: Calcula automáticamente niveles de riesgo basado en datos sensibles y flujos

### 2. Exportación Profesional
- **Formatos Múltiples**: JSON, Excel, Word, PDF
- **Documentos Listos**: RAT, políticas de privacidad, formularios de consentimiento
- **Compatibilidad**: Compatible con sistemas ERP, GRC y herramientas de auditoría

### 3. Validación en Tiempo Real
- **Cumplimiento Legal**: Verifica que cada actividad cumpla con los artículos específicos de Ley 21.719
- **Mejores Prácticas**: Sugiere mejoras basadas en estándares internacionales
- **Retroalimentación Educativa**: Explica el "por qué" de cada recomendación

### 4. Colaboración de Equipos
- **Sesiones Compartidas**: Múltiples usuarios pueden trabajar en el mismo RAT
- **Roles Diferenciados**: DPO, Legal, TI, Áreas de Negocio
- **Control de Versiones**: Tracking de cambios y aprobaciones

## Migración de Datos Existente

El modelo actual de `inventario.py` se mantiene para datos reales, mientras que las nuevas tablas sandbox manejan las simulaciones. Esto permite:

1. **Separación clara** entre datos reales y de práctica
2. **Exportación** de datos sandbox a formato real cuando se requiera
3. **Aprendizaje seguro** sin riesgo de afectar datos de producción

## Siguientes Pasos de Implementación

1. **Crear migración de Alembic** para las nuevas tablas
2. **Actualizar modelos SQLAlchemy** con las nuevas entidades
3. **Crear servicios** para gestión de sesiones sandbox
4. **Implementar API endpoints** para CRUD de actividades RAT
5. **Desarrollar sistema de exportación** con múltiples formatos
6. **Crear interfaz frontend** para el motor de datos

Esta arquitectura convierte el Sandbox en una herramienta profesional real que genera documentos aplicables inmediatamente en organizaciones, cumpliendo con los requerimientos del usuario.