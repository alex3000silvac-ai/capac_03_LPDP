// 🔄 HOOK SINCRONIZACIÓN DATOS - GARANTIZA CONSISTENCIA
import { useState, useEffect, useCallback } from 'react';
import { useTenant } from '../contexts/TenantContext';
import dataSyncService from '../services/dataSync';

export const useDataSync = (moduleName) => {
  const { currentTenant } = useTenant();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastSync, setLastSync] = useState(null);

  // 🔄 FUNCIÓN CARGAR DATOS SINCRONIZADOS
  const loadSyncedData = useCallback(async () => {
    if (!currentTenant?.id) return;
    
    try {
      setLoading(true);
      console.log(`🔄 [${moduleName}] Cargando datos sincronizados`);
      
      const moduleData = await dataSyncService.getDataForModule(moduleName, currentTenant.id);
      setData(moduleData);
      setLastSync(new Date().toISOString());
      
      console.log(`✅ [${moduleName}] Datos sincronizados:`, moduleData);
      
    } catch (error) {
      console.error(`❌ [${moduleName}] Error cargando datos:`, error);
    } finally {
      setLoading(false);
    }
  }, [moduleName, currentTenant?.id]);

  // 🔔 SUSCRIBIRSE A CAMBIOS AUTOMÁTICOS
  useEffect(() => {
    if (!currentTenant?.id) return;
    
    // Cargar datos iniciales
    loadSyncedData();
    
    // Suscribirse a cambios automáticos
    const unsubscribe = dataSyncService.subscribe(
      moduleName, 
      currentTenant.id, 
      (newMasterData) => {
        console.log(`🔔 [${moduleName}] Recibiendo actualización automática`);
        const moduleData = dataSyncService.getDataForModule(moduleName, currentTenant.id);
        moduleData.then(data => {
          setData(data);
          setLastSync(new Date().toISOString());
        });
      }
    );
    
    // Iniciar auto-sync si es el primer módulo
    dataSyncService.startAutoSync(currentTenant.id);
    
    return () => {
      unsubscribe();
    };
  }, [currentTenant?.id, loadSyncedData, moduleName]);

  // 🔄 NOTIFICAR CAMBIO DESDE ESTE MÓDULO
  const notifyChange = useCallback(async (changeType, newData) => {
    if (!currentTenant?.id) return;
    
    console.log(`🔄 [${moduleName}] Notificando cambio:`, changeType);
    
    switch (changeType) {
      case 'RAT_CREATED':
        await dataSyncService.onRATCreated(newData, currentTenant.id);
        break;
      case 'RAT_UPDATED':
        await dataSyncService.onRATUpdated(newData, currentTenant.id);
        break;
      case 'EIPD_GENERATED':
        await dataSyncService.onEIPDGenerated(newData, currentTenant.id);
        break;
      case 'DPO_TASK_CREATED':
        await dataSyncService.onDPOTaskCreated(newData, currentTenant.id);
        break;
      default:
        await dataSyncService.invalidateAndRefresh(currentTenant.id, changeType);
    }
  }, [moduleName, currentTenant?.id]);

  // 🔄 FORZAR REFRESH MANUAL
  const forceRefresh = useCallback(async () => {
    if (!currentTenant?.id) return;
    
    console.log(`🔄 [${moduleName}] Forzando refresh manual`);
    await dataSyncService.invalidateAndRefresh(currentTenant.id, 'MANUAL_REFRESH');
  }, [moduleName, currentTenant?.id]);

  return {
    data,
    loading,
    lastSync,
    notifyChange,
    forceRefresh,
    
    // Funciones de conveniencia para datos específicos
    getRATCount: () => data?.ratsActivos || data?.totalRATs || data?.total || 0,
    getEIPDCount: () => data?.eipdsPendientes || data?.pendientesEIPD || data?.total_eipds || 0,
    getComplianceScore: () => data?.cumplimiento || data?.cumplimientoGeneral || data?.cumplimientoPromedio || 0,
    getDPOTasks: () => data?.tareasPendientes || data?.tareas_dpo_pendientes || 0
  };
};

// 🔄 HOOK ESPECÍFICO PARA CONTEOS CONSISTENTES
export const useConsistentCounts = () => {
  const { currentTenant } = useTenant();
  const [counts, setCounts] = useState({
    rats: 0,
    eipds: 0,
    compliance: 0,
    tasks: 0
  });

  useEffect(() => {
    if (!currentTenant?.id) return;
    
    const loadConsistentCounts = async () => {
      try {
        const masterData = await dataSyncService.getMasterData(currentTenant.id);
        setCounts({
          rats: masterData.counts.total_rats,
          eipds: masterData.counts.eipds_pendientes, 
          compliance: masterData.compliance_percentage,
          tasks: masterData.counts.tareas_dpo_pendientes
        });
      } catch (error) {
        console.error('Error cargando conteos consistentes:', error);
      }
    };

    loadConsistentCounts();
    
    // Suscribirse a cambios
    const unsubscribe = dataSyncService.subscribe(
      'ConsistentCounts',
      currentTenant.id,
      (masterData) => {
        setCounts({
          rats: masterData.counts.total_rats,
          eipds: masterData.counts.eipds_pendientes,
          compliance: masterData.compliance_percentage, 
          tasks: masterData.counts.tareas_dpo_pendientes
        });
      }
    );

    return unsubscribe;
  }, [currentTenant?.id]);

  return counts;
};

export default useDataSync;