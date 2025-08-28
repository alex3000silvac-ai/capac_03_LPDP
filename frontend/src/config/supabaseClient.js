// 🚀 SUPABASE CLIENTE REAL - PRODUCCIÓN
import { createClient } from '@supabase/supabase-js';

console.log('🚀 Iniciando cliente Supabase REAL para producción');

// Configuración de Supabase desde variables de entorno
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://xvnfpkxbsmfhqcyvjwmz.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2bmZwa3hic21maHFjeXZqd216Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU0NzY1NzUsImV4cCI6MjA1MTA1MjU3NX0.Kqwfyvy5AYGiILyXJWjvL5RqLLlJDr5jb3mSs4yNmNQ';

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