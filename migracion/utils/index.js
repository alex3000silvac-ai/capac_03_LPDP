/**
 * 🛡️ SISTEMA COMPLETO DE PREVENCIÓN DE ERRORES
 * 
 * Punto de entrada único para activar toda la prevención de errores
 */

// Importar todos los sistemas de prevención
import smartSupabase, { getSmartSupabaseStats, logSupabaseActivity } from './smartSupabaseClient';
import rlsGuard, { safeSupabaseQuery, validateSupabaseQuery, getSupabasePermissions } from './supabaseRLSGuard';
import errorMonitor, { getErrorPreventionReport, preventSupabaseError, isMonitorActive } from './errorPreventionMonitor';

class ErrorPreventionSystem {
  constructor() {
    this.components = {
      smartClient: smartSupabase,
      rlsGuard: rlsGuard,
      errorMonitor: errorMonitor
    };
    
    this.isInitialized = false;
  }

  /**
   * 🚀 INICIALIZAR SISTEMA COMPLETO
   */
  async init() {
    if (this.isInitialized) {
      //console.log('🛡️ Sistema de prevención ya inicializado');
      return;
    }

    try {
      //console.log('🛡️ Inicializando Sistema Completo de Prevención de Errores...');

      // Inicializar RLS Guard
      await this.components.rlsGuard.init();
      
      // Error Monitor se auto-inicializa
      
      this.isInitialized = true;
      
      //console.log('✅ Sistema de Prevención de Errores ACTIVO');
      this.logSystemStatus();
      
    } catch (error) {
      console.error('❌ Error inicializando sistema de prevención:', error);
    }
  }

  /**
   * 📊 OBTENER STATUS COMPLETO DEL SISTEMA
   */
  getSystemStatus() {
    return {
      initialized: this.isInitialized,
      timestamp: new Date().toISOString(),
      components: {
        smartClient: {
          active: true,
          stats: getSmartSupabaseStats()
        },
        rlsGuard: {
          active: this.components.rlsGuard.isInitialized,
          permissions: getSupabasePermissions()
        },
        errorMonitor: {
          active: isMonitorActive(),
          report: getErrorPreventionReport()
        }
      },
      summary: this.generateSystemSummary()
    };
  }

  /**
   * 📋 GENERAR RESUMEN DEL SISTEMA
   */
  generateSystemSummary() {
    const smartStats = getSmartSupabaseStats();
    const errorReport = getErrorPreventionReport();
    
    return {
      total_queries_protected: smartStats.total_queries || 0,
      errors_prevented: smartStats.errors_prevented || 0,
      fallbacks_used: smartStats.successful_fallbacks || 0,
      success_rate: smartStats.success_rate || '100%',
      system_health: this.calculateSystemHealth(),
      recommendations: errorReport.recommendations || []
    };
  }

  /**
   * 🏥 CALCULAR SALUD DEL SISTEMA
   */
  calculateSystemHealth() {
    const smartStats = getSmartSupabaseStats();
    const successRate = parseFloat(smartStats.success_rate) || 100;
    
    if (successRate >= 95) return 'EXCELLENT';
    if (successRate >= 85) return 'GOOD';
    if (successRate >= 70) return 'NEEDS_ATTENTION';
    return 'CRITICAL';
  }

