const express = require('express');
const path = require('path');
const app = express();

// Configurar el puerto desde la variable de entorno o usar 3000 por defecto
const port = process.env.PORT || 3000;

// 🔒 HEADERS DE SEGURIDAD
app.use((req, res, next) => {
  // Prevenir clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevenir MIME-type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // XSS Protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Forzar HTTPS en producción
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  // Content Security Policy
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline' fonts.googleapis.com; " +
    "font-src 'self' fonts.gstatic.com; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self' https://scldp-backend.onrender.com https://*.supabase.co; " +
    "frame-ancestors 'none'; " +
    "base-uri 'self'"
  );
  
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions Policy
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  next();
});

// Servir archivos estáticos desde el directorio public (modo desarrollo)
app.use(express.static(path.join(__dirname, 'public')));

// Ruta principal para la interfaz de pruebas LPDP
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'app.html'));
});

// Manejar todas las rutas con la interfaz de pruebas
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'app.html'));
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`🚀 Servidor LPDP corriendo en puerto ${port}`);
  console.log(`📱 Módulo Cero disponible en: http://localhost:${port}/modulo-cero`);
  console.log(`💼 Sistema listo para convertir empresas en expertas LPDP!`);
});