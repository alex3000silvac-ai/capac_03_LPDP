/**
 * 🛡️ RAT SERVICE - SIMPLE SUPABASE ONLY
 * 
 * Servicio simplificado sin dependencias problemáticas
 * Solo funciones esenciales para evitar build errors
 */

import { supabase } from '../config/supabaseClient';
import { RAT_ESTADOS } from '../constants/estados';

class RATService {
  constructor() {
    this.tableName = 'mapeo_datos_rat'; // FIXED: Usar tabla correcta del sistema
  }

  // Función básica para evitar errores de build
  async getRats(options = {}) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .limit(100);

      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Error getRats:', error);
      return { success: false, data: [] };
    }
  }

  // Función básica para evitar errores de build
  async createRAT(ratData) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .insert([ratData])
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error createRAT:', error);
      return { success: false, error: error.message };
    }
  }

  // Función básica para evitar errores de build
  async updateRAT(id, ratData) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update(ratData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error updateRAT:', error);
      return { success: false, error: error.message };
    }
  }

  // Función básica para evitar errores de build
  async deleteRAT(id) {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error deleteRAT:', error);
      return { success: false, error: error.message };
    }
  }

  // Función básica para evitar errores de build
  async getRATById(id) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error getRATById:', error);
      return { success: false, data: null };
    }
  }

  // FIX: Función faltante para TenantContext
  async setCurrentTenant(tenant, userId) {
    try {
      console.log('🏢 setCurrentTenant llamado:', tenant?.company_name, userId);
      
      if (!userId || !tenant) {
        return { success: false, error: 'Usuario o tenant requerido' };
      }

      // Upsert en user_sessions para persistir tenant seleccionado
      const { data, error } = await supabase
        .from('user_sessions')
        .upsert({
          user_id: userId,
          tenant_id: tenant.id,
          tenant_data: tenant,
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .select();

      if (error) {
        console.error('Error guardando tenant en Supabase:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error setCurrentTenant:', error);
      return { success: false, error: error.message };
    }
  }

  // FIX: Función faltante para TenantContext
  async getCurrentTenant(userId) {
    try {
      if (!userId) {
        return { success: false, error: 'Usuario requerido' };
      }

      const { data, error } = await supabase
        .from('user_sessions')
        .select('tenant_id, tenant_data')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error obteniendo tenant desde Supabase:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data?.tenant_data || null };
    } catch (error) {
      console.error('Error getCurrentTenant:', error);
      return { success: false, error: error.message };
    }
  }

  // FIX: Función faltante para RATSystemProfessional  
  async getCompletedRATs() {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('estado', RAT_ESTADOS.CERTIFICADO)
        .limit(100);

      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Error getCompletedRATs:', error);
      return { success: false, data: [] };
    }
  }
}

// Instancia única
const ratService = new RATService();

// Exports para compatibilidad
export { ratService };
export default ratService;