// TEST DIRECTO DE PERSISTENCIA
// Para ejecutar: cd frontend && node ../test-persistencia.js

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yntsrpibrwpnxkrobocj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InludHNycGlicndwbnhrcm9ib2NqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI5MDY3NDIsImV4cCI6MjA0ODQ4Mjc0Mn0.qqBl3FBOZcLvLXyjNRtQj0zVUDQO8aLoA-CrmwKLv-k';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testPersistencia() {
  console.log('🔍 TESTING PERSISTENCIA DE DATOS EMPRESA\n');
  
  // 1. Verificar si hay datos en company_data_templates
  console.log('1. Verificando datos existentes...');
  const { data: existing, error: readError } = await supabase
    .from('company_data_templates')
    .select('*')
    .limit(5);
  
  if (readError) {
    console.error('❌ Error leyendo:', readError);
  } else {
    console.log(`📊 Registros encontrados: ${existing.length}`);
    if (existing.length > 0) {
      console.log('📄 Ejemplo:', existing[0]);
    }
  }
  
  // 2. Intentar insertar datos de prueba
  console.log('\n2. Insertando datos de prueba...');
  const testData = {
    tenant_id: 1,
    template_name: 'test_company_data',
    template_type: 'AUTO_GENERATED',
    is_active: true,
    razon_social: 'Test Company SPA',
    rut_empresa: '12345678-9',
    email_empresa: 'test@test.com',
    nombre_responsable: 'Test User',
    email_responsable: 'test@test.com'
  };
  
  const { data: inserted, error: insertError } = await supabase
    .from('company_data_templates')
    .insert([testData])
    .select()
    .single();
  
  if (insertError) {
    console.error('❌ Error insertando:', insertError);
  } else {
    console.log('✅ Datos insertados:', inserted.id);
    
    // 3. Intentar leer los datos insertados
    console.log('\n3. Verificando datos insertados...');
    const { data: retrieved, error: retrieveError } = await supabase
      .from('company_data_templates')
      .select('*')
      .eq('template_name', 'test_company_data')
      .single();
    
    if (retrieveError) {
      console.error('❌ Error recuperando:', retrieveError);
    } else {
      console.log('✅ Datos recuperados correctamente');
      console.log('📄 Contenido:', retrieved);
    }
    
    // 4. Limpiar datos de prueba
    await supabase
      .from('company_data_templates')
      .delete()
      .eq('id', inserted.id);
    console.log('🧹 Datos de prueba eliminados');
  }
  
  // 5. Verificar estructura de tabla
  console.log('\n4. Verificando estructura tabla...');
  const { data: structure, error: structError } = await supabase
    .from('company_data_templates')
    .select('*')
    .limit(1);
  
  if (structure && structure.length > 0) {
    console.log('🏗️ Columnas disponibles:', Object.keys(structure[0]));
  }
}

testPersistencia().catch(console.error);