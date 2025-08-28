import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Paper,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Alert,
  LinearProgress,
  Container,
  IconButton,
  Fade,
  Grow,
  Avatar,
  Zoom,
  Slide
} from '@mui/material';
import {
  School,
  Security,
  Gavel,
  Business,
  CheckCircle,
  PlayArrow,
  Timeline,
  Assignment,
  Balance,
  VerifiedUser,
  Info,
  Warning,
  Star,
  Launch,
  MenuBook,
  WorkOutline,
  Quiz,
  Timer,
  TrendingUp,
  Analytics,
  Speed,
  EmojiEvents,
  Psychology,
  Groups,
  Lightbulb,
  AutoAwesome
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { COLORS } from '../theme/colors';
import PresentacionModuloCero from '../components/PresentacionModuloCero';

function ModuloCero() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [progress, setProgress] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [quizScores, setQuizScores] = useState({});
  const [showCertificate, setShowCertificate] = useState(false);
  const [userPreferences, setUserPreferences] = useState({
    autoplay: true,
    speed: 1,
    subtitles: false
  });

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Update progress
  useEffect(() => {
    const newProgress = (completedSteps.size / steps.length) * 100;
    setProgress(newProgress);
  }, [completedSteps]);

  // Datos del curso estructurados - MEJORADO
  const courseData = {
    title: 'Módulo Cero: Fundamentos de la Ley 21.719',
    subtitle: 'Protección de Datos Personales en Chile',
    duration: '45 minutos',
    difficulty: 'Introductorio',
    version: '2.0 - Edición Potenciada',
    features: [
      '🎯 Sistema de evaluación inteligente',
      '📊 Tracking de progreso en tiempo real', 
      '🏆 Certificación automática',
      '🎮 Experiencia interactiva gamificada',
      '🔍 Quiz adaptativos por sección',
      '⚡ Modo acelerado disponible'
    ],
    objectives: [
      'Comprender los fundamentos de la Ley 21.719',
      'Identificar los principios clave de protección de datos',
      'Conocer los derechos de los titulares de datos',
      'Entender las obligaciones empresariales básicas',
      'Dominar conceptos para RAT profesional',
      'Obtener certificación de competencias'
    ]
  };

  const steps = [
    {
      id: 0,
      title: '¿Qué es la Ley 21.719?',
      icon: <Gavel />,
      color: COLORS.primary.main,
      content: {
        description: 'La Ley 21.719 sobre Protección de Datos Personales es la nueva normativa chilena que regula el tratamiento de datos personales, inspirada en el Reglamento General de Protección de Datos (GDPR) europeo.',
        keyPoints: [
          'Publicada el 17 de mayo de 2022',
          'Entrada en vigencia: 17 de febrero de 2024',
          'Reemplaza la antigua Ley 19.628',
          'Alineada con estándares internacionales'
        ],
        impact: 'Esta ley moderniza el marco regulatorio chileno y establece nuevos estándares de protección para los datos personales de todos los ciudadanos.'
      }
    },
    {
      id: 1,
      title: 'Principios Fundamentales',
      icon: <Balance />,
      color: COLORS.semantic.info.main,
      content: {
        description: 'La ley se basa en principios fundamentales que guían todo tratamiento de datos personales.',
        keyPoints: [
          'Licitud y transparencia',
          'Limitación de la finalidad',
          'Minimización de datos',
          'Exactitud',
          'Limitación del plazo de conservación',
          'Integridad y confidencialidad'
        ],
        impact: 'Estos principios son obligatorios y deben aplicarse en todos los procesos de tratamiento de datos.'
      }
    },
    {
      id: 2,
      title: 'Registro de Actividades de Tratamiento (RAT)',
      icon: <Assignment />,
      color: COLORS.semantic.warning.main,
      content: {
        description: 'El RAT es el documento clave que toda organización debe mantener para demostrar el cumplimiento de la ley. Contiene información detallada sobre todos los tratamientos de datos personales.',
        keyPoints: [
          'Documento obligatorio para organizaciones',
          'Debe mantenerse actualizado constantemente',
          'Incluye finalidades, categorías de datos y medidas de seguridad',
          'Base para auditorías y fiscalizaciones',
          'Herramienta de transparencia hacia los titulares'
        ],
        impact: 'El RAT es fundamental para demostrar cumplimiento y es la base de todo sistema de protección de datos.'
      }
    },
    {
      id: 3,
      title: 'Obligaciones Empresariales',
      icon: <Business />,
      color: COLORS.semantic.success.main,
      content: {
        description: 'Las empresas tienen obligaciones específicas para cumplir con la ley y proteger adecuadamente los datos.',
        keyPoints: [
          'Implementar medidas de seguridad adecuadas',
          'Llevar un Registro de Actividades de Tratamiento (RAT)',
          'Designar un Delegado de Protección de Datos (DPO)',
          'Notificar brechas de seguridad',
          'Realizar evaluaciones de impacto (EIPD)',
          'Garantizar privacidad desde el diseño'
        ],
        impact: 'El incumplimiento puede resultar en multas de hasta 2% de la facturación anual o 50.000 UTM.'
      }
    }
  ];

  const handleStepClick = (stepIndex) => {
    setActiveStep(stepIndex);
  };

  const handleStepComplete = (stepIndex) => {
    setCompletedSteps(prev => new Set([...prev, stepIndex]));
  };

  const progressPercentage = (completedSteps.size / steps.length) * 100;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header Principal */}
      <Fade in timeout={800}>
        <Box sx={{ mb: 4 }}>
          <Card
            elevation={8}
            sx={{
              background: 'linear-gradient(135deg, #1e293b 0%, #334155 25%, #475569 50%, #64748b 75%, #94a3b8 100%)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              borderRadius: 2
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: -20,
                right: -20,
                width: 100,
                height: 100,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)',
                animation: 'pulse 2s infinite'
              }}
            />
            <CardContent sx={{ p: 4 }}>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={8}>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Zoom in timeout={1200}>
                      <Avatar
                        sx={{
                          width: 64,
                          height: 64,
                          bgcolor: 'rgba(255,255,255,0.2)',
                          fontSize: 32,
                          animation: 'gentle-float 3s ease-in-out infinite',
                          '&:hover': {
                            transform: 'scale(1.05)',
                            transition: 'transform 0.3s ease'
                          }
                        }}
                      >
                        <School sx={{ fontSize: 40 }} />
                      </Avatar>
                    </Zoom>
                    <Slide direction="right" in timeout={1000}>
                      <Box>
                        <Typography 
                          variant="h3" 
                          fontWeight="bold"
                          sx={{
                            animation: 'text-shimmer 2s ease-in-out infinite alternate',
                            background: 'linear-gradient(45deg, #ffffff 30%, #f8fafc 50%, #ffffff 70%)',
                            backgroundSize: '200% auto',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            color: 'white'
                          }}
                        >
                          {courseData.title}
                        </Typography>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            opacity: 0.9,
                            animation: 'fade-in-up 1s ease-out 0.5s both'
                          }}
                        >
                          {courseData.subtitle}
                        </Typography>
                      </Box>
                    </Slide>
                  </Box>
                  
                  <Box display="flex" gap={2} flexWrap="wrap" mb={2}>
                    <Fade in timeout={1500}>
                      <Chip
                        icon={<Timeline />}
                        label={`Duración: ${courseData.duration}`}
                        sx={{ 
                          bgcolor: 'rgba(255,255,255,0.2)', 
                          color: 'white',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            bgcolor: 'rgba(255,255,255,0.3)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                          }
                        }}
                      />
                    </Fade>
                    <Fade in timeout={1700}>
                      <Chip
                        icon={<Star />}
                        label={`Nivel: ${courseData.difficulty}`}
                        sx={{ 
                          bgcolor: 'rgba(255,255,255,0.2)', 
                          color: 'white',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            bgcolor: 'rgba(255,255,255,0.3)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                          }
                        }}
                      />
                    </Fade>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Slide direction="left" in timeout={1200}>
                    <Paper sx={{ 
                      p: 2, 
                      bgcolor: 'rgba(255,255,255,0.15)', 
                      backdropFilter: 'blur(10px)', 
                      borderRadius: 2, 
                      border: '1px solid rgba(255,255,255,0.2)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
                        bgcolor: 'rgba(255,255,255,0.2)'
                      }
                    }}>
                      <Typography variant="h6" gutterBottom color="white">
                        Progreso del Módulo
                      </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={progressPercentage}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: 'rgba(255,255,255,0.3)',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: 'white'
                        }
                      }}
                    />
                    <Typography variant="body2" color="white" sx={{ mt: 1 }}>
                      {completedSteps.size} de {steps.length} secciones completadas
                    </Typography>
                    </Paper>
                  </Slide>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>
      </Fade>

      {/* Presentación Interactiva */}
      <Grow in timeout={1000}>
        <Box sx={{ mb: 4 }}>
          <PresentacionModuloCero />
        </Box>
      </Grow>

      {/* Objetivos del Curso */}
      <Fade in timeout={1200}>
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom display="flex" alignItems="center" gap={1}>
              <Assignment color="primary" />
              Objetivos de Aprendizaje
            </Typography>
            <Grid container spacing={2}>
              {courseData.objectives.map((objective, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Box display="flex" alignItems="flex-start" gap={1}>
                    <CheckCircle color="success" sx={{ mt: 0.5 }} />
                    <Typography variant="body1">
                      {objective}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Fade>

      {/* Contenido del Curso - Stepper Interactivo */}
      <Fade in timeout={1400}>
        <Card>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom display="flex" alignItems="center" gap={1}>
                <MenuBook color="primary" />
                Contenido del Módulo
              </Typography>
            </Box>
            <Stepper activeStep={activeStep} orientation="vertical" sx={{ px: 3 }}>
              {steps.map((step, index) => (
                <Step key={step.id} completed={completedSteps.has(index)}>
                  <StepLabel
                    onClick={() => handleStepClick(index)}
                    sx={{
                      cursor: 'pointer',
                      '& .MuiStepLabel-label': {
                        fontSize: '1.1rem',
                        fontWeight: 600
                      }
                    }}
                    icon={
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          bgcolor: completedSteps.has(index) ? 
                            COLORS.semantic.success.main : 
                            activeStep === index ? step.color : COLORS.divider,
                          color: 'white'
                        }}
                      >
                        {completedSteps.has(index) ? <CheckCircle /> : step.icon}
                      </Box>
                    }
                  >
                    {step.title}
                  </StepLabel>
                  
                  <StepContent>
                    <Card 
                      variant="outlined"
                      sx={{ 
                        mt: 2, 
                        borderLeft: `4px solid ${step.color}`,
                        background: `linear-gradient(90deg, ${step.color}08 0%, transparent 100%)`
                      }}
                    >
                      <CardContent>
                        <Typography variant="body1" paragraph sx={{ fontWeight: 500 }}>
                          {step.content.description}
                        </Typography>
                        
                        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                          Puntos Clave:
                        </Typography>
                        <List dense>
                          {step.content.keyPoints.map((point, pointIndex) => (
                            <ListItem key={pointIndex} sx={{ py: 0.5 }}>
                              <ListItemIcon sx={{ minWidth: 32 }}>
                                <CheckCircle 
                                  sx={{ 
                                    color: step.color,
                                    fontSize: 16
                                  }} 
                                />
                              </ListItemIcon>
                              <ListItemText 
                                primary={point}
                                primaryTypographyProps={{
                                  variant: 'body2'
                                }}
                              />
                            </ListItem>
                          ))}
                        </List>
                        
                        <Alert 
                          severity="info" 
                          sx={{ 
                            mt: 2,
                            borderLeft: `4px solid ${step.color}`,
                            '& .MuiAlert-icon': {
                              color: step.color
                            }
                          }}
                        >
                          <Typography variant="body2" fontWeight={500}>
                            {step.content.impact}
                          </Typography>
                        </Alert>
                        
                        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleStepComplete(index)}
                            disabled={completedSteps.has(index)}
                            startIcon={completedSteps.has(index) ? <CheckCircle /> : <Assignment />}
                            sx={{
                              bgcolor: step.color,
                              '&:hover': {
                                bgcolor: step.color,
                                opacity: 0.8
                              }
                            }}
                          >
                            {completedSteps.has(index) ? 'Completado' : 'Marcar como Leído'}
                          </Button>
                          
                          {index < steps.length - 1 && (
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => handleStepClick(index + 1)}
                              endIcon={<PlayArrow />}
                            >
                              Siguiente Sección
                            </Button>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </StepContent>
                </Step>
              ))}
            </Stepper>
          </CardContent>
        </Card>
      </Fade>

      {/* Sección de Finalización */}
      {completedSteps.size === steps.length && (
        <Fade in timeout={600}>
          <Card 
            sx={{ 
              mt: 4,
              background: `linear-gradient(135deg, ${COLORS.semantic.success.main}20 0%, ${COLORS.semantic.success.main}10 100%)`,
              border: `2px solid ${COLORS.semantic.success.main}`
            }}
          >
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <CheckCircle 
                sx={{ 
                  fontSize: 64, 
                  color: COLORS.semantic.success.main,
                  mb: 2
                }} 
              />
              <Typography variant="h4" gutterBottom fontWeight="bold">
                ¡Módulo Cero Completado!
              </Typography>
              <Typography variant="h6" color="text.secondary" paragraph>
                Has completado exitosamente la introducción a la Ley 21.719.
                Ahora estás listo para continuar con el siguiente nivel.
              </Typography>
              
              <Divider sx={{ my: 3 }} />
              
              <Grid container spacing={2} justifyContent="center">
                <Grid item>
                  <Button 
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/rat-produccion')}
                    startIcon={<WorkOutline />}
                    sx={{
                      background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                      py: 1.5,
                      px: 3,
                      fontSize: '1.1rem',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #334155 0%, #475569 100%)'
                      }
                    }}
                  >
                    Ir a RAT Producción
                  </Button>
                </Grid>
                <Grid item>
                  <Button 
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/glosario')}
                    startIcon={<MenuBook />}
                    sx={{ py: 1.5, px: 3 }}
                  >
                    Ver Glosario
                  </Button>
                </Grid>
                <Grid item>
                  <Button 
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/dashboard-dpo')}
                    startIcon={<Launch />}
                    sx={{ py: 1.5, px: 3 }}
                  >
                    Dashboard
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Fade>
      )}

      {/* Acciones Rápidas */}
      <Fade in timeout={1600}>
        <Box sx={{ mt: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Acciones Recomendadas
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<WorkOutline />}
                    onClick={() => navigate('/rat-produccion')}
                    sx={{
                      py: 1.5,
                      background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #334155 0%, #475569 100%)'
                      }
                    }}
                  >
                    Crear tu primer RAT
                  </Button>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<MenuBook />}
                    onClick={() => navigate('/glosario')}
                    sx={{
                      py: 1.5,
                      borderColor: '#64748b',
                      color: '#64748b',
                      '&:hover': {
                        borderColor: '#475569',
                        backgroundColor: 'rgba(71, 85, 105, 0.1)'
                      }
                    }}
                  >
                    Consultar Glosario LPDP
                  </Button>
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Sistema LPDP - Producción estable | ¿Necesitas ayuda? Contacta al equipo de soporte.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Fade>
      
      <style jsx>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.1; }
          50% { transform: scale(1.05); opacity: 0.2; }
          100% { transform: scale(1); opacity: 0.1; }
        }
        
        @keyframes gentle-float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(2deg); }
        }
        
        @keyframes text-shimmer {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
        
        @keyframes fade-in-up {
          0% { 
            opacity: 0; 
            transform: translateY(20px); 
          }
          100% { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        @keyframes card-entrance {
          0% { 
            opacity: 0; 
            transform: translateY(40px) scale(0.95); 
          }
          100% { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }
      `}</style>
    </Container>
  );
}

export default ModuloCero;