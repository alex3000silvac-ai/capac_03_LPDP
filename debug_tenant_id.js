// 🔍 SCRIPT DE DEBUG PARA INVESTIGAR TENANT_ID MISMATCH
// Analiza la discrepancia entre tenant_id usado en SQL vs el sistema

console.log('🔍 INVESTIGACIÓN TENANT_ID MISMATCH');
console.log('=====================================');

console.log('\n📋 INFORMACIÓN DEL PROBLEMA:');
console.log('- Usuario: juridica (admin@juridicadigital.cl)');
console.log('- URL: https://scldp-frontend.onrender.com/gestion-proveedores');  
console.log('- Problema: Solo ve 2 proveedores cuando cargamos 15');
console.log('- SQL ejecutado: CARGAR_15_PROVEEDORES_JURIDICA_DIGITAL.sql');
console.log('- Tenant en SQL: "juridica_digital"');

console.log('\n🔍 ANÁLISIS DE CÓDIGO:');

console.log('\n1. AUTHCONTEXT (líneas 37, 68, 112):');
console.log('   tenant_id: session.user.user_metadata?.tenant_id || "default"');
console.log('   organizacion_id: session.user.user_metadata?.organizacion_id || "default"');
console.log('   ❗ FALLBACK A "default" si no hay metadata');

console.log('\n2. TENANTCONTEXT (línea 142):');
console.log('   localStorage.setItem("tenant_id", selectedTenant.id);');
console.log('   ❗ Usa el ID de la organización de Supabase, no metadata del usuario');

console.log('\n3. PROVEEDORES SERVICE (líneas 8-11):');
console.log('   getCurrentTenant() {');
console.log('     const user = JSON.parse(localStorage.getItem("user") || "{}");');
console.log('     return user?.tenant_id || user?.organizacion_id || "demo";');
console.log('   }');
console.log('   ❗ Busca en localStorage["user"], NO en localStorage["tenant_id"]');

console.log('\n4. GESTIONPROVEEDORES (líneas 138, 194, 216):');
console.log('   tenant_id: user?.organizacion_id || "demo"');
console.log('   ❗ Usa user.organizacion_id directamente');

console.log('\n🚨 DISCREPANCIA IDENTIFICADA:');
console.log('===============================');
console.log('SQL usa:           "juridica_digital"');
console.log('Sistema busca en:  localStorage["user"].tenant_id o user.organizacion_id');
console.log('TenantContext usa: selectedTenant.id (de tabla organizaciones)');
console.log('AuthContext usa:   user_metadata.tenant_id (de Supabase Auth)');

console.log('\n📊 POSIBLES VALORES REALES:');
console.log('- localStorage["tenant_id"]: (valor del TenantContext)');
console.log('- localStorage["user"].tenant_id: (valor del AuthContext)');  
console.log('- localStorage["user"].organizacion_id: (valor del AuthContext)');
console.log('- user_metadata en Supabase: (tenant_id definido en signup)');

console.log('\n🎯 CAUSA RAÍZ PROBABLE:');
console.log('======================');
console.log('1. El usuario fue creado con tenant_id diferente a "juridica_digital"');
console.log('2. O no tiene user_metadata.tenant_id definido (usa "default")');
console.log('3. O la organización en tabla tiene ID diferente');
console.log('4. ProveedoresService.getCurrentTenant() está leyendo valor incorrecto');

console.log('\n✅ SOLUCIÓN RECOMENDADA:');
console.log('========================');
console.log('1. Verificar user_metadata del usuario admin@juridicadigital.cl');
console.log('2. Verificar ID de la organización en tabla organizaciones');  
console.log('3. Unificar el tenant_id en todas las fuentes');
console.log('4. Actualizar SQL para usar el tenant_id real del sistema');

console.log('\n🔧 COMANDOS DE VERIFICACIÓN:');
console.log('============================');
console.log('// En browser console:');
console.log('localStorage.getItem("user")');
console.log('localStorage.getItem("tenant_id")');
console.log('localStorage.getItem("lpdp_current_tenant")');
console.log('');
console.log('-- En Supabase:');  
console.log('SELECT raw_user_meta_data FROM auth.users WHERE email = "admin@juridicadigital.cl";');
console.log('SELECT id, company_name FROM organizaciones WHERE user_id IN (');
console.log('  SELECT id FROM auth.users WHERE email = "admin@juridicadigital.cl"');
console.log(');');