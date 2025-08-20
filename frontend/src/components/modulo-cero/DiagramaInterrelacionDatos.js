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
  IconButton,
  Tooltip,
  Chip,
  Alert,
  Divider
} from '@mui/material';
import { 
  BusinessCenter as BusinessIcon,
  AccountBalance as BankIcon,
  LocalHospital as HealthIcon,
  Security as SecurityIcon,
  PeopleAlt as TeamIcon,
  Assessment as ReportIcon,
  Schedule as ClockIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Download as ExportIcon,
  PlayArrow,
  Stop,
  VolumeUp,
  VolumeOff,
  NavigateNext,
  NavigateBefore,
  Share as ShareIcon,
  Storage as DatabaseIcon,
  Person as PersonIcon,
  SupervisorAccount as DpoIcon
} from '@mui/icons-material';

const DiagramaInterrelacionDatos = ({ duration = 120, onNext, onPrev, isAutoPlay = false }) => {
  const [activeArea, setActiveArea] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const canvasRef = useRef(null);

  // Función para manejar doble click en pantalla
  const handleDoubleClick = () => {
    if (activeArea < 4) {
      const nextArea = activeArea + 1;
      setActiveArea(nextArea);
      if (audioEnabled) playStepAudio(nextArea);
    } else if (!showDetails) {
      setShowDetails(true);
      if (audioEnabled) playStepAudio(5);
    } else if (onNext) {
      onNext();
    }
  };

  const handleNextStep = () => {
    if (activeArea < 4) {
      const nextArea = activeArea + 1;
      setActiveArea(nextArea);
      if (audioEnabled) playStepAudio(nextArea);
    } else if (!showDetails) {
      setShowDetails(true);
      if (audioEnabled) playStepAudio(5);
    } else if (onNext) {
      onNext();
    }
  };

  const handlePrevStep = () => {
    if (showDetails) {
      setShowDetails(false);
    } else if (activeArea > 0) {
      setActiveArea(prev => prev - 1);
    } else if (onPrev) {
      onPrev();
    }
  };

  const playStepAudio = (stepNumber) => {
    if (!audioEnabled) return;
    
    const audioTexts = {
      0: "Bienvenida al diagrama maestro de interrelación de datos según la Ley veintiún mil setecientos diecinueve. Este mapa visual muestra cómo los datos personales fluyen entre diferentes áreas de tu organización, los terceros destinatarios, y las responsabilidades del Delegado de Protección de Datos. Comprender estas interrelaciones es fundamental para gestionar correctamente los derechos ARCOP de los titulares y cumplir con las obligaciones de la ley chilena.",
      1: "Área de Recursos Humanos como epicentro de datos personales. Esta área maneja datos de empleados, candidatos, familiares, y terceros. Los datos fluyen hacia Previred para cotizaciones previsionales, hacia bancos para pagos de remuneraciones, hacia aseguradoras para seguros complementarios, hacia sistemas de bienestar social, y hacia la Dirección del Trabajo para cumplir obligaciones laborales. El DPO debe supervisar cada flujo y asegurar contratos de tratamiento con todos los destinatarios.",
      2: "Interrelaciones con entidades financieras y del Estado. Los bancos reciben datos para procesar pagos, transferencias, y créditos, pero deben limitar el uso solo a la finalidad autorizada. El Servicio de Impuestos Internos recibe información tributaria, Previred gestiona cotizaciones, y las Superintendencias supervisan cumplimiento sectorial. Cada entidad tiene responsabilidades específicas de protección y debe reportar brechas de seguridad tanto a tu empresa como a la Agencia de Protección de Datos Personales.",
      3: "Gestión de derechos ARCOP y eliminación de datos. Cuando un titular ejerce su derecho de cancelación o eliminación, el DPO debe coordinar la eliminación en todas las áreas y sistemas que contengan sus datos: Recursos Humanos, Finanzas, Tecnología, Marketing, Ventas, y también notificar a todos los terceros destinatarios como bancos, seguros, proveedores. La ley establece plazos específicos para responder: diez días hábiles para confirmar la solicitud y treinta días corridos para ejecutar la eliminación completa.",
      4: "Rol del Delegado de Protección de Datos como supervisor central. El DPO tiene visibilidad completa del ecosistema de datos, supervisa todos los tratamientos, actúa como enlace con la Agencia de Protección de Datos Personales, gestiona las solicitudes de derechos ARCOP, coordina respuestas ante brechas de seguridad, y asegura que todas las áreas cumplan con las políticas de privacidad. Debe tener autonomía operativa y reportar directamente a la alta dirección de la empresa.",
      5: "Cuadro completo de interdependencias y tiempos de retención. Cada dato personal tiene múltiples puntos de contacto en la organización y con terceros. Los tiempos de retención varían según la naturaleza del dato y las obligaciones legales: datos laborales se conservan cinco años después del término del contrato, datos tributarios siete años, datos de salud según normativa específica. Al eliminar un dato, se debe coordinar la eliminación en promedio en ocho a doce sistemas diferentes y notificar a cinco a diez terceros destinatarios, lo que requiere un sistema robusto de gestión y trazabilidad."
    };

    const text = audioTexts[stepNumber] || "";
    if (text && 'speechSynthesis' in window) {
      try {
        speechSynthesis.cancel();
      } catch (error) {
        console.warn('Error cancelando síntesis anterior:', error);
      }
      
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = speechSynthesis.getVoices();
      const femaleSpanishVoice = voices.find(voice => 
        (voice.lang.includes('es') || voice.lang.includes('ES')) && 
        (voice.name.toLowerCase().includes('female') || 
         voice.name.toLowerCase().includes('mujer') ||
         voice.name.toLowerCase().includes('maria') ||
         voice.name.toLowerCase().includes('carmen') ||
         voice.name.toLowerCase().includes('lucia'))
      ) || voices.find(voice => voice.lang.includes('es') || voice.lang.includes('ES'));
      
      if (femaleSpanishVoice) utterance.voice = femaleSpanishVoice;
      
      utterance.lang = 'es-ES';
      utterance.rate = 0.8;
      utterance.pitch = 1.0;
      utterance.volume = 0.9;
      
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = (error) => {
        console.warn('Error en síntesis de voz:', error);
        setIsPlaying(false);
      };
      
      try {
        speechSynthesis.speak(utterance);
      } catch (error) {
        console.warn('Error iniciando síntesis de voz:', error);
        setIsPlaying(false);
      }
    }
  };

  useEffect(() => {
    if (audioEnabled) {
      setTimeout(() => playStepAudio(0), 1000);
    }
  }, []);

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

  const exportDiagram = (format) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Configurar canvas
    canvas.width = 1200;
    canvas.height = 800;
    
    // Fondo blanco
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Título
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('DIAGRAMA DE INTERRELACIÓN DE DATOS - LEY 21719', canvas.width/2, 40);
    
    // Dibujar áreas y conexiones
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 150;
    
    // DPO en el centro
    ctx.fillStyle = '#ff6b35';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 60, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('DPO', centerX, centerY - 5);
    ctx.fillText('SUPERVISOR', centerX, centerY + 10);
    
    // Áreas alrededor
    areas.forEach((area, index) => {
      const angle = (index * 2 * Math.PI) / areas.length;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      // Círculo del área
      ctx.fillStyle = area.color === 'primary' ? '#1976d2' : 
                     area.color === 'success' ? '#2e7d32' :
                     area.color === 'warning' ? '#ed6c02' : '#0288d1';
      ctx.beginPath();
      ctx.arc(x, y, 45, 0, 2 * Math.PI);
      ctx.fill();
      
      // Línea al DPO
      ctx.strokeStyle = '#666666';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.stroke();
      
      // Texto del área
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      const words = area.nombre.split(' ');
      words.forEach((word, wIndex) => {
        ctx.fillText(word, x, y - 5 + (wIndex * 12));
      });
    });
    
    // Exportar según formato
    if (format === 'png') {
      const link = document.createElement('a');
      link.download = 'diagrama-interrelacion-datos-lpdp.png';
      link.href = canvas.toDataURL();
      link.click();
    } else if (format === 'pdf') {
      // Para PDF necesitaríamos una librería adicional como jsPDF
      alert('Funcionalidad de PDF estará disponible próximamente');
    }
    
    setShowExportOptions(false);
  };

  return (
    <Box 
      sx={{ py: 4, position: 'relative' }}
      onDoubleClick={handleDoubleClick}
    >
      {/* Canvas oculto para exportación */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      {/* Controles de Audio */}
      <Box sx={{ position: 'absolute', top: 0, right: 0, display: 'flex', gap: 1, zIndex: 10 }}>
        <Tooltip title="Exportar diagrama">
          <IconButton
            size="small"
            onClick={() => setShowExportOptions(!showExportOptions)}
            color="secondary"
          >
            <ExportIcon />
          </IconButton>
        </Tooltip>
        
        <Tooltip title={audioEnabled ? "Desactivar audio" : "Activar audio"}>
          <IconButton
            size="small"
            onClick={() => {
              setAudioEnabled(!audioEnabled);
              if (isPlaying) {
                speechSynthesis.cancel();
                setIsPlaying(false);
              }
            }}
            color={audioEnabled ? 'primary' : 'default'}
          >
            {audioEnabled ? <VolumeUp /> : <VolumeOff />}
          </IconButton>
        </Tooltip>
        
        {audioEnabled && (
          <Tooltip title={isPlaying ? "Detener" : "Reproducir explicación"}>
            <IconButton
              size="small"
              onClick={() => {
                if (isPlaying) {
                  speechSynthesis.cancel();
                  setIsPlaying(false);
                } else {
                  const currentStep = showDetails ? 5 : activeArea;
                  playStepAudio(currentStep);
                }
              }}
              color={isPlaying ? 'secondary' : 'default'}
            >
              {isPlaying ? <Stop /> : <PlayArrow />}
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Opciones de Exportación */}
      {showExportOptions && (
        <Box sx={{ position: 'absolute', top: 40, right: 0, zIndex: 20 }}>
          <Paper elevation={4} sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Exportar como:</Typography>
            <Button size="small" onClick={() => exportDiagram('png')} sx={{ mr: 1 }}>
              PNG
            </Button>
            <Button size="small" onClick={() => exportDiagram('pdf')}>
              PDF
            </Button>
          </Paper>
        </Box>
      )}

      {/* Controles de Navegación */}
      <Box sx={{ position: 'absolute', bottom: -60, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 2, zIndex: 10 }}>
        <Button
          variant="outlined"
          startIcon={<NavigateBefore />}
          onClick={handlePrevStep}
          disabled={activeArea === 0 && !showDetails}
          size="small"
        >
          Anterior
        </Button>
        
        <Button
          variant="contained"
          endIcon={<NavigateNext />}
          onClick={handleNextStep}
          size="small"
        >
          {!showDetails ? 'Siguiente' : 'Finalizar'}
        </Button>
      </Box>

      {/* Área invisible para click simple - no perder foco */}
      <Box 
        sx={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          height: 100, 
          cursor: 'pointer',
          zIndex: 1,
          backgroundColor: 'transparent'
        }}
        onClick={handleNextStep}
        title="Click para avanzar"
      />

      {/* Título */}
      <Fade in timeout={1000}>
        <Typography variant="h3" align="center" sx={{ mb: 2, fontWeight: 700 }}>
          🔗 MAPA COMPLETO DE INTERRELACIÓN DE DATOS
        </Typography>
      </Fade>

      <Fade in timeout={1500}>
        <Typography variant="h6" align="center" color="text.secondary" sx={{ mb: 4 }}>
          Así se conectan los datos en tu organización según Ley 21719
        </Typography>
      </Fade>

      {/* Información contextual */}
      <Fade in timeout={2000}>
        <Alert severity="info" sx={{ mb: 4 }}>
          <Typography variant="body2">
            <strong>Ejemplo práctico:</strong> Si un empleado de RRHH solicita eliminar sus datos (derecho de cancelación), 
            el DPO debe coordinar la eliminación en <strong>8-12 sistemas</strong> diferentes y notificar a 
            <strong>5-10 terceros</strong> como Previred, bancos, seguros, y sistemas de bienestar.
          </Typography>
        </Alert>
      </Fade>

      {/* Diagrama central con DPO */}
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '500px', position: 'relative' }}>
        {/* DPO en el centro */}
        <Zoom in timeout={2500}>
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

        {/* Áreas organizacionales alrededor */}
        {areas.map((area, index) => {
          const angle = (index * 2 * Math.PI) / areas.length - Math.PI/2;
          const radius = 200;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          
          return (
            <Fade key={area.id} in={activeArea >= index} timeout={1000}>
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
                  elevation={activeArea >= index ? 8 : 3}
                  sx={{ 
                    width: 180,
                    height: 220,
                    bgcolor: activeArea >= index ? `${area.color}.light` : 'background.paper',
                    transform: activeArea >= index ? 'scale(1.05)' : 'scale(1)',
                    transition: 'all 0.5s ease-in-out',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    setActiveArea(index);
                    if (audioEnabled) playStepAudio(index);
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
                {activeArea >= index && (
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
                )}
              </Box>
            </Fade>
          );
        })}
      </Box>

      {/* Detalles expandidos */}
      <Fade in={showDetails} timeout={1000}>
        <Box sx={{ mt: 6 }}>
          <Typography variant="h4" align="center" sx={{ mb: 4, fontWeight: 600 }}>
            📊 ANÁLISIS COMPLETO DE INTERDEPENDENCIAS
          </Typography>
          
          <Grid container spacing={3}>
            {/* Cuadro de gestión de eliminación */}
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

            {/* Cuadro de tiempos de retención */}
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

            {/* Responsabilidades del DPO */}
            <Grid item xs={12}>
              <Paper elevation={8} sx={{ p: 4, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <DpoIcon sx={{ fontSize: 40, mr: 2 }} />
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    RESPONSABILIDADES DEL DELEGADO DE PROTECCIÓN DE DATOS (DPO)
                  </Typography>
                </Box>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <ViewIcon sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        SUPERVISIÓN GENERAL
                      </Typography>
                      <Typography variant="body2">
                        Monitoreo continuo de todos los tratamientos
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <PersonIcon sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        DERECHOS ARCOP
                      </Typography>
                      <Typography variant="body2">
                        Gestión de solicitudes de titulares
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <SecurityIcon sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        BRECHAS DE SEGURIDAD
                      </Typography>
                      <Typography variant="body2">
                        Respuesta y notificación obligatoria
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <ReportIcon sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        ENLACE REGULATORIO
                      </Typography>
                      <Typography variant="body2">
                        Comunicación con Agencia de Datos
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Fade>

      {/* Llamada a la acción final */}
      <Fade in={showDetails} timeout={2000}>
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
    </Box>
  );
};

export default DiagramaInterrelacionDatos;