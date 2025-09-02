// 🛡️ IA PREVENTIVA - EVITA ERRORES ANTES DE QUE OCURRAN
import { supabase } from '../config/supabaseClient';

class PreventiveAI {
  constructor() {
    this.flowDiagrams = new Map();
    this.preventiveRules = new Set();
    this.isActive = true;
    this.initializeFlowDiagrams();
    this.initializePreventiveRules();
  }

  // 📊 DIAGRAMAS DE FLUJO ESPERADOS - IA CONOCE LO QUE DEBE PASAR
  initializeFlowDiagrams() {
    
    // FLUJO: CREAR RAT
    this.flowDiagrams.set('CREATE_RAT', {
      expectedSequence: [
        'VALIDATE_BASIC_DATA',
        'SAVE_TO_DB',
        'AUTO_REGISTER_INVENTORY', 
        'EVALUATE_RISK',
        'AUTO_GENERATE_EIPD_IF_HIGH_RISK',
        'CREATE_DPO_TASK',
        'NOTIFY_DPO',
        'MARK_COMPLETE'
      ],
      requiredTables: ['mapeo_datos_rat', 'inventario_rats'],
      conditionalTables: {
        'generated_documents': 'IF risk_level = ALTO',
        'actividades_dpo': 'ALWAYS',
        'notifications': 'ALWAYS'
      },
      expectedCounts: {
        'mapeo_datos_rat': '+1',
        'inventario_rats': '+1',
        'generated_documents': '+1 IF risk_level = ALTO',
        'actividades_dpo': '+1',
        'notifications': '+1'
      }
    });

    // FLUJO: ACTUALIZAR RAT  
    this.flowDiagrams.set('UPDATE_RAT', {
      expectedSequence: [
        'VALIDATE_RAT_EXISTS',
        'VALIDATE_CHANGES',
        'UPDATE_DB',
        'UPDATE_INVENTORY',
        'RE_EVALUATE_RISK',
        'UPDATE_OR_CREATE_EIPD_IF_NEEDED',
        'NOTIFY_CHANGES_TO_DPO',
        'MARK_UPDATED'
      ],
      requiredTables: ['mapeo_datos_rat', 'inventario_rats'],
      expectedCounts: {
        'mapeo_datos_rat': '0 (update, no new)',
        'inventario_rats': '0 (update, no new)'
      }
    });

    // FLUJO: APROBAR EIPD
    this.flowDiagrams.set('APPROVE_EIPD', {
      expectedSequence: [
        'VALIDATE_EIPD_EXISTS',
        'VALIDATE_RAT_LINK',
        'UPDATE_EIPD_STATUS',
        'UPDATE_RAT_STATUS',
        'CREATE_COMPLETION_TASK',
        'NOTIFY_COMPLETION',
        'MARK_RAT_READY_FOR_CLOSURE'
      ],
      requiredTables: ['generated_documents', 'mapeo_datos_rat', 'actividades_dpo'],
      expectedCounts: {
        'generated_documents': '0 (update status)',
        'mapeo_datos_rat': '0 (update status)',
        'actividades_dpo': '+1 (completion task)'
      }
    });

    console.log('📊 Diagramas de flujo cargados:', this.flowDiagrams.size);
  }

