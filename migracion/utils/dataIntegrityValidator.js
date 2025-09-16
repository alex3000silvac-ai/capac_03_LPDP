/**
 * ✅ VALIDADOR DE INTEGRIDAD DE DATOS
 * 
 * Valida ANTES de operaciones para prevenir:
 * - Datos corruptos
 * - Referencias inconsistentes  
 * - Fallos de integridad
 * - Pérdida de información
 * 
 * NO MODIFICA - SOLO VALIDA Y ALERTA
 * GENERA ERRORES DE VALIDACIÓN EN ARCHIVOS TXT
 */

import fileErrorLogger from './fileErrorLogger';

class DataIntegrityValidator {
  constructor() {
    this.validationRules = new Map();
    this.integrityChecks = [];
    this.validationErrors = [];
    
    this.setupValidationRules();
  }

  /**
   * 📋 CONFIGURAR REGLAS DE VALIDACIÓN
   */
  setupValidationRules() {
    // Reglas para RAT
    this.validationRules.set('mapeo_datos_rat', {
      required_fields: ['nombre_actividad', 'razon_social', 'email_empresa', 'tenant_id'],
      field_validations: {
        email_empresa: { type: 'email', required: true },
        rut: { type: 'rut', required: true },
        telefono_empresa: { type: 'phone', required: false },
        nombre_actividad: { type: 'string', minLength: 3, required: true }
      },
      referential_integrity: {
        tenant_id: { references: 'organizaciones', field: 'id' },
        organizacion_id: { references: 'organizaciones', field: 'id', nullable: true }
      },
      business_rules: [
        { rule: 'unique_rat_per_activity_per_tenant', critical: true },
        { rule: 'valid_risk_level', critical: false },
        { rule: 'complete_dpo_info', critical: true }
      ]
    });

    // Reglas para Organizaciones
    this.validationRules.set('organizaciones', {
      required_fields: ['nombre', 'rut', 'email'],
      field_validations: {
        email: { type: 'email', required: true },
        rut: { type: 'rut', required: true, unique: true },
        telefono: { type: 'phone', required: false }
      },
      business_rules: [
        { rule: 'unique_rut', critical: true },
        { rule: 'valid_organization_data', critical: true }
      ]
    });

    // Reglas para Proveedores
    this.validationRules.set('proveedores', {
      required_fields: ['nombre', 'email', 'rat_id'],
      field_validations: {
        email: { type: 'email', required: true },
        telefono: { type: 'phone', required: false }
      },
      referential_integrity: {
        rat_id: { references: 'mapeo_datos_rat', field: 'id' }
      }
    });
  }

  /**
   * ✅ VALIDAR ANTES DE INSERT
   */
  async validateBeforeInsert(tableName, data) {
    //console.log(`🔍 Validando datos antes de INSERT en ${tableName}`);
    
    const validation = {
      table: tableName,
      operation: 'INSERT',
      timestamp: Date.now(),
      valid: true,
      errors: [],
      warnings: [],
      data_preview: this.sanitizeDataForLog(data)
    };

    try {
      const rules = this.validationRules.get(tableName);
      if (!rules) {
        validation.warnings.push(`No hay reglas de validación definidas para tabla ${tableName}`);
        return validation;
      }

      const records = Array.isArray(data) ? data : [data];
      
      for (let i = 0; i < records.length; i++) {
        const record = records[i];
        
        // 1. Validar campos requeridos
        const requiredValidation = this.validateRequiredFields(record, rules.required_fields, i);
        validation.errors.push(...requiredValidation.errors);
        validation.warnings.push(...requiredValidation.warnings);
        
        // 2. Validar formato de campos
        if (rules.field_validations) {
          const fieldValidation = this.validateFieldFormats(record, rules.field_validations, i);
          validation.errors.push(...fieldValidation.errors);
          validation.warnings.push(...fieldValidation.warnings);
        }
        
        // 3. Validar integridad referencial
        if (rules.referential_integrity) {
          const refValidation = await this.validateReferentialIntegrity(record, rules.referential_integrity, i);
          validation.errors.push(...refValidation.errors);
          validation.warnings.push(...refValidation.warnings);
        }
        
        // 4. Validar reglas de negocio
        if (rules.business_rules) {
          const businessValidation = await this.validateBusinessRules(tableName, record, rules.business_rules, i);
          validation.errors.push(...businessValidation.errors);
          validation.warnings.push(...businessValidation.warnings);
        }
      }
      
      validation.valid = validation.errors.length === 0;
      
      // Log resultados en archivo TXT
      await this.logValidationResults(validation);
      
    } catch (error) {
      validation.valid = false;
      validation.errors.push(`Error interno validación: ${error.message}`);
      console.error('❌ Error en validación INSERT:', error);
    }

    return validation;
  }

