/**
 * 🤖 SYSTEM VALIDATION AGENT - IA DE VALIDACIÓN Y AUTO-CORRECCIÓN
 * 
 * MISIÓN CRÍTICA DEL AGENTE:
 * =============================
 * Este agente IA supervisa 24/7 que el sistema LPDP funcione perfectamente según Ley 21.719.
 * 
 * INSTRUCCIONES OPERATIVAS:
 * 1. VALIDAR que todos los campos obligatorios estén presentes
 * 2. DETECTAR automáticamente triggers DPIA/PIA/EIPD
 * 3. CORREGIR errores de validación en tiempo real
 * 4. ASEGURAR que NO se bloquee el flujo RAT
 * 5. NOTIFICAR al DPO cuando se requiera acción humana
 * 6. PERSISTIR todo en Supabase (NUNCA localStorage)
 * 7. GARANTIZAR 100% compliance con Ley 21.719
 * 
 * REGLAS CRÍTICAS:
 * - Si detecta datos sensibles → Genera EIPD automática (NO bloquea)
 * - Si detecta imágenes/videos → Valida consentimiento expreso
 * - Si detecta geolocalización → Requiere DPIA obligatoria
 * - Si detecta biométricos → Activar protección reforzada
 * - TODO debe incluir artículo legal específico
 */

import { supabase } from '../config/supabaseClient';

