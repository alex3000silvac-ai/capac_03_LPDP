/**
 * 📈 CUMULATIVE ERROR LOGGER - ERRORES ACUMULATIVOS
 * 
 * Los errores se ACUMULAN en archivos TXT, no se sobrescriben
 * Cada nuevo error se AGREGA al final del archivo existente
 */

class CumulativeErrorLogger {
  constructor() {
    this.errorBuffer = new Map(); // filename -> contenido acumulado
    this.maxFileSize = 1024 * 1024; // 1MB máximo por archivo
    this.baseErrorPath = '/errores';
    
    this.initializeErrorFiles();
  }

  /**
   * 🗂️ INICIALIZAR ARCHIVOS DE ERROR
   */
  async initializeErrorFiles() {
    const today = new Date().toISOString().split('T')[0];
    const initialFiles = [
      `critical_errors_${today}.txt`,
      `high_errors_${today}.txt`, 
      `medium_errors_${today}.txt`,
      `early_warnings_${today}.txt`,
      `database_health_${today}.txt`,
      `data_validation_errors_${today}.txt`
    ];

    // Inicializar buffer para cada archivo
    initialFiles.forEach(filename => {
      if (!this.errorBuffer.has(filename)) {
        this.errorBuffer.set(filename, this.getFileHeader(filename));
      }
    });
  }

  /**
   * 📄 OBTENER HEADER DEL ARCHIVO
   */
  getFileHeader(filename) {
    const now = new Date().toLocaleString('es-CL');
    const separator = '='.repeat(80);
    
    return `${separator}
ARCHIVO DE ERRORES ACUMULATIVOS - ${filename.toUpperCase()}
FECHA CREACIÓN: ${now}
PROYECTO: LPDP Sistema RAT
${separator}

`;
  }

  /**
   * 🚨 LOG ERROR CRÍTICO ACUMULATIVO
   */
  async logCriticalError(type, details, source = 'UNKNOWN') {
    const today = new Date().toISOString().split('T')[0];
    const filename = `critical_errors_${today}.txt`;
    
    const errorEntry = this.formatErrorEntry({
      id: `CRITICAL_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date().toISOString(),
      type: type,
      severity: 'CRITICAL',
      source: source,
      details: details
    });

    await this.appendToFile(filename, errorEntry);
  }

  /**
   * ⚠️ LOG ERROR ALTO ACUMULATIVO
   */
  async logHighError(type, details, source = 'UNKNOWN') {
    const today = new Date().toISOString().split('T')[0];
    const filename = `high_errors_${today}.txt`;
    
    const errorEntry = this.formatErrorEntry({
      id: `HIGH_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date().toISOString(),
      type: type,
      severity: 'HIGH',
      source: source,
      details: details
    });

    await this.appendToFile(filename, errorEntry);
  }

  /**
   * 📊 LOG ERROR MEDIO ACUMULATIVO
   */
  async logMediumError(type, details, source = 'UNKNOWN') {
    const today = new Date().toISOString().split('T')[0];
    const filename = `medium_errors_${today}.txt`;
    
    const errorEntry = this.formatErrorEntry({
      id: `MEDIUM_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date().toISOString(),
      type: type,
      severity: 'MEDIUM',
      source: source,
      details: details
    });

    await this.appendToFile(filename, errorEntry);
  }

  /**
   * 🔍 LOG ALERTA TEMPRANA ACUMULATIVA
   */
  async logEarlyWarning(type, predictedError, preventionAction, details) {
    const today = new Date().toISOString().split('T')[0];
    const filename = `early_warnings_${today}.txt`;
    
    const warningEntry = this.formatWarningEntry({
      id: `WARNING_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date().toISOString(),
      type: type,
      severity: 'WARNING',
      predicted_error: predictedError,
      prevention_action: preventionAction,
      details: details,
      source: 'EARLY_WARNING_SYSTEM'
    });

    await this.appendToFile(filename, warningEntry);
  }

