/**
 * 🌐 RUTAS PARTNER APIs
 * Implementación completa de todas las rutas para partners según API_PARTNERS_INTEGRATION.md
 */

const express = require('express');
const router = express.Router();
const partnerAPIService = require('../services/partnerAPIService');
const rateLimit = require('express-rate-limit');

// 🛡️ MIDDLEWARE DE RATE LIMITING POR PARTNER
const partnerRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: (req) => {
    // Diferentes límites por partner
    const partnerType = req.headers['x-partner-type'];
    const limits = {
      'prelafit': 1000,      // Partner premium
      'rsm_chile': 1000,     // Partner premium  
      'datacompliance': 500,  // Partner estándar
      'amsoft': 200,         // Partner básico
      'fc_group': 200        // Partner básico
    };
    return limits[partnerType] || 100; // Default
  },
  message: {
    error: 'Rate limit excedido',
    code: 429,
    retry_after: '15 minutos'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// 🔐 MIDDLEWARE DE AUTENTICACIÓN API KEY
const authenticatePartner = async (req, res, next) => {
  try {
    const apiKey = req.headers.authorization?.replace('Bearer ', '') || req.headers['x-api-key'];
    
    if (!apiKey) {
      return res.status(401).json({
        error: 'API Key requerida',
        code: 401,
        details: 'Incluir API Key en header Authorization: Bearer {key} o X-API-Key'
      });
    }
    
    const partner = await partnerAPIService.validatePartnerAPIKey(apiKey);
    
    if (!partner) {
      return res.status(401).json({
        error: 'API Key inválida',
        code: 401,
        details: 'La API Key proporcionada no es válida o ha expirado'
      });
    }
    
    // Agregar info del partner al request
    req.partner = partner;
    req.headers['x-partner-type'] = partner.type;
    
    next();
  } catch (error) {
    console.error('❌ Error autenticando partner:', error);
    res.status(500).json({ 
      error: 'Error interno de autenticación',
      code: 500 
    });
  }
};

// 📝 MIDDLEWARE DE LOGGING
const logPartnerRequest = (req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    console.log(`🌐 [${req.partner?.type}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  
  next();
};

// Aplicar middlewares globales a todas las rutas
router.use(partnerRateLimit);
router.use(authenticatePartner);
router.use(logPartnerRequest);

// ==================== RUTAS API PARTNERS ====================

/**
 * 📊 OBTENER RATs COMPLETADOS
 * GET /api/v1/partners/rats/completed
 */
router.get('/rats/completed', async (req, res) => {
  try {
    await partnerAPIService.getCompletedRATs(req, res);
  } catch (error) {
    console.error('❌ Error en /rats/completed:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      code: 500,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * 🤖 ANÁLISIS INTELIGENTE DE TRATAMIENTO
 * POST /api/v1/partners/analysis/intelligent
 */
router.post('/analysis/intelligent', async (req, res) => {
  try {
    // Validar payload requerido
    const { empresa, tratamiento } = req.body;
    
    if (!empresa || !tratamiento) {
      return res.status(400).json({
        error: 'Payload incompleto',
        code: 400,
        required: ['empresa', 'tratamiento'],
        details: 'Se requieren los campos empresa y tratamiento'
      });
    }
    
    // Validar campos empresa
    if (!empresa.razon_social || !empresa.rut) {
      return res.status(400).json({
        error: 'Datos de empresa incompletos',
        code: 400,
        required: ['razon_social', 'rut']
      });
    }
    
    // Validar campos tratamiento
    if (!tratamiento.finalidad || !tratamiento.categorias_datos) {
      return res.status(400).json({
        error: 'Datos de tratamiento incompletos',
        code: 400,
        required: ['finalidad', 'categorias_datos']
      });
    }
    
    await partnerAPIService.intelligentAnalysis(req, res);
    
  } catch (error) {
    console.error('❌ Error en /analysis/intelligent:', error);
    res.status(500).json({
      error: 'Error en análisis inteligente',
      code: 500,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * 📄 OBTENER DOCUMENTO GENERADO
 * GET /api/v1/partners/documents/:tipo/:rat_id
 */
router.get('/documents/:tipo/:rat_id', async (req, res) => {
  try {
    const { tipo, rat_id } = req.params;
    
    // Validar tipos de documento permitidos
    const validTypes = ['EIPD', 'DPIA', 'DPA', 'CONSENTIMIENTO_MEDICO', 'AUTORIZACION_PARENTAL', 'CONSULTA_PREVIA'];
    
    if (!validTypes.includes(tipo.toUpperCase())) {
      return res.status(400).json({
        error: 'Tipo de documento inválido',
        code: 400,
        valid_types: validTypes,
        provided: tipo
      });
    }
    
    if (!rat_id) {
      return res.status(400).json({
        error: 'RAT ID requerido',
        code: 400
      });
    }
    
    await partnerAPIService.getGeneratedDocument(req, res);
    
  } catch (error) {
    console.error('❌ Error en /documents:', error);
    res.status(500).json({
      error: 'Error obteniendo documento',
      code: 500,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * 🔄 SINCRONIZACIÓN INICIAL
 * GET /api/v1/partners/sync/initial
 */
router.get('/sync/initial', async (req, res) => {
  try {
    const { since, tenant_id } = req.query;
    const partner = req.partner;
    
    console.log(`🔄 Sincronización inicial para partner ${partner.type}`);
    
    // Validar fecha 'since' si se proporciona
    let sinceDate = null;
    if (since) {
      sinceDate = new Date(since);
      if (isNaN(sinceDate.getTime())) {
        return res.status(400).json({
          error: 'Formato de fecha inválido',
          code: 400,
          expected_format: 'YYYY-MM-DD'
        });
      }
    }
    
    // Obtener datos de sincronización
    const syncData = await partnerAPIService.getInitialSyncData({
      partner_type: partner.type,
      since_date: sinceDate,
      tenant_id
    });
    
    res.json({
      success: true,
      partner: partner.name,
      sync_timestamp: new Date().toISOString(),
      data: syncData,
      total_records: syncData.rats?.length || 0
    });
    
  } catch (error) {
    console.error('❌ Error en /sync/initial:', error);
    res.status(500).json({
      error: 'Error en sincronización inicial',
      code: 500,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * ⚙️ CONFIGURAR WEBHOOK
 * POST /api/v1/partners/webhooks/configure
 */
router.post('/webhooks/configure', async (req, res) => {
  try {
    const { webhook_url, events, signature_secret } = req.body;
    const partner = req.partner;
    
    // Validaciones
    if (!webhook_url) {
      return res.status(400).json({
        error: 'URL del webhook requerida',
        code: 400
      });
    }
    
    if (!events || !Array.isArray(events) || events.length === 0) {
      return res.status(400).json({
        error: 'Eventos del webhook requeridos',
        code: 400,
        available_events: ['rat_completed', 'document_generated', 'high_risk_detected', 'compliance_alert']
      });
    }
    
    // Validar URL
    try {
      new URL(webhook_url);
    } catch {
      return res.status(400).json({
        error: 'URL del webhook inválida',
        code: 400
      });
    }
    
    // Configurar webhook
    const webhookConfig = await partnerAPIService.configureWebhook({
      partner_type: partner.type,
      webhook_url,
      events,
      signature_secret
    });
    
    res.json({
      success: true,
      message: 'Webhook configurado exitosamente',
      partner: partner.name,
      config: webhookConfig,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error configurando webhook:', error);
    res.status(500).json({
      error: 'Error configurando webhook',
      code: 500,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * 📊 ESTADÍSTICAS DE USO PARTNER
 * GET /api/v1/partners/stats
 */
router.get('/stats', async (req, res) => {
  try {
    const partner = req.partner;
    const { period = '7d' } = req.query;
    
    const stats = await partnerAPIService.getPartnerStats(partner.type, period);
    
    res.json({
      success: true,
      partner: partner.name,
      period,
      stats,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error);
    res.status(500).json({
      error: 'Error obteniendo estadísticas',
      code: 500,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * 🔍 HEALTH CHECK PARA PARTNERS
 * GET /api/v1/partners/health
 */
router.get('/health', async (req, res) => {
  try {
    const partner = req.partner;
    
    res.json({
      status: 'healthy',
      partner: partner.name,
      partner_type: partner.type,
      timestamp: new Date().toISOString(),
      version: '1.0',
      endpoints_available: [
        'GET /rats/completed',
        'POST /analysis/intelligent',
        'GET /documents/{tipo}/{rat_id}',
        'GET /sync/initial',
        'POST /webhooks/configure',
        'GET /stats'
      ]
    });
    
  } catch (error) {
    console.error('❌ Error en health check:', error);
    res.status(500).json({
      status: 'unhealthy',
      error: 'Error interno',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * 🚨 MANEJO DE ERRORES GLOBALES
 */
router.use((error, req, res, next) => {
  console.error('❌ Error global en rutas partner:', error);
  
  // Error de validación
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Error de validación',
      code: 400,
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
  
  // Error de rate limiting
  if (error.status === 429) {
    return res.status(429).json({
      error: 'Rate limit excedido',
      code: 429,
      retry_after: '15 minutos',
      timestamp: new Date().toISOString()
    });
  }
  
  // Error genérico
  res.status(500).json({
    error: 'Error interno del servidor',
    code: 500,
    message: 'Ha ocurrido un error inesperado',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;

// ==================== DOCUMENTACIÓN API ====================

/**
 * 📖 DOCUMENTACIÓN DE USO
 * 
 * AUTENTICACIÓN:
 * - Incluir API Key en header: Authorization: Bearer {api_key}
 * - O usar header: X-API-Key: {api_key}
 * 
 * RATE LIMITS:
 * - Prelafit/RSM: 1000 requests/15min
 * - DataCompliance: 500 requests/15min  
 * - Amsoft/FC Group: 200 requests/15min
 * 
 * CÓDIGOS DE ERROR:
 * - 401: API Key inválida o faltante
 * - 400: Payload inválido o incompleto
 * - 429: Rate limit excedido
 * - 404: Recurso no encontrado
 * - 500: Error interno del servidor
 * 
 * EJEMPLO DE USO:
 * 
 * curl -X GET \
 *   https://api.juridica-digital.cl/api/v1/partners/rats/completed \
 *   -H 'Authorization: Bearer pk_prelafit_abc123' \
 *   -H 'Content-Type: application/json'
 */