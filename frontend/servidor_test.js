const http = require('http');
const fs = require('fs');
const path = require('path');

const port = 8080;

const server = http.createServer((req, res) => {
  console.log(`📡 ${new Date().toLocaleTimeString()} - GET ${req.url}`);
  
  // Servir el archivo test.html
  const filePath = path.join(__dirname, 'test.html');
  
  fs.readFile(filePath, 'utf8', (err, content) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Error interno del servidor: ' + err.message);
      return;
    }

    res.writeHead(200, { 
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache'
    });
    res.end(content);
  });
});

server.listen(port, () => {
  console.log('🚀 SERVIDOR DE PRUEBA LPDP INICIADO');
  console.log(`🌐 URL: http://localhost:${port}`);
  console.log(`🎨 Mostrando nueva paleta conservadora`);
  console.log(`💼 ¡Listo para la presentación del jueves!`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`❌ Puerto ${port} ocupado. Probando puerto ${port + 1}...`);
    server.listen(port + 1);
  } else {
    console.error('❌ Error:', err.message);
  }
});