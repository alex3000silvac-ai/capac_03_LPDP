/**
 * 📊 IA AGENT REPORTER - Informe de Estado del Agente IA
 * 
 * Genera informes automáticos del estado y actividad del IA Agent
 * en el sistema desplegado en Render
 */

import { supabase } from '../config/supabaseConfig';

class IAAgentReporter {
  constructor() {
    this.reportId = `report_${Date.now()}`;
  }

  /**
   * 📋 GENERAR INFORME COMPLETO DE IA
   */
  async generateFullReport() {
    const timestamp = new Date().toISOString();
    // Informe IA Agent en progreso

    try {
      const report = {
        timestamp,
        deployment_status: await this.checkDeploymentStatus(),
        agent_status: await this.checkAgentStatus(),
        recent_activity: await this.getRecentActivity(),
        compliance_metrics: await this.getComplianceMetrics(),
        error_analysis: await this.analyzeErrors(),
        supabase_health: await this.checkSupabaseHealth(),
        user_interactions: await this.getUserInteractions(),
        document_generation: await this.getDocumentGeneration(),
        recommendations: await this.generateRecommendations()
      };

      // Guardar informe en Supabase
      await this.saveReport(report);
      
      return report;
    } catch (error) {
      console.error('🚨 Error generando informe IA:', error);
      return {
        error: true,
        message: error.message,
        timestamp
      };
    }
  }

  /**
   * 🚀 VERIFICAR ESTADO DEL DESPLIEGUE
   */
  async checkDeploymentStatus() {
    try {
      // Verificar que el frontend está respondiendo
      const frontendCheck = await fetch(window.location.origin + '/manifest.json');
      
      return {
        frontend_status: frontendCheck.ok ? 'ONLINE' : 'ERROR',
        frontend_url: window.location.origin,
        build_timestamp: frontendCheck.ok ? 'Reciente' : 'Error',
        environment: process.env.NODE_ENV || 'production',
        ia_agent_loaded: typeof window.systemValidationAgent !== 'undefined'
      };
    } catch (error) {
      return {
        frontend_status: 'ERROR',
        error: error.message
      };
    }
  }

  /**
   * 🤖 VERIFICAR ESTADO DEL AGENTE IA
   */
  async checkAgentStatus() {
    try {
      const { data: activeAgents } = await supabase
        .from('active_agents')
        .select('*')
        .eq('agent_type', 'system_validation')
        .order('last_activity', { ascending: false })
        .limit(1);

      if (activeAgents && activeAgents.length > 0) {
        const agent = activeAgents[0];
        const lastActivity = new Date(agent.last_activity);
        const timeSinceActivity = Date.now() - lastActivity.getTime();
        
        return {
          status: agent.status,
          agent_id: agent.agent_id,
          last_activity: agent.last_activity,
          minutes_since_activity: Math.round(timeSinceActivity / 60000),
          is_active: timeSinceActivity < 300000, // 5 minutos
          configuration: agent.configuration
        };
      } else {
        return {
          status: 'NOT_FOUND',
          message: 'No hay agentes IA activos registrados'
        };
      }
    } catch (error) {
      return {
        status: 'ERROR',
        error: error.message
      };
    }
  }

  /**
   * 📈 OBTENER ACTIVIDAD RECIENTE
   */
  async getRecentActivity() {
    try {
      const { data: activities } = await supabase
        .from('agent_activity_log')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(20);

      const last24h = activities?.filter(a => 
        new Date(a.timestamp).getTime() > Date.now() - 24 * 60 * 60 * 1000
      ) || [];

      return {
        total_activities: activities?.length || 0,
        last_24h: last24h.length,
        last_activity: activities?.[0]?.timestamp || null,
        activity_types: this.groupByType(activities || []),
        most_recent: activities?.slice(0, 5) || []
      };
    } catch (error) {
      return {
        error: error.message
      };
    }
  }

