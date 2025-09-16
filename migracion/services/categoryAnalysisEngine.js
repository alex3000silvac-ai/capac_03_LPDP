/**
 * 🧠 ANÁLISIS AUTOMÁTICO POR SELECCIÓN DE CATEGORÍAS
 * IMPLEMENTACIÓN EXACTA DIAGRAMA LÍNEAS 162-228
 * Auto-evaluación según categorías seleccionadas
 */

import { supabase } from '../config/supabaseConfig';

class CategoryAnalysisEngine {
  constructor() {
    // REGLAS ESPECÍFICAS POR CATEGORÍA SEGÚN DIAGRAMA
    this.reglasAnalisis = {
      // DATOS SALUD (LÍNEAS 164-177)
      datos_salud: {
        validaciones: [
          'profesional_salud_autorizado',
          'registro_profesional_verificado',
          'autorizacion_especifica_salud'
        ],
        bases_legal_validas: ['consentimiento', 'interes_vital', 'obligacion_legal'],
        bases_legal_prohibidas: ['interes_legitimo'],
        auto_efectos: {
          requiere_eipd: true,
          evaluacion_especial: 'DATOS_SENSIBLES_SALUD',
          medidas_reforzadas: true,
          plazo_especifico: 'segun_finalidad'
        }
      },

      // DATOS BIOMÉTRICOS (LÍNEAS 179-194)
      datos_biometricos: {
        validaciones: [
          'realmente_necesarios',
          'alternativas_menos_invasivas',
          'documentacion_tecnica_especifica'
        ],
        bases_legal_validas: ['consentimiento'],
        auto_efectos: {
          requiere_eipd: true,
          requiere_dpia: true,
          consulta_previa_1000_titulares: true,
          medidas_tecnicas_obligatorias: [
            'encriptacion_especifica_biometrica',
            'almacenamiento_separado',
            'hash_irreversible',
            'eliminacion_segura_garantizada'
          ],
          plazo_maximo: 'estrictamente_necesario_revision_anual'
        }
      },

      // MENORES 14 AÑOS (LÍNEAS 196-211)
      menores_14: {
        validaciones: [
          'consentimiento_parental_especifico',
          'verificacion_identidad_padre_madre_tutor',
          'proceso_doble_verificacion',
          'informacion_adaptada_menores'
        ],
        bases_legal_validas: ['consentimiento'],
        bases_legal_prohibidas: ['interes_legitimo'],
        restricciones_automaticas: [
          'no_transferencias_internacionales_sin_garantias',
          'no_perfilado_marketing_directo',
          'plazo_hasta_mayoria_edad'
        ],
        auto_documentos: [
          'formulario_consentimiento_parental',
          'informacion_privacy_friendly',
          'procedimiento_revocacion_simplificado'
        ],
        supervision: 'revision_cada_6_meses'
      },

      // GEOLOCALIZACIÓN (LÍNEAS 213-228)
      geolocalizacion: {
        precision_evaluacion: {
          gps_exacto: { riesgo: 'ALTO', requiere_eipd: true },
          ciudad_region: { riesgo: 'MEDIO', requiere_eipd: false },
          pais: { riesgo: 'BAJO', requiere_eipd: false },
          ip_approximate: { riesgo: 'MINIMO', requiere_eipd: false }
        },
        finalidad_validacion: {
          seguridad: { justificado: true, tiempo_limitado: true },
          marketing_geografico: { opt_in_especifico: true },
          analisis_estadistico: { anonimizacion_obligatoria: true },
          tracking_comportamiento: { alto_riesgo: true, eipd_obligatoria: true }
        },
        transferencias_especiales: {
          gps_exacto_transferencia: 'autorizacion_agencia_posible',
          verificar_leyes_pais_destino: true,
          dpa_clausulas_geolocalizacion: true
        },
        derechos_reforzados: ['oposicion', 'portabilidad_facilitados']
      }
    };
  }

