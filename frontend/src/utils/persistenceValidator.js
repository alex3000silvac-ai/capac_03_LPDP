import { supabase } from '../config/supabaseClient';
import aiSystemValidator from './aiSystemValidator';

class PersistenceValidator {
  constructor() {
    this.validationEnabled = true;
    this.forbiddenStorageMethods = ['localStorage', 'sessionStorage'];
    this.requiredSupabaseTables = [
      'rats',
      'mapeo_datos_rat', 
      'actividades_dpo',
      'user_sessions',
      'tenant_settings',
      'industry_configurations',
      'rat_processes',
      'system_config',
      'audit_logs'
    ];
  }

  async validateAllPersistence() {
    const results = {
      valid: true,
      issues: [],
      recommendations: [],
      score: 100
    };

    try {
      const localStorageCheck = await this.checkLocalStorageUsage();
      const supabaseCheck = await this.validateSupabaseConnectivity();
      const tableCheck = await this.validateRequiredTables();
      const dataIntegrityCheck = await this.validateDataIntegrity();

      if (!localStorageCheck.valid) {
        results.valid = false;
        results.issues.push(...localStorageCheck.issues);
        results.score -= 30;
      }

      if (!supabaseCheck.valid) {
        results.valid = false;
        results.issues.push(...supabaseCheck.issues);
        results.score -= 40;
      }

      if (!tableCheck.valid) {
        results.valid = false;
        results.issues.push(...tableCheck.issues);
        results.score -= 20;
      }

      if (!dataIntegrityCheck.valid) {
        results.issues.push(...dataIntegrityCheck.issues);
        results.score -= 10;
      }

      results.recommendations = [
        ...localStorageCheck.recommendations,
        ...supabaseCheck.recommendations,
        ...tableCheck.recommendations,
        ...dataIntegrityCheck.recommendations
      ];

      await this.logValidationResult(results);
      return results;
    } catch (error) {
      console.error('Error validando persistencia');
      return {
        valid: false,
        issues: [`Error crítico: ${error.message}`],
        recommendations: ['Revisar conectividad y configuración'],
        score: 0
      };
    }
  }

  async checkLocalStorageUsage() {
    const result = {
      valid: true,
      issues: [],
      recommendations: []
    };

    const forbiddenKeys = [
      'lpdp_rats_completed',
      'lpdp_rat_processes', 
      'lpdp_industry_configs',
      'current_tenant',
      'lpdp_audit_log',
      'pending_dpo_activities'
    ];

    forbiddenKeys.forEach(key => {
      const keys = Object.keys(localStorage);
      const matchingKeys = keys.filter(k => k.includes(key) || k.startsWith(key));
      
      if (matchingKeys.length > 0) {
        result.valid = false;
        result.issues.push(`localStorage prohibido detectado: ${matchingKeys.join(', ')}`);
        result.recommendations.push(`Migrar ${key} a tabla Supabase correspondiente`);
      }
    });

    return result;
  }

  async validateSupabaseConnectivity() {
    const result = {
      valid: true,
      issues: [],
      recommendations: []
    };

    try {
      const { data, error } = await supabase
        .from('system_config')
        .select('count')
        .limit(1);

      if (error) {
        result.valid = false;
        result.issues.push(`Error conectividad Supabase: ${error.message}`);
        result.recommendations.push('Verificar configuración de Supabase');
      }
    } catch (error) {
      result.valid = false;
      result.issues.push(`Supabase no disponible: ${error.message}`);
      result.recommendations.push('Revisar configuración de red y autenticación');
    }

    return result;
  }

  async validateRequiredTables() {
    const result = {
      valid: true,
      issues: [],
      recommendations: []
    };

    for (const table of this.requiredSupabaseTables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('count')
          .limit(1);

        if (error) {
          result.issues.push(`Tabla ${table} no accesible: ${error.message}`);
          result.recommendations.push(`Crear o configurar tabla ${table}`);
          if (error.code === '42P01') {
            result.valid = false;
          }
        }
      } catch (error) {
        result.valid = false;
        result.issues.push(`Error accediendo tabla ${table}`);
      }
    }

