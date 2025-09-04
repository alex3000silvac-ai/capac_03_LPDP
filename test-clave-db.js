#!/usr/bin/env node

/**
 * 🔍 TEST RÁPIDO NUEVA CLAVE BASE DATOS
 * ====================================
 * Probando cW5rBh0PPhKOrMtY como diferentes tipos de clave
 */

const https = require('https');

const SUPABASE_URL = 'https://symkjkbejxexgrydmvqs.supabase.co';
const NUEVA_CLAVE = 'cW5rBh0PPhKOrMtY';

console.log('🔍 TESTING NUEVA CLAVE DB: cW5rBh0PPhKOrMtY');
console.log('===============================================');

// Función para hacer request HTTP
async function testRequest(headers, descripcion) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'symkjkbejxexgrydmvqs.supabase.co',
      path: '/rest/v1/mapeo_datos_rat?limit=1',
      method: 'GET',
      headers: headers
    };

    console.log(`\n🧪 Probando: ${descripcion}`);
    console.log(`   Headers: ${JSON.stringify(headers)}`);

    const req = https.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        console.log(`   Status: ${res.statusCode}`);
        
        if (res.statusCode === 200) {
          console.log('   ✅ ¡ÉXITO! Conexión establecida');
          console.log(`   Respuesta: ${body.substring(0, 200)}...`);
          resolve({ success: true, status: res.statusCode, body });
        } else {
          console.log(`   ❌ Error: ${res.statusCode}`);
          try {
            const error = JSON.parse(body);
            console.log(`   Mensaje: ${error.message || 'Sin mensaje'}`);
          } catch (e) {
            console.log(`   Body: ${body.substring(0, 100)}...`);
          }
          resolve({ success: false, status: res.statusCode, body });
        }
      });
    });

    req.on('error', (error) => {
      console.log(`   ❌ Excepción: ${error.message}`);
      resolve({ success: false, error: error.message });
    });

    req.setTimeout(10000, () => {
      console.log('   ❌ Timeout');
      req.destroy();
      resolve({ success: false, error: 'Timeout' });
    });

    req.end();
  });
}

async function probarClaves() {
  // Test 1: Como anon key
  await testRequest({
    'apikey': NUEVA_CLAVE,
    'Authorization': `Bearer ${NUEVA_CLAVE}`,
    'Content-Type': 'application/json'
  }, 'Como ANON KEY');

  // Test 2: Como service key
  await testRequest({
    'apikey': NUEVA_CLAVE,
    'Authorization': `Bearer ${NUEVA_CLAVE}`,
    'Content-Type': 'application/json',
    'Role': 'service_role'
  }, 'Como SERVICE KEY');

  // Test 3: Solo como Authorization header
  await testRequest({
    'Authorization': `Bearer ${NUEVA_CLAVE}`,
    'Content-Type': 'application/json'
  }, 'Solo Authorization Bearer');

  // Test 4: Como password en Basic Auth
  const basicAuth = Buffer.from(`postgres:${NUEVA_CLAVE}`).toString('base64');
  await testRequest({
    'Authorization': `Basic ${basicAuth}`,
    'Content-Type': 'application/json'
  }, 'Como Basic Auth Password');

  // Test 5: Conexión directa PostgreSQL (simulación)
  console.log(`\n🔐 Test PostgreSQL Direct:`);
  console.log(`   Host: db.symkjkbejxexgrydmvqs.supabase.co`);
  console.log(`   Database: postgres`);
  console.log(`   Password: ${NUEVA_CLAVE}`);
  console.log(`   (Nota: Este test requiere cliente PostgreSQL)`);

  console.log('\n🎯 CONCLUSIÓN:');
  console.log('Si ningún test HTTP funciona, la clave podría ser:');
  console.log('- Password directo PostgreSQL');
  console.log('- Clave para otra función/servicio');
  console.log('- Clave incorrecta o expirada');
}

probarClaves().catch(error => {
  console.error('Error general:', error);
});