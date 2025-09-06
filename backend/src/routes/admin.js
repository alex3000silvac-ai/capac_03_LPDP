const express = require('express');
const bcrypt = require('bcryptjs');
const { supabaseAdmin } = require('../config/database');
const { requireAdmin } = require('../middleware/auth');
const { validateOrganizacion, validateRegisterUser, validatePagination } = require('../middleware/validation');
const { asyncHandler, createError } = require('../middleware/errorHandler');

const router = express.Router();

// Todas las rutas requieren permisos de administrador
router.use(requireAdmin);

// =====================================================
// GESTIÓN DE ORGANIZACIONES
// =====================================================

// Crear nueva organización (solo super_admin)
router.post('/organizations', validateOrganizacion, asyncHandler(async (req, res) => {
  if (req.user.rol !== 'super_admin') {
    throw createError(403, 'SUPER_ADMIN_REQUIRED', 'Solo super administradores pueden crear organizaciones');
  }

  const organizacionData = req.body;

  // Verificar que el tenant_id no exista
  const { data: existingTenant } = await supabaseAdmin
    .from('organizaciones')
    .select('tenant_id')
    .eq('tenant_id', organizacionData.tenant_id)
    .single();

  if (existingTenant) {
    throw createError(409, 'TENANT_EXISTS', 'Ya existe una organización con este tenant_id');
  }

  const { data: nuevaOrganizacion, error } = await supabaseAdmin
    .from('organizaciones')
    .insert(organizacionData)
    .select('*')
    .single();

  if (error) {
    throw createError(500, 'ORGANIZATION_CREATE_ERROR', 'Error creando organización', error);
  }

  // Log de auditoría
  await supabaseAdmin
    .from('audit_log')
    .insert({
      tenant_id: nuevaOrganizacion.tenant_id,
      usuario_id: req.user.id,
      action: 'ORGANIZATION_CREATED',
      resource_type: 'organization',
      resource_id: nuevaOrganizacion.id,
      descripcion: `Organización creada: ${nuevaOrganizacion.nombre}`,
      datos_nuevos: organizacionData,
      exitosa: true
    });

  res.status(201).json({
    message: 'Organización creada exitosamente',
    data: nuevaOrganizacion
  });
}));

// Listar organizaciones (solo super_admin puede ver todas)
router.get('/organizations', validatePagination, asyncHandler(async (req, res) => {
  const { page, limit, sort, order } = req.query;
  const offset = (page - 1) * limit;

  let query = supabaseAdmin
    .from('organizaciones')
    .select('*', { count: 'exact' });

  // Super admins pueden ver todas las organizaciones
  if (req.user.rol !== 'super_admin') {
    query = query.eq('tenant_id', req.tenant_id);
  }

  // Ordenamiento
  const sortColumn = sort === 'nombre' ? 'nombre' : 
                     sort === 'created_at' ? 'created_at' : 'updated_at';
  query = query.order(sortColumn, { ascending: order === 'asc' });

  // Paginación
  query = query.range(offset, offset + limit - 1);

  const { data: organizaciones, error, count } = await query;

  if (error) {
    throw createError(500, 'ORGANIZATIONS_LIST_ERROR', 'Error obteniendo organizaciones', error);
  }

  res.json({
    data: organizaciones,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit)
    }
  });
}));

// Actualizar organización
router.put('/organizations/:tenant_id', validateOrganizacion, asyncHandler(async (req, res) => {
  const { tenant_id } = req.params;
  const updateData = req.body;

  // Super admins pueden actualizar cualquier organización
  // Admins normales solo pueden actualizar su propia organización
  if (req.user.rol !== 'super_admin' && req.tenant_id !== tenant_id) {
    throw createError(403, 'ORGANIZATION_ACCESS_DENIED', 'No puedes actualizar esta organización');
  }

  const { data: organizacionActualizada, error } = await supabaseAdmin
    .from('organizaciones')
    .update(updateData)
    .eq('tenant_id', tenant_id)
    .select('*')
    .single();

  if (error) {
    throw createError(500, 'ORGANIZATION_UPDATE_ERROR', 'Error actualizando organización', error);
  }

  // Log de auditoría
  await supabaseAdmin
    .from('audit_log')
    .insert({
      tenant_id: tenant_id,
      usuario_id: req.user.id,
      action: 'ORGANIZATION_UPDATED',
      resource_type: 'organization',
      resource_id: organizacionActualizada.id,
      descripcion: `Organización actualizada: ${organizacionActualizada.nombre}`,
      datos_nuevos: updateData,
      exitosa: true
    });

  res.json({
    message: 'Organización actualizada exitosamente',
    data: organizacionActualizada
  });
}));

