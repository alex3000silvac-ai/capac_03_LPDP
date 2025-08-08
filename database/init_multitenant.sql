-- Script de inicialización para sistema multi-tenant
-- Compatible con PostgreSQL/Supabase

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Crear esquema público si no existe
CREATE SCHEMA IF NOT EXISTS public;

-- =====================================================
-- TABLAS DEL ESQUEMA MASTER (PUBLIC)
-- =====================================================

-- Tabla de Tenants (Empresas del sistema)
CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id VARCHAR(50) UNIQUE NOT NULL,
    schema_name VARCHAR(63) UNIQUE NOT NULL,
    
    -- Información de la empresa
    company_name VARCHAR(255) NOT NULL,
    rut VARCHAR(20) UNIQUE NOT NULL,
    razon_social VARCHAR(255),
    giro VARCHAR(255),
    
    -- Contacto
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    region VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Chile',
    
    -- Estado y configuración
    is_active BOOLEAN DEFAULT true NOT NULL,
    is_trial BOOLEAN DEFAULT false NOT NULL,
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    
    -- Límites y cuotas
    max_users INTEGER DEFAULT 10,
    max_data_subjects INTEGER DEFAULT 10000,
    storage_quota_mb INTEGER DEFAULT 1024,
    
    -- Billing
    billing_plan VARCHAR(50) DEFAULT 'basic',
    billing_cycle VARCHAR(20) DEFAULT 'monthly',
    next_billing_date TIMESTAMP WITH TIME ZONE,
    
    -- Configuración técnica
    database_created BOOLEAN DEFAULT false,
    schema_version VARCHAR(20),
    
    -- Metadata
    onboarding_completed BOOLEAN DEFAULT false,
    industry VARCHAR(100),
    employee_count VARCHAR(50),
    
    -- Seguridad
    allowed_ip_ranges JSONB,
    require_mfa BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Tabla de configuraciones por tenant
CREATE TABLE IF NOT EXISTS public.tenant_configs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    
    -- Configuración
    category VARCHAR(50) NOT NULL,
    key VARCHAR(100) NOT NULL,
    value JSONB,
    
    -- Control
    is_encrypted BOOLEAN DEFAULT false,
    is_system BOOLEAN DEFAULT false,
    
    -- Descripción
    description TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    
    UNIQUE(tenant_id, category, key)
);

-- Índices para el esquema master
CREATE INDEX idx_tenants_tenant_id ON public.tenants(tenant_id);
CREATE INDEX idx_tenants_is_active ON public.tenants(is_active);
CREATE INDEX idx_tenant_configs_tenant_id ON public.tenant_configs(tenant_id);

-- =====================================================
-- FUNCIÓN PARA CREAR ESQUEMA DE TENANT
-- =====================================================

