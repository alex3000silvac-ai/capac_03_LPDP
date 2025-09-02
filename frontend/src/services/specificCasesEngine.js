/**
 * ⚠️ CASUÍSTICAS ULTRA-ESPECÍFICAS
 * IMPLEMENTACIÓN EXACTA DIAGRAMA LÍNEAS 1172-1319
 * Flujos especializados por industria
 */

import { supabase } from '../config/supabaseClient';

class SpecificCasesEngine {
  constructor() {
    // CONFIGURACIÓN CASUÍSTICAS ESPECÍFICAS
    this.casuisticas = {
      // DATOS GENÉTICOS (LÍNEAS 1172-1218)
      datos_geneticos: {
        validaciones_obligatorias: [
          'laboratorio_autorizado_isp',
          'certificacion_tecnica_vigente',
          'personal_calificado_certificado'
        ],
        consentimiento_especifico: [
          'informacion_herencia_familiar',
          'posibles_discriminaciones_seguros_empleo',
          'derecho_no_saber_resultados',
          'asesoramiento_genetico_disponible'
        ],
        medidas_seguridad_extremas: [
          'encriptacion_especifica_geneticos',
          'acceso_restringido_personal_autorizado',
          'auditorias_seguridad_mensuales',
          'plan_contingencia_brechas'
        ],
        auto_efectos: {
          requiere_eipd: true,
          requiere_dpia: true,
          consulta_previa_agencia: true,
          consentimiento_especifico_genetico: true,
          revision_etica_obligatoria: true,
          medidas_seguridad_extremas: true,
          auditoria_trimestral: true,
          registro_autoridad_sanitaria: true
        }
      },

      // DECISIONES AUTOMÁTICAS FINANCIERAS (LÍNEAS 1220-1269)
      decisiones_financieras: {
        validaciones_supervision: [
          'autorizacion_cmf',
          'normas_generales_cmf_scoring',
          'modelo_estadistico_validado_risk_management',
          'factores_scoring_no_discriminatorios',
          'supervision_humana_real'
        ],
        obligatorio_art24: {
          prohibida_en_principio: true,
          excepcion_contrato: {
            condiciones: [
              'contrato_credito_requiere_evaluacion',
              'decision_factores_objetivos',
              'supervision_humana_decisiones_limite',
              'derecho_impugnacion_humana_siempre',
              'transparencia_factores_considerados'
            ]
          }
        },
        auto_efectos_regulatorios: {
          requiere_dpia: true,
          requiere_eipd: true,
          supervision_humana_obligatoria: true,
          transparencia_algoritmo: true,
          derecho_revision_humana: true,
          registro_cmf_requerido: true,
          auditoria_modelo_anual: true,
          stress_testing_algoritmo: true
        }
      },

      // INVESTIGACIÓN ACADÉMICA (LÍNEAS 1272-1319)
      investigacion_academica: {
        validaciones_eticas: [
          'aprobacion_comite_etica_universidad',
          'consentimiento_informado_investigacion',
          'beneficio_academico_justifica_recoleccion',
          'medidas_anonimizacion_post_investigacion',
          'derecho_retiro_sin_penalizacion'
        ],
        marco_legal_dual: {
          consentimiento: 'participacion_voluntaria',
          funcion_publica: 'obligaciones_educativas_basicas'
        },
        derechos_estudiantiles: [
          'participacion_voluntaria_sin_impacto_academico',
          'retiro_investigacion_sin_consecuencias',
          'informacion_resultados_si_desean',
          'anonimizacion_garantizada_publicaciones'
        ],
        auto_efectos_academicos: {
          requiere_eipd: true,
          consentimiento_investigacion_especifico: true,
          plan_anonimizacion_obligatorio: true,
          comite_etica_aprobacion_requerida: true,
          revision_semestral_continuidad: true,
          publicacion_resultados_anonimos: true
        }
      }
    };
  }

