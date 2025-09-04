import { supabase } from '../config/supabaseClient';

class AISupervisor {
  constructor() {
    this.isActive = false;
    this.supervisionLevel = 'comprehensive';
    this.interventionHistory = [];
  }

  async initialize() {
    try {
      const { data: config, error } = await supabase
        .from('system_config')
        .select('value')
        .eq('key', 'ai_supervisor_enabled')
        .single();

      if (!error && config) {
        this.isActive = config.value === 'true';
      }

      if (this.isActive) {
        await this.startSupervision();
      }

      return { active: this.isActive };
    } catch (error) {
      console.error('Error inicializando AI Supervisor');
      return { active: false, error: error.message };
    }
  }

  async superviseRATCreation(ratData, userId, tenantId) {
    if (!this.isActive) return { approved: true };

    const supervision = {
      operation: 'rat_creation',
      timestamp: new Date().toISOString(),
      approved: true,
      interventions: [],
      qualityScore: 100
    };

    const businessLogicCheck = await this.validateBusinessLogic(ratData);
    if (!businessLogicCheck.valid) {
      supervision.approved = false;
      supervision.interventions.push({
        type: 'business_logic_violation',
        severity: 'critical',
        message: businessLogicCheck.message,
        autofix: businessLogicCheck.autofix
      });
      supervision.qualityScore -= 30;
    }

    const legalComplianceCheck = await this.validateLegalCompliance(ratData);
    if (!legalComplianceCheck.compliant) {
      supervision.interventions.push({
        type: 'legal_compliance_issue',
        severity: 'high',
        message: legalComplianceCheck.message,
        requiredActions: legalComplianceCheck.actions
      });
      supervision.qualityScore -= 20;
    }

    const dataQualityCheck = await this.assessDataQuality(ratData);
    if (dataQualityCheck.score < 80) {
      supervision.interventions.push({
        type: 'data_quality_concern',
        severity: 'medium',
        message: 'Calidad de datos puede mejorar',
        suggestions: dataQualityCheck.suggestions
      });
      supervision.qualityScore -= 10;
    }

    const duplicateCheck = await this.checkForIntelligentDuplicates(ratData, tenantId);
    if (duplicateCheck.hasDuplicates) {
      supervision.interventions.push({
        type: 'duplicate_detected',
        severity: duplicateCheck.severity,
        message: duplicateCheck.message,
        alternatives: duplicateCheck.alternatives
      });
      
      if (duplicateCheck.severity === 'critical') {
        supervision.approved = false;
        supervision.qualityScore -= 40;
      } else {
        supervision.qualityScore -= 15;
      }
    }

    const dpoTasksCheck = await this.assessRequiredDPOTasks(ratData);
    if (dpoTasksCheck.tasksRequired.length > 0) {
      const autoAssignment = await this.autoAssignDPOTasks(dpoTasksCheck.tasksRequired, ratData.id, tenantId);
      supervision.interventions.push({
        type: 'dpo_tasks_created',
        severity: 'info',
        message: `${autoAssignment.created} tareas DPO creadas automáticamente`,
        tasks: autoAssignment.tasks
      });
    }

    await this.logSupervision(supervision, userId, tenantId);

    if (supervision.interventions.length > 0) {
      await this.notifyInterventions(supervision.interventions, userId);
    }

    return supervision;
  }

  async validateBusinessLogic(ratData) {
    const issues = [];

    if (ratData.finalidad?.descripcion?.includes('marketing') && 
        ratData.base_juridica?.tipo !== 'consentimiento') {
      return {
        valid: false,
        message: 'Marketing directo requiere consentimiento como base jurídica',
        autofix: {
          possible: true,
          action: 'change_base_juridica',
          newValue: 'consentimiento'
        }
      };
    }

    if (ratData.categorias_datos?.some(cat => cat.includes('salud')) &&
        !ratData.medidas_seguridad?.cifrado) {
      return {
        valid: false,
        message: 'Datos de salud requieren medidas de seguridad específicas',
        autofix: {
          possible: true,
          action: 'add_security_measures',
          requiredMeasures: ['cifrado', 'acceso_restringido']
        }
      };
    }

    if (ratData.transferencias_internacionales?.existe && 
        !ratData.transferencias_internacionales?.garantias) {
      return {
        valid: false,
        message: 'Transferencias internacionales requieren garantías específicas',
        autofix: {
          possible: false,
          action: 'manual_review_required'
        }
      };
    }

    return { valid: true };
  }

