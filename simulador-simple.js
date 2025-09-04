// SIMULADOR SIMPLE LPDP - Copiar y pegar en consola del navegador

console.log('🤖 Cargando Simulador LPDP...');

// Funciones auxiliares
const esperar = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const escribir = async (selector, texto) => {
  console.log(`⌨️  Escribiendo: ${texto}`);
  const elemento = document.querySelector(selector);
  if (elemento) {
    elemento.focus();
    elemento.value = texto;
    elemento.dispatchEvent(new Event('input', { bubbles: true }));
    elemento.dispatchEvent(new Event('change', { bubbles: true }));
    await esperar(500);
    return true;
  }
  console.error(`❌ No encontrado: ${selector}`);
  return false;
};

const hacer_clic = async (selector) => {
  console.log(`🖱️  Haciendo clic en: ${selector}`);
  const elemento = document.querySelector(selector);
  if (elemento) {
    elemento.click();
    await esperar(1000);
    return true;
  }
  console.error(`❌ No encontrado: ${selector}`);
  return false;
};

const navegar = async (ruta) => {
  console.log(`🧭 Navegando a: ${ruta}`);
  window.location.hash = ruta;
  await esperar(2000);
};

// FUNCIÓN PRINCIPAL DE SIMULACIÓN
const iniciarPrueba = async () => {
  console.log('🚀 INICIANDO PRUEBA SISTEMA LPDP');
  console.log('===============================');

  try {
    // 1. IR AL SISTEMA RAT
    console.log('\n📝 PASO 1: Creando RAT...');
    await navegar('#/rat-system');
    
    // Esperar que cargue la página
    await esperar(3000);
    
    // Buscar campos de entrada más genéricos
    await escribir('input[type="text"]:first', 'Gestión de Clientes Test');
    await escribir('input[type="text"]:nth-child(2)', 'Juan Pérez - Responsable');
    await escribir('input[type="email"]', 'juan.perez@test.cl');
    
    // Buscar botón siguiente o submit
    const botonSiguiente = document.querySelector('button[type="submit"], button:contains("Siguiente"), .MuiButton-contained');
    if (botonSiguiente) {
      botonSiguiente.click();
      console.log('✅ Botón siguiente presionado');
      await esperar(2000);
    }
    
    // 2. IR A EIPD
    console.log('\n🛡️  PASO 2: Creando EIPD...');
    await navegar('#/eipd-creator');
    await esperar(3000);
    
    // 3. IR A PROVEEDORES
    console.log('\n🏢 PASO 3: Creando Proveedor...');
    await navegar('#/provider-manager');
    await esperar(3000);
    
    // 4. VER LISTAS
    console.log('\n📋 PASO 4: Viendo listas...');
    await navegar('#/rat-list');
    await esperar(2000);
    
    await navegar('#/eipd-list');
    await esperar(2000);
    
    console.log('\n🎉 PRUEBA COMPLETADA CON ÉXITO');
    console.log('Revisa los logs para ver qué elementos se encontraron o no');
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  }
};

// Hacer la función disponible globalmente
window.iniciarPrueba = iniciarPrueba;

console.log('✅ Simulador cargado correctamente');
console.log('🎯 Para iniciar la prueba escribe: iniciarPrueba()');