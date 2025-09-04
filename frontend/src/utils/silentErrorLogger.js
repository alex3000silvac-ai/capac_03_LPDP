/**
 * 🔇 SILENT ERROR LOGGER - REEMPLAZA TODOS LOS CONSOLE.LOG
 * 
 * Intercepta TODOS los console.log/warn/error y los redirige a archivos TXT
 * La consola queda 100% limpia, solo errores van a /errores en archivos
 */

import cumulativeErrorLogger from './cumulativeErrorLogger';

class SilentErrorLogger {
  constructor() {
    this.originalConsole = {
      log: console.log,
      warn: console.warn,
      error: console.error,
      info: console.info,
      debug: console.debug
    };
    
    this.interceptedCount = 0;
    this.setupSilentMode();
  }

  /**
   * 🔇 CONFIGURAR MODO SILENCIOSO
   */
  setupSilentMode() {
    // Interceptar y silenciar console.log
    console.log = (...args) => {
      this.interceptedCount++;
      // Completamente silencioso - no output
      this.logToFile('LOG', args.join(' '));
    };

    // Interceptar y silenciar console.warn
    console.warn = (...args) => {
      this.interceptedCount++;
      const message = args.join(' ');
      // Completamente silencioso - no output
      this.logToFile('WARN', message);
      
      // Si es advertencia importante, log a archivo ACUMULATIVO
      if (this.isImportantWarning(message)) {
        cumulativeErrorLogger.logMediumError('CONSOLE_WARNING', {
          message: message,
          timestamp: new Date().toISOString()
        }, 'SILENT_CONSOLE');
      }
    };

    // Interceptar console.error - estos SÍ van a archivos TXT
    console.error = (...args) => {
      this.interceptedCount++;
      const message = args.join(' ');
      
      // Solo mostrar errores CRÍTICOS en consola
      if (this.isCriticalError(message)) {
        this.originalConsole.error(`🚨 ERROR CRÍTICO: ${message}`);
      }
      
      // SIEMPRE escribir errores a archivo TXT ACUMULATIVO
      cumulativeErrorLogger.logCriticalError('CONSOLE_ERROR', {
        message: message,
        args: args,
        timestamp: new Date().toISOString(),
        stack: new Error().stack
      }, 'SILENT_CONSOLE');
      
      this.logToFile('ERROR', message);
    };

    // Interceptar console.info - silencioso
    console.info = (...args) => {
      this.interceptedCount++;
      this.logToFile('INFO', args.join(' '));
    };

    // Interceptar console.debug - silencioso  
    console.debug = (...args) => {
      this.interceptedCount++;
      this.logToFile('DEBUG', args.join(' '));
    };
  }

  /**
   * 🔍 DETERMINAR SI ES ERROR CRÍTICO
   */
  isCriticalError(message) {
    const criticalPatterns = [
      'error crítico',
      'critical error', 
      'fatal error',
      'sistema no funciona',
      'no se puede continuar',
      'servicio no disponible',
      'base de datos no accesible'
    ];
    
    const lowerMessage = message.toLowerCase();
    return criticalPatterns.some(pattern => lowerMessage.includes(pattern));
  }

  /**
   * ⚠️ DETERMINAR SI ES ADVERTENCIA IMPORTANTE
   */
  isImportantWarning(message) {
    const importantPatterns = [
      'datos empresa',
      'persistencia',
      'autocompletado',
      'validación',
      'base de datos',
      'error'
    ];
    
    const lowerMessage = message.toLowerCase();
    return importantPatterns.some(pattern => lowerMessage.includes(pattern));
  }

  /**
   * 📁 LOG SILENCIOSO A ARCHIVO
   */
  async logToFile(level, message) {
    try {
      // Solo log mensajes relevantes del sistema a archivo
      if (this.isSystemMessage(message)) {
        await cumulativeErrorLogger.logMediumError(`SILENT_${level}`, {
          message: message,
          level: level,
          timestamp: new Date().toISOString()
        }, 'SILENT_LOGGER');
      }
    } catch (error) {
      // No mostrar errores del logger silencioso
    }
  }

  /**
   * 📋 DETERMINAR SI ES MENSAJE DEL SISTEMA
   */
  isSystemMessage(message) {
    const systemPatterns = [
      'rat',
      'empresa',
      'datos',
      'error',
      'warning',
      'crítico',
      'fallo',
      'problema'
    ];
    
    const lowerMessage = message.toLowerCase();
    return systemPatterns.some(pattern => lowerMessage.includes(pattern));
  }

  /**
   * 🔄 RESTAURAR CONSOLA ORIGINAL
   */
  restore() {
    console.log = this.originalConsole.log;
    console.warn = this.originalConsole.warn;
    console.error = this.originalConsole.error;
    console.info = this.originalConsole.info;
    console.debug = this.originalConsole.debug;
  }

  /**
   * 📊 OBTENER ESTADÍSTICAS
   */
  getStats() {
    return {
      intercepted_messages: this.interceptedCount,
      silent_mode_active: true,
      original_console_available: true,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 🖨️ FORZAR MENSAJE EN CONSOLA (SOLO PARA EMERGENCIAS)
   */
  forceLog(message) {
    this.originalConsole.log(`🚨 MENSAJE FORZADO: ${message}`);
  }
}

// Instancia global - se activa automáticamente
const silentErrorLogger = new SilentErrorLogger();

// Hacer disponible globalmente para emergencias
window.silentErrorLogger = silentErrorLogger;
window.forceLog = (message) => silentErrorLogger.forceLog(message);
window.restoreConsole = () => silentErrorLogger.restore();

export default silentErrorLogger;