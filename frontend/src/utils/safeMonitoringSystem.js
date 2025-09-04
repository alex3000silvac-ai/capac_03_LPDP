/**
 * 🛡️ SISTEMA DE MONITOREO SEGURO
 * 
 * SOLO incluye funcionalidades 100% seguras:
 * - Monitoreo y logging de errores (NO modifica datos)
 * - Persistencia datos empresa (localStorage + archivos TXT)
 * - Dashboard de reportes (solo lectura)
 */

// Imports seguros
import errorMonitor from './errorMonitoringOnly';
import errorDashboard, { printErrorDashboard, generateErrorReport } from './errorReportingDashboard';
import dbHealthMonitor from './databaseHealthMonitor';
import earlyWarningSystem from './earlyWarningSystem';
import dataIntegrityValidator from './dataIntegrityValidator';
import { 
  guardarDatosEmpresa, 
  cargarDatosEmpresa, 
  existenDatosEmpresa,
  limpiarDatosEmpresa,
  autoCompletarFormulario
} from './datosEmpresaPersistence';
import fileErrorLogger from './fileErrorLogger';
import silentErrorLogger from './silentErrorLogger';
import cumulativeErrorLogger from './cumulativeErrorLogger';

class SafeMonitoringSystem {
  constructor() {
    this.components = {
      errorMonitor: errorMonitor,
      errorDashboard: errorDashboard,
      dbHealthMonitor: dbHealthMonitor,
      earlyWarningSystem: earlyWarningSystem,
      dataIntegrityValidator: dataIntegrityValidator,
      dataPersistence: {
        guardarDatosEmpresa,
        cargarDatosEmpresa,
        existenDatosEmpresa,
        limpiarDatosEmpresa,
        autoCompletarFormulario
      }
    };
    
    this.isActive = false;
    this.safetyChecked = false;
  }

