-- 🚀 SCRIPT ADAPTATIVO PARA SUPABASE
-- Este script se adapta a la estructura existente de tu base de datos

-- 🔍 VERIFICAR ESTRUCTURA EXISTENTE
SELECT 
    '🔍 ESTRUCTURA ACTUAL' as info,
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'tenants')
ORDER BY table_name, ordinal_position;

-- 🗄️ CREAR TABLA DE USUARIOS (si no existe)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_superuser BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    tenant_id VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 🏢 CREAR TABLA DE TENANTS (adaptada)
CREATE TABLE IF NOT EXISTS tenants (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 🔐 CREAR TABLA DE TOKENS
CREATE TABLE IF NOT EXISTS tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 📊 CREAR TABLA DE ACTIVIDADES
CREATE TABLE IF NOT EXISTS activities (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    tenant_id VARCHAR(50),
    action VARCHAR(100) NOT NULL,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 🎯 CREAR TABLA DE CATEGORÍAS
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    tenant_id VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 📋 CREAR TABLA DE CONSENTIMIENTOS
CREATE TABLE IF NOT EXISTS consents (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    consent_type VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 🏛️ CREAR TABLA DE ARCOPOL
CREATE TABLE IF NOT EXISTS arcopol (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 📦 CREAR TABLA DE INVENTARIO
CREATE TABLE IF NOT EXISTS inventory (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    data_type VARCHAR(100),
    location VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 🚨 CREAR TABLA DE BRECHAS
CREATE TABLE IF NOT EXISTS breaches (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    severity VARCHAR(50),
    status VARCHAR(50) DEFAULT 'open',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 📋 CREAR TABLA DE DPIA
CREATE TABLE IF NOT EXISTS dpia (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    risk_level VARCHAR(50),
    status VARCHAR(50) DEFAULT 'draft',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 🔄 CREAR TABLA DE TRANSFERENCIAS
CREATE TABLE IF NOT EXISTS transfers (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    destination VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 📊 CREAR TABLA DE AUDITORÍA
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50),
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    record_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 🎓 CREAR TABLA DE CAPACITACIÓN
CREATE TABLE IF NOT EXISTS training (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    module_type VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 📝 CREAR TABLA DE ENTREVISTAS
CREATE TABLE IF NOT EXISTS interviews (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'scheduled',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 🔍 CREAR TABLA DE REPORTES
CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    report_type VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 🏢 INSERTAR TENANT DEMO (adaptado)
INSERT INTO tenants (name, description) VALUES 
('Empresa Demo', 'Empresa de demostración para pruebas del sistema LPDP')
ON CONFLICT (name) DO NOTHING;

-- 🧹 LIMPIAR USUARIOS EXISTENTES
DELETE FROM users WHERE username IN ('admin', 'demo', 'dpo');

-- ✅ CREAR USUARIO SUPER ADMINISTRADOR
INSERT INTO users (
    username, 
    email, 
    hashed_password, 
    first_name, 
    last_name, 
    is_superuser, 
    is_active, 
    tenant_id, 
    created_at, 
    updated_at
) VALUES (
    'admin',
    'admin@lpdp.cl',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5mWGi', -- Admin123!
    'Administrador',
    'Sistema',
    true,
    true,
    null,
    NOW(),
    NOW()
);

-- ✅ CREAR USUARIO DEMO
INSERT INTO users (
    username, 
    email, 
    hashed_password, 
    first_name, 
    last_name, 
    is_superuser, 
    is_active, 
    tenant_id, 
    created_at, 
    updated_at
) VALUES (
    'demo',
    'demo@lpdp.cl',
    '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- Demo123!
    'Usuario',
    'Demo',
    false,
    true,
    'demo',
    NOW(),
    NOW()
);

-- ✅ CREAR USUARIO DPO
INSERT INTO users (
    username, 
    email, 
    hashed_password, 
    first_name, 
    last_name, 
    is_superuser, 
    is_active, 
    tenant_id, 
    created_at, 
    updated_at
) VALUES (
    'dpo',
    'dpo@lpdp.cl',
    '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPDwqKpS6', -- Dpo123!
    'Data',
    'Protection Officer',
    false,
    true,
    'demo',
    NOW(),
    NOW()
);

-- 🎯 VERIFICAR TABLAS CREADAS
SELECT 
    '✅ TABLAS CREADAS EXITOSAMENTE' as status,
    table_name,
    'Creada' as estado
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'users', 'tenants', 'tokens', 'activities', 'categories', 
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
    created_at
FROM users 
WHERE username IN ('admin', 'demo', 'dpo')
ORDER BY username;

-- 📊 RESUMEN FINAL
SELECT 
    '🎉 CONFIGURACIÓN COMPLETA' as mensaje,
    COUNT(*) as total_tablas,
    (SELECT COUNT(*) FROM users WHERE username IN ('admin', 'demo', 'dpo')) as total_usuarios,
    (SELECT COUNT(*) FROM tenants) as total_tenants
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'users', 'tenants', 'tokens', 'activities', 'categories', 
    'consents', 'arcopol', 'inventory', 'breaches', 'dpia', 
    'transfers', 'audit_logs', 'training', 'interviews', 'reports'
);

-- 🔐 CREDENCIALES DE ACCESO
-- Usuario: admin | Contraseña: Admin123!
-- Usuario: demo  | Contraseña: Demo123!
-- Usuario: dpo   | Contraseña: Dpo123!
