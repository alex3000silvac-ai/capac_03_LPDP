import React, { useState, useEffect, useRef } from 'react';
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
  Person as PersonIcon,
  Warning as WarningIcon,
  ChildCare as ChildIcon,
  Security as SecurityIcon
} from '@mui/icons-material';

const ClasificacionDatos = ({ duration = 45, onNext, onPrev, isAutoPlay = true }) => {
  const [visibleElements, setVisibleElements] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPhrase, setCurrentPhrase] = useState('');
  
  // Referencias para auto-scroll
  const tituloRef = useRef(null);
  const introRef = useRef(null);
  const comunesRef = useRef(null);
  const sensiblesRef = useRef(null);
  const menoresRef = useRef(null);
  const resumenRef = useRef(null);

  // Función de auto-scroll suave GARANTIZADA
  const scrollToElement = (elementRef) => {
    if (elementRef?.current) {
      // Primero hacer scroll suave
      elementRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center',
        inline: 'nearest' 
      });
      
      // Backup: forzar scroll después de 500ms si es necesario
      setTimeout(() => {
        const rect = elementRef.current?.getBoundingClientRect();
        if (rect && (rect.top < 100 || rect.bottom > window.innerHeight - 100)) {
          window.scrollTo({
            top: window.pageYOffset + rect.top - (window.innerHeight / 2) + (rect.height / 2),
            behavior: 'smooth'
          });
        }
      }, 500);
    }
  };

  // SISTEMA DE VOZ MASCULINA ULTRA FORZADO
  const configurarVozMasculina = () => {
    return new Promise((resolve) => {
      const intentarConfigurarVoz = () => {
        const voices = speechSynthesis.getVoices();
        console.log('🎤 Voces disponibles:', voices.map(v => ({ name: v.name, lang: v.lang })));
        
        // Búsqueda ULTRA específica de voz masculina
        let vozSeleccionada = null;
        
        // 1. Buscar nombres específicamente masculinos
        const nombresEspecificos = ['Diego', 'Carlos', 'Miguel', 'Antonio', 'Juan', 'Pablo', 'Jorge', 'Andrés', 'male', 'man', 'masculino', 'hombre'];
        for (const nombreMasc of nombresEspecificos) {
          vozSeleccionada = voices.find(voice => 
            voice.name.toLowerCase().includes(nombreMasc.toLowerCase()) && 
            (voice.lang.includes('es') || voice.lang.includes('mx') || voice.lang.includes('ar'))
          );
          if (vozSeleccionada) break;
        }
        
        // 2. Si no encuentra, buscar cualquier voz que NO sea femenina
        if (!vozSeleccionada) {
          const vozesEspanol = voices.filter(voice => 
            (voice.lang.includes('es') || voice.lang.includes('mx') || voice.lang.includes('ar'))
          );
          
          // Excluir explícitamente voces femeninas
          vozSeleccionada = vozesEspanol.find(voice => {
            const nombre = voice.name.toLowerCase();
            return !nombre.includes('female') && 
                   !nombre.includes('woman') && 
                   !nombre.includes('mujer') && 
                   !nombre.includes('maria') && 
                   !nombre.includes('ana') && 
                   !nombre.includes('carmen') && 
                   !nombre.includes('lucia') && 
                   !nombre.includes('sofia');
          });
        }
        
        // 3. Si aún no encuentra, tomar la primera voz de español
        if (!vozSeleccionada) {
          vozSeleccionada = voices.find(voice => 
            voice.lang.includes('es') || voice.lang.includes('mx')
          );
        }
        
        // 4. Último recurso: cualquier voz
        if (!vozSeleccionada && voices.length > 0) {
          vozSeleccionada = voices[0];
        }
        
        console.log('🎤 Voz seleccionada:', vozSeleccionada?.name, vozSeleccionada?.lang);
        resolve(vozSeleccionada);
      };

      if (speechSynthesis.getVoices().length > 0) {
        intentarConfigurarVoz();
      } else {
        speechSynthesis.onvoiceschanged = intentarConfigurarVoz;
      }
    });
  };

  // SISTEMA DE SINCRONIZACIÓN SIN CORTES - VERSIÓN CORREGIDA
  const iniciarPresentacionAutomatica = async () => {
    if (isPlaying) return;
    
    console.log('🎯 INICIANDO PRESENTACIÓN SIN CORTES - ClasificacionDatos');
    setIsPlaying(true);
    
    const vozMasculina = await configurarVozMasculina();
    console.log('🎤 Voz configurada:', vozMasculina?.name || 'default');
    
    // UN SOLO TEXTO CONTINUO SIN CORTES
    const textoCompleto = `Clasificación de datos según riesgo. La ley chilena establece tres categorías principales de datos según su nivel de sensibilidad. Primero, los datos comunes. Estos son los de menor riesgo. Incluyen nombre, RUT, dirección, teléfono, email, fecha de nacimiento. Son públicos o fácilmente obtenibles. Su tratamiento requiere consentimiento básico o base legal. Segundo, los datos sensibles. Estos tienen el máximo riesgo. Incluyen origen racial o étnico, opiniones políticas, convicciones religiosas o filosóficas, afiliación sindical, vida sexual, datos biométricos y de salud. Requieren consentimiento expreso y por escrito. Medidas de seguridad reforzadas obligatorias. Tercero, los datos de menores. Protección especial para menores de catorce años. Requieren autorización de padres o tutores. Solo se pueden tratar si es en su interés superior. Prohibido el perfilamiento y publicidad dirigida. Recuerda: A mayor sensibilidad, mayores obligaciones y mayores multas por incumplimiento.`;

    const utterance = new SpeechSynthesisUtterance(textoCompleto);
    utterance.voice = vozMasculina;
    utterance.lang = 'es-MX';
    utterance.rate = 0.8; // Más natural
    utterance.pitch = 0.6; // Más grave para masculina
    utterance.volume = 1.0;

    // SINCRONIZACIÓN BASADA EN TIEMPO REAL
    const iniciarSincronizacion = () => {
      const startTime = Date.now();
      
      // Cronómetro que verifica cada 100ms
      const intervalo = setInterval(() => {
        const tiempoTranscurrido = Date.now() - startTime;
        
        // Mostrar elementos según tiempo transcurrido
        if (tiempoTranscurrido >= 0 && !visibleElements.includes('titulo')) {
          setCurrentPhrase('Clasificación de datos según riesgo.');
          setVisibleElements(['titulo']);
          scrollToElement(tituloRef);
        }
        
        if (tiempoTranscurrido >= 4000 && !visibleElements.includes('intro')) {
          setCurrentPhrase('La ley chilena establece tres categorías principales...');
          setVisibleElements(prev => [...prev, 'intro']);
          scrollToElement(introRef);
        }
        
        if (tiempoTranscurrido >= 12000 && !visibleElements.includes('comunes')) {
          setCurrentPhrase('Primero, los datos comunes');
          setVisibleElements(prev => [...prev, 'comunes']);
          scrollToElement(comunesRef);
        }
        
        if (tiempoTranscurrido >= 30000 && !visibleElements.includes('sensibles')) {
          setCurrentPhrase('Segundo, los datos sensibles');
          setVisibleElements(prev => [...prev, 'sensibles']);
          scrollToElement(sensiblesRef);
        }
        
        if (tiempoTranscurrido >= 55000 && !visibleElements.includes('menores')) {
          setCurrentPhrase('Tercero, los datos de menores');
          setVisibleElements(prev => [...prev, 'menores']);
          scrollToElement(menoresRef);
        }
        
        if (tiempoTranscurrido >= 75000 && !visibleElements.includes('resumen')) {
          setCurrentPhrase('A mayor sensibilidad, mayores obligaciones...');
          setVisibleElements(prev => [...prev, 'resumen']);
          scrollToElement(resumenRef);
        }
        
        // Limpiar intervalo al final
        if (tiempoTranscurrido >= 85000) {
          clearInterval(intervalo);
          setTimeout(() => {
            if (onNext) onNext();
          }, 2000);
        }
      }, 100);
    };

    utterance.onstart = () => {
      console.log('🎤 Audio iniciado');
      iniciarSincronizacion();
    };

    utterance.onend = () => {
      console.log('🎤 Audio terminado');
      setIsPlaying(false);
    };

    utterance.onerror = (error) => {
      console.error('🎤 Error de audio:', error);
      setIsPlaying(false);
    };

    // HABLAR UNA SOLA VEZ SIN INTERRUPCIONES
    speechSynthesis.cancel(); // Limpiar cualquier audio anterior
    speechSynthesis.speak(utterance);
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

  const categorias = [
    {
      id: 'comunes',
      titulo: 'DATOS COMUNES',
      icon: PersonIcon,
      riesgo: 'BAJO',
      color: 'success',
      descripcion: 'Información básica de identificación',
      ejemplos: [
        { tipo: 'Identificación', datos: ['Nombre', 'RUT', 'Estado civil'] },
        { tipo: 'Contacto', datos: ['Dirección', 'Teléfono', 'Email'] },
        { tipo: 'Laborales', datos: ['Cargo', 'Empresa', 'Experiencia'] },
        { tipo: 'Educación', datos: ['Títulos', 'Certificaciones'] }
      ],
      requisitos: [
        'Consentimiento simple o base legal',
        'Medidas de seguridad básicas',
        'Notificación de uso'
      ]
    },
    {
      id: 'sensibles',
      titulo: 'DATOS SENSIBLES',
      icon: WarningIcon,
      riesgo: 'ALTO',
      color: 'error',
      descripcion: 'Información que puede causar discriminación',
      ejemplos: [
        { tipo: 'Salud', datos: ['Historial médico', 'Enfermedades', 'Tratamientos'] },
        { tipo: 'Biométricos', datos: ['Huella dactilar', 'Reconocimiento facial', 'Iris'] },
        { tipo: 'Ideológicos', datos: ['Opinión política', 'Religión', 'Afiliación sindical'] },
        { tipo: 'Íntimos', datos: ['Orientación sexual', 'Vida sexual'] }
      ],
      requisitos: [
        'Consentimiento expreso y por escrito',
        'Medidas de seguridad reforzadas',
        'Evaluación de impacto obligatoria',
        'Registro detallado de tratamiento'
      ]
    },
    {
      id: 'menores',
      titulo: 'DATOS DE MENORES',
      icon: ChildIcon,
      riesgo: 'ESPECIAL',
      color: 'warning',
      descripcion: 'Protección reforzada para menores de 14 años',
      ejemplos: [
        { tipo: 'Educativos', datos: ['Notas', 'Asistencia', 'Comportamiento'] },
        { tipo: 'Salud', datos: ['Vacunas', 'Alergias', 'Necesidades especiales'] },
        { tipo: 'Familiares', datos: ['Datos de padres', 'Tutores legales'] },
        { tipo: 'Actividades', datos: ['Deportes', 'Talleres', 'Eventos'] }
      ],
      requisitos: [
        'Autorización de padres o tutores',
        'Solo si es en interés del menor',
        'Prohibido perfilamiento',
        'Prohibida publicidad dirigida',
        'Derecho al olvido reforzado'
      ]
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

      {/* Título */}
      <Box ref={tituloRef}>
        {visibleElements.includes('titulo') && (
          <Fade in timeout={1000}>
            <Typography variant="h3" sx={{ mb: 2, fontWeight: 700 }}>
              📊 CLASIFICACIÓN DE DATOS
            </Typography>
          </Fade>
        )}

        {visibleElements.includes('titulo') && (
          <Fade in timeout={1500}>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
              Tres niveles de riesgo según la Ley 21.719
            </Typography>
          </Fade>
        )}
      </Box>

      {/* Introducción */}
      <Box ref={introRef}>
        {visibleElements.includes('intro') && (
          <Fade in timeout={1000}>
            <Alert severity="info" sx={{ mb: 4, maxWidth: 800, mx: 'auto' }}>
              <Typography variant="body1">
                <strong>Principio fundamental:</strong> A mayor sensibilidad del dato, 
                mayores son las obligaciones legales y las sanciones por incumplimiento.
              </Typography>
            </Alert>
          </Fade>
        )}
      </Box>

      {/* Categorías de datos */}
      <Grid container spacing={4}>
        {categorias.map((categoria) => (
          <Grid 
            item 
            xs={12} 
            md={4} 
            key={categoria.id}
            ref={
              categoria.id === 'comunes' ? comunesRef :
              categoria.id === 'sensibles' ? sensiblesRef :
              categoria.id === 'menores' ? menoresRef : null
            }
          >
            {(visibleElements.includes(categoria.id) || visibleElements.includes(`${categoria.id}_titulo`)) && (
              <Zoom in timeout={1000}>
                <Card 
                  elevation={8}
                  sx={{ 
                    height: '100%',
                    minHeight: '500px',
                    position: 'relative',
                    overflow: 'visible',
                    opacity: visibleElements.includes(`${categoria.id}_titulo`) ? 0.7 : 1,
                    transform: visibleElements.includes(categoria.id) ? 'scale(1.02)' : 'scale(1)',
                    transition: 'all 0.5s ease-in-out'
                  }}
                >
                  {/* Badge de riesgo */}
                  <Paper
                    elevation={4}
                    sx={{
                      position: 'absolute',
                      top: -20,
                      right: 20,
                      px: 2,
                      py: 1,
                      bgcolor: `${categoria.color}.main`,
                      color: `${categoria.color}.contrastText`,
                      borderRadius: 20,
                      fontWeight: 700
                    }}
                  >
                    RIESGO {categoria.riesgo}
                  </Paper>

                  <CardContent sx={{ p: 3 }}>
                    {/* Header */}
                    <Box sx={{ mb: 3 }}>
                      <categoria.icon 
                        sx={{ 
                          fontSize: 60, 
                          color: `${categoria.color}.main`,
                          mb: 2
                        }} 
                      />
                      <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                        {categoria.titulo}
                      </Typography>
                      {visibleElements.includes(categoria.id) && (
                        <Fade in timeout={500}>
                          <Typography variant="body2" color="text.secondary">
                            {categoria.descripcion}
                          </Typography>
                        </Fade>
                      )}
                    </Box>

                    {visibleElements.includes(categoria.id) && (
                      <>
                        {/* Ejemplos */}
                        <Box sx={{ mb: 3, textAlign: 'left' }}>
                          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                            EJEMPLOS:
                          </Typography>
                          {categoria.ejemplos.map((ejemplo, idx) => (
                            <Fade in timeout={500 * (idx + 1)} key={idx}>
                              <Box sx={{ mb: 1.5 }}>
                                <Typography variant="caption" sx={{ fontWeight: 600, color: `${categoria.color}.main` }}>
                                  {ejemplo.tipo}:
                                </Typography>
                                <Typography variant="caption" sx={{ display: 'block', pl: 2 }}>
                                  {ejemplo.datos.join(' • ')}
                                </Typography>
                              </Box>
                            </Fade>
                          ))}
                        </Box>

                        {/* Requisitos */}
                        <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                            REQUISITOS LEGALES:
                          </Typography>
                          {categoria.requisitos.map((req, idx) => (
                            <Fade in timeout={600 * (idx + 1)} key={idx}>
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  display: 'block',
                                  textAlign: 'left',
                                  mb: 0.5
                                }}
                              >
                                ✓ {req}
                              </Typography>
                            </Fade>
                          ))}
                        </Paper>
                      </>
                    )}
                  </CardContent>
                </Card>
              </Zoom>
            )}
          </Grid>
        ))}
      </Grid>

      {/* Resumen final */}
      <Box ref={resumenRef}>
        {visibleElements.includes('resumen') && (
          <Fade in timeout={1000}>
            <Paper 
              elevation={6}
              sx={{ 
                mt: 4, 
                p: 4,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white'
              }}
            >
              <SecurityIcon sx={{ fontSize: 50, mb: 2 }} />
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                RECUERDA LA REGLA DE ORO
              </Typography>
              <Typography variant="h6">
                A mayor sensibilidad → Mayor protección → Mayores sanciones
              </Typography>
              <Typography variant="body2" sx={{ mt: 2 }}>
                Las multas pueden llegar hasta 10.000 UTM para datos sensibles mal tratados
              </Typography>
            </Paper>
          </Fade>
        )}
      </Box>
    </Box>
  );
};

export default ClasificacionDatos;