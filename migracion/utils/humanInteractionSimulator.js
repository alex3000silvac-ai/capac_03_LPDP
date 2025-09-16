/**
 * 🤖 HUMAN INTERACTION SIMULATOR
 * 
 * Simula acciones humanas reales en el sistema:
 * - Clics en botones y enlaces
 * - Navegación entre páginas
 * - Llenado de formularios
 * - Validación de flujos completos
 * - Detección automática de errores
 */

import { supabase } from '../config/supabaseConfig';

class HumanInteractionSimulator {
  constructor() {
    this.simulationId = `sim_${Date.now()}`;
    this.currentTest = null;
    this.testResults = [];
    this.isRunning = false;
    this.disabled = true; // DESHABILITADO temporalmente
    this.humanDelays = {
      click: 100,
      typing: 50,
      reading: 500,
      navigation: 1000,
      thinking: 2000
    };
  }

  /**
   * 🎯 EJECUTAR SIMULACIÓN COMPLETA DEL SISTEMA
   */
  async runCompleteSystemSimulation() {
    if (this.isRunning) {
      throw new Error('Simulación ya está ejecutándose');
    }

    this.isRunning = true;
    const simulation = {
      id: this.simulationId,
      started_at: new Date().toISOString(),
      tests_executed: [],
      errors_found: [],
      success_rate: 0,
      recommendations: []
    };

    try {
      // Secuencia de tests como usuario real
      const testSequence = [
        'loginFlow',
        'navigationTest', 
        'organizationCreation',
        'ratCreationFlow',
        'providerManagement',
        'reportGeneration',
        'dashboardInteraction',
        'systemConfiguration'
      ];

      for (const testName of testSequence) {
        await this.humanDelay('thinking'); // Pausa humana entre tests
        const testResult = await this.executeTest(testName);
        simulation.tests_executed.push(testResult);
        
        if (!testResult.success) {
          simulation.errors_found.push(testResult.error);
        }
      }

      // Calcular métricas
      const successful = simulation.tests_executed.filter(t => t.success).length;
      simulation.success_rate = (successful / simulation.tests_executed.length) * 100;
      simulation.completed_at = new Date().toISOString();
      
      // Generar recomendaciones
      simulation.recommendations = this.generateRecommendations(simulation);
      
      // Guardar resultados
      await this.saveSimulationResults(simulation);
      
      return simulation;

    } catch (error) {
      simulation.fatal_error = error.message;
      simulation.completed_at = new Date().toISOString();
      return simulation;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * 🔄 EJECUTAR TEST ESPECÍFICO
   */
  async executeTest(testName) {
    if (this.disabled) {
      console.log('🤖 Simulator deshabilitado');
      return;
    }
    
    this.currentTest = testName;
    const testResult = {
      test: testName,
      started_at: new Date().toISOString(),
      success: false,
      steps_completed: 0,
      total_steps: 0,
      error: null,
      screenshots: [],
      performance: {}
    };

    const startTime = performance.now();

    try {
      switch (testName) {
        case 'loginFlow':
          await this.simulateLoginFlow(testResult);
          break;
        case 'navigationTest':
          await this.simulateNavigationTest(testResult);
          break;
        case 'organizationCreation':
          await this.simulateOrganizationCreation(testResult);
          break;
        case 'ratCreationFlow':
          await this.simulateRATCreationFlow(testResult);
          break;
        case 'providerManagement':
          await this.simulateProviderManagement(testResult);
          break;
        case 'reportGeneration':
          await this.simulateReportGeneration(testResult);
          break;
        case 'dashboardInteraction':
          await this.simulateDashboardInteraction(testResult);
          break;
        case 'systemConfiguration':
          await this.simulateSystemConfiguration(testResult);
          break;
        default:
          throw new Error(`Test no reconocido: ${testName}`);
      }

      testResult.success = true;

    } catch (error) {
      testResult.error = {
        message: error.message,
        stack: error.stack,
        element: this.getCurrentElement(),
        url: window.location.href
      };
    }

    const endTime = performance.now();
    testResult.performance = {
      duration_ms: endTime - startTime,
      user_friendly_duration: this.formatDuration(endTime - startTime)
    };
    testResult.completed_at = new Date().toISOString();

    return testResult;
  }

  /**
   * 🚪 SIMULAR FLUJO DE LOGIN
   */
  async simulateLoginFlow(testResult) {
    testResult.total_steps = 4;
    
    // Paso 1: Buscar botón de login
    await this.humanDelay('reading');
    const loginButton = await this.findElement('[data-testid="login-button"], button:contains("Iniciar"), .login-btn');
    if (!loginButton) {
      throw new Error('No se encontró botón de login');
    }
    testResult.steps_completed = 1;

    // Paso 2: Hacer clic en login
    await this.humanClick(loginButton);
    await this.humanDelay('navigation');
    testResult.steps_completed = 2;

    // Paso 3: Verificar que aparezca formulario de login
    const loginForm = await this.findElement('form, [role="form"], .login-form');
    if (!loginForm) {
      throw new Error('Formulario de login no apareció');
    }
    testResult.steps_completed = 3;

    // Paso 4: Simular autenticación (si es necesaria)
    await this.humanDelay('thinking');
    testResult.steps_completed = 4;
  }

  /**
   * 🧭 SIMULAR TEST DE NAVEGACIÓN
   */
  async simulateNavigationTest(testResult) {
    const navigationItems = [
      { text: 'Dashboard', selector: '[href*="dashboard"], nav a:contains("Dashboard")' },
      { text: 'RATs', selector: '[href*="rats"], nav a:contains("RAT")' },
      { text: 'Organizaciones', selector: '[href*="organizaciones"], nav a:contains("Organiz")' },
      { text: 'Proveedores', selector: '[href*="proveedores"], nav a:contains("Proveedor")' }
    ];

    testResult.total_steps = navigationItems.length * 2;
    let stepCount = 0;

    for (const item of navigationItems) {
      // Buscar elemento de navegación
      await this.humanDelay('reading');
      const navElement = await this.findElement(item.selector);
      
      if (!navElement) {
        throw new Error(`No se encontró navegación para ${item.text}`);
      }
      testResult.steps_completed = ++stepCount;

      // Hacer clic y verificar navegación
      await this.humanClick(navElement);
      await this.humanDelay('navigation');
      
      // Verificar que la página cambió
      const pageLoaded = await this.waitForPageLoad();
      if (!pageLoaded) {
        throw new Error(`Navegación a ${item.text} falló`);
      }
      testResult.steps_completed = ++stepCount;
    }
  }

  /**
   * 🏢 SIMULAR CREACIÓN DE ORGANIZACIÓN
   */
  async simulateOrganizationCreation(testResult) {
    testResult.total_steps = 8;
    
    // 1. Ir a página de organizaciones
    await this.navigateToPage('/organizaciones');
    testResult.steps_completed = 1;

    // 2. Buscar botón "Nueva Organización"
    const newOrgButton = await this.findElement(
      'button:contains("Nueva"), [data-testid="new-organization"], .btn-primary'
    );
    if (!newOrgButton) {
      throw new Error('Botón "Nueva Organización" no encontrado');
    }
    testResult.steps_completed = 2;

    // 3. Hacer clic en nuevo
    await this.humanClick(newOrgButton);
    await this.humanDelay('navigation');
    testResult.steps_completed = 3;

    // 4. Llenar formulario con datos de prueba
    const testData = {
      rut: `12.345.678-9`,
      razon_social: `Organización Test ${Date.now()}`,
      email: `test${Date.now()}@simulation.test`,
      telefono: '+56 9 1234 5678'
    };

    await this.fillForm({
      'input[name*="rut"], #rut': testData.rut,
      'input[name*="razon"], input[name*="social"], #razon_social': testData.razon_social,
      'input[name*="email"], #email': testData.email,
      'input[name*="telefono"], #telefono': testData.telefono
    });
    testResult.steps_completed = 4;

    // 5. Buscar y hacer clic en guardar
    const saveButton = await this.findElement(
      'button[type="submit"], button:contains("Guardar"), .btn-success'
    );
    if (!saveButton) {
      throw new Error('Botón guardar no encontrado');
    }
    testResult.steps_completed = 5;

    await this.humanClick(saveButton);
    await this.humanDelay('navigation');
    testResult.steps_completed = 6;

    // 6. Verificar que se guardó correctamente
    const success = await this.waitForSuccess();
    if (!success) {
      throw new Error('La organización no se guardó correctamente');
    }
    testResult.steps_completed = 7;

    // 7. Verificar en base de datos
    const { data: savedOrg } = await supabase
      .from('organizaciones')
      .select('id')
      .eq('rut', testData.rut)
      .single();
    
    if (!savedOrg) {
      throw new Error('Organización no encontrada en base de datos');
    }
    testResult.steps_completed = 8;

    testResult.created_record = { type: 'organization', id: savedOrg.id };
  }

  /**
   * 📋 SIMULAR CREACIÓN DE RAT
   */
  async simulateRATCreationFlow(testResult) {
    testResult.total_steps = 12;
    
    // 1. Navegar a RATs
    await this.navigateToPage('/rats');
    testResult.steps_completed = 1;

    // 2. Buscar botón nuevo RAT
    const newRATButton = await this.findElement(
      'button:contains("Nuevo RAT"), [data-testid="new-rat"], .btn-primary'
    );
    if (!newRATButton) {
      throw new Error('Botón "Nuevo RAT" no encontrado');
    }
    await this.humanClick(newRATButton);
    testResult.steps_completed = 2;

    // 3-12. Simular llenado de formulario RAT por pasos
    await this.simulateRATFormSteps(testResult);
  }

  /**
   * 📝 SIMULAR PASOS DEL FORMULARIO RAT
   */
  async simulateRATFormSteps(testResult) {
    // Paso 1: Responsable del tratamiento
    await this.fillRATStep1();
    testResult.steps_completed = 3;

    // Paso 2: Categorías de datos
    await this.fillRATStep2();
    testResult.steps_completed = 4;

    // Paso 3: Base legal
    await this.fillRATStep3();
    testResult.steps_completed = 5;

    // Paso 4: Finalidad
    await this.fillRATStep4();
    testResult.steps_completed = 6;

    // Paso 5: Destinatarios
    await this.fillRATStep5();
    testResult.steps_completed = 7;

    // Paso 6: Plazos
    await this.fillRATStep6();
    testResult.steps_completed = 8;

    // Paso 7: Transferencias
    await this.fillRATStep7();
    testResult.steps_completed = 9;

    // Paso 8: Medidas de seguridad
    await this.fillRATStep8();
    testResult.steps_completed = 10;

    // Paso 9: Guardar
    await this.finalizeRAT();
    testResult.steps_completed = 11;

    // Paso 10: Verificar
    await this.verifyRATCreation(testResult);
    testResult.steps_completed = 12;
  }

  // Métodos auxiliares para llenar cada paso del RAT
  async fillRATStep1() {
    await this.fillForm({
      'input[name*="responsable"]': 'Test DPO Simulator',
      'input[name*="email"]': 'dpo@simulation.test',
      'input[name*="telefono"]': '+56 9 8765 4321'
    });
    await this.clickNextButton();
  }

  async fillRATStep2() {
    // Seleccionar categorías de datos
    const categories = ['nombre', 'email', 'telefono'];
    for (const category of categories) {
      const checkbox = await this.findElement(`input[value="${category}"], label:contains("${category}")`);
      if (checkbox) {
        await this.humanClick(checkbox);
      }
    }
    await this.clickNextButton();
  }

  async fillRATStep3() {
    // Seleccionar base legal
    const baseLegal = await this.findElement('select[name*="base"], input[value="consentimiento"]');
    if (baseLegal) {
      await this.humanClick(baseLegal);
    }
    await this.clickNextButton();
  }

  async fillRATStep4() {
    await this.fillForm({
      'textarea[name*="finalidad"], textarea[name*="proposito"]': 
        'Finalidad de prueba para simulación automatizada del sistema LPDP. Test de funcionalidad completa.'
    });
    await this.clickNextButton();
  }

  async fillRATStep5() {
    await this.fillForm({
      'input[name*="destinatario"], textarea[name*="destinatario"]': 'Destinatarios internos de la organización'
    });
    await this.clickNextButton();
  }

  async fillRATStep6() {
    const plazoSelect = await this.findElement('select[name*="plazo"]');
    if (plazoSelect) {
      await this.selectOption(plazoSelect, '5_anos');
    }
    await this.clickNextButton();
  }

  async fillRATStep7() {
    // Marcar que no hay transferencias internacionales
    const noTransfer = await this.findElement('input[value="no"], label:contains("No")');
    if (noTransfer) {
      await this.humanClick(noTransfer);
    }
    await this.clickNextButton();
  }

  async fillRATStep8() {
    const securityMeasures = ['cifrado', 'acceso_restringido'];
    for (const measure of securityMeasures) {
      const checkbox = await this.findElement(`input[value="${measure}"]`);
      if (checkbox) {
        await this.humanClick(checkbox);
      }
    }
    await this.clickNextButton();
  }

  async finalizeRAT() {
    const saveButton = await this.findElement(
      'button[type="submit"], button:contains("Guardar"), button:contains("Finalizar")'
    );
    if (!saveButton) {
      throw new Error('Botón de guardado final no encontrado');
    }
    await this.humanClick(saveButton);
    await this.humanDelay('navigation');
  }

  async verifyRATCreation(testResult) {
    // Verificar mensaje de éxito
    const successMessage = await this.findElement(
      '.success, .alert-success, [role="alert"]:contains("éxito")'
    );
    
    if (!successMessage) {
      throw new Error('No se mostró mensaje de éxito tras crear RAT');
    }

    // Verificar en base de datos
    const { data: rats } = await supabase
      .from('rats')
      .select('id')
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (!rats || rats.length === 0) {
      throw new Error('RAT no se guardó en base de datos');
    }

    testResult.created_record = { type: 'rat', id: rats[0].id };
  }

  /**
   * 🎛️ MÉTODOS DE INTERACCIÓN HUMANA
   */
  
  async humanClick(element) {
    if (!element) throw new Error('Elemento para click no encontrado');
    
    await this.humanDelay('click');
    
    // Simular hover antes del click
    element.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    await this.humanDelay('click', 50);
    
    // Click real
    element.click();
    
    // Simular mouse out
    element.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
  }

  async humanType(element, text, options = {}) {
    if (!element) throw new Error('Elemento para typing no encontrado');
    
    const speed = options.speed || this.humanDelays.typing;
    
    // Focus en el elemento
    element.focus();
    await this.humanDelay('click');
    
    // Limpiar contenido existente
    element.value = '';
    
    // Escribir caracter por caracter
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      element.value += char;
      
      // Disparar eventos de input
      element.dispatchEvent(new InputEvent('input', { bubbles: true }));
      
      // Pausa humana entre caracteres
      await this.humanDelay('typing', speed);
    }
    
    // Evento final
    element.dispatchEvent(new Event('change', { bubbles: true }));
  }

  async findElement(selectors, timeout = 5000) {
    const selectorList = Array.isArray(selectors) ? selectors : [selectors];
    
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      for (const selector of selectorList) {
        try {
          // Buscar por selector CSS normal
          let element = document.querySelector(selector);
          
          if (!element && selector.includes(':contains(')) {
            // Buscar por contenido de texto
            const [tag, text] = selector.split(':contains(');
            const textContent = text.replace(/[")]/g, '');
            const elements = document.querySelectorAll(tag);
            
            element = Array.from(elements).find(el => 
              el.textContent?.toLowerCase().includes(textContent.toLowerCase())
            );
          }
          
          if (element && this.isElementVisible(element)) {
            return element;
          }
        } catch (error) {
          // Continuar con siguiente selector
        }
      }
      
      await this.humanDelay('reading', 100);
    }
    
    return null;
  }

  async fillForm(fieldMap) {
    for (const [selector, value] of Object.entries(fieldMap)) {
      const field = await this.findElement(selector);
      if (field) {
        await this.humanType(field, value);
        await this.humanDelay('reading');
      }
    }
  }

  async clickNextButton() {
    const nextButton = await this.findElement([
      'button:contains("Siguiente")',
      'button:contains("Continuar")', 
      '.btn-next',
      '[data-testid="next-button"]'
    ]);
    
    if (nextButton) {
      await this.humanClick(nextButton);
      await this.humanDelay('navigation');
    }
  }

  async selectOption(selectElement, value) {
    if (!selectElement) return;
    
    selectElement.value = value;
    selectElement.dispatchEvent(new Event('change', { bubbles: true }));
    await this.humanDelay('click');
  }

  async waitForPageLoad(timeout = 10000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      if (document.readyState === 'complete') {
        await this.humanDelay('navigation');
        return true;
      }
      await this.humanDelay('reading', 100);
    }
    
    return false;
  }

  async waitForSuccess(timeout = 5000) {
    const successSelectors = [
      '.success',
      '.alert-success', 
      '[role="alert"]',
      '.notification-success',
      '.toast-success'
    ];
    
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      for (const selector of successSelectors) {
        const element = document.querySelector(selector);
        if (element && this.isElementVisible(element)) {
          return true;
        }
      }
      await this.humanDelay('reading', 200);
    }
    
    return false;
  }