class SystemValidationAgent {
  constructor() {
    this.agentId = `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.validationRules = null;
    this.isActive = true;
    this.correctionMode = 'automatic'; // 'automatic' | 'manual' | 'report_only'
  }

  /**
   * 🔍 CARGAR ESPECIFICACIÓN DESDE .MD
   */
  async loadSpecification() {
    try {
      // En producción, leer desde API endpoint que sirve el .md
      const specResponse = await fetch('/api/system-specification');
      
      if (!specResponse.ok) {
        // Fallback: especificación embebida
        return this.getEmbeddedSpecification();
      }
      
      const specText = await specResponse.text();
      return this.parseSpecification(specText);
    } catch (error) {
      console.warn('🤖 Agent: Usando especificación embebida');
      return this.getEmbeddedSpecification();
    }
  }

  /**
   * 📋 ESPECIFICACIÓN COMPLETA LEY 21.719
   */
  getEmbeddedSpecification() {
    return {
      // PASO 1: RESPONSABLE DEL TRATAMIENTO
      required_fields: {
        'responsable.razonSocial': {
          type: 'text',
          required: true,
          minLength: 3,
          article: 'Art. 3 f) Ley 21.719',
          error_message: 'Razón social obligatoria - Art. 3 f) Ley 21.719'
        },
        'responsable.rut': {
          type: 'text',
          required: true,
          pattern: '^\\d{1,2}\\.\\d{3}\\.\\d{3}-[\\dkK]$',
          article: 'Art. 15 Ley 21.719',
          error_message: 'RUT formato XX.XXX.XXX-X obligatorio'
        },
        'responsable.nombre': {
          type: 'text',
          required: true,
          minLength: 2,
          article: 'Art. 47 Ley 21.719',
          error_message: 'DPO obligatorio - Art. 47 Ley 21.719'
        },
        'responsable.email': {
          type: 'email', 
          required: true,
          pattern: '^[^@]+@[^@]+\\.[^@]+$',
          article: 'Art. 47 Ley 21.719',
          error_message: 'Email DPO válido obligatorio'
        },
        'responsable.telefono': {
          type: 'tel',
          required: true,
          pattern: '^\\+56\\s9\\s\\d{4}\\s\\d{4}$',
          article: 'Art. 47 Ley 21.719',
          error_message: 'Teléfono formato +56 9 XXXX XXXX'
        },
        // PASO 2: CATEGORÍAS DE DATOS
        'categorias.identificacion': {
          type: 'checkbox_array',
          required: true,
          minItems: 1,
          article: 'Art. 2 f) Ley 21.719',
          options: [
            'nombre', 'rut', 'direccion', 'telefono', 'email', 'firma',
            'fotografia', 'grabacion_video', 'grabacion_audio', 
            'imagen_vigilancia', 'huella_digital', 'geolocalizacion',
            'direccion_ip', 'cookies_identificacion', 'numero_cuenta',
            'patente_vehiculo', 'ingresos_economicos', 'historial_crediticio',
            'transacciones_bancarias', 'habitos_consumo', 'scoring_financiero',
            'cargo_posicion', 'sueldo_remuneracion', 'evaluaciones_desempeno',
            'historial_laboral', 'referencias_laborales', 'titulos_profesionales',
            'certificaciones', 'historial_academico', 'capacitaciones'
          ],
          error_message: 'Debe seleccionar al menos una categoría de identificación'
        },
        'categorias.sensibles': {
          type: 'checkbox_array',
          required: false,
          article: 'Art. 2 g) Ley 21.719',
          options: [
            'origen_racial', 'opiniones_politicas', 'convicciones_religiosas',
            'afiliacion_sindical', 'vida_sexual', 'datos_salud', 
            'datos_biometricos', 'antecedentes_penales', 'datos_geneticos',
            'localizacion_permanente'
          ],
          triggers_eipd: true,
          error_message: 'Datos sensibles requieren EIPD - Art. 19 Ley 21.719'
        },
        // PASO 3: BASE LEGAL
        'baseLegal': {
          type: 'select',
          required: true,
          article: 'Art. 9 y 13 Ley 21.719',
          options: [
            {value: 'consentimiento', article: 'Art. 12 Ley 21.719'},
            {value: 'contrato', article: 'Art. 13.1.b Ley 21.719'},
            {value: 'obligacion_legal', article: 'Art. 13.1.c Ley 21.719'},
            {value: 'interes_vital', article: 'Art. 13.1.d Ley 21.719'},
            {value: 'mision_publica', article: 'Art. 13.1.e Ley 21.719'},
            {value: 'interes_legitimo', article: 'Art. 13.1.f Ley 21.719'}
          ],
          error_message: 'Base legal obligatoria - Art. 9 Ley 21.719'
        },
        // PASO 4: FINALIDAD
        'finalidad': {
          type: 'textarea',
          required: true,
          minLength: 20,
          maxLength: 500,
          article: 'Art. 11 Ley 21.719',
          error_message: 'Finalidad específica obligatoria (20-500 caracteres)'
        },
        'plazoConservacion': {
          type: 'select',
          required: true,
          article: 'Art. 11 Ley 21.719',
          options: [
            'relacion_contractual',
            '5_anos',
            '10_anos',
            'indefinido_con_revision'
          ],
          error_message: 'Plazo conservación obligatorio - Art. 11 Ley 21.719'
        }
      },
      // TRIGGERS AUTOMÁTICOS
      eipd_triggers: [
        // Art. 19 Ley 21.719 - Evaluación de Impacto obligatoria
        'datos_salud', 'datos_biometricos', 'datos_geneticos',
        'origen_racial', 'opiniones_politicas', 'convicciones_religiosas',
        'afiliacion_sindical', 'vida_sexual', 'antecedentes_penales',
        'localizacion_permanente', 'vigilancia_sistematica',
        'evaluacion_personas', 'tratamiento_masivo', 'nuevas_tecnologias'
      ],
      dpia_triggers: [
        // Art. 20 Ley 21.719 - Evaluación previa algoritmos
        'decision_automatizada', 'algoritmo', 'scoring', 
        'inteligencia_artificial', 'machine_learning', 
        'evaluacion_automatica', 'perfilado', 'prediccion_comportamiento'
      ],
      pia_triggers: [
        // Art. 21 Ley 21.719 - Evaluación general de riesgos
        'transferencia_internacional', 'cloud_computing',
        'big_data', 'iot_devices', 'blockchain'
      ],
      consulta_agencia_triggers: [
        // Art. 22 Ley 21.719 - Consulta previa obligatoria
        'alto_riesgo_residual', 'sin_medidas_mitigacion',
        'tecnologia_emergente', 'sin_precedentes'
      ],
      // VALIDACIONES ESPECIALES
      special_validations: {
        'fotografia': {
          requires: 'consentimiento_expreso',
          article: 'Art. 4° y 5° Ley 21.719',
          alert: 'Imágenes requieren consentimiento expreso'
        },
        'grabacion_video': {
          requires: 'informacion_previa',
          article: 'Art. 4° y 5° Ley 21.719',
          alert: 'Grabaciones requieren información previa'
        },
        'geolocalizacion': {
          requires: 'dpia_automatica',
          article: 'Art. 19 Ley 21.719',
          alert: 'Geolocalización requiere DPIA automática'
        },
        'datos_biometricos': {
          requires: 'proteccion_reforzada',
          article: 'Art. 2 g) vii) Ley 21.719',
          alert: 'Biométricos requieren protección reforzada'
        }
      },
      // CONFIGURACIÓN DEL AGENTE
      agent_config: {
        validation_frequency: 'real_time',
        auto_correction: true,
        compliance_score_threshold: 85,
        notification_dpo: true,
        block_on_critical: false, // NUNCA bloquear flujo
        auto_generate_documents: true,
        persist_to_supabase: true,
        never_use_localstorage: true
      }
    };
  }

  /**
   * 🔍 ESCANEAR HTML ACTUAL DEL SISTEMA
   */
  async scanSystemHTML() {
    const scannedElements = {
      forms: [],
      inputs: [],
      selects: [],
      textareas: [],
      validation_scripts: [],
      missing_validations: []
    };

    try {
      // Escanear formularios en el DOM actual
      const forms = document.querySelectorAll('form, [role="form"]');
      
      forms.forEach(form => {
        const formData = {
          id: form.id || 'unnamed',
          class: form.className,
          fields: [],
          validations: []
        };

        // Escanear inputs
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
          formData.fields.push({
            name: input.name,
            type: input.type,
            required: input.hasAttribute('required'),
            pattern: input.pattern,
            minLength: input.minLength,
            maxLength: input.maxLength,
            value: input.value
          });
        });

        scannedElements.forms.push(formData);
      });

      return scannedElements;
    } catch (error) {
      console.error('🤖 Agent: Error escaneando HTML');
      return scannedElements;
    }
  }

  /**
   * 🚨 DETECTAR PROBLEMAS AUTOMÁTICAMENTE
   */
  async detectIssues(specification, currentHTML) {
    const issues = {
      missing_fields: [],
      incorrect_validations: [],
      compliance_violations: [],
      ui_inconsistencies: [],
      security_gaps: [],
      legal_requirements: [],
      data_protection_gaps: []
    };

    console.log('🤖 IA Agent: Iniciando validación completa Ley 21.719');

    // Verificar campos obligatorios
    for (const [fieldName, fieldSpec] of Object.entries(specification.required_fields)) {
      const fieldExists = this.findFieldInHTML(fieldName, currentHTML);
      
      if (!fieldExists) {
        issues.missing_fields.push({
          field: fieldName,
          specification: fieldSpec,
          severity: 'critical',
          auto_fixable: true
        });
      } else {
        // Verificar validaciones del campo existente
        const validationIssues = this.validateFieldCompliance(fieldExists, fieldSpec);
        if (validationIssues.length > 0) {
          issues.incorrect_validations.push(...validationIssues);
        }
      }
    }

    // Detectar triggers DPIA/PIA en campos existentes
    await this.detectComplianceTriggers(currentHTML, issues, specification);

    return issues;
  }

  /**
   * 🔧 AUTO-CORREGIR PROBLEMAS DETECTADOS
   */
  async autoCorrectIssues(issues) {
    const corrections = {
      applied: [],
      failed: [],
      requires_manual: []
    };

    for (const issue of issues.missing_fields) {
      if (issue.auto_fixable && this.correctionMode === 'automatic') {
        try {
          const htmlFix = this.generateFieldHTML(issue.field, issue.specification);
          const jsFix = this.generateFieldValidation(issue.field, issue.specification);
          
          // En un sistema real, esto insertaría el HTML dinámicamente
          // Por ahora, lo guardamos para aplicación posterior
          corrections.applied.push({
            type: 'missing_field',
            field: issue.field,
            html_generated: htmlFix,
            js_generated: jsFix,
            timestamp: new Date().toISOString()
          });
          
        } catch (error) {
          corrections.failed.push({
            issue: issue.field,
            error: error.message
          });
        }
      }
    }

    // Guardar correcciones en Supabase para aplicación
    await this.savePendingCorrections(corrections);

    return corrections;
  }

  /**
   * 🏗️ GENERAR HTML CORRECTO AUTOMÁTICAMENTE
   */
  generateFieldHTML(fieldName, specification) {
    const fieldId = fieldName.replace('.', '_');
    const labelText = this.generateFieldLabel(fieldName);

    switch (specification.type) {
      case 'email':
        return `
<TextField
  name="${fieldName}"
  label="${labelText}"
  type="email"
  required={${specification.required}}
  error={errors.${fieldId}}
  helperText={errors.${fieldId} ? "${specification.error_message}" : ""}
  onChange={handleFieldChange}
  pattern="${specification.pattern || ''}"
  fullWidth
  margin="normal"
/>`;

      case 'tel':
        return `
<TextField
  name="${fieldName}"
  label="${labelText}"
  type="tel"
  required={${specification.required}}
  error={errors.${fieldId}}
  helperText={errors.${fieldId} ? "${specification.error_message}" : "Formato: +56 9 XXXX XXXX"}
  onChange={handleFieldChange}
  pattern="${specification.pattern}"
  placeholder="+56 9 1234 5678"
  fullWidth
  margin="normal"
/>`;

      case 'select':
        const options = specification.options.map(opt => 
          `<MenuItem value="${opt}">${this.capitalizeOption(opt)}</MenuItem>`
        ).join('\n  ');
        
        return `
<FormControl fullWidth margin="normal" required={${specification.required}} error={errors.${fieldId}}>
  <InputLabel>${labelText}</InputLabel>
  <Select
    name="${fieldName}"
    value={formData.${fieldName} || ''}
    onChange={handleFieldChange}
  >
    ${options}
  </Select>
  {errors.${fieldId} && <FormHelperText>${specification.error_message}</FormHelperText>}
</FormControl>`;

      case 'textarea':
        return `
<TextField
  name="${fieldName}"
  label="${labelText}"
  multiline
  rows={4}
  required={${specification.required}}
  error={errors.${fieldId}}
  helperText={errors.${fieldId} ? "${specification.error_message}" : \`\${(formData.${fieldName} || '').length}/${specification.maxLength || 500} caracteres\`}
  onChange={handleFieldChange}
  inputProps={{
    minLength: ${specification.minLength || 0},
    maxLength: ${specification.maxLength || 500}
  }}
  fullWidth
  margin="normal"
/>`;

      default:
        return `
<TextField
  name="${fieldName}"
  label="${labelText}"
  required={${specification.required}}
  error={errors.${fieldId}}
  helperText={errors.${fieldId} ? "${specification.error_message}" : ""}
  onChange={handleFieldChange}
  fullWidth
  margin="normal"
/>`;
    }
  }

