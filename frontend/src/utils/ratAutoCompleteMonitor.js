/**
 * 🔍 MONITOR AUTOCOMPLETADO RAT
 * 
 * Detecta cuando el RAT NO se autocompleta con datos grabados
 * Diagnostica específicamente por qué falla la carga automática
 * Genera reportes detallados del problema
 */

import fileErrorLogger from './fileErrorLogger';

class RATAutoCompleteMonitor {
  constructor() {
    this.monitoring = false;
    this.testResults = [];
    this.interceptedCalls = [];
    this.dataLoadAttempts = [];
    
    this.startMonitoring();
  }

  /**
   * 🚀 INICIAR MONITOREO
   */
  startMonitoring() {
    if (this.monitoring) return;

    //console.log('🔍 Iniciando monitor autocompletado RAT...');
    
    // Interceptar console.log para detectar intentos de carga
    this.interceptConsoleMessages();
    
    // Interceptar funciones de carga de datos
    this.interceptDataLoadFunctions();
    
    // Monitorear cambios en DOM para detectar formularios vacíos
    this.monitorFormFields();
    
    this.monitoring = true;
    //console.log('✅ Monitor autocompletado RAT activo');
  }

  /**
   * 🕷️ INTERCEPTAR MENSAJES CONSOLA
   */
  interceptConsoleMessages() {
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;

    console.log = (...args) => {
      const message = args.join(' ');
      
      // Detectar intentos de carga de datos
      if (message.includes('RATSystemProfessional inicializando') ||
          message.includes('cargando datos') ||
          message.includes('Cargando datos empresa') ||
          message.includes('datos empresa guardados')) {
        
        this.dataLoadAttempts.push({
          type: 'LOAD_ATTEMPT',
          message: message,
          timestamp: new Date().toISOString(),
          args: args
        });
      }
      
      // Detectar éxito/fallo en carga
      if (message.includes('Datos empresa restaurados') ||
          message.includes('datos cargados exitosamente')) {
        
        this.dataLoadAttempts.push({
          type: 'LOAD_SUCCESS',
          message: message,
          timestamp: new Date().toISOString()
        });
      }
      
      originalLog.apply(console, args);
    };

    console.warn = (...args) => {
      const message = args.join(' ');
      
      if (message.includes('datos empresa') ||
          message.includes('No se encontraron datos') ||
          message.includes('Datos ya ingresados')) {
        
        this.dataLoadAttempts.push({
          type: 'LOAD_WARNING',
          message: message,
          timestamp: new Date().toISOString(),
          severity: 'WARNING'
        });
      }
      
      originalWarn.apply(console, args);
    };

    console.error = (...args) => {
      const message = args.join(' ');
      
      if (message.includes('ERROR cargando datos') ||
          message.includes('currentTenant') ||
          message.includes('datos empresa')) {
        
        this.dataLoadAttempts.push({
          type: 'LOAD_ERROR',
          message: message,
          timestamp: new Date().toISOString(),
          severity: 'ERROR'
        });
        
        // Log inmediato del error
        fileErrorLogger.logCriticalError(
          'RAT_AUTOCOMPLETE_ERROR_DETECTED',
          { 
            error_message: message,
            timestamp: new Date().toISOString(),
            detection_source: 'console_error_intercept'
          },
          'RAT_AUTOCOMPLETE_MONITOR'
        );
      }
      
      originalError.apply(console, args);
    };
  }

  /**
   * 🔄 INTERCEPTAR FUNCIONES CARGA DATOS
   */
  interceptDataLoadFunctions() {
    // Interceptar cargarDatosEmpresa si existe globalmente
    if (typeof window.cargarDatosEmpresa === 'function') {
      const originalCargar = window.cargarDatosEmpresa;
      
      window.cargarDatosEmpresa = (...args) => {
        const timestamp = new Date().toISOString();
        //console.log('🔍 MONITOR: cargarDatosEmpresa llamada detectada');
        
        this.interceptedCalls.push({
          function: 'cargarDatosEmpresa',
          timestamp: timestamp,
          args: args
        });
        
        try {
          const result = originalCargar(...args);
          
          this.interceptedCalls.push({
            function: 'cargarDatosEmpresa',
            type: 'RESULT',
            timestamp: timestamp,
            result: result,
            success: result?.success || false
          });
          
          return result;
        } catch (error) {
          this.interceptedCalls.push({
            function: 'cargarDatosEmpresa',
            type: 'ERROR',
            timestamp: timestamp,
            error: error.message
          });
          
          throw error;
        }
      };
    }

    // Interceptar existenDatosEmpresa si existe
    if (typeof window.existenDatosEmpresa === 'function') {
      const originalExisten = window.existenDatosEmpresa;
      
      window.existenDatosEmpresa = (...args) => {
        const result = originalExisten(...args);
        
        this.interceptedCalls.push({
          function: 'existenDatosEmpresa',
          timestamp: new Date().toISOString(),
          result: result,
          args: args
        });
        
        return result;
      };
    }
  }

