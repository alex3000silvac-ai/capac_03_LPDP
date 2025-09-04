// 🔍 IA AUDITOR LÓGICO - VALIDADOR AUTOMÁTICO DE PROCESOS Y SECUENCIAS
import { supabase } from '../config/supabaseClient';

class LogicAuditor {
  constructor() {
    this.auditResults = [];
    this.processValidations = new Map();
    this.sequenceRules = new Set();
    this.isAuditing = false;
    this.initializeRules();
  }

  // 🎯 REGLAS LÓGICAS SISTEMA LPDP
  initializeRules() {
    this.sequenceRules.add({
      id: 'RAT_EIPD_CONSISTENCY',
      description: 'Si RAT riesgo ALTO → DEBE existir EIPD',
      validate: async (tenantId) => {
        const ratsAltoRiesgo = await this.getRATsByRisk(tenantId, 'ALTO');
        const eipdsExistentes = await this.getEIPDsByRATs(tenantId, ratsAltoRiesgo.map(r => r.id));
        
        const inconsistencias = [];
        for (const rat of ratsAltoRiesgo) {
          const tieneEIPD = eipdsExistentes.some(e => e.source_rat_id === rat.id);
          if (!tieneEIPD) {
            inconsistencias.push({
              rat_id: rat.id,
              problema: 'RAT ALTO RIESGO SIN EIPD',
              descripcion: `RAT "${rat.nombre_actividad}" requiere EIPD pero no existe`
            });
          }
        }
        return inconsistencias;
      }
    });

    this.sequenceRules.add({
      id: 'EIPD_APPROVAL_CONSISTENCY', 
      description: 'Si EIPD existe → DEBE tener estado válido y aprobación DPO',
      validate: async (tenantId) => {
        const eipds = await this.getEIPDs(tenantId);
        const inconsistencias = [];
        
        for (const eipd of eipds) {
          // Verificar que EIPD tenga actividad DPO asociada
          const tareasEIPD = await this.getDPOTasksByEIPD(tenantId, eipd.id);
          
          if (eipd.status === 'APROBADO' && tareasEIPD.length === 0) {
            inconsistencias.push({
              eipd_id: eipd.id,
              problema: 'EIPD APROBADA SIN TAREA DPO',
              descripcion: `EIPD "${eipd.title}" está aprobada pero no tiene tarea DPO asociada`
            });
          }
        }
        return inconsistencias;
      }
    });

    this.sequenceRules.add({
      id: 'INVENTORY_SYNC_CONSISTENCY',
      description: 'Todo RAT creado → DEBE estar en inventario',
      validate: async (tenantId) => {
        const rats = await this.getAllRATs(tenantId);
        const inventario = await this.getInventarioRATs(tenantId);
        
        const inconsistencias = [];
        for (const rat of rats) {
          const estaEnInventario = inventario.some(inv => inv.rat_id === rat.id);
          if (!estaEnInventario) {
            inconsistencias.push({
              rat_id: rat.id,
              problema: 'RAT NO REGISTRADO EN INVENTARIO',
              descripcion: `RAT "${rat.nombre_actividad}" existe pero no está en inventario`
            });
          }
        }
        return inconsistencias;
      }
    });

    this.sequenceRules.add({
      id: 'DPO_TASKS_PENDING_CONSISTENCY',
      description: 'Si hay tareas DPO pendientes → DEBEN aparecer en todos los módulos',
      validate: async (tenantId) => {
        const tareasPendientes = await this.getDPOPendingTasks(tenantId);
        const inconsistencias = [];
        
        // Verificar que cada tarea pendiente tenga RAT asociado válido
        for (const tarea of tareasPendientes) {
          if (tarea.rat_id) {
            const ratExiste = await this.checkRATExists(tenantId, tarea.rat_id);
            if (!ratExiste) {
              inconsistencias.push({
                task_id: tarea.id,
                problema: 'TAREA DPO SIN RAT VÁLIDO',
                descripcion: `Tarea "${tarea.descripcion}" referencia RAT inexistente ${tarea.rat_id}`
              });
            }
          }
        }
        return inconsistencias;
      }
    });

    // //console.log('🔍 Reglas lógicas inicializadas:', this.sequenceRules.size);
  }

