// 🔄 SERVICIO SINCRONIZACIÓN DATOS - CONSISTENCIA ENTRE MÓDULOS
import { supabase } from '../config/supabaseClient';

class DataSyncService {
  constructor() {
    this.cache = new Map();
    this.subscribers = new Map();
    this.lastUpdate = null;
    this.syncInterval = null;
  }

  // 📊 OBTENER DATOS MAESTROS ÚNICOS - FUENTE ÚNICA DE VERDAD
  async getMasterData(tenantId) {
    try {
      const cacheKey = `master_${tenantId}`;
      
      // Verificar cache reciente (30 segundos)
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < 30000) {
          return cached.data;
        }
      }

      console.log('🔄 Cargando datos maestros para tenant:', tenantId);

      // CONSULTA ÚNICA - TODOS LOS CONTEOS
      const [ratsResult, eipdResult, tareasResult, inventarioResult] = await Promise.all([
        // 1. RATs por estado
        supabase
          .from('mapeo_datos_rat')
          .select('id, estado, nivel_riesgo, created_at', { count: 'exact' })
          .eq('tenant_id', tenantId)
          .neq('estado', 'ELIMINADO'),
          
        // 2. EIPDs por estado  
        supabase
          .from('generated_documents')
          .select('id, status, source_rat_id', { count: 'exact' })
          .eq('document_type', 'EIPD')
          .in('status', ['BORRADOR', 'PENDIENTE', 'APROBADO']),
          
        // 3. Tareas DPO pendientes
        supabase
          .from('actividades_dpo')
          .select('id, estado, prioridad', { count: 'exact' })
          .eq('tenant_id', tenantId)
          .eq('estado', 'pendiente'),
          
        // 4. Inventario RATs
        supabase
          .from('inventario_rats')
          .select('id, estado', { count: 'exact' })
          .eq('tenant_id', tenantId)
      ]);

      // Procesar datos
      const rats = ratsResult.data || [];
      const eipds = eipdResult.data || [];
      const tareas = tareasResult.data || [];

      const masterData = {
        timestamp: Date.now(),
        tenant_id: tenantId,
        
        // CONTEOS MAESTROS
        counts: {
          total_rats: rats.length,
          rats_certificados: rats.filter(r => r.estado === 'CERTIFICADO').length,
          rats_pendientes: rats.filter(r => r.estado === 'PENDIENTE_APROBACION').length,
          rats_borradores: rats.filter(r => r.estado === 'BORRADOR').length,
          
          total_eipds: eipds.length,
          eipds_pendientes: eipds.filter(e => e.status === 'BORRADOR' || e.status === 'PENDIENTE').length,
          eipds_aprobadas: eipds.filter(e => e.status === 'APROBADO').length,
          
          tareas_dpo_pendientes: tareas.length,
          tareas_alta_prioridad: tareas.filter(t => t.prioridad === 'alta').length
        },
        
        // DATOS PARA CADA MÓDULO
        rats_data: rats,
        eipds_data: eipds,
        tareas_data: tareas,
        
        // MÉTRICAS CALCULADAS
        compliance_percentage: rats.length > 0 ? 
          Math.round((rats.filter(r => r.estado === 'CERTIFICADO').length / rats.length) * 100) : 0,
          
        eipds_coverage: rats.filter(r => r.nivel_riesgo === 'ALTO').length > 0 ?
          Math.round((eipds.filter(e => e.status === 'APROBADO').length / 
                     rats.filter(r => r.nivel_riesgo === 'ALTO').length) * 100) : 100
      };

      // Guardar en cache
      this.cache.set(cacheKey, {
        data: masterData,
        timestamp: Date.now()
      });

      console.log('✅ Datos maestros cargados:', masterData.counts);
      
      // Notificar a todos los suscriptores
      this.notifySubscribers(tenantId, masterData);
      
