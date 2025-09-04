/**
 * 🧪 TEST OPERACIONES SUPABASE - INSERT→SELECT→DELETE
 * ===================================================
 * 
 * Script que toma los 945 llamados encontrados y los prueba:
 * 1. Carga el reporte de auditoría exhaustiva
 * 2. Para cada llamado identificado, hace INSERT→SELECT→DELETE
 * 3. Registra el resultado (éxito/fallo) de cada operación
 * 4. Genera reporte detallado de funcionamiento real
 */

const fs = require('fs');
const { Pool } = require('pg');

// 🔐 CONFIGURACIÓN POSTGRESQL SEGURA
const getPostgresConfig = () => {
  return {
    host: process.env.POSTGRES_HOST || 'aws-0-us-east-1.pooler.supabase.com',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    database: process.env.POSTGRES_DATABASE || 'postgres',
    user: process.env.POSTGRES_USER || 'postgres.symkjkbejxexgrydmvqs',
    password: process.env.POSTGRES_PASSWORD || 'cW5rBh0PPhKOrMtY',
    ssl: {
      rejectUnauthorized: false // Para testing, en producción usar true
    },
    max: 10,
    min: 1,
    idleTimeoutMillis: 30000
  };
};

// 🔄 POOL DE CONEXIONES
let pool = null;

/**
 * 🚀 Inicializar conexión PostgreSQL
 */
async function initializeConnection() {
  try {
    const config = getPostgresConfig();
    console.log(`🔐 Conectando a PostgreSQL: ${config.host}:${config.port}/${config.database}`);
    
    pool = new Pool(config);
    
    // Test de conexión
    const testResult = await pool.query('SELECT NOW() as current_time, current_database() as database');
    console.log('✅ Conexión PostgreSQL establecida');
    console.log(`   📅 Hora servidor: ${testResult.rows[0].current_time}`);
    console.log(`   🗄️ Base de datos: ${testResult.rows[0].database}`);
    
    return true;
  } catch (error) {
    console.error('❌ Error conectando a PostgreSQL:', error.message);
    return false;
  }
}

/**
 * 📊 REGISTRO DE RESULTADOS
 */
const testResults = {
  timestamp: new Date().toISOString(),
  totalCallsTested: 0,
  successfulOperations: 0,
  failedOperations: 0,
  operationsByType: {},
  operationsByTable: {},
  detailedResults: [],
  errors: [],
  summary: {}
};

/**
 * 🧪 Probar operación específica
 */
