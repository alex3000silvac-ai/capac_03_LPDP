/**
 * Motor de Deduplicación Inteligente - Prevención Automática de Duplicados
 * Implementa algoritmos avanzados para detectar RATs similares o duplicados
 */

class SmartDeduplication {
  constructor() {
    this.similarityThreshold = 0.8;
    this.conflictThreshold = 0.95;
    this.stopWords = ['el', 'la', 'de', 'del', 'y', 'o', 'en', 'por', 'para', 'con', 'sin', 'sobre'];
  }

  /**
   * Analizar similitud entre actividades RAT
   */
  async analyzeRAT(newRAT, existingRATs) {
    const similarities = [];
    
    for (const existingRAT of existingRATs) {
      const similarity = await this.calculateComprehensiveSimilarity(newRAT, existingRAT);
      
      if (similarity.score > this.similarityThreshold) {
        similarities.push({
          rat: existingRAT,
          similarity: similarity,
          recommendation: this.getRecommendation(similarity.score, similarity.details)
        });
      }
    }
    
    return {
      hasSimilar: similarities.length > 0,
      similarities: similarities.sort((a, b) => b.similarity.score - a.similarity.score),
      action: this.determineAction(similarities)
    };
  }

  /**
   * Calcular similitud comprehensiva entre dos RATs
   */
  async calculateComprehensiveSimilarity(ratA, ratB) {
    const weights = {
      responsable: 0.15,
      finalidad: 0.25,
      categorias_datos: 0.20,
      categorias_titulares: 0.15,
      transferencias: 0.10,
      base_juridica: 0.10,
      fuente_datos: 0.05
    };

    const similarities = {};
    let weightedScore = 0;

    // 1. Similitud del responsable (RUT principalmente)
    similarities.responsable = this.compareResponsable(ratA.responsable, ratB.responsable);
    weightedScore += similarities.responsable * weights.responsable;

    // 2. Similitud de finalidad (análisis semántico)
    similarities.finalidad = await this.compareFinalidad(ratA.finalidad, ratB.finalidad);
    weightedScore += similarities.finalidad * weights.finalidad;

    // 3. Similitud de categorías de datos
    similarities.categorias_datos = this.compareArrays(
      ratA.categorias_datos || [], 
      ratB.categorias_datos || []
    );
    weightedScore += similarities.categorias_datos * weights.categorias_datos;

    // 4. Similitud de categorías de titulares
    similarities.categorias_titulares = this.compareArrays(
      ratA.categorias_titulares || [], 
      ratB.categorias_titulares || []
    );
    weightedScore += similarities.categorias_titulares * weights.categorias_titulares;

    // 5. Similitud de transferencias
    similarities.transferencias = this.compareTransferencias(
      ratA.transferencias_internacionales, 
      ratB.transferencias_internacionales
    );
    weightedScore += similarities.transferencias * weights.transferencias;

    // 6. Similitud de base jurídica
    similarities.base_juridica = this.compareBaseJuridica(
      ratA.base_juridica, 
      ratB.base_juridica
    );
    weightedScore += similarities.base_juridica * weights.base_juridica;

    // 7. Similitud de fuente de datos
    similarities.fuente_datos = this.compareFuenteDatos(
      ratA.fuente_datos, 
      ratB.fuente_datos
    );
    weightedScore += similarities.fuente_datos * weights.fuente_datos;

    return {
      score: Math.round(weightedScore * 100) / 100,
      details: similarities,
      conflicts: this.detectConflicts(similarities),
      mergeOpportunity: this.assessMergeOpportunity(similarities)
    };
  }

  /**
   * Comparar responsables (principalmente por RUT)
   */
  compareResponsable(respA, respB) {
    if (!respA || !respB) return 0;

    // Si es el mismo RUT, es la misma empresa
    if (respA.rut && respB.rut && respA.rut === respB.rut) {
      return 1.0;
    }

    // Comparar nombres (similitud textual)
    const nameA = (respA.nombre || '').toLowerCase();
    const nameB = (respB.nombre || '').toLowerCase();
    
    return this.calculateStringSimilarity(nameA, nameB);
  }

