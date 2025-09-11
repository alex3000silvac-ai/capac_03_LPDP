/**
 * ================================================================================
 * CONFIGURACIÓN COMPLETA DE SUPABASE - SISTEMA LPDP
 * ================================================================================
 * Nueva configuración que reemplaza completamente SQL Server
 * ================================================================================
 */

import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase (actualizar con credenciales reales)
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://YOUR_PROJECT_ID.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'YOUR_ANON_KEY';

// Crear cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: { 'x-application-name': 'LPDP System' }
  }
});

/**
 * ================================================================================
 * FUNCIONES DE AUTENTICACIÓN
 * ================================================================================
 */

export const signIn = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    if (data.user) {
      const { data: userData } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', data.user.id)
        .single();

      return {
        success: true,
        user: { ...data.user, ...userData },
        session: data.session
      };
    }

    return { success: false, error: 'Usuario no encontrado' };
  } catch (error) {
    console.error('Error en login:', error);
    return { success: false, error: error.message };
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error en logout:', error);
    return { success: false, error: error.message };
  }
};

export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) throw error;
    if (!user) return null;

    const { data: userData } = await supabase
      .from('usuarios')
      .select(`
        *,
        organizaciones (*)
      `)
      .eq('id', user.id)
      .single();

    return { ...user, ...userData };
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    return null;
  }
};

/**
 * ================================================================================
 * FUNCIONES DE DATOS - ORGANIZACIONES (para compatibilidad)
 * ================================================================================
 */

export const getOrganizaciones = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { data, error } = await supabase
      .from('organizaciones')
      .select('*')
      .eq('tenant_id', user.tenant_id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error obteniendo organizaciones:', error);
    return { success: false, error: error.message, data: [] };
  }
};

export const saveOrganizacion = async (organizacionData) => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    const dataToSave = {
      ...organizacionData,
      tenant_id: user.tenant_id,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('organizaciones')
      .upsert(dataToSave, {
        onConflict: 'tenant_id,template_name'
      });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error guardando organización:', error);
    return { success: false, error: error.message };
  }
};

/**
 * ================================================================================
 * FUNCIONES HEREDADAS PARA COMPATIBILIDAD
 * ================================================================================
 */

export const getCurrentTenant = async () => {
  const user = await getCurrentUser();
  return user?.tenant_id || null;
};

export const getConnectivityStatus = async () => {
  try {
    const { data, error } = await supabase
      .from('organizaciones')
      .select('count')
      .limit(1);

    return {
      online: !error,
      database: 'Supabase PostgreSQL',
      server: supabaseUrl
    };
  } catch {
    return {
      online: false,
      database: 'disconnected',
      error: 'No se puede conectar a Supabase'
    };
  }
};

export default supabase;