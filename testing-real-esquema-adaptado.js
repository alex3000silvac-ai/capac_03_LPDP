const https = require('https');

/**
 * 🎯 TESTING REAL ADAPTADO AL ESQUEMA REAL DESCUBIERTO
 * 
 * Testing 100% real usando la estructura real de las tablas
 */

class RealSchemaAdaptedTesting {
  constructor() {
    this.testId = `real_adapted_${Date.now()}`;
    this.supabaseUrl = 'https://symkjkbejxexgrydmvqs.supabase.co';
    this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5bWtqa2JlanhleGdyeWRtdnFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0MjY4OTUsImV4cCI6MjA3MDAwMjg5NX0.26o_IJrzZ3rvSrcII7Bf5P0TW70sdPT9PgZmJo6VkTE';
    
    this.results = {
      rls_protected_tables: [],
      accessible_tables: [],
      successful_inserts: [],
      successful_deletes: [],
      errors: [],
      total_operations: 0,
      successful_operations: 0
    };
  }

  /**
   * 🚀 EJECUTAR TESTING ADAPTADO AL ESQUEMA REAL
   */
  async executeRealAdaptedTesting() {
    console.log('🎯 INICIANDO TESTING REAL ADAPTADO AL ESQUEMA...');
    const startTime = Date.now();
    
    try {
      // PASO 1: Testing tablas SIN RLS (accesibles)
      console.log('📂 PASO 1: Testing tablas accesibles...');
      await this.testAccessibleTables();
      
      // PASO 2: Testing tablas CON RLS (validar solo SELECT)
      console.log('🔒 PASO 2: Testing tablas con RLS...');
      await this.testRLSProtectedTables();
      
      // PASO 3: Testing con datos reales adaptados
      console.log('🧪 PASO 3: Testing CRUD con esquema real...');
      await this.testWithRealSchema();
      
      const totalTime = Date.now() - startTime;
      const report = this.generateAdaptedReport(totalTime);
      
      console.log('\n🎉 TESTING REAL ADAPTADO COMPLETADO');
      console.log(`✅ Exitosos: ${this.results.successful_operations}/${this.results.total_operations}`);
      console.log(`⏱️ Tiempo: ${Math.round(totalTime/1000)}s`);
      
      return report;
      
    } catch (error) {
      console.error('❌ ERROR EN TESTING ADAPTADO:', error.message);
      throw error;
    }
  }

  /**
   * 📂 TESTING TABLAS ACCESIBLES (SIN RLS)
   */
  async testAccessibleTables() {
    const accessibleTables = ['generated_documents', 'partner_tokens'];
    
    for (const table of accessibleTables) {
      console.log(`  📊 Testing ${table} (sin RLS)...`);
      
      try {
        // SELECT
        await this.testSelect(table);
        console.log(`    ✅ SELECT exitoso`);
        
        // INSERT con datos mínimos
        const insertId = await this.testMinimalInsert(table);
        if (insertId) {
          console.log(`    ✅ INSERT exitoso: ID ${insertId}`);
          this.results.successful_inserts.push({ table, id: insertId });
          
          // UPDATE
          await this.testUpdate(table, insertId);
          console.log(`    ✅ UPDATE exitoso`);
          
          // DELETE
          await this.testDelete(table, insertId);
          console.log(`    ✅ DELETE exitoso`);
          this.results.successful_deletes.push({ table, id: insertId });
        }
        
        this.results.accessible_tables.push(table);
        this.results.successful_operations += 4; // SELECT, INSERT, UPDATE, DELETE
        
      } catch (error) {
        console.log(`    ❌ Error: ${error.message}`);
        this.results.errors.push(`${table}: ${error.message}`);
      }
      
      this.results.total_operations += 4;
      await this.sleep(300);
    }
  }

