// 🚀 API v1.0 RAT SISTEMA LPDP
// Implementación según Plan Estratégico - Tabla 2
// API-First Strategy para integraciones ecosistema chileno

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { v4: uuidv4 } = require('uuid');
const app = express();

// Middleware de seguridad
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 requests por ventana por IP
  message: 'Demasiadas solicitudes desde esta IP, intente más tarde.'
});

app.use('/api/v1/', apiLimiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// JWT Secret (en producción usar variable de entorno)
const JWT_SECRET = process.env.JWT_SECRET || 'lpdp_chile_2024_secret_key';

// Base de datos en memoria (en producción usar PostgreSQL/Supabase)
let ratDatabase = new Map();
let proveedoresDatabase = new Map();
let eipdDatabase = new Map();
let tenantDatabase = new Map();

// Middleware de autenticación OAuth 2.0 simplificado
const authenticateToken = (requiredScopes = []) => {
  return (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        error: 'Token de acceso requerido',
        message: 'Debe incluir Authorization: Bearer <token>' 
      });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ 
          error: 'Token inválido o expirado' 
        });
      }

      // Verificar scopes requeridos
      if (requiredScopes.length > 0) {
        const userScopes = user.scopes || [];
        const hasRequiredScope = requiredScopes.some(scope => 
          userScopes.includes(scope) || userScopes.includes('admin')
        );
        
        if (!hasRequiredScope) {
          return res.status(403).json({
            error: 'Permisos insuficientes',
            required_scopes: requiredScopes,
            user_scopes: userScopes
          });
        }
      }

      req.user = user;
      next();
    });
  };
};

// Endpoint para obtener token de acceso (OAuth 2.0 simplificado)
app.post('/api/v1/auth/token', (req, res) => {
  const { client_id, client_secret, grant_type, scope } = req.body;
  
  // Validación básica (en producción verificar contra base de datos)
  if (grant_type !== 'client_credentials') {
    return res.status(400).json({
      error: 'unsupported_grant_type',
      error_description: 'Solo se soporta client_credentials'
    });
  }

  if (!client_id || !client_secret) {
    return res.status(400).json({
      error: 'invalid_request',
      error_description: 'client_id y client_secret son requeridos'
    });
  }

  // Generar token JWT
  const scopes = scope ? scope.split(' ') : ['activities:read'];
  const token = jwt.sign({
    client_id,
    scopes,
    tenant_id: 'demo_tenant', // En producción extraer del client_id
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 horas
  }, JWT_SECRET);

  res.json({
    access_token: token,
    token_type: 'Bearer',
    expires_in: 86400, // 24 horas en segundos
    scope: scopes.join(' ')
  });
});

// 📋 ENDPOINTS ACTIVIDADES RAT (Tabla 2 Plan Estratégico)

// POST /api/v1/activities - Crear nueva actividad RAT
app.post('/api/v1/activities', authenticateToken(['activities:write']), (req, res) => {
  try {
    const activityId = uuidv4();
    const activity = {
      activity_id: activityId,
      ...req.body,
      tenant_id: req.user.tenant_id,
      created_by: req.user.client_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      version: '1.0',
      status: 'active'
    };

    // Validación básica según Tabla 1 Plan Estratégico
    const requiredFields = ['responsible_party', 'treatment_purpose', 'data_categories'];
    for (const field of requiredFields) {
      if (!activity[field]) {
        return res.status(400).json({
          error: 'validation_error',
          message: `Campo requerido faltante: ${field}`,
          field: field
        });
      }
    }

    ratDatabase.set(activityId, activity);
    
    res.status(201).json({
      status: 'success',
      activity_id: activityId,
      message: 'Actividad de tratamiento creada exitosamente',
      data: activity
    });
  } catch (error) {
    res.status(500).json({
      error: 'internal_error',
      message: error.message
    });
  }
});

// GET /api/v1/activities/{id} - Obtener actividad específica
app.get('/api/v1/activities/:id', authenticateToken(['activities:read']), (req, res) => {
  try {
    const activity = ratDatabase.get(req.params.id);
    
    if (!activity) {
      return res.status(404).json({
        error: 'not_found',
        message: 'Actividad de tratamiento no encontrada'
      });
    }

    // Verificar pertenencia al tenant
    if (activity.tenant_id !== req.user.tenant_id && !req.user.scopes.includes('admin')) {
      return res.status(403).json({
        error: 'forbidden',
        message: 'No tiene acceso a esta actividad'
      });
    }

    res.json(activity);
  } catch (error) {
    res.status(500).json({
      error: 'internal_error',
      message: error.message
    });
  }
});