  // 🛡️ REGLAS PREVENTIVAS
  initializePreventiveRules() {
    
    // REGLA: ANTES DE CREAR RAT
    this.preventiveRules.add({
      trigger: 'BEFORE_CREATE_RAT',
      validate: async (tenantId, ratData) => {
        const issues = [];
        
        // 1. Verificar que no exista RAT duplicado
        const duplicates = await this.checkDuplicateRAT(tenantId, ratData);
        if (duplicates.length > 0) {
          return {
            canProceed: false,
            preventiveAction: 'SHOW_DUPLICATES',
            message: `Existe RAT similar: "${duplicates[0].nombre_actividad}". ¿Consolidar?`,
            suggestedActions: ['CONSOLIDATE', 'CREATE_ANYWAY'],
            duplicates: duplicates
          };
        }
        
        // 2. Pre-evaluar si requerirá EIPD
        const riskEvaluation = await this.preEvaluateRisk(ratData);
        if (riskEvaluation.level === 'ALTO') {
          return {
            canProceed: true,
            preventiveAction: 'PREPARE_EIPD',
            message: `Este RAT requerirá EIPD (riesgo ${riskEvaluation.level}). ¿Continuar?`,
            suggestedActions: ['CONTINUE_WITH_EIPD', 'MODIFY_TO_REDUCE_RISK'],
            riskFactors: riskEvaluation.factors
          };
        }
        
        return { canProceed: true, preventiveAction: 'NONE' };
      }
    });

    // REGLA: ANTES DE ACTUALIZAR RAT
    this.preventiveRules.add({
      trigger: 'BEFORE_UPDATE_RAT',
      validate: async (tenantId, ratId, changes) => {
        // 1. Verificar impacto en EIPD existente
        const eipdsExistentes = await this.getEIPDsByRAT(tenantId, ratId);
        if (eipdsExistentes.length > 0 && this.changesAffectRisk(changes)) {
          return {
            canProceed: false,
            preventiveAction: 'WARN_EIPD_IMPACT',
            message: `Cambios afectarán EIPD existente. ${eipdsExistentes.length} EIPDs requieren actualización.`,
            suggestedActions: ['UPDATE_EIPD_AUTOMATICALLY', 'REVIEW_MANUALLY', 'CANCEL_CHANGES'],
            affectedEIPDs: eipdsExistentes
          };
        }
        
        return { canProceed: true, preventiveAction: 'NONE' };
      }
    });

    // REGLA: ANTES DE ELIMINAR RAT
    this.preventiveRules.add({
      trigger: 'BEFORE_DELETE_RAT',
      validate: async (tenantId, ratId) => {
        const dependencies = await this.checkRATDependencies(tenantId, ratId);
        
        if (dependencies.totalDependencies > 0) {
          return {
            canProceed: false,
            preventiveAction: 'SHOW_DEPENDENCIES',
            message: `RAT tiene ${dependencies.totalDependencies} dependencias. Debe limpiar primero.`,
            suggestedActions: ['CLEANUP_DEPENDENCIES', 'CANCEL_DELETE'],
            dependencies: dependencies
          };
        }
        
        return { canProceed: true, preventiveAction: 'NONE' };
      }
    });

    console.log('🛡️ Reglas preventivas cargadas:', this.preventiveRules.size);
  }

  // 🔒 VALIDACIÓN PREVENTIVA PRINCIPAL
  async validateAction(trigger, tenantId, data) {
    if (!this.isActive) return { canProceed: true };
    
    console.log(`🛡️ Validando preventivamente: ${trigger}`);
    
    for (const rule of this.preventiveRules) {
      if (rule.trigger === trigger) {
        try {
          const result = await rule.validate(tenantId, data.ratId || data, data.changes);
          
          if (!result.canProceed) {
            console.log(`🛡️ ACCIÓN BLOQUEADA PREVENTIVAMENTE: ${result.message}`);
            return result;
          }
          
          if (result.preventiveAction !== 'NONE') {
            console.log(`🛡️ Acción preventiva sugerida: ${result.preventiveAction}`);
            return result;
          }
          
        } catch (error) {
          console.error(`Error en regla preventiva ${rule.trigger}:`, error);
          return {
            canProceed: false,
            preventiveAction: 'ERROR',
            message: 'Error en validación preventiva: ' + error.message
          };
        }
      }
    }
    
    return { canProceed: true, preventiveAction: 'NONE' };
  }

  // 🔍 MÉTODOS AUXILIARES PREVENTIVOS
  async checkDuplicateRAT(tenantId, ratData) {
    try {
      const { data, error } = await supabase
        .from('mapeo_datos_rat')
        .select('id, nombre_actividad, area_responsable')
        .eq('tenant_id', tenantId)
        .neq('estado', 'ELIMINADO')
        .ilike('nombre_actividad', `%${ratData.nombre_actividad}%`);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error verificando duplicados:', error);
      return [];
    }
  }

