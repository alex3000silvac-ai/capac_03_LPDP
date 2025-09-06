const { supabaseAdmin } = require('../config/database');

// Middleware principal de manejo de errores
const errorHandler = async (err, req, res, next) => {
  console.error('❌ Error capturado:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.originalUrl,
    method: req.method,
    user: req.user?.id,
    tenant: req.tenant_id,
    timestamp: new Date().toISOString()
  });

  // Registrar error en audit_log si tenemos contexto
  if (req.tenant_id && req.originalUrl !== '/health') {
    try {
      await logError(req, err);
    } catch (logError) {
      console.error('❌ Error registrando en audit_log:', logError);
    }
  }

  // Determinar tipo de error y respuesta apropiada
  const errorResponse = determineErrorResponse(err, req);
  
  res.status(errorResponse.status).json(errorResponse);
};

// Función para determinar la respuesta de error apropiada
const determineErrorResponse = (err, req) => {
  const timestamp = new Date().toISOString();
  const baseResponse = {
    error: true,
    timestamp,
    path: req.originalUrl,
    method: req.method,
  };

  // Errores de validación de Joi
  if (err.isJoi) {
    return {
      ...baseResponse,
      status: 400,
      code: 'VALIDATION_ERROR',
      message: 'Errores de validación en los datos enviados',
      details: err.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    };
  }

  // Errores de Supabase
  if (err.code && err.code.startsWith('PGRST')) {
    return handleSupabaseError(err, baseResponse);
  }

  // Errores de PostgreSQL
  if (err.code && err.code.match(/^\d{5}$/)) {
    return handlePostgresError(err, baseResponse);
  }

  // Errores de JWT
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return {
      ...baseResponse,
      status: 401,
      code: 'AUTHENTICATION_ERROR',
      message: 'Token de autenticación inválido o expirado'
    };
  }

  // Errores personalizados de la aplicación
  if (err.code && err.status) {
    return {
      ...baseResponse,
      status: err.status,
      code: err.code,
      message: err.message,
      details: err.details || undefined
    };
  }

  // Errores de sintaxis JSON
  if (err instanceof SyntaxError && err.type === 'entity.parse.failed') {
    return {
      ...baseResponse,
      status: 400,
      code: 'INVALID_JSON',
      message: 'Formato JSON inválido en el cuerpo de la petición'
    };
  }

  // Error genérico del servidor
  return {
    ...baseResponse,
    status: 500,
    code: 'INTERNAL_SERVER_ERROR',
    message: process.env.NODE_ENV === 'production' 
      ? 'Error interno del servidor' 
      : err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  };
};

// Manejo específico de errores de Supabase
const handleSupabaseError = (err, baseResponse) => {
  const statusMap = {
    'PGRST301': 400, // Bad request
    'PGRST116': 406, // Not acceptable
    'PGRST204': 404, // Not found
    'PGRST106': 400, // Parse error
  };

  return {
    ...baseResponse,
    status: statusMap[err.code] || 500,
    code: 'DATABASE_ERROR',
    message: 'Error en operación de base de datos',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  };
};

// Manejo específico de errores de PostgreSQL
const handlePostgresError = (err, baseResponse) => {
  const errorMap = {
    '23505': { // unique_violation
      status: 409,
      code: 'DUPLICATE_ENTRY',
      message: 'Ya existe un registro con estos datos'
    },
    '23503': { // foreign_key_violation
      status: 400,
      code: 'INVALID_REFERENCE',
      message: 'Referencia inválida en los datos'
    },
    '23514': { // check_violation
      status: 400,
      code: 'CONSTRAINT_VIOLATION',
      message: 'Los datos no cumplen con las restricciones establecidas'
    },
    '42703': { // undefined_column
      status: 500,
      code: 'DATABASE_SCHEMA_ERROR',
      message: 'Error de esquema en base de datos'
    },
    '42P01': { // undefined_table
      status: 500,
      code: 'DATABASE_SCHEMA_ERROR',
      message: 'Tabla no encontrada en base de datos'
    }
  };

  const errorInfo = errorMap[err.code] || {
    status: 500,
    code: 'DATABASE_ERROR',
    message: 'Error de base de datos'
  };

  return {
    ...baseResponse,
    ...errorInfo,
    details: process.env.NODE_ENV === 'development' ? {
      pg_code: err.code,
      pg_message: err.message,
      constraint: err.constraint,
      table: err.table,
      column: err.column
    } : undefined
  };
};

// Registrar error en audit_log
const logError = async (req, err) => {
  try {
    await supabaseAdmin
      .from('audit_log')
      .insert({
        tenant_id: req.tenant_id,
        usuario_id: req.user?.id || null,
        action: 'ERROR',
        resource_type: 'system',
        resource_id: req.originalUrl,
        descripcion: err.message,
        metadata: {
          error_type: err.name || 'UnknownError',
          error_code: err.code,
          stack_trace: process.env.NODE_ENV === 'development' ? err.stack : undefined,
          request_body: req.body && Object.keys(req.body).length > 0 ? req.body : undefined,
          query_params: req.query && Object.keys(req.query).length > 0 ? req.query : undefined
        },
        ip_address: req.ip || req.connection.remoteAddress,
        user_agent: req.headers['user-agent'],
        endpoint: req.originalUrl,
        metodo_http: req.method,
        exitosa: false,
        codigo_respuesta: 500
      });
  } catch (logErr) {
    console.error('❌ No se pudo registrar error en audit_log:', logErr);
  }
};

// Middleware para manejo de rutas no encontradas (404)
const notFoundHandler = (req, res) => {
  const response = {
    error: true,
    status: 404,
    code: 'ROUTE_NOT_FOUND',
    message: 'Ruta no encontrada',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
    available_endpoints: process.env.NODE_ENV === 'development' ? [
      'GET /health',
      'POST /api/auth/login',
      'POST /api/auth/register',
      'GET /api/rat',
      'POST /api/rat',
      'GET /api/dashboard/stats',
      'GET /api/audit'
    ] : undefined
  };

  res.status(404).json(response);
};

// Función helper para crear errores personalizados
const createError = (status, code, message, details = null) => {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  if (details) {
    error.details = details;
  }
  return error;
};

// Wrapper para async/await en rutas Express
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorHandler,
  notFoundHandler,
  createError,
  asyncHandler
};