// =====================================================
// GESTIÓN DE USUARIOS
// =====================================================

// Listar usuarios de la organización
router.get('/users', validatePagination, asyncHandler(async (req, res) => {
  const { page, limit, sort, order } = req.query;
  const { rol, estado, search } = req.query;
  const offset = (page - 1) * limit;

  let query = supabaseAdmin
    .from('usuarios')
    .select(`
      id,
      email,
      nombre,
      apellidos,
      telefono,
      rol,
      estado,
      email_verified,
      last_login,
      created_at,
      updated_at
    `, { count: 'exact' })
    .eq('tenant_id', req.tenant_id);

  // Filtros
  if (rol) {
    query = query.eq('rol', rol);
  }

  if (estado) {
    query = query.eq('estado', estado);
  }

  if (search) {
    query = query.or(`nombre.ilike.%${search}%,apellidos.ilike.%${search}%,email.ilike.%${search}%`);
  }

  // Ordenamiento
  const sortColumn = sort === 'nombre' ? 'nombre' : 
                     sort === 'email' ? 'email' : 
                     sort === 'last_login' ? 'last_login' : 'created_at';
  query = query.order(sortColumn, { ascending: order === 'asc' });

  // Paginación
  query = query.range(offset, offset + limit - 1);

  const { data: usuarios, error, count } = await query;

  if (error) {
    throw createError(500, 'USERS_LIST_ERROR', 'Error obteniendo usuarios', error);
  }

  res.json({
    data: usuarios,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit)
    },
    filters: { rol, estado, search }
  });
}));

// Crear nuevo usuario
router.post('/users', validateRegisterUser, asyncHandler(async (req, res) => {
  const { email, nombre, apellidos, telefono, password, rol } = req.body;

  // Hashear contraseña
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const { data: nuevoUsuario, error } = await supabaseAdmin
    .from('usuarios')
    .insert({
      email,
      nombre,
      apellidos,
      telefono,
      password_hash: passwordHash,
      rol: rol || 'user',
      tenant_id: req.tenant_id,
      email_verified: false,
      estado: 'activo'
    })
    .select(`
      id,
      email,
      nombre,
      apellidos,
      rol,
      estado,
      created_at
    `)
    .single();

  if (error) {
    if (error.code === '23505') {
      throw createError(409, 'EMAIL_EXISTS', 'El email ya está registrado en esta organización');
    }
    throw createError(500, 'USER_CREATE_ERROR', 'Error creando usuario', error);
  }

  // Log de auditoría
  await supabaseAdmin
    .from('audit_log')
    .insert({
      tenant_id: req.tenant_id,
      usuario_id: req.user.id,
      action: 'USER_CREATED_BY_ADMIN',
      resource_type: 'user',
      resource_id: nuevoUsuario.id,
      descripcion: `Usuario creado por admin: ${email}`,
      metadata: { created_user_role: rol },
      exitosa: true
    });

  res.status(201).json({
    message: 'Usuario creado exitosamente',
    data: nuevoUsuario
  });
}));

// Actualizar usuario
router.put('/users/:user_id', asyncHandler(async (req, res) => {
  const { user_id } = req.params;
  const { nombre, apellidos, telefono, rol, estado } = req.body;

  // Verificar que el usuario pertenece a la organización
  const { data: usuarioExistente, error: userError } = await supabaseAdmin
    .from('usuarios')
    .select('id, email, rol, estado')
    .eq('id', user_id)
    .eq('tenant_id', req.tenant_id)
    .single();

  if (userError || !usuarioExistente) {
    throw createError(404, 'USER_NOT_FOUND', 'Usuario no encontrado en esta organización');
  }

  // No permitir que un admin se quite sus propios privilegios de admin
  if (user_id === req.user.id && rol && rol !== usuarioExistente.rol && 
      ['admin', 'super_admin'].includes(usuarioExistente.rol)) {
    throw createError(400, 'CANNOT_DEMOTE_SELF', 'No puedes cambiar tu propio rol de administrador');
  }

  const updateData = {};
  if (nombre !== undefined) updateData.nombre = nombre;
  if (apellidos !== undefined) updateData.apellidos = apellidos;
  if (telefono !== undefined) updateData.telefono = telefono;
  if (rol !== undefined) updateData.rol = rol;
  if (estado !== undefined) updateData.estado = estado;

  const { data: usuarioActualizado, error } = await supabaseAdmin
    .from('usuarios')
    .update(updateData)
    .eq('id', user_id)
    .select(`
      id,
      email,
      nombre,
      apellidos,
      telefono,
      rol,
      estado,
      updated_at
    `)
    .single();

  if (error) {
    throw createError(500, 'USER_UPDATE_ERROR', 'Error actualizando usuario', error);
  }

  // Log de auditoría
  await supabaseAdmin
    .from('audit_log')
    .insert({
      tenant_id: req.tenant_id,
      usuario_id: req.user.id,
      action: 'USER_UPDATED_BY_ADMIN',
      resource_type: 'user',
      resource_id: user_id,
      descripcion: `Usuario actualizado por admin: ${usuarioExistente.email}`,
      datos_anteriores: usuarioExistente,
      datos_nuevos: updateData,
      exitosa: true
    });

  res.json({
    message: 'Usuario actualizado exitosamente',
    data: usuarioActualizado
  });
}));