  /**
   * 📋 MONITOREAR CAMPOS FORMULARIO
   */
  monitorFormFields() {
    // Verificar cada 5 segundos si los campos están vacíos cuando deberían estar llenos
    setInterval(() => {
      this.checkFormAutofill();
    }, 5000);
  }

  /**
   * ✅ VERIFICAR AUTOCOMPLETADO FORMULARIO
   */
  checkFormAutofill() {
    try {
      // Buscar campos comunes del formulario RAT
      const campos = {
        razonSocial: this.getFieldValue(['input[name*="razon"]', 'input[placeholder*="Razón"]']),
        rut: this.getFieldValue(['input[name*="rut"]', 'input[placeholder*="RUT"]']),
        email: this.getFieldValue(['input[type="email"]', 'input[name*="email"]']),
        telefono: this.getFieldValue(['input[name*="telefono"]', 'input[name*="phone"]']),
        direccion: this.getFieldValue(['input[name*="direccion"]', 'textarea[name*="direccion"]'])
      };

      const camposVacios = Object.entries(campos)
        .filter(([campo, valor]) => !valor || valor.trim() === '')
        .map(([campo]) => campo);

      const todosVacios = camposVacios.length === Object.keys(campos).length;

      // Solo reportar si TODOS los campos están vacíos (indica fallo total)
      if (todosVacios && this.dataLoadAttempts.length > 0) {
        const ultimoIntento = this.dataLoadAttempts[this.dataLoadAttempts.length - 1];
        
        // Solo reportar si ha pasado tiempo suficiente desde el último intento
        const tiempoTranscurrido = Date.now() - new Date(ultimoIntento.timestamp).getTime();
        
        if (tiempoTranscurrido > 10000) { // 10 segundos
          this.reportAutocompleteFailed(campos, camposVacios);
        }
      }

    } catch (error) {
      // Error monitoreando campos, no bloquear funcionamiento
      //console.warn('⚠️ Error monitoreando campos formulario:', error);
    }
  }

