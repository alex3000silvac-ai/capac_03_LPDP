const express = require('express');
const { supabaseAdmin } = require('../config/database');
const { validatePagination, requireDPO } = require('../middleware/validation');
const { asyncHandler, createError } = require('../middleware/errorHandler');

const router = express.Router();

// Obtener logs de auditoría con paginación y filtros
router.get('/', validatePagination, asyncHandler(async (req, res) => {
  const { page, limit, sort, order } = req.query;
  const { 
    action, 
    resource_type, 
    usuario_id, 
    exitosa, 
    fecha_desde, 
    fecha_hasta,
    search 
  } = req.query;
  
  const offset = (page - 1) * limit;

  let query = supabaseAdmin
    .from('audit_log')
    .select(`
      id,
      action,
      resource_type,
      resource_id,
      descripcion,
      ip_address,
      exitosa,
      timestamp,
      usuario_id,
      usuarios(nombre, email)
    `, { count: 'exact' })
    .eq('tenant_id', req.tenant_id);

  // Aplicar filtros
  if (action) {
    if (Array.isArray(action)) {
      query = query.in('action', action);
    } else {
      query = query.eq('action', action);
    }
  }

  if (resource_type) {
    query = query.eq('resource_type', resource_type);
  }

  if (usuario_id) {
    query = query.eq('usuario_id', usuario_id);
  }

  if (exitosa !== undefined) {
    query = query.eq('exitosa', exitosa === 'true');
  }

  if (fecha_desde) {
    query = query.gte('timestamp', fecha_desde);
  }

  if (fecha_hasta) {
    query = query.lte('timestamp', fecha_hasta);
  }

  if (search) {
    query = query.or(`descripcion.ilike.%${search}%,action.ilike.%${search}%,resource_type.ilike.%${search}%`);
  }

  // Ordenamiento
  const sortColumn = sort === 'action' ? 'action' : 
                     sort === 'exitosa' ? 'exitosa' : 
                     sort === 'resource_type' ? 'resource_type' : 'timestamp';
  
  query = query.order(sortColumn, { ascending: order === 'asc' });

  // Paginación
  query = query.range(offset, offset + limit - 1);

  const { data: logs, error, count } = await query;

  if (error) {
    throw createError(500, 'AUDIT_LOG_ERROR', 'Error obteniendo logs de auditoría', error);
  }

  res.json({
    data: logs,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
      hasNext: page < Math.ceil(count / limit),
      hasPrev: page > 1
    },
    filters: {
      action,
      resource_type,
      usuario_id,
      exitosa,
      fecha_desde,
      fecha_hasta,
      search
    }
  });
}));

// Obtener log específico por ID (solo DPO y admin)
router.get('/:log_id', requireDPO, asyncHandler(async (req, res) => {
  const { log_id } = req.params;

  const { data: log, error } = await supabaseAdmin
    .from('audit_log')
    .select(`
      *,
      usuarios(nombre, email, rol)
    `)
    .eq('id', log_id)
    .eq('tenant_id', req.tenant_id)
    .single();

  if (error || !log) {
    throw createError(404, 'AUDIT_LOG_NOT_FOUND', 'Log de auditoría no encontrado');
  }

  res.json({
    data: log
  });
}));