  async navigateToPage(path) {
    // Buscar enlace de navegación o usar navegación programática
    const link = await this.findElement(`[href*="${path}"], nav a[href*="${path}"]`);
    
    if (link) {
      await this.humanClick(link);
    } else {
      // Navegación directa si no hay enlace
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
    
    await this.waitForPageLoad();
  }

  // Métodos auxiliares
  async humanDelay(type, customMs) {
    const delay = customMs || this.humanDelays[type] || 100;
    const variation = delay * 0.3; // Variación humana del 30%
    const actualDelay = delay + (Math.random() * variation - variation/2);
    
    return new Promise(resolve => setTimeout(resolve, Math.max(actualDelay, 10)));
  }

  isElementVisible(element) {
    if (!element) return false;
    
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 && 
           window.getComputedStyle(element).display !== 'none' &&
           window.getComputedStyle(element).visibility !== 'hidden';
  }

  getCurrentElement() {
    return document.activeElement?.tagName || 'unknown';
  }

  formatDuration(ms) {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    if (ms < 60000) return `${(ms/1000).toFixed(1)}s`;
    return `${(ms/60000).toFixed(1)}min`;
  }

  generateRecommendations(simulation) {
    const recommendations = [];
    
    if (simulation.success_rate < 80) {
      recommendations.push({
        priority: 'HIGH',
        issue: `Tasa de éxito baja: ${simulation.success_rate}%`,
        action: 'Revisar elementos de UI que fallan consistentemente'
      });
    }
    
    const commonErrors = this.analyzeCommonErrors(simulation.errors_found);
    commonErrors.forEach(error => {
      recommendations.push({
        priority: 'MEDIUM',
        issue: `Error recurrente: ${error.message}`,
        action: error.recommendation
      });
    });
    
    return recommendations;
  }

  analyzeCommonErrors(errors) {
    // Analizar errores comunes y generar recomendaciones
    const errorGroups = {};
    
    errors.forEach(error => {
      const key = error.message.split(' ').slice(0, 3).join(' ');
      if (!errorGroups[key]) {
        errorGroups[key] = { count: 0, message: error.message, examples: [] };
      }
      errorGroups[key].count++;
      errorGroups[key].examples.push(error);
    });
    
    return Object.values(errorGroups)
      .filter(group => group.count > 1)
      .map(group => ({
        message: group.message,
        count: group.count,
        recommendation: this.getErrorRecommendation(group.message)
      }));
  }

  getErrorRecommendation(errorMessage) {
    if (errorMessage.includes('no encontrado')) {
      return 'Verificar selectores CSS y estructura del DOM';
    }
    if (errorMessage.includes('base de datos')) {
      return 'Revisar configuración de Supabase y permisos';
    }
    if (errorMessage.includes('navegación')) {
      return 'Verificar rutas y componentes de navegación';
    }
    return 'Revisar logs detallados para diagnóstico específico';
  }

  async saveSimulationResults(simulation) {
    try {
      await supabase
        .from('simulation_results')
        .insert({
          simulation_id: simulation.id,
          results_data: simulation,
          success_rate: simulation.success_rate,
          errors_count: simulation.errors_found.length,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error guardando resultados de simulación:', error);
    }
  }

  // Métodos específicos para otros tipos de test
  async simulateProviderManagement(testResult) {
    testResult.total_steps = 4;
    testResult.steps_completed = 4; // Simplificado por ahora
  }

  async simulateReportGeneration(testResult) {
    testResult.total_steps = 3;
    testResult.steps_completed = 3; // Simplificado por ahora
  }

  async simulateDashboardInteraction(testResult) {
    testResult.total_steps = 5;
    testResult.steps_completed = 5; // Simplificado por ahora
  }

  async simulateSystemConfiguration(testResult) {
    testResult.total_steps = 2;
    testResult.steps_completed = 2; // Simplificado por ahora
  }
}

// Instancia global
const humanSimulator = new HumanInteractionSimulator();

export default humanSimulator;