const fs = require('fs');
const path = require('path');

/**
 * 🔥 IDENTIFICADOR DE TABLAS CRÍTICAS
 * 
 * De 298 tablas → Identificar SOLO las realmente críticas
 * Análisis cruzado: Código vs Tablas reales
 */

class CriticalTablesIdentifier {
  constructor() {
    this.auditId = `critical_${Date.now()}`;
    this.realTables = new Set();
    this.codeUsedTables = new Map(); // tabla -> [archivos que la usan]
    this.criticalTables = new Map(); // tabla -> razón de criticidad
    this.redundantTables = [];
    this.orphanTables = [];
  }

  /**
   * 🚀 EJECUTAR IDENTIFICACIÓN DE TABLAS CRÍTICAS
   */
  async identifyRealCriticalTables() {
    console.log('🔥 INICIANDO IDENTIFICACIÓN DE TABLAS CRÍTICAS...');
    console.log('📊 Analizando 298 tablas vs código real');
    
    const startTime = Date.now();
    
    try {
      // PASO 1: Cargar tablas reales desde tablas.txt
      console.log('📋 PASO 1: Cargando esquema real (298 tablas)...');
      await this.loadRealTables();
      console.log(`✅ Cargadas ${this.realTables.size} tablas reales`);
      
      // PASO 2: Escanear código para encontrar tablas utilizadas
      console.log('🔍 PASO 2: Escaneando código para tablas utilizadas...');
      await this.scanCodeForTableUsage();
      console.log(`✅ Encontradas ${this.codeUsedTables.size} tablas en código`);
      
      // PASO 3: Análisis de criticidad
      console.log('🎯 PASO 3: Analizando criticidad de cada tabla...');
      await this.analyzeCriticality();
      console.log(`✅ Identificadas ${this.criticalTables.size} tablas críticas`);
      
      // PASO 4: Identificar tablas redundantes/huérfanas
      console.log('🧹 PASO 4: Identificando tablas redundantes y huérfanas...');
      this.identifyRedundantTables();
      console.log(`❌ Redundantes: ${this.redundantTables.length}`);
      console.log(`👤 Huérfanas: ${this.orphanTables.length}`);
      
      // PASO 5: Generar reporte crítico
      const totalTime = Date.now() - startTime;
      const report = this.generateCriticalReport(totalTime);
      
      console.log('\n🎉 IDENTIFICACIÓN CRÍTICA COMPLETADA');
      console.log(`🎯 CRÍTICAS: ${this.criticalTables.size} tablas`);
      console.log(`❌ ELIMINAR: ${this.redundantTables.length + this.orphanTables.length} tablas`);
      console.log(`📉 REDUCCIÓN: ${Math.round(((this.redundantTables.length + this.orphanTables.length) / this.realTables.size) * 100)}%`);
      
      return report;
      
    } catch (error) {
      console.error('❌ ERROR EN IDENTIFICACIÓN:', error.message);
      throw error;
    }
  }

  /**
   * 📋 CARGAR TABLAS REALES DESDE ESQUEMA
   */
  async loadRealTables() {
    try {
      const tablasContent = fs.readFileSync(path.join(__dirname, 'tablas.txt'), 'utf8');
      const lines = tablasContent.split('\n');
      
      for (const line of lines) {
        const match = line.match(/^\|\s*([^|]+)\s*\|/);
        if (match && match[1].trim() !== 'table_name' && match[1].trim() !== '---') {
          const tableName = match[1].trim();
          if (tableName && !tableName.startsWith('-')) {
            this.realTables.add(tableName);
          }
        }
      }
    } catch (error) {
      console.error('Error cargando tablas reales:', error.message);
      throw error;
    }
  }

