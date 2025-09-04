// 🛡️ CONTROLADOR IA PREVENTIVA - ACTIVA AUTOMÁTICAMENTE
import React, { useEffect } from 'react';
import { useTenant } from '../contexts/TenantContext';
import { useAuth } from '../contexts/AuthContext';
import preventiveAI from '../utils/preventiveAI';
import logicAuditor from '../utils/logicAuditor';

const PreventiveAIController = () => {
  const { currentTenant } = useTenant();
  const { user } = useAuth();

  useEffect(() => {
    if (!currentTenant?.id || !user) return;

    // console.log('🛡️ Activando IA Preventiva para tenant:', currentTenant.id);

    // 1. Inicializar IA preventiva
    const initializePreventiveAI = async () => {
      try {
        // Activar monitoreo preventivo continuo
        preventiveAI.startPreventiveMonitoring(currentTenant.id);
        
        // Activar auditoría lógica periódica
        logicAuditor.startPeriodicAudit(currentTenant.id, 30); // Cada 30 min
        
        // Auditoría inicial para detectar problemas existentes
        const initialAudit = await logicAuditor.auditarSistemaCompleto(currentTenant.id);
        
        if (initialAudit.summary.failed_rules > 0) {
          // console.log('🔧 Problemas detectados - auto-corrigiendo preventivamente');
          await logicAuditor.autoFixInconsistencies(currentTenant.id, initialAudit);
        }
        
        // console.log('✅ IA Preventiva activada completamente');
        
      } catch (error) {
        console.error('❌ Error activando IA Preventiva:', error);
      }
    };

    initializePreventiveAI();

    // Cleanup al desmontar
    return () => {
      // console.log('🛡️ Desactivando IA Preventiva');
    };
  }, [currentTenant?.id, user]);

  // Este componente no renderiza nada - solo controla la IA
  return null;
};

export default PreventiveAIController;