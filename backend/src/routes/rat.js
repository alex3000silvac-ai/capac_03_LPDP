const express = require('express');
const { supabaseAdmin } = require('../config/database');
const { validateRat, validatePagination, validateRatFilters, validateUUID } = require('../middleware/validation');
const { requireDPO } = require('../middleware/auth');
const { asyncHandler, createError } = require('../middleware/errorHandler');

const router = express.Router();

// Listar RATs con paginación y filtros
router.get('/', validatePagination, validateRatFilters, asyncHandler(async (req, res) => {
  const { page, limit, sort, order } = req.query;
  const { nivel_riesgo, datos_sensibles, datos_menores, area_responsable, search, fecha_desde, fecha_hasta, estado } = req.query;
  const offset = (page - 1) * limit;

  let query = supabaseAdmin
    .from('mapeo_datos_rat')
    .select(`
      id,
      codigo,
      nombre_actividad,
      descripcion,
      area_responsable,
      responsable_proceso,
      base_legal,
      nivel_riesgo,
      datos_sensibles,
      datos_menores,
      requiere_eipd,
      eipd_realizada,
      proxima_revision,
      estado,
      created_at,
      updated_at,
      usuarios!inner(nombre, email)
    `, { count: 'exact' })
    .eq('tenant_id', req.tenant_id)
    .eq('estado', estado || 'activo');

  // Aplicar filtros
  if (nivel_riesgo) {
    if (Array.isArray(nivel_riesgo)) {
      query = query.in('nivel_riesgo', nivel_riesgo);
    } else {
      query = query.eq('nivel_riesgo', nivel_riesgo);
    }
  }

  if (datos_sensibles !== undefined) {
    query = query.eq('datos_sensibles', datos_sensibles);
  }

  if (datos_menores !== undefined) {
    query = query.eq('datos_menores', datos_menores);
  }

  if (area_responsable) {
    query = query.ilike('area_responsable', `%${area_responsable}%`);
  }

  if (search) {
    query = query.or(`nombre_actividad.ilike.%${search}%,descripcion.ilike.%${search}%,responsable_proceso.ilike.%${search}%`);
  }

  if (fecha_desde) {
    query = query.gte('created_at', fecha_desde);
  }

  if (fecha_hasta) {
    query = query.lte('created_at', fecha_hasta);
  }

  // Ordenamiento
  const sortColumn = sort === 'nombre_actividad' ? 'nombre_actividad' : 
                     sort === 'nivel_riesgo' ? 'nivel_riesgo' : 
                     sort === 'updated_at' ? 'updated_at' : 'created_at';
  
  query = query.order(sortColumn, { ascending: order === 'asc' });

  // Paginación
  query = query.range(offset, offset + limit - 1);

  const { data: rats, error, count } = await query;

  if (error) {
    throw createError(500, 'DATABASE_ERROR', 'Error obteniendo RATs', error);
  }

  const totalPages = Math.ceil(count / limit);

  res.json({
    data: rats,
    pagination: {
      page,
      limit,
      total: count,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    },
    filters: {
      nivel_riesgo,
      datos_sensibles,
      datos_menores,
      area_responsable,
      search,
      fecha_desde,
      fecha_hasta,
      estado
    }
  });
}));

// Obtener RAT por ID
router.get('/:id', validateUUID('id'), asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { data: rat, error } = await supabaseAdmin
    .from('mapeo_datos_rat')
    .select(`
      *,
      usuarios!inner(nombre, email, rol)
    `)
    .eq('id', id)
    .eq('tenant_id', req.tenant_id)
    .single();

  if (error || !rat) {
    throw createError(404, 'RAT_NOT_FOUND', 'RAT no encontrado');
  }

  res.json({
    data: rat
  });
}));

