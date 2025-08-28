// 🧹 SCRIPT PARA LIMPIAR SISTEMA COMPLETO
// Ejecutar en consola del navegador antes de comenzar pruebas

console.log('🧹 INICIANDO LIMPIEZA COMPLETA DEL SISTEMA...');

// ============================================
// 1. LIMPIAR LOCALSTORAGE COMPLETO
// ============================================

console.log('📱 Limpiando localStorage...');
localStorage.clear();
console.log('✅ localStorage limpiado');

// ============================================
// 2. LIMPIAR SESSIONSTORAGE 
// ============================================

console.log('📱 Limpiando sessionStorage...');
sessionStorage.clear();
console.log('✅ sessionStorage limpiado');

// ============================================
// 3. LIMPIAR COOKIES DEL DOMINIO
// ============================================

console.log('🍪 Limpiando cookies...');
document.cookie.split(";").forEach(function(c) { 
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
});
console.log('✅ Cookies limpiadas');

// ============================================
// 4. LIMPIAR CACHÉ DE SUPABASE
// ============================================

console.log('🗄️ Limpiando caché Supabase...');
// Eliminar claves específicas de Supabase
const supabaseKeys = [
    'supabase.auth.token',
    'sb-auth-token', 
    'supabase.gotrue.session',
    'tenant_id',
    'current_user',
    'auth_user'
];

supabaseKeys.forEach(key => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
});
console.log('✅ Caché Supabase limpiado');

// ============================================
// 5. VERIFICAR LIMPIEZA
// ============================================

console.log('🔍 Verificando limpieza...');
const remainingKeys = Object.keys(localStorage).length + Object.keys(sessionStorage).length;
console.log(`📊 Claves restantes: ${remainingKeys}`);

if (remainingKeys === 0) {
    console.log('✅ LIMPIEZA COMPLETA EXITOSA');
} else {
    console.log('⚠️ Algunas claves persisten:', [...Object.keys(localStorage), ...Object.keys(sessionStorage)]);
}

// ============================================
// 6. PREPARAR PARA PRUEBAS
// ============================================

console.log('🎯 SISTEMA PREPARADO PARA PRUEBAS');
console.log('📋 PRÓXIMOS PASOS:');
console.log('   1. Recargar página completamente (Ctrl+F5)');
console.log('   2. Verificar redirección a /login');
console.log('   3. Comenzar TEST_TECHSTART_SPA_COMPLETO.md');
console.log('   4. Usar credenciales: admin@techstart.cl');

// ============================================
// 7. FORZAR RECARGA LIMPIA
// ============================================

console.log('🔄 Forzando recarga limpia en 3 segundos...');
setTimeout(() => {
    window.location.href = window.location.origin + '/login?clean=1';
}, 3000);

// ============================================
// RESULTADO ESPERADO
// ============================================

/*
🎯 AL EJECUTAR ESTE SCRIPT:

✅ Todo el estado del navegador limpio
✅ Sin sesiones previas de Supabase  
✅ Sin datos residuales en localStorage
✅ Sistema forzado a mostrar login
✅ Estado predecible para pruebas

🚨 IMPORTANTE:
- Ejecutar ANTES de cada ronda de pruebas
- Confirmar recarga completa de página
- Verificar que aparece pantalla login
- No usar datos del navegador previos
*/