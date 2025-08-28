import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  IconButton,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Chip,
  Divider,
  Alert,
  Avatar,
  LinearProgress,
  Stack,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  keyframes
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Stop,
  NavigateBefore,
  NavigateNext,
  School,
  Security,
  Assessment,
  BusinessCenter,
  Timeline,
  People,
  AttachMoney,
  Engineering,
  LocalShipping,
  Gavel,
  Computer,
  Construction,
  Lightbulb,
  RocketLaunch,
  DataObject,
  CheckCircle,
  ArrowForward,
  VolumeUp,
  VolumeOff,
  Fullscreen,
  ExpandMore,
  PlayCircleOutline,
  Movie,
  GraphicEq,
  Visibility,
  VerifiedUser,
  Warning,
  Info,
  Schedule,
  Analytics,
  TrendingUp,
  Shield,
  FlashOn,
  Stars,
  AutoAwesome,
  Insights
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

// ===== ADVANCED CSS ANIMATIONS =====
const pulseAnimation = keyframes`
  0% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(1); opacity: 0.8; }
`;

const floatAnimation = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const rotateAnimation = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const slideInLeft = keyframes`
  0% { transform: translateX(-100%); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
`;

const slideInRight = keyframes`
  0% { transform: translateX(100%); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
`;

const fadeInUp = keyframes`
  0% { transform: translateY(30px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
`;

const glowAnimation = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(0, 188, 212, 0.3); }
  50% { box-shadow: 0 0 40px rgba(0, 188, 212, 0.8); }
`;

const waveAnimation = keyframes`
  0%, 100% { transform: scaleX(1); }
  50% { transform: scaleX(1.1); }
`;

const typewriterAnimation = keyframes`
  from { width: 0; }
  to { width: 100%; }
`;

const sparkleAnimation = keyframes`
  0%, 100% { transform: scale(1) rotate(0deg); opacity: 1; }
  25% { transform: scale(1.2) rotate(90deg); opacity: 0.8; }
  50% { transform: scale(1.4) rotate(180deg); opacity: 0.6; }
  75% { transform: scale(1.2) rotate(270deg); opacity: 0.8; }
`;

const chartBarAnimation = keyframes`
  0% { transform: scaleY(0); }
  100% { transform: scaleY(1); }
`;

const progressFillAnimation = keyframes`
  0% { width: 0%; }
  100% { width: 100%; }