  /**
   * 🔍 ESCANEAR CÓDIGO PARA ENCONTRAR USO DE TABLAS
   */
  async scanCodeForTableUsage() {
    const frontendPath = path.join(__dirname, 'frontend', 'src');
    const files = this.getAllJSFiles(frontendPath);
    
    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const relativePath = file.replace(__dirname, '').replace(/\\/g, '/');
        
        // Buscar referencias a tablas en el código
        this.findTableReferences(content, relativePath);
        
      } catch (error) {
        console.error(`Error escaneando ${file}:`, error.message);
      }
    }
  }

  /**
   * 🔍 ENCONTRAR REFERENCIAS A TABLAS EN CÓDIGO
   */
  findTableReferences(content, filePath) {
    // Patrones para encontrar referencias a tablas
    const patterns = [
      // supabase.from('tabla')
      /supabase\.from\s*\(\s*['"`](\w+)['"`]\s*\)/g,
      // .from('tabla')  
      /\.from\s*\(\s*['"`](\w+)['"`]\s*\)/g,
      // 'tabla' como string en contexto de DB
      /['"`](\w+)['"`]\s*[:=]\s*['"`]\w+['"`]/g,
      // Referencias directas a nombres de tabla
      /(?:table|tabla|from|into|update|delete)\s*['"`](\w+)['"`]/gi
    ];

    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const tableName = match[1];
        
        // Verificar si la tabla existe en nuestro esquema real
        if (this.realTables.has(tableName)) {
          if (!this.codeUsedTables.has(tableName)) {
            this.codeUsedTables.set(tableName, []);
          }
          
          if (!this.codeUsedTables.get(tableName).includes(filePath)) {
            this.codeUsedTables.get(tableName).push(filePath);
          }
        }
      }
    });

    // Búsqueda adicional: nombres de tabla como variables o constantes
    for (const tableName of this.realTables) {
      const tableRegex = new RegExp(`\\b${tableName}\\b`, 'gi');
      if (tableRegex.test(content)) {
        if (!this.codeUsedTables.has(tableName)) {
          this.codeUsedTables.set(tableName, []);
        }
        
        if (!this.codeUsedTables.get(tableName).includes(filePath)) {
          this.codeUsedTables.get(tableName).push(filePath);
        }
      }
    }
  }

  /**
   * 🎯 ANALIZAR CRITICIDAD DE CADA TABLA
   */
  async analyzeCriticality() {
    for (const tableName of this.realTables) {
      const usageFiles = this.codeUsedTables.get(tableName) || [];
      const usageCount = usageFiles.length;
      
      let criticality = this.calculateCriticality(tableName, usageCount, usageFiles);
      
      if (criticality.level === 'CRITICAL' || criticality.level === 'HIGH') {
        this.criticalTables.set(tableName, criticality);
      }
    }
  }

  /**
   * 📊 CALCULAR CRITICIDAD DE UNA TABLA
   */
  calculateCriticality(tableName, usageCount, usageFiles) {
    let score = 0;
    let level = 'LOW';
    let reasons = [];

    // Factor 1: Uso en código
    if (usageCount > 0) {
      score += usageCount * 10;
      reasons.push(`Usado en ${usageCount} archivos`);
    }

    // Factor 2: Tablas principales del sistema LPDP
    const coreTables = [
      'organizaciones', 'users', 'usuarios', 'tenants',
      'rats', 'mapeo_datos_rat', 'actividades_dpo',
      'proveedores', 'generated_documents', 'documentos_generados',
      'audit_log', 'audit_logs', 'activities',
      'user_sessions', 'notifications'
    ];
    
    if (coreTables.includes(tableName)) {
      score += 50;
      reasons.push('Tabla core del sistema LPDP');
    }

    // Factor 3: Tablas de seguridad/auditoría
    const securityTables = [
      'audit_log', 'audit_logs', 'activities', 'user_sessions',
      'system_error_logs', 'partner_access_logs', 'system_alerts'
    ];
    
    if (securityTables.includes(tableName)) {
      score += 30;
      reasons.push('Tabla de seguridad/auditoría');
    }

    // Factor 4: Tablas de configuración crítica
    const configTables = [
      'tenant_configs', 'tenant_limits', 'system_config',
      'tenant_settings', 'user_preferences'
    ];
    
    if (configTables.includes(tableName)) {
      score += 25;
      reasons.push('Configuración crítica del sistema');
    }

    // Factor 5: Tablas con relaciones críticas (contienen tenant_id)
    const tenantRelatedKeywords = ['tenant', 'user', 'organizacion', 'empresa'];
    if (tenantRelatedKeywords.some(keyword => tableName.includes(keyword))) {
      score += 20;
      reasons.push('Multi-tenant crítico');
    }

    // Factor 6: Tablas de funcionalidad principal LPDP
    const lpdpFunctionTables = [
      'dpa_documents', 'dpas', 'eipd_documents', 'evaluaciones_impacto',
      'compliance_records', 'compliance_reports', 'legal_articles'
    ];
    
    if (lpdpFunctionTables.includes(tableName)) {
      score += 40;
      reasons.push('Funcionalidad principal LPDP');
    }

    // Determinar nivel de criticidad
    if (score >= 60) {
      level = 'CRITICAL';
    } else if (score >= 30) {
      level = 'HIGH';  
    } else if (score >= 15) {
      level = 'MEDIUM';
    } else if (score >= 5) {
      level = 'LOW';
    } else {
      level = 'UNUSED';
    }

    return {
      score,
      level,
      reasons,
      usage_files: usageFiles,
      usage_count: usageCount
    };
  }

  /**
   * 🧹 IDENTIFICAR TABLAS REDUNDANTES Y HUÉRFANAS
   */
  identifyRedundantTables() {
    for (const tableName of this.realTables) {
      const criticality = this.criticalTables.get(tableName);
      
      if (!criticality) {
        // No está en críticas, analizar si es redundante u huérfana
        const usageFiles = this.codeUsedTables.get(tableName) || [];
        
        if (usageFiles.length === 0) {
          // Tabla huérfana (no usada en código)
          this.orphanTables.push({
            table: tableName,
            reason: 'No utilizada en el código',
            recommendation: 'ELIMINAR - No hay referencias en el código'
          });
        } else {
          // Podría ser redundante si tiene poco uso
          const score = this.calculateCriticality(tableName, usageFiles.length, usageFiles);
          if (score.level === 'LOW' || score.level === 'UNUSED') {
            this.redundantTables.push({
              table: tableName,
              usage_count: usageFiles.length,
              files: usageFiles,
              reason: 'Uso muy bajo - posible redundancia',
              recommendation: 'REVISAR - Considerar consolidar o eliminar'
            });
          }
        }
      }
    }

    // Identificar duplicados por funcionalidad similar
    this.identifyDuplicateFunctionality();
  }

  /**
   * 🔄 IDENTIFICAR FUNCIONALIDAD DUPLICADA
   */
  identifyDuplicateFunctionality() {
    const functionalGroups = {
      'audit': ['audit_log', 'audit_logs', 'activities', 'ia_agent_reports'],
      'documents': ['generated_documents', 'documentos_generados', 'documentos_dpa'],
      'notifications': ['notifications', 'dpo_notifications', 'user_notifications'],
      'sessions': ['user_sessions', 'session_data', 'sandbox_sessions'],
      'errors': ['error_logs', 'system_error_logs'],
      'usage': ['api_usage_metrics', 'company_usage_metrics', 'partner_usage_stats']
    };

    for (const [group, tables] of Object.entries(functionalGroups)) {
      const existingTables = tables.filter(table => this.realTables.has(table));
      
      if (existingTables.length > 1) {
        // Hay duplicación potencial
        const mostUsed = existingTables
          .map(table => ({
            table,
            usage: this.codeUsedTables.get(table)?.length || 0
          }))
          .sort((a, b) => b.usage - a.usage);

        // Marcar las menos usadas como redundantes
        for (let i = 1; i < mostUsed.length; i++) {
          if (!this.criticalTables.has(mostUsed[i].table)) {
            this.redundantTables.push({
              table: mostUsed[i].table,
              usage_count: mostUsed[i].usage,
              reason: `Duplica funcionalidad de ${mostUsed[0].table}`,
              group: group,
              recommendation: 'CONSOLIDAR - Migrar datos y eliminar tabla duplicada'
            });
          }
        }
      }
    }
  }

  /**
   * 📊 GENERAR REPORTE CRÍTICO
   */
  generateCriticalReport(totalTime) {
    const totalTables = this.realTables.size;
    const criticalCount = this.criticalTables.size;
    const redundantCount = this.redundantTables.length;
    const orphanCount = this.orphanTables.length;
    const eliminableCount = redundantCount + orphanCount;
    const reductionPercent = Math.round((eliminableCount / totalTables) * 100);

    const report = {
      audit_id: this.auditId,
      timestamp: new Date().toISOString(),
      type: 'CRITICAL_TABLES_IDENTIFICATION',
      
      summary: {
        total_tables_in_schema: totalTables,
        critical_tables_identified: criticalCount,
        redundant_tables: redundantCount,
        orphan_tables: orphanCount,
        tables_to_eliminate: eliminableCount,
        reduction_percentage: reductionPercent,
        analysis_time_ms: totalTime
      },

      critical_tables: Object.fromEntries(
        Array.from(this.criticalTables.entries()).map(([table, data]) => [
          table,
          {
            criticality_level: data.level,
            score: data.score,
            reasons: data.reasons,
            usage_count: data.usage_count,
            files_using: data.usage_files
          }
        ])
      ),

      elimination_candidates: {
        orphan_tables: this.orphanTables,
        redundant_tables: this.redundantTables
      },

      recommendations: {
        phase_1_keep: Array.from(this.criticalTables.keys()),
        phase_2_eliminate: [
          ...this.orphanTables.map(t => t.table),
          ...this.redundantTables.map(t => t.table)
        ],
        phase_3_consolidate: this.redundantTables
          .filter(t => t.group)
          .map(t => ({ table: t.table, consolidate_into: t.group }))
      },

      action_plan: [
        {
          phase: 1,
          action: 'MANTENER TABLAS CRÍTICAS',
          tables_count: criticalCount,
          description: 'Conservar y optimizar tablas identificadas como críticas'
        },
        {
          phase: 2, 
          action: 'ELIMINAR TABLAS HUÉRFANAS',
          tables_count: orphanCount,
          description: 'Eliminar tablas sin uso en el código'
        },
        {
          phase: 3,
          action: 'REVISAR/CONSOLIDAR REDUNDANTES', 
          tables_count: redundantCount,
          description: 'Analizar y consolidar tablas con funcionalidad duplicada'
        }
      ]
    };

    // Guardar reporte
    const filename = `TABLAS_CRITICAS_IDENTIFICADAS_${this.auditId}.json`;
    fs.writeFileSync(filename, JSON.stringify(report, null, 2));
    console.log(`📝 Reporte crítico guardado: ${filename}`);

    return report;
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
      // Ignorar directorios inaccesibles
    }
    
    return files;
  }
}

// EJECUTAR IDENTIFICACIÓN CRÍTICA
if (require.main === module) {
  const identifier = new CriticalTablesIdentifier();
  identifier.identifyRealCriticalTables()
    .then(report => {
      console.log('\n🎉 IDENTIFICACIÓN DE TABLAS CRÍTICAS COMPLETADA');
      console.log(`🎯 MANTENER: ${report.summary.critical_tables_identified} tablas críticas`);
      console.log(`❌ ELIMINAR: ${report.summary.tables_to_eliminate} tablas innecesarias`);
      console.log(`📉 REDUCCIÓN: ${report.summary.reduction_percentage}% del esquema`);
      console.log(`⏱️ Tiempo: ${Math.round(report.summary.analysis_time_ms/1000)}s`);
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ ERROR EN IDENTIFICACIÓN CRÍTICA:', error.message);
      process.exit(1);
    });
}

module.exports = CriticalTablesIdentifier;