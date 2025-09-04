/**
 * 🔍 VALIDACIÓN EXHAUSTIVA: TABLAS.TXT vs CÓDIGO SUPABASE
 * ========================================================
 * 
 * Script que compara las tablas reales de Supabase vs las que usa el código:
 * 1. Extrae todas las tablas de Tablas.txt (110 tablas reales)
 * 2. Compara con las tablas encontradas en el código (58 tablas usadas)
 * 3. Identifica discrepancias, tablas no usadas, tablas inexistentes
 * 4. Genera reporte exhaustivo de la validación
 */

const fs = require('fs');

/**
 * 📊 REGISTRO DE VALIDACIÓN
 */
const validationResults = {
  timestamp: new Date().toISOString(),
  totalRealTables: 0,
  totalCodeTables: 0,
  matchingTables: 0,
  missingInCode: [], // Tablas que existen pero no se usan en código
  missingInDB: [], // Tablas que el código usa pero no existen
  perfectMatches: [], // Tablas que existen y se usan correctamente
  fieldAnalysis: {}, // Análisis de campos por tabla
  summary: {}
};

/**
 * 📖 Leer y parsear Tablas.txt
 */
function parseTablasTxt(filePath) {
  console.log('📖 Leyendo Tablas.txt...');
  
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const tablesStructure = {};
  
  lines.forEach((line, index) => {
    // Skip header and separator lines
    if (line.startsWith('|') && !line.includes('table_name') && !line.includes('---')) {
      const parts = line.split('|').map(p => p.trim()).filter(p => p);
      
      if (parts.length >= 3) {
        const tableName = parts[0];
        const tableType = parts[1];
        const columnName = parts[2];
        
        if (!tablesStructure[tableName]) {
          tablesStructure[tableName] = {
            type: tableType,
            columns: []
          };
        }
        
        if (columnName && !tablesStructure[tableName].columns.includes(columnName)) {
          tablesStructure[tableName].columns.push(columnName);
        }
      }
    }
  });
  
  console.log(`✅ Parseadas ${Object.keys(tablesStructure).length} tablas de Tablas.txt`);
  return tablesStructure;
}

/**
 * 📊 Cargar reporte de auditoría de código
 */
function loadCodeAuditReport() {
  console.log('📊 Cargando reporte de auditoría de código...');
  
  // Buscar el reporte más reciente
  const reportFiles = fs.readdirSync('.')
    .filter(f => f.startsWith('AUDITORIA_EXHAUSTIVA_SUPABASE_'))
    .sort()
    .reverse();
    
  if (reportFiles.length === 0) {
    throw new Error('No se encontró reporte de auditoría de código');
  }
  
  const reportPath = reportFiles[0];
  const auditReport = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  
  console.log(`✅ Cargado reporte: ${auditReport.summary.totalSupabaseCalls} llamados encontrados`);
  return auditReport;
}

/**
 * 🔍 Análisis exhaustivo de discrepancias
 */
function analyzeTableDiscrepancies(realTables, codeTables) {
  console.log('🔍 Analizando discrepancias tabla por tabla...');
  
  const realTableNames = Object.keys(realTables);
  const codeTableNames = Object.keys(codeTables);
  
  validationResults.totalRealTables = realTableNames.length;
  validationResults.totalCodeTables = codeTableNames.length;
  
  // Encontrar matches perfectos
  realTableNames.forEach(tableName => {
    if (codeTableNames.includes(tableName)) {
      validationResults.perfectMatches.push({
        table: tableName,
        realColumns: realTables[tableName].columns.length,
        codeUsage: codeTables[tableName],
        type: realTables[tableName].type
      });
      validationResults.matchingTables++;
    } else {
      // Tabla existe pero no se usa en código
      validationResults.missingInCode.push({
        table: tableName,
        columns: realTables[tableName].columns,
        type: realTables[tableName].type,
        reason: 'Tabla existe en BD pero no se usa en código'
      });
    }
  });
  
  // Encontrar tablas que el código usa pero no existen
  codeTableNames.forEach(tableName => {
    if (!realTableNames.includes(tableName)) {
      validationResults.missingInDB.push({
        table: tableName,
        codeUsage: codeTables[tableName],
        reason: 'Código intenta usar tabla que no existe en BD'
      });
    }
  });
  
  console.log(`✅ Análisis completo:`);
  console.log(`   📊 Tablas reales: ${validationResults.totalRealTables}`);
  console.log(`   💻 Tablas en código: ${validationResults.totalCodeTables}`);
  console.log(`   ✅ Matches perfectos: ${validationResults.matchingTables}`);
  console.log(`   ❌ Tablas no usadas: ${validationResults.missingInCode.length}`);
  console.log(`   🚨 Tablas inexistentes: ${validationResults.missingInDB.length}`);
}