  // ANÁLISIS AUTOMÁTICO PRINCIPAL
  async analizarCategoriaSeleccionada(categoria, subcategoria, ratData, tenantId) {
    try {
      // //console.log(`🧠 Analizando categoría: ${categoria}.${subcategoria}`);

      let resultado = {
        categoria,
        subcategoria,
        analisis_completado: true,
        alertas: [],
        documentos_requeridos: [],
        auto_efectos: [],
        restricciones: [],
        validaciones_pendientes: []
      };

      // ANÁLISIS ESPECÍFICO POR CATEGORÍA
      switch (categoria) {
        case 'datos_salud':
          resultado = await this.analizarDatosSalud(ratData, tenantId, resultado);
          break;

        case 'datos_biometricos':
          resultado = await this.analizarDatosBiometricos(ratData, tenantId, resultado);
          break;

        case 'menores_14':
          resultado = await this.analizarMenores14(ratData, tenantId, resultado);
          break;

        case 'geolocalizacion':
          resultado = await this.analizarGeolocalizacion(ratData, tenantId, resultado);
          break;

        default:
          resultado.analisis_basico = true;
      }

      // GUARDAR RESULTADO ANÁLISIS solo si el RAT ya existe en BD
      if (ratData.id) {
        await this.guardarAnalisisCategoria(resultado, ratData.id, tenantId);
      } else {
        // //console.log('🔄 RAT sin ID - análisis temporal hasta que se guarde');
      }

      return resultado;

    } catch (error) {
      console.error('❌ Error análisis categoría:', error);
      return {
        categoria,
        subcategoria,
        error: error.message,
        requiere_revision_manual: true
      };
    }
  }

  // ANÁLISIS DATOS SALUD (LÍNEAS 164-177)
  async analizarDatosSalud(ratData, tenantId, resultado) {
    // ¿Es profesional de salud autorizado?
    const esAutorizado = await this.verificarProfesionalSalud(tenantId);
    if (!esAutorizado) {
      resultado.alertas.push({
        tipo: 'ERROR_CRITICO',
        mensaje: 'No es profesional de salud autorizado para tratar estos datos',
        accion: 'DETENER_PROCESO'
      });
      return resultado;
    }

    // Validar base de licitud específica
    if (ratData.base_licitud === 'interes_legitimo') {
      resultado.alertas.push({
        tipo: 'ERROR',
        mensaje: 'Interés legítimo NO permitido para datos salud',
        accion: 'CAMBIAR_BASE_LEGAL'
      });
    }

    // AUTO-MARCAR efectos obligatorios
    resultado.auto_efectos.push(
      { tipo: 'requiere_eipd', valor: true, fundamento: 'Art. 25 datos sensibles' },
      { tipo: 'evaluacion_especial', valor: 'DATOS_SENSIBLES_SALUD' },
      { tipo: 'medidas_reforzadas', valor: true }
    );

    // REQUERIR documentos específicos
    resultado.documentos_requeridos.push({
      tipo: 'CONSENTIMIENTO_SALUD_ESPECIFICO',
      urgencia: 'alta',
      plazo_dias: 15
    });

    return resultado;
  }

  // ANÁLISIS DATOS BIOMÉTRICOS (LÍNEAS 179-194)
  async analizarDatosBiometricos(ratData, tenantId, resultado) {
    // ¿Realmente necesarios?
    const necesidadJustificada = this.evaluarNecesidadBiometricos(ratData.finalidad_principal);
    if (!necesidadJustificada) {
      resultado.alertas.push({
        tipo: 'WARNING',
        mensaje: 'Datos biométricos pueden no ser necesarios para esta finalidad',
        accion: 'REVISAR_ALTERNATIVAS'
      });
    }

    // OBLIGATORIO: solo consentimiento
    if (ratData.base_licitud !== 'consentimiento') {
      resultado.alertas.push({
        tipo: 'ERROR',
        mensaje: 'Datos biométricos requieren CONSENTIMIENTO como única base legal válida',
        accion: 'CAMBIAR_BASE_LEGAL'
      });
    }

    // AUTO-EFECTOS OBLIGATORIOS
    resultado.auto_efectos.push(
      { tipo: 'requiere_eipd', valor: true },
      { tipo: 'requiere_dpia', valor: true },
      { tipo: 'consulta_previa', valor: 'si_mas_1000_titulares' }
    );

    // MEDIDAS TÉCNICAS OBLIGATORIAS
    resultado.restricciones.push({
      tipo: 'MEDIDAS_TECNICAS_OBLIGATORIAS',
      medidas: [
        'encriptacion_especifica_biometrica',
        'almacenamiento_separado_resto_datos',
        'hash_irreversible_template_matching',
        'eliminacion_segura_garantizada'
      ]
    });

    return resultado;
  }

