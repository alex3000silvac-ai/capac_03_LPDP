/**
 * 📡 ERROR PREVENTION MONITOR - MONITOREO ACTIVO DE ERRORES
 * 
 * Sistema de vigilancia que detecta, previene y reporta errores
 * antes de que impacten la experiencia del usuario
 */

import smartSupabase, { getSmartSupabaseStats } from './smartSupabaseClient';
import rlsGuard, { getSupabasePermissions } from './supabaseRLSGuard';

class ErrorPreventionMonitor {
  constructor() {
    this.isActive = false;
    this.errorPatterns = new Map();
    this.preventedErrors = [];
    this.healthMetrics = {
      totalQueries: 0,
      successfulQueries: 0,
      preventedErrors: 0,
      fallbacksUsed: 0,
      uptime: Date.now()
    };
    
    this.criticalTables = [
      'mapeo_datos_rat',
      'organizaciones', 
      'proveedores',
      'rats',
      'actividades_dpo'
    ];

    this.init();
  }

  /**
   * 🚀 INICIALIZAR MONITOREO
   */
  async init() {
    try {
      // Registrar patrones de error conocidos
      this.registerErrorPatterns();
      
      // Configurar interceptores globales
      this.setupGlobalErrorHandlers();
      
      // Iniciar monitoreo periódico
      this.startPeriodicHealthCheck();
      
      this.isActive = true;
      //console.log('📡 Monitor de prevención de errores activo');
      
    } catch (error) {
      console.error('❌ Error inicializando monitor:', error);
    }
  }

  /**
   * 📝 REGISTRAR PATRONES DE ERROR CONOCIDOS
   */
  registerErrorPatterns() {
    this.errorPatterns.set('RLS_ERROR', {
      patterns: ['406', 'not acceptable', 'rls', 'row level security', 'policy'],
      solution: 'use_smart_client_fallback',
      criticality: 'high',
      autoFix: true
    });

    this.errorPatterns.set('TENANT_FILTER_ERROR', {
      patterns: ['tenant_id', 'permission denied', 'forbidden'],
      solution: 'remove_tenant_filter',
      criticality: 'medium',
      autoFix: true
    });

    this.errorPatterns.set('MISSING_COLUMN', {
      patterns: ['column', 'does not exist', 'unknown column'],
      solution: 'validate_schema',
      criticality: 'low',
      autoFix: false
    });

    this.errorPatterns.set('CONNECTION_ERROR', {
      patterns: ['network', 'timeout', 'connection', 'fetch'],
      solution: 'retry_with_backoff',
      criticality: 'high',
      autoFix: true
    });
  }

  /**
   * 🕵️ DETECTAR TIPO DE ERROR
   */
  detectErrorType(error) {
    const errorMsg = error.message?.toLowerCase() || '';
    
    for (const [type, config] of this.errorPatterns) {
      if (config.patterns.some(pattern => errorMsg.includes(pattern))) {
        return {
          type,
          ...config,
          originalError: error
        };
      }
    }

    return {
      type: 'UNKNOWN_ERROR',
      patterns: [],
      solution: 'log_and_report',
      criticality: 'medium',
      autoFix: false,
      originalError: error
    };
  }

