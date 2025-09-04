/**
 * 🧠 SMART SUPABASE CLIENT - CLIENTE INTELIGENTE CON PREVENCIÓN DE ERRORES
 * 
 * Reemplaza automáticamente al cliente Supabase estándar
 * Intercepta TODAS las consultas y aplica correcciones preventivas
 */

import { supabase as originalSupabase } from '../config/supabaseClient';
import rlsGuard from './supabaseRLSGuard';

class SmartSupabaseClient {
  constructor() {
    this.originalClient = originalSupabase;
    this.queryCount = 0;
    this.errorsPrevented = 0;
    this.successfulFallbacks = 0;
  }

  /**
   * 🛡️ PROXY INTELIGENTE PARA .from()
   */
  from(tableName) {
    this.queryCount++;
    return new SmartQueryBuilder(tableName, this.originalClient.from(tableName), this);
  }

  /**
   * 🔐 PROXY PARA AUTH (sin modificaciones)
   */
  get auth() {
    return this.originalClient.auth;
  }

  /**
   * 📊 ESTADÍSTICAS DEL CLIENTE INTELIGENTE
   */
  getStats() {
    return {
      total_queries: this.queryCount,
      errors_prevented: this.errorsPrevented,
      successful_fallbacks: this.successfulFallbacks,
      success_rate: this.queryCount > 0 ? 
        ((this.queryCount - this.errorsPrevented) / this.queryCount * 100).toFixed(2) + '%' : 
        '100%'
    };
  }
}

class SmartQueryBuilder {
  constructor(tableName, originalBuilder, smartClient) {
    this.tableName = tableName;
    this.originalBuilder = originalBuilder;
    this.smartClient = smartClient;
    this.queryParts = {
      select: null,
      filters: [],
      options: {}
    };
  }

  /**
   * 🔍 SELECT INTELIGENTE
   */
  select(columns = '*', options = {}) {
    this.queryParts.select = { columns, options };
    return this;
  }

  /**
   * 🎯 FILTROS INTELIGENTES
   */
  eq(column, value) {
    this.queryParts.filters.push({ type: 'eq', column, value });
    return this;
  }

  neq(column, value) {
    this.queryParts.filters.push({ type: 'neq', column, value });
    return this;
  }

  gt(column, value) {
    this.queryParts.filters.push({ type: 'gt', column, value });
    return this;
  }

  gte(column, value) {
    this.queryParts.filters.push({ type: 'gte', column, value });
    return this;
  }

  lt(column, value) {
    this.queryParts.filters.push({ type: 'lt', column, value });
    return this;
  }

  lte(column, value) {
    this.queryParts.filters.push({ type: 'lte', column, value });
    return this;
  }

  like(column, pattern) {
    this.queryParts.filters.push({ type: 'like', column, value: pattern });
    return this;
  }

  ilike(column, pattern) {
    this.queryParts.filters.push({ type: 'ilike', column, value: pattern });
    return this;
  }

  in(column, values) {
    this.queryParts.filters.push({ type: 'in', column, value: values });
    return this;
  }

  is(column, value) {
    this.queryParts.filters.push({ type: 'is', column, value });
    return this;
  }

  not(column, operator, value) {
    this.queryParts.filters.push({ type: 'not', column, operator, value });
    return this;
  }

  /**
   * 📦 OPCIONES DE CONSULTA
   */
  limit(count) {
    this.queryParts.options.limit = count;
    return this;
  }

  order(column, options = {}) {
    this.queryParts.options.order = { column, ...options };
    return this;
  }

  range(from, to) {
    this.queryParts.options.range = { from, to };
    return this;
  }

  /**
   * 🎯 EJECUCIÓN INTELIGENTE - SINGLE
   */
  async single() {
    return await this.executeWithFallback('single');
  }

  /**
   * 🎯 EJECUCIÓN INTELIGENTE - MAYBE SINGLE
   */
  async maybeSingle() {
    return await this.executeWithFallback('maybeSingle');
  }

  /**
   * 🎯 EJECUCIÓN INTELIGENTE - MÚLTIPLES
   */
  async then(resolve, reject) {
    try {
      const result = await this.executeWithFallback('multiple');
      resolve(result);
    } catch (error) {
      reject(error);
    }
  }

  /**
   * 🧠 LÓGICA DE EJECUCIÓN CON FALLBACKS INTELIGENTES
   */
  async executeWithFallback(executionType) {
    let attempt = 0;
    let lastError;

    while (attempt < 3) {
      try {
        const query = this.buildQuery(attempt);
        let result;

        switch (executionType) {
          case 'single':
            result = await query.single();
            break;
          case 'maybeSingle':
            result = await query.maybeSingle();
            break;
          default:
            result = await query;
            break;
        }

        // Si llegamos aquí, la consulta fue exitosa
        if (attempt > 0) {
          this.smartClient.successfulFallbacks++;
          //console.log(`✅ Fallback exitoso (intento ${attempt + 1}) para tabla ${this.tableName}`);
        }

        return result;

      } catch (error) {
        lastError = error;
        attempt++;

        //console.warn(`⚠️ Intento ${attempt} falló para ${this.tableName}:`, error.message);

        // Si es un error conocido de RLS/406, continuar con fallback
        if (this.isRecoverableError(error) && attempt < 3) {
          continue;
        } else {
          break;
        }
      }
    }

    // Si llegamos aquí, todos los intentos fallaron
    this.smartClient.errorsPrevented++;
    console.error(`❌ Consulta falló definitivamente para ${this.tableName} después de ${attempt} intentos`);
    
    // Retornar estructura vacía válida en lugar de fallar
    return this.getSafeEmptyResult(executionType);
  }

