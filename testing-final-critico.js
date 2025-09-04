const https = require('https');

/**
 * 🧪 TESTING REAL FINAL CRÍTICO
 * 
 * Testing CRUD completo en las 40 tablas críticas identificadas
 * Testing físico real con estado RLS actual
 */

class FinalCriticalTesting {
  constructor() {
    this.testId = `final_test_${Date.now()}`;
    this.supabaseUrl = 'https://symkjkbejxexgrydmvqs.supabase.co';
    this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5bWtqa2JlanhleGdyeWRtdnFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0MjY4OTUsImV4cCI6MjA3MDAwMjg5NX0.26o_IJrzZ3rvSrcII7Bf5P0TW70sdPT9PgZmJo6VkTE';
    
    // 40 TABLAS CRÍTICAS para testing final
    this.criticalTables = [
      'actividades_dpo', 'activities', 'agent_activity_log', 'audit_log', 'audit_logs',
      'categories', 'compliance_records', 'compliance_reports', 'documentos_generados',
      'dpa_documents', 'dpas', 'dpia', 'dpo_notifications', 'eipd_documents',
      'empresas', 'evaluaciones_impacto', 'generated_documents', 'legal_articles',
      'mapeo_datos_rat', 'notifications', 'organizaciones', 'partner_access_logs',
      'proveedores', 'rat_proveedores', 'rats', 'reports', 'system_alerts',
      'system_config', 'system_error_logs', 'tenant_configs', 'tenant_limits',
      'tenant_settings', 'tenant_usage', 'tenants', 'user_help_stats',
      'user_notifications', 'user_preferences', 'user_sessions', 'users', 'usuarios'
    ];
    
    this.results = {
      connectivity_test: {},
      crud_operations: {},
      functional_tables: [],
      blocked_tables: [],
      successful_operations: 0,
      total_operations: 0,
      final_score: 0
    };
  }

  /**
   * 🚀 EJECUTAR TESTING FINAL CRÍTICO
   */
  async executeFinalCriticalTesting() {
    console.log('🧪 INICIANDO TESTING FINAL CRÍTICO...');
    console.log(`🎯 Testing CRUD en ${this.criticalTables.length} tablas críticas`);
    
    const startTime = Date.now();
    
    try {
      // PASO 1: Test de conectividad básica
      console.log('🔍 PASO 1: Testing conectividad básica...');
      await this.testBasicConnectivity();
      
      // PASO 2: Testing completo CRUD por tabla
      console.log('🧪 PASO 2: Testing CRUD completo por tabla...');
      await this.testAllCriticalTables();
      
      // PASO 3: Análisis de funcionalidad real del sistema
      console.log('📊 PASO 3: Análisis de funcionalidad real...');
      this.analyzeFunctionalityStatus();
      
      const totalTime = Date.now() - startTime;
      const report = this.generateFinalReport(totalTime);
      
      console.log('\n🎉 TESTING FINAL CRÍTICO COMPLETADO');
      console.log(`✅ Funcionales: ${this.results.functional_tables.length}/${this.criticalTables.length}`);
      console.log(`🔒 Bloqueadas: ${this.results.blocked_tables.length}`);
      console.log(`📊 Score final: ${this.results.final_score}%`);
      console.log(`⏱️ Tiempo: ${Math.round(totalTime/1000)}s`);
      
      return report;
      
    } catch (error) {
      console.error('❌ ERROR EN TESTING FINAL:', error.message);
      throw error;
    }
  }

  /**
   * 🔍 TESTING CONECTIVIDAD BÁSICA
   */
  async testBasicConnectivity() {
    try {
      const { data, error } = await this.makeSupabaseRequest('GET', '/rest/v1/organizaciones?limit=1');
      
      this.results.connectivity_test = {
        success: !error,
        status_code: data ? 200 : (error?.status || 'unknown'),
        message: error ? error.message : 'Conectividad OK',
        tested_at: new Date().toISOString()
      };
      
      if (error) {
        console.log('❌ Conectividad básica falló:', error.message);
      } else {
        console.log('✅ Conectividad básica confirmada');
      }
      
    } catch (error) {
      console.log('❌ Error en conectividad básica:', error.message);
      this.results.connectivity_test = {
        success: false,
        error: error.message,
        tested_at: new Date().toISOString()
      };
    }
  }

