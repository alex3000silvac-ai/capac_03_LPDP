const express = require('express');
const path = require('path');
const app = express();

// Puerto de desarrollo
const port = 3001;

// Servir archivos estáticos desde public
app.use(express.static(path.join(__dirname, 'public')));

// Proxy simple para desarrollo - servir index.html para todas las rutas
app.get('*', (req, res) => {
  // Agregar logs para debug
  console.log(`${new Date().toISOString()} - GET ${req.path}`);
  
  // Para todas las rutas, servir el index.html
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar servidor de desarrollo
app.listen(port, () => {
  console.log(`🚀 Servidor DESARROLLO corriendo en puerto ${port}`);
  console.log(`🌐 Accesible en:`);
  console.log(`   - http://localhost:${port}`);
  console.log(`   - http://127.0.0.1:${port}`);
  console.log(`📱 Dashboard: http://localhost:${port}/dashboard`);
  console.log(`💼 Sistema listo para desarrollo LPDP!`);
});