  async preEvaluateRisk(ratData) {
    const riskFactors = [];
    let riskScore = 0;
    
    // Factores de riesgo conocidos
    if (ratData.categorias_datos?.includes('biometricos')) {
      riskFactors.push('Datos biométricos');
      riskScore += 3;
    }
    
    if (ratData.categorias_datos?.includes('salud')) {
      riskFactors.push('Datos de salud');
      riskScore += 3;
    }
    
    if (ratData.transferencias_internacionales?.length > 0) {
      riskFactors.push('Transferencias internacionales');
      riskScore += 2;
    }
    
    if (ratData.volumen_datos === 'MASIVO') {
      riskFactors.push('Volumen masivo de datos');
      riskScore += 2;
    }
    
    const level = riskScore >= 5 ? 'ALTO' : riskScore >= 3 ? 'MEDIO' : 'BAJO';
    
    return {
      level: level,
      score: riskScore,
      factors: riskFactors,
      requiresEIPD: level === 'ALTO'
    };
  }

  changesAffectRisk(changes) {
    const riskAffectingFields = [
      'categorias_datos',
      'transferencias_internacionales', 
      'base_licitud',
      'finalidad_principal',
      'destinatarios_internos'
    ];
    
    return riskAffectingFields.some(field => changes.hasOwnProperty(field));
  }

  async checkRATDependencies(tenantId, ratId) {
    try {
      const [eipds, tasks, inventory] = await Promise.all([
        supabase.from('generated_documents').select('id').eq('source_rat_id', ratId),
        supabase.from('actividades_dpo').select('id').eq('tenant_id', tenantId).eq('rat_id', ratId),
        supabase.from('inventario_rats').select('id').eq('tenant_id', tenantId).eq('rat_id', ratId)
      ]);
      
      return {
        eipds: eipds.data || [],
        tasks: tasks.data || [],
        inventory: inventory.data || [],
        totalDependencies: (eipds.data?.length || 0) + (tasks.data?.length || 0) + (inventory.data?.length || 0)
      };
    } catch (error) {
      console.error('Error verificando dependencias:', error);
      return { totalDependencies: 0 };
    }
  }

  async getEIPDsByRAT(tenantId, ratId) {
    const { data, error } = await supabase
      .from('generated_documents')
      .select('id, status, title')
      .eq('document_type', 'EIPD')
      .eq('source_rat_id', ratId);
    
    if (error) throw error;
    return data || [];
  }

  // 🔄 AUTO-CORRECCIÓN PREVENTIVA
  async performPreventiveAction(action, tenantId, data) {
    console.log(`🔄 Ejecutando acción preventiva: ${action}`);
    
    switch (action) {
      case 'PREPARE_EIPD':
        return await this.preCreateEIPDStructure(tenantId, data);
        
      case 'UPDATE_EIPD_AUTOMATICALLY':
        return await this.autoUpdateRelatedEIPDs(tenantId, data);
        
      case 'CLEANUP_DEPENDENCIES':
        return await this.cleanupRATDependencies(tenantId, data.ratId);
        
      default:
        console.log(`Acción preventiva ${action} no implementada`);
        return null;
    }
  }

  async preCreateEIPDStructure(tenantId, ratData) {
    // Pre-crear estructura EIPD para agilizar proceso
    const eipdStructure = {
      tenant_id: tenantId,
      source_rat_id: null, // Se asignará cuando se cree el RAT
      document_type: 'EIPD',
      title: `EIPD (Pre-creada) - ${ratData.nombre_actividad}`,
      content: {
        pre_created: true,
        timestamp: new Date().toISOString(),
        estimated_risk: await this.preEvaluateRisk(ratData)
      },
      status: 'PRE_BORRADOR',
      created_at: new Date().toISOString()
    };
    
    return eipdStructure; // No guardar aún, solo preparar
  }

