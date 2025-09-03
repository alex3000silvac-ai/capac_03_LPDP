/**
 * 🚀 SERVIDOR BACKEND COMPLETO - JURÍDICA DIGITAL LPDP
 * Servidor Express.js con todas las APIs para partners, exportación y webhooks
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Servicios
const partnerAPIService = require('./services/partnerAPIService');
const exportService = require('./services/exportService');

// Rutas
const partnerRoutes = require('./routes/partnerRoutes');

// Configuración
const app = express();
const PORT = process.env.PORT || 3001;

// Cliente Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// ==================== MIDDLEWARES GLOBALES ====================

// Seguridad
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Compresión
app.use(compression());

// CORS
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001', 
    'https://scldp-frontend.onrender.com',
    'https://juridica-digital.cl',
    'https://api.juridica-digital.cl'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Partner-Type']
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting global (más permisivo)
const globalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5000, // 5000 requests por IP
  message: {
    error: 'Demasiadas requests desde esta IP',
    retry_after: '15 minutos'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api', globalRateLimit);

// Logging de requests
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`📡 ${timestamp} - ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

// ==================== RUTAS PRINCIPALES ====================

// Health check
app.get('/health', async (req, res) => {
  try {
    // Verificar conexión Supabase
    const { data, error } = await supabase
      .from('tenants')
      .select('count')
      .limit(1);
    
    const isSupabaseHealthy = !error;
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        supabase: isSupabaseHealthy ? 'connected' : 'disconnected',
        database: isSupabaseHealthy ? 'operational' : 'error'
      },
      uptime: process.uptime()
    });
    
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: 'Service check failed',
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== RUTAS API PARTNERS ====================

// Todas las rutas de partners bajo /api/v1/partners
app.use('/api/v1/partners', partnerRoutes);

// ==================== RUTAS DE EXPORTACIÓN ====================

/**
 * 📄 EXPORTAR RAT INDIVIDUAL A PDF
 * GET /api/v1/export/rat/:id/pdf
 */
