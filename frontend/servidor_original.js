const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Servir archivos estáticos desde el directorio build
app.use(express.static(path.join(__dirname, 'build')));

// Manejar rutas de React Router (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Iniciar el servidor
app.listen(port, () => {
  console.log('🚀 Servidor LPDP corriendo en puerto ' + port);
  console.log('🌐 Accesible en:');
  console.log('   - http://localhost:' + port);
  console.log('   - http://127.0.0.1:' + port);
  console.log('   - http://192.168.67.39:' + port + ' (WSL2)');
  console.log('📱 Módulo Cero: http://localhost:' + port + '/modulo-cero');
  console.log('🔧 Health Check: http://localhost:' + port + '/api/health');
  console.log('💼 Sistema listo para convertir empresas en expertas LPDP!');
  console.log('🍞 HERMANO - TU FUTURO ESTÁ ASEGURADO!');
});