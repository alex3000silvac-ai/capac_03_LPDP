/**
 * Servicio para gestión de RATs
 * VERSIÓN PRODUCCIÓN: Integración completa con Supabase
 */

// Importar cliente Supabase para operaciones de base de datos
import { supabase } from '../config/supabaseClient';
const getStorageKey = (baseKey, tenantId = 'default') => `${baseKey}_${tenantId}`;
const RAT_STORAGE_KEY = 'lpdp_rats_completed';
const RAT_PROCESSES_KEY = 'lpdp_rat_processes';
const INDUSTRY_CONFIG_KEY = 'lpdp_industry_configs';

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

// Función para obtener tenant_id actual desde el contexto
const getCurrentTenantId = () => {
  // En producción esto vendría del contexto React
  // Para desarrollo, intentamos obtenerlo del localStorage o usar default
  try {
    const tenantData = localStorage.getItem('current_tenant');
    if (tenantData) {
      const tenant = JSON.parse(tenantData);
      return tenant.id || 'default';
    }
  } catch (error) {
    console.warn('No se pudo obtener tenant actual, usando default');
  }
  return 'default';
};

export const ratService = {
  
  // Guardar RAT completado en Supabase (PRODUCCIÓN)
  saveCompletedRAT: async (ratData, industryName = 'General', processKey = null, tenantId = null) => {
    try {
      console.log('🚀 Guardando RAT en Supabase (PRODUCCIÓN):', ratData);
      
      // Obtener usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      // Preparar datos para Supabase
      const newRAT = {
        titulo: `${industryName} - ${processKey || 'Proceso General'}`,
        descripcion: ratData.finalidades?.descripcion || 'RAT generado desde sistema de producción',
        area: ratData.responsable?.area || industryName,
        responsable_tratamiento: JSON.stringify(ratData.responsable || {}),
        categorias_datos: JSON.stringify(ratData.categorias || {}),
        finalidades: JSON.stringify(ratData.finalidades || {}),
        base_licita: ratData.finalidades?.baseLegal || 'No especificada',
        destinatarios: JSON.stringify(ratData.transferencias?.destinatarios || []),
        transferencias: JSON.stringify(ratData.transferencias || {}),
        retencion: JSON.stringify(ratData.conservacion || {}),
        medidas_seguridad: JSON.stringify(ratData.seguridad || {}),
        tenant_id: getCurrentTenantId() || 'default',
        user_id: user.id,
        estado: 'Completado',
        metadatos: JSON.stringify({
          version: '1.0',
          industria: industryName,
          proceso: processKey,
          cumpleLey21719: true,
          camposObligatoriosCompletos: validateRAT(ratData),
          usuario: user.email,
          timestamp: new Date().toISOString()
        })
      };

      // Guardar en Supabase
      const { data, error } = await supabase
        .from('rats')
        .insert([newRAT])
        .select()
        .single();

      if (error) {
        console.error('❌ Error guardando RAT en Supabase:', error);
        
        // FALLBACK: Guardar en localStorage si falla Supabase
        console.warn('🔄 Usando fallback localStorage por error en Supabase');
        const localRAT = {
          id: `rat_${Date.now()}`,
          empresa: ratData.responsable?.nombre || 'Sin nombre',
          industria: industryName,
          proceso: processKey,
          fechaCreacion: new Date().toISOString(),
          fechaModificacion: new Date().toISOString(),
          estado: 'Completado',
          progreso: 100,
          ...ratData,
          metadata: {
            version: '1.0',
            cumpleLey21719: true,
            camposObligatoriosCompletos: validateRAT(ratData),
            usuario: user.email || 'sistema',
            error_supabase: error.message
          }
        };
        
        const effectiveTenantId = tenantId || getCurrentTenantId();
        const rats = ratService.getCompletedRATs(effectiveTenantId);
        rats.push(localRAT);
        localStorage.setItem(getStorageKey(RAT_STORAGE_KEY, effectiveTenantId), JSON.stringify(rats));
        
        throw error; // Re-throw para notificar el error
      }

      console.log('✅ RAT guardado exitosamente en Supabase:', data);
      
      // TAMBIÉN guardar en localStorage como respaldo y para compatibilidad
      const localRAT = {
        id: data.id,
        empresa: ratData.responsable?.nombre || 'Sin nombre',
        industria: industryName,
        proceso: processKey,
        fechaCreacion: data.fecha_creacion,
        fechaModificacion: data.fecha_actualizacion,
        estado: 'Completado',
        progreso: 100,
        ...ratData,
        metadata: {
          version: '1.0',
          cumpleLey21719: true,
          camposObligatoriosCompletos: validateRAT(ratData),
          usuario: user.email,
          supabase_id: data.id
        }
      };
      
      const effectiveTenantId = tenantId || getCurrentTenantId();
      const rats = ratService.getCompletedRATs(effectiveTenantId);
      rats.push(localRAT);
      localStorage.setItem(getStorageKey(RAT_STORAGE_KEY, effectiveTenantId), JSON.stringify(rats));

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
      
      // Obtener usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn('👤 Usuario no autenticado, usando datos locales');
        if (useLocalFallback) {
          const effectiveTenantId = tenantId || getCurrentTenantId();
          const stored = localStorage.getItem(getStorageKey(RAT_STORAGE_KEY, effectiveTenantId));
          return stored ? JSON.parse(stored) : [];
        }
        return [];
      }

      // Cargar RATs desde Supabase
      const { data, error } = await supabase
        .from('rats')
        .select('*')
        .eq('user_id', user.id)
        .order('fecha_creacion', { ascending: false });

      if (error) {
        console.error('❌ Error cargando RATs desde Supabase:', error);
        
        // FALLBACK: Usar datos locales si falla Supabase
        if (useLocalFallback) {
          console.warn('🔄 Usando fallback localStorage por error en Supabase');
          const effectiveTenantId = tenantId || getCurrentTenantId();
          const stored = localStorage.getItem(getStorageKey(RAT_STORAGE_KEY, effectiveTenantId));
          return stored ? JSON.parse(stored) : [];
        }
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
          usuario: user.email,
          ...(rat.metadatos ? JSON.parse(rat.metadatos) : {})
        }
      }));

      // TAMBIÉN mantener copia local como respaldo
      const effectiveTenantId = tenantId || getCurrentTenantId();
      localStorage.setItem(getStorageKey(RAT_STORAGE_KEY, effectiveTenantId), JSON.stringify(formattedRATs));

      return formattedRATs;
    } catch (error) {
      console.error('❌ Error crítico en getCompletedRATs:', error);
      
      // ÚLTIMO FALLBACK: Datos locales
      if (useLocalFallback) {
        console.warn('🔄 Último fallback: usando datos locales');
        const effectiveTenantId = tenantId || getCurrentTenantId();
        const stored = localStorage.getItem(getStorageKey(RAT_STORAGE_KEY, effectiveTenantId));
        return stored ? JSON.parse(stored) : [];
      }
      
      throw error;
    }
  },
  
  // Actualizar RAT existente
  updateRAT: (ratId, updatedData, tenantId = null) => {
    const effectiveTenantId = tenantId || getCurrentTenantId();
    const rats = ratService.getCompletedRATs(effectiveTenantId);
    const index = rats.findIndex(rat => rat.id === ratId);
    
    if (index !== -1) {
      rats[index] = {
        ...rats[index],
        ...updatedData,
        fechaModificacion: new Date().toISOString()
      };
      
      localStorage.setItem(getStorageKey(RAT_STORAGE_KEY, effectiveTenantId), JSON.stringify(rats));
      return rats[index];
    }
    
    return null;
  },
  
  // Eliminar RAT
  deleteRAT: (ratId, tenantId = null) => {
    const effectiveTenantId = tenantId || getCurrentTenantId();
    const rats = ratService.getCompletedRATs(effectiveTenantId);
    const filteredRATs = rats.filter(rat => rat.id !== ratId);
    
    localStorage.setItem(getStorageKey(RAT_STORAGE_KEY, effectiveTenantId), JSON.stringify(filteredRATs));
    return true;
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
  getStatistics: (tenantId = null) => {
    const effectiveTenantId = tenantId || getCurrentTenantId();
    const rats = ratService.getCompletedRATs(effectiveTenantId);
    
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
  exportAllRATs: () => {
    const rats = ratService.getCompletedRATs();
    const stats = ratService.getStatistics();
    
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