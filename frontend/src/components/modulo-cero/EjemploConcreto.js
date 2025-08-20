import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Card,
  CardContent,
  Alert,
  Chip,
  LinearProgress,
  Fade,
  Slide,
  Button,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot
} from '@mui/lab';
import { 
  Cancel as CancelIcon,
  CheckCircle as CheckIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendingIcon,
  PlayArrow,
  Stop,
  VolumeUp,
  VolumeOff,
  NavigateNext,
  NavigateBefore
} from '@mui/icons-material';

const EjemploConcreto = ({ duration = 75, onNext, onPrev, isAutoPlay = false }) => {
  const [activePhase, setActivePhase] = useState(0);
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

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

  // Remover timer automático - solo manual con doble click
  useEffect(() => {
    // No más navegación automática
    return;
  }, [duration, isAutoPlay]);

  // Función para manejar doble click en pantalla
  const handleDoubleClick = () => {
    if (activePhase < 1) {
      setActivePhase(prev => prev + 1);
      if (audioEnabled) playStepAudio(1);
    } else if (!showRoadmap) {
      setShowRoadmap(true);
      if (audioEnabled) playStepAudio(2);
    } else if (!showResults) {
      setShowResults(true);
      if (audioEnabled) playStepAudio(3);
    } else if (onNext) {
      onNext();
    }
  };

  const handleNextStep = () => {
    if (activePhase < 1) {
      setActivePhase(prev => prev + 1);
      if (audioEnabled) playStepAudio(1);
    } else if (!showRoadmap) {
      setShowRoadmap(true);
      if (audioEnabled) playStepAudio(2);
    } else if (!showResults) {
      setShowResults(true);
      if (audioEnabled) playStepAudio(3);
    } else if (onNext) {
      onNext();
    }
  };

  const handlePrevStep = () => {
    if (showResults) {
      setShowResults(false);
    } else if (showRoadmap) {
      setShowRoadmap(false);
    } else if (activePhase > 0) {
      setActivePhase(prev => prev - 1);
    } else if (onPrev) {
      onPrev();
    }
  };

  const playStepAudio = (stepNumber) => {
    if (!audioEnabled) return;
    
    const audioTexts = {
      0: "Ejemplo real de transformación empresarial exitosa. Esta empresa de cincuenta empleados del sector servicios logró cumplimiento completo de la Ley veintiún mil setecientos diecinueve en solo cuatro semanas, evitando multas potenciales de hasta ciento cincuenta millones de pesos chilenos. El caso demuestra que es posible implementar protección de datos personales de manera rápida, eficiente y rentable, transformando el riesgo en ventaja competitiva y certificación de cumplimiento normativo.",
      1: "Comparación detallada del antes y después de la implementación. Sin el sistema de protección de datos, la empresa tenía información personal almacenada en archivos Excel sin control de acceso, sin respaldos de seguridad, sin registro de cambios, y sin contratos de confidencialidad, exponiendo la organización a multas millonarias y demandas de titulares. Con la implementación completa del sistema LPDP, lograron base de datos segura con encriptación, permisos por roles, respaldo automático en la nube, auditoría completa de accesos, y cumplimiento certificado al cien por ciento.",
      2: "Hoja de ruta detallada de implementación en cuatro semanas. Primera semana: mapeo inicial identificando diez procesos principales, clasificación de todos los tipos de datos, y documentación de flujos de información. Segunda semana: creación del Registro de Actividades de Tratamiento completo, elaboración de políticas de privacidad, y actualización de contratos con terceros. Tercera semana: implementación de medidas de seguridad técnicas y organizacionales, capacitación completa del equipo, y establecimiento de procedimientos operativos. Cuarta semana: auditoría interna exhaustiva, corrección de hallazgos, y obtención de certificación de cumplimiento lista para la autoridad regulatoria.",
      3: "Resultados cuantificados y beneficios obtenidos. Noventa y cinco por ciento de reducción del riesgo de sanciones regulatorias, implementación completada en solo cuatro semanas versus el promedio de seis a doce meses de métodos tradicionales, cero multas evitadas representando un ahorro potencial de ciento cincuenta millones de pesos, certificación oficial de cumplimiento que genera confianza en clientes y socios, y sistema automatizado que reduce en ochenta por ciento el tiempo dedicado a gestión manual de privacidad. La inversión se recuperó en menos de tres meses gracias a la eficiencia operacional y la reducción de riesgos legales."
    };

    const text = audioTexts[stepNumber] || "";
    if (text && 'speechSynthesis' in window) {
      try {
        speechSynthesis.cancel();
      } catch (error) {
        console.warn('Error cancelando síntesis anterior:', error);
      }
      
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = speechSynthesis.getVoices();
      const femaleSpanishVoice = voices.find(voice => 
        (voice.lang.includes('es') || voice.lang.includes('ES')) && 
        (voice.name.toLowerCase().includes('female') || 
         voice.name.toLowerCase().includes('mujer') ||
         voice.name.toLowerCase().includes('maria') ||
         voice.name.toLowerCase().includes('carmen') ||
         voice.name.toLowerCase().includes('lucia'))
      ) || voices.find(voice => voice.lang.includes('es') || voice.lang.includes('ES'));
      
      if (femaleSpanishVoice) utterance.voice = femaleSpanishVoice;
      
      utterance.lang = 'es-ES';
      utterance.rate = 0.8;
      utterance.pitch = 1.0;
      utterance.volume = 0.9;
      
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = (error) => {
        console.warn('Error en síntesis de voz:', error);
        setIsPlaying(false);
      };
      
      try {
        speechSynthesis.speak(utterance);
      } catch (error) {
        console.warn('Error iniciando síntesis de voz:', error);
        setIsPlaying(false);
      }
    }
  };

  useEffect(() => {
    if (audioEnabled) {
      setTimeout(() => playStepAudio(0), 1000);
    }
  }, []);

  const getRiskColor = (riesgo) => {
    switch(riesgo) {
      case 'critico': return 'error';
      case 'muy_alto': return 'error';
      case 'alto': return 'warning';
      default: return 'info';
    }
  };

  return (
    <Box 
      sx={{ py: 4, position: 'relative' }}
      onDoubleClick={handleDoubleClick}
    >
      {/* Controles de Audio */}
      <Box sx={{ position: 'absolute', top: 0, right: 0, display: 'flex', gap: 1, zIndex: 10 }}>
        <Tooltip title={audioEnabled ? "Desactivar audio" : "Activar audio"}>
          <IconButton
            size="small"
            onClick={() => {
              setAudioEnabled(!audioEnabled);
              if (isPlaying) {
                speechSynthesis.cancel();
                setIsPlaying(false);
              }
            }}
            color={audioEnabled ? 'primary' : 'default'}
          >
            {audioEnabled ? <VolumeUp /> : <VolumeOff />}
          </IconButton>
        </Tooltip>
        
        {audioEnabled && (
          <Tooltip title={isPlaying ? "Detener" : "Reproducir explicación"}>
            <IconButton
              size="small"
              onClick={() => {
                if (isPlaying) {
                  speechSynthesis.cancel();
                  setIsPlaying(false);
                } else {
                  let currentStep = 0;
                  if (showResults) currentStep = 3;
                  else if (showRoadmap) currentStep = 2;
                  else if (activePhase >= 1) currentStep = 1;
                  playStepAudio(currentStep);
                }
              }}
              color={isPlaying ? 'secondary' : 'default'}
            >
              {isPlaying ? <Stop /> : <PlayArrow />}
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Controles de Navegación */}
      <Box sx={{ position: 'absolute', bottom: -60, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 2, zIndex: 10 }}>
        <Button
          variant="outlined"
          startIcon={<NavigateBefore />}
          onClick={handlePrevStep}
          disabled={activePhase === 0 && !showRoadmap && !showResults}
          size="small"
        >
          Anterior
        </Button>
        
        <Button
          variant="contained"
          endIcon={<NavigateNext />}
          onClick={handleNextStep}
          size="small"
        >
          {!showResults ? 'Siguiente' : 'Finalizar'}
        </Button>
      </Box>

      {/* Área invisible para click simple - no perder foco */}
      <Box 
        sx={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          height: 100, 
          cursor: 'pointer',
          zIndex: 1,
          backgroundColor: 'transparent'
        }}
        onClick={handleNextStep}
        title="Click para avanzar"
      />
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