      return masterData;
      
    } catch (error) {
      console.error('❌ Error cargando datos maestros:', error);
      throw error;
    }
  }

  // 🔔 SUSCRIBIRSE A CAMBIOS DE DATOS
  subscribe(componentName, tenantId, callback) {
    const key = `${componentName}_${tenantId}`;
    this.subscribers.set(key, callback);
    
    console.log(`📡 ${componentName} suscrito a cambios datos`);
    
    // Retornar función para cancelar suscripción
    return () => {
      this.subscribers.delete(key);
      console.log(`📡 ${componentName} desuscrito`);
    };
  }

  // 🔄 NOTIFICAR CAMBIOS A SUSCRIPTORES
  notifySubscribers(tenantId, masterData) {
    this.subscribers.forEach((callback, key) => {
      if (key.includes(tenantId)) {
        try {
          callback(masterData);
        } catch (error) {
          console.error(`Error notificando a ${key}:`, error);
        }
      }
    });
  }

  // 🔄 INVALIDAR CACHE Y REFRESCAR
  async invalidateAndRefresh(tenantId, changeType = 'general') {
    console.log(`🔄 Invalidando cache por: ${changeType}`);
    
    // Limpiar cache
    const cacheKey = `master_${tenantId}`;
    this.cache.delete(cacheKey);
    
    // Recargar datos maestros
    const newData = await this.getMasterData(tenantId);
    
    console.log(`✅ Datos refrescados por ${changeType}:`, newData.counts);
    
    return newData;
  }

  // 🔄 HOOKS AUTOMÁTICOS PARA CAMBIOS
  async onRATCreated(ratData, tenantId) {
    console.log('🔄 RAT creado - refrescando todos los módulos');
    await this.invalidateAndRefresh(tenantId, 'RAT_CREATED');
  }

  async onRATUpdated(ratData, tenantId) {
    console.log('🔄 RAT actualizado - refrescando todos los módulos');
    await this.invalidateAndRefresh(tenantId, 'RAT_UPDATED');
  }

  async onEIPDGenerated(eipdData, tenantId) {
    console.log('🔄 EIPD generada - refrescando todos los módulos');
    await this.invalidateAndRefresh(tenantId, 'EIPD_GENERATED');
  }

  async onDPOTaskCreated(taskData, tenantId) {
    console.log('🔄 Tarea DPO creada - refrescando todos los módulos');
    await this.invalidateAndRefresh(tenantId, 'DPO_TASK_CREATED');
  }

  // 🎯 INICIALIZAR SINCRONIZACIÓN AUTOMÁTICA
  startAutoSync(tenantId, intervalMs = 60000) {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    
    this.syncInterval = setInterval(async () => {
      try {
        await this.invalidateAndRefresh(tenantId, 'AUTO_SYNC');
      } catch (error) {
        console.error('Error en auto-sync:', error);
      }
    }, intervalMs);
    
    console.log(`🔄 Auto-sync iniciado cada ${intervalMs/1000}s`);
  }

  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('🔄 Auto-sync detenido');
    }
  }

  // 🔄 OBTENER DATOS ESPECÍFICOS PARA CADA MÓDULO
  async getDataForModule(moduleName, tenantId) {
    const masterData = await this.getMasterData(tenantId);
    
    switch (moduleName) {
      case 'DashboardDPO':
        return {
          ratsActivos: masterData.counts.total_rats,
          eipdsPendientes: masterData.counts.eipds_pendientes,
          cumplimiento: masterData.compliance_percentage,
          tareasPendientes: masterData.counts.tareas_dpo_pendientes
        };
        
      case 'ComplianceMetrics':
        return {
          totalRATs: masterData.counts.total_rats,
          certificados: masterData.counts.rats_certificados,
          pendientesEIPD: masterData.counts.eipds_pendientes,
          cumplimientoGeneral: masterData.compliance_percentage,
          coberturaEIPD: masterData.eipds_coverage
        };
        
      case 'RATListPage':
        return {
          rats: masterData.rats_data,
          total: masterData.counts.total_rats,
          certificados: masterData.counts.rats_certificados,
          pendientes: masterData.counts.rats_pendientes,
          borradores: masterData.counts.rats_borradores
        };
        
      case 'AdminDashboard':
        return {
          organizaciones: 1, // Por tenant
          ratsTotal: masterData.counts.total_rats,
          eipdTotal: masterData.counts.total_eipds,
          cumplimientoPromedio: masterData.compliance_percentage
        };
        
      default:
        return masterData;
    }
  }
}

// Instancia singleton
const dataSyncService = new DataSyncService();

export default dataSyncService;