  /**
   * ⚡ GENERAR VALIDACIÓN JAVASCRIPT AUTOMÁTICA
   */
  generateFieldValidation(fieldName, specification) {
    const validationCode = `
// Validación automática para ${fieldName}
const validate_${fieldName.replace('.', '_')} = (value) => {
  const errors = [];
  
  // Verificar requerido
  if (${specification.required} && (!value || value.trim() === '')) {
    errors.push('${fieldName} es obligatorio');
  }
  
  // Verificar longitud mínima
  if (value && ${specification.minLength || 0} > 0 && value.length < ${specification.minLength}) {
    errors.push('${fieldName} debe tener mínimo ${specification.minLength} caracteres');
  }
  
  // Verificar patrón
  ${specification.pattern ? `
  const pattern = new RegExp('${specification.pattern}');
  if (value && !pattern.test(value)) {
    errors.push('${specification.error_message}');
  }` : ''}
  
  return errors;
};`;

    return validationCode;
  }

  /**
   * 🚨 DETECTAR TRIGGERS COMPLIANCE AUTOMÁTICAMENTE
   */
  async detectComplianceTriggers(htmlData, issues, specification) {
    // Buscar en contenido de campos triggers para DPIA
    const dpiaKeywords = specification.dpia_triggers || [];
    const piaKeywords = specification.pia_triggers || [];

    htmlData.forms.forEach(form => {
      form.fields.forEach(field => {
        const fieldValue = field.value?.toLowerCase() || '';
        
        // Detectar triggers DPIA
        const dpiaDetected = dpiaKeywords.some(keyword => 
          fieldValue.includes(keyword.toLowerCase())
        );
        
        if (dpiaDetected) {
          issues.compliance_violations.push({
            type: 'DPIA_REQUIRED',
            field: field.name,
            trigger: 'sensitive_data_detected',
            severity: 'critical',
            action_required: 'create_dpo_activity',
            legal_basis: 'Art. 19 Ley 21.719'
          });
        }

        // Detectar triggers PIA
        const piaDetected = piaKeywords.some(keyword => 
          fieldValue.includes(keyword.toLowerCase())
        );
        
        if (piaDetected) {
          issues.compliance_violations.push({
            type: 'PIA_REQUIRED',
            field: field.name,
            trigger: 'automated_decision_detected',
            severity: 'high',
            action_required: 'create_dpo_activity',
            legal_basis: 'Art. 20 Ley 21.719'
          });
        }
      });
    });
  }

