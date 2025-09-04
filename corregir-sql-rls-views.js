const fs = require('fs');
const path = require('path');

/**
 * 🔧 CORRECTOR SQL RLS - SEPARAR TABLES vs VIEWS
 * 
 * Corregir error RLS excluyendo views del script SQL
 */

class RLSSQLCorrector {
  constructor() {
    this.correctionId = `rls_fix_${Date.now()}`;
    
    // 40 TABLAS CRÍTICAS - identificar cuáles son VIEWS
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
    
    // VIEWS conocidas del esquema
    this.knownViews = [
      'tenants',           // VIEW confirmada por error
      'audit_reports',     // VIEW según tablas.txt
      'inventario_rats',   // VIEW según tablas.txt  
      'system_stats'       // VIEW según tablas.txt
    ];
    
    this.results = {
      tables_to_configure: [],
      views_excluded: [],
      sql_corrected: '',
      errors_found: []
    };
  }

  /**
   * 🚀 EJECUTAR CORRECCIÓN SQL RLS
   */
  async correctRLSSQL() {
    console.log('🔧 CORRIGIENDO SQL RLS - EXCLUYENDO VIEWS...');
    
    try {
      // PASO 1: Identificar tablas reales vs views
      console.log('📋 PASO 1: Separando tablas reales de views...');
      this.separateTablesFromViews();
      
      // PASO 2: Generar SQL corregido solo para tablas
      console.log('🔧 PASO 2: Generando SQL corregido...');
      this.generateCorrectedSQL();
      
      // PASO 3: Guardar SQL corregido
      console.log('💾 PASO 3: Guardando SQL corregido...');
      this.saveCorrectedSQL();
      
      console.log('\n✅ CORRECCIÓN SQL RLS COMPLETADA');
      console.log(`📋 Tablas para RLS: ${this.results.tables_to_configure.length}`);
      console.log(`👁️ Views excluidas: ${this.results.views_excluded.length}`);
      
      return this.results;
      
    } catch (error) {
      console.error('❌ ERROR EN CORRECCIÓN:', error.message);
      throw error;
    }
  }

  /**
   * 📋 SEPARAR TABLAS REALES DE VIEWS
   */
  separateTablesFromViews() {
    // Leer tablas.txt para identificar tipos
    const viewsFromSchema = this.identifyViewsFromSchema();
    const allViews = [...new Set([...this.knownViews, ...viewsFromSchema])];
    
    console.log(`👁️ Views identificadas: ${allViews.join(', ')}`);
    
    // Separar tablas críticas
    for (const table of this.criticalTables) {
      if (allViews.includes(table)) {
        this.results.views_excluded.push({
          name: table,
          reason: 'VIEW - No soporta RLS',
          source: allViews.includes(table) ? 'schema' : 'known'
        });
        console.log(`  👁️ Excluida: ${table} (VIEW)`);
      } else {
        this.results.tables_to_configure.push(table);
        console.log(`  📋 Incluida: ${table} (TABLE)`);
      }
    }
  }

  /**
   * 🔍 IDENTIFICAR VIEWS DEL ESQUEMA
   */
  identifyViewsFromSchema() {
    const views = [];
    
    try {
      const tablasContent = fs.readFileSync(path.join(__dirname, 'tablas.txt'), 'utf8');
      const lines = tablasContent.split('\n');
      
      for (const line of lines) {
        // Buscar líneas que contienen "VIEW"
        if (line.includes('VIEW')) {
          const match = line.match(/^\|\s*([^|]+)\s*\|\s*VIEW\s*\|/);
          if (match) {
            const tableName = match[1].trim();
            if (tableName && !tableName.startsWith('-')) {
              views.push(tableName);
            }
          }
        }
      }
    } catch (error) {
      console.log('⚠️ No se pudo leer tablas.txt para identificar views');
    }
    
    return views;
  }

