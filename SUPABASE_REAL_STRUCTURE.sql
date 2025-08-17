-- 🚀 SCRIPT ADAPTADO A TU ESTRUCTURA REAL DE SUPABASE
-- Este script se adapta EXACTAMENTE a las tablas que ya tienes

-- 🔍 VERIFICAR ESTRUCTURA ACTUAL
SELECT 
    '🔍 ESTRUCTURA ACTUAL' as info,
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('empresas', 'licencias', 'modulos_acceso', 'tenant_configs', 'tenants')
ORDER BY table_name, ordinal_position;

-- 🗄️ CREAR TABLA DE USUARIOS (si no existe)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_superuser BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    tenant_id UUID,
    empresa_id UUID,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 🔐 CREAR TABLA DE TOKENS
CREATE TABLE IF NOT EXISTS tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) NOT NULL,
    expires_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 📊 CREAR TABLA DE ACTIVIDADES
CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    tenant_id UUID,
    empresa_id UUID,
    action VARCHAR(100) NOT NULL,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 🎯 CREAR TABLA DE CATEGORÍAS
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    tenant_id UUID,
    empresa_id UUID,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 📋 CREAR TABLA DE CONSENTIMIENTOS
CREATE TABLE IF NOT EXISTS consents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    empresa_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    consent_type VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 🏛️ CREAR TABLA DE ARCOPOL
CREATE TABLE IF NOT EXISTS arcopol (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    empresa_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 📦 CREAR TABLA DE INVENTARIO
CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    empresa_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    data_type VARCHAR(100),
    location VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 🚨 CREAR TABLA DE BRECHAS
CREATE TABLE IF NOT EXISTS breaches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    empresa_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    severity VARCHAR(50),
    status VARCHAR(50) DEFAULT 'open',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 📋 CREAR TABLA DE DPIA
CREATE TABLE IF NOT EXISTS dpia (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    empresa_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    risk_level VARCHAR(50),
    status VARCHAR(50) DEFAULT 'draft',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 🔄 CREAR TABLA DE TRANSFERENCIAS
CREATE TABLE IF NOT EXISTS transfers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    empresa_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    destination VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 📊 CREAR TABLA DE AUDITORÍA
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID,
    empresa_id UUID,
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 🎓 CREAR TABLA DE CAPACITACIÓN
CREATE TABLE IF NOT EXISTS training (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    empresa_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    module_type VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 📝 CREAR TABLA DE ENTREVISTAS
CREATE TABLE IF NOT EXISTS interviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    empresa_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'scheduled',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 🔍 CREAR TABLA DE REPORTES
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    empresa_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    report_type VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 🏢 INSERTAR TENANT DEMO (usando tu estructura real)
INSERT INTO tenants (name, domain, schema_name, is_active) VALUES 
('Empresa Demo', 'demo.lpdp.cl', 'demo_schema', true)
ON CONFLICT (domain) DO NOTHING;

-- 🏢 INSERTAR EMPRESA DEMO (usando tu estructura real)
INSERT INTO empresas (tenant_id, rut, razon_social, giro, direccion, comuna, ciudad, email_contacto, es_activa) VALUES 
(
    (SELECT id FROM tenants WHERE domain = 'demo.lpdp.cl'),
    '76.123.456-7',
    'Empresa Demo Ltda.',
    'Servicios de Tecnología',
    'Av. Providencia 1234',
    'Providencia',
    'Santiago',
    'contacto@demo.lpdp.cl',
    true
)
ON CONFLICT (rut) DO NOTHING;

-- 🧹 LIMPIAR USUARIOS EXISTENTES
DELETE FROM users WHERE username IN ('admin', 'demo', 'dpo');

-- ✅ CREAR USUARIO SUPER ADMINISTRADOR
INSERT INTO users (
    id,
    username, 
    email, 
    hashed_password, 
    first_name, 
    last_name, 
    is_superuser, 
    is_active, 
    tenant_id,
    empresa_id
) VALUES (
    uuid_generate_v4(),
    'admin',
    'admin@lpdp.cl',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5mWGi', -- Admin123!
    'Administrador',
    'Sistema',
    true,
    true,
    (SELECT id FROM tenants WHERE domain = 'demo.lpdp.cl'),
    (SELECT id FROM empresas WHERE rut = '76.123.456-7')
);

-- ✅ CREAR USUARIO DEMO
INSERT INTO users (
    id,
    username, 
    email, 
    hashed_password, 
    first_name, 
    last_name, 
    is_superuser, 
    is_active, 
    tenant_id,
    empresa_id
) VALUES (
    uuid_generate_v4(),
    'demo',
    'demo@lpdp.cl',
    '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- Demo123!
    'Usuario',
    'Demo',
    false,
    true,
    (SELECT id FROM tenants WHERE domain = 'demo.lpdp.cl'),
    (SELECT id FROM empresas WHERE rut = '76.123.456-7')
);

-- ✅ CREAR USUARIO DPO
INSERT INTO users (
    id,
    username, 
    email, 
    hashed_password, 
    first_name, 
    last_name, 
    is_superuser, 
    is_active, 
    tenant_id,
    empresa_id
) VALUES (
    uuid_generate_v4(),
    'dpo',
    'dpo@lpdp.cl',
    '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPDwqKpS6', -- Dpo123!
    'Data',
    'Protection Officer',
    false,
    true,
    (SELECT id FROM tenants WHERE domain = 'demo.lpdp.cl'),
    (SELECT id FROM empresas WHERE rut = '76.123.456-7')
);

-- 🎯 VERIFICAR TABLAS CREADAS
SELECT 
    '✅ TABLAS CREADAS EXITOSAMENTE' as status,
    table_name,
    'Creada' as estado
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'users', 'tokens', 'activities', 'categories', 
    'consents', 'arcopol', 'inventory', 'breaches', 'dpia', 
    'transfers', 'audit_logs', 'training', 'interviews', 'reports'
)
ORDER BY table_name;

-- 🎯 VERIFICAR USUARIOS CREADOS
SELECT 
    '✅ USUARIOS CREADOS EXITOSAMENTE' as status,
    username,
    email,
    first_name,
    last_name,
    is_superuser,
    is_active,
    tenant_id,
    empresa_id,
    created_at
FROM users 
WHERE username IN ('admin', 'demo', 'dpo')
ORDER BY username;

-- 📊 RESUMEN FINAL
SELECT 
    '🎉 CONFIGURACIÓN COMPLETA' as mensaje,
    COUNT(*) as total_tablas_nuevas,
    (SELECT COUNT(*) FROM users WHERE username IN ('admin', 'demo', 'dpo')) as total_usuarios,
    (SELECT COUNT(*) FROM tenants WHERE domain = 'demo.lpdp.cl') as total_tenants,
    (SELECT COUNT(*) FROM empresas WHERE rut = '76.123.456-7') as total_empresas
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'users', 'tokens', 'activities', 'categories', 
    'consents', 'arcopol', 'inventory', 'breaches', 'dpia', 
    'transfers', 'audit_logs', 'training', 'interviews', 'reports'
);

-- 🔐 CREDENCIALES DE ACCESO
-- Usuario: admin | Contraseña: Admin123!
-- Usuario: demo  | Contraseña: Demo123!
-- Usuario: dpo   | Contraseña: Dpo123!
