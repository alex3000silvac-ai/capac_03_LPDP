// Servidor super simple sin dependencias
const http = require('http');
const fs = require('fs');
const path = require('path');

const port = 3002;

const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Servir index.html para todas las rutas
  const filePath = path.join(__dirname, 'public', 'index.html');
  
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end(`
        <html>
          <body>
            <h1>🔧 Servidor de Desarrollo LPDP</h1>
            <p>Error: No se encontró index.html</p>
            <p>Ruta buscada: ${filePath}</p>
            <p>Error: ${err.message}</p>
          </body>
        </html>
      `);
      return;
    }

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(content);
  });
});

server.listen(port, () => {
  console.log('🚀 SERVIDOR SIMPLE LPDP INICIADO');
  console.log(`🌐 Puerto: ${port}`);
  console.log(`📱 URL: http://localhost:${port}`);
  console.log(`💼 Sistema disponible para pruebas!`);
});

server.on('error', (err) => {
  console.error('❌ Error del servidor:', err.message);
  if (err.code === 'EADDRINUSE') {
    console.log(`⚠️  Puerto ${port} ocupado, probando puerto ${port + 1}`);
    server.listen(port + 1);
  }
});