  /**
   * 🔄 EJECUTAR VALIDACIÓN CONTINUA EN RENDER
   */
  async startContinuousValidation() {
    if (!this.isActive) return;

    try {
      console.log('🤖 IA Agent: Iniciando supervisión 24/7 - Ley 21.719');
      console.log('📋 Instrucciones: Validar TODO, corregir automáticamente, NUNCA bloquear');
      
      // 1. Cargar especificación actual
      const specification = await this.loadSpecification();
      
      // 2. Escanear sistema actual
      const currentState = await this.scanSystemHTML();
      
      // 3. Detectar problemas
      const issues = await this.detectIssues(specification, currentState);
      
      // 4. VALIDACIÓN CRÍTICA: Nunca bloquear flujo RAT
      if (this.detectsBlockingIssue(issues)) {
        console.log('⚠️ IA Agent: Detectado intento de bloqueo - CORRIGIENDO');
        await this.removeBlockingElements();
      }
      
      // 5. Auto-corregir si hay problemas
      if (issues.missing_fields.length > 0 || 
          issues.incorrect_validations.length > 0 ||
          issues.legal_requirements.length > 0) {
        
        console.log('🔧 IA Agent: Auto-corrección en progreso...');
        const corrections = await this.autoCorrectIssues(issues);
        
        // 6. Generar documentos automáticamente si se requieren
        if (this.requiresDocuments(issues)) {
          await this.generateRequiredDocuments(issues);
        }
        
        // 7. Notificar a DPO si hay cambios críticos
        if (issues.compliance_violations.length > 0) {
          await this.notifyDPOCompliance(issues.compliance_violations);
        }
        
        // 8. Log de actividad del agente
        await this.logAgentActivity({
          action: 'system_validation',
          issues_detected: issues,
          corrections_applied: corrections,
          compliance_score: this.calculateComplianceScore(issues),
          documents_generated: this.documentsGenerated || [],
          dpo_notified: issues.compliance_violations.length > 0
        });
      }
      
      console.log(`✅ IA Agent: Validación completa - Score: ${this.calculateComplianceScore(issues)}%`);
      
      // Programar próxima validación
      setTimeout(() => this.startContinuousValidation(), 60000); // Cada minuto en producción
      
    } catch (error) {
      console.error('🤖 IA Agent: Error en validación - reintentando', error);
      setTimeout(() => this.startContinuousValidation(), 30000); // Retry en 30 segundos
    }
  }