  // 🔍 AUDITORÍA COMPLETA SISTEMA
  async auditarSistemaCompleto(tenantId) {
    if (this.isAuditing) {
      // //console.log('⏳ Auditoría ya en progreso...');
      return;
    }

    this.isAuditing = true;
    // //console.log('🔍 INICIANDO AUDITORÍA LÓGICA COMPLETA');
    
    const auditReport = {
      tenant_id: tenantId,
      timestamp: new Date().toISOString(),
      status: 'COMPLETED',
      summary: {
        total_rules: this.sequenceRules.size,
        passed_rules: 0,
        failed_rules: 0,
        total_inconsistencies: 0
      },
      inconsistencies: [],
      recommendations: [],
      raw_counts: await this.getAllCounts(tenantId)
    };

    try {
      // Ejecutar todas las reglas de validación
      for (const rule of this.sequenceRules) {
        // //console.log(`🔍 Validando: ${rule.description}`);
        
        try {
          const inconsistencias = await rule.validate(tenantId);
          
          if (inconsistencias.length === 0) {
            auditReport.summary.passed_rules++;
            // //console.log(`✅ ${rule.id}: SIN PROBLEMAS`);
          } else {
            auditReport.summary.failed_rules++;
            auditReport.summary.total_inconsistencies += inconsistencias.length;
            auditReport.inconsistencies.push({
              rule_id: rule.id,
              rule_description: rule.description,
              issues: inconsistencias
            });
            // //console.log(`❌ ${rule.id}: ${inconsistencias.length} problemas`);
          }
        } catch (ruleError) {
          console.error(`Error validando regla ${rule.id}:`, ruleError);
          auditReport.inconsistencies.push({
            rule_id: rule.id,
            rule_description: rule.description,
            error: ruleError.message
          });
        }
      }

      // Generar recomendaciones automáticas
      auditReport.recommendations = await this.generateRecommendations(auditReport.inconsistencies);

      // Guardar reporte auditoría
      await this.saveAuditReport(auditReport);

      // //console.log('📊 AUDITORÍA COMPLETADA:', auditReport.summary);
      
      return auditReport;
      
    } catch (error) {
      console.error('❌ Error en auditoría:', error);
      auditReport.status = 'ERROR';
      auditReport.error = error.message;
      return auditReport;
    } finally {
      this.isAuditing = false;
    }
  }

