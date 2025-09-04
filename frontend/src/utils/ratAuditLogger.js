/**
 * 📋 RAT AUDIT LOGGER - AUDITORÍA EN ARCHIVOS TXT
 * 
 * Reemplaza rat_audit_trail de BD con archivos TXT acumulativos
 * Rastrea TODOS los cambios en RATs sin depender de tablas BD
 */

import cumulativeErrorLogger from './cumulativeErrorLogger';

class RATAuditLogger {
  constructor() {
    this.trackingEnabled = true;
    this.maxHistorySize = 1000;
  }

  /**
   * 🚀 INICIALIZAR AUDITORÍA RAT
   */
  async initializeRAT(ratData, userId, tenantId) {
    try {
      const auditEntry = {
        rat_id: ratData.id || 'NEW_RAT',
        user_id: userId,
        tenant_id: tenantId,
        operation: 'CREATE',
        timestamp: new Date().toISOString(),
        snapshot_before: null,
        snapshot_after: this.sanitizeSnapshot(ratData),
        changed_fields: Object.keys(ratData),
        change_summary: 'RAT inicial creado',
        version_number: 1,
        session_id: this.generateSessionId(),
        metadata: {
          creation_context: 'user_interface',
          initial_state: true
        }
      };

      // Escribir auditoría a archivo TXT acumulativo
      await this.writeAuditToFile(auditEntry);

      return { success: true, auditId: auditEntry.session_id };
    } catch (error) {
      // Log error en archivo TXT
      await cumulativeErrorLogger.logCriticalError('RAT_AUDIT_INIT_FAILED', {
        error: error.message,
        ratData: ratData,
        userId: userId,
        tenantId: tenantId
      }, 'RAT_AUDIT_LOGGER');
      
      return { success: false, error: error.message };
    }
  }

  /**
   * 🔄 REGISTRAR CAMBIO RAT
   */
  async trackRATChange(ratId, oldData, newData, userId, tenantId, changeContext = {}) {
    if (!this.trackingEnabled) return { success: true };

    try {
      const changes = this.calculateChanges(oldData, newData);
      
      if (changes.length === 0) {
        return { success: true, message: 'Sin cambios detectados' };
      }

      const auditEntry = {
        rat_id: ratId,
        user_id: userId,
        tenant_id: tenantId,
        operation: 'UPDATE',
        timestamp: new Date().toISOString(),
        snapshot_before: this.sanitizeSnapshot(oldData),
        snapshot_after: this.sanitizeSnapshot(newData),
        changed_fields: changes.map(c => c.field),
        change_summary: this.generateChangeSummary(changes),
        version_number: await this.getNextVersionNumber(ratId),
        session_id: this.generateSessionId(),
        changes: changes,
        metadata: {
          change_context: changeContext,
          total_changes: changes.length
        }
      };

      // Escribir auditoría a archivo TXT acumulativo
      await this.writeAuditToFile(auditEntry);

      return { success: true, auditId: auditEntry.session_id, changes: changes.length };
    } catch (error) {
      await cumulativeErrorLogger.logCriticalError('RAT_AUDIT_TRACK_FAILED', {
        error: error.message,
        ratId: ratId,
        changeContext: changeContext
      }, 'RAT_AUDIT_LOGGER');
      
      return { success: false, error: error.message };
    }
  }

  /**
   * 🗑️ REGISTRAR ELIMINACIÓN RAT
   */
  async trackRATDeletion(ratId, ratData, userId, tenantId, reason = 'user_request') {
    try {
      const auditEntry = {
        rat_id: ratId,
        user_id: userId,
        tenant_id: tenantId,
        operation: 'DELETE',
        timestamp: new Date().toISOString(),
        snapshot_before: this.sanitizeSnapshot(ratData),
        snapshot_after: null,
        changed_fields: ['*ALL*'],
        change_summary: `RAT eliminado - Motivo: ${reason}`,
        version_number: await this.getNextVersionNumber(ratId),
        session_id: this.generateSessionId(),
        metadata: {
          deletion_reason: reason,
          final_state: true
        }
      };

      // Escribir auditoría a archivo TXT acumulativo
      await this.writeAuditToFile(auditEntry);

      return { success: true, auditId: auditEntry.session_id };
    } catch (error) {
      await cumulativeErrorLogger.logCriticalError('RAT_AUDIT_DELETE_FAILED', {
        error: error.message,
        ratId: ratId,
        reason: reason
      }, 'RAT_AUDIT_LOGGER');
      
      return { success: false, error: error.message };
    }
  }

  /**
   * 📄 ESCRIBIR AUDITORÍA A ARCHIVO TXT
   */
  async writeAuditToFile(auditEntry) {
    const today = new Date().toISOString().split('T')[0];
    const filename = `rat_audit_${today}.txt`;
    
    const formattedEntry = this.formatAuditEntry(auditEntry);
    
    // Usar sistema acumulativo existente
    await cumulativeErrorLogger.appendToFile(filename, formattedEntry);
  }

