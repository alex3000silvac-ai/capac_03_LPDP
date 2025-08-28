/**
 * PRESENTACIÓN INTEGRADA DEL MÓDULO CERO
 * Componente React que integra la presentación HTML
 */

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  Fab
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Close as CloseIcon,
  Fullscreen as FullscreenIcon
} from '@mui/icons-material';

const PresentacionModuloCero = ({ autoStart = false }) => {
  const [dialogOpen, setDialogOpen] = useState(autoStart);

  const handleOpenPresentation = () => {
    setDialogOpen(true);
  };

  const handleClosePresentation = () => {
    setDialogOpen(false);
  };

  const openInNewWindow = () => {
    // Intentar abrir el HTML, si falla usar la versión React embebida
    const newWindow = window.open('/presentacion-modulo-cero.html?v=2', '_blank', 
      'width=1200,height=800,scrollbars=yes,resizable=yes');
    
    // Si no se puede abrir, mostrar el diálogo interno
    setTimeout(() => {
      if (!newWindow || newWindow.closed) {
        setDialogOpen(true);
      }
    }, 1000);
  };

  return (
    <>
      {/* Tarjeta de invitación */}
      <Card 
        sx={{ 
          mb: 3, 
          background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
          color: 'white',
          boxShadow: '0 8px 25px rgba(44, 62, 80, 0.3)'
        }}
      >
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
            Presentación Módulo Cero
          </Typography>
          <Typography variant="h6" sx={{ mb: 3, opacity: 0.9 }}>
            Aprende sobre los RATs y la Ley 21.719 en 12 slides interactivos
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, opacity: 0.8 }}>
            Presentación completa con narración automática en español
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<PlayIcon />}
              onClick={handleOpenPresentation}
              sx={{
                background: 'linear-gradient(135deg, #27ae60 0%, #229954 100%)',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                boxShadow: '0 4px 15px rgba(39, 174, 96, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #229954 0%, #27ae60 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(39, 174, 96, 0.5)'
                }
              }}
            >
              Ver Presentación
            </Button>
            
            <Button
              variant="outlined"
              size="large"
              startIcon={<FullscreenIcon />}
              onClick={openInNewWindow}
              sx={{
                borderColor: 'rgba(255,255,255,0.3)',
                color: 'white',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              Pantalla Completa
            </Button>
          </Box>
          
          {/* Características */}
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 3 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                🎯 12 Slides
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                🔊 Narración Auto
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                ⌨️ Controles Teclado
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                📱 Responsive
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Dialog con la presentación */}
      <Dialog
        open={dialogOpen}
        onClose={handleClosePresentation}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            height: '90vh',
            maxHeight: '90vh'
          }
        }}
      >
        <Box sx={{ position: 'relative', height: '100%' }}>
          <IconButton
            onClick={handleClosePresentation}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 1000,
              background: 'rgba(0,0,0,0.5)',
              color: 'white',
              '&:hover': {
                background: 'rgba(0,0,0,0.7)'
              }
            }}
          >
            <CloseIcon />
          </IconButton>
          
          <DialogContent sx={{ p: 0, height: '100%' }}>
            <iframe
              src="/presentacion-modulo-cero.html?v=2"
              style={{
                width: '100%',
                height: '100%',
                border: 'none'
              }}
              title="Presentación Módulo Cero"
            />
          </DialogContent>
        </Box>
      </Dialog>

      {/* FAB flotante para acceso rápido */}
      <Fab
        color="primary"
        onClick={handleOpenPresentation}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 1000,
          background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #34495e 0%, #2c3e50 100%)'
          }
        }}
      >
        <PlayIcon />
      </Fab>
    </>
  );
};

export default PresentacionModuloCero;