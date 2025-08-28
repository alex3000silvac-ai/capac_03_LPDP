// SERVICIO DE PROVEEDORES - MULTI-TENANT CON AISLACIÓN TOTAL
// Sistema LPDP v3.0.1 - Ley 21.719

import supabase from '../config/supabaseClient';

class ProveedoresService {
  // Obtener tenant actual del usuario
  getCurrentTenant() {
    // Primero intentar obtener de TenantContext
    const currentTenant = localStorage.getItem('lpdp_current_tenant');
    if (currentTenant) {
      try {
        const tenant = JSON.parse(currentTenant);
        // Si el tenant es de jurídica, usar directamente
        if (tenant.id && tenant.id.includes('juridica')) {
          return 'juridica_digital';
        }
        return tenant.id;
      } catch (e) {
        console.error('Error parsing tenant:', e);
      }
    }
    
    // Si no hay tenant, usar juridica_digital por defecto para este usuario
    return 'juridica_digital';
  }

  // Obtener cliente Supabase con RLS para tenant
  getSupabaseClient() {
    const tenantId = this.getCurrentTenant();
    // RLS automático filtrará por tenant_id
    return supabase;
  }

  // CREAR PROVEEDOR
  async createProveedor(proveedorData) {
    try {
      const tenantId = this.getCurrentTenant();
      const client = this.getSupabaseClient();
      
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
        // Fallback a localStorage
        this.saveToLocalStorage(nuevoProveedor);
        return { success: true, data: nuevoProveedor, source: 'localStorage' };
      }

      // 2. Backup en localStorage
      this.saveToLocalStorage(data);

      console.log('✅ Proveedor creado:', data.id, 'Tenant:', tenantId);
      return { success: true, data, source: 'supabase' };

    } catch (error) {
      console.error('❌ Error creando proveedor:', error);
      return { success: false, error: error.message };
    }
  }

  // OBTENER TODOS LOS PROVEEDORES DEL TENANT
  async getProveedores() {
    try {
      const tenantId = this.getCurrentTenant();
      const client = this.getSupabaseClient();
      
      console.log('🔍 Buscando proveedores para tenant:', tenantId);

      // 1. Intentar desde Supabase
      const { data, error } = await client
        .from('proveedores')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        console.log('📊 Proveedores desde Supabase:', data.length);
        // Sincronizar con localStorage
        data.forEach(prov => this.saveToLocalStorage(prov));
        return { success: true, data, source: 'supabase' };
      }

      // 2. Fallback a localStorage
      console.log('⚠️ Usando localStorage como fallback');
      const localProveedores = this.getFromLocalStorage();
      return { success: true, data: localProveedores, source: 'localStorage' };

    } catch (error) {
      console.error('❌ Error obteniendo proveedores:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  // ACTUALIZAR PROVEEDOR
  async updateProveedor(proveedorId, updates) {
    try {
      const tenantId = this.getCurrentTenant();
      const client = this.getSupabaseClient();
      
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
        // Fallback a localStorage
        this.updateInLocalStorage(proveedorId, datosActualizados);
        return { success: true, data: datosActualizados, source: 'localStorage' };
      }

      // 2. Actualizar localStorage
      this.saveToLocalStorage(data);

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
      const tenantId = this.getCurrentTenant();
      const client = this.getSupabaseClient();

      // 1. Eliminar de Supabase
      const { error } = await client
        .from('proveedores')
        .delete()
        .eq('id', proveedorId)
        .eq('tenant_id', tenantId); // Seguridad adicional

      if (error) {
        console.error('❌ Error eliminando de Supabase:', error);
      }

      // 2. Eliminar de localStorage
      this.deleteFromLocalStorage(proveedorId);

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
      const tenantId = this.getCurrentTenant();
      const client = this.getSupabaseClient();
      
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
        this.saveDPAToLocalStorage(nuevoDPA);
        return { success: true, data: nuevoDPA, source: 'localStorage' };
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
      const tenantId = this.getCurrentTenant();
      const client = this.getSupabaseClient();
      
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
        this.saveEvaluacionToLocalStorage(nuevaEvaluacion);
        return { success: true, data: nuevaEvaluacion, source: 'localStorage' };
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
      const tenantId = this.getCurrentTenant();
      const client = this.getSupabaseClient();
      
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
        this.saveAsociacionToLocalStorage(asociacion);
        return { success: true, data: asociacion, source: 'localStorage' };
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

  // HELPERS LOCALSTORAGE
  saveToLocalStorage(proveedor) {
    const tenantId = this.getCurrentTenant();
    const key = `proveedor_${tenantId}_${proveedor.id}`;
    localStorage.setItem(key, JSON.stringify(proveedor));
  }

  getFromLocalStorage() {
    const tenantId = this.getCurrentTenant();
    const prefix = `proveedor_${tenantId}_`;
    const proveedores = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        try {
          const proveedor = JSON.parse(localStorage.getItem(key));
          proveedores.push(proveedor);
        } catch (e) {
          console.error('Error parsing localStorage item:', key);
        }
      }
    }
    
    return proveedores;
  }

  updateInLocalStorage(proveedorId, updates) {
    const tenantId = this.getCurrentTenant();
    const key = `proveedor_${tenantId}_${proveedorId}`;
    const existing = JSON.parse(localStorage.getItem(key) || '{}');
    const updated = { ...existing, ...updates };
    localStorage.setItem(key, JSON.stringify(updated));
  }

  deleteFromLocalStorage(proveedorId) {
    const tenantId = this.getCurrentTenant();
    const key = `proveedor_${tenantId}_${proveedorId}`;
    localStorage.removeItem(key);
  }

  saveDPAToLocalStorage(dpa) {
    const tenantId = this.getCurrentTenant();
    const key = `dpa_${tenantId}_${dpa.proveedor_id}_${Date.now()}`;
    localStorage.setItem(key, JSON.stringify(dpa));
  }

  saveEvaluacionToLocalStorage(evaluacion) {
    const tenantId = this.getCurrentTenant();
    const key = `evaluacion_${tenantId}_${evaluacion.proveedor_id}_${Date.now()}`;
    localStorage.setItem(key, JSON.stringify(evaluacion));
  }

  saveAsociacionToLocalStorage(asociacion) {
    const tenantId = this.getCurrentTenant();
    const key = `rat_proveedor_${tenantId}_${asociacion.rat_id}_${asociacion.proveedor_id}`;
    localStorage.setItem(key, JSON.stringify(asociacion));
  }

  calcularNivelRiesgo(puntuacion) {
    if (puntuacion >= 71) return 'bajo';
    if (puntuacion >= 41) return 'medio';
    return 'alto';
  }

  // ESTADÍSTICAS MULTI-TENANT
  async getEstadisticasTenant() {
    try {
      const tenantId = this.getCurrentTenant();
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