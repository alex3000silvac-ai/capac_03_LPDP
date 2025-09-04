// 🚀 SUPABASE CLIENTE REAL - PRODUCCIÓN
import { createClient } from '@supabase/supabase-js';

// //console.log('🚀 Iniciando cliente Supabase REAL para producción');

// Configuración de Supabase desde variables de entorno
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Validación ESTRICTA de variables de entorno para PRODUCCIÓN
if (!supabaseUrl || !supabaseKey) {
  console.error('🚨 CONFIGURACIÓN CRÍTICA FALTANTE:');
  console.error('   REACT_APP_SUPABASE_URL:', supabaseUrl ? '✅' : '❌ FALTA');
  console.error('   REACT_APP_SUPABASE_ANON_KEY:', supabaseKey ? '✅' : '❌ FALTA');
  console.error('🚨 SISTEMA NO PUEDE OPERAR SIN ESTAS VARIABLES');
  throw new Error('CRÍTICO: Variables de entorno de Supabase no configuradas. Sistema no puede funcionar.');
}

// Validación adicional de formato de URL
if (!supabaseUrl.includes('supabase.co')) {
  console.error('🚨 URL DE SUPABASE INVÁLIDA:', supabaseUrl);
  throw new Error('CRÍTICO: URL de Supabase no tiene formato válido');
}

// Validación de key format (acepta tanto JWT como publishable keys)
if (!supabaseKey.startsWith('eyJ') && !supabaseKey.startsWith('sb_publishable_')) {
  console.error('🚨 API KEY DE SUPABASE INVÁLIDA');
  throw new Error('CRÍTICO: API Key de Supabase debe ser JWT (eyJ...) o publishable (sb_publishable_...)');
}

/* //console.log('🚀 Configurando Supabase:', {
  url: supabaseUrl,
  keyPrefix: supabaseKey.substring(0, 20) + '...'
}); */

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

// //console.log('🚀 Cliente Supabase inicializado exitosamente');

// Helper para operaciones con tenant (modo online)
export const supabaseWithTenant = (tenantId) => {
  // //console.log(`🏢 Operación tenant: ${tenantId} (modo online)`);
  return supabase;
};

// Función para obtener tenant actual desde Supabase únicamente
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
        return session.tenant_id;
      }
    }

    // Fallback a tenant por defecto sin localStorage
    const { data: defaultTenant, error } = await supabase
      .from('tenants')
      .select('id')
      .limit(1)
      .single();

    return defaultTenant?.id || 'default';
  } catch (error) {
    console.error('Error obteniendo tenant desde Supabase');
    return 'default';
  }
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
    // //console.log('🚀 Supabase conectado correctamente, sesión:', data.session ? 'activa' : 'ninguna');
  }
});

// Exportar cliente real - MODO PRODUCCIÓN
export default supabase;