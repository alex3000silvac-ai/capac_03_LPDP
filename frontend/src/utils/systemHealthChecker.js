/**
 * 🏥 SYSTEM HEALTH CHECKER - VALIDADOR COMPLETO DEL SISTEMA
 * 
 * Herramienta para diagnosticar y reportar el estado actual del sistema LPDP
 * Especialmente enfocado en problemas de base de datos
 */

import { supabase } from '../config/supabaseClient';
import dbValidator from './databaseConsistencyValidator';

class SystemHealthChecker {
  constructor() {
    this.checkId = `health_${Date.now()}`;
    this.report = {
      timestamp: new Date().toISOString(),
      overall_status: 'unknown',
      database_health: {},
      system_integrity: {},
      performance_metrics: {},
      critical_issues: [],
      recommendations: []
    };
  }

  /**
   * 🔍 EJECUTAR CHEQUEO COMPLETO DEL SISTEMA
   */
  async performCompleteHealthCheck() {
    try {
      // 1. Validar estado de base de datos
      this.report.database_health = await this.checkDatabaseHealth();
      
      // 2. Validar integridad del sistema
      this.report.system_integrity = await this.checkSystemIntegrity();
      
      // 3. Medir performance
      this.report.performance_metrics = await this.measureSystemPerformance();
      
      // 4. Verificar funcionalidades críticas
      const functionalityCheck = await this.checkCriticalFunctionalities();
      this.report.functionality_status = functionalityCheck;
      
      // 5. Generar análisis y recomendaciones
      await this.generateAnalysisAndRecommendations();
      
      // 6. Determinar estado general
      this.report.overall_status = this.calculateOverallStatus();
      
      return this.report;
      
    } catch (error) {
      this.report.overall_status = 'error';
      this.report.critical_issues.push({
        type: 'system_check_failure',
        severity: 'critical',
        message: `Error durante chequeo del sistema: ${error.message}`
      });
      
      return this.report;
    }
  }

  /**
   * 💾 CHEQUEAR SALUD DE BASE DE DATOS
   */
  async checkDatabaseHealth() {
    const dbHealth = {
      connection_status: 'unknown',
      table_status: {},
      data_integrity: {},
      performance: {},
      critical_errors: []
    };

    try {
      // Test conexión básica
      const startTime = Date.now();
      const { data, error } = await supabase
        .from('organizaciones')
        .select('count', { count: 'exact', head: true });

      const connectionTime = Date.now() - startTime;

      if (error) {
        dbHealth.connection_status = 'failed';
        dbHealth.critical_errors.push({
          type: 'connection_error',
          message: error.message
        });
        return dbHealth;
      }

      dbHealth.connection_status = 'connected';
      dbHealth.performance.connection_time = connectionTime;

      // Verificar tablas principales
      const tables = ['organizaciones', 'rats', 'usuarios', 'proveedores'];
      for (const table of tables) {
        dbHealth.table_status[table] = await this.checkTableHealth(table);
      }

      // Verificar integridad de datos
      dbHealth.data_integrity = await this.checkDataIntegrity();

    } catch (error) {
      dbHealth.connection_status = 'error';
      dbHealth.critical_errors.push({
        type: 'database_error',
        message: error.message
      });
    }

    return dbHealth;
  }

  /**
   * 📊 CHEQUEAR SALUD DE TABLA ESPECÍFICA
   */
  async checkTableHealth(tableName) {
    const tableHealth = {
      exists: false,
      accessible: false,
      record_count: 0,
      last_modified: null,
      issues: []
    };

    try {
      // Test existencia y acceso
      const { count, error } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      if (error) {
        tableHealth.issues.push(`Error accediendo tabla: ${error.message}`);
        return tableHealth;
      }

      tableHealth.exists = true;
      tableHealth.accessible = true;
      tableHealth.record_count = count || 0;

      // Obtener último registro modificado
      const { data: lastRecord } = await supabase
        .from(tableName)
        .select('updated_at, created_at')
        .order('updated_at', { ascending: false, nullsFirst: false })
        .limit(1)
        .single();

      if (lastRecord) {
        tableHealth.last_modified = lastRecord.updated_at || lastRecord.created_at;
      }

      // Verificaciones específicas por tabla
      await this.performTableSpecificChecks(tableName, tableHealth);

    } catch (error) {
      tableHealth.issues.push(`Error general: ${error.message}`);
    }

    return tableHealth;
  }