  // ANÁLISIS MENORES 14 (LÍNEAS 196-211)
  async analizarMenores14(ratData, tenantId, resultado) {
    // OBLIGATORIO: Consentimiento parental
    if (ratData.base_licitud !== 'consentimiento') {
      resultado.alertas.push({
        tipo: 'ERROR_CRITICO',
        mensaje: 'Datos menores 14 años requieren CONSENTIMIENTO PARENTAL obligatorio',
        accion: 'CAMBIAR_BASE_LEGAL'
      });
    }

    // RESTRICCIONES AUTOMÁTICAS
    resultado.restricciones.push(
      { tipo: 'NO_INTERES_LEGITIMO', activo: true },
      { tipo: 'NO_TRANSFERENCIAS_SIN_GARANTIAS', activo: true },
      { tipo: 'NO_PERFILADO_MARKETING', activo: true },
      { tipo: 'PLAZO_HASTA_MAYORIA_EDAD', activo: true }
    );

    // AUTO-CREAR documentos específicos
    resultado.documentos_requeridos.push(
      { tipo: 'CONSENTIMIENTO_PARENTAL', urgencia: 'critica', plazo_dias: 7 },
      { tipo: 'INFORMACION_PRIVACY_FRIENDLY', urgencia: 'alta', plazo_dias: 10 },
      { tipo: 'PROCEDIMIENTO_REVOCACION_SIMPLIFICADO', urgencia: 'alta', plazo_dias: 10 }
    );

    // SUPERVISIÓN REFORZADA
    resultado.auto_efectos.push({
      tipo: 'supervision_reforzada',
      valor: 'revision_cada_6_meses'
    });

    return resultado;
  }

  // ANÁLISIS GEOLOCALIZACIÓN (LÍNEAS 213-228)
  async analizarGeolocalizacion(ratData, tenantId, resultado) {
    // EVALUAR PRECISIÓN
    const precision = this.determinarPrecisionGeo(ratData.descripcion);
    const reglaPrecision = this.reglasAnalisis.geolocalizacion.precision_evaluacion[precision];

    resultado.auto_efectos.push({
      tipo: 'nivel_riesgo_geo',
      valor: reglaPrecision.riesgo,
      requiere_eipd: reglaPrecision.requiere_eipd
    });

    // VALIDAR FINALIDAD
    const finalidadValidacion = this.validarFinalidadGeo(ratData.finalidad_principal);
    if (finalidadValidacion.restricciones) {
      resultado.restricciones.push(...finalidadValidacion.restricciones);
    }

    // TRANSFERENCIAS ESPECIALES
    if (ratData.transferencias_internacionales?.length > 0 && precision === 'gps_exacto') {
      resultado.alertas.push({
        tipo: 'WARNING',
        mensaje: 'GPS exacto + transferencia internacional requiere autorización Agencia',
        accion: 'CONSULTAR_AGENCIA'
      });
    }

    // DERECHOS REFORZADOS
    resultado.auto_efectos.push({
      tipo: 'derechos_reforzados',
      valor: ['derecho_oposicion_facilitado', 'derecho_portabilidad_facilitado']
    });

    return resultado;
  }