// Crear nuevo RAT
router.post('/', validateRat, asyncHandler(async (req, res) => {
  const ratData = {
    ...req.body,
    tenant_id: req.tenant_id,
    usuario_id: req.user.id
  };

  const { data: nuevoRat, error } = await supabaseAdmin
    .from('mapeo_datos_rat')
    .insert(ratData)
    .select(`
      id,
      codigo,
      nombre_actividad,
      descripcion,
      nivel_riesgo,
      estado,
      created_at
    `)
    .single();

  if (error) {
    if (error.code === '23505') {
      throw createError(409, 'DUPLICATE_RAT', 'Ya existe un RAT con este código');
    }
    throw createError(500, 'RAT_CREATION_ERROR', 'Error creando RAT', error);
  }

  // Log de auditoría
  await supabaseAdmin
    .from('audit_log')
    .insert({
      tenant_id: req.tenant_id,
      usuario_id: req.user.id,
      action: 'RAT_CREATED',
      resource_type: 'rat',
      resource_id: nuevoRat.id,
      descripcion: `RAT creado: ${nuevoRat.nombre_actividad}`,
      datos_nuevos: ratData,
      exitosa: true
    });

  res.status(201).json({
    message: 'RAT creado exitosamente',
    data: nuevoRat
  });
}));

// Actualizar RAT
router.put('/:id', validateUUID('id'), validateRat, asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Verificar que el RAT existe y obtener datos anteriores
  const { data: ratActual, error: ratError } = await supabaseAdmin
    .from('mapeo_datos_rat')
    .select('*')
    .eq('id', id)
    .eq('tenant_id', req.tenant_id)
    .single();

  if (ratError || !ratActual) {
    throw createError(404, 'RAT_NOT_FOUND', 'RAT no encontrado');
  }

  // Verificar permisos - solo el creador, DPO o admin pueden editar
  if (ratActual.usuario_id !== req.user.id && !['dpo', 'admin', 'super_admin'].includes(req.user.rol)) {
    throw createError(403, 'RAT_EDIT_DENIED', 'No tienes permisos para editar este RAT');
  }

  // Preparar datos de actualización
  const updateData = {
    ...req.body,
    version: ratActual.version + 1,
    version_anterior: ratActual.id,
    cambios_realizados: generateChangesSummary(ratActual, req.body)
  };

  const { data: ratActualizado, error } = await supabaseAdmin
    .from('mapeo_datos_rat')
    .update(updateData)
    .eq('id', id)
    .select(`
      id,
      codigo,
      nombre_actividad,
      version,
      nivel_riesgo,
      updated_at
    `)
    .single();

  if (error) {
    throw createError(500, 'RAT_UPDATE_ERROR', 'Error actualizando RAT', error);
  }

  // Log de auditoría
  await supabaseAdmin
    .from('audit_log')
    .insert({
      tenant_id: req.tenant_id,
      usuario_id: req.user.id,
      action: 'RAT_UPDATED',
      resource_type: 'rat',
      resource_id: id,
      descripcion: `RAT actualizado: ${ratActualizado.nombre_actividad}`,
      datos_anteriores: ratActual,
      datos_nuevos: updateData,
      exitosa: true
    });

  res.json({
    message: 'RAT actualizado exitosamente',
    data: ratActualizado
  });
}));

// Eliminar RAT (solo DPO y admin)
router.delete('/:id', validateUUID('id'), requireDPO, asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Verificar que el RAT existe
  const { data: rat, error: ratError } = await supabaseAdmin
    .from('mapeo_datos_rat')
    .select('id, codigo, nombre_actividad')
    .eq('id', id)
    .eq('tenant_id', req.tenant_id)
    .single();

  if (ratError || !rat) {
    throw createError(404, 'RAT_NOT_FOUND', 'RAT no encontrado');
  }

  // Marcar como eliminado (soft delete)
  const { error } = await supabaseAdmin
    .from('mapeo_datos_rat')
    .update({ 
      estado: 'eliminado',
      updated_at: new Date().toISOString()
    })
    .eq('id', id);

  if (error) {
    throw createError(500, 'RAT_DELETE_ERROR', 'Error eliminando RAT', error);
  }

  // Log de auditoría
  await supabaseAdmin
    .from('audit_log')
    .insert({
      tenant_id: req.tenant_id,
      usuario_id: req.user.id,
      action: 'RAT_DELETED',
      resource_type: 'rat',
      resource_id: id,
      descripcion: `RAT eliminado: ${rat.nombre_actividad}`,
      exitosa: true
    });

  res.json({
    message: 'RAT eliminado exitosamente',
    data: {
      id: rat.id,
      codigo: rat.codigo,
      nombre_actividad: rat.nombre_actividad
    }
  });
}));

