/**
 * 🧮 ALGORITMO RIESGO MULTI-DIMENSIONAL
 * IMPLEMENTACIÓN EXACTA DIAGRAMA LÍNEAS 610-701
 * Calcula riesgo automático según factores múltiples
 */

import { supabase } from '../config/supabaseClient';

class RiskCalculationEngine {
  constructor() {
    // ESTRUCTURA JSONB COMPLETA SEGÚN DIAGRAMA LÍNEAS 134-160
    this.categoriasPesos = {
      identificacion: {
        basicos: ['nombre', 'apellidos', 'rut', 'email'],
        contacto: ['telefono', 'direccion', 'codigo_postal'],
        identificadores: ['numero_cliente', 'codigo_empleado', 'matricula'],
        peso_individual: 1
      },
      sensibles_art14: {
        salud: ['historial_medico', 'diagnosticos', 'tratamientos'],
        biometricos: ['huella_dactilar', 'reconocimiento_facial', 'voz'],
        origen: ['raza', 'etnia', 'nacionalidad'],
        religion: ['creencias', 'afiliacion_religiosa'],
        ideologia: ['opinion_politica', 'sindical'],
        vida_sexual: ['orientacion', 'comportamiento_sexual'],
        peso_individual: 5
      },
      especiales: {
        menores: ['datos_menores_14', 'consentimiento_parental'],
        trabajadores: ['nomina', 'evaluaciones', 'disciplinarias'],
        financieros: ['ingresos', 'crediticio', 'patrimonio'],
        ubicacion: ['gps', 'ip_address', 'geolocation'],
        peso_individual: 3
      },
      tecnicas: {
        sistemas: ['logs', 'metadatos', 'cookies'],
        comportamiento: ['clicks', 'navegacion', 'preferencias'],
        dispositivo: ['mac_address', 'device_id', 'browser_fingerprint'],
        peso_individual: 2
      }
    };

    // PESOS FINALIDAD TRATAMIENTO (DIAGRAMA LÍNEAS 623-631)
    this.finalidadPesos = {
      cumplimiento_legal: 0,
      gestion_contractual: 1,
      marketing_basico: 2,
      marketing_dirigido: 4,
      analisis_comportamiento: 6,
      perfilado_avanzado: 8,
      decisiones_automatizadas: 10,
      investigacion_comportamiento: 9
    };

    // PESOS TRANSFERENCIAS INTERNACIONALES (LÍNEAS 633-640)
    this.transferenciasPesos = {
      solo_chile: 0,
      union_europea: 1,
      paises_adequados: 2,
      eeuu_privacy_shield: 3,
      eeuu_sin_shield: 5,
      paises_marco_similar: 4,
      paises_sin_marco: 8
    };

    // PESOS VOLUMEN PROCESAMIENTO (LÍNEAS 642-648)
    this.volumenPesos = {
      menos_100: 0,
      100_1000: 1,
      1000_10000: 2,
      10000_100000: 4,
      100000_1000000: 6,
      mas_1000000: 8
    };

    // PESOS TECNOLOGÍA (LÍNEAS 650-658)
    this.tecnologiaPesos = {
      almacenamiento_simple: 0,
      bases_datos_relacionales: 1,
      analisis_manual: 1,
      automatizacion_basica: 2,
      inteligencia_artificial: 6,
      machine_learning: 7,
      deep_learning: 8,
      algoritmos_decisionales: 10
    };
  }

  // FÓRMULA FINAL DIAGRAMA LÍNEA 661
  async calcularRiesgoTotal(ratData, tenantId) {
    try {
      // console.log('🧮 Iniciando cálculo riesgo multi-dimensional...');

      const puntosCategorias = this.calcularPuntosCategorias(ratData.categorias_datos);
      const puntosFinalidad = this.calcularPuntosFinalidad(ratData.finalidad_principal);
      const puntosTransferencias = await this.calcularPuntosTransferencias(ratData.transferencias_internacionales, tenantId);
      const puntosVolumen = this.calcularPuntosVolumen(ratData.volumen_estimado);
      const puntosTecnologia = this.calcularPuntosTecnologia(ratData.tecnologia_utilizada);

      const riesgoTotal = puntosCategorias + puntosFinalidad + puntosTransferencias + puntosVolumen + puntosTecnologia;

      // console.log('📊 Desglose puntuación riesgo:', {
        categorias: puntosCategorias,
        finalidad: puntosFinalidad,
        transferencias: puntosTransferencias,
        volumen: puntosVolumen,
        tecnologia: puntosTecnologia,
        total: riesgoTotal
      });

