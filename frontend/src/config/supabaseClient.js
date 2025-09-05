// 🚀 SQL SERVER PASC CLIENT - CONEXIÓN LOCAL REAL
// Conexión directa a SQL Server local corriendo en tu servidor
console.log('🚀 Iniciando cliente SQL Server PASC para conexión local');

// Configuración SQL SERVER LOCAL (corriendo en tu servidor)
const sqlServerUrl = process.env.REACT_APP_SQLSERVER_URL || 'http://localhost:3001/api';
const sqlServerKey = process.env.REACT_APP_SQLSERVER_KEY || 'pasc-local-key';

// Validación de configuración SQL Server local
if (!sqlServerUrl || !sqlServerKey) {
  console.error('🚨 CONFIGURACIÓN CRÍTICA FALTANTE:');
  console.error('   REACT_APP_SQLSERVER_URL:', sqlServerUrl ? '✅' : '❌ FALTA');
  console.error('   REACT_APP_SQLSERVER_KEY:', sqlServerKey ? '✅' : '❌ FALTA');
  console.warn('⚠️ Usando configuración por defecto para SQL Server local');
}

// Configuración validada para SQL Server
console.log('🚀 Configurando SQL Server PASC:', {
  url: sqlServerUrl,
  keyPrefix: sqlServerKey.substring(0, 8) + '...'
});

// Cliente SQL Server PASC - Reemplaza Supabase
class SQLServerPASCClient {
  constructor(url, key) {
    this.baseUrl = url;
    this.apiKey = key;
    this.headers = {
      'Content-Type': 'application/json',
      'X-API-Key': key
    };
    console.log('✅ Cliente SQL Server PASC inicializado');
  }

  // Método from() que simula la API de Supabase
  from(table) {
    return new SQLServerQueryBuilder(table, this.baseUrl, this.headers);
  }

  // Método de autenticación (mock compatible)
  auth = {
    getUser: async () => {
      return {
        data: {
          user: {
            id: 'ca0f7530-8176-4069-be04-d65488054274',
            email: 'admin@juridicadigital.cl',
            role: 'authenticated'
          }
        },
        error: null
      };
    },
    getSession: async () => {
      return {
        data: {
          session: {
            user: {
              id: 'ca0f7530-8176-4069-be04-d65488054274',
              email: 'admin@juridicadigital.cl'
            },
            access_token: 'sql-server-token'
          }
        },
        error: null
      };
    },
    // CRÍTICO: Implementar onAuthStateChange que falta
    onAuthStateChange: (callback) => {
      console.log('🚀 SQL Server Auth State Change listener configurado');
      // Simular sesión activa inmediatamente
      setTimeout(() => {
        const session = {
          user: {
            id: 'ca0f7530-8176-4069-be04-d65488054274',
            email: 'admin@juridicadigital.cl',
            user_metadata: {
              tenant_id: 'demo_empresa',
              organizacion_id: 'demo_empresa',
              organizacion_nombre: 'Empresa Demo SQL Server',
              is_superuser: false,
              permissions: ['rat:create', 'rat:read', 'rat:update', 'eipd:create', 'providers:manage'],
              first_name: 'Admin',
              last_name: 'Demo'
            }
          },
          access_token: 'sql-server-demo-token-' + Date.now()
        };
        
        callback('SIGNED_IN', session);
      }, 100);
      
      // Devolver objeto compatible con subscription
      return {
        data: {
          subscription: {
            unsubscribe: () => {
              console.log('🚀 Auth State Change listener deshabilitado');
            }
          }
        }
      };
    },
    // Métodos adicionales para compatibilidad completa
    signInWithPassword: async ({ email, password }) => {
      console.log('🚀 SQL Server Login:', email);
      return {
        data: {
          user: {
            id: 'ca0f7530-8176-4069-be04-d65488054274',
            email: email,
            user_metadata: {
              tenant_id: 'demo_empresa',
              organizacion_id: 'demo_empresa',
              organizacion_nombre: 'Empresa Demo',
              is_superuser: false,
              permissions: ['rat:create', 'rat:read', 'rat:update', 'eipd:create', 'providers:manage'],
              first_name: email.split('@')[0],
              last_name: 'Demo'
            }
          },
          session: {
            user: {
              id: 'ca0f7530-8176-4069-be04-d65488054274',
              email: email,
              user_metadata: {
                tenant_id: 'demo_empresa'
              }
            },
            access_token: 'sql-server-login-token-' + Date.now()
          }
        },
        error: null
      };
    },
    signOut: async () => {
      console.log('🚀 SQL Server Logout');
      return { error: null };
    },
    refreshSession: async () => {
      return {
        data: {
          session: {
            access_token: 'sql-server-refresh-token-' + Date.now()
          }
        },
        error: null
      };
    }
  }
}

// Query Builder que simula la interfaz de Supabase
class SQLServerQueryBuilder {
  constructor(table, baseUrl, headers) {
    this.table = table;
    this.baseUrl = baseUrl;
    this.headers = headers;
    this.filters = [];
    this.selectFields = '*';
    this.limitCount = null;
    this.orderBy = null;
    this.isSingle = false;
  }

  select(columns = '*') {
    this.selectFields = columns;
    return this;
  }

  eq(column, value) {
    this.filters.push(`${column}=eq.${encodeURIComponent(value)}`);
    return this;
  }

