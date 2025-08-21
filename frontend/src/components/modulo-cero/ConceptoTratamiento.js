import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Card, 
  CardContent,
  Fade,
  IconButton,
  Button
} from '@mui/material';
import { 
  Business as EmpresaIcon,
  PlayArrow,
  Pause,
  Stop,
  VolumeOff,
  VolumeUp,
  ArrowForward
} from '@mui/icons-material';

const ConceptoTratamiento = ({ duration = 60, onNext, onPrev, isAutoPlay = true }) => {
  // 🎯 ESTADO ULTRA-SIMPLE - SOLO UNA VARIABLE
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  // Referencias para scroll básico
  const containerRef = useRef(null);
  const tituloRef = useRef(null);
  const definicionRef = useRef(null);
  const empresaRef = useRef(null);
  const recopilarRef = useRef(null);
  const procesarRef = useRef(null);
  const compartirRef = useRef(null);
  const finalRef = useRef(null);
  
  // Timer reference
  const intervalRef = useRef(null);
  const utteranceRef = useRef(null);
  
  // 📝 ARRAY SIMPLE DE PALABRAS - SIN ACCIONES COMPLEJAS
  const words = [
    '¿Qué', 'es', 'un', 'tratamiento', 'de', 'datos', 'personales?',
    '',
    'Es', 'cualquier', 'operación', 'que', 'tu', 'empresa', 'realiza', 'con', 'información', 'personal.',
    '',
    'Tu', 'empresa', 'está', 'en', 'el', 'centro', 'de', 'todo.',
    '',
    'Primero:', 'recopilar', 'datos.', 'Tu', 'empresa', 'obtiene', 'información', 'a', 'través', 'de', 'formularios,', 'contratos', 'y', 'currículums.',
    '',
    'Segundo:', 'procesar', 'datos.', 'Analizas,', 'almacenas', 'y', 'organizas', 'la', 'información.',
    '',
    'Tercero:', 'compartir', 'datos', 'con', 'proveedores,', 'Estado', 'y', 'socios', 'comerciales.',
    '',
    'Todo', 'esto', 'es', 'tratamiento', 'de', 'datos', 'y', 'está', 'regulado', 'por', 'la', 'Ley', '21.719.',
    'Las', 'multas', 'pueden', 'llegar', 'hasta', 'cinco', 'mil', 'UTM.'
  ];

  // 🎤 VOZ MASCULINA FORZADA SIMPLE
  const getVozMasculina = () => {
    const voices = speechSynthesis.getVoices();
    console.log('🎤 Configurando voz...');
    
    // Buscar voz masculina en español
    let vozSeleccionada = voices.find(v => 
      (v.lang.includes('es') || v.lang.includes('mx')) && 
      (v.name.toLowerCase().includes('diego') || 
       v.name.toLowerCase().includes('carlos') ||
       v.name.toLowerCase().includes('male'))
    );
    
    // Si no encuentra, tomar primera voz en español
    if (!vozSeleccionada) {
      vozSeleccionada = voices.find(v => v.lang.includes('es') || v.lang.includes('mx'));
    }
    
    // Último recurso
    if (!vozSeleccionada && voices.length > 0) {
      vozSeleccionada = voices[0];
    }
    
    console.log('✅ Voz seleccionada:', vozSeleccionada?.name);
    return vozSeleccionada;
  };

  // 📜 SCROLL ULTRA-SIMPLE
  const scrollToRef = (ref) => {
    if (ref?.current) {
      ref.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }
  };

  // 🎬 SINCRONIZACIÓN PALABRA POR PALABRA
  const startPresentation = () => {
    if (isPlaying) return;
    
    console.log('🎯 INICIANDO PRESENTACIÓN SIMPLE');
    setIsPlaying(true);
    setCurrentWordIndex(0);
    
    // Obtener voz
    const voice = getVozMasculina();
    
    // Crear texto completo para audio
    const fullText = words.filter(w => w.trim()).join(' ');
    
    // Configurar audio
    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.voice = voice;
    utterance.lang = 'es-MX';
    utterance.rate = 0.8;
    utterance.pitch = 0.6;
    utterance.volume = isMuted ? 0.0 : 1.0;
    
    utteranceRef.current = utterance;
    
    // SINCRONIZACIÓN INDEPENDIENTE - 400ms por palabra
    let wordIndex = 0;
    
    const syncWords = () => {
      if (wordIndex >= words.length || !isPlaying) {
        clearInterval(intervalRef.current);
        setIsPlaying(false);
        console.log('🏁 PRESENTACIÓN TERMINADA');
        return;
      }
      
      setCurrentWordIndex(wordIndex);
      
      // Scroll básico por secciones
      if (wordIndex === 0) scrollToRef(tituloRef);
      if (wordIndex === 8) scrollToRef(definicionRef);
      if (wordIndex === 19) scrollToRef(empresaRef);
      if (wordIndex === 28) scrollToRef(recopilarRef);
      if (wordIndex === 42) scrollToRef(procesarRef);
      if (wordIndex === 51) scrollToRef(compartirRef);
      if (wordIndex === 60) scrollToRef(finalRef);
      
      wordIndex++;
    };
    
    // Iniciar sincronización
    intervalRef.current = setInterval(syncWords, 400); // 400ms por palabra
    
    // Iniciar audio
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  };

  // 🎛️ CONTROLES SIMPLES
  const handlePlay = () => {
    if (!isPlaying) {
      startPresentation();
    }
  };

  const handlePause = () => {
    if (isPlaying) {
      if (speechSynthesis.speaking) {
        speechSynthesis.pause();
      } else {
        speechSynthesis.resume();
      }
    }
  };

  const handleStop = () => {
    setIsPlaying(false);
    speechSynthesis.cancel();
    if (intervalRef.current) clearInterval(intervalRef.current);
    setCurrentWordIndex(0);
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    if (utteranceRef.current) {
      utteranceRef.current.volume = isMuted ? 1.0 : 0.0;
    }
  };

  // 🚀 AUTO-INICIAR
  useEffect(() => {
    if (isAutoPlay) {
      const timer = setTimeout(startPresentation, 1000);
      return () => clearTimeout(timer);
    }
  }, [isAutoPlay]);

  // 🧹 CLEANUP
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      speechSynthesis.cancel();
    };
  }, []);

  // 🎨 FUNCIÓN PARA MOSTRAR TEXTO PALABRA POR PALABRA
  const getDisplayedText = (startIndex, endIndex) => {
    return words.slice(startIndex, Math.min(currentWordIndex + 1, endIndex))
                .filter(w => w.trim())
                .join(' ');
  };

  return (
    <Box ref={containerRef} sx={{ py: 4, minHeight: '600px', position: 'relative' }}>
      
      {/* Barra de control superior */}
      <Box sx={{ 
        position: 'fixed', 
        top: 0, 
        left: 0,
        right: 0,
        bgcolor: 'primary.main', 
        color: 'white', 
        p: 1,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          MÓDULO CERO - NUEVA ARQUITECTURA
        </Typography>
        
        {/* Controles centrales */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {!isPlaying ? (
            <IconButton onClick={handlePlay} sx={{ color: 'white' }}>
              <PlayArrow />
            </IconButton>
          ) : (
            <IconButton onClick={handlePause} sx={{ color: 'white' }}>
              <Pause />
            </IconButton>
          )}
          
          <IconButton onClick={handleStop} sx={{ color: 'white' }}>
            <Stop />
          </IconButton>
          
          <IconButton onClick={handleToggleMute} sx={{ color: 'white' }}>
            {isMuted ? <VolumeOff /> : <VolumeUp />}
          </IconButton>
        </Box>
        
        <Typography variant="caption">
          {currentWordIndex}/{words.length}
        </Typography>
      </Box>

      {/* Contenido principal con espaciado para header */}
      <Box sx={{ mt: 10 }}>
        
        {/* Título principal */}
        <Box ref={tituloRef} sx={{ mb: 6, minHeight: '200px', textAlign: 'center' }}>
          {currentWordIndex >= 0 && (
            <Fade in timeout={800}>
              <div>
                <Typography variant="h2" sx={{ mb: 3, fontWeight: 800, color: 'primary.main' }}>
                  ¿QUÉ ES UN TRATAMIENTO DE DATOS?
                </Typography>
                <Typography variant="h5" color="text.secondary">
                  {getDisplayedText(0, 7)}
                </Typography>
              </div>
            </Fade>
          )}
        </Box>

        {/* Definición */}
        <Box ref={definicionRef} sx={{ mb: 6, minHeight: '200px' }}>
          {currentWordIndex >= 8 && (
            <Fade in timeout={800}>
              <Paper sx={{ p: 4, bgcolor: 'info.light', mx: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, textAlign: 'center' }}>
                  💡 <strong>Definición:</strong> {getDisplayedText(8, 18)}
                </Typography>
              </Paper>
            </Fade>
          )}
        </Box>

        {/* Empresa central */}
        <Box ref={empresaRef} sx={{ mb: 6, minHeight: '300px', textAlign: 'center' }}>
          {currentWordIndex >= 19 && (
            <Fade in timeout={1000}>
              <Paper 
                elevation={8}
                sx={{ 
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 3,
                  p: 4,
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText'
                }}
              >
                <EmpresaIcon sx={{ fontSize: 60 }} />
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                  {getDisplayedText(19, 27)}
                </Typography>
              </Paper>
            </Fade>
          )}
        </Box>

        {/* RECOPILAR */}
        <Box ref={recopilarRef} sx={{ mb: 6, minHeight: '400px' }}>
          {currentWordIndex >= 28 && (
            <Fade in timeout={800}>
              <Card elevation={6} sx={{ bgcolor: 'success.light', mx: 2 }}>
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="h1" sx={{ fontSize: 80, mb: 2 }}>📥</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
                    1. RECOPILAR DATOS
                  </Typography>
                  <Typography variant="h6" sx={{ mb: 3 }}>
                    {getDisplayedText(28, 41)}
                  </Typography>
                  <Grid container spacing={2}>
                    {['Formularios web', 'Contratos', 'CVs', 'Encuestas', 'Apps móviles'].map((item, idx) => (
                      <Grid item xs={12} sm={6} md={4} key={idx}>
                        <Paper sx={{ p: 2, bgcolor: 'white' }}>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            • {item}
                          </Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Fade>
          )}
        </Box>

        {/* PROCESAR */}
        <Box ref={procesarRef} sx={{ mb: 6, minHeight: '400px' }}>
          {currentWordIndex >= 42 && (
            <Fade in timeout={800}>
              <Card elevation={6} sx={{ bgcolor: 'warning.light', mx: 2 }}>
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="h1" sx={{ fontSize: 80, mb: 2 }}>⚙️</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
                    2. PROCESAR DATOS
                  </Typography>
                  <Typography variant="h6" sx={{ mb: 3 }}>
                    {getDisplayedText(42, 50)}
                  </Typography>
                  <Grid container spacing={2}>
                    {['Análisis', 'Almacenamiento', 'Modificación', 'Organización', 'Reportes'].map((item, idx) => (
                      <Grid item xs={12} sm={6} md={4} key={idx}>
                        <Paper sx={{ p: 2, bgcolor: 'white' }}>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            • {item}
                          </Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Fade>
          )}
        </Box>

        {/* COMPARTIR */}
        <Box ref={compartirRef} sx={{ mb: 6, minHeight: '400px' }}>
          {currentWordIndex >= 51 && (
            <Fade in timeout={800}>
              <Card elevation={6} sx={{ bgcolor: 'error.light', mx: 2 }}>
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="h1" sx={{ fontSize: 80, mb: 2 }}>📤</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
                    3. COMPARTIR DATOS
                  </Typography>
                  <Typography variant="h6" sx={{ mb: 3 }}>
                    {getDisplayedText(51, 59)}
                  </Typography>
                  <Grid container spacing={2}>
                    {['Proveedores', 'Estado (SII/Previred)', 'Socios', 'Bancos', 'Seguros'].map((item, idx) => (
                      <Grid item xs={12} sm={6} md={4} key={idx}>
                        <Paper sx={{ p: 2, bgcolor: 'white' }}>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            • {item}
                          </Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Fade>
          )}
        </Box>

        {/* Mensaje final */}
        <Box ref={finalRef} sx={{ mb: 6, minHeight: '200px' }}>
          {currentWordIndex >= 60 && (
            <Fade in timeout={800}>
              <Paper elevation={8} sx={{ p: 4, bgcolor: 'error.main', color: 'error.contrastText', mx: 2 }}>
                <Typography variant="h3" sx={{ fontWeight: 800, textAlign: 'center', mb: 2 }}>
                  🔴 TODO ESTO ES TRATAMIENTO 🔴
                </Typography>
                <Typography variant="h5" sx={{ textAlign: 'center', mb: 2 }}>
                  {getDisplayedText(60, words.length)}
                </Typography>
                <Grid container spacing={3} sx={{ mt: 2 }}>
                  <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, bgcolor: 'warning.main', color: 'white', textAlign: 'center' }}>
                      <Typography variant="h2" sx={{ fontSize: 60 }}>📊</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        MULTAS HASTA
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 800 }}>
                        5.000 UTM
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, bgcolor: 'info.main', color: 'white', textAlign: 'center' }}>
                      <Typography variant="h2" sx={{ fontSize: 60 }}>⚖️</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        CUMPLIMIENTO
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 800 }}>
                        OBLIGATORIO
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, bgcolor: 'success.main', color: 'white', textAlign: 'center' }}>
                      <Typography variant="h2" sx={{ fontSize: 60 }}>🏆</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        CERTIFICACIÓN
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 800 }}>
                        POSIBLE
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Paper>
            </Fade>
          )}
        </Box>
        
        {/* Botón para saltar al próximo módulo */}
        <Box sx={{ textAlign: 'center', mt: 6, mb: 4 }}>
          <Button
            variant="contained"
            size="large"
            endIcon={<ArrowForward />}
            onClick={onNext}
            sx={{
              bgcolor: 'success.main',
              color: 'white',
              px: 4,
              py: 2,
              fontSize: '1.2rem',
              fontWeight: 'bold',
              '&:hover': {
                bgcolor: 'success.dark'
              }
            }}
          >
            CONTINUAR AL SIGUIENTE MÓDULO
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ConceptoTratamiento;