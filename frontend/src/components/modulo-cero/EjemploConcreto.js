import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Card,
  CardContent,
  Alert,
  Chip,
  LinearProgress,
  Fade,
  Slide
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot
} from '@mui/lab';
import { 
  Cancel as CancelIcon,
  CheckCircle as CheckIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendingIcon
} from '@mui/icons-material';

const EjemploConcreto = ({ duration = 75, onNext, onPrev, isAutoPlay = true }) => {
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
      Ejemplo real: empresa mediana de cincuenta empleados que logró cumplimiento completo LPDP en cuatro semanas.
      
      Antes del sistema: datos en Excel sin protección, sin control de acceso, sin respaldos, sin registro de cambios, exposición a multas de cinco mil UTM.
      
      Después del sistema: base de datos segura, permisos por rol, backup automático, auditoría completa, cumplimiento cien por ciento certificado.
      
      Hoja de ruta exitosa. Semana uno: mapeo inicial, diez procesos identificados. Semana dos: documentación completa, RAT y políticas. Semana tres: implementación técnica y capacitación. Semana cuatro: validación final y certificación.
      
      Resultados: noventa y cinco por ciento de reducción de riesgo, implementación en cuatro semanas, cero multas evitadas, ciento cincuenta millones de pesos ahorrados, certificación oficial obtenida.
      
      Tu empresa puede lograr los mismos resultados. Comienza ahora tu transformación digital con protección de datos.
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

      // Mostrar "ANTES" cuando dice "Antes del sistema"
      setTimeout(() => {
        setVisibleElements(prev => [...prev, 'antes']);
      }, 8000);

      // Mostrar "DESPUÉS" cuando dice "Después del sistema"
      setTimeout(() => {
        setVisibleElements(prev => [...prev, 'despues']);
      }, 15000);

      // Mostrar roadmap cuando dice "Hoja de ruta"
      setTimeout(() => {
        setVisibleElements(prev => [...prev, 'roadmap']);
      }, 22000);

      // Mostrar resultados cuando dice "Resultados"
      setTimeout(() => {
        setVisibleElements(prev => [...prev, 'resultados']);
      }, 35000);

      // Mostrar CTA final cuando dice "Tu empresa puede"
      setTimeout(() => {
        setVisibleElements(prev => [...prev, 'cta_final']);
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

  const antes = [
    { problema: 'Datos en Excel', icon: '📊', riesgo: 'alto' },
    { problema: 'Sin control de acceso', icon: '🔓', riesgo: 'alto' },
    { problema: 'Sin respaldos', icon: '💥', riesgo: 'muy_alto' },
    { problema: 'Sin registro de cambios', icon: '📝', riesgo: 'alto' },
    { problema: 'Riesgo de multa: 5000 UTM', icon: '💸', riesgo: 'critico' }
  ];

  const despues = [
    { solucion: 'Base de datos segura', icon: '🔐', estado: 'implementado' },
    { solucion: 'Permisos por rol', icon: '👥', estado: 'implementado' },
    { solucion: 'Backup automático', icon: '☁️', estado: 'implementado' },
    { solucion: 'Auditoría completa', icon: '📋', estado: 'implementado' },
    { solucion: 'Cumplimiento 100%', icon: '✅', estado: 'certificado' }
  ];

  const roadmap = [
    {
      semana: 1,
      titulo: 'Mapeo inicial',
      descripcion: '10 procesos principales identificados',
      icon: '📍',
      color: 'info',
      tareas: ['Identificar procesos', 'Clasificar datos', 'Mapear flujos']
    },
    {
      semana: 2,
      titulo: 'Documentación',
      descripcion: 'Crear RAT completo + Políticas',
      icon: '📝',
      color: 'warning',
      tareas: ['RAT completo', 'Políticas de privacidad', 'Contratos actualizados']
    },
    {
      semana: 3,
      titulo: 'Implementación',
      descripcion: 'Seguridad técnica + Contratos',
      icon: '🔧',
      color: 'error',
      tareas: ['Medidas técnicas', 'Capacitación equipo', 'Procedimientos']
    },
    {
      semana: 4,
      titulo: 'Validación',
      descripcion: 'Auditoría interna + Certificación',
      icon: '🏆',
      color: 'success',
      tareas: ['Auditoría completa', 'Correcciones', 'Certificación lista']
    }
  ];

  const getRiskColor = (riesgo) => {
    switch(riesgo) {
      case 'critico': return 'error';
      case 'muy_alto': return 'error';
      case 'alto': return 'warning';
      default: return 'info';
    }
  };

  return (
    <Box sx={{ py: 4, minHeight: '600px' }}>
      {/* Título */}
      {visibleElements.includes('titulo') && (
        <Fade in timeout={1000}>
          <Typography variant="h3" align="center" sx={{ mb: 2, fontWeight: 700 }}>
            📊 EJEMPLO REAL: EMPRESA DE 50 EMPLEADOS
          </Typography>
        </Fade>
      )}

      {visibleElements.includes('titulo') && (
        <Fade in timeout={1500}>
          <Typography variant="h6" align="center" color="text.secondary" sx={{ mb: 6 }}>
            Transformación completa en 4 semanas
          </Typography>
        </Fade>
      )}

      {/* Comparación ANTES vs DESPUÉS */}
      <Grid container spacing={4} sx={{ mb: 6 }}>
        {/* ANTES */}
        <Grid item xs={12} md={6}>
          {visibleElements.includes('antes') && (
            <Slide in direction="right" timeout={1000}>
              <Card 
                elevation={6}
                sx={{ 
                  height: '100%',
                  bgcolor: 'error.light',
                  transform: 'scale(1.02)',
                  transition: 'all 0.5s ease-in-out'
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <CancelIcon sx={{ fontSize: 40, mr: 2, color: 'error.main' }} />
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      ANTES (Sin Sistema)
                    </Typography>
                  </Box>

                  {antes.map((item, index) => (
                    <Fade key={index} in timeout={1000 + (index * 300)}>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        mb: 2,
                        p: 2,
                        bgcolor: 'background.paper',
                        borderRadius: 1,
                        borderLeft: 4,
                        borderColor: getRiskColor(item.riesgo) + '.main'
                      }}>
                        <Typography variant="h4" sx={{ mr: 2 }}>
                          {item.icon}
                        </Typography>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {item.problema}
                          </Typography>
                          <Chip 
                            label={item.riesgo.replace('_', ' ').toUpperCase()}
                            size="small"
                            color={getRiskColor(item.riesgo)}
                          />
                        </Box>
                        <CancelIcon color="error" />
                      </Box>
                    </Fade>
                  ))}

                  <Alert severity="error" sx={{ mt: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      💸 Multa potencial: $150 millones CLP
                    </Typography>
                  </Alert>
                </CardContent>
              </Card>
            </Slide>
          )}
        </Grid>

        {/* DESPUÉS */}
        <Grid item xs={12} md={6}>
          {visibleElements.includes('despues') && (
            <Slide in direction="left" timeout={1000}>
              <Card 
                elevation={6}
                sx={{ 
                  height: '100%',
                  bgcolor: 'success.light',
                  transform: 'scale(1.02)',
                  transition: 'all 0.5s ease-in-out'
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <CheckIcon sx={{ fontSize: 40, mr: 2, color: 'success.main' }} />
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      DESPUÉS (Con LPDP)
                    </Typography>
                  </Box>

                  {despues.map((item, index) => (
                    <Fade key={index} in timeout={1000 + (index * 300)}>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        mb: 2,
                        p: 2,
                        bgcolor: 'background.paper',
                        borderRadius: 1,
                        borderLeft: 4,
                        borderColor: 'success.main'
                      }}>
                        <Typography variant="h4" sx={{ mr: 2 }}>
                          {item.icon}
                        </Typography>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {item.solucion}
                          </Typography>
                          <Chip 
                            label={item.estado.toUpperCase()}
                            size="small"
                            color="success"
                          />
                        </Box>
                        <CheckIcon color="success" />
                      </Box>
                    </Fade>
                  ))}

                  <Alert severity="success" sx={{ mt: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      🏆 Certificación de cumplimiento LPDP
                    </Typography>
                  </Alert>
                </CardContent>
              </Card>
            </Slide>
          )}
        </Grid>
      </Grid>

      {/* Hoja de Ruta */}
      {visibleElements.includes('roadmap') && (
        <Fade in timeout={1000}>
          <Paper elevation={8} sx={{ p: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
              <TimelineIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                HOJA DE RUTA: 4 SEMANAS PARA CUMPLIR
              </Typography>
            </Box>

            <Timeline>
              {roadmap.map((fase, index) => (
                <TimelineItem key={index}>
                  <TimelineSeparator>
                    <TimelineDot color={fase.color} sx={{ p: 2 }}>
                      <Typography variant="h5">{fase.icon}</Typography>
                    </TimelineDot>
                    {index < roadmap.length - 1 && <TimelineConnector />}
                  </TimelineSeparator>
                  
                  <TimelineContent>
                    <Fade in timeout={1000 + (index * 500)}>
                      <Card elevation={3} sx={{ mb: 2 }}>
                        <CardContent>
                          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                            SEMANA {fase.semana}: {fase.titulo}
                          </Typography>
                          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                            {fase.descripcion}
                          </Typography>
                          
                          <Box>
                            {fase.tareas.map((tarea, idx) => (
                              <Chip 
                                key={idx}
                                label={tarea}
                                size="small"
                                sx={{ mr: 1, mb: 1 }}
                                color={fase.color}
                              />
                            ))}
                          </Box>
                        </CardContent>
                      </Card>
                    </Fade>
                  </TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>
          </Paper>
        </Fade>
      )}

      {/* Resultados y métricas */}
      {visibleElements.includes('resultados') && (
        <Fade in timeout={1000}>
          <Grid container spacing={3} sx={{ mb: 6 }}>
            <Grid item xs={12} md={4}>
              <Card elevation={4} sx={{ textAlign: 'center', p: 3 }}>
                <Typography variant="h1" sx={{ color: 'success.main', fontWeight: 700 }}>
                  95%
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Reducción de Riesgo
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={95} 
                  color="success"
                  sx={{ mt: 2, height: 8, borderRadius: 4 }}
                />
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card elevation={4} sx={{ textAlign: 'center', p: 3 }}>
                <Typography variant="h1" sx={{ color: 'info.main', fontWeight: 700 }}>
                  4
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Semanas de Implementación
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  vs 6-12 meses tradicional
                </Typography>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card elevation={4} sx={{ textAlign: 'center', p: 3 }}>
                <Typography variant="h1" sx={{ color: 'warning.main', fontWeight: 700 }}>
                  $0
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Multas Evitadas
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Hasta $150 millones CLP
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </Fade>
      )}

      {/* Call to Action final */}
      {visibleElements.includes('cta_final') && (
        <Fade in timeout={1500}>
          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Paper 
              elevation={8}
              sx={{ 
                p: 4,
                bgcolor: 'primary.main',
                color: 'primary.contrastText'
              }}
            >
              <Typography variant="h3" sx={{ mb: 2, fontWeight: 700 }}>
                🚀 ¿LISTO PARA TRANSFORMAR TU EMPRESA?
              </Typography>
              <Typography variant="h6" sx={{ mb: 3, opacity: 0.9 }}>
                Comienza ahora con tu primer mapeo de datos en solo 10 minutos
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Paper 
                    sx={{ 
                      p: 2, 
                      bgcolor: 'rgba(255,255,255,0.1)',
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      📊 Comenzar Mapeo Rápido
                    </Typography>
                    <Typography variant="body2">
                      10 minutos para tu primer inventario
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Paper 
                    sx={{ 
                      p: 2, 
                      bgcolor: 'rgba(255,255,255,0.1)',
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      🎓 Ver Curso Completo
                    </Typography>
                    <Typography variant="body2">
                      Implementación paso a paso
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        </Fade>
      )}
    </Box>
  );
};

export default EjemploConcreto;