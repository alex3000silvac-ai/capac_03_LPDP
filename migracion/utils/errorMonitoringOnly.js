/**
 * 📊 SISTEMA DE MONITOREO PURO - SOLO OBSERVACIÓN Y ALERTAS
 * 
 * NO MODIFICA DATOS - SOLO OBSERVA, REPORTA Y ALERTA
 * Detecta errores críticos para corrección manual
 * GENERA ERRORES EN ARCHIVOS TXT
 */

import fileErrorLogger from './fileErrorLogger';

class ErrorMonitoringSystem {
  constructor() {
    this.errorLog = [];
    this.criticalErrors = [];
    this.patterns = new Map();
    this.alerts = [];
    this.isActive = false;
    
    this.setupErrorPatterns();
  }

  /**
   * 📋 DEFINIR PATRONES DE ERRORES (SOLO DETECCIÓN)
   */
  setupErrorPatterns() {
    this.patterns.set('RLS_ERROR_406', {
      patterns: ['406', 'not acceptable', 'rls', 'row level security'],
      severity: 'CRITICAL',
      description: 'Error RLS/Permisos 406 - Requiere configuración Supabase'
    });

    this.patterns.set('UNDEFINED_ID_ERROR', {
      patterns: ['id=eq.undefined', 'PATCH.*undefined'],
      severity: 'CRITICAL', 
      description: 'ID undefined en operación UPDATE - Requiere validación'
    });

    this.patterns.set('MISSING_COLUMN_ERROR', {
      patterns: ['priority.*notifications', 'column.*does not exist'],
      severity: 'HIGH',
      description: 'Columna faltante en esquema - Requiere migración BD'
    });

    this.patterns.set('NETWORK_ERROR', {
      patterns: ['network error', 'timeout', 'connection'],
      severity: 'MEDIUM',
      description: 'Error de conectividad - Revisar red/servidor'
    });

    this.patterns.set('DATA_PERSISTENCE_LOSS', {
      patterns: ['datos empresa.*no.*persistencia', 'formulario.*limpio'],
      severity: 'MEDIUM',
      description: 'Pérdida datos formulario - Revisar persistencia'
    });
  }

  /**
   * 🚀 INICIALIZAR MONITOREO
   */
  async init() {
    try {
      this.setupGlobalErrorCapture();
      this.setupConsoleMonitoring();
      this.setupFetchMonitoring();
      this.startPeriodicReporting();
      
      this.isActive = true;
      //console.log('📊 Sistema de monitoreo de errores ACTIVO (solo observación)');
      
    } catch (error) {
      console.error('❌ Error inicializando monitoreo:', error);
    }
  }