  /**
   * Comparar finalidades usando análisis semántico
   */
  async compareFinalidad(finalidadA, finalidadB) {
    if (!finalidadA || !finalidadB) return 0;

    const textA = (finalidadA.descripcion || finalidadA || '').toLowerCase();
    const textB = (finalidadB.descripcion || finalidadB || '').toLowerCase();

    // 1. Similitud textual básica
    const textualSimilarity = this.calculateStringSimilarity(textA, textB);

    // 2. Análisis de palabras clave de finalidades comunes
    const keywordSimilarity = this.compareKeywords(textA, textB);

    // 3. Análisis de contexto de negocio
    const contextSimilarity = this.analyzeBusinessContext(textA, textB);

    // Promedio ponderado
    return (textualSimilarity * 0.4 + keywordSimilarity * 0.4 + contextSimilarity * 0.2);
  }

  /**
   * Análisis de palabras clave para finalidades
   */
  compareKeywords(textA, textB) {
    const businessKeywords = {
      marketing: ['marketing', 'publicidad', 'promocion', 'newsletter', 'campaña'],
      rrhh: ['nomina', 'empleado', 'trabajador', 'recurso humano', 'seleccion'],
      finanzas: ['facturacion', 'contabilidad', 'pago', 'credito', 'cobranza'],
      ventas: ['venta', 'cliente', 'prospecto', 'lead', 'comercial'],
      logistica: ['entrega', 'envio', 'transporte', 'almacen', 'inventario']
    };

    const categoriesA = this.detectBusinessCategories(textA, businessKeywords);
    const categoriesB = this.detectBusinessCategories(textB, businessKeywords);

    return this.compareArrays(categoriesA, categoriesB);
  }

  /**
   * Detectar categorías de negocio en el texto
   */
  detectBusinessCategories(text, keywords) {
    const categories = [];
    
    for (const [category, words] of Object.entries(keywords)) {
      const hasKeyword = words.some(word => text.includes(word));
      if (hasKeyword) {
        categories.push(category);
      }
    }
    
    return categories;
  }

  /**
   * Análisis de contexto de negocio
   */
  analyzeBusinessContext(textA, textB) {
    const patterns = {
      data_collection: /recopi|obten|recolect|captur/,
      data_processing: /proces|analiz|evalua|calcul/,
      data_sharing: /compart|enviar|transfer|comunic/,
      data_storage: /almacen|guard|conserv|mantener/
    };

    let matches = 0;
    let total = 0;

    for (const [context, pattern] of Object.entries(patterns)) {
      total++;
      const hasA = pattern.test(textA);
      const hasB = pattern.test(textB);
      
      if (hasA === hasB) {
        matches++;
      }
    }

    return total > 0 ? matches / total : 0;
  }

  /**
   * Comparar arrays con algoritmo Jaccard
   */
  compareArrays(arrayA, arrayB) {
    if (!arrayA || !arrayB) return 0;
    if (arrayA.length === 0 && arrayB.length === 0) return 1;

    const setA = new Set(arrayA.map(item => item.toLowerCase?.() || item));
    const setB = new Set(arrayB.map(item => item.toLowerCase?.() || item));

    const intersection = new Set([...setA].filter(x => setB.has(x)));
    const union = new Set([...setA, ...setB]);

    return union.size > 0 ? intersection.size / union.size : 0;
  }

  /**
   * Similitud de strings usando algoritmo Levenshtein optimizado
   */
  calculateStringSimilarity(strA, strB) {
    if (!strA || !strB) return 0;
    if (strA === strB) return 1;

    // Preprocesar: remover stop words y normalizar
    const cleanA = this.cleanText(strA);
    const cleanB = this.cleanText(strB);

    const maxLength = Math.max(cleanA.length, cleanB.length);
    if (maxLength === 0) return 1;

    const distance = this.levenshteinDistance(cleanA, cleanB);
    return (maxLength - distance) / maxLength;
  }