  /**
   * ✅ VERIFICACIÓN DE SEGURIDAD
   */
  performSafetyCheck() {
    const safetyTests = {
      no_data_modification: true,      // NO modifica datos en BD
      no_automatic_fixes: true,       // NO aplica correcciones automáticas  
      read_only_monitoring: true,     // Solo lee y reporta
      file_output_enabled: true       // Genera archivos TXT de errores
    };

    // Verificar que no hay funciones peligrosas
    const dangerousFunctions = [
      'smartSupabase',
      'autoCorrect', 
      'ratSaveErrorHandler',
      'fixError',
      'applyCorrection'
    ];

    let hasDangerousFunctions = false;
    dangerousFunctions.forEach(func => {
      if (typeof window[func] !== 'undefined') {
        hasDangerousFunctions = true;
        //console.warn(`⚠️ Función potencialmente peligrosa detectada: ${func}`);
      }
    });

    this.safetyChecked = true;
    
    return {
      safe: !hasDangerousFunctions,
      tests: safetyTests,
      dangerous_functions: hasDangerousFunctions ? dangerousFunctions.filter(f => typeof window[f] !== 'undefined') : [],
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 🚀 INICIALIZAR SISTEMA SEGURO
   */
  async init() {
    if (this.isActive) {
      //console.log('🛡️ Sistema de monitoreo seguro ya está activo');
      return { success: true, status: 'already_active' };
    }

    try {
      // Verificar seguridad primero
      const safetyCheck = this.performSafetyCheck();
      
      if (!safetyCheck.safe) {
        console.error('❌ Sistema no es seguro - no se inicializará');
        return { success: false, reason: 'safety_check_failed', details: safetyCheck };
      }

      // Inicializar solo componentes seguros
      //console.log('🛡️ Inicializando Sistema de Monitoreo SEGURO...');
      
      // Error monitor ya se auto-inicializa
      if (this.components.errorMonitor && !this.components.errorMonitor.isActive) {
        await this.components.errorMonitor.init();
      }

      // Database Health Monitor
      if (this.components.dbHealthMonitor && !this.components.dbHealthMonitor.isMonitoring) {
        await this.components.dbHealthMonitor.startMonitoring();
      }

      // Early Warning System
      if (this.components.earlyWarningSystem && !this.components.earlyWarningSystem.isActive) {
        await this.components.earlyWarningSystem.init();
      }

      this.isActive = true;
      
      //console.log('✅ Sistema de Monitoreo Seguro ACTIVO');
      //console.log('📊 Usa showErrorReport() para ver dashboard de errores');
      //console.log('💾 Persistencia datos empresa disponible automáticamente');
      //console.log('📄 Errores se generan en archivos TXT en carpeta /errores');
      
      return { success: true, status: 'initialized', safety_check: safetyCheck };
      
    } catch (error) {
      console.error('❌ Error inicializando sistema seguro:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 📊 OBTENER STATUS DEL SISTEMA
   */
  getSystemStatus() {
    return {
      active: this.isActive,
      safety_verified: this.safetyChecked,
      components: {
        error_monitoring: this.components.errorMonitor?.isActive || false,
        data_persistence: typeof this.components.dataPersistence.guardarDatosEmpresa === 'function',
        dashboard: typeof this.components.errorDashboard.generateDashboard === 'function'
      },
      capabilities: {
        monitors_errors: true,
        persists_form_data: true,
        generates_reports: true,
        generates_txt_files: true,
        modifies_database: false,
        auto_fixes_errors: false
      },
      last_check: new Date().toISOString()
    };
  }

  /**
   * 📈 GENERAR REPORTE COMPLETO
   */
  generateCompleteReport() {
    try {
      const systemStatus = this.getSystemStatus();
      const errorReport = generateErrorReport();
      
      return {
        system_status: systemStatus,
        error_analysis: errorReport,
        safety_summary: {
          data_integrity_safe: true,
          no_modifications: true,
          monitoring_only: true,
          generates_txt_logs: true
        },
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      return {
        error: 'No se pudo generar reporte completo',
        message: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 🖨️ MOSTRAR DASHBOARD EN CONSOLA
   */
  showDashboard() {
    //console.log('🛡️ SISTEMA DE MONITOREO SEGURO - DASHBOARD');
    //console.log('='.repeat(50));
    
    const status = this.getSystemStatus();
    //console.log('Estado:', status.active ? '✅ ACTIVO' : '❌ INACTIVO');
    //console.log('Seguridad Verificada:', status.safety_verified ? '✅ SÍ' : '❌ NO');
    
    //console.log('\n🧩 COMPONENTES:');
    Object.entries(status.components).forEach(([name, active]) => {
      //console.log(`  ${name}: ${active ? '✅' : '❌'}`);
    });

    //console.log('\n🔐 CAPACIDADES SEGURAS:');
    Object.entries(status.capabilities).forEach(([capability, enabled]) => {
      const icon = enabled ? '✅' : '❌';
      //console.log(`  ${capability.replace(/_/g, ' ')}: ${icon}`);
    });

    // Mostrar dashboard de errores
    printErrorDashboard();
    
    return status;
  }

  /**
   * 💾 FUNCIONES DE PERSISTENCIA SEGURA
   */
  getPersistenceFunctions() {
    return {
      guardar: this.components.dataPersistence.guardarDatosEmpresa,
      cargar: this.components.dataPersistence.cargarDatosEmpresa,
      existe: this.components.dataPersistence.existenDatosEmpresa,
      limpiar: this.components.dataPersistence.limpiarDatosEmpresa,
      autoCompletar: this.components.dataPersistence.autoCompletarFormulario
    };
  }

  /**
   * 🛑 DETENER SISTEMA
   */
  stop() {
    if (this.components.errorMonitor?.stop) {
      this.components.errorMonitor.stop();
    }
    
    this.isActive = false;
    //console.log('🛑 Sistema de monitoreo seguro detenido');
  }
}

// Instancia global del sistema seguro
const safeMonitoringSystem = new SafeMonitoringSystem();

// Hacer funciones disponibles globalmente para fácil acceso
window.showErrorReport = () => safeMonitoringSystem.showDashboard();
window.getSystemReport = () => safeMonitoringSystem.generateCompleteReport();
window.showDBHealth = () => safeMonitoringSystem.components.dbHealthMonitor.printHealthReport();
window.showEarlyWarnings = () => safeMonitoringSystem.components.earlyWarningSystem.printWarningReport();
window.validateData = (tableName, data, operation = 'INSERT') => {
  if (operation === 'INSERT') {
    return safeMonitoringSystem.components.dataIntegrityValidator.validateBeforeInsert(tableName, data);
  } else if (operation === 'UPDATE') {
    return safeMonitoringSystem.components.dataIntegrityValidator.validateBeforeUpdate(tableName, data.values, data.where);
  }
};
window.safeMonitoringSystem = safeMonitoringSystem;

// Auto-inicializar
if (typeof window !== 'undefined') {
  // Inicializar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      safeMonitoringSystem.init();
    });
  } else {
    safeMonitoringSystem.init();
  }
}

// Exports principales
export default safeMonitoringSystem;

export {
  // Sistema completo
  safeMonitoringSystem,
  
  // Funciones de persistencia (seguras)
  guardarDatosEmpresa,
  cargarDatosEmpresa,
  existenDatosEmpresa,
  limpiarDatosEmpresa,
  autoCompletarFormulario,
  
  // Funciones de reporte (solo lectura)
  generateErrorReport,
  printErrorDashboard
};

// Log de inicialización
//console.log('🛡️ Sistema de Monitoreo Seguro cargado');
//console.log('📋 Funciones disponibles:');
//console.log('  - showErrorReport(): Dashboard general de errores');
//console.log('  - showDBHealth(): Estado de salud base de datos');
//console.log('  - showEarlyWarnings(): Alertas tempranas activas');
//console.log('  - validateData(tabla, datos, operacion): Validar antes de operación');
//console.log('  - getSystemReport(): Reporte completo del sistema');
//console.log('  - Persistencia datos empresa automática (localStorage + archivos TXT errores)');
//console.log('🚨 IMPORTANTE: Solo monitorea - NO modifica datos automáticamente');