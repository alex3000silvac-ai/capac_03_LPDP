/**
 * 🔍 SUPABASE AUDITOR - SISTEMA DE DIAGNÓSTICO
 * 
 * Prueba sistemática de conectividad CRUD con todas las tablas
 * Identifica problemas de infraestructura vs lógica de código
 */

import { supabase } from '../config/supabaseConfig';

export class SupabaseAuditor {
  constructor() {
    this.results = {};
    this.errors = [];
  }

  /**
   * 🚀 AUDITORÍA COMPLETA - MÉTODO PRINCIPAL
   */
  async runCompleteAudit() {
    console.log('🔍 === INICIANDO AUDITORÍA SUPABASE ===');
    
    const tablesToTest = [
      'company_data_templates',
      'rats',
      'system_error_logs',
      'organizaciones', 
      'proveedores',
      'users'
    ];

    // Probar conectividad básica
    await this.testBasicConnectivity();

    // Probar cada tabla
    for (const table of tablesToTest) {
      await this.testTableCRUD(table);
    }

    // Mostrar resumen
    this.showSummary();
    
    return {
      results: this.results,
      errors: this.errors,
      summary: this.getSummary()
    };
  }

  /**
   * 🌐 PROBAR CONECTIVIDAD BÁSICA
   */
  async testBasicConnectivity() {
    console.log('\n🌐 Testing basic connectivity...');
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('✅ Supabase client OK');
      console.log('👤 User:', user?.email || 'Not authenticated');
      
      this.results.connectivity = { success: true, user: user?.email };
    } catch (error) {
      console.log('❌ Connectivity failed:', error.message);
      this.results.connectivity = { success: false, error: error.message };
      this.errors.push(`Connectivity: ${error.message}`);
    }
  }

  /**
   * 📋 PROBAR TABLA ESPECÍFICA
   */
  async testTableCRUD(tableName) {
    console.log(`\n📋 === TESTING TABLE: ${tableName.toUpperCase()} ===`);
    
    const result = {
      exists: false,
      select: false,
      insert: false,
      update: false,
      delete: false,
      structure: null,
      errors: []
    };

    // Test SELECT (verificar existencia y acceso)
    try {
      console.log(`🔍 SELECT test on ${tableName}...`);
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`❌ SELECT failed: ${error.message} (${error.code})`);
        result.errors.push(`SELECT: ${error.message}`);
        this.errors.push(`${tableName} SELECT: ${error.message}`);
        
        if (error.code === '42P01') {
          console.log(`💀 Table ${tableName} does NOT exist`);
          this.results[tableName] = result;
          return;
        }
      } else {
        console.log(`✅ SELECT OK - found ${data?.length || 0} records`);
        result.exists = true;
        result.select = true;
        
        if (data?.[0]) {
          result.structure = Object.keys(data[0]);
          console.log(`📊 Columns:`, result.structure.join(', '));
        }
      }
    } catch (error) {
      console.log(`💥 SELECT exception: ${error.message}`);
      result.errors.push(`SELECT exception: ${error.message}`);
    }

    // Test INSERT (solo si la tabla existe)
    if (result.exists) {
      await this.testInsert(tableName, result);
    }

    this.results[tableName] = result;
  }

  /**
   * ➕ PROBAR INSERT
   */
  async testInsert(tableName, result) {
    const testData = this.generateTestData(tableName);
    
    try {
      console.log(`➕ INSERT test on ${tableName}...`);
      
      const { data, error } = await supabase
        .from(tableName)
        .insert([testData])
        .select();

      if (error) {
        console.log(`❌ INSERT failed: ${error.message} (${error.code})`);
        result.errors.push(`INSERT: ${error.message}`);
        this.errors.push(`${tableName} INSERT: ${error.message}`);
      } else {
        console.log(`✅ INSERT OK`);
        result.insert = true;
        
        // Si INSERT exitoso, probar UPDATE y DELETE para limpiar
        if (data?.[0]?.id) {
          await this.testUpdateDelete(tableName, data[0].id, result);
        }
      }
    } catch (error) {
      console.log(`💥 INSERT exception: ${error.message}`);
      result.errors.push(`INSERT exception: ${error.message}`);
    }
  }

  /**
   * 🔄 PROBAR UPDATE Y DELETE
   */
  async testUpdateDelete(tableName, recordId, result) {
    // Test UPDATE
    try {
      const { error: updateError } = await supabase
        .from(tableName)
        .update({ updated_at: new Date().toISOString() })
        .eq('id', recordId);

      if (!updateError) {
        console.log(`✅ UPDATE OK`);
        result.update = true;
      } else {
        console.log(`❌ UPDATE failed: ${updateError.message}`);
        result.errors.push(`UPDATE: ${updateError.message}`);
      }
    } catch (error) {
      result.errors.push(`UPDATE exception: ${error.message}`);
    }

    // Test DELETE (limpiar datos de prueba)
    try {
      const { error: deleteError } = await supabase
        .from(tableName)
        .delete()
        .eq('id', recordId);

      if (!deleteError) {
        console.log(`✅ DELETE OK - test data cleaned`);
        result.delete = true;
      } else {
        console.log(`❌ DELETE failed: ${deleteError.message}`);
        result.errors.push(`DELETE: ${deleteError.message}`);
      }
    } catch (error) {
      result.errors.push(`DELETE exception: ${error.message}`);
    }
  }

  /**
   * 🎲 GENERAR DATOS DE PRUEBA
   */
  generateTestData(tableName) {
    const timestamp = new Date().toISOString();
    const id = Date.now();

    const testDataMap = {
      company_data_templates: {
        template_name: `audit_${id}`,
        template_type: 'audit_test',
        is_active: true,
        razon_social: 'Audit Test SpA',
        rut_empresa: '11111111-1',
        direccion_empresa: 'Test Street 123',
        email_empresa: `audit${id}@test.cl`,
        nombre_dpo: 'Test DPO'
      },

      rats: {
        titulo: `RAT Audit ${id}`,
        estado: 'borrador',
        descripcion: 'Audit test record'
      },

      system_error_logs: {
        log_level: 'INFO',
        error_code: 'AUDIT_TEST',
        error_message: 'Audit connectivity test',
        source_component: 'AUDIT',
        category: 'TEST',
        timestamp: timestamp
      },

      organizaciones: {
        nombre: `Org Audit ${id}`,
        tipo: 'audit_test'
      },

      proveedores: {
        nombre: `Provider Audit ${id}`,
        tipo: 'audit_test'
      },

      users: {
        email: `audit${id}@test.cl`,
        username: `audit_${id}`,
        is_active: true
      }
    };

    return testDataMap[tableName] || {
      name: `Audit Test ${id}`,
      type: 'audit_test',
      created_at: timestamp
    };
  }

  /**
   * 📊 MOSTRAR RESUMEN
   */
  showSummary() {
    console.log('\n📊 === AUDIT SUMMARY ===');
    
    const summary = this.getSummary();
    
    console.log(`✅ Working tables: ${summary.working}`);
    console.log(`❌ Tables with issues: ${summary.issues}`);
    console.log(`🚨 Total errors: ${this.errors.length}`);

    if (this.errors.length > 0) {
      console.log('\n🚨 ERRORS FOUND:');
      this.errors.forEach((error, i) => {
        console.log(`${i + 1}. ${error}`);
      });
    }

    console.log('\n✨ Audit completed. Review errors before proceeding with business logic.');
  }

  /**
   * 📈 OBTENER RESUMEN
   */
  getSummary() {
    let working = 0;
    let issues = 0;

    for (const [tableName, result] of Object.entries(this.results)) {
      if (tableName === 'connectivity') continue;
      
      if (result.select && result.insert) {
        working++;
      } else {
        issues++;
      }
    }

    return { working, issues, totalErrors: this.errors.length };
  }
}

// Función utilitaria para usar desde consola
export const runSupabaseAudit = async () => {
  const auditor = new SupabaseAuditor();
  return await auditor.runCompleteAudit();
};

// Hacer disponible globalmente para debug
if (typeof window !== 'undefined') {
  window.runSupabaseAudit = runSupabaseAudit;
  console.log('🔍 Supabase Auditor loaded. Run: window.runSupabaseAudit()');
}

export default SupabaseAuditor;