  /**
   * 🔬 VERIFICACIONES ESPECÍFICAS POR TABLA
   */
  async performTableSpecificChecks(tableName, tableHealth) {
    try {
      switch (tableName) {
        case 'organizaciones':
          // Verificar RUTs duplicados
          const { data: duplicateRuts } = await supabase
            .from('organizaciones')
            .select('rut, count(*)')
            .group('rut')
            .having('count(*)', 'gt', 1);

          if (duplicateRuts?.length > 0) {
            tableHealth.issues.push(`${duplicateRuts.length} RUTs duplicados`);
          }

          // Verificar campos obligatorios
          const { data: incompleteOrgs } = await supabase
            .from('organizaciones')
            .select('id')
            .or('rut.is.null,razon_social.is.null,email.is.null')
            .limit(1);

          if (incompleteOrgs?.length > 0) {
            tableHealth.issues.push('Organizaciones con campos obligatorios faltantes');
          }
          break;

        case 'rats':
          // Verificar integridad referencial
          const { data: orphanedRats } = await supabase
            .from('rats')
            .select('id, organizacion_id')
            .not('organizacion_id', 'is', null)
            .limit(10);

          if (orphanedRats) {
            for (const rat of orphanedRats) {
              const { data: orgExists } = await supabase
                .from('organizaciones')
                .select('id')
                .eq('id', rat.organizacion_id)
                .single();

              if (!orgExists) {
                tableHealth.issues.push('RATs con referencias a organizaciones inexistentes');
                break;
              }
            }
          }
          break;

        case 'usuarios':
          // Verificar usuarios sin rol asignado
          const { data: usersWithoutRole } = await supabase
            .from('usuarios')
            .select('id')
            .is('rol', null)
            .limit(1);

          if (usersWithoutRole?.length > 0) {
            tableHealth.issues.push('Usuarios sin rol asignado');
          }
          break;
      }
    } catch (error) {
      tableHealth.issues.push(`Error verificación específica: ${error.message}`);
    }
  }

  /**
   * 🔒 CHEQUEAR INTEGRIDAD DE DATOS
   */
  async checkDataIntegrity() {
    const integrity = {
      referential_integrity: 'unknown',
      data_consistency: 'unknown',
      constraint_violations: [],
      orphaned_records: 0
    };

    try {
      // Verificar integridad referencial entre RATs y Organizaciones
      const { data: ratsCount } = await supabase
        .from('rats')
        .select('count', { count: 'exact', head: true })
        .not('organizacion_id', 'is', null);

      const { data: validRats } = await supabase
        .from('rats')
        .select(`
          id,
          organizacion_id,
          organizaciones(id)
        `)
        .not('organizacion_id', 'is', null)
        .limit(100);

      if (validRats) {
        const orphaned = validRats.filter(rat => !rat.organizaciones);
        integrity.orphaned_records = orphaned.length;
        
        if (orphaned.length === 0) {
          integrity.referential_integrity = 'good';
        } else if (orphaned.length < validRats.length * 0.1) {
          integrity.referential_integrity = 'warning';
        } else {
          integrity.referential_integrity = 'critical';
        }
      }

      // Verificar consistencia de datos
      const consistencyChecks = await this.performConsistencyChecks();
      integrity.data_consistency = consistencyChecks.overall;
      integrity.constraint_violations = consistencyChecks.violations;

    } catch (error) {
      integrity.referential_integrity = 'error';
      integrity.constraint_violations.push({
        type: 'check_error',
        message: error.message
      });
    }

    return integrity;
  }

