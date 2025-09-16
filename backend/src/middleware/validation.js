const Joi = require('joi');

// Esquemas de validación comunes
const schemas = {
  // Validación para login
  login: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'El email debe tener un formato válido',
      'any.required': 'El email es obligatorio'
    }),
    password: Joi.string().min(1).required().messages({
      'any.required': 'La contraseña es obligatoria',
      'string.empty': 'La contraseña no puede estar vacía'
    }),
    tenant_id: Joi.string().min(3).max(255).required().messages({
      'any.required': 'El tenant_id es obligatorio',
      'string.min': 'El tenant_id debe tener al menos 3 caracteres',
      'string.max': 'El tenant_id no puede tener más de 255 caracteres'
    })
  }),

  // Validación para registro de usuarios
  registerUser: Joi.object({
    email: Joi.string().email().required(),
    nombre: Joi.string().min(2).max(255).required(),
    apellidos: Joi.string().min(2).max(255).optional(),
    telefono: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).optional(),
    password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required().messages({
      'string.pattern.base': 'La contraseña debe contener al menos una minúscula, una mayúscula y un número'
    }),
    rol: Joi.string().valid('user', 'dpo', 'admin').default('user'),
    tenant_id: Joi.string().min(3).max(255).required()
  }),

  // Validación para crear/actualizar RAT
  rat: Joi.object({
    nombre_actividad: Joi.string().min(5).max(500).required(),
    descripcion: Joi.string().max(2000).optional().allow(''),
    area_responsable: Joi.string().max(255).optional(),
    responsable_proceso: Joi.string().max(255).optional(),
    email_responsable: Joi.string().email().optional().allow(''),
    telefono_responsable: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).optional().allow(''),
    
    finalidad_principal: Joi.string().min(10).required(),
    finalidades_secundarias: Joi.array().items(Joi.string()).optional(),
    base_legal: Joi.string().required(),
    base_legal_descripcion: Joi.string().max(1000).optional().allow(''),
    
    categorias_titulares: Joi.array().items(Joi.string()).min(1).required(),
    categorias_datos: Joi.array().items(Joi.string()).min(1).required(),
    datos_sensibles: Joi.boolean().default(false),
    datos_sensibles_detalle: Joi.array().items(Joi.string()).optional(),
    datos_menores: Joi.boolean().default(false),
    
    origen_datos: Joi.array().items(Joi.string()).optional(),
    destinatarios_internos: Joi.array().items(Joi.string()).optional(),
    destinatarios_externos: Joi.array().items(Joi.string()).optional(),
    transferencias_internacionales: Joi.array().items(
      Joi.object({
        pais: Joi.string().required(),
        empresa: Joi.string().required(),
        garantias: Joi.string().required()
      })
    ).optional(),
    
    sistemas_tratamiento: Joi.array().items(Joi.string()).optional(),
    almacenamiento_ubicacion: Joi.string().max(255).optional().allow(''),
    medidas_seguridad_tecnicas: Joi.array().items(Joi.string()).optional(),
    medidas_seguridad_organizativas: Joi.array().items(Joi.string()).optional(),
    
    plazo_conservacion: Joi.string().max(255).optional().allow(''),
    criterio_conservacion: Joi.string().max(1000).optional().allow(''),
    destino_posterior: Joi.string().valid('eliminacion', 'archivo', 'anonimizacion').optional(),
    
    decision_automatizada: Joi.boolean().default(false),
    logica_decision_automatizada: Joi.string().max(1000).optional().allow(''),
    perfilado: Joi.boolean().default(false),
    
    nivel_riesgo: Joi.string().valid('bajo', 'medio', 'alto', 'critico').optional(),
    observaciones: Joi.string().max(2000).optional().allow('')
  }),

  // Validación para crear organización
  organizacion: Joi.object({
    tenant_id: Joi.string().min(3).max(255).pattern(/^[a-z0-9_]+$/).required().messages({
      'string.pattern.base': 'El tenant_id solo puede contener letras minúsculas, números y guiones bajos'
    }),
    nombre: Joi.string().min(2).max(500).required(),
    rut: Joi.string().pattern(/^\d{7,8}-[\dkK]$/).optional().messages({
      'string.pattern.base': 'El RUT debe tener el formato 12345678-9'
    }),
    razon_social: Joi.string().max(500).optional(),
    giro: Joi.string().max(500).optional(),
    direccion: Joi.string().max(1000).optional(),
    telefono: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).optional(),
    email: Joi.string().email().optional(),
    dpo_nombre: Joi.string().max(255).optional(),
    dpo_email: Joi.string().email().optional(),
    responsable_legal: Joi.string().max(255).optional()
  }),

  // Validación para parámetros de query comunes
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(25),
    sort: Joi.string().valid('created_at', 'updated_at', 'nombre_actividad', 'nivel_riesgo').default('created_at'),
    order: Joi.string().valid('asc', 'desc').default('desc')
  }),

  // Validación para filtros de RAT
  ratFilters: Joi.object({
    nivel_riesgo: Joi.alternatives().try(
      Joi.string().valid('bajo', 'medio', 'alto', 'critico'),
      Joi.array().items(Joi.string().valid('bajo', 'medio', 'alto', 'critico'))
    ).optional(),
    datos_sensibles: Joi.boolean().optional(),
    datos_menores: Joi.boolean().optional(),
    area_responsable: Joi.string().optional(),
    search: Joi.string().min(3).max(255).optional(),
    fecha_desde: Joi.date().iso().optional(),
    fecha_hasta: Joi.date().iso().optional(),
    estado: Joi.string().valid('activo', 'inactivo', 'archivado').default('activo')
  }),

  // Validación para actualizar perfil de usuario
  updateProfile: Joi.object({
    nombre: Joi.string().min(2).max(255).optional(),
    apellidos: Joi.string().min(2).max(255).optional(),
    telefono: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).optional().allow(''),
    preferencias: Joi.object({
      tema: Joi.string().valid('light', 'dark').optional(),
      idioma: Joi.string().valid('es', 'en').optional(),
      notificaciones_email: Joi.boolean().optional(),
      dashboard_personalizado: Joi.boolean().optional()
    }).optional()
  }),

  // Validación para cambio de contraseña
  changePassword: Joi.object({
    current_password: Joi.string().required(),
    new_password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required().messages({
      'string.pattern.base': 'La nueva contraseña debe contener al menos una minúscula, una mayúscula y un número'
    })
  }),

  // Validación para UUID
  uuid: Joi.string().uuid().required()
};

