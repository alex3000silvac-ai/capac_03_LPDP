-- Script para arreglar la base de datos en Render
-- Primero elimina las tablas existentes si tienen estructura incorrecta

-- Eliminar tablas dependientes primero
DROP TABLE IF EXISTS modulos_acceso CASCADE;
DROP TABLE IF EXISTS licencias CASCADE;
DROP TABLE IF EXISTS empresas CASCADE;
DROP TABLE IF EXISTS tenant_configs CASCADE;
DROP TABLE IF EXISTS tenants CASCADE;

-- Ahora crear todo desde cero
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabla tenants con estructura correcta
CREATE TABLE tenants (
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
CREATE TABLE tenant_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    max_users INTEGER DEFAULT 10,
    max_storage_gb INTEGER DEFAULT 10,
    features_enabled JSONB DEFAULT '{}',
    custom_settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla empresas
CREATE TABLE empresas (
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
CREATE TABLE licencias (
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
CREATE TABLE modulos_acceso (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES empresas(id),
    modulo_codigo VARCHAR(10) NOT NULL,
    activo BOOLEAN DEFAULT true,
    fecha_activacion DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(empresa_id, modulo_codigo)
);

-- Insertar datos demo
INSERT INTO tenants (id, name, domain, schema_name, is_active) 
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'Empresa Demo', 'demo.juridicadigital.cl', 'tenant_demo', true);

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
);

INSERT INTO licencias (empresa_id, tipo_licencia, fecha_inicio, fecha_expiracion, clave_licencia, max_usuarios) 
VALUES (
    '550e8400-e29b-41d4-a716-446655440000', 
    'demo', 
    CURRENT_DATE, 
    CURRENT_DATE + INTERVAL '90 days',
    'DEMO-2024-0001', 
    50
);

-- Módulos
INSERT INTO modulos_acceso (empresa_id, modulo_codigo, fecha_activacion)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440000', 'MOD-1', CURRENT_DATE),
    ('550e8400-e29b-41d4-a716-446655440000', 'MOD-2', CURRENT_DATE),
    ('550e8400-e29b-41d4-a716-446655440000', 'MOD-3', CURRENT_DATE),
    ('550e8400-e29b-41d4-a716-446655440000', 'MOD-4', CURRENT_DATE),
    ('550e8400-e29b-41d4-a716-446655440000', 'MOD-5', CURRENT_DATE),
    ('550e8400-e29b-41d4-a716-446655440000', 'MOD-6', CURRENT_DATE),
    ('550e8400-e29b-41d4-a716-446655440000', 'MOD-7', CURRENT_DATE);