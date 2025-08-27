import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  LinearProgress,
  Chip,
  Avatar,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  PlayCircleOutline,
  Timer,
  CheckCircle,
  TrendingUp,
  School,
  Psychology,
  Science,
  EmojiEvents,
  ArrowForward,
  InfoOutlined,
  CloudDownload,
  Assignment,
  Work,
  Assessment,
  Map,
  Business,
  Security,
  Gavel,
  Build,
} from '@mui/icons-material';
import { API_BASE_URL } from '../config';
import { useAuth } from '../contexts/AuthContext';


// Función para obtener el icono apropiado según el módulo - CONSERVADOR
const getModuleIcon = (moduleId, index) => {
  if (moduleId === 'modulo3_inventario') return '📁';
  if (moduleId === 'introduccion_lpdp') return '📋';
  if (moduleId === 'conceptos_basicos') return '🔍';
  if (moduleId === 'uso_sistema') return '⚙️';
  
  // Iconos conservadores por defecto
  const defaultIcons = ['📋', '🔍', '📁', '⚙️', '📊', '📈', '🔒', '⚖️'];
  return defaultIcons[index] || '📄';
};

function Dashboard() {
  const navigate = useNavigate();
  const { user, isRestricted } = useAuth();
  const [modulos, setModulos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Función para cargar los módulos desde la API
    const cargarModulos = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔌 Cargando módulos en modo OFFLINE');
        
        // Datos offline directos - sin fetch externo
        const modulosOffline = [
          {
            id: 'introduccion_lpdp',
            titulo: 'Introducción a LPDP',
            descripcion: 'Conceptos fundamentales de la Ley 21.719',
            duracion: '45 min',
            nivel: 'básico',
            estado: 'completado',
            progreso: 100,
            icono: '📖'
          },
          {
            id: 'modulo3_inventario',
            titulo: 'Constructor RAT',
            descripcion: 'Mapeo y documentación de tratamientos',
            duracion: '90 min',
            nivel: 'intermedio',
            estado: 'disponible',
            progreso: 0,
            icono: '🗂️',
            actual: true
          },
          {
            id: 'conceptos_basicos',
            titulo: 'Conceptos Avanzados',
            descripcion: 'Profundización en normativa LPDP',
            duracion: '60 min',
            nivel: 'avanzado',
            estado: 'bloqueado',
            progreso: 0,
            icono: '🔍'
          }
        ];
        
        // Aplicar restricciones según tipo de usuario
        const isAdmin = user?.is_superuser || user?.username === 'admin';
        const isDemoRestricted = isRestricted();
        
        const modulosFormateados = modulosOffline.map((modulo, index) => {
          let estado = modulo.estado;
          let progreso = modulo.progreso;
          
          if (isDemoRestricted && index > 0) {
            estado = 'bloqueado';
            progreso = 0;
          } else if (isAdmin) {
            estado = 'disponible';
          }
          
          return {
            ...modulo,
            estado,
            progreso,
            actual: !isAdmin && index === 1
          };
        });
        
        setModulos(modulosFormateados);
      } catch (err) {
        console.error('Error al cargar módulos:', err);
        setError('No se pudieron cargar los módulos. Mostrando datos de ejemplo.');
        
        // Si falla la API, usa datos de ejemplo
        const isAdmin = user?.is_superuser || user?.username === 'admin';
        const isDemoRestricted = isRestricted();
        const modulosEjemplo = [
          {
            id: 'introduccion_lpdp',
            titulo: 'Introducción a la Protección de Datos',
            descripcion: 'Fundamentos legales y conceptos básicos de la Ley N° 21.719',
            duracion: '45 min',
            progreso: 0,
            estado: 'disponible',
            icono: '📖',
          },
          {
            id: 'conceptos_basicos',
            titulo: 'Conceptos Básicos de Protección de Datos',
            descripcion: '¿Qué es un dato personal? ¿Qué es el tratamiento?',
            duracion: '45 min',
            progreso: 0,
            estado: isDemoRestricted ? 'bloqueado' : 'bloqueado',
            icono: '🔍',
            actual: false,
          },
          {
            id: 'modulo3_inventario',
            titulo: 'Módulo 3: Inventario y Mapeo de Datos',
            descripcion: 'Construcción profesional del RAT según Ley 21.719 - Incluye simuladores y herramientas para DPO',
            duracion: '480 min',
            progreso: 0,
            estado: isDemoRestricted ? 'bloqueado' : (isAdmin ? 'disponible' : 'bloqueado'),
            icono: '🗂️',
            nivel: 'profesional',
            dirigido_a: 'DPOs, Abogados, Ingenieros',
          },
          {
            id: 'uso_sistema',
            titulo: 'Uso del Sistema SCLDP',
            descripcion: 'Navegación y funcionalidades del sistema',
            duracion: '45 min',
            progreso: 0,
            estado: isDemoRestricted ? 'bloqueado' : (isAdmin ? 'disponible' : 'bloqueado'),
            icono: '🛠️',
          },
        ];
        
        setModulos(modulosEjemplo);
      } finally {
        setLoading(false);
      }
    };

    cargarModulos();
  }, []); // Se ejecuta solo una vez al montar el componente

  const proximasActividades = [
    {
      tipo: 'leccion',
      titulo: 'Simulación: Entrevista con RRHH',
      tiempo: '30 min',
      modulo: 'MOD-002',
    },
    {
      tipo: 'ejercicio',
      titulo: 'Identificar datos sensibles',
      tiempo: '15 min',
      modulo: 'MOD-002',
    },
    {
      tipo: 'quiz',
      titulo: 'Quiz: Bases de Licitud',
      tiempo: '10 min',
      modulo: 'MOD-001',
    },
  ];

  const logros = [
    { nombre: 'Primera Entrevista', obtenido: true, icono: '🎤' },
    { nombre: 'Explorador de Datos', obtenido: true, icono: '🔍' },
    { nombre: 'Maestro del RAT', obtenido: false, icono: '📋' },
    { nombre: 'Guardián de Datos', obtenido: false, icono: '🛡️' },
  ];

  return (
    <Box>
      {/* Mensaje de Bienvenida */}
      <Alert 
        severity={isRestricted() ? "warning" : (user?.is_superuser || user?.username === 'admin' ? "success" : "info")} 
        icon={<InfoOutlined />}
        sx={{ mb: 3 }}
      >
        <Typography variant="subtitle1" fontWeight={600}>
          {isRestricted() 
            ? '👀 Vista Demo - Solo Primera Página'
            : (user?.is_superuser || user?.username === 'admin' 
              ? '🔓 ¡Bienvenido, Administrador!' 
              : '📖 Curso Especializado - Capítulo 3: Inventario y Mapeo de Datos')}
        </Typography>
        <Typography variant="body2">
          {isRestricted()
            ? 'Estás en modo DEMO. Puedes ver únicamente la página de introducción para evaluar nuestro sistema. Para acceso completo al curso, contáctanos para obtener credenciales de acceso.'
            : (user?.is_superuser || user?.username === 'admin'
              ? 'Como administrador, tienes acceso completo a todos los módulos para revisión y demostración. Todos los módulos están desbloqueados.'
              : 'Este curso se enfoca exclusivamente en el Capítulo 3 del programa completo de LPDP. Incluye herramientas profesionales, simuladores y metodologías para construir el RAT (Registro de Actividades de Tratamiento) según Ley 21.719.')}
        </Typography>
        <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
          💡 <strong>Tip:</strong> Si encuentras términos técnicos durante el curso, consulta nuestro 
          <strong> Glosario LPDP completo</strong> que incluye más de 75 términos especializados con 
          definiciones detalladas, ejemplos prácticos y referencias legales específicas de Chile.
        </Typography>
      </Alert>

      {/* Información del Instructor y Alcance del Curso */}
      <Alert severity="warning" icon={<School />} sx={{ mb: 3 }}>
        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
          👨‍⚖️ Instructor: Abogado Especialista en Protección de Datos
        </Typography>
        <Typography variant="body2" fontWeight={600} color="warning.dark">
          ⚠️ IMPORTANTE: Este curso cubre únicamente el Capítulo 3 - Inventario y Mapeo de Datos. 
          Los demás capítulos (Fundamentos Legales, Conceptos Básicos, Derechos de Titulares, Medidas de Seguridad) 
          se ofrecen en cursos separados del programa completo de LPDP.
        </Typography>
      </Alert>

      {/* MAPA CONCEPTUAL DEL SISTEMA */}
      <Paper sx={{ p: 4, mb: 4, background: 'linear-gradient(135deg, #495057 0%, #6c757d 100%)' }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, textAlign: 'center', color: 'white' }}>
          🗺️ MAPA DEL SISTEMA - ¿Qué hacer en cada módulo?
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, color: 'white', fontWeight: 600 }}>
                📋 1. CAPACITACIÓN Y FUNDAMENTOS
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon><School color="primary" /></ListItemIcon>
                  <ListItemText 
                    primary="Módulo Cero" 
                    secondary="Aprender conceptos básicos de Ley 21.719 (7 min)" 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><EmojiEvents color="warning" /></ListItemIcon>
                  <ListItemText 
                    primary="Ruta de Capacitación" 
                    secondary="4 módulos completos + certificación DPO" 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><Assignment color="info" /></ListItemIcon>
                  <ListItemText 
                    primary="Glosario LPDP" 
                    secondary="75+ términos técnicos con ejemplos chilenos" 
                  />
                </ListItem>
              </List>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#ffffff', fontWeight: 600 }}>
                ⚙️ 2. DOCUMENTACIÓN Y CUMPLIMIENTO
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon><Build color="success" /></ListItemIcon>
                  <ListItemText 
                    primary="Constructor RAT" 
                    secondary="Crear registro de actividades (desde Módulo Cero)" 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><Assessment color="primary" /></ListItemIcon>
                  <ListItemText 
                    primary="Consolidado RAT" 
                    secondary="Ver todos los RATs + exportar reportes" 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><Security color="error" /></ListItemIcon>
                  <ListItemText 
                    primary="EIPD (Art. 27)" 
                    secondary="Evaluaciones de impacto para alto riesgo" 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><Business color="secondary" /></ListItemIcon>
                  <ListItemText 
                    primary="Gestión Proveedores" 
                    secondary="Contratos DPA + evaluaciones de seguridad" 
                  />
                </ListItem>
              </List>
            </Box>
          </Grid>
        </Grid>
        
        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            🚀 FLUJO RECOMENDADO:
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            <strong>1.</strong> Complete Módulo Cero (7 min) → 
            <strong>2.</strong> Use Constructor RAT con templates de 70+ industrias → 
            <strong>3.</strong> Revise Consolidado RAT → 
            <strong>4.</strong> Si hay alto riesgo, haga EIPD → 
            <strong>5.</strong> Gestione proveedores con DPAs → 
            <strong>6.</strong> Certifíquese como DPO en Ruta de Capacitación
          </Typography>
        </Alert>
      </Paper>

      {/* Header con estadísticas - CONSERVADOR */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, bgcolor: '#495057', color: 'white' }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="h4" fontWeight={600} sx={{ color: 'white' }}>0%</Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>Progreso Total</Typography>
              </Box>
              <TrendingUp fontSize="large" sx={{ color: 'rgba(255,255,255,0.8)' }} />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, bgcolor: '#343a40', border: '1px solid #495057' }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="h4" fontWeight={600} sx={{ color: '#ffffff' }}>0</Typography>
                <Typography variant="body2" sx={{ color: '#dee2e6' }}>Módulos Completados</Typography>
              </Box>
              <CheckCircle fontSize="large" sx={{ color: '#6c757d' }} />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, bgcolor: '#343a40', border: '1px solid #495057' }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="h4" fontWeight={600} sx={{ color: '#ffffff' }}>0h</Typography>
                <Typography variant="body2" sx={{ color: '#dee2e6' }}>Tiempo Invertido</Typography>
              </Box>
              <Timer fontSize="large" sx={{ color: '#6c757d' }} />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, bgcolor: '#343a40', border: '1px solid #495057' }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="h4" fontWeight={600} sx={{ color: '#ffffff' }}>0</Typography>
                <Typography variant="body2" sx={{ color: '#dee2e6' }}>Logros Obtenidos</Typography>
              </Box>
              <EmojiEvents fontSize="large" sx={{ color: '#6c757d' }} />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Mensaje de error si existe */}
      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Mapa Conceptual del Sistema LPDP - CONSERVADOR */}
      <Paper sx={{ p: 4, mb: 4, bgcolor: '#343a40', border: '2px solid #495057' }}>
        <Box display="flex" alignItems="center" mb={3}>
          <Map sx={{ color: 'primary.main', mr: 2, fontSize: 32 }} />
          <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>
            Mapa Conceptual: Sistema LPDP Chile
          </Typography>
        </Box>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%', bgcolor: '#495057', border: '1px solid #6c757d' }}>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', color: '#ffffff' }}>
                <Business sx={{ mr: 1, color: '#ffffff' }} />
                Módulos del Sistema
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon><School /></ListItemIcon>
                  <ListItemText 
                    primary="Módulo Cero: Fundamentos" 
                    secondary="7 minutos - Conceptos clave LPDP"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><Assignment /></ListItemIcon>
                  <ListItemText 
                    primary="Constructor RAT" 
                    secondary="Registro de Actividades de Tratamiento"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><Assessment /></ListItemIcon>
                  <ListItemText 
                    primary="Herramientas LPDP" 
                    secondary="Calculadoras, evaluadores y plantillas"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><Build /></ListItemIcon>
                  <ListItemText 
                    primary="Simulador Práctico" 
                    secondary="Práctica con casos reales"
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%', bgcolor: '#495057', border: '1px solid #6c757d' }}>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', color: '#ffffff' }}>
                <Security sx={{ mr: 1, color: '#ffffff' }} />
                Proceso de Implementación
              </Typography>
              <Box sx={{ position: 'relative' }}>
                {[
                  { step: 1, title: 'Capacitación', desc: 'Módulo Cero: Conceptos básicos', icon: '📚' },
                  { step: 2, title: 'Mapeo', desc: 'Constructor RAT: Identificar datos', icon: '🗺️' },
                  { step: 3, title: 'Documentación', desc: 'Completar registros oficiales', icon: '📋' },
                  { step: 4, title: 'Cumplimiento', desc: 'Validar y exportar', icon: '✅' }
                ].map((item, index) => (
                  <Box key={item.step} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ 
                      bgcolor: '#6c757d', 
                      color: 'white', 
                      width: 32, 
                      height: 32, 
                      fontSize: '14px',
                      mr: 2
                    }}>
                      {item.step}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {item.icon} {item.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.desc}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>
        </Grid>

        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="body2">
            <strong>💡 Guía de Uso:</strong> Comience con el Módulo Cero para entender los fundamentos, 
            luego use el Constructor RAT para mapear sus datos específicos. 
            Finalmente, utilice las herramientas complementarias para completar su programa de cumplimiento.
          </Typography>
        </Alert>
      </Paper>

      {/* Módulos de Capacitación */}
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        Tu Ruta de Aprendizaje
      </Typography>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              Cargando cursos...
            </Typography>
          </Box>
        </Box>
      ) : (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {modulos.map((modulo, index) => (
          <Grid item xs={12} md={4} key={modulo.id}>
            <Card
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              sx={{
                height: '100%',
                position: 'relative',
                opacity: modulo.estado === 'bloqueado' ? 0.7 : 1,
              }}
            >
              {modulo.actual && (
                <Chip
                  label="EN CURSO"
                  color="primary"
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                  }}
                />
              )}
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar sx={{ bgcolor: '#495057', width: 56, height: 56 }}>
                    <Typography variant="h4">{modulo.icono}</Typography>
                  </Avatar>
                  <Box ml={2}>
                    <Typography variant="h6" fontWeight={600}>
                      {modulo.titulo}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      <Timer fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                      {modulo.duracion}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  {modulo.descripcion}
                </Typography>
                <Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Progreso</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {modulo.progreso}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={modulo.progreso}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: 'grey.200',
                    }}
                  />
                </Box>
              </CardContent>
              <CardActions>
                <Button
                  fullWidth
                  variant={modulo.estado === 'en_progreso' ? 'contained' : 'outlined'}
                  disabled={modulo.estado === 'bloqueado'}
                  startIcon={<PlayCircleOutline />}
                  onClick={() => {
                    // Si es usuario demo restringido, solo permitir introducción
                    if (isRestricted() && modulo.id !== 'introduccion_lpdp') {
                      alert('Acceso limitado en modo demo. Solo puedes ver la introducción.');
                      return;
                    }
                    navigate(`/modulo/${modulo.id}`);
                  }}
                >
                  {modulo.estado === 'completado' ? 'Repasar' : 
                   modulo.estado === 'en_progreso' ? 'Continuar' : 
                   modulo.estado === 'disponible' ? 'Iniciar' : 'Bloqueado'}
                </Button>
              </CardActions>
            </Card>
          </Grid>
          ))}
        </Grid>
      )}

      {/* Sección de Práctica */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ bgcolor: '#343a40', border: '1px solid #495057' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Próximas Actividades
              </Typography>
              <List>
                {proximasActividades.map((actividad, index) => (
                  <ListItem
                    key={index}
                    secondaryAction={
                      <IconButton 
                        edge="end" 
                        onClick={() => {
                          if (isRestricted()) {
                            alert('Acceso limitado en modo demo. Solo puedes ver la introducción.');
                            return;
                          }
                          navigate(`/modulo/${actividad.modulo}`);
                        }}
                        disabled={isRestricted()}
                      >
                        <ArrowForward />
                      </IconButton>
                    }
                  >
                    <ListItemIcon>
                      {actividad.tipo === 'leccion' && <School color="primary" />}
                      {actividad.tipo === 'ejercicio' && <Psychology color="secondary" />}
                      {actividad.tipo === 'quiz' && <Science color="success" />}
                    </ListItemIcon>
                    <ListItemText
                      primary={actividad.titulo}
                      secondary={`${actividad.tiempo} • Módulo ${actividad.modulo}`}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
            <CardActions>
              <Button 
                fullWidth 
                variant="contained" 
                color="secondary"
                disabled={isRestricted()}
                onClick={() => {
                  if (isRestricted()) {
                    alert('Acceso limitado en modo demo. Solo puedes ver la introducción.');
                    return;
                  }
                  navigate('/sandbox');
                }}
              >
                {isRestricted() ? 'Sandbox (Solo Versión Completa)' : 'Ir al Modo Práctica (Sandbox)'}
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: '#343a40', border: '1px solid #495057' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Tus Logros
              </Typography>
              <Grid container spacing={2}>
                {logros.map((logro, index) => (
                  <Grid item xs={6} key={index}>
                    <Paper
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        opacity: logro.obtenido ? 1 : 0.3,
                        filter: logro.obtenido ? 'none' : 'grayscale(100%)',
                        bgcolor: '#495057',
                        border: '1px solid #6c757d'
                      }}
                    >
                      <Typography variant="h2">{logro.icono}</Typography>
                      <Typography variant="caption">{logro.nombre}</Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
            <CardActions>
              <Button fullWidth onClick={() => navigate('/mi-progreso')}>
                Ver Todos los Logros
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Nueva sección: Herramientas Profesionales */}
        <Grid item xs={12}>
          <Card sx={{ background: 'linear-gradient(135deg, #495057 0%, #6c757d 100%)' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2} sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'white' }}>
                <CloudDownload /> Herramientas Profesionales LPDP
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', mb: 2 }}>
                Descarga plantillas Excel personalizadas, formularios de entrevistas y herramientas completas para implementar la Ley 21.719 en tu empresa.
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'rgba(73,80,87,0.1)', border: '1px solid rgba(108,117,125,0.2)' }}>
                    <Assignment fontSize="large" sx={{ color: 'white', mb: 1 }} />
                    <Typography variant="subtitle2" sx={{ color: 'white' }}>
                      Plantillas RAT
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                      Excel personalizado
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'rgba(73,80,87,0.1)', border: '1px solid rgba(108,117,125,0.2)' }}>
                    <Work fontSize="large" sx={{ color: 'white', mb: 1 }} />
                    <Typography variant="subtitle2" sx={{ color: 'white' }}>
                      Formularios
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                      Por área de negocio
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'rgba(73,80,87,0.1)', border: '1px solid rgba(108,117,125,0.2)' }}>
                    <Assessment fontSize="large" sx={{ color: 'white', mb: 1 }} />
                    <Typography variant="subtitle2" sx={{ color: 'white' }}>
                      Matriz Riesgos
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                      Evaluación sistemática
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'rgba(73,80,87,0.1)', border: '1px solid rgba(108,117,125,0.2)' }}>
                    <CheckCircle fontSize="large" sx={{ color: 'white', mb: 1 }} />
                    <Typography variant="subtitle2" sx={{ color: 'white' }}>
                      Checklist
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                      Cumplimiento LPDP
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
              <Alert severity="info" sx={{ mt: 2, bgcolor: 'rgba(255,255,255,0.15)', color: 'white' }}>
                <Typography variant="body2">
                  💼 <strong>Resultado del Curso:</strong> Todas las herramientas se personalizan con los datos de tu empresa 
                  y quedan guardadas en la base de datos para construir automáticamente tu mapeo de datos e inventario completo.
                </Typography>
              </Alert>
            </CardContent>
            <CardActions>
              <Button 
                fullWidth 
                variant="contained" 
                color="secondary"
                size="large"
                startIcon={<CloudDownload />}
                disabled={isRestricted()}
                onClick={() => {
                  if (isRestricted()) {
                    alert('Acceso limitado en modo demo. Solo puedes ver la introducción.');
                    return;
                  }
                  navigate('/herramientas');
                }}
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
              >
                {isRestricted() ? 'Herramientas (Solo Versión Completa)' : 'Acceder a Herramientas Profesionales'}
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;