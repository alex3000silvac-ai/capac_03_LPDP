import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Card,
  CardContent,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  Alert,
  Chip,
  LinearProgress,
  Fade,
  Slide
} from '@mui/material';
import { 
  Cancel as CancelIcon,
  CheckCircle as CheckIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendingIcon
} from '@mui/icons-material';

const EjemploConcreto = ({ duration = 75 }) => {
  const [activePhase, setActivePhase] = useState(0);
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const antes = [
    { problema: 'Datos en Excel', icon: '📊', riesgo: 'alto' },
    { problema: 'Sin control de acceso', icon: '🔓', riesgo: 'alto' },
    { problema: 'Sin respaldos', icon: '💥', riesgo: 'muy_alto' },
    { problema: 'Sin registro de cambios', icon: '📝', riesgo: 'alto' },
    { problema: 'Riesgo de multa: 5000 UTM', icon: '💸', riesgo: 'critico' }
  ];

  const despues = [
    { solucion: 'Base de datos segura', icon: '🔐', estado: 'implementado' },
    { solucion: 'Permisos por rol', icon: '👥', estado: 'implementado' },
    { solucion: 'Backup automático', icon: '☁️', estado: 'implementado' },
    { solucion: 'Auditoría completa', icon: '📋', estado: 'implementado' },
    { solucion: 'Cumplimiento 100%', icon: '✅', estado: 'certificado' }
  ];

  const roadmap = [
    {
      semana: 1,
      titulo: 'Mapeo inicial',
      descripcion: '10 procesos principales identificados',
      icon: '📍',
      color: 'info',
      tareas: ['Identificar procesos', 'Clasificar datos', 'Mapear flujos']
    },
    {
      semana: 2,
      titulo: 'Documentación',
      descripcion: 'Crear RAT completo + Políticas',
      icon: '📝',
      color: 'warning',
      tareas: ['RAT completo', 'Políticas de privacidad', 'Contratos actualizados']
    },
    {
      semana: 3,
      titulo: 'Implementación',
      descripcion: 'Seguridad técnica + Contratos',
      icon: '🔧',
      color: 'error',
      tareas: ['Medidas técnicas', 'Capacitación equipo', 'Procedimientos']
    },
    {
      semana: 4,
      titulo: 'Validación',
      descripcion: 'Auditoría interna + Certificación',
      icon: '🏆',
      color: 'success',
      tareas: ['Auditoría completa', 'Correcciones', 'Certificación lista']
    }
  ];

  useEffect(() => {
    const phaseDuration = duration * 1000 / 4;
    
    const timer = setInterval(() => {
      setActivePhase(prev => {
        if (prev < 1) return prev + 1;
        if (prev === 1 && !showRoadmap) {
          setShowRoadmap(true);
          return prev;
        }
        if (prev === 1 && showRoadmap && !showResults) {
          setShowResults(true);
          return prev;
        }
        return prev;
      });
    }, phaseDuration);

    return () => clearInterval(timer);
  }, [duration]);

  const getRiskColor = (riesgo) => {
    switch(riesgo) {
      case 'critico': return 'error';
      case 'muy_alto': return 'error';
      case 'alto': return 'warning';
      default: return 'info';
    }
  };

  return (
    <Box sx={{ py: 4 }}>
      {/* Título */}
      <Fade in timeout={1000}>
        <Typography variant="h3" align="center" sx={{ mb: 2, fontWeight: 700 }}>
          📊 EJEMPLO REAL: EMPRESA DE 50 EMPLEADOS
        </Typography>
      </Fade>

      <Fade in timeout={1500}>
        <Typography variant="h6" align="center" color="text.secondary" sx={{ mb: 6 }}>
          Transformación completa en 4 semanas
        </Typography>
      </Fade>

      {/* Comparación ANTES vs DESPUÉS */}
      <Grid container spacing={4} sx={{ mb: 6 }}>
        {/* ANTES */}
        <Grid item xs={12} md={6}>
          <Slide in={activePhase >= 0} direction="right" timeout={1000}>
            <Card 
              elevation={6}
              sx={{ 
                height: '100%',
                bgcolor: 'error.light'
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <CancelIcon sx={{ fontSize: 40, mr: 2, color: 'error.main' }} />
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    ANTES (Sin Sistema)
                  </Typography>
                </Box>

                {antes.map((item, index) => (
                  <Fade key={index} in={activePhase >= 0} timeout={1000 + (index * 300)}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      mb: 2,
                      p: 2,
                      bgcolor: 'background.paper',
                      borderRadius: 1,
                      borderLeft: 4,
                      borderColor: getRiskColor(item.riesgo) + '.main'
                    }}>
                      <Typography variant="h4" sx={{ mr: 2 }}>
                        {item.icon}
                      </Typography>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {item.problema}
                        </Typography>
                        <Chip 
                          label={item.riesgo.replace('_', ' ').toUpperCase()}
                          size="small"
                          color={getRiskColor(item.riesgo)}
                        />
                      </Box>
                      <CancelIcon color="error" />
                    </Box>
                  </Fade>
                ))}

                <Alert severity="error" sx={{ mt: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    💸 Multa potencial: $150 millones CLP
                  </Typography>
                </Alert>
              </CardContent>
            </Card>
          </Slide>
        </Grid>

        {/* DESPUÉS */}
        <Grid item xs={12} md={6}>
          <Slide in={activePhase >= 1} direction="left" timeout={1000}>
            <Card 
              elevation={6}
              sx={{ 
                height: '100%',
                bgcolor: 'success.light'
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <CheckIcon sx={{ fontSize: 40, mr: 2, color: 'success.main' }} />
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    DESPUÉS (Con LPDP)
                  </Typography>
                </Box>

                {despues.map((item, index) => (
                  <Fade key={index} in={activePhase >= 1} timeout={1000 + (index * 300)}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      mb: 2,
                      p: 2,
                      bgcolor: 'background.paper',
                      borderRadius: 1,
                      borderLeft: 4,
                      borderColor: 'success.main'
                    }}>
                      <Typography variant="h4" sx={{ mr: 2 }}>
                        {item.icon}
                      </Typography>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {item.solucion}
                        </Typography>
                        <Chip 
                          label={item.estado.toUpperCase()}
                          size="small"
                          color="success"
                        />
                      </Box>
                      <CheckIcon color="success" />
                    </Box>
                  </Fade>
                ))}

                <Alert severity="success" sx={{ mt: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    🏆 Certificación de cumplimiento LPDP
                  </Typography>
                </Alert>
              </CardContent>
            </Card>
          </Slide>
        </Grid>
      </Grid>

      {/* Hoja de Ruta */}
      <Fade in={showRoadmap} timeout={1000}>
        <Paper elevation={8} sx={{ p: 4, mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <TimelineIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              HOJA DE RUTA: 4 SEMANAS PARA CUMPLIR
            </Typography>
          </Box>

          <Timeline>
            {roadmap.map((fase, index) => (
              <TimelineItem key={index}>
                <TimelineSeparator>
                  <TimelineDot color={fase.color} sx={{ p: 2 }}>
                    <Typography variant="h5">{fase.icon}</Typography>
                  </TimelineDot>
                  {index < roadmap.length - 1 && <TimelineConnector />}
                </TimelineSeparator>
                
                <TimelineContent>
                  <Fade in={showRoadmap} timeout={1000 + (index * 500)}>
                    <Card elevation={3} sx={{ mb: 2 }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                          SEMANA {fase.semana}: {fase.titulo}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                          {fase.descripcion}
                        </Typography>
                        
                        <Box>
                          {fase.tareas.map((tarea, idx) => (
                            <Chip 
                              key={idx}
                              label={tarea}
                              size="small"
                              sx={{ mr: 1, mb: 1 }}
                              color={fase.color}
                            />
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  </Fade>
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        </Paper>
      </Fade>

      {/* Resultados y métricas */}
      <Fade in={showResults} timeout={1000}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card elevation={4} sx={{ textAlign: 'center', p: 3 }}>
              <Typography variant="h1" sx={{ color: 'success.main', fontWeight: 700 }}>
                95%
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Reducción de Riesgo
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={95} 
                color="success"
                sx={{ mt: 2, height: 8, borderRadius: 4 }}
              />
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card elevation={4} sx={{ textAlign: 'center', p: 3 }}>
              <Typography variant="h1" sx={{ color: 'info.main', fontWeight: 700 }}>
                4
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Semanas de Implementación
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                vs 6-12 meses tradicional
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card elevation={4} sx={{ textAlign: 'center', p: 3 }}>
              <Typography variant="h1" sx={{ color: 'warning.main', fontWeight: 700 }}>
                $0
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Multas Evitadas
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Hasta $150 millones CLP
              </Typography>
            </Card>
          </Grid>
        </Grid>
      </Fade>

      {/* Call to Action final */}
      <Fade in={showResults} timeout={1500}>
        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Paper 
            elevation={8}
            sx={{ 
              p: 4,
              bgcolor: 'primary.main',
              color: 'primary.contrastText'
            }}
          >
            <Typography variant="h3" sx={{ mb: 2, fontWeight: 700 }}>
              🚀 ¿LISTO PARA TRANSFORMAR TU EMPRESA?
            </Typography>
            <Typography variant="h6" sx={{ mb: 3, opacity: 0.9 }}>
              Comienza ahora con tu primer mapeo de datos en solo 10 minutos
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Paper 
                  sx={{ 
                    p: 2, 
                    bgcolor: 'rgba(255,255,255,0.1)',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    📊 Comenzar Mapeo Rápido
                  </Typography>
                  <Typography variant="body2">
                    10 minutos para tu primer inventario
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Paper 
                  sx={{ 
                    p: 2, 
                    bgcolor: 'rgba(255,255,255,0.1)',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    🎓 Ver Curso Completo
                  </Typography>
                  <Typography variant="body2">
                    Implementación paso a paso
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      </Fade>
    </Box>
  );
};

export default EjemploConcreto;