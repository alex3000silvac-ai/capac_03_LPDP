import { supabase, getCurrentUser } from '../config/supabaseConfig';

export const dataService = {
  async getRATs() {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: 'No autenticado', data: [] };
    
    const { data, error } = await supabase
      .from('rats')
      .select('*')
      .eq('tenant_id', user.tenant_id)
      .order('created_at', { ascending: false });
      
    return error ? { success: false, error: error.message, data: [] } : { success: true, data };
  },

  async saveRAT(ratData) {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: 'No autenticado' };
    
    const { data, error } = await supabase
      .from('rats')
      .upsert({ ...ratData, tenant_id: user.tenant_id });
      
    return error ? { success: false, error: error.message } : { success: true, data };
  },

  async getEIPDs() {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: 'No autenticado', data: [] };
    
    const { data, error } = await supabase
      .from('eipds')
      .select('*')
      .eq('tenant_id', user.tenant_id)
      .order('created_at', { ascending: false });
      
    return error ? { success: false, error: error.message, data: [] } : { success: true, data };
  },

  async saveEIPD(eipdData) {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: 'No autenticado' };
    
    const { data, error } = await supabase
      .from('eipds')
      .upsert({ ...eipdData, tenant_id: user.tenant_id });
      
    return error ? { success: false, error: error.message } : { success: true, data };
  },

  async getProveedores() {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: 'No autenticado', data: [] };
    
    const { data, error } = await supabase
      .from('proveedores')
      .select('*')
      .eq('tenant_id', user.tenant_id)
      .order('created_at', { ascending: false });
      
    return error ? { success: false, error: error.message, data: [] } : { success: true, data };
  },

  async saveProveedor(proveedorData) {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: 'No autenticado' };
    
    const { data, error } = await supabase
      .from('proveedores')
      .upsert({ ...proveedorData, tenant_id: user.tenant_id });
      
    return error ? { success: false, error: error.message } : { success: true, data };
  },

  async deleteRecord(table, id) {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: 'No autenticado' };
    
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id)
      .eq('tenant_id', user.tenant_id);
      
    return error ? { success: false, error: error.message } : { success: true };
  }
};

export default dataService;