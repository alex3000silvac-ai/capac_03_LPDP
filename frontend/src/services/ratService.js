import { supabase } from '../config/supabaseClient';
import temporalAudit from '../utils/temporalAudit';
import aiSupervisor from '../utils/aiSupervisor';

const validateRAT = (ratData) => {
  const requiredFields = [
    ratData.responsable?.nombre,
    ratData.responsable?.email,
    ratData.responsable?.telefono,
    ratData.finalidades?.descripcion,
    ratData.finalidades?.baseLegal,
    ratData.categorias?.titulares?.length > 0,
    ratData.fuente?.tipo,
    ratData.conservacion?.periodo,
    ratData.seguridad?.descripcionGeneral
  ];
  
  return requiredFields.every(field => field);
};

const getCurrentTenantId = async (userId = null) => {
  try {
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id;
    }

    if (userId) {
      const { data: session, error } = await supabase
        .from('user_sessions')
        .select('tenant_id')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (!error && session) {
        return session.tenant_id;
      }
    }

    const { data: defaultTenant, error } = await supabase
      .from('tenants')
      .select('id')
      .limit(1)
      .single();

    return defaultTenant?.id || 'default';
  } catch (error) {
    console.error('Error obteniendo tenant ID desde Supabase');
    return 'default';
  }
};

