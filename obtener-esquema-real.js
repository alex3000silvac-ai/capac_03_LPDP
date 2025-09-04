const https = require('https');

/**
 * 🔍 OBTENER ESQUEMA REAL DE SUPABASE
 * 
 * Descubrir la estructura real de las tablas para testing correcto
 */

class RealSchemaDiscoverer {
  constructor() {
    this.supabaseUrl = 'https://symkjkbejxexgrydmvqs.supabase.co';
    this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5bWtqa2JlanhleGdyeWRtdnFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0MjY4OTUsImV4cCI6MjA3MDAwMjg5NX0.26o_IJrzZ3rvSrcII7Bf5P0TW70sdPT9PgZmJo6VkTE';
    
    this.tables = [
      'organizaciones',
      'activities', 
      'actividades_dpo',
      'usuarios',
      'proveedores',
      'generated_documents',
      'mapeo_datos_rat',
      'partner_tokens',
      'audit_log'
    ];
    
    this.schemas = {};
  }

  /**
   * 🔍 DESCUBRIR ESQUEMA REAL
   */
  async discoverRealSchema() {
    console.log('🔍 DESCUBRIENDO ESQUEMA REAL DE SUPABASE...');
    
    for (const table of this.tables) {
      console.log(`📊 Analizando: ${table}`);
      
      try {
        // Método 1: Intentar INSERT con datos vacíos para ver qué columnas faltan
        const schema = await this.discoverTableSchema(table);
        this.schemas[table] = schema;
        console.log(`✅ ${table}: ${schema.discovered_columns.length} columnas`);
        
      } catch (error) {
        console.error(`❌ Error ${table}: ${error.message}`);
        this.schemas[table] = { error: error.message };
      }
      
      await this.sleep(200);
    }
    
    // Guardar esquemas descubiertos
    const report = {
      discovered_at: new Date().toISOString(),
      supabase_url: this.supabaseUrl,
      tables_analyzed: this.tables.length,
      schemas: this.schemas
    };
    
    const fs = require('fs');
    fs.writeFileSync('ESQUEMA_REAL_SUPABASE.json', JSON.stringify(report, null, 2));
    console.log('\n📝 Esquemas guardados: ESQUEMA_REAL_SUPABASE.json');
    
    return report;
  }

  /**
   * 🔍 DESCUBRIR ESQUEMA DE UNA TABLA
   */
  async discoverTableSchema(table) {
    // Estrategia: hacer INSERT mínimo y ver qué errores da
    const testData = {};
    
    return new Promise((resolve, reject) => {
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
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            
            if (res.statusCode === 400 || res.statusCode === 422) {
              // Error esperado que nos da info del esquema
              const schema = this.parseSchemaFromError(response, table);
              resolve(schema);
            } else if (res.statusCode === 201) {
              // INSERT exitoso (poco probable con data vacía)
              resolve({
                table_name: table,
                insert_success: true,
                discovered_columns: ['unknown'],
                notes: 'INSERT empty succeeded - unusual'
              });
            } else {
              resolve({
                table_name: table,
                status_code: res.statusCode,
                response: response,
                discovered_columns: [],
                notes: `Unexpected status: ${res.statusCode}`
              });
            }
          } catch (error) {
            resolve({
              table_name: table,
              parse_error: error.message,
              raw_response: data,
              discovered_columns: []
            });
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.setTimeout(5000, () => {
        req.destroy();
        reject(new Error(`Timeout discovering schema for ${table}`));
      });

      req.write(postData);
      req.end();
    });
  }

  /**
   * 🧠 PARSEAR ESQUEMA DESDE ERROR
   */
  parseSchemaFromError(errorResponse, table) {
    const schema = {
      table_name: table,
      error_code: errorResponse.code,
      error_message: errorResponse.message,
      discovered_columns: [],
      required_columns: [],
      nullable_columns: [],
      notes: []
    };

    // Analizar diferentes tipos de errores para extraer info del esquema
    if (errorResponse.message) {
      const message = errorResponse.message;
      
      // Buscar info de columnas requeridas
      if (message.includes('null value') || message.includes('not-null')) {
        const nullMatch = message.match(/column \"([^"]+)\"/);
        if (nullMatch) {
          schema.required_columns.push(nullMatch[1]);
          schema.discovered_columns.push(nullMatch[1]);
        }
      }
      
      // Buscar info de violaciones de constraints
      if (message.includes('violates')) {
        schema.notes.push('Has constraints');
      }
      
      // Buscar info de tipos de datos
      if (message.includes('invalid input')) {
        schema.notes.push('Type validation exists');
      }
    }
    
    // Si no podemos extraer columnas del error, intentar estrategias alternativas
    if (schema.discovered_columns.length === 0) {
      schema.notes.push('Could not discover columns from error - need alternative method');
    }
    
    return schema;
  }

  /**
   * 🔍 MÉTODO ALTERNATIVO: INTENTAR SELECT CON CAMPOS COMUNES
   */
  async tryCommonColumns(table) {
    const commonColumns = ['id', 'name', 'nombre', 'created_at', 'updated_at', 'email', 'estado', 'activo', 'activa'];
    const foundColumns = [];
    
    for (const column of commonColumns) {
      try {
        await this.testSelectColumn(table, column);
        foundColumns.push(column);
        console.log(`  ✅ ${table}.${column} - exists`);
      } catch (error) {
        // Column doesn't exist or not accessible
      }
    }
    
    return foundColumns;
  }

  /**
   * 🧪 TEST SELECT DE UNA COLUMNA
   */
  async testSelectColumn(table, column) {
    return new Promise((resolve, reject) => {
      const url = new URL(`${this.supabaseUrl}/rest/v1/${table}`);
      url.searchParams.append('select', column);
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
        timeout: 3000
      };

      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode === 200) {
            resolve();
          } else {
            reject(new Error(`Status ${res.statusCode}`));
          }
        });
      });

      req.on('error', reject);
      req.setTimeout(3000, () => {
        req.destroy();
        reject(new Error('Timeout'));
      });

      req.end();
    });
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Ejecutar discovery
if (require.main === module) {
  const discoverer = new RealSchemaDiscoverer();
  discoverer.discoverRealSchema()
    .then(report => {
      console.log('\n🎉 DISCOVERY COMPLETO');
      console.log(`📊 Tablas analizadas: ${report.tables_analyzed}`);
      console.log('📝 Ver: ESQUEMA_REAL_SUPABASE.json');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ ERROR EN DISCOVERY:', error);
      process.exit(1);
    });
}

module.exports = RealSchemaDiscoverer;