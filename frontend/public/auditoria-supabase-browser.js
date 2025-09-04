/**
 * 🔍 AUDITORÍA SUPABASE BROWSER - EJECUTAR DESDE CONSOLA
 * 
 * INSTRUCCIONES:
 * 1. Abrir consola del navegador (F12)
 * 2. Ejecutar: window.ejecutarAuditoriaSupabase()
 * 3. Ver resultados en consola
 */

window.ejecutarAuditoriaSupabase = async function() {
  console.log('%c🔍 INICIANDO AUDITORÍA COMPLETA SUPABASE', 'color: #4fc3f7; font-size: 16px; font-weight: bold;');
  
  const resultados = {};
  const errores = [];
  
  // Obtener cliente Supabase del contexto global
  const supabase = window.supabase || (await import('/src/config/supabaseClient.js')).supabase;
  
  if (!supabase) {
    console.error('❌ Cliente Supabase no disponible');
    return;
  }

  // Tablas a probar
  const tablas = [
    'company_data_templates',
    'rats',
    'system_error_logs', 
    'organizaciones',
    'proveedores'
  ];

  for (const tabla of tablas) {
    console.log(`\n📋 === PROBANDO TABLA: ${tabla.toUpperCase()} ===`);
    
    try {
      // Test SELECT
      console.log(`🔍 Testing SELECT en ${tabla}...`);
      const { data: selectData, error: selectError } = await supabase
        .from(tabla)
        .select('*')
        .limit(1);

      if (selectError) {
        console.log(`❌ SELECT falló: ${selectError.message}`);
        console.log(`   Código: ${selectError.code}`);
        console.log(`   Detalles: ${selectError.details || 'N/A'}`);
        errores.push(`${tabla} SELECT: ${selectError.message}`);
        resultados[tabla] = { select: false, error: selectError.message };
        continue;
      } else {
        console.log(`✅ SELECT exitoso - ${selectData?.length || 0} registros`);
        if (selectData?.[0]) {
          console.log(`📊 Estructura:`, Object.keys(selectData[0]).join(', '));
        }
        resultados[tabla] = { select: true, estructura: selectData?.[0] ? Object.keys(selectData[0]) : [] };
      }

      // Test INSERT con datos dummy
      console.log(`➕ Testing INSERT en ${tabla}...`);
      const datosDummy = generarDatosDummy(tabla);
      
      const { data: insertData, error: insertError } = await supabase
        .from(tabla)
        .insert([datosDummy])
        .select();

      if (insertError) {
        console.log(`❌ INSERT falló: ${insertError.message}`);
        console.log(`   Código: ${insertError.code}`);
        errores.push(`${tabla} INSERT: ${insertError.message}`);
        resultados[tabla].insert = false;
        resultados[tabla].insertError = insertError.message;
      } else {
        console.log(`✅ INSERT exitoso`);
        resultados[tabla].insert = true;
        
        // Test DELETE para limpiar
        if (insertData?.[0]?.id) {
          console.log(`🗑️ Limpiando datos de prueba...`);
          const { error: deleteError } = await supabase
            .from(tabla)
            .delete()
            .eq('id', insertData[0].id);
          
          if (!deleteError) {
            console.log(`✅ DELETE exitoso - datos de prueba limpiados`);
            resultados[tabla].delete = true;
          } else {
            console.log(`⚠️ DELETE falló: ${deleteError.message}`);
            resultados[tabla].delete = false;
          }
        }
      }

    } catch (error) {
      console.log(`💥 Exception en tabla ${tabla}:`, error.message);
      errores.push(`${tabla} Exception: ${error.message}`);
      resultados[tabla] = { error: error.message };
    }
  }

  // Resumen final
  console.log('\n📊 ========== RESUMEN AUDITORÍA ==========');
  let funcionando = 0;
  let conProblemas = 0;

  for (const [tabla, resultado] of Object.entries(resultados)) {
    const status = resultado.select && resultado.insert ? '✅ OK' : '❌ PROBLEMAS';
    console.log(`${status} ${tabla}: SELECT=${resultado.select ? '✅' : '❌'} INSERT=${resultado.insert ? '✅' : '❌'}`);
    
    if (resultado.select && resultado.insert) {
      funcionando++;
    } else {
      conProblemas++;
    }
  }

  console.log(`\n🎯 RESULTADOS:`);
  console.log(`✅ Tablas funcionando: ${funcionando}`);
  console.log(`❌ Tablas con problemas: ${conProblemas}`);
  console.log(`🚨 Total errores: ${errores.length}`);

  if (errores.length > 0) {
    console.log('\n🚨 ERRORES ENCONTRADOS:');
    errores.forEach((error, i) => console.log(`${i+1}. ${error}`));
  }

  return { resultados, errores, resumen: { funcionando, conProblemas } };
};

function generarDatosDummy(tabla) {
  const timestamp = new Date().toISOString();
  const id = Date.now();

  const datos = {
    company_data_templates: {
      tenant_id: 1,
      template_name: `audit_test_${id}`,
      template_type: 'audit_test',
      is_active: true,
      razon_social: 'Test Audit SpA',
      rut_empresa: '12345678-9',
      direccion_empresa: 'Test 123',
      email_empresa: `test${id}@audit.cl`,
      nombre_dpo: 'Test DPO'
    },

    rats: {
      titulo: `RAT Test ${id}`,
      estado: 'borrador'
    },

    system_error_logs: {
      tenant_id: 1,
      log_level: 'INFO', 
      error_code: 'AUDIT_TEST',
      error_message: 'Test message',
      source_component: 'AUDIT',
      category: 'TEST',
      timestamp: timestamp
    },

    organizaciones: {
      nombre: `Org Test ${id}`,
      tipo: 'audit'
    },

    proveedores: {
      nombre: `Proveedor Test ${id}`,
      tipo: 'audit'
    }
  };

  return datos[tabla] || { nombre: `Test ${id}`, created_at: timestamp };
}

// Auto-ejecutar si no está en modo módulo
if (typeof window !== 'undefined') {
  console.log('%c🚀 Auditoría Supabase cargada. Ejecutar: window.ejecutarAuditoriaSupabase()', 'color: #4fc3f7;');
}