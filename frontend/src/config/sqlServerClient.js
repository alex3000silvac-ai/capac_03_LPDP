/**
 * ================================================================================
 * CLIENTE SQL SERVER CENTRALIZADO - SISTEMA LPDP
 * ================================================================================
 * MIGRADO DESDE SUPABASE A SQL SERVER
 * - Reemplaza completamente supabaseClient.js
 * - Conexión unificada al backend con SQL Server
 * - Mantiene compatibilidad con componentes existentes
 * - Servidor: PASC\LPDP_Test (Windows Authentication)
 * ================================================================================
 */

// Configuración del backend SQL Server
const BACKEND_CONFIG = {
  // URL del backend FastAPI que conecta a SQL Server
  baseURL: process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000',
  
  // Endpoints principales
  endpoints: {
    health: '/health',
    auth: '/api/v1/auth',
    users: '/api/v1/usuarios',
    organizations: '/api/v1/organizaciones',
    rats: '/api/v1/rats',
    eipds: '/api/v1/eipds',
    providers: '/api/v1/proveedores',
    notifications: '/api/v1/notificaciones',
    audit: '/api/v1/audit'
  },
  
  // Configuración de requests
  timeout: 30000,
  retries: 3
};

console.log('🚀 Iniciando cliente SQL Server CENTRALIZADO para LPDP');
console.log('📡 Backend URL:', BACKEND_CONFIG.baseURL);
console.log('🔗 Servidor SQL Server: PASC\\LPDP_Test');

/**
 * Cliente HTTP para conectar con el backend SQL Server
 */
class SQLServerClient {
  constructor() {
    this.baseURL = BACKEND_CONFIG.baseURL;
    this.currentUser = null;
    this.currentTenant = null;
    
    // Headers por defecto
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'X-Client-Version': '3.0.0',
      'X-Database-Type': 'SQLServer'
    };
  }

  /**
   * Realizar request HTTP al backend
   */
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      method: 'GET',
      headers: {
        ...this.defaultHeaders,
        ...options.headers
      },
      timeout: BACKEND_CONFIG.timeout,
      ...options
    };

    // Agregar token de autenticación si existe
    if (this.currentUser?.token) {
      config.headers['Authorization'] = `Bearer ${this.currentUser.token}`;
    }

    // Agregar tenant_id si existe
    if (this.currentTenant) {
      config.headers['X-Tenant-ID'] = this.currentTenant;
    }

    try {
      console.log(`📤 SQL Server Request: ${config.method} ${url}`);
      
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`📥 SQL Server Response: ${response.status} OK`);
      
      return {
        data,
        error: null,
        status: response.status,
        statusText: response.statusText
      };

    } catch (error) {
      console.error(`❌ SQL Server Error: ${error.message}`);
      
      return {
        data: null,
        error: {
          message: error.message,
          code: error.code || 'NETWORK_ERROR'
        }
      };
    }
  }

  /**
   * Simular la API de Supabase para compatibilidad
   */
  from(tableName) {
    return new SQLServerQueryBuilder(this, tableName);
  }

  /**
   * Autenticación (simulada para compatibilidad)
   */
  get auth() {
    return {
      getUser: async () => {
        const response = await this.makeRequest('/api/v1/auth/user');
        return {
          data: { user: response.data },
          error: response.error
        };
      },
      
      getSession: async () => {
        const response = await this.makeRequest('/api/v1/auth/session');
        return {
          data: { session: response.data },
          error: response.error
        };
      },
      
      signInWithPassword: async ({ email, password }) => {
        const response = await this.makeRequest('/api/v1/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password })
        });
        
        if (response.data) {
          this.currentUser = response.data;
        }
        
        return response;
      },
      
      signOut: async () => {
        this.currentUser = null;
        this.currentTenant = null;
        
        return await this.makeRequest('/api/v1/auth/logout', {
          method: 'POST'
        });
      }
    };
  }

  /**
   * Health check del sistema
   */
  async checkHealth() {
    try {
      const response = await this.makeRequest('/health');
      return {
        online: response.data?.status === 'healthy',
        database: response.data?.database || 'unknown',
        server: 'SQL Server PASC\\LPDP_Test'
      };
    } catch (error) {
      return {
        online: false,
        database: 'disconnected',
        error: error?.message || 'Unknown error'
      };
    }
  }
}

/**
 * Constructor de consultas compatible con Supabase
 */
class SQLServerQueryBuilder {
  constructor(client, tableName) {
    this.client = client;
    this.tableName = tableName;
    this.query = {
      select: '*',
      filters: [],
      orderBy: null,
      limit: null,
      offset: null
    };
  }

  select(columns = '*') {
    this.query.select = columns;
    return this;
  }

  eq(column, value) {
    this.query.filters.push({ column, operator: 'eq', value });
    return this;
  }