  /**
   * 🔄 VALIDAR ANTES DE UPDATE
   */
  async validateBeforeUpdate(tableName, data, whereClause) {
    //console.log(`🔍 Validando datos antes de UPDATE en ${tableName}`);
    
    const validation = {
      table: tableName,
      operation: 'UPDATE',
      timestamp: Date.now(),
      valid: true,
      errors: [],
      warnings: [],
      where_clause: whereClause,
      data_preview: this.sanitizeDataForLog(data)
    };

    try {
      // 1. Validar que el WHERE clause sea válido
      const whereValidation = this.validateWhereClause(whereClause);
      if (!whereValidation.valid) {
        validation.errors.push(...whereValidation.errors);
        validation.valid = false;
        return validation;
      }

      // 2. Validar que el registro existe
      const existenceValidation = await this.validateRecordExists(tableName, whereClause);
      if (!existenceValidation.exists) {
        validation.errors.push(`Registro a actualizar no existe: ${JSON.stringify(whereClause)}`);
        validation.valid = false;
      }

      // 3. Validar datos a actualizar
      const rules = this.validationRules.get(tableName);
      if (rules) {
        // Validar campos que se están actualizando
        if (rules.field_validations) {
          const fieldValidation = this.validateFieldFormats(data, rules.field_validations, 0);
          validation.errors.push(...fieldValidation.errors);
          validation.warnings.push(...fieldValidation.warnings);
        }
        
        // Validar integridad referencial para campos que se actualizan
        if (rules.referential_integrity) {
          const refValidation = await this.validateReferentialIntegrity(data, rules.referential_integrity, 0);
          validation.errors.push(...refValidation.errors);
          validation.warnings.push(...refValidation.warnings);
        }
      }
      
      validation.valid = validation.errors.length === 0;
      await this.logValidationResults(validation);
      
    } catch (error) {
      validation.valid = false;
      validation.errors.push(`Error interno validación UPDATE: ${error.message}`);
      console.error('❌ Error en validación UPDATE:', error);
    }

    return validation;
  }

  /**
   * 📋 VALIDAR CAMPOS REQUERIDOS
   */
  validateRequiredFields(record, requiredFields, recordIndex = 0) {
    const validation = { errors: [], warnings: [] };
    
    requiredFields.forEach(field => {
      const value = record[field];
      
      if (value === undefined || value === null || value === '') {
        validation.errors.push(`Campo requerido faltante en registro ${recordIndex}: ${field}`);
      } else if (typeof value === 'string' && value.trim() === '') {
        validation.errors.push(`Campo requerido vacío en registro ${recordIndex}: ${field}`);
      }
    });
    
    return validation;
  }

