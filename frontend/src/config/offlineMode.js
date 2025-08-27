// 🔌 MODO OFFLINE COMPLETO - Sin dependencias externas
// Para desarrollo local sin Supabase
console.log('🔌 Iniciando modo OFFLINE - Sistema independiente');

// Mock completo de Supabase
export const supabase = {
  from: (table) => ({
    select: () => Promise.resolve({ data: [], error: null }),
    insert: () => Promise.resolve({ data: null, error: null }),
    update: () => Promise.resolve({ data: null, error: null }),
    delete: () => Promise.resolve({ data: null, error: null }),
    upsert: () => Promise.resolve({ data: null, error: null }),
    eq: function() { return this; },
    order: function() { return this; },
    limit: function() { return this; }
  }),
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

// Helper para operaciones con tenant (modo offline)
export const supabaseWithTenant = (tenantId) => {
  console.log(`🏢 Operación tenant: ${tenantId} (modo offline)`);
  return supabase;
};

// Función para detectar si estamos en modo offline
export const isOfflineMode = () => {
  return true; // Siempre offline para desarrollo local
};

// Función para obtener tenant actual
export const getCurrentTenant = () => {
  return localStorage.getItem('tenant_id') || 'demo_offline';
};

export default supabase;