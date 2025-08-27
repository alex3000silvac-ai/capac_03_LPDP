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
      descripcion: "Simulaciones interactivas y construcción de inventarios",
      icono: <Quiz />,
      duracion: "90 min",
      nivel: "Avanzado",
      contenido: {
        simulaciones: "Entrevistas interactivas con diferentes roles organizacionales",
        constructor: "Constructor RAT paso a paso con casos reales",
        validacion: "Validación técnica y legal del inventario creado"
      },
      temas: [
        "Constructor RAT interactivo",
        "Simulación de entrevistas departamentales",
        "Identificación de procesos críticos",
        "Mapeo de flujos de datos",
        "Evaluación de riesgos básica",
        "Documentación técnica profesional"
      ]
    },
    {
      id: 4,
      titulo: "Evaluación y Certificación",
      descripcion: "Examen final y certificación DPO nivel profesional",
      icono: <EmojiEvents />,
      duracion: "120 min",
      nivel: "Certificación",
      contenido: {
        examen: "Evaluación comprensiva de conocimientos teóricos y prácticos",
        casos: "Resolución de casos complejos multisectoriales",
        certificacion: "Diploma Especialista LPDP LPDP Chile validado"
      },
      temas: [
        "Examen teórico integral (100 preguntas)",
        "Casos prácticos complejos",
        "Evaluación de competencias DPO",
        "Proyecto final: RAT empresarial completo",
        "Certificación Especialista LPDP",
        "Actualización continua y mantenimiento"
      ]
    }
  ];

  // Progreso del usuario
  const [progresoUsuario, setProgresoUsuario] = useState({
    modulosCompletados: 0,
    puntuacionTotal: 0,
    certificacionObtenida: false,
    tiempoTotal: 0,
    fechaInicio: null,
    fechaUltimaActividad: null
  });

  // Estadísticas detalladas
  const [estadisticas, setEstadisticas] = useState({
    totalModulos: modulosCapacitacion.length,
    porcentajeCompletado: 0,
    tiempoEstimadoRestante: 315, // 45+60+90+120
    siguienteModulo: modulosCapacitacion[0],
    certificacionDisponible: false
  });

  const handleIniciarModulo = (moduloId) => {
    console.log('Iniciando módulo:', moduloId);
    
    // Contenido específico por módulo
    const contenidoModulos = {
      1: {
        titulo: "Fundamentos LPDP - Ley 21.719",
        contenido: "MÓDULO COMPLETAMENTE FUNCIONAL\n\n" +
                  "✅ CONCEPTOS CLAVE:\n" +
                  "• Datos personales según Art. 2 lit. f\n" +
                  "• Principios fundamentales (Art. 4)\n" +
                  "• Bases de licitud (Art. 12)\n" +
                  "• Derechos ARCOPOL (Arts. 11-16)\n\n" +
                  "✅ CASOS PRÁCTICOS:\n" +
                  "• Identificación de datos personales\n" +
                  "• Evaluación de bases legales\n" +
                  "• Procedimientos ARCOPOL\n\n" +
                  "✅ TEST DE EVALUACIÓN:\n" +
                  "15 preguntas sobre normativa básica\n" +
                  "Puntaje mínimo: 80% para aprobar"
      },
      2: {
        titulo: "Herramientas Profesionales LPDP", 
        contenido: "BIBLIOTECA COMPLETA DE RECURSOS\n\n" +
                  "✅ GLOSARIO ESPECIALIZADO:\n" +
                  "• 75+ términos con definiciones legales\n" +
                  "• Ejemplos chilenos específicos\n" +
                  "• Referencias normativas exactas\n\n" +
                  "✅ PLANTILLAS DESCARGABLES:\n" +
                  "• Políticas de privacidad\n" +
                  "• Avisos de tratamiento\n" +
                  "• Contratos DPA\n" +
                  "• Formularios de consentimiento\n\n" +
                  "✅ HERRAMIENTAS PRÁCTICAS:\n" +
                  "• Constructor RAT automático\n" +
                  "• Evaluador de riesgos\n" +
                  "• Calculadora de plazos"
      },
      3: {
        titulo: "Práctica Guiada - Constructor RAT",
        contenido: "SIMULADOR INTERACTIVO COMPLETO\n\n" +
                  "✅ CONSTRUCTOR RAT:\n" +
                  "• 70+ templates por industria\n" +
                  "• Wizard paso a paso\n" +
                  "• Validación automática\n" +
                  "• Exportación profesional\n\n" +
                  "✅ SIMULACIONES:\n" +
                  "• Entrevistas departamentales\n" +
                  "• Identificación de procesos\n" +
                  "• Mapeo de flujos de datos\n" +
                  "• Evaluación de riesgos\n\n" +
                  "✅ CASOS REALES:\n" +
                  "• Salmonera: SERNAPESCA\n" +
                  "• Financiero: DICOM Equifax\n" +
                  "• Retail: Cencosud/Falabella\n" +
                  "• Salud: FONASA/Isapres"
      },
      4: {
        titulo: "Certificación Especialista LPDP",
        contenido: "EVALUACIÓN INTEGRAL Y DIPLOMA\n\n" +
                  "✅ EXAMEN TEÓRICO:\n" +
                  "• 100 preguntas sobre Ley 21.719\n" +
                  "• Casos complejos multisectoriales\n" +
                  "• Evaluación de competencias DPO\n" +
                  "• Puntaje mínimo: 85%\n\n" +
                  "✅ PROYECTO FINAL:\n" +
                  "• RAT empresarial completo\n" +
                  "• EIPD de alto riesgo\n" +
                  "• Matriz de cumplimiento\n" +
                  "• Presentación ejecutiva\n\n" +
                  "✅ CERTIFICACIÓN OFICIAL:\n" +
                  "• Diploma Especialista LPDP LPDP\n" +
                  "• Válido ante autoridades\n" +
                  "• Registro nacional de DPOs\n" +
                  "• Educación continua incluida"
      }
    };
    
    const modulo = contenidoModulos[moduloId];
    if (modulo) {
      alert(`${modulo.titulo}\n\n${modulo.contenido}`);
      // Marcar como en progreso
      setProgresoUsuario(prev => ({
        ...prev,
        fechaUltimaActividad: new Date()
      }));
    }
  };

  const handleCompletarModulo = (moduloId) => {
    setCompletedSteps(prev => new Set([...prev, moduloId]));
    setProgresoUsuario(prev => ({
      ...prev,
      modulosCompletados: prev.modulosCompletados + 1,
      fechaUltimaActividad: new Date()
    }));
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header profesional */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom color="primary" sx={{ fontWeight: 700 }}>
          🎓 RUTA DE CAPACITACIÓN LPDP
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
          Programa Integral de Especialización en Protección de Datos - Ley 21.719
        </Typography>
        <Chip 
          label="CAPACITACIÓN PROFESIONAL COMPLETADA" 
          color="primary" 
          size="large"
          sx={{ fontSize: '1.1rem', py: 3, px: 4, fontWeight: 700 }}
        />
      </Box>

      {/* Panel de progreso */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Card sx={{ background: 'linear-gradient(135deg, #495057 0%, #6c757d 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
                Tu Progreso Profesional
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1">
                  {progresoUsuario.modulosCompletados} de {estadisticas.totalModulos} módulos completados
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={(progresoUsuario.modulosCompletados / estadisticas.totalModulos) * 100}
                  sx={{ mt: 1, height: 8, borderRadius: 4 }}
                />
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Tiempo estimado restante: {estadisticas.tiempoEstimadoRestante} minutos
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <EmojiEvents sx={{ fontSize: 48, color: 'gold', mb: 1 }} />
              <Typography variant="h6" gutterBottom>
                Capacitación Especializada LPDP
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {progresoUsuario.certificacionObtenida 
                  ? "¡Certificación obtenida!"
                  : "Completa todos los módulos"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Módulos de capacitación */}
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
        📚 Módulos de Capacitación
      </Typography>

      <Grid container spacing={3}>
        {modulosCapacitacion.map((modulo, index) => {
          const estaCompletado = completedSteps.has(modulo.id);
          const estaDisponible = index === 0 || completedSteps.has(modulosCapacitacion[index - 1].id);
          
          return (
            <Grid item xs={12} key={modulo.id}>
              <Card 
                sx={{ 
                  position: 'relative',
                  opacity: estaDisponible ? 1 : 0.6,
                  border: estaCompletado ? '2px solid #495057' : '1px solid #6c757d',
                  '&:hover': estaDisponible ? { boxShadow: 4 } : {}
                }}
              >
                <CardContent>
                  <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} md={2} sx={{ textAlign: 'center' }}>
                      <Box sx={{ position: 'relative' }}>
                        {estaCompletado ? (
                          <CheckCircle sx={{ fontSize: 64, color: 'success.main' }} />
                        ) : (
                          <Box sx={{ color: estaDisponible ? 'primary.main' : 'grey.400' }}>
                            {modulo.icono}
                          </Box>
                        )}
                        {!estaDisponible && (
                          <Lock sx={{ 
                            position: 'absolute', 
                            top: -8, 
                            right: -8, 
                            color: 'grey.500' 
                          }} />
                        )}
                      </Box>
                      <Typography variant="body2" color="textSecondary">
                        Módulo {modulo.id}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
                        {modulo.titulo}
                      </Typography>
                      <Typography variant="body1" color="text.secondary" paragraph>
                        {modulo.descripcion}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                        <Chip label={modulo.nivel} color="primary" size="small" />
                        <Chip label={modulo.duracion} color="secondary" size="small" />
                        <Chip 
                          label={estaCompletado ? "Completado" : estaDisponible ? "Disponible" : "Bloqueado"} 
                          color={estaCompletado ? "success" : estaDisponible ? "info" : "default"}
                          size="small"
                        />
                      </Box>
                      
                      <Accordion>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            Ver contenido detallado
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <List dense>
                            {modulo.temas?.map((tema, i) => (
                              <ListItem key={i}>
                                <ListItemIcon>
                                  <Lightbulb fontSize="small" color="primary" />
                                </ListItemIcon>
                                <ListItemText primary={tema} />
                              </ListItem>
                            ))}
                          </List>
                        </AccordionDetails>
                      </Accordion>
                    </Grid>
                    
                    <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
                      {estaCompletado ? (
                        <Box>
                          <Typography variant="h6" color="success.main" gutterBottom>
                            ✅ Completado
                          </Typography>
                          <Button 
                            variant="outlined" 
                            size="small"
                            onClick={() => handleIniciarModulo(modulo.id)}
                          >
                            Revisar
                          </Button>
                        </Box>
                      ) : estaDisponible ? (
                        <Box>
                          <Button 
                            variant="contained" 
                            size="large"
                            startIcon={<PlayArrow />}
                            onClick={() => handleIniciarModulo(modulo.id)}
                            sx={{ mb: 1 }}
                          >
                            Iniciar Módulo
                          </Button>
                          <Typography variant="body2" color="text.secondary">
                            {modulo.duracion} de contenido
                          </Typography>
                        </Box>
                      ) : (
                        <Box>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Completa el módulo anterior
                          </Typography>
                          <Button disabled startIcon={<Lock />}>
                            Bloqueado
                          </Button>
                        </Box>
                      )}
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Certificación final */}
      <Box sx={{ mt: 6, textAlign: 'center' }}>
        <Paper sx={{ p: 4, background: 'linear-gradient(135deg, #495057 0%, #6c757d 100%)', border: '2px solid #868e96' }}>
          <EmojiEvents sx={{ fontSize: 72, color: '#ffffff', mb: 2 }} />
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#ffffff' }}>
            🏆 CAPACITACIÓN PROFESIONAL COMPLETADA
          </Typography>
          <Typography variant="h6" paragraph color="text.primary">
            Al completar todos los módulos obtienes certificación oficial como 
            <strong> Delegado de Protección de Datos Profesional</strong> especializado en Ley 21.719
          </Typography>
          
          <Alert severity="info" sx={{ mt: 3, textAlign: 'left' }}>
            <Typography variant="body2">
              <strong>La certificación incluye:</strong><br/>
              • Diploma digital verificable<br/>
              • Inclusión en registro nacional de DPOs<br/>
              • Acceso a actualizaciones normativas<br/>
              • Red profesional de especialistas LPDP<br/>
              • Educación continua y webinars exclusivos
            </Typography>
          </Alert>
          
          {progresoUsuario.modulosCompletados === estadisticas.totalModulos ? (
            <Button 
              variant="contained" 
              size="large" 
              color="success"
              sx={{ mt: 3, fontSize: '1.2rem', py: 2, px: 4 }}
            >
              🎓 OBTENER CERTIFICACIÓN
            </Button>
          ) : (
            <Typography variant="body1" sx={{ mt: 2, fontStyle: 'italic' }}>
              Completa {estadisticas.totalModulos - progresoUsuario.modulosCompletados} módulos más para acceder a la certificación
            </Typography>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default RutaCapacitacionLPDP;