  /**
   * 🔤 VALIDAR FORMATO DE CAMPOS
   */
  validateFieldFormats(record, fieldValidations, recordIndex = 0) {
    const validation = { errors: [], warnings: [] };
    
    Object.entries(fieldValidations).forEach(([fieldName, rules]) => {
      const value = record[fieldName];
      
      // Skip validación si campo no está presente y no es requerido
      if (!rules.required && (value === undefined || value === null)) {
        return;
      }
      
      switch (rules.type) {
        case 'email':
          if (value && !this.isValidEmail(value)) {
            validation.errors.push(`Email inválido en registro ${recordIndex}: ${fieldName} = "${value}"`);
          }
          break;
          
        case 'rut':
          if (value && !this.isValidRUT(value)) {
            validation.errors.push(`RUT inválido en registro ${recordIndex}: ${fieldName} = "${value}"`);
          }
          break;
          
        case 'phone':
          if (value && !this.isValidPhone(value)) {
            validation.warnings.push(`Teléfono formato cuestionable en registro ${recordIndex}: ${fieldName} = "${value}"`);
          }
          break;
          
        case 'string':
          if (value && rules.minLength && value.length < rules.minLength) {
            validation.errors.push(`Campo muy corto en registro ${recordIndex}: ${fieldName} debe tener al menos ${rules.minLength} caracteres`);
          }
          if (value && rules.maxLength && value.length > rules.maxLength) {
            validation.warnings.push(`Campo muy largo en registro ${recordIndex}: ${fieldName} tiene ${value.length} caracteres (max: ${rules.maxLength})`);
          }
          break;
      }
    });
    
    return validation;
  }

  /**
   * 🔗 VALIDAR INTEGRIDAD REFERENCIAL
   */
  async validateReferentialIntegrity(record, refRules, recordIndex = 0) {
    const validation = { errors: [], warnings: [] };
    
    for (const [fieldName, refRule] of Object.entries(refRules)) {
      const value = record[fieldName];
      
      // Skip si es nullable y no hay valor
      if (refRule.nullable && (!value || value === null)) {
        continue;
      }
      
      if (value) {
        try {
          // Verificar que la referencia existe
          const { supabase } = await import('../config/supabaseConfig');
          const { count, error } = await supabase
            .from(refRule.references)
            .select(refRule.field, { count: 'exact', head: true })
            .eq(refRule.field, value);
          
          if (error) {
            validation.warnings.push(`No se pudo verificar referencia en registro ${recordIndex}: ${fieldName} → ${refRule.references}.${refRule.field}`);
          } else if (count === 0) {
            validation.errors.push(`Referencia inexistente en registro ${recordIndex}: ${fieldName}=${value} no existe en ${refRule.references}.${refRule.field}`);
          }
          
        } catch (error) {
          validation.warnings.push(`Error verificando referencia ${fieldName}: ${error.message}`);
        }
      }
    }
    
    return validation;
  }

  /**
   * 💼 VALIDAR REGLAS DE NEGOCIO
   */
  async validateBusinessRules(tableName, record, businessRules, recordIndex = 0) {
    const validation = { errors: [], warnings: [] };
    
    for (const rule of businessRules) {
      try {
        const result = await this.applyBusinessRule(tableName, record, rule.rule, recordIndex);
        
        if (!result.valid) {
          if (rule.critical) {
            validation.errors.push(`Regla crítica violada en registro ${recordIndex}: ${result.message}`);
          } else {
            validation.warnings.push(`Regla de negocio violada en registro ${recordIndex}: ${result.message}`);
          }
        }
        
      } catch (error) {
        validation.warnings.push(`Error evaluando regla ${rule.rule}: ${error.message}`);
      }
    }
    
    return validation;
  }

  /**
   * 💼 APLICAR REGLA DE NEGOCIO
   */
  async applyBusinessRule(tableName, record, ruleName, recordIndex) {
    switch (ruleName) {
      case 'unique_rut':
        return await this.validateUniqueRUT(record, recordIndex);
        
      case 'unique_rat_per_activity_per_tenant':
        return await this.validateUniqueRATPerActivity(record, recordIndex);
        
      case 'complete_dpo_info':
        return this.validateCompleteDPOInfo(record, recordIndex);
        
      case 'valid_risk_level':
        return this.validateRiskLevel(record, recordIndex);
        
      default:
        return { valid: true, message: `Regla ${ruleName} no implementada` };
    }
  }

