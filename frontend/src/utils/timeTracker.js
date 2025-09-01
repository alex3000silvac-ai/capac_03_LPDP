/**
 * Sistema de Métricas de Tiempo - Evidencia de Eficiencia
 * Mide y demuestra la reducción real de tiempo vs. métodos manuales
 */

import SecureStorage from './secureStorage';

class TimeTracker {
  constructor() {
    this.sessionKey = 'rat_time_session';
    this.metricsKey = 'rat_time_metrics';
    this.benchmarks = {
      // Tiempos estimados método manual (en minutos)
      identificacion_responsable: 15,
      mapeo_finalidades: 45,
      clasificacion_datos: 60,
      analisis_transferencias: 30,
      definicion_retencion: 25,
      medidas_seguridad: 20,
      revision_final: 30,
      documentacion_eipd: 120,
      // Total método manual: ~5.75 horas (345 minutos)
      total_manual: 345
    };
  }

  /**
   * Iniciar tracking de una nueva sesión RAT
   */
  startRATSession(userId, tenantId, ratType = 'standard') {
    const session = {
      userId,
      tenantId,
      ratType,
      startTime: Date.now(),
      steps: {},
      currentStep: 'inicio',
      pauses: [],
      interactions: 0,
      helpUsed: 0,
      errorsEncountered: 0
    };
    
    SecureStorage.setItem(this.sessionKey, session);
    console.log('📊 Iniciando tracking de eficiencia RAT');
    
    return session;
  }

  /**
   * Registrar inicio de un paso específico
   */
  startStep(stepName) {
    const session = SecureStorage.getItem(this.sessionKey);
    if (!session) return;

    session.steps[stepName] = {
      startTime: Date.now(),
      interactions: 0,
      helpViewed: [],
      validationErrors: 0
    };
    session.currentStep = stepName;
    
    SecureStorage.setItem(this.sessionKey, session);
  }

  /**
   * Registrar finalización de un paso
   */
  completeStep(stepName) {
    const session = SecureStorage.getItem(this.sessionKey);
    if (!session || !session.steps[stepName]) return;

    const step = session.steps[stepName];
    step.endTime = Date.now();
    step.duration = step.endTime - step.startTime;
    
    // Calcular eficiencia vs método manual
    const manualTime = this.benchmarks[stepName] || 30;
    step.efficiency = ((manualTime * 60000 - step.duration) / (manualTime * 60000)) * 100;
    
    SecureStorage.setItem(this.sessionKey, session);
    
    console.log(`✅ Paso completado: ${stepName}`);
    console.log(`⏱️ Tiempo: ${Math.round(step.duration / 1000)}s vs ${manualTime}min manual`);
    console.log(`📈 Eficiencia: ${Math.round(step.efficiency)}%`);
  }

  /**
   * Registrar interacción del usuario
   */
  recordInteraction(type, details = {}) {
    const session = SecureStorage.getItem(this.sessionKey);
    if (!session) return;

    session.interactions++;
    
    if (session.currentStep && session.steps[session.currentStep]) {
      session.steps[session.currentStep].interactions++;
      
      // Registrar tipos específicos de interacción
      switch (type) {
        case 'help_viewed':
          session.helpUsed++;
          session.steps[session.currentStep].helpViewed.push({
            helpTopic: details.topic,
            timestamp: Date.now()
          });
          break;
        case 'validation_error':
          session.errorsEncountered++;
          session.steps[session.currentStep].validationErrors++;
          break;
        case 'auto_suggestion_used':
          session.steps[session.currentStep].autoSuggestionsUsed = 
            (session.steps[session.currentStep].autoSuggestionsUsed || 0) + 1;
          break;
      }
    }
    
    SecureStorage.setItem(this.sessionKey, session);
  }

  /**
   * Registrar pausa (usuario sale del sistema)
   */
  pauseSession() {
    const session = SecureStorage.getItem(this.sessionKey);
    if (!session) return;

    session.pauses.push({
      startTime: Date.now(),
      step: session.currentStep
    });
    
    SecureStorage.setItem(this.sessionKey, session);
  }

