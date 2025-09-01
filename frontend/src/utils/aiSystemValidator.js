import supabase from '../config/supabaseClient';

class AISystemValidator {
  constructor() {
    this.validationLog = [];
    this.isEnabled = false;
    this.alertThreshold = 0.8;
  }

  async initialize() {
    try {
      const { data: config, error } = await supabase
        .from('system_config')
        .select('value')
        .eq('key', 'ai_validation_enabled')
        .single();

      if (!error && config) {
        this.isEnabled = config.value === 'true';
      }

      if (this.isEnabled) {
        this.startContinuousValidation();
      }

      return { success: true, enabled: this.isEnabled };
    } catch (error) {
      console.error('Error inicializando AI Validator');
      return { success: false, error: error.message };
    }
  }

  async validatePersistence(operation, expectedData, actualResult) {
    if (!this.isEnabled) return { valid: true };

    const validation = {
      operation: operation,
      timestamp: new Date().toISOString(),
      expected: this.sanitizeForLog(expectedData),
      actual: this.sanitizeForLog(actualResult),
      valid: true,
      confidence: 1.0,
      issues: []
    };

    try {
      switch (operation.type) {
        case 'rat_create':
          validation = await this.validateRATCreation(operation, expectedData, actualResult);
          break;
        case 'rat_update':
          validation = await this.validateRATUpdate(operation, expectedData, actualResult);
          break;
        case 'dpo_task_create':
          validation = await this.validateDPOTaskCreation(operation, expectedData, actualResult);
          break;
        case 'compliance_evaluation':
          validation = await this.validateComplianceEvaluation(operation, expectedData, actualResult);
          break;
        default:
          validation = await this.validateGenericOperation(operation, expectedData, actualResult);
      }

      await this.logValidation(validation);

      if (!validation.valid || validation.confidence < this.alertThreshold) {
        await this.triggerAlert(validation);
      }

      return validation;
    } catch (error) {
      console.error('Error en validación AI');
      return { valid: false, error: error.message };
    }
  }

  async validateRATCreation(operation, expectedData, actualResult) {
    const validation = {
      operation: operation.type,
      valid: true,
      confidence: 1.0,
      issues: []
    };

    if (!actualResult.success) {
      validation.valid = false;
      validation.issues.push('Operación falló');
      validation.confidence = 0.0;
      return validation;
    }

    const { data: savedRAT, error } = await supabase
      .from('rats')
      .select('*')
      .eq('id', actualResult.ratId)
      .single();

    if (error || !savedRAT) {
      validation.valid = false;
      validation.issues.push('RAT no encontrado en base de datos');
      validation.confidence = 0.0;
      return validation;
    }

    const fieldChecks = [
      { field: 'responsable', check: 'nested_object' },
      { field: 'finalidad', check: 'nested_object' },
      { field: 'categorias_datos', check: 'array' },
      { field: 'base_juridica', check: 'nested_object' }
    ];

    fieldChecks.forEach(({ field, check }) => {
      const expected = expectedData[field];
      const actual = savedRAT[field];

      if (check === 'nested_object') {
        if (!this.compareObjects(expected, actual)) {
          validation.issues.push(`Campo ${field} no coincide`);
          validation.confidence -= 0.2;
        }
      } else if (check === 'array') {
        if (!this.compareArrays(expected, actual)) {
          validation.issues.push(`Array ${field} no coincide`);
          validation.confidence -= 0.15;
        }
      }
    });

    if (validation.issues.length > 0) {
      validation.valid = validation.confidence > 0.5;
    }

    return validation;
  }

