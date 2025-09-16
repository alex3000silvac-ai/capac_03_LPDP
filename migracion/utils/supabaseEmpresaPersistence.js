/**
 * Persistencia de datos de empresa con Supabase - SIMPLICIDAD MÁXIMA
 * Funciones para manejar datos de empresa usando solo Supabase
 */

import { supabase, getCurrentUser, getCurrentTenant } from '../config/supabaseConfig';

export const guardarDatosEmpresa = async (datosEmpresa) => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    const tenantId = await getCurrentTenant();
    
    const { data, error } = await supabase
      .from('organizaciones')
      .upsert({
        ...datosEmpresa,
        tenant_id: tenantId,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
    
    console.log('Datos empresa guardados:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error guardando datos empresa:', error);
    return { success: false, error: error.message };
  }
};

export const cargarDatosEmpresa = async () => {
  try {
    const tenantId = await getCurrentTenant();
    if (!tenantId) {
      throw new Error('No hay tenant activo');
    }

    const { data, error } = await supabase
      .from('organizaciones')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    
    console.log('Datos empresa cargados:', data);
    return { success: true, data: data || {} };
  } catch (error) {
    console.error('Error cargando datos empresa:', error);
    return { success: false, error: error.message, data: {} };
  }
};

export const autoCompletarFormulario = async (formularioData) => {
  try {
    const datosEmpresa = await cargarDatosEmpresa();
    
    if (!datosEmpresa.success || !datosEmpresa.data) {
      return formularioData;
    }

    // Autocompletar campos básicos
    const autocompletado = {
      ...formularioData,
      razon_social: datosEmpresa.data.razon_social || formularioData.razon_social,
      rut_empresa: datosEmpresa.data.rut_empresa || formularioData.rut_empresa,
      direccion: datosEmpresa.data.direccion || formularioData.direccion,
      telefono: datosEmpresa.data.telefono || formularioData.telefono,
      email: datosEmpresa.data.email || formularioData.email,
      sector_economico: datosEmpresa.data.sector_economico || formularioData.sector_economico
    };

    console.log('Formulario autocompletado con datos empresa');
    return autocompletado;
  } catch (error) {
    console.error('Error autocompletando formulario:', error);
    return formularioData;
  }
};

export const existenDatosEmpresa = async () => {
  try {
    const tenantId = await getCurrentTenant();
    if (!tenantId) return false;

    const { data, error } = await supabase
      .from('organizaciones')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .limit(1);

    if (error) throw error;
    
    return data && data.length > 0;
  } catch (error) {
    console.error('Error verificando datos empresa:', error);
    return false;
  }
};