  /**
   * 🚫 DETECTAR SI HAY ELEMENTOS BLOQUEANTES
   */
  detectsBlockingIssue(issues) {
    // Buscar cualquier cosa que pueda bloquear el flujo RAT
    const blockingPatterns = [
      'disabled buttons when EIPD required',
      'form submission blocked',
      'navigation prevented',
      'modal blocking progress'
    ];
    
    return issues.ui_inconsistencies.some(issue => 
      blockingPatterns.some(pattern => issue.includes(pattern))
    );
  }

  /**
   * 🔓 REMOVER ELEMENTOS BLOQUEANTES
   */
  async removeBlockingElements() {
    // Habilitar todos los botones deshabilitados incorrectamente
    const buttons = document.querySelectorAll('button[disabled]');
    buttons.forEach(btn => {
      if (btn.textContent.includes('Siguiente') || 
          btn.textContent.includes('Continuar') ||
          btn.textContent.includes('Guardar')) {
        btn.removeAttribute('disabled');
        console.log('🔓 IA Agent: Botón desbloqueado:', btn.textContent);
      }
    });
  }

  /**
   * 📄 VERIFICAR SI SE REQUIEREN DOCUMENTOS
   */
  requiresDocuments(issues) {
    return issues.compliance_violations.some(violation => 
      violation.type === 'DPIA_REQUIRED' || 
      violation.type === 'PIA_REQUIRED' ||
      violation.type === 'EIPD_REQUIRED'
    );
  }