  // DETECTAR Y PROCESAR CASUÍSTICA ESPECÍFICA
  async procesarCasuisticaEspecifica(ratData, tenantId) {
    try {
      console.log('⚠️ Analizando casuísticas específicas...');

      const casuisticasDetectadas = await this.detectarCasuisticas(ratData, tenantId);
      const resultados = [];

      for (const casuistica of casuisticasDetectadas) {
        const resultado = await this.procesarCasuistica(casuistica, ratData, tenantId);
        resultados.push(resultado);
      }

      return {
        casuisticas_detectadas: casuisticasDetectadas.map(c => c.tipo),
        resultados_procesamiento: resultados,
        total_alertas: resultados.reduce((sum, r) => sum + (r.alertas?.length || 0), 0),
        total_documentos: resultados.reduce((sum, r) => sum + (r.documentos_generados?.length || 0), 0),
        requiere_atencion_especial: resultados.some(r => r.nivel_atencion === 'CRITICA')
      };

    } catch (error) {
      console.error('❌ Error procesando casuísticas:', error);
      return { error: error.message };
    }
  }

  // DETECTAR CASUÍSTICAS
  async detectarCasuisticas(ratData, tenantId) {
    const casuisticas = [];

    // Detectar datos genéticos
    if (this.contieneCategoria(ratData.categorias_datos, 'datos_geneticos')) {
      casuisticas.push({
        tipo: 'datos_geneticos',
        config: this.casuisticas.datos_geneticos,
        contexto: await this.obtenerContextoLaboratorio(tenantId)
      });
    }

    // Detectar decisiones financieras automáticas
    if (this.esDecisionFinanciera(ratData)) {
      casuisticas.push({
        tipo: 'decisiones_financieras',
        config: this.casuisticas.decisiones_financieras,
        contexto: await this.obtenerContextoFinanciero(tenantId)
      });
    }

    // Detectar investigación académica
    if (this.esInvestigacionAcademica(ratData, tenantId)) {
      casuisticas.push({
        tipo: 'investigacion_academica',
        config: this.casuisticas.investigacion_academica,
        contexto: await this.obtenerContextoAcademico(tenantId)
      });
    }

    return casuisticas;
  }

  // PROCESAR CASUÍSTICA ESPECÍFICA
  async procesarCasuistica(casuistica, ratData, tenantId) {
    const { tipo, config } = casuistica;

    switch (tipo) {
      case 'datos_geneticos':
        return await this.procesarCasoGeneticos(ratData, tenantId, config);
      
      case 'decisiones_financieras':
        return await this.procesarCasoFinanciero(ratData, tenantId, config);
      
      case 'investigacion_academica':
        return await this.procesarCasoAcademico(ratData, tenantId, config);
      
      default:
        return { error: `Casuística ${tipo} no implementada` };
    }
  }

  // PROCESAR CASO GENÉTICOS (LÍNEAS 1172-1218)
  async procesarCasoGeneticos(ratData, tenantId, config) {
    const resultado = {
      tipo: 'datos_geneticos',
      nivel_atencion: 'CRITICA',
      alertas: [],
      documentos_generados: [],
      efectos_aplicados: []
    };

    // Verificar laboratorio autorizado
    const autorizacionISP = await this.verificarAutorizacionISP(tenantId);
    if (!autorizacionISP) {
      resultado.alertas.push({
        tipo: 'ERROR_CRITICO',
        mensaje: 'Laboratorio no autorizado por ISP para análisis genético',
        bloquea_continuacion: true
      });
      return resultado;
    }

    // Aplicar auto-efectos obligatorios
    for (const [efecto, valor] of Object.entries(config.auto_efectos)) {
      await this.aplicarAutoEfecto(ratData.id, tenantId, efecto, valor);
      resultado.efectos_aplicados.push(`${efecto}: ${valor}`);
    }

    // Generar documentos específicos
    resultado.documentos_generados = await this.generarDocumentosGeneticos(ratData.id, tenantId);

    return resultado;
  }