`;

// ===== ANIMATED COMPONENTS =====
const AnimatedCard = ({ children, delay = 0, direction = 'up' }) => {
  const animationMap = {
    up: fadeInUp,
    left: slideInLeft,
    right: slideInRight
  };

  return (
    <Box
      sx={{
        animation: `${animationMap[direction]} 0.8s ease-out ${delay}s both`,
        '&:hover': {
          transform: 'translateY(-5px)',
          transition: 'transform 0.3s ease'
        }
      }}
    >
      {children}
    </Box>
  );
};

const FloatingIcon = ({ icon, color = '#00bcd4', size = 32 }) => (
  <Box
    sx={{
      animation: `${floatAnimation} 3s ease-in-out infinite`,
      color,
      fontSize: size,
      filter: 'drop-shadow(0 4px 8px rgba(0, 188, 212, 0.3))'
    }}
  >
    {icon}
  </Box>
);

// SparkleEffect removido para evitar distracciones
const SparkleEffect = ({ count = 0 }) => null;

const AnimatedProgressBar = ({ progress, color = '#00bcd4' }) => (
  <Box
    sx={{
      width: '100%',
      height: '8px',
      bgcolor: 'rgba(255,255,255,0.2)',
      borderRadius: '4px',
      overflow: 'hidden',
      position: 'relative'
    }}
  >
    <Box
      sx={{
        height: '100%',
        bgcolor: color,
        borderRadius: '4px',
        width: `${progress}%`,
        animation: `${progressFillAnimation} 1s ease-out`,
        position: 'relative',
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
          animation: `${waveAnimation} 2s ease-in-out infinite`
        }
      }}
    />
  </Box>
);

const AnimatedChart = ({ data, height = 100 }) => (
  <Box sx={{ display: 'flex', alignItems: 'end', height, gap: 1, px: 2 }}>
    {data.map((value, index) => (
      <Box
        key={index}
        sx={{
          width: '20px',
          height: `${value}%`,
          bgcolor: `hsl(${180 + index * 30}, 70%, 60%)`,
          borderRadius: '2px 2px 0 0',
          animation: `${chartBarAnimation} 1s ease-out ${index * 0.1}s both`,
          transformOrigin: 'bottom'
        }}
      />
    ))}
  </Box>
);

const PulsatingButton = ({ children, ...props }) => (
  <Button
    {...props}
    sx={{
      ...props.sx,
      animation: `${pulseAnimation} 2s ease-in-out infinite`,
      '&:hover': {
        animation: 'none',
        transform: 'scale(1.05)'
      }
    }}
  >
    {children}
  </Button>
);

const ModuloCero = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isNarrating, setIsNarrating] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [slideProgress, setSlideProgress] = useState(0); // Progreso del slide actual
  const intervalRef = useRef(null);
  const videoRef = useRef(null);
  const speechRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const contentScrollRef = useRef(null);

  // CURSO COMPLETO MULTIMEDIA DE 7 MINUTOS
  const slides = [
    {
      id: 1,
      title: "🇨🇱 Bienvenido a la Ley 21.719",
      icon: <FloatingIcon icon={<Gavel />} color="#00bcd4" size={32} />,
      duration: 80,
      videoUrl: "/videos/intro-ley-21719.mp4",
      audioNarration: "Bienvenido al curso especializado de la Ley 21.719 de Protección de Datos Personales de Chile. En los próximos 7 minutos, aprenderás todo lo esencial para cumplir con esta nueva normativa que revolucionará la protección de datos en nuestro país.",
      content: (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <AnimatedCard delay={0.2}>
              <Box>
                <Box sx={{ position: 'relative', mb: 2 }}>
                  <Typography 
                    variant="h6" 
                    gutterBottom 
                    sx={{ 
                      fontWeight: 700, 
                      color: '#1976d2',
                      background: 'linear-gradient(45deg, #1976d2, #00bcd4)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      animation: `${glowAnimation} 3s ease-in-out infinite`
                    }}
                  >
                    Ley 21.719 - Protección de Datos Personales Chile
                  </Typography>
                  <SparkleEffect count={3} />
                </Box>
                
                <AnimatedCard delay={0.4}>
                  <Typography variant="body1" paragraph sx={{ lineHeight: 1.7, position: 'relative' }}>
                    Desde <Box component="span" sx={{ 
                      fontWeight: 'bold', 
                      color: '#f57c00',
                      animation: `${pulseAnimation} 2s ease-in-out infinite`
                    }}>marzo 2024</Box>, Chile cuenta con una nueva ley de protección de datos personales 
                    que moderniza completamente el marco regulatorio nacional, alineándolo con estándares internacionales 
                    como el RGPD europeo. Esta ley fortalece significativamente los derechos de los titulares de datos 
                    y establece obligaciones claras para las empresas.
                  </Typography>
                </AnimatedCard>
                
                <AnimatedCard delay={0.6}>
                  <Alert 
                    severity="warning" 
                    sx={{ 
                      mt: 2, 
                      mb: 2,
                      background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
                      border: '2px solid #ff9800',
                      animation: `${glowAnimation} 4s ease-in-out infinite`,
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <Box sx={{ position: 'relative', zIndex: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        <Schedule sx={{ 
                          verticalAlign: 'middle', 
                          mr: 1,
                          animation: `${rotateAnimation} 4s linear infinite`
                        }} />
                        <strong>CRÍTICO:</strong> Plazo de implementación hasta <strong>marzo 2025</strong>
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Las empresas tienen 12 meses para adaptar sus procesos y sistemas al nuevo marco legal.
                        El incumplimiento puede resultar en multas de hasta <strong>2% de ingresos anuales</strong> o <strong>15.000 UTM</strong>.
                      </Typography>
                    </Box>
                    <Box sx={{
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                      animation: `${waveAnimation} 3s ease-in-out infinite 1s`
                    }} />
                  </Alert>
                </AnimatedCard>

                <AnimatedCard delay={0.8}>
                  <Accordion sx={{ 
                    mt: 2,
                    background: 'linear-gradient(135deg, #f5f5f5 0%, #e8f5e8 100%)',
                    border: '1px solid #4caf50'
                  }}>
                    <AccordionSummary 
                      expandIcon={<ExpandMore sx={{ animation: `${rotateAnimation} 10s linear infinite` }} />}
                      sx={{
                        '&:hover': {
                          background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)'
                        }
                      }}
                    >
                      <Typography variant="body2" fontWeight={600}>
                        <FloatingIcon icon={<Info />} size={16} color="#1976d2" />
                        <Box component="span" sx={{ ml: 1 }}>Principales Cambios vs Ley Anterior</Box>
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <List dense>
                        <AnimatedCard delay={1.0}>
                          <ListItem sx={{ '&:hover': { bgcolor: 'rgba(76, 175, 80, 0.1)' } }}>
                            <ListItemIcon>
                              <VerifiedUser 
                                color="success" 
                                sx={{ animation: `${pulseAnimation} 2s ease-in-out infinite 0.5s` }}
                              />
                            </ListItemIcon>
                            <ListItemText 
                              primary="Derechos ARCOPOL ampliados" 
                              secondary="Acceso, Rectificación, Cancelación, Oposición, Portabilidad, Olvido, Limitación" 
                            />
                          </ListItem>
                        </AnimatedCard>
                        <AnimatedCard delay={1.2}>
                          <ListItem sx={{ '&:hover': { bgcolor: 'rgba(255, 152, 0, 0.1)' } }}>
                            <ListItemIcon>
                              <Warning 
                                color="warning" 
                                sx={{ animation: `${pulseAnimation} 2s ease-in-out infinite 1s` }}
                              />
                            </ListItemIcon>
                            <ListItemText 
                              primary="Sanciones significativas" 
                              secondary="Multas de hasta 2% de ingresos anuales o 15.000 UTM" 
                            />
                          </ListItem>
                        </AnimatedCard>
                        <AnimatedCard delay={1.4}>
                          <ListItem sx={{ '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.1)' } }}>
                            <ListItemIcon>
                              <Assessment 
                                color="primary" 
                                sx={{ animation: `${pulseAnimation} 2s ease-in-out infinite 1.5s` }}
                              />
                            </ListItemIcon>
                            <ListItemText 
                              primary="Obligatoriedad del RAT" 
                              secondary="Registro de Actividades de Tratamiento para demostrar cumplimiento" 
                            />
                          </ListItem>
                        </AnimatedCard>
                      </List>
                    </AccordionDetails>
                  </Accordion>
                </AnimatedCard>
              </Box>
            </AnimatedCard>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <AnimatedCard delay={1.0} direction="right">
              <Paper sx={{ 
                p: 3, 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                textAlign: 'center',
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                height: '200px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}>
                <SparkleEffect count={4} />
                <FloatingIcon icon={<Movie />} color="#fff" size={48} />
                <Typography variant="caption" display="block" gutterBottom sx={{ 
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  animation: `${fadeInUp} 1s ease-out 1.5s both`
                }}>
                  Video Explicativo 3D Disponible
                </Typography>
                <Typography variant="body2" sx={{ 
                  fontSize: '0.85rem',
                  opacity: 0.9,
                  animation: `${fadeInUp} 1s ease-out 1.7s both`
                }}>
                  Animación profesional mostrando la evolución histórica de la protección de datos en Chile
                </Typography>
                <AnimatedProgressBar progress={85} color="#00bcd4" />
                <Typography variant="caption" sx={{ mt: 1, opacity: 0.8 }}>
                  Cargando contenido multimedia...
                </Typography>
              </Paper>
            </AnimatedCard>
            
            <AnimatedCard delay={1.2}>
              <Box sx={{ mt: 2 }}>
                <Paper sx={{ 
                  p: 2, 
                  background: 'linear-gradient(135deg, #1a237e 0%, #3949ab 100%)',
                  color: 'white',
                  textAlign: 'center',
                  position: 'relative'
                }}>
                  <Analytics sx={{ fontSize: 32, mb: 1, animation: `${floatAnimation} 2s ease-in-out infinite` }} />
                  <Typography variant="caption" display="block" fontWeight={600}>
                    Análisis de Impacto
                  </Typography>
                  <AnimatedChart data={[70, 85, 60, 90, 75]} height={60} />
                  <Typography variant="caption" sx={{ opacity: 0.8, mt: 1, display: 'block' }}>
                    Empresas afectadas por sector
                  </Typography>
                </Paper>
              </Box>
            </AnimatedCard>
          </Grid>
        </Grid>
      )
    },
    {
      id: 2, 
      title: "📋 ¿Qué es el RAT?",
      icon: <FloatingIcon icon={<Assessment />} color="#ff9800" size={32} />,
      duration: 100,
      videoUrl: "/videos/que-es-rat.mp4",
      audioNarration: "El Registro de Actividades de Tratamiento, conocido como RAT, es el documento más importante que debes tener para cumplir con la Ley 21.719. Es tu herramienta principal para demostrar cumplimiento legal y gestionar eficientemente todos los datos personales de tu organización.",
      content: (
        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <AnimatedCard delay={0.2}>
              <Box>
                <Box sx={{ position: 'relative', mb: 2 }}>
                  <Typography 
                    variant="h6" 
                    gutterBottom 
                    sx={{ 
                      fontWeight: 700,
                      background: 'linear-gradient(45deg, #f57c00, #ff9800)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      animation: `${pulseAnimation} 2s ease-in-out infinite`
                    }}
                  >
                    Registro de Actividades de Tratamiento (RAT)
                  </Typography>
                  <SparkleEffect count={3} />
                </Box>
                
                <AnimatedCard delay={0.4}>
                  <Typography variant="body1" paragraph sx={{ lineHeight: 1.7, position: 'relative' }}>
                    El RAT es el <Box component="span" sx={{ 
                      fontWeight: 'bold', 
                      color: '#f57c00',
                      background: 'linear-gradient(45deg, #f57c00, #ff9800)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      animation: `${glowAnimation} 3s ease-in-out infinite`
                    }}>documento central</Box> que debe mantener toda empresa que procese datos personales. 
                    Funciona como un "inventario inteligente" que mapea todas las actividades de tratamiento de datos 
                    en tu organización, desde la recolección hasta la eliminación.
                  </Typography>
                </AnimatedCard>

                <AnimatedCard delay={0.6}>
                  <Alert 
                    severity="error" 
                    sx={{ 
                      mt: 2, 
                      mb: 3,
                      background: 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)',
                      border: '2px solid #f44336',
                      animation: `${pulseAnimation} 3s ease-in-out infinite`,
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <Box sx={{ position: 'relative', zIndex: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        <Warning sx={{ 
                          verticalAlign: 'middle', 
                          mr: 1,
                          animation: `${rotateAnimation} 2s linear infinite`
                        }} />
                        <strong>OBLIGATORIO por Ley:</strong> Art. 12 Ley 21.719
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        No es opcional. Toda empresa debe tener su RAT actualizado y disponible 
                        para demostrar cumplimiento ante la autoridad fiscalizadora.
                      </Typography>
                    </Box>
                  </Alert>
                </AnimatedCard>

                <AnimatedCard delay={0.8}>
                  <Typography 
                    variant="body2" 
                    fontWeight={600} 
                    gutterBottom 
                    sx={{ 
                      color: 'primary.main',
                      animation: `${fadeInUp} 1s ease-out`
                    }}
                  >
                    📝 Componentes Obligatorios del RAT:
                  </Typography>
                  
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={6}>
                      <AnimatedCard delay={1.0}>
                        <Paper sx={{ 
                          p: 2, 
                          background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                          border: '1px solid #2196f3'
                        }}>
                          <Stack spacing={1}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <FloatingIcon icon={<BusinessCenter />} size={20} color="#1976d2" />
                              <Typography variant="body2" sx={{ ml: 1, fontWeight: 'bold' }}>Responsable:</Typography>
                              <Typography variant="body2" sx={{ ml: 1 }}>Quién procesa los datos</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <FloatingIcon icon={<Analytics />} size={20} color="#1976d2" />
                              <Typography variant="body2" sx={{ ml: 1, fontWeight: 'bold' }}>Categorías:</Typography>
                              <Typography variant="body2" sx={{ ml: 1 }}>Qué tipos de datos manejas</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <FloatingIcon icon={<TrendingUp />} size={20} color="#1976d2" />
                              <Typography variant="body2" sx={{ ml: 1, fontWeight: 'bold' }}>Finalidades:</Typography>
                              <Typography variant="body2" sx={{ ml: 1 }}>Para qué los usas</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <FloatingIcon icon={<People />} size={20} color="#1976d2" />
                              <Typography variant="body2" sx={{ ml: 1, fontWeight: 'bold' }}>Titulares:</Typography>
                              <Typography variant="body2" sx={{ ml: 1 }}>De quién son los datos</Typography>
                            </Box>
                          </Stack>
                        </Paper>
                      </AnimatedCard>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <AnimatedCard delay={1.2}>
                        <Paper sx={{ 
                          p: 2, 
                          background: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
                          border: '1px solid #9c27b0'
                        }}>
                          <Stack spacing={1}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <FloatingIcon icon={<DataObject />} size={20} color="#7b1fa2" />
                              <Typography variant="body2" sx={{ ml: 1, fontWeight: 'bold' }}>Destinatarios:</Typography>
                              <Typography variant="body2" sx={{ ml: 1 }}>Con quién los compartes</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <FloatingIcon icon={<FlashOn />} size={20} color="#7b1fa2" />
                              <Typography variant="body2" sx={{ ml: 1, fontWeight: 'bold' }}>Transferencias:</Typography>
                              <Typography variant="body2" sx={{ ml: 1 }}>Envíos internacionales</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <FloatingIcon icon={<Schedule />} size={20} color="#7b1fa2" />
                              <Typography variant="body2" sx={{ ml: 1, fontWeight: 'bold' }}>Retención:</Typography>
                              <Typography variant="body2" sx={{ ml: 1 }}>Cuánto tiempo los guardas</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <FloatingIcon icon={<Shield />} size={20} color="#7b1fa2" />
                              <Typography variant="body2" sx={{ ml: 1, fontWeight: 'bold' }}>Seguridad:</Typography>
                              <Typography variant="body2" sx={{ ml: 1 }}>Cómo los proteges</Typography>
                            </Box>
                          </Stack>
                        </Paper>
                      </AnimatedCard>
                    </Grid>
                  </Grid>
                </AnimatedCard>

                <AnimatedCard delay={1.4}>
                  <Box sx={{ 
                    mt: 3, 
                    p: 3, 
                    background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)', 
                    borderRadius: 3, 
                    border: '2px solid #4caf50',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <SparkleEffect count={2} />
                    <Typography variant="body2" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                      <CheckCircle sx={{ 
                        mr: 1, 
                        color: '#4caf50',
                        animation: `${pulseAnimation} 2s ease-in-out infinite`
                      }} />
                      Beneficios del RAT Completo:
                    </Typography>
                    <Grid container spacing={1}>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Shield sx={{ color: '#4caf50', mr: 1, fontSize: 16 }} />
                          <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>
                            <strong>Protección legal:</strong> Demuestra cumplimiento normativo
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Insights sx={{ color: '#4caf50', mr: 1, fontSize: 16 }} />
                          <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>
                            <strong>Gestión eficiente:</strong> Visibilidad total de tus datos
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <FlashOn sx={{ color: '#4caf50', mr: 1, fontSize: 16 }} />
                          <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>
                            <strong>Respuesta rápida:</strong> Atiende derechos ARCOPOL fácilmente
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <AutoAwesome sx={{ color: '#4caf50', mr: 1, fontSize: 16 }} />
                          <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>
                            <strong>Confianza:</strong> Transmite seriedad a clientes y autoridades
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                </AnimatedCard>
              </Box>
            </AnimatedCard>
          </Grid>
          
          <Grid item xs={12} md={5}>
            <Stack spacing={2}>
              <AnimatedCard delay={1.6} direction="right">
                <Paper sx={{ 
                  p: 3, 
                  background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)', 
                  textAlign: 'center',
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden',
                  minHeight: '150px'
                }}>
                  <SparkleEffect count={3} />
                  <GraphicEq sx={{ 
                    fontSize: 48, 
                    mb: 2,
                    animation: `${floatAnimation} 2s ease-in-out infinite`
                  }} />
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Visualización Interactiva
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>
                    Diagrama animado del flujo completo de datos en una empresa típica
                  </Typography>
                  <AnimatedChart data={[60, 75, 85, 70, 90, 65, 80]} height={50} />
                  <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', mt: 1 }}>
                    Flujos de datos en tiempo real
                  </Typography>
                </Paper>
              </AnimatedCard>
              
              <AnimatedCard delay={1.8} direction="right">
                <Paper sx={{ 
                  p: 3, 
                  background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)', 
                  textAlign: 'center',
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <Visibility sx={{ 
                    fontSize: 48, 
                    mb: 2,
                    animation: `${pulseAnimation} 2s ease-in-out infinite`
                  }} />
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Demo Profesional en Vivo
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>
                    Ejemplo real de RAT completado para empresa de e-commerce
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 2 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#00bcd4' }}>15</Typography>
                      <Typography variant="caption">Actividades</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#4caf50' }}>8</Typography>
                      <Typography variant="caption">Áreas</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#ff9800' }}>95%</Typography>
                      <Typography variant="caption">Completado</Typography>
                    </Box>
                  </Box>
                  
                  <AnimatedProgressBar progress={95} color="#00bcd4" />
                </Paper>
              </AnimatedCard>
              
              <AnimatedCard delay={2.0} direction="right">
                <Paper sx={{ 
                  p: 2, 
                  background: 'linear-gradient(135deg, #7b1fa2 0%, #6a1b9a 100%)',
                  color: 'white',
                  textAlign: 'center'
                }}>
                  <AutoAwesome sx={{ fontSize: 32, mb: 1, animation: `${sparkleAnimation} 3s ease-in-out infinite` }} />
                  <Typography variant="caption" display="block" fontWeight={600}>
                    Tecnología Avanzada
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.8rem', opacity: 0.9 }}>
                    IA para clasificación automática de datos
                  </Typography>
                </Paper>
              </AnimatedCard>
            </Stack>
          </Grid>
        </Grid>
      )
    },
    {
      id: 3,
      title: "🎯 ¿Por qué es obligatorio?",
      icon: <Security sx={{ fontSize: 48, color: '#f44336' }} />,
      duration: 75,
      content: (
        <Box>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
            Obligaciones Legales - Art. 12 Ley 21.719
          </Typography>
          <Typography variant="body1" paragraph>
            El RAT es <strong>obligatorio</strong> para demostrar cumplimiento ante la autoridad.
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>⚠️ Sin RAT:</strong> Multas de hasta 2% de los ingresos anuales o 15.000 UTM
            </Typography>
          </Alert>
          <Alert severity="success" sx={{ mt: 1 }}>
            <Typography variant="body2">
              <strong>✅ Con RAT:</strong> Cumplimiento legal y protección de tu empresa
            </Typography>
          </Alert>
        </Box>
      )
    },
    {
      id: 4,
      title: "🏭 RAT por Industria",
      icon: <BusinessCenter sx={{ fontSize: 48, color: '#4caf50' }} />,
      duration: 90,
      content: (
        <Box>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
            Cada industria tiene procesos únicos
          </Typography>
          <Typography variant="body1" paragraph>
            No es lo mismo una empresa de salud que una constructora. 
            Cada sector maneja datos diferentes.
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 2 }}>
            <Chip icon={<LocalShipping />} label="Logística" color="primary" variant="outlined" />
            <Chip icon={<Engineering />} label="Construcción" color="primary" variant="outlined" />
            <Chip icon={<AttachMoney />} label="Financiero" color="primary" variant="outlined" />
            <Chip icon={<People />} label="Salud" color="primary" variant="outlined" />
            <Chip icon={<School />} label="Educación" color="primary" variant="outlined" />
          </Stack>
        </Box>
      )
    },
    {
      id: 5,
      title: "⚙️ RAT Producción",
      icon: <RocketLaunch sx={{ fontSize: 48, color: '#9c27b0' }} />,
      duration: 105,
      content: (
        <Box>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
            Sistema Automatizado RAT Producción
          </Typography>
          <Typography variant="body1" paragraph>
            Nuestra herramienta principal genera RATs completos específicos para tu industria 
            en minutos, no en semanas.
          </Typography>
          <Stack spacing={1}>
            <Typography variant="body2">🎯 Templates específicos por industria</Typography>
            <Typography variant="body2">📝 Formularios inteligentes paso a paso</Typography>
            <Typography variant="body2">📊 Exportación automática (PDF, Excel, JSON)</Typography>
            <Typography variant="body2">🔒 Sistema de estados y protección</Typography>
            <Typography variant="body2">🏆 Certificación automática</Typography>
          </Stack>
        </Box>
      )
    },
    {
      id: 6,
      title: "🎓 ¡Capacitación Completada!",
      icon: <CheckCircle sx={{ fontSize: 48, color: '#4caf50' }} />,
      duration: 60,
      content: (
        <Box textAlign="center">
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#4caf50' }}>
            🎉 ¡Felicitaciones!
          </Typography>
          <Typography variant="body1" paragraph>
            Has completado la capacitación básica en Ley 21.719. 
            Ahora estás listo para generar tu primer RAT profesional.
          </Typography>
          <Alert severity="success" sx={{ mt: 3, mb: 3 }}>
            <Typography variant="body2">
              <strong>✅ Capacitación completada en 7 minutos</strong><br/>
              Ahora puedes usar RAT Producción para generar RATs completos por industria
            </Typography>
          </Alert>
        </Box>
      )
    }
  ];

  const totalDuration = slides.reduce((sum, slide) => sum + slide.duration, 0);

  // DESHABILITADO - Inicializar Web Speech API con mejor compatibilidad
  /*useEffect(() => {
    if ('speechSynthesis' in window) {
      setSpeechSupported(true);
      console.log('✅ Web Speech API disponible');
      
      // Cargar voces disponibles (necesario en algunos navegadores)
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        console.log('🎵 Voces disponibles:', voices.length);
        voices.forEach(voice => {
          if (voice.lang.startsWith('es')) {
            console.log(`  - ${voice.name} (${voice.lang})`);
          }
        });
      };
      
      loadVoices();
      
      // Algunos navegadores necesitan este evento para cargar voces
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
      
    } else {
      console.log('❌ Web Speech API no soportada en este navegador');
      setSpeechSupported(false);
    }
  }, []); */

  // Función para reproducir narración
  const playNarration = (text) => {
    if (!speechSupported || !audioEnabled || !text) return;

    // Detener narración actual si existe
    if (speechRef.current) {
      window.speechSynthesis.cancel();
    }

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Configurar la voz más natural en español
      const voices = window.speechSynthesis.getVoices();
      
      // Buscar las mejores voces disponibles (preferencia: femeninas y naturales)
      const preferredVoices = [
        'Microsoft Sabina - Spanish (Mexico)',
        'Microsoft Helena - Spanish (Spain)', 
        'Google español',
        'es-ES',
        'es-MX',
        'es-AR'
      ];
      
      let selectedVoice = null;
      
      // Intentar encontrar una voz preferida
      for (const preferred of preferredVoices) {
        selectedVoice = voices.find(voice => 
          voice.name.includes(preferred) || 
          voice.lang.includes(preferred) ||
          voice.lang.startsWith('es')
        );
        if (selectedVoice) break;
      }
      
      // Si no encuentra ninguna, usar cualquier voz en español
      if (!selectedVoice) {
        selectedVoice = voices.find(voice => 
          voice.lang.includes('es') || 
          voice.name.toLowerCase().includes('spanish') || 
          voice.name.toLowerCase().includes('español')
        );
      }
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
        console.log('🎤 Voz seleccionada:', selectedVoice.name, selectedVoice.lang);
      }
      
      utterance.lang = 'es-CL'; // Español de Chile
      utterance.rate = 0.8; // Velocidad más pausada y natural
      utterance.pitch = 1.0; // Tono neutro más humano
      utterance.volume = 0.95; // Volumen alto pero no saturado

      utterance.onstart = () => {
        setIsNarrating(true);
        console.log('🎧 Iniciando narración:', text.substring(0, 50) + '...');
      };

      utterance.onend = () => {
        setIsNarrating(false);
        console.log('🎧 Narración completada');
      };

      utterance.onerror = (event) => {
        setIsNarrating(false);
        console.error('❌ Error en narración:', event.error);
      };

      speechRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('❌ Error al reproducir narración:', error);
      setIsNarrating(false);
    }
  };

  // Función para detener narración
  const stopNarration = () => {
    if (speechRef.current) {
      window.speechSynthesis.cancel();
      setIsNarrating(false);
    }
  };

  // AUTO-SCROLL DESHABILITADO TEMPORALMENTE - MODO MANUAL
  /*useEffect(() => {
    // LIMPIAR TODO INMEDIATAMENTE
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
      intervalRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    
    // PARAR TODA NARRACIÓN INMEDIATAMENTE
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    // MODO MANUAL - NO AUTO-SCROLL, NO AUTO-PLAY
    if (isPlaying && !isCompleted) {
      console.log(`📄 Slide ${currentSlide + 1} - MODO MANUAL`);
      setSlideProgress(0);
      
      // Solo scroll al inicio, nada más
      if (contentScrollRef.current) {
        contentScrollRef.current.scrollTop = 0;
      }
      
      // NO MÁS AUTO-PLAY, NO MÁS NARRACIÓN AUTOMÁTICA
      // El usuario controlará todo manualmente
    }

    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, [currentSlide]); // Solo cuando cambie el slide manualmente */

  // DESHABILITADO - Calcular progreso
  /*useEffect(() => {
    const completedSlides = currentSlide + 1; // +1 porque el slide actual también cuenta
    const progressPercent = (completedSlides / slides.length) * 100;
    setProgress(progressPercent);
  }, [currentSlide]); */

  const handlePlay = () => {
    console.log('🎬 INICIANDO CURSO AUTOMÁTICO');
    console.log(`📊 Total slides: ${slides.length}`);
    console.log(`⏱️ Duración total estimada: ${Math.round(slides.reduce((sum, slide) => sum + slide.duration, 0) / 60)} minutos`);
    setIsPlaying(true);
  };

  const handlePause = () => {
    console.log('⏸️ Pausando curso...');
    setIsPlaying(false);
    stopNarration(); // Detener narración al pausar
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
  };

  const handleStop = () => {
    console.log('🛑 REINICIANDO CURSO COMPLETO');
    
    setIsPlaying(false);
    setCurrentSlide(0);
    setProgress(0);
    setSlideProgress(0);
    setIsCompleted(false);
    
    stopNarration(); // Detener narración al detener
    
    // Limpiar todos los intervalos
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    
    // Resetear scroll del contenido
    if (contentScrollRef.current) {
      contentScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      console.log('📜 Scroll reseteado al inicio');
    }
    
    console.log('✅ Sistema completamente reiniciado');
  };

  // Función para reproducir narración manualmente
  const handlePlayNarration = () => {
    const currentSlideData = slides[currentSlide];
    if (currentSlideData.audioNarration) {
      playNarration(currentSlideData.audioNarration);
    }
  };

  // Función para alternar audio
  const handleToggleAudio = () => {
    if (audioEnabled && isNarrating) {
      stopNarration();
    }
    setAudioEnabled(!audioEnabled);
    console.log(audioEnabled ? '🔇 Audio deshabilitado' : '🔊 Audio habilitado');
  };

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
      setSlideProgress(0); // Resetear progreso del nuevo slide
      
      // Resetear scroll al inicio del nuevo slide
      if (contentScrollRef.current) {
        contentScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
      setSlideProgress(0); // Resetear progreso del nuevo slide
      
      // Resetear scroll al inicio del nuevo slide
      if (contentScrollRef.current) {
        contentScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleGoToRATProduccion = () => {
    navigate('/rat-produccion');
  };

  const currentSlideData = slides[currentSlide];

  // Verificar si el curso está 100% completado
  const isCourseFullyCompleted = (isCompleted || currentSlide === slides.length - 1) && Math.round(progress) === 100;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Si el curso está 100% completado, mostrar solo el botón sobrio */}
      {isCourseFullyCompleted ? (
        <Box 
          display="flex" 
          flexDirection="column" 
          alignItems="center" 
          justifyContent="center" 
          minHeight="60vh"
          sx={{ textAlign: 'center' }}
        >
          <CheckCircle 
            sx={{ 
              fontSize: '4rem', 
              color: '#4caf50', 
              mb: 3,
              filter: 'drop-shadow(0 4px 8px rgba(76, 175, 80, 0.3))'
            }} 
          />
          
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 600, 
              color: '#2c3e50', 
              mb: 2,
              letterSpacing: '-0.5px'
            }}
          >
            Capacitación Completada
          </Typography>
          
          <Typography 
            variant="body1" 
            sx={{ 
              color: '#546e7a', 
              mb: 4, 
              maxWidth: '400px',
              lineHeight: 1.6
            }}
          >
            Has completado exitosamente los fundamentos de la Ley 21.719. 
            Ahora puedes generar tu primer RAT profesional.
          </Typography>

          <Button
            variant="contained"
            size="large"
            endIcon={<ArrowForward />}
            onClick={handleGoToRATProduccion}
            sx={{
              bgcolor: '#37474f',
              color: '#fff',
              fontWeight: 600,
              fontSize: '1rem',
              px: 4,
              py: 1.5,
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(55, 71, 79, 0.3)',
              textTransform: 'none',
              '&:hover': {
                bgcolor: '#455a64',
                transform: 'translateY(-1px)',
                boxShadow: '0 6px 16px rgba(55, 71, 79, 0.4)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            Ir a RAT Producción
          </Button>
        </Box>
      ) : (
        <>
          {/* Contenido normal del curso cuando no está completado */}
          {/* Header Compacto */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 2,
              mb: 3
            }}
          >
            <Grid container alignItems="center" spacing={2}>
              <Grid item>
                <Avatar
                  sx={{
                    bgcolor: '#00bcd4',
                    width: 56,
                    height: 56
                  }}
                >
                  <School sx={{ fontSize: '1.8rem' }} />
                </Avatar>
              </Grid>
              <Grid item xs>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#fff' }}>
                  📚 MÓDULO CERO - Ley 21.719
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  Curso Multimedia Interactivo • 7 minutos
                </Typography>
              </Grid>
              <Grid item>
                <Stack direction="row" spacing={1}>
                  <IconButton 
                    size="small" 
                    onClick={handleToggleAudio}
                    sx={{ 
                      color: '#fff', 
                      bgcolor: audioEnabled ? 'rgba(76, 175, 80, 0.3)' : 'rgba(255,255,255,0.1)',
                      '&:hover': {
                        bgcolor: audioEnabled ? 'rgba(76, 175, 80, 0.5)' : 'rgba(255,255,255,0.2)'
                      }
                    }}
                    title={audioEnabled ? 'Deshabilitar audio' : 'Habilitar audio'}
                  >
                    {audioEnabled ? <VolumeUp /> : <VolumeOff />}
                  </IconButton>
                  {speechSupported && (
                    <Chip 
                      size="small" 
                      label={isNarrating ? '🎧 Narrando...' : '🎧 Audio'}
                      sx={{ 
                        color: '#fff',
                        bgcolor: isNarrating ? 'rgba(255, 193, 7, 0.3)' : 'rgba(255,255,255,0.1)',
                        fontSize: '0.7rem'
                      }}
                    />
                  )}
                </Stack>
              </Grid>
            </Grid>

            {/* Progreso Compacto */}
            <Box sx={{ mt: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="body2" sx={{ color: '#fff', fontSize: '0.85rem' }}>
                  {Math.round(progress)}% • Slide {currentSlide + 1}/{slides.length}
                </Typography>
                <Typography variant="body2" sx={{ color: '#00bcd4', fontSize: '0.85rem' }}>
                  {currentSlideData?.audioNarration ? '🎧 Audio disponible' : '📖 Solo texto'}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  bgcolor: 'rgba(255,255,255,0.1)',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: '#00bcd4',
                    borderRadius: 3,
                  }
                }}
              />
            </Box>
          </Paper>

          {/* Área Principal de Contenido Multimedia */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {/* Video/Animación Panel - Más estrecho */}
            <Grid item xs={12} md={4}>
              <Card sx={{ 
                height: '380px', 
                position: 'relative', 
                overflow: 'hidden',
                animation: `${glowAnimation} 4s ease-in-out infinite`
              }}>
                <Box
                  sx={{
                    height: '100%',
                    background: 'linear-gradient(45deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    textAlign: 'center',
                    p: 2,
                    position: 'relative'
                  }}
                >
                  <SparkleEffect count={6} />
                  
                  {/* Animated Background Pattern */}
                  <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    opacity: 0.1,
                    background: 'radial-gradient(circle at 50% 50%, transparent 40%, rgba(255,255,255,0.1) 41%, rgba(255,255,255,0.1) 59%, transparent 60%)',
                    animation: `${rotateAnimation} 20s linear infinite`
                  }} />
                  
                  {currentSlideData.videoUrl ? (
                    <>
                      <FloatingIcon 
                        icon={<Movie />} 
                        color="#fff" 
                        size={64} 
                      />
                      <Typography variant="h6" sx={{ 
                        mb: 2, 
                        fontWeight: 600,
                        animation: `${fadeInUp} 1s ease-out 0.5s both`
                      }}>
                        Video Animado 3D Profesional
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        mb: 3, 
                        opacity: 0.9,
                        animation: `${fadeInUp} 1s ease-out 0.7s both`
                      }}>
                        {currentSlideData.title}
                      </Typography>
                      
                      <Box sx={{ 
                        width: '100%', 
                        height: '200px', 
                        background: 'linear-gradient(135deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 100%)', 
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2,
                        border: '2px solid rgba(255,255,255,0.3)',
                        position: 'relative',
                        overflow: 'hidden',
                        animation: `${pulseAnimation} 3s ease-in-out infinite`
                      }}>
                        {/* Animated Play Button */}
                        <PlayCircleOutline sx={{ 
                          fontSize: '4rem',
                          animation: `${pulseAnimation} 2s ease-in-out infinite`,
                          filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))'
                        }} />
                        
                        {/* Loading Animation */}
                        <Box sx={{
                          position: 'absolute',
                          bottom: 10,
                          left: 10,
                          right: 10,
                          height: '4px',
                          bgcolor: 'rgba(255,255,255,0.2)',
                          borderRadius: '2px',
                          overflow: 'hidden'
                        }}>
                          <Box sx={{
                            height: '100%',
                            width: '70%',
                            bgcolor: '#00bcd4',
                            borderRadius: '2px',
                            animation: `${progressFillAnimation} 3s ease-in-out infinite`
                          }} />
                        </Box>
                        
                        {/* Equalizer Bars */}
                        <Box sx={{
                          position: 'absolute',
                          top: 10,
                          right: 10,
                          display: 'flex',
                          gap: 1,
                          alignItems: 'end'
                        }}>
                          {[...Array(4)].map((_, i) => (
                            <Box
                              key={i}
                              sx={{
                                width: '3px',
                                height: `${15 + Math.random() * 20}px`,
                                bgcolor: '#00bcd4',
                                borderRadius: '2px',
                                animation: `${chartBarAnimation} 0.5s ease-out infinite alternate ${i * 0.1}s`
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                      
                      <Typography variant="caption" sx={{ 
                        opacity: 0.8,
                        animation: `${fadeInUp} 1s ease-out 1s both`
                      }}>
                        🎬 Contenido multimedia profesional con narración en vivo
                      </Typography>
                    </>
                  ) : (
                    <>
                      <Box sx={{ position: 'relative', mb: 2 }}>
                        {currentSlideData.icon}
                        <Box sx={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: '80px',
                          height: '80px',
                          border: '2px solid rgba(255,255,255,0.3)',
                          borderRadius: '50%',
                          animation: `${pulseAnimation} 2s ease-in-out infinite`
                        }} />
                      </Box>
                      
                      <Typography variant="h6" sx={{ 
                        mt: 2, 
                        fontWeight: 600,
                        animation: `${fadeInUp} 1s ease-out 0.3s both`
                      }}>
                        Contenido Visual Interactivo
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        mt: 1, 
                        opacity: 0.9,
                        animation: `${fadeInUp} 1s ease-out 0.5s both`
                      }}>
                        Ilustraciones profesionales y diagramas animados
                      </Typography>
                      
                      {/* Interactive Elements */}
                      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
                        <Box sx={{
                          width: 40,
                          height: 40,
                          bgcolor: 'rgba(255,255,255,0.2)',
                          borderRadius: '50%',
                          animation: `${floatAnimation} 2s ease-in-out infinite 0s`
                        }} />
                        <Box sx={{
                          width: 40,
                          height: 40,
                          bgcolor: 'rgba(255,255,255,0.2)',
                          borderRadius: '50%',
                          animation: `${floatAnimation} 2s ease-in-out infinite 0.3s`
                        }} />
                        <Box sx={{
                          width: 40,
                          height: 40,
                          bgcolor: 'rgba(255,255,255,0.2)',
                          borderRadius: '50%',
                          animation: `${floatAnimation} 2s ease-in-out infinite 0.6s`
                        }} />
                      </Box>
                    </>
                  )}
                </Box>
                
                {/* Controles de Video Funcionales */}
                <Box sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  bgcolor: 'rgba(0,0,0,0.9)',
                  p: 1,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <IconButton 
                    size="small" 
                    sx={{ color: 'white' }}
                    onClick={currentSlideData?.audioNarration ? handlePlayNarration : undefined}
                    disabled={!currentSlideData?.audioNarration || isNarrating}
                    title="Reproducir narración"
                  >
                    <PlayArrow />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    sx={{ color: 'white' }}
                    onClick={stopNarration}
                    disabled={!isNarrating}
                    title="Detener narración"
                  >
                    <Pause />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    sx={{ color: audioEnabled ? '#4caf50' : 'white' }}
                    onClick={handleToggleAudio}
                    title={audioEnabled ? 'Silenciar' : 'Activar audio'}
                  >
                    {audioEnabled ? <VolumeUp /> : <VolumeOff />}
                  </IconButton>
                  {isNarrating && (
                    <Box sx={{ ml: 1, display: 'flex', alignItems: 'center' }}>
                      <GraphicEq sx={{ fontSize: 16, color: '#4caf50', animation: 'pulse 1s infinite' }} />
                      <Typography variant="caption" sx={{ color: 'white', ml: 0.5 }}>
                        Reproduciendo...
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Card>
            </Grid>

            {/* Contenido del Slide - Más amplio */}
            <Grid item xs={12} md={8}>
              <Card sx={{ 
                height: '400px', 
                overflow: 'hidden', 
                position: 'relative',
                border: '2px solid #00bcd4',
                borderRadius: 3
              }}>
                {/* Indicador de progreso del slide */}
                {isPlaying && (
                  <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: `${slideProgress}%`,
                    height: '4px',
                    bgcolor: '#00bcd4',
                    zIndex: 10,
                    transition: 'width 0.2s ease-out',
                    boxShadow: '0 0 10px rgba(0, 188, 212, 0.6)'
                  }} />
                )}
                <CardContent 
                  ref={contentScrollRef}
                  sx={{ 
                    p: 3, 
                    height: '100%', 
                    overflow: 'auto',
                    scrollBehavior: 'smooth',
                    '&::-webkit-scrollbar': {
                      width: '8px'
                    },
                    '&::-webkit-scrollbar-thumb': {
                      bgcolor: '#00bcd4',
                      borderRadius: '4px',
                      '&:hover': {
                        bgcolor: '#0097a7'
                      }
                    },
                    '&::-webkit-scrollbar-track': {
                      bgcolor: 'rgba(0,0,0,0.1)',
                      borderRadius: '4px'
                    }
                  }}
                >
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    {currentSlideData.icon}
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {currentSlideData.title}
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  
                  {/* Audio Narration Indicator */}
                  {currentSlideData.audioNarration && (
                    <Alert 
                      severity={isNarrating ? "success" : "info"} 
                      sx={{ mb: 2, p: 1.5 }}
                      action={
                        <Stack direction="row" spacing={1}>
                          <IconButton
                            size="small"
                            onClick={handlePlayNarration}
                            disabled={isNarrating}
                            sx={{ color: isNarrating ? '#4caf50' : 'primary.main' }}
                          >
                            <PlayCircleOutline />
                          </IconButton>
                          {isNarrating && (
                            <IconButton
                              size="small"
                              onClick={stopNarration}
                              sx={{ color: '#f44336' }}
                            >
                              <Pause />
                            </IconButton>
                          )}
                        </Stack>
                      }
                    >
                      <Box display="flex" alignItems="center" gap={1}>
                        <GraphicEq 
                          sx={{ 
                            fontSize: 16, 
                            color: isNarrating ? '#4caf50' : 'primary.main',
                            animation: isNarrating ? 'pulse 1s infinite' : 'none'
                          }} 
                        />
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          {isNarrating 
                            ? '🎧 REPRODUCIENDO NARRACIÓN...' 
                            : '🎧 NARRACIÓN DISPONIBLE - Haz clic ▶️ para escuchar'
                          }
                        </Typography>
                      </Box>
                      {speechSupported && (
                        <Typography variant="caption" sx={{ display: 'block', mt: 0.5, opacity: 0.8 }}>
                          "{currentSlideData.audioNarration.substring(0, 120)}..."
                        </Typography>
                      )}
                    </Alert>
                  )}
                  
                  {/* Mensaje si no hay soporte de speech */}
                  {!speechSupported && (
                    <Alert severity="warning" sx={{ mb: 2, p: 1 }}>
                      <Typography variant="caption">
                        ⚠️ Tu navegador no soporta narración de voz. Usa Chrome o Firefox para la mejor experiencia.
                      </Typography>
                    </Alert>
                  )}
                  
                  {currentSlideData.content}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Controles Compactos Profesionales */}
          <Paper sx={{ p: 2, mb: 3, bgcolor: 'action.hover' }}>
            <Grid container alignItems="center" spacing={2}>
              {/* Controles de Reproducción */}
              <Grid item xs={12} md={6}>
                <Box display="flex" alignItems="center" gap={1}>
                  {!isPlaying ? (
                    <Button
                      variant="contained"
                      size="medium"
                      startIcon={<PlayArrow />}
                      onClick={handlePlay}
                      sx={{ 
                        bgcolor: '#4caf50',
                        minWidth: '160px',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        py: 1.2,
                        '&:hover': {
                          bgcolor: '#388e3c',
                          transform: 'scale(1.05)'
                        }
                      }}
                    >
                      ▶️ Reproducir Automático
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      size="medium"
                      startIcon={<Pause />}
                      onClick={handlePause}
                      sx={{ 
                        bgcolor: '#ff9800',
                        minWidth: '160px',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        py: 1.2,
                        '&:hover': {
                          bgcolor: '#f57c00',
                          transform: 'scale(1.05)'
                        }
                      }}
                    >
                      ⏸️ Pausar Reproducción
                    </Button>
                  )}
                  <Button
                    variant="outlined"
                    size="medium"
                    startIcon={<Stop />}
                    onClick={handleStop}
                    sx={{ 
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      py: 1.2,
                      borderColor: '#f44336',
                      color: '#f44336',
                      '&:hover': {
                        borderColor: '#d32f2f',
                        color: '#d32f2f',
                        bgcolor: 'rgba(244, 67, 54, 0.1)',
                        transform: 'scale(1.05)'
                      }
                    }}
                  >
                    🔄 Reiniciar
                  </Button>
                </Box>
              </Grid>

              {/* Navegación y Tiempo */}
              <Grid item xs={12} md={6}>
                <Box display="flex" justifyContent="flex-end" alignItems="center" gap={1}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mr: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      ⏱️ {Math.round((currentSlideData?.duration || 60) / 60 * 100) / 100} min
                    </Typography>
                    {isPlaying && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ 
                          width: 8, 
                          height: 8, 
                          bgcolor: '#4caf50', 
                          borderRadius: '50%',
                          animation: `${pulseAnimation} 1s ease-in-out infinite`
                        }} />
                        <Typography variant="caption" sx={{ color: '#4caf50', fontWeight: 600 }}>
                          MODO AUTO
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  <IconButton
                    size="small"
                    onClick={handlePrev}
                    disabled={currentSlide === 0}
                    sx={{ bgcolor: 'rgba(0,0,0,0.05)' }}
                  >
                    <NavigateBefore />
                  </IconButton>
                  <Chip 
                    label={`${currentSlide + 1}/${slides.length}`}
                    size="small"
                    color="primary"
                  />
                  <IconButton
                    size="small"
                    onClick={handleNext}
                    disabled={currentSlide === slides.length - 1}
                    sx={{ bgcolor: 'rgba(0,0,0,0.05)' }}
                  >
                    <NavigateNext />
                  </IconButton>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Stepper Compacto */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Stepper activeStep={currentSlide} alternativeLabel sx={{ '& .MuiStepLabel-root': { padding: '0 8px' } }}>
              {slides.map((slide, index) => (
                <Step key={slide.id} completed={index < currentSlide}>
                  <StepLabel>
                    <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 500 }}>
                      {slide.title.replace(/[📋🎯🏭⚙️🎓🇨🇱]/g, '').trim().substring(0, 15)}
                    </Typography>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
            
            {/* Indicador de tiempo total */}
            <Box sx={{ mt: 1, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                Duración total: 7 minutos • Slide actual: {currentSlideData?.duration}s
              </Typography>
            </Box>
          </Paper>

          {/* Botón Final - RAT Producción (solo visible cuando está en el último slide pero no completado) */}
          {(isCompleted || currentSlide === slides.length - 1) && !isCourseFullyCompleted && (
            <Paper
              sx={{
                p: 4,
                background: 'linear-gradient(135deg, #00bcd4 0%, #33d9f0 100%)',
                color: '#000',
                textAlign: 'center',
                border: '2px solid #00bcd4',
                borderRadius: 3
              }}
            >
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
                🚀 ¡Listo para la Acción!
              </Typography>
              <Typography variant="h6" sx={{ mb: 3, opacity: 0.9 }}>
                Ahora que conoces los fundamentos, genera tu primer RAT profesional
              </Typography>
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForward />}
                onClick={handleGoToRATProduccion}
                sx={{
                  bgcolor: '#1a1a2e',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  px: 4,
                  py: 2,
                  '&:hover': {
                    bgcolor: '#2d2d54',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(26, 26, 46, 0.3)'
                  }
                }}
              >
                IR A RAT PRODUCCIÓN
              </Button>
              <Typography variant="body2" sx={{ mt: 2, opacity: 0.8 }}>
                Genera RATs completos por industria en minutos
              </Typography>
            </Paper>
          )}
        </>
      )}
    </Container>
  );
};

export default ModuloCero;