  /**
   * Reanudar sesión
   */
  resumeSession() {
    const session = SecureStorage.getItem(this.sessionKey);
    if (!session || session.pauses.length === 0) return;

    const lastPause = session.pauses[session.pauses.length - 1];
    if (!lastPause.endTime) {
      lastPause.endTime = Date.now();
      lastPause.duration = lastPause.endTime - lastPause.startTime;
    }
    
    SecureStorage.setItem(this.sessionKey, session);
  }

  /**
   * Finalizar sesión RAT completa
   */
  finishRATSession() {
    const session = SecureStorage.getItem(this.sessionKey);
    if (!session) return null;

    session.endTime = Date.now();
    session.totalDuration = session.endTime - session.startTime;
    
    // Calcular tiempo neto (sin pausas)
    const totalPauseTime = session.pauses.reduce((total, pause) => {
      return total + (pause.duration || 0);
    }, 0);
    
    session.netDuration = session.totalDuration - totalPauseTime;
    
    // Calcular eficiencia general
    const manualTotalMinutes = this.benchmarks.total_manual;
    session.overallEfficiency = ((manualTotalMinutes * 60000 - session.netDuration) / (manualTotalMinutes * 60000)) * 100;
    
    // Guardar métricas históricas
    this.saveMetrics(session);
    
    // Limpiar sesión actual
    SecureStorage.removeItem(this.sessionKey);
    
    return this.generateEfficiencyReport(session);
  }

  /**
   * Guardar métricas históricas
   */
  saveMetrics(session) {
    const existingMetrics = SecureStorage.getItem(this.metricsKey) || [];
    
    const metrics = {
      sessionId: `rat_${Date.now()}`,
      userId: session.userId,
      tenantId: session.tenantId,
      ratType: session.ratType,
      completedAt: new Date().toISOString(),
      totalDuration: session.totalDuration,
      netDuration: session.netDuration,
      efficiency: session.overallEfficiency,
      steps: session.steps,
      interactions: session.interactions,
      helpUsed: session.helpUsed,
      errorsEncountered: session.errorsEncountered,
      pauseCount: session.pauses.length
    };
    
    existingMetrics.push(metrics);
    
    // Mantener solo las últimas 50 sesiones
    if (existingMetrics.length > 50) {
      existingMetrics.splice(0, existingMetrics.length - 50);
    }
    
    SecureStorage.setItem(this.metricsKey, existingMetrics);
  }

  /**
   * Generar reporte de eficiencia
   */
  generateEfficiencyReport(session) {
    const netMinutes = Math.round(session.netDuration / 60000);
    const manualMinutes = this.benchmarks.total_manual;
    const savedMinutes = manualMinutes - netMinutes;
    const efficiency = Math.round(session.overallEfficiency);
    
    return {
      completed: true,
      timeUsed: {
        net: netMinutes,
        total: Math.round(session.totalDuration / 60000),
        pauses: session.pauses.length
      },
      efficiency: {
        percentage: efficiency,
        timesSaved: Math.round(savedMinutes),
        manualEstimate: manualMinutes
      },
      userExperience: {
        interactions: session.interactions,
        helpUsed: session.helpUsed,
        errorsEncountered: session.errorsEncountered,
        mostDifficultStep: this.findMostDifficultStep(session.steps)
      },
      message: efficiency > 80 ? 
        `🎉 ¡Excelente! Completaste el RAT ${efficiency}% más rápido que el método manual, ahorrando ${savedMinutes} minutos.` :
        efficiency > 60 ?
        `👍 Buen trabajo. Ahorraste ${savedMinutes} minutos (${efficiency}% más eficiente).` :
        `📚 Este RAT tomó más tiempo. Te recomendamos revisar la ayuda contextual para futuros RATs.`
    };
  }