  /**
   * 🔧 GENERAR SQL CORREGIDO
   */
  generateCorrectedSQL() {
    let sql = `-- 🔧 CONFIGURACIÓN RLS CORREGIDA - SOLO TABLAS REALES
-- Generado: ${new Date().toISOString()}
-- Excluye VIEWS que no soportan RLS

-- VIEWS EXCLUIDAS (no soportan RLS):
${this.results.views_excluded.map(v => `-- ${v.name} (${v.reason})`).join('\n')}

-- MODO 1: RLS PERMISIVO PARA DESARROLLO (RECOMENDADO)
-- Solo para tablas reales - ${this.results.tables_to_configure.length} tablas

`;

    // Generar comandos solo para tablas reales
    for (const table of this.results.tables_to_configure) {
      sql += `-- Configuración para ${table} (TABLE)\n`;
      sql += `ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;\n`;
      sql += `CREATE POLICY "Permisive policy for development" ON ${table} FOR ALL USING (true) WITH CHECK (true);\n\n`;
    }
    
    sql += `\n-- MODO 2: RLS POR TENANT (PRODUCCIÓN)
-- Descomenta para activar seguridad por tenant\n\n`;

    // Políticas por tenant solo para tablas multi-tenant
    for (const table of this.results.tables_to_configure) {
      if (this.isMultiTenantTable(table)) {
        sql += `-- Configuración multi-tenant para ${table}\n`;
        sql += `-- ALTER TABLE ${table} DISABLE ROW LEVEL SECURITY; -- Desactivar RLS permisivo primero\n`;
        sql += `-- ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;\n`;
        sql += `-- CREATE POLICY "Tenant isolation policy" ON ${table} FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::integer);\n\n`;
      }
    }

    // Comandos adicionales de limpieza
    sql += `\n-- COMANDOS DE LIMPIEZA (si es necesario)
-- Para eliminar políticas existentes antes de crear nuevas:\n\n`;

    for (const table of this.results.tables_to_configure) {
      sql += `-- DROP POLICY IF EXISTS "Permisive policy for development" ON ${table};\n`;
    }

    this.results.sql_corrected = sql;
  }

  /**
   * 🏢 VERIFICAR SI ES TABLA MULTI-TENANT
   */
  isMultiTenantTable(table) {
    const multiTenantTables = [
      'actividades_dpo', 'mapeo_datos_rat', 'organizaciones',
      'proveedores', 'generated_documents', 'documentos_generados',
      'notifications', 'dpo_notifications', 'reports', 'user_sessions',
      'activities', 'audit_log', 'system_error_logs'
    ];
    
    return multiTenantTables.includes(table);
  }

  /**
   * 💾 GUARDAR SQL CORREGIDO
   */
  saveCorrectedSQL() {
    // Guardar SQL corregido
    const sqlFilename = 'RLS_CONFIGURATION_CORRECTED.sql';
    fs.writeFileSync(sqlFilename, this.results.sql_corrected);
    console.log(`📄 SQL corregido guardado: ${sqlFilename}`);

    // Backup del SQL original
    if (fs.existsSync('RLS_CONFIGURATION_COMMANDS.sql')) {
      fs.copyFileSync('RLS_CONFIGURATION_COMMANDS.sql', 'RLS_CONFIGURATION_ORIGINAL_BACKUP.sql');
      console.log(`💾 Backup original: RLS_CONFIGURATION_ORIGINAL_BACKUP.sql`);
    }

    // Generar reporte de corrección
    const report = {
      correction_id: this.correctionId,
      timestamp: new Date().toISOString(),
      type: 'RLS_SQL_CORRECTION',
      
      summary: {
        original_tables_count: this.criticalTables.length,
        tables_to_configure: this.results.tables_to_configure.length,
        views_excluded: this.results.views_excluded.length,
        correction_reason: 'VIEWS do not support ROW LEVEL SECURITY'
      },
      
      tables_included: this.results.tables_to_configure,
      views_excluded: this.results.views_excluded,
      
      files_generated: [
        sqlFilename,
        'RLS_CONFIGURATION_ORIGINAL_BACKUP.sql'
      ],
      
      next_steps: [
        `Ejecutar ${sqlFilename} como administrador en Supabase`,
        'Re-ejecutar testing para validar configuración',
        'Verificar que no hay más errores de VIEW'
      ]
    };

    const reportFilename = `RLS_CORRECTION_REPORT_${this.correctionId}.json`;
    fs.writeFileSync(reportFilename, JSON.stringify(report, null, 2));
    console.log(`📊 Reporte guardado: ${reportFilename}`);
  }
}

// EJECUTAR CORRECCIÓN
if (require.main === module) {
  const corrector = new RLSSQLCorrector();
  corrector.correctRLSSQL()
    .then(results => {
      console.log('\n🎉 CORRECCIÓN SQL RLS COMPLETADA');
      console.log(`📋 Tablas configurables: ${results.tables_to_configure.length}`);
      console.log(`👁️ Views excluidas: ${results.views_excluded.length}`);
      console.log(`📄 Archivo: RLS_CONFIGURATION_CORRECTED.sql`);
      console.log('\n🔧 PRÓXIMO PASO: Ejecutar el SQL corregido como administrador');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ ERROR EN CORRECCIÓN:', error.message);
      process.exit(1);
    });
}

module.exports = RLSSQLCorrector;