const express = require('express');
const path = require('path');
const app = express();

// Configurar el puerto desde la variable de entorno o usar 3001 por defecto
const port = process.env.PORT || 3001;

// Middleware para logs detallados
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Servir archivos estáticos desde el directorio build
app.use(express.static(path.join(__dirname, 'build')));

// Ruta de prueba para verificar que funciona
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: '🇨🇱 Servidor LPDP funcionando correctamente',
    modules: ['ModuloEIPD', 'GestionProveedores', 'API v1.0']
  });
});

// Manejar rutas de React Router (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Iniciar el servidor con configuración para WSL2
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Servidor LPDP corriendo en puerto ${port}`);
  console.log(`🌐 Accesible en:`);
  console.log(`   - http://localhost:${port}`);
  console.log(`   - http://127.0.0.1:${port}`);
  console.log(`   - http://192.168.67.39:${port} (WSL2)`);
  console.log(`📱 Módulo Cero: http://localhost:${port}/modulo-cero`);
  console.log(`🔧 Health Check: http://localhost:${port}/api/health`);
  console.log(`💼 Sistema listo para convertir empresas en expertas LPDP!`);
});

// Manejo de errores
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Puerto ${port} en uso. Intentando puerto ${port + 1}...`);
    server.listen(port + 1, '0.0.0.0');
  } else {
    console.error('❌ Error del servidor:', err);
  }
});

// Manejo de señales para cierre limpio
process.on('SIGTERM', () => {
  console.log('🔄 Cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🔄 Cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});

module.exports = app;