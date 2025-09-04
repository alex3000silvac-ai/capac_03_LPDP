/**
 * 🔐 POSTGRESQL CLIENT SEGURO Y ESTABLE
 * =====================================
 * 
 * Cliente PostgreSQL profesional con:
 * - Connection pooling para estabilidad
 * - SSL/TLS para seguridad
 * - Reintentos automáticos
 * - Protección de credenciales
 * - Monitoreo de salud
 * 
 * @requires pg (npm install pg)
 */

import { Pool } from 'pg';
import crypto from 'crypto';

// 🔐 CONFIGURACIÓN SEGURA - NUNCA hardcodear credenciales
const getSecureConfig = () => {
  // Las credenciales DEBEN venir de variables de entorno
  const requiredVars = [
    'POSTGRES_HOST',
    'POSTGRES_DATABASE', 
    'POSTGRES_USER',
    'POSTGRES_PASSWORD',
    'POSTGRES_PORT'
  ];

  // Validar que todas las variables existan
  const missing = requiredVars.filter(v => !process.env[v]);
  if (missing.length > 0) {
    throw new Error(`❌ Variables de entorno faltantes: ${missing.join(', ')}`);
  }

  return {
    // Conexión pooler de Supabase
    host: process.env.POSTGRES_HOST || 'aws-0-us-east-1.pooler.supabase.com',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    database: process.env.POSTGRES_DATABASE || 'postgres',
    user: process.env.POSTGRES_USER || 'postgres.symkjkbejxexgrydmvqs',
    password: process.env.POSTGRES_PASSWORD, // NUNCA valor por defecto para password
    
    // 🔒 CONFIGURACIÓN DE SEGURIDAD
    ssl: {
      rejectUnauthorized: process.env.NODE_ENV === 'production', // Verificar certificados en producción
      ca: process.env.POSTGRES_CA_CERT, // Certificado CA si está disponible
    },
    
    // 🚀 CONFIGURACIÓN DE POOL PARA ESTABILIDAD
    max: 20, // Máximo de conexiones en el pool
    min: 2, // Mínimo de conexiones activas
    idleTimeoutMillis: 30000, // Cerrar conexiones inactivas después de 30s
    connectionTimeoutMillis: 10000, // Timeout para establecer conexión
    
    // 🔄 CONFIGURACIÓN DE REINTENTOS
    statement_timeout: 30000, // Timeout para queries individuales
    query_timeout: 30000,
    
    // 📊 CONFIGURACIÓN DE LOGGING (solo desarrollo)
    log: process.env.NODE_ENV === 'development' ? console.log : undefined,
  };
};

// 🏊 POOL DE CONEXIONES SINGLETON
let pool = null;
let poolStatus = 'disconnected';
let reconnectTimer = null;
let connectionAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 5000; // 5 segundos entre reintentos

/**
 * 🔐 Crear pool de conexiones seguro
 */
const createSecurePool = async () => {
  try {
    if (pool) {
      await pool.end();
      pool = null;
    }

    console.log('🔐 Creando pool de conexiones PostgreSQL seguro...');
    
    const config = getSecureConfig();
    
    // Enmascarar password en logs
    const logConfig = { ...config, password: '[PROTECTED]' };
    console.log('📋 Configuración:', logConfig);
    
    pool = new Pool(config);
    
    // 🎯 EVENTOS DE MONITOREO
    pool.on('error', (err, client) => {
      console.error('❌ Error inesperado en cliente PostgreSQL:', err.message);
      handleConnectionError();
    });
    
    pool.on('connect', (client) => {
      console.log('✅ Nueva conexión establecida al pool');
      poolStatus = 'connected';
      connectionAttempts = 0;
    });
    
    pool.on('remove', (client) => {
      console.log('🔄 Conexión removida del pool');
    });
    
    // Verificar conexión inicial
    const testResult = await pool.query('SELECT NOW() as current_time, current_database() as database');
    console.log('✅ Pool PostgreSQL conectado exitosamente');
    console.log(`   📅 Hora servidor: ${testResult.rows[0].current_time}`);
    console.log(`   🗄️ Base de datos: ${testResult.rows[0].database}`);
    
    poolStatus = 'connected';
    connectionAttempts = 0;
    
    // Configurar health check periódico
    startHealthCheck();
    
    return pool;
    
  } catch (error) {
    console.error('❌ Error creando pool PostgreSQL:', error.message);
    poolStatus = 'error';
    handleConnectionError();
    throw error;
  }
};