  /**
   * 🖨️ LOG STATUS DEL SISTEMA
   */
  logSystemStatus() {
    const status = this.getSystemStatus();
    
    console.group('🛡️ Error Prevention System Status');
    //console.log('Status:', status.initialized ? '✅ ACTIVE' : '❌ INACTIVE');
    //console.log('System Health:', status.summary.system_health);
    //console.log('Success Rate:', status.summary.success_rate);
    //console.log('Errors Prevented:', status.summary.errors_prevented);
    //console.log('Fallbacks Used:', status.summary.fallbacks_used);
    
    if (status.summary.recommendations.length > 0) {
      console.group('💡 Recommendations');
      status.summary.recommendations.forEach(rec => //console.log('•', rec));
      console.groupEnd();
    }
    
    console.groupEnd();
  }

  /**
   * 🔧 FUNCIÓN DE UTILIDAD - CONSULTA SÚPER SEGURA
   */
  async superSafeQuery(tableName, queryFn, options = {}) {
    try {
      // Validar permisos primero
      await validateSupabaseQuery(tableName, 'select', options.filters || {});
      
      // Ejecutar con cliente inteligente
      const result = await queryFn(smartSupabase);
      
      // Log éxito
      //console.log(`✅ Consulta exitosa: ${tableName}`);
      return result;
      
    } catch (error) {
      // Prevenir y manejar error
      await preventSupabaseError(error);
      
      // Intentar fallback manual si es necesario
      if (options.fallbackFn) {
        //console.log(`🔄 Aplicando fallback manual para ${tableName}`);
        return await options.fallbackFn();
      }
      
      throw error;
    }
  }

  /**
   * 🧪 TEST COMPLETO DEL SISTEMA
   */
  async runSystemTest() {
    //console.log('🧪 Ejecutando test completo del sistema de prevención...');
    
    const testResults = {
      smartClient: await this.testSmartClient(),
      rlsGuard: await this.testRLSGuard(),
      errorMonitor: await this.testErrorMonitor()
    };

    const allPassed = Object.values(testResults).every(result => result.passed);
    
    //console.log(allPassed ? '✅ Todos los tests pasaron' : '⚠️ Algunos tests fallaron');
    return { passed: allPassed, results: testResults };
  }

  async testSmartClient() {
    try {
      // Test básico del cliente inteligente
      await smartSupabase.from('organizaciones').select('id').limit(1);
      return { passed: true, message: 'Smart client funcionando' };
    } catch (error) {
      return { passed: false, message: error.message };
    }
  }

  async testRLSGuard() {
    try {
      const permissions = getSupabasePermissions();
      return { 
        passed: permissions.initialized, 
        message: `RLS Guard - ${permissions.tables_analyzed} tablas analizadas` 
      };
    } catch (error) {
      return { passed: false, message: error.message };
    }
  }

  async testErrorMonitor() {
    try {
      const active = isMonitorActive();
      return { 
        passed: active, 
        message: active ? 'Error monitor activo' : 'Error monitor inactivo' 
      };
    } catch (error) {
      return { passed: false, message: error.message };
    }
  }
}

// Instancia global del sistema
const errorPreventionSystem = new ErrorPreventionSystem();

// Auto-inicializar al cargar
if (typeof window !== 'undefined') {
  // Inicializar después de que el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      errorPreventionSystem.init();
    });
  } else {
    errorPreventionSystem.init();
  }
}

// Exports principales
export default errorPreventionSystem;

export {
  // Sistema completo
  errorPreventionSystem,
  
  // Cliente inteligente
  smartSupabase,
  getSmartSupabaseStats,
  logSupabaseActivity,
  
  // RLS Guard
  rlsGuard,
  safeSupabaseQuery,
  validateSupabaseQuery,
  getSupabasePermissions,
  
  // Monitor de errores
  errorMonitor,
  getErrorPreventionReport,
  preventSupabaseError,
  isMonitorActive
};

// Función de conveniencia para consultas súper seguras
export const superSafeSupabaseQuery = (tableName, queryFn, options) => {
  return errorPreventionSystem.superSafeQuery(tableName, queryFn, options);
};

// Función para obtener status completo
export const getSystemStatus = () => {
  return errorPreventionSystem.getSystemStatus();
};

// Función para ejecutar test completo
export const runSystemTest = () => {
  return errorPreventionSystem.runSystemTest();
};

// Log de bienvenida
//console.log('🛡️ Error Prevention System cargado - usa getSystemStatus() para ver el estado');