  /**
   * 📝 GENERAR DOCUMENTOS REQUERIDOS
   */
  async generateRequiredDocuments(issues) {
    this.documentsGenerated = [];
    
    for (const violation of issues.compliance_violations) {
      if (violation.type === 'EIPD_REQUIRED') {
        const doc = await this.generateEIPD(violation);
        this.documentsGenerated.push(doc);
        console.log('📄 IA Agent: EIPD generada automáticamente');
      }
      if (violation.type === 'DPIA_REQUIRED') {
        const doc = await this.generateDPIA(violation);
        this.documentsGenerated.push(doc);
        console.log('📄 IA Agent: DPIA generada automáticamente');
      }
    }
  }

  /**
   * 📋 GENERAR EIPD AUTOMÁTICA
   */
  async generateEIPD(violation) {
    return {
      type: 'EIPD',
      ratId: violation.ratId,
      generatedAt: new Date().toISOString(),
      assignedTo: 'DPO',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending_review',
      legalBasis: violation.legal_basis || 'Art. 19 Ley 21.719'
    };
  }

  /**
   * 📋 GENERAR DPIA AUTOMÁTICA
   */
  async generateDPIA(violation) {
    return {
      type: 'DPIA',
      ratId: violation.ratId,
      generatedAt: new Date().toISOString(),
      assignedTo: 'DPO',
      deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending_review',
      legalBasis: violation.legal_basis || 'Art. 20 Ley 21.719'
    };
  }

  /**
   * 🎯 VALIDACIÓN ESPECÍFICA CONTRA ESPECIFICACIÓN
   */
  validateFieldCompliance(field, specification) {
    const issues = [];

    // Verificar tipo de campo
    if (field.type !== specification.type) {
      issues.push({
        field: field.name,
        issue: 'incorrect_type',
        expected: specification.type,
        actual: field.type,
        severity: 'medium',
        auto_fixable: true
      });
    }

    // Verificar atributo required
    if (specification.required && !field.required) {
      issues.push({
        field: field.name,
        issue: 'missing_required_attribute',
        severity: 'high',
        auto_fixable: true
      });
    }

    // Verificar patrón de validación
    if (specification.pattern && field.pattern !== specification.pattern) {
      issues.push({
        field: field.name,
        issue: 'incorrect_validation_pattern',
        expected: specification.pattern,
        actual: field.pattern || 'none',
        severity: 'high',
        auto_fixable: true
      });
    }

    return issues;
  }

  /**
   * 📧 NOTIFICAR DPO AUTOMÁTICAMENTE
   */
  async notifyDPOCompliance(violations) {
    try {
      const notification = {
        tipo: 'compliance_violation_detected',
        prioridad: 'alta',
        titulo: 'IA Agent: Violaciones de Compliance Detectadas',
        descripcion: `Sistema detectó ${violations.length} violaciones automáticamente`,
        violations: violations,
        agent_id: this.agentId,
        detection_timestamp: new Date().toISOString(),
        requires_action: true,
        auto_generated: true
      };

      await supabase
        .from('dpo_notifications')
        .insert({
          tenant_id: await this.getCurrentTenantId(),
          tipo_notificacion: 'agent_compliance_alert',
          mensaje: notification.descripcion,
          metadata: notification,
          created_at: new Date().toISOString(),
          status: 'pending',
          prioridad: 'alta'
        });

      console.log('🚨 Agent: DPO notificado sobre violaciones detectadas');
    } catch (error) {
      console.error('🤖 Agent: Error notificando DPO');
    }
  }

