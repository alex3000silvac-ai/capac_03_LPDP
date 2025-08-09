-- Script de inicialización para Render
-- Sin DO blocks para evitar traducciones automáticas

-- Extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabla tenants
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) UNIQUE NOT NULL,
    schema_name VARCHAR(100) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    suspended_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla tenant_configs
CREATE TABLE IF NOT EXISTS tenant_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    max_users INTEGER DEFAULT 10,
    max_storage_gb INTEGER DEFAULT 10,
    features_enabled JSONB DEFAULT '{}',
    custom_settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla empresas
CREATE TABLE IF NOT EXISTS empresas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id),
    rut VARCHAR(20) UNIQUE NOT NULL,
    razon_social VARCHAR(255) NOT NULL,
    giro VARCHAR(255),
    direccion VARCHAR(500),
    comuna VARCHAR(100),
    ciudad VARCHAR(100),
    email_contacto VARCHAR(255),
    es_activa BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla licencias
CREATE TABLE IF NOT EXISTS licencias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES empresas(id),
    tipo_licencia VARCHAR(50) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_expiracion DATE NOT NULL,
    activa BOOLEAN DEFAULT true,
    clave_licencia VARCHAR(255) UNIQUE NOT NULL,
    max_usuarios INTEGER DEFAULT 5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla modulos_acceso
CREATE TABLE IF NOT EXISTS modulos_acceso (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES empresas(id),
    modulo_codigo VARCHAR(10) NOT NULL,
    activo BOOLEAN DEFAULT true,
    fecha_activacion DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(empresa_id, modulo_codigo)
);

-- Función para crear esquema tenant
CREATE OR REPLACE FUNCTION create_tenant_schema(schema_name TEXT)
RETURNS VOID AS $$
BEGIN
    EXECUTE format('CREATE SCHEMA IF NOT EXISTS %I', schema_name);
    
    -- Crear tabla users en el esquema
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I.users (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            tenant_id UUID NOT NULL,
            username VARCHAR(100) NOT NULL,
            email VARCHAR(255) NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            first_name VARCHAR(255),
            last_name VARCHAR(255),
            is_active BOOLEAN DEFAULT true,
            is_superuser BOOLEAN DEFAULT false,
            is_dpo BOOLEAN DEFAULT false,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(tenant_id, username),
            UNIQUE(tenant_id, email)
        )', schema_name);
    
    -- Crear tabla roles
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I.roles (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            tenant_id UUID NOT NULL,
            name VARCHAR(100) NOT NULL,
            code VARCHAR(50) NOT NULL,
            description TEXT,
            permissions JSONB DEFAULT ''[]'',
            is_system BOOLEAN DEFAULT false,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(tenant_id, code)
        )', schema_name);
    
END;
$$ LANGUAGE plpgsql;

-- Insertar tenant demo
INSERT INTO tenants (id, name, domain, schema_name, is_active) 
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'Empresa Demo', 'demo.juridicadigital.cl', 'tenant_demo', true)
ON CONFLICT (id) DO NOTHING;

-- Insertar empresa demo
INSERT INTO empresas (id, tenant_id, rut, razon_social, giro, comuna, ciudad, email_contacto) 
VALUES (
    '550e8400-e29b-41d4-a716-446655440000', 
    '550e8400-e29b-41d4-a716-446655440000',
    '76.123.456-7', 
    'Empresa Demo S.A.', 
    'Tecnología', 
    'Las Condes', 
    'Santiago', 
    'admin@demo.cl'
)
ON CONFLICT (id) DO NOTHING;

-- Insertar licencia demo
INSERT INTO licencias (empresa_id, tipo_licencia, fecha_inicio, fecha_expiracion, clave_licencia, max_usuarios) 
VALUES (
    '550e8400-e29b-41d4-a716-446655440000', 
    'demo', 
    CURRENT_DATE, 
    CURRENT_DATE + INTERVAL '90 days',
    'DEMO-2024-0001', 
    50
)
ON CONFLICT (clave_licencia) DO NOTHING;

-- Insertar acceso a módulos
INSERT INTO modulos_acceso (empresa_id, modulo_codigo, fecha_activacion)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440000', 'MOD-1', CURRENT_DATE),
    ('550e8400-e29b-41d4-a716-446655440000', 'MOD-2', CURRENT_DATE),
    ('550e8400-e29b-41d4-a716-446655440000', 'MOD-3', CURRENT_DATE),
    ('550e8400-e29b-41d4-a716-446655440000', 'MOD-4', CURRENT_DATE),
    ('550e8400-e29b-41d4-a716-446655440000', 'MOD-5', CURRENT_DATE),
    ('550e8400-e29b-41d4-a716-446655440000', 'MOD-6', CURRENT_DATE),
    ('550e8400-e29b-41d4-a716-446655440000', 'MOD-7', CURRENT_DATE)
ON CONFLICT (empresa_id, modulo_codigo) DO NOTHING;

-- Crear esquema tenant demo
SELECT create_tenant_schema('tenant_demo');

-- Insertar roles en tenant demo
INSERT INTO tenant_demo.roles (tenant_id, name, code, description, permissions, is_system)
VALUES 
    (
        '550e8400-e29b-41d4-a716-446655440000',
        'Administrador',
        'admin',
        'Administrador del sistema',
        '["*"]',
        true
    ),
    (
        '550e8400-e29b-41d4-a716-446655440000',
        'Usuario',
        'user',
        'Usuario estándar',
        '["capacitacion.*", "recursos.read"]',
        true
    )
ON CONFLICT (tenant_id, code) DO NOTHING;

-- Insertar usuario admin demo
INSERT INTO tenant_demo.users (
    tenant_id, 
    username, 
    email, 
    password_hash, 
    first_name, 
    last_name, 
    is_active, 
    is_dpo
) VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'admin',
    'admin@demo.cl',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyNiGczCRJyWFK',
    'Admin',
    'Demo',
    true,
    true
)
ON CONFLICT (tenant_id, email) DO NOTHING;