  /**
   * 🆔 VALIDAR RUT ÚNICO
   */
  async validateUniqueRUT(record, recordIndex) {
    if (!record.rut) {
      return { valid: true, message: 'No hay RUT para validar' };
    }
    
    try {
      const { supabase } = await import('../config/supabaseConfig');
      const { count } = await supabase
        .from('organizaciones')
        .select('rut', { count: 'exact', head: true })
        .eq('rut', record.rut);
      
      if (count > 0) {
        return { valid: false, message: `RUT ${record.rut} ya existe en el sistema` };
      }
      
      return { valid: true, message: 'RUT único validado' };
      
    } catch (error) {
      return { valid: true, message: `No se pudo validar unicidad RUT: ${error.message}` };
    }
  }

  /**
   * 🎯 VALIDAR RAT ÚNICO POR ACTIVIDAD
   */
  async validateUniqueRATPerActivity(record, recordIndex) {
    if (!record.nombre_actividad || !record.tenant_id) {
      return { valid: true, message: 'Datos insuficientes para validar unicidad RAT' };
    }
    
    try {
      const { supabase } = await import('../config/supabaseConfig');
      const { count } = await supabase
        .from('mapeo_datos_rat')
        .select('id', { count: 'exact', head: true })
        .eq('nombre_actividad', record.nombre_actividad)
        .eq('tenant_id', record.tenant_id);
      
      if (count > 0) {
        return { valid: false, message: `Ya existe RAT para actividad "${record.nombre_actividad}" en este tenant` };
      }
      
      return { valid: true, message: 'RAT único por actividad validado' };
      
    } catch (error) {
      return { valid: true, message: `No se pudo validar unicidad RAT: ${error.message}` };
    }
  }

  /**
   * 👨‍💼 VALIDAR INFO DPO COMPLETA
   */
  validateCompleteDPOInfo(record, recordIndex) {
    const dpoFields = ['dpo_nombre', 'dpo_email'];
    const missingFields = dpoFields.filter(field => !record[field] || record[field].trim() === '');
    
    if (missingFields.length > 0) {
      return { valid: false, message: `Información DPO incompleta: faltan ${missingFields.join(', ')}` };
    }
    
    return { valid: true, message: 'Información DPO completa' };
  }

  /**
   * 📊 VALIDAR NIVEL DE RIESGO
   */
  validateRiskLevel(record, recordIndex) {
    if (record.nivel_riesgo) {
      const validLevels = ['BAJO', 'MEDIO', 'ALTO', 'CRITICO'];
      if (!validLevels.includes(record.nivel_riesgo)) {
        return { valid: false, message: `Nivel de riesgo inválido: ${record.nivel_riesgo}` };
      }
    }
    
    return { valid: true, message: 'Nivel de riesgo válido' };
  }

  /**
   * 🔍 VALIDAR WHERE CLAUSE
   */
  validateWhereClause(whereClause) {
    const validation = { valid: true, errors: [] };
    
    if (!whereClause || typeof whereClause !== 'object') {
      validation.valid = false;
      validation.errors.push('WHERE clause inválido o faltante');
      return validation;
    }
    
    // Validar que tenga al menos un campo identificador
    const hasId = whereClause.id !== undefined;
    const hasUniqueField = Object.keys(whereClause).some(key => 
      ['id', 'rut', 'email'].includes(key)
    );
    
    if (!hasUniqueField) {
      validation.valid = false;
      validation.errors.push('WHERE clause debe incluir campo identificador único (id, rut, email)');
    }
    
    // Validar que no tenga valores undefined
    Object.entries(whereClause).forEach(([key, value]) => {
      if (value === undefined || value === 'undefined') {
        validation.valid = false;
        validation.errors.push(`Campo ${key} tiene valor undefined en WHERE clause`);
      }
    });
    
    return validation;
  }

  /**
   * 🔍 VALIDAR QUE REGISTRO EXISTE
   */
  async validateRecordExists(tableName, whereClause) {
    try {
      const { supabase } = await import('../config/supabaseConfig');
      
      let query = supabase.from(tableName).select('id', { count: 'exact', head: true });
      
      // Aplicar condiciones WHERE
      Object.entries(whereClause).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
      
      const { count, error } = await query;
      
      if (error) {
        return { exists: false, error: error.message };
      }
      
      return { exists: count > 0, count };
      
    } catch (error) {
      return { exists: false, error: error.message };
    }
  }

