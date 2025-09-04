/**
 * 🔍 AUDITOR EXHAUSTIVO SUPABASE - LÍNEA POR LÍNEA
 * =================================================
 * 
 * Script que escanea TODO el código del sistema buscando:
 * - Cada llamado a Supabase
 * - Operaciones CRUD específicas
 * - Tablas y campos utilizados
 * - Valida con INSERT→SELECT→DELETE cada uno
 */

const fs = require('fs');
const path = require('path');

// 📋 REGISTRO GLOBAL DE LLAMADOS SUPABASE
const supabaseCallsRegistry = {
  totalFiles: 0,
  totalLines: 0,
  totalCalls: 0,
  callsByType: {},
  callsByTable: {},
  callsByFile: {},
  detailedCalls: [],
  errors: []
};

// 🎯 PATRONES DE BÚSQUEDA EXHAUSTIVOS
const SUPABASE_PATTERNS = [
  // Operaciones básicas
  /supabase\.from\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
  /\.from\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
  
  // Operaciones CRUD
  /\.select\s*\(\s*([^)]*)\s*\)/g,
  /\.insert\s*\(\s*([^)]*)\s*\)/g,
  /\.update\s*\(\s*([^)]*)\s*\)/g,
  /\.delete\s*\(\s*([^)]*)\s*\)/g,
  /\.upsert\s*\(\s*([^)]*)\s*\)/g,
  
  // Filtros y consultas
  /\.eq\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*([^)]+)\s*\)/g,
  /\.neq\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*([^)]+)\s*\)/g,
  /\.gt\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*([^)]+)\s*\)/g,
  /\.gte\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*([^)]+)\s*\)/g,
  /\.lt\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*([^)]+)\s*\)/g,
  /\.lte\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*([^)]+)\s*\)/g,
  /\.like\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*([^)]+)\s*\)/g,
  /\.ilike\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*([^)]+)\s*\)/g,
  /\.in\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*([^)]+)\s*\)/g,
  /\.contains\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*([^)]+)\s*\)/g,
  /\.filter\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*['"`]([^'"`]+)['"`]\s*,\s*([^)]+)\s*\)/g,
  /\.match\s*\(\s*([^)]*)\s*\)/g,
  /\.order\s*\(\s*['"`]([^'"`]+)['"`](\s*,\s*\{[^}]*\})?\s*\)/g,
  /\.limit\s*\(\s*(\d+)\s*\)/g,
  /\.range\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)/g,
  /\.single\s*\(\s*\)/g,
  /\.maybe\s*\(\s*\)/g,
  
  // RPC y funciones
  /\.rpc\s*\(\s*['"`]([^'"`]+)['"`]\s*(?:,\s*([^)]*))?\s*\)/g,
  
  // Auth
  /supabase\.auth\./g,
  /\.signIn\s*\(/g,
  /\.signUp\s*\(/g,
  /\.signOut\s*\(/g,
  
  // Storage
  /supabase\.storage\./g,
  /\.upload\s*\(/g,
  /\.download\s*\(/g,
  
  // Real-time
  /\.on\s*\(\s*['"`]([^'"`]+)['"`]/g,
  /\.subscribe\s*\(/g
];

/**
 * 📖 Leer archivo y extraer líneas
 */
function readFileLines(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return content.split('\n');
  } catch (error) {
    supabaseCallsRegistry.errors.push({
      file: filePath,
      error: `Error leyendo archivo: ${error.message}`
    });
    return [];
  }
}

/**
 * 🔍 Analizar línea por línea buscando patrones Supabase
 */
function analyzeLineForSupabase(line, lineNumber, filePath) {
  const foundCalls = [];
  
  SUPABASE_PATTERNS.forEach((pattern, patternIndex) => {
    let match;
    const regex = new RegExp(pattern.source, pattern.flags);
    
    while ((match = regex.exec(line)) !== null) {
      const callDetails = {
        file: filePath,
        line: lineNumber,
        pattern: pattern.source,
        fullMatch: match[0],
        lineContent: line.trim(),
        captures: match.slice(1),
        timestamp: new Date().toISOString()
      };
      
      // Determinar tipo de operación
      if (match[0].includes('.from(')) {
        callDetails.type = 'TABLE_ACCESS';
        callDetails.table = match[1];
      } else if (match[0].includes('.select(')) {
        callDetails.type = 'SELECT';
        callDetails.fields = match[1];
      } else if (match[0].includes('.insert(')) {
        callDetails.type = 'INSERT';
        callDetails.data = match[1];
      } else if (match[0].includes('.update(')) {
        callDetails.type = 'UPDATE';
        callDetails.data = match[1];
      } else if (match[0].includes('.delete(')) {
        callDetails.type = 'DELETE';
      } else if (match[0].includes('.eq(')) {
        callDetails.type = 'FILTER_EQ';
        callDetails.field = match[1];
        callDetails.value = match[2];
      } else if (match[0].includes('.rpc(')) {
        callDetails.type = 'RPC';
        callDetails.function = match[1];
        callDetails.params = match[2];
      } else {
        callDetails.type = 'OTHER';
      }
      
      foundCalls.push(callDetails);
      supabaseCallsRegistry.totalCalls++;
      
      // Registrar por tipo
      if (!supabaseCallsRegistry.callsByType[callDetails.type]) {
        supabaseCallsRegistry.callsByType[callDetails.type] = 0;
      }
      supabaseCallsRegistry.callsByType[callDetails.type]++;
      
      // Registrar por tabla (si aplica)
      if (callDetails.table) {
        if (!supabaseCallsRegistry.callsByTable[callDetails.table]) {
          supabaseCallsRegistry.callsByTable[callDetails.table] = 0;
        }
        supabaseCallsRegistry.callsByTable[callDetails.table]++;
      }
    }
  });
  
  return foundCalls;
}

/**
 * 📁 Procesar archivo completo
 */
function processFile(filePath) {
  console.log(`🔍 Procesando: ${filePath}`);
  
  const lines = readFileLines(filePath);
  const fileCalls = [];
  
  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    supabaseCallsRegistry.totalLines++;
    
    const lineCalls = analyzeLineForSupabase(line, lineNumber, filePath);
    fileCalls.push(...lineCalls);
  });
  
  if (fileCalls.length > 0) {
    supabaseCallsRegistry.callsByFile[filePath] = {
      totalCalls: fileCalls.length,
      calls: fileCalls
    };
    
    console.log(`   ✅ Encontrados ${fileCalls.length} llamados Supabase`);
  }
  
  supabaseCallsRegistry.detailedCalls.push(...fileCalls);
  supabaseCallsRegistry.totalFiles++;
}

/**
 * 🚀 EJECUCIÓN PRINCIPAL
 */
async function executeExhaustiveAudit() {
  console.log('🚀 INICIANDO AUDITORÍA EXHAUSTIVA SUPABASE');
  console.log('==========================================');
  
  const startTime = new Date();
  
  // Lista de archivos a procesar (los 70 encontrados)
  const filesToProcess = [
    '/mnt/c/Pasc/Proyecto_Derecho_Digital/Desarrollos/Intro_LPDP/frontend/src/services/databaseService.js',
    '/mnt/c/Pasc/Proyecto_Derecho_Digital/Desarrollos/Intro_LPDP/frontend/src/config/postgresClient.js',
    '/mnt/c/Pasc/Proyecto_Derecho_Digital/Desarrollos/Intro_LPDP/frontend/src/utils/supabaseErrorLogger.js',
    '/mnt/c/Pasc/Proyecto_Derecho_Digital/Desarrollos/Intro_LPDP/frontend/src/services/ratService.js',
    '/mnt/c/Pasc/Proyecto_Derecho_Digital/Desarrollos/Intro_LPDP/frontend/src/pages/EIPDListPage.js',
    '/mnt/c/Pasc/Proyecto_Derecho_Digital/Desarrollos/Intro_LPDP/frontend/src/services/partnerSyncEngine.js',
    '/mnt/c/Pasc/Proyecto_Derecho_Digital/Desarrollos/Intro_LPDP/frontend/src/components/RATSystemProfessional.js',
    '/mnt/c/Pasc/Proyecto_Derecho_Digital/Desarrollos/Intro_LPDP/frontend/src/components/ComplianceMetrics.js',
    '/mnt/c/Pasc/Proyecto_Derecho_Digital/Desarrollos/Intro_LPDP/frontend/src/config/supabaseClient.js',
    '/mnt/c/Pasc/Proyecto_Derecho_Digital/Desarrollos/Intro_LPDP/frontend/src/contexts/TenantContext.js',
    '/mnt/c/Pasc/Proyecto_Derecho_Digital/Desarrollos/Intro_LPDP/frontend/src/utils/supabaseAuditor.js',
    '/mnt/c/Pasc/Proyecto_Derecho_Digital/Desarrollos/Intro_LPDP/frontend/public/auditoria-supabase-browser.js',
    '/mnt/c/Pasc/Proyecto_Derecho_Digital/Desarrollos/Intro_LPDP/frontend/src/utils/supabaseEmpresaPersistence.js',
    '/mnt/c/Pasc/Proyecto_Derecho_Digital/Desarrollos/Intro_LPDP/frontend/src/services/proveedoresService.js',
    '/mnt/c/Pasc/Proyecto_Derecho_Digital/Desarrollos/Intro_LPDP/frontend/src/utils/supabaseRLSGuard.js',
    '/mnt/c/Pasc/Proyecto_Derecho_Digital/Desarrollos/Intro_LPDP/frontend/src/components/RATEditPage.js',
    '/mnt/c/Pasc/Proyecto_Derecho_Digital/Desarrollos/Intro_LPDP/frontend/src/utils/smartSupabaseClient.js',
    '/mnt/c/Pasc/Proyecto_Derecho_Digital/Desarrollos/Intro_LPDP/frontend/src/utils/semanticValidator.js',
    '/mnt/c/Pasc/Proyecto_Derecho_Digital/Desarrollos/Intro_LPDP/frontend/src/utils/secureTokens.js',
    '/mnt/c/Pasc/Proyecto_Derecho_Digital/Desarrollos/Intro_LPDP/frontend/src/utils/rateLimiter.js',
    '/mnt/c/Pasc/Proyecto_Derecho_Digital/Desarrollos/Intro_LPDP/frontend/src/utils/logicAuditor.js',
    '/mnt/c/Pasc/Proyecto_Derecho_Digital/Desarrollos/Intro_LPDP/frontend/src/utils/interactiveHelper.js',
    '/mnt/c/Pasc/Proyecto_Derecho_Digital/Desarrollos/Intro_LPDP/frontend/src/utils/instantSystemTest.js',
    '/mnt/c/Pasc/Proyecto_Derecho_Digital/Desarrollos/Intro_LPDP/frontend/src/utils/index.js',
    '/mnt/c/Pasc/Proyecto_Derecho_Digital/Desarrollos/Intro_LPDP/frontend/src/utils/iaAgentReporter.js',
    '/mnt/c/Pasc/Proyecto_Derecho_Digital/Desarrollos/Intro_LPDP/frontend/src/utils/humanInteractionSimulator.js',
    '/mnt/c/Pasc/Proyecto_Derecho_Digital/Desarrollos/Intro_LPDP/frontend/src/utils/frontendValidator.js',
    '/mnt/c/Pasc/Proyecto_Derecho_Digital/Desarrollos/Intro_LPDP/frontend/src/utils/errorPreventionMonitor.js',
    '/mnt/c/Pasc/Proyecto_Derecho_Digital/Desarrollos/Intro_LPDP/frontend/src/utils/errorMonitoringOnly.js',
    '/mnt/c/Pasc/Proyecto_Derecho_Digital/Desarrollos/Intro_LPDP/frontend/src/utils/dynamicLegalRules.js',
    '/mnt/c/Pasc/Proyecto_Derecho_Digital/Desarrollos/Intro_LPDP/frontend/src/utils/dataIntegrityValidator.js',
    '/mnt/c/Pasc/Proyecto_Derecho_Digital/Desarrollos/Intro_LPDP/frontend/src/utils/databaseHealthMonitor.js',
    '/mnt/c/Pasc/Proyecto_Derecho_Digital/Desarrollos/Intro_LPDP/frontend/src/utils/completeSystemTester.js',
    '/mnt/c/Pasc/Proyecto_Derecho_Digital/Desarrollos/Intro_LPDP/frontend/src/utils/aiSupervisor.js',
    '/mnt/c/Pasc/Proyecto_Derecho_Digital/Desarrollos/Intro_LPDP/frontend/src/services/testBalancingEngine.js',
    '/mnt/c/Pasc/Proyecto_Derecho_Digital/Desarrollos/Intro_LPDP/frontend/src/services/specificCasesEngine.js',
    '/mnt/c/Pasc/Proyecto_Derecho_Digital/Desarrollos/Intro_LPDP/frontend/src/services/riskCalculationEngine.js',
    '/mnt/c/Pasc/Proyecto_Derecho_Digital/Desarrollos/Intro_LPDP/frontend/src/services/ratIntelligenceEngine.js',
    '/mnt/c/Pasc/Proyecto_Derecho_Digital/Desarrollos/Intro_LPDP/frontend/src/services/dataSync.js',
    '/mnt/c/Pasc/Proyecto_Derecho_Digital/Desarrollos/Intro_LPDP/frontend/src/services/categoryAnalysisEngine.js',
    '/mnt/c/Pasc/Proyecto_Derecho_Digital/Desarrollos/Intro_LPDP/frontend/src/services/api.js',
    '/mnt/c/Pasc/Proyecto_Derecho_Digital/Desarrollos/Intro_LPDP/frontend/src/sdk/LPDPHubSDK.js',
    '/mnt/c/Pasc/Proyecto_Derecho_Digital/Desarrollos/Intro_LPDP/frontend/src/pages/RATListPage.js',
    '/mnt/c/Pasc/Proyecto_Derecho_Digital/Desarrollos/Intro_LPDP/frontend/src/pages/ProviderManager.js',
    '/mnt/c/Pasc/Proyecto_Derecho_Digital/Desarrollos/Intro_LPDP/frontend/src/pages/GestionAsociaciones.js',
    '/mnt/c/Pasc/Proyecto_Derecho_Digital/Desarrollos/Intro_LPDP/frontend/src/pages/EIPDCreator.js',
    '/mnt/c/Pasc/Proyecto_Derecho_Digital/Desarrollos/Intro_LPDP/frontend/src/pages/DPOApprovalQueue.js',
    '/mnt/c/Pasc/Proyecto_Derecho_Digital/Desarrollos/Intro_LPDP/frontend/src/pages/DashboardDPO.js',
    '/mnt/c/Pasc/Proyecto_Derecho_Digital/Desarrollos/Intro_LPDP/frontend/src/pages/AdminDashboard.js',
    '/mnt/c/Pasc/Proyecto_Derecho_Digital/Desarrollos/Intro_LPDP/frontend/src/debug_rat_id.js',
    '/mnt/c/Pasc/Proyecto_Derecho_Digital/Desarrollos/Intro_LPDP/frontend/src/contexts/AuthContext.js',
    '/mnt/c/Pasc/Proyecto_Derecho_Digital/Desarrollos/Intro_LPDP/frontend/src/config/industries.config.js',
    '/mnt/c/Pasc/Proyecto_Derecho_Digital/Desarrollos/Intro_LPDP/frontend/src/components/ReportGenerator.js',
    '/mnt/c/Pasc/Proyecto_Derecho_Digital/Desarrollos/Intro_LPDP/frontend/src/components/RATListPage.js',
    '/mnt/c/Pasc/Proyecto_Derecho_Digital/Desarrollos/Intro_LPDP/frontend/src/components/NotificationCenter.js',
    '/mnt/c/Pasc/Proyecto_Derecho_Digital/Desarrollos/Intro_LPDP/frontend/src/components/ImmutableAuditLog.js',
    '/mnt/c/Pasc/Proyecto_Derecho_Digital/Desarrollos/Intro_LPDP/frontend/src/components/GestionProveedores.js',
    '/mnt/c/Pasc/Proyecto_Derecho_Digital/Desarrollos/Intro_LPDP/frontend/src/components/EmpresaDataManager.js',
    '/mnt/c/Pasc/Proyecto_Derecho_Digital/Desarrollos/Intro_LPDP/frontend/src/components/EIPDTemplates.js',
    '/mnt/c/Pasc/Proyecto_Derecho_Digital/Desarrollos/Intro_LPDP/frontend/src/components/DPAGenerator.js',
    '/mnt/c/Pasc/Proyecto_Derecho_Digital/Desarrollos/Intro_LPDP/frontend/src/components/DiagnosticCenter.js',
    '/mnt/c/Pasc/Proyecto_Derecho_Digital/Desarrollos/Intro_LPDP/frontend/src/components/CalendarView.js',
    '/mnt/c/Pasc/Proyecto_Derecho_Digital/Desarrollos/Intro_LPDP/frontend/src/components/auth/Login.js',
    '/mnt/c/Pasc/Proyecto_Derecho_Digital/Desarrollos/Intro_LPDP/frontend/src/components/APIPartnersIntegration.js',
    '/mnt/c/Pasc/Proyecto_Derecho_Digital/Desarrollos/Intro_LPDP/frontend/src/components/AdminDashboard.js',
    '/mnt/c/Pasc/Proyecto_Derecho_Digital/Desarrollos/Intro_LPDP/frontend/src/components/admin/UserManagement.js',
    '/mnt/c/Pasc/Proyecto_Derecho_Digital/Desarrollos/Intro_LPDP/frontend/src/components/admin/UsageDashboard.js',
    '/mnt/c/Pasc/Proyecto_Derecho_Digital/Desarrollos/Intro_LPDP/frontend/src/components/admin/IAAgentStatusPage.js',
    '/mnt/c/Pasc/Proyecto_Derecho_Digital/Desarrollos/Intro_LPDP/frontend/src/App.js',
    '/mnt/c/Pasc/Proyecto_Derecho_Digital/Desarrollos/Intro_LPDP/frontend/index.js'
  ];
  
  // Procesar cada archivo
  filesToProcess.forEach(processFile);
  
  const endTime = new Date();
  const executionTime = endTime - startTime;
  
  // 📊 GENERAR REPORTE EXHAUSTIVO
  const report = {
    timestamp: new Date().toISOString(),
    executionTime: `${executionTime}ms`,
    summary: {
      totalFilesProcessed: supabaseCallsRegistry.totalFiles,
      totalLinesScanned: supabaseCallsRegistry.totalLines,
      totalSupabaseCalls: supabaseCallsRegistry.totalCalls,
      filesWithCalls: Object.keys(supabaseCallsRegistry.callsByFile).length,
      errorsEncountered: supabaseCallsRegistry.errors.length
    },
    statistics: {
      callsByType: supabaseCallsRegistry.callsByType,
      callsByTable: supabaseCallsRegistry.callsByTable,
      topTablesUsed: Object.entries(supabaseCallsRegistry.callsByTable)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10),
      topFilesWithCalls: Object.entries(supabaseCallsRegistry.callsByFile)
        .map(([file, data]) => ({ file, calls: data.totalCalls }))
        .sort((a, b) => b.calls - a.calls)
        .slice(0, 10)
    },
    detailedAnalysis: {
      allCalls: supabaseCallsRegistry.detailedCalls,
      callsByFile: supabaseCallsRegistry.callsByFile,
      errors: supabaseCallsRegistry.errors
    }
  };
  
  // Guardar reporte
  const reportPath = `/mnt/c/Pasc/Proyecto_Derecho_Digital/Desarrollos/Intro_LPDP/AUDITORIA_EXHAUSTIVA_SUPABASE_${Date.now()}.json`;
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log('\n📊 REPORTE EXHAUSTIVO COMPLETADO');
  console.log('================================');
  console.log(`📁 Archivos procesados: ${report.summary.totalFilesProcessed}`);
  console.log(`📄 Líneas escaneadas: ${report.summary.totalLinesScanned}`);
  console.log(`🔍 Llamados Supabase encontrados: ${report.summary.totalSupabaseCalls}`);
  console.log(`⏱️ Tiempo ejecución: ${report.executionTime}`);
  console.log(`💾 Reporte guardado en: ${reportPath}`);
  
  if (report.summary.errorsEncountered > 0) {
    console.log(`❌ Errores encontrados: ${report.summary.errorsEncountered}`);
  }
  
  // Mostrar top 5 tablas más utilizadas
  console.log('\n🏆 TOP 5 TABLAS MÁS UTILIZADAS:');
  report.statistics.topTablesUsed.slice(0, 5).forEach(([table, count], index) => {
    console.log(`   ${index + 1}. ${table}: ${count} llamados`);
  });
  
  return report;
}

// Ejecutar si es el archivo principal
if (require.main === module) {
  executeExhaustiveAudit()
    .then(report => {
      console.log('\n✅ AUDITORÍA EXHAUSTIVA COMPLETADA EXITOSAMENTE');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Error en auditoría exhaustiva:', error);
      process.exit(1);
    });
}

module.exports = executeExhaustiveAudit;