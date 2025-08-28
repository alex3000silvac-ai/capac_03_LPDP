/**
 * Servicio para gestión de RATs
 * Integración entre RAT Producción y Consolidado RAT
 */

// Simulación de almacenamiento local (en producción sería backend)
// IMPORTANTE: Cada clave incluye tenant_id para aislamiento multi-tenant
const getStorageKey = (baseKey, tenantId = 'default') => `${baseKey}_${tenantId}`;
const RAT_STORAGE_KEY = 'lpdp_rats_completed';
const RAT_PROCESSES_KEY = 'lpdp_rat_processes';
const INDUSTRY_CONFIG_KEY = 'lpdp_industry_configs';

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
  
  // Guardar RAT completado
  saveCompletedRAT: (ratData, industryName = 'General', processKey = null, tenantId = null) => {
    const effectiveTenantId = tenantId || getCurrentTenantId();
    const rats = ratService.getCompletedRATs(effectiveTenantId);
    
    const newRAT = {
      id: `rat_${Date.now()}`,
      empresa: ratData.responsable?.nombre || 'Sin nombre',
      industria: industryName,
      proceso: processKey,
      fechaCreacion: new Date().toISOString(),
      fechaModificacion: new Date().toISOString(),
      estado: 'Completado',
      progreso: 100,
      responsable: ratData.responsable,
      finalidades: ratData.finalidades,
      categorias: ratData.categorias,
      transferencias: ratData.transferencias,
      fuente: ratData.fuente,
      conservacion: ratData.conservacion,
      seguridad: ratData.seguridad,
      automatizadas: ratData.automatizadas,
      metadata: {
        version: '1.0',
        cumpleLey21719: true,
        camposObligatoriosCompletos: ratService.validateRAT(ratData),
        usuario: ratData.metadata?.usuario || 'sistema'
      }
    };
    
    rats.push(newRAT);
    localStorage.setItem(getStorageKey(RAT_STORAGE_KEY, effectiveTenantId), JSON.stringify(rats));
    
    console.log('✅ RAT guardado en Consolidado:', newRAT);
    return newRAT;
  },
  
  // Obtener todos los RATs completados
  getCompletedRATs: (tenantId = null) => {
    try {
      const effectiveTenantId = tenantId || getCurrentTenantId();
      const stored = localStorage.getItem(getStorageKey(RAT_STORAGE_KEY, effectiveTenantId));
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error al cargar RATs:', error);
      return [];
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