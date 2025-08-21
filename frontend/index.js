const express = require('express');
const path = require('path');
const app = express();

// Configurar el puerto desde la variable de entorno o usar 3000 por defecto
const port = process.env.PORT || 3000;

// Servir archivos estáticos desde el directorio build
app.use(express.static(path.join(__dirname, 'build')));

// Manejar rutas de React Router (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`🚀 Servidor LPDP corriendo en puerto ${port}`);
  console.log(`📱 Módulo Cero disponible en: http://localhost:${port}/modulo-cero`);
  console.log(`💼 Sistema listo para convertir empresas en expertas LPDP!`);
});