const jwt = require('jsonwebtoken');
const { supabaseAdmin } = require('../config/database');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Token de autenticación requerido',
        code: 'MISSING_TOKEN'
      });
    }

    const token = authHeader.substring(7);
    
    // Verificar JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verificar que la sesión esté activa en la base de datos
    const { data: sesion, error } = await supabaseAdmin
      .from('sesiones')
      .select(`
        id,
        usuario_id,
        tenant_id,
        expires_at,
        estado,
        usuarios!inner (
          id,
          email,
          nombre,
          rol,
          estado,
          tenant_id
        )
      `)
      .eq('token_hash', hashToken(token))
      .eq('estado', 'activa')
      .single();

    if (error || !sesion) {
      return res.status(401).json({
        error: 'Sesión inválida o expirada',
        code: 'INVALID_SESSION'
      });
    }

    // Verificar expiración
    if (new Date(sesion.expires_at) < new Date()) {
      // Marcar sesión como expirada
      await supabaseAdmin
        .from('sesiones')
        .update({ estado: 'expirada' })
        .eq('id', sesion.id);

      return res.status(401).json({
        error: 'Sesión expirada',
        code: 'SESSION_EXPIRED'
      });
    }

    // Verificar que el usuario esté activo
    if (sesion.usuarios.estado !== 'activo') {
      return res.status(401).json({
        error: 'Usuario no activo',
        code: 'USER_INACTIVE'
      });
    }

    // Actualizar última actividad
    await supabaseAdmin
      .from('sesiones')
      .update({ last_activity: new Date().toISOString() })
      .eq('id', sesion.id);

    // Agregar información del usuario al request
    req.user = {
      id: sesion.usuarios.id,
      email: sesion.usuarios.email,
      nombre: sesion.usuarios.nombre,
      rol: sesion.usuarios.rol,
      tenant_id: sesion.usuarios.tenant_id,
      session_id: sesion.id
    };

    req.tenant_id = sesion.tenant_id;

    next();
  } catch (error) {
    console.error('❌ Error en middleware de autenticación:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Token inválido',
        code: 'INVALID_TOKEN'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expirado',
        code: 'TOKEN_EXPIRED'
      });
    }

    return res.status(500).json({
      error: 'Error interno de autenticación',
      code: 'AUTH_ERROR'
    });
  }
};

// Middleware para verificar roles específicos
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Usuario no autenticado',
        code: 'NOT_AUTHENTICATED'
      });
    }

    if (!allowedRoles.includes(req.user.rol)) {
      return res.status(403).json({
        error: 'Permisos insuficientes',
        code: 'INSUFFICIENT_PERMISSIONS',
        required_roles: allowedRoles,
        user_role: req.user.rol
      });
    }

    next();
  };
};

// Middleware para verificar si es admin o super admin
const requireAdmin = requireRole('admin', 'super_admin');

// Middleware para verificar si es DPO, admin o super admin
const requireDPO = requireRole('dpo', 'admin', 'super_admin');

// Función helper para hashear tokens
function hashToken(token) {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(token).digest('hex');
}

// Middleware opcional (continúa sin autenticación si no hay token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    // Usar el middleware de autenticación regular pero capturar errores
    await authMiddleware(req, res, (error) => {
      if (error) {
        console.warn('⚠️ Autenticación opcional falló:', error);
      }
      next();
    });
  } catch (error) {
    console.warn('⚠️ Error en autenticación opcional:', error);
    next();
  }
};

module.exports = {
  authMiddleware,
  requireRole,
  requireAdmin,
  requireDPO,
  optionalAuth,
  hashToken
};