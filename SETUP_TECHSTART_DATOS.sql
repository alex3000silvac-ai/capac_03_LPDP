-- 🚀 SETUP DE DATOS PARA TECHSTART SPA
-- Sistema LPDP - Preparación para Pruebas Integrales
-- Ejecutar en Supabase antes de comenzar las pruebas

-- ============================================
-- 1. LIMPIAR DATOS ANTERIORES (RESET COMPLETO)
-- ============================================

-- Limpiar todas las tablas manteniendo estructura
-- Usar el tenant_id correcto del sistema
DELETE FROM rat_proveedores WHERE tenant_id = 'techstart_spa';
DELETE FROM mapeo_datos_rat WHERE tenant_id = 'techstart_spa';  
DELETE FROM proveedores WHERE tenant_id = 'techstart_spa';
DELETE FROM evaluaciones_seguridad WHERE tenant_id = 'techstart_spa';
DELETE FROM dpas WHERE tenant_id = 'techstart_spa';
DELETE FROM organizaciones WHERE rut = '77.123.456-7';

-- ============================================
-- 2. INSERTAR ORGANIZACIÓN TECHSTART SPA
-- ============================================

-- NOTA: Verificar si la tabla organizaciones existe, si no, crearla simplificada
INSERT INTO organizaciones (
    id,
    razon_social,
    rut,
    industria,
    tamano,
    direccion,
    email,
    plan,
    estado,
    created_at
) VALUES (
    gen_random_uuid(),
    'TechStart SpA',
    '77.123.456-7',
    'Tecnología',
    'pequeña',
    '{"ciudad": "Providencia", "region": "Santiago", "pais": "Chile"}'::jsonb,
    'admin@techstart.cl',
    'profesional',
    'activo',
    NOW()
) ON CONFLICT (rut) DO UPDATE SET
    razon_social = EXCLUDED.razon_social,
    updated_at = NOW();

-- ============================================
-- 3. CREAR USUARIO DPO PARA TECHSTART
-- ============================================

-- Nota: En producción esto se hace via Supabase Auth UI
-- Aquí documentamos los datos para el test manual

/*
USUARIO DE PRUEBA - CREAR MANUALMENTE EN SUPABASE AUTH:
- Email: admin@techstart.cl  
- Password: TechStart2024!
- User Metadata: {
    "tenant_id": "techstart_spa",
    "organizacion_id": "techstart_spa", 
    "organizacion_nombre": "TechStart SpA",
    "first_name": "Juan Carlos",
    "last_name": "Administrador",
    "is_superuser": false,
    "permissions": ["rat:create", "rat:read", "rat:update", "eipd:create", "providers:manage"]
  }
*/

-- ============================================
-- 4. INSERTAR PROVEEDORES PREDEFINIDOS
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
        "version": "v2.1",
        "clausulas_especiales": ["transferencia_datos", "retencion_limitada"]
    }'::jsonb,
    '{
        "nivel": "Alta",
        "certificaciones": ["PCI-DSS", "ISO 27001"],
        "auditoria_fecha": "2024-01-10",
        "puntuacion": 95,
        "observaciones": "Cumple estándares bancarios chilenos"
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
        "version": "v1.8",
        "transferencia_internacional": true,
        "mecanismo_transferencia": "Standard Contractual Clauses"
    }'::jsonb,
    '{
        "nivel": "Media",
        "certificaciones": ["SOC 2", "Privacy Shield successor"],
        "auditoria_fecha": "2024-03-01", 
        "puntuacion": 78,
        "observaciones": "Transferencia internacional requiere monitoreo"
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
        "version": "GA4-DPA-2024",
        "transferencia_internacional": true,
        "mecanismo_transferencia": "Adequacy Decision"
    }'::jsonb,
    '{
        "nivel": "Alta",
        "certificaciones": ["ISO 27001", "SOC 2/3"],
        "auditoria_fecha": "2024-02-01",
        "puntuacion": 88,
        "observaciones": "Configuración de anonimización activada"
    }'::jsonb,
    'Métricas de uso, datos de navegación anonimizados',
    'Bajo',
    'activo',
    NOW()
);

-- ============================================
-- 5. INSERTAR RAT PREDEFINIDO (OPCIONAL)
-- ============================================

-- RAT Ejemplo para validar que el sistema NO muestre duplicados
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
        "api_pagos": "Integración con plataforma de pagos", 
        "logs_sistema": "Logs automáticos del sistema",
        "soporte_tecnico": "Interacciones de soporte"
    }'::jsonb,
    '{
        "desarrollo": "Equipo de desarrollo - mantenimiento",
        "comercial": "Área comercial - seguimiento ventas", 
        "soporte": "Soporte técnico - resolución incidencias"
    }'::jsonb,
    '{
        "transbank": "Proveedor de pagos",
        "mailchimp": "Servicio de email marketing",
        "analytics": "Servicio de analytics Google"
    }'::jsonb,
    '{
        "tecnicas": {
            "cifrado": "AES-256 en base de datos",
            "acceso": "Autenticación de 2 factores", 
            "auditoria": "Logs de auditoría completos",
            "backup": "Backups automatizados cifrados"
        },
        "organizacionales": {
            "politicas": "Política de acceso basada en roles",
            "capacitacion": "Capacitación anual en protección de datos",
            "contratos": "Acuerdos de confidencialidad firmados",
            "procedimientos": "Procedimientos de gestión de incidentes"
        }
    }'::jsonb,
    '{
        "clientes_activos": "Durante relación comercial + 5 años",
        "clientes_inactivos": "2 años desde último contacto",
        "logs_sistema": "1 año para análisis técnico", 
        "datos_soporte": "3 años para seguimiento calidad"
    }'::jsonb,
    'borrador',
    NOW(),
    NOW()
);

-- ============================================
-- 6. VERIFICAR SETUP COMPLETO
-- ============================================

-- Verificar datos insertados
SELECT 'ORGANIZACIONES' as tabla, COUNT(*) as registros FROM organizaciones WHERE tenant_id = 'techstart_spa'
UNION ALL
SELECT 'PROVEEDORES' as tabla, COUNT(*) as registros FROM proveedores WHERE tenant_id = 'techstart_spa'  
UNION ALL
SELECT 'RAT_PREDEFINIDOS' as tabla, COUNT(*) as registros FROM mapeo_datos_rat WHERE tenant_id = 'techstart_spa';

-- ============================================
-- 7. NOTAS PARA LA PRUEBA
-- ============================================

/*
🎯 DATOS LISTOS PARA PRUEBA:

✅ ORGANIZACIÓN: TechStart SpA configurada
✅ PROVEEDORES: 3 proveedores predefinidos (Transbank, MailChimp, Google)
✅ RAT EJEMPLO: 1 RAT de ejemplo para validar NO duplicados
✅ TENANT: 'techstart_spa' configurado con aislamiento

🚨 ACCIONES REQUERIDAS ANTES DE LA PRUEBA:

1. Ejecutar este SQL en Supabase
2. Crear usuario admin@techstart.cl en Supabase Auth
3. Configurar user_metadata según especificado
4. Limpiar localStorage del navegador
5. Iniciar prueba desde /login

📋 RESULTADO ESPERADO:

- Sistema en estado limpio y predecible  
- Datos consistentes para pruebas
- Aislamiento multi-tenant funcionando
- No interferencia con otros tenants
*/