/**
 * 🚀 SERVICIO API BÁSICO - SOLO SUPABASE
 * 
 * Reemplazo mínimo para imports rotos
 * NO USA localStorage - SOLO Supabase
 */

import { supabase } from '../config/supabaseClient';

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

// Servicios admin básicos
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

  async getRoles() {
    return {
      success: true,
      data: [
        { id: 'admin', nombre: 'Administrador' },
        { id: 'user', nombre: 'Usuario' },
        { id: 'viewer', nombre: 'Solo Lectura' }
      ]
    };
  }
};

export const usuariosService = administracionService;
export const rolesService = administracionService;
export const configuracionService = administracionService;

// Default export para compatibilidad
export default {
  inventarioService,
  administracionService,
  usuariosService,
  rolesService,
  configuracionService
};