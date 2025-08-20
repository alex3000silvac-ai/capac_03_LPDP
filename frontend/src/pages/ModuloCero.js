import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Paper, 
  Typography, 
  Button, 
  Stepper, 
  Step, 
  StepLabel,
  LinearProgress,
  Alert
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Componentes de las pantallas
import ConceptoTratamiento from '../components/modulo-cero/ConceptoTratamiento';
import ClasificacionDatos from '../components/modulo-cero/ClasificacionDatos';
import FlujoCumplimiento from '../components/modulo-cero/FlujoCumplimiento';
import InterfazTrabajo from '../components/modulo-cero/InterfazTrabajo';
import EjemploConcreto from '../components/modulo-cero/EjemploConcreto';
import DiagramaInterrelacionDatos from '../components/modulo-cero/DiagramaInterrelacionDatos';

const ModuloCero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [timer, setTimer] = useState(300); // 5 minutos
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [slideStartTime, setSlideStartTime] = useState(Date.now());
  
  const navigate = useNavigate();
  const { isRestricted } = useAuth();

  const slides = [
    {
      id: 'concepto',
      title: '¿Qué es un Tratamiento de Datos?',
      duration: 30,
      component: ConceptoTratamiento,
      description: 'Concepto central de la LPDP'
    },
    {
      id: 'clasificacion',
      title: 'Clasificación de Datos',
      duration: 45,
      component: ClasificacionDatos,
      description: 'Tipos de datos y niveles de riesgo'
    },
    {
      id: 'flujo',
      title: 'Mapa de Cumplimiento',
      duration: 60,
      component: FlujoCumplimiento,
      description: 'Proceso completo de implementación'
    },
    {
      id: 'interfaz',
      title: 'Tu Sistema en Acción',
      duration: 90,
      component: InterfazTrabajo,
      description: 'Interfaz real de trabajo'
    },
    {
      id: 'ejemplo',
      title: 'Caso Real',
      duration: 75,
      component: EjemploConcreto,
      description: 'Implementación práctica'
    },
    {
      id: 'interrelacion',
      title: 'Mapa de Interrelación Completo',
      duration: 120,
      component: DiagramaInterrelacionDatos,
      description: 'Interrelación de datos según Ley 21719'
    }
  ];

  // Timer countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-advance slides manejado por cada componente individual
  // Los componentes llaman onNext() cuando terminan su presentación automática

  // Track slide start time
  useEffect(() => {
    setSlideStartTime(Date.now());
  }, [currentSlide]);

  const handleNextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      // Completado - ir al módulo interactivo
      handleComplete();
    }
  };

  const handlePrevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    if (isRestricted()) {
      alert('La versión demo termina aquí. Para continuar, solicita acceso completo.');
      return;
    }
    navigate('/modulo-cero/interactivo');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentComponent = slides[currentSlide].component;

  return (
    <Container maxWidth="xl">
      <Paper elevation={3} sx={{ p: 4, minHeight: '85vh' }}>
        {/* Header con navegación superior única */}
        <Box sx={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bgcolor: 'background.paper', 
          p: 2, 
          borderBottom: 1, 
          borderColor: 'divider', 
          zIndex: 1000,
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            LPDP Módulo Cero - {slides[currentSlide].title}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={handlePrevSlide}
              disabled={currentSlide === 0}
              size="small"
            >
              ← Anterior Capítulo
            </Button>
            
            <Typography 
              variant="body1" 
              sx={{ 
                fontFamily: 'monospace',
                minWidth: '120px',
                textAlign: 'center'
              }}
            >
              {currentSlide + 1} / {slides.length}
            </Typography>
            
            <Button
              variant="contained"
              onClick={() => {
                if (currentSlide === slides.length - 1) {
                  handleComplete();
                } else {
                  handleNextSlide();
                }
              }}
              size="small"
            >
              {currentSlide === slides.length - 1 ? 'Finalizar →' : 'Siguiente Capítulo →'}
            </Button>
          </Box>
        </Box>
        
        {/* Espaciado para el header fijo */}
        <Box sx={{ height: 80 }} />

        {/* Alert para usuarios demo */}
        {isRestricted() && (
          <Alert severity="info" sx={{ mb: 3 }}>
            🎯 <strong>Modo Demo:</strong> Presentación automática con sincronización de voz. 
            Los elementos aparecerán mientras se reproduce el audio.
          </Alert>
        )}

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
          >
            <Box sx={{ minHeight: 500, pb: 4 }}>
              {React.createElement(currentComponent, {
                onNext: handleNextSlide,
                onPrev: handlePrevSlide,
                isAutoPlay: true, // Siempre automático
                duration: slides[currentSlide].duration
              })}
            </Box>
          </motion.div>
        </AnimatePresence>
      </Paper>
    </Container>
  );
};

export default ModuloCero;