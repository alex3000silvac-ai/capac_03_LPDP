-- Script SQL para crear usuarios de prueba en Supabase
-- Ejecutar este script en el SQL Editor de Supabase

-- Crear usuario administrador (Super Admin)
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
) ON CONFLICT (username) DO UPDATE SET
    hashed_password = EXCLUDED.hashed_password,
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- Crear usuario demo
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
    null,
    NOW(),
    NOW()
) ON CONFLICT (username) DO UPDATE SET
    hashed_password = EXCLUDED.hashed_password,
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- Crear usuario DPO
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
    null,
    NOW(),
    NOW()
) ON CONFLICT (username) DO UPDATE SET
    hashed_password = EXCLUDED.hashed_password,
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- Verificar usuarios creados
SELECT 
    username,
    email,
    first_name,
    last_name,
    is_superuser,
    is_active,
    created_at
FROM users 
WHERE username IN ('admin', 'demo', 'dpo')
ORDER BY username;
