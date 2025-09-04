/**
 * 🔧 RAT EDIT MODE FIX - SOLUCIÓN DISPARIDAD CREAR VS EDITAR
 * 
 * Garantiza que el modo edición tenga exactamente las mismas
 * opciones y funcionalidades que el modo creación
 */

class RATEditModeFix {
  constructor() {
    this.editModeEnhancements = new Map();
    this.missingFeatures = [];
    this.setupEditModeEnhancements();
  }

  /**
   * ⚙️ CONFIGURAR MEJORAS PARA MODO EDICIÓN
   */
  setupEditModeEnhancements() {
    // Lista de funcionalidades que deben estar en ambos modos
    this.editModeEnhancements.set('COMPLETE_WIZARD_STEPS', {
      description: 'Todos los pasos del wizard disponibles',
      required: true,
      missing: false
    });

    this.editModeEnhancements.set('FULL_CATEGORIAS_SELECTION', {
      description: 'Selección completa de categorías de datos',
      required: true,
      missing: false
    });

    this.editModeEnhancements.set('COMPLETE_FINALIDADES', {
      description: 'Todas las opciones de finalidades',
      required: true,
      missing: false
    });

    this.editModeEnhancements.set('FULL_LEGITIMACION', {
      description: 'Todas las opciones de legitimación',
      required: true,
      missing: false
    });

    this.editModeEnhancements.set('COMPLETE_TRANSFERENCIAS', {
      description: 'Opciones completas de transferencias',
      required: true,
      missing: false
    });

    this.editModeEnhancements.set('MEDIDAS_SEGURIDAD_COMPLETE', {
      description: 'Todas las medidas de seguridad disponibles',
      required: true,
      missing: false
    });

    this.editModeEnhancements.set('EMPRESA_DATA_EDITING', {
      description: 'Capacidad de editar datos de empresa',
      required: true,
      missing: false
    });

    this.editModeEnhancements.set('WIZARD_NAVIGATION', {
      description: 'Navegación completa entre pasos',
      required: true,
      missing: false
    });

    this.editModeEnhancements.set('SAVE_PARTIAL_OPTIONS', {
      description: 'Opciones de guardado parcial',
      required: true,
      missing: false
    });
  }

  /**
   * 🔍 DETECTAR FUNCIONALIDADES FALTANTES EN MODO EDICIÓN
   */
  detectMissingFeatures(componentProps) {
    const { viewMode, currentStep, ratData, setRatData } = componentProps;
    const missing = [];

    if (viewMode === 'edit') {
      // Verificar que todos los pasos estén disponibles
      if (currentStep !== undefined && currentStep >= 0) {
        // Verificar navegación entre pasos
        if (!this.hasStepNavigation(componentProps)) {
          missing.push('WIZARD_NAVIGATION');
        }

        // Verificar funcionalidades por paso
        switch (currentStep) {
          case 0:
            if (!this.hasFullEmpresaOptions(componentProps)) {
              missing.push('EMPRESA_DATA_EDITING');
            }
            break;
          case 1:
            if (!this.hasFullCategoriasOptions(componentProps)) {
              missing.push('FULL_CATEGORIAS_SELECTION');
            }
            break;
          case 2:
            if (!this.hasFullFinalidadesOptions(componentProps)) {
              missing.push('COMPLETE_FINALIDADES');
            }
            break;
          case 3:
            if (!this.hasFullLegitimacionOptions(componentProps)) {
              missing.push('FULL_LEGITIMACION');
            }
            break;
          case 4:
            if (!this.hasFullTransferenciasOptions(componentProps)) {
              missing.push('COMPLETE_TRANSFERENCIAS');
            }
            break;
          case 5:
            if (!this.hasFullSeguridadOptions(componentProps)) {
              missing.push('MEDIDAS_SEGURIDAD_COMPLETE');
            }
            break;
        }
      }
    }

    this.missingFeatures = missing;
    return missing;
  }

  /**
   * 🧭 VERIFICAR NAVEGACIÓN ENTRE PASOS
   */
  hasStepNavigation(componentProps) {
    const { handleNextStep, handleBackStep } = componentProps;
    return typeof handleNextStep === 'function' && typeof handleBackStep === 'function';
  }

  /**
   * 🏢 VERIFICAR OPCIONES COMPLETAS EMPRESA
   */
  hasFullEmpresaOptions(componentProps) {
    const { ratData, setRatData, showEmpresaManager } = componentProps;
    
    // Debe permitir editar datos de empresa
    const hasEmpresaData = ratData?.responsable && 
                          typeof setRatData === 'function';
    
    // Debe permitir gestionar empresa
    const hasEmpresaManager = showEmpresaManager !== undefined;
    
    return hasEmpresaData && hasEmpresaManager;
  }

