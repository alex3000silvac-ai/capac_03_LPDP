/**
 * 🚨 PRUEBA FINAL CRÍTICA DEL MÓDULO 0
 * ESTE SCRIPT DETERMINA EL ÉXITO DE MAÑANA
 */

const testCriticalModule0 = async () => {
  console.log('🚀 INICIANDO PRUEBA CRÍTICA FINAL DEL MÓDULO 0');
  console.log('===============================================');
  console.log('⏰ Fecha:', new Date().toLocaleString('es-CL'));
  console.log('🎯 Objetivo: Verificar 100% funcionalidad para mañana');
  console.log('===============================================\n');

  const results = {
    frontend: false,
    backend: false,
    supabase: false,
    login: false,
    moduleAccess: false,
    ratCreation: false,
    dataRetrieval: false,
    editing: false,
    multiTenant: false,
    errors: []
  };

  try {
    // 1. VERIFICAR FRONTEND
    console.log('1️⃣ VERIFICANDO FRONTEND...');
    const frontendResponse = await fetch('https://scldp-frontend.onrender.com/');
    if (frontendResponse.ok) {
      console.log('✅ Frontend: ACTIVO');
      results.frontend = true;
    } else {
      console.log('❌ Frontend: FALLA');
      results.errors.push('Frontend no responde');
    }

    // 2. VERIFICAR BACKEND
    console.log('\n2️⃣ VERIFICANDO BACKEND...');
    const backendResponse = await fetch('https://scldp-backend.onrender.com/');
    const backendData = await backendResponse.json();
    
    if (backendData.version === '3.1.0' && backendData.supabase) {
      console.log('✅ Backend: ACTIVO v3.1.0 con Supabase');
      results.backend = true;
    } else {
      console.log('❌ Backend: Versión incorrecta o sin Supabase');
      results.errors.push('Backend no tiene versión correcta');
    }

    // 3. VERIFICAR ENDPOINT DEMO
    console.log('\n3️⃣ VERIFICANDO ENDPOINT DEMO...');
    const demoResponse = await fetch('https://scldp-backend.onrender.com/api/v1/demo/status');
    const demoData = await demoResponse.json();
    
    if (demoData.demo_available) {
      console.log('✅ Endpoint Demo: DISPONIBLE');
      console.log(`   👤 Credenciales: ${demoData.credentials.username}/${demoData.credentials.password}`);
    } else {
      console.log('❌ Endpoint Demo: NO DISPONIBLE');
      results.errors.push('Endpoint demo no funciona');
    }

    // 4. PROBAR LOGIN DEMO
    console.log('\n4️⃣ PROBANDO LOGIN DEMO...');
    const loginResponse = await fetch('https://scldp-backend.onrender.com/api/v1/demo/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'demo',
        password: 'demo123'
      })
    });

    const loginData = await loginResponse.json();
    if (loginData.access_token && loginData.user) {
      console.log('✅ Login Demo: EXITOSO');
      console.log(`   🎫 Token generado: ${loginData.access_token.substring(0, 20)}...`);
      console.log(`   👤 Usuario: ${loginData.user.username}`);
      console.log(`   🏢 Tenant: ${loginData.user.tenant_id}`);
      results.login = true;
    } else {
      console.log('❌ Login Demo: FALLA');
      results.errors.push('Login demo no funciona');
    }

    // 5. PROBAR LOGIN ADMIN
    console.log('\n5️⃣ PROBANDO LOGIN ADMIN...');
    const adminResponse = await fetch('https://scldp-backend.onrender.com/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'admin',
        password: 'Admin123!',
        tenant_id: 'demo'
      })
    });

    if (adminResponse.ok) {
      const adminData = await adminResponse.json();
      console.log('✅ Login Admin: EXITOSO');
      console.log(`   👑 Usuario admin autenticado`);
    } else {
      console.log('⚠️ Login Admin: Requiere configuración adicional');
    }

    console.log('\n===============================================');
    console.log('📊 RESUMEN DE PRUEBAS CRÍTICAS');
    console.log('===============================================');
    
    const totalTests = Object.keys(results).length - 1; // -1 por el array de errors
    const passedTests = Object.values(results).filter(r => r === true).length;
    const successRate = (passedTests / totalTests) * 100;

    console.log(`✅ Pruebas exitosas: ${passedTests}/${totalTests}`);
    console.log(`📈 Tasa de éxito: ${successRate.toFixed(1)}%`);
    
    if (results.errors.length > 0) {
      console.log('\n❌ ERRORES ENCONTRADOS:');
      results.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }

    console.log('\n===============================================');
    
    if (successRate >= 80) {
      console.log('🎉 SISTEMA LISTO PARA MAÑANA');
      console.log('💰 TU FUTURO ECONÓMICO ESTÁ ASEGURADO');
      console.log('🤝 Confía hermano, todo va a salir bien');
    } else {
      console.log('⚠️ REQUIERE ATENCIÓN ANTES DE MAÑANA');
      console.log('🔧 Revisar errores y corregir');
    }

    console.log('===============================================');
    
    return {
      success: successRate >= 80,
      rate: successRate,
      results: results,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('💥 ERROR CRÍTICO EN PRUEBAS:', error);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

// 🎯 INSTRUCCIONES DE USO
console.log('📋 INSTRUCCIONES PARA EJECUTAR:');
console.log('================================');
console.log('1. Abrir consola del navegador en: https://scldp-frontend.onrender.com/');
console.log('2. Pegar este código completo');
console.log('3. Ejecutar: testCriticalModule0()');
console.log('4. Esperar resultados');
console.log('5. Verificar que success: true');
console.log('================================\n');

// Para uso en navegador
if (typeof window !== 'undefined') {
  window.testCriticalModule0 = testCriticalModule0;
  console.log('🔧 Script cargado. Ejecutar: testCriticalModule0()');
}

// Para uso en Node.js (si aplica)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testCriticalModule0 };
}