/**
 * 🔄 Manejo de errores de conexión con reintentos
 */
const handleConnectionError = async () => {
  if (connectionAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.error('🚨 CRÍTICO: Máximo de reintentos alcanzado. Sistema sin conexión a BD.');
    poolStatus = 'failed';
    
    // Notificar al sistema de monitoreo
    if (global.errorMonitor) {
      global.errorMonitor.logCriticalError('POSTGRES_CONNECTION_FAILED', {
        attempts: connectionAttempts,
        lastError: new Date().toISOString()
      });
    }
    
    return;
  }
  
  connectionAttempts++;
  poolStatus = 'reconnecting';
  
  console.log(`🔄 Reintentando conexión PostgreSQL (${connectionAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);
  
  // Limpiar timer anterior si existe
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
  }
  
  reconnectTimer = setTimeout(async () => {
    try {
      await createSecurePool();
    } catch (error) {
      console.error(`❌ Reintento ${connectionAttempts} falló:`, error.message);
      handleConnectionError(); // Intentar de nuevo
    }
  }, RECONNECT_DELAY);
};

/**
 * 💓 Health check periódico
 */
let healthCheckInterval = null;

const startHealthCheck = () => {
  // Limpiar health check anterior si existe
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval);
  }
  
  healthCheckInterval = setInterval(async () => {
    if (poolStatus !== 'connected' || !pool) {
      return;
    }
    
    try {
      const result = await pool.query('SELECT 1 as health_check');
      if (!result || result.rows.length === 0) {
        throw new Error('Health check query returned no results');
      }
      // Health check exitoso - no loguear para no saturar
    } catch (error) {
      console.error('❌ Health check falló:', error.message);
      poolStatus = 'unhealthy';
      handleConnectionError();
    }
  }, 60000); // Check cada minuto
};

/**
 * 🔒 Ejecutar query con seguridad y reintentos
 */
export const secureQuery = async (text, params = [], options = {}) => {
  const maxRetries = options.maxRetries || 3;
  const retryDelay = options.retryDelay || 1000;
  let lastError = null;
  
  // Validar estado del pool
  if (!pool || poolStatus !== 'connected') {
    if (poolStatus === 'reconnecting') {
      console.log('⏳ Esperando reconexión...');
      // Esperar hasta 10 segundos por reconexión
      for (let i = 0; i < 20; i++) {
        await new Promise(resolve => setTimeout(resolve, 500));
        if (poolStatus === 'connected') break;
      }
    }
    
    if (poolStatus !== 'connected') {
      throw new Error('No hay conexión a PostgreSQL disponible');
    }
  }
  
  // Intentar ejecutar query con reintentos
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Log query en desarrollo (sin params por seguridad)
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔍 Query (intento ${attempt}): ${text.substring(0, 100)}...`);
      }
      
      // Ejecutar query con timeout
      const queryConfig = {
        text,
        values: params,
        ...options
      };
      
      const result = await pool.query(queryConfig);
      
      // Query exitoso
      return {
        success: true,
        data: result.rows,
        rowCount: result.rowCount,
        command: result.command
      };
      
    } catch (error) {
      lastError = error;
      console.error(`❌ Query falló (intento ${attempt}/${maxRetries}):`, error.message);
      
      // Si es el último intento, lanzar error
      if (attempt === maxRetries) {
        break;
      }
      
      // Esperar antes de reintentar
      await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
    }
  }
  
  // Todos los reintentos fallaron
  return {
    success: false,
    error: lastError.message,
    code: lastError.code,
    detail: lastError.detail
  };
};

