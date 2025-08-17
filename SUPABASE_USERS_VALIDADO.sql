-- 🚀 SCRIPT VALIDADO PARA CREAR USUARIOS EN SUPABASE
-- Ejecutar este script en el SQL Editor de Supabase
-- Fecha: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

-- 🔍 Verificar si la tabla users existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
        RAISE EXCEPTION 'La tabla "users" no existe. Ejecuta primero las migraciones de Alembic.';
    END IF;
END $$;

-- 🧹 Limpiar usuarios existentes para evitar conflictos
DELETE FROM users WHERE username IN ('admin', 'demo', 'dpo');

-- ✅ Crear usuario SUPER ADMINISTRADOR
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

-- ✅ Crear usuario DEMO
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
);

-- ✅ Crear usuario DPO (Data Protection Officer)
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
);

-- 🎯 Verificar usuarios creados exitosamente
SELECT 
    '✅ USUARIOS CREADOS EXITOSAMENTE' as status,
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

-- 📊 Resumen de usuarios
SELECT 
    COUNT(*) as total_usuarios,
    COUNT(CASE WHEN is_superuser = true THEN 1 END) as super_admins,
    COUNT(CASE WHEN is_active = true THEN 1 END) as usuarios_activos
FROM users 
WHERE username IN ('admin', 'demo', 'dpo');

-- 🔐 CREDENCIALES DE ACCESO
-- Usuario: admin | Contraseña: Admin123!
-- Usuario: demo  | Contraseña: Demo123!
-- Usuario: dpo   | Contraseña: Dpo123!
