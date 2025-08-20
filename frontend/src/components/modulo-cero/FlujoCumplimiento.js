import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Card,
  CardContent,
  Fade,
  Zoom,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from '@mui/material';
import { 
  Search as IdentificarIcon,
  Description as DocumentarIcon,
  Security as ProtegerIcon,
  CheckCircle as CumplirIcon,
  ArrowForward as ArrowIcon
} from '@mui/icons-material';

const FlujoCumplimiento = ({ duration = 60 }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  const pasos = [
    {
      id: 'identificar',
      title: 'IDENTIFICAR',
      subtitle: 'ENTRADA',
      icon: <IdentificarIcon sx={{ fontSize: 50 }} />,
      emoji: '📍',
      color: 'info',
      pregunta: '¿Qué datos tenemos?',
      acciones: ['Por área', 'Por proceso', 'Por sistema'],
      descripcion: 'Mapear todos los datos personales en la organización'
    },
    {
      id: 'documentar',
      title: 'DOCUMENTAR',
      subtitle: 'PROCESAMIENTO',
      icon: <DocumentarIcon sx={{ fontSize: 50 }} />,
      emoji: '📝',
      color: 'warning',
      pregunta: 'Crear RAT (Registro)',
      acciones: ['Finalidad', 'Base legal', 'Retención', 'Destinatarios'],
      descripcion: 'Crear el inventario oficial de tratamientos'
    },
    {
      id: 'proteger',
      title: 'PROTEGER',
      subtitle: 'SALIDA',
      icon: <ProtegerIcon sx={{ fontSize: 50 }} />,
      emoji: '🔒',
      color: 'error',
      pregunta: 'Implementar Seguridad',
      acciones: ['Encriptar', 'Accesos', 'Backups', 'Contratos'],
      descripcion: 'Aplicar medidas técnicas y organizacionales'
    },
    {
      id: 'cumplir',
      title: 'CUMPLIR',
      subtitle: 'CONTROL',
      icon: <CumplirIcon sx={{ fontSize: 50 }} />,
      emoji: '✅',
      color: 'success',
      pregunta: 'Auditoría Continua',
      acciones: ['Reportes', 'Brechas', 'Derechos'],
      descripcion: 'Mantener el cumplimiento en el tiempo'
    }
  ];

  useEffect(() => {
    const stepDuration = duration * 1000 / 6; // Dividir en 6 partes
    
    const timer = setInterval(() => {
      setActiveStep(prev => {
        if (prev < 3) return prev + 1;
        if (prev === 3 && !showDetails) {
          setShowDetails(true);
          return prev;
        }
        return prev;
      });
    }, stepDuration);

    return () => clearInterval(timer);
  }, [duration]);

  return (
    <Box sx={{ py: 4 }}>
      {/* Título */}
      <Fade in timeout={1000}>
        <Typography variant="h3" align="center" sx={{ mb: 2, fontWeight: 700 }}>
          🗺️ MAPA MAESTRO DE CUMPLIMIENTO LPDP
        </Typography>
      </Fade>

      <Fade in timeout={1500}>
        <Typography variant="h6" align="center" color="text.secondary" sx={{ mb: 6 }}>
          El proceso completo de implementación en 4 pasos
        </Typography>
      </Fade>

      {/* Flujo principal */}
      <Box sx={{ mb: 6 }}>
        <Grid container spacing={3} alignItems="center">
          {pasos.map((paso, index) => (
            <React.Fragment key={paso.id}>
              <Grid item xs={12} md={2.4}>
                <Zoom in={activeStep >= index} timeout={1000}>
                  <Card 
                    elevation={activeStep >= index ? 8 : 2}
                    sx={{ 
                      height: 350,
                      bgcolor: activeStep >= index ? `${paso.color}.light` : 'background.paper',
                      transform: activeStep >= index ? 'scale(1.05)' : 'scale(1)',
                      transition: 'all 0.8s ease-in-out',
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'scale(1.1)',
                        elevation: 12
                      }
                    }}
                  >
                    <CardContent sx={{ 
                      textAlign: 'center', 
                      p: 3,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}>
                      {/* Número y subtítulo */}
                      <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                          {index + 1}.
                        </Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            bgcolor: `${paso.color}.main`,
                            color: `${paso.color}.contrastText`,
                            px: 2,
                            py: 0.5,
                            borderRadius: 2,
                            fontWeight: 600
                          }}
                        >
                          {paso.subtitle}
                        </Typography>
                      </Box>

                      {/* Icono y emoji */}
                      <Box sx={{ my: 2 }}>
                        <Typography variant="h1" sx={{ fontSize: 80 }}>
                          {paso.emoji}
                        </Typography>
                      </Box>

                      {/* Título y pregunta */}
                      <Box>
                        <Typography 
                          variant="h5" 
                          sx={{ 
                            fontWeight: 700,
                            color: activeStep >= index ? `${paso.color}.contrastText` : 'inherit',
                            mb: 1
                          }}
                        >
                          {paso.title}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 500,
                            color: activeStep >= index ? `${paso.color}.contrastText` : 'text.secondary'
                          }}
                        >
                          {paso.pregunta}
                        </Typography>
                      </Box>

                      {/* Acciones */}
                      <Box sx={{ mt: 2 }}>
                        {paso.acciones.map((accion, idx) => (
                          <Typography 
                            key={idx}
                            variant="caption" 
                            sx={{ 
                              display: 'block',
                              color: activeStep >= index ? `${paso.color}.contrastText` : 'text.secondary',
                              opacity: 0.9
                            }}
                          >
                            • {accion}
                          </Typography>
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Zoom>
              </Grid>
              
              {/* Flecha entre pasos */}
              {index < pasos.length - 1 && (
                <Grid item xs={12} md={0.3} sx={{ textAlign: 'center' }}>
                  <Fade in={activeStep > index} timeout={500}>
                    <ArrowIcon 
                      sx={{ 
                        fontSize: 40, 
                        color: 'primary.main',
                        transform: { xs: 'rotate(90deg)', md: 'rotate(0deg)' }
                      }} 
                    />
                  </Fade>
                </Grid>
              )}
            </React.Fragment>
          ))}
        </Grid>
      </Box>

      {/* Detalles del proceso */}
      <Fade in={showDetails} timeout={1000}>
        <Box sx={{ mt: 6 }}>
          <Typography variant="h4" align="center" sx={{ mb: 4, fontWeight: 600 }}>
            ESTE SISTEMA AUTOMATIZA TODO EL PROCESO
          </Typography>
          
          <Grid container spacing={3}>
            {pasos.map((paso, index) => (
              <Grid item xs={12} sm={6} md={3} key={paso.id}>
                <Paper 
                  elevation={4}
                  sx={{ 
                    p: 3, 
                    height: '100%',
                    bgcolor: `${paso.color}.50`
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {paso.icon}
                    <Typography variant="h6" sx={{ ml: 1, fontWeight: 600 }}>
                      {paso.title}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {paso.descripcion}
                  </Typography>
                  <Box>
                    {paso.acciones.map((accion, idx) => (
                      <Typography 
                        key={idx}
                        variant="caption" 
                        sx={{ 
                          display: 'block',
                          color: 'text.secondary'
                        }}
                      >
                        ✓ {accion}
                      </Typography>
                    ))}
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Fade>

      {/* Tiempo estimado */}
      <Fade in={showDetails} timeout={1500}>
        <Box sx={{ mt: 6 }}>
          <Paper 
            elevation={6}
            sx={{ 
              p: 4,
              bgcolor: 'gradient',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              textAlign: 'center'
            }}
          >
            <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>
              ⏱️ TIEMPO TOTAL DE IMPLEMENTACIÓN
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={3}>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>1</Typography>
                <Typography variant="body1">SEMANA</Typography>
                <Typography variant="caption">Mapeo inicial</Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>2</Typography>
                <Typography variant="body1">SEMANAS</Typography>
                <Typography variant="caption">Documentación</Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>1</Typography>
                <Typography variant="body1">SEMANA</Typography>
                <Typography variant="caption">Implementación</Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>∞</Typography>
                <Typography variant="body1">CONTINUO</Typography>
                <Typography variant="caption">Mantenimiento</Typography>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      </Fade>
    </Box>
  );
};

export default FlujoCumplimiento;