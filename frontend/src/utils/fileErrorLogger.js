/**
 * 📄 FILE ERROR LOGGER - ESCRITURA DE ERRORES EN ARCHIVOS TXT
 * 
 * Genera archivos TXT con todos los errores detectados
 * en carpeta /errores en la raíz del proyecto
 */

class FileErrorLogger {
  constructor() {
    this.errorBuffer = [];
    this.logQueue = [];
    this.isWriting = false;
    this.baseErrorPath = '/errores';
    
    this.setupErrorDirectory();
  }

  /**
   * 📁 CONFIGURAR DIRECTORIO DE ERRORES
   */
  async setupErrorDirectory() {
    try {
      // En navegador, simular la estructura de directorios
      //console.log('📁 Sistema de archivos TXT configurado para carpeta /errores');
      
      // Crear archivo inicial de configuración
      const configLog = {
        timestamp: new Date().toISOString(),
        system: 'Error Monitoring System',
        version: '1.0',
        directory: '/errores',
        file_format: 'TXT',
        encoding: 'UTF-8'
      };
      
      await this.writeToFile('system_config.txt', this.formatLogEntry('SYSTEM_CONFIG', configLog));
      
    } catch (error) {
      console.error('❌ Error configurando directorio errores:', error);
    }
  }

  /**
   * 📝 LOG ERROR CRÍTICO
   */
  async logCriticalError(type, details, source = 'UNKNOWN') {
    const errorEntry = {
      id: `CRITICAL_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date().toISOString(),
      type: type,
      severity: 'CRITICAL',
      source: source,
      details: details,
      system_state: this.captureSystemState()
    };
    
    await this.writeErrorToFile(errorEntry);
    console.error(`🚨 ERROR CRÍTICO REGISTRADO: ${type}`);
  }

  /**
   * ⚠️ LOG ERROR ALTO
   */
  async logHighError(type, details, source = 'UNKNOWN') {
    const errorEntry = {
      id: `HIGH_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date().toISOString(),
      type: type,
      severity: 'HIGH',
      source: source,
      details: details,
      context: this.captureContext()
    };
    
    await this.writeErrorToFile(errorEntry);
    //console.warn(`⚠️ ERROR ALTO REGISTRADO: ${type}`);
  }

  /**
   * 📊 LOG ERROR MEDIO
   */
  async logMediumError(type, details, source = 'UNKNOWN') {
    const errorEntry = {
      id: `MEDIUM_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date().toISOString(),
      type: type,
      severity: 'MEDIUM',
      source: source,
      details: details
    };
    
    await this.writeErrorToFile(errorEntry);
    //console.log(`📊 Error medio registrado: ${type}`);
  }

  /**
   * 🔍 LOG DETECCIÓN TEMPRANA
   */
  async logEarlyWarning(type, predictedError, preventionAction, details) {
    const warningEntry = {
      id: `WARNING_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date().toISOString(),
      type: type,
      severity: 'WARNING',
      predicted_error: predictedError,
      prevention_action: preventionAction,
      details: details,
      source: 'EARLY_WARNING_SYSTEM'
    };
    
    await this.writeErrorToFile(warningEntry, 'early_warnings.txt');
    //console.log(`⚠️ Alerta temprana registrada: ${type}`);
  }

  /**
   * 🏥 LOG SALUD BASE DE DATOS
   */
  async logDatabaseHealth(healthReport) {
    const healthEntry = {
      timestamp: new Date().toISOString(),
      overall_status: healthReport.overall_status,
      checks: healthReport.checks,
      critical_issues: healthReport.critical_issues || [],
      source: 'DATABASE_HEALTH_MONITOR'
    };
    
    await this.writeToFile('database_health.txt', this.formatHealthReport(healthEntry));
    //console.log('🏥 Reporte salud BD registrado en archivo');
  }

