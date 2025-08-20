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
  const [activeSection, setActiveSection] = useState(0);
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

  const handleNextStep = () => {
    if (activeSection < 4) {
      setActiveSection(prev => prev + 1);
      if (audioEnabled) playStepAudio(activeSection + 1);
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
      0: "Bienvenida a tu inventario en acción. Esta es la interfaz real del sistema donde completas el mapeo de cada proceso de tu organización.",
      1: "Sección uno: Datos que recopilas. Selecciona todos los tipos de información personal que manejas en este proceso, incluyendo datos sensibles.",
      2: "Sección dos: Para qué usas los datos. Define las finalidades específicas y la base legal que justifica el tratamiento.",
      3: "Sección tres: Quién accede a los datos. Identifica tanto los destinatarios internos como externos que tienen acceso a la información.",
      4: "Sección cuatro: Cuánto tiempo guardas los datos. Define los plazos de retención y las medidas de seguridad implementadas."
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
      const femaleSpanishVoice = voices.find(voice => 
        (voice.lang.includes('es') || voice.lang.includes('ES')) && 
        (voice.name.toLowerCase().includes('female') || 
         voice.name.toLowerCase().includes('mujer') ||
         voice.name.toLowerCase().includes('maria') ||
         voice.name.toLowerCase().includes('carmen') ||
         voice.name.toLowerCase().includes('lucia'))
      ) || voices.find(voice => voice.lang.includes('es') || voice.lang.includes('ES'));
      
      if (femaleSpanishVoice) utterance.voice = femaleSpanishVoice;
      
      utterance.lang = 'es-ES';
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      utterance.volume = 0.8;
      
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = (error) => {
        console.warn('Error en síntesis de voz:', error);
        setIsPlaying(false);
      };
      
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
    <Box sx={{ py: 4, position: 'relative' }}>
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

      {/* Controles de Navegación */}
      <Box sx={{ position: 'absolute', bottom: -60, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 2, zIndex: 10 }}>
        <Button
          variant="outlined"
          startIcon={<NavigateBefore />}
          onClick={handlePrevStep}
          disabled={activeSection === 0}
          size="small"
        >
          Anterior
        </Button>
        
        <Button
          variant="contained"
          endIcon={<NavigateNext />}
          onClick={handleNextStep}
          size="small"
        >
          {activeSection < 4 ? 'Siguiente' : 'Continuar'}
        </Button>
      </Box>
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
          value={((activeSection + 1) / 5) * 100}
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
          
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
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
                    minWidth: 120,
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