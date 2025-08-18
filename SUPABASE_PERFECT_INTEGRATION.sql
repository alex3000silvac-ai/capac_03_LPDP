-- 🚀 SCRIPT DE INTEGRACIÓN PERFECTA CON TU ESTRUCTURA EXISTENTE
-- Este script respeta COMPLETAMENTE tu jerarquía: Tenant → Empresa → Licencia → Módulos → Usuarios

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

-- 🗄️ CREAR TABLA DE USUARIOS (INTEGRADA CON TU ESTRUCTURA)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_superuser BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 🔐 CREAR TABLA DE TOKENS (INTEGRADA CON USUARIOS)
CREATE TABLE IF NOT EXISTS tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) NOT NULL,
    expires_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 📊 CREAR TABLA DE ACTIVIDADES (INTEGRADA CON TU JERARQUÍA)
CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 🎯 CREAR TABLA DE CATEGORÍAS (INTEGRADA)
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 📋 CREAR TABLA DE CONSENTIMIENTOS (INTEGRADA)
CREATE TABLE IF NOT EXISTS consents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    consent_type VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 🏛️ CREAR TABLA DE ARCOPOL (INTEGRADA)
CREATE TABLE IF NOT EXISTS arcopol (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 📦 CREAR TABLA DE INVENTARIO (INTEGRADA)
CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    data_type VARCHAR(100),
    location VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 🚨 CREAR TABLA DE BRECHAS (INTEGRADA)
CREATE TABLE IF NOT EXISTS breaches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    severity VARCHAR(50),
    status VARCHAR(50) DEFAULT 'open',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 📋 CREAR TABLA DE DPIA (INTEGRADA)
CREATE TABLE IF NOT EXISTS dpia (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    risk_level VARCHAR(50),
    status VARCHAR(50) DEFAULT 'draft',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 🔄 CREAR TABLA DE TRANSFERENCIAS (INTEGRADA)
CREATE TABLE IF NOT EXISTS transfers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    destination VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 📊 CREAR TABLA DE AUDITORÍA (INTEGRADA)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 🎓 CREAR TABLA DE CAPACITACIÓN (INTEGRADA)
CREATE TABLE IF NOT EXISTS training (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    module_type VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 📝 CREAR TABLA DE ENTREVISTAS (INTEGRADA)
CREATE TABLE IF NOT EXISTS interviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'scheduled',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 🔍 CREAR TABLA DE REPORTES (INTEGRADA)
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    report_type VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 🏢 INSERTAR TENANT DEMO (INTEGRADO CON TU ESTRUCTURA)
INSERT INTO tenants (name, domain, schema_name, is_active) VALUES 
('SCLDP Demo', 'demo.lpdp.cl', 'demo_schema', true)
ON CONFLICT (domain) DO NOTHING;

-- 🏢 INSERTAR EMPRESA DEMO (INTEGRADA CON TU ESTRUCTURA)
INSERT INTO empresas (tenant_id, rut, razon_social, giro, direccion, comuna, ciudad, email_contacto, es_activa, metadata) VALUES 
(
    (SELECT id FROM tenants WHERE domain = 'demo.lpdp.cl'),
    '76.123.456-7',
    'SCLDP Demo Ltda.',
    'Servicios de Cumplimiento LPDP',
    'Av. Providencia 1234, Oficina 567',
    'Providencia',
    'Santiago',
    'contacto@demo.lpdp.cl',
    true,
    '{"sector": "tecnologia", "tamano": "mediana", "empleados": 50}'::jsonb
)
ON CONFLICT (rut) DO NOTHING;

-- 🔐 INSERTAR LICENCIA DEMO (INTEGRADA CON TU SISTEMA DE LICENCIAS)
INSERT INTO licencias (empresa_id, tipo_licencia, fecha_inicio, fecha_expiracion, activa, clave_licencia, max_usuarios) VALUES 
(
    (SELECT id FROM empresas WHERE rut = '76.123.456-7'),
    'PREMIUM',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '1 year',
    true,
    'SCLDP-DEMO-2024-PREMIUM',
    10
)
ON CONFLICT (empresa_id) DO NOTHING;

-- 🎯 INSERTAR MÓDULOS DE ACCESO (INTEGRADOS CON TU SISTEMA)
INSERT INTO modulos_acceso (empresa_id, modulo_codigo, activo, fecha_activacion) VALUES 
-- Consentimientos
((SELECT id FROM empresas WHERE rut = '76.123.456-7'), 'CONS', true, CURRENT_DATE),
-- ARCOPOL
((SELECT id FROM empresas WHERE rut = '76.123.456-7'), 'ARCO', true, CURRENT_DATE),
-- Inventario
((SELECT id FROM empresas WHERE rut = '76.123.456-7'), 'INV', true, CURRENT_DATE),
-- Brechas
((SELECT id FROM empresas WHERE rut = '76.123.456-7'), 'BRECH', true, CURRENT_DATE),
-- DPIA
((SELECT id FROM empresas WHERE rut = '76.123.456-7'), 'DPIA', true, CURRENT_DATE),
-- Transferencias
((SELECT id FROM empresas WHERE rut = '76.123.456-7'), 'TRANS', true, CURRENT_DATE),
-- Auditoría
((SELECT id FROM empresas WHERE rut = '76.123.456-7'), 'AUDIT', true, CURRENT_DATE),
-- Capacitación
((SELECT id FROM empresas WHERE rut = '76.123.456-7'), 'CAP', true, CURRENT_DATE),
-- Entrevistas
((SELECT id FROM empresas WHERE rut = '76.123.456-7'), 'ENTREV', true, CURRENT_DATE),
-- Reportes
((SELECT id FROM empresas WHERE rut = '76.123.456-7'), 'REP', true, CURRENT_DATE)
ON CONFLICT (empresa_id, modulo_codigo) DO NOTHING;

-- ⚙️ INSERTAR CONFIGURACIÓN DEL TENANT (INTEGRADA)
INSERT INTO tenant_configs (tenant_id, max_users, max_storage_gb, features_enabled, custom_settings) VALUES 
(
    (SELECT id FROM tenants WHERE domain = 'demo.lpdp.cl'),
    10,
    50,
    '{"multi_empresa": true, "auditoria": true, "reportes": true, "api_access": true}'::jsonb,
    '{"theme": "default", "language": "es", "timezone": "America/Santiago"}'::jsonb
)
ON CONFLICT (tenant_id) DO NOTHING;

-- 🧹 LIMPIAR USUARIOS EXISTENTES
DELETE FROM users WHERE username IN ('admin', 'demo', 'dpo');

-- ✅ CREAR USUARIO SUPER ADMINISTRADOR (INTEGRADO)
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

-- ✅ CREAR USUARIO DEMO (INTEGRADO)
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

-- ✅ CREAR USUARIO DPO (INTEGRADO)
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

-- 🎯 VERIFICAR INTEGRACIÓN CON TU SISTEMA EXISTENTE
SELECT 
    '🔗 INTEGRACIÓN COMPLETA' as status,
    t.name as tenant_name,
    t.domain,
    e.razon_social as empresa,
    e.rut,
    l.tipo_licencia,
    l.max_usuarios,
    COUNT(u.id) as usuarios_creados,
    COUNT(ma.modulo_codigo) as modulos_activos
FROM tenants t
JOIN empresas e ON e.tenant_id = t.id
LEFT JOIN licencias l ON l.empresa_id = e.id
LEFT JOIN users u ON u.empresa_id = e.id
LEFT JOIN modulos_acceso ma ON ma.empresa_id = e.id
WHERE t.domain = 'demo.lpdp.cl'
GROUP BY t.name, t.domain, e.razon_social, e.rut, l.tipo_licencia, l.max_usuarios;

-- 📊 RESUMEN FINAL COMPLETO
SELECT 
    '🎉 CONFIGURACIÓN COMPLETA E INTEGRADA' as mensaje,
    COUNT(*) as total_tablas_nuevas,
    (SELECT COUNT(*) FROM users WHERE username IN ('admin', 'demo', 'dpo')) as total_usuarios,
    (SELECT COUNT(*) FROM tenants WHERE domain = 'demo.lpdp.cl') as total_tenants,
    (SELECT COUNT(*) FROM empresas WHERE rut = '76.123.456-7') as total_empresas,
    (SELECT COUNT(*) FROM licencias WHERE empresa_id = (SELECT id FROM empresas WHERE rut = '76.123.456-7')) as total_licencias,
    (SELECT COUNT(*) FROM modulos_acceso WHERE empresa_id = (SELECT id FROM empresas WHERE rut = '76.123.456-7')) as total_modulos
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

-- 🎯 MÓDULOS ACTIVOS PARA LA EMPRESA DEMO:
-- CONS (Consentimientos), ARCO (ARCOPOL), INV (Inventario), 
-- BRECH (Brechas), DPIA, TRANS (Transferencias), 
-- AUDIT (Auditoría), CAP (Capacitación), ENTREV (Entrevistas), REP (Reportes)