// Eliminar/desactivar usuario
router.delete('/users/:user_id', asyncHandler(async (req, res) => {
  const { user_id } = req.params;

  // Verificar que el usuario pertenece a la organización
  const { data: usuario, error: userError } = await supabaseAdmin
    .from('usuarios')
    .select('id, email, rol')
    .eq('id', user_id)
    .eq('tenant_id', req.tenant_id)
    .single();

  if (userError || !usuario) {
    throw createError(404, 'USER_NOT_FOUND', 'Usuario no encontrado en esta organización');
  }

  // No permitir que un admin se elimine a sí mismo
  if (user_id === req.user.id) {
    throw createError(400, 'CANNOT_DELETE_SELF', 'No puedes eliminarte a ti mismo');
  }

  // Desactivar en lugar de eliminar (soft delete)
  const { error } = await supabaseAdmin
    .from('usuarios')
    .update({ 
      estado: 'eliminado',
      updated_at: new Date().toISOString()
    })
    .eq('id', user_id);

  if (error) {
    throw createError(500, 'USER_DELETE_ERROR', 'Error eliminando usuario', error);
  }

  // Invalidar todas las sesiones del usuario
  await supabaseAdmin
    .from('sesiones')
    .update({ estado: 'revocada' })
    .eq('usuario_id', user_id);

  // Log de auditoría
  await supabaseAdmin
    .from('audit_log')
    .insert({
      tenant_id: req.tenant_id,
      usuario_id: req.user.id,
      action: 'USER_DELETED_BY_ADMIN',
      resource_type: 'user',
      resource_id: user_id,
      descripcion: `Usuario eliminado por admin: ${usuario.email}`,
      exitosa: true
    });

  res.json({
    message: 'Usuario eliminado exitosamente',
    data: {
      id: usuario.id,
      email: usuario.email
    }
  });
}));

// Resetear contraseña de usuario
router.post('/users/:user_id/reset-password', asyncHandler(async (req, res) => {
  const { user_id } = req.params;
  const { new_password } = req.body;

  if (!new_password || new_password.length < 8) {
    throw createError(400, 'INVALID_PASSWORD', 'La contraseña debe tener al menos 8 caracteres');
  }

  // Verificar que el usuario pertenece a la organización
  const { data: usuario, error: userError } = await supabaseAdmin
    .from('usuarios')
    .select('id, email')
    .eq('id', user_id)
    .eq('tenant_id', req.tenant_id)
    .single();

  if (userError || !usuario) {
    throw createError(404, 'USER_NOT_FOUND', 'Usuario no encontrado en esta organización');
  }

  // Hashear nueva contraseña
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
  const passwordHash = await bcrypt.hash(new_password, saltRounds);

  const { error } = await supabaseAdmin
    .from('usuarios')
    .update({ 
      password_hash: passwordHash,
      failed_login_attempts: 0,
      locked_until: null
    })
    .eq('id', user_id);

  if (error) {
    throw createError(500, 'PASSWORD_RESET_ERROR', 'Error reseteando contraseña', error);
  }

  // Invalidar todas las sesiones del usuario
  await supabaseAdmin
    .from('sesiones')
    .update({ estado: 'revocada' })
    .eq('usuario_id', user_id);

  // Log de auditoría
  await supabaseAdmin
    .from('audit_log')
    .insert({
      tenant_id: req.tenant_id,
      usuario_id: req.user.id,
      action: 'PASSWORD_RESET_BY_ADMIN',
      resource_type: 'user',
      resource_id: user_id,
      descripcion: `Contraseña reseteada por admin para: ${usuario.email}`,
      exitosa: true
    });

  res.json({
    message: 'Contraseña reseteada exitosamente'
  });
}));