  // GUARDAR ANÁLISIS EN SUPABASE
  async guardarAnalisisCategoria(resultado, ratId, tenantId) {
    // 🔒 VALIDACIÓN CRÍTICA: No proceder si ratId es undefined
    if (!ratId || ratId === 'undefined') {
      // //console.warn('⚠️ guardarAnalisisCategoria: ratId inválido, omitiendo guardado');
      return;
    }

    const analisis = {
      rat_id: ratId,
      tenant_id: tenantId,
      categoria_analizada: resultado.categoria,
      subcategoria: resultado.subcategoria,
      resultado_analisis: resultado,
      timestamp: new Date().toISOString()
    };

    try {
      // Obtener datos actuales del RAT
      const { data: currentRat } = await supabase
        .from('mapeo_datos_rat')
        .select('metadata')
        .eq('id', ratId)
        .single();

      // Guardar en tabla mapeo_datos_rat.metadata
      await supabase
        .from('mapeo_datos_rat')
        .update({
          metadata: {
            ...currentRat?.metadata,
            analisis_categorias: {
              ...currentRat?.metadata?.analisis_categorias,
              [resultado.categoria]: resultado
            }
          }
        })
        .eq('id', ratId);
        
      // //console.log('✅ Análisis categoría guardado:', resultado.categoria);
    } catch (error) {
      console.error('❌ Error guardando análisis categoría:', error);
      // No lanzar error para no romper el flujo principal
    }
  }

  // HELPERS
  async verificarProfesionalSalud(tenantId) {
    // 🔒 VALIDACIÓN: No proceder si tenantId es inválido
    if (!tenantId || tenantId === 'undefined') {
      // //console.warn('⚠️ verificarProfesionalSalud: tenantId inválido');
      return false;
    }

    try {
      const { data: organizacion } = await supabase
        .from('organizaciones')
        .select('industry, metadata')
        .eq('id', tenantId)
        .single();

      return organizacion?.industry?.toLowerCase().includes('salud') ||
             organizacion?.metadata?.registro_profesional_salud === true;
    } catch (error) {
      console.error('❌ Error verificarProfesionalSalud:', error);
      return false;
    }
  }

  evaluarNecesidadBiometricos(finalidad) {
    const finalidadLower = finalidad?.toLowerCase() || '';
    const finalidadesJustificadas = [
      'control acceso', 'seguridad', 'autenticación', 
      'identificación única', 'prevención fraude'
    ];

    return finalidadesJustificadas.some(f => finalidadLower.includes(f));
  }

  determinarPrecisionGeo(descripcion) {
    const desc = descripcion?.toLowerCase() || '';
    
    if (desc.includes('gps') || desc.includes('coordenadas exactas')) {
      return 'gps_exacto';
    }
    if (desc.includes('ciudad') || desc.includes('región')) {
      return 'ciudad_region';
    }
    if (desc.includes('país')) {
      return 'pais';
    }
    return 'ip_approximate';
  }

  validarFinalidadGeo(finalidad) {
    const finalidadLower = finalidad?.toLowerCase() || '';
    
    if (finalidadLower.includes('seguridad')) {
      return { valida: true, tiempo_limitado: true };
    }
    if (finalidadLower.includes('marketing')) {
      return { 
        valida: true, 
        restricciones: [{ tipo: 'opt_in_especifico_requerido', activo: true }]
      };
    }
    if (finalidadLower.includes('estadístico')) {
      return { 
        valida: true, 
        restricciones: [{ tipo: 'anonimizacion_obligatoria', activo: true }]
      };
    }
    if (finalidadLower.includes('tracking') || finalidadLower.includes('seguimiento')) {
      return { 
        valida: true, 
        restricciones: [
          { tipo: 'alto_riesgo', activo: true },
          { tipo: 'eipd_obligatoria', activo: true }
        ]
      };
    }

    return { valida: false, requiere_justificacion: true };
  }
}

export default new CategoryAnalysisEngine();