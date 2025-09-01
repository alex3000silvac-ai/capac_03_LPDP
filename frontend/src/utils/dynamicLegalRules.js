import supabase from '../config/supabaseClient';

class DynamicLegalRules {
  constructor() {
    this.rules = new Map();
    this.lastSync = null;
    this.syncInterval = 5 * 60 * 1000;
  }

  async loadRules() {
    try {
      const { data: rules, error } = await supabase
        .from('legal_rules')
        .select('*')
        .eq('active', true)
        .order('priority', { ascending: false });

      if (error) throw error;

      this.rules.clear();
      rules.forEach(rule => {
        this.rules.set(rule.rule_id, rule);
      });

      this.lastSync = Date.now();
      return rules;
    } catch (error) {
      console.error('Error cargando reglas legales');
      return [];
    }
  }

  async getRulesByCategory(category) {
    await this.ensureRulesLoaded();
    
    const categoryRules = [];
    for (const rule of this.rules.values()) {
      if (rule.category === category) {
        categoryRules.push(rule);
      }
    }
    
    return categoryRules.sort((a, b) => b.priority - a.priority);
  }

  async evaluateRAT(ratData) {
    await this.ensureRulesLoaded();

    const evaluationResults = {
      compliant: true,
      alerts: [],
      suggestions: [],
      requiredActions: [],
      score: 100
    };

    for (const rule of this.rules.values()) {
      const result = await this.applyRule(rule, ratData);
      
      if (result.triggered) {
        switch (result.severity) {
          case 'critical':
            evaluationResults.compliant = false;
            evaluationResults.requiredActions.push(result);
            evaluationResults.score -= 25;
            break;
          case 'high':
            evaluationResults.alerts.push(result);
            evaluationResults.score -= 15;
            break;
          case 'medium':
            evaluationResults.alerts.push(result);
            evaluationResults.score -= 10;
            break;
          case 'low':
            evaluationResults.suggestions.push(result);
            evaluationResults.score -= 5;
            break;
        }
      }
    }

    evaluationResults.score = Math.max(0, evaluationResults.score);
    return evaluationResults;
  }

  async applyRule(rule, ratData) {
    const result = {
      ruleId: rule.rule_id,
      triggered: false,
      severity: rule.severity,
      message: rule.message,
      action: rule.action,
      articleReference: rule.article_reference
    };

    try {
      const conditionMet = await this.evaluateCondition(rule.condition, ratData);
      
      if (conditionMet) {
        result.triggered = true;
        result.context = this.extractContext(rule, ratData);
        
        await this.logRuleExecution(rule.rule_id, ratData.id, true);
      }
    } catch (error) {
      console.error(`Error aplicando regla ${rule.rule_id}`);
    }

    return result;
  }

  async evaluateCondition(condition, ratData) {
    try {
      const context = {
        rat: ratData,
        hasSensitiveData: this.hasSensitiveData(ratData),
        hasInternationalTransfers: this.hasInternationalTransfers(ratData),
        isHighVolume: this.isHighVolume(ratData),
        usesAutomatedDecisions: this.usesAutomatedDecisions(ratData)
      };

      return this.executeCondition(condition, context);
    } catch (error) {
      console.error('Error evaluando condición');
      return false;
    }
  }

  executeCondition(condition, context) {
    const func = new Function('context', `
      const { rat, hasSensitiveData, hasInternationalTransfers, isHighVolume, usesAutomatedDecisions } = context;
      try {
        return ${condition};
      } catch (e) {
        return false;
      }
    `);

    return func(context);
  }

  hasSensitiveData(ratData) {
    const categorias = ratData.categorias_datos || [];
    const sensitiveKeywords = ['salud', 'biometrico', 'socioeconomica', 'racial', 'politica', 'religiosa'];
    
    return categorias.some(categoria => 
      sensitiveKeywords.some(keyword => 
        categoria.toLowerCase().includes(keyword)
      )
    );
  }

  hasInternationalTransfers(ratData) {
    return ratData.transferencias_internacionales?.existe === true;
  }

  isHighVolume(ratData) {
    const finalidad = (ratData.finalidad?.descripcion || '').toLowerCase();
    return finalidad.includes('masivo') || finalidad.includes('gran escala');
  }

  usesAutomatedDecisions(ratData) {
    return ratData.decisiones_automatizadas?.existe === true;
  }

