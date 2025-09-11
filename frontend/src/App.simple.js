import React from 'react';

// App ultra simple para pruebas
function App() {
  return (
    <div style={{padding: '20px'}}>
      <h1>🚀 Sistema LPDP - Test Local</h1>
      <p>✅ React cargando correctamente</p>
      <p>📍 Backend: <a href="http://localhost:8000">localhost:8000</a></p>
      <p>📍 Frontend: <a href="http://localhost:3000">localhost:3000</a></p>
      
      <div style={{marginTop: '20px', padding: '10px', border: '1px solid #ccc'}}>
        <h3>Estado de Conexiones:</h3>
        <p>• SQL Server PASC: ⏳ Verificando...</p>
        <p>• Backend API: ⏳ Verificando...</p>
        <p>• Frontend: ✅ Funcionando</p>
      </div>
    </div>
  );
}

export default App;