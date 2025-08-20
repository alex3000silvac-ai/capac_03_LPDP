import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Card, 
  CardContent,
  Fade,
  Zoom
} from '@mui/material';
import { 
  CloudDownload as RecopilarIcon,
  Settings as ProcesarIcon,
  Share as CompartirIcon,
  Business as EmpresaIcon
} from '@mui/icons-material';

const ConceptoTratamiento = ({ duration = 30 }) => {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const stepDuration = duration * 1000 / 4; // Dividir tiempo entre 4 animaciones
    
    const timer = setInterval(() => {
      setActiveStep(prev => (prev < 3 ? prev + 1 : prev));
    }, stepDuration);

    return () => clearInterval(timer);
  }, [duration]);

  const pasos = [
    {
      icon: <RecopilarIcon sx={{ fontSize: 60 }} />,
      titulo: 'RECOPILAR',
      emoji: '📥',
      descripcion: 'Obtenemos datos personales',
      ejemplos: ['Formularios web', 'Contratos', 'CVs', 'Encuestas']
    },
    {
      icon: <ProcesarIcon sx={{ fontSize: 60 }} />,
      titulo: 'PROCESAR',
      emoji: '⚙️',
      descripcion: 'Los analizamos y usamos',
      ejemplos: ['Análisis', 'Almacenamiento', 'Modificación', 'Organización']
    },
    {
      icon: <CompartirIcon sx={{ fontSize: 60 }} />,
      titulo: 'COMPARTIR',
      emoji: '📤',
      descripcion: 'Los enviamos a terceros',
      ejemplos: ['Proveedores', 'Estado', 'Partners', 'Bancos']
    }
  ];

  return (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      {/* Título principal */}
      <Fade in timeout={1000}>
        <Typography variant="h3" sx={{ mb: 2, fontWeight: 700 }}>
          ¿QUÉ ES UN TRATAMIENTO DE DATOS?
        </Typography>
      </Fade>

      <Fade in timeout={1500}>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          Todo lo que hace tu empresa con información personal
        </Typography>
      </Fade>

      {/* Empresa central */}
      <Box sx={{ position: 'relative', mb: 6 }}>
        <Zoom in timeout={2000}>
          <Paper 
            elevation={8}
            sx={{ 
              display: 'inline-flex',
              alignItems: 'center',
              gap: 2,
              p: 3,
              bgcolor: 'primary.main',
              color: 'primary.contrastText'
            }}
          >
            <EmpresaIcon sx={{ fontSize: 40 }} />
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              TU EMPRESA
            </Typography>
          </Paper>
        </Zoom>

        {/* Flechas y procesos */}
        <Grid container spacing={4} sx={{ mt: 4 }}>
          {pasos.map((paso, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Fade in={activeStep >= index} timeout={1000}>
                <Card 
                  elevation={activeStep >= index ? 6 : 2}
                  sx={{ 
                    height: '100%',
                    transform: activeStep >= index ? 'scale(1.05)' : 'scale(1)',
                    transition: 'all 0.5s ease-in-out',
                    bgcolor: activeStep >= index ? 'primary.light' : 'background.paper'
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="h1" sx={{ fontSize: 60 }}>
                        {paso.emoji}
                      </Typography>
                    </Box>
                    
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        mb: 2, 
                        fontWeight: 600,
                        color: activeStep >= index ? 'primary.contrastText' : 'inherit'
                      }}
                    >
                      {paso.titulo}
                    </Typography>
                    
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        mb: 2,
                        color: activeStep >= index ? 'primary.contrastText' : 'text.secondary'
                      }}
                    >
                      {paso.descripcion}
                    </Typography>
                    
                    <Box>
                      {paso.ejemplos.map((ejemplo, idx) => (
                        <Typography 
                          key={idx}
                          variant="caption" 
                          sx={{ 
                            display: 'block',
                            color: activeStep >= index ? 'primary.contrastText' : 'text.secondary',
                            opacity: 0.8
                          }}
                        >
                          • {ejemplo}
                        </Typography>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Mensaje clave */}
      <Fade in={activeStep >= 3} timeout={1000}>
        <Paper 
          elevation={4}
          sx={{ 
            p: 4, 
            mt: 4,
            bgcolor: 'error.main',
            color: 'error.contrastText'
          }}
        >
          <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>
            🔴 TODO ESTO ES TRATAMIENTO 🔴
          </Typography>
          <Typography variant="h6">
            Y ESTÁ REGULADO POR LA LEY 21.719
          </Typography>
        </Paper>
      </Fade>

      {/* Datos adicionales */}
      <Fade in={activeStep >= 3} timeout={1500}>
        <Box sx={{ mt: 4 }}>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Paper sx={{ p: 2, bgcolor: 'warning.light' }}>
                <Typography variant="h4">📊</Typography>
                <Typography variant="body2" color="warning.contrastText">
                  <strong>Multas hasta</strong><br />5.000 UTM
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={4}>
              <Paper sx={{ p: 2, bgcolor: 'info.light' }}>
                <Typography variant="h4">⚖️</Typography>
                <Typography variant="body2" color="info.contrastText">
                  <strong>Cumplimiento</strong><br />Obligatorio
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={4}>
              <Paper sx={{ p: 2, bgcolor: 'success.light' }}>
                <Typography variant="h4">🏆</Typography>
                <Typography variant="body2" color="success.contrastText">
                  <strong>Certificación</strong><br />Posible
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Fade>
    </Box>
  );
};

export default ConceptoTratamiento;