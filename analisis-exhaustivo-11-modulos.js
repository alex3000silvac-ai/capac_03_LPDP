/**
 * 🔍 ANÁLISIS EXHAUSTIVO DE LOS 11 MÓDULOS DEL SISTEMA LPDP
 * ==========================================================
 * 
 * Script que analiza cada uno de los 11 módulos principales:
 * 1. Constructor RAT
 * 2. Gestión RAT existentes  
 * 3. Métricas de compliance
 * 4. Módulo DPO
 * 5. Módulo DPIA/PIA
 * 6. Lista EIPDs guardadas
 * 7. Módulo de proveedores
 * 8. Panel administrativo
 * 9. Generador DPA
 * 10. Centro de notificaciones
 * 11. Generador de reportes
 */

const fs = require('fs');

/**
 * 📊 REGISTRO DEL ANÁLISIS
 */
const moduleAnalysis = {
  timestamp: new Date().toISOString(),
  totalModules: 11,
  analyzedModules: 0,
  modules: {},
  crossReferences: {},
  summary: {}
};

/**
 * 🗂️ CONFIGURACIÓN DE MÓDULOS
 */
const MODULE_CONFIG = {
  'modulo_1_rat_constructor': {
    name: 'Constructor de RAT',
    description: 'Módulo para crear nuevas actividades de tratamiento',
    files: [
      'frontend/src/components/RATSystemProfessional.js',
      'frontend/src/services/ratService.js',
      'frontend/src/components/RATFormWithCompliance.js'
    ],
    functionality: 'Permite crear y configurar nuevos RATs con validaciones de compliance',
    priority: 'CRÍTICO'
  },
  'modulo_2_gestion_rats': {
    name: 'Gestión RATs Existentes',
    description: 'Módulo para listar, editar y administrar RATs existentes',
    files: [
      'frontend/src/pages/RATListPage.js',
      'frontend/src/components/RATListPage.js',
      'frontend/src/pages/RATEditPage.js',
      'frontend/src/components/RATEditPage.js'
    ],
    functionality: 'Lista, filtra, edita y administra RATs existentes',
    priority: 'CRÍTICO'
  },
  'modulo_3_metricas_compliance': {
    name: 'Métricas de Compliance',
    description: 'Dashboard con métricas y KPIs de cumplimiento',
    files: [
      'frontend/src/components/ComplianceMetrics.js',
      'frontend/src/components/ComplianceDashboard.js'
    ],
    functionality: 'Muestra estadísticas y métricas de compliance del sistema',
    priority: 'ALTO'
  },
  'modulo_4_dpo': {
    name: 'Módulo DPO',
    description: 'Herramientas específicas para el Data Protection Officer',
    files: [
      'frontend/src/pages/DashboardDPO.js',
      'frontend/src/pages/DPOApprovalQueue.js'
    ],
    functionality: 'Dashboard y cola de aprobación para el DPO',
    priority: 'ALTO'
  },
  'modulo_5_dpia_algorithms': {
    name: 'Módulo DPIA/PIA',
    description: 'Evaluaciones de Impacto en Protección de Datos',
    files: [
      'frontend/src/pages/DPIAAlgoritmos.js',
      'frontend/src/pages/EIPDCreator.js',
      'frontend/src/components/ModuloEIPD.js'
    ],
    functionality: 'Crea y gestiona evaluaciones de impacto de privacidad',
    priority: 'ALTO'
  },
  'modulo_6_eipd_list': {
    name: 'Lista EIPDs Guardadas',
    description: 'Gestión de Evaluaciones de Impacto guardadas',
    files: [
      'frontend/src/pages/EIPDListPage.js',
      'frontend/src/components/EIPDTemplates.js'
    ],
    functionality: 'Lista y administra EIPDs creadas previamente',
    priority: 'MEDIO'
  },
  'modulo_7_proveedores': {
    name: 'Módulo de Proveedores',
    description: 'Gestión de proveedores y terceros',
    files: [
      'frontend/src/pages/ProviderManager.js',
      'frontend/src/components/ProviderManager.js',
      'frontend/src/components/GestionProveedores.js',
      'frontend/src/services/proveedoresService.js'
    ],
    functionality: 'Registra y administra proveedores externos',
    priority: 'ALTO'
  },
  'modulo_8_admin_panel': {
    name: 'Panel Administrativo',
    description: 'Herramientas de administración del sistema',
    files: [
      'frontend/src/pages/AdminDashboard.js',
      'frontend/src/components/AdminDashboard.js',
      'frontend/src/pages/AdminPanel.js'
    ],
    functionality: 'Configuración y administración general del sistema',
    priority: 'ALTO'
  },
  'modulo_9_dpa_generator': {
    name: 'Generador DPA',
    description: 'Generación de acuerdos de procesamiento de datos',
    files: [
      'frontend/src/components/DPAGenerator.js'
    ],
    functionality: 'Genera documentos DPA automáticamente',
    priority: 'MEDIO'
  },
  'modulo_10_notifications': {
    name: 'Centro de Notificaciones',
    description: 'Sistema de notificaciones y alertas',
    files: [
      'frontend/src/components/NotificationCenter.js'
    ],
    functionality: 'Gestiona notificaciones del sistema y usuarios',
    priority: 'MEDIO'
  },
  'modulo_11_reports': {
    name: 'Generador de Reportes',
    description: 'Generación de reportes y documentos',
    files: [
      'frontend/src/components/ReportGenerator.js'
    ],
    functionality: 'Crea reportes personalizados del sistema',
    priority: 'MEDIO'
  }
};