  /**
   * ✅ LOG VALIDACIÓN INTEGRIDAD
   */
  async logValidationError(tableName, operation, validationResult) {
    const validationEntry = {
      id: `VALIDATION_${Date.now()}`,
      timestamp: new Date().toISOString(),
      table: tableName,
      operation: operation,
      valid: validationResult.valid,
      errors: validationResult.errors,
      warnings: validationResult.warnings,
      source: 'DATA_INTEGRITY_VALIDATOR'
    };
    
    await this.writeErrorToFile(validationEntry, 'data_validation_errors.txt');
    //console.log(`✅ Error validación registrado: ${tableName} ${operation}`);
  }

  /**
   * 📄 ESCRIBIR ERROR A ARCHIVO
   */
  async writeErrorToFile(errorEntry, filename = null) {
    try {
      // Determinar nombre de archivo por severidad y fecha
      const today = new Date().toISOString().split('T')[0];
      const defaultFilename = `${errorEntry.severity.toLowerCase()}_errors_${today}.txt`;
      const targetFile = filename || defaultFilename;
      
      // Formatear entrada de error
      const formattedEntry = this.formatLogEntry(errorEntry.type, errorEntry);
      
      // Escribir a archivo
      await this.writeToFile(targetFile, formattedEntry);
      
    } catch (error) {
      console.error('❌ Error escribiendo archivo de error:', error);
      // Fallback: guardar en buffer
      this.errorBuffer.push(errorEntry);
    }
  }

  /**
   * 💾 ESCRIBIR A ARCHIVO (CORE)
   */
  async writeToFile(filename, content) {
    try {
      // En navegador, usar File System Access API si está disponible
      if (window.showSaveFilePicker) {
        await this.writeWithFileSystemAPI(filename, content);
      } else {
        // Fallback: descargar archivo
        await this.downloadFile(filename, content);
      }
      
    } catch (error) {
      console.error(`❌ Error escribiendo archivo ${filename}:`, error);
      // Último recurso: mostrar contenido en consola
      //console.log(`📄 CONTENIDO ARCHIVO ${filename}:`);
      //console.log(content);
    }
  }

  /**
   * 💾 ESCRIBIR CON FILE SYSTEM API
   */
  async writeWithFileSystemAPI(filename, content) {
    try {
      const fileHandle = await window.showSaveFilePicker({
        suggestedName: filename,
        types: [{
          description: 'Error Log Files',
          accept: { 'text/plain': ['.txt'] }
        }]
      });
      
      const writable = await fileHandle.createWritable();
      await writable.write(content);
      await writable.close();
      
      //console.log(`✅ Archivo ${filename} guardado exitosamente`);
      
    } catch (error) {
      if (error.name !== 'AbortError') {
        throw error;
      }
    }
  }

  /**
   * 📥 DESCARGAR ARCHIVO (FALLBACK)
   */
  async downloadFile(filename, content) {
    try {
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `errores_${filename}`;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      //console.log(`📥 Archivo ${filename} preparado para descarga`);
      
    } catch (error) {
      console.error('❌ Error preparando descarga:', error);
    }
  }

