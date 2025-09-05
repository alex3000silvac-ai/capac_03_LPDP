/**
 * 🛡️ RAT SERVICE - ARREGLADO COMPLETO
 * 
 * Servicio corregido para manejo correcto de tenants y sesiones
 */

import { supabase } from '../config/supabaseClient';
import { RAT_ESTADOS } from '../constants/estados';

class RATService {
  constructor() {
    this.tableName = 'rat';
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

  // ✅ FUNCIÓN CORREGIDA: setCurrentTenant
  async setCurrentTenant(tenant, userId) {
    try {
      console.log('🏢 setCurrentTenant llamado:', tenant?.company_name, userId);
      
      if (!userId || !tenant || !tenant.id) {
        console.error('❌ setCurrentTenant: Datos inválidos', { userId, tenant });
        return { success: false, error: 'Usuario o tenant requerido' };
      }

      // Verificar si ya existe la sesión
      const { data: existingSession } = await supabase
        .from('user_sessions')
        .select('id')
        .eq('user_id', userId)
        .eq('tenant_id', tenant.id)
        .single();

      let result;
      if (existingSession) {
        // Actualizar sesión existente
        result = await supabase
          .from('user_sessions')
          .update({
            tenant_data: JSON.stringify(tenant),
            is_active: true,
            last_activity: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', existingSession.id)
          .select();
      } else {
        // Crear nueva sesión
        result = await supabase
          .from('user_sessions')
          .insert([{
            user_id: userId,
            tenant_id: tenant.id,
            tenant_data: JSON.stringify(tenant),
            is_active: true,
            session_start: new Date().toISOString(),
            last_activity: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select();
      }

      const { data, error } = result;
      if (error) {
        console.error('❌ Error guardando tenant en Supabase:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Tenant guardado exitosamente');
      return { success: true, data };
    } catch (error) {
      console.error('❌ Error setCurrentTenant:', error);
      return { success: false, error: error.message };
    }
  }

  // ✅ FUNCIÓN CORREGIDA: getCurrentTenant
  async getCurrentTenant(userId) {
    try {
      if (!userId) {
        return { success: false, error: 'Usuario requerido' };
      }

      // Primero intentar obtener desde user_sessions
      const { data: sessionData, error: sessionError } = await supabase
        .from('user_sessions')
        .select('tenant_id, tenant_data')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (!sessionError && sessionData?.tenant_data) {
        try {
          // Intentar parsear tenant_data si es JSON string
          let tenantData = sessionData.tenant_data;
          if (typeof tenantData === 'string') {
            tenantData = JSON.parse(tenantData);
          }
          
          // Asegurar que tiene ID
          if (tenantData && tenantData.id) {
            return { success: true, data: tenantData };
          }
        } catch (parseError) {
          console.warn('⚠️ Error parseando tenant_data:', parseError);
        }
      }

      // Fallback: obtener directamente desde organizaciones
      console.log('🔄 Fallback: obteniendo tenant desde organizaciones');
      const { data: orgData, error: orgError } = await supabase
        .from('organizaciones')
        .select('*')
        .eq('user_id', userId)
        .eq('active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (orgError || !orgData) {
        console.error('❌ Error obteniendo organización:', orgError);
        return { success: false, error: orgError?.message || 'No se encontró organización' };
      }

      console.log('✅ Tenant obtenido desde organizaciones:', orgData.company_name);
      return { success: true, data: orgData };

    } catch (error) {
      console.error('❌ Error getCurrentTenant:', error);
      return { success: false, error: error.message };
    }
  }

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