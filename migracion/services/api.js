/**
 * 🚀 SERVICIOS API BÁSICOS - SIN REFERENCIAS CIRCULARES
 */

import { supabase } from '../config/supabaseConfig';

// Servicio de inventario básico
export const inventarioService = {
  async getInventario() {
    try {
      const { data, error } = await supabase
        .from('mapeo_datos_rat')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Error cargando inventario:', error);
      return { success: false, data: [], error: error.message };
    }
  },

  async createItem(item) {
    try {
      const { data, error } = await supabase
        .from('mapeo_datos_rat')
        .insert([item])
        .select()
        .single();
      
      if (error) throw error;
      
      return { success: true, data };
    } catch (error) {
      console.error('Error creando item:', error);
      return { success: false, error: error.message };
    }
  }
};

// Servicios de administración básicos
export const administracionService = {
  async getUsuarios() {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      return { success: false, data: [], error: error.message };
    }
  },

  async getOrganizaciones() {
    try {
      const { data, error } = await supabase.from('organizaciones').select('*');
      return { success: true, data: data || [] };
    } catch (error) {
      return { success: false, data: [], error: error.message };
    }
  },

  async getDashboard() {
    return {
      success: true,
      data: {
        total_usuarios: 1,
        total_organizaciones: 1,
        rats_creados: 0,
        compliance_score: 100
      }
    };
  },

  async getConfiguracion() {
    return { success: true, data: { sistema: 'LPDP', version: '2.0' } };
  },

  async getLogs() {
    try {
      const { data, error } = await supabase.from('agent_activity_log').select('*').limit(100);
      return { success: true, data: data || [] };
    } catch (error) {
      return { success: false, data: [], error: error.message };
    }
  }
};

// Default export para compatibilidad
export default {
  inventarioService,
  administracionService
};