  /**
   * 🧹 SANITIZAR DATOS PARA LOG
   */
  sanitizeDataForLog(data) {
    const sanitized = { ...data };
    
    // Remover campos sensibles del log
    const sensitiveFields = ['password', 'token', 'secret', 'key'];
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '***HIDDEN***';
      }
    });
    
    // Truncar campos muy largos
    Object.keys(sanitized).forEach(key => {
      if (typeof sanitized[key] === 'string' && sanitized[key].length > 100) {
        sanitized[key] = sanitized[key].substring(0, 100) + '...';
      }
    });
    
    return sanitized;
  }

  /**
   * 📝 LOG RESULTADOS VALIDACIÓN - ARCHIVO TXT
   */
  async logValidationResults(validation) {
    if (validation.valid) {
      //console.log(`✅ Validación ${validation.operation} exitosa para ${validation.table}`);
    } else {
      console.group(`❌ Validación ${validation.operation} FALLÓ para ${validation.table}`);
      validation.errors.forEach((error, index) => {
        console.error(`${index + 1}. ${error}`);
      });
      console.groupEnd();
      
      // Escribir errores de validación a archivo TXT
      await fileErrorLogger.logValidationError(
        validation.table,
        validation.operation,
        validation
      );
    }
    
    if (validation.warnings.length > 0) {
      console.group(`⚠️ Advertencias validación ${validation.table}`);
      validation.warnings.forEach((warning, index) => {
        //console.warn(`${index + 1}. ${warning}`);
      });
      console.groupEnd();
    }
    
    // Almacenar para estadísticas
    this.integrityChecks.push(validation);
    if (!validation.valid) {
      this.validationErrors.push(validation);
    }
    
    // Limpiar historiales antiguos
    if (this.integrityChecks.length > 200) {
      this.integrityChecks = this.integrityChecks.slice(-150);
    }
    if (this.validationErrors.length > 100) {
      this.validationErrors = this.validationErrors.slice(-80);
    }
  }

  /**
   * ✅ HELPERS DE VALIDACIÓN
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isValidRUT(rut) {
    // Validación básica RUT chileno
    const rutRegex = /^(\d{1,2}\.?\d{3}\.?\d{3}-[\dkK]|\d{7,8}-[\dkK])$/;
    return rutRegex.test(rut.replace(/\s/g, ''));
  }

  isValidPhone(phone) {
    // Validación básica teléfono
    const phoneRegex = /^(\+56|56)?\s?[2-9]\d{8}$|^(\+56|56)?\s?[2-9]\d{7}$/;
    return phoneRegex.test(phone.replace(/[\s-]/g, ''));
  }

  /**
   * 📊 GENERAR REPORTE INTEGRIDAD
   */
  generateIntegrityReport() {
    return {
      timestamp: Date.now(),
      total_validations: this.integrityChecks.length,
      validation_errors: this.validationErrors.length,
      tables_with_rules: Array.from(this.validationRules.keys()),
      recent_validations: this.integrityChecks.slice(-10),
      error_summary: this.summarizeErrors()
    };
  }

  /**
   * 📋 RESUMIR ERRORES
   */
  summarizeErrors() {
    const summary = {};
    
    this.validationErrors.forEach(error => {
      const table = error.table || 'unknown';
      if (!summary[table]) {
        summary[table] = { count: 0, types: {} };
      }
      
      summary[table].count++;
      
      const errorType = error.type || 'unknown';
      summary[table].types[errorType] = (summary[table].types[errorType] || 0) + 1;
    });
    
    return summary;
  }
}

// Instancia global
const dataIntegrityValidator = new DataIntegrityValidator();

// Hacer disponible globalmente
window.dataIntegrityValidator = dataIntegrityValidator;
window.validateData = (tableName, data, operation = 'INSERT') => {
  if (operation === 'INSERT') {
    return dataIntegrityValidator.validateBeforeInsert(tableName, data);
  } else if (operation === 'UPDATE') {
    return dataIntegrityValidator.validateBeforeUpdate(tableName, data.values, data.where);
  }
};

export default dataIntegrityValidator;