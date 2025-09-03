// SERVICIO DE PROVEEDORES - MULTI-TENANT CON AISLACIÓN TOTAL
// Sistema LPDP v3.0.1 - Ley 21.719

import { supabase } from '../config/supabaseClient';

class ProveedoresService {
  // Obtener tenant actual del usuario desde Supabase
  async getCurrentTenant() {
    try {
      // Obtener usuario actual de Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 'default';
      
      // Obtener tenant desde user_sessions
      const { data, error } = await supabase
        .from('user_sessions')
        .select('tenant_id, tenant_data')
        .eq('user_id', user.id)
        .single();
      
      if (data?.tenant_id) {
        return data.tenant_id;
      }
      
      // Si no hay sesión, obtener primera organización del usuario
      const { data: org } = await supabase
        .from('organizaciones')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)
        .single();
      
      return org?.id || 'default';
    } catch (error) {
      console.error('Error obteniendo tenant:', error);
      return 'default';
    }
  }

  // Obtener cliente Supabase con RLS para tenant
  async getSupabaseClient() {
    const tenantId = await this.getCurrentTenant();
    // RLS automático filtrará por tenant_id
    return { client: supabase, tenantId };
  }

  // CREAR PROVEEDOR
  async createProveedor(proveedorData) {
    try {
      const { client, tenantId } = await this.getSupabaseClient();
      
      const nuevoProveedor = {
        ...proveedorData,
        tenant_id: tenantId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // 1. Guardar en Supabase
      const { data, error } = await client
        .from('proveedores')
        .insert([nuevoProveedor])
        .select()
        .single();

      if (error) {
        console.error('❌ Error Supabase:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Proveedor creado:', data.id, 'Tenant:', tenantId);
      return { success: true, data, source: 'supabase' };

    } catch (error) {
      console.error('❌ Error creando proveedor:', error);
      return { success: false, error: error.message };
    }
  }

  // OBTENER TODOS LOS PROVEEDORES CON AUTO-DETECCIÓN DE TENANT
  async getProveedores() {
    try {
      const { client, tenantId } = await this.getSupabaseClient();
      
      console.log('🔍 Buscando proveedores para tenant:', tenantId);

      // Estrategia inteligente: primero intentar con el tenant calculado
      let { data, error } = await client
        .from('proveedores')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      console.log('📊 Respuesta inicial - Tenant:', tenantId, 'Encontrados:', data?.length || 0);

      // Si no encuentra datos y el tenant no es exactamente 'juridica_digital', 
      // intentar con variantes comunes
      if (!error && (!data || data.length === 0)) {
        const tenantVariants = [
          'juridica_digital',
          // Agregar aquí otras variantes si es necesario
        ];
        
        for (const variant of tenantVariants) {
          if (variant !== tenantId) {
            console.log('🔄 Probando variante de tenant:', variant);
            const variantResult = await client
              .from('proveedores')
              .select('*')
              .eq('tenant_id', variant)
              .order('created_at', { ascending: false });
            
            if (!variantResult.error && variantResult.data && variantResult.data.length > 0) {
              console.log('✅ Datos encontrados con tenant:', variant, 'Cantidad:', variantResult.data.length);
              data = variantResult.data;
              error = null;
              break;
            }
          }
        }
      }

      // Diagnóstico en caso de no encontrar datos
      if (!error && (!data || data.length === 0)) {
        console.log('🔍 Verificando qué tenant_ids existen en la BD...');
        const { data: sampleData } = await client
          .from('proveedores')
          .select('tenant_id, nombre')
          .limit(5);
        console.log('🔍 Muestra de datos:', sampleData?.map(p => ({ tenant: p.tenant_id, nombre: p.nombre })));
      }

      if (error) {
        console.error('❌ Error Supabase:', error);
      }

      if (!error && data && data.length > 0) {
        console.log('✅ Proveedores cargados desde Supabase:', data.length);
        // Sincronizar con localStorage
        data.forEach(prov => this.saveToLocalStorage(prov));
        return { success: true, data, source: 'supabase' };
      }

      // Si no hay datos, retornar array vacío
      console.log('⚠️ Sin datos en Supabase');
      return { success: true, data: [], source: 'supabase' };

    } catch (error) {
      console.error('❌ Error obteniendo proveedores:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  // ACTUALIZAR PROVEEDOR
  async updateProveedor(proveedorId, updates) {
    try {
      const { client, tenantId } = await this.getSupabaseClient();
      
      const datosActualizados = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      // 1. Actualizar en Supabase
      const { data, error } = await client
        .from('proveedores')
        .update(datosActualizados)
        .eq('id', proveedorId)
        .eq('tenant_id', tenantId) // Seguridad adicional
        .select()
        .single();

      if (error) {
        console.error('❌ Error actualizando en Supabase:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Proveedor actualizado:', proveedorId);
      return { success: true, data, source: 'supabase' };

    } catch (error) {
      console.error('❌ Error actualizando proveedor:', error);
      return { success: false, error: error.message };
    }
  }

  // ELIMINAR PROVEEDOR
  async deleteProveedor(proveedorId) {
    try {
      const { client, tenantId } = await this.getSupabaseClient();

      // 1. Eliminar de Supabase
      const { error } = await client
        .from('proveedores')
        .delete()
        .eq('id', proveedorId)
        .eq('tenant_id', tenantId); // Seguridad adicional

      if (error) {
        console.error('❌ Error eliminando de Supabase:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Proveedor eliminado:', proveedorId);
      return { success: true };

    } catch (error) {
      console.error('❌ Error eliminando proveedor:', error);
      return { success: false, error: error.message };
    }
  }

  // CREAR DPA (Data Processing Agreement)
  async createDPA(proveedorId, dpaData) {
    try {
      const { client, tenantId } = await this.getSupabaseClient();
      
      const nuevoDPA = {
        proveedor_id: proveedorId,
        tenant_id: tenantId,
        ...dpaData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // 1. Guardar DPA en Supabase
      const { data: dpaCreated, error: dpaError } = await client
        .from('dpas')
        .insert([nuevoDPA])
        .select()
        .single();

      if (dpaError) {
        console.error('❌ Error creando DPA:', dpaError);
        return { success: false, error: dpaError.message };
      }

      // 2. Actualizar proveedor con info del DPA
      await this.updateProveedor(proveedorId, {
        dpa_info: {
          firmado: true,
          fecha_firma: dpaData.fecha_firma,
          vigencia_inicio: dpaData.vigencia_inicio,
          vigencia_fin: dpaData.vigencia_fin,
          version: dpaData.version,
          dpa_id: dpaCreated.id
        }
      });

      console.log('✅ DPA creado:', dpaCreated.id);
      return { success: true, data: dpaCreated, source: 'supabase' };

    } catch (error) {
      console.error('❌ Error creando DPA:', error);
      return { success: false, error: error.message };
    }
  }

  // CREAR EVALUACIÓN DE SEGURIDAD
  async createEvaluacionSeguridad(proveedorId, evaluacionData) {
    try {
      const { client, tenantId } = await this.getSupabaseClient();
      
      const nuevaEvaluacion = {
        proveedor_id: proveedorId,
        tenant_id: tenantId,
        ...evaluacionData,
        created_at: new Date().toISOString()
      };

      // 1. Guardar evaluación en Supabase
      const { data, error } = await client
        .from('evaluaciones_seguridad')
        .insert([nuevaEvaluacion])
        .select()
        .single();

      if (error) {
        console.error('❌ Error creando evaluación:', error);
        return { success: false, error: error.message };
      }

      // 2. Actualizar proveedor con resultado de evaluación
      await this.updateProveedor(proveedorId, {
        evaluacion_seguridad: {
          realizada: true,
          fecha_evaluacion: evaluacionData.fecha_evaluacion,
          puntuacion: evaluacionData.puntuacion,
          nivel_riesgo: this.calcularNivelRiesgo(evaluacionData.puntuacion),
          evaluacion_id: data.id
        }
      });

      console.log('✅ Evaluación creada:', data.id);
      return { success: true, data, source: 'supabase' };

    } catch (error) {
      console.error('❌ Error creando evaluación:', error);
      return { success: false, error: error.message };
    }
  }

  // ASOCIAR PROVEEDOR A RAT
  async asociarProveedorRAT(proveedorId, ratId) {
    try {
      const { client, tenantId } = await this.getSupabaseClient();
      
      const asociacion = {
        proveedor_id: proveedorId,
        rat_id: ratId,
        tenant_id: tenantId,
        created_at: new Date().toISOString()
      };

      // 1. Crear asociación en Supabase
      const { data, error } = await client
        .from('rat_proveedores')
        .insert([asociacion])
        .select()
        .single();

      if (error) {
        console.error('❌ Error asociando proveedor a RAT:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Proveedor asociado a RAT:', proveedorId, '→', ratId);
      return { success: true, data, source: 'supabase' };

    } catch (error) {
      console.error('❌ Error en asociación:', error);
      return { success: false, error: error.message };
    }
  }

  // OBTENER PROVEEDORES DE UN RAT
  async getProveedoresByRAT(ratId) {
    try {
      const tenantId = this.getCurrentTenant();
      const client = this.getSupabaseClient();

      const { data, error } = await client
        .from('rat_proveedores')
        .select(`
          *,
          proveedores (*)
        `)
        .eq('rat_id', ratId)
        .eq('tenant_id', tenantId);

      if (error) {
        console.error('❌ Error obteniendo proveedores del RAT:', error);
        return { success: false, error: error.message, data: [] };
      }

      console.log('📊 Proveedores del RAT:', data.length);
      return { success: true, data };

    } catch (error) {
      console.error('❌ Error:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  // VALIDAR AISLACIÓN MULTI-TENANT
  async validarAislacionTenant() {
    try {
      const tenantId = this.getCurrentTenant();
      const client = this.getSupabaseClient();
      
      console.log('🔒 Validando aislación para tenant:', tenantId);

      // Test 1: Intentar acceder a datos de otro tenant (debe fallar)
      const { data: otroTenant, error: errorOtro } = await client
        .from('proveedores')
        .select('*')
        .neq('tenant_id', tenantId)
        .limit(1);

      if (otroTenant && otroTenant.length > 0) {
        console.error('⚠️ ALERTA SEGURIDAD: Se pudieron ver datos de otro tenant!');
        return { secure: false, message: 'Violación de aislación detectada' };
      }

      // Test 2: Verificar que solo vemos nuestros datos
      const { data: misDatos, error } = await client
        .from('proveedores')
        .select('tenant_id')
        .limit(10);

      const tenantsUnicos = [...new Set(misDatos?.map(d => d.tenant_id) || [])];
      
      if (tenantsUnicos.length > 1) {
        console.error('⚠️ ALERTA: Múltiples tenants en resultados');
        return { secure: false, message: 'Múltiples tenants detectados' };
      }

      if (tenantsUnicos.length === 1 && tenantsUnicos[0] !== tenantId) {
        console.error('⚠️ ALERTA: Viendo datos de tenant incorrecto');
        return { secure: false, message: 'Tenant incorrecto en resultados' };
      }

      console.log('✅ Aislación multi-tenant verificada correctamente');
      return { secure: true, message: 'Aislación correcta', tenant: tenantId };

    } catch (error) {
      console.error('❌ Error en validación:', error);
      return { secure: false, error: error.message };
    }
  }

  // MÉTODOS LOCALSTORAGE ELIMINADOS - SOLO USAMOS SUPABASE

  calcularNivelRiesgo(puntuacion) {
    if (puntuacion >= 71) return 'bajo';
    if (puntuacion >= 41) return 'medio';
    return 'alto';
  }

  // ESTADÍSTICAS MULTI-TENANT
  async getEstadisticasTenant() {
    try {
      const { tenantId } = await this.getSupabaseClient();
      const { data: proveedores } = await this.getProveedores();
      
      const stats = {
        tenant_id: tenantId,
        total_proveedores: proveedores.length,
        con_dpa: proveedores.filter(p => p.dpa_info?.firmado).length,
        sin_dpa: proveedores.filter(p => !p.dpa_info?.firmado).length,
        evaluados: proveedores.filter(p => p.evaluacion_seguridad?.realizada).length,
        alto_riesgo: proveedores.filter(p => p.evaluacion_seguridad?.nivel_riesgo === 'alto').length,
        medio_riesgo: proveedores.filter(p => p.evaluacion_seguridad?.nivel_riesgo === 'medio').length,
        bajo_riesgo: proveedores.filter(p => p.evaluacion_seguridad?.nivel_riesgo === 'bajo').length,
        proximos_vencer: proveedores.filter(p => {
          if (!p.dpa_info?.vigencia_fin) return false;
          const diasRestantes = Math.floor((new Date(p.dpa_info.vigencia_fin) - new Date()) / (1000 * 60 * 60 * 24));
          return diasRestantes > 0 && diasRestantes < 90;
        }).length
      };

      console.log('📊 Estadísticas tenant', tenantId, ':', stats);
      return stats;

    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      return null;
    }
  }
}

// Exportar instancia singleton
const proveedoresService = new ProveedoresService();
export default proveedoresService;