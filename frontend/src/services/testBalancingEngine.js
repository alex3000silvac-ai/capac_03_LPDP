/**
 * ⚖️ TEST BALANCING INTERÉS LEGÍTIMO
 * IMPLEMENTACIÓN EXACTA DIAGRAMA LÍNEAS 313-355
 * Art. 12 f) Ley 21.719 - Evaluación equilibrio
 */

import { supabase } from '../config/supabaseClient';

class TestBalancingEngine {
  constructor() {
    // FACTORES EVALUACIÓN SEGÚN DIAGRAMA
    this.factoresInteres = {
      // INTERÉS LEGÍTIMO EMPRESA (LÍNEAS 316-320)
      tipos_interes: {
        seguridad_empresa: 8,
        prevencion_fraude: 9,
        mejora_servicios: 6,
        eficiencia_operacional: 5,
        marketing_directo: 4,
        investigacion_mercado: 6,
        cumplimiento_contractual: 7,
        proteccion_activos: 8
      },
      
      // NECESIDAD TRATAMIENTO (LÍNEAS 322-326)
      factores_necesidad: {
        datos_estrictamente_necesarios: 3,
        medios_menos_invasivos_disponibles: -5,
        proporcionalidad_adecuada: 2,
        imposible_sin_estos_datos: 4
      },

      // IMPACTO DERECHOS FUNDAMENTALES (LÍNEAS 328-333)
      factores_impacto: {
        expectativas_razonables: {
          cliente_existente: -2,
          primera_interaccion: -4,
          servicio_publico: -1,
          relacion_comercial: -2
        },
        intrusion_vida_privada: {
          datos_publicos: 1,
          datos_semiprivados: -3,
          datos_privados: -6,
          datos_intimos: -10
        },
        categorias_especiales: {
          trabajadores: -3,
          menores: -8,
          personas_vulnerables: -6,
          clientes_frecuentes: -1
        }
      }
    };
  }

