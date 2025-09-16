/**
 * 🔍 DATABASE HEALTH MONITOR - DETECTOR DE PROBLEMAS BD
 * 
 * Detecta ANTICIPADAMENTE problemas de:
 * - Consistencia de datos
 * - Fallos de grabado/carga
 * - Problemas de conectividad
 * - Integridad referencial
 * 
 * NO MODIFICA DATOS - SOLO ALERTA TEMPRANAMENTE
 * GENERA REPORTES EN ARCHIVOS TXT
 */

import { supabase } from '../config/supabaseConfig';
import fileErrorLogger from './fileErrorLogger';

class DatabaseHealthMonitor {
  constructor() {
    this.healthChecks = [];
    this.criticalIssues = [];
    this.connectionIssues = [];
    this.consistencyErrors = [];
    this.isMonitoring = false;
    
    // Configuración de monitoreo
    this.config = {
      checkInterval: 60000,        // Cada 1 minuto
      connectionTimeout: 5000,     // 5 segundos timeout
      maxRetries: 3,               // 3 reintentos
      criticalThreshold: 5         // 5 errores = crítico
    };
  }

  /**
   * 🚀 INICIAR MONITOREO DE BD
   */
  async startMonitoring() {
    if (this.isMonitoring) {
      //console.log('📊 Database Health Monitor ya está activo');
      return;
    }

    //console.log('🔍 Iniciando Database Health Monitor...');
    
    try {
      // Test inicial de conectividad
      await this.performInitialHealthCheck();
      
      // Iniciar monitoreo periódico
      this.setupPeriodicChecks();
      
      // Configurar detección de errores en tiempo real
      this.setupRealtimeErrorDetection();
      
      this.isMonitoring = true;
      //console.log('✅ Database Health Monitor ACTIVO');
      
    } catch (error) {
      console.error('❌ Error iniciando Database Health Monitor:', error);
      this.logCriticalIssue('MONITOR_INIT_FAILED', error);
    }
  }

  /**
   * 🏥 CHECK INICIAL DE SALUD
   */
  async performInitialHealthCheck() {
    //console.log('🔍 Ejecutando check inicial de base de datos...');
    
    const healthCheck = {
      timestamp: Date.now(),
      checks: {},
      overall_status: 'CHECKING',
      critical_issues: []
    };

    try {
      // 1. Test conectividad básica
      healthCheck.checks.connectivity = await this.testConnectivity();
      
      // 2. Test tablas principales
      healthCheck.checks.tables = await this.testMainTables();
      
      // 3. Test integridad referencias
      healthCheck.checks.referential_integrity = await this.testReferentialIntegrity();
      
      // 4. Test permisos RLS
      healthCheck.checks.rls_permissions = await this.testRLSPermissions();
      
      // 5. Test consistencia datos
      healthCheck.checks.data_consistency = await this.testDataConsistency();
      
      // Determinar status general
      healthCheck.overall_status = this.calculateOverallStatus(healthCheck.checks);
      
      // Log resultados
      this.logHealthCheckResults(healthCheck);
      
      this.healthChecks.push(healthCheck);
      
    } catch (error) {
      healthCheck.overall_status = 'CRITICAL';
      healthCheck.error = error.message;
      console.error('❌ Error en health check inicial:', error);
    }

    return healthCheck;
  }

  /**
   * 🌐 TEST CONECTIVIDAD
   */
  async testConnectivity() {
    const test = { name: 'Connectivity', status: 'testing', details: {} };
    
    try {
      const startTime = performance.now();
      
      // Test simple de conexión
      const { error } = await supabase
        .from('organizaciones')
        .select('id', { count: 'exact', head: true });
      
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);
      
      if (error) {
        test.status = 'FAILED';
        test.error = error.message;
        test.details.response_time = responseTime;
        
        // Detectar tipos específicos de error
        if (error.message.includes('timeout')) {
          this.logConnectionIssue('TIMEOUT', error, responseTime);
        } else if (error.message.includes('network')) {
          this.logConnectionIssue('NETWORK_ERROR', error, responseTime);
        } else {
          this.logConnectionIssue('CONNECTION_FAILED', error, responseTime);
        }
        
      } else {
        test.status = 'PASSED';
        test.details = {
          response_time: responseTime,
          connection_quality: responseTime < 1000 ? 'EXCELLENT' : 
                             responseTime < 3000 ? 'GOOD' : 'SLOW'
        };
        
        if (responseTime > 3000) {
          //console.warn(`⚠️ Conexión lenta detectada: ${responseTime}ms`);
        }
      }
      
    } catch (error) {
      test.status = 'CRITICAL';
      test.error = error.message;
      this.logConnectionIssue('CRITICAL_FAILURE', error, null);
    }
    
