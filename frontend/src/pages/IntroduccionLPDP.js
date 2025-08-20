import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Alert,
  LinearProgress,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Chip,
  Divider,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  VolumeUp,
  FullscreenExit,
  Book,
  CheckCircle,
  Info,
  ArrowForward,
  School,
  Gavel,
  Security,
  Timeline,
  Assignment,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const VideoAnimado = ({ isPlaying, onPlayPause }) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [progress, setProgress] = useState(0);

  // Frames del video animado sobre LPDP
  const frames = [
    {
      title: "¿Qué es la Ley 21.719?",
      content: "La Ley de Protección de Datos Personales de Chile",
      icon: "🇨🇱",
      description: "Una nueva ley que protege la privacidad de todas las personas en Chile"
    },
    {
      title: "¿Qué son los datos personales?",
      content: "Cualquier información que identifique a una persona",
      icon: "👤",
      description: "Nombre, RUT, email, teléfono, dirección, fotos, videos"
    },
    {
      title: "Datos Sensibles en Chile",
      content: "Información especialmente protegida",
      icon: "🔐",
      description: "Salud, situación socioeconómica, biométricos, origen étnico"
    },
    {
      title: "Derechos de las Personas",
      content: "Tus derechos sobre tus datos",
      icon: "⚖️",
      description: "Acceso, rectificación, cancelación, oposición, portabilidad"
    },
    {
      title: "Responsabilidades de las Empresas",
      content: "Lo que deben hacer las organizaciones",
      icon: "🏢",
      description: "Proteger, documentar, informar y respetar los derechos"
    },
    {
      title: "¿Por qué es importante?",
      content: "Protege tu privacidad y dignidad",
      icon: "🛡️",
      description: "Evita el mal uso de tu información personal"
    }
  ];

  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentFrame((prev) => {
          const next = (prev + 1) % frames.length;
          setProgress(((next + 1) / frames.length) * 100);
          return next;
        });
      }, 3000); // Cambia frame cada 3 segundos
    }
    return () => clearInterval(interval);
  }, [isPlaying, frames.length]);

  const currentFrameData = frames[currentFrame];

  return (
    <Paper 
      sx={{ 
        p: 3, 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        position: 'relative',
        minHeight: 400,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentFrame}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center' }}
        >
          <Typography variant="h1" sx={{ fontSize: '4rem', mb: 2 }}>
            {currentFrameData.icon}
          </Typography>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
            {currentFrameData.title}
          </Typography>
          <Typography variant="h6" sx={{ mb: 2, opacity: 0.9 }}>
            {currentFrameData.content}
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.8 }}>
            {currentFrameData.description}
          </Typography>
        </motion.div>
      </AnimatePresence>

      {/* Controles del video */}
      <Box 
        sx={{ 
          position: 'absolute', 
          bottom: 16, 
          left: 16, 
          right: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}
      >
        <IconButton 
          onClick={onPlayPause}
          sx={{ color: 'white' }}
        >
          {isPlaying ? <Pause /> : <PlayArrow />}
        </IconButton>
        
        <Box sx={{ flexGrow: 1 }}>
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ 
              height: 6, 
              borderRadius: 3,
              bgcolor: 'rgba(255,255,255,0.3)',
              '& .MuiLinearProgress-bar': {
                bgcolor: 'white'
              }
            }}
          />
        </Box>

        <Typography variant="caption" sx={{ minWidth: 60 }}>
          {Math.round(progress)}%
        </Typography>
      </Box>

      {/* Indicador de frame */}
      <Box 
        sx={{ 
          position: 'absolute', 
          top: 16, 
          right: 16,
          display: 'flex',
          gap: 1
        }}
      >
        {frames.map((_, index) => (
          <Box
            key={index}
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: index === currentFrame ? 'white' : 'rgba(255,255,255,0.4)',
              transition: 'all 0.3s ease'
            }}
          />
        ))}
      </Box>
    </Paper>
  );
};