  // 🎯 INTERCEPTOR PRINCIPAL - VALIDA ANTES DE CADA ACCIÓN
  async interceptAction(actionType, params) {
    if (!this.isActive) return { allowed: true };
    
    console.log(`🛡️ Interceptando acción: ${actionType}`);
    
    const validation = await this.validateAction(
      `BEFORE_${actionType}`, 
      params.tenantId, 
      params
    );
    
    if (!validation.canProceed) {
      // BLOQUEAR ACCIÓN Y SUGERIR ALTERNATIVAS
      console.log(`🚫 ACCIÓN BLOQUEADA: ${validation.message}`);
      
      return {
        allowed: false,
        reason: validation.message,
        suggestedActions: validation.suggestedActions,
        preventiveAction: validation.preventiveAction,
        metadata: validation
      };
    }
    
    if (validation.preventiveAction !== 'NONE') {
      // EJECUTAR ACCIÓN PREVENTIVA AUTOMÁTICAMENTE
      console.log(`🔄 Ejecutando acción preventiva: ${validation.preventiveAction}`);
      
      const preventiveResult = await this.performPreventiveAction(
        validation.preventiveAction,
        params.tenantId,
        params
      );
      
      return {
        allowed: true,
        preventiveActionExecuted: validation.preventiveAction,
        preventiveResult: preventiveResult,
        message: validation.message
      };
    }
    
    return { allowed: true };
  }

  // 📊 VALIDACIÓN SECUENCIAL ESPERADA  
  async validateExpectedSequence(tenantId, flowType, currentStep) {
    const flow = this.flowDiagrams.get(flowType);
    if (!flow) return { valid: true };
    
    const expectedNextSteps = flow.expectedSequence;
    const currentIndex = expectedNextSteps.indexOf(currentStep);
    
    if (currentIndex === -1) {
      return {
        valid: false,
        message: `Paso "${currentStep}" no existe en flujo ${flowType}`,
        expectedSteps: expectedNextSteps
      };
    }
    
    // Verificar que pasos anteriores se hayan completado
    const previousSteps = expectedNextSteps.slice(0, currentIndex);
    const incompletePrevious = [];
    
    for (const step of previousSteps) {
      const completed = await this.checkStepCompleted(tenantId, flowType, step);
      if (!completed) {
        incompletePrevious.push(step);
      }
    }
    
    if (incompletePrevious.length > 0) {
      return {
        valid: false,
        message: `Pasos anteriores incompletos: ${incompletePrevious.join(', ')}`,
        missingSteps: incompletePrevious,
        currentStep: currentStep
      };
    }
    
    return { valid: true };
  }

  async checkStepCompleted(tenantId, flowType, step) {
    // Verificar si paso específico fue completado
    switch (step) {
      case 'SAVE_TO_DB':
        // Verificar que último RAT se guardó en BD
        return await this.verifyLastRATSaved(tenantId);
        
      case 'AUTO_REGISTER_INVENTORY':
        // Verificar que último RAT está en inventario
        return await this.verifyLastRATInInventory(tenantId);
        
      case 'AUTO_GENERATE_EIPD_IF_HIGH_RISK':
        // Verificar EIPD si era requerida
        return await this.verifyEIPDIfRequired(tenantId);
        
      default:
        return true; // Por defecto asumir completado
    }
  }

  // 🎯 MÉTODOS VERIFICACIÓN ESPECÍFICOS
  async verifyLastRATSaved(tenantId) {
    try {
      const { count } = await supabase
        .from('mapeo_datos_rat')
        .select('id', { count: 'exact' })
        .eq('tenant_id', tenantId)
        .gte('created_at', new Date(Date.now() - 300000).toISOString()); // Últimos 5 min
      
      return count > 0;
    } catch (error) {
      return false;
    }
  }

  async verifyLastRATInInventory(tenantId) {
    try {
      const { count } = await supabase
        .from('inventario_rats')
        .select('id', { count: 'exact' })
        .eq('tenant_id', tenantId)
        .gte('fecha_registro', new Date(Date.now() - 300000).toISOString());
      
      return count > 0;
    } catch (error) {
      return false;
    }
  }

  async verifyEIPDIfRequired(tenantId) {
    try {
      // Obtener último RAT de alto riesgo
      const { data: lastHighRiskRAT } = await supabase
        .from('mapeo_datos_rat')
        .select('id')
        .eq('tenant_id', tenantId)
        .eq('nivel_riesgo', 'ALTO')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (!lastHighRiskRAT) return true; // No hay RATs alto riesgo
      
      // Verificar que tenga EIPD
      const { count } = await supabase
        .from('generated_documents')
        .select('id', { count: 'exact' })
        .eq('source_rat_id', lastHighRiskRAT.id)
        .eq('document_type', 'EIPD');
      
      return count > 0;
    } catch (error) {
      return false;
    }
  }

