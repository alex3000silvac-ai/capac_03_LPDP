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
    }
  ];

  // Timer countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-advance slides
  useEffect(() => {
    if (!isAutoPlay) return;
    
    const slideTimer = setTimeout(() => {
      if (currentSlide < slides.length - 1) {
        handleNextSlide();
      }
    }, slides[currentSlide].duration * 1000);
    
    return () => clearTimeout(slideTimer);
  }, [currentSlide, isAutoPlay]);

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
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Módulo Cero: LPDP en 5 Minutos
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              size="small"
              onClick={() => setIsAutoPlay(!isAutoPlay)}
              color={isAutoPlay ? 'primary' : 'secondary'}
            >
              {isAutoPlay ? '⏸️ Pausar' : '▶️ Reproducir'}
            </Button>
            
            <Typography 
              variant="h5" 
              sx={{ 
                color: timer < 60 ? 'error.main' : 'primary.main',
                fontFamily: 'monospace'
              }}
            >
              ⏱️ {formatTime(timer)}
            </Typography>
          </Box>
        </Box>

        {/* Progress Bar */}
        <Box sx={{ mb: 3 }}>
          <LinearProgress 
            variant="determinate" 
            value={((currentSlide + 1) / slides.length) * 100}
            sx={{ height: 8, borderRadius: 4 }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
            Progreso: {currentSlide + 1} de {slides.length} ({Math.round(((currentSlide + 1) / slides.length) * 100)}%)
          </Typography>
        </Box>

        {/* Stepper */}
        <Stepper activeStep={currentSlide} sx={{ mb: 4 }} alternativeLabel>
          {slides.map((slide, index) => (
            <Step key={slide.id}>
              <StepLabel 
                onClick={() => {
                  setCurrentSlide(index);
                  setIsAutoPlay(false);
                }}
                sx={{ cursor: 'pointer' }}
              >
                <Typography variant="caption">{slide.title}</Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Alert para usuarios demo */}
        {isRestricted() && (
          <Alert severity="info" sx={{ mb: 3 }}>
            🎯 <strong>Modo Demo:</strong> Estás viendo una presentación del sistema. 
            Al final se te solicitará acceso completo para continuar.
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
            <Box sx={{ minHeight: 500 }}>
              {React.createElement(currentComponent, {
                onNext: handleNextSlide,
                onPrev: handlePrevSlide,
                isAutoPlay: isAutoPlay,
                duration: slides[currentSlide].duration
              })}
            </Box>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mt: 4,
          pt: 3,
          borderTop: 1,
          borderColor: 'divider'
        }}>
          <Button 
            variant="outlined"
            onClick={handlePrevSlide}
            disabled={currentSlide === 0}
            size="large"
          >
            ← Anterior
          </Button>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {slides[currentSlide].description}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Duración estimada: {slides[currentSlide].duration} segundos
            </Typography>
          </Box>
          
          <Button 
            variant="contained"
            onClick={() => {
              if (currentSlide === slides.length - 1) {
                handleComplete();
              } else {
                handleNextSlide();
                setIsAutoPlay(false); // Detener autoplay si avanza manualmente
              }
            }}
            size="large"
          >
            {currentSlide === slides.length - 1 ? 'Comenzar Ahora →' : 'Siguiente →'}
          </Button>
        </Box>

        {/* Footer info */}
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            💡 Tip: Puedes pausar la presentación en cualquier momento o saltar entre secciones
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default ModuloCero;