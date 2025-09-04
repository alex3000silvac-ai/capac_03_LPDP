/**
 * 🗄️ DATABASE SERVICE - CAPA DE ABSTRACCIÓN SEGURA
 * ================================================
 * 
 * Servicio unificado para acceso a base de datos con:
 * - Abstracción sobre PostgreSQL directo
 * - Validación y sanitización de datos
 * - Cache inteligente
 * - Métricas y logging
 * - Multi-tenancy seguro
 */

import postgresClient from '../config/postgresClient';
import { supabase } from '../config/supabaseClient';

// 🔐 CONFIGURACIÓN
const USE_POSTGRES_DIRECT = process.env.REACT_APP_USE_POSTGRES_DIRECT === 'true';
const ENABLE_CACHE = process.env.REACT_APP_ENABLE_DB_CACHE !== 'false';
const CACHE_TTL = parseInt(process.env.REACT_APP_CACHE_TTL || '300000'); // 5 minutos default

// 📦 CACHE EN MEMORIA
const cache = new Map();
const cacheTimestamps = new Map();

class DatabaseService {
  constructor() {
    this.initialized = false;
    this.connectionMode = 'unknown';
    this.metrics = {
      queries: 0,
      errors: 0,
      cacheHits: 0,
      cacheMisses: 0,
      avgResponseTime: 0
    };
  }

  /**
   * 🚀 Inicializar servicio de base de datos
   */
  async initialize() {
    try {
      console.log('🗄️ Inicializando Database Service...');
      
      if (USE_POSTGRES_DIRECT && postgresClient) {
        // Intentar PostgreSQL directo primero
        const pgInitialized = await postgresClient.initializePostgresClient();
        if (pgInitialized) {
          this.connectionMode = 'postgresql';
          console.log('✅ Modo: PostgreSQL directo (seguro y estable)');
        }
      }
      
      // Fallback a Supabase si PostgreSQL falla
      if (this.connectionMode === 'unknown' && supabase) {
        try {
          const { data, error } = await supabase
            .from('organizaciones')
            .select('count')
            .limit(1);
          
          if (!error) {
            this.connectionMode = 'supabase';
            console.log('✅ Modo: Supabase REST API');
          }
        } catch (supabaseError) {
          console.error('❌ Supabase no disponible:', supabaseError.message);
        }
      }
      
      if (this.connectionMode === 'unknown') {
        throw new Error('No hay conexión a base de datos disponible');
      }
      
      this.initialized = true;
      console.log(`✅ Database Service inicializado en modo: ${this.connectionMode}`);
      
      // Iniciar limpieza de cache periódica
      this.startCacheCleanup();
      
      return true;
      
    } catch (error) {
      console.error('❌ Error inicializando Database Service:', error);
      this.initialized = false;
      return false;
    }
  }

