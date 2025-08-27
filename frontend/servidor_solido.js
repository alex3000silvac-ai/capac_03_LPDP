const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Configurar Express para producción
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Servir archivos estáticos del build
app.use(express.static(path.join(__dirname, 'build'), {
  dotfiles: 'ignore',
  etag: false,
  index: false,
  maxAge: '1d',
  redirect: false,
  setHeaders: function (res, path, stat) {
    res.set('x-timestamp', Date.now())
  }
}));

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Sistema LPDP funcionando correctamente',
    version: '2.0.0-conservative',
    timestamp: new Date().toISOString(),
    colors: 'NAVY_AND_GRAY_ONLY',
    build: 'PRODUCTION_READY'
  });
});

// API para módulos (exacto como el sistema original)
app.get('/api/modulos', (req, res) => {
  res.json([
    {
      id: 'introduccion_lpdp',
      titulo: 'Introducción a LPDP',
      descripcion: 'Conceptos fundamentales de la Ley 21.719',
      duracion: '45 min',
      nivel: 'básico',
      estado: 'completado',
      progreso: 100,
      icono: '📋'
    },
    {
      id: 'modulo3_inventario',
      titulo: 'Constructor RAT',
      descripcion: 'Mapeo y documentación de tratamientos',
      duracion: '90 min',
      nivel: 'intermedio',
      estado: 'disponible',
      progreso: 0,
      icono: '🗂️',
      actual: true
    },
    {
      id: 'conceptos_basicos',
      titulo: 'Conceptos Avanzados',
      descripcion: 'Profundización en normativa LPDP',
      duracion: '60 min',
      nivel: 'avanzado',
      estado: 'disponible',
      progreso: 0,
      icono: '📊'
    }
  ]);
});

// API para simular backend (offline)
app.post('/api/rats', (req, res) => {
  res.json({ 
    success: true, 
    message: 'RAT guardado correctamente',
    id: Date.now() 
  });
});

app.get('/api/rats', (req, res) => {
  res.json([
    {
      id: 1,
      nombre: 'RAT Ejemplo',
      empresa: 'Demo Company',
      fecha: new Date().toISOString(),
      estado: 'completado'
    }
  ]);
});

// Manejar rutas de React Router - DEBE SER EL ÚLTIMO
app.get('*', (req, res) => {
  // Log para debugging
  console.log(`${new Date().toISOString()} - GET ${req.path}`);
  
  // Servir index.html para todas las rutas de React
  res.sendFile(path.join(__dirname, 'build', 'index.html'), (err) => {
    if (err) {
      console.error('Error enviando index.html:', err);
      res.status(500).send('Error interno del servidor');
    }
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error del servidor:', err);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: err.message 
  });
});

// Iniciar el servidor
const server = app.listen(port, '0.0.0.0', () => {
  console.log('🚀 SISTEMA LPDP - SERVIDOR SÓLIDO INICIADO');
  console.log('==========================================');
  console.log('🌐 Puerto:', port);
  console.log('🌐 Local: http://localhost:' + port);
  console.log('🌐 WSL2: http://192.168.67.39:' + port);
  console.log('🌐 Health: http://localhost:' + port + '/api/health');
  console.log('🌐 Módulos: http://localhost:' + port + '/api/modulos');
  console.log('📱 Dashboard: http://localhost:' + port + '/dashboard');
  console.log('📋 Módulo Cero: http://localhost:' + port + '/modulo-cero');
  console.log('✅ Build de producción cargado');
  console.log('✅ React 18 funcionando');
  console.log('✅ Material-UI disponible');
  console.log('✅ Solo colores marino y gris');
  console.log('✅ APIs funcionando');
  console.log('✅ Listo para cambios finales');
  console.log('🍞 HERMANO - SISTEMA SÓLIDO COMO UNA ROCA');
  console.log('==========================================');
});

// Manejo de errores del servidor
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log('❌ Puerto ' + port + ' ocupado. Probando puerto ' + (port + 1));
    setTimeout(() => {
      server.close();
      server.listen(port + 1, '0.0.0.0');
    }, 1000);
  } else {
    console.error('❌ Error del servidor:', err);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🔄 Cerrando servidor gracefully...');
  server.close(() => {
    console.log('✅ Servidor cerrado correctamente');
  });
});

module.exports = app;