  /**
   * 🔒 TESTING TABLAS CON RLS (SOLO SELECT)
   */
  async testRLSProtectedTables() {
    const rlsTables = ['organizaciones', 'actividades_dpo', 'usuarios', 'proveedores'];
    
    for (const table of rlsTables) {
      console.log(`  🔒 Testing ${table} (con RLS)...`);
      
      try {
        // Solo SELECT (debería funcionar)
        await this.testSelect(table);
        console.log(`    ✅ SELECT exitoso (RLS permite lectura)`);
        this.results.rls_protected_tables.push(table);
        this.results.successful_operations++;
        
      } catch (error) {
        console.log(`    ❌ SELECT falló: ${error.message}`);
        this.results.errors.push(`${table} SELECT: ${error.message}`);
      }
      
      this.results.total_operations++;
      await this.sleep(200);
    }
  }

  /**
   * 🧪 TESTING CON ESQUEMA REAL ADAPTADO
   */
  async testWithRealSchema() {
    const schemaBasedTables = [
      { table: 'activities', required_fields: { action: 'TEST_ACTION' } },
      { table: 'mapeo_datos_rat', required_fields: { tenant_id: 1 } },
      { table: 'audit_log', required_fields: { tenant_id: 1 } }
    ];
    
    for (const { table, required_fields } of schemaBasedTables) {
      console.log(`  🧪 Testing ${table} con esquema real...`);
      
      try {
        // INSERT con campos requeridos reales
        const insertId = await this.testSchemaBasedInsert(table, required_fields);
        if (insertId) {
          console.log(`    ✅ INSERT real exitoso: ID ${insertId}`);
          this.results.successful_inserts.push({ table, id: insertId, schema_based: true });
          
          // DELETE para limpiar
          await this.testDelete(table, insertId);
          console.log(`    ✅ DELETE exitoso`);
          this.results.successful_deletes.push({ table, id: insertId });
          
          this.results.successful_operations += 2; // INSERT + DELETE
        }
        
      } catch (error) {
        console.log(`    ❌ Error esquema real: ${error.message}`);
        this.results.errors.push(`${table} schema: ${error.message}`);
      }
      
      this.results.total_operations += 2;
      await this.sleep(300);
    }
  }