  // EJECUTAR TEST BALANCING COMPLETO
  async ejecutarTestBalancing(ratData, tenantId) {
    try {
      // console.log('⚖️ Iniciando Test Balancing interés legítimo...');

      // PASO 1: EVALUAR INTERÉS LEGÍTIMO EMPRESA (LÍNEAS 316-320)
      const evaluacionInteres = this.evaluarInteresEmpresa(ratData);
      
      // PASO 2: EVALUAR NECESIDAD TRATAMIENTO (LÍNEAS 322-326)
      const evaluacionNecesidad = this.evaluarNecesidadTratamiento(ratData);
      
      // PASO 3: EVALUAR IMPACTO DERECHOS (LÍNEAS 328-333)
      const evaluacionImpacto = await this.evaluarImpactoDerechos(ratData, tenantId);

      // BALANZA FINAL (LÍNEAS 335-340)
      const resultadoBalanza = this.calcularBalanzaFinal(
        evaluacionInteres, 
        evaluacionNecesidad, 
        evaluacionImpacto
      );

      // DOCUMENTAR RESULTADO (LÍNEAS 342-347)
      const documentacion = this.documentarResultado(
        ratData, 
        evaluacionInteres, 
        evaluacionNecesidad, 
        evaluacionImpacto, 
        resultadoBalanza
      );

      // AUTO-EFECTOS OBLIGATORIOS (LÍNEAS 349-354)
      const efectos = await this.aplicarEfectosBalancing(resultadoBalanza, ratData, tenantId);

      return {
        resultado: resultadoBalanza.decision,
        puntuacion_empresa: evaluacionInteres.puntuacion,
        puntuacion_titular: evaluacionImpacto.puntuacion,
        balance_final: resultadoBalanza.balance,
        documentacion: documentacion,
        efectos_aplicados: efectos,
        requiere_medidas_adicionales: resultadoBalanza.requiere_medidas,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Error en Test Balancing:', error);
      return {
        resultado: 'ERROR',
        error: error.message,
        requiere_revision_manual: true
      };
    }
  }

  // EVALUAR INTERÉS LEGÍTIMO EMPRESA (LÍNEAS 316-320)
  evaluarInteresEmpresa(ratData) {
    let puntuacion = 0;
    const detalles = [];

    const finalidad = ratData.finalidad_principal?.toLowerCase() || '';

    // Identificar tipo interés
    let tipoInteres = null;
    if (finalidad.includes('seguridad') || finalidad.includes('fraude')) {
      tipoInteres = 'seguridad_empresa';
      puntuacion += this.factoresInteres.tipos_interes.seguridad_empresa;
      detalles.push('Interés en seguridad empresarial - Legítimo y actual');
    } else if (finalidad.includes('mejorar') || finalidad.includes('optimizar')) {
      tipoInteres = 'mejora_servicios';
      puntuacion += this.factoresInteres.tipos_interes.mejora_servicios;
      detalles.push('Interés en mejora servicios - Beneficio mutuo');
    } else if (finalidad.includes('marketing') || finalidad.includes('comercial')) {
      tipoInteres = 'marketing_directo';
      puntuacion += this.factoresInteres.tipos_interes.marketing_directo;
      detalles.push('Interés comercial - Debe ser proporcional');
    } else if (finalidad.includes('investigación') || finalidad.includes('análisis')) {
      tipoInteres = 'investigacion_mercado';
      puntuacion += this.factoresInteres.tipos_interes.investigacion_mercado;
      detalles.push('Interés en investigación - Innovación legítima');
    }

    // Validar es real y actual (no hipotético)
    if (ratData.descripcion && ratData.descripcion.length > 50) {
      puntuacion += 2;
      detalles.push('Interés específico y concreto bien documentado');
    } else {
      puntuacion -= 3;
      detalles.push('Interés muy genérico - Requiere especificación');
    }

    // Validar importancia para empresa
    if (tipoInteres === 'seguridad_empresa' || tipoInteres === 'cumplimiento_contractual') {
      puntuacion += 3;
      detalles.push('Interés crítico para operación empresarial');
    }

    return {
      puntuacion,
      tipo_interes: tipoInteres,
      detalles,
      es_legitimo: puntuacion >= 5,
      es_real_actual: puntuacion >= 3,
      importancia_alta: puntuacion >= 7
    };
  }

  // EVALUAR NECESIDAD TRATAMIENTO (LÍNEAS 322-326)
  evaluarNecesidadTratamiento(ratData) {
    let puntuacion = 0;
    const detalles = [];

    // Verificar datos estrictamente necesarios
    const categorias = ratData.categorias_datos || {};
    const totalCategorias = Object.keys(categorias).length;
    
    if (totalCategorias <= 2) {
      puntuacion += this.factoresInteres.factores_necesidad.datos_estrictamente_necesarios;
      detalles.push('Datos limitados y específicos');
    } else if (totalCategorias > 5) {
      puntuacion -= 4;
      detalles.push('Datos excesivos - Revisar proporcionalidad');
    }

    // Verificar medios menos invasivos
    if (ratData.base_licitud === 'interes_legitimo' && 
        (ratData.finalidad_principal?.includes('consentimiento posible') || 
         ratData.finalidad_principal?.includes('alternativa disponible'))) {
      puntuacion += this.factoresInteres.factores_necesidad.medios_menos_invasivos_disponibles;
      detalles.push('❌ Existen alternativas menos invasivas');
    } else {
      puntuacion += 2;
      detalles.push('No hay medios alternativos viables');
    }

    // Verificar proporcionalidad
    const finalidad = ratData.finalidad_principal?.toLowerCase() || '';
    if (finalidad.length > 100 && finalidad.includes('específicamente')) {
      puntuacion += this.factoresInteres.factores_necesidad.proporcionalidad_adecuada;
      detalles.push('Proporcionalidad bien fundamentada');
    }

    // Verificar imposibilidad sin datos
    if (ratData.descripcion?.includes('imposible') || ratData.descripcion?.includes('imprescindible')) {
      puntuacion += this.factoresInteres.factores_necesidad.imposible_sin_estos_datos;
      detalles.push('Tratamiento imposible sin estos datos específicos');
    }

    return {
      puntuacion,
      detalles,
      datos_necesarios: puntuacion >= 3,
      sin_alternativas: puntuacion >= 2,
      proporcional: puntuacion >= 1
    };
  }

  // EVALUAR IMPACTO DERECHOS FUNDAMENTALES (LÍNEAS 328-333)
  async evaluarImpactoDerechos(ratData, tenantId) {
    let puntuacion = 0;
    const detalles = [];

    // Evaluar expectativas razonables titular
    const relacion = await this.determinarRelacionTitular(ratData, tenantId);
    puntuacion += this.factoresInteres.factores_impacto.expectativas_razonables[relacion] || -4;
    detalles.push(`Relación ${relacion}: expectativas ${relacion === 'cliente_existente' ? 'altas' : 'bajas'}`);

    // Evaluar intrusión vida privada
    const nivelPrivacidad = this.determinarNivelPrivacidad(ratData.categorias_datos);
    puntuacion += this.factoresInteres.factores_impacto.intrusion_vida_privada[nivelPrivacidad] || -6;
    detalles.push(`Nivel privacidad ${nivelPrivacidad}: impacto ${nivelPrivacidad === 'datos_publicos' ? 'mínimo' : 'significativo'}`);

    // Evaluar categorías especiales titulares
    const categoriaEspecial = this.determinarCategoriaEspecialTitular(ratData);
    if (categoriaEspecial) {
      puntuacion += this.factoresInteres.factores_impacto.categorias_especiales[categoriaEspecial] || -6;
      detalles.push(`Titular ${categoriaEspecial}: protección reforzada requerida`);
    }

    return {
      puntuacion,
      detalles,
      impacto_bajo: puntuacion >= -2,
      impacto_medio: puntuacion >= -5 && puntuacion < -2,
      impacto_alto: puntuacion < -5,
      categoria_especial: categoriaEspecial,
      nivel_privacidad: nivelPrivacidad
    };
  }

  // CALCULAR BALANZA FINAL (LÍNEAS 335-340)
  calcularBalanzaFinal(evaluacionInteres, evaluacionNecesidad, evaluacionImpacto) {
    const pesoEmpresa = evaluacionInteres.puntuacion + evaluacionNecesidad.puntuacion;
    const pesoTitular = Math.abs(evaluacionImpacto.puntuacion);
    const balance = pesoEmpresa - pesoTitular;

    let decision;
    let requiere_medidas = false;

    if (balance >= 3) {
      decision = 'FAVORABLE_EMPRESA';
    } else if (balance >= 0) {
      decision = 'EQUILIBRADA';
      requiere_medidas = true;
    } else {
      decision = 'DESFAVORABLE';
    }

    return {
      peso_empresa: pesoEmpresa,
      peso_titular: pesoTitular,
      balance,
      decision,
      requiere_medidas,
      permitir_continuar: decision !== 'DESFAVORABLE',
      medidas_adicionales_requeridas: requiere_medidas
    };
  }

  // DOCUMENTAR RESULTADO (LÍNEAS 342-347)
  documentarResultado(ratData, evaluacionInteres, evaluacionNecesidad, evaluacionImpacto, resultadoBalanza) {
    const fecha = new Date().toLocaleDateString('es-CL');
    
    return {
      test_balancing_realizado: fecha,
      interes_legitimo: `${evaluacionInteres.tipo_interes}: ${evaluacionInteres.detalles.join('; ')}`,
      evaluacion_impacto: `Balance ${resultadoBalanza.decision}: Empresa ${resultadoBalanza.peso_empresa} pts vs Titular ${resultadoBalanza.peso_titular} pts`,
      medidas_mitigacion: resultadoBalanza.requiere_medidas ? 
        ['Transparencia reforzada', 'Derecho oposición facilitado', 'Monitoreo impacto', 'Revisión periódica'] : 
        ['Información transparente estándar', 'Derecho oposición disponible'],
      revision_programada: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('es-CL'), // +12 meses
      fundamento_tecnico: {
        metodologia: 'Test balancing conforme Art. 12 f) Ley 21.719',
        factores_considerados: [
          'Legitimidad e importancia interés empresa',
          'Necesidad específica del tratamiento',
          'Expectativas razonables titular',
          'Impacto en derechos fundamentales'
        ],
        resultado_numerico: `${resultadoBalanza.balance} (${resultadoBalanza.decision})`
      }
    };
  }

  // AUTO-EFECTOS OBLIGATORIOS (LÍNEAS 349-354)
  async aplicarEfectosBalancing(resultadoBalanza, ratData, tenantId) {
    const efectos = [];

    try {
      // SIEMPRE: requiere_eipd = true para interés legítimo
      await supabase
        .from('mapeo_datos_rat')
        .update({ 
          requiere_eipd: true,
          status: resultadoBalanza.permitir_continuar ? 'BALANCING_APROBADO' : 'BALANCING_RECHAZADO'
        })
        .eq('id', ratData.id);

      efectos.push('EIPD marcada como obligatoria');

      // Derecho oposición OBLIGATORIO
      const derechoOposicion = {
        rat_id: ratData.id,
        tenant_id: tenantId,
        tipo_actividad: 'IMPLEMENTAR_DERECHO_OPOSICION',
        descripcion: 'Configurar derecho oposición para interés legítimo',
        estado: 'pendiente',
        prioridad: 'ALTA',
        fecha_vencimiento: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        organizacion_id: 1,
        metadatos: {
          fundamento: 'Test balancing interés legítimo',
          resultado_balance: resultadoBalanza.decision
        }
      };

      const { data: actividadOposicion } = await supabase
        .from('actividades_dpo')
        .insert(derechoOposicion)
        .select()
        .single();

      efectos.push(`Actividad DPO creada: ${actividadOposicion.id}`);

      // Si DESFAVORABLE: ERROR crítico
      if (!resultadoBalanza.permitir_continuar) {
        const errorCritico = {
          rat_id: ratData.id,
          tenant_id: tenantId,
          tipo_actividad: 'ERROR_BALANCING_DESFAVORABLE',
          descripcion: '🚨 Test balancing DESFAVORABLE - Cambiar base legal obligatorio',
          estado: 'pendiente',
          prioridad: 'CRITICA',
          fecha_vencimiento: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          organizacion_id: 1,
          metadatos: {
            motivo_rechazo: 'Impacto titular supera interés empresa',
            accion_requerida: 'Cambiar a consentimiento o contrato'
          }
        };

        await supabase.from('actividades_dpo').insert(errorCritico);
        efectos.push('ERROR: Balancing desfavorable - Cambio base legal requerido');
      }

      // Si EQUILIBRADA: medidas adicionales
      if (resultadoBalanza.requiere_medidas) {
        const medidasAdicionales = {
          rat_id: ratData.id,
          tenant_id: tenantId,
          tipo_actividad: 'IMPLEMENTAR_MEDIDAS_BALANCING',
          descripcion: 'Implementar medidas adicionales por balancing equilibrado',
          estado: 'pendiente',
          prioridad: 'ALTA',
          fecha_vencimiento: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
          organizacion_id: 1,
          metadatos: {
            medidas_requeridas: resultadoBalanza.medidas_adicionales_requeridas
          }
        };

        await supabase.from('actividades_dpo').insert(medidasAdicionales);
        efectos.push('Medidas adicionales programadas');
      }

      return efectos;

    } catch (error) {
      console.error('❌ Error aplicando efectos balancing:', error);
      return ['ERROR aplicando efectos automáticos'];
    }
  }

  // DETERMINAR RELACIÓN CON TITULAR
  async determinarRelacionTitular(ratData, tenantId) {
    try {
      // Buscar si hay relación comercial previa
      const { data: relacionExistente } = await supabase
        .from('mapeo_datos_rat')
        .select('id')
        .eq('tenant_id', tenantId)
        .eq('responsable_proceso', ratData.responsable_proceso)
        .neq('id', ratData.id)
        .limit(1);

      if (relacionExistente?.length > 0) {
        return 'cliente_existente';
      }

      const finalidad = ratData.finalidad_principal?.toLowerCase() || '';
      if (finalidad.includes('empleado') || finalidad.includes('trabajador')) {
        return 'trabajadores';
      }
      if (finalidad.includes('público') || finalidad.includes('gobierno')) {
        return 'servicio_publico';
      }
      if (finalidad.includes('comercial') || finalidad.includes('venta')) {
        return 'relacion_comercial';
      }

      return 'primera_interaccion';
    } catch {
      return 'primera_interaccion';
    }
  }

  // DETERMINAR NIVEL PRIVACIDAD DATOS
  determinarNivelPrivacidad(categoriasDatos) {
    if (!categoriasDatos) return 'datos_privados';

    // Datos íntimos: sensibles, biométricos, genéticos
    if (categoriasDatos.sensibles_art14 || categoriasDatos.biometricos || categoriasDatos.geneticos) {
      return 'datos_intimos';
    }

    // Datos privados: financieros, salud, ubicación
    if (categoriasDatos.financieros || categoriasDatos.salud || categoriasDatos.ubicacion) {
      return 'datos_privados';
    }

    // Datos semiprivados: profesionales, comerciales
    if (categoriasDatos.laborales || categoriasDatos.comerciales) {
      return 'datos_semiprivados';
    }

    // Datos públicos: básicos de identificación
    return 'datos_publicos';
  }

  // DETERMINAR CATEGORÍA ESPECIAL TITULAR
  determinarCategoriaEspecialTitular(ratData) {
    const finalidad = ratData.finalidad_principal?.toLowerCase() || '';
    
    if (finalidad.includes('menor') || finalidad.includes('estudiante') || 
        (ratData.categorias_datos?.especiales?.menores?.length > 0)) {
      return 'menores';
    }
    if (finalidad.includes('empleado') || finalidad.includes('trabajador')) {
      return 'trabajadores';
    }
    if (finalidad.includes('vulnerable') || finalidad.includes('discapacidad')) {
      return 'personas_vulnerables';
    }
    if (finalidad.includes('cliente frecuente') || finalidad.includes('fidelización')) {
      return 'clientes_frecuentes';
    }

    return null;
  }
}

export default new TestBalancingEngine();