  async validateLegalCompliance(ratData) {
    try {
      const { data: violations, error } = await supabase
        .rpc('check_legal_compliance', {
          rat_data: ratData
        });

      if (error) throw error;

      return {
        compliant: violations.length === 0,
        violations: violations,
        message: violations.length > 0 ? 
          `${violations.length} violaciones detectadas` : 
          'Cumplimiento legal verificado',
        actions: violations.map(v => v.required_action)
      };
    } catch (error) {
      return {
        compliant: false,
        message: 'Error validando compliance legal',
        actions: ['manual_review']
      };
    }
  }

  async assessDataQuality(ratData) {
    let score = 100;
    const suggestions = [];

    if (!ratData.responsable?.nombre || ratData.responsable.nombre.length < 5) {
      score -= 20;
      suggestions.push('Nombre del responsable muy corto o incompleto');
    }

    if (!ratData.finalidad?.descripcion || ratData.finalidad.descripcion.length < 50) {
      score -= 15;
      suggestions.push('Descripción de finalidad muy breve, agregar más detalle');
    }

    if (!ratData.categorias_datos || ratData.categorias_datos.length === 0) {
      score -= 25;
      suggestions.push('Debe especificar al menos una categoría de datos');
    }

    if (!ratData.plazos_retencion || ratData.plazos_retencion === 'indefinido') {
      score -= 20;
      suggestions.push('Plazo de retención debe ser específico, no indefinido');
    }

    return { score, suggestions };
  }

  async checkForIntelligentDuplicates(ratData, tenantId) {
    try {
      const { data: existingRATs, error } = await supabase
        .from('rats')
        .select('*')
        .eq('tenant_id', tenantId)
        .neq('id', ratData.id || 0);

      if (error) throw error;

      const duplicateAnalysis = await this.performIntelligentDuplicateAnalysis(ratData, existingRATs);
      
      return duplicateAnalysis;
    } catch (error) {
      return { hasDuplicates: false, error: error.message };
    }
  }

  async performIntelligentDuplicateAnalysis(newRAT, existingRATs) {
    let maxSimilarity = 0;
    let mostSimilar = null;
    const alternatives = [];

    for (const existingRAT of existingRATs) {
      const similarity = await this.calculateIntelligentSimilarity(newRAT, existingRAT);
      
      if (similarity.score > maxSimilarity) {
        maxSimilarity = similarity.score;
        mostSimilar = { rat: existingRAT, similarity };
      }

      if (similarity.score > 0.7) {
        alternatives.push({
          rat: existingRAT,
          similarity: similarity.score,
          recommendation: this.getRecommendation(similarity.score)
        });
      }
    }

    if (maxSimilarity > 0.95) {
      return {
        hasDuplicates: true,
        severity: 'critical',
        message: 'RAT prácticamente idéntico detectado',
        alternatives: alternatives,
        recommendation: 'block_creation'
      };
    }

    if (maxSimilarity > 0.8) {
      return {
        hasDuplicates: true,
        severity: 'high',
        message: 'RAT muy similar detectado',
        alternatives: alternatives,
        recommendation: 'review_before_creation'
      };
    }

    if (maxSimilarity > 0.6) {
      return {
        hasDuplicates: true,
        severity: 'medium',
        message: 'RATs relacionados encontrados',
        alternatives: alternatives,
        recommendation: 'inform_user'
      };
    }

    return { hasDuplicates: false };
  }

  async calculateIntelligentSimilarity(ratA, ratB) {
    const similarities = {
      responsable: this.compareRUT(ratA.responsable?.rut, ratB.responsable?.rut),
      finalidad: await this.compareSemanticContent(
        ratA.finalidad?.descripcion, 
        ratB.finalidad?.descripcion
      ),
      categorias: this.compareArraySimilarity(
        ratA.categorias_datos, 
        ratB.categorias_datos
      ),
      base_juridica: ratA.base_juridica?.tipo === ratB.base_juridica?.tipo ? 1 : 0
    };

    const weights = { responsable: 0.3, finalidad: 0.4, categorias: 0.2, base_juridica: 0.1 };
    
    const weightedScore = Object.keys(similarities).reduce((score, key) => {
      return score + (similarities[key] * weights[key]);
    }, 0);

    return {
      score: weightedScore,
      details: similarities
    };
  }

