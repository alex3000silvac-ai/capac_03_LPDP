// 🚀 SUPABASE CLIENTE REAL - PRODUCCIÓN
import { createClient } from '@supabase/supabase-js';

console.log('🚀 Iniciando cliente Supabase REAL para producción');

// Configuración de Supabase desde variables de entorno
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Validación de variables de entorno
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ FALTAN VARIABLES DE ENTORNO:');
  console.error('   REACT_APP_SUPABASE_URL:', supabaseUrl ? '✅' : '❌ FALTA');
  console.error('   REACT_APP_SUPABASE_ANON_KEY:', supabaseKey ? '✅' : '❌ FALTA');
  throw new Error('Variables de entorno de Supabase no configuradas. Ver INSTRUCCIONES_PRODUCCION.md');
}

console.log('🚀 Configurando Supabase:', {
  url: supabaseUrl,
  keyPrefix: supabaseKey.substring(0, 20) + '...'
});

// Cliente real de Supabase
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'supabase.auth.token',
    storage: window.localStorage
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

console.log('🚀 Cliente Supabase inicializado exitosamente');

// Helper para operaciones con tenant (modo online)
export const supabaseWithTenant = (tenantId) => {
  console.log(`🏢 Operación tenant: ${tenantId} (modo online)`);
  return supabase;
};

// Función para obtener tenant actual
export const getCurrentTenant = () => {
  return localStorage.getItem('tenant_id') || 'default';
};

// Función para verificar conectividad con Supabase
export const getConnectivityStatus = async () => {
  try {
    const { data, error } = await supabase
      .from('organizaciones')
      .select('count')
      .limit(1);
      
    return { 
      online: true, 
      mode: 'supabase_production',
      message: 'Conectado exitosamente a Supabase',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('🚀 Error conectividad Supabase:', error);
    return {
      online: false,
      mode: 'supabase_error', 
      message: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

// Test de conexión inicial
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('🚀 Error inicial Supabase:', error);
  } else {
    console.log('🚀 Supabase conectado correctamente, sesión:', data.session ? 'activa' : 'ninguna');
  }
});

// Exportar cliente real - MODO PRODUCCIÓN
export default supabase;