  /**
   * 📖 OBTENER VALOR CAMPO
   */
  getFieldValue(selectors) {
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        return element.value || '';
      }
    }
    return '';
  }

  /**
   * 🚨 REPORTAR FALLO AUTOCOMPLETADO
   */
  async reportAutocompleteFailed(campos, camposVacios) {
    const failureReport = {
      timestamp: new Date().toISOString(),
      problem: 'RAT_AUTOCOMPLETE_TOTAL_FAILURE',
      description: 'Formulario RAT completamente vacío después de intentos de carga',
      detected_fields: campos,
      empty_fields: camposVacios,
      data_load_attempts: this.dataLoadAttempts.length,
      intercepted_calls: this.interceptedCalls.length,
      recent_attempts: this.dataLoadAttempts.slice(-5),
      recent_calls: this.interceptedCalls.slice(-5)
    };

    console.error('🚨 AUTOCOMPLETE FALLO DETECTADO:', failureReport);

    // Log en archivo TXT
    await fileErrorLogger.logCriticalError(
      'RAT_AUTOCOMPLETE_COMPLETE_FAILURE',
      failureReport,
      'RAT_AUTOCOMPLETE_MONITOR'
    );

    // Agregar a resultados de test
    this.testResults.push({
      timestamp: failureReport.timestamp,
      status: 'CRITICAL_FAILURE',
      details: failureReport
    });
  }

  /**
   * 🧪 EJECUTAR TEST MANUAL AUTOCOMPLETADO
   */
  async testAutoComplete() {
    //console.log('🧪 Ejecutando test manual autocompletado...');
    
    const testResults = {
      timestamp: new Date().toISOString(),
      tests: []
    };

    // Test 1: Verificar funciones disponibles
    const functionsAvailable = {
      cargarDatosEmpresa: typeof window.cargarDatosEmpresa === 'function',
      existenDatosEmpresa: typeof window.existenDatosEmpresa === 'function',
      guardarDatosEmpresa: typeof window.guardarDatosEmpresa === 'function',
      autoCompletarFormulario: typeof window.autoCompletarFormulario === 'function'
    };

    testResults.tests.push({
      name: 'functions_availability',
      status: Object.values(functionsAvailable).every(available => available) ? 'PASS' : 'FAIL',
      details: functionsAvailable
    });

    // Test 2: Verificar datos en localStorage
    const localStorageData = {
      empresa_key_exists: localStorage.getItem('lpdp_datos_empresa_persistentes') !== null,
      session_key_exists: sessionStorage.getItem('lpdp_sesion_actual_empresa') !== null
    };

    testResults.tests.push({
      name: 'local_storage_data',
      status: localStorageData.empresa_key_exists || localStorageData.session_key_exists ? 'PASS' : 'FAIL',
      details: localStorageData
    });

    // Test 3: Intentar cargar datos manualmente
    if (typeof window.cargarDatosEmpresa === 'function') {
      try {
        const loadResult = window.cargarDatosEmpresa();
        testResults.tests.push({
          name: 'manual_data_load',
          status: loadResult.success ? 'PASS' : 'FAIL',
          details: loadResult
        });
      } catch (error) {
        testResults.tests.push({
          name: 'manual_data_load',
          status: 'ERROR',
          error: error.message
        });
      }
    }

    // Test 4: Verificar estado actual formulario
    const currentFormData = {
      razonSocial: this.getFieldValue(['input[name*="razon"]', 'input[placeholder*="Razón"]']),
      rut: this.getFieldValue(['input[name*="rut"]', 'input[placeholder*="RUT"]']),
      email: this.getFieldValue(['input[type="email"]', 'input[name*="email"]'])
    };

    const hasData = Object.values(currentFormData).some(value => value && value.trim());

    testResults.tests.push({
      name: 'current_form_state',
      status: hasData ? 'PASS' : 'FAIL',
      details: currentFormData
    });

    // Generar reporte
    const failedTests = testResults.tests.filter(t => t.status === 'FAIL' || t.status === 'ERROR');
    
    if (failedTests.length > 0) {
      await fileErrorLogger.logCriticalError(
        'RAT_AUTOCOMPLETE_TEST_FAILURES',
        testResults,
        'RAT_AUTOCOMPLETE_MONITOR'
      );
    }

    //console.log('📊 Test autocompletado completado:', testResults);
    return testResults;
  }

  /**
   * 📊 GENERAR REPORTE ESTADO
   */
  generateStatusReport() {
    return {
      monitoring_active: this.monitoring,
      total_load_attempts: this.dataLoadAttempts.length,
      total_function_calls: this.interceptedCalls.length,
      total_test_results: this.testResults.length,
      recent_attempts: this.dataLoadAttempts.slice(-5),
      recent_calls: this.interceptedCalls.slice(-5),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 🖨️ IMPRIMIR ESTADO EN CONSOLA
   */
  printStatus() {
    const status = this.generateStatusReport();
    
    console.group('🔍 MONITOR AUTOCOMPLETADO RAT');
    //console.log('Estado:', status.monitoring_active ? '✅ ACTIVO' : '❌ INACTIVO');
    //console.log('Intentos de carga detectados:', status.total_load_attempts);
    //console.log('Llamadas a funciones:', status.total_function_calls);
    
    if (status.recent_attempts.length > 0) {
      console.group('📋 Últimos intentos de carga');
      status.recent_attempts.forEach(attempt => {
        //console.log(`${attempt.type}: ${attempt.message}`);
      });
      console.groupEnd();
    }
    
    console.groupEnd();
    
    return status;
  }
}

// Instancia global
const ratAutoCompleteMonitor = new RATAutoCompleteMonitor();

// Hacer disponible globalmente
window.ratAutoCompleteMonitor = ratAutoCompleteMonitor;
window.testRATAutoComplete = () => ratAutoCompleteMonitor.testAutoComplete();
window.statusRATAutoComplete = () => ratAutoCompleteMonitor.printStatus();

export default ratAutoCompleteMonitor;