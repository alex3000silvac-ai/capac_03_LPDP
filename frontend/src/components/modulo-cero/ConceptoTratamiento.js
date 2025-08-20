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
  Button,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  CloudDownload as RecopilarIcon,
  Settings as ProcesarIcon,
  Share as CompartirIcon,
  Business as EmpresaIcon,
  PlayArrow,
  Stop,
  VolumeUp,
  VolumeOff,
  NavigateNext,
  NavigateBefore
} from '@mui/icons-material';

const ConceptoTratamiento = ({ duration = 30, onNext, onPrev, isAutoPlay = false }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  // Solo usar timer automático si isAutoPlay está activado
  useEffect(() => {
    if (!isAutoPlay) return;
    
    const stepDuration = duration * 1000 / 4;
    
    const timer = setInterval(() => {
      setActiveStep(prev => (prev < 3 ? prev + 1 : prev));
    }, stepDuration);

    return () => clearInterval(timer);
  }, [duration, isAutoPlay]);

  // Función para avanzar manualmente
  const handleNextStep = () => {
    if (activeStep < 3) {
      setActiveStep(prev => prev + 1);
      if (audioEnabled) {
        playStepAudio(activeStep + 1);
      }
    } else if (onNext) {
      onNext();
    }
  };

  // Función para retroceder
  const handlePrevStep = () => {
    if (activeStep > 0) {
      setActiveStep(prev => prev - 1);
    } else if (onPrev) {
      onPrev();
    }
  };

  // Función de audio
  const playStepAudio = (stepNumber) => {
    if (!audioEnabled) return;
    
    const audioTexts = {
      0: "Bienvenida al concepto de tratamiento de datos. Un tratamiento es cualquier operación que tu empresa realiza con información personal.",
      1: "Primer paso: Recopilar. Tu empresa obtiene datos personales a través de formularios, contratos, currículums y encuestas.",
      2: "Segundo paso: Procesar. Una vez que tienes los datos, los analizas, almacenas, modificas y organizas según tus necesidades.",
      3: "Tercer paso: Compartir. Enviamos estos datos a terceros como proveedores, el Estado, socios comerciales y bancos. Todo esto constituye tratamiento de datos y está regulado por la Ley veintiún mil setecientos diecinueve."
    };

    const text = audioTexts[stepNumber] || "";
    if (text && 'speechSynthesis' in window) {
      // Detener audio anterior
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Configurar voz femenina en español
      const voices = speechSynthesis.getVoices();
      const femaleSpanishVoice = voices.find(voice => 
        (voice.lang.includes('es') || voice.lang.includes('ES')) && 
        (voice.name.toLowerCase().includes('female') || 
         voice.name.toLowerCase().includes('mujer') ||
         voice.name.toLowerCase().includes('maria') ||
         voice.name.toLowerCase().includes('carmen') ||
         voice.name.toLowerCase().includes('lucia'))
      ) || voices.find(voice => voice.lang.includes('es') || voice.lang.includes('ES'));
      
      if (femaleSpanishVoice) {
        utterance.voice = femaleSpanishVoice;
      }
      
      utterance.lang = 'es-ES';
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      utterance.volume = 0.8;
      
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      
      speechSynthesis.speak(utterance);
    }
  };

  // Reproducir audio al cargar
  useEffect(() => {
    if (audioEnabled) {
      setTimeout(() => playStepAudio(0), 1000);
    }
  }, []);

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
    <Box sx={{ textAlign: 'center', py: 4, position: 'relative' }}>
      {/* Controles de Audio */}
      <Box sx={{ position: 'absolute', top: 0, right: 0, display: 'flex', gap: 1 }}>
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
                  playStepAudio(activeStep);
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
      <Box sx={{ position: 'absolute', bottom: -60, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<NavigateBefore />}
          onClick={handlePrevStep}
          disabled={activeStep === 0}
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
          {activeStep < 3 ? 'Siguiente' : 'Continuar'}
        </Button>
      </Box>
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
                    minHeight: '320px',
                    transform: activeStep >= index ? 'scale(1.05)' : 'scale(1)',
                    transition: 'all 0.5s ease-in-out',
                    bgcolor: activeStep >= index ? 'primary.light' : 'background.paper',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    setActiveStep(index);
                    if (audioEnabled) playStepAudio(index);
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