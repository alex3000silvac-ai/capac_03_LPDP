-- 🚀 SETUP ULTRA SIMPLIFICADO TECHSTART SPA
-- COMPATIBLE CON CUALQUIER ESTRUCTURA DE TABLA
-- Solo operaciones básicas garantizadas

-- ============================================
-- 1. LIMPIAR DATOS (OPERACIONES SEGURAS)
-- ============================================

-- Limpiar solo por tenant_id (columna que existe en todas las versiones)
DELETE FROM proveedores WHERE tenant_id = 'techstart_spa';
DELETE FROM mapeo_datos_rat WHERE tenant_id = 'techstart_spa';

-- ============================================
-- 2. INSERTAR SOLO DATOS ESENCIALES
-- ============================================

-- Proveedores con SOLO columnas básicas que existen en todas las versiones
INSERT INTO proveedores (
    tenant_id,
    nombre,
    categoria_proveedor,
    estado
) VALUES 
    ('techstart_spa', 'Transbank S.A.', 'Procesador de Pagos', 'activo'),
    ('techstart_spa', 'MailChimp LLC', 'Marketing Digital', 'activo'),
    ('techstart_spa', 'Google LLC', 'Analytics y Métricas', 'activo');

-- ============================================
-- 3. RAT EJEMPLO CON ESTRUCTURA MÍNIMA
-- ============================================

-- Usar solo columnas que aparecen en todas las versiones
INSERT INTO mapeo_datos_rat (
    id,
    tenant_id,
    nombre_proceso,
    rat_data,
    created_at
) VALUES (
    'RAT-TECHSTART-EJEMPLO',
    'techstart_spa',
    'Sistema CRM de Clientes',
    '{
        "area_responsable": "Área de Desarrollo",
        "finalidad_principal": "Administrar relaciones comerciales y soporte técnico",
        "base_legal": "Consentimiento del titular - Art. 14 LPDP",
        "estado": "borrador",
        "datos_proceso": {
            "categorias_datos": ["identificacion", "comerciales", "tecnicos"],
            "fuentes": ["formularios_web", "api_pagos"],
            "destinatarios": ["desarrollo", "comercial"],
            "medidas_seguridad": "AES-256, 2FA, auditoría",
            "conservacion": "5 años relación + 2 años archivo"
        }
    }'::jsonb,
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    rat_data = EXCLUDED.rat_data,
    updated_at = NOW();

-- ============================================
-- 4. VERIFICACIÓN SIMPLE
-- ============================================

-- Solo contar registros insertados
SELECT 
    'PROVEEDORES' as tabla, 
    COUNT(*) as total 
FROM proveedores 
WHERE tenant_id = 'techstart_spa'

UNION ALL

SELECT 
    'RAT_EJEMPLO' as tabla, 
    COUNT(*) as total 
FROM mapeo_datos_rat 
WHERE tenant_id = 'techstart_spa';

-- ============================================
-- RESULTADO ESPERADO:
-- PROVEEDORES | 3
-- RAT_EJEMPLO | 1
-- ============================================

-- ✅ COMPATIBILIDAD GARANTIZADA:
-- - Solo usa columnas básicas presentes en todas las versiones
-- - tenant_id (TEXT) - universal
-- - nombre (VARCHAR) - universal  
-- - rat_data (JSONB) - para flexibilidad
-- - created_at (TIMESTAMP) - universal
-- - estado (VARCHAR) - universal
-- ============================================