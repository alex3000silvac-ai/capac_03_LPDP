/**
 * PÁGINA DE GESTIÓN DE ASOCIACIONES
 * Permite gestionar las asociaciones entre RATs y documentos EIPD/DPIA/DPA
 */

import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box, Typography, Paper, Button, Chip } from '@mui/material';
import { ArrowBack as BackIcon } from '@mui/icons-material';
import AsociacionDocumentos from '../components/AsociacionDocumentos';

const GestionAsociaciones = () => {
  const [searchParams] = useSearchParams();
  const ratId = searchParams.get('rat') || 'RAT-EJEMPLO';
  const tipoDocumento = searchParams.get('tipo') || '';
  const documentoId = searchParams.get('documento') || '';

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Paper sx={{ p: 3, mb: 3, bgcolor: 'info.main', color: 'white' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              🔗 Gestión de Asociaciones RAT-Documentos
            </Typography>
            <Typography variant="h6">
              Asocia, cambia o crea documentos EIPD/DPIA/DPA para: {ratId}
            </Typography>
            {tipoDocumento && (
              <Chip 
                label={`Tipo requerido: ${tipoDocumento}`} 
                sx={{ mt: 1, bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
              />
            )}
            {documentoId && (
              <Chip 
                label={`Documento: ${documentoId}`} 
                sx={{ mt: 1, ml: 1, bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
              />
            )}
          </Box>
          <Button
            variant="outlined"
            startIcon={<BackIcon />}
            onClick={() => window.location.href = '/dashboard-dpo'}
            sx={{ color: 'white', borderColor: 'white' }}
          >
            Volver al Dashboard
          </Button>
        </Box>
      </Paper>

      <AsociacionDocumentos ratId={ratId} />
    </Box>
  );
};

export default GestionAsociaciones;