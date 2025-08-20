import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Card, 
  CardContent,
  Fade,
  Zoom
} from '@mui/material';
import { 
  CloudDownload as RecopilarIcon,
  Settings as ProcesarIcon,
  Share as CompartirIcon,
  Business as EmpresaIcon
} from '@mui/icons-material';

const ConceptoTratamiento = ({ duration = 30, onNext, onPrev, isAutoPlay = true }) => {
  const [visibleElements, setVisibleElements] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentUtterance, setCurrentUtterance] = useState(null);

  // SISTEMA DE VOZ MASCULINA RADICAL
  const configurarVozMasculina = () => {
    return new Promise((resolve) => {
      const intentarConfigurarVoz = () => {
        const voices = speechSynthesis.getVoices();
        
        // Búsqueda exhaustiva de voz masculina
        const vozMasculina = voices.find(voice => {
          const nombre = voice.name.toLowerCase();
          const idioma = voice.lang.toLowerCase();
          
          // Filtros específicos para voces masculinas
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
          // Fallback a cualquier voz en español
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
      ¿Qué es un tratamiento de datos personales? 
      Es cualquier operación que tu empresa realiza con información personal. 
      
      Primero, recopilar datos. Tu empresa obtiene información a través de formularios, contratos, currículums, encuestas y aplicaciones móviles.
      
      Segundo, procesar datos. Analizas la información, la almacenas de forma segura, la modificas cuando es necesario y la organizas para tomar decisiones de negocio.
      
      Tercero, compartir datos. Comunicas información a proveedores, entidades del Estado como SII y Previred, socios comerciales, bancos y compañías de seguros.
      
      Todo esto es tratamiento de datos y está regulado por la Ley veintiún mil setecientos diecinueve. Las multas pueden llegar hasta cinco mil UTM.
    `;

    const utterance = new SpeechSynthesisUtterance(textoCompleto);
    utterance.voice = vozMasculina;
    utterance.lang = 'es-MX';
    utterance.rate = 0.7;
    utterance.pitch = 0.7; // Más grave para masculina
    utterance.volume = 1.0;

    setCurrentUtterance(utterance);

    // SINCRONIZACIÓN EXACTA CON EL AUDIO
    const sincronizarElementos = () => {
      // Mostrar título y definición inmediatamente
      setTimeout(() => {
        setVisibleElements(['titulo', 'definicion']);
      }, 1000);

      // Mostrar empresa central
      setTimeout(() => {
        setVisibleElements(prev => [...prev, 'empresa']);
      }, 8000);

      // Mostrar "RECOPILAR" cuando dice "Primero, recopilar"
      setTimeout(() => {
        setVisibleElements(prev => [...prev, 'recopilar']);
      }, 12000);

      // Mostrar "PROCESAR" cuando dice "Segundo, procesar"
      setTimeout(() => {
        setVisibleElements(prev => [...prev, 'procesar']);
      }, 20000);

      // Mostrar "COMPARTIR" cuando dice "Tercero, compartir"
      setTimeout(() => {
        setVisibleElements(prev => [...prev, 'compartir']);
      }, 28000);

      // Mostrar mensaje final cuando dice "Todo esto es tratamiento"
      setTimeout(() => {
        setVisibleElements(prev => [...prev, 'mensaje_final']);
      }, 36000);

      // Mostrar datos adicionales al final
      setTimeout(() => {
        setVisibleElements(prev => [...prev, 'datos_adicionales']);
      }, 40000);

      // Avanzar al siguiente módulo automáticamente
      setTimeout(() => {
        if (onNext) onNext();
      }, 45000);
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
      // Iniciar automáticamente después de 2 segundos
      const timer = setTimeout(() => {
        iniciarPresentacionAutomatica();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, []);

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (currentUtterance) {
        speechSynthesis.cancel();
      }
    };
  }, [currentUtterance]);

  const pasos = [
    {
      id: 'recopilar',
      titulo: 'RECOPILAR',
      emoji: '📥',
      descripcion: 'Obtenemos datos personales',
      ejemplos: ['Formularios web', 'Contratos', 'CVs', 'Encuestas', 'Apps móviles']
    },
    {
      id: 'procesar',
      titulo: 'PROCESAR',
      emoji: '⚙️',
      descripcion: 'Los analizamos y usamos',
      ejemplos: ['Análisis', 'Almacenamiento', 'Modificación', 'Organización', 'Reportes']
    },
    {
      id: 'compartir',
      titulo: 'COMPARTIR',
      emoji: '📤',
      descripcion: 'Los enviamos a terceros',
      ejemplos: ['Proveedores', 'Estado', 'Partners', 'Bancos', 'Seguros']
    }
  ];

  return (
    <Box sx={{ textAlign: 'center', py: 4, minHeight: '600px' }}>
      {/* Título principal */}
      {visibleElements.includes('titulo') && (
        <Fade in timeout={1000}>
          <Typography variant="h3" sx={{ mb: 2, fontWeight: 700 }}>
            ¿QUÉ ES UN TRATAMIENTO DE DATOS?
          </Typography>
        </Fade>
      )}

      {visibleElements.includes('titulo') && (
        <Fade in timeout={1500}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            Todo lo que hace tu empresa con información personal
          </Typography>
        </Fade>
      )}

      {/* Definición */}
      {visibleElements.includes('definicion') && (
        <Fade in timeout={2000}>
          <Paper sx={{ p: 3, mb: 4, bgcolor: 'info.light' }}>
            <Typography variant="body1" sx={{ fontWeight: 500, textAlign: 'center' }}>
              💡 <strong>Definición:</strong> Un "tratamiento de datos" es cualquier operación o 
              conjunto de operaciones realizadas sobre datos personales, ya sea por medios 
              automatizados o no. Incluye la recolección, registro, organización, conservación, 
              elaboración, modificación, extracción, consulta, comunicación y eliminación.
            </Typography>
          </Paper>
        </Fade>
      )}

      {/* Empresa central */}
      {visibleElements.includes('empresa') && (
        <Box sx={{ position: 'relative', mb: 6 }}>
          <Zoom in timeout={2000}>
            <Paper 
              elevation={8}
              sx={{ 
                display: 'inline-flex',
                alignItems: 'center',
                gap: 2,
                p: 3,
                bgcolor: 'primary.main',
                color: 'primary.contrastText'
              }}
            >
              <EmpresaIcon sx={{ fontSize: 40 }} />
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                TU EMPRESA
              </Typography>
            </Paper>
          </Zoom>

          {/* Procesos alrededor */}
          <Grid container spacing={4} sx={{ mt: 4 }}>
            {pasos.map((paso, index) => (
              <Grid item xs={12} md={4} key={paso.id}>
                {visibleElements.includes(paso.id) && (
                  <Fade in timeout={1000}>
                    <Card 
                      elevation={6}
                      sx={{ 
                        height: '100%',
                        minHeight: '320px',
                        transform: 'scale(1.05)',
                        transition: 'all 0.5s ease-in-out',
                        bgcolor: 'primary.light'
                      }}
                    >
                      <CardContent sx={{ textAlign: 'center', p: 3 }}>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="h1" sx={{ fontSize: 60 }}>
                            {paso.emoji}
                          </Typography>
                        </Box>
                        
                        <Typography 
                          variant="h5" 
                          sx={{ 
                            mb: 2, 
                            fontWeight: 600,
                            color: 'primary.contrastText'
                          }}
                        >
                          {paso.titulo}
                        </Typography>
                        
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            mb: 2,
                            color: 'primary.contrastText'
                          }}
                        >
                          {paso.descripcion}
                        </Typography>
                        
                        <Box>
                          {paso.ejemplos.map((ejemplo, idx) => (
                            <Typography 
                              key={idx}
                              variant="caption" 
                              sx={{ 
                                display: 'block',
                                color: 'primary.contrastText',
                                opacity: 0.8
                              }}
                            >
                              • {ejemplo}
                            </Typography>
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  </Fade>
                )}
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Mensaje clave */}
      {visibleElements.includes('mensaje_final') && (
        <Fade in timeout={1000}>
          <Paper 
            elevation={4}
            sx={{ 
              p: 4, 
              mt: 4,
              bgcolor: 'error.main',
              color: 'error.contrastText'
            }}
          >
            <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>
              🔴 TODO ESTO ES TRATAMIENTO 🔴
            </Typography>
            <Typography variant="h6">
              Y ESTÁ REGULADO POR LA LEY 21.719
            </Typography>
          </Paper>
        </Fade>
      )}

      {/* Datos adicionales */}
      {visibleElements.includes('datos_adicionales') && (
        <Fade in timeout={1500}>
          <Box sx={{ mt: 4 }}>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Paper sx={{ p: 2, bgcolor: 'warning.light' }}>
                  <Typography variant="h4">📊</Typography>
                  <Typography variant="body2" color="warning.contrastText">
                    <strong>Multas hasta</strong><br />5.000 UTM
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={4}>
                <Paper sx={{ p: 2, bgcolor: 'info.light' }}>
                  <Typography variant="h4">⚖️</Typography>
                  <Typography variant="body2" color="info.contrastText">
                    <strong>Cumplimiento</strong><br />Obligatorio
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={4}>
                <Paper sx={{ p: 2, bgcolor: 'success.light' }}>
                  <Typography variant="h4">🏆</Typography>
                  <Typography variant="body2" color="success.contrastText">
                    <strong>Certificación</strong><br />Posible
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

export default ConceptoTratamiento;