  /**
   * 🕷️ CAPTURA GLOBAL DE ERRORES (NO MODIFICA)
   */
  setupGlobalErrorCapture() {
    // Capturar errores no manejados
    window.addEventListener('unhandledrejection', (event) => {
      this.logError('UNHANDLED_PROMISE_REJECTION', event.reason, {
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent
      });
    });

    // Capturar errores JavaScript
    window.addEventListener('error', (event) => {
      this.logError('JAVASCRIPT_ERROR', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      });
    });
  }

  /**
   * 👂 MONITOREAR CONSOLA (NO MODIFICA)
   */
  setupConsoleMonitoring() {
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;

    // Interceptar console.error
    console.error = (...args) => {
      this.analyzeConsoleMessage('ERROR', args);
      originalConsoleError.apply(console, args);
    };

    // Interceptar console.warn  
    console.warn = (...args) => {
      this.analyzeConsoleMessage('WARN', args);
      originalConsoleWarn.apply(console, args);
    };
  }

  /**
   * 🌐 MONITOREAR REQUESTS FETCH (NO MODIFICA)
   */
  setupFetchMonitoring() {
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const startTime = performance.now();
      const url = typeof args[0] === 'string' ? args[0] : args[0]?.url || 'unknown';
      
      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        
        // Monitorear respuestas problemáticas (NO corregir)
        if (!response.ok) {
          this.logError('HTTP_ERROR', {
            status: response.status,
            statusText: response.statusText,
            url: url,
            method: args[1]?.method || 'GET',
            duration: Math.round(endTime - startTime)
          });
        }

        // Log requests lentos
        const duration = endTime - startTime;
        if (duration > 5000) {
          this.logError('SLOW_REQUEST', {
            url: url,
            duration: Math.round(duration),
            status: response.status
          });
        }

        return response;
        
      } catch (error) {
        const endTime = performance.now();
        
        this.logError('FETCH_NETWORK_ERROR', {
          url: url,
          error: error.message,
          duration: Math.round(endTime - startTime)
        });
        
        throw error; // Re-throw sin modificar
      }
    };
  }

  /**
   * 📝 LOG DE ERROR (SOLO REGISTRO)
   */
  logError(type, errorData, context = {}) {
    const errorEntry = {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: type,
      timestamp: Date.now(),
      datetime: new Date().toISOString(),
      error: errorData,
      context: {
        ...context,
        url: window.location.href,
        userAgent: navigator.userAgent.substring(0, 100)
      },
      severity: this.determineSeverity(type, errorData)
    };

    // Agregar a log
    this.errorLog.push(errorEntry);
    
    // Si es crítico, agregarlo a lista crítica
    if (errorEntry.severity === 'CRITICAL') {
      this.criticalErrors.push(errorEntry);
      this.createCriticalAlert(errorEntry);
    }

    // Limitar tamaño de logs
    if (this.errorLog.length > 500) {
      this.errorLog = this.errorLog.slice(-400);
    }

    // Log específico por tipo - archivo TXT
    this.logSpecificError(errorEntry);
  }

  /**
   * 🔍 ANALIZAR MENSAJE DE CONSOLA
   */
  analyzeConsoleMessage(level, args) {
    const message = args.join(' ').toLowerCase();
    
    for (const [patternType, config] of this.patterns) {
      if (config.patterns.some(pattern => message.includes(pattern.toLowerCase()))) {
        this.logError(`CONSOLE_${level}_${patternType}`, {
          original_message: args.join(' '),
          detected_pattern: patternType,
          pattern_description: config.description
        });
        break;
      }
    }
  }

  /**
   * ⚖️ DETERMINAR SEVERIDAD
   */
  determineSeverity(type, errorData) {
    // Buscar en patrones conocidos
    for (const [patternType, config] of this.patterns) {
      const errorText = JSON.stringify(errorData).toLowerCase();
      if (config.patterns.some(pattern => errorText.includes(pattern.toLowerCase()))) {
        return config.severity;
      }
    }

    // Severidad por tipo
    if (type.includes('CRITICAL') || type.includes('406') || type.includes('undefined')) {
      return 'CRITICAL';
    }
    if (type.includes('HTTP_ERROR') || type.includes('MISSING')) {
      return 'HIGH';
    }
    return 'MEDIUM';
  }

  /**
   * 🚨 CREAR ALERTA CRÍTICA
   */
  createCriticalAlert(errorEntry) {
    const alert = {
      id: `alert_${Date.now()}`,
      timestamp: Date.now(),
      title: `ERROR CRÍTICO DETECTADO: ${errorEntry.type}`,
      message: this.generateAlertMessage(errorEntry),
      errorId: errorEntry.id,
      resolved: false
    };

    this.alerts.push(alert);
    
    // Mostrar alerta en consola
    console.group('🚨 ALERTA CRÍTICA DEL SISTEMA');
    console.error('Tipo:', errorEntry.type);
    console.error('Severidad:', errorEntry.severity);
    console.error('Hora:', new Date(errorEntry.timestamp).toLocaleString());
    console.error('Error:', errorEntry.error);
    console.error('Contexto:', errorEntry.context);
    console.error('ID Error:', errorEntry.id);
    console.groupEnd();
  }

  /**
   * 📄 GENERAR MENSAJE DE ALERTA
   */
  generateAlertMessage(errorEntry) {
    switch (errorEntry.type) {
      case 'CONSOLE_ERROR_RLS_ERROR_406':
        return 'Error 406 detectado - Revisar configuración RLS en Supabase. Posible problema de permisos tenant_id.';
      
      case 'CONSOLE_ERROR_UNDEFINED_ID_ERROR':
        return 'ID undefined en operación UPDATE - Validar lógica de creación vs actualización de RATs.';
      
      case 'HTTP_ERROR':
        return `Error HTTP ${errorEntry.error.status} en ${errorEntry.error.url} - Revisar endpoint y datos enviados.`;
      
      case 'CONSOLE_ERROR_MISSING_COLUMN_ERROR':
        return 'Columna faltante en base de datos - Ejecutar migración o ajustar queries.';
      
      default:
        return `Error detectado: ${errorEntry.type}. Revisar logs para más detalles.`;
    }
  }

  /**
   * 📝 LOG ESPECÍFICO POR TIPO - ARCHIVO TXT
   */
  async logSpecificError(errorEntry) {
    // Escribir error a archivo TXT
    try {
      const errorDetails = {
        message: JSON.stringify(errorEntry.error),
        context: errorEntry.context,
        url: errorEntry.context.url,
        timestamp: errorEntry.datetime
      };
      
      if (errorEntry.severity === 'CRITICAL') {
        await fileErrorLogger.logCriticalError(errorEntry.type, errorDetails, 'ERROR_MONITOR');
      } else if (errorEntry.severity === 'HIGH') {
        await fileErrorLogger.logHighError(errorEntry.type, errorDetails, 'ERROR_MONITOR');
      } else {
        await fileErrorLogger.logMediumError(errorEntry.type, errorDetails, 'ERROR_MONITOR');
      }
      
    } catch (fileError) {
      console.error('❌ Error escribiendo a archivo TXT:', fileError);
    }
  }

  /**
   * ⏰ REPORTE PERIÓDICO
   */
  startPeriodicReporting() {
    setInterval(() => {
      this.generatePeriodicReport();
    }, 300000); // Cada 5 minutos
    
    // Generar resumen diario
    setInterval(() => {
      fileErrorLogger.generateDailySummary();
    }, 24 * 60 * 60 * 1000); // Cada 24 horas
  }

  /**
   * 📊 GENERAR REPORTE PERIÓDICO
   */
  generatePeriodicReport() {
    const last5Minutes = Date.now() - (5 * 60 * 1000);
    const recentErrors = this.errorLog.filter(error => error.timestamp > last5Minutes);
    
    if (recentErrors.length === 0) return;

    const errorsByType = {};
    const errorsBySeverity = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };

    recentErrors.forEach(error => {
      errorsByType[error.type] = (errorsByType[error.type] || 0) + 1;
      errorsBySeverity[error.severity] = (errorsBySeverity[error.severity] || 0) + 1;
    });

    console.group('📊 REPORTE ERRORES (Últimos 5 min)');
    //console.log('Total errores:', recentErrors.length);
    //console.log('Por severidad:', errorsBySeverity);
    //console.log('Por tipo:', errorsByType);
    console.groupEnd();
  }

  /**
   * 📋 OBTENER REPORTE COMPLETO
   */
  getFullReport() {
    const now = Date.now();
    const last24h = now - (24 * 60 * 60 * 1000);
    const recent24h = this.errorLog.filter(error => error.timestamp > last24h);

    return {
      system_status: this.isActive ? 'ACTIVE' : 'INACTIVE',
      timestamp: new Date().toISOString(),
      summary: {
        total_errors: this.errorLog.length,
        errors_24h: recent24h.length,
        critical_errors: this.criticalErrors.length,
        unresolved_alerts: this.alerts.filter(a => !a.resolved).length
      },
      recent_critical: this.criticalErrors.slice(-5),
      active_alerts: this.alerts.filter(a => !a.resolved),
      error_patterns: this.analyzeErrorPatterns(),
      recommendations: this.generateRecommendations()
    };
  }

  /**
   * 🔍 ANALIZAR PATRONES DE ERROR
   */
  analyzeErrorPatterns() {
    const patterns = {};
    
    this.errorLog.forEach(error => {
      const pattern = error.type.split('_')[0];
      patterns[pattern] = (patterns[pattern] || 0) + 1;
    });

    return Object.entries(patterns)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([pattern, count]) => ({ pattern, count }));
  }

  /**
   * 💡 GENERAR RECOMENDACIONES
   */
  generateRecommendations() {
    const recommendations = [];
    
    const criticalCount = this.criticalErrors.length;
    const rls406Count = this.errorLog.filter(e => e.type.includes('406')).length;
    const undefinedIdCount = this.errorLog.filter(e => e.type.includes('undefined')).length;

    if (rls406Count > 3) {
      recommendations.push({
        priority: 'HIGH',
        issue: 'Múltiples errores 406 RLS detectados',
        action: 'Revisar configuración de Row Level Security en Supabase'
      });
    }

    if (undefinedIdCount > 2) {
      recommendations.push({
        priority: 'HIGH', 
        issue: 'IDs undefined en operaciones UPDATE',
        action: 'Validar lógica de generación de IDs en creación de RATs'
      });
    }

    if (criticalCount > 5) {
      recommendations.push({
        priority: 'CRITICAL',
        issue: 'Alto número de errores críticos',
        action: 'Revisión urgente del sistema requerida'
      });
    }

    return recommendations;
  }

  /**
   * 🛑 DETENER MONITOREO
   */
  stop() {
    this.isActive = false;
    //console.log('📊 Sistema de monitoreo detenido');
  }
}

// Instancia global del monitor
const errorMonitor = new ErrorMonitoringSystem();

// Exports para usar desde otros módulos
export const getErrorReport = () => errorMonitor.getFullReport();
export const getCriticalErrors = () => errorMonitor.criticalErrors;
export const getActiveAlerts = () => errorMonitor.alerts.filter(a => !a.resolved);
export const isMonitoringActive = () => errorMonitor.isActive;

// Auto-iniciar el monitoreo
if (typeof window !== 'undefined') {
  //console.log('📊 Iniciando sistema de monitoreo de errores (solo observación)...');
  errorMonitor.init();
}

export default errorMonitor;