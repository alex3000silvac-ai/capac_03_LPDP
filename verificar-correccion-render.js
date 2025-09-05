#!/usr/bin/env node

/**
 * 🎯 VERIFICACIÓN ESPECÍFICA CORRECCIÓN RENDER
 * 
 * Este agente verifica ESPECÍFICAMENTE si la corrección de onAuthStateChange se deployó
 * Ejecuta test rápido para detectar si ya no hay error JavaScript
 */

const puppeteer = require('puppeteer');

async function verificarCorreccion() {
    console.log('🔍 VERIFICANDO CORRECCIÓN ESPECÍFICA EN RENDER');
    console.log('🎯 Error a verificar: qa.auth.onAuthStateChange is not a function');
    console.log('=' .repeat(60));
    
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    const jsErrors = [];
    
    // Capturar TODOS los errores JavaScript
    page.on('pageerror', error => {
        jsErrors.push(error.message);
        console.log(`🚨 JS Error detectado: ${error.message}`);
    });
    
    try {
        console.log('📡 Navegando a https://scldp-frontend.onrender.com...');
        await page.goto('https://scldp-frontend.onrender.com', { 
            waitUntil: 'networkidle0',
            timeout: 30000 
        });
        
        // Esperar un poco para que React intente cargar
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        const title = await page.title();
        const bodyText = await page.evaluate(() => document.body.innerText || '');
        const hasContent = bodyText.length > 100;
        
        // Verificar específicamente el error que estamos corrigiendo
        const hasAuthError = jsErrors.some(error => 
            error.includes('onAuthStateChange is not a function') ||
            error.includes('qa.auth.onAuthStateChange')
        );
        
        console.log('\n📊 RESULTADOS DE VERIFICACIÓN:');
        console.log(`📄 Título página: ${title}`);
        console.log(`📝 Contenido dinámico: ${hasContent ? '✅ SÍ' : '❌ NO'} (${bodyText.length} chars)`);
        console.log(`🚨 Error onAuthStateChange: ${hasAuthError ? '❌ PERSISTE' : '✅ CORREGIDO'}`);
        console.log(`💥 Total errores JS: ${jsErrors.length}`);
        
        if (jsErrors.length > 0) {
            console.log('\n🚨 ERRORES JAVASCRIPT DETECTADOS:');
            jsErrors.forEach((error, i) => {
                console.log(`  ${i + 1}. ${error}`);
            });
        }
        
        // Screenshot para evidencia
        const screenshot = `verificacion-correccion-${Date.now()}.png`;
        await page.screenshot({ path: screenshot, fullPage: true });
        console.log(`\n📸 Screenshot guardado: ${screenshot}`);
        
        // Veredicto
        const correccionFunciona = !hasAuthError && hasContent;
        
        console.log('\n' + '=' .repeat(60));
        if (correccionFunciona) {
            console.log('🎉 ✅ CORRECCIÓN EXITOSA');
            console.log('🚀 Sistema funcional para usuarios reales');
            console.log('💚 Frontend renderiza contenido dinámico');
            console.log('🔧 Error onAuthStateChange resuelto');
        } else if (!hasAuthError && !hasContent) {
            console.log('🟡 ⚠️ CORRECCIÓN PARCIAL');
            console.log('✅ Error JavaScript resuelto');
            console.log('❌ Pero contenido dinámico aún no carga');
            console.log('🔍 Verificar otras dependencias');
        } else {
            console.log('🔴 ❌ CORRECCIÓN AÚN NO DEPLOYADA');
            console.log('⏳ Render aún no ha aplicado los cambios');
            console.log('🔄 Esperar más tiempo o verificar Render Dashboard');
        }
        
        return correccionFunciona;
        
    } catch (error) {
        console.log(`\n💥 Error durante verificación: ${error.message}`);
        return false;
    } finally {
        await browser.close();
    }
}

if (require.main === module) {
    verificarCorreccion().then(success => {
        process.exit(success ? 0 : 1);
    }).catch(error => {
        console.error('💥 Error fatal:', error);
        process.exit(1);
    });
}

module.exports = verificarCorreccion;