  /**
   * 📊 OBTENER MÉTRICAS DE COMPLIANCE
   */
  async getComplianceMetrics() {
    try {
      // Obtener RATs creados recientes
      const { data: rats } = await supabase
        .from('rats')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      // Obtener notificaciones DPO
      const { data: notifications } = await supabase
        .from('dpo_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      const ratMetrics = this.analyzeRATs(rats || []);
      const notificationMetrics = this.analyzeNotifications(notifications || []);

      return {
        rat_metrics: ratMetrics,
        notification_metrics: notificationMetrics,
        overall_compliance: this.calculateOverallCompliance(ratMetrics, notificationMetrics)
      };
    } catch (error) {
      return {
        error: error.message
      };
    }
  }

  /**
   * 🔍 ANALIZAR ERRORES
   */
  async analyzeErrors() {
    return {
      no_error_table: true,
      message: 'Tabla error_logs no existe - Sistema funcionando sin logging errors'
    };
  }

  /**
   * 💾 VERIFICAR SALUD SUPABASE
   */
  async checkSupabaseHealth() {
    try {
      const startTime = Date.now();
      
      // Test de conectividad básica
      const { data: test } = await supabase
        .from('organizaciones')
        .select('count')
        .limit(1);

      const responseTime = Date.now() - startTime;

      return {
        status: 'CONNECTED',
        response_time_ms: responseTime,
        performance: responseTime < 1000 ? 'EXCELLENT' : 
                    responseTime < 3000 ? 'GOOD' : 'SLOW',
        test_query_success: !!test
      };
    } catch (error) {
      return {
        status: 'ERROR',
        error: error.message
      };
    }
  }

  /**
   * 👥 OBTENER INTERACCIONES USUARIOS
   */
  async getUserInteractions() {
    try {
      const { data: sessions } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('is_active', true);

      const { data: recentRATs } = await supabase
        .from('rats')
        .select('created_at, responsable_proceso')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      return {
        active_sessions: sessions?.length || 0,
        rats_last_7_days: recentRATs?.length || 0,
        most_recent_rat: recentRATs?.[0] || null,
        user_activity: 'Normal'
      };
    } catch (error) {
      return {
        error: error.message
      };
    }
  }

  /**
   * 📄 VERIFICAR GENERACIÓN DE DOCUMENTOS
   */
  async getDocumentGeneration() {
    try {
      const { data: documents } = await supabase
        .from('generated_documents')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      const last24h = documents?.filter(d => 
        new Date(d.created_at).getTime() > Date.now() - 24 * 60 * 60 * 1000
      ) || [];

      return {
        total_documents: documents?.length || 0,
        generated_24h: last24h.length,
        document_types: this.groupByType(documents || [], 'document_type'),
        success_rate: this.calculateSuccessRate(documents || []),
        most_recent: documents?.slice(0, 5) || []
      };
    } catch (error) {
      return {
        no_documents_table: true,
        message: 'Tabla generated_documents no existe - Implementar si se requiere tracking'
      };
    }
  }

  /**
   * 💡 GENERAR RECOMENDACIONES
   */
  async generateRecommendations() {
    const recommendations = [];

    try {
      // Verificar si hay errores frecuentes
      const errorAnalysis = await this.analyzeErrors();
      if (errorAnalysis.errors_24h > 10) {
        recommendations.push({
          priority: 'HIGH',
          issue: 'Muchos errores detectados',
          action: 'Revisar logs y corregir problemas recurrentes',
          article: 'Art. 14 Ley 21.719 - Medidas de seguridad'
        });
      }

      // Verificar compliance score
      const compliance = await this.getComplianceMetrics();
      if (compliance.overall_compliance < 85) {
        recommendations.push({
          priority: 'CRITICAL',
          issue: 'Score de compliance bajo',
          action: 'Revisar configuración sistema y validaciones',
          article: 'Art. 7° Ley 21.719 - Principio responsabilidad'
        });
      }

      // Verificar actividad del agente
      const agentStatus = await this.checkAgentStatus();
      if (!agentStatus.is_active) {
        recommendations.push({
          priority: 'HIGH',
          issue: 'Agente IA no activo',
          action: 'Reiniciar agente de validación',
          article: 'Sistema de supervisión continua'
        });
      }

      if (recommendations.length === 0) {
        recommendations.push({
          priority: 'INFO',
          issue: 'Sistema funcionando correctamente',
          action: 'Mantener supervisión actual',
          article: 'Operación normal'
        });
      }

      return recommendations;
    } catch (error) {
      return [{
        priority: 'ERROR',
        issue: 'Error generando recomendaciones',
        action: 'Revisar conectividad Supabase',
        error: error.message
      }];
    }
  }

  // Helpers
  groupByType(items, typeField = 'activity_type') {
    const grouped = {};
    items.forEach(item => {
      const type = item[typeField] || 'unknown';
      grouped[type] = (grouped[type] || 0) + 1;
    });
    return grouped;
  }

  analyzeRATs(rats) {
    const withSensitive = rats.filter(r => 
      r.requiere_eipd || r.metadata?.requiereEIPD
    );
    
    return {
      total: rats.length,
      with_sensitive_data: withSensitive.length,
      compliance_rate: rats.length > 0 ? 
        ((rats.length - withSensitive.length) / rats.length * 100) : 100,
      avg_creation_time: 'N/A'
    };
  }

  analyzeNotifications(notifications) {
    const pending = notifications.filter(n => n.status === 'pending');
    const overdue = notifications.filter(n => {
      const created = new Date(n.created_at);
      const deadline = new Date(created.getTime() + 30 * 24 * 60 * 60 * 1000);
      return deadline < new Date() && n.status === 'pending';
    });

    return {
      total: notifications.length,
      pending: pending.length,
      overdue: overdue.length,
      response_rate: notifications.length > 0 ? 
        ((notifications.length - pending.length) / notifications.length * 100) : 100
    };
  }

  calculateOverallCompliance(ratMetrics, notificationMetrics) {
    let score = 100;
    
    // Penalizar por RATs con datos sensibles sin resolver
    if (ratMetrics.with_sensitive_data > 0) {
      score -= ratMetrics.with_sensitive_data * 5;
    }
    
    // Penalizar por notificaciones vencidas
    if (notificationMetrics.overdue > 0) {
      score -= notificationMetrics.overdue * 10;
    }
    
    return Math.max(0, score);
  }

  calculateSuccessRate(documents) {
    if (documents.length === 0) return 100;
    
    const successful = documents.filter(d => d.status === 'generated');
    return (successful.length / documents.length) * 100;
  }

  getMostCommonErrors(errors) {
    const errorCounts = this.groupByType(errors, 'error_message');
    return Object.entries(errorCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([error, count]) => ({ error, count }));
  }

  /**
   * 💾 GUARDAR INFORME EN SUPABASE
   */
  async saveReport(report) {
    try {
      await supabase
        .from('ia_agent_reports')
        .insert({
          report_id: this.reportId,
          report_data: report,
          created_at: new Date().toISOString(),
          report_type: 'full_status'
        });
      
      // Informe guardado en Supabase
    } catch (error) {
      console.error('Error guardando informe:', error);
    }
  }

  /**
   * 🖨️ FORMATEAR INFORME PARA CONSOLA
   */
  formatConsoleReport(report) {
    // Formato de reporte silencioso - datos disponibles en dashboard
    return report;
  }

  /**
   * 🎯 EJECUTAR INFORME Y MOSTRAR EN CONSOLA
   */
  async executeReport() {
    const report = await this.generateFullReport();
    this.formatConsoleReport(report);
    
    return report;
  }
}

// Instancia global
const iaAgentReporter = new IAAgentReporter();

// Auto-ejecutar informe cada 5 minutos en producción (modo silencioso)
if (process.env.NODE_ENV === 'production') {
  setInterval(() => {
    iaAgentReporter.executeReport();
  }, 300000);
}

export default iaAgentReporter;

// Para ejecutar manualmente en consola:
// iaAgentReporter.executeReport();