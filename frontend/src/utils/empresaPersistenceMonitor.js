/**
 * 🔍 MONITOR PERSISTENCIA DATOS EMPRESA
 * 
 * Monitorea y diagnostica problemas de persistencia
 * Detecta cuando las funciones NO trabajan correctamente
 * Genera reportes detallados en archivos TXT
 */

import { 
  guardarDatosEmpresa, 
  cargarDatosEmpresa, 
  existenDatosEmpresa,
  limpiarDatosEmpresa 
} from './datosEmpresaPersistence';
import fileErrorLogger from './fileErrorLogger';

class EmpresaPersistenceMonitor {
  constructor() {
    this.testResults = [];
    this.functionsStatus = new Map();
    this.isMonitoring = false;
    this.lastTestTime = null;
    
    this.setupMonitoring();
  }

  /**
   * 🚀 INICIAR MONITOREO PERSISTENCIA
   */
  async startMonitoring() {
    if (this.isMonitoring) {
      //console.log('🔍 Monitor persistencia ya está activo');
      return;
    }

    //console.log('🔍 Iniciando monitor persistencia datos empresa...');
    
    try {
      // Test inicial completo
      await this.performFullPersistenceTest();
      
      // Configurar monitoreo automático
      this.setupAutomaticTesting();
      
      // Interceptar funciones para monitorear uso real
      this.interceptPersistenceFunctions();
      
      this.isMonitoring = true;
      //console.log('✅ Monitor persistencia ACTIVO');
      
    } catch (error) {
      console.error('❌ Error iniciando monitor persistencia:', error);
      await fileErrorLogger.logCriticalError(
        'PERSISTENCE_MONITOR_INIT_FAILED',
        { error: error.message, timestamp: new Date().toISOString() },
        'PERSISTENCE_MONITOR'
      );
    }
  }