      // CLASIFICACIÓN RIESGO SEGÚN DIAGRAMA LÍNEAS 663-700
      const clasificacion = this.clasificarRiesgo(riesgoTotal);
      
      // AUTO-EFECTOS POR NIVEL RIESGO (LÍNEAS 704-747)
      const efectos = await this.aplicarAutoEfectos(clasificacion, ratData, tenantId);

      return {
        puntuacion_total: riesgoTotal,
        nivel_riesgo: clasificacion.nivel,
        clasificacion: clasificacion,
        desglose: {
          categorias: puntosCategorias,
          finalidad: puntosFinalidad,
          transferencias: puntosTransferencias,
          volumen: puntosVolumen,
          tecnologia: puntosTecnologia
        },
        efectos_aplicados: efectos,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Error calculando riesgo:', error);
      return {
        puntuacion_total: 0,
        nivel_riesgo: 'ERROR',
        error: error.message
      };
    }
  }

  // CÁLCULO PUNTOS CATEGORÍAS DATOS
  calcularPuntosCategorias(categoriasDatos) {
    if (!categoriasDatos || typeof categoriasDatos !== 'object') return 0;

    let puntos = 0;

    // Contar datos básicos (peso 1x)
    if (categoriasDatos.identificacion) {
      const totalBasicos = (categoriasDatos.identificacion.basicos?.length || 0) +
                          (categoriasDatos.identificacion.contacto?.length || 0) +
                          (categoriasDatos.identificacion.identificadores?.length || 0);
      puntos += totalBasicos * 1;
    }

    // Contar datos sensibles Art. 14 (peso 5x)
    if (categoriasDatos.sensibles_art14) {
      const totalSensibles = Object.values(categoriasDatos.sensibles_art14)
        .reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0);
      puntos += totalSensibles * 5;
    }

    // Contar datos especiales (peso 3x)
    if (categoriasDatos.especiales) {
      const totalEspeciales = Object.values(categoriasDatos.especiales)
        .reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0);
      puntos += totalEspeciales * 3;
    }

    // Contar datos técnicos (peso 2x)
    if (categoriasDatos.tecnicas) {
      const totalTecnicas = Object.values(categoriasDatos.tecnicas)
        .reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0);
      puntos += totalTecnicas * 2;
    }

    return puntos;
  }

  // CÁLCULO PUNTOS FINALIDAD
  calcularPuntosFinalidad(finalidad) {
    if (!finalidad) return 0;

    const finalidadLower = finalidad.toLowerCase();
    
    if (finalidadLower.includes('decisiones automáticas') || finalidadLower.includes('algoritmo')) {
      return this.finalidadPesos.decisiones_automatizadas;
    }
    if (finalidadLower.includes('perfilado') || finalidadLower.includes('segmentación')) {
      return this.finalidadPesos.perfilado_avanzado;
    }
    if (finalidadLower.includes('comportamiento') || finalidadLower.includes('análisis usuario')) {
      return this.finalidadPesos.analisis_comportamiento;
    }
    if (finalidadLower.includes('marketing') && finalidadLower.includes('dirigido')) {
      return this.finalidadPesos.marketing_dirigido;
    }
    if (finalidadLower.includes('marketing')) {
      return this.finalidadPesos.marketing_basico;
    }
    if (finalidadLower.includes('contrato') || finalidadLower.includes('comercial')) {
      return this.finalidadPesos.gestion_contractual;
    }
    if (finalidadLower.includes('legal') || finalidadLower.includes('cumplimiento')) {
      return this.finalidadPesos.cumplimiento_legal;
    }

    return 2; // Finalidad genérica
  }

  // CÁLCULO PUNTOS TRANSFERENCIAS
  async calcularPuntosTransferencias(transferencias, tenantId) {
    if (!transferencias || !Array.isArray(transferencias)) return 0;

    let puntos = 0;

    for (const transferencia of transferencias) {
      const pais = transferencia.pais?.toLowerCase();
      
      if (!pais || pais === 'chile') {
        puntos += this.transferenciasPesos.solo_chile;
      } else if (['alemania', 'francia', 'españa', 'italia', 'holanda'].includes(pais)) {
        puntos += this.transferenciasPesos.union_europea;
      } else if (['reino unido', 'suiza', 'canadá', 'japón', 'argentina'].includes(pais)) {
        puntos += this.transferenciasPesos.paises_adequados;
      } else if (pais === 'estados unidos') {
        // Verificar si tiene Privacy Shield
        const tienePrivacyShield = await this.verificarPrivacyShield(transferencia.proveedor_id);
        puntos += tienePrivacyShield ? 
          this.transferenciasPesos.eeuu_privacy_shield : 
          this.transferenciasPesos.eeuu_sin_shield;
      } else if (['brasil', 'méxico'].includes(pais)) {
        puntos += this.transferenciasPesos.paises_marco_similar;
      } else {
        puntos += this.transferenciasPesos.paises_sin_marco;
      }
    }

    return puntos;
  }

  // VERIFICAR PRIVACY SHIELD
  async verificarPrivacyShield(proveedorId) {
    if (!proveedorId) return false;

    try {
      const { data: proveedor } = await supabase
        .from('proveedores')
        .select('evaluacion_seguridad')
        .eq('id', proveedorId)
        .single();

      return proveedor?.evaluacion_seguridad?.certificaciones?.includes('Privacy Shield 2.0') || false;
    } catch {
      return false;
    }
  }

  // CÁLCULO PUNTOS VOLUMEN
  calcularPuntosVolumen(volumen) {
    if (!volumen) return 0;

    const volumenNum = parseInt(volumen) || 0;

    if (volumenNum < 100) return this.volumenPesos.menos_100;
    if (volumenNum < 1000) return this.volumenPesos[100_1000];
    if (volumenNum < 10000) return this.volumenPesos[1000_10000];
    if (volumenNum < 100000) return this.volumenPesos[10000_100000];
    if (volumenNum < 1000000) return this.volumenPesos[100000_1000000];
    return this.volumenPesos.mas_1000000;
  }

  // CÁLCULO PUNTOS TECNOLOGÍA
  calcularPuntosTecnologia(tecnologia) {
    if (!tecnologia) return 0;

    const tecLower = tecnologia.toLowerCase();

    if (tecLower.includes('decisiones automáticas') || tecLower.includes('algoritmo decisional')) {
      return this.tecnologiaPesos.algoritmos_decisionales;
    }
    if (tecLower.includes('deep learning') || tecLower.includes('neural')) {
      return this.tecnologiaPesos.deep_learning;
    }
    if (tecLower.includes('machine learning') || tecLower.includes('ml')) {
      return this.tecnologiaPesos.machine_learning;
    }
    if (tecLower.includes('inteligencia artificial') || tecLower.includes('ia')) {
      return this.tecnologiaPesos.inteligencia_artificial;
    }
    if (tecLower.includes('automatización') || tecLower.includes('procesos automáticos')) {
      return this.tecnologiaPesos.automatizacion_basica;
    }
    if (tecLower.includes('base datos') || tecLower.includes('sql')) {
      return this.tecnologiaPesos.bases_datos_relacionales;
    }
    if (tecLower.includes('manual') || tecLower.includes('revisión humana')) {
      return this.tecnologiaPesos.analisis_manual;
    }

    return this.tecnologiaPesos.almacenamiento_simple;
  }

  // CLASIFICACIÓN RIESGO SEGÚN DIAGRAMA LÍNEAS 663-700
  clasificarRiesgo(puntuacionTotal) {
    if (puntuacionTotal <= 5) {
      return {
        nivel: 'MINIMO',
        color: '#10b981',
        requiere_eipd: false,
        requiere_dpia: false,
        proceso_simplificado: true,
        aprobacion_automatica: true,
        revision_anual: true,
        descripcion: 'Riesgo mínimo - Proceso simplificado'
      };
    }

    if (puntuacionTotal <= 12) {
      return {
        nivel: 'BAJO',
        color: '#22c55e',
        requiere_eipd: false,
        revision_dpo_recomendada: true,
        monitoreo_semestral: true,
        documentacion_basica: true,
        descripcion: 'Riesgo bajo - Revisión DPO recomendada'
      };
    }

    if (puntuacionTotal <= 20) {
      return {
        nivel: 'MEDIO',
        color: '#f59e0b',
        requiere_eipd: false,
        revision_dpo_obligatoria: true,
        monitoreo_trimestral: true,
        documentacion_reforzada: true,
        medidas_adicionales_recomendadas: true,
        descripcion: 'Riesgo medio - Revisión DPO obligatoria'
      };
    }

    if (puntuacionTotal <= 30) {
      return {
        nivel: 'ALTO',
        color: '#ef4444',
        requiere_eipd: true,
        revision_dpo_previa: true,
        monitoreo_mensual: true,
        medidas_mitigacion_obligatorias: true,
        consulta_agencia_recomendada: true,
        documentacion_exhaustiva: true,
        descripcion: 'Riesgo alto - EIPD obligatoria'
      };
    }

    return {
      nivel: 'CRITICO',
      color: '#dc2626',
      requiere_eipd: true,
      requiere_dpia: true,
      consulta_previa_agencia: true,
      aprobacion_dpo_previa: true,
      medidas_excepcionales: true,
      monitoreo_continuo: true,
      revision_semanal: true,
      posible_prohibicion: true,
      descripcion: 'Riesgo crítico - Consulta previa Agencia obligatoria'
    };
  }

  // AUTO-EFECTOS POR NIVEL RIESGO (DIAGRAMA LÍNEAS 704-747)
  async aplicarAutoEfectos(clasificacion, ratData, tenantId) {
    const efectos = [];

    if (clasificacion.nivel === 'ALTO' || clasificacion.nivel === 'CRITICO') {
      // GENERAR EIPD AUTOMÁTICA
      const eipd = await this.generarEIPDAutomatica(ratData, tenantId, clasificacion);
      efectos.push({ tipo: 'EIPD_GENERADA', id: eipd.id });

      // CREAR ACTIVIDAD DPO
      const actividadDPO = await this.crearActividadDPO(ratData, tenantId, clasificacion);
      efectos.push({ tipo: 'ACTIVIDAD_DPO_CREADA', id: actividadDPO.id });

      // CREAR NOTIFICACIÓN DPO
      const notificacion = await this.crearNotificacionDPO(ratData, tenantId, clasificacion);
      efectos.push({ tipo: 'NOTIFICACION_ENVIADA', id: notificacion.id });
    }

    if (clasificacion.nivel === 'CRITICO') {
      // EFECTOS ADICIONALES RIESGO CRÍTICO
      const dpia = await this.generarDPIAAutomatica(ratData, tenantId);
      efectos.push({ tipo: 'DPIA_GENERADA', id: dpia.id });

      const alertaSistema = await this.crearAlertaSistema(ratData, tenantId);
      efectos.push({ tipo: 'ALERTA_CRITICA', id: alertaSistema.id });
    }

    return efectos;
  }

  // GENERAR EIPD AUTOMÁTICA
  async generarEIPDAutomatica(ratData, tenantId, clasificacion) {
    const eipdData = {
      rat_id: ratData.id,
      tenant_id: tenantId,
      document_type: 'EIPD',
      status: 'BORRADOR',
      document_data: {
        titulo: `EIPD - ${ratData.nombre_actividad}`,
        nivel_riesgo: clasificacion.nivel,
        factores_riesgo: clasificacion.descripcion,
        medidas_mitigacion: this.generarMedidasMitigacion(clasificacion),
        generated_by: 'SISTEMA_IA',
        template_version: '3.1.0'
      },
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('generated_documents')
      .insert(eipdData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // CREAR ACTIVIDAD DPO
  async crearActividadDPO(ratData, tenantId, clasificacion) {
    const actividad = {
      rat_id: ratData.id,
      tenant_id: tenantId,
      tipo_actividad: clasificacion.nivel === 'CRITICO' ? 
        'REVISAR_RIESGO_CRITICO' : 'REVISAR_EIPD_ALTO_RIESGO',
      descripcion: `RAT ${clasificacion.nivel.toLowerCase()} riesgo - ${clasificacion.descripcion}`,
      estado: 'pendiente',
      prioridad: clasificacion.nivel === 'CRITICO' ? 'CRITICA' : 'ALTA',
      fecha_vencimiento: new Date(Date.now() + (clasificacion.nivel === 'CRITICO' ? 10 : 15) * 24 * 60 * 60 * 1000),
      organizacion_id: 1,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('actividades_dpo')
      .insert(actividad)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // CREAR NOTIFICACIÓN DPO
  async crearNotificacionDPO(ratData, tenantId, clasificacion) {
    const notificacion = {
      rat_id: ratData.id,
      notification_type: `${clasificacion.nivel}_RIESGO_DETECTADO`,
      status: 'PENDIENTE',
      priority: clasificacion.nivel === 'CRITICO' ? 'CRITICA' : 'ALTA',
      message: `RAT "${ratData.nombre_actividad}" clasificado como ${clasificacion.nivel} riesgo. ${clasificacion.descripcion}`,
      due_date: new Date(Date.now() + (clasificacion.nivel === 'CRITICO' ? 10 : 15) * 24 * 60 * 60 * 1000),
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('dpo_notifications')
      .insert(notificacion)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // GENERAR DPIA AUTOMÁTICA (SOLO RIESGO CRÍTICO)
  async generarDPIAAutomatica(ratData, tenantId) {
    const dpia = {
      tenant_id: tenantId,
      title: `DPIA - ${ratData.nombre_actividad}`,
      description: `Evaluación impacto algoritmos - Riesgo crítico detectado`,
      risk_level: 'CRITICO',
      status: 'REQUIERE_ELABORACION',
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('dpia')
      .insert(dpia)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // CREAR ALERTA SISTEMA
  async crearAlertaSistema(ratData, tenantId) {
    // Nota: Tabla system_alerts no existe aún, usar actividades_dpo como alternativa
    const alerta = {
      rat_id: ratData.id,
      tenant_id: tenantId,
      tipo_actividad: 'ALERTA_SISTEMA_CRITICA',
      descripcion: `🚨 RIESGO CRÍTICO DETECTADO - RAT "${ratData.nombre_actividad}" requiere intervención inmediata`,
      estado: 'pendiente',
      prioridad: 'CRITICA',
      fecha_vencimiento: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 días
      organizacion_id: 1,
      metadatos: {
        alert_type: 'RIESGO_CRITICO_DETECTADO',
        severity: 'CRITICAL',
        requires_immediate_action: true
      },
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('actividades_dpo')
      .insert(alerta)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // GENERAR MEDIDAS MITIGACIÓN
  generarMedidasMitigacion(clasificacion) {
    const medidas = [];

    if (clasificacion.requiere_eipd) {
      medidas.push('Elaboración EIPD obligatoria antes inicio tratamiento');
    }
    if (clasificacion.requiere_dpia) {
      medidas.push('DPIA algoritmos obligatoria para decisiones automatizadas');
    }
    if (clasificacion.consulta_previa_agencia) {
      medidas.push('Consulta previa obligatoria a Agencia Protección Datos');
    }
    if (clasificacion.medidas_excepcionales) {
      medidas.push('Implementar medidas técnicas y organizativas excepcionales');
    }
    if (clasificacion.monitoreo_continuo) {
      medidas.push('Establecer monitoreo continuo del tratamiento');
    }

    return medidas;
  }
}

export default new RiskCalculationEngine();