  /**
   * 📊 VERIFICAR OPCIONES COMPLETAS CATEGORÍAS
   */
  hasFullCategoriasOptions(componentProps) {
    const { ratData } = componentProps;
    
    // Verificar que las categorías estén disponibles para edición
    const hasCategoriasStructure = ratData?.categorias && 
                                  typeof ratData.categorias === 'object';
    
    return hasCategoriasStructure;
  }

  /**
   * 🎯 VERIFICAR OPCIONES COMPLETAS FINALIDADES
   */
  hasFullFinalidadesOptions(componentProps) {
    const { ratData } = componentProps;
    
    return ratData?.finalidades !== undefined;
  }

  /**
   * ⚖️ VERIFICAR OPCIONES COMPLETAS LEGITIMACIÓN
   */
  hasFullLegitimacionOptions(componentProps) {
    const { ratData } = componentProps;
    
    return ratData?.legitimacion !== undefined;
  }

  /**
   * 🌐 VERIFICAR OPCIONES COMPLETAS TRANSFERENCIAS
   */
  hasFullTransferenciasOptions(componentProps) {
    const { ratData } = componentProps;
    
    return ratData?.transferencias !== undefined;
  }

  /**
   * 🔒 VERIFICAR OPCIONES COMPLETAS SEGURIDAD
   */
  hasFullSeguridadOptions(componentProps) {
    const { ratData } = componentProps;
    
    return ratData?.medidas_seguridad !== undefined;
  }

  /**
   * 🔧 APLICAR CORRECCIONES PARA MODO EDICIÓN
   */
  applyEditModeFixes(componentProps) {
    const missing = this.detectMissingFeatures(componentProps);
    const fixes = [];

    if (missing.length === 0) {
      return { success: true, message: 'Modo edición completo' };
    }

    //console.log('🔧 Aplicando correcciones para modo edición...', missing);

    missing.forEach(feature => {
      switch (feature) {
        case 'WIZARD_NAVIGATION':
          fixes.push(this.fixWizardNavigation(componentProps));
          break;
        case 'EMPRESA_DATA_EDITING':
          fixes.push(this.fixEmpresaDataEditing(componentProps));
          break;
        case 'FULL_CATEGORIAS_SELECTION':
          fixes.push(this.fixCategoriasSelection(componentProps));
          break;
        case 'COMPLETE_FINALIDADES':
          fixes.push(this.fixFinalidadesOptions(componentProps));
          break;
        case 'FULL_LEGITIMACION':
          fixes.push(this.fixLegitimacionOptions(componentProps));
          break;
        case 'COMPLETE_TRANSFERENCIAS':
          fixes.push(this.fixTransferenciasOptions(componentProps));
          break;
        case 'MEDIDAS_SEGURIDAD_COMPLETE':
          fixes.push(this.fixSeguridadOptions(componentProps));
          break;
      }
    });

    return {
      success: true,
      appliedFixes: fixes,
      message: `${fixes.length} correcciones aplicadas`
    };
  }

  /**
   * 🧭 CORREGIR NAVEGACIÓN WIZARD
   */
  fixWizardNavigation(componentProps) {
    //console.log('🔧 Habilitando navegación completa en modo edición');
    
    // Asegurar que la navegación esté disponible
    if (!componentProps.handleNextStep) {
      componentProps.handleNextStep = () => {
        const { currentStep, setCurrentStep, steps } = componentProps;
        if (currentStep < steps.length - 1) {
          setCurrentStep(currentStep + 1);
        }
      };
    }

    if (!componentProps.handleBackStep) {
      componentProps.handleBackStep = () => {
        const { currentStep, setCurrentStep } = componentProps;
        if (currentStep > 0) {
          setCurrentStep(currentStep - 1);
        }
      };
    }

    return 'wizard_navigation_fixed';
  }

  /**
   * 🏢 CORREGIR EDICIÓN DATOS EMPRESA
   */
  fixEmpresaDataEditing(componentProps) {
    //console.log('🔧 Habilitando edición completa datos empresa');
    
    const { ratData, setRatData } = componentProps;
    
    // Asegurar estructura de datos empresa
    if (!ratData.responsable) {
      const updatedRatData = {
        ...ratData,
        responsable: {
          razonSocial: ratData.razon_social || '',
          rut: ratData.rut || '',
          direccion: ratData.direccion_empresa || '',
          nombre: ratData.dpo_nombre || '',
          email: ratData.email_empresa || '',
          telefono: ratData.telefono_empresa || ''
        }
      };
      
      if (setRatData) {
        setRatData(updatedRatData);
      }
    }

    return 'empresa_data_editing_fixed';
  }