    return test;
  }

  /**
   * 🗃️ TEST TABLAS PRINCIPALES
   */
  async testMainTables() {
    const test = { name: 'Main Tables', status: 'testing', tables: {} };
    
    const mainTables = [
      'organizaciones',
      'mapeo_datos_rat', 
      'proveedores',
      'notifications',
      'actividades_dpo'
    ];

    let failedTables = 0;
    
    for (const tableName of mainTables) {
      try {
        const startTime = performance.now();
        
        // Test acceso a tabla
        const { count, error } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });
        
        const endTime = performance.now();
        const queryTime = Math.round(endTime - startTime);
        
        if (error) {
          test.tables[tableName] = {
            status: 'ERROR',
            error: error.message,
            query_time: queryTime
          };
          failedTables++;
          
          // Detectar problemas específicos
          if (error.message.includes('does not exist')) {
            this.logCriticalIssue('TABLE_MISSING', { table: tableName, error });
          } else if (error.message.includes('permission')) {
            this.logCriticalIssue('TABLE_PERMISSION_DENIED', { table: tableName, error });
          }
          
        } else {
          test.tables[tableName] = {
            status: 'OK',
            record_count: count || 0,
            query_time: queryTime
          };
        }
        
      } catch (error) {
        test.tables[tableName] = {
          status: 'CRITICAL',
          error: error.message
        };
        failedTables++;
        this.logCriticalIssue('TABLE_CRITICAL_ERROR', { table: tableName, error });
      }
    }

    // Status general del test
    if (failedTables === 0) {
      test.status = 'PASSED';
    } else if (failedTables < mainTables.length / 2) {
      test.status = 'PARTIAL';
    } else {
      test.status = 'FAILED';
    }
    
    test.summary = {
      total_tables: mainTables.length,
      failed_tables: failedTables,
      success_rate: Math.round(((mainTables.length - failedTables) / mainTables.length) * 100)
    };

    return test;
  }

  /**
   * 🔗 TEST INTEGRIDAD REFERENCIAL
   */
  async testReferentialIntegrity() {
    const test = { name: 'Referential Integrity', status: 'testing', issues: [] };
    
    try {
      // Test 1: RATs sin organización válida
      const { data: orphanRATs, error: ratError } = await supabase
        .from('mapeo_datos_rat')
        .select('id, organizacion_id, nombre_actividad')
        .not('organizacion_id', 'is', null)
        .limit(10);

      if (!ratError && orphanRATs) {
        for (const rat of orphanRATs) {
          const { data: orgExists } = await supabase
            .from('organizaciones')
            .select('id')
            .eq('id', rat.organizacion_id)
            .single();
            
          if (!orgExists) {
            test.issues.push({
              type: 'ORPHAN_RAT',
              description: `RAT ${rat.id} referencia organización inexistente ${rat.organizacion_id}`,
              severity: 'HIGH',
              rat_id: rat.id,
              missing_org_id: rat.organizacion_id
            });
          }
        }
      }

      // Test 2: Proveedores sin RAT válido
      const { data: orphanProviders, error: provError } = await supabase
        .from('proveedores')
        .select('id, rat_id')
        .not('rat_id', 'is', null)
        .limit(10);

      if (!provError && orphanProviders) {
        for (const provider of orphanProviders) {
          const { data: ratExists } = await supabase
            .from('mapeo_datos_rat')
            .select('id')
            .eq('id', provider.rat_id)
            .single();
            
          if (!ratExists) {
            test.issues.push({
              type: 'ORPHAN_PROVIDER',
              description: `Proveedor ${provider.id} referencia RAT inexistente ${provider.rat_id}`,
              severity: 'MEDIUM',
              provider_id: provider.id,
              missing_rat_id: provider.rat_id
            });
          }
        }
      }

      test.status = test.issues.length === 0 ? 'PASSED' : 
                   test.issues.filter(i => i.severity === 'HIGH').length > 0 ? 'FAILED' : 'WARNING';
      
      if (test.issues.length > 0) {
        //console.warn(`⚠️ ${test.issues.length} problemas de integridad referencial detectados`);
        test.issues.forEach(issue => {
          this.logConsistencyError('REFERENTIAL_INTEGRITY', issue);
        });
      }
      
    } catch (error) {
      test.status = 'CRITICAL';
      test.error = error.message;
      this.logCriticalIssue('INTEGRITY_CHECK_FAILED', error);
    }

    return test;
  }

  /**
   * 🔐 TEST PERMISOS RLS
   */
  async testRLSPermissions() {
    const test = { name: 'RLS Permissions', status: 'testing', permissions: {} };
    
    const testCases = [
      { table: 'mapeo_datos_rat', filter: { tenant_id: 1 } },
      { table: 'organizaciones', filter: { id: 1 } },
      { table: 'proveedores', filter: { tenant_id: 1 } }
    ];

    let permissionIssues = 0;

    for (const testCase of testCases) {
      try {
        // Test con filtro tenant
        const { error: withFilterError } = await supabase
          .from(testCase.table)
          .select('id', { count: 'exact', head: true })
          .match(testCase.filter);

        // Test sin filtro (debería fallar si RLS está bien configurado)
        const { error: withoutFilterError } = await supabase
          .from(testCase.table)
          .select('id', { count: 'exact', head: true });

        test.permissions[testCase.table] = {
          with_filter: withFilterError ? 'BLOCKED' : 'ALLOWED',
          without_filter: withoutFilterError ? 'BLOCKED' : 'ALLOWED',
          filter_error: withFilterError?.message,
          no_filter_error: withoutFilterError?.message
        };

        // Detectar problemas RLS
        if (withFilterError && withFilterError.message.includes('406')) {
          permissionIssues++;
          this.logCriticalIssue('RLS_406_ERROR', {
            table: testCase.table,
            filter: testCase.filter,
            error: withFilterError
          });
        }
        
      } catch (error) {
        test.permissions[testCase.table] = {
          status: 'ERROR',
          error: error.message
        };
        permissionIssues++;
        this.logCriticalIssue('RLS_TEST_FAILED', { table: testCase.table, error });
      }
    }

    test.status = permissionIssues === 0 ? 'PASSED' : 'FAILED';
    test.summary = { permission_issues: permissionIssues };

    return test;
  }

  /**
   * 🔄 TEST CONSISTENCIA DATOS
   */
  async testDataConsistency() {
    const test = { name: 'Data Consistency', status: 'testing', inconsistencies: [] };
    
    try {
      // Test 1: RATs con datos incompletos críticos
      const { data: incompleteRATs } = await supabase
        .from('mapeo_datos_rat')
        .select('id, nombre_actividad, razon_social, email_empresa')
        .or('nombre_actividad.is.null,razon_social.is.null,email_empresa.is.null')
        .limit(5);

      if (incompleteRATs && incompleteRATs.length > 0) {
        incompleteRATs.forEach(rat => {
          test.inconsistencies.push({
            type: 'INCOMPLETE_RAT_DATA',
            description: `RAT ${rat.id} tiene campos críticos faltantes`,
            severity: 'MEDIUM',
            rat_id: rat.id,
            missing_fields: [
              !rat.nombre_actividad ? 'nombre_actividad' : null,
              !rat.razon_social ? 'razon_social' : null,
              !rat.email_empresa ? 'email_empresa' : null
            ].filter(Boolean)
          });
        });
      }

      // Test 2: Organizaciones duplicadas por RUT
      const { data: duplicateOrgs } = await supabase
        .from('organizaciones')
        .select('rut')
        .not('rut', 'is', null);

      if (duplicateOrgs) {
        const rutCounts = {};
        duplicateOrgs.forEach(org => {
          rutCounts[org.rut] = (rutCounts[org.rut] || 0) + 1;
        });

        Object.entries(rutCounts).forEach(([rut, count]) => {
          if (count > 1) {
            test.inconsistencies.push({
              type: 'DUPLICATE_ORGANIZATION_RUT',
              description: `RUT ${rut} aparece ${count} veces en organizaciones`,
              severity: 'HIGH',
              rut: rut,
              occurrences: count
            });
          }
        });
      }

      test.status = test.inconsistencies.length === 0 ? 'PASSED' : 'WARNING';
      
      if (test.inconsistencies.length > 0) {
        //console.warn(`⚠️ ${test.inconsistencies.length} inconsistencias de datos detectadas`);
        test.inconsistencies.forEach(inconsistency => {
          this.logConsistencyError('DATA_INCONSISTENCY', inconsistency);
        });
      }
      
    } catch (error) {
      test.status = 'CRITICAL';
      test.error = error.message;
      this.logCriticalIssue('CONSISTENCY_CHECK_FAILED', error);
    }

    return test;
  }

  /**
   * ⚖️ CALCULAR STATUS GENERAL
   */
  calculateOverallStatus(checks) {
    const statuses = Object.values(checks).map(check => check.status);
    
    if (statuses.includes('CRITICAL')) return 'CRITICAL';
    if (statuses.includes('FAILED')) return 'FAILED';
    if (statuses.includes('WARNING') || statuses.includes('PARTIAL')) return 'WARNING';
    return 'HEALTHY';
  }

  /**
   * 📝 LOG ISSUE CRÍTICO - ARCHIVO TXT
   */
  async logCriticalIssue(type, details) {
    const issue = {
      id: `critical_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      type: type,
      timestamp: Date.now(),
      details: details,
      severity: 'CRITICAL'
    };
    
    this.criticalIssues.push(issue);
    
    console.error(`🚨 ISSUE CRÍTICO BD: ${type}`, details);
    
    // Escribir a archivo TXT
    await fileErrorLogger.logCriticalError(type, {
      database_issue: true,
      details: details,
      issue_id: issue.id,
      timestamp: new Date(issue.timestamp).toISOString()
    }, 'DATABASE_HEALTH_MONITOR');
  }

  /**
   * 🌐 LOG PROBLEMA CONEXIÓN - ARCHIVO TXT
   */
  async logConnectionIssue(type, error, responseTime) {
    const issue = {
      id: `conn_${Date.now()}`,
      type: type,
      timestamp: Date.now(),
      error: error.message,
      response_time: responseTime,
      severity: type.includes('CRITICAL') ? 'CRITICAL' : 'HIGH'
    };
    
    this.connectionIssues.push(issue);
    //console.warn(`🌐 Problema conexión BD: ${type}`, issue);
    
    // Escribir a archivo TXT
    if (issue.severity === 'CRITICAL') {
      fileErrorLogger.logCriticalError(type, {
        connection_issue: true,
        error: issue.error,
        response_time: responseTime,
        timestamp: new Date(issue.timestamp).toISOString()
      }, 'DATABASE_HEALTH_MONITOR');
    } else {
      fileErrorLogger.logHighError(type, {
        connection_issue: true,
        error: issue.error,
        response_time: responseTime,
        timestamp: new Date(issue.timestamp).toISOString()
      }, 'DATABASE_HEALTH_MONITOR');
    }
  }

  /**
   * 📊 LOG ERROR CONSISTENCIA - ARCHIVO TXT
   */
  async logConsistencyError(category, details) {
    const error = {
      id: `consistency_${Date.now()}`,
      category: category,
      timestamp: Date.now(),
      details: details,
      severity: details.severity || 'MEDIUM'
    };
    
    this.consistencyErrors.push(error);
    //console.warn(`📊 Error consistencia BD: ${category}`, details);
    
    // Escribir a archivo TXT
    if (error.severity === 'HIGH' || error.severity === 'CRITICAL') {
      await fileErrorLogger.logHighError(category, {
        consistency_error: true,
        details: error.details,
        error_id: error.id,
        timestamp: new Date(error.timestamp).toISOString()
      }, 'DATABASE_HEALTH_MONITOR');
    } else {
      await fileErrorLogger.logMediumError(category, {
        consistency_error: true,
        details: error.details,
        error_id: error.id,
        timestamp: new Date(error.timestamp).toISOString()
      }, 'DATABASE_HEALTH_MONITOR');
    }
  }

  /**
   * ⏰ CONFIGURAR CHECKS PERIÓDICOS
   */
  setupPeriodicChecks() {
    setInterval(async () => {
      try {
        //console.log('🔍 Ejecutando health check periódico...');
        await this.performInitialHealthCheck();
      } catch (error) {
        console.error('❌ Error en health check periódico:', error);
      }
    }, this.config.checkInterval);
  }

  /**
   * 📡 DETECCIÓN EN TIEMPO REAL
   */
  setupRealtimeErrorDetection() {
    // Interceptar errores de Supabase en tiempo real
    const originalConsoleError = console.error;
    
    console.error = (...args) => {
      const message = args.join(' ');
      
      // Detectar errores específicos de BD
      if (message.includes('Supabase') || message.includes('PostgreSQL')) {
        this.analyzeRealTimeError(message, args);
      }
      
      originalConsoleError.apply(console, args);
    };
  }

  /**
   * 🔍 ANALIZAR ERROR TIEMPO REAL - ARCHIVO TXT
   */
  async analyzeRealTimeError(message, args) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('406') || lowerMessage.includes('not acceptable')) {
      await this.logCriticalIssue('REALTIME_RLS_ERROR', { message, timestamp: Date.now() });
    }
    
    if (lowerMessage.includes('timeout') || lowerMessage.includes('network')) {
      await this.logConnectionIssue('REALTIME_CONNECTION_ERROR', { message }, null);
    }
    
    if (lowerMessage.includes('undefined') && lowerMessage.includes('id')) {
      await this.logCriticalIssue('REALTIME_UNDEFINED_ID', { message, timestamp: Date.now() });
    }
  }

  /**
   * 📈 GENERAR REPORTE SALUD BD
   */
  generateHealthReport() {
    const latestCheck = this.healthChecks[this.healthChecks.length - 1];
    
    return {
      timestamp: Date.now(),
      monitoring_active: this.isMonitoring,
      latest_check: latestCheck,
      critical_issues: {
        count: this.criticalIssues.length,
        recent: this.criticalIssues.slice(-5)
      },
      connection_issues: {
        count: this.connectionIssues.length,
        recent: this.connectionIssues.slice(-3)
      },
      consistency_errors: {
        count: this.consistencyErrors.length,
        recent: this.consistencyErrors.slice(-5)
      },
      recommendations: this.generateDBRecommendations()
    };
  }

  /**
   * 💡 GENERAR RECOMENDACIONES BD
   */
  generateDBRecommendations() {
    const recommendations = [];
    
    if (this.criticalIssues.length > 3) {
      recommendations.push({
        priority: 'URGENT',
        issue: 'Múltiples issues críticos de BD detectados',
        action: 'Revisión inmediata de configuración Supabase requerida'
      });
    }
    
    const rls406Errors = this.criticalIssues.filter(issue => 
      issue.type.includes('RLS') || issue.details?.error?.message?.includes('406')
    );
    
    if (rls406Errors.length > 1) {
      recommendations.push({
        priority: 'HIGH',
        issue: 'Errores 406 RLS recurrentes',
        action: 'Configurar políticas Row Level Security en Supabase'
      });
    }
    
    if (this.consistencyErrors.length > 5) {
      recommendations.push({
        priority: 'MEDIUM',
        issue: 'Múltiples inconsistencias de datos',
        action: 'Ejecutar limpieza y normalización de datos'
      });
    }
    
    return recommendations;
  }

  /**
   * 🖨️ IMPRIMIR REPORTE EN CONSOLA
   */
  printHealthReport() {
    const report = this.generateHealthReport();
    
    console.group('🔍 REPORTE SALUD BASE DE DATOS');
    //console.log('⏰ Timestamp:', new Date(report.timestamp).toLocaleString());
    //console.log('📊 Monitoreo activo:', report.monitoring_active ? '✅ SÍ' : '❌ NO');
    
    if (report.latest_check) {
      //console.log('🏥 Último check:', report.latest_check.overall_status);
      //console.log('🚨 Issues críticos:', report.critical_issues.count);
      //console.log('🌐 Problemas conexión:', report.connection_issues.count);
      //console.log('📊 Errores consistencia:', report.consistency_errors.count);
    }
    
    if (report.recommendations.length > 0) {
      console.group('💡 RECOMENDACIONES URGENTES');
      report.recommendations.forEach((rec, index) => {
        //console.log(`${index + 1}. [${rec.priority}] ${rec.action}`);
      });
      console.groupEnd();
    }
    
    console.groupEnd();
    
    return report;
  }

  /**
   * 🛑 DETENER MONITOREO
   */
  stopMonitoring() {
    this.isMonitoring = false;
    //console.log('🛑 Database Health Monitor detenido');
  }
}

// Instancia global
const dbHealthMonitor = new DatabaseHealthMonitor();

// Hacer disponible globalmente
window.dbHealthMonitor = dbHealthMonitor;
window.showDBHealth = () => dbHealthMonitor.printHealthReport();

// Auto-iniciar
if (typeof window !== 'undefined') {
  dbHealthMonitor.startMonitoring();
}

export default dbHealthMonitor;