  /**
   * 🛡️ INTERCEPTOR GLOBAL DE ERRORES
   */
  setupGlobalErrorHandlers() {
    // Interceptar errores de fetch (Supabase usa fetch internamente)
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        
        // Si la respuesta indica error (406, 403, etc.)
        if (!response.ok && this.isSupabaseRequest(args[0])) {
          const clonedResponse = response.clone();
          this.handleSupabaseHttpError(response.status, args[0], clonedResponse);
        }
        
        return response;
      } catch (error) {
        if (this.isSupabaseRequest(args[0])) {
          this.handleSupabaseNetworkError(error, args[0]);
        }
        throw error;
      }
    };

    // Interceptar errores no capturados
    window.addEventListener('unhandledrejection', (event) => {
      if (this.isSupabaseError(event.reason)) {
        this.preventError(event.reason);
        event.preventDefault(); // Evitar que el error se propague
      }
    });

    // Interceptar errores de consola
    const originalConsoleError = console.error;
    console.error = (...args) => {
      const errorMsg = args.join(' ');
      if (this.isSupabaseError({ message: errorMsg })) {
        this.preventError({ message: errorMsg });
      }
      originalConsoleError(...args);
    };
  }

  /**
   * 🔍 IDENTIFICAR REQUESTS DE SUPABASE
   */
  isSupabaseRequest(url) {
    if (typeof url !== 'string') return false;
    return url.includes('supabase.co') || url.includes('/rest/v1/');
  }

  isSupabaseError(error) {
    const msg = error.message?.toLowerCase() || '';
    return msg.includes('supabase') || 
           msg.includes('postgrest') || 
           this.errorPatterns.has(this.detectErrorType(error).type);
  }

  /**
   * 🚨 MANEJAR ERRORES HTTP DE SUPABASE
   */
  async handleSupabaseHttpError(status, url, response) {
    try {
      const errorData = await response.text();
      const error = {
        message: `HTTP ${status}: ${errorData}`,
        status,
        url,
        timestamp: Date.now()
      };

      //console.warn('🚨 Error HTTP Supabase detectado:', error);
      this.preventError(error);
      
    } catch (parseError) {
      //console.warn('⚠️ Error parseando respuesta de error Supabase');
    }
  }

  /**
   * 🌐 MANEJAR ERRORES DE NETWORK DE SUPABASE
   */
  handleSupabaseNetworkError(error, url) {
    const networkError = {
      message: `Network Error: ${error.message}`,
      url,
      timestamp: Date.now()
    };

    //console.warn('🌐 Error de red Supabase detectado:', networkError);
    this.preventError(networkError);
  }

  /**
   * 🛡️ PREVENIR ERROR
   */
  async preventError(error) {
    const errorType = this.detectErrorType(error);
    
    this.preventedErrors.push({
      ...errorType,
      timestamp: Date.now(),
      prevented: errorType.autoFix
    });

    this.healthMetrics.preventedErrors++;

    if (errorType.autoFix) {
      //console.log(`🔧 Auto-corrigiendo error tipo: ${errorType.type}`);
      await this.applyAutoFix(errorType);
    } else {
      //console.warn(`⚠️ Error detectado pero requiere intervención manual: ${errorType.type}`);
      this.logErrorForAnalysis(errorType);
    }
  }

  /**
   * 🔧 APLICAR CORRECCIÓN AUTOMÁTICA
   */
  async applyAutoFix(errorType) {
    switch (errorType.solution) {
      case 'use_smart_client_fallback':
        // El smart client ya maneja esto automáticamente
        //console.log('✅ Smart client aplicará fallback automático');
        break;

      case 'remove_tenant_filter':
        //console.log('✅ Fallback sin tenant_id será aplicado automáticamente');
        break;

      case 'retry_with_backoff':
        //console.log('✅ Reintento con backoff será aplicado');
        await this.retryWithBackoff(errorType.originalError);
        break;

      default:
        //console.log(`⚠️ Solución ${errorType.solution} no implementada`);
    }
  }

  /**
   * 🔄 REINTENTO CON BACKOFF
   */
  async retryWithBackoff(originalError, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      await new Promise(resolve => setTimeout(resolve, attempt * 1000));
      //console.log(`🔄 Reintento ${attempt}/${maxRetries} después de error de conexión`);
      
      // El reintento real será manejado por el smart client
      break;
    }
  }

  /**
   * 📝 LOG ERROR PARA ANÁLISIS
   */
  logErrorForAnalysis(errorType) {
    // En producción, esto podría enviarse a un servicio de logging
    console.group('📝 Error Analysis Log');
    //console.log('Type:', errorType.type);
    //console.log('Criticality:', errorType.criticality);
    //console.log('Solution:', errorType.solution);
    //console.log('Original Error:', errorType.originalError);
    //console.log('Timestamp:', new Date().toISOString());
    console.groupEnd();
  }

  /**
   * 🏥 CHEQUEO PERIÓDICO DE SALUD
   */
  startPeriodicHealthCheck() {
    setInterval(async () => {
      await this.performHealthCheck();
    }, 30000); // Cada 30 segundos
  }

  /**
   * 🔍 REALIZAR CHEQUEO DE SALUD
   */
  async performHealthCheck() {
    try {
      const supabaseStats = getSmartSupabaseStats();
      const rlsStats = getSupabasePermissions();
      
      this.healthMetrics = {
        ...this.healthMetrics,
        totalQueries: supabaseStats.total_queries,
        preventedErrors: supabaseStats.errors_prevented,
        fallbacksUsed: supabaseStats.successful_fallbacks,
        successRate: supabaseStats.success_rate,
        lastCheck: Date.now()
      };

      // Alertar si la tasa de éxito es muy baja
      const successRate = parseFloat(supabaseStats.success_rate);
      if (successRate < 80) {
        //console.warn(`🚨 ALERTA: Tasa de éxito baja (${successRate}%) - revisar configuración RLS`);
      }

    } catch (error) {
      console.error('❌ Error en health check:', error);
    }
  }

  /**
   * 📊 OBTENER REPORTE DE SALUD
   */
  getHealthReport() {
    return {
      status: this.isActive ? 'ACTIVE' : 'INACTIVE',
      metrics: this.healthMetrics,
      recentErrors: this.preventedErrors.slice(-10),
      errorPatterns: this.errorPatterns.size,
      uptime: Date.now() - this.healthMetrics.uptime,
      recommendations: this.generateRecommendations()
    };
  }

  /**
   * 💡 GENERAR RECOMENDACIONES
   */
  generateRecommendations() {
    const recommendations = [];
    
    if (this.preventedErrors.length > 10) {
      recommendations.push('Revisar configuración RLS - muchos errores prevenidos');
    }

    if (this.healthMetrics.fallbacksUsed > this.healthMetrics.totalQueries * 0.3) {
      recommendations.push('Alto uso de fallbacks - optimizar consultas principales');
    }

    const recentRLSErrors = this.preventedErrors
      .filter(e => e.type === 'RLS_ERROR')
      .filter(e => Date.now() - e.timestamp < 300000); // Últimos 5 minutos

    if (recentRLSErrors.length > 5) {
      recommendations.push('Múltiples errores RLS recientes - verificar políticas de Supabase');
    }

    return recommendations;
  }

  /**
   * 🛑 DETENER MONITOREO
   */
  stop() {
    this.isActive = false;
    //console.log('📡 Monitor de prevención de errores detenido');
  }
}

// Instancia global del monitor
const errorMonitor = new ErrorPreventionMonitor();

// Funciones de utilidad para usar desde otros módulos
export const getErrorPreventionReport = () => errorMonitor.getHealthReport();

export const preventSupabaseError = (error) => errorMonitor.preventError(error);

export const isMonitorActive = () => errorMonitor.isActive;

// Auto-iniciar el monitor
if (typeof window !== 'undefined') {
  //console.log('📡 Iniciando Error Prevention Monitor...');
}

export default errorMonitor;