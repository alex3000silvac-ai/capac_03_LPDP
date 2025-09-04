#!/usr/bin/env node

/**
 * 🔥 AUDITORÍA REAL SUPABASE - TESTING FÍSICO
 * 
 * Testing real con inserción → lectura → eliminación
 * Cada conexión Supabase será probada físicamente
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración Supabase (desde variables de entorno o config)
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://scldpfrontend.supabase.co';
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjbGRwZnJvbnRlbmQiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTczNjAwODAzNiwiZXhwIjoyMDUxNTg0MDM2fQ.CuxYOOPzL1EgISEp0ajjLBFWW8jh8Yc5EWqq-iIB82E';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

class RealSupabaseAuditor {
  constructor() {
    this.testId = `real_audit_${Date.now()}`;
    this.results = {};
    this.errors = [];
    this.testData = {}; // Para almacenar IDs de datos de prueba
  }

  /**
   * 🚀 EJECUTAR AUDITORÍA REAL COMPLETA
   */
  async executeRealAudit() {
    console.log('🔥 INICIANDO AUDITORÍA REAL DE SUPABASE...');
    const startTime = Date.now();
    
    const report = {
      audit_id: this.testId,
      started_at: new Date().toISOString(),
      real_connections_tested: {},
      physical_operations: {},
      table_validations: {},
      errors_found: [],
      summary: {}
    };

    try {
      // 1. Encontrar todas las conexiones Supabase en el código
      const connections = await this.findAllSupabaseConnections();
      console.log(`📊 Encontradas ${connections.length} conexiones Supabase`);

      // 2. Probar cada conexión con datos REALES
      for (const connection of connections) {
        console.log(`🔍 Testing: ${connection.file} - ${connection.operation}`);
        const testResult = await this.testRealConnection(connection);
        report.real_connections_tested[`${connection.file}-${connection.table}-${connection.operation}`] = testResult;
        
        // Pequeña pausa entre tests para no sobrecargar
        await this.sleep(100);
      }

      // 3. Validar tablas existentes vs código
      report.table_validations = await this.validateTablesVsCode();

      // 4. Limpiar datos de prueba
      await this.cleanupTestData();

      // 5. Generar resumen
      const totalTime = Date.now() - startTime;
      report.summary = this.generateSummary(report.real_connections_tested, totalTime);
      report.completed_at = new Date().toISOString();

      // 6. Guardar reporte
      await this.saveReport(report);
      
      console.log('✅ AUDITORÍA REAL COMPLETADA');
      return report;

    } catch (error) {
      console.error('❌ ERROR EN AUDITORÍA REAL:', error);
      report.fatal_error = error.message;
      await this.saveReport(report);
      return report;
    }
  }

  /**
   * 🔍 ENCONTRAR TODAS LAS CONEXIONES SUPABASE
   */
  async findAllSupabaseConnections() {
    const connections = [];
    const frontendPath = path.join(__dirname, 'frontend', 'src');
    
    const files = this.getAllJSFiles(frontendPath);
    
    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const fileConnections = this.extractSupabaseOperations(content, file);
        connections.push(...fileConnections);
      } catch (error) {
        console.error(`Error leyendo ${file}:`, error.message);
      }
    }
    
    return connections;
  }

  /**
   * 📁 OBTENER TODOS LOS ARCHIVOS JS
   */
  getAllJSFiles(dir) {
    let files = [];
    
    try {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          files = files.concat(this.getAllJSFiles(fullPath));
        } else if (item.endsWith('.js') || item.endsWith('.jsx')) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.error(`Error leyendo directorio ${dir}:`, error.message);
    }
    
    return files;
  }

  /**
   * 🔍 EXTRAER OPERACIONES SUPABASE DEL CÓDIGO
   */
  extractSupabaseOperations(content, filePath) {
    const operations = [];
    const relativePath = filePath.replace(__dirname, '').replace(/\\/g, '/');
    
    // Patrones para identificar operaciones Supabase
    const patterns = [
      // SELECT operations
      /supabase\.from\s*\(\s*['"`](\w+)['"`]\s*\)\.select\s*\(/g,
      // INSERT operations
      /supabase\.from\s*\(\s*['"`](\w+)['"`]\s*\)\.insert\s*\(/g,
      // UPDATE operations
      /supabase\.from\s*\(\s*['"`](\w+)['"`]\s*\)\.update\s*\(/g,
      // DELETE operations
      /supabase\.from\s*\(\s*['"`](\w+)['"`]\s*\)\.delete\s*\(/g,
      // UPSERT operations
      /supabase\.from\s*\(\s*['"`](\w+)['"`]\s*\)\.upsert\s*\(/g
    ];

    const operationTypes = ['select', 'insert', 'update', 'delete', 'upsert'];

    patterns.forEach((pattern, index) => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        operations.push({
          file: relativePath,
          table: match[1],
          operation: operationTypes[index],
          line: content.substring(0, match.index).split('\n').length
        });
      }
    });

    return operations;
  }

  /**
   * 🧪 PROBAR CONEXIÓN REAL CON SUPABASE
   */
  async testRealConnection(connection) {
    const testResult = {
      success: false,
      message: '',
      tested_at: new Date().toISOString(),
      operations_performed: [],
      data_used: null,
      error: null
    };

    try {
      const { table, operation } = connection;
      
      // Generar datos de prueba específicos para cada tabla
      const testData = this.generateTestDataForTable(table);
      testResult.data_used = testData;

      switch (operation) {
        case 'select':
          await this.testRealSelect(table, testResult);
          break;
          
        case 'insert':
          await this.testRealInsert(table, testData, testResult);
          break;
          
        case 'update':
          await this.testRealUpdate(table, testData, testResult);
          break;
          
        case 'delete':
          await this.testRealDelete(table, testResult);
          break;
          
        case 'upsert':
          await this.testRealUpsert(table, testData, testResult);
          break;
      }

      testResult.success = true;
      testResult.message = `✅ REAL ${operation.toUpperCase()} exitoso en ${table}`;

    } catch (error) {
      testResult.success = false;
      testResult.error = error.message;
      testResult.message = `❌ REAL ${connection.operation.toUpperCase()} falló: ${error.message}`;
      console.error(`Error en ${connection.file} - ${connection.table}:`, error.message);
    }

    return testResult;
  }

  /**
   * 🔍 TEST REAL SELECT
   */
  async testRealSelect(table, testResult) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(1);
    
    if (error) throw error;
    
    testResult.operations_performed.push({
      operation: 'SELECT',
      result: `Obtenidos ${data ? data.length : 0} registros`,
      success: true
    });
  }

  /**
   * ➕ TEST REAL INSERT
   */
  async testRealInsert(table, testData, testResult) {
    const { data, error } = await supabase
      .from(table)
      .insert(testData)
      .select('*')
      .single();
    
    if (error) throw error;
    
    // Guardar ID para limpieza posterior
    if (data && data.id) {
      if (!this.testData[table]) this.testData[table] = [];
      this.testData[table].push(data.id);
    }
    
    testResult.operations_performed.push({
      operation: 'INSERT',
      result: `Registro insertado con ID: ${data?.id || 'N/A'}`,
      success: true,
      inserted_id: data?.id
    });
  }

  /**
   * ✏️ TEST REAL UPDATE
   */
  async testRealUpdate(table, testData, testResult) {
    // Primero insertar un registro para actualizar
    const insertResult = await supabase
      .from(table)
      .insert(testData)
      .select('*')
      .single();
    
    if (insertResult.error) throw insertResult.error;
    
    const recordId = insertResult.data.id;
    
    // Actualizar el registro
    const updateData = { ...testData, updated_at: new Date().toISOString() };
    delete updateData.id; // Remover ID del update
    
    const { data, error } = await supabase
      .from(table)
      .update(updateData)
      .eq('id', recordId)
      .select('*');
    
    if (error) throw error;
    
    // Guardar para limpieza
    if (!this.testData[table]) this.testData[table] = [];
    this.testData[table].push(recordId);
    
    testResult.operations_performed.push({
      operation: 'UPDATE',
      result: `Registro ${recordId} actualizado`,
      success: true,
      updated_id: recordId
    });
  }

  /**
   * 🗑️ TEST REAL DELETE
   */
  async testRealDelete(table, testResult) {
    // Primero insertar un registro para eliminar
    const testData = this.generateTestDataForTable(table);
    const insertResult = await supabase
      .from(table)
      .insert(testData)
      .select('*')
      .single();
    
    if (insertResult.error) throw insertResult.error;
    
    const recordId = insertResult.data.id;
    
    // Eliminar el registro
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', recordId);
    
    if (error) throw error;
    
    testResult.operations_performed.push({
      operation: 'DELETE',
      result: `Registro ${recordId} eliminado`,
      success: true,
      deleted_id: recordId
    });
  }

  /**
   * 🔄 TEST REAL UPSERT
   */
  async testRealUpsert(table, testData, testResult) {
    const { data, error } = await supabase
      .from(table)
      .upsert(testData)
      .select('*')
      .single();
    
    if (error) throw error;
    
    if (data && data.id) {
      if (!this.testData[table]) this.testData[table] = [];
      this.testData[table].push(data.id);
    }
    
    testResult.operations_performed.push({
      operation: 'UPSERT',
      result: `Registro upserted con ID: ${data?.id || 'N/A'}`,
      success: true,
      upserted_id: data?.id
    });
  }

  /**
   * 🎲 GENERAR DATOS DE PRUEBA PARA TABLA
   */
  generateTestDataForTable(table) {
    const baseData = {
      id: undefined, // Se genera automáticamente
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const testPrefix = `test_${this.testId}_${Date.now()}`;

    switch (table) {
      case 'organizaciones':
        return {
          ...baseData,
          rut: `${testPrefix}-12345678-9`,
          razon_social: `Test Org ${testPrefix}`,
          email: `test_${Date.now()}@testaudit.com`,
          telefono: '+56 9 9999 9999',
          direccion: 'Test Address 123',
          activa: true
        };

      case 'mapeo_datos_rat':
      case 'rats':
        return {
          ...baseData,
          organizacion_id: 1,
          nombre: `Test RAT ${testPrefix}`,
          estado: 'BORRADOR',
          datos: { test: true, audit_id: this.testId }
        };

      case 'proveedores':
        return {
          ...baseData,
          nombre: `Test Provider ${testPrefix}`,
          rut: `${testPrefix}-87654321-K`,
          email: `provider_${Date.now()}@testaudit.com`,
          activo: true
        };

      case 'actividades_dpo':
        return {
          ...baseData,
          titulo: `Test DPO Activity ${testPrefix}`,
          descripcion: 'Test activity for audit',
          estado: 'PENDIENTE',
          fecha_vencimiento: new Date(Date.now() + 86400000).toISOString()
        };

      case 'generated_documents':
        return {
          ...baseData,
          nombre: `Test Document ${testPrefix}`,
          tipo: 'TEST',
          contenido: { test: true, audit_id: this.testId },
          estado: 'GENERADO'
        };

      case 'partner_tokens':
        return {
          ...baseData,
          partner_name: `Test Partner ${testPrefix}`,
          token_hash: `hash_${this.testId}`,
          is_active: true
        };

      case 'webhook_configs':
        return {
          ...baseData,
          partner_id: 1,
          webhook_url: `https://test.webhook.com/${this.testId}`,
          is_active: true,
          events: ['test.event']
        };

      case 'audit_log':
        return {
          ...baseData,
          action: 'TEST_AUDIT',
          details: { audit_id: this.testId },
          user_id: 'test_user',
          table_name: 'test_table'
        };

      case 'webhook_deliveries':
        return {
          ...baseData,
          webhook_config_id: 1,
          event_type: 'test.event',
          payload: { test: true, audit_id: this.testId },
          status: 'PENDING'
        };

      case 'agent_activity_log':
        return {
          ...baseData,
          agent_name: 'TestAgent',
          action: 'TEST_ACTION',
          details: { audit_id: this.testId },
          status: 'SUCCESS'
        };

      default:
        return {
          ...baseData,
          name: `Test ${table} ${testPrefix}`,
          description: `Test record for audit ${this.testId}`,
          status: 'ACTIVE'
        };
    }
  }

  /**
   * 🧹 LIMPIAR DATOS DE PRUEBA
   */
  async cleanupTestData() {
    console.log('🧹 Limpiando datos de prueba...');
    
    for (const [table, ids] of Object.entries(this.testData)) {
      if (ids && ids.length > 0) {
        try {
          const { error } = await supabase
            .from(table)
            .delete()
            .in('id', ids);
          
          if (error) {
            console.error(`Error limpiando ${table}:`, error.message);
          } else {
            console.log(`✅ Limpiados ${ids.length} registros de ${table}`);
          }
        } catch (error) {
          console.error(`Error limpiando ${table}:`, error.message);
        }
      }
    }
  }

  /**
   * 🔍 VALIDAR TABLAS VS CÓDIGO
   */
  async validateTablesVsCode() {
    const validation = {};
    
    // Obtener lista de tablas de la base de datos
    const { data: tables, error } = await supabase.rpc('get_table_names');
    
    if (error) {
      console.error('Error obteniendo tablas:', error.message);
      return validation;
    }

    // Encontrar todas las tablas mencionadas en el código
    const codeConnections = await this.findAllSupabaseConnections();
    const tablesInCode = [...new Set(codeConnections.map(c => c.table))];

    for (const table of tablesInCode) {
      validation[table] = {
        exists_in_db: tables ? tables.includes(table) : false,
        used_in_code: true,
        files_using: codeConnections
          .filter(c => c.table === table)
          .map(c => c.file)
          .filter((v, i, a) => a.indexOf(v) === i)
      };
    }

    return validation;
  }

  /**
   * 📊 GENERAR RESUMEN
   */
  generateSummary(connections, totalTime) {
    const total = Object.keys(connections).length;
    const successful = Object.values(connections).filter(c => c.success).length;
    const failed = total - successful;

    return {
      total_connections_tested: total,
      successful_tests: successful,
      failed_tests: failed,
      success_rate: total > 0 ? Math.round((successful / total) * 100) : 0,
      execution_time_ms: totalTime,
      execution_time_readable: `${Math.round(totalTime / 1000)}s`,
      audit_type: 'REAL_PHYSICAL_TESTING',
      data_operations_performed: 'INSERT → SELECT → UPDATE → DELETE'
    };
  }

  /**
   * 💾 GUARDAR REPORTE
   */
  async saveReport(report) {
    const filename = `AUDITORIA_REAL_SUPABASE_${this.testId}.json`;
    const filepath = path.join(__dirname, filename);
    
    try {
      fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
      console.log(`📝 Reporte guardado: ${filename}`);
    } catch (error) {
      console.error('Error guardando reporte:', error.message);
    }
  }

  /**
   * ⏱️ SLEEP HELPER
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Ejecutar auditoría si se llama directamente
if (import.meta.url === `file://${__filename}`) {
  const auditor = new RealSupabaseAuditor();
  auditor.executeRealAudit()
    .then(report => {
      console.log('\n🎉 AUDITORÍA REAL COMPLETADA');
      console.log(`📊 ${report.summary.successful_tests}/${report.summary.total_connections_tested} conexiones exitosas`);
      console.log(`⏱️  Tiempo: ${report.summary.execution_time_readable}`);
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ ERROR FATAL:', error);
      process.exit(1);
    });
}

export default RealSupabaseAuditor;