  // PROCESAR CASO FINANCIERO (LÍNEAS 1220-1269)
  async procesarCasoFinanciero(ratData, tenantId, config) {
    const resultado = {
      tipo: 'decisiones_financieras',
      nivel_atencion: 'CRITICA',
      alertas: [],
      documentos_generados: [],
      efectos_aplicados: []
    };

    // Verificar autorización CMF
    const autorizacionCMF = await this.verificarAutorizacionCMF(tenantId);
    if (!autorizacionCMF) {
      resultado.alertas.push({
        tipo: 'ERROR_CRITICO',
        mensaje: 'Institución financiera requiere autorización CMF vigente',
        accion: 'VERIFICAR_REGISTRO_CMF'
      });
    }

    // Validar Art. 24 - Decisiones automatizadas
    if (ratData.decisiones_automatizadas) {
      resultado.alertas.push({
        tipo: 'WARNING_LEGAL',
        mensaje: 'Art. 24 Ley 21.719: Decisiones automatizadas prohibidas en principio',
        excepcion: 'Solo si necesaria para contrato + supervisión humana'
      });
    }

    // Aplicar efectos regulatorios
    for (const [efecto, valor] of Object.entries(config.auto_efectos_regulatorios)) {
      await this.aplicarAutoEfecto(ratData.id, tenantId, efecto, valor);
      resultado.efectos_aplicados.push(`${efecto}: ${valor}`);
    }

    return resultado;
  }

  // PROCESAR CASO ACADÉMICO (LÍNEAS 1272-1319)
  async procesarCasoAcademico(ratData, tenantId, config) {
    const resultado = {
      tipo: 'investigacion_academica',
      nivel_atencion: 'ALTA',
      alertas: [],
      documentos_generados: [],
      efectos_aplicados: []
    };

    // Verificar aprobación comité ética
    const comiteEtica = await this.verificarComiteEtica(tenantId);
    if (!comiteEtica) {
      resultado.alertas.push({
        tipo: 'REQUERIMIENTO',
        mensaje: 'Requiere aprobación Comité Ética universidad antes continuar',
        accion: 'OBTENER_APROBACION_ETICA'
      });
    }

    // Aplicar efectos académicos
    for (const [efecto, valor] of Object.entries(config.auto_efectos_academicos)) {
      await this.aplicarAutoEfecto(ratData.id, tenantId, efecto, valor);
      resultado.efectos_aplicados.push(`${efecto}: ${valor}`);
    }

    return resultado;
  }

  // HELPERS DE DETECCIÓN
  contieneCategoria(categorias, categoria) {
    if (!categorias) return false;
    
    return Object.values(categorias).some(subcats => 
      Array.isArray(subcats) ? subcats.includes(categoria) : 
      typeof subcats === 'object' ? Object.values(subcats).flat().includes(categoria) :
      false
    );
  }

  esDecisionFinanciera(ratData) {
    const finalidad = ratData.finalidad_principal?.toLowerCase() || '';
    const industria = ratData.area?.toLowerCase() || '';
    
    return (finalidad.includes('scoring') || finalidad.includes('crediticio') || 
            finalidad.includes('decisión automática')) &&
           (industria.includes('financiero') || industria.includes('banco'));
  }

  async esInvestigacionAcademica(ratData, tenantId) {
    const finalidad = ratData.finalidad_principal?.toLowerCase() || '';
    
    // Verificar si la organización es académica
    try {
      const { data: org } = await supabase
        .from('organizaciones')
        .select('industry, company_name')
        .eq('id', tenantId)
        .single();

      const esAcademica = org?.industry?.toLowerCase().includes('educacion') ||
                        org?.company_name?.toLowerCase().includes('universidad');

      return esAcademica && 
             (finalidad.includes('investigación') || finalidad.includes('estudio') || 
              finalidad.includes('académico'));
    } catch {
      return false;
    }
  }

  // APLICAR AUTO-EFECTO
  async aplicarAutoEfecto(ratId, tenantId, efecto, valor) {
    try {
      switch (efecto) {
        case 'requiere_eipd':
        case 'requiere_dpia':
          await supabase
            .from('mapeo_datos_rat')
            .update({ [efecto]: valor })
            .eq('id', ratId);
          break;

        case 'consulta_previa_agencia':
          if (valor) {
            await supabase.from('actividades_dpo').insert({
              rat_id: ratId,
              tenant_id: tenantId,
              tipo_actividad: 'CONSULTA_PREVIA_AGENCIA',
              descripcion: 'Consulta previa obligatoria por casuística específica',
              estado: 'pendiente',
              prioridad: 'CRITICA',
              fecha_vencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              organizacion_id: 1
            });
          }
          break;

        case 'auditoria_trimestral':
          if (valor) {
            await this.programarAuditoriasPeriodicas(ratId, tenantId, 'trimestral');
          }
          break;
      }
    } catch (error) {
      console.error(`❌ Error aplicando auto-efecto ${efecto}:`, error);
    }
  }

