const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { supabaseAdmin } = require('../config/database');
const { validateLogin, validateRegisterUser, validateChangePassword } = require('../middleware/validation');
const { authMiddleware, hashToken } = require('../middleware/auth');
const { asyncHandler, createError } = require('../middleware/errorHandler');

const router = express.Router();

// Login de usuario
router.post('/login', validateLogin, asyncHandler(async (req, res) => {
  const { email, password, tenant_id } = req.body;
  const ipAddress = req.ip || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'];

  try {
    // Buscar usuario por email y tenant
    const { data: usuario, error } = await supabaseAdmin
      .from('usuarios')
      .select(`
        id,
        email,
        nombre,
        apellidos,
        rol,
        password_hash,
        estado,
        failed_login_attempts,
        locked_until,
        tenant_id
      `)
      .eq('email', email)
      .eq('tenant_id', tenant_id)
      .single();

    if (error || !usuario) {
      await logFailedLogin(null, email, tenant_id, ipAddress, userAgent, 'USER_NOT_FOUND');
      return res.status(401).json({
        error: 'Credenciales inválidas',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Verificar si la cuenta está bloqueada
    if (usuario.locked_until && new Date(usuario.locked_until) > new Date()) {
      const remainingTime = Math.ceil((new Date(usuario.locked_until) - new Date()) / (1000 * 60));
      return res.status(423).json({
        error: 'Cuenta bloqueada temporalmente',
        code: 'ACCOUNT_LOCKED',
        remaining_minutes: remainingTime
      });
    }

    // Verificar estado del usuario
    if (usuario.estado !== 'activo') {
      await logFailedLogin(usuario.id, email, tenant_id, ipAddress, userAgent, 'USER_INACTIVE');
      return res.status(401).json({
        error: 'Usuario inactivo',
        code: 'USER_INACTIVE'
      });
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, usuario.password_hash);
    if (!isValidPassword) {
      await logFailedLogin(usuario.id, email, tenant_id, ipAddress, userAgent, 'INVALID_PASSWORD');
      await incrementFailedAttempts(usuario.id);
      return res.status(401).json({
        error: 'Credenciales inválidas',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Login exitoso - generar tokens
    const accessToken = generateAccessToken({
      userId: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
      tenantId: tenant_id
    });

    const refreshToken = generateRefreshToken({ userId: usuario.id });

    // Crear sesión en base de datos
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 8); // 8 horas

    const { data: sesion, error: sesionError } = await supabaseAdmin
      .from('sesiones')
      .insert({
        usuario_id: usuario.id,
        tenant_id: tenant_id,
        token_hash: hashToken(accessToken),
        refresh_token_hash: hashToken(refreshToken),
        ip_address: ipAddress,
        user_agent: userAgent,
        expires_at: expiresAt.toISOString(),
        estado: 'activa'
      })
      .select('id')
      .single();

    if (sesionError) {
      console.error('❌ Error creando sesión:', sesionError);
      throw createError(500, 'SESSION_ERROR', 'Error creando sesión');
    }

    // Resetear intentos fallidos y actualizar último login
    await supabaseAdmin
      .from('usuarios')
      .update({
        failed_login_attempts: 0,
        locked_until: null,
        last_login: new Date().toISOString()
      })
      .eq('id', usuario.id);

    // Log de auditoría para login exitoso
    await supabaseAdmin
      .from('audit_log')
      .insert({
        tenant_id: tenant_id,
        usuario_id: usuario.id,
        action: 'LOGIN',
        resource_type: 'auth',
        descripcion: 'Login exitoso',
        ip_address: ipAddress,
        user_agent: userAgent,
        exitosa: true,
        metadata: { session_id: sesion.id }
      });

    res.json({
      message: 'Login exitoso',
      user: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        apellidos: usuario.apellidos,
        rol: usuario.rol,
        tenant_id: tenant_id
      },
      tokens: {
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_in: 28800 // 8 horas en segundos
      },
      session_id: sesion.id
    });

  } catch (error) {
    console.error('❌ Error en login:', error);
    throw error;
  }
}));

// Registro de nuevo usuario (solo admins)
router.post('/register', validateRegisterUser, asyncHandler(async (req, res) => {
  const { email, nombre, apellidos, telefono, password, rol, tenant_id } = req.body;

  // Verificar que el tenant existe
  const { data: tenant, error: tenantError } = await supabaseAdmin
    .from('organizaciones')
    .select('tenant_id, estado')
    .eq('tenant_id', tenant_id)
    .single();

  if (tenantError || !tenant) {
    throw createError(404, 'TENANT_NOT_FOUND', 'Organización no encontrada');
  }

  if (tenant.estado !== 'activa') {
    throw createError(400, 'TENANT_INACTIVE', 'Organización no activa');
  }

  // Hashear contraseña
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  // Crear usuario
  const { data: nuevoUsuario, error } = await supabaseAdmin
    .from('usuarios')
    .insert({
      email,
      nombre,
      apellidos,
      telefono,
      password_hash: passwordHash,
      rol: rol || 'user',
      tenant_id,
      email_verified: false,
      estado: 'activo'
    })
    .select(`
      id,
      email,
      nombre,
      apellidos,
      rol,
      tenant_id,
      created_at
    `)
    .single();

  if (error) {
    if (error.code === '23505') { // Violación de unicidad
      throw createError(409, 'EMAIL_EXISTS', 'El email ya está registrado en esta organización');
    }
    throw createError(500, 'REGISTRATION_ERROR', 'Error en el registro del usuario');
  }

  // Log de auditoría
  await supabaseAdmin
    .from('audit_log')
    .insert({
      tenant_id: tenant_id,
      usuario_id: nuevoUsuario.id,
      action: 'USER_CREATED',
      resource_type: 'user',
      resource_id: nuevoUsuario.id,
      descripcion: `Usuario ${email} registrado con rol ${rol}`,
      exitosa: true
    });

  res.status(201).json({
    message: 'Usuario registrado exitosamente',
    user: nuevoUsuario
  });
}));

// Renovar token de acceso
router.post('/refresh', asyncHandler(async (req, res) => {
  const { refresh_token } = req.body;

  if (!refresh_token) {
    throw createError(400, 'MISSING_REFRESH_TOKEN', 'Refresh token requerido');
  }

  try {
    // Verificar refresh token
    const decoded = jwt.verify(refresh_token, process.env.JWT_SECRET);

    // Buscar sesión activa
    const { data: sesion, error } = await supabaseAdmin
      .from('sesiones')
      .select(`
        id,
        usuario_id,
        tenant_id,
        expires_at,
        usuarios!inner (
          id,
          email,
          nombre,
          rol,
          estado,
          tenant_id
        )
      `)
      .eq('refresh_token_hash', hashToken(refresh_token))
      .eq('estado', 'activa')
      .single();

    if (error || !sesion) {
      throw createError(401, 'INVALID_REFRESH_TOKEN', 'Refresh token inválido');
    }

    // Verificar que no haya expirado
    if (new Date(sesion.expires_at) < new Date()) {
      await supabaseAdmin
        .from('sesiones')
        .update({ estado: 'expirada' })
        .eq('id', sesion.id);

      throw createError(401, 'REFRESH_TOKEN_EXPIRED', 'Refresh token expirado');
    }

    // Generar nuevo access token
    const newAccessToken = generateAccessToken({
      userId: sesion.usuarios.id,
      email: sesion.usuarios.email,
      rol: sesion.usuarios.rol,
      tenantId: sesion.tenant_id
    });

    // Actualizar hash del token en la sesión
    await supabaseAdmin
      .from('sesiones')
      .update({
        token_hash: hashToken(newAccessToken),
        last_activity: new Date().toISOString()
      })
      .eq('id', sesion.id);

    res.json({
      access_token: newAccessToken,
      expires_in: 28800 // 8 horas
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      throw createError(401, 'INVALID_REFRESH_TOKEN', 'Refresh token inválido o expirado');
    }
    throw error;
  }
}));

// Logout
router.post('/logout', authMiddleware, asyncHandler(async (req, res) => {
  const { session_id } = req.user;

  // Marcar sesión como inactiva
  await supabaseAdmin
    .from('sesiones')
    .update({ estado: 'inactiva' })
    .eq('id', session_id);

  // Log de auditoría
  await supabaseAdmin
    .from('audit_log')
    .insert({
      tenant_id: req.tenant_id,
      usuario_id: req.user.id,
      action: 'LOGOUT',
      resource_type: 'auth',
      descripcion: 'Logout exitoso',
      exitosa: true
    });

  res.json({
    message: 'Logout exitoso'
  });
}));

// Cambiar contraseña
router.post('/change-password', authMiddleware, validateChangePassword, asyncHandler(async (req, res) => {
  const { current_password, new_password } = req.body;
  const { id: userId } = req.user;

  // Obtener usuario actual
  const { data: usuario, error } = await supabaseAdmin
    .from('usuarios')
    .select('password_hash')
    .eq('id', userId)
    .single();

  if (error || !usuario) {
    throw createError(404, 'USER_NOT_FOUND', 'Usuario no encontrado');
  }

  // Verificar contraseña actual
  const isValidPassword = await bcrypt.compare(current_password, usuario.password_hash);
  if (!isValidPassword) {
    throw createError(401, 'INVALID_CURRENT_PASSWORD', 'Contraseña actual incorrecta');
  }

  // Hashear nueva contraseña
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
  const newPasswordHash = await bcrypt.hash(new_password, saltRounds);

  // Actualizar contraseña
  await supabaseAdmin
    .from('usuarios')
    .update({ password_hash: newPasswordHash })
    .eq('id', userId);

  // Invalidar todas las sesiones del usuario excepto la actual
  await supabaseAdmin
    .from('sesiones')
    .update({ estado: 'revocada' })
    .eq('usuario_id', userId)
    .neq('id', req.user.session_id);

  // Log de auditoría
  await supabaseAdmin
    .from('audit_log')
    .insert({
      tenant_id: req.tenant_id,
      usuario_id: userId,
      action: 'PASSWORD_CHANGED',
      resource_type: 'user',
      descripcion: 'Contraseña cambiada exitosamente',
      exitosa: true
    });

  res.json({
    message: 'Contraseña cambiada exitosamente'
  });
}));

// Perfil del usuario actual
router.get('/profile', authMiddleware, asyncHandler(async (req, res) => {
  const { data: usuario, error } = await supabaseAdmin
    .from('usuarios')
    .select(`
      id,
      email,
      nombre,
      apellidos,
      telefono,
      rol,
      preferencias,
      email_verified,
      last_login,
      created_at,
      updated_at
    `)
    .eq('id', req.user.id)
    .single();

  if (error || !usuario) {
    throw createError(404, 'USER_NOT_FOUND', 'Usuario no encontrado');
  }

  res.json({
    user: usuario
  });
}));

// Funciones helper
function generateAccessToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE_IN || '8h',
    issuer: 'lpdp-backend',
    audience: 'lpdp-frontend'
  });
}

function generateRefreshToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE_IN || '7d',
    issuer: 'lpdp-backend',
    audience: 'lpdp-frontend'
  });
}

