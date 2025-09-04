const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

/**
 * 🔥 AUDITOR REAL SUPABASE SIMPLIFICADO
 * 
 * Testing FÍSICO real con datos reales
 */

class RealSupabaseAuditor {
  constructor() {
    this.testId = `real_${Date.now()}`;
    this.results = {};
    this.testData = {};
    
    // Configuración Supabase - usando las mismas variables que el sistema
    this.supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://scldpfrontend.supabase.co';
    this.supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjbGRwZnJvbnRlbmQiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTczNjAwODAzNiwiZXhwIjoyMDUxNTg0MDM2fQ.CuxYOOPzL1EgISEp0ajjLBFWW8jh8Yc5EWqq-iIB82E';
    
    this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
    
    console.log('🔥 AUDITOR REAL INICIADO');
    console.log(`📡 URL: ${this.supabaseUrl}`);
    console.log(`🔑 Key: ${this.supabaseKey.substring(0, 20)}...`);
  }

  /**
   * 🚀 EJECUTAR AUDITORÍA REAL
   */
  async executeRealAudit() {
    console.log('\n🔥 INICIANDO AUDITORÍA FÍSICA REAL...');
    const startTime = Date.now();
    
    const report = {
      audit_id: this.testId,
      started_at: new Date().toISOString(),
      type: 'REAL_PHYSICAL_TESTING',
      connections_tested: {},
      errors: [],
      summary: {}
    };

    try {
      // Test de conectividad inicial
      console.log('🔍 Testando conectividad inicial...');
      await this.testInitialConnection();

      // Obtener conexiones del código
      console.log('📚 Analizando código para encontrar conexiones...');
      const connections = await this.findSupabaseConnections();
      console.log(`📊 Encontradas ${connections.length} conexiones Supabase`);

      // Probar cada conexión FÍSICAMENTE
      for (const connection of connections.slice(0, 10)) { // Limitar a 10 para evitar saturar
        console.log(`🧪 TESTING REAL: ${connection.table} - ${connection.operation}`);
        const testResult = await this.testPhysicalConnection(connection);
        report.connections_tested[`${connection.file}-${connection.table}-${connection.operation}`] = testResult;
        
        // Pausa entre tests
        await this.sleep(200);
      }

      // Limpiar datos de prueba
      await this.cleanupTestData();

      // Generar resumen
      const totalTime = Date.now() - startTime;
      report.summary = this.generateSummary(report.connections_tested, totalTime);
      report.completed_at = new Date().toISOString();

      // Guardar reporte
      await this.saveReport(report);
      
      console.log('\n✅ AUDITORÍA FÍSICA COMPLETADA');
      console.log(`📊 Éxito: ${report.summary.successful}/${report.summary.total}`);
      console.log(`⏱️  Tiempo: ${Math.round(totalTime/1000)}s`);
      
      return report;

    } catch (error) {
      console.error('❌ ERROR EN AUDITORÍA:', error.message);
      report.fatal_error = error.message;
      await this.saveReport(report);
      return report;
    }
  }

  /**
   * 🔗 TEST DE CONECTIVIDAD INICIAL
   */
  async testInitialConnection() {
    const { data, error } = await this.supabase
      .from('organizaciones')
      .select('count')
      .limit(1);
    
    if (error) {
      throw new Error(`Fallo conectividad inicial: ${error.message}`);
    }
    
    console.log('✅ Conectividad confirmada');
  }