// Obtener estadísticas de auditoría
router.get('/stats/summary', asyncHandler(async (req, res) => {
  const { dias } = req.query;
  const diasAtras = parseInt(dias) || 30;
  const fechaInicio = new Date();
  fechaInicio.setDate(fechaInicio.getDate() - diasAtras);

  const { data: logs, error } = await supabaseAdmin
    .from('audit_log')
    .select('action, resource_type, exitosa, timestamp, usuario_id')
    .eq('tenant_id', req.tenant_id)
    .gte('timestamp', fechaInicio.toISOString());

  if (error) {
    throw createError(500, 'AUDIT_STATS_ERROR', 'Error obteniendo estadísticas de auditoría', error);
  }

  // Procesar estadísticas
  const stats = {
    total_eventos: logs?.length || 0,
    eventos_exitosos: logs?.filter(log => log.exitosa).length || 0,
    eventos_fallidos: logs?.filter(log => !log.exitosa).length || 0,
    usuarios_activos: new Set(logs?.map(log => log.usuario_id).filter(Boolean)).size,
    por_accion: {},
    por_recurso: {},
    por_dia: {},
    top_usuarios: {}
  };

  // Agrupar por acción
  logs?.forEach(log => {
    stats.por_accion[log.action] = (stats.por_accion[log.action] || 0) + 1;
    stats.por_recurso[log.resource_type] = (stats.por_recurso[log.resource_type] || 0) + 1;
    
    // Por día
    const dia = log.timestamp.substring(0, 10);
    stats.por_dia[dia] = (stats.por_dia[dia] || 0) + 1;
    
    // Por usuario
    if (log.usuario_id) {
      stats.top_usuarios[log.usuario_id] = (stats.top_usuarios[log.usuario_id] || 0) + 1;
    }
  });

  // Convertir top_usuarios a array ordenado
  const topUsuariosArray = Object.entries(stats.top_usuarios)
    .map(([usuario_id, count]) => ({ usuario_id, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Obtener nombres de usuarios para el top
  if (topUsuariosArray.length > 0) {
    const usuarioIds = topUsuariosArray.map(u => u.usuario_id);
    const { data: usuarios } = await supabaseAdmin
      .from('usuarios')
      .select('id, nombre, email')
      .in('id', usuarioIds)
      .eq('tenant_id', req.tenant_id);

    stats.top_usuarios_detalle = topUsuariosArray.map(item => {
      const usuario = usuarios?.find(u => u.id === item.usuario_id);
      return {
        ...item,
        nombre: usuario?.nombre || 'Usuario desconocido',
        email: usuario?.email || ''
      };
    });
  } else {
    stats.top_usuarios_detalle = [];
  }

  res.json({
    data: {
      ...stats,
      periodo: {
        inicio: fechaInicio.toISOString().substring(0, 10),
        fin: new Date().toISOString().substring(0, 10),
        dias: diasAtras
      }
    }
  });
}));

// Obtener eventos de seguridad críticos
router.get('/security/alerts', requireDPO, asyncHandler(async (req, res) => {
  const { limit = 50 } = req.query;

  // Acciones consideradas críticas para seguridad
  const accionesCriticas = [
    'LOGIN_FAILED',
    'PASSWORD_CHANGED',
    'PASSWORD_RESET_BY_ADMIN',
    'USER_DELETED_BY_ADMIN',
    'RAT_DELETED',
    'SESSION_EXPIRED',
    'ACCOUNT_LOCKED',
    'CONFIG_UPDATED',
    'ERROR'
  ];

  const { data: alertas, error } = await supabaseAdmin
    .from('audit_log')
    .select(`
      id,
      action,
      resource_type,
      descripcion,
      ip_address,
      user_agent,
      exitosa,
      timestamp,
      metadata,
      usuarios(nombre, email)
    `)
    .eq('tenant_id', req.tenant_id)
    .in('action', accionesCriticas)
    .order('timestamp', { ascending: false })
    .limit(parseInt(limit));

  if (error) {
    throw createError(500, 'SECURITY_ALERTS_ERROR', 'Error obteniendo alertas de seguridad', error);
  }

  // Clasificar alertas por severidad
  const alertasClasificadas = alertas?.map(alerta => {
    let severidad = 'low';
    
    if (['USER_DELETED_BY_ADMIN', 'RAT_DELETED', 'ERROR'].includes(alerta.action)) {
      severidad = 'high';
    } else if (['LOGIN_FAILED', 'ACCOUNT_LOCKED', 'CONFIG_UPDATED'].includes(alerta.action)) {
      severidad = 'medium';
    }

    return {
      ...alerta,
      severidad
    };
  }) || [];

  res.json({
    data: {
      alertas: alertasClasificadas,
      resumen: {
        total: alertasClasificadas.length,
        alta: alertasClasificadas.filter(a => a.severidad === 'high').length,
        media: alertasClasificadas.filter(a => a.severidad === 'medium').length,
        baja: alertasClasificadas.filter(a => a.severidad === 'low').length
      }
    }
  });
}));

// Obtener actividad por usuario específico
router.get('/user/:user_id', asyncHandler(async (req, res) => {
  const { user_id } = req.params;
  const { limit = 50, dias = 30 } = req.query;

  // Verificar que el usuario pertenece al tenant (para seguridad)
  const { data: usuario, error: userError } = await supabaseAdmin
    .from('usuarios')
    .select('id, nombre, email')
    .eq('id', user_id)
    .eq('tenant_id', req.tenant_id)
    .single();

  if (userError || !usuario) {
    throw createError(404, 'USER_NOT_FOUND', 'Usuario no encontrado');
  }

  const fechaInicio = new Date();
  fechaInicio.setDate(fechaInicio.getDate() - parseInt(dias));

  const { data: actividad, error } = await supabaseAdmin
    .from('audit_log')
    .select(`
      id,
      action,
      resource_type,
      resource_id,
      descripcion,
      ip_address,
      exitosa,
      timestamp
    `)
    .eq('tenant_id', req.tenant_id)
    .eq('usuario_id', user_id)
    .gte('timestamp', fechaInicio.toISOString())
    .order('timestamp', { ascending: false })
    .limit(parseInt(limit));

  if (error) {
    throw createError(500, 'USER_ACTIVITY_ERROR', 'Error obteniendo actividad del usuario', error);
  }

  // Estadísticas de actividad del usuario
  const estadisticas = {
    total_acciones: actividad?.length || 0,
    acciones_exitosas: actividad?.filter(a => a.exitosa).length || 0,
    acciones_fallidas: actividad?.filter(a => !a.exitosa).length || 0,
    por_accion: {},
    por_recurso: {},
    ips_utilizadas: new Set(actividad?.map(a => a.ip_address).filter(Boolean)).size
  };

  actividad?.forEach(accion => {
    estadisticas.por_accion[accion.action] = (estadisticas.por_accion[accion.action] || 0) + 1;
    estadisticas.por_recurso[accion.resource_type] = (estadisticas.por_recurso[accion.resource_type] || 0) + 1;
  });

  res.json({
    data: {
      usuario,
      actividad,
      estadisticas,
      periodo: {
        dias: parseInt(dias),
        desde: fechaInicio.toISOString(),
        hasta: new Date().toISOString()
      }
    }
  });
}));

// Exportar logs de auditoría (CSV) - Solo DPO y admin
router.get('/export/csv', requireDPO, asyncHandler(async (req, res) => {
  const { fecha_desde, fecha_hasta, action, resource_type } = req.query;

  let query = supabaseAdmin
    .from('audit_log')
    .select(`
      timestamp,
      action,
      resource_type,
      resource_id,
      descripcion,
      ip_address,
      exitosa,
      usuarios(nombre, email)
    `)
    .eq('tenant_id', req.tenant_id);

  // Aplicar filtros
  if (fecha_desde) {
    query = query.gte('timestamp', fecha_desde);
  }
  if (fecha_hasta) {
    query = query.lte('timestamp', fecha_hasta);
  }
  if (action) {
    query = query.eq('action', action);
  }
  if (resource_type) {
    query = query.eq('resource_type', resource_type);
  }

  query = query.order('timestamp', { ascending: false }).limit(5000); // Máximo 5000 registros

  const { data: logs, error } = await query;

  if (error) {
    throw createError(500, 'EXPORT_ERROR', 'Error exportando logs de auditoría', error);
  }

  // Generar CSV
  const csvHeader = 'Fecha,Acción,Tipo de Recurso,ID de Recurso,Descripción,IP,Exitosa,Usuario,Email\n';
  const csvRows = logs?.map(log => {
    const fecha = new Date(log.timestamp).toLocaleString('es-CL');
    const usuario = log.usuarios?.nombre || 'Sistema';
    const email = log.usuarios?.email || '';
    
    return [
      fecha,
      log.action,
      log.resource_type,
      log.resource_id || '',
      `"${log.descripcion?.replace(/"/g, '""') || ''}"`,
      log.ip_address || '',
      log.exitosa ? 'Sí' : 'No',
      usuario,
      email
    ].join(',');
  }).join('\n') || '';

  const csvContent = csvHeader + csvRows;

  // Log de la exportación
  await supabaseAdmin
    .from('audit_log')
    .insert({
      tenant_id: req.tenant_id,
      usuario_id: req.user.id,
      action: 'AUDIT_LOG_EXPORT',
      resource_type: 'audit',
      descripcion: `Exportación de logs de auditoría (${logs?.length || 0} registros)`,
      metadata: { 
        filtros: { fecha_desde, fecha_hasta, action, resource_type },
        registros_exportados: logs?.length || 0
      },
      exitosa: true
    });

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="audit_log_${Date.now()}.csv"`);
  res.send('\uFEFF' + csvContent); // BOM para UTF-8 en Excel
}));

// Limpiar logs antiguos (solo super admin) - Operación de mantenimiento
router.delete('/cleanup', asyncHandler(async (req, res) => {
  if (req.user.rol !== 'super_admin') {
    throw createError(403, 'SUPER_ADMIN_REQUIRED', 'Solo super administradores pueden limpiar logs');
  }

  const { dias_retencion = 365 } = req.body;
  const fechaCorte = new Date();
  fechaCorte.setDate(fechaCorte.getDate() - parseInt(dias_retencion));

  const { error, count } = await supabaseAdmin
    .from('audit_log')
    .delete()
    .eq('tenant_id', req.tenant_id)
    .lt('timestamp', fechaCorte.toISOString());

  if (error) {
    throw createError(500, 'CLEANUP_ERROR', 'Error limpiando logs antiguos', error);
  }

  // Log de la operación de limpieza
  await supabaseAdmin
    .from('audit_log')
    .insert({
      tenant_id: req.tenant_id,
      usuario_id: req.user.id,
      action: 'AUDIT_LOG_CLEANUP',
      resource_type: 'system',
      descripcion: `Limpieza de logs de auditoría: ${count} registros eliminados`,
      metadata: { 
        dias_retencion: parseInt(dias_retencion),
        fecha_corte: fechaCorte.toISOString(),
        registros_eliminados: count
      },
      exitosa: true
    });

  res.json({
    message: 'Limpieza de logs completada exitosamente',
    data: {
      registros_eliminados: count,
      fecha_corte: fechaCorte.toISOString(),
      dias_retencion: parseInt(dias_retencion)
    }
  });
}));

module.exports = router;