  /**
   * 🎨 FORMATEAR ENTRADA DE LOG
   */
  formatLogEntry(type, entry) {
    const separator = '='.repeat(80);
    const timestamp = new Date(entry.timestamp).toLocaleString('es-CL');
    
    let formatted = `${separator}\n`;
    formatted += `ERROR ID: ${entry.id || 'N/A'}\n`;
    formatted += `TIPO: ${type}\n`;
    formatted += `SEVERIDAD: ${entry.severity || 'INFO'}\n`;
    formatted += `FECHA/HORA: ${timestamp}\n`;
    formatted += `FUENTE: ${entry.source || 'UNKNOWN'}\n`;
    formatted += `${separator}\n\n`;
    
    // Detalles del error
    if (entry.details) {
      formatted += `DETALLES DEL ERROR:\n`;
      formatted += this.formatDetails(entry.details);
      formatted += `\n\n`;
    }
    
    // Error predicho (para early warnings)
    if (entry.predicted_error) {
      formatted += `ERROR PREDICHO: ${entry.predicted_error}\n`;
      formatted += `ACCIÓN PREVENTIVA: ${entry.prevention_action}\n\n`;
    }
    
    // Errores de validación
    if (entry.errors && entry.errors.length > 0) {
      formatted += `ERRORES DE VALIDACIÓN:\n`;
      entry.errors.forEach((error, index) => {
        formatted += `  ${index + 1}. ${error}\n`;
      });
      formatted += `\n`;
    }
    
    // Advertencias
    if (entry.warnings && entry.warnings.length > 0) {
      formatted += `ADVERTENCIAS:\n`;
      entry.warnings.forEach((warning, index) => {
        formatted += `  ${index + 1}. ${warning}\n`;
      });
      formatted += `\n`;
    }
    
    // Estado del sistema
    if (entry.system_state) {
      formatted += `ESTADO DEL SISTEMA:\n`;
      formatted += this.formatSystemState(entry.system_state);
      formatted += `\n`;
    }
    
    formatted += `${'='.repeat(80)}\n\n`;
    
    return formatted;
  }

  /**
   * 📋 FORMATEAR DETALLES
   */
  formatDetails(details) {
    if (typeof details === 'string') {
      return `${details}\n`;
    }
    
    if (typeof details === 'object') {
      let formatted = '';
      Object.entries(details).forEach(([key, value]) => {
        formatted += `  ${key}: ${JSON.stringify(value, null, 2)}\n`;
      });
      return formatted;
    }
    
    return `${JSON.stringify(details, null, 2)}\n`;
  }

  /**
   * 🏥 FORMATEAR REPORTE SALUD
   */
  formatHealthReport(healthEntry) {
    const separator = '='.repeat(80);
    const timestamp = new Date(healthEntry.timestamp).toLocaleString('es-CL');
    
    let formatted = `${separator}\n`;
    formatted += `REPORTE DE SALUD BASE DE DATOS\n`;
    formatted += `FECHA/HORA: ${timestamp}\n`;
    formatted += `ESTADO GENERAL: ${healthEntry.overall_status}\n`;
    formatted += `${separator}\n\n`;
    
    // Checks individuales
    if (healthEntry.checks) {
      formatted += `CHECKS INDIVIDUALES:\n`;
      Object.entries(healthEntry.checks).forEach(([checkName, checkResult]) => {
        formatted += `\n${checkName.toUpperCase()}:\n`;
        formatted += `  Estado: ${checkResult.status}\n`;
        if (checkResult.error) {
          formatted += `  Error: ${checkResult.error}\n`;
        }
        if (checkResult.details) {
          formatted += `  Detalles: ${JSON.stringify(checkResult.details, null, 2)}\n`;
        }
      });
    }
    
    // Issues críticos
    if (healthEntry.critical_issues && healthEntry.critical_issues.length > 0) {
      formatted += `\nISSUES CRÍTICOS:\n`;
      healthEntry.critical_issues.forEach((issue, index) => {
        formatted += `  ${index + 1}. ${issue.description || issue}\n`;
      });
    }
    
    formatted += `\n${separator}\n\n`;
    
    return formatted;
  }

