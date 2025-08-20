import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Card,
  CardContent,
  Fade,
  Slide,
  Chip,
  Alert
} from '@mui/material';
import { 
  Person as PersonIcon,
  Warning as WarningIcon,
  ChildCare as ChildIcon,
  Security as SecurityIcon
} from '@mui/icons-material';

const ClasificacionDatos = ({ duration = 45, onNext, onPrev, isAutoPlay = true }) => {
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
      No todos los datos personales son iguales según la Ley veintiún mil setecientos diecinueve de Chile.
      
      Los datos comunes como RUT, nombre, email y teléfono tienen riesgo bajo y requieren protección básica.
      
      Los datos sensibles como información médica, datos biométricos y situación socioeconómica requieren máxima protección. En Chile, la situación socioeconómica es considerada dato sensible, incluyendo ingresos, deudas y scoring crediticio.
      
      Los datos de menores de edad requieren protección especial y consentimiento de los padres.
      
      Recuerda: datos sensibles igual máxima protección más multas altas. Las multas pueden llegar hasta cinco mil UTM.
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
      // Mostrar título inmediatamente
      setTimeout(() => {
        setVisibleElements(['titulo']);
      }, 1000);

      // Mostrar datos comunes cuando dice "Los datos comunes"
      setTimeout(() => {
        setVisibleElements(prev => [...prev, 'comunes']);
      }, 10000);

      // Mostrar flecha de transición
      setTimeout(() => {
        setVisibleElements(prev => [...prev, 'flecha']);
      }, 15000);

      // Mostrar datos sensibles cuando dice "Los datos sensibles"
      setTimeout(() => {
        setVisibleElements(prev => [...prev, 'sensibles']);
      }, 18000);

      // Mostrar datos de menores cuando dice "Los datos de menores"
      setTimeout(() => {
        setVisibleElements(prev => [...prev, 'menores']);
      }, 28000);

      // Mostrar mensaje clave cuando dice "Recuerda"
      setTimeout(() => {
        setVisibleElements(prev => [...prev, 'mensaje_clave']);
      }, 35000);

      // Mostrar comparación final
      setTimeout(() => {
        setVisibleElements(prev => [...prev, 'comparacion']);
      }, 42000);

      // Avanzar al siguiente módulo
      setTimeout(() => {
        if (onNext) onNext();
      }, 50000);
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

  const datosComunes = [
    { nombre: 'RUT', icon: '🆔' },
    { nombre: 'Nombre', icon: '👤' },
    { nombre: 'Email', icon: '📧' },
    { nombre: 'Teléfono', icon: '📱' },
    { nombre: 'Dirección', icon: '🏠' },
    { nombre: 'Cargo', icon: '💼' }
  ];

  const datosSensibles = [
    { nombre: 'Salud', icon: '🏥', especial: true },
    { nombre: 'Sueldo', icon: '💰', especial: true },
    { nombre: 'Deudas', icon: '💳', chile: true },
    { nombre: 'Biométricos', icon: '👆', especial: true },
    { nombre: 'Afiliación Sindical', icon: '🤝', especial: true },
    { nombre: 'Situación Socioeconómica', icon: '📈', chile: true }
  ];

  const datosNNA = [
    { nombre: 'Menores 18 años', icon: '👶' },
    { nombre: 'Consentimiento padres', icon: '👨‍👩‍👧‍👦' },
    { nombre: 'Protección especial', icon: '🛡️' }
  ];

  return (
    <Box sx={{ py: 4, minHeight: '600px' }}>
      {/* Título */}
      {visibleElements.includes('titulo') && (
        <Fade in timeout={1000}>
          <Typography variant="h3" align="center" sx={{ mb: 2, fontWeight: 700 }}>
            🔍 NO TODOS LOS DATOS SON IGUALES
          </Typography>
        </Fade>
      )}

      {visibleElements.includes('titulo') && (
        <Fade in timeout={1500}>
          <Typography variant="h6" align="center" color="text.secondary" sx={{ mb: 6 }}>
            Clasificación por nivel de riesgo y protección requerida
          </Typography>
        </Fade>
      )}

      <Grid container spacing={4} sx={{ minHeight: '600px' }}>
        {/* DATOS COMUNES */}
        {visibleElements.includes('comunes') && (
          <Grid item xs={12}>
            <Slide in direction="right" timeout={1000}>
              <Card 
                elevation={8}
                sx={{ 
                  bgcolor: 'success.light',
                  transform: 'scale(1.02)',
                  transition: 'all 0.5s ease-in-out'
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <PersonIcon sx={{ fontSize: 40, mr: 2 }} />
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 600 }}>
                        DATOS PERSONALES COMUNES
                      </Typography>
                      <Typography variant="h6" color="success.main" sx={{ fontWeight: 600 }}>
                        Riesgo: BAJO
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Grid container spacing={2}>
                    {datosComunes.map((dato, index) => (
                      <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
                        <Fade in timeout={1000 + (index * 200)}>
                          <Paper 
                            elevation={2}
                            sx={{ 
                              p: 2, 
                              textAlign: 'center',
                              bgcolor: 'success.200',
                              color: 'text.primary'
                            }}
                          >
                            <Typography variant="h4">{dato.icon}</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {dato.nombre}
                            </Typography>
                          </Paper>
                        </Fade>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Slide>
          </Grid>
        )}

        {/* FLECHA */}
        {visibleElements.includes('flecha') && (
          <Grid item xs={12} sx={{ textAlign: 'center', py: 2 }}>
            <Fade in timeout={500}>
              <Typography variant="h2" color="warning.main">
                ⬇️
              </Typography>
            </Fade>
          </Grid>
        )}

        {/* DATOS SENSIBLES */}
        {visibleElements.includes('sensibles') && (
          <Grid item xs={12}>
            <Slide in direction="left" timeout={1000}>
              <Card 
                elevation={8}
                sx={{ 
                  bgcolor: 'error.light',
                  transform: 'scale(1.02)',
                  transition: 'all 0.5s ease-in-out'
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <WarningIcon sx={{ fontSize: 40, mr: 2, color: 'error.main' }} />
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 600 }}>
                        ⚠️ DATOS SENSIBLES ⚠️
                      </Typography>
                      <Typography variant="h6" color="error.main" sx={{ fontWeight: 600 }}>
                        Riesgo: ALTO - REQUIERE CONSENTIMIENTO
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Grid container spacing={2}>
                    {datosSensibles.map((dato, index) => (
                      <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
                        <Fade in timeout={1000 + (index * 200)}>
                          <Paper 
                            elevation={3}
                            sx={{ 
                              p: 2, 
                              textAlign: 'center',
                              bgcolor: 'error.100',
                              border: dato.chile ? '2px solid' : 'none',
                              borderColor: 'warning.main',
                              color: 'error.contrastText'
                            }}
                          >
                            <Typography variant="h4">{dato.icon}</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                              {dato.nombre}
                            </Typography>
                            {dato.chile && (
                              <Chip 
                                label="LEY CHILE" 
                                size="small" 
                                color="warning"
                                sx={{ mt: 1, fontSize: '0.7rem' }}
                              />
                            )}
                          </Paper>
                        </Fade>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Slide>
          </Grid>
        )}

        {/* DATOS NNA */}
        {visibleElements.includes('menores') && (
          <Grid item xs={12}>
            <Slide in direction="up" timeout={1000}>
              <Card 
                elevation={8}
                sx={{ 
                  bgcolor: 'info.light',
                  transform: 'scale(1.02)',
                  transition: 'all 0.5s ease-in-out'
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <ChildIcon sx={{ fontSize: 40, mr: 2, color: 'info.main' }} />
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 600 }}>
                        👶 DATOS DE NIÑOS, NIÑAS Y ADOLESCENTES
                      </Typography>
                      <Typography variant="h6" color="info.main" sx={{ fontWeight: 600 }}>
                        Riesgo: MUY ALTO - PROTECCIÓN ESPECIAL
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Grid container spacing={2}>
                    {datosNNA.map((dato, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <Fade in timeout={1000 + (index * 300)}>
                          <Paper 
                            elevation={4}
                            sx={{ 
                              p: 3, 
                              textAlign: 'center',
                              bgcolor: 'info.100',
                              color: 'info.contrastText'
                            }}
                          >
                            <Typography variant="h3">{dato.icon}</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600, mt: 1, color: 'text.primary' }}>
                              {dato.nombre}
                            </Typography>
                          </Paper>
                        </Fade>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Slide>
          </Grid>
        )}
      </Grid>

      {/* Mensaje clave */}
      {visibleElements.includes('mensaje_clave') && (
        <Fade in timeout={1000}>
          <Box sx={{ mt: 6 }}>
            <Alert 
              severity="warning" 
              icon={<SecurityIcon fontSize="large" />}
              sx={{ p: 3 }}
            >
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                💡 Clave para tu empresa:
              </Typography>
              <Typography variant="h6">
                <strong>DATOS SENSIBLES = MÁXIMA PROTECCIÓN + MULTAS ALTAS</strong>
              </Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                La "situación socioeconómica" es particularidad de la ley chilena. 
                Incluye: nivel de ingresos, deudas, scoring crediticio, patrimonio.
              </Typography>
            </Alert>
          </Box>
        </Fade>
      )}

      {/* Comparación visual */}
      {visibleElements.includes('comparacion') && (
        <Fade in timeout={1500}>
          <Box sx={{ mt: 4 }}>
            <Grid container spacing={3}>
              <Grid item xs={6}>
                <Paper sx={{ p: 3, bgcolor: 'success.light', textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ mb: 2 }}>✅</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    DATOS COMUNES
                  </Typography>
                  <Typography variant="body2">
                    • Consentimiento simple<br />
                    • Medidas básicas<br />
                    • Multa base
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper sx={{ p: 3, bgcolor: 'error.light', textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ mb: 2 }}>⚠️</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    DATOS SENSIBLES
                  </Typography>
                  <Typography variant="body2">
                    • Consentimiento expreso<br />
                    • Máxima protección<br />
                    • Multa hasta 5.000 UTM
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Fade>
      )}
    </Box>
  );
};

export default ClasificacionDatos;