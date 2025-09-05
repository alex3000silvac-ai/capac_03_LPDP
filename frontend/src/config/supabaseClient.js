// 🚀 CLIENTE SUPABASE REAL - ARQUITECTURA CLOUD COMPLETA
// Conexión directa a Supabase Cloud - NO más localhost imposible
import { createClient } from '@supabase/supabase-js'

console.log('🚀 Iniciando cliente Supabase Cloud REAL para LPDP');

// Configuración Supabase Cloud REAL - Proyecto symkjkbejxexgrydmvqs
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://symkjkbejxexgrydmvqs.supabase.co'
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5bWtqa2JlanhleGdyeWRtdnFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYwMDc5MjksImV4cCI6MjA1MTU4MzkyOX0.ojEJUgqUinLV7WxJxUpf0Q3__rtV9rCuUoV6X6GfhWs'

// Validación de configuración
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('🚨 CONFIGURACIÓN CRÍTICA FALTANTE');
  console.error('   REACT_APP_SUPABASE_URL:', supabaseUrl ? '✅' : '❌ FALTA');
  console.error('   REACT_APP_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅' : '❌ FALTA');
  throw new Error('Supabase URL y Anon Key son requeridas para funcionar');
}

// Configuración validada
console.log('✅ Configuración Supabase Cloud:', {
  url: supabaseUrl,
  project: supabaseUrl.split('.')[0].split('//')[1],
  environment: 'production'
});

// Cliente Supabase REAL con todas las funcionalidades nativas
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: 'supabase.auth.token',
    flowType: 'pkce'
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'x-application': 'lpdp-system'
    }
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Test de conexión inicial
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('❌ Error inicial Supabase:', error.message);
  } else {
    console.log('✅ Supabase Cloud conectado:', {
      session: data.session ? 'activa' : 'sin sesión',
      mode: 'cloud',
      timestamp: new Date().toISOString()
    });
  }
});

// Helper para operaciones con tenant específico
export const supabaseWithTenant = (tenantId) => {
  // Supabase maneja el tenant via RLS automáticamente
  return supabase.rpc('set_current_tenant', { tenant_id: tenantId })
    .then(() => supabase)
    .catch(() => supabase);
}

// Función para obtener tenant actual desde la sesión
export const getCurrentTenant = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user?.id) {
      // Primero intentar obtener de user_sessions
      const { data: session, error } = await supabase
        .from('user_sessions')
        .select('tenant_id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (!error && session) {
        console.log(`✅ Tenant activo: ${session.tenant_id}`);
        return session.tenant_id;
      }

      // Fallback: obtener primera organización del usuario
      const { data: userTenant } = await supabase
        .from('users_tenants')
        .select('organizacion_id')
        .eq('user_id', user.id)
        .limit(1)
        .single();

      if (userTenant) {
        console.log(`✅ Tenant desde users_tenants: ${userTenant.organizacion_id}`);
        return userTenant.organizacion_id;
      }
    }

    // Fallback final: tenant por defecto
    const { data: defaultOrg } = await supabase
      .from('organizaciones')
      .select('id')
      .limit(1)
      .single();

    const tenantId = defaultOrg?.id || 'default';
    console.log(`✅ Tenant fallback: ${tenantId}`);
    return tenantId;
    
  } catch (error) {
    console.error('Error obteniendo tenant:', error);
    return 'default';
  }
}

// Función para verificar conectividad con Supabase Cloud
export const getConnectivityStatus = async () => {
  try {
    // Test simple de conectividad
    const { data, error } = await supabase
      .from('organizaciones')
      .select('count', { count: 'exact', head: true });
    
    if (error) throw error;
    
    return {
      online: true,
      mode: 'supabase_cloud',
      message: 'Conectado exitosamente a Supabase Cloud',
      database: 'PostgreSQL',
      provider: 'Supabase',
      project: supabaseUrl.split('.')[0].split('//')[1],
      timestamp: new Date().toISOString(),
      records: data || 0
    };
  } catch (error) {
    console.error('❌ Error conectividad Supabase:', error);
    return {
      online: false,
      mode: 'error',
      message: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// Configurar interceptor para manejo de errores global
supabase.auth.onAuthStateChange((event, session) => {
  console.log(`🔐 Auth event: ${event}`, {
    user: session?.user?.email,
    tenant: session?.user?.user_metadata?.tenant_id
  });
  
  // Actualizar headers con tenant si está disponible
  if (session?.user?.user_metadata?.tenant_id) {
    localStorage.setItem('currentTenant', session.user.user_metadata.tenant_id);
  }
});

// Función helper para queries con tenant automático
export const queryWithTenant = async (table, tenantId = null) => {
  const tenant = tenantId || await getCurrentTenant();
  return supabase
    .from(table)
    .select('*')
    .eq('tenant_id', tenant);
}

// Exportar cliente Supabase como default
export default supabase;