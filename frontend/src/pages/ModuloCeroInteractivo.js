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
  Grid,
  Card,
  CardContent,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  Checkbox,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  Alert,
  LinearProgress,
  Chip,
  Fade
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import DiagramaMapeoVisual from '../components/DiagramaMapeoVisual';
import { 
  Business as ProcessIcon,
  Flag as GoalIcon,
  Storage as DataIcon,
  Schedule as TimeIcon,
  Share as ShareIcon,
  Assessment as ResultIcon,
  AccountTree,
  Hub,
  SwapHoriz,
  Warning,
  Security,
  VolumeUp,
  VolumeOff,
  PlayArrow,
  Stop,
  Download,
  Print
} from '@mui/icons-material';

const ModuloCeroInteractivo = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    proceso: '',
    area: '',
    finalidades: [],
    datosComunes: [],
    datosSensibles: [],
    retencion: {
      durante: '',
      despues: '',
      justificacion: ''
    },
    destinatarios: {
      internos: [],
      externos: []
    }
  });
  const [errors, setErrors] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState(null);
  
  const navigate = useNavigate();
  const { isRestricted, user } = useAuth();

  const steps = [
    { 
      label: 'Selecciona tu Proceso', 
      icon: <ProcessIcon />,
      description: 'Identifica una actividad de tu área'
    },
    { 
      label: 'Define la Finalidad', 
      icon: <GoalIcon />,
      description: '¿Para qué usas los datos?'
    },
    { 
      label: 'Categorías de Datos', 
      icon: <DataIcon />,
      description: '¿Qué información recopilas?'
    },
    { 
      label: 'Tiempo de Retención', 
      icon: <TimeIcon />,
      description: '¿Cuánto tiempo los guardas?'
    },
    { 
      label: 'Destinatarios', 
      icon: <ShareIcon />,
      description: '¿Con quién los compartes?'
    },
    { 
      label: 'Resultado', 
      icon: <ResultIcon />,
      description: 'Tu mapeo completo'
    }
  ];

  const procesosEjemplo = [
    {
      id: 'rrhh_contratacion',
      nombre: 'Contratación de Personal',
      area: 'Recursos Humanos',
      icono: '👥',
      descripcion: 'Proceso completo de reclutamiento y selección'
    },
    {
      id: 'marketing_newsletter',
      nombre: 'Newsletter y Promociones',
      area: 'Marketing',
      icono: '📧',
      descripcion: 'Envío de campañas por email'
    },
    {
      id: 'ventas_clientes',
      nombre: 'Gestión de Clientes',
      area: 'Ventas',
      icono: '💼',
      descripcion: 'Administración de cartera de clientes'
    },
    {
      id: 'operaciones_calidad',
      nombre: 'Control de Calidad',
      area: 'Operaciones',
      icono: '🏭',
      descripcion: 'Monitoreo de procesos productivos'
    }
  ];

  const finalidadesPorProceso = {
    rrhh_contratacion: [
      'Evaluar idoneidad del candidato',
      'Verificar antecedentes y referencias',
      'Cumplir obligaciones legales laborales',
      'Gestionar proceso de onboarding'
    ],
    marketing_newsletter: [
      'Enviar promociones y ofertas',
      'Informar sobre productos/servicios',
      'Fidelizar clientes existentes',
      'Segmentar audiencias'
    ],
    ventas_clientes: [
      'Gestionar relación comercial',
      'Procesar órdenes de compra',
      'Facturación y cobranza',
      'Análisis de comportamiento'
    ],
    operaciones_calidad: [
      'Monitorear procesos productivos',
      'Asegurar cumplimiento de normas',
      'Trazabilidad de productos',
      'Mejora continua'
    ]
  };

  const datosComunes = [
    { id: 'nombre', label: 'Nombre completo', categoria: 'identificacion' },
    { id: 'rut', label: 'RUT', categoria: 'identificacion' },
    { id: 'email', label: 'Correo electrónico', categoria: 'contacto' },
    { id: 'telefono', label: 'Teléfono', categoria: 'contacto' },
    { id: 'direccion', label: 'Dirección', categoria: 'contacto' },
    { id: 'fecha_nacimiento', label: 'Fecha de nacimiento', categoria: 'personal' }
  ];

  const datosSensibles = [
    { id: 'salud', label: 'Datos de salud', categoria: 'medico' },
    { id: 'antecedentes', label: 'Antecedentes penales', categoria: 'judicial' },
    { id: 'situacion_economica', label: 'Situación socioeconómica', categoria: 'financiero' },
    { id: 'biometricos', label: 'Datos biométricos', categoria: 'biometrico' }
  ];

  useEffect(() => {
    if (isRestricted()) {
      // Usuario demo - mostrar alerta
      setErrors({ demo: 'Función disponible solo en versión completa' });
    }
  }, [isRestricted]);

  const handleNext = () => {
    if (validateStep()) {
      if (activeStep === steps.length - 2) {
        // Último paso - generar resultado
        generateResult();
      } else {
        setActiveStep(prev => prev + 1);
      }
    }
  };

  const handleStepClick = (stepIndex) => {
    if (stepIndex <= activeStep || !isRestricted()) {
      setActiveStep(stepIndex);
      if (audioEnabled) {
        playStepAudio(stepIndex);
      }
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const validateStep = () => {
    const newErrors = {};
    
    switch(activeStep) {
      case 0:
        if (!formData.proceso) {
          newErrors.proceso = 'Selecciona un proceso';
        }
        break;
      case 1:
        if (formData.finalidades.length === 0) {
          newErrors.finalidades = 'Selecciona al menos una finalidad';
        }
        break;
      case 2:
        if (formData.datosComunes.length === 0) {
          newErrors.datosComunes = 'Selecciona al menos un tipo de datos';
        }
        break;
      case 3:
        if (!formData.retencion.durante || !formData.retencion.despues) {
          newErrors.retencion = 'Completa los campos de retención';
        }
        break;
      case 4:
        if (formData.destinatarios.internos.length === 0) {
          newErrors.destinatarios = 'Selecciona al menos un destinatario interno';
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateResult = async () => {
    if (isRestricted()) {
      alert('Esta funcionalidad requiere acceso completo. Contacta para obtener credenciales.');
      return;
    }

    // Simular generación de resultado
    setIsCompleted(true);
    setActiveStep(steps.length - 1);
    
    // Reproducir audio de finalización si está habilitado
    if (audioEnabled) {
      playStepAudio(5);
    }
    
    // Aquí iría la llamada al backend para generar el mapeo real
    try {
      // const response = await fetch('/api/v1/modulo-cero/generar-mapeo', {
      //   method: 'POST',
      //   body: JSON.stringify(formData)
      // });
      // const resultado = await response.json();
    } catch (error) {
      console.error('Error generando resultado:', error);
    }
  };

  const playStepAudio = (stepNumber) => {
    if (!audioEnabled) return;
    
    // Detener audio actual si existe
    if (currentAudio && typeof currentAudio.pause === 'function') {
      try {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      } catch (error) {
        console.warn('Error pausando audio anterior:', error);
      }
    }
    
    // Cancelar cualquier síntesis en curso
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }

    const audioTexts = {
      0: "Bienvenida a tu primer mapeo de datos. Selecciona el proceso de tu área que quieres analizar. Esto te ayudará a entender cómo manejas la información personal en tu trabajo diario.",
      1: "Excelente elección. Ahora define para qué usas los datos en este proceso. Las finalidades deben ser específicas y claras, ya que determinan todo el tratamiento posterior.",
      2: "Identifica qué tipos de información recopilas. Los datos comunes requieren protección básica, mientras que los datos sensibles necesitan medidas especiales de seguridad.",
      3: "Define cuánto tiempo conservas los datos. Esto debe estar justificado por las finalidades y las obligaciones legales. No puedes guardar información indefinidamente.",
      4: "Especifica con quién compartes los datos. Los destinatarios internos son de tu organización, los externos requieren contratos especiales de protección.",
      5: "¡Felicitaciones! Has creado tu primer mapeo visual de datos. Este diagrama muestra el flujo completo desde la recolección hasta la eliminación, con todas las interrelaciones y clasificación por sensibilidad identificadas."
    };

    const text = audioTexts[stepNumber] || "";
    if (text && 'speechSynthesis' in window) {
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
      
      utterance.onstart = () => {
        setIsPlaying(true);
        setCurrentAudio(utterance);
      };
      utterance.onend = () => {
        setIsPlaying(false);
        setCurrentAudio(null);
      };
      utterance.onerror = () => {
        setIsPlaying(false);
        setCurrentAudio(null);
      };
      
      speechSynthesis.speak(utterance);
    }
  };

  const playExplanationAudio = () => {
    if (isPlaying) {
      // Detener audio actual
      try {
        speechSynthesis.cancel();
        setIsPlaying(false);
        setCurrentAudio(null);
      } catch (error) {
        console.warn('Error deteniendo audio:', error);
      }
    } else {
      // Reproducir explicación del paso actual
      playStepAudio(activeStep);
    }
  };

  // Reproducir audio automáticamente al cambiar de paso (si está habilitado)
  useEffect(() => {
    if (audioEnabled && activeStep < steps.length - 1) {
      // Pequeño delay para que se renderice el contenido primero
      setTimeout(() => {
        playStepAudio(activeStep);
      }, 500);
    }
  }, [activeStep, audioEnabled]);

  // Cargar voces al inicializar
  useEffect(() => {
    if ('speechSynthesis' in window) {
      // Cargar voces
      speechSynthesis.getVoices();
      speechSynthesis.addEventListener('voiceschanged', () => {
        speechSynthesis.getVoices();
      });
    }
  }, []);

  const renderStepContent = () => {
    if (isRestricted() && activeStep > 0) {
      return (
        <Alert severity="warning" sx={{ my: 4 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            🔒 Contenido Restringido
          </Typography>
          <Typography>
            Estás viendo el modo demo. Para acceder al formulario interactivo completo y generar tu mapeo real, 
            necesitas credenciales de acceso completo.
          </Typography>
          <Button 
            variant="contained" 
            sx={{ mt: 2 }}
            onClick={() => navigate('/dashboard')}
          >
            Volver al Dashboard
          </Button>
        </Alert>
      );
    }

    switch(activeStep) {
      case 0:
        return (
          <Box>
            <Typography variant="h5" sx={{ mb: 3, textAlign: 'center' }}>
              Selecciona el proceso que quieres mapear
            </Typography>
            <Grid container spacing={3}>
              {procesosEjemplo.map((proceso) => (
                <Grid item xs={12} sm={6} md={3} key={proceso.id}>
                  <Card 
                    elevation={formData.proceso === proceso.id ? 8 : 2}
                    sx={{ 
                      cursor: 'pointer',
                      transform: formData.proceso === proceso.id ? 'scale(1.05)' : 'scale(1)',
                      bgcolor: formData.proceso === proceso.id ? 'primary.light' : 'background.paper',
                      transition: 'all 0.3s ease-in-out'
                    }}
                    onClick={() => setFormData({...formData, proceso: proceso.id, area: proceso.area})}
                  >
                    <CardContent sx={{ textAlign: 'center', p: 3 }}>
                      <Typography variant="h1" sx={{ fontSize: 60, mb: 2 }}>
                        {proceso.icono}
                      </Typography>
                      <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                        {proceso.nombre}
                      </Typography>
                      <Chip 
                        label={proceso.area} 
                        size="small" 
                        color="primary"
                        sx={{ mb: 2 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {proceso.descripcion}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            {errors.proceso && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {errors.proceso}
              </Alert>
            )}
          </Box>
        );

      case 1:
        const finalidades = finalidadesPorProceso[formData.proceso] || [];
        return (
          <Box>
            <Typography variant="h5" sx={{ mb: 3, textAlign: 'center' }}>
              ¿Para qué usas estos datos?
            </Typography>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Proceso: {procesosEjemplo.find(p => p.id === formData.proceso)?.nombre}
              </Typography>
              <FormControl component="fieldset">
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  Selecciona todas las finalidades que apliquen:
                </Typography>
                {finalidades.map((finalidad) => (
                  <FormControlLabel
                    key={finalidad}
                    control={
                      <Checkbox
                        checked={formData.finalidades.includes(finalidad)}
                        onChange={(e) => {
                          const newFinalidades = e.target.checked 
                            ? [...formData.finalidades, finalidad]
                            : formData.finalidades.filter(f => f !== finalidad);
                          setFormData({...formData, finalidades: newFinalidades});
                        }}
                      />
                    }
                    label={finalidad}
                  />
                ))}
              </FormControl>
            </Paper>
            {errors.finalidades && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {errors.finalidades}
              </Alert>
            )}
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h5" sx={{ mb: 3, textAlign: 'center' }}>
              ¿Qué información recopilas?
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, bgcolor: 'success.light' }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    📋 DATOS PERSONALES COMUNES
                  </Typography>
                  {datosComunes.map((dato) => (
                    <FormControlLabel
                      key={dato.id}
                      control={
                        <Checkbox
                          checked={formData.datosComunes.includes(dato.id)}
                          onChange={(e) => {
                            const newDatos = e.target.checked 
                              ? [...formData.datosComunes, dato.id]
                              : formData.datosComunes.filter(d => d !== dato.id);
                            setFormData({...formData, datosComunes: newDatos});
                          }}
                        />
                      }
                      label={dato.label}
                      sx={{ display: 'block', mb: 1 }}
                    />
                  ))}
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, bgcolor: 'warning.light' }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    ⚠️ DATOS SENSIBLES
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2, color: 'warning.contrastText' }}>
                    Requieren consentimiento expreso y medidas especiales
                  </Typography>
                  {datosSensibles.map((dato) => (
                    <FormControlLabel
                      key={dato.id}
                      control={
                        <Checkbox
                          checked={formData.datosSensibles.includes(dato.id)}
                          onChange={(e) => {
                            const newDatos = e.target.checked 
                              ? [...formData.datosSensibles, dato.id]
                              : formData.datosSensibles.filter(d => d !== dato.id);
                            setFormData({...formData, datosSensibles: newDatos});
                          }}
                          color="warning"
                        />
                      }
                      label={dato.label}
                      sx={{ display: 'block', mb: 1 }}
                    />
                  ))}
                </Paper>
              </Grid>
            </Grid>

            {formData.datosSensibles.length > 0 && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                ⚠️ Has seleccionado {formData.datosSensibles.length} tipos de datos sensibles. 
                Esto requiere medidas especiales de protección.
              </Alert>
            )}

            {errors.datosComunes && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {errors.datosComunes}
              </Alert>
            )}
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h5" sx={{ mb: 3, textAlign: 'center' }}>
              ¿Cuánto tiempo guardas los datos?
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Durante la relación</InputLabel>
                  <Select
                    value={formData.retencion.durante}
                    label="Durante la relación"
                    onChange={(e) => setFormData({
                      ...formData, 
                      retencion: {...formData.retencion, durante: e.target.value}
                    })}
                  >
                    <MenuItem value="activa">Mientras esté activa</MenuItem>
                    <MenuItem value="contractual">Duración del contrato</MenuItem>
                    <MenuItem value="proyecto">Duración del proyecto</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Después del término</InputLabel>
                  <Select
                    value={formData.retencion.despues}
                    label="Después del término"
                    onChange={(e) => setFormData({
                      ...formData, 
                      retencion: {...formData.retencion, despues: e.target.value}
                    })}
                  >
                    <MenuItem value="1_ano">1 año</MenuItem>
                    <MenuItem value="2_anos">2 años</MenuItem>
                    <MenuItem value="5_anos">5 años</MenuItem>
                    <MenuItem value="10_anos">10 años</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Justificación legal"
                  placeholder="Ej: Código del Trabajo, Obligaciones tributarias, etc."
                  value={formData.retencion.justificacion}
                  onChange={(e) => setFormData({
                    ...formData, 
                    retencion: {...formData.retencion, justificacion: e.target.value}
                  })}
                />
              </Grid>
            </Grid>

            {errors.retencion && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {errors.retencion}
              </Alert>
            )}
          </Box>
        );

      case 4:
        return (
          <Box>
            <Typography variant="h5" sx={{ mb: 3, textAlign: 'center' }}>
              ¿Con quién compartes los datos?
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    🏢 Destinatarios Internos
                  </Typography>
                  {['Gerencia', 'RRHH', 'Finanzas', 'IT', 'Legal'].map((interno) => (
                    <FormControlLabel
                      key={interno}
                      control={
                        <Checkbox
                          checked={formData.destinatarios.internos.includes(interno)}
                          onChange={(e) => {
                            const newInternos = e.target.checked 
                              ? [...formData.destinatarios.internos, interno]
                              : formData.destinatarios.internos.filter(i => i !== interno);
                            setFormData({
                              ...formData, 
                              destinatarios: {
                                ...formData.destinatarios,
                                internos: newInternos
                              }
                            });
                          }}
                        />
                      }
                      label={interno}
                      sx={{ display: 'block', mb: 1 }}
                    />
                  ))}
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    🏛️ Destinatarios Externos
                  </Typography>
                  {['Proveedores', 'Bancos', 'Previred', 'SII', 'Mutual'].map((externo) => (
                    <FormControlLabel
                      key={externo}
                      control={
                        <Checkbox
                          checked={formData.destinatarios.externos.includes(externo)}
                          onChange={(e) => {
                            const newExternos = e.target.checked 
                              ? [...formData.destinatarios.externos, externo]
                              : formData.destinatarios.externos.filter(e => e !== externo);
                            setFormData({
                              ...formData, 
                              destinatarios: {
                                ...formData.destinatarios,
                                externos: newExternos
                              }
                            });
                          }}
                        />
                      }
                      label={externo}
                      sx={{ display: 'block', mb: 1 }}
                    />
                  ))}
                </Paper>
              </Grid>
            </Grid>

            {errors.destinatarios && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {errors.destinatarios}
              </Alert>
            )}
          </Box>
        );

      case 5:
        return (
          <Box>
            {/* Header con Audio */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                🗺️ Mapeo Visual Completo
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  variant={audioEnabled ? 'contained' : 'outlined'}
                  startIcon={audioEnabled ? <VolumeUp /> : <VolumeOff />}
                  onClick={() => setAudioEnabled(!audioEnabled)}
                >
                  {audioEnabled ? 'Audio On' : 'Audio Off'}
                </Button>
                <Button
                  size="small"
                  variant={isPlaying ? 'contained' : 'outlined'}
                  startIcon={isPlaying ? <Stop /> : <PlayArrow />}
                  onClick={() => playExplanationAudio()}
                >
                  {isPlaying ? 'Detener' : 'Explicar'}
                </Button>
              </Box>
            </Box>

            {/* Componente de Diagrama Visual */}
            <DiagramaMapeoVisual 
              formData={formData}
              procesosEjemplo={procesosEjemplo}
              datosComunes={datosComunes}
              datosSensibles={datosSensibles}
            />

            {/* Estadísticas del Mapeo */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={3}>
                <Card elevation={6}>
                  <CardContent>
                    <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 700 }}>
                      1
                    </Typography>
                    <Typography variant="h6">Proceso Mapeado</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {procesosEjemplo.find(p => p.id === formData.proceso)?.nombre}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={3}>
                <Card elevation={6}>
                  <CardContent>
                    <Typography variant="h4" sx={{ color: 'success.main', fontWeight: 700 }}>
                      {formData.datosComunes.length + formData.datosSensibles.length}
                    </Typography>
                    <Typography variant="h6">Tipos de Datos</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formData.datosSensibles.length > 0 && `${formData.datosSensibles.length} sensibles`}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={3}>
                <Card elevation={6}>
                  <CardContent>
                    <Typography variant="h4" sx={{ color: 'warning.main', fontWeight: 700 }}>
                      {formData.destinatarios.internos.length + formData.destinatarios.externos.length}
                    </Typography>
                    <Typography variant="h6">Destinatarios</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formData.destinatarios.externos.length > 0 && `${formData.destinatarios.externos.length} externos`}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={3}>
                <Card elevation={6}>
                  <CardContent>
                    <Typography variant="h4" sx={{ color: 'info.main', fontWeight: 700 }}>
                      {formData.finalidades.length}
                    </Typography>
                    <Typography variant="h6">Finalidades</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Propósitos definidos
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Alert severity="success" sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                🏆 ¡Felicitaciones! Has completado tu primer inventario LPDP
              </Typography>
              <Typography sx={{ mb: 2 }}>
                Este diagrama visual muestra cómo los datos fluyen a través de tu proceso, 
                desde la recolección hasta la eliminación, incluyendo todas las interrelaciones 
                y la clasificación por sensibilidad.
              </Typography>
              <Typography>
                En la versión completa, este mapeo se convertirá automáticamente en:
              </Typography>
              <ul style={{ textAlign: 'left', marginTop: '10px' }}>
                <li>📄 Documento RAT oficial</li>
                <li>📊 Diagrama de flujo exportable</li>
                <li>✅ Matriz de cumplimiento</li>
                <li>🔍 Análisis de riesgos detallado</li>
              </ul>
            </Alert>

            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Button 
                variant="contained" 
                size="large" 
                sx={{ mr: 2 }}
                onClick={() => navigate('/dashboard')}
              >
                Volver al Dashboard
              </Button>
              <Button 
                variant="outlined" 
                size="large"
                startIcon={<Download />}
                sx={{ mr: 2 }}
              >
                Exportar Diagrama
              </Button>
              <Button 
                variant="outlined" 
                size="large"
                onClick={() => {
                  setActiveStep(0);
                  setFormData({
                    proceso: '',
                    area: '',
                    finalidades: [],
                    datosComunes: [],
                    datosSensibles: [],
                    retencion: { durante: '', despues: '', justificacion: '' },
                    destinatarios: { internos: [], externos: [] }
                  });
                }}
              >
                Mapear Otro Proceso
              </Button>
            </Box>
          </Box>
        );

      default:
        return <div>Paso no encontrado</div>;
    }
  };

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }}>
            🗺️ Creador de Mapeo Interactivo
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Construye tu primer inventario LPDP paso a paso
          </Typography>
        </Box>

        {/* Progress */}
        <Box sx={{ mb: 4 }}>
          <LinearProgress 
            variant="determinate" 
            value={(activeStep / (steps.length - 1)) * 100}
            sx={{ height: 8, borderRadius: 4, mb: 2 }}
          />
          <Typography variant="body2" color="text.secondary">
            Paso {activeStep + 1} de {steps.length}
          </Typography>
        </Box>

        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }} alternativeLabel>
          {steps.map((step, index) => (
            <Step key={step.label} onClick={() => handleStepClick(index)} sx={{ cursor: 'pointer' }}>
              <StepLabel icon={step.icon}>
                <Typography variant="caption">{step.label}</Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Controles de Audio */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
          <Button
            size="small"
            variant={audioEnabled ? 'contained' : 'outlined'}
            startIcon={audioEnabled ? <VolumeUp /> : <VolumeOff />}
            onClick={() => {
              setAudioEnabled(!audioEnabled);
              if (isPlaying) {
                speechSynthesis.cancel();
                setIsPlaying(false);
              }
            }}
          >
            Audio {audioEnabled ? 'Activado' : 'Desactivado'}
          </Button>
          
          {audioEnabled && (
            <Button
              size="small"
              variant={isPlaying ? 'contained' : 'outlined'}
              startIcon={isPlaying ? <Stop /> : <PlayArrow />}
              onClick={playExplanationAudio}
            >
              {isPlaying ? 'Detener' : 'Explicar Paso'}
            </Button>
          )}
        </Box>

        {/* Content */}
        <Fade in timeout={500}>
          <Box sx={{ minHeight: 400, mb: 4 }}>
            {renderStepContent()}
          </Box>
        </Fade>

        {/* Navigation */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          pt: 3,
          borderTop: 1,
          borderColor: 'divider'
        }}>
          <Button 
            variant="outlined"
            onClick={handleBack}
            disabled={activeStep === 0}
            size="large"
          >
            ← Anterior
          </Button>

          <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center' }}>
            {steps[activeStep].description}
          </Typography>
          
          <Button 
            variant="contained"
            onClick={handleNext}
            disabled={activeStep === steps.length - 1}
            size="large"
          >
            {activeStep === steps.length - 2 ? 'Generar Mapeo →' : 'Siguiente →'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ModuloCeroInteractivo;