  /**
   * 🧪 TESTING TODAS LAS TABLAS CRÍTICAS
   */
  async testAllCriticalTables() {
    for (const table of this.criticalTables) {
      console.log(`  🧪 Testing ${table}...`);
      
      try {
        const tableResult = await this.testTableCompletely(table);
        this.results.crud_operations[table] = tableResult;
        
        // Clasificar tabla como funcional o bloqueada
        if (tableResult.select_success && (tableResult.insert_success || tableResult.rls_detected)) {
          this.results.functional_tables.push({
            table,
            status: tableResult.insert_success ? 'FULLY_FUNCTIONAL' : 'READ_ONLY_RLS',
            operations_working: this.countWorkingOperations(tableResult)
          });
          console.log(`    ✅ ${table}: ${tableResult.insert_success ? 'Completamente funcional' : 'Solo lectura (RLS)'}`);
        } else {
          this.results.blocked_tables.push({
            table,
            status: 'BLOCKED',
            reason: tableResult.primary_error || 'Sin acceso'
          });
          console.log(`    ❌ ${table}: Bloqueada - ${tableResult.primary_error || 'Sin acceso'}`);
        }
        
        // Contabilizar operaciones exitosas
        this.results.successful_operations += this.countWorkingOperations(tableResult);
        
      } catch (error) {
        console.log(`    ❌ ${table}: Error - ${error.message}`);
        this.results.crud_operations[table] = {
          error: error.message,
          tested_at: new Date().toISOString()
        };
        this.results.blocked_tables.push({
          table,
          status: 'ERROR',
          reason: error.message
        });
      }
      
      this.results.total_operations += 4; // SELECT, INSERT, UPDATE, DELETE
      
      // Pausa entre tablas
      await this.sleep(150);
    }
  }

  /**
   * 🧪 TESTING COMPLETO DE UNA TABLA
   */
  async testTableCompletely(table) {
    const result = {
      table_name: table,
      select_success: false,
      insert_success: false,
      update_success: false,
      delete_success: false,
      rls_detected: false,
      primary_error: null,
      operations: {},
      tested_at: new Date().toISOString()
    };

    // 1. SELECT Test
    try {
      const selectResult = await this.makeSupabaseRequest('GET', `/rest/v1/${table}?limit=1`);
      result.select_success = !selectResult.error;
      result.operations.select = {
        success: result.select_success,
        message: selectResult.error ? selectResult.error.message : 'SELECT OK'
      };
      
      if (selectResult.error && !result.primary_error) {
        result.primary_error = selectResult.error.message;
      }
    } catch (error) {
      result.operations.select = { success: false, error: error.message };
      if (!result.primary_error) result.primary_error = error.message;
    }

    // 2. INSERT Test (con datos apropiados para la tabla)
    if (result.select_success) {
      try {
        const testData = this.generateAppropriateTestData(table);
        const insertResult = await this.makeSupabaseRequest('POST', `/rest/v1/${table}`, testData);
        
        result.insert_success = !insertResult.error;
        result.operations.insert = {
          success: result.insert_success,
          message: insertResult.error ? insertResult.error.message : 'INSERT OK',
          data_used: testData
        };

        // Detectar RLS
        if (insertResult.error && insertResult.error.message.includes('row-level security')) {
          result.rls_detected = true;
          result.operations.insert.rls_blocked = true;
        }

        // Si INSERT exitoso, intentar UPDATE y DELETE
        if (result.insert_success && insertResult.data) {
          const insertedId = insertResult.data[0]?.id || insertResult.data.id;
          
          if (insertedId) {
            // 3. UPDATE Test
            try {
              const updateData = { updated_at: new Date().toISOString() };
              const updateResult = await this.makeSupabaseRequest('PATCH', `/rest/v1/${table}?id=eq.${insertedId}`, updateData);
              result.update_success = !updateResult.error;
              result.operations.update = {
                success: result.update_success,
                message: updateResult.error ? updateResult.error.message : 'UPDATE OK'
              };
            } catch (error) {
              result.operations.update = { success: false, error: error.message };
            }

            // 4. DELETE Test
            try {
              const deleteResult = await this.makeSupabaseRequest('DELETE', `/rest/v1/${table}?id=eq.${insertedId}`);
              result.delete_success = !deleteResult.error;
              result.operations.delete = {
                success: result.delete_success,
                message: deleteResult.error ? deleteResult.error.message : 'DELETE OK'
              };
            } catch (error) {
              result.operations.delete = { success: false, error: error.message };
            }
          }
        }

      } catch (error) {
        result.operations.insert = { success: false, error: error.message };
      }
    }

    return result;
  }