  extractContext(rule, ratData) {
    const context = {};
    
    if (rule.context_fields) {
      rule.context_fields.forEach(field => {
        context[field] = this.getNestedValue(ratData, field);
      });
    }

    return context;
  }

  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  async logRuleExecution(ruleId, ratId, triggered) {
    try {
      await supabase
        .from('rule_execution_log')
        .insert({
          rule_id: ruleId,
          rat_id: ratId,
          triggered: triggered,
          executed_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error logging rule execution');
    }
  }

  async ensureRulesLoaded() {
    const needsRefresh = !this.lastSync || 
                        (Date.now() - this.lastSync) > this.syncInterval;
    
    if (needsRefresh || this.rules.size === 0) {
      await this.loadRules();
    }
  }

  async createRule(ruleData, userId) {
    try {
      const { data, error } = await supabase
        .from('legal_rules')
        .insert({
          rule_id: `rule_${Date.now()}`,
          category: ruleData.category,
          condition: ruleData.condition,
          message: ruleData.message,
          action: ruleData.action,
          severity: ruleData.severity,
          article_reference: ruleData.articleReference,
          priority: ruleData.priority || 50,
          active: true,
          created_by: userId,
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      await this.loadRules();
      return { success: true, rule: data[0] };
    } catch (error) {
      console.error('Error creando regla');
      return { success: false, error: error.message };
    }
  }

  async updateRule(ruleId, updates, userId) {
    try {
      const { data, error } = await supabase
        .from('legal_rules')
        .update({
          ...updates,
          updated_by: userId,
          updated_at: new Date().toISOString()
        })
        .eq('rule_id', ruleId);

      if (error) throw error;

      await this.loadRules();
      return { success: true };
    } catch (error) {
      console.error('Error actualizando regla');
      return { success: false, error: error.message };
    }
  }

  async deactivateRule(ruleId, userId) {
    return await this.updateRule(ruleId, { active: false }, userId);
  }

  async getArticleDetails(articleNumber) {
    try {
      const { data: article, error } = await supabase
        .from('legal_articles')
        .select('*')
        .eq('article_number', articleNumber)
        .eq('law_code', 'LEY_21719')
        .single();

      if (error) throw error;
      return article;
    } catch (error) {
      console.error('Error obteniendo artículo');
      return null;
    }
  }

  async validateRuleCondition(condition) {
    const validVariables = [
      'rat.finalidad', 'rat.categorias_datos', 'rat.base_juridica',
      'hasSensitiveData', 'hasInternationalTransfers', 'isHighVolume',
      'usesAutomatedDecisions'
    ];

    const errors = [];

    try {
      const func = new Function('context', `return ${condition}`);
      
      const testContext = {
        rat: { finalidad: { descripcion: 'test' } },
        hasSensitiveData: false,
        hasInternationalTransfers: false,
        isHighVolume: false,
        usesAutomatedDecisions: false
      };

      func(testContext);
    } catch (error) {
      errors.push(`Sintaxis inválida: ${error.message}`);
    }

    const usedVariables = this.extractVariables(condition);
    const invalidVariables = usedVariables.filter(v => !validVariables.includes(v));
    
    if (invalidVariables.length > 0) {
      errors.push(`Variables no válidas: ${invalidVariables.join(', ')}`);
    }

    return {
      valid: errors.length === 0,
      errors: errors
    };
  }

  extractVariables(condition) {
    const variablePattern = /\b(rat\.\w+(\.\w+)?|has\w+|is\w+|uses\w+)\b/g;
    const matches = condition.match(variablePattern) || [];
    return [...new Set(matches)];
  }

  async getRuleExecutionStats() {
    try {
      const { data: stats, error } = await supabase
        .from('rule_execution_log')
        .select(`
          rule_id,
          legal_rules(message, category),
          triggered,
          executed_at
        `)
        .gte('executed_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      const ruleStats = {};
      stats.forEach(stat => {
        if (!ruleStats[stat.rule_id]) {
          ruleStats[stat.rule_id] = {
            rule: stat.legal_rules,
            totalExecutions: 0,
            triggered: 0,
            lastExecution: null
          };
        }

        ruleStats[stat.rule_id].totalExecutions++;
        if (stat.triggered) {
          ruleStats[stat.rule_id].triggered++;
        }
        
        if (!ruleStats[stat.rule_id].lastExecution || 
            stat.executed_at > ruleStats[stat.rule_id].lastExecution) {
          ruleStats[stat.rule_id].lastExecution = stat.executed_at;
        }
      });

      return ruleStats;
    } catch (error) {
      console.error('Error obteniendo estadísticas');
      return {};
    }
  }

  async syncWithLatestLaw() {
    try {
      const { data: updates, error } = await supabase
        .from('law_updates')
        .select('*')
        .eq('law_code', 'LEY_21719')
        .eq('processed', false)
        .order('published_date', { ascending: false });

      if (error) throw error;

      for (const update of updates) {
        await this.processLawUpdate(update);
      }

      return { success: true, updatesProcessed: updates.length };
    } catch (error) {
      console.error('Error sincronizando con ley');
      return { success: false, error: error.message };
    }
  }

  async processLawUpdate(update) {
    try {
      if (update.update_type === 'new_article') {
        await this.createRuleFromArticle(update);
      } else if (update.update_type === 'modified_article') {
        await this.updateRulesForArticle(update);
      } else if (update.update_type === 'new_requirement') {
        await this.createRequirementRule(update);
      }

      await supabase
        .from('law_updates')
        .update({ processed: true, processed_at: new Date().toISOString() })
        .eq('id', update.id);

    } catch (error) {
      console.error(`Error procesando actualización ${update.id}`);
    }
  }

  async createRuleFromArticle(update) {
    const ruleId = `art_${update.article_number}_${Date.now()}`;
    
    const rule = {
      rule_id: ruleId,
      category: 'legal_compliance',
      condition: update.trigger_condition,
      message: `Nuevo requisito del Art. ${update.article_number}: ${update.description}`,
      action: update.required_action,
      severity: update.severity || 'medium',
      article_reference: `Art. ${update.article_number} Ley 21.719`,
      priority: update.priority || 50,
      active: true,
      created_by: 'system',
      created_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('legal_rules')
      .insert(rule);

    if (error) throw error;
  }

  async updateRulesForArticle(update) {
    const { error } = await supabase
      .from('legal_rules')
      .update({
        condition: update.new_condition,
        message: update.new_message,
        updated_by: 'system',
        updated_at: new Date().toISOString()
      })
      .eq('article_reference', `Art. ${update.article_number} Ley 21.719`);

    if (error) throw error;
  }

  async getComplianceGuidance(ratData) {
    const evaluation = await this.evaluateRAT(ratData);
    const guidance = {
      nextSteps: [],
      documents: [],
      deadlines: [],
      resources: []
    };

    evaluation.requiredActions.forEach(action => {
      guidance.nextSteps.push({
        action: action.action,
        priority: action.severity,
        reference: action.articleReference,
        deadline: this.calculateDeadline(action)
      });
    });

    evaluation.alerts.forEach(alert => {
      if (alert.action?.includes('EIPD')) {
        guidance.documents.push({
          type: 'EIPD',
          description: 'Evaluación de Impacto en Protección de Datos',
          template: 'eipd_template_v2'
        });
      }

      if (alert.action?.includes('DPA')) {
        guidance.documents.push({
          type: 'DPA',
          description: 'Anexo de Encargado de Tratamiento',
          template: 'dpa_template_v1'
        });
      }
    });

    return guidance;
  }

  calculateDeadline(action) {
    const deadlineMap = {
      'EIPD_REQUIRED': 30,
      'DPA_REQUIRED': 15,
      'CONSENT_UPDATE': 60,
      'SECURITY_REVIEW': 45
    };

    const days = deadlineMap[action.action] || 30;
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + days);
    
    return deadline.toISOString();
  }

  async ensureRulesLoaded() {
    const needsRefresh = !this.lastSync || 
                        (Date.now() - this.lastSync) > this.syncInterval;
    
    if (needsRefresh || this.rules.size === 0) {
      await this.loadRules();
    }
  }

  async getArticleText(articleNumber) {
    try {
      const { data: article, error } = await supabase
        .from('legal_articles')
        .select('full_text, summary, practical_guide')
        .eq('article_number', articleNumber)
        .eq('law_code', 'LEY_21719')
        .single();

      if (error) throw error;
      return article;
    } catch (error) {
      console.error('Error obteniendo texto del artículo');
      return null;
    }
  }

  async suggestBestPractices(ratData) {
    try {
      const { data: practices, error } = await supabase
        .from('best_practices')
        .select('*')
        .or(`category.eq.${this.inferCategory(ratData)},category.eq.general`)
        .eq('active', true)
        .order('effectiveness_score', { ascending: false })
        .limit(5);

      if (error) throw error;
      return practices;
    } catch (error) {
      console.error('Error obteniendo mejores prácticas');
      return [];
    }
  }

  inferCategory(ratData) {
    const finalidad = (ratData.finalidad?.descripcion || '').toLowerCase();
    
    if (finalidad.includes('marketing') || finalidad.includes('publicidad')) {
      return 'marketing';
    }
    if (finalidad.includes('empleado') || finalidad.includes('nomina')) {
      return 'rrhh';
    }
    if (finalidad.includes('cliente') || finalidad.includes('venta')) {
      return 'comercial';
    }
    if (finalidad.includes('salud') || finalidad.includes('medico')) {
      return 'salud';
    }
    
    return 'general';
  }

  async recordCompliance(ratId, complianceLevel, userId) {
    try {
      await supabase
        .from('compliance_records')
        .insert({
          rat_id: ratId,
          compliance_score: complianceLevel,
          recorded_by: userId,
          recorded_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error registrando compliance');
    }
  }

  async getComplianceTrend(tenantId, days = 30) {
    try {
      const { data: records, error } = await supabase
        .from('compliance_records')
        .select('compliance_score, recorded_at')
        .eq('tenant_id', tenantId)
        .gte('recorded_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
        .order('recorded_at', { ascending: true });

      if (error) throw error;

      return {
        trend: records,
        average: records.reduce((sum, r) => sum + r.compliance_score, 0) / records.length,
        latest: records[records.length - 1]?.compliance_score || 0
      };
    } catch (error) {
      console.error('Error obteniendo tendencia de compliance');
      return { trend: [], average: 0, latest: 0 };
    }
  }
}

const dynamicLegalRules = new DynamicLegalRules();

export default dynamicLegalRules;