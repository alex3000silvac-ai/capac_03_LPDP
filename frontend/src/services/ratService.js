import { supabase } from '../config/supabaseClient';
import temporalAudit from '../utils/temporalAudit';
import aiSupervisor from '../utils/aiSupervisor';
import preventiveAI from '../utils/preventiveAI';

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

      if (!error && session?.tenant_id) {
        return session.tenant_id;
      }
    }

    // Si no hay sesión activa, usar tenant por defecto
    return 'default';
  } catch (error) {
    // console.warn('Usando tenant por defecto debido a error:', error.message);
    return 'default';
  }
};

export const ratService = {
  getCurrentTenantId,
  
  saveCompletedRAT: async (ratData, industryName = 'General', processKey = null, tenantId = null) => {
    try {
      // 🛡️ VALIDACIÓN PREVENTIVA - ANTES DE CREAR RAT
      const validation = await preventiveAI.interceptAction('CREATE_RAT', {
        tenantId: tenantId,
        ratData: ratData,
        industryName: industryName
      });
      
      if (!validation.allowed) {
        // console.log('🚫 Creación RAT bloqueada preventivamente:', validation.reason);
        throw new Error(`Acción preventiva requerida: ${validation.reason}`);
      }
      
      if (validation.preventiveActionExecuted) {
        // console.log('🔄 Acción preventiva ejecutada:', validation.preventiveActionExecuted);
      }
      
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
        area_responsable: ratData.responsable?.razonSocial || ratData.responsable?.area || industryName,
        responsable_proceso: ratData.responsable?.nombre || 'No especificado',
        email_responsable: ratData.responsable?.email || effectiveUser.email,
        telefono_responsable: ratData.responsable?.telefono || '',
        // 🔧 CORRECCIÓN CRÍTICA: Campos guardados en metadata ya que no existen en tabla
        descripcion: ratData.finalidades?.descripcion || 'RAT generado desde sistema de producción',
        finalidad_principal: ratData.finalidad || ratData.finalidades?.descripcion || 'No especificada',
        base_licitud: ratData.finalidades?.baseLegal || ratData.baseLegal || 'No especificada',
        base_legal: ratData.finalidades?.baseLegal || ratData.baseLegal || 'No especificada',
        base_legal_descripcion: ratData.argumentoJuridico || ratData.finalidades?.argumentoJuridico || '',
        categorias_datos: ratData.categorias || {},
        destinatarios_internos: ratData.destinatarios || ratData.transferencias?.destinatarios || [],
        transferencias_internacionales: ratData.transferenciasInternacionales || ratData.transferencias || {},
        plazo_conservacion: ratData.plazoConservacion || ratData.conservacion?.periodo || 'No especificado',
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
          timestamp: new Date().toISOString(),
          // Campos adicionales que no están en tabla
          rut_empresa: ratData.responsable?.rut || '',
          direccion_empresa: ratData.responsable?.direccion || ''
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

      // 🔄 INTEGRACIONES AUTOMÁTICAS CRÍTICAS
      try {
        const ratIntelligenceEngine = (await import('./ratIntelligenceEngine')).default;
        const evaluation = await ratIntelligenceEngine.evaluateRATActivity(ratData);
        
        // 1. AUTO-GENERACIÓN EIPD si riesgo alto (según diagrama flujo)
        if (evaluation.riskLevel === 'ALTO' || evaluation.requiereEIPD) {
          await autoGenerarEIPD(data.id, ratData, effectiveTenantId, effectiveUser.id);
        }
        
        // 2. REGISTRO AUTOMÁTICO EN INVENTARIO
        await registrarEnInventarioRAT(data, effectiveTenantId);
        
        // 3. CREAR ACTIVIDADES DPO (workflow automático)
        if (evaluation.compliance_alerts && evaluation.compliance_alerts.length > 0) {
          await ratIntelligenceEngine.createDPOActivities(
            evaluation.compliance_alerts, 
            data.id, 
            effectiveTenantId
          );
        }
        
        // 4. NOTIFICACIÓN AUTOMÁTICA DPO
        await notificarDPOAutomatico(data, evaluation, effectiveTenantId);
        
      } catch (evalError) {
        console.error('Error en integraciones automáticas:', evalError);
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
          telefono: rat.telefono_responsable,
          // 🔧 RECUPERAR CAMPOS DESDE METADATA:
          razonSocial: rat.area_responsable,
          rut: rat.metadata?.rut_empresa || '',
          direccion: rat.metadata?.direccion_empresa || ''
        },
        finalidades: {
          descripcion: rat.finalidad_principal,
          baseLegal: rat.base_legal,
          argumentoJuridico: rat.base_legal_descripcion || ''
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

      // Eliminar referencias dependientes ANTES de eliminar RAT
      // console.log('🗑️ Eliminando actividades DPO relacionadas...');
      await supabase
        .from('actividades_dpo')
        .delete()
        .eq('rat_id', ratId)
        .eq('tenant_id', effectiveTenantId);

      // Eliminar otras referencias dependientes
      // console.log('🗑️ Eliminando documentos generados relacionados...');
      await supabase
        .from('actividades_dpo')
        .delete()
        .eq('rat_id', ratId);

      // console.log('🗑️ Eliminando notificaciones relacionadas...');
      await supabase
        .from('dpo_notifications')
        .delete()
        .eq('rat_id', ratId);

      // Ahora eliminar el RAT principal
      // console.log('🗑️ Eliminando RAT principal...');
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
      // Intentar usar user_sessions, pero no fallar si no existe
      const { error } = await supabase
        .from('user_sessions')
        .upsert({
          user_id: userId,
          tenant_id: tenant.id,
          session_start: new Date().toISOString(),
          last_activity: new Date().toISOString(),
          is_active: true,
          tenant_data: tenant
        }, { onConflict: 'user_id' });

      if (error) {
        // console.warn('Tabla user_sessions no disponible, usando modo sin persistencia de sesión');
      }

      return { success: true };
    } catch (error) {
      // console.warn('Error estableciendo tenant actual, continuando sin persistencia:', error.message);
      return { success: true }; // No fallar por esto
    }
  },

  getCurrentTenant: async (userId) => {
    try {
      const { data: session, error } = await supabase
        .from('user_sessions')
        .select('tenant_id, tenant_data')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (error) {
        // console.warn('No hay sesión activa, usando tenant por defecto');
        return { id: 'default', company_name: 'Empresa Default' };
      }
      
      return session.tenant_data || { id: session.tenant_id, company_name: 'Empresa' };
    } catch (error) {
      console.error('Error obteniendo tenant actual');
      return { id: 'default', company_name: 'Empresa Default' };
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
      
      // console.log('🔍 Buscando RAT por ID:', ratId, 'Tenant:', effectiveTenantId);
      
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
      
      // console.log('✅ RAT encontrado:', data.nombre_actividad);
      return data;
    } catch (error) {
      console.error('Error en getRATById:', error);
      throw error;
    }
  },

  // 🔄 FUNCIÓN CRÍTICA: updateRAT con integraciones automáticas
  updateRAT: async (ratId, updatedData, tenantId = null, userId = null) => {
    try {
      // 🛡️ VALIDACIÓN PREVENTIVA - ANTES DE ACTUALIZAR RAT
      const validation = await preventiveAI.interceptAction('UPDATE_RAT', {
        tenantId: tenantId,
        ratId: ratId,
        changes: updatedData
      });
      
      if (!validation.allowed) {
        // console.log('🚫 Actualización RAT bloqueada preventivamente:', validation.reason);
        throw new Error(`Acción preventiva requerida: ${validation.reason}`);
      }
      
      const { data: { user } } = await supabase.auth.getUser();
      const effectiveUser = user || { id: userId };
      const effectiveTenantId = tenantId || await getCurrentTenantId(effectiveUser.id);
      
      // console.log('🔄 Actualizando RAT:', ratId);
      
      // Actualizar RAT en BD
      const { data, error } = await supabase
        .from('mapeo_datos_rat')
        .update({
          ...updatedData,
          updated_at: new Date().toISOString(),
          updated_by: effectiveUser.id
        })
        .eq('id', ratId)
        .eq('tenant_id', effectiveTenantId)
        .select()
        .single();
        
      if (error) throw error;
      
      // 🔄 INTEGRACIONES AUTOMÁTICAS EN ACTUALIZACIÓN
      try {
        // 1. ACTUALIZAR INVENTARIO automáticamente
        await actualizarInventarioRAT(data, effectiveTenantId);
        
        // 2. RE-EVALUAR EIPD si cambió riesgo
        const ratIntelligenceEngine = (await import('./ratIntelligenceEngine')).default;
        const evaluation = await ratIntelligenceEngine.evaluateRATActivity(data);
        
        if (evaluation.riskLevel === 'ALTO' && !evaluation.tieneEIPD) {
          await autoGenerarEIPD(ratId, data, effectiveTenantId, effectiveUser.id);
        }
        
        // 3. NOTIFICAR CAMBIOS IMPORTANTES A DPO
        if (evaluation.cambiosSignificativos) {
          await notificarCambiosRATaDPO(data, evaluation, effectiveTenantId);
        }
        
      } catch (integrationError) {
        console.error('Error en integraciones automáticas update:', integrationError);
      }
      
      // console.log('✅ RAT actualizado con integraciones:', data.id);
      return data;
      
    } catch (error) {
      console.error('Error en updateRAT:', error);
      throw error;
    }
  }
};

// 🔄 FUNCIONES INTEGRACIÓN AUTOMÁTICA - PROTOCOLO DIAGRAMA FLUJOS

const autoGenerarEIPD = async (ratId, ratData, tenantId, userId) => {
  try {
    // console.log('🔄 Auto-generando EIPD para RAT:', ratId);
    
    // Verificar si ya existe EIPD para este RAT
    const { data: existingEIPD } = await supabase
      .from('actividades_dpo')
      .select('id')
      .eq('rat_id', ratId)
      .eq('tipo_actividad', 'EIPD')
      .single();
    
    if (existingEIPD) {
      // console.log('✅ EIPD ya existe para RAT:', ratId);
      return existingEIPD;
    }
    
    // Crear EIPD automático
    const eipdData = {
      tenant_id: tenantId,
      user_id: userId,
      source_rat_id: ratId,
      document_type: 'EIPD',
      title: `EIPD Auto-generada - ${ratData.responsable?.nombre || 'RAT ' + ratId}`,
      content: {
        rat_id: ratId,
        generated_timestamp: new Date().toISOString(),
        assessment_level: 'AUTOMATICO',
        requires_manual_review: true,
        source_data: ratData
      },
      status: 'BORRADOR',
      created_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('actividades_dpo')
      .insert({
        rat_id: eipdData.rat_id,
        tenant_id: eipdData.tenant_id,
        tipo_actividad: 'EIPD',
        descripcion: eipdData.titulo,
        estado: eipdData.status || 'pendiente',
        metadatos: eipdData
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // console.log('✅ EIPD auto-generada:', data.id);
    return data;
    
  } catch (error) {
    console.error('❌ Error auto-generando EIPD:', error);
    throw error;
  }
};

const registrarEnInventarioRAT = async (ratData, tenantId) => {
  try {
    // console.log('🔄 Verificando RAT en inventario (usando vista):', ratData.id);
    
    // CORREGIDO: Solo verificar en VISTA (READ-ONLY)
    const { data: existing } = await supabase
      .from('inventario_rats')
      .select('id')
      .eq('id', ratData.id)
      .eq('tenant_id', tenantId)
      .single();
    
    if (existing) {
      // console.log('✅ RAT ya visible en inventario');
      return existing;
    }
    
    // console.log('📋 RAT creado, inventario se actualizará automáticamente via vista');
    
    // NO INTENTAR INSERT EN VISTA - La vista se actualiza automáticamente
    // desde mapeo_datos_rat que ya contiene todos los datos necesarios
    return { 
      id: ratData.id, 
      tenant_id: tenantId,
      status: 'auto_registered_in_view' 
    };
    
  } catch (error) {
    console.error('❌ Error registrando en inventario:', error);
    // No bloquear creación RAT por error inventario
    return null;
  }
};

const notificarDPOAutomatico = async (ratData, evaluation, tenantId) => {
  try {
    // console.log('🔔 Enviando notificación automática a DPO');
    
    const notificacion = {
      tenant_id: tenantId,
      type: 'RAT_CREADO',
      title: `Nuevo RAT requiere revisión: ${ratData.nombre_actividad}`,
      message: `RAT ID ${ratData.id} creado. Riesgo: ${evaluation.riskLevel || 'MEDIO'}. ${evaluation.requiereEIPD ? 'Requiere EIPD.' : 'Sin EIPD requerida.'}`,
      priority: evaluation.riskLevel === 'ALTO' ? 'alta' : 'media',
      target_role: 'DPO',
      metadata: {
        rat_id: ratData.id,
        risk_level: evaluation.riskLevel,
        requires_eipd: evaluation.requiereEIPD,
        auto_notification: true
      },
      created_at: new Date().toISOString(),
      read_at: null
    };
    
    const { data, error } = await supabase
      .from('notifications')
      .insert(notificacion)
      .select()
      .single();
    
    if (error) throw error;
    
    // console.log('✅ DPO notificado automáticamente');
    return data;
    
  } catch (error) {
    console.error('❌ Error notificando DPO:', error);
    return null;
  }
};

const actualizarInventarioRAT = async (ratData, tenantId) => {
  try {
    // console.log('🔄 Verificando RAT actualizado en inventario:', ratData.id);
    
    // CORREGIDO: NO actualizar vista - se actualiza automáticamente
    // La vista inventario_rats se actualiza cuando se modifica mapeo_datos_rat
    // console.log('📋 Inventario se actualiza automáticamente via vista desde mapeo_datos_rat');
    
    // Solo verificar que esté visible en la vista
    const { data, error } = await supabase
      .from('inventario_rats')
      .select('id, name, updated_at')
      .eq('id', ratData.id)
      .eq('tenant_id', tenantId)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      // console.warn('⚠️ RAT no visible en inventario aún:', error.message);
    }
    
    // console.log('✅ Inventario verificado');
    return data || { id: ratData.id, status: 'pending_view_update' };
    
  } catch (error) {
    console.error('❌ Error actualizando inventario:', error);
    return null;
  }
};

const notificarCambiosRATaDPO = async (ratData, evaluation, tenantId) => {
  try {
    // console.log('🔔 Notificando cambios RAT a DPO');
    
    const notificacion = {
      tenant_id: tenantId,
      type: 'RAT_MODIFICADO',
      title: `RAT actualizado requiere revisión: ${ratData.nombre_actividad}`,
      message: `RAT ID ${ratData.id} modificado. Nuevas condiciones de riesgo: ${evaluation.riskLevel}. Revisar cambios.`,
      priority: evaluation.riskLevel === 'ALTO' ? 'alta' : 'media',
      target_role: 'DPO',
      metadata: {
        rat_id: ratData.id,
        risk_level: evaluation.riskLevel,
        changes_summary: evaluation.cambiosSignificativos,
        auto_notification: true,
        action_required: evaluation.riskLevel === 'ALTO'
      },
      created_at: new Date().toISOString(),
      read_at: null
    };
    
    const { data, error } = await supabase
      .from('notifications')
      .insert(notificacion)
      .select()
      .single();
    
    if (error) throw error;
    
    // console.log('✅ DPO notificado de cambios RAT');
    return data;
    
  } catch (error) {
    console.error('❌ Error notificando cambios DPO:', error);
    return null;
  }
};

export default ratService;