// Duplicar RAT
router.post('/:id/duplicate', validateUUID('id'), asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Obtener RAT original
  const { data: ratOriginal, error } = await supabaseAdmin
    .from('mapeo_datos_rat')
    .select('*')
    .eq('id', id)
    .eq('tenant_id', req.tenant_id)
    .single();

  if (error || !ratOriginal) {
    throw createError(404, 'RAT_NOT_FOUND', 'RAT no encontrado');
  }

  // Preparar datos para duplicado
  const { id: originalId, codigo, created_at, updated_at, version, ...datosRat } = ratOriginal;
  const datosDuplicado = {
    ...datosRat,
    nombre_actividad: `${ratOriginal.nombre_actividad} (Copia)`,
    codigo: null, // Se generará automáticamente
    usuario_id: req.user.id,
    version: 1,
    version_anterior: null
  };

  // Crear duplicado
  const { data: ratDuplicado, error: duplicateError } = await supabaseAdmin
    .from('mapeo_datos_rat')
    .insert(datosDuplicado)
    .select(`
      id,
      codigo,
      nombre_actividad,
      nivel_riesgo,
      created_at
    `)
    .single();

  if (duplicateError) {
    throw createError(500, 'RAT_DUPLICATE_ERROR', 'Error duplicando RAT', duplicateError);
  }

  // Log de auditoría
  await supabaseAdmin
    .from('audit_log')
    .insert({
      tenant_id: req.tenant_id,
      usuario_id: req.user.id,
      action: 'RAT_DUPLICATED',
      resource_type: 'rat',
      resource_id: ratDuplicado.id,
      descripcion: `RAT duplicado desde ${ratOriginal.codigo}`,
      metadata: { original_id: originalId },
      exitosa: true
    });

  res.status(201).json({
    message: 'RAT duplicado exitosamente',
    data: ratDuplicado
  });
}));

// Obtener estadísticas de RATs
router.get('/stats/summary', asyncHandler(async (req, res) => {
  // Usar función de base de datos para estadísticas
  const { data: stats, error } = await supabaseAdmin
    .rpc('obtener_estadisticas_tenant', {
      p_tenant_id: req.tenant_id
    });

  if (error) {
    throw createError(500, 'STATS_ERROR', 'Error obteniendo estadísticas', error);
  }

  // Obtener distribución por nivel de riesgo
  const { data: riskDistribution } = await supabaseAdmin
    .from('mapeo_datos_rat')
    .select('nivel_riesgo')
    .eq('tenant_id', req.tenant_id)
    .eq('estado', 'activo');

  const riskCounts = {
    bajo: 0,
    medio: 0,
    alto: 0,
    critico: 0
  };

  riskDistribution?.forEach(rat => {
    if (riskCounts.hasOwnProperty(rat.nivel_riesgo)) {
      riskCounts[rat.nivel_riesgo]++;
    }
  });

  res.json({
    data: {
      ...stats[0],
      risk_distribution: riskCounts
    }
  });
}));

// Obtener RATs pendientes de revisión
router.get('/pending/review', asyncHandler(async (req, res) => {
  const diasAviso = parseInt(req.query.dias_aviso) || 30;

  const { data: ratsPendientes, error } = await supabaseAdmin
    .rpc('obtener_rats_revision_pendiente', {
      p_tenant_id: req.tenant_id,
      p_dias_aviso: diasAviso
    });

  if (error) {
    throw createError(500, 'PENDING_REVIEW_ERROR', 'Error obteniendo RATs pendientes de revisión', error);
  }

  res.json({
    data: ratsPendientes || [],
    filtros: {
      dias_aviso: diasAviso
    }
  });
}));

// Funciones helper
function generateChangesSummary(oldData, newData) {
  const changes = [];
  const fieldsToCheck = [
    'nombre_actividad', 'descripcion', 'base_legal', 'nivel_riesgo',
    'datos_sensibles', 'datos_menores', 'area_responsable'
  ];

  fieldsToCheck.forEach(field => {
    if (oldData[field] !== newData[field]) {
      changes.push(`${field}: "${oldData[field]}" → "${newData[field]}"`);
    }
  });

  return changes.join('; ');
}

module.exports = router;