  /**
   * 📊 CORREGIR SELECCIÓN CATEGORÍAS
   */
  fixCategoriasSelection(componentProps) {
    //console.log('🔧 Habilitando selección completa categorías');
    
    const { ratData, setRatData } = componentProps;
    
    if (!ratData.categorias) {
      const updatedRatData = {
        ...ratData,
        categorias: {
          identificacion: ratData.categoria_identificacion || [],
          personal: ratData.categoria_personal || [],
          financiera: ratData.categoria_financiera || [],
          salud: ratData.categoria_salud || [],
          otros: ratData.categoria_otros || []
        }
      };
      
      if (setRatData) {
        setRatData(updatedRatData);
      }
    }

    return 'categorias_selection_fixed';
  }

  /**
   * 🎯 CORREGIR OPCIONES FINALIDADES
   */
  fixFinalidadesOptions(componentProps) {
    //console.log('🔧 Habilitando opciones completas finalidades');
    
    const { ratData, setRatData } = componentProps;
    
    if (!ratData.finalidades) {
      const updatedRatData = {
        ...ratData,
        finalidades: ratData.finalidad || []
      };
      
      if (setRatData) {
        setRatData(updatedRatData);
      }
    }

    return 'finalidades_options_fixed';
  }

  /**
   * ⚖️ CORREGIR OPCIONES LEGITIMACIÓN
   */
  fixLegitimacionOptions(componentProps) {
    //console.log('🔧 Habilitando opciones completas legitimación');
    
    const { ratData, setRatData } = componentProps;
    
    if (!ratData.legitimacion) {
      const updatedRatData = {
        ...ratData,
        legitimacion: ratData.base_legitimacion || []
      };
      
      if (setRatData) {
        setRatData(updatedRatData);
      }
    }

    return 'legitimacion_options_fixed';
  }

  /**
   * 🌐 CORREGIR OPCIONES TRANSFERENCIAS
   */
  fixTransferenciasOptions(componentProps) {
    //console.log('🔧 Habilitando opciones completas transferencias');
    
    const { ratData, setRatData } = componentProps;
    
    if (!ratData.transferencias) {
      const updatedRatData = {
        ...ratData,
        transferencias: {
          internacionales: ratData.transferencia_internacional || false,
          paises: ratData.paises_transferencia || [],
          medidas: ratData.medidas_transferencia || []
        }
      };
      
      if (setRatData) {
        setRatData(updatedRatData);
      }
    }

    return 'transferencias_options_fixed';
  }

  /**
   * 🔒 CORREGIR OPCIONES SEGURIDAD
   */
  fixSeguridadOptions(componentProps) {
    //console.log('🔧 Habilitando opciones completas seguridad');
    
    const { ratData, setRatData } = componentProps;
    
    if (!ratData.medidas_seguridad) {
      const updatedRatData = {
        ...ratData,
        medidas_seguridad: {
          tecnicas: ratData.medidas_tecnicas || [],
          organizativas: ratData.medidas_organizativas || [],
          otras: ratData.otras_medidas || []
        }
      };
      
      if (setRatData) {
        setRatData(updatedRatData);
      }
    }

    return 'seguridad_options_fixed';
  }

  /**
   * 📊 GENERAR REPORTE DE MODO EDICIÓN
   */
  generateEditModeReport(componentProps) {
    const missing = this.detectMissingFeatures(componentProps);
    const total = this.editModeEnhancements.size;
    const available = total - missing.length;
    
    return {
      total_features: total,
      available_features: available,
      missing_features: missing.length,
      completeness_percentage: Math.round((available / total) * 100),
      missing_list: missing,
      recommendations: this.generateRecommendations(missing)
    };
  }

  /**
   * 💡 GENERAR RECOMENDACIONES
   */
  generateRecommendations(missing) {
    const recommendations = [];
    
    if (missing.includes('WIZARD_NAVIGATION')) {
      recommendations.push('Implementar navegación completa entre pasos en modo edición');
    }
    
    if (missing.includes('EMPRESA_DATA_EDITING')) {
      recommendations.push('Habilitar edición completa de datos de empresa');
    }
    
    if (missing.length > 3) {
      recommendations.push('Considerar unificar completamente la lógica de creación y edición');
    }
    
    return recommendations;
  }
}

// Instancia global del fix
const ratEditModeFix = new RATEditModeFix();

// Exports principales
export const detectEditModeIssues = (componentProps) =>
  ratEditModeFix.detectMissingFeatures(componentProps);

export const fixEditMode = (componentProps) =>
  ratEditModeFix.applyEditModeFixes(componentProps);

export const getEditModeReport = (componentProps) =>
  ratEditModeFix.generateEditModeReport(componentProps);

export default ratEditModeFix;