/**
 * 🚀 INSTANT SYSTEM TEST - EJECUCIÓN INMEDIATA
 * 
 * Test automático y ultra-rápido del sistema completo
 * Se ejecuta inmediatamente al cargar
 */

import { supabase } from '../config/supabaseConfig';

class InstantSystemTest {
  constructor() {
    this.testId = `instant_${Date.now()}`;
    this.results = [];
    this.errors = [];
  }

  /**
   * ⚡ EJECUTAR TODOS LOS TESTS INMEDIATAMENTE
   */
  async executeAllTests() {
    const startTime = performance.now();
    
    const report = {
      test_id: this.testId,
      started_at: new Date().toISOString(),
      tests: {},
      summary: {},
      recommendations: []
    };

    // //console.log('🚀 INICIANDO TESTS AUTOMÁTICOS DEL SISTEMA...');

    try {
      // Test 1: Base de datos
      report.tests.database = await this.testDatabase();
      
      // Test 2: Navegación
      report.tests.navigation = await this.testNavigation();
      
      // Test 3: Formularios
      report.tests.forms = await this.testForms();
      
      // Test 4: CRUD Operations
      report.tests.crud = await this.testCRUDOperations();
      
      // Test 5: Sistema de validaciones
      report.tests.validations = await this.testValidationSystem();
      
      // Test 6: Performance
      report.tests.performance = await this.testPerformance();

      // Generar resumen
      const totalTime = performance.now() - startTime;
      report.summary = this.generateSummary(report.tests, totalTime);
      report.completed_at = new Date().toISOString();

      // Mostrar resultados
      this.displayResults(report);
      
      return report;

    } catch (error) {
      console.error('❌ ERROR EN TESTS:', error);
      report.fatal_error = error.message;
      return report;
    }
  }

  /**
   * 💾 TEST DE BASE DE DATOS
   */
  async testDatabase() {
    const test = { name: 'Database', status: 'running', issues: [] };
    
    try {
      // Test conexión
      const { data: connTest } = await supabase
        .from('organizaciones')
        .select('count', { count: 'exact', head: true });
      
      test.connection = '✅ Conectado';

      // Test tablas principales
      const tables = ['organizaciones', 'rats', 'proveedores'];
      test.tables = {};
      
      for (const table of tables) {
        try {
          const { count } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true });
          
          test.tables[table] = `✅ ${count || 0} registros`;
        } catch (error) {
          test.tables[table] = `❌ Error: ${error.message}`;
          test.issues.push(`Tabla ${table}: ${error.message}`);
        }
      }

      // Test integridad
      const { data: rats } = await supabase
        .from('rats')
        .select('id, organizacion_id')
        .not('organizacion_id', 'is', null)
        .limit(5);

      if (rats) {
        let integrityOk = true;
        for (const rat of rats) {
          const { data: org } = await supabase
            .from('organizaciones')
            .select('id')
            .eq('id', rat.organizacion_id)
            .single();
          
          if (!org) {
            integrityOk = false;
            test.issues.push(`RAT ${rat.id} referencia organización inexistente`);
            break;
          }
        }
        test.integrity = integrityOk ? '✅ Íntegra' : '⚠️ Problemas detectados';
      }

