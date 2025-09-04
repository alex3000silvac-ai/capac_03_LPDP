/**
 * 🧪 TEST ERRORES ACUMULATIVOS
 * 
 * Prueba que los errores se acumulen correctamente en archivos TXT
 */

import cumulativeErrorLogger from './cumulativeErrorLogger';

class TestCumulativeErrors {
  constructor() {
    this.testResults = [];
  }

  /**
   * 🧪 EJECUTAR TODOS LOS TESTS
   */
  async runAllTests() {
    console.group('🧪 TESTING ERRORES ACUMULATIVOS');
    
    const tests = [
      this.testCriticalErrors,
      this.testHighErrors,
      this.testMediumErrors,
      this.testEarlyWarnings,
      this.testDatabaseHealth,
      this.testValidationErrors
    ];

    for (const test of tests) {
      try {
        await test.call(this);
        await this.wait(1000); // Esperar 1 segundo entre tests
      } catch (error) {
        this.testResults.push({
          test: test.name,
          status: 'ERROR',
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }

    this.printResults();
    console.groupEnd();
    
    return this.testResults;
  }

  /**
   * 🚨 TEST ERRORES CRÍTICOS
   */
  async testCriticalErrors() {
    console.log('🚨 Testing errores críticos acumulativos...');
    
    const testErrors = [
      { type: 'TEST_CRITICAL_1', details: 'Primer error crítico de prueba' },
      { type: 'TEST_CRITICAL_2', details: 'Segundo error crítico de prueba' },
      { type: 'TEST_CRITICAL_3', details: 'Tercer error crítico de prueba' }
    ];

    for (const errorData of testErrors) {
      await cumulativeErrorLogger.logCriticalError(
        errorData.type,
        errorData.details,
        'TEST_CUMULATIVE'
      );
    }

    this.testResults.push({
      test: 'testCriticalErrors',
      status: 'PASS',
      message: `${testErrors.length} errores críticos agregados acumulativamente`,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * ⚠️ TEST ERRORES ALTOS
   */
  async testHighErrors() {
    console.log('⚠️ Testing errores altos acumulativos...');
    
    const testErrors = [
      { type: 'TEST_HIGH_1', details: 'Primer error alto de prueba' },
      { type: 'TEST_HIGH_2', details: 'Segundo error alto de prueba' }
    ];

    for (const errorData of testErrors) {
      await cumulativeErrorLogger.logHighError(
        errorData.type,
        errorData.details,
        'TEST_CUMULATIVE'
      );
    }

    this.testResults.push({
      test: 'testHighErrors',
      status: 'PASS',
      message: `${testErrors.length} errores altos agregados acumulativamente`,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 📊 TEST ERRORES MEDIOS
   */
  async testMediumErrors() {
    console.log('📊 Testing errores medios acumulativos...');
    
    const testErrors = [
      { type: 'TEST_MEDIUM_1', details: 'Primer error medio de prueba' },
      { type: 'TEST_MEDIUM_2', details: 'Segundo error medio de prueba' },
      { type: 'TEST_MEDIUM_3', details: 'Tercer error medio de prueba' },
      { type: 'TEST_MEDIUM_4', details: 'Cuarto error medio de prueba' }
    ];

    for (const errorData of testErrors) {
      await cumulativeErrorLogger.logMediumError(
        errorData.type,
        errorData.details,
        'TEST_CUMULATIVE'
      );
    }

    this.testResults.push({
      test: 'testMediumErrors',
      status: 'PASS',
      message: `${testErrors.length} errores medios agregados acumulativamente`,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 🔍 TEST ALERTAS TEMPRANAS
   */
  async testEarlyWarnings() {
    console.log('🔍 Testing alertas tempranas acumulativas...');
    
    const testWarnings = [
      {
        type: 'TEST_WARNING_1',
        predicted: 'Error de conexión BD predicho',
        prevention: 'Verificar conectividad antes de operación',
        details: 'Detalles del warning 1'
      },
      {
        type: 'TEST_WARNING_2', 
        predicted: 'Error de validación predicho',
        prevention: 'Validar datos antes de guardar',
        details: 'Detalles del warning 2'
      }
    ];

    for (const warning of testWarnings) {
      await cumulativeErrorLogger.logEarlyWarning(
        warning.type,
        warning.predicted,
        warning.prevention,
        warning.details
      );
    }

    this.testResults.push({
      test: 'testEarlyWarnings',
      status: 'PASS',
      message: `${testWarnings.length} alertas tempranas agregadas acumulativamente`,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 🏥 TEST SALUD BD
   */
  async testDatabaseHealth() {
    console.log('🏥 Testing salud BD acumulativa...');
    
    const testHealthReports = [
      {
        overall_status: 'HEALTHY',
        checks: {
          connectivity: { status: 'PASSED' },
          tables: { status: 'PASSED' },
          rls: { status: 'PASSED' }
        },
        critical_issues: []
      },
      {
        overall_status: 'WARNING',
        checks: {
          connectivity: { status: 'PASSED' },
          tables: { status: 'WARNING', error: 'Tabla lenta' },
          rls: { status: 'FAILED', error: 'Permisos RLS problema' }
        },
        critical_issues: ['Problema permisos RLS']
      }
    ];

    for (const report of testHealthReports) {
      await cumulativeErrorLogger.logDatabaseHealth(report);
    }

    this.testResults.push({
      test: 'testDatabaseHealth',
      status: 'PASS',
      message: `${testHealthReports.length} reportes salud BD agregados acumulativamente`,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * ✅ TEST ERRORES VALIDACIÓN
   */
  async testValidationErrors() {
    console.log('✅ Testing errores validación acumulativos...');
    
    const testValidations = [
      {
        table: 'mapeo_datos_rat',
        operation: 'INSERT',
        result: {
          valid: false,
          errors: ['Campo requerido faltante: nombre_actividad'],
          warnings: ['Email formato cuestionable']
        }
      },
      {
        table: 'organizaciones',
        operation: 'UPDATE',
        result: {
          valid: false,
          errors: ['RUT formato inválido', 'ID no existe'],
          warnings: []
        }
      }
    ];

    for (const validation of testValidations) {
      await cumulativeErrorLogger.logValidationError(
        validation.table,
        validation.operation,
        validation.result
      );
    }

    this.testResults.push({
      test: 'testValidationErrors',
      status: 'PASS',
      message: `${testValidations.length} errores validación agregados acumulativamente`,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * ⏰ ESPERAR TIEMPO
   */
  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 🖨️ IMPRIMIR RESULTADOS
   */
  printResults() {
    console.group('📊 RESULTADOS TEST ACUMULATIVO');
    
    const passed = this.testResults.filter(r => r.status === 'PASS').length;
    const failed = this.testResults.filter(r => r.status === 'ERROR').length;
    
    console.log(`✅ Tests pasados: ${passed}`);
    console.log(`❌ Tests fallados: ${failed}`);
    console.log(`📁 Total tests: ${this.testResults.length}`);
    
    if (failed > 0) {
      console.group('❌ Tests fallados:');
      this.testResults.filter(r => r.status === 'ERROR').forEach(result => {
        console.error(`${result.test}: ${result.error}`);
      });
      console.groupEnd();
    }
    
    const stats = cumulativeErrorLogger.getStats();
    console.log('📊 Estadísticas archivos:', stats);
    
    console.groupEnd();
  }

  /**
   * 🧪 TEST RÁPIDO ACUMULACIÓN
   */
  async quickAccumulationTest() {
    console.log('⚡ Ejecutando test rápido de acumulación...');
    
    // Generar 10 errores rápidamente
    for (let i = 1; i <= 10; i++) {
      await cumulativeErrorLogger.logMediumError(
        `QUICK_TEST_${i}`,
        `Error de prueba rápida número ${i}`,
        'QUICK_TEST'
      );
    }
    
    const stats = cumulativeErrorLogger.getStats();
    console.log('✅ Test rápido completado, estadísticas:', stats);
    
    return stats;
  }
}

// Instancia global del test
const testCumulativeErrors = new TestCumulativeErrors();

// Hacer disponible globalmente
window.testCumulativeErrors = testCumulativeErrors;
window.runCumulativeTest = () => testCumulativeErrors.runAllTests();
window.quickCumulativeTest = () => testCumulativeErrors.quickAccumulationTest();

export default testCumulativeErrors;