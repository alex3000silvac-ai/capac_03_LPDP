const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('❌ Variables de entorno de Supabase no configuradas');
}

// Cliente con privilegios administrativos (para operaciones del servidor)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Cliente público (para operaciones limitadas)
const supabasePublic = createClient(supabaseUrl, supabaseAnonKey);

// Función para obtener cliente con contexto de tenant y usuario
const getSupabaseClient = (tenantId, userId = null, isAdmin = false) => {
  const client = isAdmin ? supabaseAdmin : supabasePublic;
  
  // Configurar context para RLS
  if (tenantId) {
    // Establecer tenant en la sesión
    client.rpc('set_config', {
      parameter: 'app.current_tenant',
      value: tenantId
    });
  }
  
  if (userId) {
    // Establecer usuario en la sesión
    client.rpc('set_config', {
      parameter: 'app.current_user_id', 
      value: userId
    });
  }
  
  return client;
};

// Función para ejecutar con contexto completo
const executeWithContext = async (tenantId, userId, isAdmin, operation) => {
  const client = getSupabaseClient(tenantId, userId, isAdmin);
  
  try {
    return await operation(client);
  } catch (error) {
    console.error('❌ Error en operación de base de datos:', error);
    throw error;
  }
};

// Función helper para establecer configuración de sesión
const setSessionConfig = async (client, config) => {
  for (const [key, value] of Object.entries(config)) {
    await client.rpc('set_config', {
      parameter: key,
      value: String(value)
    });
  }
};

module.exports = {
  supabaseAdmin,
  supabasePublic,
  getSupabaseClient,
  executeWithContext,
  setSessionConfig
};