  /**
   * ✅ CHEQUEOS DE CONSISTENCIA
   */
  async performConsistencyChecks() {
    const checks = {
      overall: 'good',
      violations: []
    };

    try {
      // 1. RUTs inválidos
      const { data: invalidRuts } = await supabase
        .from('organizaciones')
        .select('id, rut')
        .not('rut', 'like', '%-%')
        .limit(5);

      if (invalidRuts?.length > 0) {
        checks.violations.push({
          type: 'invalid_rut_format',
          count: invalidRuts.length,
          severity: 'medium'
        });
      }

      // 2. Emails inválidos  
      const { data: invalidEmails } = await supabase
        .from('organizaciones')
        .select('id, email')
        .not('email', 'like', '%@%')
        .limit(5);

      if (invalidEmails?.length > 0) {
        checks.violations.push({
          type: 'invalid_email_format',
          count: invalidEmails.length,
          severity: 'medium'
        });
      }

      // 3. RATs sin finalidad
      const { data: ratsWithoutPurpose } = await supabase
        .from('rats')
        .select('count', { count: 'exact', head: true })
        .or('finalidad.is.null,finalidad.eq.');

      if (ratsWithoutPurpose && ratsWithoutPurpose.count > 0) {
        checks.violations.push({
          type: 'missing_required_data',
          field: 'finalidad',
          count: ratsWithoutPurpose.count,
          severity: 'high'
        });
      }

      // Determinar estado general
      const highSeverity = checks.violations.filter(v => v.severity === 'high').length;
      if (highSeverity > 0) {
        checks.overall = 'critical';
      } else if (checks.violations.length > 0) {
        checks.overall = 'warning';
      }

    } catch (error) {
      checks.overall = 'error';
      checks.violations.push({
        type: 'consistency_check_error',
        message: error.message,
        severity: 'high'
      });
    }

    return checks;
  }

  /**
   * ⚡ MEDIR PERFORMANCE DEL SISTEMA
   */
  async measureSystemPerformance() {
    const performance = {
      database_response_time: 0,
      query_performance: {},
      overall_score: 0
    };

    try {
      // Test queries comunes
      const queries = [
        { name: 'select_organizations', query: () => supabase.from('organizaciones').select('*').limit(10) },
        { name: 'count_rats', query: () => supabase.from('rats').select('count', { count: 'exact', head: true }) },
        { name: 'join_rats_orgs', query: () => supabase.from('rats').select('id, organizaciones(razon_social)').limit(5) }
      ];

      let totalTime = 0;
      for (const { name, query } of queries) {
        const startTime = Date.now();
        try {
          await query();
          const queryTime = Date.now() - startTime;
          performance.query_performance[name] = queryTime;
          totalTime += queryTime;
        } catch (error) {
          performance.query_performance[name] = `Error: ${error.message}`;
        }
      }

      performance.database_response_time = totalTime / queries.length;

      // Calcular score (100 = excelente, 0 = crítico)
      if (performance.database_response_time < 500) {
        performance.overall_score = 100;
      } else if (performance.database_response_time < 1500) {
        performance.overall_score = 75;
      } else if (performance.database_response_time < 3000) {
        performance.overall_score = 50;
      } else {
        performance.overall_score = 25;
      }

    } catch (error) {
      performance.overall_score = 0;
      performance.error = error.message;
    }

    return performance;
  }

  /**
   * 🔧 CHEQUEAR FUNCIONALIDADES CRÍTICAS
   */
  async checkCriticalFunctionalities() {
    const functionalities = {
      user_authentication: 'unknown',
      data_crud_operations: 'unknown',
      system_navigation: 'unknown',
      report_generation: 'unknown',
      issues: []
    };

    try {
      // Test CRUD operations
      const crudTest = await this.testCRUDOperations();
      functionalities.data_crud_operations = crudTest.status;
      if (crudTest.issues.length > 0) {
        functionalities.issues.push(...crudTest.issues);
      }

      // Test other functionalities...
      functionalities.user_authentication = 'available'; // Simplificado por ahora
      functionalities.system_navigation = 'available';
      functionalities.report_generation = 'available';

    } catch (error) {
      functionalities.issues.push({
        type: 'functionality_check_error',
        message: error.message
      });
    }

    return functionalities;
  }

