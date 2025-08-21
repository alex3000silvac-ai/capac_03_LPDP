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
  SkipPrevious,
  SkipNext,
  VolumeOff,
  VolumeUp,
  ArrowForward
} from '@mui/icons-material';

const ConceptoTratamiento = ({ duration = 60, onNext, onPrev, isAutoPlay = true }) => {
  // 🎯 ESTADO ULTRA-SIMPLIFICADO
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [recopilarText, setRecopilarText] = useState('');
  const [procesarText, setProcesarText] = useState('');
  const [compartirText, setCompartirText] = useState('');
  
  // Referencias para elementos y scroll
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
  
  // 🎛️ FUNCIONES DE CONTROL
  const handlePlay = () => {
    if (!isPlaying) {
      startPresentation();
    }
  };
  
  const handlePause = () => {
    setIsPaused(!isPaused);
    if (isPaused) {
      // Reanudar
      speechSynthesis.resume();
    } else {
      // Pausar
      speechSynthesis.pause();
    }
  };
  
  const handleStop = () => {
    setIsPlaying(false);
    setIsPaused(false);
    speechSynthesis.cancel();
    if (intervalRef.current) clearInterval(intervalRef.current);
    setCurrentWordIndex(0);
    setDisplayedText('');
  };
  
  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    if (utteranceRef.current) {
      utteranceRef.current.volume = isMuted ? 1.0 : 0.0;
    }
  };
  
  const handlePrevious = () => {
    if (currentWordIndex > 0) {
      setCurrentWordIndex(currentWordIndex - 10); // Retroceder 10 palabras
    }
  };
  
  const handleNext = () => {
    if (currentWordIndex < words.length - 10) {
      setCurrentWordIndex(currentWordIndex + 10); // Avanzar 10 palabras
    }
  };
  
  // 📝 CONTENIDO PALABRA POR PALABRA CON ACCIONES
  const words = [
    // Título inicial
    { text: "¿Qué", action: "show_title", ref: tituloRef },
    { text: "es", action: null },
    { text: "un", action: null },
    { text: "tratamiento", action: null },
    { text: "de", action: null },
    { text: "datos", action: null },
    { text: "personales?", action: null },
    
    // Pausa y definición
    { text: "", action: "pause" },
    { text: "Es", action: "show_definition", ref: definicionRef },
    { text: "cualquier", action: null },
    { text: "operación", action: null },
    { text: "que", action: null },
    { text: "tu", action: null },
    { text: "empresa", action: null },
    { text: "realiza", action: null },
    { text: "con", action: null },
    { text: "información", action: null },
    { text: "personal.", action: null },
    
    // Centro empresarial
    { text: "", action: "pause" },
    { text: "Tu", action: "show_empresa", ref: empresaRef },
    { text: "empresa", action: null },
    { text: "está", action: null },
    { text: "en", action: null },
    { text: "el", action: null },
    { text: "centro", action: null },
    { text: "de", action: null },
    { text: "todo.", action: null },
    
    // Recopilar - MOSTRAR CUADRO Y LUEGO HABLAR PALABRA POR PALABRA
    { text: "", action: "pause" },
    { text: "Primero,", action: "show_recopilar", ref: recopilarRef },
    { text: "recopilar", action: "text_recopilar" },
    { text: "datos.", action: "text_recopilar" },
    { text: "Tu", action: "text_recopilar" },
    { text: "empresa", action: "text_recopilar" },
    { text: "obtiene", action: "text_recopilar" },
    { text: "información", action: "text_recopilar" },
    { text: "a", action: "text_recopilar" },
    { text: "través", action: "text_recopilar" },
    { text: "de", action: "text_recopilar" },
    { text: "formularios,", action: "text_recopilar" },
    { text: "contratos,", action: "text_recopilar" },
    { text: "currículums.", action: "text_recopilar_end" },
    
    // Procesar - MOSTRAR CUADRO Y LUEGO HABLAR PALABRA POR PALABRA
    { text: "", action: "pause" },
    { text: "Segundo,", action: "show_procesar", ref: procesarRef },
    { text: "procesar", action: "text_procesar" },
    { text: "datos.", action: "text_procesar" },
    { text: "Analizas,", action: "text_procesar" },
    { text: "almacenas", action: "text_procesar" },
    { text: "y", action: "text_procesar" },
    { text: "organizas", action: "text_procesar" },
    { text: "la", action: "text_procesar" },
    { text: "información.", action: "text_procesar_end" },
    
    // Compartir - MOSTRAR CUADRO Y LUEGO HABLAR PALABRA POR PALABRA
    { text: "", action: "pause" },
    { text: "Tercero,", action: "show_compartir", ref: compartirRef },
    { text: "compartir", action: "text_compartir" },
    { text: "datos", action: "text_compartir" },
    { text: "con", action: "text_compartir" },
    { text: "proveedores,", action: "text_compartir" },
    { text: "Estado,", action: "text_compartir" },
    { text: "socios", action: "text_compartir" },
    { text: "comerciales.", action: "text_compartir_end" },
    
    // Final
    { text: "", action: "pause" },
    { text: "Todo", action: "show_final", ref: finalRef },
    { text: "esto", action: null },
    { text: "es", action: null },
    { text: "tratamiento", action: null },
    { text: "de", action: null },
    { text: "datos", action: null },
    { text: "y", action: null },
    { text: "está", action: null },
    { text: "regulado", action: null },
    { text: "por", action: null },
    { text: "la", action: null },
    { text: "Ley", action: null },
    { text: "21.719.", action: null },
    { text: "Las", action: null },
    { text: "multas", action: null },
    { text: "pueden", action: null },
    { text: "llegar", action: null },
    { text: "hasta", action: null },
    { text: "cinco", action: null },
    { text: "mil", action: null },
    { text: "UTM.", action: "end" }
  ];

  // 🎤 CONFIGURACIÓN DE VOZ MASCULINA FORZADA
  const getVoiceMasculine = () => {
    const voices = speechSynthesis.getVoices();
    console.log('🎤 TODAS LAS VOCES DISPONIBLES:', voices.map(v => ({ name: v.name, lang: v.lang, gender: v.gender || 'unknown' })));
    
    // 1. PRIMERA PRIORIDAD: Voces explícitamente masculinas
    const explicitMaleVoices = voices.filter(v => {
      const name = v.name.toLowerCase();
      const lang = v.lang.toLowerCase();
      return (lang.includes('es') || lang.includes('mx') || lang.includes('ar')) &&
             (name.includes('male') || name.includes('man') || name.includes('masculin') || name.includes('hombre'));
    });
    
    if (explicitMaleVoices.length > 0) {
      console.log('✅ VOZ MASCULINA EXPLÍCITA ENCONTRADA:', explicitMaleVoices[0].name);
      return explicitMaleVoices[0];
    }
    
    // 2. SEGUNDA PRIORIDAD: Nombres masculinos específicos
    const maleNames = ['Diego', 'Carlos', 'Miguel', 'Juan', 'Pablo', 'Antonio', 'Jorge', 'Andrés', 'Daniel', 'Francisco'];
    for (const name of maleNames) {
      const voice = voices.find(v => 
        v.name.toLowerCase().includes(name.toLowerCase()) && 
        (v.lang.includes('es') || v.lang.includes('mx'))
      );
      if (voice) {
        console.log('✅ VOZ MASCULINA POR NOMBRE ENCONTRADA:', voice.name);
        return voice;
      }
    }
    
    // 3. TERCERA PRIORIDAD: Evitar voces explícitamente femeninas
    const nonFemaleVoices = voices.filter(v => {
      const name = v.name.toLowerCase();
      const lang = v.lang.toLowerCase();
      return (lang.includes('es') || lang.includes('mx')) &&
             !name.includes('female') &&
             !name.includes('woman') &&
             !name.includes('mujer') &&
             !name.includes('maria') &&
             !name.includes('ana') &&
             !name.includes('carmen') &&
             !name.includes('lucia') &&
             !name.includes('sofia') &&
             !name.includes('elena') &&
             !name.includes('cristina');
    });
    
    if (nonFemaleVoices.length > 0) {
      console.log('⚠️ VOZ NO-FEMENINA ENCONTRADA:', nonFemaleVoices[0].name);
      return nonFemaleVoices[0];
    }
    
    // 4. ÚLTIMO RECURSO: Primera voz en español
    const spanishVoice = voices.find(v => v.lang.includes('es') || v.lang.includes('mx'));
    if (spanishVoice) {
      console.log('🔴 ÚLTIMO RECURSO - VOZ EN ESPAÑOL:', spanishVoice.name);
      return spanishVoice;
    }
    
    // 5. FALLBACK FINAL
    console.log('❌ NO SE ENCONTRÓ VOZ EN ESPAÑOL, USANDO DEFAULT:', voices[0]?.name || 'ninguna');
    return voices[0];
  };

  // 📜 SCROLL SIMPLE Y EFECTIVO
  const scrollToRef = (ref) => {
    if (ref?.current) {
      ref.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }
  };

  // 🎬 INICIAR PRESENTACIÓN COMPLETA
  const startPresentation = () => {
    if (isPlaying) return;
    
    console.log('🎯 INICIANDO NUEVA ARQUITECTURA - Sincronización palabra por palabra');
    setIsPlaying(true);
    setCurrentWordIndex(0);
    setDisplayedText('');
    
    // Obtener voz masculina
    const voice = getVoiceMasculine();
    console.log('🎤 Voz seleccionada:', voice?.name);
    
    // Crear texto completo para audio
    const fullText = words
      .filter(w => w.text && w.text.trim() && w.action !== 'pause')
      .map(w => w.text)
      .join(' ');
    
    // Configurar y reproducir audio
    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.voice = voice;
    utterance.lang = 'es-MX';
    utterance.rate = 0.85;
    utterance.pitch = 0.6;
    utterance.volume = isMuted ? 0.0 : 1.0;
    
    utteranceRef.current = utterance;
    
    // Iniciar sincronización palabra por palabra
    let wordIndex = 0;
    
    const syncWords = () => {
      if (wordIndex >= words.length || !isPlaying) {
        clearInterval(intervalRef.current);
        // NO avanzar automáticamente - DETENER AL FINAL
        console.log('🏁 PRESENTACIÓN TERMINADA - DETENIDA');
        return;
      }
      
      const currentWord = words[wordIndex];
      setCurrentWordIndex(wordIndex);
      
      // Ejecutar acción si existe
      if (currentWord.action) {
        switch (currentWord.action) {
          case 'show_title':
          case 'show_definition':
          case 'show_empresa':
          case 'show_recopilar':
          case 'show_procesar':
          case 'show_compartir':
          case 'show_final':
            if (currentWord.ref) {
              scrollToRef(currentWord.ref);
            }
            break;
          case 'text_recopilar':
            // Agregar palabra al texto de RECOPILAR
            setRecopilarText(prev => prev ? prev + ' ' + currentWord.text : currentWord.text);
            break;
          case 'text_recopilar_end':
            setRecopilarText(prev => prev ? prev + ' ' + currentWord.text : currentWord.text);
            break;
          case 'text_procesar':
            // Agregar palabra al texto de PROCESAR
            setProcesarText(prev => prev ? prev + ' ' + currentWord.text : currentWord.text);
            break;
          case 'text_procesar_end':
            setProcesarText(prev => prev ? prev + ' ' + currentWord.text : currentWord.text);
            break;
          case 'text_compartir':
            // Agregar palabra al texto de COMPARTIR
            setCompartirText(prev => prev ? prev + ' ' + currentWord.text : currentWord.text);
            break;
          case 'text_compartir_end':
            setCompartirText(prev => prev ? prev + ' ' + currentWord.text : currentWord.text);
            break;
          case 'pause':
            // Pausa de 800ms sin mostrar texto
            break;
          case 'end':
            setIsPlaying(false);
            break;
        }
      }
      
      // Actualizar texto mostrado (solo si no es pausa)
      if (currentWord.text && currentWord.action !== 'pause') {
        setDisplayedText(prev => {
          const newText = prev ? prev + ' ' + currentWord.text : currentWord.text;
          return newText;
        });
      }
      
      wordIndex++;
    };
    
    // Eventos de audio
    utterance.onstart = () => {
      console.log('🎤 Audio iniciado - comenzando sincronización');
      intervalRef.current = setInterval(syncWords, 500); // 500ms por palabra
    };
    
    utterance.onend = () => {
      console.log('🎤 Audio terminado');
      setIsPlaying(false);
      clearInterval(intervalRef.current);
    };
    
    // Reproducir audio
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
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

  // 🎨 HELPER: Verificar si elemento debe mostrarse
  const shouldShow = (action) => {
    return words.slice(0, currentWordIndex + 1).some(w => w.action === action);
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
          MÓDULO CERO
        </Typography>
        
        {/* Controles centrales */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton 
            onClick={handlePrevious} 
            sx={{ color: 'white' }}
            disabled={currentWordIndex <= 0}
          >
            <SkipPrevious />
          </IconButton>
          
          {!isPlaying ? (
            <IconButton onClick={handlePlay} sx={{ color: 'white' }}>
              <PlayArrow />
            </IconButton>
          ) : (
            <IconButton onClick={handlePause} sx={{ color: 'white' }}>
              {isPaused ? <PlayArrow /> : <Pause />}
            </IconButton>
          )}
          
          <IconButton onClick={handleStop} sx={{ color: 'white' }}>
            <Stop />
          </IconButton>
          
          <IconButton 
            onClick={handleNext} 
            sx={{ color: 'white' }}
            disabled={currentWordIndex >= words.length - 10}
          >
            <SkipNext />
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
          {shouldShow('show_title') && (
            <Fade in timeout={800}>
              <div>
                <Typography variant="h2" sx={{ mb: 3, fontWeight: 800, color: 'primary.main' }}>
                  ¿QUÉ ES UN TRATAMIENTO DE DATOS?
                </Typography>
                <Typography variant="h5" color="text.secondary">
                  Todo lo que hace tu empresa con información personal
                </Typography>
              </div>
            </Fade>
          )}
        </Box>

        {/* Definición */}
        <Box ref={definicionRef} sx={{ mb: 6, minHeight: '200px' }}>
          {shouldShow('show_definition') && (
            <Fade in timeout={800}>
              <Paper sx={{ p: 4, bgcolor: 'info.light', mx: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, textAlign: 'center' }}>
                  💡 <strong>Definición Legal:</strong> Un "tratamiento de datos" es cualquier operación 
                  realizada sobre datos personales: recolección, registro, organización, conservación, 
                  modificación, consulta, comunicación y eliminación.
                </Typography>
              </Paper>
            </Fade>
          )}
        </Box>

        {/* Empresa central */}
        <Box ref={empresaRef} sx={{ mb: 6, minHeight: '300px', textAlign: 'center' }}>
          {shouldShow('show_empresa') && (
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
                  TU EMPRESA EN EL CENTRO
                </Typography>
              </Paper>
            </Fade>
          )}
        </Box>

        {/* RECOPILAR */}
        <Box ref={recopilarRef} sx={{ mb: 6, minHeight: '400px' }}>
          {shouldShow('show_recopilar') && (
            <Fade in timeout={800}>
              <Card elevation={6} sx={{ bgcolor: 'success.light', mx: 2 }}>
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="h1" sx={{ fontSize: 80, mb: 2 }}>📥</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
                    1. RECOPILAR DATOS
                  </Typography>
                  <Typography variant="h6" sx={{ mb: 3 }}>
                    Obtenemos información personal a través de:
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
                  
                  {/* Texto sincronizado que aparece palabra por palabra */}
                  {recopilarText && (
                    <Box sx={{ mt: 3, p: 3, bgcolor: 'rgba(255,255,255,0.8)', borderRadius: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'success.dark' }}>
                        🎯 {recopilarText}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Fade>
          )}
        </Box>

        {/* PROCESAR */}
        <Box ref={procesarRef} sx={{ mb: 6, minHeight: '400px' }}>
          {shouldShow('show_procesar') && (
            <Fade in timeout={800}>
              <Card elevation={6} sx={{ bgcolor: 'warning.light', mx: 2 }}>
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="h1" sx={{ fontSize: 80, mb: 2 }}>⚙️</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
                    2. PROCESAR DATOS
                  </Typography>
                  <Typography variant="h6" sx={{ mb: 3 }}>
                    Analizamos y usamos la información:
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
                  
                  {/* Texto sincronizado que aparece palabra por palabra */}
                  {procesarText && (
                    <Box sx={{ mt: 3, p: 3, bgcolor: 'rgba(255,255,255,0.8)', borderRadius: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'warning.dark' }}>
                        🎯 {procesarText}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Fade>
          )}
        </Box>

        {/* COMPARTIR */}
        <Box ref={compartirRef} sx={{ mb: 6, minHeight: '400px' }}>
          {shouldShow('show_compartir') && (
            <Fade in timeout={800}>
              <Card elevation={6} sx={{ bgcolor: 'error.light', mx: 2 }}>
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="h1" sx={{ fontSize: 80, mb: 2 }}>📤</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
                    3. COMPARTIR DATOS
                  </Typography>
                  <Typography variant="h6" sx={{ mb: 3 }}>
                    Enviamos información a terceros:
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
                  
                  {/* Texto sincronizado que aparece palabra por palabra */}
                  {compartirText && (
                    <Box sx={{ mt: 3, p: 3, bgcolor: 'rgba(255,255,255,0.8)', borderRadius: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'error.dark' }}>
                        🎯 {compartirText}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Fade>
          )}
        </Box>

        {/* Mensaje final */}
        <Box ref={finalRef} sx={{ mb: 6, minHeight: '200px' }}>
          {shouldShow('show_final') && (
            <Fade in timeout={800}>
              <Paper elevation={8} sx={{ p: 4, bgcolor: 'error.main', color: 'error.contrastText', mx: 2 }}>
                <Typography variant="h3" sx={{ fontWeight: 800, textAlign: 'center', mb: 2 }}>
                  🔴 TODO ESTO ES TRATAMIENTO 🔴
                </Typography>
                <Typography variant="h5" sx={{ textAlign: 'center', mb: 2 }}>
                  Y ESTÁ REGULADO POR LA LEY 21.719
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
        
        {/* Botón para saltar al próximo módulo - ABAJO */}
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
            SALTAR AL PRÓXIMO MÓDULO
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ConceptoTratamiento;