/**
 * 🧪 Análisis detallado por tabla crítica
 */
function analyzeCriticalTables() {
  console.log('🧪 Analizando tablas críticas del sistema...');
  
  const criticalTables = [
    'mapeo_datos_rat',
    'organizaciones', 
    'actividades_dpo',
    'proveedores',
    'generated_documents',
    'dpo_notifications',
    'evaluaciones_impacto_privacidad',
    'documentos_dpa',
    'dpas',
    'usuarios'
  ];
  
  const criticalAnalysis = {
    existing: [],
    missing: [],
    analysis: []
  };
  
  criticalTables.forEach(tableName => {
    const existsInReal = validationResults.perfectMatches.some(m => m.table === tableName);
    const existsInMissing = validationResults.missingInDB.some(m => m.table === tableName);
    
    if (existsInReal) {
      const tableInfo = validationResults.perfectMatches.find(m => m.table === tableName);
      criticalAnalysis.existing.push({
        table: tableName,
        status: 'OK',
        usage: tableInfo.codeUsage,
        columns: tableInfo.realColumns
      });
    } else if (existsInMissing) {
      criticalAnalysis.missing.push({
        table: tableName,
        status: 'MISSING',
        impact: 'CRÍTICO - Funcionalidad core no disponible'
      });
    } else {
      criticalAnalysis.missing.push({
        table: tableName,
        status: 'NOT_USED',
        impact: 'Tabla disponible pero código no la usa'
      });
    }
  });
  
  validationResults.criticalTablesAnalysis = criticalAnalysis;
  
  console.log(`   ✅ Tablas críticas disponibles: ${criticalAnalysis.existing.length}`);
  console.log(`   ❌ Tablas críticas con problemas: ${criticalAnalysis.missing.length}`);
}

/**
 * 📈 Calcular métricas de salud del sistema
 */
function calculateSystemHealth() {
  const matchPercentage = (validationResults.matchingTables / validationResults.totalCodeTables * 100);
  const usagePercentage = (validationResults.totalCodeTables / validationResults.totalRealTables * 100);
  
  let healthStatus = 'CRÍTICO';
  if (matchPercentage > 80) healthStatus = 'BUENO';
  else if (matchPercentage > 50) healthStatus = 'REGULAR';
  else if (matchPercentage > 20) healthStatus = 'MALO';
  
  validationResults.systemHealth = {
    matchPercentage: matchPercentage.toFixed(2),
    usagePercentage: usagePercentage.toFixed(2),
    healthStatus: healthStatus,
    recommendation: getHealthRecommendation(matchPercentage)
  };
}

function getHealthRecommendation(matchPercentage) {
  if (matchPercentage > 80) {
    return 'Sistema en buen estado. Optimizar tablas no utilizadas.';
  } else if (matchPercentage > 50) {
    return 'Sistema funcional con mejoras necesarias. Corregir tablas faltantes.';
  } else if (matchPercentage > 20) {
    return 'Sistema con problemas serios. Requiere reestructuración de BD.';
  } else {
    return 'CRÍTICO: Sistema prácticamente no funcional. Requiere reconstrucción completa.';
  }
}

