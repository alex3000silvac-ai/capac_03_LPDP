#!/usr/bin/env node

/**
 * 🔍 MONITOR RENDER DEPLOY
 * Verifica cada 30 segundos si el frontend se deployó con la corrección
 */

const { execSync } = require('child_process');

let checkCount = 0;
const maxChecks = 20; // 10 minutos máximo

function checkDeploy() {
    checkCount++;
    const timestamp = new Date().toISOString();
    
    console.log(`\n[${timestamp}] 🔍 Check ${checkCount}/${maxChecks}: Verificando deploy...`);
    
    try {
        // Hacer request simple al frontend
        const response = execSync('curl -s -w "%{http_code}" https://scldp-frontend.onrender.com/', { encoding: 'utf8' });
        const statusCode = response.slice(-3); // Últimos 3 caracteres
        
        if (statusCode === '200') {
            console.log(`✅ Frontend responde HTTP 200`);
            
            // Verificar si ya no hay el error de JavaScript
            // (Esto requeriría Puppeteer, por ahora solo verificamos que responde)
            console.log(`📋 Deploy posiblemente completado. Ejecutar agente real para verificar.`);
            return true;
        } else {
            console.log(`⚠️ Frontend responde HTTP ${statusCode}`);
            return false;
        }
        
    } catch (error) {
        console.log(`❌ Error verificando deploy: ${error.message}`);
        return false;
    }
}

function monitorDeploy() {
    console.log('🚀 MONITOR RENDER DEPLOY - Frontend LPDP');
    console.log('⏱️ Verificando cada 30 segundos si el deploy se completó...');
    console.log('🎯 Esperando corrección: onAuthStateChange implementado\n');
    
    const interval = setInterval(() => {
        const deployReady = checkDeploy();
        
        if (deployReady || checkCount >= maxChecks) {
            clearInterval(interval);
            
            if (deployReady) {
                console.log('\n🎉 DEPLOY POSIBLEMENTE COMPLETADO');
                console.log('📋 Ejecuta el agente real para verificar:');
                console.log('   node agente-real-usuario-lpdp.js');
            } else {
                console.log('\n⏰ TIMEOUT - Deploy toma más tiempo del esperado');
                console.log('🔧 Verifica manualmente en Render Dashboard');
            }
        }
    }, 30000); // 30 segundos
    
    // Primer check inmediato
    checkDeploy();
}

if (require.main === module) {
    monitorDeploy();
}