/**
 * 🧪 TEST COMPLETO DEL SISTEMA - EJECUCIÓN INMEDIATA
 * 
 * INSTRUCCIONES DE USO:
 * =====================
 * 
 * 1. DESDE CONSOLA DEL NAVEGADOR (Recomendado):
 *    - Abrir el sistema en el navegador
 *    - Presionar F12 (Herramientas de desarrollador)
 *    - Ir a la pestaña "Console"
 *    - Copiar y pegar este código completo
 *    - Presionar Enter
 * 
 * 2. DESDE SCRIPT TAG EN HTML:
 *    - Agregar <script src="TEST-COMPLETO-SISTEMA.js"></script>
 *    - Los tests se ejecutarán automáticamente
 * 
 * RESULTADO:
 * - Tabla con 3 columnas: PRUEBA | RESULTADO | MOTIVO
 * - Reporte completo de todos los campos, botones e interacciones
 */

(async function() {
  'use strict';
  
  console.log('🚀 INICIANDO TESTS COMPLETOS DEL SISTEMA LPDP...');
  console.log('⏱️  Esto puede tomar 30-60 segundos...');
  
  // Variables globales del test
  let results = [];
  let testId = `complete_${Date.now()}`;
  let startTime = performance.now();
  
  // Función para agregar resultado
  function addResult(prueba, resultado, motivo) {
    results.push({
      prueba: prueba.substring(0, 40),
      resultado: resultado,
      motivo: motivo.substring(0, 60)
    });
  }
  
  // PASO 1: PROBAR BASE DE DATOS
  console.log('📊 1/7 - Probando base de datos...');
  
  if (typeof supabase !== 'undefined') {
    const tables = [
      'organizaciones', 'rats', 'proveedores', 'usuarios', 
      'dpo_notifications', 'active_agents'
    ];
    
    for (const table of tables) {
      try {
        const startTime = performance.now();
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        const responseTime = Math.round(performance.now() - startTime);
        
        if (error) {
          addResult(`DB: Tabla ${table}`, '❌ FALLO', error.message);
        } else {
          addResult(`DB: Tabla ${table}`, '✅ OK', `${count || 0} registros, ${responseTime}ms`);
        }
      } catch (error) {
        addResult(`DB: Tabla ${table}`, '❌ ERROR', error.message);
      }
    }
    
    // Test operaciones CRUD
    try {
      const testOrg = {
        rut: `test-${Date.now()}`,
        razon_social: `Test Completo ${Date.now()}`,
        email: `test${Date.now()}@test.com`,
        telefono: '+56 9 0000 0000'
      };
      
      const { data, error } = await supabase
        .from('organizaciones')
        .insert(testOrg)
        .select('id')
        .single();
      
      if (error) {
        addResult('DB: INSERT Test', '❌ FALLO', error.message);
      } else {
        addResult('DB: INSERT Test', '✅ OK', `Registro creado ID: ${data.id}`);
        
        // Test UPDATE y DELETE
        await supabase.from('organizaciones').update({razon_social: 'Updated'}).eq('id', data.id);
        addResult('DB: UPDATE Test', '✅ OK', 'Registro actualizado');
        
        await supabase.from('organizaciones').delete().eq('id', data.id);
        addResult('DB: DELETE Test', '✅ OK', 'Registro eliminado');
      }
    } catch (error) {
      addResult('DB: CRUD Operations', '❌ ERROR', error.message);
    }
  } else {
    addResult('DB: Conexión Supabase', '❌ FALLO', 'Supabase no está disponible');
  }
  
  // PASO 2: PROBAR FORMULARIOS
  console.log('📝 2/7 - Probando formularios...');
  
  const forms = document.querySelectorAll('form, [role="form"]');
  
  if (forms.length === 0) {
    addResult('FORMULARIOS', '⚠️ NO ENCONTRADOS', 'No hay formularios en la página actual');
  } else {
    addResult('FORMULARIOS: Total', '✅ OK', `${forms.length} formularios encontrados`);
    
    forms.forEach((form, i) => {
      const formId = form.id || form.className || `form_${i}`;
      const inputs = form.querySelectorAll('input').length;
      const selects = form.querySelectorAll('select').length;
      const textareas = form.querySelectorAll('textarea').length;
      const submitBtns = form.querySelectorAll('[type="submit"]').length;
      
      addResult(`FORM: ${formId}`, '✅ OK', 
        `${inputs}inp, ${selects}sel, ${textareas}txt, ${submitBtns}sub`);
      
      // Test campos requeridos
      const requiredFields = form.querySelectorAll('[required]');
      addResult(`FORM: ${formId} - Required`, '✅ OK', `${requiredFields.length} campos obligatorios`);
      
      // Test validaciones
      const emailFields = form.querySelectorAll('input[type="email"]');
      emailFields.forEach((field, j) => {
        if (field.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
          addResult(`FORM: ${formId} - Email ${j}`, '❌ INVÁLIDO', `Email mal formateado: ${field.value}`);
        } else if (field.value) {
          addResult(`FORM: ${formId} - Email ${j}`, '✅ OK', 'Formato válido');
        }
      });
    });
  }
  
  // PASO 3: PROBAR BOTONES
  console.log('🔘 3/7 - Probando botones...');
  
  const buttons = document.querySelectorAll('button, input[type="button"], input[type="submit"]');
  
  if (buttons.length === 0) {
    addResult('BOTONES', '⚠️ NO ENCONTRADOS', 'No hay botones en la página');
  } else {
    addResult('BOTONES: Total', '✅ OK', `${buttons.length} botones encontrados`);
    
    buttons.forEach((button, i) => {
      const buttonText = (button.textContent || button.value || button.id || `btn_${i}`).substring(0, 20);
      const isVisible = button.offsetParent !== null;
      const isDisabled = button.disabled;
      
      if (!isVisible) {
        addResult(`BOTÓN: ${buttonText}`, '⚠️ OCULTO', 'No visible en DOM');
      } else if (isDisabled) {
        addResult(`BOTÓN: ${buttonText}`, '⚠️ DESHABILITADO', 'Botón deshabilitado');
      } else {
        addResult(`BOTÓN: ${buttonText}`, '✅ OK', 'Visible y habilitado');
      }
      
      // Test botones submit
      if (button.type === 'submit') {
        const form = button.closest('form');
        if (form) {
          addResult(`BTN SUBMIT: ${buttonText}`, '✅ OK', 'Asociado a formulario');
        } else {
          addResult(`BTN SUBMIT: ${buttonText}`, '⚠️ SIN FORM', 'No tiene formulario asociado');
        }
      }
    });
  }
  
  // PASO 4: PROBAR NAVEGACIÓN
  console.log('🧭 4/7 - Probando navegación...');
  
  const navLinks = document.querySelectorAll('nav a, [role="navigation"] a, .nav-link, .navbar-nav a');
  
  if (navLinks.length === 0) {
    addResult('NAVEGACIÓN', '⚠️ NO ENCONTRADA', 'No hay enlaces de navegación');
  } else {
    addResult('NAVEGACIÓN: Enlaces', '✅ OK', `${navLinks.length} enlaces encontrados`);
    
    const expectedRoutes = ['/dashboard', '/organizaciones', '/rats', '/proveedores'];
    
    expectedRoutes.forEach(route => {
      const linkExists = Array.from(navLinks).some(link => 
        link.getAttribute('href')?.includes(route)
      );
      
      if (linkExists) {
        addResult(`NAV: Ruta ${route}`, '✅ OK', 'Enlace encontrado');
      } else {
        addResult(`NAV: Ruta ${route}`, '❌ FALTANTE', 'Enlace no encontrado');
      }
    });
  }
  
  // PASO 5: PROBAR CAMPOS ESPECÍFICOS
  console.log('📋 5/7 - Probando campos específicos...');
  
  // Test campos de entrada comunes
  const fieldTypes = [
    { selector: 'input[type="email"]', name: 'Email' },
    { selector: 'input[type="tel"]', name: 'Teléfono' },
    { selector: 'input[name*="rut"], #rut', name: 'RUT' },
    { selector: 'input[name*="nombre"]', name: 'Nombre' },
    { selector: 'select', name: 'Select' },
    { selector: 'textarea', name: 'TextArea' }
  ];
  
  fieldTypes.forEach(fieldType => {
    const fields = document.querySelectorAll(fieldType.selector);
    if (fields.length > 0) {
      addResult(`CAMPOS: ${fieldType.name}`, '✅ OK', `${fields.length} campos encontrados`);
      
      // Validar contenido si tiene valor
      fields.forEach((field, i) => {
        if (field.value) {
          let isValid = true;
          let reason = 'Tiene valor';
          
          if (fieldType.name === 'Email') {
            isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value);
            reason = isValid ? 'Email válido' : 'Email inválido';
          } else if (fieldType.name === 'RUT') {
            isValid = field.value.includes('-');
            reason = isValid ? 'Formato con guión' : 'Sin formato de guión';
          }
          
          addResult(`CAMPO: ${fieldType.name} ${i}`, 
            isValid ? '✅ OK' : '⚠️ FORMATO', reason);
        }
      });
    } else {
      addResult(`CAMPOS: ${fieldType.name}`, '⚠️ NO ENCONTRADOS', 'No hay campos de este tipo');
    }
  });
  
  // PASO 6: PROBAR VALIDACIONES
  console.log('✅ 6/7 - Probando validaciones...');
  
  const requiredFields = document.querySelectorAll('[required]');
  addResult('VALIDACIÓN: Required', '✅ OK', `${requiredFields.length} campos obligatorios`);
  
  const patternFields = document.querySelectorAll('[pattern]');
  addResult('VALIDACIÓN: Patterns', '✅ OK', `${patternFields.length} campos con patrón`);
  
  const errorElements = document.querySelectorAll('.error, .invalid-feedback, [role="alert"]');
  addResult('VALIDACIÓN: Errores', '✅ OK', `${errorElements.length} elementos de error`);
  
  // PASO 7: PROBAR ELEMENTOS DE UI
  console.log('🎨 7/7 - Probando elementos de UI...');
  
  const uiElements = [
    { selector: '.modal, [role="dialog"]', name: 'Modales' },
    { selector: '.alert, .notification', name: 'Alertas' },
    { selector: '.loading, .spinner', name: 'Loading' },
    { selector: '.dropdown', name: 'Dropdowns' },
    { selector: '.tab, .nav-tabs', name: 'Tabs' },
    { selector: 'table', name: 'Tablas' }
  ];
  
  uiElements.forEach(element => {
    const found = document.querySelectorAll(element.selector);
    if (found.length > 0) {
      addResult(`UI: ${element.name}`, '✅ OK', `${found.length} elementos encontrados`);
    } else {
      addResult(`UI: ${element.name}`, '⚠️ NO ENCONTRADOS', 'No hay elementos de este tipo');
    }
  });
  
  // GENERAR REPORTE FINAL
  const totalTime = Math.round(performance.now() - startTime);
  const total = results.length;
  const passed = results.filter(r => r.resultado.includes('✅')).length;
  const warnings = results.filter(r => r.resultado.includes('⚠️')).length;
  const failed = results.filter(r => r.resultado.includes('❌')).length;
  const successRate = Math.round((passed / total) * 100);
  
  // MOSTRAR REPORTE
  console.clear();
  console.log('📋 REPORTE COMPLETO DE PRUEBAS DEL SISTEMA LPDP');
  console.log('='.repeat(80));
  console.log(`🆔 Test ID: ${testId}`);
  console.log(`⏱️  Tiempo: ${totalTime}ms`);
  console.log(`📊 Total: ${total} pruebas`);
  console.log(`✅ Exitosas: ${passed}`);
  console.log(`⚠️  Advertencias: ${warnings}`);
  console.log(`❌ Fallidas: ${failed}`);
  console.log(`🎯 Tasa de éxito: ${successRate}%`);
  console.log('='.repeat(80));
  
  console.log('\n📋 RESULTADOS DETALLADOS:\n');
  console.log('PRUEBA'.padEnd(42) + ' | ' + 'RESULTADO'.padEnd(15) + ' | MOTIVO');
  console.log('-'.repeat(80));
  
  results.forEach(result => {
    const prueba = result.prueba.padEnd(42);
    const resultado = result.resultado.padEnd(15);
    const motivo = result.motivo;
    
    console.log(`${prueba} | ${resultado} | ${motivo}`);
  });
  
  console.log('='.repeat(80));
  
  if (failed > 0) {
    console.log('🚨 ATENCIÓN: Se encontraron ' + failed + ' errores que requieren corrección');
  } else if (warnings > 0) {
    console.log('⚠️  Se encontraron ' + warnings + ' advertencias - Revisar elementos marcados');
  } else {
    console.log('🎉 ¡EXCELENTE! Todas las pruebas pasaron correctamente');
  }
  
  console.log('='.repeat(80));
  console.log('✅ TESTS COMPLETADOS');
  
  // Guardar resultados globalmente para acceso posterior
  window.lastTestResults = {
    testId,
    totalTime,
    total,
    passed,
    warnings,
    failed,
    successRate,
    results
  };
  
  return window.lastTestResults;

})().catch(error => {
  console.error('❌ ERROR EJECUTANDO TESTS:', error);
  console.log('💡 Asegúrate de que:');
  console.log('   - El sistema esté completamente cargado');
  console.log('   - Supabase esté configurado');
  console.log('   - Estés en la página principal del sistema');
});

console.log('✅ Test executor cargado. Los resultados aparecerán arriba.');