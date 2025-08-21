import React, { useState, useEffect, useRef } from 'react';
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
  const [currentPhrase, setCurrentPhrase] = useState('');
  
  // Referencias para auto-scroll
  const tituloRef = useRef(null);
  const definicionRef = useRef(null);
  const empresaRef = useRef(null);
  const recopilarRef = useRef(null);
  const procesarRef = useRef(null);
  const compartirRef = useRef(null);
  const mensajeFinalRef = useRef(null);
  const datosAdicionalesRef = useRef(null);

  // Función de auto-scroll suave
  const scrollToElement = (elementRef) => {
    if (elementRef?.current) {
      elementRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center',
        inline: 'nearest' 
      });
    }
  };

  // SISTEMA DE VOZ MASCULINA MEJORADO
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
                             (!nombre.includes('female') && !nombre.includes('woman') && !nombre.includes('mujer'));
          
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

  // SISTEMA DE SINCRONIZACIÓN PERFECTA CON AUTO-SCROLL
  const iniciarPresentacionAutomatica = async () => {
    if (isPlaying) return;
    
    console.log('🎯 INICIANDO PRESENTACIÓN CON SINCRONIZACIÓN PERFECTA');
    setIsPlaying(true);
    
    const vozMasculina = await configurarVozMasculina();
    console.log('🎤 Voz configurada:', vozMasculina?.name || 'default');
    
    // Dividir el texto en frases para sincronización exacta
    const frases = [
      { texto: "¿Qué es un tratamiento de datos personales?", duracion: 3000, elemento: 'titulo' },
      { texto: "Es cualquier operación que tu empresa realiza con información personal.", duracion: 4000, elemento: 'definicion' },
      { texto: "Tu empresa está en el centro de todo.", duracion: 3000, elemento: 'empresa' },
      { texto: "Primero, recopilar datos.", duracion: 2000, elemento: 'recopilar_titulo' },
      { texto: "Tu empresa obtiene información a través de formularios, contratos, currículums, encuestas y aplicaciones móviles.", duracion: 7000, elemento: 'recopilar_completo' },
      { texto: "Segundo, procesar datos.", duracion: 2000, elemento: 'procesar_titulo' },
      { texto: "Analizas la información, la almacenas de forma segura, la modificas cuando es necesario y la organizas para tomar decisiones de negocio.", duracion: 8000, elemento: 'procesar_completo' },
      { texto: "Tercero, compartir datos.", duracion: 2000, elemento: 'compartir_titulo' },
      { texto: "Comunicas información a proveedores, entidades del Estado como SII y Previred, socios comerciales, bancos y compañías de seguros.", duracion: 8000, elemento: 'compartir_completo' },
      { texto: "Todo esto es tratamiento de datos y está regulado por la Ley veintiún mil setecientos diecinueve.", duracion: 6000, elemento: 'mensaje_final' },
      { texto: "Las multas pueden llegar hasta cinco mil UTM.", duracion: 3000, elemento: 'datos_adicionales' }
    ];

    let tiempoAcumulado = 500; // Inicio con pequeño delay

    // Programar cada frase con su sincronización y scroll
    frases.forEach((frase, index) => {
      // Mostrar elemento y hacer scroll
      setTimeout(() => {
        setCurrentPhrase(frase.texto);
        
        switch(frase.elemento) {
          case 'titulo':
            setVisibleElements(['titulo']);
            scrollToElement(tituloRef);
            break;
          case 'definicion':
            setVisibleElements(prev => [...prev, 'definicion']);
            scrollToElement(definicionRef);
            break;
          case 'empresa':
            setVisibleElements(prev => [...prev, 'empresa']);
            scrollToElement(empresaRef);
            break;
          case 'recopilar_titulo':
            setVisibleElements(prev => [...prev, 'recopilar_titulo']);
            scrollToElement(recopilarRef);
            break;
          case 'recopilar_completo':
            setVisibleElements(prev => {
              const newElements = [...prev];
              const index = newElements.indexOf('recopilar_titulo');
              if (index > -1) {
                newElements[index] = 'recopilar';
              }
              return newElements;
            });
            break;
          case 'procesar_titulo':
            setVisibleElements(prev => [...prev, 'procesar_titulo']);
            scrollToElement(procesarRef);
            break;
          case 'procesar_completo':
            setVisibleElements(prev => {
              const newElements = [...prev];
              const index = newElements.indexOf('procesar_titulo');
              if (index > -1) {
                newElements[index] = 'procesar';
              }
              return newElements;
            });
            break;
          case 'compartir_titulo':
            setVisibleElements(prev => [...prev, 'compartir_titulo']);
            scrollToElement(compartirRef);
            break;
          case 'compartir_completo':
            setVisibleElements(prev => {
              const newElements = [...prev];
              const index = newElements.indexOf('compartir_titulo');
              if (index > -1) {
                newElements[index] = 'compartir';
              }
              return newElements;
            });
            break;
          case 'mensaje_final':
            setVisibleElements(prev => [...prev, 'mensaje_final']);
            scrollToElement(mensajeFinalRef);
            break;
          case 'datos_adicionales':
            setVisibleElements(prev => [...prev, 'datos_adicionales']);
            scrollToElement(datosAdicionalesRef);
            break;
        }

        // Hablar la frase
        const utterance = new SpeechSynthesisUtterance(frase.texto);
        utterance.voice = vozMasculina;
        utterance.lang = 'es-MX';
        utterance.rate = 0.85; // Un poco más rápido para mejor sincronización
        utterance.pitch = 0.7;
        utterance.volume = 1.0;
        
        speechSynthesis.speak(utterance);
      }, tiempoAcumulado);

      tiempoAcumulado += frase.duracion;
    });

    // Avanzar al siguiente módulo al final
    setTimeout(() => {
      if (onNext) onNext();
    }, tiempoAcumulado + 2000);
  };

  useEffect(() => {
    if (isAutoPlay) {
      const timer = setTimeout(() => {
        iniciarPresentacionAutomatica();
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    return () => {
      speechSynthesis.cancel();
    };
  }, []);

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
    <Box sx={{ textAlign: 'center', py: 4, minHeight: '600px', position: 'relative' }}>
      {/* Indicador de frase actual */}
      {currentPhrase && (
        <Box sx={{ 
          position: 'fixed', 
          bottom: 20, 
          left: '50%', 
          transform: 'translateX(-50%)',
          bgcolor: 'rgba(0,0,0,0.8)', 
          color: 'white', 
          p: 2, 
          borderRadius: 2,
          maxWidth: '80%',
          zIndex: 9999
        }}>
          <Typography variant="body1">{currentPhrase}</Typography>
        </Box>
      )}

      {/* Título principal */}
      <Box ref={tituloRef}>
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
      </Box>

      {/* Definición */}
      <Box ref={definicionRef}>
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
      </Box>

      {/* Empresa central */}
      <Box ref={empresaRef}>
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
                <Grid 
                  item 
                  xs={12} 
                  md={4} 
                  key={paso.id}
                  ref={
                    paso.id === 'recopilar' ? recopilarRef :
                    paso.id === 'procesar' ? procesarRef :
                    paso.id === 'compartir' ? compartirRef : null
                  }
                >
                  {(visibleElements.includes(paso.id) || visibleElements.includes(`${paso.id}_titulo`)) && (
                    <Fade in timeout={1000}>
                      <Card 
                        elevation={6}
                        sx={{ 
                          height: '100%',
                          minHeight: '320px',
                          transform: visibleElements.includes(paso.id) ? 'scale(1.05)' : 'scale(1)',
                          transition: 'all 0.5s ease-in-out',
                          bgcolor: 'primary.light',
                          opacity: visibleElements.includes(`${paso.id}_titulo`) ? 0.7 : 1
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
                          
                          {visibleElements.includes(paso.id) && (
                            <>
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
                                  <Fade in timeout={500 * (idx + 1)} key={idx}>
                                    <Typography 
                                      variant="caption" 
                                      sx={{ 
                                        display: 'block',
                                        color: 'primary.contrastText',
                                        opacity: 0.9
                                      }}
                                    >
                                      • {ejemplo}
                                    </Typography>
                                  </Fade>
                                ))}
                              </Box>
                            </>
                          )}
                        </CardContent>
                      </Card>
                    </Fade>
                  )}
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Box>

      {/* Mensaje clave */}
      <Box ref={mensajeFinalRef}>
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
      </Box>

      {/* Datos adicionales */}
      <Box ref={datosAdicionalesRef}>
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
    </Box>
  );
};

export default ConceptoTratamiento;