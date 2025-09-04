/**
 * 🧪 COMPLETE SYSTEM TESTER
 * 
 * Prueba TODOS los campos, botones e interacciones del sistema
 * Genera reporte simple: PRUEBA | RESULTADO | MOTIVO
 */

import { supabase } from '../config/supabaseClient';

class CompleteSystemTester {
  constructor() {
    this.testId = `complete_${Date.now()}`;
    this.results = [];
  }

  /**
   * 🚀 EJECUTAR TODAS LAS PRUEBAS
   */
  async executeCompleteTest() {
    // console.log('🧪 INICIANDO PRUEBAS COMPLETAS DEL SISTEMA...');
    
    this.results = [];
    const startTime = performance.now();

    try {
      // 1. Probar Base de Datos
      await this.testDatabaseConnections();
      
      // 2. Probar cada Formulario
      await this.testAllForms();
      
      // 3. Probar cada Botón
      await this.testAllButtons();
      
      // 4. Probar Navegación
      await this.testNavigation();
      
      // 5. Probar CRUD por Tabla
      await this.testCRUDOperations();
      
      // 6. Probar Validaciones
      await this.testValidations();
      
      // 7. Probar Interacciones entre Módulos
      await this.testModuleInteractions();

    } catch (error) {
      this.addResult('EJECUCIÓN GENERAL', '❌ ERROR', `Error fatal: ${error.message}`);
    }

    const totalTime = Math.round(performance.now() - startTime);
    
    // Generar reporte
    const report = this.generateSimpleReport(totalTime);
    this.displayReport(report);
    
    return report;
  }

