import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Card,
  CardContent,
  Fade,
  Zoom,
  Alert
} from '@mui/material';
import { 
  Search as IdentificarIcon,
  Description as DocumentarIcon,
  Security as ProtegerIcon,
  CheckCircle as CumplirIcon,
  ArrowForward as ArrowIcon
} from '@mui/icons-material';

const FlujoCumplimiento = ({ duration = 60, onNext, onPrev, isAutoPlay = true }) => {
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
      Mapa maestro de cumplimiento de la Ley veintiún mil setecientos diecinueve. Un proceso de cuatro etapas para implementar protección de datos.
      
      Primera etapa: Identificar. Mapeas todos los datos personales por áreas, procesos y sistemas. Sin inventario completo es imposible cumplir la ley.
      
      Segunda etapa: Documentar. Creas el Registro de Actividades de Tratamiento, defines finalidades, bases legales y destinatarios.
      
      Tercera etapa: Proteger. Implementas medidas técnicas como encriptación y organizacionales como políticas y capacitación.
      
      Cuarta etapa: Cumplir. Estableces auditoría permanente, gestión de brechas y atención de derechos ARCOP.
      
      Con este sistema automatizas todo el proceso. Tiempo total de implementación: cuatro semanas para cumplimiento completo.
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
      // Mostrar contexto y título inmediatamente
      setTimeout(() => {
        setVisibleElements(['contexto', 'titulo']);
      }, 1000);

      // Mostrar paso 1 cuando dice "Primera etapa: Identificar"
      setTimeout(() => {
        setVisibleElements(prev => [...prev, 'paso1']);
      }, 12000);

      // Mostrar paso 2 cuando dice "Segunda etapa: Documentar"
      setTimeout(() => {
        setVisibleElements(prev => [...prev, 'flecha1', 'paso2']);
      }, 18000);

      // Mostrar paso 3 cuando dice "Tercera etapa: Proteger"
      setTimeout(() => {
        setVisibleElements(prev => [...prev, 'flecha2', 'paso3']);
      }, 24000);

      // Mostrar paso 4 cuando dice "Cuarta etapa: Cumplir"
      setTimeout(() => {
        setVisibleElements(prev => [...prev, 'flecha3', 'paso4']);
      }, 30000);

      // Mostrar detalles cuando dice "Con este sistema"
      setTimeout(() => {
        setVisibleElements(prev => [...prev, 'detalles']);
      }, 36000);

      // Mostrar tiempo cuando dice "Tiempo total"
      setTimeout(() => {
        setVisibleElements(prev => [...prev, 'tiempo']);
      }, 40000);

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

  const pasos = [
    {
      id: 'identificar',
      numero: 1,
      title: 'IDENTIFICAR',
      subtitle: 'ENTRADA',
      icon: <IdentificarIcon sx={{ fontSize: 50 }} />,
      emoji: '📍',
      color: 'info',
      pregunta: '¿Qué datos tenemos?',
      acciones: ['Por área', 'Por proceso', 'Por sistema'],
      descripcion: 'Mapear todos los datos personales en la organización'
    },
    {
      id: 'documentar',
      numero: 2,
      title: 'DOCUMENTAR',
      subtitle: 'PROCESAMIENTO',
      icon: <DocumentarIcon sx={{ fontSize: 50 }} />,
      emoji: '📝',
      color: 'warning',
      pregunta: 'Crear RAT (Registro)',
      acciones: ['Finalidad', 'Base legal', 'Retención', 'Destinatarios'],
      descripcion: 'Crear el inventario oficial de tratamientos'
    },
    {
      id: 'proteger',
      numero: 3,
      title: 'PROTEGER',
      subtitle: 'SALIDA',
      icon: <ProtegerIcon sx={{ fontSize: 50 }} />,
      emoji: '🔒',
      color: 'error',
      pregunta: 'Implementar Seguridad',
      acciones: ['Encriptar', 'Accesos', 'Backups', 'Contratos'],
      descripcion: 'Aplicar medidas técnicas y organizacionales'
    },
    {
      id: 'cumplir',
      numero: 4,
      title: 'CUMPLIR',
      subtitle: 'CONTROL',
      icon: <CumplirIcon sx={{ fontSize: 50 }} />,
      emoji: '✅',
      color: 'success',
      pregunta: 'Auditoría Continua',
      acciones: ['Reportes', 'Brechas', 'Derechos'],
      descripcion: 'Mantener el cumplimiento en el tiempo'
    }
  ];

  return (
    <Box sx={{ py: 4, minHeight: '600px' }}>
      {/* Contexto Explicativo */}
      {visibleElements.includes('contexto') && (
        <Fade in timeout={500}>
          <Alert severity="info" sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>Flujo de Procesamiento de Datos</Typography>
            <Typography variant="body2">
              <strong>ENTRADA:</strong> Identificación de datos → 
              <strong>PROCESAMIENTO:</strong> Documentación y análisis → 
              <strong>SALIDA:</strong> Implementación de protección → 
              <strong>CONTROL:</strong> Supervisión continua
            </Typography>
          </Alert>
        </Fade>
      )}

      {/* Título */}
      {visibleElements.includes('titulo') && (
        <Fade in timeout={1000}>
          <Typography variant="h3" align="center" sx={{ mb: 2, fontWeight: 700 }}>
            🗺️ MAPA MAESTRO DE CUMPLIMIENTO LPDP
          </Typography>
        </Fade>
      )}

      {visibleElements.includes('titulo') && (
        <Fade in timeout={1500}>
          <Typography variant="h6" align="center" color="text.secondary" sx={{ mb: 6 }}>
            El proceso completo de implementación en 4 pasos
          </Typography>
        </Fade>
      )}

      {/* Flujo principal */}
      <Box sx={{ mb: 6 }}>
        <Grid container spacing={3} alignItems="center" justifyContent="center">
          {pasos.map((paso, index) => (
            <React.Fragment key={paso.id}>
              <Grid item xs={12} sm={6} md={2.4}>
                {visibleElements.includes(`paso${paso.numero}`) && (
                  <Zoom in timeout={1000}>
                    <Card 
                      elevation={8}
                      sx={{ 
                        minHeight: 280,
                        bgcolor: `${paso.color}.light`,
                        transform: 'scale(1.05)',
                        transition: 'all 0.8s ease-in-out',
                        cursor: 'pointer',
                        '&:hover': {
                          transform: 'scale(1.08)',
                          elevation: 12
                        }
                      }}
                    >
                      <CardContent sx={{ 
                        textAlign: 'center', 
                        p: 3,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}>
                        {/* Número y subtítulo */}
                        <Box>
                          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                            {paso.numero}.
                          </Typography>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              bgcolor: `${paso.color}.main`,
                              color: `${paso.color}.contrastText`,
                              px: 2,
                              py: 0.5,
                              borderRadius: 2,
                              fontWeight: 600
                            }}
                          >
                            {paso.subtitle}
                          </Typography>
                        </Box>

                        {/* Icono y emoji */}
                        <Box sx={{ my: 2 }}>
                          <Typography variant="h1" sx={{ fontSize: 80 }}>
                            {paso.emoji}
                          </Typography>
                        </Box>

                        {/* Título y pregunta */}
                        <Box>
                          <Typography 
                            variant="h5" 
                            sx={{ 
                              fontWeight: 700,
                              color: `${paso.color}.contrastText`,
                              mb: 1
                            }}
                          >
                            {paso.title}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: 500,
                              color: `${paso.color}.contrastText`
                            }}
                          >
                            {paso.pregunta}
                          </Typography>
                        </Box>

                        {/* Acciones */}
                        <Box sx={{ mt: 2 }}>
                          {paso.acciones.map((accion, idx) => (
                            <Typography 
                              key={idx}
                              variant="caption" 
                              sx={{ 
                                display: 'block',
                                color: `${paso.color}.contrastText`,
                                opacity: 0.9
                              }}
                            >
                              • {accion}
                            </Typography>
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  </Zoom>
                )}
              </Grid>
              
              {/* Flecha entre pasos */}
              {index < pasos.length - 1 && visibleElements.includes(`flecha${paso.numero}`) && (
                <Grid item xs={12} md={0.3} sx={{ textAlign: 'center' }}>
                  <Fade in timeout={500}>
                    <ArrowIcon 
                      sx={{ 
                        fontSize: 40, 
                        color: 'primary.main',
                        transform: { xs: 'rotate(90deg)', md: 'rotate(0deg)' }
                      }} 
                    />
                  </Fade>
                </Grid>
              )}
            </React.Fragment>
          ))}
        </Grid>
      </Box>

      {/* Detalles del proceso */}
      {visibleElements.includes('detalles') && (
        <Fade in timeout={1000}>
          <Box sx={{ mt: 6 }}>
            <Typography variant="h4" align="center" sx={{ mb: 4, fontWeight: 600 }}>
              ESTE SISTEMA AUTOMATIZA TODO EL PROCESO
            </Typography>
            
            <Grid container spacing={3}>
              {pasos.map((paso) => (
                <Grid item xs={12} sm={6} md={3} key={paso.id}>
                  <Paper 
                    elevation={4}
                    sx={{ 
                      p: 3, 
                      height: '100%',
                      bgcolor: `${paso.color}.50`
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      {paso.icon}
                      <Typography variant="h6" sx={{ ml: 1, fontWeight: 600 }}>
                        {paso.title}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      {paso.descripcion}
                    </Typography>
                    <Box>
                      {paso.acciones.map((accion, idx) => (
                        <Typography 
                          key={idx}
                          variant="caption" 
                          sx={{ 
                            display: 'block',
                            color: 'text.secondary'
                          }}
                        >
                          ✓ {accion}
                        </Typography>
                      ))}
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Fade>
      )}

      {/* Tiempo estimado */}
      {visibleElements.includes('tiempo') && (
        <Fade in timeout={1500}>
          <Box sx={{ mt: 6 }}>
            <Paper 
              elevation={6}
              sx={{ 
                p: 4,
                bgcolor: 'gradient',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                textAlign: 'center'
              }}
            >
              <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>
                ⏱️ TIEMPO TOTAL DE IMPLEMENTACIÓN
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={3}>
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>1</Typography>
                  <Typography variant="body1">SEMANA</Typography>
                  <Typography variant="caption">Mapeo inicial</Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>2</Typography>
                  <Typography variant="body1">SEMANAS</Typography>
                  <Typography variant="caption">Documentación</Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>1</Typography>
                  <Typography variant="body1">SEMANA</Typography>
                  <Typography variant="caption">Implementación</Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>∞</Typography>
                  <Typography variant="body1">CONTINUO</Typography>
                  <Typography variant="caption">Mantenimiento</Typography>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        </Fade>
      )}
    </Box>
  );
};

export default FlujoCumplimiento;