  /**
   * 🎲 GENERAR DATOS DE PRUEBA APROPIADOS
   */
  generateAppropriateTestData(table) {
    const timestamp = Date.now();
    const testId = this.testId.substring(0, 8);

    // Datos base
    const baseData = {
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Datos específicos por tabla
    switch (table) {
      case 'organizaciones':
        return {
          ...baseData,
          company_name: `Test Org ${testId}`,
          display_name: `Test Display ${testId}`,
          industry: 'Technology',
          size: 'Small',
          country: 'Chile',
          active: true
        };

      case 'users':
        return {
          ...baseData,
          username: `user_${testId}_${timestamp}`,
          email: `test_${testId}@finaltest.com`,
          first_name: 'Test',
          last_name: 'User',
          is_active: true
        };

      case 'usuarios':
        return {
          ...baseData,
          email: `usuario_${testId}@finaltest.com`,
          rol: 'USER',
          first_name: 'Test',
          last_name: 'Usuario',
          is_active: true
        };

      case 'actividades_dpo':
        return {
          ...baseData,
          tenant_id: 1,
          tipo_actividad: 'TEST',
          descripcion: `Test activity ${testId}`,
          estado: 'PENDIENTE',
          prioridad: 'MEDIA'
        };

      case 'mapeo_datos_rat':
        return {
          ...baseData,
          tenant_id: 1,
          nombre_actividad: `Test RAT ${testId}`,
          descripcion: `Test mapping ${testId}`,
          estado: 'BORRADOR'
        };

      case 'proveedores':
        return {
          ...baseData,
          tenant_id: 1,
          nombre: `Test Provider ${testId}`,
          tipo: 'TECNOLOGIA',
          pais: 'Chile'
        };

      case 'activities':
        return {
          ...baseData,
          tenant_id: 1,
          action: 'TEST_ACTION',
          details: `Test activity ${testId}`
        };

      case 'audit_log':
        return {
          ...baseData,
          tenant_id: 1,
          action: 'TEST',
          table_name: 'test_table',
          success: true
        };

      case 'system_config':
        return {
          ...baseData,
          key: `test_config_${testId}`,
          value: 'test_value',
          description: 'Test configuration'
        };

      // Tablas que pueden aceptar datos mínimos
      case 'compliance_records':
      case 'compliance_reports':
      case 'dpa_documents':
      case 'generated_documents':
        return {
          ...baseData,
          tenant_id: 1,
          data: { test: true, id: testId }
        };

      default:
        // Datos genéricos para otras tablas
        return {
          ...baseData,
          tenant_id: 1,
          data: { test: true, table: table, id: testId }
        };
    }
  }

  /**
   * 🔧 HACER REQUEST A SUPABASE
   */
  async makeSupabaseRequest(method, path, data = null) {
    return new Promise((resolve) => {
      const url = new URL(this.supabaseUrl + path);
      let postData = null;
      
      if (data && (method === 'POST' || method === 'PATCH')) {
        postData = JSON.stringify(data);
      }
      
      const options = {
        hostname: url.hostname,
        port: 443,
        path: url.pathname + url.search,
        method: method,
        headers: {
          'apikey': this.supabaseKey,
          'Authorization': `Bearer ${this.supabaseKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 5000
      };

      if (postData) {
        options.headers['Content-Length'] = Buffer.byteLength(postData);
        if (method === 'POST') {
          options.headers['Prefer'] = 'return=representation';
        }
      }

      const req = https.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => { responseData += chunk; });
        res.on('end', () => {
          try {
            let parsedData = null;
            if (responseData) {
              parsedData = JSON.parse(responseData);
            }

            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve({ data: parsedData, error: null });
            } else {
              resolve({ 
                data: null, 
                error: { 
                  status: res.statusCode, 
                  message: parsedData?.message || responseData || `HTTP ${res.statusCode}`
                } 
              });
            }
          } catch (parseError) {
            resolve({ 
              data: null, 
              error: { 
                status: res.statusCode, 
                message: `Parse error: ${parseError.message}` 
              } 
            });
          }
        });
      });

      req.on('error', (error) => {
        resolve({ data: null, error: { message: error.message } });
      });

      req.setTimeout(5000, () => {
        req.destroy();
        resolve({ data: null, error: { message: 'Request timeout' } });
      });

      if (postData) {
        req.write(postData);
      }
      req.end();
    });
  }

  /**
   * 📊 CONTAR OPERACIONES FUNCIONALES
   */
  countWorkingOperations(tableResult) {
    let count = 0;
    if (tableResult.select_success) count++;
    if (tableResult.insert_success) count++;
    if (tableResult.update_success) count++;
    if (tableResult.delete_success) count++;
    return count;
  }

  /**
   * 📊 ANALIZAR ESTADO DE FUNCIONALIDAD
   */
  analyzeFunctionalityStatus() {
    const total = this.criticalTables.length;
    const functional = this.results.functional_tables.length;
    
    this.results.final_score = Math.round((functional / total) * 100);
    
    // Categorizar resultados
    this.results.summary = {
      total_critical_tables: total,
      fully_functional: this.results.functional_tables.filter(t => t.status === 'FULLY_FUNCTIONAL').length,
      read_only_rls: this.results.functional_tables.filter(t => t.status === 'READ_ONLY_RLS').length,
      completely_blocked: this.results.blocked_tables.length,
      functionality_score: this.results.final_score
    };
  }

  /**
   * 📊 GENERAR REPORTE FINAL
   */
  generateFinalReport(totalTime) {
    const report = {
      test_id: this.testId,
      timestamp: new Date().toISOString(),
      type: 'FINAL_CRITICAL_TESTING',
      
      executive_summary: {
        total_critical_tables_tested: this.criticalTables.length,
        functional_tables: this.results.functional_tables.length,
        blocked_tables: this.results.blocked_tables.length,
        overall_functionality_score: this.results.final_score,
        system_status: this.determineSystemStatus(),
        testing_time_ms: totalTime
      },
      
      connectivity: this.results.connectivity_test,
      detailed_results: this.results.crud_operations,
      functional_analysis: this.results.summary,
      
      functional_tables: this.results.functional_tables,
      blocked_tables: this.results.blocked_tables,
      
      recommendations: this.generateRecommendations(),
      
      next_steps: [
        'Ejecutar comandos SQL RLS como administrador',
        'Re-ejecutar testing después de configurar RLS',
        'Implementar autenticación de usuarios para RLS',
        'Configurar datos iniciales en tablas funcionales'
      ]
    };

    // Guardar reporte final
    const fs = require('fs');
    const filename = `TESTING_FINAL_CRITICO_${this.testId}.json`;
    fs.writeFileSync(filename, JSON.stringify(report, null, 2));
    console.log(`📝 Reporte final guardado: ${filename}`);

    return report;
  }

  /**
   * 🎯 DETERMINAR ESTADO DEL SISTEMA
   */
  determineSystemStatus() {
    if (this.results.final_score >= 80) {
      return 'EXCELLENT';
    } else if (this.results.final_score >= 60) {
      return 'GOOD';
    } else if (this.results.final_score >= 40) {
      return 'NEEDS_CONFIGURATION';
    } else {
      return 'REQUIRES_MAJOR_FIXES';
    }
  }

  /**
   * 💡 GENERAR RECOMENDACIONES
   */
  generateRecommendations() {
    const recommendations = [];
    
    if (this.results.blocked_tables.length > 0) {
      recommendations.push('Ejecutar comandos SQL RLS para desbloquear tablas críticas');
    }
    
    if (this.results.functional_tables.filter(t => t.status === 'READ_ONLY_RLS').length > 0) {
      recommendations.push('Configurar políticas RLS permisivas para desarrollo');
    }
    
    if (this.results.final_score < 80) {
      recommendations.push('Implementar sistema de autenticación para acceso completo');
    }
    
    recommendations.push('Simplificar esquema eliminando 72 tablas innecesarias identificadas');
    
    return recommendations;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// EJECUTAR TESTING FINAL CRÍTICO
if (require.main === module) {
  const tester = new FinalCriticalTesting();
  tester.executeFinalCriticalTesting()
    .then(report => {
      console.log('\n🎉 TESTING FINAL CRÍTICO COMPLETADO');
      console.log(`🎯 SCORE FINAL: ${report.executive_summary.overall_functionality_score}%`);
      console.log(`📊 Estado: ${report.executive_summary.system_status}`);
      console.log(`✅ Funcionales: ${report.executive_summary.functional_tables}/${report.executive_summary.total_critical_tables_tested}`);
      console.log(`⏱️ Tiempo: ${Math.round(report.executive_summary.testing_time_ms/1000)}s`);
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ ERROR EN TESTING FINAL:', error.message);
      process.exit(1);
    });
}

module.exports = FinalCriticalTesting;