/**
 * 🚀 EJECUCIÓN PRINCIPAL
 */
async function executeTablesValidation() {
  console.log('🚀 INICIANDO VALIDACIÓN TABLAS.TXT vs CÓDIGO SUPABASE');
  console.log('======================================================');
  
  const startTime = new Date();
  
  try {
    // 1. Parsear Tablas.txt
    const realTables = parseTablasTxt('./Tablas.txt');
    
    // 2. Cargar reporte de auditoría de código
    const codeAudit = loadCodeAuditReport();
    const codeTables = codeAudit.statistics.callsByTable;
    
    // 3. Análizar discrepancias
    analyzeTableDiscrepancies(realTables, codeTables);
    
    // 4. Análisis de tablas críticas
    analyzeCriticalTables();
    
    // 5. Calcular salud del sistema
    calculateSystemHealth();
    
    const endTime = new Date();
    const executionTime = endTime - startTime;
    
    // 6. Generar resumen final
    validationResults.summary = {
      executionTime: `${executionTime}ms`,
      totalTablesReal: validationResults.totalRealTables,
      totalTablesCode: validationResults.totalCodeTables,
      perfectMatches: validationResults.matchingTables,
      tablesNotUsed: validationResults.missingInCode.length,
      tablesNotExisting: validationResults.missingInDB.length,
      systemHealth: validationResults.systemHealth,
      criticalIssues: validationResults.missingInDB.length,
      recommendations: [
        'Crear las tablas faltantes que el código requiere',
        'Revisar y limpiar código que usa tablas inexistentes', 
        'Optimizar uso de tablas disponibles pero no utilizadas',
        'Implementar validación de esquema automática'
      ]
    };
    
    // 7. Guardar reporte
    const outputPath = `VALIDACION_TABLAS_VS_CODIGO_${Date.now()}.json`;
    fs.writeFileSync(outputPath, JSON.stringify(validationResults, null, 2));
    
    console.log('\n📊 VALIDACIÓN TABLAS vs CÓDIGO COMPLETADA');
    console.log('==========================================');
    console.log(`📋 Tablas reales en Supabase: ${validationResults.totalRealTables}`);
    console.log(`💻 Tablas utilizadas en código: ${validationResults.totalCodeTables}`);
    console.log(`✅ Matches perfectos: ${validationResults.matchingTables} (${validationResults.systemHealth.matchPercentage}%)`);
    console.log(`❌ Tablas no utilizadas: ${validationResults.missingInCode.length}`);
    console.log(`🚨 Tablas inexistentes: ${validationResults.missingInDB.length}`);
    console.log(`🏥 Salud del sistema: ${validationResults.systemHealth.healthStatus}`);
    console.log(`⏱️ Tiempo ejecución: ${validationResults.summary.executionTime}`);
    console.log(`💾 Reporte guardado: ${outputPath}`);
    
    // Mostrar tablas críticas con problemas
    if (validationResults.missingInDB.length > 0) {
      console.log('\n🚨 TABLAS CRÍTICAS QUE EL CÓDIGO USA PERO NO EXISTEN:');
      validationResults.missingInDB.slice(0, 10).forEach((table, index) => {
        console.log(`   ${index + 1}. ${table.table} (${table.codeUsage} usos)`);
      });
    }
    
    return validationResults;
    
  } catch (error) {
    console.error('❌ Error en validación:', error.message);
    throw error;
  }
}

// Ejecutar si es el archivo principal
if (require.main === module) {
  executeTablesValidation()
    .then(results => {
      console.log('\n✅ VALIDACIÓN COMPLETADA EXITOSAMENTE');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Error en validación completa:', error);
      process.exit(1);
    });
}

module.exports = executeTablesValidation;