  /**
   * 🧪 TEST COMPLETO DE PERSISTENCIA
   */
  async performFullPersistenceTest() {
    //console.log('🧪 Ejecutando test completo de persistencia...');
    
    const testData = {
      razon_social: `Test Empresa ${Date.now()}`,
      rut: '12345678-9',
      email: 'test@empresa.com',
      telefono: '+56912345678',
      direccion: 'Test Address 123',
      test_timestamp: Date.now()
    };

    const testResults = {
      timestamp: new Date().toISOString(),
      tests: []
    };

    // Test 1: Función guardarDatosEmpresa
    try {
      //console.log('📝 Test 1: Guardando datos empresa...');
      const saveResult = guardarDatosEmpresa(testData);
      
      testResults.tests.push({
        function: 'guardarDatosEmpresa',
        status: saveResult.success ? 'PASS' : 'FAIL',
        details: saveResult,
        timestamp: new Date().toISOString()
      });
      
      this.functionsStatus.set('guardarDatosEmpresa', saveResult.success ? 'WORKING' : 'BROKEN');
      
    } catch (error) {
      testResults.tests.push({
        function: 'guardarDatosEmpresa',
        status: 'ERROR',
        error: error.message,
        timestamp: new Date().toISOString()
      });
      
      this.functionsStatus.set('guardarDatosEmpresa', 'BROKEN');
      
      await fileErrorLogger.logCriticalError(
        'PERSISTENCE_SAVE_FUNCTION_BROKEN',
        { function: 'guardarDatosEmpresa', error: error.message },
        'PERSISTENCE_MONITOR'
      );
    }

    // Test 2: Función cargarDatosEmpresa
    try {
      //console.log('📖 Test 2: Cargando datos empresa...');
      const loadResult = cargarDatosEmpresa();
      
      const dataMatches = loadResult.success && 
                         loadResult.datos?.razon_social === testData.razon_social;
      
      testResults.tests.push({
        function: 'cargarDatosEmpresa',
        status: dataMatches ? 'PASS' : 'FAIL',
        details: { loadResult, dataMatches },
        timestamp: new Date().toISOString()
      });
      
      this.functionsStatus.set('cargarDatosEmpresa', dataMatches ? 'WORKING' : 'BROKEN');
      
      if (!dataMatches) {
        await fileErrorLogger.logHighError(
          'PERSISTENCE_LOAD_DATA_MISMATCH',
          { 
            expected: testData.razon_social,
            received: loadResult.datos?.razon_social,
            fullResult: loadResult
          },
          'PERSISTENCE_MONITOR'
        );
      }
      
    } catch (error) {
      testResults.tests.push({
        function: 'cargarDatosEmpresa',
        status: 'ERROR',
        error: error.message,
        timestamp: new Date().toISOString()
      });
      
      this.functionsStatus.set('cargarDatosEmpresa', 'BROKEN');
    }

    // Test 3: Función existenDatosEmpresa
    try {
      //console.log('🔍 Test 3: Verificando existencia datos...');
      const existsResult = existenDatosEmpresa();
      
      testResults.tests.push({
        function: 'existenDatosEmpresa',
        status: existsResult ? 'PASS' : 'FAIL',
        details: { exists: existsResult },
        timestamp: new Date().toISOString()
      });
      
      this.functionsStatus.set('existenDatosEmpresa', existsResult ? 'WORKING' : 'BROKEN');
      
    } catch (error) {
      testResults.tests.push({
        function: 'existenDatosEmpresa',
        status: 'ERROR',
        error: error.message,
        timestamp: new Date().toISOString()
      });
      
      this.functionsStatus.set('existenDatosEmpresa', 'BROKEN');
    }

    // Test 4: Navegación simulation
    try {
      //console.log('🌐 Test 4: Simulando navegación (recarga localStorage)...');
      
      // Simular recarga - limpiar sessionStorage pero mantener localStorage
      const originalSessionData = sessionStorage.getItem('lpdp_sesion_actual_empresa');
      sessionStorage.removeItem('lpdp_sesion_actual_empresa');
      
      // Intentar cargar después de "navegación"
      const loadAfterNav = cargarDatosEmpresa();
      
      const persistedCorrectly = loadAfterNav.success && 
                                loadAfterNav.datos?.razon_social === testData.razon_social;
      
      testResults.tests.push({
        function: 'navigation_persistence',
        status: persistedCorrectly ? 'PASS' : 'FAIL',
        details: { 
          persistedAfterNavigation: persistedCorrectly,
          loadResult: loadAfterNav
        },
        timestamp: new Date().toISOString()
      });
      
      // Restaurar sessionStorage
      if (originalSessionData) {
        sessionStorage.setItem('lpdp_sesion_actual_empresa', originalSessionData);
      }
      
      if (!persistedCorrectly) {
        await fileErrorLogger.logCriticalError(
          'PERSISTENCE_NAVIGATION_FAILURE',
          { 
            description: 'Datos se pierden al navegar - localStorage no funciona',
            loadAfterNavigation: loadAfterNav
          },
          'PERSISTENCE_MONITOR'
        );
      }
      
    } catch (error) {
      testResults.tests.push({
        function: 'navigation_persistence',
        status: 'ERROR',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }

    // Test 5: Limpiar datos de prueba
    try {
      limpiarDatosEmpresa();
      //console.log('🧹 Datos de prueba limpiados');
    } catch (error) {
      //console.warn('⚠️ Error limpiando datos de prueba:', error);
    }

    // Guardar resultados
    this.testResults.push(testResults);
    this.lastTestTime = Date.now();

    // Generar reporte en archivo TXT
    await this.generatePersistenceReport(testResults);

    return testResults;
  }

  /**
   * 🕷️ INTERCEPTAR FUNCIONES PARA MONITOREO EN TIEMPO REAL
   */
  interceptPersistenceFunctions() {
    // Interceptar window.guardarDatosEmpresa si existe
    if (typeof window.guardarDatosEmpresa === 'function') {
      const originalGuardar = window.guardarDatosEmpresa;
      
      window.guardarDatosEmpresa = (...args) => {
        const timestamp = new Date().toISOString();
        //console.log('🔍 MONITOR: Llamada a guardarDatosEmpresa detectada', timestamp);
        
        try {
          const result = originalGuardar(...args);
          
          if (!result.success) {
            fileErrorLogger.logHighError(
              'REAL_TIME_SAVE_FAILURE',
              { 
                args: args,
                result: result,
                timestamp: timestamp
              },
              'PERSISTENCE_MONITOR'
            );
          }
          
          return result;
        } catch (error) {
          fileErrorLogger.logCriticalError(
            'REAL_TIME_SAVE_ERROR',
            {
              error: error.message,
              args: args,
              timestamp: timestamp
            },
            'PERSISTENCE_MONITOR'
          );
          throw error;
        }
      };
    }

    // Interceptar window.cargarDatosEmpresa si existe
    if (typeof window.cargarDatosEmpresa === 'function') {
      const originalCargar = window.cargarDatosEmpresa;
      
      window.cargarDatosEmpresa = (...args) => {
        const timestamp = new Date().toISOString();
        //console.log('🔍 MONITOR: Llamada a cargarDatosEmpresa detectada', timestamp);
        
        try {
          const result = originalCargar(...args);
          
          if (!result.success || !result.datos) {
            fileErrorLogger.logHighError(
              'REAL_TIME_LOAD_FAILURE',
              { 
                args: args,
                result: result,
                timestamp: timestamp,
                description: 'Carga falló o retornó datos vacíos'
              },
              'PERSISTENCE_MONITOR'
            );
          }
          
          return result;
        } catch (error) {
          fileErrorLogger.logCriticalError(
            'REAL_TIME_LOAD_ERROR',
            {
              error: error.message,
              args: args,
              timestamp: timestamp
            },
            'PERSISTENCE_MONITOR'
          );
          throw error;
        }
      };
    }
  }

  /**
   * ⏰ CONFIGURAR TESTING AUTOMÁTICO
   */
  setupAutomaticTesting() {
    // Test cada 30 minutos
    setInterval(async () => {
      try {
        await this.performFullPersistenceTest();
      } catch (error) {
        console.error('❌ Error en test automático persistencia:', error);
      }
    }, 30 * 60 * 1000);
  }

  /**
   * 🔄 CONFIGURAR MONITOREO BÁSICO
   */
  setupMonitoring() {
    // Monitor cambios en localStorage
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = (key, value) => {
      if (key.includes('empresa')) {
        //console.log('🔍 localStorage.setItem detectado para empresa:', key);
      }
      return originalSetItem.call(localStorage, key, value);
    };

    // Monitor errores storage
    window.addEventListener('error', (event) => {
      if (event.message.includes('localStorage') || event.message.includes('sessionStorage')) {
        fileErrorLogger.logHighError(
          'STORAGE_ERROR_DETECTED',
          {
            message: event.message,
            filename: event.filename,
            timestamp: new Date().toISOString()
          },
          'PERSISTENCE_MONITOR'
        );
      }
    });
  }

  /**
   * 📊 GENERAR REPORTE PERSISTENCIA
   */
  async generatePersistenceReport(testResults) {
    const failedTests = testResults.tests.filter(t => t.status === 'FAIL' || t.status === 'ERROR');
    const workingFunctions = Array.from(this.functionsStatus.entries())
      .filter(([func, status]) => status === 'WORKING')
      .map(([func]) => func);
    const brokenFunctions = Array.from(this.functionsStatus.entries())
      .filter(([func, status]) => status === 'BROKEN')
      .map(([func]) => func);

    const report = {
      timestamp: testResults.timestamp,
      overall_status: failedTests.length === 0 ? 'HEALTHY' : 'CRITICAL',
      summary: {
        total_functions_tested: testResults.tests.length,
        working_functions: workingFunctions.length,
        broken_functions: brokenFunctions.length,
        critical_issues: failedTests.length
      },
      function_status: {
        working: workingFunctions,
        broken: brokenFunctions
      },
      failed_tests: failedTests,
      recommendations: this.generateRecommendations(failedTests)
    };

    // Escribir reporte a archivo TXT
    if (failedTests.length > 0) {
      await fileErrorLogger.logCriticalError(
        'PERSISTENCE_FUNCTIONS_NOT_WORKING',
        report,
        'PERSISTENCE_MONITOR'
      );
    } else {
      await fileErrorLogger.logMediumError(
        'PERSISTENCE_HEALTH_REPORT',
        report,
        'PERSISTENCE_MONITOR'
      );
    }

    return report;
  }

  /**
   * 💡 GENERAR RECOMENDACIONES
   */
  generateRecommendations(failedTests) {
    const recommendations = [];

    if (failedTests.some(t => t.function === 'guardarDatosEmpresa')) {
      recommendations.push('FIX CRÍTICO: Función guardarDatosEmpresa no funciona - revisar localStorage access');
    }

    if (failedTests.some(t => t.function === 'cargarDatosEmpresa')) {
      recommendations.push('FIX CRÍTICO: Función cargarDatosEmpresa no funciona - datos se pierden');
    }

    if (failedTests.some(t => t.function === 'navigation_persistence')) {
      recommendations.push('FIX CRÍTICO: Persistencia falla entre navegación - usuario pierde datos');
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ Todas las funciones de persistencia están funcionando correctamente');
    }

    return recommendations;
  }

  /**
   * 📊 OBTENER ESTADO ACTUAL
   */
  getCurrentStatus() {
    return {
      monitoring_active: this.isMonitoring,
      last_test: this.lastTestTime ? new Date(this.lastTestTime).toISOString() : null,
      functions_status: Object.fromEntries(this.functionsStatus),
      total_tests_performed: this.testResults.length
    };
  }

  /**
   * 🖨️ IMPRIMIR REPORTE EN CONSOLA
   */
  printStatusReport() {
    const status = this.getCurrentStatus();
    
    console.group('🔍 REPORTE MONITOR PERSISTENCIA');
    //console.log('Estado monitoreo:', status.monitoring_active ? '✅ ACTIVO' : '❌ INACTIVO');
    //console.log('Último test:', status.last_test || 'Nunca ejecutado');
    //console.log('Tests realizados:', status.total_tests_performed);
    
    console.group('📋 Estado Funciones');
    Object.entries(status.functions_status).forEach(([func, status]) => {
      const icon = status === 'WORKING' ? '✅' : '❌';
      //console.log(`${icon} ${func}: ${status}`);
    });
    console.groupEnd();
    
    console.groupEnd();
    
    return status;
  }
}

// Instancia global
const empresaPersistenceMonitor = new EmpresaPersistenceMonitor();

// Hacer disponible globalmente
window.empresaPersistenceMonitor = empresaPersistenceMonitor;
window.testPersistencia = () => empresaPersistenceMonitor.performFullPersistenceTest();
window.statusPersistencia = () => empresaPersistenceMonitor.printStatusReport();

// Auto-iniciar si estamos en el navegador
if (typeof window !== 'undefined') {
  empresaPersistenceMonitor.startMonitoring();
}

export default empresaPersistenceMonitor;