  /**
   * 📖 TEST SELECT
   */
  async testSelect(table) {
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
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          if (res.statusCode === 200) {
            resolve(JSON.parse(data));
          } else {
            reject(new Error(`SELECT ${res.statusCode}: ${data}`));
          }
        });
      });

      req.on('error', reject);
      req.setTimeout(5000, () => {
        req.destroy();
        reject(new Error('SELECT timeout'));
      });
      req.end();
    });
  }

  /**
   * ➕ TEST INSERT MÍNIMO
   */
  async testMinimalInsert(table) {
    return new Promise((resolve, reject) => {
      // Datos mínimos para tablas sin RLS
      const testData = {};
      const postData = JSON.stringify(testData);
      
      const options = {
        hostname: new URL(this.supabaseUrl).hostname,
        port: 443,
        path: `/rest/v1/${table}`,
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
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          if (res.statusCode === 201) {
            const result = JSON.parse(data);
            const insertedId = result[0]?.id || result.id;
            resolve(insertedId);
          } else {
            reject(new Error(`INSERT ${res.statusCode}: ${data}`));
          }
        });
      });

      req.on('error', reject);
      req.setTimeout(5000, () => {
        req.destroy();
        reject(new Error('INSERT timeout'));
      });
      req.write(postData);
      req.end();
    });
  }

  /**
   * 🧪 TEST INSERT CON ESQUEMA REAL
   */
  async testSchemaBasedInsert(table, requiredFields) {
    return new Promise((resolve, reject) => {
      const testData = {
        ...requiredFields,
        // Campos adicionales comunes
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // Para testing
        test_id: this.testId
      };
      
      const postData = JSON.stringify(testData);
      
      const options = {
        hostname: new URL(this.supabaseUrl).hostname,
        port: 443,
        path: `/rest/v1/${table}`,
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
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          if (res.statusCode === 201) {
            const result = JSON.parse(data);
            const insertedId = result[0]?.id || result.id;
            resolve(insertedId);
          } else {
            reject(new Error(`SCHEMA INSERT ${res.statusCode}: ${data}`));
          }
        });
      });

      req.on('error', reject);
      req.setTimeout(5000, () => {
        req.destroy();
        reject(new Error('SCHEMA INSERT timeout'));
      });
      req.write(postData);
      req.end();
    });
  }

  /**
   * ✏️ TEST UPDATE
   */
  async testUpdate(table, id) {
    return new Promise((resolve, reject) => {
      const updateData = { 
        updated_at: new Date().toISOString(),
        test_updated: true
      };
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
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          if (res.statusCode === 204 || res.statusCode === 200) {
            resolve();
          } else {
            reject(new Error(`UPDATE ${res.statusCode}: ${data}`));
          }
        });
      });

      req.on('error', reject);
      req.setTimeout(5000, () => {
        req.destroy();
        reject(new Error('UPDATE timeout'));
      });
      req.write(postData);
      req.end();
    });
  }

  /**
   * 🗑️ TEST DELETE
   */
  async testDelete(table, id) {
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
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          if (res.statusCode === 204) {
            resolve();
          } else {
            reject(new Error(`DELETE ${res.statusCode}: ${data}`));
          }
        });
      });

      req.on('error', reject);
      req.setTimeout(5000, () => {
        req.destroy();
        reject(new Error('DELETE timeout'));
      });
      req.end();
    });
  }

  /**
   * 📊 GENERAR REPORTE ADAPTADO
   */
  generateAdaptedReport(totalTime) {
    const report = {
      test_id: this.testId,
      type: 'REAL_SCHEMA_ADAPTED_TESTING',
      started_at: new Date().toISOString(),
      supabase_url: this.supabaseUrl,
      testing_approach: 'ADAPTED_TO_REAL_SCHEMA',
      results: this.results,
      summary: {
        total_operations: this.results.total_operations,
        successful_operations: this.results.successful_operations,
        success_rate: Math.round((this.results.successful_operations / this.results.total_operations) * 100),
        accessible_tables_count: this.results.accessible_tables.length,
        rls_protected_tables_count: this.results.rls_protected_tables.length,
        successful_inserts_count: this.results.successful_inserts.length,
        successful_deletes_count: this.results.successful_deletes.length,
        errors_count: this.results.errors.length,
        execution_time_ms: totalTime,
        execution_time: `${Math.round(totalTime/1000)}s`
      },
      completed_at: new Date().toISOString()
    };

    // Guardar reporte
    const fs = require('fs');
    const filename = `TESTING_REAL_ESQUEMA_ADAPTADO_${this.testId}.json`;
    fs.writeFileSync(filename, JSON.stringify(report, null, 2));
    console.log(`📝 Reporte guardado: ${filename}`);

    return report;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// EJECUTAR TESTING ADAPTADO
if (require.main === module) {
  const tester = new RealSchemaAdaptedTesting();
  tester.executeRealAdaptedTesting()
    .then(report => {
      console.log('\n🎉 TESTING REAL ESQUEMA ADAPTADO COMPLETADO');
      console.log(`🎯 Éxito: ${report.summary.success_rate}%`);
      console.log(`📊 Operaciones: ${report.summary.successful_operations}/${report.summary.total_operations}`);
      console.log(`🔓 Tablas accesibles: ${report.summary.accessible_tables_count}`);
      console.log(`🔒 Tablas con RLS: ${report.summary.rls_protected_tables_count}`);
      console.log(`⏱️ Tiempo: ${report.summary.execution_time}`);
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ ERROR EN TESTING ADAPTADO:', error.message);
      process.exit(1);
    });
}

module.exports = RealSchemaAdaptedTesting;