/**
 * 📖 Leer y analizar archivo
 */
function analyzeFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return {
        exists: false,
        error: 'Archivo no encontrado',
        path: filePath
      };
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    return {
      exists: true,
      path: filePath,
      lines: lines.length,
      size: content.length,
      functions: extractFunctions(content),
      imports: extractImports(content),
      exports: extractExports(content),
      stateUsage: extractStateUsage(content),
      supabaseCalls: extractSupabaseCalls(content),
      componentStructure: extractComponentStructure(content)
    };
  } catch (error) {
    return {
      exists: false,
      error: error.message,
      path: filePath
    };
  }
}

/**
 * 🔍 Extraer funciones del código
 */
function extractFunctions(content) {
  const functions = [];
  
  // Buscar funciones de componente React
  const componentMatches = content.match(/(?:function|const)\s+([A-Z][a-zA-Z0-9]*)\s*(?:=|\()/g);
  if (componentMatches) {
    componentMatches.forEach(match => {
      const name = match.match(/(?:function|const)\s+([A-Z][a-zA-Z0-9]*)/)?.[1];
      if (name) functions.push({ name, type: 'component' });
    });
  }
  
  // Buscar funciones normales
  const functionMatches = content.match(/(?:function|const)\s+([a-z][a-zA-Z0-9]*)\s*(?:=|\()/g);
  if (functionMatches) {
    functionMatches.forEach(match => {
      const name = match.match(/(?:function|const)\s+([a-z][a-zA-Z0-9]*)/)?.[1];
      if (name) functions.push({ name, type: 'function' });
    });
  }
  
  // Buscar useEffect, useState, etc.
  const hookMatches = content.match(/use[A-Z][a-zA-Z0-9]*\s*\(/g);
  if (hookMatches) {
    hookMatches.forEach(match => {
      const name = match.replace(/\s*\(/g, '');
      functions.push({ name, type: 'hook' });
    });
  }
  
  return functions;
}

/**
 * 📥 Extraer imports
 */
function extractImports(content) {
  const imports = [];
  const importLines = content.match(/import\s+.*?\s+from\s+['"`].*?['"`];?/g);
  
  if (importLines) {
    importLines.forEach(line => {
      const fromMatch = line.match(/from\s+['"`]([^'"`]+)['"`]/);
      const importMatch = line.match(/import\s+([^from]+)\s+from/);
      
      if (fromMatch && importMatch) {
        imports.push({
          what: importMatch[1].trim(),
          from: fromMatch[1],
          type: fromMatch[1].startsWith('.') ? 'local' : 'external'
        });
      }
    });
  }
  
  return imports;
}

/**
 * 📤 Extraer exports
 */
function extractExports(content) {
  const exports = [];
  
  const exportMatches = content.match(/export\s+(?:default\s+)?(?:function\s+)?([a-zA-Z0-9_]+)/g);
  if (exportMatches) {
    exportMatches.forEach(match => {
      const name = match.replace(/export\s+(?:default\s+)?(?:function\s+)?/, '');
      exports.push(name);
    });
  }
  
  return exports;
}

/**
 * 🔄 Extraer uso de estado
 */
function extractStateUsage(content) {
  const stateUsage = {
    useState: (content.match(/useState\s*\(/g) || []).length,
    useEffect: (content.match(/useEffect\s*\(/g) || []).length,
    useContext: (content.match(/useContext\s*\(/g) || []).length,
    useReducer: (content.match(/useReducer\s*\(/g) || []).length
  };
  
  return stateUsage;
}

/**
 * 🗄️ Extraer llamados Supabase
 */
function extractSupabaseCalls(content) {
  const calls = {
    from: (content.match(/\.from\s*\(/g) || []).length,
    select: (content.match(/\.select\s*\(/g) || []).length,
    insert: (content.match(/\.insert\s*\(/g) || []).length,
    update: (content.match(/\.update\s*\(/g) || []).length,
    delete: (content.match(/\.delete\s*\(/g) || []).length,
    total: 0
  };
  
  calls.total = calls.from + calls.select + calls.insert + calls.update + calls.delete;
  return calls;
}

/**
 * 🏗️ Extraer estructura del componente
 */
function extractComponentStructure(content) {
  return {
    isReactComponent: content.includes('import React') || content.includes('from \'react\''),
    hasJSX: content.includes('return (') && (content.includes('<') || content.includes('/>')),
    hasProps: content.includes('props') || content.includes('({') || content.includes('}='),
    hasState: content.includes('useState') || content.includes('setState'),
    hasEffects: content.includes('useEffect'),
    isHook: /export\s+(?:default\s+)?function\s+use[A-Z]/.test(content)
  };
}

/**
 * 🔍 Analizar módulo completo
 */
function analyzeModule(moduleKey, moduleConfig) {
  console.log(`🔍 Analizando ${moduleConfig.name}...`);
  
  const moduleResult = {
    name: moduleConfig.name,
    description: moduleConfig.description,
    functionality: moduleConfig.functionality,
    priority: moduleConfig.priority,
    files: [],
    totalLines: 0,
    totalSize: 0,
    totalFunctions: 0,
    totalSupabaseCalls: 0,
    existingFiles: 0,
    missingFiles: 0,
    complexity: 'LOW',
    healthStatus: 'UNKNOWN',
    recommendations: []
  };
  
  moduleConfig.files.forEach(filePath => {
    const fullPath = `/mnt/c/Pasc/Proyecto_Derecho_Digital/Desarrollos/Intro_LPDP/${filePath}`;
    const analysis = analyzeFile(fullPath);
    
    moduleResult.files.push(analysis);
    
    if (analysis.exists) {
      moduleResult.existingFiles++;
      moduleResult.totalLines += analysis.lines;
      moduleResult.totalSize += analysis.size;
      moduleResult.totalFunctions += analysis.functions?.length || 0;
      moduleResult.totalSupabaseCalls += analysis.supabaseCalls?.total || 0;
    } else {
      moduleResult.missingFiles++;
    }
  });
  
  // Calcular complejidad
  if (moduleResult.totalLines > 500) {
    moduleResult.complexity = 'HIGH';
  } else if (moduleResult.totalLines > 200) {
    moduleResult.complexity = 'MEDIUM';
  }
  
  // Calcular estado de salud
  const fileRatio = moduleResult.existingFiles / moduleConfig.files.length;
  if (fileRatio === 1) {
    moduleResult.healthStatus = 'HEALTHY';
  } else if (fileRatio >= 0.5) {
    moduleResult.healthStatus = 'PARTIAL';
  } else {
    moduleResult.healthStatus = 'CRITICAL';
  }
  
  // Generar recomendaciones
  if (moduleResult.missingFiles > 0) {
    moduleResult.recommendations.push(`Crear ${moduleResult.missingFiles} archivo(s) faltante(s)`);
  }
  if (moduleResult.totalSupabaseCalls === 0 && moduleConfig.priority === 'CRÍTICO') {
    moduleResult.recommendations.push('Implementar conexión con base de datos');
  }
  if (moduleResult.totalFunctions === 0) {
    moduleResult.recommendations.push('Implementar funcionalidad básica');
  }
  
  console.log(`   ✅ ${moduleConfig.name}: ${moduleResult.existingFiles}/${moduleConfig.files.length} archivos, ${moduleResult.totalLines} líneas`);
  
  return moduleResult;
}

/**
 * 🚀 EJECUCIÓN PRINCIPAL
 */
async function executeModuleAnalysis() {
  console.log('🚀 INICIANDO ANÁLISIS EXHAUSTIVO DE LOS 11 MÓDULOS');
  console.log('==================================================');
  
  const startTime = new Date();
  
  // Analizar cada módulo
  Object.keys(MODULE_CONFIG).forEach(moduleKey => {
    const moduleConfig = MODULE_CONFIG[moduleKey];
    const analysis = analyzeModule(moduleKey, moduleConfig);
    
    moduleAnalysis.modules[moduleKey] = analysis;
    moduleAnalysis.analyzedModules++;
  });
  
  const endTime = new Date();
  const executionTime = endTime - startTime;
  
  // Generar resumen
  const totalFiles = Object.values(moduleAnalysis.modules).reduce((sum, module) => sum + module.files.length, 0);
  const existingFiles = Object.values(moduleAnalysis.modules).reduce((sum, module) => sum + module.existingFiles, 0);
  const totalLines = Object.values(moduleAnalysis.modules).reduce((sum, module) => sum + module.totalLines, 0);
  const totalFunctions = Object.values(moduleAnalysis.modules).reduce((sum, module) => sum + module.totalFunctions, 0);
  const totalSupabaseCalls = Object.values(moduleAnalysis.modules).reduce((sum, module) => sum + module.totalSupabaseCalls, 0);
  
  const healthyModules = Object.values(moduleAnalysis.modules).filter(m => m.healthStatus === 'HEALTHY').length;
  const partialModules = Object.values(moduleAnalysis.modules).filter(m => m.healthStatus === 'PARTIAL').length;
  const criticalModules = Object.values(moduleAnalysis.modules).filter(m => m.healthStatus === 'CRITICAL').length;
  
  moduleAnalysis.summary = {
    executionTime: `${executionTime}ms`,
    totalModules: moduleAnalysis.totalModules,
    analyzedModules: moduleAnalysis.analyzedModules,
    totalFiles: totalFiles,
    existingFiles: existingFiles,
    missingFiles: totalFiles - existingFiles,
    fileCompleteness: ((existingFiles / totalFiles) * 100).toFixed(2) + '%',
    totalLines: totalLines,
    totalFunctions: totalFunctions,
    totalSupabaseCalls: totalSupabaseCalls,
    healthDistribution: {
      healthy: healthyModules,
      partial: partialModules,
      critical: criticalModules
    },
    overallHealth: healthyModules > (moduleAnalysis.totalModules / 2) ? 'BUENO' : 
                   partialModules > criticalModules ? 'REGULAR' : 'CRÍTICO'
  };
  
  // Guardar reporte
  const outputPath = `ANALISIS_EXHAUSTIVO_11_MODULOS_${Date.now()}.json`;
  fs.writeFileSync(outputPath, JSON.stringify(moduleAnalysis, null, 2));
  
  console.log('\n📊 ANÁLISIS EXHAUSTIVO COMPLETADO');
  console.log('=================================');
  console.log(`📁 Archivos analizados: ${existingFiles}/${totalFiles} (${moduleAnalysis.summary.fileCompleteness})`);
  console.log(`📄 Líneas de código totales: ${totalLines.toLocaleString()}`);
  console.log(`🔧 Funciones encontradas: ${totalFunctions}`);
  console.log(`🗄️ Llamados Supabase: ${totalSupabaseCalls}`);
  console.log(`🏥 Módulos saludables: ${healthyModules}/${moduleAnalysis.totalModules}`);
  console.log(`⚠️ Módulos parciales: ${partialModules}/${moduleAnalysis.totalModules}`);
  console.log(`🚨 Módulos críticos: ${criticalModules}/${moduleAnalysis.totalModules}`);
  console.log(`📊 Salud general: ${moduleAnalysis.summary.overallHealth}`);
  console.log(`⏱️ Tiempo ejecución: ${moduleAnalysis.summary.executionTime}`);
  console.log(`💾 Reporte guardado: ${outputPath}`);
  
  // Mostrar módulos críticos
  const criticalModulesList = Object.entries(moduleAnalysis.modules)
    .filter(([key, module]) => module.healthStatus === 'CRITICAL')
    .map(([key, module]) => module.name);
    
  if (criticalModulesList.length > 0) {
    console.log('\n🚨 MÓDULOS CRÍTICOS:');
    criticalModulesList.forEach((name, index) => {
      console.log(`   ${index + 1}. ${name}`);
    });
  }
  
  return moduleAnalysis;
}

// Ejecutar si es el archivo principal
if (require.main === module) {
  executeModuleAnalysis()
    .then(results => {
      console.log('\n✅ ANÁLISIS EXHAUSTIVO COMPLETADO EXITOSAMENTE');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Error en análisis exhaustivo:', error);
      process.exit(1);
    });
}

module.exports = executeModuleAnalysis;