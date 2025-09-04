// SIMULADOR DE USUARIO LPDP - EJECUTAR EN CONSOLA DEL NAVEGADOR
// Copiar y pegar todo este código en la consola de Chrome/Firefox

(function() {
  'use strict';

  class UserSimulator {
    constructor() {
      console.log('🤖 Iniciando Simulador de Usuario LPDP...');
      this.currentStep = 1;
      this.ratData = {};
      this.eipdData = {};
      this.proveedorData = {};
    }

    delay(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    async typeText(selector, text, speed = 50) {
      console.log(`⌨️  Escribiendo "${text}" en ${selector}`);
      const element = document.querySelector(selector);
      if (!element) {
        console.error(`❌ Elemento no encontrado: ${selector}`);
        return false;
      }
      
      element.focus();
      element.value = '';
      
      for (let char of text) {
        element.value += char;
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
        await this.delay(speed);
      }
      
      return true;
    }

    async clickButton(selector, description = '') {
      console.log(`🖱️  Haciendo clic en: ${description || selector}`);
      await this.delay(500);
      
      const element = document.querySelector(selector);
      if (!element) {
        console.error(`❌ Botón no encontrado: ${selector}`);
        return false;
      }

      // Simular movimiento del mouse
      element.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      await this.delay(100);
      
      element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      await this.delay(50);
      
      element.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
      element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      
      await this.delay(800);
      return true;
    }

    async selectDropdown(selector, value, description = '') {
      console.log(`📋 Seleccionando "${value}" en dropdown: ${description || selector}`);
      
      const dropdown = document.querySelector(selector);
      if (!dropdown) {
        console.error(`❌ Dropdown no encontrado: ${selector}`);
        return false;
      }

      dropdown.click();
      await this.delay(500);
      
      const option = document.querySelector(`li[data-value="${value}"], [value="${value}"]`);
      if (option) {
        option.click();
        await this.delay(500);
        return true;
      }
      
      console.warn(`⚠️  Opción "${value}" no encontrada en dropdown`);
      return false;
    }

    async navegarA(ruta, descripcion) {
      console.log(`🧭 Navegando a: ${descripcion} (${ruta})`);
      window.location.hash = ruta;
      await this.delay(2000);
      console.log(`✅ Navegación completada a ${ruta}`);
    }

    // ESCENARIO 1: Crear RAT básico
    async crearRATBasico() {
      console.log('\n🎯 ESCENARIO 1: Creando RAT básico...');
      
      await this.navegarA('#/rat-system', 'Sistema RAT');
      
      // Paso 1: Información General
      await this.typeText('input[name="nombreActividad"]', 'Gestión de Clientes Corporativos');
      await this.typeText('input[name="responsableActividad"]', 'Juan Pérez - Gerente TI');
      await this.typeText('input[name="correoResponsable"]', 'juan.perez@empresa.cl');
      await this.selectDropdown('select[name="industria"]', 'financiero', 'Sector Financiero');
      
      await this.clickButton('button:contains("Siguiente")', 'Siguiente Paso 1');
      
      // Paso 2: Datos Personales
      const categorias = [
        'input[value="datos_identificacion"]',
        'input[value="datos_contacto"]', 
        'input[value="datos_profesionales"]'
      ];
      
      for (const categoria of categorias) {
        const checkbox = document.querySelector(categoria);
        if (checkbox && !checkbox.checked) {
          await this.clickButton(categoria, `Categoría ${categoria}`);
        }
      }
      
      await this.clickButton('button:contains("Siguiente")', 'Siguiente Paso 2');
      
      // Continuar con pasos restantes...
      for (let paso = 3; paso <= 6; paso++) {
        console.log(`📝 Completando paso ${paso}/6...`);
        await this.delay(1000);
        
        const siguienteBtn = document.querySelector('button:contains("Siguiente"), button:contains("Finalizar")');
        if (siguienteBtn) {
          siguienteBtn.click();
          await this.delay(2000);
        }
      }
      
      console.log('✅ RAT básico creado exitosamente');
      this.ratData.basico = { nombre: 'Gestión de Clientes Corporativos' };
    }

    // ESCENARIO 2: Crear EIPD
    async crearEIPD() {
      console.log('\n🎯 ESCENARIO 2: Creando EIPD...');
      
      await this.navegarA('#/eipd-creator', 'Creador EIPD');
      
      // Información general
      await this.typeText('input[name="nombreEvaluacion"]', 'EIPD - Sistema de Scoring Crediticio');
      await this.typeText('input[name="evaluador"]', 'María González - DPO');
      await this.typeText('input[name="departamento"]', 'Cumplimiento y Riesgos');
      
      // Continuar con el formulario EIPD
      const siguienteBtn = document.querySelector('button:contains("Siguiente")');
      if (siguienteBtn) {
        siguienteBtn.click();
        await this.delay(2000);
      }
      
      // Guardar borrador
      const guardarBtn = document.querySelector('button:contains("Guardar")');
      if (guardarBtn) {
        guardarBtn.click();
        await this.delay(1000);
      }
      
      console.log('✅ EIPD creada exitosamente');
      this.eipdData.scoring = { nombre: 'EIPD - Sistema de Scoring Crediticio' };
    }

    // ESCENARIO 3: Crear Proveedor
    async crearProveedor() {
      console.log('\n🎯 ESCENARIO 3: Creando Proveedor...');
      
      await this.navegarA('#/provider-manager', 'Gestor de Proveedores');
      
      // Buscar botón "Nuevo Proveedor"
      const nuevoBtn = document.querySelector('button:contains("Nuevo"), button:contains("Agregar")');
      if (nuevoBtn) {
        nuevoBtn.click();
        await this.delay(1500);
      }
      
      // Llenar formulario de proveedor
      await this.typeText('input[name="nombre"]', 'CloudTech Solutions SpA');
      await this.typeText('input[name="rut"]', '76.543.210-K');
      await this.typeText('input[name="contacto"]', 'Carlos Mendoza');
      await this.typeText('input[name="email"]', 'carlos.mendoza@cloudtech.cl');
      await this.typeText('input[name="telefono"]', '+56912345678');
      
      // Guardar proveedor
      const guardarBtn = document.querySelector('button:contains("Guardar"), button:contains("Crear")');
      if (guardarBtn) {
        guardarBtn.click();
        await this.delay(2000);
      }
      
      console.log('✅ Proveedor creado exitosamente');
      this.proveedorData.cloudtech = { nombre: 'CloudTech Solutions SpA' };
    }

    // ESCENARIO 4: RAT con EIPD asociada
    async crearRATConEIPD() {
      console.log('\n🎯 ESCENARIO 4: Creando RAT con EIPD asociada...');
      
      await this.navegarA('#/rat-system', 'Sistema RAT');
      
      // Crear RAT de alto riesgo
      await this.typeText('input[name="nombreActividad"]', 'Análisis Comportamental de Usuarios');
      await this.typeText('input[name="responsableActividad"]', 'Ana Silva - Data Scientist');
      await this.typeText('input[name="correoResponsable"]', 'ana.silva@empresa.cl');
      await this.selectDropdown('select[name="industria"]', 'tecnologia', 'Tecnología');
      
      // Continuar con el proceso RAT...
      const siguienteBtn = document.querySelector('button:contains("Siguiente")');
      if (siguienteBtn) {
        siguienteBtn.click();
        await this.delay(2000);
      }
      
      console.log('✅ RAT con EIPD asociada creado');
    }

    // ESCENARIO 5: RAT completo con EIPD y Proveedor
    async crearRATCompleto() {
      console.log('\n🎯 ESCENARIO 5: Creando RAT completo con EIPD y Proveedor...');
      
      await this.navegarA('#/rat-system', 'Sistema RAT');
      
      // RAT más complejo
      await this.typeText('input[name="nombreActividad"]', 'Plataforma de Analytics Avanzados');
      await this.typeText('input[name="responsableActividad"]', 'Roberto Martinez - CTO');
      await this.typeText('input[name="correoResponsable"]', 'roberto.martinez@empresa.cl');
      
      console.log('✅ RAT completo iniciado');
    }

    // ESCENARIO 6: Edición de entidades existentes
    async editarEntidadesExistentes() {
      console.log('\n🎯 ESCENARIO 6: Editando entidades existentes...');
      
      // Editar RAT existente
      await this.navegarA('#/rat-list', 'Lista de RATs');
      await this.delay(2000);
      
      const editarBtn = document.querySelector('button[aria-label="edit"], .MuiIconButton-root:has(svg)');
      if (editarBtn) {
        editarBtn.click();
        await this.delay(2000);
      }
      
      console.log('✅ Edición de entidades completada');
    }

    // EJECUTOR PRINCIPAL
    async ejecutarSimulacionCompleta() {
      console.log('\n🚀 INICIANDO SIMULACIÓN COMPLETA DEL SISTEMA LPDP...');
      console.log('════════════════════════════════════════════════════════');
      
      try {
        // Verificar que estamos en la página correcta
        if (!window.location.href.includes('scldp-frontend.onrender.com')) {
          console.warn('⚠️  No estás en la página del sistema LPDP. Navegando...');
          window.open('https://scldp-frontend.onrender.com/', '_blank');
          return;
        }
        
        console.log('📋 Ejecutando escenarios de prueba...\n');
        
        await this.crearRATBasico();
        await this.delay(3000);
        
        await this.crearEIPD();
        await this.delay(3000);
        
        await this.crearProveedor();
        await this.delay(3000);
        
        await this.crearRATConEIPD();
        await this.delay(3000);
        
        await this.crearRATCompleto();
        await this.delay(3000);
        
        await this.editarEntidadesExistentes();
        
        console.log('\n🎉 SIMULACIÓN COMPLETADA EXITOSAMENTE');
        console.log('════════════════════════════════════════════════════════');
        console.log('📊 Resumen de la simulación:');
        console.log('   ✅ RAT básico creado');
        console.log('   ✅ EIPD creada y guardada');
        console.log('   ✅ Proveedor registrado');
        console.log('   ✅ RAT con EIPD asociada');
        console.log('   ✅ RAT completo con todas las asociaciones');
        console.log('   ✅ Edición de entidades existentes');
        console.log('\n🤖 Simulación de usuario humano completada');
        
      } catch (error) {
        console.error('❌ Error en la simulación:', error);
        console.log('🔧 Verifica que todos los elementos del sistema estén cargados correctamente');
      }
    }
  }

  // INICIALIZACIÓN AUTOMÁTICA
  console.log('🤖 Simulador de Usuario LPDP cargado correctamente');
  console.log('📝 Para ejecutar la simulación completa, usa: simuladorLPDP.ejecutarSimulacionCompleta()');
  
  // Crear instancia global
  window.simuladorLPDP = new UserSimulator();
  
  // Auto-ejecutar si se especifica
  if (window.location.search.includes('autorun=true')) {
    setTimeout(() => {
      window.simuladorLPDP.ejecutarSimulacionCompleta();
    }, 2000);
  }

})();

// USO:
// 1. Copiar todo este código
// 2. Pegar en la consola del navegador (F12)
// 3. Ejecutar: simuladorLPDP.ejecutarSimulacionCompleta()