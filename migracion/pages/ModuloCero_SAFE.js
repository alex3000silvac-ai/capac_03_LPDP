import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

// VERSIÓN 100% ESTÁTICA - SIN LOCURAS, SIN useEffect, SIN INTERVALOS
function ModuloCero() {
  const navigate = useNavigate();

  return (
    <Box sx={{ p: 4, maxWidth: '800px', mx: 'auto' }}>
      <Typography variant="h3" gutterBottom align="center">
        📚 Módulo Cero - Introducción LPDP
      </Typography>
      
      <Typography variant="h6" sx={{ mb: 3 }}>
        Contenido del Curso (Versión Estática):
      </Typography>

      <Box sx={{ mb: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom>
          1. ¿Qué es la Ley 21.719?
        </Typography>
        <Typography paragraph>
          La Ley 21.719 sobre Protección de Datos Personales es la nueva normativa 
          chilena que regula el tratamiento de datos personales, inspirada en el 
          Reglamento General de Protección de Datos (GDPR) europeo.
        </Typography>
      </Box>

      <Box sx={{ mb: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom>
          2. Principios Fundamentales
        </Typography>
        <Typography paragraph>
          • Licitud y transparencia
          <br />
          • Limitación de la finalidad
          <br />
          • Minimización de datos
          <br />
          • Exactitud
          <br />
          • Limitación del plazo de conservación
          <br />
          • Integridad y confidencialidad
        </Typography>
      </Box>

      <Box sx={{ mb: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom>
          3. Registro de Actividades de Tratamiento (RAT)
        </Typography>
        <Typography paragraph>
          El RAT es el documento clave que toda organización debe mantener para 
          demostrar el cumplimiento de la ley. Contiene información detallada sobre 
          todos los tratamientos de datos personales.
        </Typography>
      </Box>

      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Button
          variant="contained"
          size="large"
          color="success"
          onClick={() => navigate('/rat-produccion')}
          sx={{ mr: 2 }}
        >
          🚀 Ir a RAT Producción
        </Button>
        
        <Button
          variant="outlined"
          size="large"
          onClick={() => navigate('/glosario')}
        >
          📖 Ver Glosario
        </Button>
      </Box>

      <Typography variant="body2" sx={{ mt: 4, textAlign: 'center', fontStyle: 'italic' }}>
        ✅ Versión estática y segura - Sin auto-scroll, sin locuras
      </Typography>
    </Box>
  );
}

export default ModuloCero;