  /**
   * Limpiar texto para comparación
   */
  cleanText(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !this.stopWords.includes(word))
      .join(' ');
  }

  /**
   * Algoritmo Levenshtein optimizado
   */
  levenshteinDistance(strA, strB) {
    const matrix = [];

    for (let i = 0; i <= strB.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= strA.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= strB.length; i++) {
      for (let j = 1; j <= strA.length; j++) {
        if (strB.charAt(i - 1) === strA.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[strB.length][strA.length];
  }

  /**
   * Comparar transferencias internacionales
   */
  compareTransferencias(transferA, transferB) {
    if (!transferA && !transferB) return 1;
    if (!transferA || !transferB) return 0;

    let score = 0;
    let factors = 0;

    // Comparar si ambas tienen o no transferencias
    if (transferA.existe === transferB.existe) {
      score += 0.5;
    }
    factors++;

    // Si ambas tienen transferencias, comparar países
    if (transferA.existe && transferB.existe) {
      const paisesA = transferA.paises || [];
      const paisesB = transferB.paises || [];
      score += this.compareArrays(paisesA, paisesB) * 0.5;
      factors++;
    }

    return factors > 0 ? score / factors : 0;
  }

  /**
   * Comparar base jurídica
   */
  compareBaseJuridica(baseA, baseB) {
    if (!baseA || !baseB) return 0;
    
    const normalizedA = (baseA.tipo || baseA || '').toLowerCase();
    const normalizedB = (baseB.tipo || baseB || '').toLowerCase();
    
    return normalizedA === normalizedB ? 1 : 0;
  }

  /**
   * Comparar fuente de datos
   */
  compareFuenteDatos(fuenteA, fuenteB) {
    if (!fuenteA || !fuenteB) return 0;
    
    const tipoA = (fuenteA.tipo || fuenteA || '').toLowerCase();
    const tipoB = (fuenteB.tipo || fuenteB || '').toLowerCase();
    
    return tipoA === tipoB ? 1 : 0;
  }

  /**
   * Detectar conflictos potenciales
   */
  detectConflicts(similarities) {
    const conflicts = [];

    // Conflicto: Mismo responsable, misma finalidad, pero base jurídica diferente
    if (similarities.responsable > 0.9 && 
        similarities.finalidad > 0.8 && 
        similarities.base_juridica < 0.5) {
      conflicts.push({
        type: 'base_juridica_inconsistente',
        severity: 'alta',
        message: 'Misma empresa y finalidad con bases jurídicas diferentes'
      });
    }

    // Conflicto: Categorías muy similares pero diferentes plazos de retención
    if (similarities.categorias_datos > 0.9 && similarities.finalidad > 0.7) {
      conflicts.push({
        type: 'posible_duplicado',
        severity: 'media',
        message: 'Actividad muy similar detectada - verificar si es duplicado'
      });
    }

    return conflicts;
  }

  /**
   * Evaluar oportunidad de fusión
   */
  assessMergeOpportunity(similarities) {
    // Si es muy similar en responsable, finalidad y categorías
    if (similarities.responsable > 0.9 && 
        similarities.finalidad > 0.8 && 
        similarities.categorias_datos > 0.8) {
      return {
        recommended: true,
        confidence: 'alta',
        benefits: ['Reducir complejidad del RAT', 'Evitar duplicación de esfuerzos', 'Mejorar consistencia']
      };
    }

    if (similarities.responsable > 0.9 && similarities.finalidad > 0.6) {
      return {
        recommended: true,
        confidence: 'media',
        benefits: ['Considerar si son el mismo proceso', 'Verificar si se pueden unificar']
      };
    }

    return {
      recommended: false,
      confidence: 'baja',
      benefits: []
    };
  }

  /**
   * Determinar acción recomendada
   */
  determineAction(similarities) {
    if (similarities.length === 0) {
      return {
        type: 'crear',
        message: '✅ Actividad única, proceder con la creación',
        severity: 'success'
      };
    }

    const maxSimilarity = Math.max(...similarities.map(s => s.similarity.score));

    if (maxSimilarity > 0.95) {
      return {
        type: 'bloquear',
        message: '🚫 Actividad prácticamente idéntica detectada',
        severity: 'error',
        action: 'Revisar actividad existente antes de crear nueva'
      };
    }

    if (maxSimilarity > 0.85) {
      return {
        type: 'advertir',
        message: '⚠️ Actividad muy similar detectada',
        severity: 'warning',
        action: 'Verificar si es necesario crear nueva actividad'
      };
    }

    return {
      type: 'informar',
      message: '💡 Actividades relacionadas encontradas',
      severity: 'info',
      action: 'Considerar para mantener consistencia'
    };
  }

  /**
   * Obtener recomendación específica
   */
  getRecommendation(score, details) {
    if (score > 0.95) {
      return {
        action: 'merge_or_reject',
        message: 'Esta actividad parece ser prácticamente idéntica a una existente. Considera actualizar la actividad existente en lugar de crear una nueva.',
        urgency: 'critica'
      };
    }

    if (score > 0.85) {
      return {
        action: 'review_differences',
        message: 'Actividad muy similar encontrada. Revisa las diferencias clave antes de proceder.',
        urgency: 'alta',
        differences: this.highlightDifferences(details)
      };
    }

    if (score > 0.7) {
      return {
        action: 'ensure_consistency',
        message: 'Actividad relacionada encontrada. Asegúrate de mantener consistencia en términos y enfoques.',
        urgency: 'media'
      };
    }

    return {
      action: 'acknowledge',
      message: 'Actividad relacionada encontrada para referencia.',
      urgency: 'baja'
    };
  }

  /**
   * Destacar diferencias clave
   */
  highlightDifferences(details) {
    const differences = [];

    if (details.finalidad < 0.8) {
      differences.push('Las finalidades tienen diferencias significativas');
    }

    if (details.categorias_datos < 0.8) {
      differences.push('Las categorías de datos son diferentes');
    }

    if (details.base_juridica < 0.5) {
      differences.push('Las bases jurídicas son diferentes');
    }

    if (details.transferencias < 0.8) {
      differences.push('Las transferencias internacionales difieren');
    }

    return differences;
  }

  /**
   * Detectar patrones de duplicación por departamento
   */
  analyzeDepartmentPatterns(ratsByDepartment) {
    const patterns = {};

    for (const [dept, rats] of Object.entries(ratsByDepartment)) {
      const deptPatterns = {
        commonFinalidades: this.findCommonFinalidades(rats),
        duplicateRisks: this.findDuplicateRisks(rats),
        optimizationOpportunities: this.findOptimizationOpportunities(rats)
      };

      patterns[dept] = deptPatterns;
    }

    return patterns;
  }

  /**
   * Encontrar finalidades comunes en un departamento
   */
  findCommonFinalidades(rats) {
    const finalidades = {};

    rats.forEach(rat => {
      const finalidad = (rat.finalidad?.descripcion || rat.finalidad || '').toLowerCase();
      const words = finalidad.split(/\s+/).filter(w => w.length > 3);
      
      words.forEach(word => {
        finalidades[word] = (finalidades[word] || 0) + 1;
      });
    });

    // Retornar palabras que aparecen en más del 50% de los RATs
    const threshold = Math.ceil(rats.length * 0.5);
    return Object.entries(finalidades)
      .filter(([word, count]) => count >= threshold)
      .map(([word, count]) => ({ word, frequency: count }));
  }

  /**
   * Encontrar riesgos de duplicación
   */
  findDuplicateRisks(rats) {
    const risks = [];

    for (let i = 0; i < rats.length; i++) {
      for (let j = i + 1; j < rats.length; j++) {
        const similarity = this.calculateBasicSimilarity(rats[i], rats[j]);
        
        if (similarity > 0.8) {
          risks.push({
            rat1: rats[i].id,
            rat2: rats[j].id,
            similarity: similarity,
            risk: 'duplicacion_potencial'
          });
        }
      }
    }

    return risks;
  }

  /**
   * Similitud básica para análisis masivo
   */
  calculateBasicSimilarity(ratA, ratB) {
    const finalidadSim = this.calculateStringSimilarity(
      ratA.finalidad?.descripcion || '',
      ratB.finalidad?.descripcion || ''
    );

    const datosSim = this.compareArrays(
      ratA.categorias_datos || [],
      ratB.categorias_datos || []
    );

    return (finalidadSim + datosSim) / 2;
  }

  /**
   * Encontrar oportunidades de optimización
   */
  findOptimizationOpportunities(rats) {
    const opportunities = [];

    // Buscar RATs que podrían consolidarse
    const groups = this.groupSimilarRATs(rats);
    
    groups.forEach(group => {
      if (group.length > 1) {
        opportunities.push({
          type: 'consolidacion',
          rats: group.map(rat => rat.id),
          benefit: 'Reducir complejidad del registro',
          effort: 'media'
        });
      }
    });

    return opportunities;
  }

  /**
   * Agrupar RATs similares
   */
  groupSimilarRATs(rats) {
    const groups = [];
    const processed = new Set();

    rats.forEach(rat => {
      if (processed.has(rat.id)) return;

      const similarRATs = [rat];
      processed.add(rat.id);

      rats.forEach(otherRAT => {
        if (processed.has(otherRAT.id)) return;

        const similarity = this.calculateBasicSimilarity(rat, otherRAT);
        if (similarity > 0.7) {
          similarRATs.push(otherRAT);
          processed.add(otherRAT.id);
        }
      });

      if (similarRATs.length > 1) {
        groups.push(similarRATs);
      }
    });

    return groups;
  }

  /**
   * Generar sugerencias automáticas para mejorar RAT
   */
  generateImprovementSuggestions(rat, similarRATs) {
    const suggestions = [];

    // Analizar RATs similares para sugerir mejoras
    if (similarRATs.length > 0) {
      const bestPractices = this.extractBestPractices(similarRATs);
      
      bestPractices.forEach(practice => {
        suggestions.push({
          type: 'mejora',
          field: practice.field,
          suggestion: practice.suggestion,
          example: practice.example,
          confidence: practice.confidence
        });
      });
    }

    // Sugerir campos faltantes basado en finalidad
    const missingFields = this.detectMissingFields(rat);
    missingFields.forEach(field => {
      suggestions.push({
        type: 'campo_faltante',
        field: field.name,
        suggestion: field.suggestion,
        importance: field.importance
      });
    });

    return suggestions;
  }

  /**
   * Extraer mejores prácticas de RATs similares
   */
  extractBestPractices(similarRATs) {
    const practices = [];

    // Analizar descripciones más completas
    const completeness = similarRATs.map(rat => ({
      rat,
      score: this.calculateCompletenessScore(rat)
    })).sort((a, b) => b.score - a.score);

    if (completeness.length > 0 && completeness[0].score > 0.8) {
      const bestRAT = completeness[0].rat;
      
      if (bestRAT.finalidad?.descripcion?.length > 100) {
        practices.push({
          field: 'finalidad',
          suggestion: 'Considera una descripción más detallada de la finalidad',
          example: bestRAT.finalidad.descripcion.substring(0, 100) + '...',
          confidence: 0.8
        });
      }
    }

    return practices;
  }

  /**
   * Calcular score de completitud
   */
  calculateCompletenessScore(rat) {
    let score = 0;
    let maxScore = 0;

    // Verificar campos obligatorios
    const requiredFields = [
      'responsable', 'finalidad', 'categorias_datos', 
      'categorias_titulares', 'base_juridica'
    ];

    requiredFields.forEach(field => {
      maxScore++;
      if (rat[field]) {
        score++;
        
        // Bonus por completitud del campo
        if (typeof rat[field] === 'object' && Object.keys(rat[field]).length > 2) {
          score += 0.5;
          maxScore += 0.5;
        }
      }
    });

    return maxScore > 0 ? score / maxScore : 0;
  }

  /**
   * Detectar campos faltantes basado en finalidad
   */
  detectMissingFields(rat) {
    const missing = [];
    
    const finalidad = (rat.finalidad?.descripcion || '').toLowerCase();

    // Análisis contextual para sugerir campos
    if (finalidad.includes('marketing') && !rat.transferencias_internacionales?.existe) {
      missing.push({
        name: 'transferencias_internacionales',
        suggestion: 'Las actividades de marketing suelen involucrar transferencias a proveedores internacionales',
        importance: 'alta'
      });
    }

    if (finalidad.includes('empleado') && (!rat.categorias_datos || 
        !rat.categorias_datos.some(c => c.includes('laboral')))) {
      missing.push({
        name: 'categorias_datos_laborales',
        suggestion: 'Considera agregar categorías específicas de datos laborales',
        importance: 'media'
      });
    }

    return missing;
  }

  /**
   * API principal para el frontend
   */
  async checkForDuplicates(newRAT, existingRATs) {
    try {
      const analysis = await this.analyzeRAT(newRAT, existingRATs);
      
      // Log para métricas
      console.log(`🔍 Análisis de duplicación: ${analysis.similarities.length} similares encontradas`);
      
      return {
        success: true,
        analysis: analysis,
        shouldProceed: analysis.action.type !== 'bloquear',
        warnings: analysis.similarities.map(s => s.recommendation),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error en análisis de duplicación:', error);
      return {
        success: false,
        error: 'Error en análisis de duplicación',
        shouldProceed: true // En caso de error, permitir continuar
      };
    }
  }
}

// Singleton instance
const smartDeduplication = new SmartDeduplication();

export default smartDeduplication;