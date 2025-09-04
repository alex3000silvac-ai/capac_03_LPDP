/**
 * ⚠️ SISTEMA DE ALERTAS TEMPRANAS BD
 * 
 * Detecta ANTES que ocurran:
 * - Fallos de grabado
 * - Problemas de carga  
 * - Pérdida de datos
 * - Inconsistencias críticas
 * 
 * PREVIENE problemas anticipándolos - NO los corrige
 * GENERA ALERTAS EN ARCHIVOS TXT
 */

import { supabase } from '../config/supabaseClient';
import fileErrorLogger from './fileErrorLogger';

class EarlyWarningSystem {
  constructor() {
    this.warnings = [];
    this.predictedFailures = [];
    this.riskPatterns = new Map();
    this.isActive = false;
    
    this.setupRiskPatterns();
  }

  /**
   * 📋 CONFIGURAR PATRONES DE RIESGO
   */
  setupRiskPatterns() {
    // Patrón 1: ID undefined que causará fallo
    this.riskPatterns.set('UNDEFINED_ID_RISK', {
      triggers: ['id=undefined', 'ratData.id === undefined', 'editingRAT === null'],
      risk_level: 'CRITICAL',
      predicted_failure: 'PATCH con id undefined → Error 400',
      prevention: 'Validar ID antes de operación UPDATE'
    });

    // Patrón 2: Datos incompletos que fallarán validación
    this.riskPatterns.set('INCOMPLETE_DATA_RISK', {
      triggers: ['nombre_actividad.is.null', 'razon_social empty', 'required field missing'],
      risk_level: 'HIGH',
      predicted_failure: 'INSERT fallará por campos requeridos',
      prevention: 'Validar campos obligatorios antes de guardar'
    });

    // Patrón 3: Problemas RLS que causarán 406
    this.riskPatterns.set('RLS_PERMISSION_RISK', {
      triggers: ['tenant_id filter', '406 previous', 'permission denied'],
      risk_level: 'CRITICAL',
      predicted_failure: 'Query con 406 Not Acceptable',
      prevention: 'Validar permisos RLS antes de query'
    });

    // Patrón 4: Conectividad débil que causará timeout
    this.riskPatterns.set('CONNECTION_DEGRADATION_RISK', {
      triggers: ['slow response', 'timeout warning', 'connection retry'],
      risk_level: 'MEDIUM',
      predicted_failure: 'Timeout en operación crítica',
      prevention: 'Implementar retry con backoff'
    });

    // Patrón 5: Datos empresa que se perderán
    this.riskPatterns.set('DATA_LOSS_RISK', {
      triggers: ['form reset', 'navigation without save', 'page refresh'],
      risk_level: 'HIGH', 
      predicted_failure: 'Pérdida datos formulario empresa',
      prevention: 'Auto-guardar en localStorage'
    });
  }

  /**
   * 🚀 INICIALIZAR SISTEMA DE ALERTAS
   */
  async init() {
    if (this.isActive) {
      //console.log('⚠️ Early Warning System ya está activo');
      return;
    }

    try {
      //console.log('⚠️ Inicializando Early Warning System...');
      
      // Configurar interceptores predictivos
      this.setupPredictiveInterceptors();
      
      // Configurar monitoreo de patrones
      this.setupPatternMonitoring();
      
      // Configurar validaciones pre-operación
      this.setupPreOperationValidation();
      
      this.isActive = true;
      //console.log('✅ Early Warning System ACTIVO');
      
    } catch (error) {
      console.error('❌ Error inicializando Early Warning System:', error);
    }
  }

  /**
   * 🕷️ INTERCEPTORES PREDICTIVOS
   */
  setupPredictiveInterceptors() {
    // Interceptar antes de operaciones Supabase
    const originalFrom = supabase.from;
    
    supabase.from = (tableName) => {
      const queryBuilder = originalFrom.call(supabase, tableName);
      
      // Interceptar métodos críticos
      const originalUpdate = queryBuilder.update;
      const originalInsert = queryBuilder.insert;
      const originalSelect = queryBuilder.select;
      
      // INTERCEPTAR UPDATE - Detectar ID undefined
      queryBuilder.update = (values, options) => {
        this.predictUpdateFailure(tableName, values, queryBuilder._query);
        return originalUpdate.call(queryBuilder, values, options);
      };
      
      // INTERCEPTAR INSERT - Detectar datos incompletos
      queryBuilder.insert = (values, options) => {
        this.predictInsertFailure(tableName, values);
        return originalInsert.call(queryBuilder, values, options);
      };
      
      // INTERCEPTAR SELECT - Detectar problemas RLS
      queryBuilder.select = (columns, options) => {
        this.predictSelectFailure(tableName, queryBuilder._query);
        return originalSelect.call(queryBuilder, columns, options);
      };
      
      return queryBuilder;
    };
  }