function IntroduccionLPDP() {
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [completed, setCompleted] = useState({});

  const handleVideoPlayPause = () => {
    setVideoPlaying(!videoPlaying);
  };

  const pasos = [
    {
      label: 'Ver Video Introductorio',
      descripcion: 'Comprende los conceptos básicos de la LPDP',
      contenido: 'Video animado explicativo'
    },
    {
      label: 'Conceptos Fundamentales',
      descripcion: 'Aprende los términos clave',
      contenido: 'Definiciones básicas'
    },
    {
      label: 'Casos Prácticos',
      descripcion: 'Ejemplos de la vida real',
      contenido: 'Situaciones cotidianas'
    },
    {
      label: 'Evaluación',
      descripcion: 'Confirma tu comprensión',
      contenido: 'Quiz básico'
    }
  ];

  const conceptosClave = [
    {
      titulo: "Dato Personal",
      definicion: "Cualquier información sobre una persona identificada o identificable",
      ejemplo: "Nombre, RUT, email, teléfono"
    },
    {
      titulo: "Tratamiento",
      definicion: "Cualquier operación sobre datos personales",
      ejemplo: "Recolectar, almacenar, usar, compartir, eliminar"
    },
    {
      titulo: "Responsable",
      definicion: "Quien decide cómo y para qué se usan los datos",
      ejemplo: "La empresa, organización o institución"
    },
    {
      titulo: "Titular",
      definicion: "La persona a quien pertenecen los datos",
      ejemplo: "Tú, el cliente, el empleado"
    }
  ];

  const handleNext = () => {
    if (activeStep === 0 && videoPlaying) {
      setVideoPlaying(false);
    }
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleComplete = () => {
    setCompleted({
      ...completed,
      [activeStep]: true,
    });
    handleNext();
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #2196F3 0%, #21CBF3 100%)' }}>
        <CardContent>
          <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'white' }}>
            <Book /> Introducción a la Protección de Datos
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9, color: 'white' }}>
            Fundamentos legales y conceptos básicos de la Ley N° 21.719
          </Typography>
          <Alert severity="info" sx={{ mt: 2, bgcolor: 'rgba(255,255,255,0.15)', color: 'white' }}>
            <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
              💡 <strong>Tip:</strong> Los conceptos introducidos aquí como <strong>Dato Personal, 
              Tratamiento, Responsable, Titular</strong> están desarrollados en profundidad en nuestro 
              <strong>Glosario LPDP completo</strong> con más de 75 términos especializados y 
              referencias legales específicas de Chile.
            </Typography>
          </Alert>
        </CardContent>
      </Card>

      {/* Stepper del curso */}
      <Stepper activeStep={activeStep} orientation="vertical">
        {pasos.map((paso, index) => (
          <Step key={paso.label} completed={completed[index]}>
            <StepLabel>
              <Typography variant="h6">{paso.label}</Typography>
            </StepLabel>
            <StepContent>
              <Typography variant="body2" color="text.secondary" paragraph>
                {paso.descripcion}
              </Typography>

              {/* Contenido específico por paso */}
              {index === 0 && (
                <Box sx={{ mb: 3 }}>
                  <VideoAnimado 
                    isPlaying={videoPlaying} 
                    onPlayPause={handleVideoPlayPause}
                  />
                  <Alert severity="info" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      Este video te introduce a los conceptos fundamentales de la Ley 21.719. 
                      Duración aproximada: 18 segundos (6 conceptos × 3 segundos cada uno).
                    </Typography>
                  </Alert>
                </Box>
              )}

              {index === 1 && (
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  {conceptosClave.map((concepto, idx) => (
                    <Grid item xs={12} md={6} key={idx}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" color="primary" gutterBottom>
                            {concepto.titulo}
                          </Typography>
                          <Typography variant="body2" paragraph>
                            {concepto.definicion}
                          </Typography>
                          <Chip label={`Ej: ${concepto.ejemplo}`} size="small" />
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}

              {index === 2 && (
                <Grid container spacing={3} sx={{ mb: 3 }}>
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          🛒 Caso: Compra Online
                        </Typography>
                        <Typography variant="body2" paragraph>
                          Cuando compras algo en internet, la tienda necesita:
                        </Typography>
                        <List dense>
                          <ListItem>
                            <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                            <ListItemText primary="Tu nombre y dirección (para envío)" />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                            <ListItemText primary="Datos bancarios (para pago)" />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon><Info color="info" /></ListItemIcon>
                            <ListItemText primary="Base legal: Ejecución del contrato" />
                          </ListItem>
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          👨‍💼 Caso: Trabajo
                        </Typography>
                        <Typography variant="body2" paragraph>
                          Tu empleador puede tratar tus datos para:
                        </Typography>
                        <List dense>
                          <ListItem>
                            <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                            <ListItemText primary="Pagar tu sueldo" />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                            <ListItemText primary="Cumplir obligaciones laborales" />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon><Info color="info" /></ListItemIcon>
                            <ListItemText primary="Base legal: Obligación legal" />
                          </ListItem>
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              )}

              {index === 3 && (
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      📝 Evaluación Rápida
                    </Typography>
                    <Typography variant="body2" paragraph>
                      Responde estas preguntas para confirmar tu comprensión:
                    </Typography>
                    <List>
                      <ListItem>
                        <ListItemText 
                          primary="1. ¿Qué es un dato personal?"
                          secondary="Respuesta: Cualquier información sobre una persona identificada o identificable"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="2. ¿Cuál es la diferencia entre responsable y titular?"
                          secondary="Respuesta: El responsable decide sobre los datos, el titular es su dueño"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="3. ¿Qué derechos tienes sobre tus datos?"
                          secondary="Respuesta: Acceso, rectificación, cancelación, oposición y portabilidad"
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              )}

              {/* Botones de navegación */}
              <Box sx={{ mb: 1 }}>
                <Button
                  variant="contained"
                  onClick={index === pasos.length - 1 ? handleComplete : handleNext}
                  sx={{ mt: 1, mr: 1 }}
                >
                  {index === pasos.length - 1 ? 'Finalizar' : 'Continuar'}
                </Button>
                <Button
                  disabled={index === 0}
                  onClick={handleBack}
                  sx={{ mt: 1, mr: 1 }}
                >
                  Anterior
                </Button>
              </Box>
            </StepContent>
          </Step>
        ))}
      </Stepper>

      {/* Mensaje final */}
      {activeStep === pasos.length && (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <CheckCircle color="success" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              ¡Felicitaciones!
            </Typography>
            <Typography variant="body1" paragraph>
              Has completado la introducción a la Protección de Datos Personales.
              Ya conoces los conceptos básicos de la Ley 21.719.
            </Typography>
            <Button 
              variant="contained" 
              size="large"
              onClick={() => window.history.back()}
              startIcon={<ArrowForward />}
            >
              Continuar con el siguiente módulo
            </Button>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}

export default IntroduccionLPDP;