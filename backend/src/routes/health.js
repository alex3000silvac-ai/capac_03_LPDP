const express = require('express');
const { supabaseAdmin, supabasePublic } = require('../config/database');
const router = express.Router();

// Ruta de health check básica
router.get('/', async (req, res) => {
  const startTime = Date.now();
  
  try {
    // Verificar conexión a Supabase
    const { data, error } = await supabaseAdmin
      .from('organizaciones')
      .select('count(*)')
      .limit(1);

    const dbStatus = error ? 'error' : 'connected';
    const responseTime = Date.now() - startTime;

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '2.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      memory: {
        used: Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100,
        total: Math.round((process.memoryUsage().heapTotal / 1024 / 1024) * 100) / 100
      },
      database: {
        status: dbStatus,
        responseTime: `${responseTime}ms`
      },
      services: {
        supabase: dbStatus === 'connected' ? 'operational' : 'degraded'
      }
    });

  } catch (error) {
    console.error('❌ Error en health check:', error);
    
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      version: '2.0.0',
      environment: process.env.NODE_ENV || 'development',
      error: 'Database connection failed',
      database: {
        status: 'error',
        error: error.message
      }
    });
  }
});

// Ruta de health check detallada (solo en desarrollo)
router.get('/detailed', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ error: 'Not available in production' });
  }

  const startTime = Date.now();

  try {
    // Test de escritura en base de datos
    const writeTest = await testDatabaseWrite();
    const readTest = await testDatabaseRead();
    
    const responseTime = Date.now() - startTime;

    res.json({
      status: 'detailed_check',
      timestamp: new Date().toISOString(),
      version: '2.0.0',
      environment: process.env.NODE_ENV,
      uptime: process.uptime(),
      pid: process.pid,
      memory: {
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
        heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024)
      },
      database: {
        read: readTest,
        write: writeTest,
        responseTime: `${responseTime}ms`
      },
      configuration: {
        nodeEnv: process.env.NODE_ENV,
        port: process.env.PORT || 8000,
        hasSupabaseUrl: !!process.env.SUPABASE_URL,
        hasSupabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        hasJwtSecret: !!process.env.JWT_SECRET
      }
    });

  } catch (error) {
    res.status(503).json({
      status: 'detailed_check_failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Test de lectura de base de datos
async function testDatabaseRead() {
  try {
    const { data, error } = await supabaseAdmin
      .from('organizaciones')
      .select('count(*)')
      .limit(1);

    return {
      status: error ? 'failed' : 'success',
      error: error?.message
    };
  } catch (error) {
    return {
      status: 'failed',
      error: error.message
    };
  }
}

// Test de escritura en base de datos (usando configuración temporal)
async function testDatabaseWrite() {
  try {
    const testKey = `health_check_${Date.now()}`;
    
    // Intentar insertar configuración temporal
    const { error: insertError } = await supabaseAdmin
      .from('configuracion_sistema')
      .insert({
        tenant_id: 'health_check_temp',
        clave: testKey,
        valor: { test: true },
        descripcion: 'Health check test entry',
        tipo: 'boolean',
        categoria: 'system'
      });

    if (insertError && !insertError.message.includes('tenant')) {
      return {
        status: 'failed',
        error: insertError.message,
        operation: 'insert'
      };
    }

    // Limpiar entrada de test
    await supabaseAdmin
      .from('configuracion_sistema')
      .delete()
      .eq('clave', testKey);

    return {
      status: 'success',
      operation: 'insert_and_delete'
    };

  } catch (error) {
    return {
      status: 'failed', 
      error: error.message,
      operation: 'write_test'
    };
  }
}

// Ruta para verificar conectividad específica
router.get('/connectivity', async (req, res) => {
  const tests = {
    supabase_admin: false,
    supabase_public: false,
    database_queries: false
  };

  try {
    // Test cliente admin
    const adminTest = await supabaseAdmin.from('organizaciones').select('count(*)').limit(1);
    tests.supabase_admin = !adminTest.error;

    // Test cliente público  
    const publicTest = await supabasePublic.from('organizaciones').select('count(*)').limit(1);
    tests.supabase_public = !publicTest.error;

    // Test queries básicas
    tests.database_queries = tests.supabase_admin;

    const allPassed = Object.values(tests).every(test => test);

    res.status(allPassed ? 200 : 503).json({
      status: allPassed ? 'all_connections_ok' : 'some_connections_failed',
      tests,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    res.status(503).json({
      status: 'connectivity_check_failed',
      tests,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;