const express = require('express');
const { supabaseAdmin } = require('../config/database');
const { asyncHandler, createError } = require('../middleware/errorHandler');

const router = express.Router();

// Dashboard principal - estadísticas generales
router.get('/stats', asyncHandler(async (req, res) => {
  try {
    // Estadísticas principales usando la vista dashboard_tenant
    const { data: dashboardStats, error: statsError } = await supabaseAdmin
      .from('dashboard_tenant')
      .select('*')
      .eq('tenant_id', req.tenant_id)
      .single();

    if (statsError && statsError.code !== 'PGRST116') {
      console.error('Error obteniendo dashboard stats:', statsError);
    }

    // Estadísticas de usuarios activos
    const { data: usuariosStats, error: usuariosError } = await supabaseAdmin
      .from('usuarios')
      .select('rol, estado, last_login, created_at')
      .eq('tenant_id', req.tenant_id);

    if (usuariosError) {
      console.error('Error obteniendo usuarios stats:', usuariosError);
    }

    // Actividad reciente usando función
    const { data: actividadReciente, error: actividadError } = await supabaseAdmin
      .rpc('obtener_actividad_reciente', {
        p_tenant_id: req.tenant_id,
        p_limite: 10
      });

    if (actividadError) {
      console.error('Error obteniendo actividad reciente:', actividadError);
    }

    // Procesar estadísticas de usuarios
    const usuariosPorRol = usuariosStats?.reduce((acc, user) => {
      acc[user.rol] = (acc[user.rol] || 0) + 1;
      return acc;
    }, {}) || {};

    const usuariosActivos = usuariosStats?.filter(user => 
      user.estado === 'activo' && 
      user.last_login && 
      new Date(user.last_login) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ).length || 0;

    // RATs por estado de cumplimiento
    const { data: cumplimientoStats } = await supabaseAdmin
      .from('mapeo_datos_rat')
      .select('estado_cumplimiento, nivel_riesgo')
      .eq('tenant_id', req.tenant_id)
      .eq('estado', 'activo');

    const cumplimientoPorEstado = cumplimientoStats?.reduce((acc, rat) => {
      acc[rat.estado_cumplimiento] = (acc[rat.estado_cumplimiento] || 0) + 1;
      return acc;
    }, {}) || {};

    res.json({
      data: {
        // Estadísticas principales de RATs
        rats: {
          total: dashboardStats?.total_rats || 0,
          criticos: dashboardStats?.rats_criticos || 0,
          alto_riesgo: dashboardStats?.rats_alto_riesgo || 0,
          con_datos_sensibles: dashboardStats?.rats_datos_sensibles || 0,
          eipds_pendientes: dashboardStats?.eipds_pendientes || 0,
          revisiones_vencidas: dashboardStats?.revisiones_vencidas || 0,
          riesgo_promedio: parseFloat(dashboardStats?.riesgo_promedio || 2).toFixed(2)
        },
        // Estadísticas de usuarios
        usuarios: {
          total: usuariosStats?.length || 0,
          activos: usuariosActivos,
          por_rol: usuariosPorRol
        },
        // Cumplimiento
        cumplimiento: {
          por_estado: cumplimientoPorEstado,
          porcentaje_cumplimiento: calculateCompliancePercentage(cumplimientoStats || [])
        },
        // Actividad reciente
        actividad_reciente: actividadReciente?.slice(0, 5) || [],
        // Métricas de tiempo
        ultima_actualizacion: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error en dashboard stats:', error);
    throw createError(500, 'DASHBOARD_ERROR', 'Error obteniendo estadísticas del dashboard');
  }
}));

// Gráfico de tendencias (RATs creados por mes)
router.get('/trends', asyncHandler(async (req, res) => {
  const mesesAtras = parseInt(req.query.meses) || 12;
  const fechaInicio = new Date();
  fechaInicio.setMonth(fechaInicio.getMonth() - mesesAtras);

  const { data: tendencias, error } = await supabaseAdmin
    .from('mapeo_datos_rat')
    .select('created_at, nivel_riesgo')
    .eq('tenant_id', req.tenant_id)
    .gte('created_at', fechaInicio.toISOString())
    .order('created_at', { ascending: true });

  if (error) {
    throw createError(500, 'TRENDS_ERROR', 'Error obteniendo tendencias', error);
  }

  // Agrupar por mes
  const tendenciasPorMes = {};
  tendencias?.forEach(rat => {
    const mes = rat.created_at.substring(0, 7); // YYYY-MM
    if (!tendenciasPorMes[mes]) {
      tendenciasPorMes[mes] = {
        total: 0,
        bajo: 0,
        medio: 0,
        alto: 0,
        critico: 0
      };
    }
    tendenciasPorMes[mes].total++;
    tendenciasPorMes[mes][rat.nivel_riesgo]++;
  });

  // Generar array con todos los meses del período
  const mesesCompletos = [];
  const fechaActual = new Date(fechaInicio);
  
  while (fechaActual <= new Date()) {
    const mesKey = fechaActual.toISOString().substring(0, 7);
    mesesCompletos.push({
      mes: mesKey,
      ...tendenciasPorMes[mesKey] || {
        total: 0, bajo: 0, medio: 0, alto: 0, critico: 0
      }
    });
    fechaActual.setMonth(fechaActual.getMonth() + 1);
  }

  res.json({
    data: {
      trends: mesesCompletos,
      periodo: {
        inicio: fechaInicio.toISOString().substring(0, 7),
        fin: new Date().toISOString().substring(0, 7),
        meses: mesesAtras
      }
    }
  });
}));

// Distribución de RATs por área responsable
router.get('/distribution/areas', asyncHandler(async (req, res) => {
  const { data: distribution, error } = await supabaseAdmin
    .from('mapeo_datos_rat')
    .select('area_responsable, nivel_riesgo, datos_sensibles')
    .eq('tenant_id', req.tenant_id)
    .eq('estado', 'activo');

  if (error) {
    throw createError(500, 'DISTRIBUTION_ERROR', 'Error obteniendo distribución por áreas', error);
  }

  // Agrupar por área responsable
  const distribucionPorArea = {};
  distribution?.forEach(rat => {
    const area = rat.area_responsable || 'Sin área asignada';
    if (!distribucionPorArea[area]) {
      distribucionPorArea[area] = {
        total: 0,
        riesgo: { bajo: 0, medio: 0, alto: 0, critico: 0 },
        datos_sensibles: 0
      };
    }
    
    distribucionPorArea[area].total++;
    distribucionPorArea[area].riesgo[rat.nivel_riesgo]++;
    if (rat.datos_sensibles) {
      distribucionPorArea[area].datos_sensibles++;
    }
  });

  // Convertir a array y ordenar por total
  const distribucionArray = Object.entries(distribucionPorArea)
    .map(([area, stats]) => ({
      area,
      ...stats
    }))
    .sort((a, b) => b.total - a.total);

  res.json({
    data: {
      distribution: distribucionArray,
      total_areas: distribucionArray.length
    }
  });
}));

// Análisis de cumplimiento normativo
router.get('/compliance/analysis', asyncHandler(async (req, res) => {
  const { data: ratsData, error } = await supabaseAdmin
    .from('mapeo_datos_rat')
    .select(`
      id,
      nivel_riesgo,
      datos_sensibles,
      datos_menores,
      requiere_eipd,
      eipd_realizada,
      proxima_revision,
      transferencias_internacionales,
      base_legal,
      decision_automatizada
    `)
    .eq('tenant_id', req.tenant_id)
    .eq('estado', 'activo');

  if (error) {
    throw createError(500, 'COMPLIANCE_ERROR', 'Error obteniendo análisis de cumplimiento', error);
  }

  const analisis = {
    total_rats: ratsData?.length || 0,
    riesgo_alto_critico: 0,
    requieren_eipd: 0,
    eipds_completadas: 0,
    con_transferencias_internacionales: 0,
    decisiones_automatizadas: 0,
    datos_sensibles: 0,
    datos_menores: 0,
    revisiones_vencidas: 0,
    bases_legales: {},
    alertas: []
  };

  const hoy = new Date();

  ratsData?.forEach(rat => {
    // Contar por nivel de riesgo
    if (['alto', 'critico'].includes(rat.nivel_riesgo)) {
      analisis.riesgo_alto_critico++;
    }

    // EIPD
    if (rat.requiere_eipd) {
      analisis.requieren_eipd++;
      if (rat.eipd_realizada) {
        analisis.eipds_completadas++;
      }
    }

    // Transferencias internacionales
    if (rat.transferencias_internacionales && 
        Array.isArray(rat.transferencias_internacionales) && 
        rat.transferencias_internacionales.length > 0) {
      analisis.con_transferencias_internacionales++;
    }

    // Decisiones automatizadas
    if (rat.decision_automatizada) {
      analisis.decisiones_automatizadas++;
    }

    // Tipos de datos
    if (rat.datos_sensibles) {
      analisis.datos_sensibles++;
    }
    if (rat.datos_menores) {
      analisis.datos_menores++;
    }

    // Revisiones vencidas
    if (rat.proxima_revision && new Date(rat.proxima_revision) < hoy) {
      analisis.revisiones_vencidas++;
    }

    // Bases legales
    if (rat.base_legal) {
      analisis.bases_legales[rat.base_legal] = 
        (analisis.bases_legales[rat.base_legal] || 0) + 1;
    }
  });

  // Generar alertas
  if (analisis.requieren_eipd > analisis.eipds_completadas) {
    analisis.alertas.push({
      tipo: 'warning',
      mensaje: `${analisis.requieren_eipd - analisis.eipds_completadas} EIPDs pendientes de completar`,
      prioridad: 'alta'
    });
  }

  if (analisis.revisiones_vencidas > 0) {
    analisis.alertas.push({
      tipo: 'error',
      mensaje: `${analisis.revisiones_vencidas} RATs requieren revisión urgente`,
      prioridad: 'crítica'
    });
  }

  if (analisis.riesgo_alto_critico > analisis.total_rats * 0.3) {
    analisis.alertas.push({
      tipo: 'warning',
      mensaje: 'Alto porcentaje de RATs de riesgo alto/crítico',
      prioridad: 'media'
    });
  }

  res.json({
    data: {
      analisis,
      porcentajes: {
        cumplimiento_eipd: analisis.requieren_eipd > 0 ? 
          Math.round((analisis.eipds_completadas / analisis.requieren_eipd) * 100) : 100,
        riesgo_alto_critico: Math.round((analisis.riesgo_alto_critico / analisis.total_rats) * 100),
        con_datos_sensibles: Math.round((analisis.datos_sensibles / analisis.total_rats) * 100)
      }
    }
  });
}));

// Actividad y logs recientes
router.get('/activity', asyncHandler(async (req, res) => {
  const limite = parseInt(req.query.limit) || 20;
  
  const { data: actividad, error } = await supabaseAdmin
    .rpc('obtener_actividad_reciente', {
      p_tenant_id: req.tenant_id,
      p_limite: limite
    });

  if (error) {
    throw createError(500, 'ACTIVITY_ERROR', 'Error obteniendo actividad reciente', error);
  }

  res.json({
    data: {
      activities: actividad || [],
      limite: limite
    }
  });
}));

// Resumen ejecutivo
router.get('/executive-summary', asyncHandler(async (req, res) => {
  try {
    // Obtener múltiples estadísticas en paralelo
    const [statsResult, complianceResult, trendsResult] = await Promise.all([
      supabaseAdmin.from('dashboard_tenant').select('*').eq('tenant_id', req.tenant_id).single(),
      supabaseAdmin.from('mapeo_datos_rat')
        .select('requiere_eipd, eipd_realizada, proxima_revision')
        .eq('tenant_id', req.tenant_id)
        .eq('estado', 'activo'),
      supabaseAdmin.from('mapeo_datos_rat')
        .select('created_at')
        .eq('tenant_id', req.tenant_id)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    ]);

    const stats = statsResult.data || {};
    const complianceData = complianceResult.data || [];
    const trendsData = trendsResult.data || [];

    // Calcular métricas ejecutivas
    const eipdsCompletadas = complianceData.filter(r => r.requiere_eipd && r.eipd_realizada).length;
    const eipdsRequeridas = complianceData.filter(r => r.requiere_eipd).length;
    const revisionsVencidas = complianceData.filter(r => 
      r.proxima_revision && new Date(r.proxima_revision) < new Date()
    ).length;

    const resumenEjecutivo = {
      // Indicadores clave
      kpis: {
        total_rats: stats.total_rats || 0,
        cumplimiento_eipd: eipdsRequeridas > 0 ? Math.round((eipdsCompletadas / eipdsRequeridas) * 100) : 100,
        nivel_riesgo_promedio: parseFloat(stats.riesgo_promedio || 2).toFixed(1),
        rats_mes_actual: trendsData.length
      },
      // Alertas principales
      alertas: {
        eipds_pendientes: eipdsRequeridas - eipdsCompletadas,
        revisiones_vencidas: revisionsVencidas,
        rats_criticos: stats.rats_criticos || 0,
        datos_sensibles: stats.rats_datos_sensibles || 0
      },
      // Estado general
      estado_general: determinarEstadoGeneral(stats, complianceData),
      // Próximas acciones recomendadas
      acciones_recomendadas: generarAccionesRecomendadas(stats, complianceData, revisionsVencidas)
    };

    res.json({
      data: resumenEjecutivo
    });

  } catch (error) {
    console.error('❌ Error en resumen ejecutivo:', error);
    throw createError(500, 'EXECUTIVE_SUMMARY_ERROR', 'Error generando resumen ejecutivo');
  }
}));

// Funciones helper
function calculateCompliancePercentage(ratsData) {
  if (!ratsData || ratsData.length === 0) return 100;
  
  const cumplidos = ratsData.filter(rat => 
    rat.estado_cumplimiento === 'cumplido'
  ).length;
  
  return Math.round((cumplidos / ratsData.length) * 100);
}

function determinarEstadoGeneral(stats, complianceData) {
  const ratsCriticos = stats.rats_criticos || 0;
  const totalRats = stats.total_rats || 0;
  const eipdsRequeridas = complianceData.filter(r => r.requiere_eipd).length;
  const eipdsCompletadas = complianceData.filter(r => r.requiere_eipd && r.eipd_realizada).length;
  
  if (ratsCriticos > totalRats * 0.2 || (eipdsRequeridas > 0 && eipdsCompletadas / eipdsRequeridas < 0.5)) {
    return {
      estado: 'crítico',
      color: '#d32f2f',
      mensaje: 'Requiere atención inmediata'
    };
  } else if (ratsCriticos > 0 || (eipdsRequeridas > 0 && eipdsCompletadas / eipdsRequeridas < 0.8)) {
    return {
      estado: 'advertencia',
      color: '#f57c00',
      mensaje: 'Algunas áreas requieren mejoras'
    };
  } else {
    return {
      estado: 'saludable',
      color: '#388e3c',
      mensaje: 'Estado de cumplimiento adecuado'
    };
  }
}

function generarAccionesRecomendadas(stats, complianceData, revisionsVencidas) {
  const acciones = [];
  
  if (revisionsVencidas > 0) {
    acciones.push({
      prioridad: 'alta',
      accion: `Revisar ${revisionsVencidas} RAT(s) con revisión vencida`,
      tipo: 'revision'
    });
  }
  
  const eipdsRequeridas = complianceData.filter(r => r.requiere_eipd).length;
  const eipdsCompletadas = complianceData.filter(r => r.requiere_eipd && r.eipd_realizada).length;
  
  if (eipdsRequeridas > eipdsCompletadas) {
    acciones.push({
      prioridad: 'alta',
      accion: `Completar ${eipdsRequeridas - eipdsCompletadas} EIPD(s) pendiente(s)`,
      tipo: 'eipd'
    });
  }
  
  if (stats.rats_criticos > 0) {
    acciones.push({
      prioridad: 'media',
      accion: `Revisar medidas de seguridad en ${stats.rats_criticos} RAT(s) crítico(s)`,
      tipo: 'seguridad'
    });
  }
  
  return acciones.slice(0, 5); // Máximo 5 acciones
}

module.exports = router;