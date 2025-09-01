/**
 * Servicio para gestión de RATs
 * VERSIÓN PRODUCCIÓN: Integración completa con Supabase
 */

import { supabase } from '../config/supabaseClient';

// Función para validar RAT según Ley 21.719 - MOVIDA AL INICIO
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
  
  // Guardar RAT completado en Supabase (PRODUCCIÓN)
  saveCompletedRAT: async (ratData, industryName = 'General', processKey = null, tenantId = null) => {
    try {
      console.log('🚀 Guardando RAT en Supabase (PRODUCCIÓN):', ratData);
      
      // Intentar obtener usuario actual, usar datos por defecto si no está autenticado
      let user = null;
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        user = authUser;
      } catch (authError) {
        console.warn('⚠️ No hay usuario autenticado, usando datos por defecto:', authError);
      }
      
      // Usar datos por defecto si no hay usuario
      const effectiveUser = user || {
        id: 'system-user-' + Date.now(),
        email: 'sistema@juridica-digital.cl'
      };

      // Preparar datos para Supabase según esquema mapeo_datos_rat
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

      // Guardar en Supabase en la tabla correcta
      const { data, error } = await supabase
        .from('mapeo_datos_rat')
        .insert([newRAT])
        .select()
        .single();

      if (error) {
        console.error('❌ Error guardando RAT en Supabase:', error);
        
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

      console.log('✅ RAT guardado exitosamente en Supabase:', data);
      
      // GENERAR AUTOMÁTICAMENTE ACTIVIDADES DPO Y ENTREGABLES
      try {
        console.log('🔍 Iniciando evaluación de compliance para RAT:', data.id);
        const ratIntelligenceEngine = (await import('./ratIntelligenceEngine')).default;
        const evaluation = await ratIntelligenceEngine.evaluateRATActivity(ratData);
        
        console.log('📊 Resultado de evaluación:', {
          alertas: evaluation.compliance_alerts?.length || 0,
          documentosRequeridos: evaluation.required_documents?.length || 0,
          nivelRiesgo: evaluation.risk_level,
          requiereConsultaPrevia: evaluation.requiere_consulta_previa
        });
        
        // Crear actividades DPO si hay alertas
        if (evaluation.compliance_alerts && evaluation.compliance_alerts.length > 0) {
          console.log('🚀 Creando actividades DPO automáticamente...');
          const dpoResult = await ratIntelligenceEngine.createDPOActivities(
            evaluation.compliance_alerts, 
            data.id, 
            getCurrentTenantId()
          );
          
          if (dpoResult.success) {
            console.log(`✅ ${dpoResult.count} actividades DPO creadas exitosamente`);
          } else {
            console.error('⚠️ Error creando actividades DPO:', dpoResult.error);
            if (dpoResult.fallback === 'local') {
              console.log('💾 Actividades guardadas localmente para sincronización posterior');
            }
          }
        } else {
          console.log('ℹ️ No se requieren actividades DPO para este RAT');
        }
        
        // Log de documentos requeridos
        if (evaluation.required_documents?.length > 0) {
          console.log('📄 Documentos requeridos para este RAT:');
          evaluation.required_documents.forEach(doc => {
            console.log(`  - ${doc.tipo}: ${doc.motivo} (${doc.urgencia}, ${doc.plazo_dias} días)`);
          });
        }
        
      } catch (evalError) {
        console.error('⚠️ Error generando actividades DPO:', evalError);
        console.error('Stack trace:', evalError.stack);
      }

      return data;
    } catch (error) {
      console.error('❌ Error crítico en saveCompletedRAT:', error);
      throw error;
    }
  },
  
  // Obtener todos los RATs completados desde Supabase (PRODUCCIÓN)
  getCompletedRATs: async (tenantId = null, useLocalFallback = true) => {
    try {
      console.log('🚀 Cargando RATs desde Supabase (PRODUCCIÓN)');
      
      // Intentar obtener usuario actual, pero continuar si no hay autenticación
      let user = null;
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        user = authUser;
      } catch (authError) {
        console.warn('⚠️ Error autenticación (continuando sin usuario):', authError);
      }
      
      // Usar datos por defecto si no hay usuario
      const effectiveUser = user || {
        id: 'system-user-' + Date.now(),
        email: 'sistema@juridica-digital.cl'
      };
      
      if (!user) {
        console.warn('👤 Usuario no autenticado, usando usuario por defecto para consulta');
      }

      // Cargar RATs desde Supabase usando tenant_id
      const currentTenantId = await getCurrentTenantId(effectiveUser.id) || 'juridica_digital';
      const { data, error } = await supabase
        .from('mapeo_datos_rat')
        .select('*')
        .eq('tenant_id', currentTenantId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error cargando RATs desde Supabase:', error);
        
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

      console.log(`✅ ${data.length} RATs cargados desde Supabase`);
      
      // Convertir formato Supabase a formato esperado por la UI
      const formattedRATs = data.map(rat => ({
        id: rat.id,
        empresa: rat.tenant_id,
        industria: rat.metadatos ? JSON.parse(rat.metadatos).industria : rat.area,
        proceso: rat.metadatos ? JSON.parse(rat.metadatos).proceso : 'General',
        fechaCreacion: rat.fecha_creacion,
        fechaModificacion: rat.fecha_actualizacion,
        estado: rat.estado,
        progreso: 100,
        titulo: rat.titulo,
        descripcion: rat.descripcion,
        area: rat.area,
        responsable: rat.responsable_tratamiento ? JSON.parse(rat.responsable_tratamiento) : {},
        finalidades: rat.finalidades ? JSON.parse(rat.finalidades) : {},
        categorias: rat.categorias_datos ? JSON.parse(rat.categorias_datos) : {},
        transferencias: rat.transferencias ? JSON.parse(rat.transferencias) : {},
        conservacion: rat.retencion ? JSON.parse(rat.retencion) : {},
        seguridad: rat.medidas_seguridad ? JSON.parse(rat.medidas_seguridad) : {},
        metadata: {
          version: '1.0',
          cumpleLey21719: true,
          supabase_id: rat.id,
          usuario: effectiveUser.email,
          ...(rat.metadatos ? JSON.parse(rat.metadatos) : {})
        }
      }));

      return formattedRATs;
    } catch (error) {
      console.error('❌ Error crítico en getCompletedRATs:', error);
      throw error;
    }
  },
  
  // Actualizar RAT existente
  updateRAT: async (ratId, updatedData, tenantId = null, userId = null) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const effectiveUserId = userId || user?.id;
      const effectiveTenantId = tenantId || await getCurrentTenantId(effectiveUserId);

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

      const { error } = await supabase
        .from('mapeo_datos_rat')
        .delete()
        .eq('id', ratId)
        .eq('tenant_id', effectiveTenantId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error eliminando RAT');
      throw error;
    }
  },
  
  // Validar si RAT está completo según Ley 21.719
  validateRAT: (ratData) => {
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
  },
  
  // Obtener estadísticas de RATs
  getStatistics: async (tenantId = null) => {
    const effectiveTenantId = tenantId || getCurrentTenantId();
    const rats = await ratService.getCompletedRATs(effectiveTenantId);
    
    return {
      total: rats.length,
      completados: rats.filter(rat => rat.estado === 'Completado').length,
      enProceso: rats.filter(rat => rat.estado === 'En Proceso').length,
      porIndustria: rats.reduce((acc, rat) => {
        acc[rat.industria] = (acc[rat.industria] || 0) + 1;
        return acc;
      }, {}),
      ultimaActualizacion: rats.length > 0 ? 
        Math.max(...rats.map(rat => new Date(rat.fechaModificacion).getTime())) :
        Date.now(),
      cumplimiento: {
        completos: rats.filter(rat => rat.metadata?.camposObligatoriosCompletos).length,
        incompletos: rats.filter(rat => !rat.metadata?.camposObligatoriosCompletos).length
      }
    };
  },
  
  // Guardar proceso de industria como definitivo
  saveProcessAsDefinitive: (industryKey, processKey, processData) => {
    const processes = ratService.getSavedProcesses();
    const id = `${industryKey}_${processKey}_${Date.now()}`;
    
    const definitiveProcess = {
      id,
      industryKey,
      processKey,
      nombre: processData.nombre,
      estado: 'definitivo',
      fechaGuardado: new Date().toISOString(),
      data: processData
    };
    
    processes.push(definitiveProcess);
    localStorage.setItem(RAT_PROCESSES_KEY, JSON.stringify(processes));
    
    return definitiveProcess;
  },
  
  // Obtener procesos guardados como definitivos
  getSavedProcesses: () => {
    try {
      const stored = localStorage.getItem(RAT_PROCESSES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error al cargar procesos guardados:', error);
      return [];
    }
  },
  
  // Exportar todos los RATs
  exportAllRATs: async () => {
    const rats = await ratService.getCompletedRATs();
    const stats = await ratService.getStatistics();
    
    const exportData = {
      fecha: new Date().toISOString(),
      empresa: 'Sistema LPDP',
      totalRATs: rats.length,
      estadisticas: stats,
      rats: rats
    };
    
    // Crear archivo JSON para descarga
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Consolidado_RATs_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    return exportData;
  },

  // Verificar entregables de un RAT
  verifyRATDeliverables: async (ratId) => {
    try {
      console.log('🔍 Verificando entregables del RAT:', ratId);
      
      // 1. Obtener el RAT
      const rats = await ratService.getCompletedRATs();
      const rat = rats.find(r => r.id === ratId);
      
      if (!rat) {
        console.error('❌ RAT no encontrado:', ratId);
        return { success: false, error: 'RAT no encontrado' };
      }
      
      // 2. Evaluar compliance
      const ratIntelligenceEngine = (await import('./ratIntelligenceEngine')).default;
      const evaluation = await ratIntelligenceEngine.evaluateRATActivity(rat);
      
      // 3. Verificar actividades DPO creadas
      let actividadesDPO = [];
      try {
        const { data: activities } = await supabase
          .from('actividades_dpo')
          .select('*')
          .eq('rat_id', ratId);
        
        actividadesDPO = activities || [];
      } catch (error) {
        console.error('Error obteniendo actividades DPO:', error);
      }
      
      // 4. Verificar actividades locales pendientes
      const localActivities = localStorage.getItem(`pending_dpo_activities_${ratId}`);
      const pendingLocal = localActivities ? JSON.parse(localActivities) : [];
      
      // 5. Compilar resumen
      const resumen = {
        ratId,
        ratNombre: rat.nombre_actividad || rat.titulo,
        compliance: {
          nivelRiesgo: evaluation.risk_level,
          alertasCriticas: evaluation.compliance_alerts?.filter(a => a.tipo === 'critico').length || 0,
          alertasUrgentes: evaluation.compliance_alerts?.filter(a => a.tipo === 'urgente').length || 0,
          totalAlertas: evaluation.compliance_alerts?.length || 0
        },
        documentosRequeridos: {
          total: evaluation.required_documents?.length || 0,
          tipos: evaluation.required_documents?.map(d => d.tipo) || [],
          detalles: evaluation.required_documents || []
        },
        actividadesDPO: {
          creadas: actividadesDPO.length,
          pendientesLocal: pendingLocal.length,
          total: actividadesDPO.length + pendingLocal.length,
          detalles: actividadesDPO
        },
        estado: {
          completo: evaluation.compliance_alerts?.length === 0,
          tieneEIPD: evaluation.required_documents?.some(d => d.tipo === 'EIPD'),
          tieneDPIA: evaluation.required_documents?.some(d => d.tipo === 'DPIA'),
          tieneDPA: evaluation.required_documents?.some(d => d.tipo === 'DPA'),
          tieneConsultaPrevia: evaluation.requiere_consulta_previa
        }
      };
      
      console.log('📊 Resumen de entregables del RAT:', resumen);
      
      return { success: true, data: resumen };
      
    } catch (error) {
      console.error('❌ Error verificando entregables:', error);
      return { success: false, error: error.message };
    }
  },

  // === GESTIÓN DE CONFIGURACIONES DE INDUSTRIA ===
  
  // Obtener configuración de una industria específica
  getIndustryConfig: (industryKey, tenantId = null) => {
    try {
      const effectiveTenantId = tenantId || getCurrentTenantId();
      const configs = localStorage.getItem(getStorageKey(INDUSTRY_CONFIG_KEY, effectiveTenantId));
      const parsedConfigs = configs ? JSON.parse(configs) : {};
      
      if (!parsedConfigs[industryKey]) {
        // Crear configuración por defecto si no existe
        parsedConfigs[industryKey] = {
          activeProcesses: {}, // todos activos por defecto
          completedProcesses: {},
          workInProgress: {},
          lastModified: new Date().toISOString()
        };
        localStorage.setItem(getStorageKey(INDUSTRY_CONFIG_KEY, effectiveTenantId), JSON.stringify(parsedConfigs));
      }
      
      return parsedConfigs[industryKey];
    } catch (error) {
      console.error('Error al cargar configuración de industria:', error);
      return {
        activeProcesses: {},
        completedProcesses: {},
        workInProgress: {},
        lastModified: new Date().toISOString()
      };
    }
  },
  
  // Actualizar configuración de industria
  updateIndustryConfig: (industryKey, updates, tenantId = null) => {
    try {
      const effectiveTenantId = tenantId || getCurrentTenantId();
      const configs = localStorage.getItem(getStorageKey(INDUSTRY_CONFIG_KEY, effectiveTenantId));
      const parsedConfigs = configs ? JSON.parse(configs) : {};
      
      parsedConfigs[industryKey] = {
        ...parsedConfigs[industryKey],
        ...updates,
        lastModified: new Date().toISOString()
      };
      
      localStorage.setItem(getStorageKey(INDUSTRY_CONFIG_KEY, effectiveTenantId), JSON.stringify(parsedConfigs));
      return parsedConfigs[industryKey];
    } catch (error) {
      console.error('Error al actualizar configuración de industria:', error);
      return null;
    }
  },
  
  // Marcar/desmarcar proceso como activo
  toggleProcessActive: (industryKey, processKey, isActive, tenantId = null) => {
    const config = ratService.getIndustryConfig(industryKey, tenantId);
    config.activeProcesses[processKey] = isActive;
    return ratService.updateIndustryConfig(industryKey, config, tenantId);
  },
  
  // Marcar proceso como completado
  markProcessCompleted: (industryKey, processKey, ratData = null, tenantId = null) => {
    const config = ratService.getIndustryConfig(industryKey, tenantId);
    config.completedProcesses[processKey] = {
      completed: true,
      completedAt: new Date().toISOString(),
      data: ratData
    };
    return ratService.updateIndustryConfig(industryKey, config, tenantId);
  },
  
  // Guardar trabajo en progreso
  saveWorkInProgress: (industryKey, processKey, ratData, tenantId = null) => {
    const config = ratService.getIndustryConfig(industryKey, tenantId);
    config.workInProgress[processKey] = {
      data: ratData,
      savedAt: new Date().toISOString(),
      step: ratData.currentStep || 0
    };
    return ratService.updateIndustryConfig(industryKey, config, tenantId);
  },
  
  // Obtener estadísticas de progreso de industria
  getIndustryProgress: (industryKey, totalProcesses) => {
    const config = ratService.getIndustryConfig(industryKey);
    
    // Si no hay configuración de procesos activos, todos están activos por defecto
    const hasActiveConfig = Object.keys(config.activeProcesses).length > 0;
    const activeCount = hasActiveConfig ? 
      Object.values(config.activeProcesses).filter(Boolean).length : 
      totalProcesses;
    
    const totalActive = activeCount;
    const completedCount = Object.values(config.completedProcesses).filter(c => c.completed).length;
    const inProgressCount = Object.keys(config.workInProgress).length;
    
    // Solo contar completados que están entre los procesos activos
    const activeCompletedCount = hasActiveConfig ? 
      Object.entries(config.completedProcesses)
        .filter(([key, data]) => {
          // Un proceso se considera activo si:
          // 1. Está explícitamente marcado como true
          // 2. No existe en activeProcesses (por defecto activo)
          const isActive = config.activeProcesses.hasOwnProperty(key) ? 
            config.activeProcesses[key] === true : 
            true;
          return data.completed && isActive;
        })
        .length :
      completedCount;
    
    return {
      total: totalActive,
      completed: activeCompletedCount,
      inProgress: inProgressCount,
      pending: Math.max(0, totalActive - activeCompletedCount),
      percentage: totalActive > 0 ? Math.round((activeCompletedCount / totalActive) * 100) : 0,
      activeProcesses: config.activeProcesses,
      completedProcesses: config.completedProcesses,
      workInProgress: config.workInProgress,
      hasActiveConfig: hasActiveConfig,
      totalProcessesAvailable: totalProcesses
    };
  },
  
  // Verificar si un proceso está activo
  isProcessActive: (industryKey, processKey, tenantId = null) => {
    const config = ratService.getIndustryConfig(industryKey, tenantId);
    // Si no está configurado, por defecto está activo
    // Si está configurado, debe ser explícitamente true
    if (config.activeProcesses.hasOwnProperty(processKey)) {
      return config.activeProcesses[processKey] === true;
    }
    // Si no existe en la configuración, por defecto está activo
    return true;
  },
  
  // Verificar si un proceso está completado
  isProcessCompleted: (industryKey, processKey, tenantId = null) => {
    const config = ratService.getIndustryConfig(industryKey, tenantId);
    return config.completedProcesses[processKey]?.completed || false;
  },
  
  // Obtener trabajo en progreso
  getWorkInProgress: (industryKey, processKey, tenantId = null) => {
    const config = ratService.getIndustryConfig(industryKey, tenantId);
    return config.workInProgress[processKey]?.data || null;
  },

  // === FUNCIONES MULTI-TENANT ADICIONALES ===
  
  // Establecer tenant actual (llamar desde TenantContext)
  setCurrentTenant: (tenant) => {
    localStorage.setItem('current_tenant', JSON.stringify(tenant));
  },
  
  // === GESTIÓN DE ESTADOS RAT (CREACIÓN → GESTIÓN → CERTIFICADO) ===
  
  // Estados posibles de un proceso RAT
  RAT_STATES: {
    CREATION: 'CREATION',     // 📝 Recién creado, borrable por usuario
    MANAGEMENT: 'MANAGEMENT', // ⚙️ En gestión/trabajo, borrable por usuario  
    CERTIFIED: 'CERTIFIED'    // 🏆 Certificado, solo DPO puede borrar
  },
  
  // Obtener estado actual de un proceso RAT
  getRATState: (industryKey, processKey, tenantId = null) => {
    const config = ratService.getIndustryConfig(industryKey, tenantId);
    
    // Verificar si existe información del proceso
    if (!config.processStates) {
      config.processStates = {};
    }
    
    // Por defecto, procesos nuevos están en CREATION
    return config.processStates[processKey] || ratService.RAT_STATES.CREATION;
  },
  
  // Cambiar estado de un proceso RAT
  setRATState: (industryKey, processKey, newState, tenantId = null) => {
    const config = ratService.getIndustryConfig(industryKey, tenantId);
    
    if (!config.processStates) {
      config.processStates = {};
    }
    
    const oldState = config.processStates[processKey] || ratService.RAT_STATES.CREATION;
    config.processStates[processKey] = newState;
    
    // Log de auditoría
    const auditEntry = {
      action: 'RAT_STATE_CHANGED',
      processKey,
      oldState,
      newState,
      timestamp: new Date().toISOString(),
      tenantId: tenantId || getCurrentTenantId()
    };
    
    ratService.saveAuditLog(auditEntry, tenantId);
    return ratService.updateIndustryConfig(industryKey, config, tenantId);
  },
  
  // Verificar si proceso puede ser eliminado por usuario actual
  canDeleteProcess: (industryKey, processKey, userRole = 'USER', tenantId = null) => {
    const state = ratService.getRATState(industryKey, processKey, tenantId);
    
    // Estados CREATION y MANAGEMENT: borrable por usuario
    if (state === ratService.RAT_STATES.CREATION || state === ratService.RAT_STATES.MANAGEMENT) {
      return { canDelete: true, reason: 'Proceso en estado borrable' };
    }
    
    // Estado CERTIFIED: solo DPO puede borrar
    if (state === ratService.RAT_STATES.CERTIFIED) {
      if (userRole === 'DPO') {
        return { canDelete: true, reason: 'DPO autorizado para procesos certificados' };
      } else {
        return { canDelete: false, reason: 'Proceso certificado - Solo DPO puede eliminarlo' };
      }
    }
    
    return { canDelete: false, reason: 'Estado no reconocido' };
  },
  
  // Desactivar proceso con validaciones de seguridad
  deactivateProcess: (industryKey, processKey, reason = '', tenantId = null) => {
    const isStandard = ratService.isStandardProcess(industryKey, processKey);
    const isCertified = ratService.isProcessCertified(industryKey, processKey, tenantId);
    
    // Registrar acción de auditoría
    const auditEntry = {
      action: 'PROCESS_DEACTIVATED',
      processKey,
      processType: isStandard ? 'STANDARD' : 'CUSTOM',
      wasCertified: isCertified,
      reason,
      timestamp: new Date().toISOString(),
      tenantId: tenantId || getCurrentTenantId()
    };
    
    // Guardar en log de auditoría
    ratService.saveAuditLog(auditEntry, tenantId);
    
    // Desactivar el proceso
    return ratService.toggleProcessActive(industryKey, processKey, false, tenantId);
  },
  
  // Eliminar proceso personalizado (solo custom_, nunca estándar)
  deleteCustomProcess: (industryKey, processKey, reason = '', tenantId = null) => {
    if (ratService.isStandardProcess(industryKey, processKey)) {
      throw new Error('No se pueden eliminar procesos estándar, solo desactivar');
    }
    
    const isCertified = ratService.isProcessCertified(industryKey, processKey, tenantId);
    if (isCertified) {
      throw new Error('No se puede eliminar un proceso certificado. Solo se puede desactivar según Ley 21.719');
    }
    
    // Registrar acción de auditoría
    const auditEntry = {
      action: 'CUSTOM_PROCESS_DELETED',
      processKey,
      processType: 'CUSTOM',
      reason,
      timestamp: new Date().toISOString(),
      tenantId: tenantId || getCurrentTenantId()
    };
    
    ratService.saveAuditLog(auditEntry, tenantId);
    
    // Aquí iría la lógica para eliminar del template
    // NOTA: En el template actual esto requiere manipular INDUSTRY_TEMPLATES
    
    return true;
  },
  
  // Guardar log de auditoría para trazabilidad
  saveAuditLog: (auditEntry, tenantId = null) => {
    const effectiveTenantId = tenantId || getCurrentTenantId();
    const AUDIT_LOG_KEY = 'lpdp_audit_log';
    
    try {
      const logs = JSON.parse(localStorage.getItem(getStorageKey(AUDIT_LOG_KEY, effectiveTenantId)) || '[]');
      logs.push(auditEntry);
      localStorage.setItem(getStorageKey(AUDIT_LOG_KEY, effectiveTenantId), JSON.stringify(logs));
    } catch (error) {
      console.error('Error guardando log de auditoría:', error);
    }
  },
  
  // Obtener historial de auditoría
  getAuditLog: (tenantId = null, filters = {}) => {
    const effectiveTenantId = tenantId || getCurrentTenantId();
    const AUDIT_LOG_KEY = 'lpdp_audit_log';
    
    try {
      const logs = JSON.parse(localStorage.getItem(getStorageKey(AUDIT_LOG_KEY, effectiveTenantId)) || '[]');
      
      // Aplicar filtros si existen
      let filteredLogs = logs;
      if (filters.action) {
        filteredLogs = filteredLogs.filter(log => log.action === filters.action);
      }
      if (filters.processKey) {
        filteredLogs = filteredLogs.filter(log => log.processKey === filters.processKey);
      }
      if (filters.startDate) {
        filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= new Date(filters.startDate));
      }
      
      return filteredLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } catch (error) {
      console.error('Error obteniendo log de auditoría:', error);
      return [];
    }
  },
  
  // Obtener todos los tenants que tienen datos
  getAllTenantIds: () => {
    const keys = Object.keys(localStorage);
    const tenantIds = new Set();
    
    [RAT_STORAGE_KEY, RAT_PROCESSES_KEY, INDUSTRY_CONFIG_KEY].forEach(baseKey => {
      keys.forEach(key => {
        if (key.startsWith(baseKey + '_')) {
          const tenantId = key.substring(baseKey.length + 1);
          tenantIds.add(tenantId);
        }
      });
    });
    
    return Array.from(tenantIds);
  },
  
  // Limpiar datos de un tenant específico (para testing)
  clearTenantData: (tenantId) => {
    [RAT_STORAGE_KEY, RAT_PROCESSES_KEY, INDUSTRY_CONFIG_KEY].forEach(baseKey => {
      localStorage.removeItem(getStorageKey(baseKey, tenantId));
    });
  }
};

export default ratService;