  /**
   * 🔍 PREDECIR FALLO UPDATE
   */
  predictUpdateFailure(tableName, values, query) {
    // Detectar ID undefined
    const hasUndefinedId = query && (
      query.includes('id=eq.undefined') || 
      query.includes('id=eq.null') ||
      !query.includes('id=eq.')
    );
    
    if (hasUndefinedId) {
      this.issueWarning('UPDATE_ID_UNDEFINED', {
        table: tableName,
        predicted_error: '400 Bad Request - PATCH con id undefined',
        risk_level: 'CRITICAL',
        prevention_action: 'Validar que el registro tenga ID válido antes de UPDATE',
        technical_details: { query, values }
      });
    }

    // Detectar campos críticos faltantes
    if (tableName === 'mapeo_datos_rat') {
      const requiredFields = ['nombre_actividad', 'razon_social', 'email_empresa'];
      const missingFields = requiredFields.filter(field => !values[field]);
      
      if (missingFields.length > 0) {
        this.issueWarning('UPDATE_MISSING_REQUIRED', {
          table: tableName,
          missing_fields: missingFields,
          predicted_error: 'Datos incompletos pueden causar inconsistencias',
          risk_level: 'HIGH',
          prevention_action: `Completar campos: ${missingFields.join(', ')}`
        });
      }
    }
  }

  /**
   * 📝 PREDECIR FALLO INSERT
   */
  predictInsertFailure(tableName, values) {
    const records = Array.isArray(values) ? values : [values];
    
    records.forEach((record, index) => {
      // Validaciones específicas por tabla
      switch (tableName) {
        case 'mapeo_datos_rat':
          this.validateRATInsert(record, index);
          break;
        case 'organizaciones':
          this.validateOrgInsert(record, index);
          break;
        case 'proveedores':
          this.validateProviderInsert(record, index);
          break;
      }
    });
  }

  /**
   * 🎯 VALIDAR INSERT RAT
   */
  validateRATInsert(record, index) {
    const issues = [];
    
    // Campos críticos faltantes
    if (!record.nombre_actividad) issues.push('nombre_actividad es requerido');
    if (!record.razon_social) issues.push('razon_social es requerido');
    if (!record.email_empresa) issues.push('email_empresa es requerido');
    
    // Validar tenant_id
    if (!record.tenant_id) {
      issues.push('tenant_id faltante - causará problemas RLS');
    }
    
    // Validar formato email
    if (record.email_empresa && !this.isValidEmail(record.email_empresa)) {
      issues.push('email_empresa tiene formato inválido');
    }
    
    if (issues.length > 0) {
      this.issueWarning('RAT_INSERT_VALIDATION', {
        record_index: index,
        validation_errors: issues,
        predicted_error: 'INSERT fallará o creará datos inconsistentes',
        risk_level: 'HIGH',
        prevention_action: 'Corregir validaciones antes de insertar',
        record_data: record
      });
    }
  }

  /**
   * 📊 PREDECIR FALLO SELECT
   */
  predictSelectFailure(tableName, query) {
    // Detectar queries que pueden causar 406
    if (query) {
      const hasRiskyFilter = query.includes('tenant_id=eq.') && query.includes('id=eq.');
      const hasNoTenantFilter = !query.includes('tenant_id') && tableName !== 'organizaciones';
      
      if (hasRiskyFilter) {
        this.issueWarning('SELECT_RLS_RISK', {
          table: tableName,
          query: query,
          predicted_error: '406 Not Acceptable - Filtro tenant_id + id puede fallar',
          risk_level: 'CRITICAL',
          prevention_action: 'Revisar configuración RLS para esta combinación',
          suggested_fix: 'Usar solo id=eq. o revisar políticas RLS'
        });
      }
      
      if (hasNoTenantFilter) {
        this.issueWarning('SELECT_SECURITY_RISK', {
          table: tableName,
          query: query,
          predicted_error: 'Query sin tenant_id puede acceder datos de otros tenants',
          risk_level: 'HIGH',
          prevention_action: 'Agregar filtro tenant_id para seguridad'
        });
      }
    }
  }