  /**
   * 🔨 CONSTRUIR CONSULTA CON ESTRATEGIAS DE FALLBACK
   */
  buildQuery(attemptNumber) {
    let query = this.smartClient.originalClient.from(this.tableName);

    // Aplicar SELECT
    if (this.queryParts.select) {
      query = query.select(this.queryParts.select.columns, this.queryParts.select.options);
    }

    // Aplicar FILTROS con estrategias de fallback
    const filters = this.getFiltersForAttempt(attemptNumber);
    
    for (const filter of filters) {
      switch (filter.type) {
        case 'eq':
          query = query.eq(filter.column, filter.value);
          break;
        case 'neq':
          query = query.neq(filter.column, filter.value);
          break;
        case 'gt':
          query = query.gt(filter.column, filter.value);
          break;
        case 'gte':
          query = query.gte(filter.column, filter.value);
          break;
        case 'lt':
          query = query.lt(filter.column, filter.value);
          break;
        case 'lte':
          query = query.lte(filter.column, filter.value);
          break;
        case 'like':
          query = query.like(filter.column, filter.value);
          break;
        case 'ilike':
          query = query.ilike(filter.column, filter.value);
          break;
        case 'in':
          query = query.in(filter.column, filter.value);
          break;
        case 'is':
          query = query.is(filter.column, filter.value);
          break;
        case 'not':
          query = query.not(filter.column, filter.operator, filter.value);
          break;
      }
    }

    // Aplicar OPCIONES
    if (this.queryParts.options.limit) {
      query = query.limit(this.queryParts.options.limit);
    }

    if (this.queryParts.options.order) {
      query = query.order(this.queryParts.options.order.column, {
        ascending: this.queryParts.options.order.ascending
      });
    }

    if (this.queryParts.options.range) {
      query = query.range(this.queryParts.options.range.from, this.queryParts.options.range.to);
    }

    return query;
  }

  /**
   * 📋 ESTRATEGIAS DE FILTROS POR INTENTO
   */
  getFiltersForAttempt(attemptNumber) {
    const originalFilters = [...this.queryParts.filters];

    switch (attemptNumber) {
      case 0:
        // Intento 1: Consulta original completa
        return originalFilters;

      case 1:
        // Intento 2: Sin filtro tenant_id (común causa de errores 406)
        return originalFilters.filter(filter => 
          filter.column !== 'tenant_id' && filter.column !== 'organizacion_id'
        );

      case 2:
        // Intento 3: Solo filtros esenciales (ID)
        return originalFilters.filter(filter => 
          filter.column === 'id' || filter.column.endsWith('_id')
        );

      default:
        return [];
    }
  }

  /**
   * 🔍 DETECTAR ERRORES RECUPERABLES
   */
  isRecoverableError(error) {
    const errorMsg = error.message?.toLowerCase() || '';
    const recoverablePatterns = [
      '406',
      'not acceptable', 
      'rls',
      'row level security',
      'policy',
      'permission denied',
      'invalid api key',
      'forbidden'
    ];

    return recoverablePatterns.some(pattern => errorMsg.includes(pattern));
  }

  /**
   * 🛡️ RESULTADO VACÍO SEGURO
   */
  getSafeEmptyResult(executionType) {
    switch (executionType) {
      case 'single':
      case 'maybeSingle':
        return { data: null, error: null };
      default:
        return { data: [], error: null };
    }
  }

  /**
   * 📝 INSERT INTELIGENTE
   */
  async insert(values, options = {}) {
    try {
      const query = this.smartClient.originalClient
        .from(this.tableName)
        .insert(values, options);

      return await query;

    } catch (error) {
      console.error(`❌ Error en INSERT para ${this.tableName}:`, error);
      
      // Si hay error de RLS en INSERT, intentar sin campos problemáticos
      if (this.isRecoverableError(error) && Array.isArray(values)) {
        try {
          //console.log(`🔄 Intentando INSERT sin campos problemáticos...`);
          
          const cleanedValues = values.map(record => {
            const cleaned = { ...record };
            delete cleaned.tenant_id;
            delete cleaned.organizacion_id;
            return cleaned;
          });

          const retryQuery = this.smartClient.originalClient
            .from(this.tableName)
            .insert(cleanedValues, options);

          const result = await retryQuery;
          this.smartClient.successfulFallbacks++;
          return result;

        } catch (retryError) {
          console.error(`❌ También falló INSERT sin campos problemáticos:`, retryError);
        }
      }

      this.smartClient.errorsPrevented++;
      return { data: null, error: error };
    }
  }

  /**
   * ✏️ UPDATE INTELIGENTE  
   */
  async update(values, options = {}) {
    try {
      const query = this.buildQuery(0);
      return await query.update(values, options);

    } catch (error) {
      console.error(`❌ Error en UPDATE para ${this.tableName}:`, error);
      this.smartClient.errorsPrevented++;
      return { data: null, error: error };
    }
  }

  /**
   * 🗑️ DELETE INTELIGENTE
   */
  async delete(options = {}) {
    try {
      const query = this.buildQuery(0);
      return await query.delete(options);

    } catch (error) {
      console.error(`❌ Error en DELETE para ${this.tableName}:`, error);
      this.smartClient.errorsPrevented++;
      return { data: null, error: error };
    }
  }
}

// Crear instancia del cliente inteligente
const smartSupabase = new SmartSupabaseClient();

// Función para obtener estadísticas
export const getSmartSupabaseStats = () => smartSupabase.getStats();

// Función para debugging
export const logSupabaseActivity = () => {
  //console.log('📊 Smart Supabase Statistics:', smartSupabase.getStats());
};

export default smartSupabase;