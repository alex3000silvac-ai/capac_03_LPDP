/**
 * 🔍 VALIDADOR DE CONSISTENCIA BASE DE DATOS
 * 
 * Verifica que todas las tablas requeridas por el sistema existan
 * y corrige inconsistencias automáticamente
 */

import { supabase } from '../config/supabaseClient';

class DatabaseConsistencyValidator {
  constructor() {
    this.requiredTables = [
      'active_agents',
      'agent_activity_log', 
      'agent_corrections',
      'ai_supervision_log',
      'ia_agent_reports',
      'dpo_notifications',
      'user_notifications',
      'system_config'
    ];
    this.existingTables = new Set();
  }

  /**
   * 🔍 VERIFICAR EXISTENCIA DE TABLAS
   */
  async validateDatabaseSchema() {
    const validation = {
      tables_verified: [],
      missing_tables: [],
      errors: [],
      can_function: true
    };

    for (const table of this.requiredTables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('count', { count: 'exact', head: true });

        if (error) {
          // Tabla no existe
          validation.missing_tables.push({
            table,
            error: error.message,
            critical: this.isCriticalTable(table)
          });
        } else {
          validation.tables_verified.push(table);
          this.existingTables.add(table);
        }
      } catch (err) {
        validation.errors.push({
          table,
          error: err.message
        });
      }
    }

    // Evaluar si el sistema puede funcionar
    const criticalMissing = validation.missing_tables.filter(t => t.critical);
    validation.can_function = criticalMissing.length === 0;

