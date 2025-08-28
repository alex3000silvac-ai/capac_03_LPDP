/**
 * HOOK DE INTEGRACIÓN DE CUMPLIMIENTO
 * React Hook que integra automáticamente el sistema de inteligencia
 * con componentes existentes SIN modificar su código
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import complianceIntegrationService from '../services/complianceIntegrationService.js';

export const useComplianceIntegration = (ratId = null) => {
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dashboard, setDashboard] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const subscriptionRef = useRef(null);

  // Auto-cargar evaluación cuando cambia ratId
  useEffect(() => {
    if (ratId) {
      loadEvaluation(ratId);
    }
  }, [ratId]);

  // Suscribirse a actualizaciones automáticas
  useEffect(() => {
    subscriptionRef.current = complianceIntegrationService.subscribe((event) => {
      if (event.type === 'evaluation_complete') {
        if (!ratId || event.rat_id === ratId) {
          setEvaluation(event.evaluation);
          updateAlerts(event.evaluation.compliance_alerts);
        }
        // Actualizar dashboard si está cargado
        if (dashboard) {
          loadDashboard();
        }
      }
    });

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current();
      }
    };
  }, [ratId, dashboard]);

  /**
   * CARGAR EVALUACIÓN DE UN RAT ESPECÍFICO
   */
  const loadEvaluation = useCallback(async (id) => {
    try {
      setLoading(true);
      const eval = await complianceIntegrationService.getEvaluation(id);
      setEvaluation(eval);
      
      if (eval && eval.compliance_alerts) {
        updateAlerts(eval.compliance_alerts);
      }
    } catch (error) {
      console.error('❌ Error cargando evaluación:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * CARGAR DASHBOARD GENERAL DE CUMPLIMIENTO
   */
  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const dashboardData = await complianceIntegrationService.getComplianceDashboard();
      setDashboard(dashboardData);
      
      if (dashboardData.alertas_criticas) {
        updateAlerts(dashboardData.alertas_criticas);
      }
    } catch (error) {
      console.error('❌ Error cargando dashboard:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * FORZAR EVALUACIÓN MANUAL
   */
  const forceEvaluation = useCallback(async (ratData) => {
    try {
      setLoading(true);
      const evaluation = await complianceIntegrationService.forceEvaluation(ratData);
      setEvaluation(evaluation);
      updateAlerts(evaluation.compliance_alerts);
      return evaluation;
    } catch (error) {
      console.error('❌ Error en evaluación forzada:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * INTERCEPTOR PARA GUARDADO DE RAT
   * Función que se puede usar para wrap el guardado existente
   */
  const wrapSaveFunction = useCallback((originalSaveFunction) => {
    return async (ratData) => {
      return await complianceIntegrationService.interceptRATSave(ratData, originalSaveFunction);
    };
  }, []);

  /**
   * ACTUALIZAR ALERTAS LOCALES
   */
  const updateAlerts = (newAlerts) => {
    setAlerts(prevAlerts => {
      // Combinar alertas existentes con nuevas, evitando duplicados
      const combined = [...prevAlerts];
      newAlerts.forEach(newAlert => {
        const exists = combined.some(existing => 
          existing.type === newAlert.type && existing.message === newAlert.message
        );
        if (!exists) {
          combined.push({
            ...newAlert,
            id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString()
          });
        }
      });
      return combined.slice(-10); // Mantener solo las 10 más recientes
    });
  };

  /**
   * LIMPIAR ALERTA ESPECÍFICA
   */
  const clearAlert = useCallback((alertId) => {
    setAlerts(prevAlerts => prevAlerts.filter(alert => alert.id !== alertId));
  }, []);

  /**
   * CONFIGURAR SERVICIO
   */
  const configure = useCallback((options) => {
    complianceIntegrationService.configure(options);
  }, []);

  // API pública del hook
  return {
    // Estado
    evaluation,
    loading,
    dashboard,
    alerts,
    
    // Funciones de evaluación
    loadEvaluation,
    forceEvaluation,
    
    // Dashboard
    loadDashboard,
    
    // Integración transparente
    wrapSaveFunction,
    
    // Gestión de alertas
    clearAlert,
    
    // Configuración
    configure,
    
    // Utilitarios para componentes
    hasEvaluation: !!evaluation,
    hasAlerts: alerts.length > 0,
    complianceScore: evaluation?.compliance_score || 0,
    riskLevel: evaluation?.risk_assessment?.level || 'bajo',
    triggersCount: evaluation?.triggers?.length || 0,
    
    // Indicadores específicos
    requiresEIPD: evaluation?.triggers?.some(t => t.type === 'EIPD_OBLIGATORIA') || false,
    requiresDPA: evaluation?.triggers?.some(t => t.type === 'DPA_REQUERIDO') || false,
    hasCriticalAlerts: alerts.some(a => a.severity === 'error'),
    
    // Datos para componentes visuales
    getScoreColor: () => {
      if (!evaluation) return 'grey';
      const score = evaluation.compliance_score;
      if (score >= 80) return 'green';
      if (score >= 60) return 'orange'; 
      return 'red';
    },
    
    getRiskBadgeProps: () => {
      const level = evaluation?.risk_assessment?.level || 'bajo';
      const colors = {
        alto: { color: 'error', label: 'Alto Riesgo' },
        medio: { color: 'warning', label: 'Riesgo Medio' },
        bajo: { color: 'success', label: 'Riesgo Bajo' }
      };
      return colors[level];
    },
    
    getActionItems: () => {
      if (!evaluation) return [];
      return evaluation.triggers
        .filter(t => t.auto_generate)
        .map(trigger => ({
          id: trigger.type,
          title: trigger.action_required,
          priority: trigger.priority,
          type: trigger.type,
          reason: trigger.reason
        }));
    }
  };
};

/**
 * HOOK ESPECÍFICO PARA DASHBOARD DE CUMPLIMIENTO
 */
export const useComplianceDashboard = () => {
  const {
    dashboard,
    loading,
    loadDashboard,
    alerts,
    hasAlerts
  } = useComplianceIntegration();

  // Auto-cargar dashboard al montar
  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  return {
    dashboard,
    loading,
    alerts,
    hasAlerts,
    refresh: loadDashboard,
    
    // Métricas derivadas
    totalActivities: dashboard?.resumen?.total_actividades || 0,
    highRiskCount: dashboard?.resumen?.alto_riesgo || 0,
    averageScore: dashboard?.resumen?.score_promedio || 0,
    requiredEIPDs: dashboard?.resumen?.eipds_requeridas || 0,
    requiredDPAs: dashboard?.resumen?.dpas_requeridos || 0,
    
    // Estados derivados
    isHealthy: (dashboard?.resumen?.score_promedio || 0) >= 80,
    needsAttention: (dashboard?.resumen?.alto_riesgo || 0) > 0,
    hasUpcomingActions: (dashboard?.proximas_acciones?.length || 0) > 0
  };
};

/**
 * HOOK PARA INTEGRACIÓN TRANSPARENTE EN COMPONENTES EXISTENTES
 * Permite agregar inteligencia sin modificar código existente
 */
export const useTransparentIntegration = (originalSaveFunction) => {
  const { wrapSaveFunction, evaluation, loading } = useComplianceIntegration();
  
  const enhancedSaveFunction = wrapSaveFunction(originalSaveFunction);
  
  return {
    // Función de guardado mejorada (drop-in replacement)
    saveWithIntelligence: enhancedSaveFunction,
    
    // Datos adicionales disponibles después del guardado
    lastEvaluation: evaluation,
    evaluationLoading: loading,
    
    // Indicadores simples para mostrar en UI existente
    showIntelligenceIndicator: !!evaluation,
    showRiskBadge: evaluation?.risk_assessment?.level === 'alto',
    showComplianceScore: !!evaluation?.compliance_score
  };
};

export default useComplianceIntegration;