// Middleware de validación genérico
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], { 
      abortEarly: false,
      stripUnknown: true,
      convert: true
    });

    if (error) {
      return res.status(400).json({
        error: 'Errores de validación',
        code: 'VALIDATION_ERROR',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          value: detail.context?.value
        })),
        timestamp: new Date().toISOString()
      });
    }

    // Reemplazar los datos originales con los valores validados y limpiados
    req[property] = value;
    next();
  };
};

// Middlewares específicos para rutas comunes
const validateLogin = validate(schemas.login);
const validateRegisterUser = validate(schemas.registerUser);
const validateRat = validate(schemas.rat);
const validateOrganizacion = validate(schemas.organizacion);
const validatePagination = validate(schemas.pagination, 'query');
const validateRatFilters = validate(schemas.ratFilters, 'query');
const validateUpdateProfile = validate(schemas.updateProfile);
const validateChangePassword = validate(schemas.changePassword);
const validateUUID = (param = 'id') => validate(schemas.uuid, 'params');

// Validador personalizado para tenant_id
const validateTenantId = (req, res, next) => {
  const tenantId = req.headers['x-tenant-id'] || req.params.tenant_id || req.body.tenant_id;
  
  if (!tenantId) {
    return res.status(400).json({
      error: 'Tenant ID requerido',
      code: 'MISSING_TENANT_ID'
    });
  }

  const { error } = Joi.string().min(3).max(255).pattern(/^[a-z0-9_]+$/).validate(tenantId);
  
  if (error) {
    return res.status(400).json({
      error: 'Tenant ID inválido',
      code: 'INVALID_TENANT_ID',
      message: 'El tenant_id debe tener entre 3 y 255 caracteres y solo contener letras minúsculas, números y guiones bajos'
    });
  }

  next();
};

// Función helper para validar datos sin middleware
const validateData = (data, schema) => {
  const { error, value } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
    convert: true
  });

  if (error) {
    const details = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message,
      value: detail.context?.value
    }));
    
    return { isValid: false, errors: details };
  }

  return { isValid: true, data: value };
};

module.exports = {
  schemas,
  validate,
  validateLogin,
  validateRegisterUser,
  validateRat,
  validateOrganizacion,
  validatePagination,
  validateRatFilters,
  validateUpdateProfile,
  validateChangePassword,
  validateUUID,
  validateTenantId,
  validateData
};