  /**
   * 🏥 LOG SALUD BD ACUMULATIVO
   */
  async logDatabaseHealth(healthReport) {
    const today = new Date().toISOString().split('T')[0];
    const filename = `database_health_${today}.txt`;
    
    const healthEntry = this.formatHealthEntry({
      timestamp: new Date().toISOString(),
      overall_status: healthReport.overall_status,
      checks: healthReport.checks,
      critical_issues: healthReport.critical_issues || [],
      source: 'DATABASE_HEALTH_MONITOR'
    });

    await this.appendToFile(filename, healthEntry);
  }

  /**
   * ✅ LOG VALIDACIÓN ACUMULATIVO
   */
  async logValidationError(tableName, operation, validationResult) {
    const today = new Date().toISOString().split('T')[0];
    const filename = `data_validation_errors_${today}.txt`;
    
    const validationEntry = this.formatValidationEntry({
      id: `VALIDATION_${Date.now()}`,
      timestamp: new Date().toISOString(),
      table: tableName,
      operation: operation,
      valid: validationResult.valid,
      errors: validationResult.errors,
      warnings: validationResult.warnings,
      source: 'DATA_INTEGRITY_VALIDATOR'
    });

    await this.appendToFile(filename, validationEntry);
  }

  /**
   * 📝 AGREGAR CONTENIDO A ARCHIVO (ACUMULATIVO)
   */
  async appendToFile(filename, newContent) {
    try {
      // Obtener contenido actual del buffer
      let currentContent = this.errorBuffer.get(filename) || this.getFileHeader(filename);
      
      // Agregar nuevo contenido
      const updatedContent = currentContent + newContent + '\n';
      
      // Verificar tamaño máximo
      if (updatedContent.length > this.maxFileSize) {
        // Crear nuevo archivo con timestamp
        const timestamp = Date.now();
        const [baseName, extension] = filename.split('.');
        const newFilename = `${baseName}_${timestamp}.${extension}`;
        
        // Guardar archivo actual
        await this.writeToFile(filename, currentContent);
        
        // Comenzar nuevo archivo
        this.errorBuffer.set(newFilename, this.getFileHeader(newFilename) + newContent + '\n');
        await this.writeToFile(newFilename, this.errorBuffer.get(newFilename));
        
        // Limpiar buffer del archivo original
        this.errorBuffer.set(filename, this.getFileHeader(filename));
      } else {
        // Actualizar buffer y escribir archivo
        this.errorBuffer.set(filename, updatedContent);
        await this.writeToFile(filename, updatedContent);
      }
      
    } catch (error) {
      console.error(`❌ Error agregando a archivo ${filename}:`, error);
    }
  }

  /**
   * 💾 ESCRIBIR ARCHIVO COMPLETO
   */
  async writeToFile(filename, content) {
    try {
      // Para logs automáticos, usar localStorage en lugar de File System API
      // File System API requiere interacción del usuario
      await this.storeInLocalStorage(filename, content);
    } catch (error) {
      // Silencioso - no mostrar errores de archivo en consola
      // Solo almacenar en memoria
      this.errorBuffer.set(filename, content);
    }
  }

  /**
   * 💾 ALMACENAR EN LOCALSTORAGE (PARA LOGS AUTOMÁTICOS)
   */
  async storeInLocalStorage(filename, content) {
    try {
      const key = `error_log_${filename}`;
      const maxSize = 1024 * 1024; // 1MB máximo por archivo
      
      if (content.length > maxSize) {
        // Si es muy grande, solo mantener las últimas líneas
        const lines = content.split('\n');
        const keepLines = Math.floor(maxSize / 100); // Aproximadamente
        content = lines.slice(-keepLines).join('\n');
      }
      
      localStorage.setItem(key, content);
      
      // Opcional: También mantener en buffer de memoria
      this.errorBuffer.set(filename, content);
      
    } catch (error) {
      // Si localStorage falla, solo mantener en memoria
      this.errorBuffer.set(filename, content);
    }
  }

