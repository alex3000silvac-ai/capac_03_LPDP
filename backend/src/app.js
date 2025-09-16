require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

// Importar middlewares personalizados
const authMiddleware = require('./middleware/auth');
const tenantMiddleware = require('./middleware/tenant');
const errorHandler = require('./middleware/errorHandler');
const validationMiddleware = require('./middleware/validation');

// Importar rutas
const authRoutes = require('./routes/auth');
const ratRoutes = require('./routes/rat');
const adminRoutes = require('./routes/admin');
const auditRoutes = require('./routes/audit');
const dashboardRoutes = require('./routes/dashboard');
const healthRoutes = require('./routes/health');

const app = express();

// ==============================================
// MIDDLEWARE DE SEGURIDAD Y CONFIGURACIÓN
// ==============================================

// Helmet para headers de seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://*.supabase.co"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS configurado dinámicamente
const allowedOrigins = process.env.FRONTEND_URLS ? 
  process.env.FRONTEND_URLS.split(',') : 
  ['http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-tenant-id', 'x-user-id']
}));

// Compresión para optimizar respuestas
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    error: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.',
    retryAfter: '15 minutos'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Logging
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

// Parsear JSON con límite de tamaño
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ==============================================
// MIDDLEWARE PERSONALIZADO
// ==============================================

// Middleware de tenant (aplicar a todas las rutas de API)
app.use('/api', tenantMiddleware);

// ==============================================
// RUTAS
// ==============================================

// Ruta de health check (sin autenticación)
app.use('/health', healthRoutes);
app.use('/api/health', healthRoutes);

// Rutas de autenticación (sin middleware de auth)
app.use('/api/auth', authRoutes);

// Rutas que requieren autenticación
app.use('/api/rat', authMiddleware, ratRoutes);
app.use('/api/admin', authMiddleware, adminRoutes);
app.use('/api/audit', authMiddleware, auditRoutes);
app.use('/api/dashboard', authMiddleware, dashboardRoutes);

// ==============================================
// MANEJO DE ERRORES Y RUTAS NO ENCONTRADAS
// ==============================================

// Ruta por defecto
app.get('/', (req, res) => {
  res.json({
    message: '🚀 LPDP Backend API v2.0',
    version: '2.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Ruta no encontrada
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Middleware de manejo de errores (debe ir al final)
app.use(errorHandler);

module.exports = app;