  // GENERAR DOCUMENTOS GENÉTICOS
  async generarDocumentosGeneticos(ratId, tenantId) {
    const documentos = [];

    const tiposDocumentos = [
      {
        tipo: 'EIPD_GENETICA',
        titulo: 'EIPD Específica Análisis Genético',
        template: 'eipd_genetica_v1'
      },
      {
        tipo: 'CONSENTIMIENTO_GENETICO',
        titulo: 'Formulario Consentimiento Genético Específico',
        template: 'consentimiento_genetico_v1'
      },
      {
        tipo: 'PROTOCOLO_SEGURIDAD_GENETICOS',
        titulo: 'Protocolo Seguridad Datos Genéticos',
        template: 'protocolo_seguridad_geneticos_v1'
      }
    ];

    for (const doc of tiposDocumentos) {
      try {
        const { data } = await supabase
          .from('generated_documents')
          .insert({
            rat_id: ratId,
            tenant_id: tenantId,
            document_type: doc.tipo,
            status: 'BORRADOR',
            document_data: {
              titulo: doc.titulo,
              template_usado: doc.template,
              generado_por: 'CASUISTICA_GENETICOS',
              requiere_revision_especialista: true
            }
          })
          .select()
          .single();

        documentos.push(data);
      } catch (error) {
        console.error(`Error generando documento ${doc.tipo}:`, error);
      }
    }

    return documentos;
  }

  // VERIFICACIONES ESPECÍFICAS
  async verificarAutorizacionISP(tenantId) {
    try {
      const { data: org } = await supabase
        .from('organizaciones')
        .select('metadata')
        .eq('id', tenantId)
        .single();

      return org?.metadata?.autorizacion_isp === true &&
             org?.metadata?.certificacion_genetica_vigente === true;
    } catch {
      return false;
    }
  }

  async verificarAutorizacionCMF(tenantId) {
    try {
      const { data: org } = await supabase
        .from('organizaciones')
        .select('industry, metadata')
        .eq('id', tenantId)
        .single();

      return org?.industry?.toLowerCase().includes('financier') &&
             org?.metadata?.registro_cmf_vigente === true;
    } catch {
      return false;
    }
  }

  async verificarComiteEtica(tenantId) {
    try {
      const { data: org } = await supabase
        .from('organizaciones')
        .select('metadata')
        .eq('id', tenantId)
        .single();

      return org?.metadata?.comite_etica_aprobacion === true;
    } catch {
      return false;
    }
  }

  // PROGRAMAR AUDITORÍAS PERIÓDICAS
  async programarAuditoriasPeriodicas(ratId, tenantId, frecuencia) {
    const intervalos = {
      trimestral: 90,
      mensual: 30,
      semanal: 7
    };

    const diasIntervalo = intervalos[frecuencia] || 90;
    
    for (let i = 1; i <= 4; i++) {
      const fechaAuditoria = new Date(Date.now() + (diasIntervalo * i) * 24 * 60 * 60 * 1000);
      
      await supabase.from('actividades_dpo').insert({
        rat_id: ratId,
        tenant_id: tenantId,
        tipo_actividad: `AUDITORIA_${frecuencia.toUpperCase()}`,
        descripcion: `Auditoría ${frecuencia} programada - Casuística específica`,
        estado: 'programada',
        prioridad: 'ALTA',
        fecha_vencimiento: fechaAuditoria,
        organizacion_id: 1,
        metadatos: {
          tipo_auditoria: frecuencia,
          numero_auditoria: i,
          automatica: true
        }
      });
    }
  }
}

export default new SpecificCasesEngine();