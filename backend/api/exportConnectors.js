// 🚀 CONECTORES API EXPORTACIÓN - FASE 2
// Sistema de exportación a OneTrust, BigID, SOLUTORIA

class ExportConnectors {
  
  // 🎯 CONECTOR ONETRUST
  static async exportToOneTrust(ratData) {
    try {
      const oneTrustFormat = {
        dataProcessingActivity: {
          name: ratData.nombre_actividad,
          purpose: ratData.finalidad,
          legalBasis: this.mapLegalBasisChile(ratData.base_legal),
          dataCategories: this.mapDataCategoriesChile(ratData.datos_personales),
          dataSubjects: ratData.titular_datos,
          recipients: ratData.destinatarios,
          retentionPeriod: ratData.tiempo_conservacion,
          securityMeasures: ratData.medidas_seguridad,
          chileanCompliance: {
            lpdp21719: true,
            situacionSocioeconomica: ratData.datos_sensibles?.includes('situación socioeconómica'),
            sernapesca: ratData.industria === 'salmonera' ? ratData.regulaciones_especificas : null,
            dicom: ratData.industria === 'financiera' ? ratData.integraciones_terceros : null,
            fonasa: ratData.industria === 'salud' ? ratData.sistemas_salud : null
          }
        }
      };

      return {
        success: true,
        format: 'onetrust_xml',
        data: this.generateOneTrustXML(oneTrustFormat),
        migrationReadiness: this.calculateReadiness(ratData)
      };
      
    } catch (error) {
      return {
        success: false,
        error: `Error OneTrust export: ${error.message}`
      };
    }
  }

  // 🎯 CONECTOR BIGID
  static async exportToBigID(ratData) {
    try {
      const bigIdFormat = {
        dataAsset: {
          name: ratData.nombre_actividad,
          classification: this.mapClassificationChile(ratData.categoria_datos),
          sensitivityLevel: this.getSensitivityLevel(ratData.datos_sensibles),
          businessContext: {
            industry: ratData.industria,
            chileanRegulations: {
              lpdp: true,
              sernapesca: ratData.industria === 'salmonera',
              sernac: ratData.industria === 'retail',
              sbif: ratData.industria === 'financiera'
            }
          },
          dataFlow: {
            sources: ratData.origen_datos,
            destinations: ratData.destinatarios,
            processing: ratData.operaciones,
            retention: ratData.tiempo_conservacion
          },
          riskProfile: {
            privacyRisk: this.calculatePrivacyRisk(ratData),
            complianceRisk: this.calculateComplianceRisk(ratData),
            chileanSpecificRisks: this.getChileanRisks(ratData)
          }
        }
      };

      return {
        success: true,
        format: 'bigid_json',
        data: JSON.stringify(bigIdFormat, null, 2),
        discoveryMapping: this.generateDiscoveryMapping(ratData)
      };
      
    } catch (error) {
      return {
        success: false,
        error: `Error BigID export: ${error.message}`
      };
    }
  }

  // 🎯 CONECTOR SOLUTORIA
  static async exportToSOLUTORIA(ratData) {
    try {
      const solutoriaFormat = {
        registroRAT: {
          identificador: ratData.id,
          empresa: ratData.responsable_tratamiento,
          actividad: ratData.nombre_actividad,
          baseLegal: ratData.base_legal,
          finalidad: ratData.finalidad,
          datosTratados: ratData.datos_personales,
          origenes: ratData.origen_datos,
          destinatarios: ratData.destinatarios,
          transferenciasInternacionales: ratData.transferencias_internacionales,
          tiempoConservacion: ratData.tiempo_conservacion,
          medidasSeguridad: ratData.medidas_seguridad,
          cumplimientoLPDP: {
            ley21719: true,
            principios: this.validatePrinciples(ratData),
            derechosTitular: this.validateRights(ratData),
            evaluacionImpacto: ratData.requiere_evaluacion_impacto
          }
        }
      };

      return {
        success: true,
        format: 'solutoria_csv', 
        data: this.generateSOLUTORIACSV(solutoriaFormat),
        complianceReport: this.generateComplianceReport(ratData)
      };
      
    } catch (error) {
      return {
        success: false,
        error: `Error SOLUTORIA export: ${error.message}`
      };
    }
  }

  // 🧠 FUNCIONES AUXILIARES CHILE-ESPECÍFICAS
  static mapLegalBasisChile(baseLegal) {
    const mapping = {
      'consentimiento': 'consent',
      'interes_legitimo': 'legitimate_interest', 
      'cumplimiento_legal': 'legal_obligation',
      'cumplimiento_contractual': 'contract_performance',
      'interes_vital': 'vital_interest',
      'funcion_publica': 'public_task'
    };
    return mapping[baseLegal] || 'consent';
  }

  static mapDataCategoriesChile(datosPersonales) {
    const categories = [];
    
    if (datosPersonales?.includes('nombre')) categories.push('identity_data');
    if (datosPersonales?.includes('rut')) categories.push('chilean_identity');
    if (datosPersonales?.includes('email')) categories.push('contact_data');
    if (datosPersonales?.includes('situación socioeconómica')) categories.push('socioeconomic_data_chile');
    if (datosPersonales?.includes('datos biométricos')) categories.push('biometric_data');
    
    return categories;
  }

  static getChileanRisks(ratData) {
    const risks = [];
    
    if (ratData.datos_sensibles?.includes('situación socioeconómica')) {
      risks.push('socioeconomic_discrimination_risk');
    }
    
    if (ratData.industria === 'salmonera' && !ratData.regulaciones_especificas?.sernapesca) {
      risks.push('sernapesca_compliance_gap');
    }
    
    if (ratData.industria === 'financiera' && !ratData.integraciones_terceros?.dicom) {
      risks.push('financial_reporting_risk');
    }
    
    return risks;
  }

  // 📊 DASHBOARD READINESS PARA MEGASISTEMAS
  static generateReadinessReport(ratData) {
    const readiness = {
      oneTrust: {
        dataMapping: this.checkDataMapping(ratData),
        legalBasis: this.checkLegalBasis(ratData),
        workflows: this.checkWorkflows(ratData),
        score: 0
      },
      bigId: {
        classification: this.checkClassification(ratData),
        discovery: this.checkDiscovery(ratData),
        riskAssessment: this.checkRiskAssessment(ratData),
        score: 0
      },
      solutoria: {
        documentation: this.checkDocumentation(ratData),
        compliance: this.checkCompliance(ratData),
        reporting: this.checkReporting(ratData),
        score: 0
      }
    };

    // Calcular scores
    readiness.oneTrust.score = this.calculateOneTrustReadiness(readiness.oneTrust);
    readiness.bigId.score = this.calculateBigIDReadiness(readiness.bigId);
    readiness.solutoria.score = this.calculateSOLUTORIAReadiness(readiness.solutoria);

    return readiness;
  }
}

module.exports = ExportConnectors;