// PUT /api/v1/activities/{id} - Actualizar actividad
app.put('/api/v1/activities/:id', authenticateToken(['activities:write']), (req, res) => {
  try {
    const activity = ratDatabase.get(req.params.id);
    
    if (!activity) {
      return res.status(404).json({
        error: 'not_found',
        message: 'Actividad de tratamiento no encontrada'
      });
    }

    if (activity.tenant_id !== req.user.tenant_id && !req.user.scopes.includes('admin')) {
      return res.status(403).json({
        error: 'forbidden',
        message: 'No tiene acceso para modificar esta actividad'
      });
    }

    const updatedActivity = {
      ...activity,
      ...req.body,
      activity_id: req.params.id, // Preservar ID
      tenant_id: activity.tenant_id, // Preservar tenant
      created_by: activity.created_by, // Preservar creador
      created_at: activity.created_at, // Preservar fecha creación
      updated_at: new Date().toISOString(),
      version: activity.version ? `${parseFloat(activity.version) + 0.1}`.substring(0, 3) : '1.1'
    };

    ratDatabase.set(req.params.id, updatedActivity);

    res.json({
      status: 'success',
      activity_id: req.params.id,
      message: 'Actividad actualizada exitosamente',
      data: updatedActivity
    });
  } catch (error) {
    res.status(500).json({
      error: 'internal_error',
      message: error.message
    });
  }
});

// GET /api/v1/activities - Listar actividades con filtros y paginación
app.get('/api/v1/activities', authenticateToken(['activities:read']), (req, res) => {
  try {
    const { status, limit = 50, offset = 0, data_subject_category, uses_international_transfer } = req.query;
    
    let activities = Array.from(ratDatabase.values())
      .filter(activity => activity.tenant_id === req.user.tenant_id || req.user.scopes.includes('admin'));

    // Aplicar filtros
    if (status) {
      activities = activities.filter(a => a.status === status);
    }
    
    if (data_subject_category) {
      activities = activities.filter(a => 
        a.data_categories?.data_subjects?.includes(data_subject_category)
      );
    }

    if (uses_international_transfer === 'true') {
      activities = activities.filter(a => 
        a.international_transfers?.exists === true
      );
    }

    // Paginación
    const total = activities.length;
    const paginatedActivities = activities
      .slice(parseInt(offset), parseInt(offset) + parseInt(limit));

    res.json({
      data: paginatedActivities,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        has_next: (parseInt(offset) + parseInt(limit)) < total
      },
      filters_applied: {
        status,
        data_subject_category,
        uses_international_transfer
      }
    });
  } catch (error) {
    res.status(500).json({
      error: 'internal_error',
      message: error.message
    });
  }
});

// DELETE /api/v1/activities/{id} - Archivar actividad
app.delete('/api/v1/activities/:id', authenticateToken(['activities:write']), (req, res) => {
  try {
    const activity = ratDatabase.get(req.params.id);
    
    if (!activity) {
      return res.status(404).json({
        error: 'not_found',
        message: 'Actividad de tratamiento no encontrada'
      });
    }

    if (activity.tenant_id !== req.user.tenant_id && !req.user.scopes.includes('admin')) {
      return res.status(403).json({
        error: 'forbidden',
        message: 'No tiene acceso para eliminar esta actividad'
      });
    }

    // Archivar en lugar de eliminar completamente
    const archivedActivity = {
      ...activity,
      status: 'archived',
      archived_at: new Date().toISOString(),
      archived_by: req.user.client_id
    };

    ratDatabase.set(req.params.id, archivedActivity);

    res.json({
      status: 'success',
      activity_id: req.params.id,
      message: 'Actividad archivada exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      error: 'internal_error', 
      message: error.message
    });
  }
});

// 📊 ENDPOINT EXPORTACIÓN RAT COMPLETO
app.get('/api/v1/rat/export', authenticateToken(['rat:export']), (req, res) => {
  try {
    const { format = 'json' } = req.query;
    
    const activities = Array.from(ratDatabase.values())
      .filter(activity => 
        activity.tenant_id === req.user.tenant_id && 
        activity.status === 'active'
      )
      .map(activity => ({
        // Mapear según estructura Tabla 1 Plan Estratégico
        activity_id: activity.activity_id,
        responsible_party: activity.responsible_party,
        treatment_purpose: activity.treatment_purpose,
        data_categories: activity.data_categories,
        international_transfers: activity.international_transfers,
        data_sources: activity.data_sources,
        retention_periods: activity.retention_periods,
        security_measures: activity.security_measures,
        automated_decisions: activity.automated_decisions,
        created_at: activity.created_at,
        updated_at: activity.updated_at,
        version: activity.version
      }));

    if (format === 'json') {
      res.json({
        export_date: new Date().toISOString(),
        tenant_id: req.user.tenant_id,
        total_activities: activities.length,
        compliance_status: 'LPDP_21719_COMPLIANT',
        activities: activities
      });
    } else if (format === 'csv') {
      // Implementar exportación CSV
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="rat_export.csv"');
      
      const csvHeader = 'ID,Responsable,Finalidad,Categorías Datos,Transferencias Int.,Fecha Creación\n';
      const csvRows = activities.map(a => 
        `"${a.activity_id}","${a.responsible_party?.name || ''}","${a.treatment_purpose?.description || ''}","${a.data_categories?.personal_data?.join(';') || ''}","${a.international_transfers?.exists ? 'Sí' : 'No'}","${a.created_at}"`
      ).join('\n');
      
      res.send(csvHeader + csvRows);
    } else {
      res.status(400).json({
        error: 'invalid_format',
        message: 'Formato no soportado. Use: json o csv',
        supported_formats: ['json', 'csv']
      });
    }
  } catch (error) {
    res.status(500).json({
      error: 'export_error',
      message: error.message
    });
  }
});