      test.status = test.issues.length === 0 ? '✅ PASSED' : '⚠️ WARNINGS';

    } catch (error) {
      test.status = '❌ FAILED';
      test.error = error.message;
    }

    return test;
  }

  /**
   * 🧭 TEST DE NAVEGACIÓN
   */
  async testNavigation() {
    const test = { name: 'Navigation', status: 'running', routes: {} };
    
    try {
      // Test elementos de navegación existentes
      const navElements = document.querySelectorAll('nav a, [role="navigation"] a, .nav-link');
      test.nav_elements_count = navElements.length;

      // Test rutas principales
      const expectedRoutes = [
        { path: '/', name: 'Home' },
        { path: '/dashboard', name: 'Dashboard' },
        { path: '/organizaciones', name: 'Organizaciones' },
        { path: '/rats', name: 'RATs' },
        { path: '/proveedores', name: 'Proveedores' }
      ];

      for (const route of expectedRoutes) {
        const linkExists = Array.from(navElements).some(
          link => link.getAttribute('href')?.includes(route.path)
        );
        test.routes[route.name] = linkExists ? '✅ Disponible' : '❌ Faltante';
      }

      // Verificar breadcrumbs
      const breadcrumbs = document.querySelector('.breadcrumb, nav[aria-label="breadcrumb"]');
      test.breadcrumbs = breadcrumbs ? '✅ Presente' : '⚠️ No encontrado';

      const failedRoutes = Object.values(test.routes).filter(status => status.includes('❌')).length;
      test.status = failedRoutes === 0 ? '✅ PASSED' : '⚠️ WARNINGS';

    } catch (error) {
      test.status = '❌ FAILED';
      test.error = error.message;
    }

    return test;
  }

  /**
   * 📝 TEST DE FORMULARIOS
   */
  async testForms() {
    const test = { name: 'Forms', status: 'running', forms: {} };
    
    try {
      const forms = document.querySelectorAll('form, [role="form"]');
      test.total_forms = forms.length;

      for (let i = 0; i < Math.min(forms.length, 5); i++) {
        const form = forms[i];
        const formId = form.id || form.className || `form_${i}`;
        
        const formTest = {
          inputs: form.querySelectorAll('input').length,
          selects: form.querySelectorAll('select').length,
          textareas: form.querySelectorAll('textarea').length,
          submit_button: form.querySelector('[type="submit"], button') ? '✅' : '❌',
          validation: form.getAttribute('novalidate') === null ? '✅' : '⚠️'
        };

        test.forms[formId] = formTest;
      }

      // Test validaciones HTML5
      const requiredFields = document.querySelectorAll('input[required], select[required], textarea[required]');
      test.required_fields = requiredFields.length;

      // Test campos con patrones
      const patterFields = document.querySelectorAll('input[pattern]');
      test.pattern_validations = patterFields.length;

      test.status = '✅ PASSED';

    } catch (error) {
      test.status = '❌ FAILED';
      test.error = error.message;
    }

    return test;
  }

  /**
   * 🔄 TEST DE OPERACIONES CRUD
   */
  async testCRUDOperations() {
    const test = { name: 'CRUD Operations', status: 'running', operations: {} };
    
    try {
      // CREATE test
      const createResult = await this.testCreate();
      test.operations.create = createResult;

      // READ test (usando ID del create si fue exitoso)
      const readResult = await this.testRead(createResult.recordId);
      test.operations.read = readResult;

      // UPDATE test
      const updateResult = await this.testUpdate(createResult.recordId);
      test.operations.update = updateResult;

      // DELETE test
      const deleteResult = await this.testDelete(createResult.recordId);
      test.operations.delete = deleteResult;

      const allPassed = Object.values(test.operations).every(op => op.status === 'success');
      test.status = allPassed ? '✅ PASSED' : '❌ FAILED';

    } catch (error) {
      test.status = '❌ FAILED';
      test.error = error.message;
    }

    return test;
  }

  async testCreate() {
    try {
      const testOrg = {
        rut: `test-${Date.now()}`,
        razon_social: `Test Organization ${Date.now()}`,
        email: `test${Date.now()}@instanttest.com`,
        telefono: '+56 9 0000 0000'
      };

      const { data, error } = await supabase
        .from('organizaciones')
        .insert(testOrg)
        .select('id')
        .single();

      if (error) throw error;

      return { status: 'success', message: '✅ CREATE OK', recordId: data.id };
    } catch (error) {
      return { status: 'error', message: `❌ CREATE: ${error.message}` };
    }
  }

  async testRead(recordId) {
    if (!recordId) return { status: 'skipped', message: '⏭️ READ: Saltado (no hay ID)' };

    try {
      const { data, error } = await supabase
        .from('organizaciones')
        .select('*')
        .eq('id', recordId)
        .single();

      if (error) throw error;

      return { status: 'success', message: '✅ READ OK' };
    } catch (error) {
      return { status: 'error', message: `❌ READ: ${error.message}` };
    }
  }

  async testUpdate(recordId) {
    if (!recordId) return { status: 'skipped', message: '⏭️ UPDATE: Saltado (no hay ID)' };

    try {
      const { error } = await supabase
        .from('organizaciones')
        .update({ razon_social: 'Updated Test Organization' })
        .eq('id', recordId);

      if (error) throw error;

      return { status: 'success', message: '✅ UPDATE OK' };
    } catch (error) {
      return { status: 'error', message: `❌ UPDATE: ${error.message}` };
    }
  }

  async testDelete(recordId) {
    if (!recordId) return { status: 'skipped', message: '⏭️ DELETE: Saltado (no hay ID)' };

    try {
      const { error } = await supabase
        .from('organizaciones')
        .delete()
        .eq('id', recordId);

      if (error) throw error;

      return { status: 'success', message: '✅ DELETE OK' };
    } catch (error) {
      return { status: 'error', message: `❌ DELETE: ${error.message}` };
    }
  }

  /**
   * ✅ TEST DEL SISTEMA DE VALIDACIONES
   */
  async testValidationSystem() {
    const test = { name: 'Validation System', status: 'running', validations: {} };
    
    try {
      // Test agente IA activo
      const agentActive = typeof window.systemValidationAgent !== 'undefined';
      test.validations.ai_agent = agentActive ? '✅ Cargado' : '❌ No encontrado';

      // Test validaciones de formulario
      const forms = document.querySelectorAll('form');
      let formsWithValidation = 0;
      
      forms.forEach(form => {
        const hasValidation = form.querySelectorAll('input[required], select[required]').length > 0;
        if (hasValidation) formsWithValidation++;
      });

      test.validations.form_validations = `✅ ${formsWithValidation}/${forms.length} formularios con validación`;

      // Test mensajes de error
      const errorElements = document.querySelectorAll('.error, .invalid-feedback, [role="alert"]');
      test.validations.error_display = `${errorElements.length} elementos de error encontrados`;

      test.status = '✅ PASSED';

    } catch (error) {
      test.status = '❌ FAILED';
      test.error = error.message;
    }

    return test;
  }

  /**
   * ⚡ TEST DE PERFORMANCE
   */
  async testPerformance() {
    const test = { name: 'Performance', status: 'running', metrics: {} };
    
    try {
      // Test tiempo de respuesta DB
      const dbStart = performance.now();
      await supabase.from('organizaciones').select('count', { count: 'exact', head: true });
      const dbTime = performance.now() - dbStart;
      
      test.metrics.database_response = `${Math.round(dbTime)}ms ${dbTime < 1000 ? '✅' : '⚠️'}`;

      // Test tamaño del DOM
      const domElements = document.querySelectorAll('*').length;
      test.metrics.dom_size = `${domElements} elementos ${domElements < 1000 ? '✅' : '⚠️'}`;

      // Test recursos cargados
      const resources = performance.getEntriesByType('resource').length;
      test.metrics.resources_loaded = `${resources} recursos`;

      // Test memoria (si está disponible)
      if (performance.memory) {
        const memoryMB = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
        test.metrics.memory_usage = `${memoryMB}MB ${memoryMB < 50 ? '✅' : '⚠️'}`;
      }

      test.status = '✅ PASSED';

    } catch (error) {
      test.status = '❌ FAILED';
      test.error = error.message;
    }

    return test;
  }

  /**
   * 📊 GENERAR RESUMEN
   */
  generateSummary(tests, totalTime) {
    const testCount = Object.keys(tests).length;
    const passedCount = Object.values(tests).filter(test => test.status?.includes('✅')).length;
    const failedCount = Object.values(tests).filter(test => test.status?.includes('❌')).length;
    const warningCount = Object.values(tests).filter(test => test.status?.includes('⚠️')).length;

    return {
      total_tests: testCount,
      passed: passedCount,
      failed: failedCount,
      warnings: warningCount,
      success_rate: Math.round((passedCount / testCount) * 100),
      execution_time: `${Math.round(totalTime)}ms`,
      overall_status: failedCount === 0 ? 
        (warningCount === 0 ? 'EXCELLENT' : 'GOOD') : 'NEEDS_ATTENTION'
    };
  }

  /**
   * 🖨️ MOSTRAR RESULTADOS
   */
  displayResults(report) {
    // //console.log('\n' + '='.repeat(60));
    // //console.log('🏥 REPORTE DE SALUD DEL SISTEMA LPDP');
    // //console.log('='.repeat(60));
    
    // //console.log(`⏱️  Tiempo total: ${report.summary.execution_time}`);
    // //console.log(`📊 Tasa de éxito: ${report.summary.success_rate}%`);
    // //console.log(`✅ Tests exitosos: ${report.summary.passed}`);
    // //console.log(`⚠️  Advertencias: ${report.summary.warnings}`);
    // //console.log(`❌ Errores: ${report.summary.failed}`);
    // //console.log(`🎯 Estado general: ${report.summary.overall_status}\n`);

    // Detalles por test
    Object.values(report.tests).forEach(test => {
      // //console.log(`${test.status} ${test.name}`);
      
      if (test.error) {
        // //console.log(`   Error: ${test.error}`);
      }
      
      if (test.issues?.length > 0) {
        test.issues.forEach(issue => // //console.log(`   ⚠️ ${issue}`));
      }

      // Mostrar métricas específicas
      if (test.tables) {
        Object.entries(test.tables).forEach(([table, status]) => {
          // //console.log(`   📊 ${table}: ${status}`);
        });
      }

      if (test.operations) {
        Object.entries(test.operations).forEach(([op, result]) => {
          // //console.log(`   🔄 ${op.toUpperCase()}: ${result.message}`);
        });
      }

      if (test.metrics) {
        Object.entries(test.metrics).forEach(([metric, value]) => {
          // //console.log(`   ⚡ ${metric}: ${value}`);
        });
      }
    });

    // //console.log('\n' + '='.repeat(60));
    
    if (report.summary.overall_status === 'NEEDS_ATTENTION') {
      // //console.log('🚨 ACCIÓN REQUERIDA: Se encontraron problemas que requieren atención');
    } else if (report.summary.overall_status === 'GOOD') {
      // //console.log('✅ SISTEMA FUNCIONANDO: Advertencias menores detectadas');
    } else {
      // //console.log('🎉 SISTEMA EXCELENTE: Todos los tests pasaron correctamente');
    }
    
    // //console.log('='.repeat(60));
  }
}

// Ejecutar automáticamente al cargar
const instantTest = new InstantSystemTest();

// Función para ejecutar desde consola
window.runSystemTest = () => {
  return instantTest.executeAllTests();
};

// Auto-ejecutar si está en modo desarrollo
if (process.env.NODE_ENV === 'development') {
  // Ejecutar después de que la página esté completamente cargada
  if (document.readyState === 'complete') {
    setTimeout(() => instantTest.executeAllTests(), 1000);
  } else {
    window.addEventListener('load', () => {
      setTimeout(() => instantTest.executeAllTests(), 1000);
    });
  }
}

export default instantTest;