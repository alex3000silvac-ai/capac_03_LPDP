import { supabase } from '../config/supabaseConfig';

class SemanticValidator {
  constructor() {
    this.validationRules = null;
    this.loadRulesPromise = this.loadValidationRules();
  }

  async loadValidationRules() {
    try {
      const { data: rules, error } = await supabase
        .from('semantic_validation_rules')
        .select('*')
        .eq('active', true);

      if (error) throw error;

      this.validationRules = rules;
      return rules;
    } catch (error) {
      console.error('Error cargando reglas de validación');
      this.validationRules = this.getDefaultRules();
      return this.validationRules;
    }
  }

  getDefaultRules() {
    return [
      {
        id: 'marketing_consent',
        pattern: /marketing|publicidad|promocion|newsletter|campaña/i,
        required_base: 'consentimiento',
        message: 'Marketing requiere consentimiento como base jurídica',
        severity: 'error'
      },
      {
        id: 'employee_contract',
        pattern: /empleado|trabajador|nomina|laboral/i,
        required_base: 'contrato',
        message: 'Datos laborales generalmente se basan en contrato',
        severity: 'warning'
      },
      {
        id: 'legal_obligation',
        pattern: /tributario|fiscal|contable|legal|obligacion/i,
        required_base: 'obligacion_legal',
        message: 'Obligaciones legales requieren base jurídica específica',
        severity: 'info'
      }
    ];
  }

  async validateFinalidad(finalidad, baseJuridica, categoriasDatos = []) {
    await this.loadRulesPromise;

    const validation = {
      valid: true,
      warnings: [],
      errors: [],
      suggestions: [],
      score: 1.0
    };

    const finalidadText = (finalidad?.descripcion || finalidad || '').toLowerCase();
    const baseType = baseJuridica?.tipo || baseJuridica || '';

    if (!this.validationRules) {
      return validation;
    }

    for (const rule of this.validationRules) {
      if (this.matchesPattern(finalidadText, rule.pattern)) {
        const isValidBase = this.checkBaseJuridica(baseType, rule.required_base);
        
        if (!isValidBase) {
          const violation = {
            rule: rule.id,
            message: rule.message,
            currentBase: baseType,
            suggestedBase: rule.required_base
          };

          if (rule.severity === 'error') {
            validation.valid = false;
            validation.errors.push(violation);
            validation.score -= 0.3;
          } else if (rule.severity === 'warning') {
            validation.warnings.push(violation);
            validation.score -= 0.1;
          } else {
            validation.suggestions.push(violation);
          }
        }
      }
    }

    const coherenceCheck = await this.checkCoherence(finalidadText, categoriasDatos);
    if (!coherenceCheck.coherent) {
      validation.warnings.push(coherenceCheck);
      validation.score -= 0.2;
    }

    const complexityCheck = this.analyzeComplexity(finalidadText);
    if (complexityCheck.needsImprovement) {
      validation.suggestions.push(complexityCheck);
    }

    return validation;
  }

  matchesPattern(text, pattern) {
    if (pattern instanceof RegExp) {
      return pattern.test(text);
    }
    return text.includes(pattern.toLowerCase());
  }

  checkBaseJuridica(currentBase, requiredBase) {
    const baseMap = {
      'consentimiento': ['consentimiento', 'consent'],
      'contrato': ['contrato', 'contract', 'ejecucion_contrato'],
      'obligacion_legal': ['obligacion_legal', 'legal_obligation'],
      'interes_legitimo': ['interes_legitimo', 'legitimate_interest']
    };

    const validBases = baseMap[requiredBase] || [requiredBase];
    return validBases.some(base => currentBase.toLowerCase().includes(base));
  }

  async checkCoherence(finalidadText, categoriasDatos) {
    const dataTypes = categoriasDatos.map(cat => cat.toLowerCase());
    
    const sensitiveDataDetected = dataTypes.some(type => 
      ['salud', 'biometrico', 'socioeconomica', 'racial', 'politica', 'religiosa'].some(sensitive => 
        type.includes(sensitive)
      )
    );

    const routineProcessDetected = finalidadText.match(/administrat|gestion|operaci|rutina/);

    if (sensitiveDataDetected && routineProcessDetected) {
      return {
        coherent: false,
        type: 'coherence_warning',
        message: 'Datos sensibles para procesos rutinarios requiere justificación adicional',
        suggestion: 'Verificar si realmente se necesitan datos sensibles para esta finalidad'
      };
    }

    return { coherent: true };
  }

  analyzeComplexity(finalidadText) {
    const wordCount = finalidadText.split(/\s+/).length;
    const hasSpecificTerms = /\b(especifico|concreto|detallado|preciso)\b/.test(finalidadText);
    const hasVagueTerms = /\b(general|varios|diversos|multiples)\b/.test(finalidadText);

    if (wordCount < 10) {
      return {
        needsImprovement: true,
        type: 'complexity_low',
        message: 'Finalidad muy breve',
        suggestion: 'Describe con más detalle el propósito específico del tratamiento'
      };
    }

    if (hasVagueTerms && !hasSpecificTerms) {
      return {
        needsImprovement: true,
        type: 'complexity_vague',
        message: 'Finalidad demasiado vaga',
        suggestion: 'Especifica mejor los propósitos concretos del tratamiento'
      };
    }

    return { needsImprovement: false };
  }

  async suggestImprovements(finalidadText, baseJuridica) {
    const suggestions = [];

    try {
      const { data: templates, error } = await supabase
        .from('finalidad_templates')
        .select('*')
        .ilike('keywords', `%${this.extractKeywords(finalidadText).join('%')}%`)
        .limit(3);

      if (!error && templates?.length > 0) {
        templates.forEach(template => {
          suggestions.push({
            type: 'template_suggestion',
            title: template.title,
            description: template.description,
            confidence: template.usage_count > 10 ? 'alta' : 'media'
          });
        });
      }
    } catch (error) {
      console.error('Error obteniendo templates');
    }

    return suggestions;
  }

  extractKeywords(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !this.isStopWord(word))
      .slice(0, 5);
  }

  isStopWord(word) {
    const stopWords = ['para', 'este', 'esta', 'como', 'todo', 'desde', 'hasta', 'entre'];
    return stopWords.includes(word);
  }

  async saveFinalidadTemplate(finalidad, baseJuridica, categoriasDatos, userId) {
    if (!finalidad || finalidad.length < 20) return;

    const keywords = this.extractKeywords(finalidad);
    
    try {
      const { error } = await supabase
        .from('finalidad_templates')
        .upsert({
          title: finalidad.substring(0, 100),
          description: finalidad,
          base_juridica: baseJuridica,
          categorias_datos: categoriasDatos,
          keywords: keywords,
          created_by: userId,
          usage_count: 1,
          last_used: new Date().toISOString()
        }, {
          onConflict: 'title',
          ignoreDuplicates: false
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error guardando template');
    }
  }

  async validateAndSuggest(finalidad, baseJuridica, categoriasDatos, userId) {
    const validation = await this.validateFinalidad(finalidad, baseJuridica, categoriasDatos);
    const suggestions = await this.suggestImprovements(finalidad, baseJuridica);

    if (validation.valid && finalidad.length > 50) {
      await this.saveFinalidadTemplate(finalidad, baseJuridica, categoriasDatos, userId);
    }

    return {
      ...validation,
      suggestions: [...validation.suggestions, ...suggestions]
    };
  }
}

const semanticValidator = new SemanticValidator();

export default semanticValidator;