  /**
   * 💾 ESCRIBIR CON FILE SYSTEM API (SOLO MANUAL)
   */
  async writeWithFileSystemAPIManual(filename, content) {
    try {
      // Para modo acumulativo, intentar abrir archivo existente o crear nuevo
      let fileHandle;
      
      // Intentar obtener handle del archivo existente del cache
      if (this.fileHandleCache && this.fileHandleCache[filename]) {
        fileHandle = this.fileHandleCache[filename];
      } else {
        // Crear o seleccionar archivo
        fileHandle = await window.showSaveFilePicker({
          suggestedName: filename,
          types: [{
            description: 'Error Log Files',
            accept: { 'text/plain': ['.txt'] }
          }]
        });
        
        // Cachear handle para uso futuro
        if (!this.fileHandleCache) this.fileHandleCache = {};
        this.fileHandleCache[filename] = fileHandle;
      }
      
      const writable = await fileHandle.createWritable();
      await writable.write(content);
      await writable.close();
      
    } catch (error) {
      if (error.name !== 'AbortError') {
        throw error;
      }
    }
  }

  /**
   * 📥 DESCARGAR ARCHIVO ACUMULATIVO
   */
  async downloadFile(filename, content) {
    try {
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename; // Usar filename original para acumular
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('❌ Error preparando descarga:', error);
    }
  }

  /**
   * 🎨 FORMATEAR ENTRADA ERROR
   */
  formatErrorEntry(entry) {
    const timestamp = new Date(entry.timestamp).toLocaleString('es-CL');
    const separator = '-'.repeat(60);
    
    let formatted = `${separator}\n`;
    formatted += `[${entry.severity}] ${entry.type}\n`;
    formatted += `ID: ${entry.id}\n`;
    formatted += `FECHA: ${timestamp}\n`;
    formatted += `FUENTE: ${entry.source}\n`;
    formatted += `${separator}\n`;
    
    if (entry.details) {
      formatted += `DETALLES:\n${this.formatDetails(entry.details)}\n`;
    }
    
    formatted += `${separator}\n\n`;
    
    return formatted;
  }

  /**
   * 🔍 FORMATEAR ENTRADA WARNING
   */
  formatWarningEntry(entry) {
    const timestamp = new Date(entry.timestamp).toLocaleString('es-CL');
    const separator = '-'.repeat(60);
    
    let formatted = `${separator}\n`;
    formatted += `[⚠️ WARNING] ${entry.type}\n`;
    formatted += `ID: ${entry.id}\n`;
    formatted += `FECHA: ${timestamp}\n`;
    formatted += `ERROR PREDICHO: ${entry.predicted_error}\n`;
    formatted += `PREVENCIÓN: ${entry.prevention_action}\n`;
    formatted += `${separator}\n`;
    
    if (entry.details) {
      formatted += `DETALLES:\n${this.formatDetails(entry.details)}\n`;
    }
    
    formatted += `${separator}\n\n`;
    
    return formatted;
  }

  /**
   * 🏥 FORMATEAR ENTRADA SALUD
   */
  formatHealthEntry(entry) {
    const timestamp = new Date(entry.timestamp).toLocaleString('es-CL');
    const separator = '-'.repeat(60);
    
    let formatted = `${separator}\n`;
    formatted += `[🏥 HEALTH CHECK] SALUD BASE DE DATOS\n`;
    formatted += `FECHA: ${timestamp}\n`;
    formatted += `ESTADO GENERAL: ${entry.overall_status}\n`;
    formatted += `${separator}\n`;
    
    if (entry.checks) {
      formatted += `CHECKS REALIZADOS:\n`;
      Object.entries(entry.checks).forEach(([check, result]) => {
        formatted += `  • ${check}: ${result.status}\n`;
        if (result.error) {
          formatted += `    Error: ${result.error}\n`;
        }
      });
    }
    
    if (entry.critical_issues && entry.critical_issues.length > 0) {
      formatted += `\nISSUES CRÍTICOS:\n`;
      entry.critical_issues.forEach((issue, index) => {
        formatted += `  ${index + 1}. ${issue}\n`;
      });
    }
    
    formatted += `${separator}\n\n`;
    
    return formatted;
  }