// =====================================================
// CONFIGURACIÓN DEL SISTEMA
// =====================================================

// Obtener configuraciones del sistema
router.get('/config', asyncHandler(async (req, res) => {
  const { categoria } = req.query;

  let query = supabaseAdmin
    .from('configuracion_sistema')
    .select('*')
    .eq('tenant_id', req.tenant_id);

  if (categoria) {
    query = query.eq('categoria', categoria);
  }

  const { data: configuraciones, error } = await query.order('categoria', { ascending: true });

  if (error) {
    throw createError(500, 'CONFIG_LIST_ERROR', 'Error obteniendo configuraciones', error);
  }

  res.json({
    data: configuraciones
  });
}));

// Actualizar configuración específica
router.put('/config/:config_id', asyncHandler(async (req, res) => {
  const { config_id } = req.params;
  const { valor } = req.body;

  if (valor === undefined) {
    throw createError(400, 'VALUE_REQUIRED', 'El valor de configuración es requerido');
  }

  const { data: configActualizada, error } = await supabaseAdmin
    .from('configuracion_sistema')
    .update({ valor })
    .eq('id', config_id)
    .eq('tenant_id', req.tenant_id)
    .select('*')
    .single();

  if (error || !configActualizada) {
    throw createError(404, 'CONFIG_NOT_FOUND', 'Configuración no encontrada');
  }

  // Log de auditoría
  await supabaseAdmin
    .from('audit_log')
    .insert({
      tenant_id: req.tenant_id,
      usuario_id: req.user.id,
      action: 'CONFIG_UPDATED',
      resource_type: 'config',
      resource_id: config_id,
      descripcion: `Configuración actualizada: ${configActualizada.clave}`,
      datos_nuevos: { valor },
      exitosa: true
    });

  res.json({
    message: 'Configuración actualizada exitosamente',
    data: configActualizada
  });
}));

// =====================================================
// ESTADÍSTICAS ADMINISTRATIVAS
// =====================================================

// Obtener estadísticas administrativas
router.get('/stats', asyncHandler(async (req, res) => {
  // Estadísticas de usuarios
  const { data: usuariosStats } = await supabaseAdmin
    .from('usuarios')
    .select('rol, estado, last_login')
    .eq('tenant_id', req.tenant_id);

  // Estadísticas de RATs
  const { data: ratsStats } = await supabaseAdmin
    .from('mapeo_datos_rat')
    .select('nivel_riesgo, estado, created_at')
    .eq('tenant_id', req.tenant_id);

  // Actividad reciente
  const { data: actividadStats } = await supabaseAdmin
    .from('audit_log')
    .select('action, exitosa, timestamp')
    .eq('tenant_id', req.tenant_id)
    .gte('timestamp', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .order('timestamp', { ascending: false });

  const stats = {
    usuarios: {
      total: usuariosStats?.length || 0,
      por_rol: usuariosStats?.reduce((acc, user) => {
        acc[user.rol] = (acc[user.rol] || 0) + 1;
        return acc;
      }, {}) || {},
      por_estado: usuariosStats?.reduce((acc, user) => {
        acc[user.estado] = (acc[user.estado] || 0) + 1;
        return acc;
      }, {}) || {},
      activos_ultima_semana: usuariosStats?.filter(user => 
        user.last_login && 
        new Date(user.last_login) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length || 0
    },
    rats: {
      total: ratsStats?.length || 0,
      por_riesgo: ratsStats?.reduce((acc, rat) => {
        acc[rat.nivel_riesgo] = (acc[rat.nivel_riesgo] || 0) + 1;
        return acc;
      }, {}) || {},
      creados_ultima_semana: ratsStats?.filter(rat => 
        new Date(rat.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length || 0
    },
    actividad: {
      acciones_ultima_semana: actividadStats?.length || 0,
      acciones_exitosas: actividadStats?.filter(a => a.exitosa).length || 0,
      acciones_fallidas: actividadStats?.filter(a => !a.exitosa).length || 0
    }
  };

  res.json({
    data: stats
  });
}));

module.exports = router;