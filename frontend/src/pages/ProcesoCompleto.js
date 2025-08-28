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
      <Paper sx={{ p: 3, mb: 3, bgcolor: 'success.main', color: 'white' }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          🏁 Proceso LPDP Completo - RAT Cerrado
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