CREATE OR REPLACE FUNCTION public.create_tenant_schema(p_tenant_id VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
    v_schema_name VARCHAR;
BEGIN
    v_schema_name := 'tenant_' || p_tenant_id;
    
    -- Crear esquema
    EXECUTE format('CREATE SCHEMA IF NOT EXISTS %I', v_schema_name);
    
    -- Crear tablas del tenant
    EXECUTE format('
        -- Usuarios
        CREATE TABLE %I.users (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            tenant_id VARCHAR(50) NOT NULL,
            
            -- Autenticación
            username VARCHAR(100) NOT NULL,
            email VARCHAR(255) NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            
            -- Información personal (encriptada)
            first_name VARCHAR(255),
            last_name VARCHAR(255),
            rut VARCHAR(20),
            phone VARCHAR(50),
            
            -- Estado
            is_active BOOLEAN DEFAULT true NOT NULL,
            is_superuser BOOLEAN DEFAULT false NOT NULL,
            is_dpo BOOLEAN DEFAULT false NOT NULL,
            
            -- Seguridad
            mfa_enabled BOOLEAN DEFAULT false,
            mfa_secret VARCHAR(255),
            last_login TIMESTAMP WITH TIME ZONE,
            last_ip VARCHAR(45),
            failed_login_attempts INTEGER DEFAULT 0,
            locked_until TIMESTAMP WITH TIME ZONE,
            
            -- Tokens
            email_verified BOOLEAN DEFAULT false,
            email_verification_token VARCHAR(255),
            password_reset_token VARCHAR(255),
            password_reset_expires TIMESTAMP WITH TIME ZONE,
            
            -- Preferencias
            language VARCHAR(5) DEFAULT ''es'',
            timezone VARCHAR(50) DEFAULT ''America/Santiago'',
            ui_preferences JSONB,
            notification_preferences JSONB,
            
            -- Departamento
            department VARCHAR(100),
            position VARCHAR(100),
            
            -- Auditoría
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE,
            created_by VARCHAR(255),
            updated_by VARCHAR(255),
            is_deleted BOOLEAN DEFAULT false NOT NULL,
            deleted_at TIMESTAMP WITH TIME ZONE,
            deleted_by VARCHAR(255),
            deletion_reason TEXT,
            retention_expires_at TIMESTAMP WITH TIME ZONE,
            
            -- Encriptación
            has_encrypted_data BOOLEAN DEFAULT true NOT NULL,
            encryption_key_id VARCHAR(100),
            search_hash VARCHAR(64),
            
            -- Versionado
            version INTEGER DEFAULT 1 NOT NULL,
            
            UNIQUE(tenant_id, username),
            UNIQUE(tenant_id, email)
        )', v_schema_name);
    
    -- Roles
    EXECUTE format('
        CREATE TABLE %I.roles (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            tenant_id VARCHAR(50) NOT NULL,
            
            name VARCHAR(100) NOT NULL,
            code VARCHAR(50) NOT NULL,
            description TEXT,
            
            permissions JSONB DEFAULT ''[]''::jsonb,
            
            is_system BOOLEAN DEFAULT false,
            is_active BOOLEAN DEFAULT true,
            
            -- Auditoría
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE,
            created_by VARCHAR(255),
            updated_by VARCHAR(255),
            is_deleted BOOLEAN DEFAULT false NOT NULL,
            deleted_at TIMESTAMP WITH TIME ZONE,
            deleted_by VARCHAR(255),
            
            version INTEGER DEFAULT 1 NOT NULL,
            
            UNIQUE(tenant_id, code)
        )', v_schema_name);
    
    -- Tabla de asociación usuarios-roles
    EXECUTE format('
        CREATE TABLE %I.user_roles (
            user_id UUID REFERENCES %I.users(id),
            role_id UUID REFERENCES %I.roles(id),
            PRIMARY KEY (user_id, role_id)
        )', v_schema_name, v_schema_name, v_schema_name);
    
    -- Empresas (clientes del tenant)
    EXECUTE format('
        CREATE TABLE %I.empresas (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            tenant_id VARCHAR(50) NOT NULL,
            
            -- Identificación
            nombre VARCHAR(255) NOT NULL,
            rut VARCHAR(20) NOT NULL,
            razon_social VARCHAR(255),
            giro VARCHAR(255),
            
            -- Contacto
            contacto_nombre VARCHAR(255),
            contacto_email VARCHAR(255) NOT NULL,
            contacto_telefono VARCHAR(50),
            
            -- Dirección
            direccion TEXT,
            comuna VARCHAR(100),
            ciudad VARCHAR(100),
            region VARCHAR(100),
            
            -- Estado
            is_active BOOLEAN DEFAULT true,
            fecha_alta TIMESTAMP WITH TIME ZONE,
            fecha_baja TIMESTAMP WITH TIME ZONE,
            
            -- Configuración
            max_usuarios INTEGER DEFAULT 5,
            usuarios_activos INTEGER DEFAULT 0,
            
            -- DPO
            dpo_nombre VARCHAR(255),
            dpo_email VARCHAR(255),
            dpo_telefono VARCHAR(50),
            
            -- Metadata
            industria VARCHAR(100),
            empleados INTEGER,
            sitio_web VARCHAR(255),
            
            -- Auditoría completa
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE,
            created_by VARCHAR(255),
            updated_by VARCHAR(255),
            is_deleted BOOLEAN DEFAULT false NOT NULL,
            deleted_at TIMESTAMP WITH TIME ZONE,
            deleted_by VARCHAR(255),
            deletion_reason TEXT,
            
            version INTEGER DEFAULT 1 NOT NULL,
            
            UNIQUE(tenant_id, rut)
        )', v_schema_name);
    
    -- Módulos de acceso
    EXECUTE format('
        CREATE TABLE %I.modulos_acceso (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            tenant_id VARCHAR(50) NOT NULL,
            empresa_id UUID REFERENCES %I.empresas(id),
            
            -- Módulo
            codigo_modulo VARCHAR(20) NOT NULL,
            nombre_modulo VARCHAR(100) NOT NULL,
            
            -- Acceso
            is_active BOOLEAN DEFAULT true,
            fecha_activacion TIMESTAMP WITH TIME ZONE,
            fecha_expiracion TIMESTAMP WITH TIME ZONE,
            
            -- Límites
            usuarios_permitidos INTEGER,
            registros_permitidos INTEGER,
            storage_mb_permitido INTEGER,
            
            -- Uso actual
            usuarios_actuales INTEGER DEFAULT 0,
            registros_actuales INTEGER DEFAULT 0,
            storage_mb_actual INTEGER DEFAULT 0,
            
            -- Licencia
            licencia_id UUID,
            
            -- Configuración
            configuracion JSONB,
            
            -- Auditoría
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE,
            created_by VARCHAR(255),
            updated_by VARCHAR(255),
            
            version INTEGER DEFAULT 1 NOT NULL
        )', v_schema_name, v_schema_name);
    
    -- Licencias
    EXECUTE format('
        CREATE TABLE %I.licencias (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            tenant_id VARCHAR(50) NOT NULL,
            empresa_id UUID REFERENCES %I.empresas(id),
            
            -- Identificación
            codigo_licencia VARCHAR(500) NOT NULL,
            tipo_licencia VARCHAR(50) NOT NULL,
            
            -- Módulos
            modulos JSONB NOT NULL,
            
            -- Vigencia
            fecha_emision TIMESTAMP WITH TIME ZONE NOT NULL,
            fecha_activacion TIMESTAMP WITH TIME ZONE,
            fecha_expiracion TIMESTAMP WITH TIME ZONE NOT NULL,
            
            -- Estado
            is_active BOOLEAN DEFAULT false,
            is_revoked BOOLEAN DEFAULT false,
            fecha_revocacion TIMESTAMP WITH TIME ZONE,
            motivo_revocacion TEXT,
            
            -- Límites
            max_usuarios_total INTEGER,
            max_registros_total INTEGER,
            max_storage_gb INTEGER,
            
            -- Comercial
            precio DECIMAL(10, 2),
            descuento DECIMAL(5, 2),
            precio_final DECIMAL(10, 2),
            
            -- Facturación
            numero_orden_compra VARCHAR(100),
            numero_factura VARCHAR(100),
            fecha_pago TIMESTAMP WITH TIME ZONE,
            
            -- Metadata
            vendedor VARCHAR(255),
            canal_venta VARCHAR(50),
            notas TEXT,
            
            -- Encriptación
            has_encrypted_data BOOLEAN DEFAULT true NOT NULL,
            encryption_key_id VARCHAR(100),
            search_hash VARCHAR(64),
            
            -- Auditoría
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE,
            created_by VARCHAR(255),
            updated_by VARCHAR(255),
            
            version INTEGER DEFAULT 1 NOT NULL,
            
            UNIQUE(codigo_licencia)
        )', v_schema_name, v_schema_name);
    
    -- Crear índices
    EXECUTE format('
        CREATE INDEX idx_%I_users_tenant_id ON %I.users(tenant_id);
        CREATE INDEX idx_%I_users_email ON %I.users(email);
        CREATE INDEX idx_%I_users_search_hash ON %I.users(search_hash);
        
        CREATE INDEX idx_%I_empresas_tenant_id ON %I.empresas(tenant_id);
        CREATE INDEX idx_%I_empresas_rut ON %I.empresas(rut);
        
        CREATE INDEX idx_%I_modulos_empresa_id ON %I.modulos_acceso(empresa_id);
        CREATE INDEX idx_%I_licencias_empresa_id ON %I.licencias(empresa_id);
    ', v_schema_name, v_schema_name, v_schema_name, v_schema_name, 
       v_schema_name, v_schema_name, v_schema_name, v_schema_name,
       v_schema_name, v_schema_name, v_schema_name, v_schema_name,
       v_schema_name, v_schema_name);
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating tenant schema: %', SQLERRM;
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VISTAS ÚTILES
-- =====================================================

-- Vista de estado de tenants
CREATE OR REPLACE VIEW public.v_tenant_status AS
SELECT 
    t.tenant_id,
    t.company_name,
    t.is_active,
    t.is_trial,
    t.billing_plan,
    t.max_users,
    t.max_data_subjects,
    t.created_at,
    CASE 
        WHEN t.is_trial AND t.trial_ends_at < CURRENT_TIMESTAMP THEN 'trial_expired'
        WHEN t.is_trial THEN 'trial_active'
        WHEN t.is_active THEN 'active'
        ELSE 'inactive'
    END as status,
    t.trial_ends_at,
    EXTRACT(days FROM (t.trial_ends_at - CURRENT_TIMESTAMP)) as trial_days_remaining
FROM public.tenants t;

-- Comentarios
COMMENT ON TABLE public.tenants IS 'Tabla maestra de tenants (empresas) del sistema multi-tenant';
COMMENT ON TABLE public.tenant_configs IS 'Configuraciones específicas por tenant';
COMMENT ON FUNCTION public.create_tenant_schema IS 'Crea el esquema completo para un nuevo tenant';

-- Grants básicos (ajustar según usuario de la aplicación)
-- GRANT USAGE ON SCHEMA public TO app_user;
-- GRANT ALL ON ALL TABLES IN SCHEMA public TO app_user;
-- GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO app_user;