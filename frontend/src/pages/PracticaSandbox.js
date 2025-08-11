import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  Alert,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Science,
  Business,
  CheckCircle,
  Error,
  Info,
  Help,
  Lightbulb,
  PlayArrow,
  Save,
  Assessment,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const steps = ['Seleccionar Escenario', 'Entrevista', 'Documentar', 'Validar'];

function PracticaSandbox() {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [retroalimentacion, setRetroalimentacion] = useState(null);
  const [actividadForm, setActividadForm] = useState({
    nombre_actividad: '',
    finalidad_principal: '',
    base_licitud: '',
    area_negocio: '',
    categorias_datos: [],
  });

  const escenarios = [
    {
      id: 'ESC-001',
      nombre: 'Tu Primera Semana como Asesor',
      empresa: 'Salmones del Pacífico S.A.',
      nivel: 'Principiante',
      descripcion: 'La empresa te contrató para hacer el levantamiento inicial de datos',
      objetivos: [
        'Entrevistar al menos 2 áreas',
        'Documentar 5 actividades de tratamiento',
        'Identificar 3 riesgos de cumplimiento',
      ],
      areas_disponibles: ['RRHH', 'Producción', 'Finanzas'],
    },
    {
      id: 'ESC-002',
      nombre: 'Crisis: Fuga de Datos',
      empresa: 'AquaChile Export',
      nivel: 'Intermedio',
      descripcion: 'Se filtró información sensible. Debes hacer el análisis de impacto',
      objetivos: [
        'Identificar qué datos se filtraron',
        'Mapear quién tenía acceso',
        'Proponer plan de acción',
      ],
      areas_disponibles: ['RRHH', 'TI', 'Legal'],
    },
  ];

  const personajesEntrevista = {
    RRHH: {
      nombre: 'María González',
      cargo: 'Jefa de RRHH',
      avatar: '👩‍💼',
      personalidad: 'Práctica y directa',
      dialogo_inicial: 'Hola, me dijeron que vienes a hablar sobre protección de datos. Te cuento que aquí manejamos mucha información de los trabajadores...',
    },
    Producción: {
      nombre: 'Pedro Martínez',
      cargo: 'Gerente de Producción',
      avatar: '👨‍🔧',
      personalidad: 'Técnico, le gustan los detalles',
      dialogo_inicial: 'Bienvenido a producción. Aquí usamos muchos sensores y sistemas automatizados. ¿Eso cuenta como datos personales?',
    },
  };

  const handleSelectScenario = (escenario) => {
    setSelectedScenario(escenario);
    setActiveStep(1);
    setDialogOpen(true);
  };

  const handleFormChange = (field, value) => {
    setActividadForm({
      ...actividadForm,
      [field]: value,
    });
  };

  const validarActividad = () => {
    const feedback = {
      esValida: true,
      mensajes: [],
      puntaje: 0,
    };

    // Validar nombre de actividad
    if (!actividadForm.nombre_actividad) {
      feedback.esValida = false;
      feedback.mensajes.push({
        campo: 'nombre_actividad',
        tipo: 'error',
        mensaje: 'Toda actividad necesita un nombre descriptivo',
        pista: 'Piensa: ¿QUÉ hace el área, no CÓMO lo hace?',
      });
    } else if (actividadForm.nombre_actividad.toLowerCase().includes('excel') || 
               actividadForm.nombre_actividad.toLowerCase().includes('sistema')) {
      feedback.mensajes.push({
        campo: 'nombre_actividad',
        tipo: 'warning',
        mensaje: 'El nombre se enfoca en la herramienta, no en la actividad',
        pista: 'Mejor sería algo como "Proceso de Selección" en vez de "Usar Excel de candidatos"',
      });
      feedback.puntaje += 15;
    } else {
      feedback.mensajes.push({
        campo: 'nombre_actividad',
        tipo: 'success',
        mensaje: '¡Excelente! Has identificado correctamente la actividad',
      });
      feedback.puntaje += 25;
    }

    // Validar finalidad
    if (!actividadForm.finalidad_principal) {
      feedback.esValida = false;
      feedback.mensajes.push({
        campo: 'finalidad_principal',
        tipo: 'error',
        mensaje: 'Necesitas explicar el "para qué" de esta actividad',
        pregunta_guia: '¿Por qué la empresa necesita estos datos?',
      });
    } else {
      feedback.mensajes.push({
        campo: 'finalidad_principal',
        tipo: 'success',
        mensaje: 'Bien, has definido una finalidad clara',
      });
      feedback.puntaje += 25;
    }

    // Validar base de licitud
    if (!actividadForm.base_licitud) {
      feedback.esValida = false;
      feedback.mensajes.push({
        campo: 'base_licitud',
        tipo: 'error',
        mensaje: 'Toda actividad debe tener una base legal',
        opciones: ['Consentimiento', 'Contrato', 'Obligación legal', 'Interés legítimo'],
      });
    } else {
      feedback.mensajes.push({
        campo: 'base_licitud',
        tipo: 'success',
        mensaje: 'Correcto, has identificado la base de licitud',
      });
      feedback.puntaje += 25;
    }

    // Validar categorías de datos
    if (actividadForm.categorias_datos.length === 0) {
      feedback.mensajes.push({
        campo: 'categorias_datos',
        tipo: 'warning',
        mensaje: 'No olvides identificar qué tipos de datos se usan',
      });
    } else {
      feedback.puntaje += 25;
    }

    setRetroalimentacion(feedback);
    
    if (feedback.puntaje >= 75) {
      setActiveStep(3);
    }
  };

  return (
    <Box>
      {/* Header Sandbox */}
      <Alert severity="info" icon={<Science />} sx={{ mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={600}>
          🎮 Modo Práctica - Ambiente Sandbox
        </Typography>
        <Typography variant="body2">
          Todo lo que hagas aquí es para aprender. Los datos son ficticios y no afectarán ningún sistema real.
        </Typography>
      </Alert>

      {/* Stepper */}
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Contenido según paso */}
      <AnimatePresence mode="wait">
        {activeStep === 0 && (
          <motion.div
            key="step0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Typography variant="h5" gutterBottom fontWeight={600}>
              Selecciona un Escenario de Práctica
            </Typography>
            <Grid container spacing={3}>
              {escenarios.map((escenario) => (
                <Grid item xs={12} md={6} key={escenario.id}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4,
                      },
                    }}
                    onClick={() => handleSelectScenario(escenario)}
                  >
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6" fontWeight={600}>
                          {escenario.nombre}
                        </Typography>
                        <Chip 
                          label={escenario.nivel} 
                          color={escenario.nivel === 'Principiante' ? 'success' : 'warning'}
                          size="small"
                        />
                      </Box>
                      <Box display="flex" alignItems="center" mb={2}>
                        <Business sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {escenario.empresa}
                        </Typography>
                      </Box>
                      <Typography variant="body2" mb={2}>
                        {escenario.descripcion}
                      </Typography>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="subtitle2" fontWeight={600} mb={1}>
                        Objetivos:
                      </Typography>
                      <List dense>
                        {escenario.objetivos.map((objetivo, idx) => (
                          <ListItem key={idx} disableGutters>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              <CheckCircle fontSize="small" color="primary" />
                            </ListItemIcon>
                            <ListItemText 
                              primary={objetivo}
                              primaryTypographyProps={{ variant: 'body2' }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        )}

        {activeStep === 1 && selectedScenario && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom fontWeight={600}>
                      Fase de Entrevista - {selectedScenario.empresa}
                    </Typography>
                    
                    {/* Simulación de entrevista */}
                    <Paper sx={{ p: 3, bgcolor: 'grey.50', mb: 3 }}>
                      <Box display="flex" alignItems="center" mb={2}>
                        <Avatar sx={{ width: 56, height: 56, fontSize: '2rem', mr: 2 }}>
                          {personajesEntrevista.RRHH.avatar}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {personajesEntrevista.RRHH.nombre}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {personajesEntrevista.RRHH.cargo}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                        "{personajesEntrevista.RRHH.dialogo_inicial}"
                      </Typography>
                    </Paper>

                    <Alert severity="info" sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        <strong>Información recopilada:</strong> RRHH maneja reclutamiento, nómina y evaluaciones. 
                        Usan Excel para CVs, sistema de nómina externo, y comparten datos con Previred y la Mutual.
                      </Typography>
                    </Alert>

                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => setActiveStep(2)}
                    >
                      Proceder a Documentar
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom fontWeight={600}>
                      <Help sx={{ verticalAlign: 'middle', mr: 1 }} />
                      Tips para la Entrevista
                    </Typography>
                    <List>
                      <ListItem>
                        <ListItemIcon>
                          <Lightbulb color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Pregunta por procesos"
                          secondary="No por sistemas o bases de datos"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <Lightbulb color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Sigue el flujo de datos"
                          secondary="¿De dónde vienen? ¿A dónde van?"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <Lightbulb color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Identifica terceros"
                          secondary="¿Con quién comparten información?"
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </motion.div>
        )}

        {activeStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Typography variant="h5" gutterBottom fontWeight={600}>
              Documenta la Actividad de Tratamiento
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Formulario RAT - Registro de Actividad
                    </Typography>
                    
                    <Box component="form" sx={{ mt: 3 }}>
                      <TextField
                        fullWidth
                        label="Nombre de la Actividad"
                        value={actividadForm.nombre_actividad}
                        onChange={(e) => handleFormChange('nombre_actividad', e.target.value)}
                        margin="normal"
                        helperText="¿Qué proceso o actividad estás documentando?"
                      />

                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Finalidad Principal"
                        value={actividadForm.finalidad_principal}
                        onChange={(e) => handleFormChange('finalidad_principal', e.target.value)}
                        margin="normal"
                        helperText="¿Para qué necesita la empresa estos datos?"
                      />

                      <FormControl fullWidth margin="normal">
                        <InputLabel>Base de Licitud</InputLabel>
                        <Select
                          value={actividadForm.base_licitud}
                          onChange={(e) => handleFormChange('base_licitud', e.target.value)}
                          label="Base de Licitud"
                        >
                          <MenuItem value="consentimiento">Consentimiento del titular</MenuItem>
                          <MenuItem value="contrato">Ejecución de contrato</MenuItem>
                          <MenuItem value="obligacion_legal">Obligación legal</MenuItem>
                          <MenuItem value="interes_legitimo">Interés legítimo</MenuItem>
                          <MenuItem value="interes_vital">Interés vital</MenuItem>
                        </Select>
                      </FormControl>

                      <FormControl fullWidth margin="normal">
                        <InputLabel>Área de Negocio</InputLabel>
                        <Select
                          value={actividadForm.area_negocio}
                          onChange={(e) => handleFormChange('area_negocio', e.target.value)}
                          label="Área de Negocio"
                        >
                          <MenuItem value="RRHH">Recursos Humanos</MenuItem>
                          <MenuItem value="Produccion">Producción</MenuItem>
                          <MenuItem value="Finanzas">Finanzas</MenuItem>
                        </Select>
                      </FormControl>

                      <Box mt={3}>
                        <Button
                          variant="contained"
                          fullWidth
                          onClick={validarActividad}
                          startIcon={<Save />}
                        >
                          Validar Actividad
                        </Button>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>

                {/* Retroalimentación */}
                {retroalimentacion && (
                  <Card sx={{ mt: 3 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Retroalimentación
                      </Typography>
                      {retroalimentacion.mensajes.map((msg, idx) => (
                        <Alert 
                          key={idx} 
                          severity={msg.tipo}
                          sx={{ mb: 2 }}
                          icon={msg.tipo === 'success' ? <CheckCircle /> : msg.tipo === 'error' ? <Error /> : <Info />}
                        >
                          <Typography variant="body2" fontWeight={600}>
                            {msg.mensaje}
                          </Typography>
                          {msg.pista && (
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              💡 {msg.pista}
                            </Typography>
                          )}
                          {msg.pregunta_guia && (
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              🤔 {msg.pregunta_guia}
                            </Typography>
                          )}
                        </Alert>
                      ))}
                      
                      <Box display="flex" justifyContent="space-between" alignItems="center" mt={3}>
                        <Typography variant="subtitle1">
                          Puntaje: {retroalimentacion.puntaje}/100
                        </Typography>
                        {retroalimentacion.puntaje >= 75 && (
                          <Chip 
                            label="¡Actividad Aprobada!" 
                            color="success"
                            icon={<CheckCircle />}
                          />
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                )}
              </Grid>

              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <Info sx={{ verticalAlign: 'middle', mr: 1 }} />
                      Recordatorios
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText 
                          primary="Nombre de Actividad"
                          secondary="Describe QUÉ se hace, no la herramienta"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Finalidad"
                          secondary="El 'para qué' debe ser específico y legítimo"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Base de Licitud"
                          secondary="¿Qué te da derecho a usar estos datos?"
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </motion.div>
        )}

        {activeStep === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 5 }}>
                <Typography variant="h1" sx={{ fontSize: '4rem', mb: 2 }}>
                  🎉
                </Typography>
                <Typography variant="h4" gutterBottom fontWeight={600}>
                  ¡Excelente trabajo!
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                  Has completado exitosamente tu primera actividad de tratamiento en modo práctica.
                </Typography>
                
                <Paper sx={{ p: 3, bgcolor: 'success.light', color: 'white', mb: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    Lo que aprendiste:
                  </Typography>
                  <List>
                    <ListItem>
                      <CheckCircle sx={{ mr: 2 }} />
                      <ListItemText primary="Cómo identificar una actividad de tratamiento" />
                    </ListItem>
                    <ListItem>
                      <CheckCircle sx={{ mr: 2 }} />
                      <ListItemText primary="La importancia de definir una finalidad clara" />
                    </ListItem>
                    <ListItem>
                      <CheckCircle sx={{ mr: 2 }} />
                      <ListItemText primary="Cómo determinar la base de licitud apropiada" />
                    </ListItem>
                  </List>
                </Paper>

                <Box display="flex" gap={2} justifyContent="center">
                  <Button 
                    variant="contained" 
                    startIcon={<PlayArrow />}
                    onClick={() => {
                      setActiveStep(0);
                      setRetroalimentacion(null);
                      setActividadForm({
                        nombre_actividad: '',
                        finalidad_principal: '',
                        base_licitud: '',
                        area_negocio: '',
                        categorias_datos: [],
                      });
                    }}
                  >
                    Practicar Otro Escenario
                  </Button>
                  <Button 
                    variant="outlined"
                    startIcon={<Assessment />}
                  >
                    Ver Mi Progreso
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dialog de bienvenida al escenario */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <Science sx={{ mr: 2, color: 'primary.main' }} />
            Iniciando Modo Práctica
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Recuerda: Todo en este modo es ficticio y educativo
          </Alert>
          <Typography variant="body1" paragraph>
            <strong>Escenario:</strong> {selectedScenario?.nombre}
          </Typography>
          <Typography variant="body2" paragraph>
            Vas a trabajar con la empresa ficticia <strong>{selectedScenario?.empresa}</strong>.
            Tu objetivo es practicar el levantamiento de información y documentación de actividades.
          </Typography>
          <Typography variant="body2">
            ¡No te preocupes por equivocarte! El sistema te guiará y te dará retroalimentación
            para que aprendas en cada paso.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} variant="contained">
            ¡Comenzar!
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default PracticaSandbox;