export const ratService = {
  
  saveCompletedRAT: async (ratData, industryName = 'General', processKey = null, tenantId = null) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const effectiveUser = user || {
        id: 'system-user-' + Date.now(),
        email: process.env.REACT_APP_SYSTEM_EMAIL || 'sistema@empresa.cl'
      };

      const effectiveTenantId = tenantId || await getCurrentTenantId(effectiveUser.id);
      
      const newRAT = {
        tenant_id: effectiveTenantId,
        user_id: effectiveUser.id,
        created_by: effectiveUser.email,
        nombre_actividad: `${industryName} - ${processKey || 'Proceso General'}`,
        area_responsable: ratData.responsable?.area || industryName,
        responsable_proceso: ratData.responsable?.nombre || 'No especificado',
        email_responsable: ratData.responsable?.email || effectiveUser.email,
        telefono_responsable: ratData.responsable?.telefono || '',
        descripcion: ratData.finalidades?.descripcion || 'RAT generado desde sistema de producción',
        finalidad_principal: ratData.finalidades?.descripcion || 'No especificada',
        base_licitud: ratData.finalidades?.baseLegal || 'No especificada',
        base_legal: ratData.finalidades?.baseLegal || 'No especificada',
        categorias_datos: ratData.categorias || {},
        destinatarios_internos: ratData.transferencias?.destinatarios || [],
        transferencias_internacionales: ratData.transferencias || {},
        plazo_conservacion: ratData.conservacion?.periodo || 'No especificado',
        medidas_seguridad_tecnicas: ratData.seguridad?.tecnicas || [],
        medidas_seguridad_organizativas: ratData.seguridad?.organizativas || [],
        status: 'completado',
        estado: 'completado',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {
          version: '1.0',
          industria: industryName,
          proceso: processKey,
          cumpleLey21719: true,
          camposObligatoriosCompletos: validateRAT(ratData),
          usuario: effectiveUser.email,
          timestamp: new Date().toISOString()
        }
      };

      const { data, error } = await supabase
        .from('mapeo_datos_rat')
        .insert([newRAT])
        .select()
        .single();

      if (error) {
        await supabase
          .from('system_alerts')
          .insert({
            alert_type: 'rat_save_failure',
            severity: 'critical',
            title: 'Error guardando RAT',
            description: `No se pudo guardar RAT: ${error.message}`,
            metadata: {
              rat_data_hash: btoa(JSON.stringify(ratData)).slice(0, 50),
              error_code: error.code,
              user_id: effectiveUser.id,
              tenant_id: effectiveTenantId
            },
            created_at: new Date().toISOString()
          });
        
        throw error;
      }

      await temporalAudit.initializeRAT(data, effectiveUser.id, effectiveTenantId);
      await aiSupervisor.superviseRATCreation(data, effectiveUser.id, effectiveTenantId);

      try {
        const ratIntelligenceEngine = (await import('./ratIntelligenceEngine')).default;
        const evaluation = await ratIntelligenceEngine.evaluateRATActivity(ratData);
        
        if (evaluation.compliance_alerts && evaluation.compliance_alerts.length > 0) {
          await ratIntelligenceEngine.createDPOActivities(
            evaluation.compliance_alerts, 
            data.id, 
            effectiveTenantId
          );
        }
      } catch (evalError) {
        console.error('Error generando actividades DPO:', evalError);
      }

      return data;
    } catch (error) {
      console.error('Error crítico en saveCompletedRAT:', error);
      throw error;
    }
  },
  
  getCompletedRATs: async (tenantId = null, userId = null) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const effectiveUser = user || { id: 'system-user-' + Date.now() };
      const currentTenantId = tenantId || await getCurrentTenantId(effectiveUser.id);

      const { data, error } = await supabase
        .from('mapeo_datos_rat')
        .select('*')
        .eq('tenant_id', currentTenantId)
        .order('created_at', { ascending: false });

      if (error) {
        await supabase
          .from('system_alerts')
          .insert({
            alert_type: 'rat_load_failure',
            severity: 'high',
            title: 'Error cargando RATs',
            description: `No se pudieron cargar RATs: ${error.message}`,
            metadata: {
              tenant_id: currentTenantId,
              error_code: error.code,
              user_id: effectiveUser.id
            },
            created_at: new Date().toISOString()
          });
        
        throw error;
      }

      const formattedRATs = data.map(rat => ({
        id: rat.id,
        empresa: rat.tenant_id,
        industria: rat.metadata?.industria || rat.area_responsable,
        proceso: rat.metadata?.proceso || 'General',
        fechaCreacion: rat.created_at,
        fechaModificacion: rat.updated_at,
        estado: rat.estado,
        progreso: 100,
        titulo: rat.nombre_actividad,
        descripcion: rat.descripcion,
        area: rat.area_responsable,
        responsable: {
          nombre: rat.responsable_proceso,
          email: rat.email_responsable,
          telefono: rat.telefono_responsable
        },
        finalidades: {
          descripcion: rat.finalidad_principal,
          baseLegal: rat.base_legal
        },
        categorias: rat.categorias_datos || {},
        transferencias: rat.transferencias_internacionales || {},
        conservacion: { periodo: rat.plazo_conservacion },
        seguridad: {
          tecnicas: rat.medidas_seguridad_tecnicas || [],
          organizativas: rat.medidas_seguridad_organizativas || []
        },
        metadata: {
          version: '1.0',
          cumpleLey21719: true,
          supabase_id: rat.id,
          usuario: rat.created_by,
          ...rat.metadata
        }
      }));

      return formattedRATs;
    } catch (error) {
      console.error('Error crítico en getCompletedRATs:', error);
      throw error;
    }
  },

  updateRAT: async (ratId, updatedData, tenantId = null, userId = null) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const effectiveUserId = userId || user?.id;
      const effectiveTenantId = tenantId || await getCurrentTenantId(effectiveUserId);

      const { data: oldRAT, error: fetchError } = await supabase
        .from('mapeo_datos_rat')
        .select('*')
        .eq('id', ratId)
        .eq('tenant_id', effectiveTenantId)
        .single();

      if (fetchError) throw fetchError;

      const { data, error } = await supabase
        .from('mapeo_datos_rat')
        .update({
          ...updatedData,
          updated_at: new Date().toISOString(),
          updated_by: effectiveUserId
        })
        .eq('id', ratId)
        .eq('tenant_id', effectiveTenantId)
        .select()
        .single();

      if (error) throw error;

      await temporalAudit.trackRATChange(ratId, oldRAT, data, effectiveUserId, effectiveTenantId);
      await aiSupervisor.superviseRATCreation(data, effectiveUserId, effectiveTenantId);

      return data;
    } catch (error) {
      console.error('Error actualizando RAT');
      throw error;
    }
  },

  deleteRAT: async (ratId, tenantId = null, userId = null) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const effectiveUserId = userId || user?.id;
      const effectiveTenantId = tenantId || await getCurrentTenantId(effectiveUserId);

      const { data: ratData, error: fetchError } = await supabase
        .from('mapeo_datos_rat')
        .select('*')
        .eq('id', ratId)
        .eq('tenant_id', effectiveTenantId)
        .single();

      if (fetchError) throw fetchError;

      const { error } = await supabase
        .from('mapeo_datos_rat')
        .delete()
        .eq('id', ratId)
        .eq('tenant_id', effectiveTenantId);

      if (error) throw error;

      await temporalAudit.trackRATChange(ratId, ratData, null, effectiveUserId, effectiveTenantId, {
        reason: 'rat_deleted',
        operation: 'delete'
      });

      return true;
    } catch (error) {
      console.error('Error eliminando RAT');
      throw error;
    }
  },

  validateRAT,

  saveProcessAsDefinitive: async (processData, tenantId = null, userId = null) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const effectiveUserId = userId || user?.id;
      const effectiveTenantId = tenantId || await getCurrentTenantId(effectiveUserId);

      const definitiveProcess = {
        tenant_id: effectiveTenantId,
        process_key: processData.clave || `process_${Date.now()}`,
        process_name: processData.nombre,
        industry: processData.industria,
        description: processData.descripcion,
        process_data: processData,
        created_by: effectiveUserId,
        created_at: new Date().toISOString(),
        status: 'definitivo'
      };

      const { data, error } = await supabase
        .from('rat_processes')
        .insert(definitiveProcess)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error guardando proceso definitivo');
      throw error;
    }
  },

  getSavedProcesses: async (tenantId = null, userId = null) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const effectiveUserId = userId || user?.id;
      const effectiveTenantId = tenantId || await getCurrentTenantId(effectiveUserId);

      const { data, error } = await supabase
        .from('rat_processes')
        .select('*')
        .eq('tenant_id', effectiveTenantId)
        .eq('status', 'definitivo')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data.map(process => process.process_data);
    } catch (error) {
      console.error('Error cargando procesos guardados');
      return [];
    }
  },

  getIndustryConfig: async (industryKey, tenantId = null, userId = null) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const effectiveUserId = userId || user?.id;
      const effectiveTenantId = tenantId || await getCurrentTenantId(effectiveUserId);

      const { data: config, error } = await supabase
        .from('industry_configurations')
        .select('*')
        .eq('tenant_id', effectiveTenantId)
        .eq('industry_name', industryKey)
        .single();

      if (error && error.code === 'PGRST116') {
        const defaultConfig = {
          tenant_id: effectiveTenantId,
          industry_name: industryKey,
          configuration: {
            ratsCompletados: [],
            configuracionGuardada: {},
            workInProgress: {},
            lastModified: new Date().toISOString()
          },
          created_by: effectiveUserId,
          created_at: new Date().toISOString()
        };

        const { data: newConfig, error: insertError } = await supabase
          .from('industry_configurations')
          .insert(defaultConfig)
          .select()
          .single();

        if (insertError) throw insertError;
        return newConfig.configuration;
      }

      if (error) throw error;
      return config.configuration;
    } catch (error) {
      console.error('Error obteniendo configuración de industria');
      return {
        ratsCompletados: [],
        configuracionGuardada: {},
        workInProgress: {}
      };
    }
  },

  updateIndustryConfig: async (industryKey, updates, tenantId = null, userId = null) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const effectiveUserId = userId || user?.id;
      const effectiveTenantId = tenantId || await getCurrentTenantId(effectiveUserId);

      const currentConfig = await ratService.getIndustryConfig(industryKey, effectiveTenantId, effectiveUserId);
      
      const updatedConfig = {
        ...currentConfig,
        ...updates,
        lastModified: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('industry_configurations')
        .upsert({
          tenant_id: effectiveTenantId,
          industry_name: industryKey,
          configuration: updatedConfig,
          updated_by: effectiveUserId,
          updated_at: new Date().toISOString()
        }, { onConflict: 'tenant_id,industry_name' })
        .select()
        .single();

      if (error) throw error;
      return data.configuration;
    } catch (error) {
      console.error('Error actualizando configuración de industria');
      throw error;
    }
  },

  setCurrentTenant: async (tenant, userId) => {
    try {
      await supabase
        .from('user_sessions')
        .upsert({
          user_id: userId,
          tenant_id: tenant.id,
          session_start: new Date().toISOString(),
          last_activity: new Date().toISOString(),
          is_active: true,
          tenant_data: tenant
        }, { onConflict: 'user_id' });

      return { success: true };
    } catch (error) {
      console.error('Error estableciendo tenant actual');
      return { success: false, error: error.message };
    }
  },

  getCurrentTenant: async (userId) => {
    try {
      const { data: session, error } = await supabase
        .from('user_sessions')
        .select(`
          tenant_id,
          tenant_data,
          tenants(*)
        `)
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      return session.tenants || session.tenant_data;
    } catch (error) {
      console.error('Error obteniendo tenant actual');
      return null;
    }
  },

  logAuditEvent: async (auditEntry, tenantId = null, userId = null) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const effectiveUserId = userId || user?.id;
      const effectiveTenantId = tenantId || await getCurrentTenantId(effectiveUserId);

      await supabase
        .from('audit_logs')
        .insert({
          tenant_id: effectiveTenantId,
          user_id: effectiveUserId,
          operation_type: auditEntry.accion,
          table_name: auditEntry.tabla,
          record_id: auditEntry.recordId,
          old_values: auditEntry.valoresAnteriores,
          new_values: auditEntry.valoresNuevos,
          description: auditEntry.descripcion,
          timestamp: new Date().toISOString(),
          metadata: auditEntry
        });

      return { success: true };
    } catch (error) {
      console.error('Error guardando log de auditoría');
      return { success: false, error: error.message };
    }
  },

  getAuditLogs: async (filters = {}, tenantId = null, userId = null) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const effectiveUserId = userId || user?.id;
      const effectiveTenantId = tenantId || await getCurrentTenantId(effectiveUserId);

      let query = supabase
        .from('audit_logs')
        .select('*')
        .eq('tenant_id', effectiveTenantId)
        .order('timestamp', { ascending: false });

      if (filters.accion) {
        query = query.eq('operation_type', filters.accion);
      }
      if (filters.tabla) {
        query = query.eq('table_name', filters.tabla);
      }
      if (filters.fechaInicio) {
        query = query.gte('timestamp', filters.fechaInicio);
      }
      if (filters.fechaFin) {
        query = query.lte('timestamp', filters.fechaFin);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error obteniendo logs de auditoría');
      return [];
    }
  },

  getAllTenantIds: async () => {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('id')
        .eq('is_active', true);

      if (error) throw error;
      return data.map(tenant => tenant.id);
    } catch (error) {
      console.error('Error obteniendo tenant IDs');
      return [];
    }
  },

  clearTenantData: async (tenantId, userId) => {
    try {
      const tables = ['mapeo_datos_rat', 'rat_processes', 'industry_configurations', 'audit_logs'];
      
      for (const table of tables) {
        await supabase
          .from(table)
          .delete()
          .eq('tenant_id', tenantId);
      }

      await supabase
        .from('system_alerts')
        .insert({
          alert_type: 'tenant_data_cleared',
          severity: 'high',
          title: 'Datos de tenant eliminados',
          description: `Todos los datos del tenant ${tenantId} han sido eliminados`,
          metadata: {
            tenant_id: tenantId,
            cleared_by: userId,
            tables_cleared: tables
          },
          created_at: new Date().toISOString()
        });

      return { success: true, tables_cleared: tables.length };
    } catch (error) {
      console.error('Error limpiando datos de tenant');
      return { success: false, error: error.message };
    }
  },

  migrateFromLocalStorage: async (userId) => {
    try {
      const persistenceValidator = (await import('../utils/persistenceValidator')).default;
      const tenantId = await getCurrentTenantId(userId);
      
      const migrationResult = await persistenceValidator.migrateLocalStorageToSupabase(tenantId, userId);
      
      if (migrationResult.success) {
        await persistenceValidator.cleanupLocalStorage();
      }

      return migrationResult;
    } catch (error) {
      console.error('Error en migración');
      return { success: false, error: error.message };
    }
  },

  enableSupabaseOnlyMode: async (userId) => {
    try {
      const persistenceValidator = (await import('../utils/persistenceValidator')).default;
      return await persistenceValidator.enableSupabaseOnlyMode(userId);
    } catch (error) {
      console.error('Error habilitando modo Supabase-únicamente');
      return { success: false, error: error.message };
    }
  },

  getRATById: async (ratId, tenantId = null, userId = null) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const effectiveUser = user || { id: userId };
      const effectiveTenantId = tenantId || await getCurrentTenantId(effectiveUser.id);
      
      console.log('🔍 Buscando RAT por ID:', ratId, 'Tenant:', effectiveTenantId);
      
      const { data, error } = await supabase
        .from('mapeo_datos_rat')
        .select('*')
        .eq('id', ratId)
        .eq('tenant_id', effectiveTenantId)
        .single();
        
      if (error) {
        console.error('Error obteniendo RAT por ID:', error);
        throw error;
      }
      
      console.log('✅ RAT encontrado:', data.nombre_actividad);
      return data;
    } catch (error) {
      console.error('Error en getRATById:', error);
      throw error;
    }
  }
};

export default ratService;