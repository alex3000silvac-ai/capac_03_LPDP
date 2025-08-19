# Arquitectura Multi-Tenant para 200 Empresas Cliente

## Escala del Proyecto

- **200 empresas cliente** (cada empresa = 1 tenant)
- **3 usuarios promedio por empresa** = 600 usuarios totales
- **Roles típicos por empresa**: DPO, Abogado/Legal, Ingeniero/TI
- **Modelo de negocio**: B2B con capacitación especializada por empresa

## Arquitectura de Tenants

### 1. Estructura de Datos por Empresa

```sql
-- Cada empresa cliente es un tenant independiente
-- tenant_id se mapea a company_id para claridad de negocio

-- Tabla ampliada de empresas cliente
CREATE TABLE client_companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(255) NOT NULL,
    company_rut VARCHAR(20) UNIQUE NOT NULL,
    company_sector VARCHAR(100), -- "aquaculture", "banking", "retail", etc.
    company_size VARCHAR(50), -- "small", "medium", "large", "enterprise"
    
    -- Información comercial
    contract_type VARCHAR(100), -- "basic", "professional", "enterprise"
    contract_start_date DATE,
    contract_end_date DATE,
    is_active BOOLEAN DEFAULT true,
    
    -- Límites de capacitación
    max_users INTEGER DEFAULT 5,
    current_users INTEGER DEFAULT 0,
    max_sandbox_sessions INTEGER DEFAULT 10,
    current_sandbox_sessions INTEGER DEFAULT 0,
    
    -- Configuración específica
    allowed_modules JSONB, -- ["modulo1", "modulo3", "sandbox"]
    features_enabled JSONB, -- ["export_rat", "multi_user", "custom_templates"]
    
    -- Datos de contacto principal
    primary_contact_name VARCHAR(255),
    primary_contact_email VARCHAR(255),
    primary_contact_phone VARCHAR(50),
    
    -- Metadatos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Usuarios por empresa (expandido)
CREATE TABLE company_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES client_companies(id),
    
    -- Información del usuario
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    
    -- Rol en la empresa
    role_in_company VARCHAR(100), -- "dpo", "legal_counsel", "it_engineer", "manager", "employee"
    department VARCHAR(100),
    job_title VARCHAR(255),
    
    -- Configuración de acceso
    is_active BOOLEAN DEFAULT true,
    is_company_admin BOOLEAN DEFAULT false, -- Puede gestionar otros usuarios de su empresa
    permissions JSONB, -- Permisos específicos dentro de la empresa
    
    -- Progreso de capacitación
    modules_completed JSONB, -- ["modulo1", "modulo3"]
    current_module VARCHAR(50),
    total_hours_completed INTEGER DEFAULT 0,
    certification_status VARCHAR(50), -- "in_progress", "completed", "expired"
    
    -- Sandbox usage
    sandbox_sessions_created INTEGER DEFAULT 0,
    last_sandbox_session TIMESTAMP WITH TIME ZONE,
    
    -- Metadatos
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Índice único por empresa
    UNIQUE(company_id, email)
);
```

### 2. Sesiones Sandbox por Empresa

```sql
-- Modificación a sandbox_sessions para multi-empresa
ALTER TABLE sandbox_sessions ADD COLUMN company_id UUID REFERENCES client_companies(id);
ALTER TABLE sandbox_sessions ADD COLUMN is_company_shared BOOLEAN DEFAULT false;
ALTER TABLE sandbox_sessions ADD COLUMN shared_with_users JSONB; -- ["user_id1", "user_id2"]

-- Agregar límites por empresa
ALTER TABLE sandbox_sessions ADD COLUMN company_session_limit INTEGER;
ALTER TABLE sandbox_sessions ADD COLUMN company_current_sessions INTEGER;

-- Workspace colaborativo por empresa
CREATE TABLE company_workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES client_companies(id),
    
    -- Información del workspace
    workspace_name VARCHAR(255) NOT NULL,
    workspace_description TEXT,
    
    -- Configuración colaborativa
    owner_user_id UUID NOT NULL REFERENCES company_users(id),
    collaborators JSONB, -- Lista de user_ids que pueden colaborar
    
    -- Estado del proyecto empresarial
    project_status VARCHAR(50), -- "planning", "in_progress", "review", "completed"
    target_completion_date DATE,
    
    -- RAT empresarial real
    real_company_data BOOLEAN DEFAULT false, -- Si contiene datos reales de la empresa
    confidentiality_level VARCHAR(50), -- "public", "internal", "confidential", "restricted"
    
    -- Recursos compartidos
    shared_templates JSONB,
    shared_documents JSONB,
    shared_assessments JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 3. Sistema de Facturación y Uso

```sql
-- Tracking de uso por empresa
CREATE TABLE company_usage_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES client_companies(id),
    
    -- Período de medición
    measurement_date DATE NOT NULL,
    measurement_type VARCHAR(50), -- "daily", "weekly", "monthly"
    
    -- Métricas de usuarios
    active_users_count INTEGER DEFAULT 0,
    new_users_count INTEGER DEFAULT 0,
    total_login_hours INTEGER DEFAULT 0,
    
    -- Métricas de Sandbox
    sandbox_sessions_created INTEGER DEFAULT 0,
    sandbox_documents_generated INTEGER DEFAULT 0,
    sandbox_exports_count INTEGER DEFAULT 0,
    
    -- Métricas de capacitación
    modules_completed INTEGER DEFAULT 0,
    certifications_issued INTEGER DEFAULT 0,
    total_learning_hours INTEGER DEFAULT 0,
    
    -- Datos para facturación
    billable_users INTEGER DEFAULT 0,
    billable_sessions INTEGER DEFAULT 0,
    billable_exports INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Límites y cuotas por contrato
