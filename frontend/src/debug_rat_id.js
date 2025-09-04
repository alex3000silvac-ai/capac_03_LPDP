/**
 * 🔍 SCRIPT DEBUG - Encontrar exactamente qué tabla causa error rat_id
 */
const { supabase } = require('./config/supabaseClient.js');

async function testRatIdColumns() {
  // console.log('🔍 PROBANDO COLUMNAS rat_id EN CADA TABLA...\n');
  
  const tablesToTest = [
    'actividades_dpo',
    'activities', 
    'mapeo_datos_rat',
    'inventario_rats',
    'rat_audit_trail',
    'dpo_notifications',
    'generated_documents',
    'rat_proveedores'
  ];
  
  for (const table of tablesToTest) {
    try {
      // console.log(`\n📋 Probando tabla: ${table}`);
      
      const { data, error } = await supabase
        .from(table)
        .select('rat_id')
        .limit(1);
        
      if (error) {
        if (error.code === '42P01') {
          // console.log(`  ❌ TABLA NO EXISTE: ${table}`);
        } else if (error.code === '42703') {
          // console.log(`  ❌ COLUMNA rat_id NO EXISTE en tabla ${table}`);
        } else {
          // console.log(`  ❌ ERROR: ${error.code} - ${error.message}`);
        }
      } else {
        // console.log(`  ✅ ÉXITO: tabla ${table} tiene columna rat_id`);
        // console.log(`  📊 Registros encontrados: ${data?.length || 0}`);
      }
      
    } catch (err) {
      // console.log(`  💥 EXCEPCIÓN: ${err.message}`);
    }
    
    // Pequeña pausa
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // console.log('\n🔍 AHORA PROBANDO CONSULTA ESPECÍFICA CON .eq():');
  
  try {
    const { data, error } = await supabase
      .from('actividades_dpo')
      .select('id')
      .eq('rat_id', 123)  // Usar un número de prueba
      .limit(1);
      
    if (error) {
      // console.log(`❌ ERROR EN CONSULTA .eq('rat_id', 123): ${error.code} - ${error.message}`);
    } else {
      // console.log(`✅ CONSULTA .eq('rat_id', 123) FUNCIONA - encontrados: ${data?.length || 0}`);
    }
  } catch (err) {
    // console.log(`💥 EXCEPCIÓN EN CONSULTA: ${err.message}`);
  }
}

// Ejecutar prueba
testRatIdColumns()
  .then(() => {
    // console.log('\n🎯 PRUEBA COMPLETADA');
    process.exit(0);
  })
  .catch(err => {
    console.error('\n💥 ERROR EN PRUEBA:', err);
    process.exit(1);
  });