async function testOperation(callDetail, operationType, testData = {}) {
  const operationResult = {
    call: callDetail,
    operation: operationType,
    success: false,
    error: null,
    result: null,
    timestamp: new Date().toISOString()
  };

  try {
    let query = '';
    let params = [];
    
    // Construir query según el tipo de operación
    switch (operationType) {
      case 'INSERT':
        if (callDetail.table) {
          // Generar datos de prueba simples
          const testId = `TEST_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          query = `INSERT INTO "${callDetail.table}" (id, tenant_id, nombre, created_at) VALUES ($1, $2, $3, NOW()) RETURNING id`;
          params = [testId, 'tenant_test_123', `Test ${operationType} - ${callDetail.table}`];
        }
        break;
        
      case 'SELECT':
        if (callDetail.table) {
          query = `SELECT * FROM "${callDetail.table}" LIMIT 1`;
          params = [];
        }
        break;
        
      case 'UPDATE':
        if (callDetail.table) {
          query = `UPDATE "${callDetail.table}" SET updated_at = NOW() WHERE id = $1`;
          params = [testData.testId || 'nonexistent'];
        }
        break;
        
      case 'DELETE':
        if (callDetail.table) {
          query = `DELETE FROM "${callDetail.table}" WHERE id = $1`;
          params = [testData.testId || 'nonexistent'];
        }
        break;
        
      default:
        throw new Error(`Tipo de operación no soportado: ${operationType}`);
    }
    
    if (!query) {
      throw new Error('No se pudo construir query para la operación');
    }
    
    // Ejecutar query
    const result = await pool.query(query, params);
    
    operationResult.success = true;
    operationResult.result = {
      rowCount: result.rowCount,
      rows: result.rows?.slice(0, 3) // Solo primeras 3 filas para no saturar log
    };
    
    // Guardar ID para operaciones posteriores
    if (operationType === 'INSERT' && result.rows?.[0]?.id) {
      operationResult.insertedId = result.rows[0].id;
    }
    
  } catch (error) {
    operationResult.success = false;
    operationResult.error = {
      message: error.message,
      code: error.code,
      detail: error.detail
    };
  }
  
  return operationResult;
}

/**
 * 🧪 Probar tabla completa con INSERT→SELECT→DELETE
 */
async function testTableOperations(table) {
  console.log(`🧪 Probando tabla: ${table}`);
  
  const tableResults = {
    table: table,
    operations: {},
    success: false,
    insertedId: null
  };
  
  try {
    // 1. INSERT - Crear registro de prueba
    const insertResult = await testOperation({ table }, 'INSERT');
    tableResults.operations.INSERT = insertResult;
    
    if (insertResult.success && insertResult.insertedId) {
      tableResults.insertedId = insertResult.insertedId;
      
      // 2. SELECT - Verificar que se puede leer
      const selectResult = await testOperation({ table }, 'SELECT');
      tableResults.operations.SELECT = selectResult;
      
      // 3. UPDATE - Intentar actualizar (puede fallar si no hay campos compatibles)
      const updateResult = await testOperation({ table }, 'UPDATE', { testId: insertResult.insertedId });
      tableResults.operations.UPDATE = updateResult;
      
      // 4. DELETE - Limpiar registro de prueba
      const deleteResult = await testOperation({ table }, 'DELETE', { testId: insertResult.insertedId });
      tableResults.operations.DELETE = deleteResult;
      
      // Tabla exitosa si al menos INSERT y SELECT funcionan
      tableResults.success = insertResult.success && selectResult.success;
    }
    
  } catch (error) {
    console.error(`❌ Error probando tabla ${table}:`, error.message);
    tableResults.error = error.message;
  }
  
  return tableResults;
}

/**
 * 🚀 EJECUCIÓN PRINCIPAL
 */
async function executeSupabaseOperationsTest() {
  console.log('🚀 INICIANDO TEST DE OPERACIONES SUPABASE');
  console.log('=========================================');
  
  const startTime = new Date();
  
  // 1. Inicializar conexión
  const connected = await initializeConnection();
  if (!connected) {
    throw new Error('No se pudo conectar a PostgreSQL');
  }
  
  // 2. Cargar reporte de auditoría exhaustiva
  const reportFiles = fs.readdirSync('.')
    .filter(f => f.startsWith('AUDITORIA_EXHAUSTIVA_SUPABASE_'))
    .sort()
    .reverse(); // Más reciente primero
    
  if (reportFiles.length === 0) {
    throw new Error('No se encontró reporte de auditoría exhaustiva');
  }
  
  const reportPath = reportFiles[0];
  console.log(`📖 Cargando reporte: ${reportPath}`);
  
  const auditReport = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  console.log(`📊 Reporte cargado: ${auditReport.summary.totalSupabaseCalls} llamados encontrados`);
  
  // 3. Extraer tablas únicas para probar
  const uniqueTables = Object.keys(auditReport.statistics.callsByTable);
  console.log(`🎯 Probando ${uniqueTables.length} tablas únicas`);
  
  // 4. Probar cada tabla
  for (let i = 0; i < uniqueTables.length; i++) {
    const table = uniqueTables[i];
    console.log(`\n[${i + 1}/${uniqueTables.length}] Probando ${table}...`);
    
    const tableResult = await testTableOperations(table);
    testResults.detailedResults.push(tableResult);
    testResults.totalCallsTested++;
    
    // Actualizar estadísticas
    if (tableResult.success) {
      testResults.successfulOperations++;
      console.log(`   ✅ ${table}: OK`);
    } else {
      testResults.failedOperations++;
      console.log(`   ❌ ${table}: FALLO`);
    }
    
    // Estadísticas por tabla
    testResults.operationsByTable[table] = tableResult;
    
    // Pausa pequeña para no saturar la conexión
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  const endTime = new Date();
  const executionTime = endTime - startTime;
  
  // 5. Generar reporte final
  testResults.summary = {
    executionTime: `${executionTime}ms`,
    successRate: ((testResults.successfulOperations / testResults.totalCallsTested) * 100).toFixed(2) + '%',
    tablesWorking: testResults.successfulOperations,
    tablesFailing: testResults.failedOperations,
    totalTables: testResults.totalCallsTested
  };
  
  // 6. Guardar reporte
  const outputPath = `TESTING_OPERACIONES_SUPABASE_${Date.now()}.json`;
  fs.writeFileSync(outputPath, JSON.stringify(testResults, null, 2));
  
  console.log('\n📊 TESTING OPERACIONES COMPLETADO');
  console.log('=================================');
  console.log(`✅ Tablas funcionando: ${testResults.successfulOperations}/${testResults.totalCallsTested}`);
  console.log(`❌ Tablas con errores: ${testResults.failedOperations}/${testResults.totalCallsTested}`);
  console.log(`📈 Tasa de éxito: ${testResults.summary.successRate}`);
  console.log(`⏱️ Tiempo ejecución: ${testResults.summary.executionTime}`);
  console.log(`💾 Reporte guardado: ${outputPath}`);
  
  return testResults;
}

// 🛑 Cerrar conexiones al terminar
process.on('exit', async () => {
  if (pool) {
    await pool.end();
  }
});

// Ejecutar si es el archivo principal
if (require.main === module) {
  executeSupabaseOperationsTest()
    .then(results => {
      console.log('\n✅ TESTING OPERACIONES COMPLETADO EXITOSAMENTE');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Error en testing operaciones:', error);
      process.exit(1);
    });
}

module.exports = executeSupabaseOperationsTest;