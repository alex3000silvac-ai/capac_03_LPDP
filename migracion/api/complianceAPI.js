/**
 * Compliance API - SIMPLICIDAD MÁXIMA con Supabase
 * API simplificada para compliance y cumplimiento usando solo Supabase
 */

import { supabase, getCurrentUser, getCurrentTenant } from '../config/supabaseConfig';

const complianceAPI = {
  // Obtener métricas de compliance
  getComplianceMetrics: async () => {
    try {
      const tenantId = await getCurrentTenant();
      if (!tenantId) throw new Error('No hay tenant activo');

      const { data, error } = await supabase
        .from('rats')
        .select('estado, riesgo_clasificacion')
        .eq('tenant_id', tenantId)
        .eq('is_active', true);

      if (error) throw error;

      // Calcular métricas simples
      const total = data.length;
      const completados = data.filter(r => r.estado === 'completado').length;
      const enProceso = data.filter(r => r.estado === 'en_proceso').length;
      const pendientes = data.filter(r => r.estado === 'borrador').length;

      const riesgoAlto = data.filter(r => r.riesgo_clasificacion === 'alto').length;
      const riesgoMedio = data.filter(r => r.riesgo_clasificacion === 'medio').length;
      const riesgoBajo = data.filter(r => r.riesgo_clasificacion === 'bajo').length;

      return {
        success: true,
        data: {
          total,
          completados,
          enProceso,
          pendientes,
          riesgoAlto,
          riesgoMedio,
          riesgoBajo,
          porcentajeCompletado: total > 0 ? Math.round((completados / total) * 100) : 0
        }
      };
    } catch (error) {
      console.error('Error obteniendo métricas compliance:', error);
      return { success: false, error: error.message };
    }
  },

  // Obtener tareas pendientes de compliance
  getPendingTasks: async () => {
    try {
      const tenantId = await getCurrentTenant();
      if (!tenantId) throw new Error('No hay tenant activo');

      const { data, error } = await supabase
        .from('rats')
        .select('id, nombre_proceso, estado, updated_at')
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .in('estado', ['borrador', 'en_revision'])
        .order('updated_at', { ascending: true })
        .limit(10);

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Error obteniendo tareas pendientes:', error);
      return { success: false, error: error.message };
    }
  },

  // Generar reporte de compliance
  generateComplianceReport: async (tipo = 'general') => {
    try {
      const tenantId = await getCurrentTenant();
      if (!tenantId) throw new Error('No hay tenant activo');

      const { data, error } = await supabase
        .from('rats')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const reporte = {
        fecha_generacion: new Date().toISOString(),
        tipo_reporte: tipo,
        total_rats: data.length,
        detalle_por_estado: data.reduce((acc, rat) => {
          acc[rat.estado] = (acc[rat.estado] || 0) + 1;
          return acc;
        }, {}),
        detalle_por_riesgo: data.reduce((acc, rat) => {
          acc[rat.riesgo_clasificacion] = (acc[rat.riesgo_clasificacion] || 0) + 1;
          return acc;
        }, {}),
        rats: data
      };

      return { success: true, data: reporte };
    } catch (error) {
      console.error('Error generando reporte compliance:', error);
      return { success: false, error: error.message };
    }
  },

  // Validar compliance de un RAT específico
  validateRATCompliance: async (ratId) => {
    try {
      const { data, error } = await supabase
        .from('rats')
        .select('*')
        .eq('id', ratId)
        .single();

      if (error) throw error;

      const validaciones = {
        tiene_nombre_proceso: !!data.nombre_proceso,
        tiene_finalidad: !!data.finalidad,
        tiene_base_juridica: !!data.base_juridica,
        tiene_medidas_seguridad: !!data.medidas_seguridad_aplicadas,
        tiene_plazo_conservacion: !!data.plazo_conservacion,
        estado_valido: ['completado', 'aprobado'].includes(data.estado)
      };

      const camposCompletos = Object.values(validaciones).filter(Boolean).length;
      const totalCampos = Object.keys(validaciones).length;
      const porcentajeCompletado = Math.round((camposCompletos / totalCampos) * 100);

      return {
        success: true,
        data: {
          ratId,
          validaciones,
          camposCompletos,
          totalCampos,
          porcentajeCompletado,
          esCompleto: porcentajeCompletado === 100
        }
      };
    } catch (error) {
      console.error('Error validando compliance RAT:', error);
      return { success: false, error: error.message };
    }
  }
};

export default complianceAPI;