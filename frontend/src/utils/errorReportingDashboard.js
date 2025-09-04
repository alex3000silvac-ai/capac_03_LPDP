/**
 * 📈 DASHBOARD DE REPORTES DE ERRORES
 * 
 * Interfaz clara para visualizar y analizar errores del sistema
 * NO modifica nada - solo presenta información
 */

class ErrorReportingDashboard {
  constructor() {
    this.reportHistory = [];
  }

  /**
   * 📊 GENERAR DASHBOARD COMPLETO
   */
  generateDashboard() {
    try {
      const errorMonitor = window.errorMonitoringSystem || 
                          require('./errorMonitoringOnly').default;
      
      const report = errorMonitor.getFullReport();
      
      return {
        timestamp: new Date().toISOString(),
        system_health: this.calculateSystemHealth(report),
        critical_issues: this.identifyCriticalIssues(report),
        error_summary: this.createErrorSummary(report),
        recommendations: this.prioritizeRecommendations(report.recommendations),
        detailed_analysis: this.createDetailedAnalysis(report)
      };
      
    } catch (error) {
      return {
        error: 'No se pudo generar dashboard',
        message: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 🏥 CALCULAR SALUD DEL SISTEMA
   */
  calculateSystemHealth(report) {
    const { summary } = report;
    
    let healthScore = 100;
    
    // Restar puntos por errores críticos
    healthScore -= summary.critical_errors * 10;
    
    // Restar puntos por errores recientes
    if (summary.errors_24h > 10) healthScore -= 20;
    if (summary.errors_24h > 50) healthScore -= 30;
    
    // Restar por alertas sin resolver
    healthScore -= summary.unresolved_alerts * 5;
    
    // Limitar entre 0 y 100
    healthScore = Math.max(0, Math.min(100, healthScore));
    
    let status;
    if (healthScore >= 90) status = 'EXCELENTE';
    else if (healthScore >= 75) status = 'BUENO';
    else if (healthScore >= 50) status = 'REGULAR';
    else if (healthScore >= 25) status = 'MALO';
    else status = 'CRÍTICO';

    return {
      score: healthScore,
      status: status,
      message: this.getHealthMessage(status, summary)
    };
  }

  /**
   * 💬 MENSAJE DE SALUD
   */
  getHealthMessage(status, summary) {
    switch (status) {
      case 'EXCELENTE':
        return 'Sistema funcionando óptimamente. Pocos errores detectados.';
      case 'BUENO':
        return 'Sistema estable con errores menores manejables.';
      case 'REGULAR':
        return `Sistema funcional pero con ${summary.errors_24h} errores en 24h. Revisar.`;
      case 'MALO':
        return `Sistema con problemas. ${summary.critical_errors} errores críticos detectados.`;
      case 'CRÍTICO':
        return `Sistema en estado crítico. Acción inmediata requerida.`;
    }
  }

  /**
   * 🚨 IDENTIFICAR ISSUES CRÍTICOS
   */
  identifyCriticalIssues(report) {
    const issues = [];
    
    // Analizar errores críticos recientes
    report.recent_critical.forEach(error => {
      if (error.type.includes('406')) {
        issues.push({
          type: 'RLS_PERMISSIONS',
          severity: 'CRITICAL',
          description: 'Error 406 - Problema de permisos RLS en Supabase',
          error_id: error.id,
          timestamp: error.timestamp,
          action_required: 'Revisar configuración Row Level Security',
          technical_details: error.error
        });
      }
      
      if (error.type.includes('undefined')) {
        issues.push({
          type: 'DATA_INTEGRITY',
          severity: 'CRITICAL', 
          description: 'ID undefined en operaciones de base de datos',
          error_id: error.id,
          timestamp: error.timestamp,
          action_required: 'Validar lógica de creación/actualización de registros',
          technical_details: error.error
        });
      }

      if (error.type.includes('MISSING_COLUMN')) {
        issues.push({
          type: 'SCHEMA_ERROR',
          severity: 'HIGH',
          description: 'Columna faltante en esquema de base de datos',
          error_id: error.id,
          timestamp: error.timestamp,
          action_required: 'Ejecutar migración de base de datos',
          technical_details: error.error
        });
      }
    });

    return issues.slice(0, 10); // Top 10 más críticos
  }

  /**
   * 📈 CREAR RESUMEN DE ERRORES
   */
  createErrorSummary(report) {
    const { summary, error_patterns } = report;
    
    return {
      totals: {
        all_time: summary.total_errors,
        last_24h: summary.errors_24h,
        critical: summary.critical_errors,
        active_alerts: summary.unresolved_alerts
      },
      trends: {
        error_rate: this.calculateErrorRate(summary),
        most_common: error_patterns.slice(0, 3),
        severity_distribution: this.calculateSeverityDistribution(report)
      },
      time_analysis: {
        peak_hours: 'No implementado aún',
        error_frequency: summary.errors_24h > 0 ? 
          Math.round((24 * 60) / summary.errors_24h) : 0,
        last_error: report.recent_critical.length > 0 ?
          new Date(report.recent_critical[0].timestamp).toLocaleString() : 'Ninguno'
      }
    };
  }

  /**
   * 📊 CALCULAR TASA DE ERROR
   */
  calculateErrorRate(summary) {
    if (summary.errors_24h === 0) return 'EXCELENTE (0 errores/24h)';
    if (summary.errors_24h <= 5) return 'BUENA (<5 errores/24h)';
    if (summary.errors_24h <= 20) return 'MODERADA (<20 errores/24h)';
    return 'ALTA (>20 errores/24h)';
  }

  /**
   * 📊 DISTRIBUCIÓN DE SEVERIDAD
   */
  calculateSeverityDistribution(report) {
    const distribution = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
    
    // Esta lógica necesitaría acceso a todos los errores
    // Por ahora, estimación basada en datos disponibles
    distribution.CRITICAL = report.summary.critical_errors;
    distribution.HIGH = Math.round(report.summary.errors_24h * 0.2);
    distribution.MEDIUM = Math.round(report.summary.errors_24h * 0.5);
    distribution.LOW = report.summary.errors_24h - distribution.CRITICAL - distribution.HIGH - distribution.MEDIUM;
    
    return distribution;
  }

  /**
   * 💡 PRIORIZAR RECOMENDACIONES
   */
  prioritizeRecommendations(recommendations) {
    return recommendations
      .sort((a, b) => {
        const priorities = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
        return (priorities[b.priority] || 1) - (priorities[a.priority] || 1);
      })
      .map((rec, index) => ({
        ...rec,
        rank: index + 1,
        estimated_impact: this.estimateImpact(rec)
      }));
  }

  /**
   * 📊 ESTIMAR IMPACTO
   */
  estimateImpact(recommendation) {
    if (recommendation.priority === 'CRITICAL') {
      return 'ALTO - Puede afectar funcionalidad crítica del sistema';
    }
    if (recommendation.priority === 'HIGH') {
      return 'MEDIO - Puede causar errores en operaciones importantes';
    }
    return 'BAJO - Mejora general de estabilidad';
  }

  /**
   * 🔍 ANÁLISIS DETALLADO
   */
  createDetailedAnalysis(report) {
    return {
      error_hotspots: this.identifyErrorHotspots(report),
      failure_patterns: this.identifyFailurePatterns(report),
      system_vulnerabilities: this.identifyVulnerabilities(report),
      monitoring_insights: this.generateInsights(report)
    };
  }

  /**
   * 🔥 IDENTIFICAR HOTSPOTS DE ERROR
   */
  identifyErrorHotspots(report) {
    const hotspots = [];
    
    // Analizar patrones para identificar areas problemáticas
    report.error_patterns.forEach(pattern => {
      if (pattern.count > 3) {
        hotspots.push({
          area: pattern.pattern,
          error_count: pattern.count,
          severity: pattern.count > 10 ? 'HIGH' : 'MEDIUM',
          description: this.getHotspotDescription(pattern.pattern)
        });
      }
    });

    return hotspots;
  }

  /**
   * 📄 DESCRIPCIÓN DE HOTSPOT
   */
  getHotspotDescription(pattern) {
    const descriptions = {
      'HTTP': 'Errores de comunicación con servidor/API',
      'CONSOLE': 'Errores reportados en consola del navegador', 
      'FETCH': 'Problemas en requests HTTP',
      'UNHANDLED': 'Errores no capturados en el código',
      'JAVASCRIPT': 'Errores de ejecución JavaScript'
    };
    
    return descriptions[pattern] || `Errores del tipo ${pattern}`;
  }

  /**
   * 🔄 IDENTIFICAR PATRONES DE FALLA
   */
  identifyFailurePatterns(report) {
    const patterns = [];
    
    if (report.summary.critical_errors > 2) {
      patterns.push({
        pattern: 'RECURRENT_CRITICAL_ERRORS',
        description: 'Errores críticos recurrentes - posible problema sistémico',
        frequency: 'Alta',
        impact: 'Crítico'
      });
    }

    return patterns;
  }

  /**
   * 🛡️ IDENTIFICAR VULNERABILIDADES
   */
  identifyVulnerabilities(report) {
    const vulnerabilities = [];
    
    // Buscar indicadores de vulnerabilidades
    report.active_alerts.forEach(alert => {
      if (alert.title.includes('406')) {
        vulnerabilities.push({
          type: 'SECURITY_PERMISSIONS',
          description: 'Configuración RLS puede permitir acceso no autorizado',
          risk_level: 'HIGH',
          mitigation: 'Revisar y corregir políticas RLS en Supabase'
        });
      }
    });

    return vulnerabilities;
  }

  /**
   * 🧠 GENERAR INSIGHTS
   */
  generateInsights(report) {
    const insights = [];
    
    if (report.summary.errors_24h === 0) {
      insights.push('✅ Sistema estable - no se detectaron errores en las últimas 24 horas');
    }
    
    if (report.summary.critical_errors > 0) {
      insights.push(`⚠️ ${report.summary.critical_errors} errores críticos requieren atención inmediata`);
    }

    if (report.error_patterns.length > 0) {
      insights.push(`📊 Patrón más común: ${report.error_patterns[0].pattern} (${report.error_patterns[0].count} ocurrencias)`);
    }

    return insights;
  }

  /**
   * 🖨️ IMPRIMIR REPORTE EN CONSOLA
   */
  printConsoleDashboard() {
    const dashboard = this.generateDashboard();
    
    console.group('📈 DASHBOARD DE ERRORES DEL SISTEMA');
    //console.log('⏰ Timestamp:', dashboard.timestamp);
    //console.log('🏥 Salud Sistema:', `${dashboard.system_health.score}% - ${dashboard.system_health.status}`);
    //console.log('📊 Errores 24h:', dashboard.error_summary?.totals?.last_24h || 0);
    //console.log('🚨 Errores Críticos:', dashboard.error_summary?.totals?.critical || 0);
    
    if (dashboard.critical_issues?.length > 0) {
      console.group('🚨 ISSUES CRÍTICOS');
      dashboard.critical_issues.forEach((issue, index) => {
        //console.log(`${index + 1}. ${issue.description}`);
        //console.log(`   Acción: ${issue.action_required}`);
      });
      console.groupEnd();
    }

    if (dashboard.recommendations?.length > 0) {
      console.group('💡 RECOMENDACIONES PRIORITARIAS');
      dashboard.recommendations.slice(0, 3).forEach((rec, index) => {
        //console.log(`${index + 1}. [${rec.priority}] ${rec.action}`);
      });
      console.groupEnd();
    }

    console.groupEnd();
    
    return dashboard;
  }

  /**
   * 💾 EXPORTAR REPORTE
   */
  exportReport() {
    const dashboard = this.generateDashboard();
    const reportData = JSON.stringify(dashboard, null, 2);
    
    try {
      // Guardar en localStorage
      localStorage.setItem(`error_report_${Date.now()}`, reportData);
      
      // También crear descarga si es posible
      const blob = new Blob([reportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      return {
        success: true,
        data: dashboard,
        download_url: url,
        timestamp: dashboard.timestamp
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Instancia global del dashboard
const errorDashboard = new ErrorReportingDashboard();

// Hacer disponible globalmente para fácil acceso
window.errorDashboard = errorDashboard;

// Exports
export const generateErrorReport = () => errorDashboard.generateDashboard();
export const printErrorDashboard = () => errorDashboard.printConsoleDashboard();
export const exportErrorReport = () => errorDashboard.exportReport();

// Función de conveniencia para acceso rápido
window.showErrorReport = () => errorDashboard.printConsoleDashboard();

export default errorDashboard;