  /**
   * 🎨 FORMATEAR ENTRADA AUDITORÍA
   */
  formatAuditEntry(entry) {
    const timestamp = new Date(entry.timestamp).toLocaleString('es-CL');
    const separator = '='.repeat(80);
    
    let formatted = `${separator}\n`;
    formatted += `RAT AUDIT LOG - ${entry.operation}\n`;
    formatted += `RAT ID: ${entry.rat_id}\n`;
    formatted += `USER ID: ${entry.user_id}\n`;
    formatted += `TENANT ID: ${entry.tenant_id}\n`;
    formatted += `TIMESTAMP: ${timestamp}\n`;
    formatted += `VERSION: ${entry.version_number}\n`;
    formatted += `SESSION: ${entry.session_id}\n`;
    formatted += `${separator}\n\n`;
    
    // Resumen del cambio
    formatted += `RESUMEN: ${entry.change_summary}\n\n`;
    
    // Campos cambiados
    if (entry.changed_fields && entry.changed_fields.length > 0) {
      formatted += `CAMPOS MODIFICADOS: ${entry.changed_fields.join(', ')}\n\n`;
    }
    
    // Cambios detallados
    if (entry.changes && entry.changes.length > 0) {
      formatted += `CAMBIOS DETALLADOS:\n`;
      entry.changes.forEach((change, index) => {
        formatted += `  ${index + 1}. ${change.field}: "${change.old_value}" → "${change.new_value}"\n`;
      });
      formatted += `\n`;
    }
    
    // Snapshot antes (solo para operaciones UPDATE/DELETE)
    if (entry.snapshot_before && entry.operation !== 'CREATE') {
      formatted += `ESTADO ANTERIOR:\n`;
      formatted += this.formatSnapshot(entry.snapshot_before);
      formatted += `\n`;
    }
    
    // Snapshot después (solo para operaciones CREATE/UPDATE)
    if (entry.snapshot_after && entry.operation !== 'DELETE') {
      formatted += `ESTADO POSTERIOR:\n`;
      formatted += this.formatSnapshot(entry.snapshot_after);
      formatted += `\n`;
    }
    
    // Metadatos
    if (entry.metadata) {
      formatted += `METADATA:\n`;
      Object.entries(entry.metadata).forEach(([key, value]) => {
        formatted += `  ${key}: ${JSON.stringify(value)}\n`;
      });
      formatted += `\n`;
    }
    
    formatted += `${separator}\n\n`;
    
    return formatted;
  }

  /**
   * 📊 FORMATEAR SNAPSHOT
   */
  formatSnapshot(snapshot) {
    let formatted = '';
    Object.entries(snapshot).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formatted += `  ${key}: ${JSON.stringify(value, null, 2)}\n`;
      }
    });
    return formatted;
  }

  /**
   * 🔢 CALCULAR CAMBIOS
   */
  calculateChanges(oldData, newData) {
    const changes = [];
    const allKeys = new Set([...Object.keys(oldData || {}), ...Object.keys(newData || {})]);
    
    allKeys.forEach(key => {
      const oldValue = oldData?.[key];
      const newValue = newData?.[key];
      
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes.push({
          field: key,
          old_value: oldValue,
          new_value: newValue,
          change_type: oldValue === undefined ? 'ADDED' :
                      newValue === undefined ? 'REMOVED' : 'MODIFIED'
        });
      }
    });
    
    return changes;
  }

  /**
   * 📝 GENERAR RESUMEN DE CAMBIOS
   */
  generateChangeSummary(changes) {
    if (changes.length === 0) return 'Sin cambios';
    
    const added = changes.filter(c => c.change_type === 'ADDED').length;
    const removed = changes.filter(c => c.change_type === 'REMOVED').length;
    const modified = changes.filter(c => c.change_type === 'MODIFIED').length;
    
    let summary = [];
    if (added > 0) summary.push(`${added} campos agregados`);
    if (removed > 0) summary.push(`${removed} campos removidos`);
    if (modified > 0) summary.push(`${modified} campos modificados`);
    
    return summary.join(', ');
  }

  /**
   * 🧹 LIMPIAR SNAPSHOT
   */
  sanitizeSnapshot(data) {
    if (!data) return null;
    
    const sanitized = { ...data };
    
    // Remover campos sensibles o muy grandes
    const fieldsToRemove = ['password', 'token', 'auth', 'internal_'];
    fieldsToRemove.forEach(field => {
      Object.keys(sanitized).forEach(key => {
        if (key.toLowerCase().includes(field)) {
          delete sanitized[key];
        }
      });
    });
    
    // Truncar campos muy largos
    Object.keys(sanitized).forEach(key => {
      if (typeof sanitized[key] === 'string' && sanitized[key].length > 1000) {
        sanitized[key] = sanitized[key].substring(0, 1000) + '... [TRUNCATED]';
      }
    });
    
    return sanitized;
  }

  /**
   * 🎲 GENERAR SESSION ID
   */
  generateSessionId() {
    return `AUDIT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 📈 OBTENER SIGUIENTE NÚMERO DE VERSIÓN
   */
  async getNextVersionNumber(ratId) {
    // En un sistema de archivos, usar timestamp como versión
    return Date.now();
  }

  /**
   * 📊 OBTENER ESTADÍSTICAS AUDITORÍA
   */
  getAuditStats() {
    return {
      tracking_enabled: this.trackingEnabled,
      max_history_size: this.maxHistorySize,
      storage_type: 'TXT_FILES',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 🔄 HABILITAR/DESHABILITAR TRACKING
   */
  setTrackingEnabled(enabled) {
    this.trackingEnabled = enabled;
    
    if (enabled) {
      cumulativeErrorLogger.logMediumError('RAT_AUDIT_ENABLED', {
        message: 'Auditoría RAT habilitada',
        timestamp: new Date().toISOString()
      }, 'RAT_AUDIT_LOGGER');
    } else {
      cumulativeErrorLogger.logMediumError('RAT_AUDIT_DISABLED', {
        message: 'Auditoría RAT deshabilitada',
        timestamp: new Date().toISOString()
      }, 'RAT_AUDIT_LOGGER');
    }
  }
}

// Instancia global
const ratAuditLogger = new RATAuditLogger();

// Hacer disponible globalmente
window.ratAuditLogger = ratAuditLogger;

export default ratAuditLogger;