  // 🔄 CORRECCIÓN AUTOMÁTICA EN TIEMPO REAL
  async autoCorrectInRealTime(tenantId, detectedIssue) {
    console.log(`🔧 Auto-corrección en tiempo real: ${detectedIssue.type}`);
    
    try {
      switch (detectedIssue.type) {
        case 'RAT_WITHOUT_INVENTORY':
          await this.autoRegisterMissingInventory(tenantId, detectedIssue.ratId);
          break;
          
        case 'HIGH_RISK_RAT_WITHOUT_EIPD':
          await this.autoGenerateMissingEIPD(tenantId, detectedIssue.ratId);
          break;
          
        case 'ORPHAN_DPO_TASK':
          await this.autoCleanupOrphanTask(tenantId, detectedIssue.taskId);
          break;
          
        default:
          console.log(`Tipo de corrección ${detectedIssue.type} no implementado`);
      }
      
      console.log(`✅ Auto-corrección completada: ${detectedIssue.type}`);
      
    } catch (error) {
      console.error(`❌ Error en auto-corrección: ${error.message}`);
    }
  }

  // 🔄 MONITOREO CONTINUO PREVENTIVO
  startPreventiveMonitoring(tenantId) {
    console.log('🔄 Iniciando monitoreo preventivo continuo');
    
    setInterval(async () => {
      try {
        // Detectar problemas antes de que se vuelvan críticos
        const potentialIssues = await this.detectPotentialIssues(tenantId);
        
        for (const issue of potentialIssues) {
          await this.autoCorrectInRealTime(tenantId, issue);
        }
        
      } catch (error) {
        console.error('Error en monitoreo preventivo:', error);
      }
    }, 30000); // Cada 30 segundos
  }

  async detectPotentialIssues(tenantId) {
    const issues = [];
    
    try {
      // 1. RATs sin inventario
      const ratsWithoutInventory = await this.findRATsWithoutInventory(tenantId);
      for (const rat of ratsWithoutInventory) {
        issues.push({
          type: 'RAT_WITHOUT_INVENTORY',
          ratId: rat.id,
          severity: 'MEDIO'
        });
      }
      
      // 2. RATs alto riesgo sin EIPD
      const highRiskWithoutEIPD = await this.findHighRiskRATsWithoutEIPD(tenantId);
      for (const rat of highRiskWithoutEIPD) {
        issues.push({
          type: 'HIGH_RISK_RAT_WITHOUT_EIPD',
          ratId: rat.id,
          severity: 'ALTO'
        });
      }
      
      // 3. Tareas DPO huérfanas
      const orphanTasks = await this.findOrphanDPOTasks(tenantId);
      for (const task of orphanTasks) {
        issues.push({
          type: 'ORPHAN_DPO_TASK',
          taskId: task.id,
          severity: 'BAJO'
        });
      }
      
    } catch (error) {
      console.error('Error detectando problemas potenciales:', error);
    }
    
    return issues;
  }

  async findRATsWithoutInventory(tenantId) {
    try {
      const { data: rats } = await supabase
        .from('mapeo_datos_rat')
        .select('id, nombre_actividad')
        .eq('tenant_id', tenantId)
        .neq('estado', 'ELIMINADO');
      
      const { data: inventory } = await supabase
        .from('inventario_rats')
        .select('rat_id')
        .eq('tenant_id', tenantId);
      
      const inventoryRatIds = new Set((inventory || []).map(inv => inv.rat_id));
      
      return (rats || []).filter(rat => !inventoryRatIds.has(rat.id));
    } catch (error) {
      console.error('Error buscando RATs sin inventario:', error);
      return [];
    }
  }

  async findHighRiskRATsWithoutEIPD(tenantId) {
    try {
      const { data: highRiskRATs } = await supabase
        .from('mapeo_datos_rat')
        .select('id, nombre_actividad')
        .eq('tenant_id', tenantId)
        .eq('nivel_riesgo', 'ALTO')
        .neq('estado', 'ELIMINADO');
      
      const ratsWithoutEIPD = [];
      
      for (const rat of highRiskRATs || []) {
        const { count } = await supabase
          .from('generated_documents')
          .select('id', { count: 'exact' })
          .eq('source_rat_id', rat.id)
          .eq('document_type', 'EIPD');
        
        if (count === 0) {
          ratsWithoutEIPD.push(rat);
        }
      }
      
      return ratsWithoutEIPD;
    } catch (error) {
      console.error('Error buscando RATs alto riesgo sin EIPD:', error);
      return [];
    }
  }