  neq(column, value) {
    this.query.filters.push({ column, operator: 'neq', value });
    return this;
  }

  like(column, pattern) {
    this.query.filters.push({ column, operator: 'like', value: pattern });
    return this;
  }

  order(column, options = {}) {
    this.query.orderBy = { column, ascending: options.ascending !== false };
    return this;
  }

  limit(count) {
    this.query.limit = count;
    return this;
  }

  range(from, to) {
    this.query.offset = from;
    this.query.limit = to - from + 1;
    return this;
  }

  async execute() {
    // Construir endpoint basado en la tabla
    let endpoint = BACKEND_CONFIG.endpoints[this.tableName] || `/api/v1/${this.tableName}`;
    
    // Construir query parameters
    const params = new URLSearchParams();
    
    if (this.query.select !== '*') {
      params.append('select', this.query.select);
    }
    
    this.query.filters.forEach(filter => {
      params.append(`${filter.column}`, `${filter.operator}.${filter.value}`);
    });
    
    if (this.query.orderBy) {
      params.append('order', `${this.query.orderBy.column}.${this.query.orderBy.ascending ? 'asc' : 'desc'}`);
    }
    
    if (this.query.limit) {
      params.append('limit', this.query.limit);
    }
    
    if (this.query.offset) {
      params.append('offset', this.query.offset);
    }
    
    const queryString = params.toString();
    if (queryString) {
      endpoint += `?${queryString}`;
    }
    
    return await this.client.makeRequest(endpoint);
  }

  // Métodos que ejecutan inmediatamente
  then(resolve, reject) {
    return this.execute().then(resolve, reject);
  }

  async single() {
    const response = await this.execute();
    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      return {
        ...response,
        data: response.data[0]
      };
    }
    return response;
  }

  async maybeSingle() {
    const response = await this.execute();
    if (response.data && Array.isArray(response.data)) {
      if (response.data.length > 0) {
        return {
          ...response,
          data: response.data[0]
        };
      } else {
        return {
          ...response,
          data: null
        };
      }
    }
    return response;
  }

  async insert(data) {
    const endpoint = BACKEND_CONFIG.endpoints[this.tableName] || `/api/v1/${this.tableName}`;
    
    return await this.client.makeRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async update(data) {
    const endpoint = BACKEND_CONFIG.endpoints[this.tableName] || `/api/v1/${this.tableName}`;
    
    return await this.client.makeRequest(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async delete() {
    const endpoint = BACKEND_CONFIG.endpoints[this.tableName] || `/api/v1/${this.tableName}`;
    
    return await this.client.makeRequest(endpoint, {
      method: 'DELETE'
    });
  }
}

// =============================================================================
// FUNCIONES DE COMPATIBILIDAD CON SUPABASE
// =============================================================================

/**
 * Obtener tenant actual (migrado desde Supabase)
 */
export const getCurrentTenant = async () => {
  try {
    const response = await sqlServerClient.makeRequest('/api/v1/auth/tenant');
    return response.data?.tenant_id || null;
  } catch (error) {
    console.error('Error obteniendo tenant actual:', error);
    return null;
  }
};

/**
 * Estado de conectividad (migrado desde Supabase)
 */
export const getConnectivityStatus = async () => {
  return await sqlServerClient.checkHealth();
};

/**
 * Cliente con contexto de tenant (migrado desde Supabase)
 */
export const sqlServerWithTenant = (tenantId) => {
  const client = new SQLServerClient();
  client.currentTenant = tenantId;
  return client;
};

// =============================================================================
// INSTANCIA GLOBAL Y EXPORTACIONES
// =============================================================================

// Instancia global del cliente SQL Server
const sqlServerClient = new SQLServerClient();

// Verificar conexión inicial
sqlServerClient.checkHealth().then(status => {
  if (status.online) {
    console.log('✅ SQL Server conectado correctamente');
    console.log(`🗄️ Base de datos: ${status.database}`);
  } else {
    console.log('❌ SQL Server desconectado');
    console.error('Error:', status.error);
  }
});

// Exportar cliente principal (compatible con import { supabase })
export { sqlServerClient as supabase };
export default sqlServerClient;

// Exportar también como sqlServerClient para claridad
export { sqlServerClient };

/**
 * INSTRUCCIONES DE MIGRACIÓN PARA DESARROLLADORES:
 * 
 * 1. Cambiar imports:
 *    // Antes:
 *    import { supabase } from '../config/supabaseClient';
 *    
 *    // Después:
 *    import { supabase } from '../config/sqlServerClient';
 * 
 * 2. La API sigue siendo compatible:
 *    const { data, error } = await supabase
 *      .from('usuarios')
 *      .select('*')
 *      .eq('email', 'usuario@example.com');
 * 
 * 3. Las funciones auxiliares siguen funcionando:
 *    const tenant = await getCurrentTenant();
 *    const status = await getConnectivityStatus();
 */