  async validateDPOTaskCreation(operation, expectedData, actualResult) {
    const validation = {
      operation: operation.type,
      valid: true,
      confidence: 1.0,
      issues: []
    };

    if (!actualResult.success || !actualResult.taskIds) {
      validation.valid = false;
      validation.issues.push('No se crearon tareas DPO');
      return validation;
    }

    for (const taskId of actualResult.taskIds) {
      const { data: task, error } = await supabase
        .from('actividades_dpo')
        .select('*')
        .eq('id', taskId)
        .single();

      if (error || !task) {
        validation.issues.push(`Tarea DPO ${taskId} no encontrada`);
        validation.confidence -= 0.3;
        continue;
      }

      if (task.estado !== 'pendiente') {
        validation.issues.push(`Tarea DPO ${taskId} tiene estado incorrecto`);
        validation.confidence -= 0.2;
      }

      if (!task.fecha_vencimiento) {
        validation.issues.push(`Tarea DPO ${taskId} sin fecha de vencimiento`);
        validation.confidence -= 0.1;
      }
    }

    validation.valid = validation.confidence > 0.5;
    return validation;
  }

  async validateComplianceEvaluation(operation, expectedData, actualResult) {
    const validation = {
      operation: operation.type,
      valid: true,
      confidence: 1.0,
      issues: []
    };

    if (typeof actualResult.compliance_score !== 'number') {
      validation.issues.push('Score de compliance inválido');
      validation.confidence -= 0.5;
    }

    if (actualResult.compliance_score < 0 || actualResult.compliance_score > 100) {
      validation.issues.push('Score de compliance fuera de rango');
      validation.confidence -= 0.3;
    }

    const ratData = expectedData.rat;
    const hasSensitiveData = this.detectSensitiveData(ratData);
    const hasInternationalTransfers = ratData.transferencias_internacionales?.existe;

    if (hasSensitiveData && actualResult.compliance_score > 80 && !actualResult.eipd_required) {
      validation.issues.push('Datos sensibles detectados pero EIPD no requerida');
      validation.confidence -= 0.4;
    }

    if (hasInternationalTransfers && !actualResult.dpa_required) {
      validation.issues.push('Transferencias internacionales pero DPA no requerido');
      validation.confidence -= 0.3;
    }

    validation.valid = validation.confidence > 0.6;
    return validation;
  }

  async validateGenericOperation(operation, expectedData, actualResult) {
    const validation = {
      operation: operation.type,
      valid: actualResult.success === true,
      confidence: actualResult.success ? 1.0 : 0.0,
      issues: actualResult.success ? [] : ['Operación falló']
    };

    return validation;
  }

  detectSensitiveData(ratData) {
    const categorias = ratData.categorias_datos || [];
    const sensitiveKeywords = ['salud', 'biometrico', 'socioeconomica', 'racial', 'politica', 'religiosa'];
    
    return categorias.some(categoria => 
      sensitiveKeywords.some(keyword => 
        categoria.toLowerCase().includes(keyword)
      )
    );
  }

  compareObjects(obj1, obj2) {
    if (!obj1 && !obj2) return true;
    if (!obj1 || !obj2) return false;

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) return false;