CREATE TABLE company_quotas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES client_companies(id),
    
    -- Límites de usuarios
    max_users INTEGER NOT NULL,
    max_concurrent_users INTEGER,
    
    -- Límites de Sandbox
    max_sandbox_sessions_per_month INTEGER,
    max_sandbox_exports_per_month INTEGER,
    max_documents_generated_per_month INTEGER,
    
    -- Límites de almacenamiento
    max_storage_mb INTEGER,
    max_session_duration_hours INTEGER,
    
    -- Características habilitadas
    features_enabled JSONB,
    custom_branding_enabled BOOLEAN DEFAULT false,
    api_access_enabled BOOLEAN DEFAULT false,
    
    -- Vigencia
    valid_from DATE NOT NULL,
    valid_until DATE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## Arquitectura de Aplicación

### 1. Middleware de Tenant
```python
# Modificación del middleware existente para manejar company_id
class CompanyTenantMiddleware:
    async def __call__(self, request, call_next):
        # Extraer company_id del token JWT o header
        company_id = self.extract_company_id(request)
        
        # Validar límites de la empresa
        await self.validate_company_limits(company_id)
        
        # Inyectar company_id en el contexto de la request
        request.state.company_id = company_id
        request.state.tenant_id = company_id  # Backward compatibility
        
        response = await call_next(request)
        return response
```

### 2. Servicios por Empresa
```python
class CompanyService:
    async def get_company_dashboard_data(self, company_id: str):
        """Dashboard específico por empresa con métricas propias"""
        return {
            "company_info": await self.get_company_info(company_id),
            "users_summary": await self.get_users_summary(company_id),
            "training_progress": await self.get_training_progress(company_id),
            "sandbox_usage": await self.get_sandbox_usage(company_id),
            "recent_activities": await self.get_recent_activities(company_id),
            "quota_usage": await self.get_quota_usage(company_id)
        }
    
    async def create_company_workspace(self, company_id: str, workspace_data: dict):
        """Crear workspace colaborativo para la empresa"""
        # Validar límites de la empresa
        await self.validate_workspace_limits(company_id)
        
        # Crear workspace con configuración empresarial
        workspace = await self.workspace_repository.create(
            company_id=company_id,
            **workspace_data
        )
        
        return workspace
```

### 3. Roles y Permisos por Empresa
```python
# Roles específicos dentro de cada empresa
COMPANY_ROLES = {
    "company_admin": {
        "permissions": [
            "manage_company_users",
            "view_all_company_sessions", 
            "export_company_data",
            "manage_company_workspaces"
        ]
    },
    "dpo": {
        "permissions": [
            "create_sandbox_sessions",
            "export_rat_documents",
            "view_compliance_reports",
            "share_workspaces"
        ]
    },
    "legal_counsel": {
        "permissions": [
            "create_sandbox_sessions",
            "export_legal_documents",
            "view_compliance_reports"
        ]
    },
    "it_engineer": {
        "permissions": [
            "create_sandbox_sessions",
            "export_technical_documents",
            "view_system_integration_guides"
        ]
    }
}
```

## Escalabilidad y Performance

### 1. Particionamiento de Datos
```sql
-- Partición por company_id para optimizar consultas
CREATE TABLE sandbox_sessions_partitioned (
    LIKE sandbox_sessions INCLUDING ALL
) PARTITION BY HASH (company_id);

-- Crear particiones para distribuir carga
CREATE TABLE sandbox_sessions_part1 PARTITION OF sandbox_sessions_partitioned
    FOR VALUES WITH (modulus 4, remainder 0);
CREATE TABLE sandbox_sessions_part2 PARTITION OF sandbox_sessions_partitioned  
    FOR VALUES WITH (modulus 4, remainder 1);
-- etc.
```

### 2. Caching por Empresa
```python
# Cache específico por empresa
@cached(ttl=3600, key="company:{company_id}:dashboard")
async def get_company_dashboard(company_id: str):
    # Dashboard data específico por empresa
    pass

@cached(ttl=1800, key="company:{company_id}:quota_usage")  
async def get_company_quota_usage(company_id: str):
    # Uso de quotas específico por empresa
    pass
```

### 3. Monitoreo por Empresa
```python
# Métricas específicas por empresa
class CompanyMetrics:
    def track_user_activity(self, company_id: str, user_id: str, activity: str):
        # Track activity per company
        pass
    
    def track_sandbox_usage(self, company_id: str, session_data: dict):
        # Track sandbox usage per company
        pass
    
    def generate_company_report(self, company_id: str, period: str):
        # Generate usage reports per company
        pass
```

## Ventajas de esta Arquitectura

1. **Aislamiento de Datos**: Cada empresa ve solo sus datos y los de sus usuarios
2. **Escalabilidad**: Puede manejar crecimiento a 500+ empresas fácilmente  
3. **Facturación Precisa**: Tracking detallado por empresa para billing
4. **Colaboración Empresarial**: Equipos de 3 personas pueden trabajar juntos
5. **Personalización**: Cada empresa puede tener configuración específica
6. **Compliance**: Separación clara de datos para auditorías

Esta arquitectura está diseñada específicamente para el modelo de negocio de 200 empresas con 3 usuarios promedio, proporcionando la base sólida para escalabilidad y gestión efectiva de múltiples clientes empresariales.