  /**
   * 🔍 SELECT - Consulta segura con cache
   */
  async select(table, options = {}) {
    const startTime = Date.now();
    this.metrics.queries++;
    
    try {
      // Validar tabla contra whitelist
      if (!this.isValidTable(table)) {
        throw new Error(`Tabla no permitida: ${table}`);
      }
      
      // Generar cache key
      const cacheKey = this.generateCacheKey('select', table, options);
      
      // Verificar cache
      if (ENABLE_CACHE && !options.noCache) {
        const cached = this.getFromCache(cacheKey);
        if (cached) {
          this.metrics.cacheHits++;
          return cached;
        }
        this.metrics.cacheMisses++;
      }
      
      let result;
      
      if (this.connectionMode === 'postgresql') {
        result = await this.selectPostgreSQL(table, options);
      } else if (this.connectionMode === 'supabase') {
        result = await this.selectSupabase(table, options);
      } else {
        throw new Error('No hay conexión a base de datos');
      }
      
      // Guardar en cache si es exitoso
      if (result.success && ENABLE_CACHE && !options.noCache) {
        this.saveToCache(cacheKey, result);
      }
      
      // Actualizar métricas
      const responseTime = Date.now() - startTime;
      this.updateMetrics(responseTime);
      
      return result;
      
    } catch (error) {
      this.metrics.errors++;
      console.error(`❌ Error en SELECT ${table}:`, error.message);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  /**
   * 🔍 SELECT con PostgreSQL
   */
  async selectPostgreSQL(table, options) {
    const {
      columns = '*',
      where = {},
      orderBy = null,
      limit = null,
      offset = null,
      tenantId = null
    } = options;
    
    // Construir query de forma segura
    let query = `SELECT ${columns} FROM ${table}`;
    const params = [];
    let paramIndex = 1;
    
    // Agregar condiciones WHERE
    const whereConditions = [];
    
    // Multi-tenancy automático
    if (tenantId && this.hasColumn(table, 'tenant_id')) {
      whereConditions.push(`tenant_id = $${paramIndex++}`);
      params.push(tenantId);
    }
    
    // Otras condiciones
    for (const [key, value] of Object.entries(where)) {
      if (value === null) {
        whereConditions.push(`${key} IS NULL`);
      } else if (Array.isArray(value)) {
        whereConditions.push(`${key} = ANY($${paramIndex++})`);
        params.push(value);
      } else if (typeof value === 'object' && value.operator) {
        // Operadores especiales: {operator: 'like', value: '%test%'}
        whereConditions.push(`${key} ${value.operator} $${paramIndex++}`);
        params.push(value.value);
      } else {
        whereConditions.push(`${key} = $${paramIndex++}`);
        params.push(value);
      }
    }
    
    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(' AND ')}`;
    }
    
    // ORDER BY
    if (orderBy) {
      query += ` ORDER BY ${orderBy}`;
    }
    
    // LIMIT y OFFSET
    if (limit) {
      query += ` LIMIT ${parseInt(limit)}`;
    }
    if (offset) {
      query += ` OFFSET ${parseInt(offset)}`;
    }
    
    // Ejecutar query
    return await postgresClient.secureQuery(query, params);
  }

  /**
   * 🔍 SELECT con Supabase
   */
  async selectSupabase(table, options) {
    const {
      columns = '*',
      where = {},
      orderBy = null,
      limit = null,
      offset = null,
      tenantId = null
    } = options;
    
    try {
      let query = supabase.from(table).select(columns);
      
      // Multi-tenancy
      if (tenantId && this.hasColumn(table, 'tenant_id')) {
        query = query.eq('tenant_id', tenantId);
      }
      
      // Aplicar filtros WHERE
      for (const [key, value] of Object.entries(where)) {
        if (value === null) {
          query = query.is(key, null);
        } else if (Array.isArray(value)) {
          query = query.in(key, value);
        } else if (typeof value === 'object' && value.operator) {
          // Operadores Supabase
          switch (value.operator) {
            case 'like':
              query = query.like(key, value.value);
              break;
            case 'ilike':
              query = query.ilike(key, value.value);
              break;
            case 'gt':
              query = query.gt(key, value.value);
              break;
            case 'gte':
              query = query.gte(key, value.value);
              break;
            case 'lt':
              query = query.lt(key, value.value);
              break;
            case 'lte':
              query = query.lte(key, value.value);
              break;
            default:
              query = query.eq(key, value);
          }
        } else {
          query = query.eq(key, value);
        }
      }
      
      // ORDER BY
      if (orderBy) {
        const [column, direction = 'asc'] = orderBy.split(' ');
        query = query.order(column, { ascending: direction.toLowerCase() === 'asc' });
      }
      
      // LIMIT y OFFSET
      if (limit) {
        query = query.limit(parseInt(limit));
      }
      if (offset) {
        query = query.range(parseInt(offset), parseInt(offset) + (limit || 10) - 1);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return {
        success: true,
        data: data || [],
        rowCount: data?.length || 0
      };
      
    } catch (error) {
      throw error;
    }
  }

  /**
   * ➕ INSERT - Inserción segura con validación
   */
  async insert(table, data, options = {}) {
    const startTime = Date.now();
    this.metrics.queries++;
    
    try {
      // Validar tabla
      if (!this.isValidTable(table)) {
        throw new Error(`Tabla no permitida: ${table}`);
      }
      
      // Sanitizar datos
      const sanitizedData = this.sanitizeData(data);
      
      // Agregar tenant_id si es necesario
      if (options.tenantId && this.hasColumn(table, 'tenant_id')) {
        sanitizedData.tenant_id = options.tenantId;
      }
      
      // Agregar timestamps
      if (this.hasColumn(table, 'created_at')) {
        sanitizedData.created_at = new Date().toISOString();
      }
      if (this.hasColumn(table, 'updated_at')) {
        sanitizedData.updated_at = new Date().toISOString();
      }
      
      let result;
      
      if (this.connectionMode === 'postgresql') {
        result = await this.insertPostgreSQL(table, sanitizedData, options);
      } else if (this.connectionMode === 'supabase') {
        result = await this.insertSupabase(table, sanitizedData, options);
      } else {
        throw new Error('No hay conexión a base de datos');
      }
      
      // Invalidar cache relacionado
      this.invalidateCache(table);
      
      // Actualizar métricas
      const responseTime = Date.now() - startTime;
      this.updateMetrics(responseTime);
      
      return result;
      
    } catch (error) {
      this.metrics.errors++;
      console.error(`❌ Error en INSERT ${table}:`, error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * ➕ INSERT con PostgreSQL
   */
  async insertPostgreSQL(table, data, options) {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
    
    const query = `
      INSERT INTO ${table} (${columns.join(', ')})
      VALUES (${placeholders})
      RETURNING *
    `;
    
    return await postgresClient.secureQuery(query, values);
  }

  /**
   * ➕ INSERT con Supabase
   */
  async insertSupabase(table, data, options) {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .insert([data])
        .select();
      
      if (error) throw error;
      
      return {
        success: true,
        data: result,
        rowCount: result?.length || 0
      };
      
    } catch (error) {
      throw error;
    }
  }

  /**
   * 🔄 UPDATE - Actualización segura
   */
  async update(table, id, data, options = {}) {
    const startTime = Date.now();
    this.metrics.queries++;
    
    try {
      // Validar tabla
      if (!this.isValidTable(table)) {
        throw new Error(`Tabla no permitida: ${table}`);
      }
      
      // Sanitizar datos
      const sanitizedData = this.sanitizeData(data);
      
      // Agregar updated_at
      if (this.hasColumn(table, 'updated_at')) {
        sanitizedData.updated_at = new Date().toISOString();
      }
      
      let result;
      
      if (this.connectionMode === 'postgresql') {
        result = await this.updatePostgreSQL(table, id, sanitizedData, options);
      } else if (this.connectionMode === 'supabase') {
        result = await this.updateSupabase(table, id, sanitizedData, options);
      } else {
        throw new Error('No hay conexión a base de datos');
      }
      
      // Invalidar cache
      this.invalidateCache(table);
      
      // Actualizar métricas
      const responseTime = Date.now() - startTime;
      this.updateMetrics(responseTime);
      
      return result;
      
    } catch (error) {
      this.metrics.errors++;
      console.error(`❌ Error en UPDATE ${table}:`, error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 🔄 UPDATE con PostgreSQL
   */
  async updatePostgreSQL(table, id, data, options) {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const setClause = columns.map((col, index) => `${col} = $${index + 1}`).join(', ');
    
    // Agregar ID al final de los parámetros
    values.push(id);
    const idParam = `$${values.length}`;
    
    // Agregar tenant_id si es necesario
    let whereClause = `id = ${idParam}`;
    if (options.tenantId && this.hasColumn(table, 'tenant_id')) {
      values.push(options.tenantId);
      whereClause += ` AND tenant_id = $${values.length}`;
    }
    
    const query = `
      UPDATE ${table}
      SET ${setClause}
      WHERE ${whereClause}
      RETURNING *
    `;
    
    return await postgresClient.secureQuery(query, values);
  }

  /**
   * 🔄 UPDATE con Supabase
   */
  async updateSupabase(table, id, data, options) {
    try {
      let query = supabase
        .from(table)
        .update(data)
        .eq('id', id);
      
      // Multi-tenancy
      if (options.tenantId && this.hasColumn(table, 'tenant_id')) {
        query = query.eq('tenant_id', options.tenantId);
      }
      
      const { data: result, error } = await query.select();
      
      if (error) throw error;
      
      return {
        success: true,
        data: result,
        rowCount: result?.length || 0
      };
      
    } catch (error) {
      throw error;
    }
  }

  /**
   * ❌ DELETE - Eliminación segura (preferir soft delete)
   */
  async delete(table, id, options = {}) {
    const startTime = Date.now();
    this.metrics.queries++;
    
    try {
      // Validar tabla
      if (!this.isValidTable(table)) {
        throw new Error(`Tabla no permitida: ${table}`);
      }
      
      // Preferir soft delete si la tabla lo soporta
      if (this.hasColumn(table, 'deleted_at') && !options.hardDelete) {
        return await this.update(table, id, { deleted_at: new Date().toISOString() }, options);
      }
      
      let result;
      
      if (this.connectionMode === 'postgresql') {
        result = await this.deletePostgreSQL(table, id, options);
      } else if (this.connectionMode === 'supabase') {
        result = await this.deleteSupabase(table, id, options);
      } else {
        throw new Error('No hay conexión a base de datos');
      }
      
      // Invalidar cache
      this.invalidateCache(table);
      
      // Actualizar métricas
      const responseTime = Date.now() - startTime;
      this.updateMetrics(responseTime);
      
      return result;
      
    } catch (error) {
      this.metrics.errors++;
      console.error(`❌ Error en DELETE ${table}:`, error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * ❌ DELETE con PostgreSQL
   */
  async deletePostgreSQL(table, id, options) {
    const params = [id];
    let whereClause = 'id = $1';
    
    // Multi-tenancy
    if (options.tenantId && this.hasColumn(table, 'tenant_id')) {
      params.push(options.tenantId);
      whereClause += ` AND tenant_id = $${params.length}`;
    }
    
    const query = `
      DELETE FROM ${table}
      WHERE ${whereClause}
      RETURNING id
    `;
    
    return await postgresClient.secureQuery(query, params);
  }

  /**
   * ❌ DELETE con Supabase
   */
  async deleteSupabase(table, id, options) {
    try {
      let query = supabase
        .from(table)
        .delete()
        .eq('id', id);
      
      // Multi-tenancy
      if (options.tenantId && this.hasColumn(table, 'tenant_id')) {
        query = query.eq('tenant_id', options.tenantId);
      }
      
      const { data: result, error } = await query.select();
      
      if (error) throw error;
      
      return {
        success: true,
        data: result,
        rowCount: result?.length || 0
      };
      
    } catch (error) {
      throw error;
    }
  }

  /**
   * 🔐 UTILIDADES DE SEGURIDAD
   */
  
  // Lista blanca de tablas permitidas
  isValidTable(table) {
    const allowedTables = [
      'mapeo_datos_rat',
      'proveedores',
      'evaluaciones_impacto_privacidad',
      'documentos_dpa',
      'dpo_notifications',
      'generated_documents',
      'organizaciones',
      'usuarios',
      'actividades_dpo',
      'audit_log'
      // Agregar más tablas según necesidad
    ];
    
    return allowedTables.includes(table);
  }

  // Sanitizar datos de entrada
  sanitizeData(data) {
    const sanitized = {};
    
    for (const [key, value] of Object.entries(data)) {
      // Remover caracteres peligrosos de las keys
      const cleanKey = key.replace(/[^a-zA-Z0-9_]/g, '');
      
      // Sanitizar valores según tipo
      if (typeof value === 'string') {
        // Prevenir SQL injection básico
        sanitized[cleanKey] = value.replace(/['";\\]/g, '');
      } else if (value === null || value === undefined) {
        sanitized[cleanKey] = null;
      } else if (typeof value === 'object') {
        // Para JSON/JSONB
        sanitized[cleanKey] = JSON.stringify(value);
      } else {
        sanitized[cleanKey] = value;
      }
    }
    
    return sanitized;
  }

  // Verificar si tabla tiene columna
  hasColumn(table, column) {
    // Mapa de columnas por tabla (mejorar con metadata dinámico)
    const tableColumns = {
      mapeo_datos_rat: ['id', 'tenant_id', 'nombre_actividad', 'created_at', 'updated_at', 'deleted_at'],
      proveedores: ['id', 'tenant_id', 'nombre', 'created_at', 'updated_at', 'deleted_at'],
      // Agregar más mapeos según necesidad
    };
    
    return tableColumns[table]?.includes(column) || false;
  }

  /**
   * 📦 GESTIÓN DE CACHE
   */
  
  generateCacheKey(operation, table, options) {
    return `${operation}:${table}:${JSON.stringify(options)}`;
  }

  getFromCache(key) {
    if (!cache.has(key)) {
      return null;
    }
    
    const timestamp = cacheTimestamps.get(key);
    const age = Date.now() - timestamp;
    
    if (age > CACHE_TTL) {
      // Cache expirado
      cache.delete(key);
      cacheTimestamps.delete(key);
      return null;
    }
    
    return cache.get(key);
  }

  saveToCache(key, value) {
    cache.set(key, value);
    cacheTimestamps.set(key, Date.now());
    
    // Limitar tamaño del cache
    if (cache.size > 1000) {
      // Eliminar entradas más antiguas
      const sortedKeys = Array.from(cacheTimestamps.entries())
        .sort((a, b) => a[1] - b[1])
        .slice(0, 100);
      
      for (const [oldKey] of sortedKeys) {
        cache.delete(oldKey);
        cacheTimestamps.delete(oldKey);
      }
    }
  }

  invalidateCache(table = null) {
    if (!table) {
      // Invalidar todo el cache
      cache.clear();
      cacheTimestamps.clear();
    } else {
      // Invalidar solo cache de una tabla
      for (const key of cache.keys()) {
        if (key.includes(table)) {
          cache.delete(key);
          cacheTimestamps.delete(key);
        }
      }
    }
  }

  startCacheCleanup() {
    // Limpiar cache expirado cada 5 minutos
    setInterval(() => {
      const now = Date.now();
      for (const [key, timestamp] of cacheTimestamps.entries()) {
        if (now - timestamp > CACHE_TTL) {
          cache.delete(key);
          cacheTimestamps.delete(key);
        }
      }
    }, 300000);
  }

  /**
   * 📊 MÉTRICAS Y MONITOREO
   */
  
  updateMetrics(responseTime) {
    const currentAvg = this.metrics.avgResponseTime;
    const totalQueries = this.metrics.queries;
    
    // Calcular nuevo promedio móvil
    this.metrics.avgResponseTime = ((currentAvg * (totalQueries - 1)) + responseTime) / totalQueries;
  }

  getMetrics() {
    return {
      ...this.metrics,
      connectionMode: this.connectionMode,
      cacheSize: cache.size,
      cacheHitRate: this.metrics.queries > 0 
        ? (this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses)) * 100 
        : 0,
      errorRate: this.metrics.queries > 0 
        ? (this.metrics.errors / this.metrics.queries) * 100 
        : 0
    };
  }

  /**
   * 🔌 ESTADO DE CONEXIÓN
   */
  
  async getConnectionStatus() {
    const status = {
      mode: this.connectionMode,
      connected: false,
      health: 'unknown',
      details: {}
    };
    
    try {
      if (this.connectionMode === 'postgresql') {
        const poolStats = postgresClient.getPoolStats();
        status.connected = poolStats.status === 'connected';
        status.health = poolStats.status;
        status.details = poolStats;
      } else if (this.connectionMode === 'supabase') {
        const { data, error } = await supabase
          .from('organizaciones')
          .select('count')
          .limit(1);
        
        status.connected = !error;
        status.health = error ? 'unhealthy' : 'healthy';
        status.details = { error: error?.message };
      }
    } catch (error) {
      status.health = 'error';
      status.details = { error: error.message };
    }
    
    return status;
  }
}

// Exportar instancia singleton
const databaseService = new DatabaseService();

// Auto-inicializar si estamos en el cliente
if (typeof window !== 'undefined') {
  databaseService.initialize().catch(console.error);
}

export default databaseService;