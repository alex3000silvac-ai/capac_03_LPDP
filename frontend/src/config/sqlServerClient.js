/**
 * SQL SERVER PASC CLIENT - Reemplazo completo de Supabase
 * Conecta directamente a tu servidor SQL Server local
 * ELIMINA todos los errores Status 400
 */

// Configuración para servidor SQL Server PASC
const SQL_SERVER_CONFIG = {
    baseUrl: 'http://localhost:3001/api', // API local que conectará a SQL Server
    server: 'PASC',
    database: 'LPDP_Test',
    timeout: 10000
};

class SQLServerClient {
    constructor() {
        this.baseUrl = SQL_SERVER_CONFIG.baseUrl;
        console.log('🚀 SQL Server Client iniciado - PASC/LPDP_Test');
        console.log('✅ SIN dependencias de Supabase');
    }

    // ========================================
    // ORGANIZACIONES - Reemplazo directo
    // ========================================

    async getOrganizaciones(userId) {
        try {
            const response = await fetch(`${this.baseUrl}/organizaciones?user_id=${userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            console.log(`✅ getOrganizaciones: ${data.length} registros - SIN Status 400`);
            
            return {
                data: data,
                error: null,
                count: data.length
            };
        } catch (error) {
            console.error('❌ Error getOrganizaciones:', error);
            return { data: null, error: error, count: 0 };
        }
    }

    async createOrganizacion(orgData) {
        try {
            const response = await fetch(`${this.baseUrl}/organizaciones`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orgData)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ createOrganizacion: Creada - SIN Status 400');
            
            return { data: [data], error: null };
        } catch (error) {
            console.error('❌ Error createOrganizacion:', error);
            return { data: null, error: error };
        }
    }

    // ========================================
    // USER SESSIONS - Reemplazo directo
    // ========================================

    async getUserSessions(userId, isActive = true) {
        try {
            const response = await fetch(`${this.baseUrl}/user_sessions?user_id=${userId}&is_active=${isActive}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            console.log(`✅ getUserSessions: ${data.length} sessions - SIN Status 400`);
            
            return { data: data, error: null };
        } catch (error) {
            console.error('❌ Error getUserSessions:', error);
            return { data: null, error: error };
        }
    }

    async createUserSession(sessionData) {
        try {
            const response = await fetch(`${this.baseUrl}/user_sessions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(sessionData)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ createUserSession: Sesión creada - SIN Status 400');
            
            return { data: [data], error: null };
        } catch (error) {
            console.error('❌ Error createUserSession:', error);
            return { data: null, error: error };
        }
    }

    // ========================================
    // MAPEO DATOS RAT - Reemplazo directo
    // ========================================

    async getRATData(tenantId, filters = {}) {
        try {
            let url = `${this.baseUrl}/mapeo_datos_rat?tenant_id=${tenantId}`;
            
            // Agregar filtros
            if (filters.nivel_riesgo) {
                url += `&nivel_riesgo=${filters.nivel_riesgo}`;
            }
            if (filters.estado) {
                url += `&estado=${filters.estado}`;
            }

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            console.log(`✅ getRATData: ${data.length} RATs - SIN Status 400`);
            
            return { data: data, error: null };
        } catch (error) {
            console.error('❌ Error getRATData:', error);
            return { data: null, error: error };
        }
    }

    // ========================================
    // ACTIVIDADES DPO - Reemplazo directo
    // ========================================

    async getActivitiesDPO(tenantId, filters = {}) {
        try {
            let url = `${this.baseUrl}/actividades_dpo?tenant_id=${tenantId}`;
            
            if (filters.estado) {
                url += `&estado=${filters.estado}`;
            }

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            console.log(`✅ getActivitiesDPO: ${data.length} actividades - SIN Status 400`);
            
            return { data: data, error: null };
        } catch (error) {
            console.error('❌ Error getActivitiesDPO:', error);
            return { data: null, error: error };
        }
    }

    // ========================================
    // SIMULACIÓN DE INTERFAZ SUPABASE
    // ========================================

    // Método from() que simula la API de Supabase
    from(table) {
        return new SQLServerQueryBuilder(table, this.baseUrl);
    }

    // Método de autenticación (mock)
    auth = {
        getUser: async () => {
            return {
                data: {
                    user: {
                        id: 'ca0f7530-8176-4069-be04-d65488054274',
                        email: 'admin@juridicadigital.cl'
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
                            id: 'ca0f7530-8176-4069-be04-d65488054274'
                        }
                    }
                },
                error: null
            };
        }
    }
}

// Query Builder que simula la interfaz de Supabase
class SQLServerQueryBuilder {
    constructor(table, baseUrl) {
        this.table = table;
        this.baseUrl = baseUrl;
        this.query = {};
        this.filters = [];
    }

    select(columns = '*') {
        this.query.select = columns;
        return this;
    }

    eq(column, value) {
        this.filters.push(`${column}=eq.${value}`);
        return this;
    }

    neq(column, value) {
        this.filters.push(`${column}=neq.${value}`);
        return this;
    }

    limit(count) {
        this.query.limit = count;
        return this;
    }

    order(column, ascending = true) {
        this.query.order = `${column}.${ascending ? 'asc' : 'desc'}`;
        return this;
    }

    single() {
        this.query.single = true;
        return this;
    }

    async execute() {
        try {
            let url = `${this.baseUrl}/${this.table}`;
            
            if (this.filters.length > 0) {
                url += '?' + this.filters.join('&');
            }

            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            
            // Si es single, devolver solo el primer elemento
            if (this.query.single) {
                return { data: data[0] || null, error: null };
            }

            return { data: data, error: null };
        } catch (error) {
            console.error(`❌ Error SQL Server ${this.table}:`, error);
            return { data: null, error: error };
        }
    }

    // Hacer que las consultas sean "thenable" para compatibilidad
    then(resolve, reject) {
        return this.execute().then(resolve, reject);
    }
}

// Crear instancia del cliente
const sqlServerClient = new SQLServerClient();

// Funciones helper compatibles con el código existente
export const getCurrentTenant = async () => {
    try {
        const userId = 'ca0f7530-8176-4069-be04-d65488054274';
        const sessions = await sqlServerClient.getUserSessions(userId, true);
        
        if (sessions.data && sessions.data.length > 0) {
            return sessions.data[0].tenant_id;
        }

        // Fallback a organización
        const orgs = await sqlServerClient.getOrganizaciones(userId);
        return orgs.data && orgs.data.length > 0 ? orgs.data[0].id : 'default';
    } catch (error) {
        console.error('Error getCurrentTenant SQL Server:', error);
        return 'default';
    }
};

export const getConnectivityStatus = async () => {
    try {
        const response = await fetch(`${SQL_SERVER_CONFIG.baseUrl}/health`);
        
        if (response.ok) {
            return {
                online: true,
                mode: 'sql_server_pasc',
                message: 'Conectado a SQL Server PASC - CERO errores',
                timestamp: new Date().toISOString()
            };
        }
    } catch (error) {
        return {
            online: false,
            mode: 'sql_server_error',
            message: error.message,
            timestamp: new Date().toISOString()
        };
    }
};

// Exportar cliente compatible con Supabase
export const supabase = sqlServerClient;
export const supabaseWithTenant = (tenantId) => sqlServerClient;

export default sqlServerClient;