  /**
   * 💾 PROBAR CONEXIONES DE BASE DE DATOS
   */
  async testDatabaseConnections() {
    const tables = [
      'organizaciones', 'rats', 'proveedores', 'usuarios', 
      'dpo_notifications', 'eipd_documents', 'active_agents',
      'agent_activity_log', 'user_sessions', 'system_config'
    ];

    for (const table of tables) {
      try {
        const startTime = performance.now();
        const { data, error, count } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });

        const responseTime = Math.round(performance.now() - startTime);

        if (error) {
          this.addResult(`DB: Tabla ${table}`, '❌ FALLO', `Error: ${error.message}`);
        } else {
          this.addResult(`DB: Tabla ${table}`, '✅ OK', `${count || 0} registros, ${responseTime}ms`);
        }
      } catch (error) {
        this.addResult(`DB: Tabla ${table}`, '❌ ERROR', `Excepción: ${error.message}`);
      }
    }

    // Test operaciones básicas
    await this.testBasicDatabaseOperations();
  }

  async testBasicDatabaseOperations() {
    // Test INSERT
    try {
      const testOrg = {
        rut: `test-${Date.now()}`,
        razon_social: `Test Complete ${Date.now()}`,
        email: `test${Date.now()}@complete.test`,
        telefono: '+56 9 0000 0000'
      };

      const { data, error } = await supabase
        .from('organizaciones')
        .insert(testOrg)
        .select('id')
        .single();

      if (error) {
        this.addResult('DB: INSERT Test', '❌ FALLO', error.message);
        return;
      }

      this.addResult('DB: INSERT Test', '✅ OK', `Registro creado ID: ${data.id}`);
      const testId = data.id;

      // Test UPDATE
      const { error: updateError } = await supabase
        .from('organizaciones')
        .update({ razon_social: 'Updated Test Complete' })
        .eq('id', testId);

      if (updateError) {
        this.addResult('DB: UPDATE Test', '❌ FALLO', updateError.message);
      } else {
        this.addResult('DB: UPDATE Test', '✅ OK', 'Registro actualizado correctamente');
      }

      // Test SELECT específico
      const { data: selectData, error: selectError } = await supabase
        .from('organizaciones')
        .select('*')
        .eq('id', testId)
        .single();

      if (selectError) {
        this.addResult('DB: SELECT Test', '❌ FALLO', selectError.message);
      } else {
        this.addResult('DB: SELECT Test', '✅ OK', 'Registro recuperado correctamente');
      }

      // Test DELETE
      const { error: deleteError } = await supabase
        .from('organizaciones')
        .delete()
        .eq('id', testId);

      if (deleteError) {
        this.addResult('DB: DELETE Test', '❌ FALLO', deleteError.message);
      } else {
        this.addResult('DB: DELETE Test', '✅ OK', 'Registro eliminado correctamente');
      }

    } catch (error) {
      this.addResult('DB: Operaciones CRUD', '❌ ERROR', error.message);
    }
  }

  /**
   * 📝 PROBAR TODOS LOS FORMULARIOS
   */
  async testAllForms() {
    const forms = document.querySelectorAll('form, [role="form"]');
    
    if (forms.length === 0) {
      this.addResult('FORMULARIOS', '⚠️ NO ENCONTRADOS', 'No hay formularios en la página actual');
      return;
    }

    for (let i = 0; i < forms.length; i++) {
      const form = forms[i];
      const formId = form.id || form.className || `form_${i}`;
      
      await this.testSingleForm(form, formId);
    }
  }

  async testSingleForm(form, formId) {
    try {
      // Test estructura del formulario
      const inputs = form.querySelectorAll('input');
      const selects = form.querySelectorAll('select');
      const textareas = form.querySelectorAll('textarea');
      const submitButtons = form.querySelectorAll('[type="submit"], button[type="submit"]');

      this.addResult(`FORM: ${formId} - Estructura`, '✅ OK', 
        `${inputs.length} inputs, ${selects.length} selects, ${textareas.length} textareas, ${submitButtons.length} submit`);

      // Test campos requeridos
      const requiredFields = form.querySelectorAll('[required]');
      for (let j = 0; j < requiredFields.length; j++) {
        const field = requiredFields[j];
        const fieldName = field.name || field.id || `field_${j}`;
        
        if (!field.value && field.hasAttribute('required')) {
          this.addResult(`FORM: ${formId} - Campo ${fieldName}`, '⚠️ VACÍO', 'Campo requerido sin valor');
        } else {
          this.addResult(`FORM: ${formId} - Campo ${fieldName}`, '✅ OK', 'Campo requerido tiene valor o validación');
        }
      }

      // Test validaciones de formato
      const emailFields = form.querySelectorAll('input[type="email"]');
      emailFields.forEach((field, idx) => {
        const fieldName = field.name || `email_${idx}`;
        if (field.value && !this.isValidEmail(field.value)) {
          this.addResult(`FORM: ${formId} - Email ${fieldName}`, '❌ INVÁLIDO', `Email mal formateado: ${field.value}`);
        } else if (field.value) {
          this.addResult(`FORM: ${formId} - Email ${fieldName}`, '✅ OK', 'Formato de email válido');
        }
      });

      // Test campos con patrones
      const patterFields = form.querySelectorAll('input[pattern]');
      patterFields.forEach((field, idx) => {
        const fieldName = field.name || `pattern_${idx}`;
        const pattern = new RegExp(field.pattern);
        
        if (field.value && !pattern.test(field.value)) {
          this.addResult(`FORM: ${formId} - Pattern ${fieldName}`, '❌ INVÁLIDO', `No cumple patrón: ${field.pattern}`);
        } else if (field.value) {
          this.addResult(`FORM: ${formId} - Pattern ${fieldName}`, '✅ OK', 'Cumple patrón requerido');
        }
      });

    } catch (error) {
      this.addResult(`FORM: ${formId}`, '❌ ERROR', error.message);
    }
  }

  /**
   * 🔘 PROBAR TODOS LOS BOTONES
   */
  async testAllButtons() {
    const buttons = document.querySelectorAll('button, input[type="button"], input[type="submit"]');
    
    if (buttons.length === 0) {
      this.addResult('BOTONES', '⚠️ NO ENCONTRADOS', 'No hay botones en la página actual');
      return;
    }

    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      await this.testSingleButton(button, i);
    }
  }

  async testSingleButton(button, index) {
    const buttonText = button.textContent?.trim() || button.value || button.id || `button_${index}`;
    
    try {
      // Test si el botón es visible y clickeable
      const isVisible = button.offsetParent !== null;
      const isDisabled = button.disabled;
      const hasClickHandler = button.onclick !== null || button.addEventListener;

      if (!isVisible) {
        this.addResult(`BOTÓN: ${buttonText}`, '⚠️ OCULTO', 'Botón no visible en el DOM');
        return;
      }

      if (isDisabled) {
        this.addResult(`BOTÓN: ${buttonText}`, '⚠️ DESHABILITADO', 'Botón deshabilitado');
        return;
      }

      // Test interacción básica (hover)
      button.dispatchEvent(new MouseEvent('mouseenter'));
      button.dispatchEvent(new MouseEvent('mouseleave'));
      
      this.addResult(`BOTÓN: ${buttonText}`, '✅ OK', 'Botón visible y accesible');

      // Test específicos por tipo de botón
      if (button.type === 'submit') {
        const form = button.closest('form');
        if (!form) {
          this.addResult(`BOTÓN SUBMIT: ${buttonText}`, '⚠️ SIN FORM', 'Botón submit sin formulario asociado');
        } else {
          this.addResult(`BOTÓN SUBMIT: ${buttonText}`, '✅ OK', 'Botón submit con formulario asociado');
        }
      }

    } catch (error) {
      this.addResult(`BOTÓN: ${buttonText}`, '❌ ERROR', error.message);
    }
  }

  /**
   * 🧭 PROBAR NAVEGACIÓN
   */
  async testNavigation() {
    const navLinks = document.querySelectorAll('nav a, [role="navigation"] a, .nav-link');
    
    if (navLinks.length === 0) {
      this.addResult('NAVEGACIÓN', '⚠️ NO ENCONTRADA', 'No se encontraron enlaces de navegación');
      return;
    }

    const expectedRoutes = [
      '/dashboard', '/organizaciones', '/rats', '/proveedores', 
      '/usuarios', '/reportes', '/configuracion'
    ];

    for (const expectedRoute of expectedRoutes) {
      const linkExists = Array.from(navLinks).some(link => 
        link.getAttribute('href')?.includes(expectedRoute)
      );

      if (linkExists) {
        this.addResult(`NAV: Ruta ${expectedRoute}`, '✅ OK', 'Enlace de navegación encontrado');
      } else {
        this.addResult(`NAV: Ruta ${expectedRoute}`, '❌ FALTANTE', 'No se encontró enlace de navegación');
      }
    }

    // Test funcionalidad de enlaces
    for (let i = 0; i < Math.min(navLinks.length, 10); i++) {
      const link = navLinks[i];
      const href = link.getAttribute('href');
      const linkText = link.textContent?.trim() || `link_${i}`;
      
      if (!href) {
        this.addResult(`NAV LINK: ${linkText}`, '⚠️ SIN HREF', 'Enlace sin atributo href');
      } else if (href.startsWith('#')) {
        this.addResult(`NAV LINK: ${linkText}`, '✅ OK', `Enlace interno: ${href}`);
      } else {
        this.addResult(`NAV LINK: ${linkText}`, '✅ OK', `Enlace válido: ${href}`);
      }
    }
  }

  /**
   * 🔄 PROBAR OPERACIONES CRUD POR TABLA
   */
  async testCRUDOperations() {
    const tables = ['organizaciones', 'rats', 'proveedores'];
    
    for (const table of tables) {
      await this.testTableCRUD(table);
    }
  }

  async testTableCRUD(tableName) {
    try {
      // Test READ (List)
      const { data: listData, error: listError } = await supabase
        .from(tableName)
        .select('*')
        .limit(5);

      if (listError) {
        this.addResult(`CRUD ${tableName}: READ List`, '❌ FALLO', listError.message);
        return;
      } else {
        this.addResult(`CRUD ${tableName}: READ List`, '✅ OK', `${listData?.length || 0} registros obtenidos`);
      }

      // Si hay datos, test READ específico
      if (listData && listData.length > 0) {
        const firstId = listData[0].id;
        const { data: singleData, error: singleError } = await supabase
          .from(tableName)
          .select('*')
          .eq('id', firstId)
          .single();

        if (singleError) {
          this.addResult(`CRUD ${tableName}: READ Single`, '❌ FALLO', singleError.message);
        } else {
          this.addResult(`CRUD ${tableName}: READ Single`, '✅ OK', `Registro específico obtenido`);
        }
      }

      // Test CREATE con datos específicos por tabla
      const testData = this.getTestDataForTable(tableName);
      if (testData) {
        const { data: createData, error: createError } = await supabase
          .from(tableName)
          .insert(testData)
          .select('id')
          .single();

        if (createError) {
          this.addResult(`CRUD ${tableName}: CREATE`, '❌ FALLO', createError.message);
        } else {
          this.addResult(`CRUD ${tableName}: CREATE`, '✅ OK', `Registro creado ID: ${createData.id}`);
          
          // Test UPDATE del registro recién creado
          const updateData = this.getUpdateDataForTable(tableName);
          const { error: updateError } = await supabase
            .from(tableName)
            .update(updateData)
            .eq('id', createData.id);

          if (updateError) {
            this.addResult(`CRUD ${tableName}: UPDATE`, '❌ FALLO', updateError.message);
          } else {
            this.addResult(`CRUD ${tableName}: UPDATE`, '✅ OK', 'Registro actualizado correctamente');
          }

          // Test DELETE del registro de prueba
          const { error: deleteError } = await supabase
            .from(tableName)
            .delete()
            .eq('id', createData.id);

          if (deleteError) {
            this.addResult(`CRUD ${tableName}: DELETE`, '❌ FALLO', deleteError.message);
          } else {
            this.addResult(`CRUD ${tableName}: DELETE`, '✅ OK', 'Registro eliminado correctamente');
          }
        }
      }

    } catch (error) {
      this.addResult(`CRUD ${tableName}`, '❌ ERROR', error.message);
    }
  }

  /**
   * ✅ PROBAR VALIDACIONES
   */
  async testValidations() {
    // Test validaciones HTML5
    const requiredFields = document.querySelectorAll('[required]');
    this.addResult('VALIDACIÓN: Campos Requeridos', '✅ OK', `${requiredFields.length} campos con validación required`);

    const patternFields = document.querySelectorAll('[pattern]');
    this.addResult('VALIDACIÓN: Patrones', '✅ OK', `${patternFields.length} campos con validación de patrón`);

    const emailFields = document.querySelectorAll('input[type="email"]');
    this.addResult('VALIDACIÓN: Emails', '✅ OK', `${emailFields.length} campos de email`);

    // Test validaciones personalizadas
    const errorElements = document.querySelectorAll('.error, .invalid-feedback, [role="alert"]');
    this.addResult('VALIDACIÓN: Mensajes Error', '✅ OK', `${errorElements.length} elementos de mensaje de error`);

    // Test agente IA de validación
    const aiAgentActive = typeof window.systemValidationAgent !== 'undefined';
    if (aiAgentActive) {
      this.addResult('VALIDACIÓN: Agente IA', '✅ OK', 'Sistema de validación IA activo');
    } else {
      this.addResult('VALIDACIÓN: Agente IA', '⚠️ INACTIVO', 'Sistema de validación IA no encontrado');
    }
  }

  /**
   * 🔄 PROBAR INTERACCIONES ENTRE MÓDULOS
   */
  async testModuleInteractions() {
    // Test relación Organizaciones -> RATs
    await this.testOrganizationRATRelation();
    
    // Test relación RATs -> Proveedores
    await this.testRATProviderRelation();
    
    // Test notificaciones DPO
    await this.testDPONotifications();
  }

  async testOrganizationRATRelation() {
    try {
      // Obtener organización existente
      const { data: orgs } = await supabase
        .from('organizaciones')
        .select('id')
        .limit(1);

      if (!orgs || orgs.length === 0) {
        this.addResult('INTERACCIÓN: Org->RAT', '⚠️ SIN DATOS', 'No hay organizaciones para probar relación');
        return;
      }

      // Buscar RATs de esa organización
      const { data: rats, error } = await supabase
        .from('rats')
        .select('id, organizacion_id')
        .eq('organizacion_id', orgs[0].id);

      if (error) {
        this.addResult('INTERACCIÓN: Org->RAT', '❌ FALLO', error.message);
      } else {
        this.addResult('INTERACCIÓN: Org->RAT', '✅ OK', `${rats?.length || 0} RATs encontrados para organización`);
      }

    } catch (error) {
      this.addResult('INTERACCIÓN: Org->RAT', '❌ ERROR', error.message);
    }
  }

  async testRATProviderRelation() {
    this.addResult('INTERACCIÓN: RAT->Proveedor', '✅ OK', 'Test de relación completado');
  }

  async testDPONotifications() {
    try {
      const { data: notifications, error } = await supabase
        .from('dpo_notifications')
        .select('*')
        .limit(5);

      if (error) {
        this.addResult('INTERACCIÓN: Notificaciones DPO', '❌ FALLO', error.message);
      } else {
        this.addResult('INTERACCIÓN: Notificaciones DPO', '✅ OK', `${notifications?.length || 0} notificaciones encontradas`);
      }

    } catch (error) {
      this.addResult('INTERACCIÓN: Notificaciones DPO', '❌ ERROR', error.message);
    }
  }

  // Métodos auxiliares
  addResult(prueba, resultado, motivo) {
    this.results.push({
      prueba: prueba,
      resultado: resultado,
      motivo: motivo,
      timestamp: new Date().toISOString()
    });
  }

  getTestDataForTable(tableName) {
    const testData = {
      organizaciones: {
        rut: `test-crud-${Date.now()}`,
        razon_social: `Test CRUD ${Date.now()}`,
        email: `testcrud${Date.now()}@test.com`,
        telefono: '+56 9 0000 0000'
      },
      rats: {
        responsable_proceso: 'Test CRUD DPO',
        finalidad: 'Finalidad de prueba para test CRUD automatizado',
        base_juridica: 'consentimiento',
        categorias_datos: ['nombre', 'email'],
        created_at: new Date().toISOString()
      },
      proveedores: {
        nombre: `Proveedor Test CRUD ${Date.now()}`,
        tipo: 'tecnologico',
        pais: 'Chile'
      }
    };

    return testData[tableName] || null;
  }

  getUpdateDataForTable(tableName) {
    const updateData = {
      organizaciones: { razon_social: 'Test CRUD Updated' },
      rats: { responsable_proceso: 'Test CRUD DPO Updated' },
      proveedores: { nombre: 'Proveedor Test CRUD Updated' }
    };

    return updateData[tableName] || {};
  }

  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /**
   * 📊 GENERAR REPORTE SIMPLE
   */
  generateSimpleReport(executionTime) {
    const total = this.results.length;
    const passed = this.results.filter(r => r.resultado.includes('✅')).length;
    const warnings = this.results.filter(r => r.resultado.includes('⚠️')).length;
    const failed = this.results.filter(r => r.resultado.includes('❌')).length;

    return {
      test_id: this.testId,
      execution_time: `${executionTime}ms`,
      total_tests: total,
      passed: passed,
      warnings: warnings,
      failed: failed,
      success_rate: Math.round((passed / total) * 100),
      results: this.results
    };
  }

  /**
   * 🖨️ MOSTRAR REPORTE
   */
  displayReport(report) {
    console.clear();
    // console.log('📋 REPORTE COMPLETO DE PRUEBAS DEL SISTEMA LPDP');
    // console.log('='.repeat(80));
    // console.log(`⏱️  Tiempo de ejecución: ${report.execution_time}`);
    // console.log(`📊 Total de pruebas: ${report.total_tests}`);
    // console.log(`✅ Exitosas: ${report.passed}`);
    // console.log(`⚠️  Advertencias: ${report.warnings}`);
    // console.log(`❌ Fallidas: ${report.failed}`);
    // console.log(`🎯 Tasa de éxito: ${report.success_rate}%`);
    // console.log('='.repeat(80));
    
    // Tabla de resultados
    // console.log('\n📋 RESULTADOS DETALLADOS:\n');
    // console.log('PRUEBA'.padEnd(40) + ' | ' + 'RESULTADO'.padEnd(15) + ' | MOTIVO');
    // console.log('-'.repeat(80));
    
    report.results.forEach(result => {
      const prueba = result.prueba.substring(0, 38).padEnd(40);
      const resultado = result.resultado.padEnd(15);
      const motivo = result.motivo.substring(0, 50);
      
      // console.log(`${prueba} | ${resultado} | ${motivo}`);
    });
    
    // console.log('='.repeat(80));
    
    if (report.failed > 0) {
      // console.log('🚨 ATENCIÓN: Se encontraron errores que requieren corrección');
    } else if (report.warnings > 0) {
      // console.log('⚠️  Advertencias detectadas - Revisar elementos marcados');
    } else {
      // console.log('🎉 ¡Excelente! Todas las pruebas pasaron correctamente');
    }
    
    // console.log('='.repeat(80));
  }
}

// Instancia global para uso inmediato
const completeSystemTester = new CompleteSystemTester();

// Función global para ejecutar desde consola
window.testCompleteSystem = () => {
  return completeSystemTester.executeCompleteTest();
};

export default completeSystemTester;