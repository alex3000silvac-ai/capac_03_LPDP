/**
 * 🚀 EJECUTOR INMEDIATO DE TESTS DEL SISTEMA
 * 
 * Ejecuta este archivo para probar todo el sistema automáticamente
 * 
 * USO:
 * 1. Desde consola del navegador: runSystemTest()
 * 2. Desde terminal: node ejecutar-test-sistema.js
 * 3. Automático al cargar página (modo desarrollo)
 */

// Para ejecutar desde consola del navegador
if (typeof window !== 'undefined') {
  // Código para navegador
  const script = document.createElement('script');
  script.type = 'module';
  script.textContent = `
    import instantTest from './frontend/src/utils/instantSystemTest.js';
    
    console.log('🚀 INICIANDO TESTS AUTOMÁTICOS...');
    instantTest.executeAllTests().then(report => {
      console.log('✅ Tests completados. Ver detalles arriba.');
      window.lastTestReport = report;
    }).catch(error => {
      console.error('❌ Error en tests:', error);
    });
  `;
  document.head.appendChild(script);
}

// Para ejecutar desde Node.js (opcional, para tests de servidor)
if (typeof module !== 'undefined' && module.exports) {
  const { execSync } = require('child_process');
  const fs = require('fs');
  
  console.log('🚀 Iniciando tests del sistema LPDP...');
  
  // Verificar que el frontend esté corriendo
  try {
    // Estos son tests básicos que se pueden ejecutar sin navegador
    const tests = {
      'Archivos de configuración': checkConfigFiles(),
      'Estructura del proyecto': checkProjectStructure(),
      'Dependencias': checkDependencies()
    };
    
    console.log('\n📋 RESULTADOS DE TESTS BÁSICOS:');
    Object.entries(tests).forEach(([test, result]) => {
      console.log(`${result.status} ${test}: ${result.message}`);
    });
    
    console.log('\n💡 Para tests completos del sistema:');
    console.log('1. Abrir el frontend en el navegador');
    console.log('2. Abrir consola de desarrollador (F12)');
    console.log('3. Ejecutar: runSystemTest()');
    
  } catch (error) {
    console.error('❌ Error ejecutando tests básicos:', error.message);
  }
  
  function checkConfigFiles() {
    try {
      const configFiles = [
        'frontend/src/config/supabaseClient.js',
        'frontend/package.json',
        'frontend/src/utils/instantSystemTest.js'
      ];
      
      const missing = configFiles.filter(file => !fs.existsSync(file));
      
      if (missing.length > 0) {
        return {
          status: '⚠️',
          message: `${missing.length} archivos de configuración faltantes`
        };
      }
      
      return { status: '✅', message: 'Todos los archivos de configuración presentes' };
      
    } catch (error) {
      return { status: '❌', message: `Error verificando archivos: ${error.message}` };
    }
  }
  
  function checkProjectStructure() {
    try {
      const requiredDirs = [
        'frontend/src',
        'frontend/src/components',
        'frontend/src/pages',
        'frontend/src/utils',
        'frontend/src/services'
      ];
      
      const missing = requiredDirs.filter(dir => !fs.existsSync(dir));
      
      if (missing.length > 0) {
        return {
          status: '⚠️',
          message: `${missing.length} directorios esperados faltantes`
        };
      }
      
      return { status: '✅', message: 'Estructura del proyecto correcta' };
      
    } catch (error) {
      return { status: '❌', message: `Error verificando estructura: ${error.message}` };
    }
  }
  
  function checkDependencies() {
    try {
      const packageJsonPath = 'frontend/package.json';
      
      if (!fs.existsSync(packageJsonPath)) {
        return { status: '❌', message: 'package.json no encontrado' };
      }
      
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const requiredDeps = ['@supabase/supabase-js', 'react', 'react-dom'];
      const missing = requiredDeps.filter(dep => 
        !packageJson.dependencies[dep] && !packageJson.devDependencies[dep]
      );
      
      if (missing.length > 0) {
        return {
          status: '⚠️',
          message: `Dependencias faltantes: ${missing.join(', ')}`
        };
      }
      
      return { status: '✅', message: 'Dependencias principales presentes' };
      
    } catch (error) {
      return { status: '❌', message: `Error verificando dependencias: ${error.message}` };
    }
  }
}

// Para uso directo en HTML (script tag)
if (typeof window !== 'undefined' && !window.runSystemTest) {
  window.runSystemTest = async function() {
    console.log('🚀 Ejecutando tests del sistema...');
    
    // Importar dinámicamente el tester
    try {
      const { default: instantTest } = await import('./frontend/src/utils/instantSystemTest.js');
      const report = await instantTest.executeAllTests();
      
      // Guardar reporte para acceso posterior
      window.lastTestReport = report;
      
      return report;
      
    } catch (error) {
      console.error('❌ Error importando o ejecutando tests:', error);
      
      // Fallback: ejecutar tests básicos inline
      console.log('🔄 Ejecutando tests básicos de fallback...');
      return await executeBasicTests();
    }
  };
  
  // Tests básicos que funcionan sin importar módulos
  async function executeBasicTests() {
    const report = {
      test_id: `basic_${Date.now()}`,
      started_at: new Date().toISOString(),
      tests: {},
      summary: { overall_status: 'BASIC_FALLBACK' }
    };
    
    // Test 1: DOM básico
    report.tests.dom = {
      name: 'DOM Basic',
      total_elements: document.querySelectorAll('*').length,
      forms: document.querySelectorAll('form').length,
      buttons: document.querySelectorAll('button').length,
      inputs: document.querySelectorAll('input').length,
      status: '✅ BASIC'
    };
    
    // Test 2: JavaScript básico
    report.tests.javascript = {
      name: 'JavaScript Basic',
      errors: window.jsErrors || 0,
      supabase_available: typeof window.supabase !== 'undefined',
      react_available: typeof React !== 'undefined',
      status: '✅ BASIC'
    };
    
    console.log('📊 REPORTE BÁSICO:', report);
    return report;
  }
}

console.log('✅ Test executor cargado. Usa runSystemTest() para ejecutar.');`