  async findOrphanDPOTasks(tenantId) {
    try {
      const { data: tasks } = await supabase
        .from('actividades_dpo')
        .select('id, rat_id, descripcion')
        .eq('tenant_id', tenantId)
        .eq('estado', 'pendiente')
        .not('rat_id', 'is', null);
      
      const orphanTasks = [];
      
      for (const task of tasks || []) {
        if (task.rat_id) {
          const ratExists = await this.checkRATExists(tenantId, task.rat_id);
          if (!ratExists) {
            orphanTasks.push(task);
          }
        }
      }
      
      return orphanTasks;
    } catch (error) {
      console.error('Error buscando tareas DPO huérfanas:', error);
      return [];
    }
  }

  async checkRATExists(tenantId, ratId) {
    try {
      const { count } = await supabase
        .from('mapeo_datos_rat')
        .select('id', { count: 'exact' })
        .eq('tenant_id', tenantId)
        .eq('id', ratId)
        .neq('estado', 'ELIMINADO');
      
      return count > 0;
    } catch (error) {
      return false;
    }
  }

  // 🔧 AUTO-CORRECCIONES ESPECÍFICAS
  async autoRegisterMissingInventory(tenantId, ratId) {
    try {
      const { data: rat } = await supabase
        .from('mapeo_datos_rat')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('id', ratId)
        .single();
      
      if (!rat) throw new Error('RAT no encontrado');
      
      const { data, error } = await supabase
        .from('inventario_rats')
        .insert({
          tenant_id: tenantId,
          rat_id: ratId,
          nombre_actividad: rat.nombre_actividad,
          area_responsable: rat.area_responsable,
          estado: 'ACTIVO',
          fecha_registro: new Date().toISOString(),
          metadata: {
            auto_registered_by: 'PREVENTIVE_AI',
            reason: 'MISSING_INVENTORY_DETECTED'
          }
        })
        .select()
        .single();
      
      if (error) throw error;
      
      console.log('✅ RAT registrado automáticamente en inventario:', ratId);
      return data;
    } catch (error) {
      console.error('❌ Error auto-registrando inventario:', error);
      throw error;
    }
  }

  async autoGenerateMissingEIPD(tenantId, ratId) {
    try {
      const { data: rat } = await supabase
        .from('mapeo_datos_rat')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('id', ratId)
        .single();
      
      if (!rat) throw new Error('RAT no encontrado');
      
      const { data, error } = await supabase
        .from('generated_documents')
        .insert({
          tenant_id: tenantId,
          source_rat_id: ratId,
          document_type: 'EIPD',
          title: `EIPD Auto-generada (IA Preventiva) - ${rat.nombre_actividad}`,
          content: {
            generated_by: 'PREVENTIVE_AI',
            reason: 'HIGH_RISK_RAT_DETECTED',
            timestamp: new Date().toISOString(),
            rat_data: rat
          },
          status: 'BORRADOR',
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      
      console.log('✅ EIPD auto-generada preventivamente:', data.id);
      return data;
    } catch (error) {
      console.error('❌ Error auto-generando EIPD:', error);
      throw error;
    }
  }

  async autoCleanupOrphanTask(tenantId, taskId) {
    try {
      const { data, error } = await supabase
        .from('actividades_dpo')
        .update({
          estado: 'OBSOLETA',
          updated_at: new Date().toISOString(),
          metadata: {
            cleaned_by: 'PREVENTIVE_AI',
            reason: 'ORPHAN_TASK_AUTO_CLEANUP'
          }
        })
        .eq('tenant_id', tenantId)
        .eq('id', taskId)
        .select()
        .single();
      
      if (error) throw error;
      
      console.log('✅ Tarea huérfana limpiada automáticamente:', taskId);
      return data;
    } catch (error) {
      console.error('❌ Error limpiando tarea huérfana:', error);
      throw error;
    }
  }
}

// Instancia singleton
const preventiveAI = new PreventiveAI();

export default preventiveAI;