// 🤝 ENDPOINTS GESTIÓN DE PROVEEDORES
app.get('/api/v1/processors', authenticateToken(['processors:read']), (req, res) => {
  try {
    const processors = Array.from(proveedoresDatabase.values())
      .filter(p => p.tenant_id === req.user.tenant_id || req.user.scopes.includes('admin'));

    res.json({
      data: processors,
      total: processors.length,
      summary: {
        active: processors.filter(p => p.status === 'active').length,
        with_dpa: processors.filter(p => p.dpa_info?.signed === true).length,
        high_risk: processors.filter(p => p.security_evaluation?.risk_level === 'high').length
      }
    });
  } catch (error) {
    res.status(500).json({
      error: 'internal_error',
      message: error.message
    });
  }
});

app.post('/api/v1/processors', authenticateToken(['processors:write']), (req, res) => {
  try {
    const processorId = uuidv4();
    const processor = {
      processor_id: processorId,
      ...req.body,
      tenant_id: req.user.tenant_id,
      created_by: req.user.client_id,
      created_at: new Date().toISOString(),
      status: 'active'
    };

    proveedoresDatabase.set(processorId, processor);

    res.status(201).json({
      status: 'success',
      processor_id: processorId,
      message: 'Encargado de tratamiento registrado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      error: 'internal_error',
      message: error.message
    });
  }
});

// 📋 ENDPOINTS EIPD (Evaluaciones de Impacto)
app.get('/api/v1/dpia', authenticateToken(['dpia:read']), (req, res) => {
  try {
    const evaluations = Array.from(eipdDatabase.values())
      .filter(e => e.tenant_id === req.user.tenant_id);

    res.json({
      data: evaluations,
      total: evaluations.length
    });
  } catch (error) {
    res.status(500).json({
      error: 'internal_error',
      message: error.message
    });
  }
});

// 📊 ENDPOINT HEALTH CHECK
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'healthy',
    version: '1.0.0',
    api_compliance: 'LPDP_21719',
    endpoints_available: [
      'POST /api/v1/activities',
      'GET /api/v1/activities',
      'GET /api/v1/activities/{id}',
      'PUT /api/v1/activities/{id}',
      'DELETE /api/v1/activities/{id}',
      'GET /api/v1/rat/export',
      'GET /api/v1/processors',
      'POST /api/v1/processors'
    ],
    chile_timezone: new Date().toLocaleString('es-CL', {timeZone: 'America/Santiago'})
  });
});

// 📚 ENDPOINT DOCUMENTACIÓN API (OpenAPI/Swagger)
app.get('/api/v1/docs', (req, res) => {
  const swaggerDoc = {
    openapi: '3.0.0',
    info: {
      title: 'API Sistema RAT LPDP Chile',
      version: '1.0.0',
      description: 'API para gestión de Registro de Actividades de Tratamiento según Ley 21.719',
      contact: {
        name: 'Jurídica Digital SPA',
        email: 'api@juridicadigital.cl'
      }
    },
    servers: [
      { url: 'http://localhost:3001/api/v1', description: 'Desarrollo' },
      { url: 'https://api.juridicadigital.cl/v1', description: 'Producción' }
    ],
    security: [{ 'BearerAuth': [] }],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    paths: {
      '/activities': {
        get: {
          summary: 'Listar actividades de tratamiento',
          parameters: [
            { name: 'status', in: 'query', schema: { type: 'string' }},
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 50 }},
            { name: 'offset', in: 'query', schema: { type: 'integer', default: 0 }}
          ]
        },
        post: {
          summary: 'Crear nueva actividad de tratamiento',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['responsible_party', 'treatment_purpose', 'data_categories'],
                  properties: {
                    responsible_party: { type: 'object' },
                    treatment_purpose: { type: 'object' },
                    data_categories: { type: 'object' }
                  }
                }
              }
            }
          }
        }
      }
    }
  };

  res.json(swaggerDoc);
});

// Middleware de manejo de errores
app.use((error, req, res, next) => {
  console.error('API Error:', error);
  res.status(500).json({
    error: 'internal_server_error',
    message: 'Error interno del servidor',
    request_id: uuidv4()
  });
});

// Middleware 404
app.use((req, res) => {
  res.status(404).json({
    error: 'endpoint_not_found',
    message: `Endpoint ${req.method} ${req.path} no encontrado`,
    available_endpoints: [
      'GET /api/v1/health',
      'GET /api/v1/docs', 
      'POST /api/v1/auth/token',
      'GET /api/v1/activities',
      'POST /api/v1/activities',
      'GET /api/v1/rat/export'
    ]
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 API RAT LPDP v1.0 corriendo en puerto ${PORT}`);
  console.log(`📋 Documentación: http://localhost:${PORT}/api/v1/docs`);
  console.log(`⚡ Health Check: http://localhost:${PORT}/api/v1/health`);
  console.log(`🇨🇱 Cumplimiento Ley 21.719 - Chile`);
});

module.exports = app;