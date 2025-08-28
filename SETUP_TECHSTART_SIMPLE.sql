-- 🚀 SETUP SIMPLIFICADO PARA TECHSTART SPA
-- Solo datos esenciales para pruebas - Sin dependencias complejas

-- ============================================
-- 1. LIMPIAR DATOS ANTERIORES
-- ============================================

DELETE FROM rat_proveedores WHERE tenant_id = 'techstart_spa';
DELETE FROM mapeo_datos_rat WHERE tenant_id = 'techstart_spa';  
DELETE FROM proveedores WHERE tenant_id = 'techstart_spa';

-- ============================================
-- 2. INSERTAR PROVEEDORES PARA PRUEBAS
-- ============================================

-- Proveedor 1: Transbank
INSERT INTO proveedores (
    id,
    tenant_id,
    nombre,
    categoria_proveedor,
    pais,
    dpa_info,
    evaluacion_seguridad,
    datos_compartidos,
    nivel_riesgo,
    estado,
    created_at
) VALUES (
    gen_random_uuid(),
    'techstart_spa',
    'Transbank S.A.',
    'Procesador de Pagos',
    'Chile',
    '{
        "firmado": true,
        "fecha_firma": "2024-01-15",
        "version": "v2.1"
    }'::jsonb,
    '{
        "nivel": "Alta",
        "certificaciones": ["PCI-DSS", "ISO 27001"],
        "puntuacion": 95
    }'::jsonb,
    'Datos transaccionales, montos, identificación cliente',
    'Medio',
    'activo',
    NOW()
);

-- Proveedor 2: MailChimp
INSERT INTO proveedores (
    id,
    tenant_id,
    nombre,
    categoria_proveedor,
    pais,
    dpa_info,
    evaluacion_seguridad,
    datos_compartidos,
    nivel_riesgo,
    estado,
    created_at
) VALUES (
    gen_random_uuid(),
    'techstart_spa',
    'MailChimp LLC',
    'Marketing Digital',
    'Estados Unidos',
    '{
        "firmado": true,
        "fecha_firma": "2024-03-22",
        "transferencia_internacional": true
    }'::jsonb,
    '{
        "nivel": "Media",
        "certificaciones": ["SOC 2"],
        "puntuacion": 78
    }'::jsonb,
    'Email, nombre, preferencias marketing',
    'Medio-Alto',
    'activo',
    NOW()
);

-- Proveedor 3: Google Analytics
INSERT INTO proveedores (
    id,
    tenant_id,
    nombre,
    categoria_proveedor,
    pais,
    dpa_info,
    evaluacion_seguridad,
    datos_compartidos,
    nivel_riesgo,
    estado,
    created_at
) VALUES (
    gen_random_uuid(),
    'techstart_spa',
    'Google LLC',
    'Analytics y Métricas',
    'Estados Unidos',
    '{
        "firmado": true,
        "fecha_firma": "2024-02-10",
        "transferencia_internacional": true
    }'::jsonb,
    '{
        "nivel": "Alta",
        "certificaciones": ["ISO 27001", "SOC 2/3"],
        "puntuacion": 88
    }'::jsonb,
    'Métricas de uso, datos de navegación anonimizados',
    'Bajo',
    'activo',
    NOW()
);

-- ============================================
-- 3. RAT EJEMPLO PARA VALIDAR NO-DUPLICADOS
-- ============================================

INSERT INTO mapeo_datos_rat (
    id,
    tenant_id,
    nombre_proceso,
    area_responsable,
    finalidad_principal,
    base_legal,
    categorias_datos,
    fuentes_datos,
    destinatarios_internos,
    destinatarios_externos,
    medidas_seguridad,
    tiempo_conservacion,
    estado,
    fecha_creacion,
    created_at
) VALUES (
    'RAT-TECHSTART-EJEMPLO',
    'techstart_spa',
    'Sistema CRM de Clientes',
    'Área de Desarrollo',
    'Administrar relaciones comerciales y soporte técnico',
    'Consentimiento del titular - Art. 14 LPDP',
    '{
        "identificacion": ["nombre", "email", "telefono"],
        "comerciales": ["historial_compras", "preferencias"],
        "tecnicos": ["logs_uso", "metricas_rendimiento"]
    }'::jsonb,
    '{
        "formularios_web": "Registro de usuarios",
        "api_pagos": "Integración con plataforma de pagos"
    }'::jsonb,
    '{
        "desarrollo": "Equipo de desarrollo - mantenimiento",
        "comercial": "Área comercial - seguimiento ventas"
    }'::jsonb,
    '{
        "transbank": "Proveedor de pagos",
        "mailchimp": "Servicio de email marketing"
    }'::jsonb,
    '{
        "tecnicas": {
            "cifrado": "AES-256 en base de datos",
            "acceso": "Autenticación de 2 factores"
        },
        "organizacionales": {
            "politicas": "Política de acceso basada en roles",
            "capacitacion": "Capacitación anual en protección de datos"
        }
    }'::jsonb,
    '{
        "clientes_activos": "Durante relación comercial + 5 años",
        "clientes_inactivos": "2 años desde último contacto"
    }'::jsonb,
    'borrador',
    NOW(),
    NOW()
);

-- ============================================
-- 4. VERIFICAR SETUP
-- ============================================

SELECT 'PROVEEDORES' as tabla, COUNT(*) as registros FROM proveedores WHERE tenant_id = 'techstart_spa'  
UNION ALL
SELECT 'RAT_EJEMPLO' as tabla, COUNT(*) as registros FROM mapeo_datos_rat WHERE tenant_id = 'techstart_spa';

-- ============================================
-- RESULTADO ESPERADO:
-- PROVEEDORES: 3
-- RAT_EJEMPLO: 1
-- ============================================