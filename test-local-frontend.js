#!/usr/bin/env node

/**
 * 🧪 TEST RÁPIDO FRONTEND LOCAL
 * Verifica si la corrección del frontend funciona localmente
 */

const puppeteer = require('puppeteer');

async function testFrontendLocal() {
    console.log('🧪 Probando frontend local corregido...');
    
    const browser = await puppeteer.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    
    const page = await browser.newPage();
    
    try {
        // Primero probar si el servidor local está corriendo
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 10000 });
        
        const title = await page.title();
        const bodyText = await page.evaluate(() => document.body.innerText || '');
        const hasContent = bodyText.length > 100;
        
        console.log(`✅ Título: ${title}`);
        console.log(`✅ Contenido: ${bodyText.length} caracteres`);
        console.log(`✅ Contenido dinámico: ${hasContent ? 'SÍ' : 'NO'}`);
        
        const screenshot = `test-local-${Date.now()}.png`;
        await page.screenshot({ path: screenshot, fullPage: true });
        console.log(`📸 Screenshot: ${screenshot}`);
        
        return hasContent;
        
    } catch (error) {
        console.log('❌ Servidor local no disponible:', error.message);
        console.log('💡 Para probar localmente: cd frontend && npm start');
        return false;
    } finally {
        await browser.close();
    }
}

testFrontendLocal().then(success => {
    console.log(success ? '✅ Frontend local funcional' : '❌ Frontend local con problemas');
    process.exit(success ? 0 : 1);
}).catch(error => {
    console.error('💥 Error:', error);
    process.exit(1);
});