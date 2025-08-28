/**
 * DASHBOARD PRINCIPAL DEL DPO
 * Centro de control para todas las notificaciones y tareas del DPO
 */

import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import NotificacionesDPO from '../components/NotificacionesDPO';

const DashboardDPO = () => {
  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3, bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Centro de Control DPO - Sistema LPDP Chile
        </Typography>
        <Typography variant="h6">
          Monitoreo en tiempo real de cumplimiento Ley 21.719
        </Typography>
      </Paper>

      <NotificacionesDPO />
    </Box>
  );
};

export default DashboardDPO;