  /**
   * Encontrar el paso más difícil
   */
  findMostDifficultStep(steps) {
    let mostDifficult = null;
    let maxTime = 0;
    
    for (const [stepName, stepData] of Object.entries(steps)) {
      if (stepData.duration > maxTime) {
        maxTime = stepData.duration;
        mostDifficult = stepName;
      }
    }
    
    return mostDifficult;
  }

  /**
   * Obtener métricas agregadas para supervisión
   */
  getAggregatedMetrics() {
    const allMetrics = SecureStorage.getItem(this.metricsKey) || [];
    
    if (allMetrics.length === 0) {
      return {
        totalSessions: 0,
        averageEfficiency: 0,
        averageTime: 0
      };
    }
    
    const totalEfficiency = allMetrics.reduce((sum, m) => sum + (m.efficiency || 0), 0);
    const totalTime = allMetrics.reduce((sum, m) => sum + (m.netDuration || 0), 0);
    
    return {
      totalSessions: allMetrics.length,
      averageEfficiency: Math.round(totalEfficiency / allMetrics.length),
      averageTime: Math.round((totalTime / allMetrics.length) / 60000),
      last30Days: this.getLast30DaysMetrics(allMetrics),
      byTenant: this.getMetricsByTenant(allMetrics),
      mostCommonIssues: this.getMostCommonIssues(allMetrics)
    };
  }

  /**
   * Métricas últimos 30 días
   */
  getLast30DaysMetrics(allMetrics) {
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const recent = allMetrics.filter(m => 
      new Date(m.completedAt).getTime() > thirtyDaysAgo
    );
    
    return {
      sessions: recent.length,
      averageEfficiency: recent.length > 0 ? 
        Math.round(recent.reduce((sum, m) => sum + m.efficiency, 0) / recent.length) : 0
    };
  }

  /**
   * Métricas por tenant (para supervisión multi-empresa)
   */
  getMetricsByTenant(allMetrics) {
    const byTenant = {};
    
    allMetrics.forEach(m => {
      if (!byTenant[m.tenantId]) {
        byTenant[m.tenantId] = {
          sessions: 0,
          totalEfficiency: 0,
          totalTime: 0
        };
      }
      
      byTenant[m.tenantId].sessions++;
      byTenant[m.tenantId].totalEfficiency += m.efficiency;
      byTenant[m.tenantId].totalTime += m.netDuration;
    });
    
    // Calcular promedios
    Object.keys(byTenant).forEach(tenantId => {
      const tenant = byTenant[tenantId];
      tenant.averageEfficiency = Math.round(tenant.totalEfficiency / tenant.sessions);
      tenant.averageTime = Math.round((tenant.totalTime / tenant.sessions) / 60000);
    });
    
    return byTenant;
  }