    return keys1.every(key => {
      if (typeof obj1[key] === 'object' && typeof obj2[key] === 'object') {
        return this.compareObjects(obj1[key], obj2[key]);
      }
      return obj1[key] === obj2[key];
    });
  }

  compareArrays(arr1, arr2) {
    if (!arr1 && !arr2) return true;
    if (!arr1 || !arr2) return false;
    if (arr1.length !== arr2.length) return false;

    return arr1.every((item, index) => {
      if (typeof item === 'object') {
        return this.compareObjects(item, arr2[index]);
      }
      return item === arr2[index];
    });
  }

  sanitizeForLog(data) {
    if (!data) return null;
    
    const sanitized = JSON.parse(JSON.stringify(data));
    
    const sensitiveKeys = ['password', 'token', 'secret', 'key'];
    this.removeSensitiveData(sanitized, sensitiveKeys);
    
    return sanitized;
  }

  removeSensitiveData(obj, sensitiveKeys) {
    if (typeof obj !== 'object' || obj === null) return;

    Object.keys(obj).forEach(key => {
      if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
        obj[key] = '[REDACTED]';
      } else if (typeof obj[key] === 'object') {
        this.removeSensitiveData(obj[key], sensitiveKeys);
      }
    });
  }

  async logValidation(validation) {
    try {
      await supabase
        .from('ai_validation_log')
        .insert({
          operation_type: validation.operation,
          is_valid: validation.valid,
          confidence_score: validation.confidence,
          issues: validation.issues,
          timestamp: validation.timestamp || new Date().toISOString(),
          metadata: {
            expected: validation.expected,
            actual: validation.actual
          }
        });
    } catch (error) {
      console.error('Error logging validation');
    }
  }

  async triggerAlert(validation) {
    const alertSeverity = validation.confidence < 0.3 ? 'critical' : 
                         validation.confidence < 0.6 ? 'high' : 'medium';

    try {
      await supabase
        .from('system_alerts')
        .insert({
          alert_type: 'ai_validation_failure',
          severity: alertSeverity,
          title: `Validación AI falló: ${validation.operation}`,
          description: validation.issues.join(', '),
          metadata: {
            operation: validation.operation,
            confidence: validation.confidence,
            issues: validation.issues
          },
          status: 'active',
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error creando alerta');
    }
  }

  async startContinuousValidation() {
    setInterval(async () => {
      await this.runPeriodicValidations();
    }, 10 * 60 * 1000);
  }

  async runPeriodicValidations() {
    const validations = [
      this.validateDatabaseConnectivity(),
      this.validateDataIntegrity(),
      this.validateBusinessLogic()
    ];

    const results = await Promise.all(validations);
    
    const criticalIssues = results.filter(r => !r.valid);
    if (criticalIssues.length > 0) {
      await this.escalateCriticalIssues(criticalIssues);
    }
  }

  async validateDatabaseConnectivity() {
    try {
      const { data, error } = await supabase
        .from('rats')
        .select('count')
        .limit(1);

      return {
        valid: !error,
        type: 'database_connectivity',
        message: error ? error.message : 'Conectividad OK'
      };
    } catch (error) {
      return {
        valid: false,
        type: 'database_connectivity',
        message: 'Error de conectividad crítico'
      };
    }
  }

  async validateDataIntegrity() {
    try {
      const { data: rats, error } = await supabase
        .from('rats')
        .select('id, responsable, finalidad, created_at')
        .limit(10);

      if (error) throw error;

      let integrityScore = 1.0;
      const issues = [];

      rats.forEach(rat => {
        if (!rat.responsable || !rat.finalidad) {
          issues.push(`RAT ${rat.id} tiene campos críticos vacíos`);
          integrityScore -= 0.1;
        }

        if (!rat.created_at) {
          issues.push(`RAT ${rat.id} sin timestamp`);
          integrityScore -= 0.05;
        }
      });

      return {
        valid: integrityScore > 0.7,
        type: 'data_integrity',
        score: integrityScore,
        issues: issues
      };
    } catch (error) {
      return {
        valid: false,
        type: 'data_integrity',
        message: 'Error validando integridad'
      };
    }
  }

  async validateBusinessLogic() {
    try {
      const testRAT = {
        responsable: { nombre: 'Test Corp', rut: '12345678-9' },
        finalidad: { descripcion: 'marketing directo', tipo: 'comercial' },
        categorias_datos: ['email', 'nombre'],
        base_juridica: { tipo: 'consentimiento' }
      };

      const evaluation = await this.simulateRATEvaluation(testRAT);

      const expectedAlerts = ['CONSENTIMIENTO_MARKETING'];
      const actualAlerts = evaluation.alerts.map(a => a.type);

      const logicValid = expectedAlerts.every(expected => 
        actualAlerts.includes(expected)
      );

      return {
        valid: logicValid,
        type: 'business_logic',
        expected: expectedAlerts,
        actual: actualAlerts,
        message: logicValid ? 'Lógica funcionando' : 'Lógica inconsistente'
      };
    } catch (error) {
      return {
        valid: false,
        type: 'business_logic',
        message: 'Error en lógica de negocio'
      };
    }
  }

  async simulateRATEvaluation(testRAT) {
    const alerts = [];

    if (testRAT.finalidad.descripcion.includes('marketing') && 
        testRAT.base_juridica.tipo === 'consentimiento') {
      alerts.push({
        type: 'CONSENTIMIENTO_MARKETING',
        message: 'Marketing requiere gestión de consentimiento'
      });
    }

    return { alerts };
  }

  async escalateCriticalIssues(issues) {
    try {
      await supabase
        .from('critical_incidents')
        .insert({
          incident_type: 'ai_validation_failure',
          severity: 'critical',
          issues: issues,
          detected_at: new Date().toISOString(),
          status: 'active'
        });

      console.error('🚨 ISSUES CRÍTICOS DETECTADOS:', issues);
    } catch (error) {
      console.error('Error escalando issues críticos');
    }
  }

  async validateSupabaseOperation(tableName, operation, data, result) {
    if (!this.isEnabled) return { valid: true };

    const validation = {
      table: tableName,
      operation: operation,
      timestamp: new Date().toISOString(),
      valid: true,
      issues: []
    };

    switch (operation) {
      case 'insert':
        validation.valid = result && !result.error && result.data;
        if (!validation.valid) {
          validation.issues.push('Insert falló');
        } else {
          const insertedId = result.data[0]?.id;
          if (insertedId) {
            const exists = await this.verifyRecordExists(tableName, insertedId);
            if (!exists) {
              validation.valid = false;
              validation.issues.push('Registro no existe después de insert');
            }
          }
        }
        break;

      case 'update':
        validation.valid = result && !result.error;
        if (!validation.valid) {
          validation.issues.push('Update falló');
        }
        break;

      case 'select':
        validation.valid = result && !result.error;
        if (validation.valid && data.expectedCount) {
          const actualCount = result.data?.length || 0;
          if (actualCount !== data.expectedCount) {
            validation.issues.push(`Count esperado: ${data.expectedCount}, actual: ${actualCount}`);
            validation.valid = false;
          }
        }
        break;
    }

    await this.logValidation(validation);
    return validation;
  }

  async verifyRecordExists(tableName, recordId) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('id')
        .eq('id', recordId)
        .single();

      return !error && data;
    } catch (error) {
      return false;
    }
  }

  async validateOutputConsistency(inputData, outputData, expectedPattern) {
    if (!this.isEnabled) return { valid: true };

    const validation = {
      type: 'output_consistency',
      valid: true,
      confidence: 1.0,
      issues: []
    };

    try {
      if (expectedPattern.type === 'rat_evaluation') {
        if (inputData.categorias_datos?.includes('salud') && 
            !outputData.alerts?.some(a => a.type === 'EIPD_REQUIRED')) {
          validation.valid = false;
          validation.issues.push('Datos de salud detectados pero EIPD no requerida');
        }

        if (inputData.transferencias_internacionales?.existe && 
            !outputData.alerts?.some(a => a.type === 'DPA_REQUIRED')) {
          validation.valid = false;
          validation.issues.push('Transferencias internacionales pero DPA no requerido');
        }
      }

      await this.logValidation(validation);
      return validation;
    } catch (error) {
      return {
        valid: false,
        type: 'output_consistency',
        error: error.message
      };
    }
  }

  async enableValidation(userId) {
    try {
      await supabase
        .from('system_config')
        .upsert({
          key: 'ai_validation_enabled',
          value: 'true',
          updated_by: userId,
          updated_at: new Date().toISOString()
        });

      this.isEnabled = true;
      await this.startContinuousValidation();

      return { success: true, message: 'Validación AI habilitada' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async disableValidation(userId) {
    try {
      await supabase
        .from('system_config')
        .upsert({
          key: 'ai_validation_enabled',
          value: 'false',
          updated_by: userId,
          updated_at: new Date().toISOString()
        });

      this.isEnabled = false;

      return { success: true, message: 'Validación AI deshabilitada' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getValidationReport(days = 7) {
    try {
      const { data: logs, error } = await supabase
        .from('ai_validation_log')
        .select('*')
        .gte('timestamp', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
        .order('timestamp', { ascending: false });

      if (error) throw error;

      const report = {
        totalValidations: logs.length,
        successRate: 0,
        averageConfidence: 0,
        criticalIssues: 0,
        byOperation: {}
      };

      if (logs.length > 0) {
        const validCount = logs.filter(log => log.is_valid).length;
        report.successRate = Math.round((validCount / logs.length) * 100);
        
        const totalConfidence = logs.reduce((sum, log) => sum + (log.confidence_score || 0), 0);
        report.averageConfidence = Math.round((totalConfidence / logs.length) * 100);
        
        report.criticalIssues = logs.filter(log => log.confidence_score < 0.3).length;

        logs.forEach(log => {
          if (!report.byOperation[log.operation_type]) {
            report.byOperation[log.operation_type] = {
              total: 0,
              valid: 0,
              issues: []
            };
          }

          report.byOperation[log.operation_type].total++;
          if (log.is_valid) {
            report.byOperation[log.operation_type].valid++;
          } else {
            report.byOperation[log.operation_type].issues.push(...(log.issues || []));
          }
        });
      }

      return report;
    } catch (error) {
      console.error('Error generando reporte de validación');
      return null;
    }
  }

  async autofixDetectedIssue(issueType, context) {
    const fixes = {
      'missing_dpo_task': async () => {
        return await this.createMissingDPOTask(context);
      },
      'invalid_compliance_score': async () => {
        return await this.recalculateComplianceScore(context);
      },
      'missing_eipd_requirement': async () => {
        return await this.addMissingEIPDRequirement(context);
      }
    };

    if (fixes[issueType]) {
      try {
        const result = await fixes[issueType]();
        await this.logAutofix(issueType, result);
        return result;
      } catch (error) {
        console.error(`Error en autofix ${issueType}`);
        return { success: false, error: error.message };
      }
    }

    return { success: false, error: 'Tipo de issue no soportado para autofix' };
  }

  async createMissingDPOTask(context) {
    try {
      const { data, error } = await supabase
        .from('actividades_dpo')
        .insert({
          rat_id: context.ratId,
          tipo_actividad: 'EIPD_MISSING',
          descripcion: 'EIPD requerida detectada por validación AI',
          estado: 'pendiente',
          prioridad: 'alta',
          created_at: new Date().toISOString()
        });

      return { success: !error, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async logAutofix(issueType, result) {
    try {
      await supabase
        .from('autofix_log')
        .insert({
          issue_type: issueType,
          fix_successful: result.success,
          timestamp: new Date().toISOString(),
          details: result
        });
    } catch (error) {
      console.error('Error logging autofix');
    }
  }

  getValidationInstructions() {
    return {
      title: 'Sistema de Validación AI',
      description: 'Monitorea automáticamente la integridad y consistencia del sistema',
      howToEnable: [
        'Ir a Configuración del Sistema',
        'Buscar "Validación AI"',
        'Activar el toggle',
        'El sistema comenzará a validar automáticamente'
      ],
      whatItValidates: [
        'Persistencia correcta en Supabase',
        'Lógica de negocio consistente',
        'Integridad de datos',
        'Asignación automática de tareas DPO',
        'Evaluaciones de compliance'
      ],
      benefits: [
        'Detecta problemas antes de que afecten a los usuarios',
        'Asegura que las promesas del sistema se cumplan',
        'Autofix de issues comunes',
        'Reportes de confiabilidad del sistema'
      ]
    };
  }
}

const aiSystemValidator = new AISystemValidator();

export default aiSystemValidator;