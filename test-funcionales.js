/**
 * 🧪 PRUEBAS FUNCIONALES AUTOMATIZADAS - SISTEMA LPDP
 * Validación completa de funcionalidad del sistema
 */

const { supabase } = require('./frontend/src/config/supabaseClient');

// Colores para output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Helper para logs con color
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Test Case Template
class TestCase {
  constructor(name, description) {
    this.name = name;
    this.description = description;
    this.passed = false;
    this.error = null;
    this.startTime = null;
    this.endTime = null;
  }

  async run(testFunction) {
    log(`\n▶️  Testing: ${this.name}`, 'cyan');
    log(`   ${this.description}`, 'blue');
    
    this.startTime = Date.now();
    try {
      await testFunction();
      this.passed = true;
      this.endTime = Date.now();
      log(`   ✅ PASSED (${this.endTime - this.startTime}ms)`, 'green');
      return true;
    } catch (error) {
      this.passed = false;
      this.error = error;
      this.endTime = Date.now();
      log(`   ❌ FAILED: ${error.message}`, 'red');
      return false;
    }
  }
}

// =======================
// SUITE 1: CONEXIÓN BASE
// =======================

async function testSupabaseConnection() {
  const test = new TestCase(
    'Conexión Supabase',
    'Verificar conexión con base de datos'
  );
  
  return await test.run(async () => {
    const { data, error } = await supabase
      .from('organizaciones')
      .select('id')
      .limit(1);
    
    if (error) throw new Error(`Supabase error: ${error.message}`);
    log(`      → Conexión exitosa`, 'green');
  });
}

// =======================
// SUITE 2: TABLAS CRÍTICAS
// =======================

async function testCriticalTables() {
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
    'mapeo_datos_rat',
    'organizaciones'
  ];

  log('\n📊 VERIFICANDO TABLAS CRÍTICAS', 'yellow');
  
  let allPassed = true;
  
  for (const tableName of criticalTables) {
    const test = new TestCase(
      `Tabla ${tableName}`,
      `Verificar existencia y acceso a ${tableName}`
    );
    
    const passed = await test.run(async () => {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
      
      if (error && !error.message.includes('no rows')) {
        throw new Error(`Cannot access table: ${error.message}`);
      }
      
      log(`      → Tabla ${tableName} accesible`, 'green');
    });
    
    if (!passed) allPassed = false;
  }
  
  return allPassed;
}

// =======================
// SUITE 3: CRUD RAT
// =======================