  /**
   * 👁️ MONITOREO DE PATRONES
   */
  setupPatternMonitoring() {
    // Monitorear cambios en DOM que indiquen riesgo
    if (typeof window !== 'undefined' && window.MutationObserver) {
      const observer = new MutationObserver((mutations) => {
        this.analyzePageChanges(mutations);
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true
      });
    }

    // Monitorear eventos de navegación
    window.addEventListener('beforeunload', (event) => {
      this.checkDataLossRisk(event);
    });

    // Monitorear cambios en forms
    document.addEventListener('input', (event) => {
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        this.monitorFormChanges(event.target);
      }
    });
  }

  /**
   * 📄 ANALIZAR CAMBIOS DE PÁGINA
   */
  analyzePageChanges(mutations) {
    mutations.forEach(mutation => {
      // Detectar si se está limpiando un formulario
      if (mutation.type === 'childList') {
        const removedNodes = Array.from(mutation.removedNodes);
        const hasFormData = removedNodes.some(node => 
          node.nodeType === 1 && 
          (node.querySelector('input[value]') || node.querySelector('textarea'))
        );
        
        if (hasFormData) {
          this.issueWarning('FORM_DATA_CLEARING', {
            predicted_error: 'Datos de formulario se están perdiendo',
            risk_level: 'MEDIUM',
            prevention_action: 'Guardar datos antes de limpiar formulario',
            timestamp: Date.now()
          });
        }
      }
    });
  }

  /**
   * 💾 VERIFICAR RIESGO PÉRDIDA DATOS
   */
  checkDataLossRisk(event) {
    // Verificar si hay datos no guardados en formularios
    const forms = document.querySelectorAll('form');
    let hasUnsavedData = false;
    
    forms.forEach(form => {
      const inputs = form.querySelectorAll('input, textarea, select');
      inputs.forEach(input => {
        if (input.value && input.value.trim() !== '') {
          hasUnsavedData = true;
        }
      });
    });
    
    if (hasUnsavedData) {
      this.issueWarning('NAVIGATION_DATA_LOSS_RISK', {
        predicted_error: 'Datos de formulario se perderán al navegar',
        risk_level: 'HIGH',
        prevention_action: 'Implementar auto-guardado o confirmación',
        forms_with_data: forms.length,
        timestamp: Date.now()
      });
      
      // Opcional: mostrar confirmación al usuario
      event.returnValue = '¿Estás seguro de salir? Hay datos no guardados.';
      return event.returnValue;
    }
  }

  /**
   * 📝 MONITOREAR CAMBIOS FORM
   */
  monitorFormChanges(input) {
    // Detectar campos críticos que requieren validación
    const criticalFields = ['razon_social', 'rut', 'email_empresa', 'nombre_actividad'];
    
    if (criticalFields.includes(input.name)) {
      const value = input.value.trim();
      
      if (!value) {
        this.issueWarning('CRITICAL_FIELD_EMPTY', {
          field_name: input.name,
          predicted_error: `Campo crítico ${input.name} vacío causará error de validación`,
          risk_level: 'HIGH',
          prevention_action: `Completar campo ${input.name} antes de guardar`
        });
      }
      
      // Validaciones específicas
      if (input.name === 'email_empresa' && value && !this.isValidEmail(value)) {
        this.issueWarning('INVALID_EMAIL_FORMAT', {
          field_name: 'email_empresa',
          current_value: value,
          predicted_error: 'Email inválido causará error en grabación',
          risk_level: 'MEDIUM',
          prevention_action: 'Corregir formato de email'
        });
      }
    }
  }

  /**
   * ✅ VALIDACIONES PRE-OPERACIÓN
   */
  setupPreOperationValidation() {
    // Interceptar clicks en botones de guardado
    document.addEventListener('click', (event) => {
      const button = event.target;
      
      if (button.type === 'submit' || 
          button.textContent?.toLowerCase().includes('guardar') ||
          button.textContent?.toLowerCase().includes('save')) {
        
        this.performPreSaveValidation(button);
      }
    });
  }

  /**
   * 💾 VALIDACIÓN PRE-GUARDADO
   */
  performPreSaveValidation(button) {
    const form = button.closest('form');
    if (!form) return;
    
    const validationIssues = [];
    
    // Validar campos requeridos
    const requiredInputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    requiredInputs.forEach(input => {
      if (!input.value.trim()) {
        validationIssues.push(`Campo requerido vacío: ${input.name || input.id}`);
      }
    });
    
    // Validar formato emails
    const emailInputs = form.querySelectorAll('input[type="email"], input[name*="email"]');
    emailInputs.forEach(input => {
      if (input.value && !this.isValidEmail(input.value)) {
        validationIssues.push(`Email inválido: ${input.value}`);
      }
    });
    
    if (validationIssues.length > 0) {
      this.issueWarning('PRE_SAVE_VALIDATION_FAILED', {
        predicted_error: 'Guardado fallará por errores de validación',
        risk_level: 'CRITICAL',
        validation_issues: validationIssues,
        prevention_action: 'Corregir errores antes de guardar',
        form_id: form.id || 'unnamed_form'
      });
    }
  }

  /**
   * 📧 VALIDAR EMAIL
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * ⚠️ EMITIR ALERTA - ARCHIVO TXT
   */
  async issueWarning(type, details) {
    const warning = {
      id: `warning_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      type: type,
      timestamp: Date.now(),
      details: details,
      resolved: false
    };
    
    this.warnings.push(warning);
    
    // Log en consola
    const icon = details.risk_level === 'CRITICAL' ? '🚨' : 
                details.risk_level === 'HIGH' ? '⚠️' : '📝';
    
    console.group(`${icon} ALERTA TEMPRANA: ${type}`);
    //console.warn('Riesgo:', details.risk_level);
    //console.warn('Error Predicho:', details.predicted_error);
    //console.warn('Prevención:', details.prevention_action);
    if (details.technical_details) {
      //console.warn('Detalles Técnicos:', details.technical_details);
    }
    console.groupEnd();
    
    // Escribir alerta temprana a archivo TXT
    await fileErrorLogger.logEarlyWarning(
      type,
      details.predicted_error,
      details.prevention_action,
      {
        risk_level: details.risk_level,
        technical_details: details.technical_details,
        warning_id: warning.id,
        timestamp: new Date(warning.timestamp).toISOString()
      }
    );
    
    // Limpiar warnings antiguos
    if (this.warnings.length > 100) {
      this.warnings = this.warnings.slice(-80);
    }
  }

  /**
   * 📈 GENERAR REPORTE ALERTAS
   */
  generateWarningReport() {
    const recentWarnings = this.warnings.filter(w => 
      Date.now() - w.timestamp < (24 * 60 * 60 * 1000) // Últimas 24h
    );
    
    const warningsByRisk = {
      CRITICAL: recentWarnings.filter(w => w.details.risk_level === 'CRITICAL').length,
      HIGH: recentWarnings.filter(w => w.details.risk_level === 'HIGH').length,
      MEDIUM: recentWarnings.filter(w => w.details.risk_level === 'MEDIUM').length
    };
    
    const warningsByType = {};
    recentWarnings.forEach(w => {
      warningsByType[w.type] = (warningsByType[w.type] || 0) + 1;
    });
    
    return {
      timestamp: Date.now(),
      system_active: this.isActive,
      summary: {
        total_warnings_24h: recentWarnings.length,
        warnings_by_risk: warningsByRisk,
        warnings_by_type: warningsByType,
        critical_warnings: recentWarnings.filter(w => w.details.risk_level === 'CRITICAL').slice(-5)
      },
      predictions: {
        likely_failures: this.predictedFailures.length,
        prevention_opportunities: recentWarnings.length,
        risk_mitigation_rate: this.calculateMitigationRate()
      }
    };
  }

  /**
   * 📊 CALCULAR TASA MITIGACIÓN
   */
  calculateMitigationRate() {
    const resolvedWarnings = this.warnings.filter(w => w.resolved).length;
    const totalWarnings = this.warnings.length;
    
    return totalWarnings > 0 ? Math.round((resolvedWarnings / totalWarnings) * 100) : 100;
  }

  /**
   * 🖨️ IMPRIMIR REPORTE ALERTAS
   */
  printWarningReport() {
    const report = this.generateWarningReport();
    
    console.group('⚠️ REPORTE EARLY WARNING SYSTEM');
    //console.log('⏰ Timestamp:', new Date(report.timestamp).toLocaleString());
    //console.log('📊 Sistema activo:', report.system_active ? '✅ SÍ' : '❌ NO');
    //console.log('🚨 Alertas 24h:', report.summary.total_warnings_24h);
    //console.log('⚖️ Por Riesgo:', report.summary.warnings_by_risk);
    
    if (report.summary.critical_warnings.length > 0) {
      console.group('🚨 ALERTAS CRÍTICAS RECIENTES');
      report.summary.critical_warnings.forEach((warning, index) => {
        //console.log(`${index + 1}. ${warning.type}: ${warning.details.predicted_error}`);
      });
      console.groupEnd();
    }
    
    console.groupEnd();
    
    return report;
  }

  /**
   * 🛑 DETENER SISTEMA
   */
  stop() {
    this.isActive = false;
    //console.log('🛑 Early Warning System detenido');
  }
}

// Instancia global
const earlyWarningSystem = new EarlyWarningSystem();

// Hacer disponible globalmente
window.earlyWarningSystem = earlyWarningSystem;
window.showEarlyWarnings = () => earlyWarningSystem.printWarningReport();

// Auto-inicializar
if (typeof window !== 'undefined') {
  earlyWarningSystem.init();
}

export default earlyWarningSystem;