/**
 * 🔒 Transacción segura con rollback automático
 */
export const secureTransaction = async (callback) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return { success: true, result };
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Transacción falló, rollback ejecutado:', error.message);
    return { success: false, error: error.message };
    
  } finally {
    client.release();
  }
};

/**
 * 🔐 Encriptar datos sensibles antes de guardar
 */
export const encryptSensitiveData = (data, key = process.env.ENCRYPTION_KEY) => {
  if (!key) {
    console.warn('⚠️ No hay clave de encriptación configurada');
    return data;
  }
  
  try {
    const algorithm = 'aes-256-gcm';
    const iv = crypto.randomBytes(16);
    const salt = crypto.randomBytes(64);
    const keyHash = crypto.pbkdf2Sync(key, salt, 10000, 32, 'sha256');
    
    const cipher = crypto.createCipheriv(algorithm, keyHash, iv);
    
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted: encrypted,
      salt: salt.toString('hex'),
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  } catch (error) {
    console.error('❌ Error encriptando datos:', error.message);
    throw error;
  }
};

/**
 * 🔓 Desencriptar datos sensibles
 */
export const decryptSensitiveData = (encryptedData, key = process.env.ENCRYPTION_KEY) => {
  if (!key) {
    console.warn('⚠️ No hay clave de desencriptación configurada');
    return null;
  }
  
  try {
    const algorithm = 'aes-256-gcm';
    const salt = Buffer.from(encryptedData.salt, 'hex');
    const iv = Buffer.from(encryptedData.iv, 'hex');
    const authTag = Buffer.from(encryptedData.authTag, 'hex');
    const keyHash = crypto.pbkdf2Sync(key, salt, 10000, 32, 'sha256');
    
    const decipher = crypto.createDecipheriv(algorithm, keyHash, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('❌ Error desencriptando datos:', error.message);
    throw error;
  }
};

/**
 * 📊 Obtener estadísticas del pool
 */
export const getPoolStats = () => {
  if (!pool) {
    return {
      status: poolStatus,
      totalConnections: 0,
      idleConnections: 0,
      waitingConnections: 0
    };
  }
  
  return {
    status: poolStatus,
    totalConnections: pool.totalCount,
    idleConnections: pool.idleCount,
    waitingConnections: pool.waitingCount,
    connectionAttempts: connectionAttempts,
    lastHealthCheck: new Date().toISOString()
  };
};

/**
 * 🛑 Cerrar pool de conexiones de forma segura
 */
export const closePool = async () => {
  try {
    if (healthCheckInterval) {
      clearInterval(healthCheckInterval);
      healthCheckInterval = null;
    }
    
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    
    if (pool) {
      console.log('🛑 Cerrando pool de conexiones PostgreSQL...');
      await pool.end();
      pool = null;
      poolStatus = 'disconnected';
      console.log('✅ Pool cerrado exitosamente');
    }
  } catch (error) {
    console.error('❌ Error cerrando pool:', error.message);
    throw error;
  }
};

/**
 * 🚀 Inicializar cliente PostgreSQL
 */
export const initializePostgresClient = async () => {
  try {
    console.log('🚀 Inicializando cliente PostgreSQL seguro...');
    await createSecurePool();
    return true;
  } catch (error) {
    console.error('❌ Error inicializando PostgreSQL:', error.message);
    return false;
  }
};

// 🔄 Auto-inicializar si estamos en el cliente
if (typeof window !== 'undefined' && process.env.REACT_APP_AUTO_INIT_POSTGRES === 'true') {
  initializePostgresClient().catch(console.error);
}

// 🛑 Limpiar al salir
if (typeof process !== 'undefined') {
  process.on('SIGINT', async () => {
    await closePool();
    process.exit(0);
  });
  
  process.on('SIGTERM', async () => {
    await closePool();
    process.exit(0);
  });
}

export default {
  secureQuery,
  secureTransaction,
  encryptSensitiveData,
  decryptSensitiveData,
  getPoolStats,
  closePool,
  initializePostgresClient
};