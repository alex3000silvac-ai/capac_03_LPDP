/**
 * 📊 SUPABASE ERROR LOGGER - SISTEMA 100% SUPABASE
 * 
 * Reemplaza localStorage con Supabase y memoria
 * Sistema de logging de errores persistente
 */

import { supabase } from '../config/supabaseClient';

class SupabaseErrorLogger {
  constructor() {
    this.tableName = 'system_error_logs';
    this.errorBuffer = new Map();
    this.fileHandleCache = {};
    this.batchSize = 10;
    this.flushInterval = 30000; // 30 segundos
    this.currentTenantId = 1;
    
    this.startAutoFlush();
  }

  /**
   * 🔥 CRÍTICO: LOG ERROR CRÍTICO A SUPABASE
   */
  async logCriticalError(errorCode, errorData, source = 'UNKNOWN', category = 'CRITICAL') {
    const logEntry = this.createLogEntry('CRITICAL', errorCode, errorData, source, category);
    
    // Guardar inmediatamente en Supabase para errores críticos
    await this.saveToSupabase([logEntry]);
    
    // También mantener en buffer de memoria
    this.addToBuffer(logEntry);
    
    console.error(`🔥 CRÍTICO [${source}]: ${errorCode}`, errorData);
  }

  /**
   * ⚠️ MEDIO: LOG ERROR MEDIO A SUPABASE
   */
  async logMediumError(errorCode, errorData, source = 'UNKNOWN', category = 'MEDIUM') {
    const logEntry = this.createLogEntry('MEDIUM', errorCode, errorData, source, category);
    
    // Agregar a buffer para flush posterior
    this.addToBuffer(logEntry);
    
    console.warn(`⚠️ MEDIO [${source}]: ${errorCode}`, errorData);
  }

  /**
   * ℹ️ INFO: LOG INFO A SUPABASE
   */
  async logInfo(infoCode, infoData, source = 'UNKNOWN', category = 'INFO') {
    const logEntry = this.createLogEntry('INFO', infoCode, infoData, source, category);
    
    // Agregar a buffer para flush posterior
    this.addToBuffer(logEntry);
    
    console.info(`ℹ️ INFO [${source}]: ${infoCode}`, infoData);
  }

  /**
   * 📝 CREAR ENTRADA DE LOG
   */
  createLogEntry(level, code, data, source, category) {
    return {
      tenant_id: this.currentTenantId,
      log_level: level,
      error_code: code,
      error_message: typeof data === 'string' ? data : data.message || 'Sin mensaje',
      error_data: typeof data === 'object' ? JSON.stringify(data) : data,
      source_component: source,
      category: category,
      timestamp: new Date().toISOString(),
      user_agent: navigator.userAgent,
      url: window.location.href,
      created_at: new Date().toISOString()
    };
  }

  /**
   * 🗂️ AGREGAR A BUFFER DE MEMORIA
   */
  addToBuffer(logEntry) {
    const key = `${logEntry.category}_${logEntry.log_level}`;
    
    if (!this.errorBuffer.has(key)) {
      this.errorBuffer.set(key, []);
    }
    
    this.errorBuffer.get(key).push(logEntry);
    
    // Auto-flush si el buffer está lleno
    if (this.errorBuffer.get(key).length >= this.batchSize) {
      this.flushBufferToSupabase(key);
    }
  }