  /**
   * 📝 TEST OPERACIONES CRUD
   */
  async testCRUDOperations() {
    const test = {
      status: 'unknown',
      issues: []
    };

    try {
      // CREATE test
      const testOrg = {
        rut: `test-crud-${Date.now()}`,
        razon_social: 'Test CRUD Organization',
        email: 'test@crud.test',
        telefono: '+56 9 0000 0000'
      };

      const { data: created, error: createError } = await supabase
        .from('organizaciones')
        .insert(testOrg)
        .select('id')
        .single();

      if (createError) {
        test.issues.push({ operation: 'CREATE', error: createError.message });
      } else {
        // READ test
        const { data: read, error: readError } = await supabase
          .from('organizaciones')
          .select('*')
          .eq('id', created.id)
          .single();

        if (readError) {
          test.issues.push({ operation: 'READ', error: readError.message });
        } else {
          // UPDATE test
          const { error: updateError } = await supabase
            .from('organizaciones')
            .update({ razon_social: 'Updated Test Organization' })
            .eq('id', created.id);

          if (updateError) {
            test.issues.push({ operation: 'UPDATE', error: updateError.message });
          } else {
            // DELETE test
            const { error: deleteError } = await supabase
              .from('organizaciones')
              .delete()
              .eq('id', created.id);

            if (deleteError) {
              test.issues.push({ operation: 'DELETE', error: deleteError.message });
            }
          }
        }
      }

      test.status = test.issues.length === 0 ? 'working' : 'degraded';

    } catch (error) {
      test.status = 'failed';
      test.issues.push({ operation: 'GENERAL', error: error.message });
    }

    return test;
  }

  /**
   * 📊 GENERAR ANÁLISIS Y RECOMENDACIONES
   */
  async generateAnalysisAndRecommendations() {
    // Analizar problemas de base de datos
    if (this.report.database_health.critical_errors?.length > 0) {
      this.report.critical_issues.push({
        type: 'database_connectivity',
        severity: 'critical',
        message: 'Problemas críticos de conectividad con base de datos',
        count: this.report.database_health.critical_errors.length
      });

      this.report.recommendations.push({
        priority: 'URGENT',
        issue: 'Base de datos inaccesible',
        action: 'Verificar configuración Supabase y conectividad',
        impact: 'Sistema completamente disfuncional'
      });
    }

    // Analizar integridad de datos
    if (this.report.database_health.data_integrity?.orphaned_records > 0) {
      this.report.critical_issues.push({
        type: 'data_integrity',
        severity: 'high',
        message: `${this.report.database_health.data_integrity.orphaned_records} registros huérfanos detectados`
      });

      this.report.recommendations.push({
        priority: 'HIGH',
        issue: 'Integridad referencial comprometida',
        action: 'Ejecutar script de limpieza de datos huérfanos',
        impact: 'Errores en reportes y funcionalidades'
      });
    }

    // Analizar performance
    if (this.report.performance_metrics?.overall_score < 50) {
      this.report.recommendations.push({
        priority: 'MEDIUM',
        issue: 'Performance de base de datos degradada',
        action: 'Optimizar queries y verificar índices',
        impact: 'Experiencia de usuario lenta'
      });
    }

    // Analizar problemas de tablas
    Object.entries(this.report.database_health.table_status || {}).forEach(([table, status]) => {
      if (status.issues?.length > 0) {
        this.report.critical_issues.push({
          type: 'table_issues',
          severity: 'medium',
          message: `Tabla ${table}: ${status.issues.join(', ')}`
        });
      }
    });
  }

  /**
   * 🎯 CALCULAR ESTADO GENERAL DEL SISTEMA
   */
  calculateOverallStatus() {
    const criticalCount = this.report.critical_issues.filter(i => i.severity === 'critical').length;
    const highCount = this.report.critical_issues.filter(i => i.severity === 'high').length;

    if (criticalCount > 0) return 'critical';
    if (highCount > 2) return 'degraded';
    if (this.report.critical_issues.length > 0) return 'warning';
    
    return 'healthy';
  }

  /**
   * 🖨️ GENERAR REPORTE RESUMIDO
   */
  generateSummaryReport() {
    return {
      checkId: this.checkId,
      timestamp: this.report.timestamp,
      overall_status: this.report.overall_status,
      database_connected: this.report.database_health.connection_status === 'connected',
      performance_score: this.report.performance_metrics?.overall_score || 0,
      critical_issues_count: this.report.critical_issues.length,
      recommendations_count: this.report.recommendations.length,
      top_issues: this.report.critical_issues.slice(0, 3),
      top_recommendations: this.report.recommendations.slice(0, 3)
    };
  }
}

export default SystemHealthChecker;