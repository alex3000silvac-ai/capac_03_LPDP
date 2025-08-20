import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Chip,
  Alert,
  Card,
  CardContent,
  Fade,
  Slide
} from '@mui/material';
import { 
  Person as PersonIcon,
  Warning as WarningIcon,
  ChildCare as ChildIcon,
  Security as SecurityIcon
} from '@mui/icons-material';

const ClasificacionDatos = ({ duration = 45 }) => {
  const [activeCategory, setActiveCategory] = useState(0);
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    const stepDuration = duration * 1000 / 4;
    
    const timer = setInterval(() => {
      setActiveCategory(prev => {
        if (prev < 2) return prev + 1;
        if (prev === 2 && !showComparison) {
          setShowComparison(true);
          return prev;
        }
        return prev;
      });
    }, stepDuration);

    return () => clearInterval(timer);
  }, [duration]);

  const datosComunes = [
    { nombre: 'RUT', icon: '🆔' },
    { nombre: 'Nombre', icon: '👤' },
    { nombre: 'Email', icon: '📧' },
    { nombre: 'Teléfono', icon: '📱' },
    { nombre: 'Dirección', icon: '🏠' },
    { nombre: 'Cargo', icon: '💼' }
  ];

  const datosSensibles = [
    { nombre: 'Salud', icon: '🏥', especial: true },
    { nombre: 'Sueldo', icon: '💰', especial: true },
    { nombre: 'Deudas', icon: '💳', chile: true },
    { nombre: 'Biométricos', icon: '👆', especial: true },
    { nombre: 'Afiliación Sindical', icon: '🤝', especial: true },
    { nombre: 'Situación Socioeconómica', icon: '📈', chile: true }
  ];

  const datosNNA = [
    { nombre: 'Menores 18 años', icon: '👶' },
    { nombre: 'Consentimiento padres', icon: '👨‍👩‍👧‍👦' },
    { nombre: 'Protección especial', icon: '🛡️' }
  ];

  return (
    <Box sx={{ py: 4 }}>
      {/* Título */}
      <Fade in timeout={1000}>
        <Typography variant="h3" align="center" sx={{ mb: 2, fontWeight: 700 }}>
          🔍 NO TODOS LOS DATOS SON IGUALES
        </Typography>
      </Fade>

      <Fade in timeout={1500}>
        <Typography variant="h6" align="center" color="text.secondary" sx={{ mb: 6 }}>
          Clasificación por nivel de riesgo y protección requerida
        </Typography>
      </Fade>

      <Grid container spacing={4}>
        {/* DATOS COMUNES */}
        <Grid item xs={12}>
          <Slide in={activeCategory >= 0} direction="right" timeout={1000}>
            <Card 
              elevation={activeCategory >= 0 ? 8 : 2}
              sx={{ 
                bgcolor: activeCategory >= 0 ? 'success.light' : 'background.paper',
                transform: activeCategory >= 0 ? 'scale(1.02)' : 'scale(1)',
                transition: 'all 0.5s ease-in-out'
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <PersonIcon sx={{ fontSize: 40, mr: 2 }} />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>
                      DATOS PERSONALES COMUNES
                    </Typography>
                    <Typography variant="h6" color="success.main" sx={{ fontWeight: 600 }}>
                      Riesgo: BAJO
                    </Typography>
                  </Box>
                </Box>
                
                <Grid container spacing={2}>
                  {datosComunes.map((dato, index) => (
                    <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
                      <Fade in={activeCategory >= 0} timeout={1000 + (index * 200)}>
                        <Paper 
                          elevation={2}
                          sx={{ 
                            p: 2, 
                            textAlign: 'center',
                            bgcolor: 'success.50'
                          }}
                        >
                          <Typography variant="h4">{dato.icon}</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {dato.nombre}
                          </Typography>
                        </Paper>
                      </Fade>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Slide>
        </Grid>

        {/* FLECHA */}
        <Grid item xs={12} sx={{ textAlign: 'center', py: 2 }}>
          <Fade in={activeCategory >= 1} timeout={500}>
            <Typography variant="h2" color="warning.main">
              ⬇️
            </Typography>
          </Fade>
        </Grid>

        {/* DATOS SENSIBLES */}
        <Grid item xs={12}>
          <Slide in={activeCategory >= 1} direction="left" timeout={1000}>
            <Card 
              elevation={activeCategory >= 1 ? 8 : 2}
              sx={{ 
                bgcolor: activeCategory >= 1 ? 'error.light' : 'background.paper',
                transform: activeCategory >= 1 ? 'scale(1.02)' : 'scale(1)',
                transition: 'all 0.5s ease-in-out'
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <WarningIcon sx={{ fontSize: 40, mr: 2, color: 'error.main' }} />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>
                      ⚠️ DATOS SENSIBLES ⚠️
                    </Typography>
                    <Typography variant="h6" color="error.main" sx={{ fontWeight: 600 }}>
                      Riesgo: ALTO - REQUIERE CONSENTIMIENTO
                    </Typography>
                  </Box>
                </Box>
                
                <Grid container spacing={2}>
                  {datosSensibles.map((dato, index) => (
                    <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
                      <Fade in={activeCategory >= 1} timeout={1000 + (index * 200)}>
                        <Paper 
                          elevation={3}
                          sx={{ 
                            p: 2, 
                            textAlign: 'center',
                            bgcolor: 'error.50',
                            border: dato.chile ? '2px solid' : 'none',
                            borderColor: 'warning.main'
                          }}
                        >
                          <Typography variant="h4">{dato.icon}</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {dato.nombre}
                          </Typography>
                          {dato.chile && (
                            <Chip 
                              label="LEY CHILE" 
                              size="small" 
                              color="warning"
                              sx={{ mt: 1, fontSize: '0.7rem' }}
                            />
                          )}
                        </Paper>
                      </Fade>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Slide>
        </Grid>

        {/* DATOS NNA */}
        <Grid item xs={12}>
          <Slide in={activeCategory >= 2} direction="up" timeout={1000}>
            <Card 
              elevation={activeCategory >= 2 ? 8 : 2}
              sx={{ 
                bgcolor: activeCategory >= 2 ? 'info.light' : 'background.paper',
                transform: activeCategory >= 2 ? 'scale(1.02)' : 'scale(1)',
                transition: 'all 0.5s ease-in-out'
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <ChildIcon sx={{ fontSize: 40, mr: 2, color: 'info.main' }} />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>
                      👶 DATOS DE NIÑOS, NIÑAS Y ADOLESCENTES
                    </Typography>
                    <Typography variant="h6" color="info.main" sx={{ fontWeight: 600 }}>
                      Riesgo: MUY ALTO - PROTECCIÓN ESPECIAL
                    </Typography>
                  </Box>
                </Box>
                
                <Grid container spacing={2}>
                  {datosNNA.map((dato, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Fade in={activeCategory >= 2} timeout={1000 + (index * 300)}>
                        <Paper 
                          elevation={4}
                          sx={{ 
                            p: 3, 
                            textAlign: 'center',
                            bgcolor: 'info.50'
                          }}
                        >
                          <Typography variant="h3">{dato.icon}</Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600, mt: 1 }}>
                            {dato.nombre}
                          </Typography>
                        </Paper>
                      </Fade>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Slide>
        </Grid>
      </Grid>

      {/* Mensaje clave */}
      <Fade in={showComparison} timeout={1000}>
        <Box sx={{ mt: 6 }}>
          <Alert 
            severity="warning" 
            icon={<SecurityIcon fontSize="large" />}
            sx={{ p: 3 }}
          >
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
              💡 Clave para tu empresa:
            </Typography>
            <Typography variant="h6">
              <strong>DATOS SENSIBLES = MÁXIMA PROTECCIÓN + MULTAS ALTAS</strong>
            </Typography>
            <Typography variant="body1" sx={{ mt: 1 }}>
              La "situación socioeconómica" es particularidad de la ley chilena. 
              Incluye: nivel de ingresos, deudas, scoring crediticio, patrimonio.
            </Typography>
          </Alert>
        </Box>
      </Fade>

      {/* Comparación visual */}
      <Fade in={showComparison} timeout={1500}>
        <Box sx={{ mt: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={6}>
              <Paper sx={{ p: 3, bgcolor: 'success.light', textAlign: 'center' }}>
                <Typography variant="h4" sx={{ mb: 2 }}>✅</Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  DATOS COMUNES
                </Typography>
                <Typography variant="body2">
                  • Consentimiento simple<br />
                  • Medidas básicas<br />
                  • Multa base
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper sx={{ p: 3, bgcolor: 'error.light', textAlign: 'center' }}>
                <Typography variant="h4" sx={{ mb: 2 }}>⚠️</Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  DATOS SENSIBLES
                </Typography>
                <Typography variant="body2">
                  • Consentimiento expreso<br />
                  • Máxima protección<br />
                  • Multa hasta 5.000 UTM
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Fade>
    </Box>
  );
};

export default ClasificacionDatos;