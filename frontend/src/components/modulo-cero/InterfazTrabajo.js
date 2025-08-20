import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Card,
  CardContent,
  FormControl,
  FormControlLabel,
  Checkbox,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  Chip,
  Fade,
  Slide,
  Button,
  IconButton,
  Tooltip,
  Stepper,
  Step,
  StepLabel,
  LinearProgress,
  Alert,
  Avatar
} from '@mui/material';
import { 
  Business as BusinessIcon,
  Schedule as ScheduleIcon,
  Security as SecurityIcon,
  Share as ShareIcon,
  PlayArrow,
  Stop,
  VolumeUp,
  VolumeOff,
  NavigateNext,
  NavigateBefore,
  Visibility,
  AccountTree,
  Timeline,
  Assessment
} from '@mui/icons-material';

const InterfazTrabajo = ({ duration = 90, onNext, onPrev, isAutoPlay = false }) => {
  const [activeSection, setActiveSection] = useState(-1); // Empezar sin mostrar nada
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [formData, setFormData] = useState({
    actividad: 'Contratación de Personal',
    datos: ['rut', 'nombre', 'cv'],
    datosSensibles: ['antecedentes', 'examenes'],
    finalidades: ['evaluar', 'cumplir_ley'],
    accesos: ['rrhh', 'gerencia', 'previred'],
    retencion: '5_anos'
  });

  useEffect(() => {
    if (!isAutoPlay) return;
    
    const sectionDuration = duration * 1000 / 5;
    
    const timer = setInterval(() => {
      setActiveSection(prev => (prev < 4 ? prev + 1 : prev));
    }, sectionDuration);

    return () => clearInterval(timer);
  }, [duration, isAutoPlay]);

  // Función para manejar doble click en pantalla
  const handleDoubleClick = () => {
    if (activeSection < 4) {
      const nextSection = activeSection + 1;
      setActiveSection(nextSection);
      if (audioEnabled) playStepAudio(nextSection);
    } else if (onNext) {
      onNext();
    }
  };

  const handleNextStep = () => {
    if (activeSection < 4) {
      const nextSection = activeSection + 1;
      setActiveSection(nextSection);
      if (audioEnabled) playStepAudio(nextSection);
    } else if (onNext) {
      onNext();
    }
  };

  const handlePrevStep = () => {
    if (activeSection > 0) {
      setActiveSection(prev => prev - 1);
    } else if (onPrev) {
      onPrev();
    }
  };

  const playStepAudio = (stepNumber) => {
    if (!audioEnabled) return;
    
    const audioTexts = {
      0: "Bienvenida a tu inventario de datos en acción. Esta es la interfaz real del sistema donde completas el mapeo detallado de cada proceso de tratamiento de datos personales en tu organización. Aquí transformas la teoría en práctica, documentando de manera sistemática y exhaustiva cómo tu empresa maneja la información personal. Este formulario interactivo te guía paso a paso para crear un registro completo que cumple con todos los requisitos de la Ley veintiún mil setecientos diecinueve.",
      1: "Sección uno: Datos que recopilas en este proceso específico. Debes seleccionar meticulosamente todos los tipos de información personal que manejas, diferenciando entre datos personales comunes como RUT, nombre, email y teléfono, y datos sensibles como información de salud, datos biométricos, situación socioeconómica o afiliación sindical. Es crucial identificar también datos de niños, niñas y adolescentes que requieren protección especial. Esta clasificación determina el nivel de protección y las medidas de seguridad que debes implementar.",
      2: "Sección dos: Finalidades específicas y bases legales del tratamiento. Define con precisión para qué utilizas cada tipo de dato personal, estableciendo finalidades concretas como evaluación de candidatos, cumplimiento de obligaciones laborales, o gestión de contratos. Cada finalidad debe tener una base legal clara: consentimiento del titular, ejecución de contrato, cumplimiento de obligación legal, o interés legítimo. Esta documentación es fundamental para justificar el tratamiento ante la Agencia de Protección de Datos Personales.",
      3: "Sección tres: Destinatarios y accesos a los datos personales. Identifica exhaustivamente tanto los destinatarios internos como externos que tienen acceso a la información. Los internos incluyen áreas como Recursos Humanos, Gerencia, Finanzas, Tecnología. Los externos abarcan proveedores de servicios, entidades del Estado como Previred, SII, Dirección del Trabajo, socios comerciales, bancos, compañías de seguros, y sistemas de bienestar. Cada destinatario debe estar justificado y documentado con contratos de tratamiento.",
      4: "Sección cuatro: Plazos de retención y medidas de seguridad implementadas. Define cuánto tiempo conservas los datos durante la relación vigente y después de terminada, basándose en obligaciones legales, necesidades del negocio, y derechos del titular. Documenta las medidas de seguridad técnicas como encriptación de base de datos, control de acceso con claves, respaldos automáticos, y medidas organizacionales como contratos de confidencialidad, capacitación del personal, y políticas de privacidad. Estas medidas deben ser proporcionales al riesgo del tratamiento."
    };
    
    // Sincronización REAL con el audio
    const syncAnimations = (stepNum) => {
      setActiveSection(-1);
      
      if (stepNum === 0) {
        // Introducción general
        setTimeout(() => setActiveSection(-1), 100);
      } else if (stepNum === 1) {
        // "Sección uno: Datos que recopilas" - mostrar sección 1
        setTimeout(() => setActiveSection(0), 500);
      } else if (stepNum === 2) {
        // "Sección dos: Finalidades" - mostrar sección 2
        setActiveSection(0);
        setTimeout(() => setActiveSection(1), 500);
      } else if (stepNum === 3) {
        // "Sección tres: Destinatarios" - mostrar sección 3
        setActiveSection(1);
        setTimeout(() => setActiveSection(2), 500);
      } else if (stepNum === 4) {
        // "Sección cuatro: Plazos" - mostrar sección 4
        setActiveSection(2);
        setTimeout(() => setActiveSection(3), 500);
        // Mostrar medidas de seguridad al final
        setTimeout(() => setActiveSection(4), 10000);
      }
    };

    const text = audioTexts[stepNumber] || "";
    if (text && 'speechSynthesis' in window) {
      try {
        speechSynthesis.cancel();
      } catch (error) {
        console.warn('Error cancelando síntesis anterior:', error);
      }
      
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = speechSynthesis.getVoices();
      const maleSpanishVoice = voices.find(voice => 
        (voice.lang.includes('es') || voice.lang.includes('ES')) && 
        (voice.name.toLowerCase().includes('male') && !voice.name.toLowerCase().includes('female') ||
         voice.name.toLowerCase().includes('hombre') ||
         voice.name.toLowerCase().includes('pedro') ||
         voice.name.toLowerCase().includes('diego') ||
         voice.name.toLowerCase().includes('antonio') ||
         voice.name.toLowerCase().includes('miguel'))
      ) || voices.find(voice => voice.lang.includes('es') || voice.lang.includes('ES'));
      
      if (maleSpanishVoice) utterance.voice = maleSpanishVoice;
      
      utterance.lang = 'es-MX'; // Español latino
      utterance.rate = 0.85; // Más fluido
      utterance.pitch = 0.9; // Voz masculina más grave
      utterance.volume = 0.9;
      
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = (error) => {
        console.warn('Error en síntesis de voz:', error);
        setIsPlaying(false);
      };
      
      // Activar sincronización
      syncAnimations(stepNumber);
      
      try {
        speechSynthesis.speak(utterance);
      } catch (error) {
        console.warn('Error iniciando síntesis de voz:', error);
        setIsPlaying(false);
      }
    }
  };

  useEffect(() => {
    if (audioEnabled) {
      setTimeout(() => playStepAudio(0), 1000);
    }
  }, []);

  const handleCheckboxChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value) 
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const sectionTitles = [
    'Datos que Recopilas',
    'Finalidades de Uso',
    'Destinatarios',
    'Retención',
    'Medidas de Seguridad'
  ];

  return (
    <Box 
      sx={{ py: 4, position: 'relative' }}
      onDoubleClick={handleDoubleClick}
    >
      {/* Controles de Audio */}
      <Box sx={{ position: 'absolute', top: 0, right: 0, display: 'flex', gap: 1, zIndex: 10 }}>
        <Tooltip title={audioEnabled ? "Desactivar audio" : "Activar audio"}>
          <IconButton
            size="small"
            onClick={() => {
              setAudioEnabled(!audioEnabled);
              if (isPlaying) {
                speechSynthesis.cancel();
                setIsPlaying(false);
              }
            }}
            color={audioEnabled ? 'primary' : 'default'}
          >
            {audioEnabled ? <VolumeUp /> : <VolumeOff />}
          </IconButton>
        </Tooltip>
        
        {audioEnabled && (
          <Tooltip title={isPlaying ? "Detener" : "Reproducir explicación"}>
            <IconButton
              size="small"
              onClick={() => {
                if (isPlaying) {
                  speechSynthesis.cancel();
                  setIsPlaying(false);
                } else {
                  playStepAudio(activeSection);
                }
              }}
              color={isPlaying ? 'secondary' : 'default'}
            >
              {isPlaying ? <Stop /> : <PlayArrow />}
            </IconButton>
          </Tooltip>
        )}
      </Box>


      {/* Área invisible para click simple - no perder foco */}
      <Box 
        sx={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          height: 100, 
          cursor: 'pointer',
          zIndex: 1,
          backgroundColor: 'transparent'
        }}
        onClick={handleNextStep}
        title="Click para avanzar"
      />
      {/* Título */}
      <Fade in timeout={1000}>
        <Typography variant="h3" align="center" sx={{ mb: 2, fontWeight: 700 }}>
          💼 TU INVENTARIO EN ACCIÓN
        </Typography>
      </Fade>

      <Fade in timeout={1500}>
        <Typography variant="h6" align="center" color="text.secondary" sx={{ mb: 2 }}>
          Así se ve el formulario real que completas para cada proceso
        </Typography>
      </Fade>

      {/* Progreso Visual */}
      <Box sx={{ mb: 4, maxWidth: 800, mx: 'auto' }}>
        <LinearProgress 
          variant="determinate" 
          value={activeSection === -1 ? 0 : ((activeSection + 1) / 5) * 100}
          sx={{ height: 8, borderRadius: 4, mb: 2 }}
        />
        <Stepper activeStep={activeSection} alternativeLabel>
          {sectionTitles.map((title, index) => (
            <Step key={title}>
              <StepLabel 
                onClick={() => {
                  setActiveSection(index);
                  if (audioEnabled) playStepAudio(index);
                }}
                sx={{ cursor: 'pointer' }}
              >
                <Typography variant="caption">{title}</Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      {/* Diagrama Visual del Proceso */}
      <Fade in timeout={2000}>
        <Paper sx={{ p: 3, mb: 4, maxWidth: 1000, mx: 'auto', bgcolor: 'grey.50' }}>
          <Typography variant="h6" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
            🔄 Flujo Visual del Proceso de Mapeo
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'center', md: 'space-between' }, flexWrap: 'wrap', gap: 2 }}>
            {[
              { icon: '📊', label: 'Identificar\nDatos', color: 'info.light', active: activeSection >= 0 },
              { icon: '🎯', label: 'Definir\nFinalidades', color: 'success.light', active: activeSection >= 1 },
              { icon: '👥', label: 'Mapear\nDestinatarios', color: 'warning.light', active: activeSection >= 2 },
              { icon: '⏱️', label: 'Configurar\nRetención', color: 'error.light', active: activeSection >= 3 },
              { icon: '🔒', label: 'Aplicar\nSeguridad', color: 'secondary.light', active: activeSection >= 4 }
            ].map((step, index) => (
              <React.Fragment key={index}>
                <Paper 
                  elevation={step.active ? 6 : 2}
                  sx={{
                    p: 2,
                    minWidth: { xs: 80, sm: 120 },
                    textAlign: 'center',
                    bgcolor: step.active ? step.color : 'background.paper',
                    transform: step.active ? 'scale(1.1)' : 'scale(1)',
                    transition: 'all 0.3s ease-in-out',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    setActiveSection(index);
                    if (audioEnabled) playStepAudio(index);
                  }}
                >
                  <Typography variant="h3" sx={{ fontSize: 40 }}>{step.icon}</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600, whiteSpace: 'pre-line' }}>
                    {step.label}
                  </Typography>
                  {step.active && (
                    <Box sx={{ mt: 1 }}>
                      <Chip size="small" label="Activo" color="primary" />
                    </Box>
                  )}
                </Paper>
                {index < 4 && (
                  <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 40 }}>
                    <Box sx={{ flexGrow: 1, height: 2, bgcolor: step.active ? 'primary.main' : 'grey.300' }} />
                    <Typography variant="h6" sx={{ mx: 1, color: step.active ? 'primary.main' : 'grey.400' }}>→</Typography>
                  </Box>
                )}
              </React.Fragment>
            ))}
          </Box>
        </Paper>
      </Fade>

      {/* Formulario simulado */}
      <Card elevation={8} sx={{ maxWidth: 1200, mx: 'auto' }}>
        <CardContent sx={{ p: 4 }}>
          {/* Header del formulario */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 4, 
            pb: 2, 
            borderBottom: 1, 
            borderColor: 'divider' 
          }}>
            <BusinessIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                ACTIVIDAD: Contratación de Personal
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Área: Recursos Humanos | Responsable: Gerente RRHH
              </Typography>
            </Box>
          </Box>

          <Grid container spacing={4}>
            {/* Sección 1: Datos que recopilas */}
            <Grid item xs={12} md={6}>
              <Slide in={activeSection >= 0} direction="right" timeout={1000}>
                <Paper 
                  elevation={activeSection >= 0 ? 4 : 2}
                  sx={{ 
                    p: 3,
                    bgcolor: activeSection >= 0 ? 'info.light' : 'background.paper',
                    transform: activeSection >= 0 ? 'scale(1.02)' : 'scale(1)',
                    transition: 'all 0.5s ease-in-out'
                  }}
                >
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    [1] DATOS QUE RECOPILAS
                  </Typography>
                  
                  {[
                    { id: 'rut', label: 'RUT', checked: true },
                    { id: 'nombre', label: 'Nombre completo', checked: true },
                    { id: 'cv', label: 'Curriculum vitae', checked: true },
                    { id: 'referencias', label: 'Referencias laborales', checked: false }
                  ].map((item) => (
                    <FormControlLabel
                      key={item.id}
                      control={
                        <Checkbox 
                          checked={item.checked}
                          onChange={(e) => handleCheckboxChange('datos', item.id)}
                        />
                      }
                      label={item.label}
                      sx={{ display: 'block', mb: 1 }}
                    />
                  ))}

                  <Box sx={{ mt: 2, p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
                    <Typography variant="subtitle2" color="warning.contrastText" sx={{ fontWeight: 600, mb: 1 }}>
                      ⚠️ DATOS SENSIBLES:
                    </Typography>
                    {[
                      { id: 'antecedentes', label: 'Antecedentes penales', checked: true },
                      { id: 'examenes', label: 'Exámenes médicos', checked: true }
                    ].map((item) => (
                      <FormControlLabel
                        key={item.id}
                        control={
                          <Checkbox 
                            checked={item.checked}
                            color="warning"
                          />
                        }
                        label={item.label}
                        sx={{ display: 'block', mb: 1 }}
                      />
                    ))}
                  </Box>
                </Paper>
              </Slide>
            </Grid>

            {/* Sección 2: Para qué */}
            <Grid item xs={12} md={6}>
              <Slide in={activeSection >= 1} direction="left" timeout={1000}>
                <Paper 
                  elevation={activeSection >= 1 ? 4 : 2}
                  sx={{ 
                    p: 3,
                    bgcolor: activeSection >= 1 ? 'success.light' : 'background.paper',
                    transform: activeSection >= 1 ? 'scale(1.02)' : 'scale(1)',
                    transition: 'all 0.5s ease-in-out'
                  }}
                >
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    [2] ¿PARA QUÉ?
                  </Typography>
                  
                  {[
                    { id: 'evaluar', label: 'Evaluar candidato', checked: true },
                    { id: 'cumplir_ley', label: 'Cumplir ley laboral', checked: true },
                    { id: 'contrato', label: 'Gestionar contrato', checked: true }
                  ].map((item) => (
                    <FormControlLabel
                      key={item.id}
                      control={
                        <Checkbox 
                          checked={item.checked}
                          color="success"
                        />
                      }
                      label={item.label}
                      sx={{ display: 'block', mb: 1 }}
                    />
                  ))}

                  <Box sx={{ mt: 2 }}>
                    <TextField
                      fullWidth
                      label="Base legal"
                      value="Código del Trabajo, Art. 154"
                      variant="outlined"
                      size="small"
                      InputProps={{ readOnly: true }}
                    />
                  </Box>
                </Paper>
              </Slide>
            </Grid>

            {/* Sección 3: Quién accede */}
            <Grid item xs={12} md={6}>
              <Slide in={activeSection >= 2} direction="right" timeout={1000}>
                <Paper 
                  elevation={activeSection >= 2 ? 4 : 2}
                  sx={{ 
                    p: 3,
                    bgcolor: activeSection >= 2 ? 'warning.light' : 'background.paper',
                    transform: activeSection >= 2 ? 'scale(1.02)' : 'scale(1)',
                    transition: 'all 0.5s ease-in-out'
                  }}
                >
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    [3] ¿QUIÉN ACCEDE?
                  </Typography>
                  
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Internos:
                  </Typography>
                  {['RRHH', 'Gerencia', 'Finanzas'].map((item) => (
                    <Chip 
                      key={item}
                      label={item}
                      size="small"
                      sx={{ mr: 1, mb: 1 }}
                      color="primary"
                    />
                  ))}

                  <Typography variant="subtitle2" sx={{ mb: 1, mt: 2 }}>
                    Externos:
                  </Typography>
                  {['Previred', 'Mutual'].map((item) => (
                    <Chip 
                      key={item}
                      label={item}
                      size="small"
                      sx={{ mr: 1, mb: 1 }}
                      color="warning"
                    />
                  ))}
                </Paper>
              </Slide>
            </Grid>

            {/* Sección 4: Cuánto guardas */}
            <Grid item xs={12} md={6}>
              <Slide in={activeSection >= 3} direction="left" timeout={1000}>
                <Paper 
                  elevation={activeSection >= 3 ? 4 : 2}
                  sx={{ 
                    p: 3,
                    bgcolor: activeSection >= 3 ? 'error.light' : 'background.paper',
                    transform: activeSection >= 3 ? 'scale(1.02)' : 'scale(1)',
                    transition: 'all 0.5s ease-in-out'
                  }}
                >
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    [4] ¿CUÁNTO GUARDAS?
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Durante:</strong> Relación laboral
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Después:</strong> 5 años
                    </Typography>
                    <Typography variant="body2">
                      <strong>Base:</strong> Código del Trabajo
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ScheduleIcon color="error" />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Eliminación automática programada
                    </Typography>
                  </Box>
                </Paper>
              </Slide>
            </Grid>

            {/* Sección 5: Medidas de seguridad */}
            <Grid item xs={12}>
              <Slide in={activeSection >= 4} direction="up" timeout={1000}>
                <Paper 
                  elevation={activeSection >= 4 ? 6 : 2}
                  sx={{ 
                    p: 4,
                    bgcolor: activeSection >= 4 ? 'secondary.light' : 'background.paper',
                    transform: activeSection >= 4 ? 'scale(1.02)' : 'scale(1)',
                    transition: 'all 0.5s ease-in-out'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <SecurityIcon sx={{ fontSize: 30, mr: 2 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      [5] MEDIDAS DE SEGURIDAD
                    </Typography>
                  </Box>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={6} md={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4">🔐</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          Base datos encriptada
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4">🔑</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          Acceso con clave
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4">💾</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          Respaldo diario
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4">📄</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          Contrato confidencialidad
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ fontWeight: 600, color: 'success.main' }}>
                      ✅ NIVEL DE RIESGO: CONTROLADO
                    </Typography>
                  </Box>
                </Paper>
              </Slide>
            </Grid>
          </Grid>

          {/* Botón de acción */}
          <Fade in={activeSection >= 4} timeout={1500}>
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Paper 
                elevation={4}
                sx={{ 
                  p: 3,
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                    transform: 'scale(1.02)'
                  },
                  transition: 'all 0.3s ease-in-out'
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  [GUARDAR Y CONTINUAR CON SIGUIENTE PROCESO] →
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                  Tu primer mapeo estará listo en menos de 10 minutos
                </Typography>
              </Paper>
            </Box>
          </Fade>
        </CardContent>
      </Card>
    </Box>
  );
};

export default InterfazTrabajo;