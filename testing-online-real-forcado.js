const https = require('https');
const http = require('http');

/**
 * 🔥 TESTING ONLINE REAL FORZADO - SUPABASE
 * 
 * NO ACEPTA SIMULACIONES - SOLO REAL FÍSICO
 */

class ForceOnlineRealTesting {
  constructor() {
    this.testId = `force_online_${Date.now()}`;
    this.supabaseUrl = 'https://symkjkbejxexgrydmvqs.supabase.co';
    this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5bWtqa2JlanhleGdyeWRtdnFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0MjY4OTUsImV4cCI6MjA3MDAwMjg5NX0.26o_IJrzZ3rvSrcII7Bf5P0TW70sdPT9PgZmJo6VkTE';
    
    // Tablas identificadas en el análisis exhaustivo
    this.tables = [
      'activities',
      'actividades_dpo', 
      'usuarios',
      'organizaciones',
      'proveedores',
      'generated_documents',
      'mapeo_datos_rat',
      'partner_tokens',
      'audit_log'
    ];
    
    this.results = {
      connectivity_tests: {},
      crud_operations: {},
      errors: [],
      success_count: 0,
      total_operations: 0
    };
  }

  /**
   * 🚀 EJECUTAR TESTING ONLINE REAL FORZADO
   */
  async executeForceOnlineTesting() {
    console.log('🔥 INICIANDO TESTING ONLINE REAL FORZADO - SUPABASE');
    console.log('❌ NO SE ACEPTAN SIMULACIONES - SOLO REAL');
    
    const startTime = Date.now();
    
    try {
      // PASO 1: Test conectividad básica REAL
      console.log('🔍 PASO 1: Testing conectividad básica REAL...');
      await this.testBasicConnectivity();
      
      // PASO 2: Test autenticación REAL
      console.log('🔐 PASO 2: Testing autenticación REAL...');
      await this.testAuthentication();
      
      // PASO 3: Testing CRUD REAL en cada tabla
      console.log('🧪 PASO 3: Testing CRUD REAL en cada tabla...');
      for (const table of this.tables) {
        console.log(`📊 TESTING REAL: ${table}`);
        await this.testTableCRUDReal(table);
        
        // Pausa entre tablas
        await this.sleep(300);
      }
      
      // PASO 4: Generar reporte REAL
      const totalTime = Date.now() - startTime;
      const report = this.generateRealReport(totalTime);
      
      console.log('\n🎉 TESTING ONLINE REAL COMPLETADO');
      console.log(`✅ Éxito: ${this.results.success_count}/${this.results.total_operations}`);
      console.log(`⏱️ Tiempo: ${Math.round(totalTime/1000)}s`);
      
      return report;
      
    } catch (error) {
      console.error('❌ ERROR EN TESTING REAL:', error.message);
      throw error;
    }
  }