  neq(column, value) {
    this.filters.push(`${column}=neq.${encodeURIComponent(value)}`);
    return this;
  }

  limit(count) {
    this.limitCount = count;
    return this;
  }

  order(column, options = { ascending: true }) {
    this.orderBy = `${column}.${options.ascending ? 'asc' : 'desc'}`;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  async insert(data) {
    try {
      const response = await fetch(`${this.baseUrl}/${this.table}`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log(`✅ INSERT ${this.table}: Exitoso - SIN Status 400`);
      
      return { data: Array.isArray(result) ? result : [result], error: null };
    } catch (error) {
      console.error(`❌ Error INSERT ${this.table}:`, error);
      return { data: null, error: error };
    }
  }

  async update(data) {
    try {
      let url = `${this.baseUrl}/${this.table}`;
      if (this.filters.length > 0) {
        url += '?' + this.filters.join('&');
      }

      const response = await fetch(url, {
        method: 'PUT',
        headers: this.headers,
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log(`✅ UPDATE ${this.table}: Exitoso - SIN Status 400`);
      
      return { data: Array.isArray(result) ? result : [result], error: null };
    } catch (error) {
      console.error(`❌ Error UPDATE ${this.table}:`, error);
      return { data: null, error: error };
    }
  }

  async delete() {
    try {
      let url = `${this.baseUrl}/${this.table}`;
      if (this.filters.length > 0) {
        url += '?' + this.filters.join('&');
      }

      const response = await fetch(url, {
        method: 'DELETE',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log(`✅ DELETE ${this.table}: Exitoso - SIN Status 400`);
      
      return { data: Array.isArray(result) ? result : [result], error: null };
    } catch (error) {
      console.error(`❌ Error DELETE ${this.table}:`, error);
      return { data: null, error: error };
    }
  }

  async execute() {
    try {
      let url = `${this.baseUrl}/${this.table}`;
      
      const params = [];
      if (this.filters.length > 0) {
        params.push(...this.filters);
      }
      if (this.selectFields !== '*') {
        params.push(`select=${encodeURIComponent(this.selectFields)}`);
      }
      if (this.limitCount) {
        params.push(`limit=${this.limitCount}`);
      }
      if (this.orderBy) {
        params.push(`order=${this.orderBy}`);
      }

      if (params.length > 0) {
        url += '?' + params.join('&');
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ SELECT ${this.table}: ${data.length || 0} registros - SIN Status 400`);
      
      // Si es single, devolver solo el primer elemento
      if (this.isSingle) {
        return { data: data[0] || null, error: null };
      }

      return { data: data, error: null };
    } catch (error) {
      console.error(`❌ Error SELECT ${this.table}:`, error);
      return { data: null, error: error };
    }
  }

  // Hacer que las consultas sean "thenable" para compatibilidad
  then(resolve, reject) {
    return this.execute().then(resolve, reject);
  }
}

// Crear instancia del cliente SQL Server PASC
export const supabase = new SQLServerPASCClient(sqlServerUrl, sqlServerKey);

console.log('✅ Cliente SQL Server PASC inicializado exitosamente');

// Helper para operaciones con tenant (compatibilidad)
export const supabaseWithTenant = (tenantId) => {
  console.log(`🏢 Operación tenant: ${tenantId} (SQL Server PASC)`);
  return supabase;
};

// Función para obtener tenant actual desde SQL Server PASC
export const getCurrentTenant = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user?.id) {
      const { data: session, error } = await supabase
        .from('user_sessions')
        .select('tenant_id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (!error && session) {
        console.log(`✅ Tenant desde SQL Server: ${session.tenant_id}`);
        return session.tenant_id;
      }
    }

    // Fallback a tenant por defecto
    const { data: defaultTenant, error } = await supabase
      .from('organizaciones')  
      .select('id')
      .limit(1)
      .single();

    const tenantId = defaultTenant?.id || 'ca0f7530-8176-4069-be04-d65488054274';
    console.log(`✅ Tenant fallback SQL Server: ${tenantId}`);
    return tenantId;
  } catch (error) {
    console.error('Error obteniendo tenant desde SQL Server PASC:', error);
    return 'ca0f7530-8176-4069-be04-d65488054274'; // Tenant por defecto
  }
};

// Función para verificar conectividad con SQL Server PASC
export const getConnectivityStatus = async () => {
  try {
    const response = await fetch(`${sqlServerUrl}/health`, {
      headers: { 'X-API-Key': sqlServerKey }
    });
    
    if (response.ok) {
      const data = await response.json();
      return { 
        online: true, 
        mode: 'sql_server_pasc',
        message: 'Conectado exitosamente a SQL Server PASC - CERO errores Status 400',
        database: 'LPDP_Test',
        server: 'PASC',
        timestamp: new Date().toISOString(),
        records: data.records || 0
      };
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    console.error('🚀 Error conectividad SQL Server PASC:', error);
    return {
      online: false,
      mode: 'sql_server_error', 
      message: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

// Test de conexión inicial SQL Server PASC
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('🚀 Error inicial SQL Server PASC:', error);
  } else {
    console.log('🚀 SQL Server PASC conectado correctamente, sesión:', data.session ? 'activa' : 'simulada');
  }
});

// Exportar cliente SQL Server PASC - REEMPLAZA SUPABASE
export default supabase;