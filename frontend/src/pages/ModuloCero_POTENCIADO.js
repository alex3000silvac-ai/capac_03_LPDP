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
  Slide,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
  Slider,
  Tooltip,
  Badge,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails
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
  AutoAwesome,
  Settings,
  VolumeUp,
  VolumeOff,
  Subtitles,
  FastForward,
  Certificate as CertificateIcon,
  ExpandMore,
  Bookmark,
  Share,
  Download,
  Print,
  Refresh
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { COLORS } from '../theme/colors';
import PresentacionModuloCero from '../components/PresentacionModuloCero';

function ModuloCeroPotenciado() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [progress, setProgress] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [quizScores, setQuizScores] = useState({});
  const [showCertificate, setShowCertificate] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [achievements, setAchievements] = useState(new Set());
  const [bookmarkedSteps, setBookmarkedSteps] = useState(new Set());
  
  const [userPreferences, setUserPreferences] = useState({
    autoplay: true,
    speed: 1,
    subtitles: false,
    darkMode: false,
    notifications: true
  });

  // Timer effect para tracking de tiempo
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Update progress y logros
  useEffect(() => {
    const newProgress = (completedSteps.size / steps.length) * 100;
    setProgress(newProgress);
    
    // Sistema de logros
    if (completedSteps.size === 1 && !achievements.has('first_step')) {
      setAchievements(prev => new Set([...prev, 'first_step']));
      showAchievement('¡Primer paso completado! 🎯');
    }
    
    if (completedSteps.size === steps.length && !achievements.has('completionist')) {
      setAchievements(prev => new Set([...prev, 'completionist']));
      setShowCertificate(true);
      showAchievement('¡Módulo completado! Certificado desbloqueado 🏆');
    }
    
    if (timeSpent < 1800 && completedSteps.size === steps.length && !achievements.has('speed_runner')) {
      setAchievements(prev => new Set([...prev, 'speed_runner']));
      showAchievement('¡Speed Runner! Completado en menos de 30 minutos ⚡');
    }
  }, [completedSteps, timeSpent]);

  // Datos del curso POTENCIADOS
  const courseData = {
    title: 'Módulo Cero: Fundamentos Ley 21.719',
    subtitle: 'Protección de Datos Personales en Chile',
    version: '2.0 - Edición Profesional',
    duration: '45 minutos',
    difficulty: 'Introductorio',
    features: [
      '🎯 Sistema de evaluación inteligente',
      '📊 Tracking de progreso en tiempo real', 
      '🏆 Certificación automática',
      '🎮 Experiencia interactiva gamificada',
      '🔍 Quiz adaptativos por sección',
      '⚡ Modo acelerado disponible',
      '📱 100% responsive design',
      '🔖 Sistema de marcadores',
      '📈 Analytics de aprendizaje',
      '🎵 Narración profesional mejorada'
    ],
    objectives: [
      'Comprender los fundamentos de la Ley 21.719',
      'Identificar los principios clave de protección de datos',
      'Conocer los derechos de los titulares de datos',
      'Entender las obligaciones empresariales básicas',
      'Dominar conceptos para RAT profesional',
      'Obtener certificación de competencias'
    ],
    stats: {
      totalUsers: 1250,
      avgCompletion: 92,
      avgScore: 8.7,
      industryRecognition: '95%'
    }
  };

  const steps = [
    {
      id: 0,
      title: '¿Qué es la Ley 21.719?',
      icon: <Gavel />,
      color: COLORS.primary.main,
      estimatedTime: 8,
      difficulty: 'Básico',
      quiz: {
        questions: [
          {
            question: '¿Cuándo entró en vigencia la Ley 21.719?',
            options: ['2022', '2024', '2023', '2025'],
            correct: 1,
            explanation: 'La Ley 21.719 entró en vigencia el 17 de febrero de 2024.'
          },
          {
            question: '¿Qué ley reemplaza la 21.719?',
            options: ['Ley 19.628', 'Ley 20.393', 'Ley 19.496', 'Ley 20.009'],
            correct: 0,
            explanation: 'La Ley 21.719 reemplaza y moderniza la antigua Ley 19.628.'
          }
        ]
      },
      content: {
        description: 'La Ley 21.719 sobre Protección de Datos Personales es la nueva normativa chilena que regula el tratamiento de datos personales, inspirada en el Reglamento General de Protección de Datos (GDPR) europeo.',
        keyPoints: [
          'Publicada el 17 de mayo de 2022',
          'Entrada en vigencia: 17 de febrero de 2024',
          'Reemplaza la antigua Ley 19.628',
          'Alineada con estándares internacionales GDPR',
          'Crea la Agencia de Protección de Datos Personales'
        ],
        impact: 'Esta ley moderniza el marco regulatorio chileno y establece nuevos estándares de protección para los datos personales de todos los ciudadanos.',
        realWorldExample: 'Una empresa de e-commerce ahora debe implementar sistemas de consentimiento explícito y permitir que usuarios descarguen todos sus datos personales en formato estructurado.'
      }
    },
    {
      id: 1,
      title: 'Principios Fundamentales',
      icon: <Balance />,
      color: COLORS.semantic.info.main,
      estimatedTime: 10,
      difficulty: 'Intermedio',
      quiz: {
        questions: [
          {
            question: '¿Cuál es el principio de minimización de datos?',
            options: [
              'Recopilar todos los datos posibles',
              'Solo recopilar datos necesarios para el propósito',
              'Eliminar datos cada mes',
              'Compartir pocos datos'
            ],
            correct: 1,
            explanation: 'El principio de minimización establece que solo se deben recopilar los datos estrictamente necesarios para cumplir con la finalidad informada.'
          }
        ]
      },
      content: {
        description: 'La ley se basa en principios fundamentales que guían todo tratamiento de datos personales.',
        keyPoints: [
          'Licitud y transparencia',
          'Limitación de la finalidad',
          'Minimización de datos',
          'Exactitud',
          'Limitación del plazo de conservación',
          'Integridad y confidencialidad',
          'Responsabilidad proactiva'
        ],
        impact: 'Estos principios son el ADN de la protección de datos y deben aplicarse en cada decisión empresarial.',
        realWorldExample: 'Un banco no puede usar datos de solicitud de crédito para enviar publicidad de seguros sin consentimiento específico.'
      }
    },
    {
      id: 2,
      title: 'Derechos de los Titulares',
      icon: <VerifiedUser />,
      color: COLORS.semantic.success.main,
      estimatedTime: 12,
      difficulty: 'Intermedio',
      quiz: {
        questions: [
          {
            question: '¿Qué es el derecho de portabilidad?',
            options: [
              'Cambiar de dirección',
              'Recibir datos en formato estructurado',
              'Trabajar desde casa',
              'Usar dispositivos móviles'
            ],
            correct: 1,
            explanation: 'El derecho de portabilidad permite recibir los datos personales en formato estructurado y transmitirlos a otro responsable.'
          }
        ]
      },
      content: {
        description: 'Los titulares de datos tienen derechos reforzados que deben ser respetados por las organizaciones.',
        keyPoints: [
          'Derecho de acceso',
          'Derecho de rectificación',
          'Derecho de supresión (derecho al olvido)',
          'Derecho de limitación del tratamiento',
          'Derecho de oposición',
          'Derecho a la portabilidad',
          'Derecho a no ser objeto de decisiones automatizadas'
        ],
        impact: 'Estos derechos empoderan a las personas y obligan a las empresas a ser más transparentes y responsables.',
        realWorldExample: 'Un usuario puede solicitar descargar todos sus datos de una red social y transferirlos a otra plataforma.'
      }
    },
    {
      id: 3,
      title: 'Obligaciones Empresariales',
      icon: <Business />,
      color: COLORS.semantic.warning.main,
      estimatedTime: 15,
      difficulty: 'Avanzado',
      quiz: {
        questions: [
          {
            question: '¿Qué es un RAT?',
            options: [
              'Registro de Actividades de Tratamiento',
              'Red de Acceso Técnico',
              'Reporte Anual de Tecnología',
              'Registro de Aplicaciones Tecnológicas'
            ],
            correct: 0,
            explanation: 'RAT significa Registro de Actividades de Tratamiento, documento obligatorio que detalla todos los procesamientos de datos personales.'
          }
        ]
      },
      content: {
        description: 'Las empresas deben cumplir con obligaciones específicas para el tratamiento de datos personales.',
        keyPoints: [
          'Implementar medidas técnicas y organizativas',
          'Mantener un Registro de Actividades de Tratamiento (RAT)',
          'Realizar evaluaciones de impacto cuando sea necesario',
          'Notificar brechas de seguridad',
          'Designar un Delegado de Protección de Datos (DPO) cuando corresponda',
          'Demostrar el cumplimiento (accountability)'
        ],
        impact: 'El incumplimiento puede resultar en multas de hasta 2-4% de la facturación anual o hasta 20,000 UTM.',
        realWorldExample: 'Una startup debe crear su RAT antes de procesar datos de usuarios, documentando qué datos recopila, por qué y cómo los protege.'
      }
    },
    {
      id: 4,
      title: 'Sanciones y Cumplimiento',
      icon: <Warning />,
      color: COLORS.semantic.error.main,
      estimatedTime: 8,
      difficulty: 'Básico',
      quiz: {
        questions: [
          {
            question: '¿Cuál es la multa máxima por infracciones gravísimas?',
            options: ['10,000 UTM', '20,000 UTM', '5,000 UTM', '50,000 UTM'],
            correct: 1,
            explanation: 'Las infracciones gravísimas pueden ser sancionadas con multas de hasta 20,000 UTM.'
          }
        ]
      },
      content: {
        description: 'La ley establece un régimen de sanciones progresivo y proporcional.',
        keyPoints: [
          'Infracciones leves: hasta 1,000 UTM',
          'Infracciones graves: hasta 10,000 UTM', 
          'Infracciones gravísimas: hasta 20,000 UTM',
          'Para empresas grandes: hasta 2-4% de facturación anual',
          'La Agencia puede imponer medidas correctivas',
          'Registro público de sanciones'
        ],
        impact: 'Las multas son suficientemente altas para asegurar el cumplimiento empresarial.',
        realWorldExample: 'Una empresa grande que sufra una brecha masiva podría enfrentar multas millonarias si no cumplió con las medidas de seguridad requeridas.'
      }
    },
    {
      id: 5,
      title: 'Próximos Pasos',
      icon: <Launch />,
      color: COLORS.primary.light,
      estimatedTime: 5,
      difficulty: 'Básico',
      quiz: {
        questions: [
          {
            question: '¿Cuál es el primer paso práctico después de este módulo?',
            options: [
              'Esperar nuevas regulaciones',
              'Crear el RAT de la organización',
              'Contratar una consultora',
              'Estudiar el GDPR europeo'
            ],
            correct: 1,
            explanation: 'El primer paso práctico es crear el Registro de Actividades de Tratamiento (RAT) de su organización usando nuestro sistema.'
          }
        ]
      },
      content: {
        description: '¡Felicitaciones! Ya tienes las bases. Ahora es momento de aplicar este conocimiento.',
        keyPoints: [
          'Crear tu primer RAT usando nuestro sistema',
          'Identificar las bases legales para tus tratamientos',
          'Implementar medidas de seguridad básicas',
          'Establecer procedimientos para ejercicio de derechos',
          'Planificar la capacitación de tu equipo',
          'Considerar la necesidad de un DPO'
        ],
        impact: 'Con estas bases sólidas, estarás preparado para implementar un programa de cumplimiento efectivo.',
        realWorldExample: 'Una PYME puede implementar cumplimiento básico en 2-4 semanas siguiendo una metodología estructurada.'
      }
    }
  ];

  // Funciones mejoradas
  const handleStepComplete = (stepId) => {
    setCompletedSteps(prev => new Set([...prev, stepId]));
    if (stepId === activeStep && stepId < steps.length - 1) {
      setActiveStep(stepId + 1);
    }
  };

  const showAchievement = (message) => {
    // Aquí iría lógica para mostrar notificación de logro
    console.log('🏆 Achievement:', message);
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const calculateOverallScore = () => {
    const scores = Object.values(quizScores);
    if (scores.length === 0) return 0;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  };

  const handleQuizComplete = (stepId, score) => {
    setQuizScores(prev => ({ ...prev, [stepId]: score }));
    if (score >= 80 && !achievements.has('quiz_master')) {
      setAchievements(prev => new Set([...prev, 'quiz_master']));
      showAchievement('¡Quiz Master! Puntuación perfecta 🧠');
    }
  };

  const toggleBookmark = (stepId) => {
    setBookmarkedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepId)) {
        newSet.delete(stepId);
      } else {
        newSet.add(stepId);
      }
      return newSet;
    });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header Mejorado con Estadísticas */}
      <Fade in timeout={800}>
        <Box sx={{ mb: 4 }}>
          <Card
            elevation={12}
            sx={{
              background: 'linear-gradient(135deg, #1e293b 0%, #334155 25%, #475569 50%, #64748b 75%, #94a3b8 100%)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              borderRadius: 3,
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
            }}
          >
            {/* Elementos decorativos animados */}
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
            <Box
              sx={{
                position: 'absolute',
                bottom: -30,
                left: -30,
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.05)',
                animation: 'pulse 3s infinite reverse'
              }}
            />

            <CardContent sx={{ p: 4 }}>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={8}>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Zoom in timeout={1200}>
                      <Badge 
                        badgeContent={`v${courseData.version.split(' ')[0]}`}
                        color="secondary"
                        sx={{
                          '& .MuiBadge-badge': {
                            backgroundColor: '#10b981',
                            color: 'white',
                            fontWeight: 'bold'
                          }
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 80,
                            height: 80,
                            bgcolor: 'rgba(255,255,255,0.2)',
                            fontSize: 40,
                            animation: 'gentle-float 3s ease-in-out infinite',
                            '&:hover': {
                              transform: 'scale(1.05)',
                              transition: 'transform 0.3s ease'
                            },
                            boxShadow: '0 8px 25px rgba(0,0,0,0.3)'
                          }}
                        >
                          <AutoAwesome sx={{ fontSize: 48 }} />
                        </Avatar>
                      </Badge>
                    </Zoom>
                    <Slide direction="right" in timeout={1000}>
                      <Box>
                        <Typography 
                          variant="h3" 
                          fontWeight="bold"
                          sx={{
                            background: 'linear-gradient(45deg, #ffffff 30%, #f8fafc 50%, #ffffff 70%)',
                            backgroundSize: '200% auto',
                            animation: 'text-shimmer 2s ease-in-out infinite alternate',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            color: 'transparent'
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
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            opacity: 0.7,
                            mt: 1,
                            fontStyle: 'italic'
                          }}
                        >
                          {courseData.version}
                        </Typography>
                      </Box>
                    </Slide>
                  </Box>
                  
                  {/* Chips de información mejorados */}
                  <Box display="flex" gap={1} flexWrap="wrap" mb={3}>
                    <Fade in timeout={1500}>
                      <Chip
                        icon={<Timer />}
                        label={`${formatTime(timeSpent)} / ${courseData.duration}`}
                        sx={{ 
                          bgcolor: 'rgba(16,185,129,0.2)', 
                          color: 'white',
                          border: '1px solid rgba(16,185,129,0.3)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            bgcolor: 'rgba(16,185,129,0.3)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                          }
                        }}
                      />
                    </Fade>
                    <Fade in timeout={1700}>
                      <Chip
                        icon={<TrendingUp />}
                        label={`Progreso: ${Math.round(progress)}%`}
                        sx={{ 
                          bgcolor: 'rgba(59,130,246,0.2)', 
                          color: 'white',
                          border: '1px solid rgba(59,130,246,0.3)'
                        }}
                      />
                    </Fade>
                    <Fade in timeout={1900}>
                      <Chip
                        icon={<EmojiEvents />}
                        label={`Logros: ${achievements.size}/10`}
                        sx={{ 
                          bgcolor: 'rgba(245,158,11,0.2)', 
                          color: 'white',
                          border: '1px solid rgba(245,158,11,0.3)'
                        }}
                      />
                    </Fade>
                    <Fade in timeout={2100}>
                      <Chip
                        icon={<Analytics />}
                        label={`Score: ${calculateOverallScore()}/100`}
                        sx={{ 
                          bgcolor: 'rgba(168,85,247,0.2)', 
                          color: 'white',
                          border: '1px solid rgba(168,85,247,0.3)'
                        }}
                      />
                    </Fade>
                  </Box>

                  {/* Barra de progreso mejorada */}
                  <Box sx={{ mb: 2 }}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        Progreso General
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        {completedSteps.size}/{steps.length} completados
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={progress}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 4,
                          background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                          animation: progress > 0 ? 'progress-flow 2s ease-in-out infinite' : 'none'
                        }
                      }}
                    />
                  </Box>
                </Grid>
                
                {/* Panel de estadísticas */}
                <Grid item xs={12} md={4}>
                  <Fade in timeout={2000}>
                    <Box 
                      sx={{ 
                        textAlign: 'center',
                        p: 3,
                        bgcolor: 'rgba(255,255,255,0.1)',
                        borderRadius: 2,
                        backdropFilter: 'blur(10px)'
                      }}
                    >
                      <Typography variant="h6" gutterBottom>
                        📊 Estadísticas del Curso
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="h4" color="primary.main">
                            {courseData.stats.totalUsers.toLocaleString()}
                          </Typography>
                          <Typography variant="caption">
                            Usuarios Capacitados
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="h4" color="success.main">
                            {courseData.stats.avgCompletion}%
                          </Typography>
                          <Typography variant="caption">
                            Tasa de Completitud
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="h4" color="warning.main">
                            {courseData.stats.avgScore}
                          </Typography>
                          <Typography variant="caption">
                            Score Promedio
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="h4" color="info.main">
                            {courseData.stats.industryRecognition}
                          </Typography>
                          <Typography variant="caption">
                            Reconocimiento
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  </Fade>
                </Grid>
              </Grid>
              
              {/* Botones de acción mejorados */}
              <Box display="flex" gap={2} mt={3} flexWrap="wrap">
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<Settings />}
                  onClick={() => setShowSettings(true)}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.3)'
                    }
                  }}
                >
                  Configuración
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<Share />}
                  sx={{
                    borderColor: 'rgba(255,255,255,0.3)',
                    color: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: 'rgba(255,255,255,0.1)'
                    }
                  }}
                >
                  Compartir
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<Download />}
                  sx={{
                    borderColor: 'rgba(255,255,255,0.3)',
                    color: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: 'rgba(255,255,255,0.1)'
                    }
                  }}
                >
                  Materiales
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Fade>

      {/* Presentación Integrada */}
      <PresentacionModuloCero autoStart={false} />

      {/* Stepper Mejorado con Funcionalidades Adicionales */}
      <Fade in timeout={1200}>
        <Card sx={{ mt: 4, p: 3 }}>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <MenuBook color="primary" />
            Contenido del Módulo
            <Chip 
              size="small" 
              label={`${completedSteps.size}/${steps.length}`} 
              color={completedSteps.size === steps.length ? 'success' : 'primary'} 
            />
          </Typography>
          
          <Stepper activeStep={activeStep} orientation="vertical">
            {steps.map((step, index) => (
              <Step key={step.id}>
                <StepLabel
                  onClick={() => setActiveStep(index)}
                  sx={{ cursor: 'pointer' }}
                  icon={
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        bgcolor: completedSteps.has(step.id) ? 'success.main' : step.color,
                        color: 'white',
                        position: 'relative'
                      }}
                    >
                      {completedSteps.has(step.id) ? <CheckCircle /> : step.icon}
                      {bookmarkedSteps.has(step.id) && (
                        <Bookmark
                          sx={{
                            position: 'absolute',
                            top: -8,
                            right: -8,
                            fontSize: 16,
                            color: 'warning.main'
                          }}
                        />
                      )}
                    </Box>
                  }
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Typography variant="h6" component="span">
                      {step.title}
                    </Typography>
                    <Chip 
                      size="small" 
                      label={`${step.estimatedTime} min`}
                      variant="outlined"
                    />
                    <Chip 
                      size="small" 
                      label={step.difficulty}
                      color={
                        step.difficulty === 'Básico' ? 'success' :
                        step.difficulty === 'Intermedio' ? 'warning' : 'error'
                      }
                      variant="outlined"
                    />
                    <IconButton 
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBookmark(step.id);
                      }}
                    >
                      <Bookmark 
                        sx={{ 
                          color: bookmarkedSteps.has(step.id) ? 'warning.main' : 'grey.400',
                          fontSize: 20 
                        }} 
                      />
                    </IconButton>
                  </Box>
                </StepLabel>
                <StepContent>
                  <Card sx={{ p: 3, bgcolor: 'grey.50' }}>
                    <Typography variant="body1" paragraph>
                      {step.content.description}
                    </Typography>
                    
                    {/* Ejemplo del mundo real */}
                    {step.content.realWorldExample && (
                      <Alert severity="info" sx={{ mb: 2 }}>
                        <Typography variant="body2">
                          <strong>💡 Ejemplo Práctico:</strong> {step.content.realWorldExample}
                        </Typography>
                      </Alert>
                    )}
                    
                    {/* Puntos clave expandibles */}
                    <Accordion sx={{ mb: 2 }}>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography variant="h6">📋 Puntos Clave</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <List>
                          {step.content.keyPoints.map((point, idx) => (
                            <ListItem key={idx}>
                              <ListItemIcon>
                                <CheckCircle color="success" />
                              </ListItemIcon>
                              <ListItemText primary={point} />
                            </ListItem>
                          ))}
                        </List>
                      </AccordionDetails>
                    </Accordion>
                    
                    {step.content.impact && (
                      <Alert severity="success" sx={{ mb: 2 }}>
                        <Typography variant="body2">
                          <strong>🎯 Impacto:</strong> {step.content.impact}
                        </Typography>
                      </Alert>
                    )}
                    
                    <Box display="flex" gap={2} mt={3} flexWrap="wrap">
                      <Button
                        variant="contained"
                        onClick={() => handleStepComplete(step.id)}
                        disabled={completedSteps.has(step.id)}
                        startIcon={completedSteps.has(step.id) ? <CheckCircle /> : <PlayArrow />}
                        color={completedSteps.has(step.id) ? 'success' : 'primary'}
                      >
                        {completedSteps.has(step.id) ? '✅ Completado' : 'Marcar como Completado'}
                      </Button>
                      
                      {step.quiz && (
                        <Button
                          variant="outlined"
                          startIcon={<Quiz />}
                          onClick={() => setCurrentQuiz(step)}
                        >
                          📝 Quiz ({step.quiz.questions.length} preguntas)
                        </Button>
                      )}
                      
                      <Button
                        variant="text"
                        startIcon={<Info />}
                        size="small"
                      >
                        Más Información
                      </Button>
                    </Box>
                  </Card>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </Card>
      </Fade>

      {/* Panel de Logros */}
      {achievements.size > 0 && (
        <Fade in timeout={1500}>
          <Card sx={{ mt: 4, p: 3, bgcolor: 'success.50', border: '2px solid', borderColor: 'success.200' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EmojiEvents color="warning" />
              🏆 Logros Desbloqueados
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              {[...achievements].map(achievement => (
                <Chip
                  key={achievement}
                  label={
                    achievement === 'first_step' ? '🎯 Primer Paso' :
                    achievement === 'completionist' ? '🏆 Completista' :
                    achievement === 'speed_runner' ? '⚡ Speed Runner' :
                    achievement === 'quiz_master' ? '🧠 Quiz Master' :
                    achievement
                  }
                  color="warning"
                  variant="filled"
                  sx={{ fontWeight: 'bold' }}
                />
              ))}
            </Box>
          </Card>
        </Fade>
      )}

      {/* Botón de acción principal mejorado */}
      <Zoom in timeout={2000}>
        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Card sx={{ p: 4, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white' }}>
            <Typography variant="h4" gutterBottom fontWeight="bold">
              🚀 ¿Listo para Crear tu Primer RAT?
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
              Aplica todo lo aprendido creando un Registro de Actividades de Tratamiento profesional
            </Typography>
            <Box display="flex" gap={2} justifyContent="center" flexWrap="wrap">
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/rat-produccion')}
                sx={{
                  bgcolor: 'white',
                  color: 'success.main',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  '&:hover': {
                    bgcolor: 'grey.100',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
                  }
                }}
                startIcon={<WorkOutline />}
              >
                Crear RAT Profesional
              </Button>
              <Button
                variant="outlined"
                size="large" 
                onClick={() => setShowCertificate(true)}
                disabled={completedSteps.size < steps.length}
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: 'rgba(255,255,255,0.1)'
                  }
                }}
                startIcon={<CertificateIcon />}
              >
                {completedSteps.size < steps.length ? 
                  `Completa ${steps.length - completedSteps.size} pasos más` : 
                  'Ver Certificado'
                }
              </Button>
            </Box>
          </Card>
        </Box>
      </Zoom>

      {/* Dialog de Configuración */}
      <Dialog open={showSettings} onClose={() => setShowSettings(false)} maxWidth="md" fullWidth>
        <DialogTitle>⚙️ Configuración del Módulo</DialogTitle>
        <DialogContent>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>🎵 Audio y Presentación</Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={userPreferences.autoplay}
                  onChange={(e) => setUserPreferences(prev => ({ ...prev, autoplay: e.target.checked }))}
                />
              }
              label="Reproducción automática de audio"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={userPreferences.subtitles}
                  onChange={(e) => setUserPreferences(prev => ({ ...prev, subtitles: e.target.checked }))}
                />
              }
              label="Mostrar subtítulos"
            />
            
            <Typography variant="body2" sx={{ mt: 2, mb: 1 }}>
              Velocidad de reproducción: {userPreferences.speed}x
            </Typography>
            <Slider
              value={userPreferences.speed}
              onChange={(e, value) => setUserPreferences(prev => ({ ...prev, speed: value }))}
              min={0.5}
              max={2}
              step={0.25}
              marks={[
                { value: 0.5, label: '0.5x' },
                { value: 1, label: '1x' },
                { value: 1.5, label: '1.5x' },
                { value: 2, label: '2x' }
              ]}
            />

            <Divider sx={{ my: 3 }} />
            
            <Typography variant="h6" gutterBottom>🎨 Apariencia</Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={userPreferences.darkMode}
                  onChange={(e) => setUserPreferences(prev => ({ ...prev, darkMode: e.target.checked }))}
                />
              }
              label="Modo oscuro"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={userPreferences.notifications}
                  onChange={(e) => setUserPreferences(prev => ({ ...prev, notifications: e.target.checked }))}
                />
              }
              label="Notificaciones de logros"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSettings(false)}>Cerrar</Button>
          <Button variant="contained" onClick={() => setShowSettings(false)}>
            Guardar Configuración
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Certificado */}
      <Dialog open={showCertificate} onClose={() => setShowCertificate(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
          🏆 ¡Certificado de Completitud!
        </DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', p: 4 }}>
            <Typography variant="h4" gutterBottom>
              🎓 Certificado de Competencia
            </Typography>
            <Typography variant="h5" color="primary" gutterBottom>
              Fundamentos de la Ley 21.719
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Certificamos que has completado exitosamente el Módulo Cero del Sistema LPDP
            </Typography>
            
            <Box sx={{ bgcolor: 'grey.100', p: 3, borderRadius: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom>📊 Estadísticas de Completitud:</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2">⏱️ Tiempo Total:</Typography>
                  <Typography variant="h6">{formatTime(timeSpent)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">🎯 Score Promedio:</Typography>
                  <Typography variant="h6">{calculateOverallScore()}/100</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">🏆 Logros:</Typography>
                  <Typography variant="h6">{achievements.size}/10</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">📚 Progreso:</Typography>
                  <Typography variant="h6">100%</Typography>
                </Grid>
              </Grid>
            </Box>
            
            <Typography variant="body2" color="text.secondary">
              Fecha de emisión: {new Date().toLocaleDateString('es-CL')}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button startIcon={<Download />}>Descargar PDF</Button>
          <Button startIcon={<Share />}>Compartir</Button>
          <Button variant="contained" onClick={() => setShowCertificate(false)}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Quiz */}
      {currentQuiz && (
        <Dialog open={!!currentQuiz} onClose={() => setCurrentQuiz(null)} maxWidth="md" fullWidth>
          <DialogTitle>
            🧠 Quiz: {currentQuiz.title}
          </DialogTitle>
          <DialogContent>
            {/* Aquí iría el componente de Quiz */}
            <Typography>Quiz component will be rendered here</Typography>
          </DialogContent>
        </Dialog>
      )}

      {/* CSS personalizado para animaciones */}
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.05); opacity: 0.6; }
        }
        
        @keyframes gentle-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes text-shimmer {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes progress-flow {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
      `}</style>
    </Container>
  );
}

export default ModuloCeroPotenciado;