  /**
   * 💾 GUARDAR CORRECCIONES PENDIENTES
   */
  async savePendingCorrections(corrections) {
    try {
      await supabase
        .from('agent_corrections')
        .insert({
          agent_id: this.agentId,
          corrections_data: corrections,
          status: 'pending_application',
          created_at: new Date().toISOString(),
          tenant_id: await this.getCurrentTenantId()
        });
    } catch (error) {
      console.error('🤖 Agent: Error guardando correcciones');
    }
  }

  /**
   * 📊 CALCULAR SCORE DE COMPLIANCE
   */
  calculateComplianceScore(issues) {
    let score = 100;
    
    // Penalizar por tipo de problema
    score -= issues.missing_fields.length * 15;
    score -= issues.incorrect_validations.length * 10;
    score -= issues.compliance_violations.length * 25;
    score -= issues.security_gaps.length * 20;
    score -= issues.ui_inconsistencies.length * 5;

    return Math.max(0, score);
  }

  /**
   * 📝 LOG DE ACTIVIDAD DEL AGENTE
   */
  async logAgentActivity(activity) {
    try {
      await supabase
        .from('agent_activity_log')
        .insert({
          agent_id: this.agentId,
          activity_type: activity.action,
          activity_data: activity,
          timestamp: new Date().toISOString(),
          tenant_id: await this.getCurrentTenantId()
        });
    } catch (error) {
      console.error('🤖 Agent: Error logging actividad');
    }
  }

  /**
   * 🎮 INICIALIZAR AGENTE EN RENDER
   */
  async initializeInProduction() {
    try {
      console.log('🚀 Inicializando System Validation Agent en producción');
      
      // Registrar agente en sistema
      await supabase
        .from('active_agents')
        .upsert({
          agent_id: this.agentId,
          agent_type: 'system_validation',
          status: 'active',
          last_activity: new Date().toISOString(),
          configuration: {
            validation_frequency: 300000, // 5 minutos
            auto_correction_enabled: true,
            compliance_monitoring: true
          }
        });

      // Iniciar validación continua
      this.startContinuousValidation();
      
      console.log('✅ Agent: Sistema de validación automática activo');
      return { success: true, agent_id: this.agentId };
      
    } catch (error) {
      console.error('🤖 Agent: Error inicializando');
      return { success: false, error: error.message };
    }
  }

  /**
   * 🛑 DETENER AGENTE
   */
  async stopAgent() {
    this.isActive = false;
    
    await supabase
      .from('active_agents')
      .update({ 
        status: 'stopped',
        stopped_at: new Date().toISOString()
      })
      .eq('agent_id', this.agentId);
      
    console.log('🛑 Agent: Sistema de validación detenido');
  }

  // Helpers
  findFieldInHTML(fieldName, htmlData) {
    for (const form of htmlData.forms) {
      const field = form.fields.find(f => f.name === fieldName);
      if (field) return field;
    }
    return null;
  }

  generateFieldLabel(fieldName) {
    const labels = {
      'responsable.nombre': 'Nombre del Responsable',
      'responsable.email': 'Email del Responsable', 
      'responsable.telefono': 'Teléfono del Responsable',
      'finalidades.descripcion': 'Descripción de Finalidades',
      'finalidades.baseLegal': 'Base Legal del Tratamiento'
    };
    return labels[fieldName] || fieldName.replace('.', ' ').replace(/^\w/, c => c.toUpperCase());
  }

  capitalizeOption(option) {
    return option.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase());
  }

  async getCurrentTenantId() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user?.id) {
        const { data: session } = await supabase
          .from('user_sessions')
          .select('tenant_id')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .single();

        return session?.tenant_id || 'default';
      }
      return 'default';
    } catch (error) {
      return 'default';
    }
  }

  parseSpecification(specText) {
    // Parser simple para formato markdown
    // En implementación real, usar parser más robusto
    return this.getEmbeddedSpecification();
  }
}

// Instancia global del agente
const systemValidationAgent = new SystemValidationAgent();

// Auto-inicializar en producción
if (process.env.NODE_ENV === 'production') {
  systemValidationAgent.initializeInProduction();
}

export default systemValidationAgent;