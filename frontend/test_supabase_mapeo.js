/**
 * SCRIPT DE PRUEBA CRÍTICO - MAPEO RAT EN SUPABASE
 * Este script crea un ejemplo de mapeo y verifica todas las funciones
 */

import { createClient } from '@supabase/supabase-js';

// Configuración Supabase
const supabaseUrl = 'https://xvnfpkxbsmfhqcyvjwmz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2bmZwa3hic21maHFjeXZqd216Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ3OTU5MDUsImV4cCI6MjA1MDM3MTkwNX0.hEUBw6tXs-_pAr2PUYjnAmiFsCFz9P42OUwTLqmeG_s';

const supabase = createClient(supabaseUrl, supabaseKey);

// Ejemplo de mapeo RAT para pruebas
const ejemploMapeoRAT = {
  tenant_id: 'empresa_test_001',
  user_id: 'test_user_mapeo',
  created_by: 'admin@empresatest.cl',
  
  // Datos básicos del RAT
  nombre_actividad: 'Gestión de Clientes Corporativos - PRUEBA',
  descripcion: 'Administración integral de información de clientes empresariales para gestión comercial y facturación',
  area_responsable: 'Departamento Comercial',
  responsable_proceso: 'Gerente de Ventas Corporativas',
  email_responsable: 'ventas@empresatest.cl',
  telefono_responsable: '+56 2 2345 6789',
  
  // Finalidad y base legal
  finalidad_principal: 'Gestión de relación comercial con clientes corporativos',
  finalidades_secundarias: [
    'Facturación y cobranza',
    'Soporte técnico especializado',
    'Análisis de satisfacción del cliente',
    'Marketing directo B2B'
  ],
  base_legal: 'Consentimiento',
  base_legal_descripcion: 'Consentimiento explícito obtenido mediante contrato comercial para gestión de cuenta y comunicaciones comerciales',
  
  // Categorías de datos
  categorias_titulares: [
    'Representantes legales de empresas',
    'Contactos comerciales',
    'Personal técnico de empresas cliente'
  ],
  categorias_datos: {
    identificacion: ['Nombre completo', 'RUT', 'Cargo', 'Empresa'],
    contacto: ['Email corporativo', 'Teléfono directo', 'Teléfono móvil'],
    profesional: ['Área de especialización', 'Años de experiencia'],
    comercial: ['Histórico de compras', 'Preferencias de productos', 'Presupuesto disponible'],
    facturacion: ['Dirección de facturación', 'Condiciones de pago', 'Información tributaria empresa']
  },
  datos_sensibles: false,
  datos_menores: false,
  
  // Flujos de datos
  origen_datos: [
    'Formulario de contacto web corporativo',
    'Contratos comerciales firmados',
    'Tarjetas de presentación en eventos',
    'Referencias de otros clientes',
    'Plataformas de prospección B2B'
  ],
  destinatarios_internos: [
    'Equipo comercial',
    'Departamento de facturación',
    'Soporte técnico especializado',
    'Gerencia general'
  ],
  destinatarios_externos: [
    'Proveedor de servicios de pago (Transbank)',
    'Empresa de courier para envíos',
    'Plataforma CRM externa (Salesforce)'
  ],
  transferencias_internacionales: {
    existe: true,
    paises: ['Estados Unidos'],
    garantias: 'Cláusulas Contractuales Tipo (CCT) aprobadas',
    detalle: 'Datos alojados en servidores AWS en Virginia para el CRM'
  },
  
  // Sistemas y seguridad
  sistemas_tratamiento: [
    'CRM Salesforce (Cloud)',
    'Sistema ERP interno',
    'Plataforma de email marketing',
    'Base de datos PostgreSQL',
    'Sistema de respaldos automáticos'
  ],
  medidas_seguridad_tecnicas: [
    'Encriptación AES-256 en tránsito y reposo',
    'Autenticación multifactor (MFA)',
    'Firewall de aplicaciones web (WAF)',
    'Monitoreo de seguridad 24/7',
    'Respaldos cifrados diarios',
    'Control de acceso basado en roles (RBAC)'
  ],
  medidas_seguridad_organizativas: [
    'Política de protección de datos actualizada',
    'Capacitación anual en privacidad para empleados',
    'Procedimientos de respuesta a incidentes',
    'Auditorías de seguridad trimestrales',
    'Acuerdos de confidencialidad con empleados',
    'Designación formal de DPO'
  ],
  evaluacion_impacto: false,
  
  // Retención
  plazo_conservacion: '7 años desde finalización de relación comercial',
  criterio_conservacion: 'Obligaciones legales tributarias y comerciales según legislación chilena',
  destino_posterior: 'Eliminación segura mediante borrado criptográfico certificado',
  
  // Derechos ARCOPOL
  procedimiento_derechos: 'Solicitudes mediante formulario web seguro o email a dpo@empresatest.cl',
  plazo_respuesta_derechos: '20 días hábiles máximo',
  
  // Metadata
  status: 'active',
  metadata: {
    empresa: 'Empresa Test RAT SpA',
    sector: 'Tecnología y Consultoría',
    version: '3.1.0',
    ley: 'LPDP-21719',
    fecha_revision: new Date().toISOString(),
    auditoria_aprobacion: 'Pendiente',
    nivel_riesgo: 'Medio',
    proxima_revision: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

/**
 * Función para probar la inserción en Supabase
 */
async function probarInsercionMapeo() {
  try {
    console.log('🔍 Iniciando prueba de inserción en Supabase...');
    
    const { data, error } = await supabase
      .from('mapeo_datos_rat')
      .insert(ejemploMapeoRAT)
      .select()
      .single();

    if (error) {
      console.error('❌ Error en inserción:', error);
      return null;
    }

    console.log('✅ Mapeo RAT insertado exitosamente:', data.id);
    console.log('📊 Datos insertados:', {
      id: data.id,
      nombre: data.nombre_actividad,
      tenant: data.tenant_id,
      usuario: data.created_by
    });
    
    return data;
  } catch (err) {
    console.error('💥 Error crítico en inserción:', err);
    return null;
  }
}

/**
 * Función para probar la recuperación
 */
async function probarRecuperacionMapeo(mapeoId) {
  try {
    console.log('🔍 Probando recuperación del mapeo ID:', mapeoId);
    
    const { data, error } = await supabase
      .from('mapeo_datos_rat')
      .select('*')
      .eq('id', mapeoId)
      .single();

    if (error) {
      console.error('❌ Error en recuperación:', error);
      return false;
    }

    console.log('✅ Mapeo recuperado exitosamente');
    console.log('📊 Datos recuperados:', {
      id: data.id,
      nombre: data.nombre_actividad,
      area: data.area_responsable,
      finalidad: data.finalidad_principal
    });
    
    return data;
  } catch (err) {
    console.error('💥 Error en recuperación:', err);
    return false;
  }
}

/**
 * Función para probar la edición
 */
async function probarEdicionMapeo(mapeoId) {
  try {
    console.log('🔍 Probando edición del mapeo ID:', mapeoId);
    
    const datosActualizados = {
      nombre_actividad: 'Gestión de Clientes Corporativos - EDITADO ✅',
      descripcion: 'DESCRIPCIÓN ACTUALIZADA: Sistema mejorado con nuevas funcionalidades',
      area_responsable: 'Departamento Comercial Digital',
      updated_at: new Date().toISOString(),
      metadata: {
        ...ejemploMapeoRAT.metadata,
        version: '3.1.1',
        ultima_edicion: new Date().toISOString(),
        editado_por: 'test_editor',
        estado_edicion: 'editado_exitosamente'
      }
    };
    
    const { data, error } = await supabase
      .from('mapeo_datos_rat')
      .update(datosActualizados)
      .eq('id', mapeoId)
      .select()
      .single();

    if (error) {
      console.error('❌ Error en edición:', error);
      return false;
    }

    console.log('✅ Mapeo editado exitosamente');
    console.log('📊 Datos actualizados:', {
      id: data.id,
      nombre_nuevo: data.nombre_actividad,
      area_nueva: data.area_responsable,
      version: data.metadata.version
    });
    
    return data;
  } catch (err) {
    console.error('💥 Error en edición:', err);
    return false;
  }
}

/**
 * Función para probar listado por tenant
 */
async function probarListadoPorTenant(tenantId) {
  try {
    console.log('🔍 Probando listado para tenant:', tenantId);
    
    const { data, error } = await supabase
      .from('mapeo_datos_rat')
      .select('id, nombre_actividad, area_responsable, created_at, updated_at')
      .eq('tenant_id', tenantId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error en listado:', error);
      return false;
    }

    console.log(`✅ Encontrados ${data.length} mapeos para el tenant`);
    data.forEach((mapeo, index) => {
      console.log(`📋 ${index + 1}. ${mapeo.nombre_actividad} (${mapeo.id})`);
    });
    
    return data;
  } catch (err) {
    console.error('💥 Error en listado:', err);
    return false;
  }
}

/**
 * Ejecutar todas las pruebas
 */
async function ejecutarPruebasCompletas() {
  console.log('🚀 INICIANDO PRUEBAS COMPLETAS DEL MÓDULO 0');
  console.log('================================================');
  
  // 1. Probar inserción
  const mapeoInsertado = await probarInsercionMapeo();
  if (!mapeoInsertado) {
    console.log('💥 FALLA CRÍTICA: No se pudo insertar el mapeo');
    return false;
  }
  
  console.log('\n⏳ Esperando 2 segundos...\n');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // 2. Probar recuperación
  const mapeoRecuperado = await probarRecuperacionMapeo(mapeoInsertado.id);
  if (!mapeoRecuperado) {
    console.log('💥 FALLA CRÍTICA: No se pudo recuperar el mapeo');
    return false;
  }
  
  console.log('\n⏳ Esperando 2 segundos...\n');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // 3. Probar edición
  const mapeoEditado = await probarEdicionMapeo(mapeoInsertado.id);
  if (!mapeoEditado) {
    console.log('💥 FALLA CRÍTICA: No se pudo editar el mapeo');
    return false;
  }
  
  console.log('\n⏳ Esperando 2 segundos...\n');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // 4. Probar listado
  const listado = await probarListadoPorTenant(ejemploMapeoRAT.tenant_id);
  if (!listado) {
    console.log('💥 FALLA CRÍTICA: No se pudo listar los mapeos');
    return false;
  }
  
  console.log('\n🎉 TODAS LAS PRUEBAS EXITOSAS');
  console.log('================================================');
  console.log('✅ Inserción: FUNCIONANDO');
  console.log('✅ Recuperación: FUNCIONANDO');
  console.log('✅ Edición: FUNCIONANDO');
  console.log('✅ Listado: FUNCIONANDO');
  console.log('================================================');
  console.log(`📋 ID del mapeo de prueba: ${mapeoInsertado.id}`);
  console.log(`🏢 Tenant de prueba: ${ejemploMapeoRAT.tenant_id}`);
  console.log('================================================');
  
  return true;
}

// Solo exportar para uso en navegador
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ejecutarPruebasCompletas,
    probarInsercionMapeo,
    probarRecuperacionMapeo,
    probarEdicionMapeo,
    probarListadoPorTenant,
    ejemploMapeoRAT
  };
} else {
  // Para usar en navegador
  window.pruebasMapeoRAT = {
    ejecutarPruebasCompletas,
    probarInsercionMapeo,
    probarRecuperacionMapeo,
    probarEdicionMapeo,
    probarListadoPorTenant,
    ejemploMapeoRAT
  };
  
  console.log('📋 Script de pruebas cargado. Ejecutar con: pruebasMapeoRAT.ejecutarPruebasCompletas()');
}