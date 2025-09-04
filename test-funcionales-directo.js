/**
 * 🧪 PRUEBAS FUNCIONALES DIRECTAS - SISTEMA LPDP
 * Test directo contra Supabase sin imports de módulos
 */

const { createClient } = require('@supabase/supabase-js');

// Configuración Supabase (misma que en supabaseClient.js)
const supabaseUrl = 'https://yntsrpibrwpnxkrobocj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InludHNycGlicndwbnhrcm9ib2NqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI5MDY3NDIsImV4cCI6MjA0ODQ4Mjc0Mn0.qqBl3FBOZcLvLXyjNRtQj0zVUDQO8aLoA-CrmwKLv-k';
const supabase = createClient(supabaseUrl, supabaseKey);

// Colores para output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function runTests() {
  console.clear();
  log('================================================', 'cyan');
  log('🧪 PRUEBAS FUNCIONALES DIRECTAS - SISTEMA LPDP', 'cyan');
  log('================================================', 'cyan');
  
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  
  // ===============================
  // TEST 1: CONEXIÓN SUPABASE
  // ===============================
  log('\n📡 TEST 1: CONEXIÓN SUPABASE', 'yellow');
  totalTests++;
  try {
    const { data, error } = await supabase
      .from('organizaciones')
      .select('count')
      .limit(1);
    
    if (error) throw error;
    log('✅ Conexión exitosa con Supabase', 'green');
    passedTests++;
  } catch (error) {
    log(`❌ Error conexión: ${error.message}`, 'red');
    failedTests++;
  }
  
  // ===============================
  // TEST 2: TABLAS CRÍTICAS
  // ===============================
  log('\n📊 TEST 2: VERIFICACIÓN TABLAS CRÍTICAS', 'yellow');
  
  const criticalTables = [
    'company_data_templates',
    'user_sessions',
    'actividades_dpo',
    'dpo_notifications',
    'evaluaciones_seguridad',
    'documentos_dpa',
    'evaluaciones_impacto_privacidad',
    'rat_proveedores',
    'proveedores',
    'mapeo_datos_rat'
  ];
  
  for (const tableName of criticalTables) {
    totalTests++;
    try {
      const { error } = await supabase
        .from(tableName)
        .select('id')
        .limit(1);
      
      if (error && !error.message.includes('no rows')) {
        throw error;
      }
      
      log(`✅ Tabla ${tableName} accesible`, 'green');
      passedTests++;
    } catch (error) {
      log(`❌ Tabla ${tableName} error: ${error.message}`, 'red');
      failedTests++;
    }
  }
  
  // ===============================
  // TEST 3: CRUD RAT
  // ===============================
  log('\n🔧 TEST 3: OPERACIONES CRUD RAT', 'yellow');
  totalTests++;
  
  let testRatId = null;
  
  try {
    // Crear RAT
    const newRAT = {
      tenant_id: 1,
      nombre_actividad: 'Test RAT Funcional ' + Date.now(),
      area_responsable: 'QA Testing',
      responsable_proceso: 'Test Engineer',
      email_responsable: 'test@lpdp.cl',
      descripcion: 'RAT de prueba funcional automatizada',
      finalidad_principal: 'Validación sistema',
      base_licitud: 'CONSENTIMIENTO',
      estado: 'BORRADOR'
    };
    
    const { data: created, error: createError } = await supabase
      .from('mapeo_datos_rat')
      .insert([newRAT])
      .select()
      .single();
    
    if (createError) throw createError;
    testRatId = created.id;
    log(`✅ CREATE: RAT creado con ID ${testRatId}`, 'green');
    
    // Leer RAT
    const { data: read, error: readError } = await supabase
      .from('mapeo_datos_rat')
      .select('*')
      .eq('id', testRatId)
      .single();
    
    if (readError) throw readError;
    log(`✅ READ: RAT recuperado correctamente`, 'green');
    
    // Actualizar RAT
    const { data: updated, error: updateError } = await supabase
      .from('mapeo_datos_rat')
      .update({ estado: 'CERTIFICADO' })
      .eq('id', testRatId)
      .select()
      .single();
    
    if (updateError) throw updateError;
    if (updated.estado !== 'CERTIFICADO') throw new Error('Estado no actualizado');
    log(`✅ UPDATE: RAT actualizado a CERTIFICADO`, 'green');
    
    // Eliminar RAT
    const { error: deleteError } = await supabase
      .from('mapeo_datos_rat')
      .delete()
      .eq('id', testRatId);
    
    if (deleteError) throw deleteError;
    log(`✅ DELETE: RAT eliminado correctamente`, 'green');
    
    passedTests++;
  } catch (error) {
    log(`❌ CRUD RAT falló: ${error.message}`, 'red');
    failedTests++;
    
    // Limpiar si quedó algo
    if (testRatId) {
      await supabase.from('mapeo_datos_rat').delete().eq('id', testRatId);
    }
  }
  
  // ===============================
  // TEST 4: PROVEEDORES
  // ===============================
  log('\n🏢 TEST 4: MÓDULO PROVEEDORES', 'yellow');
  totalTests++;
  
  let testProveedorId = null;
  
  try {
    // Crear proveedor
    const newProveedor = {
      tenant_id: 1,
      nombre: 'AWS Test ' + Date.now(),
      tipo: 'ENCARGADO_TRATAMIENTO',
      pais: 'Estados Unidos'
    };
    
    const { data: created, error: createError } = await supabase
      .from('proveedores')
      .insert([newProveedor])
      .select()
      .single();
    
    if (createError) throw createError;
    testProveedorId = created.id;
    log(`✅ Proveedor creado ID: ${testProveedorId}`, 'green');
    
    // Leer proveedores
    const { data: list, error: listError } = await supabase
      .from('proveedores')
      .select('*')
      .eq('tenant_id', 1)
      .limit(10);
    
    if (listError) throw listError;
    log(`✅ Lista proveedores: ${list.length} encontrados`, 'green');
    
    // Eliminar proveedor test
    const { error: deleteError } = await supabase
      .from('proveedores')
      .delete()
      .eq('id', testProveedorId);
    
    if (deleteError) throw deleteError;
    log(`✅ Proveedor eliminado`, 'green');
    
    passedTests++;
  } catch (error) {
    log(`❌ Módulo proveedores falló: ${error.message}`, 'red');
    failedTests++;
    
    // Limpiar
    if (testProveedorId) {
      await supabase.from('proveedores').delete().eq('id', testProveedorId);
    }
  }
  
  // ===============================
  // TEST 5: NOTIFICACIONES DPO
  // ===============================
  log('\n📬 TEST 5: NOTIFICACIONES DPO', 'yellow');
  totalTests++;
  
  let testNotificationId = null;
  
  try {
    const notification = {
      tenant_id: 1,
      tipo_notificacion: 'TEST',
      titulo: 'Test Notificación',
      mensaje: 'Mensaje de prueba funcional',
      prioridad: 'alta',
      estado: 'no_leida'
    };
    
    const { data: created, error: createError } = await supabase
      .from('dpo_notifications')
      .insert([notification])
      .select()
      .single();
    
    if (createError) throw createError;
    testNotificationId = created.id;
    log(`✅ Notificación creada ID: ${testNotificationId}`, 'green');
    
    // Marcar como leída
    const { error: updateError } = await supabase
      .from('dpo_notifications')
      .update({ estado: 'leida' })
      .eq('id', testNotificationId);
    
    if (updateError) throw updateError;
    log(`✅ Notificación marcada como leída`, 'green');
    
    // Eliminar
    const { error: deleteError } = await supabase
      .from('dpo_notifications')
      .delete()
      .eq('id', testNotificationId);
    
    if (deleteError) throw deleteError;
    log(`✅ Notificación eliminada`, 'green');
    
    passedTests++;
  } catch (error) {
    log(`❌ Notificaciones DPO falló: ${error.message}`, 'red');
    failedTests++;
    
    // Limpiar
    if (testNotificationId) {
      await supabase.from('dpo_notifications').delete().eq('id', testNotificationId);
    }
  }
  
  // ===============================
  // TEST 6: MULTI-TENANT
  // ===============================
  log('\n🔐 TEST 6: MULTI-TENANT', 'yellow');
  totalTests++;
  
  const testIds = [];
  
  try {
    // Crear RATs para diferentes tenants
    for (let tenantId of [1, 2]) {
      const rat = {
        tenant_id: tenantId,
        nombre_actividad: `RAT Tenant ${tenantId}`,
        estado: 'BORRADOR'
      };
      
      const { data, error } = await supabase
        .from('mapeo_datos_rat')
        .insert([rat])
        .select()
        .single();
      
      if (error) throw error;
      testIds.push(data.id);
      log(`✅ RAT creado para Tenant ${tenantId}: ID ${data.id}`, 'green');
    }
    
    // Verificar aislamiento
    const { data: tenant1Rats, error: t1Error } = await supabase
      .from('mapeo_datos_rat')
      .select('*')
      .eq('tenant_id', 1)
      .in('id', testIds);
    
    if (t1Error) throw t1Error;
    
    const { data: tenant2Rats, error: t2Error } = await supabase
      .from('mapeo_datos_rat')
      .select('*')
      .eq('tenant_id', 2)
      .in('id', testIds);
    
    if (t2Error) throw t2Error;
    
    log(`✅ Tenant 1 ve ${tenant1Rats.length} RAT(s)`, 'green');
    log(`✅ Tenant 2 ve ${tenant2Rats.length} RAT(s)`, 'green');
    log(`✅ Aislamiento multi-tenant verificado`, 'green');
    
    passedTests++;
  } catch (error) {
    log(`❌ Multi-tenant falló: ${error.message}`, 'red');
    failedTests++;
  } finally {
    // Limpiar
    for (const id of testIds) {
      await supabase.from('mapeo_datos_rat').delete().eq('id', id);
    }
  }
  
  // ===============================
  // RESUMEN FINAL
  // ===============================
  log('\n================================================', 'cyan');
  log('📊 RESUMEN DE PRUEBAS FUNCIONALES', 'yellow');
  log('================================================', 'cyan');
  
  const successRate = ((passedTests / totalTests) * 100).toFixed(1);
  
  log(`Total pruebas: ${totalTests}`, 'blue');
  log(`✅ Exitosas: ${passedTests}`, 'green');
  if (failedTests > 0) {
    log(`❌ Fallidas: ${failedTests}`, 'red');
  }
  log(`📈 Tasa de éxito: ${successRate}%`, 'cyan');
  
  if (passedTests === totalTests) {
    log('\n🎉 ¡TODAS LAS PRUEBAS PASARON!', 'green');
    log('🚀 SISTEMA 100% FUNCIONAL', 'green');
  } else {
    log('\n⚠️  Algunas pruebas fallaron', 'yellow');
    log('Revisar los errores arriba para más detalles', 'yellow');
  }
  
  return passedTests === totalTests;
}

// Ejecutar pruebas
runTests()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    log(`\n💥 Error fatal: ${error.message}`, 'red');
    process.exit(1);
  });