  /**
   * ✅ FORMATEAR ENTRADA VALIDACIÓN
   */
  formatValidationEntry(entry) {
    const timestamp = new Date(entry.timestamp).toLocaleString('es-CL');
    const separator = '-'.repeat(60);
    
    let formatted = `${separator}\n`;
    formatted += `[✅ VALIDATION] ${entry.table} - ${entry.operation}\n`;
    formatted += `ID: ${entry.id}\n`;
    formatted += `FECHA: ${timestamp}\n`;
    formatted += `VÁLIDO: ${entry.valid ? 'SÍ' : 'NO'}\n`;
    formatted += `${separator}\n`;
    
    if (entry.errors && entry.errors.length > 0) {
      formatted += `ERRORES:\n`;
      entry.errors.forEach((error, index) => {
        formatted += `  ${index + 1}. ${error}\n`;
      });
    }
    
    if (entry.warnings && entry.warnings.length > 0) {
      formatted += `ADVERTENCIAS:\n`;
      entry.warnings.forEach((warning, index) => {
        formatted += `  ${index + 1}. ${warning}\n`;
      });
    }
    
    formatted += `${separator}\n\n`;
    
    return formatted;
  }

  /**
   * 📋 FORMATEAR DETALLES
   */
  formatDetails(details) {
    if (typeof details === 'string') {
      return details;
    }
    
    if (typeof details === 'object') {
      let formatted = '';
      Object.entries(details).forEach(([key, value]) => {
        formatted += `  ${key}: ${JSON.stringify(value, null, 2)}\n`;
      });
      return formatted;
    }
    
    return JSON.stringify(details, null, 2);
  }

  /**
   * 📎 DESCARGAR LOGS MANUALMENTE (CON INTERACCIÓN USUARIO)
   */
  async downloadLogsManually() {
    try {
      const allLogs = {};
      
      // Recopilar de localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('error_log_')) {
          const filename = key.replace('error_log_', '');
          allLogs[filename] = localStorage.getItem(key);
        }
      }
      
      // Recopilar de buffer memoria
      this.errorBuffer.forEach((content, filename) => {
        allLogs[filename] = content;
      });
      
      // Descargar cada archivo
      for (const [filename, content] of Object.entries(allLogs)) {
        await this.downloadFile(filename, content);
      }
      
      return { success: true, files: Object.keys(allLogs).length };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * 📊 OBTENER ESTADÍSTICAS
   */
  getStats() {
    const stats = {
      total_files: this.errorBuffer.size,
      files: {},
      total_size: 0,
      timestamp: new Date().toISOString()
    };

    this.errorBuffer.forEach((content, filename) => {
      stats.files[filename] = {
        size: content.length,
        lines: content.split('\n').length
      };
      stats.total_size += content.length;
    });

    return stats;
  }

  /**
   * 🗂️ GENERAR RESUMEN DIARIO
   */
  async generateDailySummary() {
    const today = new Date().toISOString().split('T')[0];
    const summaryFilename = `daily_summary_${today}.txt`;
    
    const stats = this.getStats();
    const now = new Date().toLocaleString('es-CL');
    
    let summary = `${'='.repeat(80)}\n`;
    summary += `RESUMEN DIARIO DE ERRORES - ${today}\n`;
    summary += `Generado: ${now}\n`;
    summary += `${'='.repeat(80)}\n\n`;
    
    summary += `ESTADÍSTICAS GENERALES:\n`;
    summary += `  Archivos de error: ${stats.total_files}\n`;
    summary += `  Tamaño total: ${(stats.total_size / 1024).toFixed(2)} KB\n\n`;
    
    summary += `ARCHIVOS INDIVIDUALES:\n`;
    Object.entries(stats.files).forEach(([filename, fileStats]) => {
      summary += `  • ${filename}: ${fileStats.lines} líneas, ${(fileStats.size / 1024).toFixed(2)} KB\n`;
    });
    
    summary += `\n${'='.repeat(80)}\n`;
    
    await this.appendToFile(summaryFilename, summary);
  }
}

// Instancia global
const cumulativeErrorLogger = new CumulativeErrorLogger();

// Hacer disponible globalmente
window.cumulativeErrorLogger = cumulativeErrorLogger;
window.downloadErrorLogs = () => cumulativeErrorLogger.downloadLogsManually();

export default cumulativeErrorLogger;