  /**
   * 💾 GUARDAR DIRECTAMENTE EN SUPABASE
   */
  async saveToSupabase(logEntries) {
    if (!Array.isArray(logEntries) || logEntries.length === 0) return;

    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .insert(logEntries)
        .select();

      if (error) {
        console.error('❌ Error guardando logs en Supabase:', error);
        // Mantener en memoria si falla Supabase
        logEntries.forEach(entry => this.addToMemoryFallback(entry));
      } else {
        console.log(`✅ Guardados ${logEntries.length} logs en Supabase`);
      }

      return { success: !error, data, error };

    } catch (error) {
      console.error('❌ Exception guardando logs en Supabase:', error);
      // Mantener en memoria si falla completamente
      logEntries.forEach(entry => this.addToMemoryFallback(entry));
      return { success: false, error: error.message };
    }
  }

  /**
   * 🔄 FLUSH BUFFER ESPECÍFICO A SUPABASE
   */
  async flushBufferToSupabase(bufferKey) {
    const entries = this.errorBuffer.get(bufferKey);
    if (!entries || entries.length === 0) return;

    // Limpiar buffer antes de enviar
    this.errorBuffer.delete(bufferKey);

    // Enviar a Supabase
    await this.saveToSupabase(entries);
  }

  /**
   * 🔄 FLUSH TODOS LOS BUFFERS A SUPABASE
   */
  async flushAllBuffersToSupabase() {
    const allEntries = [];
    
    // Recopilar todas las entradas
    for (const [key, entries] of this.errorBuffer) {
      allEntries.push(...entries);
    }
    
    if (allEntries.length === 0) return;

    // Limpiar todos los buffers
    this.errorBuffer.clear();

    // Enviar todo a Supabase
    await this.saveToSupabase(allEntries);
  }

  /**
   * 🕐 AUTO-FLUSH AUTOMÁTICO
   */
  startAutoFlush() {
    setInterval(() => {
      this.flushAllBuffersToSupabase();
    }, this.flushInterval);
  }

  /**
   * 💾 FALLBACK A MEMORIA SI SUPABASE FALLA
   */
  addToMemoryFallback(logEntry) {
    const fallbackKey = 'memory_fallback';
    
    if (!this.errorBuffer.has(fallbackKey)) {
      this.errorBuffer.set(fallbackKey, []);
    }
    
    this.errorBuffer.get(fallbackKey).push(logEntry);
    
    // Limitar tamaño del fallback
    const fallbackEntries = this.errorBuffer.get(fallbackKey);
    if (fallbackEntries.length > 100) {
      fallbackEntries.splice(0, 50); // Eliminar las primeras 50
    }
  }

  /**
   * 📊 OBTENER ESTADÍSTICAS DEL LOGGER
   */
  getLoggerStats() {
    const stats = {
      total_entries: 0,
      buffers: {},
      memory_fallback: 0,
      supabase_connected: true // Asumir conectado hasta probar lo contrario
    };

    for (const [key, entries] of this.errorBuffer) {
      stats.buffers[key] = entries.length;
      stats.total_entries += entries.length;
      
      if (key === 'memory_fallback') {
        stats.memory_fallback = entries.length;
      }
    }

    return stats;
  }

  /**
   * 📥 DESCARGAR LOGS DESDE SUPABASE
   */
  async downloadLogsFromSupabase(options = {}) {
    const {
      category = null,
      level = null,
      fromDate = null,
      toDate = null,
      limit = 1000
    } = options;

    try {
      let query = supabase
        .from(this.tableName)
        .select('*')
        .eq('tenant_id', this.currentTenantId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (category) query = query.eq('category', category);
      if (level) query = query.eq('log_level', level);
      if (fromDate) query = query.gte('created_at', fromDate);
      if (toDate) query = query.lte('created_at', toDate);

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return { success: true, logs: data || [] };

    } catch (error) {
      console.error('❌ Error descargando logs desde Supabase:', error);
      return { success: false, error: error.message, logs: [] };
    }
  }

  /**
   * 💾 DESCARGAR ARCHIVO DE LOGS
   */
  async downloadLogsFile(options = {}) {
    const result = await this.downloadLogsFromSupabase(options);
    
    if (!result.success || result.logs.length === 0) {
      console.warn('⚠️ No hay logs para descargar');
      return;
    }

    const content = this.formatLogsForFile(result.logs);
    const filename = `system_logs_${new Date().toISOString().split('T')[0]}.txt`;

    try {
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      console.log(`✅ Archivo ${filename} descargado exitosamente`);

    } catch (error) {
      console.error('❌ Error descargando archivo:', error);
    }
  }

  /**
   * 📝 FORMATEAR LOGS PARA ARCHIVO
   */
  formatLogsForFile(logs) {
    let content = '===================================\n';
    content += '📊 SYSTEM ERROR LOGS - SUPABASE\n';
    content += `📅 Generado: ${new Date().toISOString()}\n`;
    content += `📈 Total Entradas: ${logs.length}\n`;
    content += '===================================\n\n';

    logs.forEach((log, index) => {
      content += `--- LOG ${index + 1} ---\n`;
      content += `🕐 Timestamp: ${log.timestamp}\n`;
      content += `📊 Nivel: ${log.log_level}\n`;
      content += `🏷️ Código: ${log.error_code}\n`;
      content += `📍 Fuente: ${log.source_component}\n`;
      content += `📂 Categoría: ${log.category}\n`;
      content += `💬 Mensaje: ${log.error_message}\n`;
      if (log.error_data && log.error_data !== log.error_message) {
        content += `📋 Datos: ${log.error_data}\n`;
      }
      content += `🌐 URL: ${log.url}\n`;
      content += `🖥️ User Agent: ${log.user_agent}\n`;
      content += '\n';
    });

    return content;
  }

  /**
   * 🧹 LIMPIAR LOGS ANTIGUOS DE SUPABASE
   */
  async cleanupOldLogs(daysToKeep = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('tenant_id', this.currentTenantId)
        .lt('created_at', cutoffDate.toISOString());

      if (error) {
        throw error;
      }

      console.log(`🧹 Logs anteriores a ${cutoffDate.toISOString()} eliminados`);
      return { success: true };

    } catch (error) {
      console.error('❌ Error limpiando logs antiguos:', error);
      return { success: false, error: error.message };
    }
  }
}

// Instancia global
const supabaseErrorLogger = new SupabaseErrorLogger();

// Hacer disponible globalmente
if (typeof window !== 'undefined') {
  window.supabaseErrorLogger = supabaseErrorLogger;
}

export default supabaseErrorLogger;