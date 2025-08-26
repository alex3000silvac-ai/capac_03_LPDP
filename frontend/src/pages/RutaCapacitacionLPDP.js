import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  School,
  MenuBook,
  Quiz,
  EmojiEvents,
  CheckCircle,
  ExpandMore,
  PlayArrow,
  Lock,
  Lightbulb,
  Gavel,
  Security,
  Business,
  Assessment,
  Timeline,
} from '@mui/icons-material';

const RutaCapacitacionLPDP = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());

  // Módulos de la ruta de capacitación
  const modulosCapacitacion = [
    {
      id: 1,
      titulo: "Fundamentos LPDP",
      descripcion: "Conceptos básicos y fundamentos legales de la Ley 21.719",
      icono: <School />,
      duracion: "45 min",
      nivel: "Básico",
      contenido: {
        introduccion: "Introducción a la protección de datos personales en Chile",
        conceptos: "Definiciones clave, principios fundamentales, ámbito de aplicación",
        ejercicios: "Test de comprensión, casos prácticos básicos"
      },
      temas: [
        "¿Qué son los datos personales?",
        "Principios de la protección de datos",
        "Derechos de los titulares (ARCOPOL)",
        "Obligaciones básicas del responsable",
        "Sanciones y multas",
        "Diferencias con normativas internacionales"
      ]
    },
    {
      id: 2,
      titulo: "Herramientas Profesionales",
      descripcion: "Glosario especializado, plantillas y herramientas prácticas",
      icono: <MenuBook />,
      duracion: "60 min",
      nivel: "Intermedio",
      contenido: {
        glosario: "75+ términos especializados con ejemplos chilenos",
        herramientas: "Plantillas de políticas, avisos de privacidad, formularios",
        templates: "Documentos listos para usar según sector industrial"
      },
      temas: [
        "Glosario LPDP completo (75+ términos)",
        "Templates de avisos de privacidad",
        "Formularios de consentimiento",
        "Plantillas de políticas internas",
        "Procedimientos ARCOPOL",
        "Contratos con encargados"
      ]
    },
    {
      id: 3,
      titulo: "Práctica Guiada",
      descripción: "Simulaciones interactivas y construcción de inventarios",
      icono: <Quiz />,
      duracion: "90 min",
      nivel: "Avanzado",
      contenido: {
        simulaciones: "Entrevistas interactivas con diferentes roles organizacionales",
        inventario: "Construcción paso a paso de registros RAT",
        validacion: "Revisión y validación de documentos creados"
      },
      temas: [
        "Simulación: Entrevista DPO vs RRHH",
        "Simulación: Evaluación de riesgos",
        "Construcción de inventario completo",
        "Mapeo de flujos de datos",
        "Identificación de datos sensibles",
        "Definición de medidas de seguridad"
      ]
    },
    {
      id: 4,
      titulo: "Certificación",
      descripcion: "Evaluación final y certificado de competencias",
      icono: <EmojiEvents />,
      duracion: "30 min",
      nivel: "Certificación",
      contenido: {
        evaluacion: "Examen integral de conocimientos adquiridos",
        certificado: "Certificado digital de competencias LPDP",
        seguimiento: "Plan de seguimiento y actualización continua"
      },
      temas: [
        "Evaluación integral (40 preguntas)",
        "Casos prácticos de aplicación",
        "Certificado de competencias digitales",
        "Plan de seguimiento personalizado",
        "Acceso a actualizaciones normativas",
        "Comunidad de práctica LPDP"
      ]
    }
  ];

  const handleNext = () => {
    const newCompleted = new Set(completedSteps);
    newCompleted.add(activeStep);
    setCompletedSteps(newCompleted);
    setActiveStep(activeStep + 1);
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const handleStepClick = (step) => {
    setActiveStep(step);
  };

  const isStepCompleted = (step) => {
    return completedSteps.has(step);
  };

  const getStepIcon = (step) => {
    if (isStepCompleted(step)) {
      return <CheckCircle color="success" />;
    }
    if (step === activeStep) {
      return <PlayArrow color="primary" />;
    }
    if (step > activeStep && !completedSteps.has(step - 1)) {
      return <Lock color="disabled" />;
    }
    return modulosCapacitacion[step].icono;
  };

  const calcularProgreso = () => {
    return (completedSteps.size / modulosCapacitacion.length) * 100;
  };

  const getNivelColor = (nivel) => {
    switch (nivel) {
      case 'Básico': return 'success';
      case 'Intermedio': return 'warning';
      case 'Avanzado': return 'error';
      case 'Certificación': return 'primary';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom color="primary">
          🎓 Ruta de Especialización LPDP
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Programa completo de capacitación en Ley 21.719 - Desde conceptos básicos hasta certificación profesional
        </Typography>
        
        {/* Progreso global */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Progreso General</Typography>
            <Typography variant="h6" color="primary">
              {Math.round(calcularProgreso())}%
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={calcularProgreso()} 
            sx={{ height: 8, borderRadius: 4 }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {completedSteps.size} de {modulosCapacitacion.length} módulos completados
          </Typography>
        </Paper>
      </Box>

      <Grid container spacing={4}>
        {/* Sidebar con progreso */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
            <Typography variant="h6" gutterBottom>
              📚 Módulos de Capacitación
            </Typography>
            
            <Stepper activeStep={activeStep} orientation="vertical">
              {modulosCapacitacion.map((modulo, index) => (
                <Step key={modulo.id}>
                  <StepLabel
                    StepIconComponent={() => getStepIcon(index)}
                    onClick={() => handleStepClick(index)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {modulo.titulo}
                      </Typography>
                      <Box display="flex" gap={1} mt={0.5}>
                        <Chip 
                          label={modulo.nivel} 
                          size="small" 
                          color={getNivelColor(modulo.nivel)}
                        />
                        <Chip 
                          label={modulo.duracion} 
                          size="small" 
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Paper>
        </Grid>

        {/* Contenido principal */}
        <Grid item xs={12} md={8}>
          {activeStep < modulosCapacitacion.length && (
            <Paper sx={{ p: 4 }}>
              <Box display="flex" alignItems="center" mb={3}>
                {modulosCapacitacion[activeStep].icono}
                <Box ml={2}>
                  <Typography variant="h4" gutterBottom>
                    {modulosCapacitacion[activeStep].titulo}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {modulosCapacitacion[activeStep].descripcion}
                  </Typography>
                </Box>
              </Box>

              <Box display="flex" gap={2} mb={4}>
                <Chip 
                  label={modulosCapacitacion[activeStep].nivel}
                  color={getNivelColor(modulosCapacitacion[activeStep].nivel)}
                />
                <Chip 
                  label={modulosCapacitacion[activeStep].duracion}
                  variant="outlined"
                />
                <Chip 
                  label={`Módulo ${activeStep + 1} de ${modulosCapacitacion.length}`}
                  variant="outlined"
                />
              </Box>

              {/* Contenido del módulo */}
              <Grid container spacing={3}>
                {/* Temas principales */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    📋 Temas que aprenderás:
                  </Typography>
                  <List dense>
                    {modulosCapacitacion[activeStep].temas.map((tema, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <Lightbulb color="primary" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={tema} />
                      </ListItem>
                    ))}
                  </List>
                </Grid>

                {/* Contenido detallado */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    🎯 Contenido del módulo:
                  </Typography>
                  
                  {Object.entries(modulosCapacitacion[activeStep].contenido).map(([key, value]) => (
                    <Accordion key={key} sx={{ mb: 1 }}>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography variant="body2" color="text.secondary">
                          {value}
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Grid>
              </Grid>

              {/* Acciones */}
              <Box display="flex" justifyContent="space-between" mt={4}>
                <Button 
                  onClick={handleBack} 
                  disabled={activeStep === 0}
                  variant="outlined"
                >
                  Anterior
                </Button>
                
                <Box display="flex" gap={2}>
                  <Button 
                    variant="contained"
                    color="primary"
                    startIcon={<PlayArrow />}
                  >
                    Iniciar Módulo
                  </Button>
                  
                  {activeStep < modulosCapacitacion.length - 1 && (
                    <Button 
                      onClick={handleNext}
                      variant="outlined"
                    >
                      Marcar Completado
                    </Button>
                  )}
                </Box>
              </Box>
            </Paper>
          )}

          {/* Mensaje de finalización */}
          {activeStep >= modulosCapacitacion.length && (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <EmojiEvents sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
              <Typography variant="h4" gutterBottom color="primary">
                ¡Felicitaciones!
              </Typography>
              <Typography variant="h6" gutterBottom>
                Has completado la Ruta de Especialización LPDP
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Ya tienes los conocimientos fundamentales para implementar un programa de cumplimiento 
                de protección de datos según la Ley 21.719 de Chile.
              </Typography>
              
              <Alert severity="success" sx={{ mb: 3 }}>
                <Typography variant="body1" fontWeight={600}>
                  🏆 Certificado de Especialización LPDP obtenido
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Descarga tu certificado digital y compártelo en tu perfil profesional
                </Typography>
              </Alert>

              <Box display="flex" justifyContent="center" gap={2}>
                <Button variant="contained" color="primary" startIcon={<EmojiEvents />}>
                  Descargar Certificado
                </Button>
                <Button variant="outlined" onClick={() => setActiveStep(0)}>
                  Revisar Módulos
                </Button>
              </Box>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default RutaCapacitacionLPDP;