  /**
   * Problemas más comunes
   */
  getMostCommonIssues(allMetrics) {
    const issues = {};
    
    allMetrics.forEach(m => {
      // Analizar errores por paso
      Object.entries(m.steps || {}).forEach(([stepName, stepData]) => {
        if (stepData.validationErrors > 0) {
          issues[`${stepName}_validation`] = (issues[`${stepName}_validation`] || 0) + 1;
        }
        if (stepData.helpViewed && stepData.helpViewed.length > 0) {
          issues[`${stepName}_help_needed`] = (issues[`${stepName}_help_needed`] || 0) + 1;
        }
      });
    });
    
    // Retornar los 5 problemas más comunes
    return Object.entries(issues)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([issue, count]) => ({ issue, count }));
  }

  /**
   * Obtener progreso actual de la sesión
   */
  getCurrentProgress() {
    const session = SecureStorage.getItem(this.sessionKey);
    if (!session) return null;

    const completedSteps = Object.keys(session.steps).filter(step => 
      session.steps[step].endTime
    ).length;
    
    const totalSteps = 6; // Los 6 pasos del RAT
    const progress = Math.round((completedSteps / totalSteps) * 100);
    
    const currentDuration = Date.now() - session.startTime;
    const estimatedTotal = this.estimateTotalTime(session);
    
    return {
      progress,
      completedSteps,
      totalSteps,
      currentDuration: Math.round(currentDuration / 60000),
      estimatedTotal: Math.round(estimatedTotal / 60000),
      currentStep: session.currentStep,
      efficiency: this.calculateCurrentEfficiency(session)
    };
  }

  /**
   * Estimar tiempo total basado en progreso actual
   */
  estimateTotalTime(session) {
    const completedSteps = Object.keys(session.steps).filter(step => 
      session.steps[step].endTime
    );
    
    if (completedSteps.length === 0) {
      return this.benchmarks.total_manual * 60000 * 0.2; // Estimación inicial optimista
    }
    
    const avgTimePerStep = completedSteps.reduce((sum, step) => 
      sum + session.steps[step].duration, 0
    ) / completedSteps.length;
    
    const remainingSteps = 6 - completedSteps.length;
    const estimatedRemaining = remainingSteps * avgTimePerStep;
    const currentElapsed = Date.now() - session.startTime;
    
    return currentElapsed + estimatedRemaining;
  }

  /**
   * Calcular eficiencia actual
   */
  calculateCurrentEfficiency(session) {
    const currentTime = Date.now() - session.startTime;
    const completedSteps = Object.keys(session.steps).filter(step => 
      session.steps[step].endTime
    ).length;
    
    if (completedSteps === 0) return 0;
    
    const progressRatio = completedSteps / 6;
    const expectedTimeAtThisProgress = this.benchmarks.total_manual * 60000 * progressRatio;
    
    return Math.max(0, ((expectedTimeAtThisProgress - currentTime) / expectedTimeAtThisProgress) * 100);
  }

  /**
   * Generar reporte para supervisión (para el jefe que monitorea)
   */
  generateSupervisorReport() {
    const metrics = this.getAggregatedMetrics();
    const currentProgress = this.getCurrentProgress();
    
    return {
      summary: {
        totalRATs: metrics.totalSessions,
        averageEfficiency: metrics.averageEfficiency,
        averageTime: metrics.averageTime,
        provenSavings: metrics.averageEfficiency > 80
      },
      current: currentProgress,
      byCompany: metrics.byTenant,
      recommendations: this.generateRecommendations(metrics),
      roi: this.calculateROI(metrics)
    };
  }

  /**
   * Calcular ROI demostrable
   */
  calculateROI(metrics) {
    if (metrics.totalSessions === 0) return null;
    
    const avgSavedMinutes = (this.benchmarks.total_manual - metrics.averageTime);
    const totalSavedHours = (avgSavedMinutes * metrics.totalSessions) / 60;
    
    // Asumir $50.000 CLP por hora de trabajo profesional
    const hourlyRate = 50000;
    const totalSavings = totalSavedHours * hourlyRate;
    
    return {
      totalSavedHours: Math.round(totalSavedHours),
      totalSavings: Math.round(totalSavings),
      avgSavingsPerRAT: Math.round(totalSavings / metrics.totalSessions),
      efficiencyImprovement: `${metrics.averageEfficiency}%`
    };
  }

  /**
   * Generar recomendaciones basadas en métricas
   */
  generateRecommendations(metrics) {
    const recommendations = [];
    
    if (metrics.averageEfficiency < 70) {
      recommendations.push('📚 Considerar más capacitación en el uso del sistema');
    }
    
    if (metrics.mostCommonIssues.length > 0) {
      const topIssue = metrics.mostCommonIssues[0];
      recommendations.push(`🎯 Foco en mejorar: ${topIssue.issue} (${topIssue.count} casos)`);
    }
    
    if (metrics.averageTime > 120) {
      recommendations.push('⚡ Revisar flujos de trabajo para mayor agilidad');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('🎉 Excelente performance, mantener el nivel actual');
    }
    
    return recommendations;
  }
}

// Singleton instance
const timeTracker = new TimeTracker();

export default timeTracker;