  /**
   * 🖥️ CAPTURAR ESTADO SISTEMA
   */
  captureSystemState() {
    return {
      url: window.location.href,
      user_agent: navigator.userAgent,
      memory: performance.memory ? {
        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024)
      } : 'No disponible',
      connection: navigator.connection ? {
        effective_type: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink
      } : 'No disponible',
      timestamp: Date.now()
    };
  }

  /**
   * 🎯 CAPTURAR CONTEXTO
   */
  captureContext() {
    return {
      page_title: document.title,
      active_element: document.activeElement?.tagName || 'unknown',
      forms_count: document.querySelectorAll('form').length,
      errors_in_console: this.errorBuffer.length
    };
  }

  /**
   * 🖥️ FORMATEAR ESTADO SISTEMA
   */
  formatSystemState(state) {
    let formatted = '';
    formatted += `  URL: ${state.url}\n`;
    formatted += `  User Agent: ${state.user_agent}\n`;
    if (typeof state.memory === 'object') {
      formatted += `  Memoria Usada: ${state.memory.used}MB / ${state.memory.total}MB\n`;
    }
    if (typeof state.connection === 'object') {
      formatted += `  Conexión: ${state.connection.effective_type} (${state.connection.downlink}Mbps)\n`;
    }
    return formatted;
  }

  /**
   * 📊 GENERAR REPORTE RESUMEN DIARIO
   */
  async generateDailySummary() {
    const today = new Date().toISOString().split('T')[0];
    const summary = {
      date: today,
      total_errors: this.errorBuffer.length,
      critical_count: this.errorBuffer.filter(e => e.severity === 'CRITICAL').length,
      high_count: this.errorBuffer.filter(e => e.severity === 'HIGH').length,
      medium_count: this.errorBuffer.filter(e => e.severity === 'MEDIUM').length,
      warning_count: this.errorBuffer.filter(e => e.severity === 'WARNING').length,
      most_common_errors: this.getMostCommonErrors(),
      generated_at: new Date().toISOString()
    };
    
    const summaryText = this.formatDailySummary(summary);
    await this.writeToFile(`daily_summary_${today}.txt`, summaryText);
    
    //console.log('📊 Resumen diario generado');
  }

  /**
   * 📈 FORMATEAR RESUMEN DIARIO
   */
  formatDailySummary(summary) {
    const separator = '='.repeat(80);
    
    let formatted = `${separator}\n`;
    formatted += `RESUMEN DIARIO DE ERRORES - ${summary.date}\n`;
    formatted += `Generado: ${new Date(summary.generated_at).toLocaleString('es-CL')}\n`;
    formatted += `${separator}\n\n`;
    
    formatted += `ESTADÍSTICAS GENERALES:\n`;
    formatted += `  Total Errores: ${summary.total_errors}\n`;
    formatted += `  Críticos: ${summary.critical_count}\n`;
    formatted += `  Altos: ${summary.high_count}\n`;
    formatted += `  Medios: ${summary.medium_count}\n`;
    formatted += `  Advertencias: ${summary.warning_count}\n\n`;
    
    if (summary.most_common_errors.length > 0) {
      formatted += `ERRORES MÁS COMUNES:\n`;
      summary.most_common_errors.forEach((error, index) => {
        formatted += `  ${index + 1}. ${error.type}: ${error.count} ocurrencias\n`;
      });
    }
    
    formatted += `\n${separator}\n`;
    
    return formatted;
  }

  /**
   * 📊 OBTENER ERRORES MÁS COMUNES
   */
  getMostCommonErrors() {
    const errorCounts = {};
    
    this.errorBuffer.forEach(error => {
      const type = error.type || 'UNKNOWN';
      errorCounts[type] = (errorCounts[type] || 0) + 1;
    });
    
    return Object.entries(errorCounts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  /**
   * 🧹 LIMPIAR BUFFER ERRORES
   */
  clearErrorBuffer() {
    this.errorBuffer = [];
    //console.log('🧹 Buffer de errores limpiado');
  }

  /**
   * 📊 OBTENER ESTADÍSTICAS
   */
  getStats() {
    return {
      errors_in_buffer: this.errorBuffer.length,
      queue_size: this.logQueue.length,
      is_writing: this.isWriting,
      last_error: this.errorBuffer[this.errorBuffer.length - 1]?.timestamp || null
    };
  }
}

// Instancia global
const fileErrorLogger = new FileErrorLogger();

// Hacer disponible globalmente
window.fileErrorLogger = fileErrorLogger;

// Funciones de conveniencia
window.saveErrorsToFile = () => fileErrorLogger.generateDailySummary();
window.clearErrorLog = () => fileErrorLogger.clearErrorBuffer();

export default fileErrorLogger;