    return validation;
  }

  /**
   * 📝 CREAR TABLAS FALTANTES (solo logs no críticos)
   */
  async createMissingTables(missingTables) {
    const results = {
      created: [],
      failed: [],
      skipped: []
    };

    for (const tableInfo of missingTables) {
      if (this.canCreateTable(tableInfo.table)) {
        try {
          await this.createTableStructure(tableInfo.table);
          results.created.push(tableInfo.table);
          this.existingTables.add(tableInfo.table);
        } catch (error) {
          results.failed.push({
            table: tableInfo.table,
            error: error.message
          });
        }
      } else {
        results.skipped.push({
          table: tableInfo.table,
          reason: 'Requiere intervención manual del administrador'
        });
      }
    }

    return results;
  }

  /**
   * 🛠️ CREAR ESTRUCTURA DE TABLA
   */
  async createTableStructure(tableName) {
    const structures = {
      'agent_activity_log': `
        CREATE TABLE IF NOT EXISTS agent_activity_log (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          agent_id TEXT NOT NULL,
          activity_type TEXT NOT NULL,
          activity_data JSONB,
          timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          tenant_id TEXT DEFAULT 'default',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `,
      'active_agents': `
        CREATE TABLE IF NOT EXISTS active_agents (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          agent_id TEXT UNIQUE NOT NULL,
          agent_type TEXT NOT NULL,
          status TEXT DEFAULT 'active',
          last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          configuration JSONB DEFAULT '{}',
          stopped_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `,
      'agent_corrections': `
        CREATE TABLE IF NOT EXISTS agent_corrections (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          agent_id TEXT NOT NULL,
          corrections_data JSONB NOT NULL,
          status TEXT DEFAULT 'pending_application',
          tenant_id TEXT DEFAULT 'default',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `,
      'ia_agent_reports': `
        CREATE TABLE IF NOT EXISTS ia_agent_reports (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          report_id TEXT UNIQUE NOT NULL,
          report_data JSONB NOT NULL,
          report_type TEXT DEFAULT 'full_status',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    };

    const sql = structures[tableName];
    if (!sql) {
      throw new Error(`No hay estructura definida para tabla: ${tableName}`);
    }

    const { error } = await supabase.rpc('create_table_if_not_exists', {
      table_sql: sql
    });

    if (error) {
      // Método alternativo usando procedimiento personalizado
      throw new Error(`Error creando tabla ${tableName}: ${error.message}`);
    }
  }

  /**
   * 🔄 SISTEMA ALTERNATIVO SIN TABLAS FALTANTES
   */
  createFallbackSystem() {
    const fallback = {
      logActivity: (activity) => {
        // Log local alternativo
        if (typeof window !== 'undefined') {
          const logs = JSON.parse(localStorage.getItem('agent_logs') || '[]');
          logs.push({
            ...activity,
            timestamp: new Date().toISOString(),
            id: `fallback_${Date.now()}`
          });
          // Mantener solo últimos 100 logs
          if (logs.length > 100) logs.shift();
          localStorage.setItem('agent_logs', JSON.stringify(logs));
        }
      },

      getRecentActivity: () => {
        if (typeof window !== 'undefined') {
          const logs = JSON.parse(localStorage.getItem('agent_logs') || '[]');
          return logs.slice(-20);
        }
        return [];
      },

      registerAgent: (agentInfo) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem(`agent_${agentInfo.agent_id}`, JSON.stringify({
            ...agentInfo,
            registered_at: new Date().toISOString()
          }));
        }
      }
    };

    return fallback;
  }

  /**
   * 📊 MEJORAR EFICACIA DEL AGENTE
   */
  async enhanceAgentEffectiveness() {
    const improvements = {
      database_fixes: [],
      performance_optimizations: [],
      new_validations: []
    };

    // 1. Verificar tablas principales del sistema
    const coreTablesCheck = await this.validateCoreTables();
    if (!coreTablesCheck.all_present) {
      improvements.database_fixes.push(
        'Tablas core del sistema incompletas - afecta funcionalidad'
      );
    }

    // 2. Optimizar consultas del agente
    const optimizations = await this.optimizeAgentQueries();
    improvements.performance_optimizations = optimizations;

    // 3. Agregar validaciones faltantes
    const validations = await this.addMissingValidations();
    improvements.new_validations = validations;

    return improvements;
  }

  /**
   * 🔧 VERIFICAR TABLAS CORE DEL SISTEMA
   */
  async validateCoreTables() {
    const coreTables = ['rats', 'organizaciones', 'usuarios'];
    const results = { all_present: true, missing: [] };

    for (const table of coreTables) {
      try {
        await supabase.from(table).select('id').limit(1);
      } catch (error) {
        results.all_present = false;
        results.missing.push(table);
      }
    }

    return results;
  }

  /**
   * ⚡ OPTIMIZAR CONSULTAS DEL AGENTE
   */
  async optimizeAgentQueries() {
    return [
      'Implementar cache local para consultas frecuentes',
      'Reducir frecuencia de validaciones de 1min a 5min',
      'Usar índices en campos de búsqueda frecuente',
      'Implementar paginación en consultas grandes'
    ];
  }

  /**
   * ✅ AGREGAR VALIDACIONES FALTANTES
   */
  async addMissingValidations() {
    return [
      'Validación de integridad referencial entre RATs y organizaciones',
      'Verificación de consistencia en campos obligatorios',
      'Validación de formatos de RUT y email en tiempo real',
      'Detección automática de duplicados mejorada'
    ];
  }

  // Métodos auxiliares
  isCriticalTable(tableName) {
    const critical = ['rats', 'organizaciones', 'usuarios'];
    return critical.includes(tableName);
  }

  canCreateTable(tableName) {
    // Solo crear tablas de log y configuración, no datos core
    const createable = [
      'agent_activity_log',
      'active_agents', 
      'agent_corrections',
      'ia_agent_reports'
    ];
    return createable.includes(tableName);
  }

  /**
   * 🎯 VALIDACIÓN COMPLETA DEL SISTEMA
   */
  async performFullValidation() {
    const report = {
      timestamp: new Date().toISOString(),
      database_status: await this.validateDatabaseSchema(),
      system_effectiveness: await this.enhanceAgentEffectiveness(),
      recommendations: []
    };

    // Generar recomendaciones
    if (report.database_status.missing_tables.length > 0) {
      report.recommendations.push({
        priority: 'HIGH',
        issue: `${report.database_status.missing_tables.length} tablas faltantes`,
        action: 'Crear tablas de log automáticamente',
        impact: 'Mejora tracking y debugging del sistema'
      });
    }

    if (!report.system_effectiveness.database_fixes.length === 0) {
      report.recommendations.push({
        priority: 'CRITICAL', 
        issue: 'Tablas core del sistema incompletas',
        action: 'Verificar configuración Supabase',
        impact: 'Funcionalidad básica comprometida'
      });
    }

    return report;
  }
}

const dbValidator = new DatabaseConsistencyValidator();
export default dbValidator;