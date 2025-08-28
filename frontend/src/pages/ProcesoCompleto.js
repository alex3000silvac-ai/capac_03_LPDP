/**
 * PÁGINA DE PROCESO COMPLETO
 * Muestra el flujo completo desde RAT hasta cierre de proceso
 */

import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import ProcesoCompletoComponent from '../components/ProcesoCompleto';

const ProcesoCompletoPage = () => {
  return (
    <Box>
      <Paper sx={{ 
        p: 3, 
        mb: 3, 
        background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)', 
        color: 'white',
        boxShadow: '0 8px 25px rgba(44, 62, 80, 0.3)'
      }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Proceso LPDP Completo - RAT Cerrado
        </Typography>
        <Typography variant="h6">
          Visualización del proceso completo desde creación hasta cierre oficial
        </Typography>
      </Paper>

      <ProcesoCompletoComponent />
    </Box>
  );
};

export default ProcesoCompletoPage;