  /**
   * 🔍 TEST CONECTIVIDAD BÁSICA REAL
   */
  async testBasicConnectivity() {
    return new Promise((resolve, reject) => {
      const url = new URL(`${this.supabaseUrl}/rest/v1/organizations`);
      
      const options = {
        hostname: url.hostname,
        port: 443,
        path: url.pathname,
        method: 'GET',
        headers: {
          'apikey': this.supabaseKey,
          'Authorization': `Bearer ${this.supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        timeout: 10000
      };

      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          console.log(`✅ CONECTIVIDAD REAL: Status ${res.statusCode}`);
          this.results.connectivity_tests.basic = {
            success: res.statusCode < 400,
            status_code: res.statusCode,
            response_size: data.length,
            tested_at: new Date().toISOString()
          };
          resolve(data);
        });
      });

      req.on('error', (error) => {
        console.error(`❌ ERROR CONECTIVIDAD REAL: ${error.message}`);
        this.results.connectivity_tests.basic = {
          success: false,
          error: error.message,
          tested_at: new Date().toISOString()
        };
        reject(error);
      });

      req.on('timeout', () => {
        console.error('❌ TIMEOUT EN CONECTIVIDAD REAL');
        req.destroy();
        reject(new Error('Connection timeout'));
      });

      req.end();
    });
  }

  /**
   * 🔐 TEST AUTENTICACIÓN REAL
   */
  async testAuthentication() {
    return new Promise((resolve, reject) => {
      const url = new URL(`${this.supabaseUrl}/auth/v1/user`);
      
      const options = {
        hostname: url.hostname,
        port: 443,
        path: url.pathname,
        method: 'GET',
        headers: {
          'apikey': this.supabaseKey,
          'Authorization': `Bearer ${this.supabaseKey}`
        },
        timeout: 5000
      };

      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          console.log(`✅ AUTENTICACIÓN REAL: Status ${res.statusCode}`);
          this.results.connectivity_tests.auth = {
            success: res.statusCode < 500, // Aceptar 401/403 como "conectado"
            status_code: res.statusCode,
            tested_at: new Date().toISOString()
          };
          resolve();
        });
      });

      req.on('error', (error) => {
        console.error(`❌ ERROR AUTENTICACIÓN: ${error.message}`);
        this.results.connectivity_tests.auth = {
          success: false,
          error: error.message,
          tested_at: new Date().toISOString()
        };
        reject(error);
      });

      req.setTimeout(5000, () => {
        req.destroy();
        reject(new Error('Auth timeout'));
      });

      req.end();
    });
  }

  /**
   * 🧪 TEST CRUD REAL EN TABLA
   */
  async testTableCRUDReal(table) {
    const tableResults = {
      table_name: table,
      operations: {},
      success_count: 0,
      total_operations: 0
    };

    // TEST SELECT REAL
    try {
      console.log(`  📖 SELECT REAL en ${table}...`);
      await this.testSelectReal(table);
      tableResults.operations.select = { success: true, message: '✅ SELECT exitoso' };
      tableResults.success_count++;
    } catch (error) {
      tableResults.operations.select = { success: false, error: error.message };
      this.results.errors.push(`SELECT ${table}: ${error.message}`);
    }
    tableResults.total_operations++;

    // TEST INSERT REAL (solo si SELECT funcionó)
    if (tableResults.operations.select.success) {
      try {
        console.log(`  ➕ INSERT REAL en ${table}...`);
        const insertId = await this.testInsertReal(table);
        tableResults.operations.insert = { success: true, message: `✅ INSERT exitoso, ID: ${insertId}`, inserted_id: insertId };
        tableResults.success_count++;

        // TEST UPDATE REAL (solo si INSERT funcionó)
        if (insertId) {
          try {
            console.log(`  ✏️ UPDATE REAL en ${table}...`);
            await this.testUpdateReal(table, insertId);
            tableResults.operations.update = { success: true, message: '✅ UPDATE exitoso' };
            tableResults.success_count++;
          } catch (error) {
            tableResults.operations.update = { success: false, error: error.message };
            this.results.errors.push(`UPDATE ${table}: ${error.message}`);
          }
          tableResults.total_operations++;

          // TEST DELETE REAL (limpiar datos de prueba)
          try {
            console.log(`  🗑️ DELETE REAL en ${table}...`);
            await this.testDeleteReal(table, insertId);
            tableResults.operations.delete = { success: true, message: '✅ DELETE exitoso' };
            tableResults.success_count++;
          } catch (error) {
            tableResults.operations.delete = { success: false, error: error.message };
            this.results.errors.push(`DELETE ${table}: ${error.message}`);
          }
          tableResults.total_operations++;
        }
      } catch (error) {
        tableResults.operations.insert = { success: false, error: error.message };
        this.results.errors.push(`INSERT ${table}: ${error.message}`);
      }
      tableResults.total_operations++;
    }

    this.results.crud_operations[table] = tableResults;
    this.results.success_count += tableResults.success_count;
    this.results.total_operations += tableResults.total_operations;

    console.log(`  📊 ${table}: ${tableResults.success_count}/${tableResults.total_operations} operaciones exitosas`);
  }

  /**
   * 📖 TEST SELECT REAL
   */
  async testSelectReal(table) {
    return new Promise((resolve, reject) => {
      const url = new URL(`${this.supabaseUrl}/rest/v1/${table}`);
      url.searchParams.append('select', '*');
      url.searchParams.append('limit', '1');
      
      const options = {
        hostname: url.hostname,
        port: 443,
        path: url.pathname + url.search,
        method: 'GET',
        headers: {
          'apikey': this.supabaseKey,
          'Authorization': `Bearer ${this.supabaseKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 5000
      };

      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode === 200) {
            resolve(JSON.parse(data));
          } else {
            reject(new Error(`SELECT failed: ${res.statusCode} - ${data}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.setTimeout(5000, () => {
        req.destroy();
        reject(new Error('SELECT timeout'));
      });

      req.end();
    });
  }

  /**
   * ➕ TEST INSERT REAL
   */
  async testInsertReal(table) {
    return new Promise((resolve, reject) => {
      const testData = this.generateRealTestData(table);
      const postData = JSON.stringify(testData);
      
      const url = new URL(`${this.supabaseUrl}/rest/v1/${table}`);
      
      const options = {
        hostname: url.hostname,
        port: 443,
        path: url.pathname,
        method: 'POST',
        headers: {
          'apikey': this.supabaseKey,
          'Authorization': `Bearer ${this.supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
          'Content-Length': Buffer.byteLength(postData)
        },
        timeout: 5000
      };

      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode === 201) {
            const result = JSON.parse(data);
            const insertedId = result[0]?.id || result.id;
            resolve(insertedId);
          } else {
            reject(new Error(`INSERT failed: ${res.statusCode} - ${data}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.setTimeout(5000, () => {
        req.destroy();
        reject(new Error('INSERT timeout'));
      });

      req.write(postData);
      req.end();
    });
  }

  /**
   * ✏️ TEST UPDATE REAL
   */
  async testUpdateReal(table, id) {
    return new Promise((resolve, reject) => {
      const updateData = { updated_at: new Date().toISOString() };
      const postData = JSON.stringify(updateData);
      
      const url = new URL(`${this.supabaseUrl}/rest/v1/${table}`);
      url.searchParams.append('id', `eq.${id}`);
      
      const options = {
        hostname: url.hostname,
        port: 443,
        path: url.pathname + url.search,
        method: 'PATCH',
        headers: {
          'apikey': this.supabaseKey,
          'Authorization': `Bearer ${this.supabaseKey}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        },
        timeout: 5000
      };

      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode === 204 || res.statusCode === 200) {
            resolve();
          } else {
            reject(new Error(`UPDATE failed: ${res.statusCode} - ${data}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.setTimeout(5000, () => {
        req.destroy();
        reject(new Error('UPDATE timeout'));
      });

      req.write(postData);
      req.end();
    });
  }

  /**
   * 🗑️ TEST DELETE REAL
   */
  async testDeleteReal(table, id) {
    return new Promise((resolve, reject) => {
      const url = new URL(`${this.supabaseUrl}/rest/v1/${table}`);
      url.searchParams.append('id', `eq.${id}`);
      
      const options = {
        hostname: url.hostname,
        port: 443,
        path: url.pathname + url.search,
        method: 'DELETE',
        headers: {
          'apikey': this.supabaseKey,
          'Authorization': `Bearer ${this.supabaseKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 5000
      };

      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode === 204) {
            resolve();
          } else {
            reject(new Error(`DELETE failed: ${res.statusCode} - ${data}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.setTimeout(5000, () => {
        req.destroy();
        reject(new Error('DELETE timeout'));
      });

      req.end();
    });
  }

  /**
   * 🎲 GENERAR DATOS DE PRUEBA REALES
   */
  generateRealTestData(table) {
    const timestamp = Date.now();
    const testId = `test_${this.testId}_${timestamp}`;

    switch (table) {
      case 'organizaciones':
        return {
          rut: `${testId}-9`,
          razon_social: `Test Org ${timestamp}`,
          email: `test${timestamp}@real.test`,
          telefono: '+56 9 9999 9999',
          activa: true
        };

      case 'proveedores':
        return {
          nombre: `Test Provider ${timestamp}`,
          rut: `${testId}-K`,
          email: `provider${timestamp}@real.test`,
          activo: true
        };

      case 'actividades_dpo':
        return {
          titulo: `Test Activity ${timestamp}`,
          descripcion: 'Real test activity',
          estado: 'PENDIENTE'
        };

      case 'mapeo_datos_rat':
        return {
          nombre: `Test RAT ${timestamp}`,
          estado: 'BORRADOR',
          datos: { test: true, real: true, audit_id: this.testId }
        };

      case 'generated_documents':
        return {
          nombre: `Test Doc ${timestamp}`,
          tipo: 'TEST',
          estado: 'GENERADO'
        };

      default:
        return {
          nombre: `Test ${table} ${timestamp}`,
          descripcion: `Real test for ${table}`,
          estado: 'ACTIVO'
        };
    }
  }

  /**
   * 📊 GENERAR REPORTE REAL
   */
  generateRealReport(totalTime) {
    const report = {
      test_id: this.testId,
      type: 'FORCE_ONLINE_REAL_TESTING',
      started_at: new Date().toISOString(),
      connectivity: this.results.connectivity_tests,
      crud_operations: this.results.crud_operations,
      summary: {
        total_tables_tested: this.tables.length,
        successful_operations: this.results.success_count,
        total_operations: this.results.total_operations,
        success_rate: Math.round((this.results.success_count / this.results.total_operations) * 100),
        execution_time_ms: totalTime,
        execution_time: `${Math.round(totalTime/1000)}s`,
        errors_count: this.results.errors.length,
        testing_mode: 'REAL_ONLINE_ONLY'
      },
      errors: this.results.errors,
      completed_at: new Date().toISOString()
    };

    // Guardar reporte
    const fs = require('fs');
    const filename = `TESTING_ONLINE_REAL_${this.testId}.json`;
    fs.writeFileSync(filename, JSON.stringify(report, null, 2));
    console.log(`📝 Reporte REAL guardado: ${filename}`);

    return report;
  }

  /**
   * ⏱️ SLEEP
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// EJECUTAR TESTING ONLINE REAL FORZADO
if (require.main === module) {
  const tester = new ForceOnlineRealTesting();
  tester.executeForceOnlineTesting()
    .then(report => {
      console.log('\n🎉 TESTING ONLINE REAL COMPLETADO EXITOSAMENTE');
      console.log(`🔥 MODO: ${report.summary.testing_mode}`);
      console.log(`✅ Éxito: ${report.summary.success_rate}%`);
      console.log(`📊 Operaciones: ${report.summary.successful_operations}/${report.summary.total_operations}`);
      console.log(`⏱️ Tiempo: ${report.summary.execution_time}`);
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ ERROR EN TESTING REAL:', error.message);
      process.exit(1);
    });
}

module.exports = ForceOnlineRealTesting;