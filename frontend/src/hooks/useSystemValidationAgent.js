/**
 * 🤖 HOOK PARA IA SYSTEM VALIDATION AGENT
 * Hook React que integra el agente de validación con los componentes
 */

import { useState, useEffect, useCallback } from 'react';
import systemValidationAgent from '../utils/systemValidationAgent';
import { supabase } from '../config/supabaseClient';

export const useSystemValidationAgent = (componentName = 'unknown') => {
  const [agentActive, setAgentActive] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [autoCorrections, setAutoCorrections] = useState([]);
  const [complianceScore, setComplianceScore] = useState(100);
  const [loading, setLoading] = useState(false);

  // 🔄 VALIDAR COMPONENTE AUTOMÁTICAMENTE
  const validateComponent = useCallback(async (formData = null) => {
    if (!agentActive) return;

    try {
      setLoading(true);
      
      // 1. Escanear HTML actual del componente
      const htmlState = await systemValidationAgent.scanSystemHTML();
      
      // 2. Cargar especificación
      const specification = await systemValidationAgent.loadSpecification();
      
      // 3. Detectar problemas
      const issues = await systemValidationAgent.detectIssues(specification, htmlState);
      
      // 4. Calcular score de compliance
      const score = systemValidationAgent.calculateComplianceScore(issues);
      setComplianceScore(score);
      
      // 5. Auto-corregir si está habilitado
      if (issues.missing_fields.length > 0 || issues.incorrect_validations.length > 0) {
        const corrections = await systemValidationAgent.autoCorrectIssues(issues);
        setAutoCorrections(prev => [...prev, ...corrections.applied]);
        
        // 6. Log en Supabase
        await logValidationActivity({
          component: componentName,
          issues_detected: issues,
          corrections_applied: corrections,
          compliance_score: score,
          form_data_provided: !!formData
        });
      }
      
      setValidationResult({
        issues,
        score,
        timestamp: new Date().toISOString(),
        component: componentName
      });
      
    } catch (error) {
      console.error('🤖 Hook: Error en validación automática', error);
    } finally {
      setLoading(false);
    }
  }, [agentActive, componentName]);

  // 🚀 ACTIVAR/DESACTIVAR AGENTE PARA ESTE COMPONENTE
  const toggleAgent = useCallback(async (active) => {
    try {
      setAgentActive(active);
      
      if (active) {
        await systemValidationAgent.initializeInProduction();
        // //console.log(`🤖 Agent activado para componente: ${componentName}`);
      } else {
        await systemValidationAgent.stopAgent();
        // //console.log(`🛑 Agent desactivado para componente: ${componentName}`);
      }
      
    } catch (error) {
      console.error('🤖 Hook: Error toggling agent');
    }
  }, [componentName]);

  // 🔍 VALIDAR CAMPO ESPECÍFICO
  const validateField = useCallback(async (fieldName, fieldValue, fieldSpec) => {
    if (!agentActive) return { valid: true, errors: [] };

    try {
      const validation = await systemValidationAgent.validateFieldCompliance(
        { name: fieldName, value: fieldValue },
        fieldSpec
      );
      
      return {
        valid: validation.length === 0,
        errors: validation,
        field: fieldName,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('🤖 Hook: Error validando campo');
      return { valid: false, errors: ['Error de validación'] };
    }
  }, [agentActive]);

  // 🚨 DETECTAR TRIGGERS COMPLIANCE EN TIEMPO REAL
  const checkComplianceTriggers = useCallback(async (formData) => {
    if (!agentActive || !formData) return { triggers: [], actions: [] };

    try {
      const triggers = [];
      const actions = [];
      
      // Detectar triggers DPIA
      const dpiaKeywords = ['biometrico', 'salud', 'racial', 'politica', 'religiosa'];
      const formText = JSON.stringify(formData).toLowerCase();
      
      dpiaKeywords.forEach(keyword => {
        if (formText.includes(keyword)) {
          triggers.push({
            type: 'DPIA',
            trigger: keyword,
            severity: 'critical',
            legal_basis: 'Art. 19 Ley 21.719'
          });
          
          actions.push({
            action: 'create_dpo_activity',
            document_type: 'DPIA',
            urgency: 'high',
            deadline_days: 30
          });
        }
      });
      
      // Detectar triggers PIA
      const piaKeywords = ['algoritmo', 'automatizada', 'scoring', 'inteligencia_artificial'];
      
      piaKeywords.forEach(keyword => {
        if (formText.includes(keyword)) {
          triggers.push({
            type: 'PIA',
            trigger: keyword,
            severity: 'high',
            legal_basis: 'Art. 20 Ley 21.719'
          });
          
          actions.push({
            action: 'create_dpo_activity',
            document_type: 'PIA', 
            urgency: 'medium',
            deadline_days: 15
          });
        }
      });

      // Log triggers detectados
      if (triggers.length > 0) {
        await logComplianceTriggers(triggers, actions, formData);
      }

      return { triggers, actions };
      
    } catch (error) {
      console.error('🤖 Hook: Error detectando triggers');
      return { triggers: [], actions: [] };
    }
  }, [agentActive]);

  // 📝 LOG DE ACTIVIDAD DE VALIDACIÓN
  const logValidationActivity = async (activityData) => {
    try {
      await supabase
        .from('agent_activity_log')
        .insert({
          agent_id: systemValidationAgent.agentId,
          activity_type: 'component_validation',
          activity_data: {
            ...activityData,
            hook_component: componentName
          },
          timestamp: new Date().toISOString()
        });
    } catch (error) {
      console.error('🤖 Hook: Error logging actividad');
    }
  };

  // 🚨 LOG DE TRIGGERS DE COMPLIANCE
  const logComplianceTriggers = async (triggers, actions, formData) => {
    try {
      await supabase
        .from('compliance_triggers_log')
        .insert({
          component: componentName,
          triggers_detected: triggers,
          actions_required: actions,
          form_data_hash: btoa(JSON.stringify(formData)).slice(0, 50),
          detected_at: new Date().toISOString(),
          agent_id: systemValidationAgent.agentId
        });
    } catch (error) {
      console.error('🤖 Hook: Error logging triggers');
    }
  };

  // 🎯 AUTO-INICIALIZAR AGENTE EN COMPONENTES CRÍTICOS
  useEffect(() => {
    const criticalComponents = [
      'RATSystemProfessional',
      'EmpresaDataManager', 
      'NotificacionesDPO',
      'ModuloEIPD'
    ];

    if (criticalComponents.includes(componentName)) {
      toggleAgent(true);
    }
  }, [componentName, toggleAgent]);

  // 🔄 VALIDACIÓN AUTOMÁTICA AL CAMBIAR DATOS
  useEffect(() => {
    if (agentActive) {
      const validationTimer = setTimeout(() => {
        validateComponent();
      }, 1000); // Validar 1 segundo después de cambios

      return () => clearTimeout(validationTimer);
    }
  }, [agentActive, validateComponent]);

  return {
    // Estado del agente
    agentActive,
    loading,
    complianceScore,
    validationResult,
    autoCorrections,
    
    // Funciones de control
    toggleAgent,
    validateComponent,
    validateField,
    checkComplianceTriggers,
    
    // Helpers
    isValidationPassing: complianceScore >= 85,
    hasActiveCorrections: autoCorrections.length > 0,
    needsAttention: validationResult?.issues?.compliance_violations?.length > 0
  };
};

export default useSystemValidationAgent;