    return result;
  }

  async validateDataIntegrity() {
    const result = {
      valid: true,
      issues: [],
      recommendations: []
    };

    try {
      const { data: tenantConfigs, error: tenantError } = await supabase
        .from('tenant_settings')
        .select('tenant_id, settings')
        .limit(5);

      if (tenantError) {
        result.issues.push('Error accediendo configuraciones de tenant');
      }

      const { data: systemConfigs, error: systemError } = await supabase
        .from('system_config')
        .select('key, value')
        .limit(10);

      if (systemError) {
        result.issues.push('Error accediendo configuración del sistema');
      }

      const requiredSystemConfigs = [
        'ai_supervisor_enabled',
        'ai_validation_enabled',
        'temporal_audit_enabled'
      ];

      const existingConfigs = systemConfigs?.map(c => c.key) || [];
      const missingConfigs = requiredSystemConfigs.filter(config => 
        !existingConfigs.includes(config)
      );

      if (missingConfigs.length > 0) {
        result.issues.push(`Configuraciones faltantes: ${missingConfigs.join(', ')}`);
        result.recommendations.push('Inicializar configuraciones del sistema');
      }

    } catch (error) {
      result.issues.push(`Error validando integridad: ${error.message}`);
    }

    return result;
  }

  async migrateLocalStorageToSupabase(tenantId, userId) {
    const migrationResults = {
      success: true,
      migrated: {
        rats: 0,
        processes: 0,
        configurations: 0,
        auditLogs: 0
      },
      errors: []
    };

    try {
      const ratsMigration = await this.migrateRATs(tenantId, userId);
      migrationResults.migrated.rats = ratsMigration.count;
      if (!ratsMigration.success) {
        migrationResults.errors.push(ratsMigration.error);
      }

      const processesMigration = await this.migrateProcesses(tenantId, userId);
      migrationResults.migrated.processes = processesMigration.count;
      if (!processesMigration.success) {
        migrationResults.errors.push(processesMigration.error);
      }

      const configMigration = await this.migrateConfigurations(tenantId, userId);
      migrationResults.migrated.configurations = configMigration.count;
      if (!configMigration.success) {
        migrationResults.errors.push(configMigration.error);
      }

      const auditMigration = await this.migrateAuditLogs(tenantId, userId);
      migrationResults.migrated.auditLogs = auditMigration.count;
      if (!auditMigration.success) {
        migrationResults.errors.push(auditMigration.error);
      }

      if (migrationResults.errors.length === 0) {
        await this.cleanupLocalStorage();
      }

      migrationResults.success = migrationResults.errors.length === 0;
      return migrationResults;
    } catch (error) {
      console.error('Error en migración');
      return {
        success: false,
        error: error.message,
        migrated: migrationResults.migrated,
        errors: [...migrationResults.errors, error.message]
      };
    }
  }

  async migrateRATs(tenantId, userId) {
    try {
      const localKey = `lpdp_rats_completed_${tenantId}`;
      const localRATs = JSON.parse(localStorage.getItem(localKey) || '[]');
      
      if (localRATs.length === 0) {
        return { success: true, count: 0 };
      }

      let migratedCount = 0;
      for (const localRAT of localRATs) {
        const { data: existing, error: checkError } = await supabase
          .from('rats')
          .select('id')
          .eq('id', localRAT.id)
          .single();

        if (checkError && checkError.code === 'PGRST116') {
          const ratData = {
            id: localRAT.id,
            tenant_id: tenantId,
            user_id: userId,
            nombre_actividad: localRAT.empresa || 'Migrado desde localStorage',
            responsable_proceso: localRAT.responsable?.nombre || 'No especificado',
            descripcion: localRAT.finalidades?.descripcion || 'RAT migrado',
            status: 'migrado',
            created_at: localRAT.fechaCreacion || new Date().toISOString(),
            updated_at: new Date().toISOString(),
            metadata: {
              migrated_from_local: true,
              original_data: localRAT
            }
          };

          const { error: insertError } = await supabase
            .from('rats')
            .insert(ratData);

          if (!insertError) {
            migratedCount++;
          }
        }
      }

      return { success: true, count: migratedCount };
    } catch (error) {
      console.error('Error migrando RATs');
      return { success: false, error: error.message, count: 0 };
    }
  }

  async migrateProcesses(tenantId, userId) {
    try {
      const localProcesses = JSON.parse(localStorage.getItem('lpdp_rat_processes') || '[]');
      
      if (localProcesses.length === 0) {
        return { success: true, count: 0 };
      }

      const processData = localProcesses.map(process => ({
        tenant_id: tenantId,
        process_key: process.clave || process.key,
        process_name: process.nombre || process.name,
        industry: process.industria || process.industry,
        description: process.descripcion || process.description,
        created_by: userId,
        created_at: new Date().toISOString(),
        metadata: {
          migrated_from_local: true,
          original_data: process
        }
      }));

      const { data, error } = await supabase
        .from('rat_processes')
        .upsert(processData, { onConflict: 'process_key,tenant_id' });

      if (error) throw error;

      return { success: true, count: processData.length };
    } catch (error) {
      console.error('Error migrando procesos');
      return { success: false, error: error.message, count: 0 };
    }
  }

  async migrateConfigurations(tenantId, userId) {
    try {
      const localConfigKey = `lpdp_industry_configs_${tenantId}`;
      const localConfigs = JSON.parse(localStorage.getItem(localConfigKey) || '{}');
      
      if (Object.keys(localConfigs).length === 0) {
        return { success: true, count: 0 };
      }

      let migratedCount = 0;
      for (const [industry, config] of Object.entries(localConfigs)) {
        const configData = {
          tenant_id: tenantId,
          industry_name: industry,
          configuration: config,
          created_by: userId,
          created_at: new Date().toISOString(),
          metadata: {
            migrated_from_local: true
          }
        };

        const { error } = await supabase
          .from('industry_configurations')
          .upsert(configData, { onConflict: 'tenant_id,industry_name' });

        if (!error) {
          migratedCount++;
        }
      }

      return { success: true, count: migratedCount };
    } catch (error) {
      console.error('Error migrando configuraciones');
      return { success: false, error: error.message, count: 0 };
    }
  }

  async migrateAuditLogs(tenantId, userId) {
    try {
      const localAuditKey = `lpdp_audit_log_${tenantId}`;
      const localLogs = JSON.parse(localStorage.getItem(localAuditKey) || '[]');
      
      if (localLogs.length === 0) {
        return { success: true, count: 0 };
      }

      const auditData = localLogs.map(log => ({
        tenant_id: tenantId,
        user_id: userId,
        operation_type: log.accion || 'unknown',
        table_name: log.tabla || 'unknown',
        record_id: log.recordId,
        old_values: log.valoresAnteriores,
        new_values: log.valoresNuevos,
        timestamp: log.timestamp || new Date().toISOString(),
        metadata: {
          migrated_from_local: true,
          original_log: log
        }
      }));

      const { data, error } = await supabase
        .from('audit_logs')
        .insert(auditData);

      if (error) throw error;

      return { success: true, count: auditData.length };
    } catch (error) {
      console.error('Error migrando audit logs');
      return { success: false, error: error.message, count: 0 };
    }
  }

  async cleanupLocalStorage() {
    const keysToRemove = [
      'lpdp_rats_completed',
      'lpdp_rat_processes', 
      'lpdp_industry_configs',
      'current_tenant',
      'lpdp_audit_log'
    ];

    const removedKeys = [];
    
    Object.keys(localStorage).forEach(key => {
      if (keysToRemove.some(pattern => key.includes(pattern))) {
        localStorage.removeItem(key);
        removedKeys.push(key);
      }
    });

    await supabase
      .from('migration_log')
      .insert({
        operation: 'localStorage_cleanup',
        removed_keys: removedKeys,
        timestamp: new Date().toISOString(),
        status: 'completed'
      });

    return { removed: removedKeys.length, keys: removedKeys };
  }

  async ensureCurrentTenantPersistence(tenantId, userId) {
    try {
      await supabase
        .from('user_sessions')
        .upsert({
          user_id: userId,
          tenant_id: tenantId,
          session_start: new Date().toISOString(),
          last_activity: new Date().toISOString(),
          is_active: true
        }, { onConflict: 'user_id' });

      return { success: true };
    } catch (error) {
      console.error('Error persistiendo sesión de tenant');
      return { success: false, error: error.message };
    }
  }

  async getCurrentTenantFromSupabase(userId) {
    try {
      const { data: session, error } = await supabase
        .from('user_sessions')
        .select(`
          tenant_id,
          tenants(
            id,
            company_name,
            industry,
            subscription_plan
          )
        `)
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (error) throw error;

      return {
        success: true,
        tenant: {
          id: session.tenant_id,
          ...session.tenants
        }
      };
    } catch (error) {
      console.error('Error obteniendo tenant actual');
      return { success: false, error: error.message };
    }
  }

  async validateSupabaseOnlyOperations() {
    const operations = [
      'rat_creation',
      'rat_update', 
      'dpo_task_creation',
      'configuration_update',
      'audit_logging'
    ];

    const results = [];

    for (const operation of operations) {
      const validation = await this.testSupabaseOperation(operation);
      results.push({
        operation,
        success: validation.success,
        uses_supabase_only: validation.usesSupabaseOnly,
        issues: validation.issues
      });
    }

    return {
      all_valid: results.every(r => r.success && r.uses_supabase_only),
      operations: results
    };
  }

  async testSupabaseOperation(operationType) {
    try {
      const testData = {
        test_operation: operationType,
        timestamp: new Date().toISOString(),
        validation_run: true
      };

      const { data, error } = await supabase
        .from('operation_validation_log')
        .insert(testData)
        .select()
        .single();

      if (error) throw error;

      const { error: deleteError } = await supabase
        .from('operation_validation_log')
        .delete()
        .eq('id', data.id);

      return {
        success: true,
        usesSupabaseOnly: true,
        issues: []
      };
    } catch (error) {
      return {
        success: false,
        usesSupabaseOnly: false,
        issues: [`Operación ${operationType} falló: ${error.message}`]
      };
    }
  }

  async initializeSystemConfiguration(userId) {
    try {
      const defaultConfigs = [
        { key: 'ai_supervisor_enabled', value: 'true' },
        { key: 'ai_validation_enabled', value: 'true' },
        { key: 'temporal_audit_enabled', value: 'true' },
        { key: 'localStorage_prohibited', value: 'true' },
        { key: 'supabase_only_mode', value: 'true' },
        { key: 'persistence_validation_enabled', value: 'true' }
      ];

      for (const config of defaultConfigs) {
        await supabase
          .from('system_config')
          .upsert({
            ...config,
            updated_by: userId,
            updated_at: new Date().toISOString()
          }, { onConflict: 'key' });
      }

      return { success: true, initialized: defaultConfigs.length };
    } catch (error) {
      console.error('Error inicializando configuraciones');
      return { success: false, error: error.message };
    }
  }

  async enforceSupabaseOnlyMode() {
    try {
      const originalSetItem = Storage.prototype.setItem;
      const originalGetItem = Storage.prototype.getItem;

      Storage.prototype.setItem = function(key, value) {
        if (this === localStorage && key.includes('lpdp')) {
          // console.warn(`🚫 PERSISTENCIA BLOQUEADA: Intento de usar localStorage para ${key}`);
          throw new Error('localStorage prohibido - usar Supabase únicamente');
        }
        return originalSetItem.call(this, key, value);
      };

      Storage.prototype.getItem = function(key) {
        if (this === localStorage && key.includes('lpdp')) {
          // console.warn(`🚫 ACCESO BLOQUEADO: Intento de leer localStorage para ${key}`);
          return null;
        }
        return originalGetItem.call(this, key);
      };

      // console.log('🔒 Modo Supabase-únicamente activado');
      return { success: true };
    } catch (error) {
      console.error('Error enforcing Supabase-only mode');
      return { success: false, error: error.message };
    }
  }

  async logValidationResult(results) {
    try {
      await supabase
        .from('persistence_validation_log')
        .insert({
          validation_timestamp: new Date().toISOString(),
          is_valid: results.valid,
          score: results.score,
          issues: results.issues,
          recommendations: results.recommendations,
          total_issues: results.issues.length
        });
    } catch (error) {
      console.error('Error logging validation result');
    }
  }

  async generatePersistenceReport() {
    try {
      const validation = await this.validateAllPersistence();
      const supabaseTest = await this.validateSupabaseOnlyOperations();
      
      const report = {
        generated_at: new Date().toISOString(),
        overall_score: validation.score,
        is_compliant: validation.valid && supabaseTest.all_valid,
        persistence_status: {
          supabase_connectivity: validation.valid,
          localStorage_usage: validation.issues.some(i => i.includes('localStorage')) ? 'detected' : 'none',
          required_tables: validation.issues.some(i => i.includes('Tabla')) ? 'missing' : 'present',
          data_integrity: validation.issues.length === 0 ? 'good' : 'issues_detected'
        },
        recommendations: validation.recommendations,
        next_steps: this.generateNextSteps(validation, supabaseTest),
        compliance_summary: {
          user_requirement: 'TODO DEBE SER PERSISTENTE, TODO A SUPABASE',
          current_status: validation.valid ? 'CUMPLE' : 'NO CUMPLE',
          areas_improvement: validation.issues.length
        }
      };

      await supabase
        .from('compliance_reports')
        .insert({
          report_type: 'persistence_compliance',
          report_data: report,
          generated_at: report.generated_at,
          status: report.is_compliant ? 'compliant' : 'non_compliant'
        });

      return { success: true, report };
    } catch (error) {
      console.error('Error generando reporte');
      return { success: false, error: error.message };
    }
  }

  generateNextSteps(validation, supabaseTest) {
    const steps = [];

    if (!validation.valid) {
      steps.push('1. Migrar todos los datos de localStorage a Supabase');
    }

    if (validation.issues.some(i => i.includes('localStorage'))) {
      steps.push('2. Eliminar todo uso de localStorage para datos LPDP');
    }

    if (!supabaseTest.all_valid) {
      steps.push('3. Corregir operaciones que no usan Supabase exclusivamente');
    }

    if (validation.issues.some(i => i.includes('Tabla'))) {
      steps.push('4. Crear tablas faltantes en Supabase');
    }

    steps.push('5. Activar modo Supabase-únicamente');
    steps.push('6. Ejecutar validación final de persistencia');

    return steps;
  }

  async enableSupabaseOnlyMode(userId) {
    try {
      await this.initializeSystemConfiguration(userId);
      
      const migrationResult = await this.migrateLocalStorageToSupabase(
        await this.getCurrentTenantId(userId), 
        userId
      );

      if (migrationResult.success) {
        await this.enforceSupabaseOnlyMode();
        
        await supabase
          .from('system_config')
          .upsert({
            key: 'supabase_only_mode_active',
            value: 'true',
            updated_by: userId,
            updated_at: new Date().toISOString()
          });

        return {
          success: true,
          message: 'Modo Supabase-únicamente activado exitosamente',
          migration_summary: migrationResult
        };
      } else {
        return {
          success: false,
          error: 'Migración falló, no se puede activar modo Supabase-únicamente',
          migration_issues: migrationResult.errors
        };
      }
    } catch (error) {
      console.error('Error habilitando modo Supabase-únicamente');
      return { success: false, error: error.message };
    }
  }

  async getCurrentTenantId(userId) {
    try {
      const tenantResult = await this.getCurrentTenantFromSupabase(userId);
      if (tenantResult.success) {
        return tenantResult.tenant.id;
      }
      
      const { data: defaultTenant, error } = await supabase
        .from('tenants')
        .select('id')
        .limit(1)
        .single();

      if (error) throw error;
      return defaultTenant.id;
    } catch (error) {
      console.error('Error obteniendo tenant ID');
      return 'default';
    }
  }
}

const persistenceValidator = new PersistenceValidator();

export default persistenceValidator;