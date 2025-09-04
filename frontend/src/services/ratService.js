/**
 * 🛡️ RAT SERVICE - SIMPLE SUPABASE ONLY
 * 
 * Servicio simplificado sin dependencias problemáticas
 * Solo funciones esenciales para evitar build errors
 */

import { supabase } from '../config/supabaseClient';

class RATService {
  constructor() {
    this.tableName = 'rats';
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
      console.log('🏢 setCurrentTenant llamado:', tenant, userId);
      // Por ahora solo log - implementación completa después
      return { success: true };
    } catch (error) {
      console.error('Error setCurrentTenant:', error);
      return { success: false, error: error.message };
    }
  }

  // FIX: Función faltante para RATSystemProfessional  
  async getCompletedRATs() {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('estado', 'completado')
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