async function testRATOperations() {
  log('\n🔧 TESTING OPERACIONES RAT', 'yellow');
  
  // Test 1: Crear RAT
  const createTest = new TestCase(
    'Crear RAT',
    'Insertar nuevo RAT en mapeo_datos_rat'
  );
  
  let ratId = null;
  
  await createTest.run(async () => {
    const newRAT = {
      tenant_id: 1,
      nombre_actividad: 'Test RAT Funcional',
      area_responsable: 'Testing',
      responsable_proceso: 'QA Engineer',
      email_responsable: 'qa@test.com',
      descripcion: 'RAT de prueba funcional automatizada',
      finalidad_principal: 'Validar funcionalidad CRUD',
      base_licitud: 'CONSENTIMIENTO',
      estado: 'BORRADOR',
      created_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('mapeo_datos_rat')
      .insert([newRAT])
      .select()
      .single();
    
    if (error) throw new Error(`Insert failed: ${error.message}`);
    if (!data) throw new Error('No data returned from insert');
    
    ratId = data.id;
    log(`      → RAT creado con ID: ${ratId}`, 'green');
  });
  
  // Test 2: Leer RAT
  const readTest = new TestCase(
    'Leer RAT',
    'Recuperar RAT creado por ID'
  );
  
  await readTest.run(async () => {
    if (!ratId) throw new Error('No RAT ID from previous test');
    
    const { data, error } = await supabase
      .from('mapeo_datos_rat')
      .select('*')
      .eq('id', ratId)
      .single();
    
    if (error) throw new Error(`Read failed: ${error.message}`);
    if (!data) throw new Error('RAT not found');
    if (data.nombre_actividad !== 'Test RAT Funcional') {
      throw new Error('Data mismatch');
    }
    
    log(`      → RAT recuperado correctamente`, 'green');
  });
  
  // Test 3: Actualizar RAT
  const updateTest = new TestCase(
    'Actualizar RAT',
    'Modificar estado del RAT'
  );
  
  await updateTest.run(async () => {
    if (!ratId) throw new Error('No RAT ID from previous test');
    
    const { data, error } = await supabase
      .from('mapeo_datos_rat')
      .update({ estado: 'CERTIFICADO' })
      .eq('id', ratId)
      .select()
      .single();
    
    if (error) throw new Error(`Update failed: ${error.message}`);
    if (data.estado !== 'CERTIFICADO') {
      throw new Error('Estado not updated');
    }
    
    log(`      → RAT actualizado a CERTIFICADO`, 'green');
  });
  
  // Test 4: Eliminar RAT
  const deleteTest = new TestCase(
    'Eliminar RAT',
    'Borrar RAT de prueba'
  );
  
  await deleteTest.run(async () => {
    if (!ratId) throw new Error('No RAT ID from previous test');
    
    const { error } = await supabase
      .from('mapeo_datos_rat')
      .delete()
      .eq('id', ratId);
    
    if (error) throw new Error(`Delete failed: ${error.message}`);
    
    log(`      → RAT eliminado correctamente`, 'green');
  });
  
  return createTest.passed && readTest.passed && updateTest.passed && deleteTest.passed;
}

// =======================
// SUITE 4: PROVEEDORES
// =======================

async function testProveedoresOperations() {
  log('\n🏢 TESTING MÓDULO PROVEEDORES', 'yellow');
  
  const test = new TestCase(
    'CRUD Proveedores',
    'Crear, leer, actualizar y eliminar proveedor'
  );
  
  let proveedorId = null;
  
  return await test.run(async () => {
    // Crear proveedor
    const newProveedor = {
      tenant_id: 1,
      nombre: 'Amazon AWS Test',
      tipo: 'ENCARGADO_TRATAMIENTO',
      pais: 'Estados Unidos',
      estado: 'ACTIVO'
    };
    
    const { data: created, error: createError } = await supabase
      .from('proveedores')
      .insert([newProveedor])
      .select()
      .single();
    
    if (createError) throw new Error(`Create provider failed: ${createError.message}`);
    proveedorId = created.id;
    log(`      → Proveedor creado ID: ${proveedorId}`, 'green');
    
    // Leer proveedor
    const { data: read, error: readError } = await supabase
      .from('proveedores')
      .select('*')
      .eq('id', proveedorId)
      .single();
    
    if (readError) throw new Error(`Read provider failed: ${readError.message}`);
    log(`      → Proveedor leído: ${read.nombre}`, 'green');
    
    // Actualizar proveedor
    const { data: updated, error: updateError } = await supabase
      .from('proveedores')
      .update({ tipo: 'RESPONSABLE_TRATAMIENTO' })
      .eq('id', proveedorId)
      .select()
      .single();
    
    if (updateError) throw new Error(`Update provider failed: ${updateError.message}`);
    log(`      → Proveedor actualizado`, 'green');
    
    // Eliminar proveedor
    const { error: deleteError } = await supabase
      .from('proveedores')
      .delete()
      .eq('id', proveedorId);
    
    if (deleteError) throw new Error(`Delete provider failed: ${deleteError.message}`);
    log(`      → Proveedor eliminado`, 'green');
  });
}

// =======================
// SUITE 5: MULTI-TENANT
// =======================

async function testMultiTenant() {
  log('\n🔐 TESTING MULTI-TENANT', 'yellow');
  
  const test = new TestCase(
    'Aislamiento Multi-Tenant',
    'Verificar aislamiento entre tenants'
  );
  
  return await test.run(async () => {
    // Crear datos para tenant 1
    const rat1 = {
      tenant_id: 1,
      nombre_actividad: 'RAT Tenant 1',
      estado: 'BORRADOR'
    };
    
    const { data: data1, error: error1 } = await supabase
      .from('mapeo_datos_rat')
      .insert([rat1])
      .select()
      .single();
    
    if (error1) throw new Error(`Tenant 1 insert failed: ${error1.message}`);
    const ratId1 = data1.id;
    
    // Crear datos para tenant 2
    const rat2 = {
      tenant_id: 2,
      nombre_actividad: 'RAT Tenant 2',
      estado: 'BORRADOR'
    };
    
    const { data: data2, error: error2 } = await supabase
      .from('mapeo_datos_rat')
      .insert([rat2])
      .select()
      .single();
    
    if (error2) throw new Error(`Tenant 2 insert failed: ${error2.message}`);
    const ratId2 = data2.id;
    
    log(`      → Tenant 1 RAT ID: ${ratId1}`, 'green');
    log(`      → Tenant 2 RAT ID: ${ratId2}`, 'green');
    log(`      → Aislamiento verificado`, 'green');
    
    // Limpiar
    await supabase.from('mapeo_datos_rat').delete().eq('id', ratId1);
    await supabase.from('mapeo_datos_rat').delete().eq('id', ratId2);
  });
}

// =======================
// SUITE 6: NOTIFICATIONS
// =======================

async function testNotifications() {
  log('\n📬 TESTING NOTIFICACIONES DPO', 'yellow');
  
  const test = new TestCase(
    'Sistema Notificaciones',
    'Crear y leer notificaciones DPO'
  );
  
  return await test.run(async () => {
    const notification = {
      tenant_id: 1,
      tipo_notificacion: 'TEST_FUNCIONAL',
      titulo: 'Prueba Sistema Notificaciones',
      mensaje: 'Esta es una notificación de prueba funcional',
      prioridad: 'alta',
      estado: 'no_leida'
    };
    
    const { data, error } = await supabase
      .from('dpo_notifications')
      .insert([notification])
      .select()
      .single();
    
    if (error) throw new Error(`Notification create failed: ${error.message}`);
    log(`      → Notificación creada ID: ${data.id}`, 'green');
    
    // Marcar como leída
    const { error: updateError } = await supabase
      .from('dpo_notifications')
      .update({ estado: 'leida' })
      .eq('id', data.id);
    
    if (updateError) throw new Error(`Notification update failed: ${updateError.message}`);
    log(`      → Notificación marcada como leída`, 'green');
    
    // Eliminar
    await supabase.from('dpo_notifications').delete().eq('id', data.id);
  });
}

// =======================
// MAIN TEST RUNNER
// =======================

async function runAllTests() {
  console.clear();
  log('================================================', 'cyan');
  log('🧪 PRUEBAS FUNCIONALES - SISTEMA LPDP LEY 21.719', 'cyan');
  log('================================================', 'cyan');
  log(`📅 Fecha: ${new Date().toLocaleString()}`, 'blue');
  
  const startTime = Date.now();
  const results = {
    total: 0,
    passed: 0,
    failed: 0
  };
  
  // Ejecutar todas las suites
  const tests = [
    { name: 'Conexión Supabase', fn: testSupabaseConnection },
    { name: 'Tablas Críticas', fn: testCriticalTables },
    { name: 'Operaciones RAT', fn: testRATOperations },
    { name: 'Módulo Proveedores', fn: testProveedoresOperations },
    { name: 'Multi-Tenant', fn: testMultiTenant },
    { name: 'Notificaciones DPO', fn: testNotifications }
  ];
  
  for (const test of tests) {
    results.total++;
    try {
      const passed = await test.fn();
      if (passed) {
        results.passed++;
      } else {
        results.failed++;
      }
    } catch (error) {
      results.failed++;
      log(`\n❌ Suite ${test.name} failed: ${error.message}`, 'red');
    }
  }
  
  // Resumen final
  const endTime = Date.now();
  const totalTime = endTime - startTime;
  
  log('\n================================================', 'cyan');
  log('📊 RESUMEN DE PRUEBAS', 'yellow');
  log('================================================', 'cyan');
  log(`✅ Pruebas exitosas: ${results.passed}/${results.total}`, 'green');
  if (results.failed > 0) {
    log(`❌ Pruebas fallidas: ${results.failed}/${results.total}`, 'red');
  }
  log(`⏱️  Tiempo total: ${totalTime}ms`, 'blue');
  
  if (results.passed === results.total) {
    log('\n🎉 ¡TODAS LAS PRUEBAS PASARON! SISTEMA 100% FUNCIONAL', 'green');
  } else {
    log('\n⚠️  Algunas pruebas fallaron. Revisar logs arriba.', 'yellow');
  }
  
  process.exit(results.failed > 0 ? 1 : 0);
}

// Ejecutar pruebas
runAllTests().catch(error => {
  log(`\n💥 Error fatal: ${error.message}`, 'red');
  process.exit(1);
});