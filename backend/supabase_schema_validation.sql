-- 🗄️ VALIDACIÓN COMPLETA DE ESQUEMA SUPABASE
-- Sistema LPDP - Ley 21.719

-- Verificar que todas las tablas existan
DO $$
DECLARE
    required_tables TEXT[] := ARRAY[
        'users', 'roles', 'permissions', 'user_roles', 'role_permissions',
        'tenants', 'empresas', 'modulo_acceso', 'licencias',
        'consentimientos', 'arcopol', 'inventario', 'brechas', 'dpia', 'transferencias', 'auditoria'
    ];
    table_name TEXT;
    table_exists BOOLEAN;
BEGIN
    RAISE NOTICE '🔍 VALIDANDO ESQUEMA SUPABASE...';
    
    FOREACH table_name IN ARRAY required_tables
    LOOP
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = table_name
        ) INTO table_exists;
        
        IF table_exists THEN
            RAISE NOTICE '✅ Tabla % existe', table_name;
        ELSE
            RAISE NOTICE '❌ Tabla % NO existe - CREAR REQUERIDO', table_name;
        END IF;
    END LOOP;
END $$;

-- Verificar estructura de tabla users
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar estructura de tabla tenants
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'tenants' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar índices existentes
SELECT 
    indexname,
    tablename,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Verificar políticas RLS (Row Level Security)
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Verificar funciones existentes
SELECT 
    proname,
    prosrc
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND prosrc IS NOT NULL
ORDER BY proname;

-- Verificar triggers
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;