  /**
   * 🔍 ENCONTRAR CONEXIONES SUPABASE
   */
  async findSupabaseConnections() {
    const connections = [];
    const frontendPath = path.join(__dirname, 'frontend', 'src');
    
    const files = this.getAllJSFiles(frontendPath);
    
    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const fileConnections = this.extractSupabaseOps(content, file);
        connections.push(...fileConnections);
      } catch (error) {
        console.error(`Error leyendo ${file}: ${error.message}`);
      }
    }
    
    return connections;
  }

  /**
   * 📁 OBTENER ARCHIVOS JS
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
      // Ignorar directorios que no existen o no son accesibles
    }
    
    return files;
  }

  /**
   * 🔍 EXTRAER OPERACIONES SUPABASE
   */
  extractSupabaseOps(content, filePath) {
    const operations = [];
    const relativePath = filePath.replace(__dirname, '').replace(/\\/g, '/');
    
    // Buscar operaciones supabase.from()
    const fromPattern = /supabase\.from\s*\(\s*['"`](\w+)['"`]\s*\)\s*\.\s*(\w+)\s*\(/g;
    
    let match;
    while ((match = fromPattern.exec(content)) !== null) {
      const table = match[1];
      const operation = match[2];
      
      if (['select', 'insert', 'update', 'delete', 'upsert'].includes(operation)) {
        operations.push({
          file: relativePath,
          table,
          operation,
          line: content.substring(0, match.index).split('\n').length
        });
      }
    }

    return operations;
  }

  /**
   * 🧪 PROBAR CONEXIÓN FÍSICA
   */
  async testPhysicalConnection(connection) {
    const result = {
      success: false,
      message: '',
      tested_at: new Date().toISOString(),
      operations: [],
      error: null
    };

    try {
      const { table, operation } = connection;
      
      switch (operation) {
        case 'select':
          await this.testRealSelect(table, result);
          break;
        case 'insert':
          await this.testRealInsert(table, result);
          break;
        case 'update':
          await this.testRealUpdate(table, result);
          break;
        case 'delete':
          await this.testRealDelete(table, result);
          break;
        case 'upsert':
          await this.testRealUpsert(table, result);
          break;
      }

      result.success = true;
      result.message = `✅ FÍSICO ${operation.toUpperCase()} exitoso`;
      
    } catch (error) {
      result.success = false;
      result.error = error.message;
      result.message = `❌ FÍSICO ${connection.operation.toUpperCase()} falló: ${error.message}`;
    }

    return result;
  }

  /**
   * 📖 TEST SELECT FÍSICO
   */
  async testRealSelect(table, result) {
    const { data, error } = await this.supabase
      .from(table)
      .select('*')
      .limit(1);
    
    if (error) throw error;
    
    result.operations.push({
      type: 'SELECT',
      result: `Leídos ${data ? data.length : 0} registros`,
      table,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * ➕ TEST INSERT FÍSICO
   */
  async testRealInsert(table, result) {
    const testData = this.generateTestData(table);
    
    const { data, error } = await this.supabase
      .from(table)
      .insert(testData)
      .select('*')
      .single();
    
    if (error) throw error;
    
    // Guardar para limpieza
    if (data && data.id) {
      if (!this.testData[table]) this.testData[table] = [];
      this.testData[table].push(data.id);
    }
    
    result.operations.push({
      type: 'INSERT',
      result: `Insertado ID: ${data?.id || 'N/A'}`,
      table,
      inserted_id: data?.id,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * ✏️ TEST UPDATE FÍSICO
   */
  async testRealUpdate(table, result) {
    // Insertar primero
    const testData = this.generateTestData(table);
    const insertResult = await this.supabase
      .from(table)
      .insert(testData)
      .select('*')
      .single();
    
    if (insertResult.error) throw insertResult.error;
    
    const recordId = insertResult.data.id;
    
    // Ahora actualizar
    const updateData = { ...testData, updated_at: new Date().toISOString() };
    delete updateData.id;
    
    const { data, error } = await this.supabase
      .from(table)
      .update(updateData)
      .eq('id', recordId)
      .select('*');
    
    if (error) throw error;
    
    // Guardar para limpieza
    if (!this.testData[table]) this.testData[table] = [];
    this.testData[table].push(recordId);
    
    result.operations.push({
      type: 'UPDATE',
      result: `Actualizado ID: ${recordId}`,
      table,
      updated_id: recordId,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 🗑️ TEST DELETE FÍSICO
   */
  async testRealDelete(table, result) {
    // Insertar primero
    const testData = this.generateTestData(table);
    const insertResult = await this.supabase
      .from(table)
      .insert(testData)
      .select('*')
      .single();
    
    if (insertResult.error) throw insertResult.error;
    
    const recordId = insertResult.data.id;
    
    // Ahora eliminar
    const { error } = await this.supabase
      .from(table)
      .delete()
      .eq('id', recordId);
    
    if (error) throw error;
    
    result.operations.push({
      type: 'DELETE',
      result: `Eliminado ID: ${recordId}`,
      table,
      deleted_id: recordId,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 🔄 TEST UPSERT FÍSICO
   */
  async testRealUpsert(table, result) {
    const testData = this.generateTestData(table);
    
    const { data, error } = await this.supabase
      .from(table)
      .upsert(testData)
      .select('*')
      .single();
    
    if (error) throw error;
    
    if (data && data.id) {
      if (!this.testData[table]) this.testData[table] = [];
      this.testData[table].push(data.id);
    }
    
    result.operations.push({
      type: 'UPSERT',
      result: `Upserted ID: ${data?.id || 'N/A'}`,
      table,
      upserted_id: data?.id,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 🎲 GENERAR DATOS DE PRUEBA
   */
  generateTestData(table) {
    const timestamp = Date.now();
    const testPrefix = `audit_${this.testId}`;

    const baseData = {
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    switch (table) {
      case 'organizaciones':
        return {
          ...baseData,
          rut: `${testPrefix}-${timestamp}`,
          razon_social: `Test Org ${timestamp}`,
          email: `test_${timestamp}@audit.test`,
          telefono: '+56 9 9999 9999',
          activa: true
        };

      case 'mapeo_datos_rat':
      case 'rats':
        return {
          ...baseData,
          nombre: `Test RAT ${timestamp}`,
          estado: 'BORRADOR',
          datos: { test: true, audit: this.testId }
        };

      case 'proveedores':
        return {
          ...baseData,
          nombre: `Test Provider ${timestamp}`,
          rut: `${testPrefix}-${timestamp}-K`,
          email: `provider_${timestamp}@audit.test`,
          activo: true
        };

      case 'actividades_dpo':
        return {
          ...baseData,
          titulo: `Test Activity ${timestamp}`,
          descripcion: 'Audit test activity',
          estado: 'PENDIENTE'
        };

      default:
        return {
          ...baseData,
          nombre: `Test ${table} ${timestamp}`,
          descripcion: `Test record ${this.testId}`,
          estado: 'ACTIVO'
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
          const { error } = await this.supabase
            .from(table)
            .delete()
            .in('id', ids);
          
          if (!error) {
            console.log(`✅ Limpiados ${ids.length} registros de ${table}`);
          }
        } catch (error) {
          console.error(`Error limpiando ${table}:`, error.message);
        }
      }
    }
  }

  /**
   * 📊 GENERAR RESUMEN
   */
  generateSummary(connections, totalTime) {
    const total = Object.keys(connections).length;
    const successful = Object.values(connections).filter(c => c.success).length;
    const failed = total - successful;

    return {
      total,
      successful,
      failed,
      success_rate: total > 0 ? Math.round((successful / total) * 100) : 0,
      execution_time_ms: totalTime,
      type: 'PHYSICAL_REAL_TESTING'
    };
  }

  /**
   * 💾 GUARDAR REPORTE
   */
  async saveReport(report) {
    const filename = `AUDITORIA_FISICA_REAL_${this.testId}.json`;
    const filepath = path.join(__dirname, filename);
    
    try {
      fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
      console.log(`📝 Reporte guardado: ${filename}`);
    } catch (error) {
      console.error('Error guardando reporte:', error.message);
    }
  }

  /**
   * ⏱️ SLEEP
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  const auditor = new RealSupabaseAuditor();
  auditor.executeRealAudit()
    .then(report => {
      console.log('\n🎉 AUDITORÍA FÍSICA REAL COMPLETADA');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ ERROR FATAL:', error);
      process.exit(1);
    });
}

module.exports = RealSupabaseAuditor;