import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://vkyhsnlivgwgrhdbvynm.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZreWhzbmxpdmd3Z3JoZGJ2eW5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2MzE5NjQsImV4cCI6MjA3MzIwNzk2NH0.JIZ3kJpTF1HZnN4_L_VxTNePcfxkYkRnmQNuGn8JdAQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { autoRefreshToken: true, persistSession: true }
});

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { success: false, error: error.message };
  
  const { data: userData } = await supabase
    .from('usuarios')
    .select('*, organizaciones(*)')
    .eq('id', data.user.id)
    .single();
    
  return { success: true, user: { ...data.user, ...userData }, session: data.session };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return error ? { success: false, error: error.message } : { success: true };
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  
  const { data: userData } = await supabase
    .from('usuarios')
    .select('*, organizaciones(*)')
    .eq('id', user.id)
    .single();
    
  return { ...user, ...userData };
};

export const getOrganizaciones = async () => {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: 'No autenticado', data: [] };
  
  const { data, error } = await supabase
    .from('organizaciones')
    .select('*')
    .eq('tenant_id', user.tenant_id)
    .eq('is_active', true);
    
  return error ? { success: false, error: error.message, data: [] } : { success: true, data };
};

export const saveOrganizacion = async (organizacionData) => {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: 'No autenticado' };
  
  const { data, error } = await supabase
    .from('organizaciones')
    .upsert({ ...organizacionData, tenant_id: user.tenant_id });
    
  return error ? { success: false, error: error.message } : { success: true, data };
};

export const getCurrentTenant = async () => {
  const user = await getCurrentUser();
  return user?.tenant_id || null;
};

export const getConnectivityStatus = async () => {
  const { error } = await supabase.from('organizaciones').select('count').limit(1);
  return { online: !error, database: 'Supabase' };
};

export default supabase;