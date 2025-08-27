// 🔌 MODO OFFLINE COMPLETO - Sin dependencias externas
console.log('🔌 Iniciando modo OFFLINE - Sistema independiente');

// Mock completo de Supabase que siempre funciona
const createMockClient = () => {
  const createQuery = () => {
    const query = {
      select: function() { return query; },
      insert: function() { return query; },
      update: function() { return query; },
      delete: function() { return query; },
      upsert: function() { return query; },
      eq: function() { return query; },
      order: function() { return query; },
      limit: function() { return query; },
      then: function(resolve) { return resolve({ data: [], error: null }); }
    };
    return query;
  };

  return {
    from: (table) => createQuery(),
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      signInWithPassword: () => Promise.resolve({ 
        data: { 
          user: { 
            id: 'offline_user',
            email: 'demo@offline.local',
            user_metadata: { 
              first_name: 'Usuario',
              last_name: 'Demo',
              organizacion_nombre: 'Empresa Demo'
            }
          },
          session: { access_token: 'offline_token' }
        }, 
        error: null 
      }),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: () => ({ 
        data: { subscription: { unsubscribe: () => {} } }
      })
    }
  };
};

// Cliente mock para desarrollo local
export const supabase = createMockClient();

// Helper para operaciones con tenant (modo offline)
export const supabaseWithTenant = (tenantId) => {
  console.log(`🏢 Operación tenant: ${tenantId} (modo offline)`);
  return supabase;
};

// Función para obtener tenant actual
export const getCurrentTenant = () => {
  return localStorage.getItem('tenant_id') || 'demo_offline';
};

// Función para verificar si estamos online
export const getConnectivityStatus = () => {
  return { 
    online: false, 
    mode: 'offline_development',
    message: 'Sistema funcionando en modo independiente' 
  };
};

// Exportar cliente mock - MODO DESARROLLO
export default supabase;