async function logFailedLogin(userId, email, tenantId, ipAddress, userAgent, reason) {
  try {
    await supabaseAdmin
      .from('audit_log')
      .insert({
        tenant_id: tenantId,
        usuario_id: userId,
        action: 'LOGIN_FAILED',
        resource_type: 'auth',
        descripcion: `Login fallido para ${email}: ${reason}`,
        ip_address: ipAddress,
        user_agent: userAgent,
        exitosa: false,
        metadata: { reason, email }
      });
  } catch (error) {
    console.error('❌ Error logging failed login:', error);
  }
}

async function incrementFailedAttempts(userId) {
  try {
    const { data: usuario } = await supabaseAdmin
      .from('usuarios')
      .select('failed_login_attempts')
      .eq('id', userId)
      .single();

    const newAttempts = (usuario?.failed_login_attempts || 0) + 1;
    const maxAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5;

    const updateData = {
      failed_login_attempts: newAttempts
    };

    // Bloquear cuenta si se exceden los intentos máximos
    if (newAttempts >= maxAttempts) {
      const lockoutMinutes = parseInt(process.env.LOCKOUT_DURATION_MINUTES) || 15;
      const lockedUntil = new Date();
      lockedUntil.setMinutes(lockedUntil.getMinutes() + lockoutMinutes);
      updateData.locked_until = lockedUntil.toISOString();
    }

    await supabaseAdmin
      .from('usuarios')
      .update(updateData)
      .eq('id', userId);
  } catch (error) {
    console.error('❌ Error incrementing failed attempts:', error);
  }
}

module.exports = router;