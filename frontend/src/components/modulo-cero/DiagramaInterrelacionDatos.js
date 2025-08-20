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
  Button,
  Chip,
  Alert,
  Divider
} from '@mui/material';
import { 
  BusinessCenter as BusinessIcon,
  AccountBalance as BankIcon,
  Security as SecurityIcon,
  PeopleAlt as TeamIcon,
  Assessment as ReportIcon,
  Schedule as ClockIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Download as ExportIcon,
  Storage as DatabaseIcon,
  Person as PersonIcon,
  SupervisorAccount as DpoIcon
} from '@mui/icons-material';

const DiagramaInterrelacionDatos = ({ duration = 120, onNext, onPrev, isAutoPlay = true }) => {
  const [visibleElements, setVisibleElements] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentUtterance, setCurrentUtterance] = useState(null);
  const canvasRef = useRef(null);

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
      Mapa completo de interrelación de datos según Ley veintiún mil setecientos diecinueve. Diagrama maestro del ecosistema de datos personales en tu organización.
      
      Centro neurálgico: DPO como supervisor central de todas las interrelaciones, coordina flujos entre áreas, gestiona derechos ARCOP, supervisa terceros destinatarios.
      
      Área Recursos Humanos: epicentro de datos empleados, candidatos, familiares. Datos fluyen a Previred, bancos, seguros, Dirección del Trabajo.
      
      Área Finanzas: datos tributarios al SII, remuneraciones a bancos, información comercial, retención siete años tributarios.
      
      Área Comercial: datos clientes, contratos, CRM. Flujos a partners, logística, marketing, retención contractual.
      
      Área Tecnología: usuarios, logs, backups, accesos. Flujos a proveedores cloud, soporte técnico, seguridad.
      
      Gestión de eliminación: cuando titular solicita cancelación, DPO coordina eliminación en doce sistemas promedio, notifica ocho terceros externos, plazo máximo treinta días.
      
      Cada dato tiene múltiples puntos de contacto. Tiempos retención diferenciados: laborales cinco años, tributarios siete años, previsionales permanente.
      
      Sistema robusto de gestión, trazabilidad completa, documentación exhaustiva para auditorías Agencia Protección Datos.
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

      // Mostrar contexto cuando dice "Diagrama maestro"
      setTimeout(() => {
        setVisibleElements(prev => [...prev, 'contexto']);
      }, 5000);

      // Mostrar DPO cuando dice "Centro neurálgico: DPO"
      setTimeout(() => {
        setVisibleElements(prev => [...prev, 'dpo']);
      }, 8000);

      // Mostrar área RRHH cuando dice "Área Recursos Humanos"
      setTimeout(() => {
        setVisibleElements(prev => [...prev, 'area_rrhh']);
      }, 12000);

      // Mostrar área Finanzas cuando dice "Área Finanzas"
      setTimeout(() => {
        setVisibleElements(prev => [...prev, 'area_finanzas']);
      }, 18000);

      // Mostrar área Comercial cuando dice "Área Comercial"
      setTimeout(() => {
        setVisibleElements(prev => [...prev, 'area_comercial']);
      }, 23000);

      // Mostrar área Tecnología cuando dice "Área Tecnología"
      setTimeout(() => {
        setVisibleElements(prev => [...prev, 'area_tecnologia']);
      }, 28000);

      // Mostrar gestión eliminación cuando dice "Gestión de eliminación"
      setTimeout(() => {
        setVisibleElements(prev => [...prev, 'gestion_eliminacion']);
      }, 33000);

      // Mostrar tiempos retención cuando dice "Tiempos retención"
      setTimeout(() => {
        setVisibleElements(prev => [...prev, 'tiempos_retencion']);
      }, 40000);

      // Mostrar sistema robusto cuando dice "Sistema robusto"
      setTimeout(() => {
        setVisibleElements(prev => [...prev, 'sistema_robusto']);
      }, 45000);

      // Avanzar al siguiente módulo
      setTimeout(() => {
        if (onNext) onNext();
      }, 52000);
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

  const areas = [
    {
      id: 'rrhh',
      nombre: 'RECURSOS HUMANOS',
      icon: <TeamIcon sx={{ fontSize: 40 }} />,
      color: 'primary',
      datos: ['Empleados', 'Candidatos', 'Familiares', 'Referencias'],
      destinatarios: ['Previred', 'Bancos', 'Seguros', 'Bienestar', 'DT'],
      retencion: '5 años post-término',
      riesgo: 'Alto'
    },
    {
      id: 'finanzas',
      nombre: 'FINANZAS',
      icon: <BankIcon sx={{ fontSize: 40 }} />,
      color: 'success',
      datos: ['Remuneraciones', 'Proveedores', 'Clientes', 'Facturas'],
      destinatarios: ['SII', 'Bancos', 'Auditoría', 'Seguros'],
      retencion: '7 años tributarios',
      riesgo: 'Medio'
    },
    {
      id: 'comercial',
      nombre: 'COMERCIAL',
      icon: <BusinessIcon sx={{ fontSize: 40 }} />,
      color: 'warning',
      datos: ['Clientes', 'Prospectos', 'Contratos', 'CRM'],
      destinatarios: ['Partners', 'Logística', 'Cobranza', 'Marketing'],
      retencion: '3-10 años contractual',
      riesgo: 'Medio'
    },
    {
      id: 'tecnologia',
      nombre: 'TECNOLOGÍA',
      icon: <DatabaseIcon sx={{ fontSize: 40 }} />,
      color: 'info',
      datos: ['Usuarios', 'Logs', 'Backups', 'Accesos'],
      destinatarios: ['Cloud', 'Soporte', 'Seguridad', 'Proveedores TI'],
      retencion: '1-5 años técnicos',
      riesgo: 'Alto'
    }
  ];

  return (
    <Box sx={{ py: 4, minHeight: '600px' }}>
      {/* Canvas oculto para exportación */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Título */}
      {visibleElements.includes('titulo') && (
        <Fade in timeout={1000}>
          <Typography variant="h3" align="center" sx={{ mb: 2, fontWeight: 700 }}>
            🔗 MAPA COMPLETO DE INTERRELACIÓN DE DATOS
          </Typography>
        </Fade>
      )}

      {visibleElements.includes('titulo') && (
        <Fade in timeout={1500}>
          <Typography variant="h6" align="center" color="text.secondary" sx={{ mb: 4 }}>
            Así se conectan los datos en tu organización según Ley 21719
          </Typography>
        </Fade>
      )}

      {/* Información contextual */}
      {visibleElements.includes('contexto') && (
        <Fade in timeout={1000}>
          <Alert severity="info" sx={{ mb: 4 }}>
            <Typography variant="body2">
              <strong>Ejemplo práctico:</strong> Si un empleado de RRHH solicita eliminar sus datos (derecho de cancelación), 
              el DPO debe coordinar la eliminación en <strong>8-12 sistemas</strong> diferentes y notificar a 
              <strong>5-10 terceros</strong> como Previred, bancos, seguros, y sistemas de bienestar.
            </Typography>
          </Alert>
        </Fade>
      )}

      {/* Diagrama central con DPO */}
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '500px', position: 'relative' }}>
        {/* DPO en el centro */}
        {visibleElements.includes('dpo') && (
          <Zoom in timeout={1000}>
            <Paper
              elevation={8}
              sx={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'error.main',
                color: 'error.contrastText',
                position: 'relative',
                zIndex: 5
              }}
            >
              <DpoIcon sx={{ fontSize: 40 }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                DPO
              </Typography>
              <Typography variant="caption">
                SUPERVISOR
              </Typography>
            </Paper>
          </Zoom>
        )}

        {/* Áreas organizacionales alrededor */}
        {areas.map((area, index) => {
          const angle = (index * 2 * Math.PI) / areas.length - Math.PI/2;
          const radius = 200;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          
          const areaKey = `area_${area.id}`;
          
          return (
            <Box key={area.id}>
              {visibleElements.includes(areaKey) && (
                <Fade in timeout={1000}>
                  <Box
                    sx={{
                      position: 'absolute',
                      left: `calc(50% + ${x}px)`,
                      top: `calc(50% + ${y}px)`,
                      transform: 'translate(-50%, -50%)',
                      zIndex: 1
                    }}
                  >
                    <Card 
                      elevation={8}
                      sx={{ 
                        width: 180,
                        height: 220,
                        bgcolor: `${area.color}.light`,
                        transform: 'scale(1.05)',
                        transition: 'all 0.5s ease-in-out'
                      }}
                    >
                      <CardContent sx={{ textAlign: 'center', p: 2 }}>
                        <Box sx={{ mb: 1 }}>
                          {area.icon}
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '0.9rem', mb: 1 }}>
                          {area.nombre}
                        </Typography>
                        
                        <Divider sx={{ my: 1 }} />
                        
                        <Typography variant="caption" display="block" sx={{ mb: 1 }}>
                          <strong>Datos:</strong>
                        </Typography>
                        {area.datos.slice(0, 2).map((dato, idx) => (
                          <Chip 
                            key={idx}
                            label={dato}
                            size="small"
                            sx={{ fontSize: '0.7rem', height: 18, mb: 0.5, mr: 0.5 }}
                            color={area.color}
                          />
                        ))}
                        
                        <Typography variant="caption" display="block" sx={{ mt: 1, mb: 0.5 }}>
                          <strong>Va a:</strong>
                        </Typography>
                        {area.destinatarios.slice(0, 2).map((dest, idx) => (
                          <Chip 
                            key={idx}
                            label={dest}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem', height: 16, mb: 0.5, mr: 0.5 }}
                          />
                        ))}
                        
                        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                          <ClockIcon sx={{ fontSize: 12, mr: 0.5 }} />
                          {area.retencion}
                        </Typography>
                      </CardContent>
                    </Card>
                    
                    {/* Línea conectora al DPO */}
                    <Box
                      sx={{
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        width: Math.abs(x),
                        height: 2,
                        bgcolor: `${area.color}.main`,
                        transformOrigin: 'left center',
                        transform: `rotate(${Math.atan2(y, x)}rad)`,
                        zIndex: 0
                      }}
                    />
                  </Box>
                </Fade>
              )}
            </Box>
          );
        })}
      </Box>

      {/* Gestión de eliminación */}
      {visibleElements.includes('gestion_eliminacion') && (
        <Fade in timeout={1000}>
          <Box sx={{ mt: 6 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper elevation={6} sx={{ p: 3, bgcolor: 'error.light', color: 'error.contrastText' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <DeleteIcon sx={{ fontSize: 30, mr: 2 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      GESTIÓN DE ELIMINACIÓN DE DATOS
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    Cuando se solicita eliminar datos de un empleado:
                  </Typography>
                  <Box sx={{ pl: 2 }}>
                    <Typography variant="body2">• <strong>12 sistemas internos</strong> promedio afectados</Typography>
                    <Typography variant="body2">• <strong>8 terceros externos</strong> a notificar</Typography>
                    <Typography variant="body2">• <strong>30 días corridos</strong> plazo legal máximo</Typography>
                    <Typography variant="body2">• <strong>DPO coordina</strong> todo el proceso</Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Fade>
      )}

      {/* Tiempos de retención */}
      {visibleElements.includes('tiempos_retencion') && (
        <Fade in timeout={1000}>
          <Box sx={{ mt: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper elevation={6} sx={{ p: 3, bgcolor: 'warning.light', color: 'warning.contrastText' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <ClockIcon sx={{ fontSize: 30, mr: 2 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      TIEMPOS DE RETENCIÓN LEY 21719
                    </Typography>
                  </Box>
                  <Box sx={{ pl: 2 }}>
                    <Typography variant="body2">• <strong>Datos laborales:</strong> 5 años post-término</Typography>
                    <Typography variant="body2">• <strong>Datos tributarios:</strong> 7 años (SII)</Typography>
                    <Typography variant="body2">• <strong>Datos previsionales:</strong> Permanente (Previred)</Typography>
                    <Typography variant="body2">• <strong>Datos comerciales:</strong> 3-10 años contractual</Typography>
                    <Typography variant="body2">• <strong>Logs técnicos:</strong> 1-5 años operativo</Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Fade>
      )}

      {/* Sistema robusto final */}
      {visibleElements.includes('sistema_robusto') && (
        <Fade in timeout={1500}>
          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Paper 
              elevation={8}
              sx={{ 
                p: 4,
                bgcolor: 'success.main',
                color: 'success.contrastText'
              }}
            >
              <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>
                🎯 IMPLEMENTA TU SISTEMA COMPLETO
              </Typography>
              <Typography variant="h6" sx={{ mb: 3, opacity: 0.9 }}>
                Con este mapa tienes la visión completa para cumplir la Ley 21719
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Paper 
                    sx={{ 
                      p: 2, 
                      bgcolor: 'rgba(255,255,255,0.1)',
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      📋 RAT Completo
                    </Typography>
                    <Typography variant="body2">
                      Registro de todas las actividades
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <Paper 
                    sx={{ 
                      p: 2, 
                      bgcolor: 'rgba(255,255,255,0.1)',
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      👨‍💼 DPO Designado
                    </Typography>
                    <Typography variant="body2">
                      Delegado con autonomía operativa
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <Paper 
                    sx={{ 
                      p: 2, 
                      bgcolor: 'rgba(255,255,255,0.1)',
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      🛡️ Sistema Robusto
                    </Typography>
                    <Typography variant="body2">
                      Gestión automática de derechos ARCOP
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

export default DiagramaInterrelacionDatos;