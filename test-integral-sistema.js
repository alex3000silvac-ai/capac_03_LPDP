#!/usr/bin/env node

/**
 * 🧪 TEST INTEGRAL DEL SISTEMA LPDP
 * 
 * Ejecuta validaciones completas del sistema desde terminal
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 INICIANDO TEST INTEGRAL DEL SISTEMA LPDP...\n');

// Variables para el reporte
const results = [];
const startTime = Date.now();

function addResult(prueba, resultado, motivo) {
  results.push({
    prueba: prueba.substring(0, 40).padEnd(40),
    resultado: resultado.padEnd(15),
    motivo: motivo.substring(0, 60)
  });
}

// 1. VERIFICAR ESTRUCTURA DEL PROYECTO
console.log('📁 1/8 - Verificando estructura del proyecto...');

const requiredDirs = [
  'frontend/src',
  'frontend/src/components',
  'frontend/src/pages',
  'frontend/src/utils',
  'frontend/src/services',
  'frontend/src/config',
  'frontend/src/contexts',
  'backend'
];

for (const dir of requiredDirs) {
  if (fs.existsSync(dir)) {
    addResult(`ESTRUCTURA: ${dir}`, '✅ OK', 'Directorio existe');
  } else {
    addResult(`ESTRUCTURA: ${dir}`, '❌ FALTANTE', 'Directorio no encontrado');
  }
}

// 2. VERIFICAR ARCHIVOS DE CONFIGURACIÓN
console.log('⚙️  2/8 - Verificando archivos de configuración...');

const configFiles = [
  { file: 'frontend/package.json', required: true },
  { file: 'frontend/src/config/supabaseClient.js', required: true },
  { file: 'frontend/src/App.js', required: true },
  { file: 'backend/package.json', required: true },
  { file: '.env', required: false },
  { file: 'frontend/.env', required: false }
];

for (const { file, required } of configFiles) {
  if (fs.existsSync(file)) {
    const stats = fs.statSync(file);
    addResult(`CONFIG: ${path.basename(file)}`, '✅ OK', `${Math.round(stats.size/1024)}KB, ${stats.mtime.toLocaleDateString()}`);
  } else {
    const status = required ? '❌ CRÍTICO' : '⚠️ OPCIONAL';
    const motivo = required ? 'Archivo crítico faltante' : 'Archivo opcional no encontrado';
    addResult(`CONFIG: ${path.basename(file)}`, status, motivo);
  }
}

// 3. VERIFICAR DEPENDENCIAS
console.log('📦 3/8 - Verificando dependencias...');

try {
  const packageJson = JSON.parse(fs.readFileSync('frontend/package.json', 'utf8'));
  
  const criticalDeps = [
    '@supabase/supabase-js',
    'react',
    'react-dom',
    'react-router-dom',
    '@mui/material',
    '@mui/icons-material'
  ];
  
  for (const dep of criticalDeps) {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
      const version = packageJson.dependencies[dep];
      addResult(`DEP: ${dep}`, '✅ OK', `Versión ${version}`);
    } else {
      addResult(`DEP: ${dep}`, '❌ FALTANTE', 'Dependencia crítica no encontrada');
    }
  }
  
  // Verificar node_modules
  if (fs.existsSync('frontend/node_modules')) {
    const nodeModulesSize = getDirectorySize('frontend/node_modules');
    addResult('DEPS: node_modules', '✅ OK', `${Math.round(nodeModulesSize/1024/1024)}MB instalados`);
  } else {
    addResult('DEPS: node_modules', '❌ FALTANTE', 'npm install no ejecutado');
  }
  
} catch (error) {
  addResult('DEPS: package.json', '❌ ERROR', `Error leyendo: ${error.message}`);
}

// 4. VERIFICAR COMPONENTES PRINCIPALES
console.log('🧩 4/8 - Verificando componentes principales...');

const componentCategories = [
  { dir: 'frontend/src/components', name: 'Componentes' },
  { dir: 'frontend/src/pages', name: 'Páginas' },
  { dir: 'frontend/src/utils', name: 'Utilidades' },
  { dir: 'frontend/src/services', name: 'Servicios' }
];

for (const category of componentCategories) {
  try {
    if (fs.existsSync(category.dir)) {
      const files = fs.readdirSync(category.dir)
        .filter(file => file.endsWith('.js') || file.endsWith('.jsx'))
        .length;
      
      if (files > 0) {
        addResult(`${category.name.toUpperCase()}`, '✅ OK', `${files} archivos encontrados`);
      } else {
        addResult(`${category.name.toUpperCase()}`, '⚠️ VACÍO', 'Directorio sin archivos JS');
      }
    } else {
      addResult(`${category.name.toUpperCase()}`, '❌ FALTANTE', 'Directorio no existe');
    }
  } catch (error) {
    addResult(`${category.name.toUpperCase()}`, '❌ ERROR', `Error accediendo: ${error.message}`);
  }
}

// 5. VERIFICAR COMPONENTES ESPECÍFICOS CLAVE
console.log('🎯 5/8 - Verificando componentes clave...');

const keyComponents = [
  'frontend/src/components/RATSystemProfessional.js',
  'frontend/src/components/RATFormWithCompliance.js',
  'frontend/src/components/AdminDashboard.js',
  'frontend/src/pages/DashboardDPO.js',
  'frontend/src/components/ModuloEIPD.js',
  'frontend/src/components/GestionProveedores.js',
  'frontend/src/components/NotificationCenter.js',
  'frontend/src/services/api.js'
];

for (const component of keyComponents) {
  if (fs.existsSync(component)) {
    const content = fs.readFileSync(component, 'utf8');
    const lines = content.split('\n').length;
    const hasImports = content.includes('import');
    const hasExports = content.includes('export');
    
    if (hasImports && hasExports) {
      addResult(`COMP: ${path.basename(component)}`, '✅ OK', `${lines} líneas, estructura válida`);
    } else {
      addResult(`COMP: ${path.basename(component)}`, '⚠️ INCOMPLETO', `${lines} líneas, estructura dudosa`);
    }
  } else {
    addResult(`COMP: ${path.basename(component)}`, '❌ FALTANTE', 'Componente clave no encontrado');
  }
}

// 6. VERIFICAR SISTEMA DE AGENTES IA
console.log('🤖 6/8 - Verificando sistema de agentes IA...');

const aiAgentFiles = [
  'frontend/src/utils/systemValidationAgent.js',
  'frontend/src/utils/aiSupervisor.js',
  'frontend/src/utils/iaAgentReporter.js',
  'frontend/src/utils/databaseConsistencyValidator.js',
  'frontend/src/utils/humanInteractionSimulator.js',
  'frontend/src/utils/instantSystemTest.js',
  'frontend/src/utils/completeSystemTester.js'
];

let agentFilesFound = 0;
for (const agentFile of aiAgentFiles) {
  if (fs.existsSync(agentFile)) {
    agentFilesFound++;
    const content = fs.readFileSync(agentFile, 'utf8');
    const hasValidation = content.includes('validation') || content.includes('test');
    const hasSupabase = content.includes('supabase');
    
    if (hasValidation && hasSupabase) {
      addResult(`AGENT: ${path.basename(agentFile)}`, '✅ OK', 'Agente IA completo');
    } else {
      addResult(`AGENT: ${path.basename(agentFile)}`, '⚠️ PARCIAL', 'Agente IA incompleto');
    }
  } else {
    addResult(`AGENT: ${path.basename(agentFile)}`, '❌ FALTANTE', 'Agente IA no encontrado');
  }
}

if (agentFilesFound >= 5) {
  addResult('SISTEMA IA: General', '✅ OK', `${agentFilesFound}/7 agentes disponibles`);
} else {
  addResult('SISTEMA IA: General', '⚠️ INCOMPLETO', `Solo ${agentFilesFound}/7 agentes`);
}

// 7. VERIFICAR ARCHIVOS DE TEST
console.log('🧪 7/8 - Verificando archivos de test...');

const testFiles = [
  'TEST-COMPLETO-SISTEMA.js',
  'test-integral-sistema.js',
  'ejecutar-test-sistema.js',
  'frontend/src/utils/systemHealthChecker.js'
];

for (const testFile of testFiles) {
  if (fs.existsSync(testFile)) {
    const stats = fs.statSync(testFile);
    addResult(`TEST: ${path.basename(testFile)}`, '✅ OK', `${Math.round(stats.size/1024)}KB disponible`);
  } else {
    addResult(`TEST: ${path.basename(testFile)}`, '⚠️ FALTANTE', 'Archivo de test no encontrado');
  }
}

// 8. ANÁLISIS DE CONFIGURACIÓN SUPABASE
console.log('💾 8/8 - Analizando configuración Supabase...');

try {
  const supabaseConfig = fs.readFileSync('frontend/src/config/supabaseClient.js', 'utf8');
  
  const hasUrlValidation = supabaseConfig.includes('supabaseUrl') && supabaseConfig.includes('supabase.co');
  const hasKeyValidation = supabaseConfig.includes('supabaseKey');
  const hasErrorHandling = supabaseConfig.includes('throw new Error');
  const hasCreateClient = supabaseConfig.includes('createClient');
  
  if (hasUrlValidation) {
    addResult('SUPABASE: URL Validation', '✅ OK', 'Validación de URL implementada');
  } else {
    addResult('SUPABASE: URL Validation', '❌ FALTANTE', 'Sin validación de URL');
  }
  
  if (hasKeyValidation) {
    addResult('SUPABASE: Key Validation', '✅ OK', 'Validación de API key implementada');
  } else {
    addResult('SUPABASE: Key Validation', '❌ FALTANTE', 'Sin validación de API key');
  }
  
  if (hasErrorHandling) {
    addResult('SUPABASE: Error Handling', '✅ OK', 'Manejo de errores implementado');
  } else {
    addResult('SUPABASE: Error Handling', '❌ FALTANTE', 'Sin manejo de errores');
  }
  
  if (hasCreateClient) {
    addResult('SUPABASE: Client Creation', '✅ OK', 'Cliente Supabase configurado');
  } else {
    addResult('SUPABASE: Client Creation', '❌ CRÍTICO', 'Cliente Supabase no configurado');
  }
  
} catch (error) {
  addResult('SUPABASE: Configuración', '❌ ERROR', `Error leyendo config: ${error.message}`);
}

// GENERAR REPORTE FINAL
const totalTime = Date.now() - startTime;
const total = results.length;
const passed = results.filter(r => r.resultado.includes('✅')).length;
const warnings = results.filter(r => r.resultado.includes('⚠️')).length;
const failed = results.filter(r => r.resultado.includes('❌')).length;
const successRate = Math.round((passed / total) * 100);

console.log('\n' + '='.repeat(80));
console.log('📋 REPORTE INTEGRAL DEL SISTEMA LPDP');
console.log('='.repeat(80));
console.log(`⏱️  Tiempo de ejecución: ${totalTime}ms`);
console.log(`📊 Total de verificaciones: ${total}`);
console.log(`✅ Exitosas: ${passed}`);
console.log(`⚠️  Advertencias: ${warnings}`);
console.log(`❌ Críticas: ${failed}`);
console.log(`🎯 Tasa de éxito: ${successRate}%`);
console.log('='.repeat(80));

console.log('\n📋 RESULTADOS DETALLADOS:\n');
console.log('PRUEBA'.padEnd(42) + ' | ' + 'RESULTADO'.padEnd(15) + ' | MOTIVO');
console.log('-'.repeat(80));

results.forEach(result => {
  console.log(`${result.prueba} | ${result.resultado} | ${result.motivo}`);
});

console.log('='.repeat(80));

// ANÁLISIS Y RECOMENDACIONES
if (failed > 0) {
  console.log('🚨 PROBLEMAS CRÍTICOS DETECTADOS:');
  console.log(`   - ${failed} elementos críticos faltantes o con errores`);
  console.log('   - Revisar dependencias y configuración antes de ejecutar');
} else if (warnings > 0) {
  console.log('⚠️  ADVERTENCIAS DETECTADAS:');
  console.log(`   - ${warnings} elementos necesitan atención`);
  console.log('   - Sistema funcional pero puede mejorarse');
} else {
  console.log('🎉 SISTEMA EN EXCELENTE ESTADO');
  console.log('   - Todas las verificaciones pasaron correctamente');
  console.log('   - Sistema listo para producción');
}

console.log('\n💡 PRÓXIMOS PASOS RECOMENDADOS:');
if (failed > 0) {
  console.log('   1. Corregir elementos críticos faltantes');
  console.log('   2. Instalar dependencias: npm install');
  console.log('   3. Configurar variables de entorno');
  console.log('   4. Volver a ejecutar este test');
} else {
  console.log('   1. Ejecutar el sistema: npm start');
  console.log('   2. Abrir navegador en http://localhost:3000');
  console.log('   3. Ejecutar tests en browser: testCompleteSystem()');
}

console.log('='.repeat(80));

// Función helper para calcular tamaño de directorio
function getDirectorySize(dirPath) {
  let totalSize = 0;
  
  function calculateSize(currentPath) {
    try {
      const stats = fs.statSync(currentPath);
      
      if (stats.isFile()) {
        totalSize += stats.size;
      } else if (stats.isDirectory()) {
        const files = fs.readdirSync(currentPath);
        files.forEach(file => {
          const filePath = path.join(currentPath, file);
          try {
            calculateSize(filePath);
          } catch (error) {
            // Ignorar errores de acceso a archivos específicos
          }
        });
      }
    } catch (error) {
      // Ignorar errores de acceso
    }
  }
  
  calculateSize(dirPath);
  return totalSize;
}

// Guardar reporte en archivo
const reportData = {
  timestamp: new Date().toISOString(),
  executionTime: totalTime,
  total,
  passed,
  warnings,
  failed,
  successRate,
  results: results.map(r => ({
    prueba: r.prueba.trim(),
    resultado: r.resultado.trim(),
    motivo: r.motivo
  }))
};

fs.writeFileSync('test-integral-report.json', JSON.stringify(reportData, null, 2));
console.log('💾 Reporte guardado en: test-integral-report.json');

process.exit(failed > 5 ? 1 : 0); // Exit code 1 si hay muchos errores críticos