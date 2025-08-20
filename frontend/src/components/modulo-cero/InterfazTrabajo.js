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
  Chip,
  Fade,
  Slide,
  LinearProgress,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import { 
  Business as BusinessIcon,
  Schedule as ScheduleIcon,
  Security as SecurityIcon
} from '@mui/icons-material';

const InterfazTrabajo = ({ duration = 90, onNext, onPrev, isAutoPlay = true }) => {
  const [visibleElements, setVisibleElements] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentUtterance, setCurrentUtterance] = useState(null);

  // SISTEMA DE VOZ MASCULINA RADICAL
  const configurarVozMasculina = () => {
    return new Promise((resolve) => {
      const intentarConfigurarVoz = () => {
        const voices = speechSynthesis.getVoices();
        
        const vozMasculina = voices.find(voice => {
          const nombre = voice.name.toLowerCase();
          const idioma = voice.lang.toLowerCase();
          
          const esMasculino = nombre.includes('male') || 
                             nombre.includes('man') ||
                             nombre.includes('hombre') || 
                             nombre.includes('masculino') ||
                             nombre.includes('diego') ||
                             nombre.includes('carlos') ||
                             nombre.includes('miguel') ||
                             nombre.includes('antonio') ||
                             nombre.includes('juan') ||
                             nombre.includes('pablo') ||
                             !nombre.includes('female') && !nombre.includes('woman');
          
          const esEspanol = idioma.includes('es') || idioma.includes('mx') || idioma.includes('ar');
          
          return esEspanol && esMasculino;
        });

        if (vozMasculina) {
          resolve(vozMasculina);
        } else {
          const vozEspanol = voices.find(voice => 
            voice.lang.toLowerCase().includes('es')
          );
          resolve(vozEspanol || voices[0]);
        }
      };

      if (speechSynthesis.getVoices().length > 0) {
        intentarConfigurarVoz();
      } else {
        speechSynthesis.onvoiceschanged = intentarConfigurarVoz;
      }
    });
  };

  // SISTEMA DE SINCRONIZACIÓN AUTOMÁTICA REAL
  const iniciarPresentacionAutomatica = async () => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    
    const vozMasculina = await configurarVozMasculina();
    
    const textoCompleto = `
      Tu inventario de datos en acción. Esta es la interfaz real donde completas el mapeo de cada proceso.
      
      Primera sección: Datos que recopilas. Seleccionas todos los tipos de información personal: RUT, nombre, email, teléfono, y datos sensibles como antecedentes penales y exámenes médicos.
      
      Segunda sección: Finalidades de uso. Defines para qué utilizas cada dato: evaluar candidato, cumplir ley laboral, gestionar contrato.
      
      Tercera sección: Destinatarios. Identificas quién accede a los datos: internos como RRHH y Gerencia, externos como Previred y bancos.
      
      Cuarta sección: Plazos de retención. Defines cuánto tiempo conservas los datos: durante la relación laboral y cinco años después.
      
      Quinta sección: Medidas de seguridad. Documentas base de datos encriptada, acceso con clave, respaldo diario y contratos de confidencialidad.
      
      Tu primer mapeo estará listo en diez minutos. Nivel de riesgo controlado.
    `;

    const utterance = new SpeechSynthesisUtterance(textoCompleto);
    utterance.voice = vozMasculina;
    utterance.lang = 'es-MX';
    utterance.rate = 0.7;
    utterance.pitch = 0.7;
    utterance.volume = 1.0;

    setCurrentUtterance(utterance);

    // SINCRONIZACIÓN EXACTA CON EL AUDIO
    const sincronizarElementos = () => {
      // Mostrar título y progreso inmediatamente
      setTimeout(() => {
        setVisibleElements(['titulo', 'progreso', 'diagrama']);
      }, 1000);

      // Mostrar header del formulario
      setTimeout(() => {
        setVisibleElements(prev => [...prev, 'header']);
      }, 5000);

      // Mostrar sección 1 cuando dice "Primera sección"
      setTimeout(() => {
        setVisibleElements(prev => [...prev, 'seccion1']);
      }, 10000);

      // Mostrar sección 2 cuando dice "Segunda sección"
      setTimeout(() => {
        setVisibleElements(prev => [...prev, 'seccion2']);
      }, 18000);

      // Mostrar sección 3 cuando dice "Tercera sección"
      setTimeout(() => {
        setVisibleElements(prev => [...prev, 'seccion3']);
      }, 26000);

      // Mostrar sección 4 cuando dice "Cuarta sección"
      setTimeout(() => {
        setVisibleElements(prev => [...prev, 'seccion4']);
      }, 34000);

      // Mostrar sección 5 cuando dice "Quinta sección"
      setTimeout(() => {
        setVisibleElements(prev => [...prev, 'seccion5']);
      }, 42000);

      // Mostrar botón final cuando dice "Tu primer mapeo"
      setTimeout(() => {
        setVisibleElements(prev => [...prev, 'boton_final']);
      }, 50000);

      // Avanzar al siguiente módulo
      setTimeout(() => {
        if (onNext) onNext();
      }, 60000);
    };

    utterance.onstart = () => {
      sincronizarElementos();
    };

    utterance.onend = () => {
      setIsPlaying(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
    };

    speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (isAutoPlay) {
      const timer = setTimeout(() => {
        iniciarPresentacionAutomatica();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (currentUtterance) {
        speechSynthesis.cancel();
      }
    };
  }, [currentUtterance]);

  const sectionTitles = [
    'Datos que Recopilas',
    'Finalidades de Uso',
    'Destinatarios',
    'Retención',
    'Medidas de Seguridad'
  ];

  const currentSection = visibleElements.includes('seccion5') ? 4 :
                        visibleElements.includes('seccion4') ? 3 :
                        visibleElements.includes('seccion3') ? 2 :
                        visibleElements.includes('seccion2') ? 1 :
                        visibleElements.includes('seccion1') ? 0 : -1;

  return (
    <Box sx={{ py: 4, minHeight: '600px' }}>
      {/* Título */}
      {visibleElements.includes('titulo') && (
        <Fade in timeout={1000}>
          <Typography variant="h3" align="center" sx={{ mb: 2, fontWeight: 700 }}>
            💼 TU INVENTARIO EN ACCIÓN
          </Typography>
        </Fade>
      )}

      {visibleElements.includes('titulo') && (
        <Fade in timeout={1500}>
          <Typography variant="h6" align="center" color="text.secondary" sx={{ mb: 2 }}>
            Así se ve el formulario real que completas para cada proceso
          </Typography>
        </Fade>
      )}

      {/* Progreso Visual */}
      {visibleElements.includes('progreso') && (
        <Box sx={{ mb: 4, maxWidth: 800, mx: 'auto' }}>
          <LinearProgress 
            variant="determinate" 
            value={currentSection === -1 ? 0 : ((currentSection + 1) / 5) * 100}
            sx={{ height: 8, borderRadius: 4, mb: 2 }}
          />
          <Stepper activeStep={currentSection} alternativeLabel>
            {sectionTitles.map((title, index) => (
              <Step key={title}>
                <StepLabel>
                  <Typography variant="caption">{title}</Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
      )}

      {/* Diagrama Visual del Proceso */}
      {visibleElements.includes('diagrama') && (
        <Fade in timeout={2000}>
          <Paper sx={{ p: 3, mb: 4, maxWidth: 1000, mx: 'auto', bgcolor: 'grey.50' }}>
            <Typography variant="h6" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
              🔄 Flujo Visual del Proceso de Mapeo
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
              {[
                { icon: '📊', label: 'Identificar\nDatos', color: 'info.light', active: currentSection >= 0 },
                { icon: '🎯', label: 'Definir\nFinalidades', color: 'success.light', active: currentSection >= 1 },
                { icon: '👥', label: 'Mapear\nDestinatarios', color: 'warning.light', active: currentSection >= 2 },
                { icon: '⏱️', label: 'Configurar\nRetención', color: 'error.light', active: currentSection >= 3 },
                { icon: '🔒', label: 'Aplicar\nSeguridad', color: 'secondary.light', active: currentSection >= 4 }
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
                      transition: 'all 0.3s ease-in-out'
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
      )}

      {/* Formulario simulado */}
      <Card elevation={8} sx={{ maxWidth: 1200, mx: 'auto' }}>
        <CardContent sx={{ p: 4 }}>
          {/* Header del formulario */}
          {visibleElements.includes('header') && (
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
          )}

          <Grid container spacing={4}>
            {/* Sección 1: Datos que recopilas */}
            {visibleElements.includes('seccion1') && (
              <Grid item xs={12} md={6}>
                <Slide in direction="right" timeout={1000}>
                  <Paper 
                    elevation={4}
                    sx={{ 
                      p: 3,
                      bgcolor: 'info.light',
                      transform: 'scale(1.02)',
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
                        control={<Checkbox checked={item.checked} />}
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
                          control={<Checkbox checked={item.checked} color="warning" />}
                          label={item.label}
                          sx={{ display: 'block', mb: 1 }}
                        />
                      ))}
                    </Box>
                  </Paper>
                </Slide>
              </Grid>
            )}

            {/* Sección 2: Para qué */}
            {visibleElements.includes('seccion2') && (
              <Grid item xs={12} md={6}>
                <Slide in direction="left" timeout={1000}>
                  <Paper 
                    elevation={4}
                    sx={{ 
                      p: 3,
                      bgcolor: 'success.light',
                      transform: 'scale(1.02)',
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
                        control={<Checkbox checked={item.checked} color="success" />}
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
            )}

            {/* Sección 3: Quién accede */}
            {visibleElements.includes('seccion3') && (
              <Grid item xs={12} md={6}>
                <Slide in direction="right" timeout={1000}>
                  <Paper 
                    elevation={4}
                    sx={{ 
                      p: 3,
                      bgcolor: 'warning.light',
                      transform: 'scale(1.02)',
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
            )}

            {/* Sección 4: Cuánto guardas */}
            {visibleElements.includes('seccion4') && (
              <Grid item xs={12} md={6}>
                <Slide in direction="left" timeout={1000}>
                  <Paper 
                    elevation={4}
                    sx={{ 
                      p: 3,
                      bgcolor: 'error.light',
                      transform: 'scale(1.02)',
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
            )}

            {/* Sección 5: Medidas de seguridad */}
            {visibleElements.includes('seccion5') && (
              <Grid item xs={12}>
                <Slide in direction="up" timeout={1000}>
                  <Paper 
                    elevation={6}
                    sx={{ 
                      p: 4,
                      bgcolor: 'secondary.light',
                      transform: 'scale(1.02)',
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
            )}
          </Grid>

          {/* Botón de acción */}
          {visibleElements.includes('boton_final') && (
            <Fade in timeout={1500}>
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
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default InterfazTrabajo;