app.get('/api/v1/export/rat/:id/pdf', async (req, res) => {
  try {
    const { id } = req.params;
    const { download = 'true' } = req.query;
    
    console.log('📄 Exportando RAT a PDF:', id);
    
    const pdfResult = await exportService.exportRATToPDF(id);
    
    // Headers para descarga
    res.set({
      'Content-Type': pdfResult.contentType,
      'Content-Length': pdfResult.size,
      'Content-Disposition': download === 'true' ? 
        `attachment; filename="${pdfResult.filename}"` : 
        `inline; filename="${pdfResult.filename}"`
    });
    
    res.send(pdfResult.buffer);
    
  } catch (error) {
    console.error('❌ Error exportando RAT a PDF:', error);
    res.status(500).json({
      error: 'Error exportando RAT a PDF',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * 📊 EXPORTAR RATs A EXCEL
 * POST /api/v1/export/rats/excel
 */
app.post('/api/v1/export/rats/excel', async (req, res) => {
  try {
    const filters = req.body || {};
    
    console.log('📊 Exportando RATs a Excel con filtros:', filters);
    
    const excelResult = await exportService.exportRATsToExcel(filters);
    
    res.set({
      'Content-Type': excelResult.contentType,
      'Content-Length': excelResult.size,
      'Content-Disposition': `attachment; filename="${excelResult.filename}"`
    });
    
    res.send(excelResult.buffer);
    
  } catch (error) {
    console.error('❌ Error exportando RATs a Excel:', error);
    res.status(500).json({
      error: 'Error exportando RATs a Excel',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * 📈 EXPORTAR MÉTRICAS DE COMPLIANCE
 * GET /api/v1/export/compliance/metrics/:tenant_id
 */
app.get('/api/v1/export/compliance/metrics/:tenant_id', async (req, res) => {
  try {
    const { tenant_id } = req.params;
    
    console.log('📈 Exportando métricas de compliance para tenant:', tenant_id);
    
    const metricsBuffer = await exportService.exportComplianceMetrics(tenant_id);
    
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="Compliance_Metrics_${tenant_id}_${new Date().toISOString().slice(0,10)}.xlsx"`
    });
    
    res.send(metricsBuffer);
    
  } catch (error) {
    console.error('❌ Error exportando métricas:', error);
    res.status(500).json({
      error: 'Error exportando métricas de compliance',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== RUTAS PARA FRONTEND ====================

/**
 * 🌐 ENVIAR RAT A PARTNER
 * POST /api/v1/integrations/send-to-partner
 */
app.post('/api/v1/integrations/send-to-partner', async (req, res) => {
  try {
    const { rat_id, partner_type, payload } = req.body;
    
    if (!rat_id || !partner_type || !payload) {
      return res.status(400).json({
        error: 'Datos incompletos',
        required: ['rat_id', 'partner_type', 'payload']
      });
    }
    
    console.log(`🌐 Enviando RAT ${rat_id} a partner ${partner_type}`);
    
    const result = await partnerAPIService.sendToPartner(rat_id, partner_type, payload);
    
    res.json({
      success: true,
      message: `RAT enviado exitosamente a ${partner_type}`,
      integration_id: result.integration_id,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error enviando a partner:', error);
    res.status(500).json({
      error: 'Error enviando RAT a partner',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * 📊 OBTENER ESTADÍSTICAS DE INTEGRACIONES
 * GET /api/v1/integrations/stats/:tenant_id
 */
app.get('/api/v1/integrations/stats/:tenant_id', async (req, res) => {
  try {
    const { tenant_id } = req.params;
    
    console.log('📊 Obteniendo estadísticas de integraciones para tenant:', tenant_id);
    
    // Obtener estadísticas de integraciones
    const { data: integrations, error } = await supabase
      .from('partner_integrations')
      .select('partner_type, status, created_at')
      .eq('tenant_id', tenant_id);
    
    if (error) throw error;
    
    // Procesar estadísticas
    const stats = {
      permanentes: integrations.filter(i => 
        ['prelafit', 'rsm_chile'].includes(i.partner_type)
      ).length,
      no_permanentes: integrations.filter(i => 
        ['datacompliance', 'amsoft', 'fc_group'].includes(i.partner_type)
      ).length,
      total_integraciones: integrations.length,
      por_partner: integrations.reduce((acc, integration) => {
        acc[integration.partner_type] = (acc[integration.partner_type] || 0) + 1;
        return acc;
      }, {}),
      por_estado: integrations.reduce((acc, integration) => {
        acc[integration.status] = (acc[integration.status] || 0) + 1;
        return acc;
      }, {})
    };
    
    res.json({
      success: true,
      tenant_id,
      stats,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error);
    res.status(500).json({
      error: 'Error obteniendo estadísticas de integraciones',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== WEBHOOKS ENTRANTES ====================

/**
 * 🔔 WEBHOOK GENÉRICO PARA RECIBIR NOTIFICACIONES
 * POST /api/v1/webhooks/partner/:partner_type
 */
app.post('/api/v1/webhooks/partner/:partner_type', async (req, res) => {
  try {
    const { partner_type } = req.params;
    const payload = req.body;
    
    console.log(`🔔 Webhook recibido de ${partner_type}:`, payload);
    
    // Verificar firma del webhook si está presente
    const signature = req.headers['x-signature'];
    if (signature) {
      // Verificar firma del webhook
      // Implementación específica por partner
    }
    
    // Procesar webhook según tipo de evento
    await processPartnerWebhook(partner_type, payload);
    
    res.json({
      success: true,
      message: 'Webhook procesado exitosamente',
      partner_type,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error procesando webhook:', error);
    res.status(500).json({
      error: 'Error procesando webhook',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== FUNCIONES AUXILIARES ====================

/**
 * 🔄 PROCESAR WEBHOOK DE PARTNER
 */
async function processPartnerWebhook(partnerType, payload) {
  try {
    console.log(`🔄 Procesando webhook de ${partnerType}`);
    
    // Registrar webhook recibido
    await supabase
      .from('partner_access_logs')
      .insert({
        partner_type: partnerType,
        action: 'webhook_received',
        metadata: payload,
        timestamp: new Date().toISOString()
      });
    
    // Procesar según tipo de evento
    switch (payload.event) {
      case 'analysis_completed':
        await handleAnalysisCompleted(partnerType, payload);
        break;
      case 'document_processed':
        await handleDocumentProcessed(partnerType, payload);
        break;
      case 'status_update':
        await handleStatusUpdate(partnerType, payload);
        break;
      default:
        console.log(`ℹ️ Evento no manejado: ${payload.event}`);
    }
    
  } catch (error) {
    console.error('❌ Error procesando webhook:', error);
    throw error;
  }
}

async function handleAnalysisCompleted(partnerType, payload) {
  console.log(`✅ Análisis completado por ${partnerType}:`, payload.data);
  // Implementar lógica específica
}

async function handleDocumentProcessed(partnerType, payload) {
  console.log(`📄 Documento procesado por ${partnerType}:`, payload.data);
  // Implementar lógica específica
}

async function handleStatusUpdate(partnerType, payload) {
  console.log(`🔄 Actualización de estado de ${partnerType}:`, payload.data);
  // Implementar lógica específica
}

// ==================== MANEJO DE ERRORES GLOBALES ====================

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint no encontrado',
    path: req.originalUrl,
    method: req.method,
    available_endpoints: [
      'GET /health',
      'GET /api/v1/partners/health',
      'GET /api/v1/partners/rats/completed',
      'POST /api/v1/partners/analysis/intelligent',
      'GET /api/v1/export/rat/:id/pdf',
      'POST /api/v1/export/rats/excel'
    ],
    timestamp: new Date().toISOString()
  });
});

// Manejo de errores globales
app.use((err, req, res, next) => {
  console.error('❌ Error global del servidor:', err);
  
  res.status(err.status || 500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Ha ocurrido un error inesperado',
    timestamp: new Date().toISOString()
  });
});

// ==================== INICIALIZACIÓN DEL SERVIDOR ====================

app.listen(PORT, () => {
  console.log('\n🚀 ======================================');
  console.log('🌐 SERVIDOR JURÍDICA DIGITAL LPDP');
  console.log('🚀 ======================================');
  console.log(`📡 Servidor ejecutándose en puerto: ${PORT}`);
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/health`);
  console.log(`🌐 Partners API: http://localhost:${PORT}/api/v1/partners/health`);
  console.log('🚀 ======================================\n');
  
  // Verificar conexión Supabase al iniciar
  verifySupabaseConnection();
});

async function verifySupabaseConnection() {
  try {
    const { data, error } = await supabase
      .from('tenants')
      .select('count')
      .limit(1);
    
    if (error) throw error;
    console.log('✅ Conexión Supabase verificada exitosamente');
  } catch (error) {
    console.error('❌ Error conectando con Supabase:', error.message);
  }
}

// Manejo de señales del sistema
process.on('SIGTERM', () => {
  console.log('📴 Recibida señal SIGTERM, cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('📴 Recibida señal SIGINT, cerrando servidor...');
  process.exit(0);
});

module.exports = app;