  // 📊 CONTEOS MAESTROS PARA VERIFICACIÓN CRUZADA
  async getAllCounts(tenantId) {
    try {
      const [rats, eipds, tasks, inventory] = await Promise.all([
        supabase.from('mapeo_datos_rat').select('id', { count: 'exact' }).eq('tenant_id', tenantId),
        supabase.from('generated_documents').select('id', { count: 'exact' }).eq('document_type', 'EIPD'),
        supabase.from('actividades_dpo').select('id', { count: 'exact' }).eq('tenant_id', tenantId),
supabase.from('mapeo_datos_rat').select('id', { count: 'exact' }).eq('tenant_id', tenantId)
      ]);

      return {
        total_rats: rats.count || 0,
        total_eipds: eipds.count || 0, 
        total_dpo_tasks: tasks.count || 0,
        total_inventory_items: inventory.count || 0,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error obteniendo conteos:', error);
      return {};
    }
  }

  // 🔍 MÉTODOS AUXILIARES CONSULTA
  async getRATsByRisk(tenantId, riskLevel) {
    const { data, error } = await supabase
      .from('mapeo_datos_rat')
      .select('id, nombre_actividad, nivel_riesgo, estado')
      .eq('tenant_id', tenantId)
      .eq('nivel_riesgo', riskLevel)
      .neq('estado', 'ELIMINADO');
    
    if (error) throw error;
    return data || [];
  }

  async getEIPDsByRATs(tenantId, ratIds) {
    if (ratIds.length === 0) return [];
    
    const { data, error } = await supabase
      .from('generated_documents')
      .select('id, source_rat_id, status, title')
      .eq('document_type', 'EIPD')
      .in('source_rat_id', ratIds);
    
    if (error) throw error;
    return data || [];
  }

  async getAllRATs(tenantId) {
    const { data, error } = await supabase
      .from('mapeo_datos_rat')
      .select('id, nombre_actividad, estado')
      .eq('tenant_id', tenantId)
      .neq('estado', 'ELIMINADO');
    
    if (error) throw error;
    return data || [];
  }

  async getInventarioRATs(tenantId) {
    const { data, error } = await supabase
      .from('mapeo_datos_rat')
      .select('id, estado')
      .eq('tenant_id', tenantId);
    
    if (error) throw error;
    return (data || []).map(item => ({ ...item, rat_id: item.id }));
  }

  async getEIPDs(tenantId) {
    const { data, error } = await supabase
      .from('generated_documents')
      .select('id, source_rat_id, status, title')
      .eq('document_type', 'EIPD');
    
    if (error) throw error;
    return data || [];
  }

  async getDPOTasksByEIPD(tenantId, eipdId) {
    const { data, error } = await supabase
      .from('actividades_dpo')
      .select('id, descripcion, estado')
      .eq('tenant_id', tenantId)
      .like('descripcion', `%${eipdId}%`);
    
    if (error) throw error;
    return data || [];
  }

  async getDPOPendingTasks(tenantId) {
    const { data, error } = await supabase
      .from('actividades_dpo')
      .select('id, rat_id, descripcion, estado')
      .eq('tenant_id', tenantId)
      .eq('estado', 'pendiente');
    
    if (error) throw error;
    return data || [];
  }

  async checkRATExists(tenantId, ratId) {
    const { count, error } = await supabase
      .from('mapeo_datos_rat')
      .select('id', { count: 'exact' })
      .eq('tenant_id', tenantId)
      .eq('id', ratId)
      .neq('estado', 'ELIMINADO');
    
    return !error && count > 0;
  }

  // 🎯 GENERAR RECOMENDACIONES AUTOMÁTICAS
  async generateRecommendations(inconsistencies) {
    const recommendations = [];
    
    for (const category of inconsistencies) {
      for (const issue of category.issues || []) {
        switch (issue.problema) {
          case 'RAT ALTO RIESGO SIN EIPD':
            recommendations.push({
              action: 'AUTO_GENERATE_EIPD',
              rat_id: issue.rat_id,
              description: 'Generar EIPD automáticamente para RAT de alto riesgo',
              priority: 'ALTA',
              can_auto_fix: true
            });
            break;
            
          case 'RAT NO REGISTRADO EN INVENTARIO':
            recommendations.push({
              action: 'AUTO_REGISTER_INVENTORY',
              rat_id: issue.rat_id,
              description: 'Registrar RAT en inventario automáticamente',
              priority: 'MEDIA',
              can_auto_fix: true
            });
            break;
            
          case 'TAREA DPO SIN RAT VÁLIDO':
            recommendations.push({
              action: 'CLEANUP_ORPHAN_TASK',
              task_id: issue.task_id,
              description: 'Limpiar tarea DPO huérfana sin RAT válido',
              priority: 'BAJA',
              can_auto_fix: true
            });
            break;
        }
      }
    }
    
    return recommendations;
  }

  // 🔧 AUTO-CORRECCIÓN DE INCONSISTENCIAS
  async autoFixInconsistencies(tenantId, auditReport) {
    // //console.log('🔧 Iniciando auto-corrección de inconsistencias');
    
    const fixResults = [];
    
    for (const recommendation of auditReport.recommendations || []) {
      if (!recommendation.can_auto_fix) continue;
      
      try {
        let result = null;
        
        switch (recommendation.action) {
          case 'AUTO_GENERATE_EIPD':
            result = await this.autoGenerateEIPDForRAT(tenantId, recommendation.rat_id);
            break;
            
          case 'AUTO_REGISTER_INVENTORY':
            result = await this.autoRegisterRATInInventory(tenantId, recommendation.rat_id);
            break;
            
          case 'CLEANUP_ORPHAN_TASK':
            result = await this.cleanupOrphanTask(tenantId, recommendation.task_id);
            break;
        }
        
        fixResults.push({
          action: recommendation.action,
          id: recommendation.rat_id || recommendation.task_id,
          success: result !== null,
          result: result
        });
        
      } catch (error) {
        console.error(`Error auto-corrigiendo ${recommendation.action}:`, error);
        fixResults.push({
          action: recommendation.action,
          id: recommendation.rat_id || recommendation.task_id,
          success: false,
          error: error.message
        });
      }
    }
    
    // //console.log('🔧 Auto-corrección completada:', fixResults);
    return fixResults;
  }

  // 🔄 AUTO-CORRECCIONES ESPECÍFICAS
  async autoGenerateEIPDForRAT(tenantId, ratId) {
    try {
      const { data: rat } = await supabase
        .from('mapeo_datos_rat')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('id', ratId)
        .single();
      
      if (!rat) throw new Error('RAT no encontrado');
      
      const eipdData = {
        tenant_id: tenantId,
        source_rat_id: ratId,
        document_type: 'EIPD',
        title: `EIPD Auto-generada (Auditor IA) - ${rat.nombre_actividad}`,
        content: {
          rat_id: ratId,
          generated_by: 'LOGIC_AUDITOR',
          timestamp: new Date().toISOString(),
          auto_fix: true
        },
        status: 'BORRADOR',
        created_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('generated_documents')
        .insert(eipdData)
        .select()
        .single();
      
      if (error) throw error;
      
      // //console.log('✅ EIPD auto-generada por auditor:', data.id);
      return data;
    } catch (error) {
      console.error('❌ Error auto-generando EIPD:', error);
      throw error;
    }
  }

  async autoRegisterRATInInventory(tenantId, ratId) {
    try {
      const { data: rat } = await supabase
        .from('mapeo_datos_rat')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('id', ratId)
        .single();
      
      if (!rat) throw new Error('RAT no encontrado');
      
      const inventarioEntry = {
        tenant_id: tenantId,
        rat_id: ratId,
        nombre_actividad: rat.nombre_actividad,
        area_responsable: rat.area_responsable,
        estado: 'ACTIVO',
        fecha_registro: new Date().toISOString(),
        metadata: {
          auto_registered_by: 'LOGIC_AUDITOR',
          fix_timestamp: new Date().toISOString()
        }
      };
      
      const { data, error } = await supabase
        .from('mapeo_datos_rat')
        .update({
          metadata: {
            ...inventarioEntry.metadata,
            auto_inventory_registered: true
          }
        })
        .eq('id', inventarioEntry.rat_id)
        .select()
        .single();
      
      if (error) throw error;
      
      // //console.log('✅ RAT auto-registrado en inventario:', data.id);
      return data;
    } catch (error) {
      console.error('❌ Error auto-registrando en inventario:', error);
      throw error;
    }
  }

  async cleanupOrphanTask(tenantId, taskId) {
    try {
      const { data, error } = await supabase
        .from('actividades_dpo')
        .update({
          estado: 'OBSOLETA',
          updated_at: new Date().toISOString(),
          metadata: {
            cleaned_by: 'LOGIC_AUDITOR',
            reason: 'ORPHAN_TASK_NO_VALID_RAT'
          }
        })
        .eq('tenant_id', tenantId)
        .eq('id', taskId)
        .select()
        .single();
      
      if (error) throw error;
      
      // //console.log('✅ Tarea huérfana marcada como obsoleta:', data.id);
      return data;
    } catch (error) {
      console.error('❌ Error limpiando tarea huérfana:', error);
      throw error;
    }
  }

  // 💾 GUARDAR REPORTE AUDITORÍA
  async saveAuditReport(auditReport) {
    try {
      // Usar tabla real ia_agent_reports en lugar de vista audit_reports
      const { data, error } = await supabase
        .from('ia_agent_reports')
        .insert({
          report_id: `AUDIT_${Date.now()}`,
          report_type: 'LOGIC_AUDIT',
          report_data: {
            tenant_id: auditReport.tenant_id,
            status: auditReport.status,
            summary: auditReport.summary,
            details: auditReport,
            timestamp: auditReport.timestamp
          },
          created_at: auditReport.timestamp
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // //console.log('💾 Reporte auditoría guardado:', data.id);
      return data;
    } catch (error) {
      console.error('❌ Error guardando reporte:', error);
      return null;
    }
  }

  // 🔄 AUDITORÍA AUTOMÁTICA PERIÓDICA
  startPeriodicAudit(tenantId, intervalMinutes = 30) {
    // //console.log(`🔄 Iniciando auditoría automática cada ${intervalMinutes} minutos`);
    
    setInterval(async () => {
      try {
        const auditReport = await this.auditarSistemaCompleto(tenantId);
        
        // Si hay inconsistencias críticas, auto-corregir
        if (auditReport.summary.failed_rules > 0) {
          // //console.log('🔧 Inconsistencias detectadas - iniciando auto-corrección');
          await this.autoFixInconsistencies(tenantId, auditReport);
        }
        
      } catch (error) {
        console.error('Error en auditoría periódica:', error);
      }
    }, intervalMinutes * 60 * 1000);
  }

  // 🎯 VALIDACIÓN ESPECÍFICA ANTES DE ACCIONES CRÍTICAS
  async validateBeforeAction(tenantId, action, data) {
    // //console.log(`🔍 Validando antes de: ${action}`);
    
    switch (action) {
      case 'CLOSE_RAT':
        return await this.validateRATCanBeClosed(tenantId, data.rat_id);
      case 'APPROVE_EIPD':
        return await this.validateEIPDCanBeApproved(tenantId, data.eipd_id);
      case 'DELETE_RAT':
        return await this.validateRATCanBeDeleted(tenantId, data.rat_id);
      default:
        return { valid: true, message: 'Acción no requiere validación específica' };
    }
  }

  async validateRATCanBeClosed(tenantId, ratId) {
    try {
      const rat = await this.getRATById(tenantId, ratId);
      const validations = [];
      
      // 1. Verificar datos completos
      if (!rat.nombre_actividad || !rat.base_legal) {
        validations.push('Faltan datos básicos obligatorios');
      }
      
      // 2. Si riesgo alto, verificar EIPD
      if (rat.nivel_riesgo === 'ALTO') {
        const eipds = await this.getEIPDsByRATs(tenantId, [ratId]);
        if (eipds.length === 0) {
          validations.push('RAT alto riesgo requiere EIPD');
        } else if (!eipds.some(e => e.status === 'APROBADO')) {
          validations.push('EIPD debe estar aprobada por DPO');
        }
      }
      
      // 3. Verificar aprobación DPO
      const tareasDPO = await this.getDPOTasksByRAT(tenantId, ratId);
      if (!tareasDPO.some(t => t.estado === 'completada')) {
        validations.push('Requiere aprobación DPO');
      }
      
      return {
        valid: validations.length === 0,
        message: validations.length === 0 ? 'RAT puede cerrarse' : validations.join('; '),
        validations: validations
      };
      
    } catch (error) {
      return {
        valid: false,
        message: 'Error validando cierre RAT: ' + error.message
      };
    }
  }

  async getRATById(tenantId, ratId) {
    const { data, error } = await supabase
      .from('mapeo_datos_rat')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('id', ratId)
      .single();
    
    if (error) throw error;
    return data;
  }

  async getDPOTasksByRAT(tenantId, ratId) {
    const { data, error } = await supabase
      .from('actividades_dpo')
      .select('id, descripcion, estado')
      .eq('tenant_id', tenantId)
      .eq('rat_id', ratId);
    
    if (error) throw error;
    return data || [];
  }
}

// Instancia singleton
const logicAuditor = new LogicAuditor();

export default logicAuditor;