  compareRUT(rutA, rutB) {
    if (!rutA || !rutB) return 0;
    return rutA === rutB ? 1 : 0;
  }

  async compareSemanticContent(textA, textB) {
    if (!textA || !textB) return 0;

    const wordsA = this.extractKeywords(textA.toLowerCase());
    const wordsB = this.extractKeywords(textB.toLowerCase());

    const intersection = wordsA.filter(word => wordsB.includes(word));
    const union = [...new Set([...wordsA, ...wordsB])];

    return union.length > 0 ? intersection.length / union.length : 0;
  }

  extractKeywords(text) {
    const stopWords = ['el', 'la', 'de', 'del', 'y', 'o', 'en', 'por', 'para', 'con'];
    return text
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.includes(word));
  }

  compareArraySimilarity(arrA, arrB) {
    if (!arrA || !arrB) return 0;
    if (arrA.length === 0 && arrB.length === 0) return 1;

    const setA = new Set(arrA.map(item => item.toLowerCase()));
    const setB = new Set(arrB.map(item => item.toLowerCase()));

    const intersection = new Set([...setA].filter(x => setB.has(x)));
    const union = new Set([...setA, ...setB]);

    return union.size > 0 ? intersection.size / union.size : 0;
  }

  getRecommendation(similarityScore) {
    if (similarityScore > 0.95) return 'Considerar actualizar RAT existente en lugar de crear nuevo';
    if (similarityScore > 0.8) return 'Revisar diferencias y justificar necesidad de nuevo RAT';
    if (similarityScore > 0.6) return 'Mantener consistencia con RAT similar';
    return 'Proceder con creación';
  }

  async assessRequiredDPOTasks(ratData) {
    const tasksRequired = [];

    const hasSensitiveData = ratData.categorias_datos?.some(cat => 
      ['salud', 'biometrico', 'socioeconomica', 'racial', 'politica', 'religiosa'].some(sensitive => 
        cat.toLowerCase().includes(sensitive)
      )
    );

    const hasInternationalTransfers = ratData.transferencias_internacionales?.existe;
    const hasAutomatedDecisions = ratData.decisiones_automatizadas?.existe;
    const isHighVolume = ratData.finalidad?.descripcion?.toLowerCase().includes('masivo');

    if (hasSensitiveData || hasAutomatedDecisions || isHighVolume) {
      tasksRequired.push({
        type: 'EIPD',
        priority: 'alta',
        description: 'Evaluación de Impacto en Protección de Datos requerida',
        deadline: 30,
        auto_assignable: await this.checkExistingEIPD(ratData)
      });
    }

    if (hasInternationalTransfers) {
      tasksRequired.push({
        type: 'DPA',
        priority: 'alta', 
        description: 'Anexo de Encargado de Tratamiento requerido',
        deadline: 15,
        auto_assignable: await this.checkExistingDPA(ratData)
      });
    }

    if (ratData.base_juridica?.tipo === 'consentimiento') {
      tasksRequired.push({
        type: 'CONSENT_MANAGEMENT',
        priority: 'media',
        description: 'Configurar gestión de consentimiento',
        deadline: 45,
        auto_assignable: false
      });
    }

    return { tasksRequired };
  }

  async checkExistingEIPD(ratData) {
    try {
      const { data: existingEIPDs, error } = await supabase
        .from('eipd_documents')
        .select('*')
        .eq('tenant_id', ratData.tenant_id)
        .eq('status', 'approved');

      if (error) throw error;

      for (const eipd of existingEIPDs) {
        const similarity = await this.compareEIPDRelevance(ratData, eipd);
        if (similarity > 0.8) {
          return {
            assignable: true,
            existing_eipd_id: eipd.id,
            similarity: similarity,
            message: `EIPD existente ${Math.round(similarity * 100)}% relevante`
          };
        }
      }

      return { assignable: false };
    } catch (error) {
      return { assignable: false, error: error.message };
    }
  }

  async compareEIPDRelevance(ratData, eipd) {
    const ratCategories = ratData.categorias_datos || [];
    const eipdCategories = eipd.covered_data_categories || [];

    const categoryMatch = this.compareArraySimilarity(ratCategories, eipdCategories);
    
    const ratFinalidad = ratData.finalidad?.descripcion || '';
    const eipdPurpose = eipd.treatment_purpose || '';
    const purposeMatch = await this.compareSemanticContent(ratFinalidad, eipdPurpose);

    return (categoryMatch * 0.6) + (purposeMatch * 0.4);
  }

  async checkExistingDPA(ratData) {
    if (!ratData.transferencias_internacionales?.paises) {
      return { assignable: false };
    }

    try {
      const targetCountries = ratData.transferencias_internacionales.paises;
      
      const { data: existingDPAs, error } = await supabase
        .from('dpa_documents')
        .select('*')
        .eq('tenant_id', ratData.tenant_id)
        .eq('status', 'active')
        .contains('covered_countries', targetCountries);

      if (error) throw error;

      if (existingDPAs.length > 0) {
        const bestMatch = existingDPAs[0];
        return {
          assignable: true,
          existing_dpa_id: bestMatch.id,
          message: `DPA existente cubre países: ${targetCountries.join(', ')}`
        };
      }

      return { assignable: false };
    } catch (error) {
      return { assignable: false, error: error.message };
    }
  }

  async autoAssignDPOTasks(tasks, ratId, tenantId) {
    const results = {
      created: 0,
      assigned: 0,
      errors: [],
      tasks: []
    };

    for (const task of tasks) {
      try {
        if (task.auto_assignable?.assignable) {
          const assignmentResult = await this.assignExistingDocument(
            task, 
            task.auto_assignable, 
            ratId
          );
          
          if (assignmentResult.success) {
            results.assigned++;
            results.tasks.push({
              type: task.type,
              action: 'assigned_existing',
              document_id: task.auto_assignable.existing_eipd_id || task.auto_assignable.existing_dpa_id
            });
          } else {
            throw new Error(assignmentResult.error);
          }
        } else {
          const creationResult = await this.createNewDPOTask(task, ratId, tenantId);
          
          if (creationResult.success) {
            results.created++;
            results.tasks.push({
              type: task.type,
              action: 'created_new',
              task_id: creationResult.taskId
            });
          } else {
            throw new Error(creationResult.error);
          }
        }
      } catch (error) {
        results.errors.push(`Error con tarea ${task.type}: ${error.message}`);
      }
    }

    return results;
  }

  async assignExistingDocument(task, assignmentInfo, ratId) {
    try {
      const { error } = await supabase
        .from('rat_document_assignments')
        .insert({
          rat_id: ratId,
          document_type: task.type,
          document_id: assignmentInfo.existing_eipd_id || assignmentInfo.existing_dpa_id,
          assignment_reason: 'ai_auto_assignment',
          similarity_score: assignmentInfo.similarity,
          assigned_at: new Date().toISOString()
        });

      if (error) throw error;

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async createNewDPOTask(task, ratId, tenantId) {
    try {
      const { data, error } = await supabase
        .from('actividades_dpo')
        .insert({
          rat_id: ratId,
          tenant_id: tenantId,
          tipo_actividad: task.type,
          descripcion: task.description,
          estado: 'pendiente',
          prioridad: task.priority,
          fecha_vencimiento: new Date(Date.now() + task.deadline * 24 * 60 * 60 * 1000).toISOString(),
          created_by: 'ai_supervisor',
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      return { success: true, taskId: data[0].id };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async logSupervision(supervision, userId, tenantId) {
    try {
      await supabase
        .from('ai_supervision_log')
        .insert({
          operation_type: supervision.operation,
          user_id: userId,
          tenant_id: tenantId,
          approved: supervision.approved,
          quality_score: supervision.qualityScore,
          interventions: supervision.interventions,
          timestamp: supervision.timestamp
        });
    } catch (error) {
      console.error('Error logging supervision');
    }
  }

  async notifyInterventions(interventions, userId) {
    for (const intervention of interventions) {
      try {
        await supabase
          .from('user_notifications')
          .insert({
            user_id: userId,
            notification_type: 'ai_intervention',
            title: this.getInterventionTitle(intervention.type),
            message: intervention.message,
            severity: intervention.severity,
            metadata: intervention,
            created_at: new Date().toISOString(),
            read: false
          });
      } catch (error) {
        console.error('Error enviando notificación');
      }
    }
  }

  getInterventionTitle(type) {
    const titles = {
      'business_logic_violation': 'Lógica de Negocio Verificada',
      'legal_compliance_issue': 'Cumplimiento Legal Revisado', 
      'data_quality_concern': 'Calidad de Datos Evaluada',
      'duplicate_detected': 'Duplicados Detectados',
      'dpo_tasks_created': 'Tareas DPO Asignadas'
    };

    return titles[type] || 'Intervención AI';
  }

  async performPeriodicSupervision() {
    try {
      const { data: recentRATs, error } = await supabase
        .from('rats')
        .select('*')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .eq('ai_supervised', false);

      if (error) throw error;

      for (const rat of recentRATs) {
        const supervision = await this.superviseRATCreation(rat, rat.created_by, rat.tenant_id);
        
        await supabase
          .from('rats')
          .update({ 
            ai_supervised: true,
            ai_supervision_score: supervision.qualityScore
          })
          .eq('id', rat.id);
      }

      return { processed: recentRATs.length };
    } catch (error) {
      console.error('Error en supervisión periódica');
      return { processed: 0, error: error.message };
    }
  }

  async getSupervisionDashboard(tenantId) {
    try {
      const { data: stats, error } = await supabase
        .from('ai_supervision_log')
        .select('*')
        .eq('tenant_id', tenantId)
        .gte('timestamp', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      const dashboard = {
        totalSupervisions: stats.length,
        approvalRate: 0,
        averageQuality: 0,
        topInterventions: {},
        trends: []
      };

      if (stats.length > 0) {
        const approved = stats.filter(s => s.approved).length;
        dashboard.approvalRate = Math.round((approved / stats.length) * 100);

        const totalQuality = stats.reduce((sum, s) => sum + s.quality_score, 0);
        dashboard.averageQuality = Math.round(totalQuality / stats.length);

        const interventionCounts = {};
        stats.forEach(stat => {
          (stat.interventions || []).forEach(intervention => {
            interventionCounts[intervention.type] = (interventionCounts[intervention.type] || 0) + 1;
          });
        });

        dashboard.topInterventions = Object.entries(interventionCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .reduce((obj, [type, count]) => {
            obj[type] = count;
            return obj;
          }, {});
      }

      return dashboard;
    } catch (error) {
      return { error: error.message };
    }
  }

  async startSupervision() {
    setInterval(async () => {
      await this.performPeriodicSupervision();
    }, 60 * 60 * 1000);

    // AI Supervisor iniciado
  }

  async enableAISupervisor(userId) {
    try {
      await supabase
        .from('system_config')
        .upsert({
          key: 'ai_supervisor_enabled',
          value: 'true',
          updated_by: userId,
          updated_at: new Date().toISOString()
        });

      await this.initialize();

      return { 
        success: true, 
        message: 'AI Supervisor habilitado - Sistema bajo supervisión inteligente' 
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  getInstructions() {
    return {
      title: 'AI Supervisor - La Garantía de la Garantía',
      description: 'Sistema de inteligencia artificial que supervisa todas las operaciones',
      howItWorks: [
        'Valida cada RAT antes de guardarlo',
        'Detecta duplicados inteligentemente',
        'Asigna automáticamente tareas DPO',
        'Verifica cumplimiento legal en tiempo real',
        'Reasigna documentos existentes cuando es relevante'
      ],
      benefits: [
        'Garantiza que todo funcione como se promete',
        'Detecta problemas antes de que ocurran',
        'Automatiza tareas repetitivas del DPO',
        'Mantiene calidad consistente',
        'Aprende y mejora con el uso'
      ],
      howToEnable: [
        'Ir a Configuración del Sistema',
        'Activar "AI Supervisor"',
        'El sistema comenzará supervisión automática',
        'Ver reportes en Dashboard de Supervisión'
      ]
    };
  }
}

const aiSupervisor = new AISupervisor();

export default aiSupervisor;