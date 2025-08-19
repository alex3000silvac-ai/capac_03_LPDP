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
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../config';
import { useAuth } from '../contexts/AuthContext';

const MotionCard = motion(Card);

// Función para obtener el icono apropiado según el módulo
const getModuleIcon = (moduleId, index) => {
  if (moduleId === 'modulo3_inventario') return '🗂️';
  if (moduleId === 'introduccion_lpdp') return '📖';
  if (moduleId === 'conceptos_basicos') return '🔍';
  if (moduleId === 'uso_sistema') return '🛠️';
  
  // Iconos por defecto basados en índice
  const defaultIcons = ['📖', '🔍', '🗂️', '🛠️', '🎯', '📊', '🔒', '⚖️'];
  return defaultIcons[index] || '📚';
};

function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [modulos, setModulos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Función para cargar los módulos desde la API
    const cargarModulos = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Intenta obtener datos de la API real
        const response = await fetch(`${API_BASE_URL}/api/v1/capacitacion/modulos`);
        
        if (response.ok) {
          const data = await response.json();
          
          // Transforma los datos de la API al formato esperado
          const modulosFormateados = data.modulos.map((modulo, index) => {
            // Si es admin/superuser, todos los módulos están desbloqueados
            const isAdmin = user?.is_superuser || user?.username === 'admin';
            let estado, progreso;
            
            if (isAdmin) {
              // Admin tiene acceso a todo
              estado = index === 0 ? 'completado' : 'disponible';
              progreso = index === 0 ? 100 : 0;
            } else {
              // Usuario normal con progresión secuencial
              estado = modulo.estado || (index === 0 ? 'completado' : index === 1 ? 'en_progreso' : 'bloqueado');
              progreso = modulo.progreso || (index === 0 ? 100 : index === 1 ? 60 : 0);
            }
            
            return {
              id: modulo.id || `MOD-00${index + 1}`,
              titulo: modulo.nombre || modulo.titulo,
              descripcion: modulo.descripcion,
              duracion: `${modulo.duracion_estimada || 45} min`,
              progreso: progreso,
              estado: estado,
              icono: getModuleIcon(modulo.id || modulo.nombre, index),
              actual: !isAdmin && index === 1, // Solo marca "actual" para usuarios normales
              nivel: modulo.nivel || 'básico',
              dirigido_a: modulo.dirigido_a,
              incluye: modulo.incluye,
            };
          });
          
          setModulos(modulosFormateados);
        } else {
          throw new Error('No se pudo obtener los módulos');
        }
      } catch (err) {
        console.error('Error al cargar módulos:', err);
        setError('No se pudieron cargar los módulos. Mostrando datos de ejemplo.');
        
        // Si falla la API, usa datos de ejemplo
        const isAdmin = user?.is_superuser || user?.username === 'admin';
        const modulosEjemplo = [
          {
            id: 'introduccion_lpdp',
            titulo: 'Introducción a la Protección de Datos',
            descripcion: 'Fundamentos legales y conceptos básicos de la Ley N° 21.719',
            duracion: '45 min',
            progreso: 100,
            estado: 'completado',
            icono: '📖',
          },
          {
            id: 'conceptos_basicos',
            titulo: 'Conceptos Básicos de Protección de Datos',
            descripcion: '¿Qué es un dato personal? ¿Qué es el tratamiento?',
            duracion: '45 min',
            progreso: isAdmin ? 0 : 60,
            estado: isAdmin ? 'disponible' : 'en_progreso',
            icono: '🔍',
            actual: !isAdmin,
          },
          {
            id: 'modulo3_inventario',
            titulo: 'Módulo 3: Inventario y Mapeo de Datos',
            descripcion: 'Construcción profesional del RAT según Ley 21.719 - Incluye simuladores y herramientas para DPO',
            duracion: '480 min',
            progreso: 0,
            estado: isAdmin ? 'disponible' : 'bloqueado',
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
            estado: isAdmin ? 'disponible' : 'bloqueado',
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
        severity={user?.is_superuser || user?.username === 'admin' ? "success" : "info"} 
        icon={<InfoOutlined />}
        sx={{ mb: 3 }}
      >
        <Typography variant="subtitle1" fontWeight={600}>
          {user?.is_superuser || user?.username === 'admin' 
            ? '🔓 ¡Bienvenido, Administrador!' 
            : '📖 Curso Especializado - Capítulo 3: Inventario y Mapeo de Datos'}
        </Typography>
        <Typography variant="body2">
          {user?.is_superuser || user?.username === 'admin'
            ? 'Como administrador, tienes acceso completo a todos los módulos para revisión y demostración. Todos los módulos están desbloqueados.'
            : 'Este curso se enfoca exclusivamente en el Capítulo 3 del programa completo de LPDP. Incluye herramientas profesionales, simuladores y metodologías para construir el RAT (Registro de Actividades de Tratamiento) según Ley 21.719.'}
        </Typography>
      </Alert>

      {/* Información del Instructor y Alcance del Curso */}
      <Alert severity="warning" icon={<School />} sx={{ mb: 3 }}>
        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
          👨‍⚖️ Instructor: Abogado Especialista en Protección de Datos
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Experto certificado en implementación de Ley 21.719 con enfoque práctico en casos reales.
        </Typography>
        <Typography variant="body2" fontWeight={600} color="warning.dark">
          ⚠️ IMPORTANTE: Este curso cubre únicamente el Capítulo 3 - Inventario y Mapeo de Datos. 
          Los demás capítulos (Fundamentos Legales, Conceptos Básicos, Derechos de Titulares, Medidas de Seguridad) 
          se ofrecen en cursos separados del programa completo de LPDP.
        </Typography>
      </Alert>

      {/* Header con estadísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, bgcolor: 'primary.light', color: 'white' }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="h4" fontWeight={600}>35%</Typography>
                <Typography variant="body2">Progreso Total</Typography>
              </Box>
              <TrendingUp fontSize="large" />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="h4" fontWeight={600}>3</Typography>
                <Typography variant="body2">Módulos Completados</Typography>
              </Box>
              <CheckCircle fontSize="large" color="success" />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="h4" fontWeight={600}>4.5h</Typography>
                <Typography variant="body2">Tiempo Invertido</Typography>
              </Box>
              <Timer fontSize="large" color="primary" />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="h4" fontWeight={600}>2</Typography>
                <Typography variant="body2">Logros Obtenidos</Typography>
              </Box>
              <EmojiEvents fontSize="large" color="warning" />
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
            <MotionCard
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
                  <Avatar sx={{ bgcolor: 'primary.light', width: 56, height: 56 }}>
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
                  onClick={() => navigate(`/modulo/${modulo.id}`)}
                >
                  {modulo.estado === 'completado' ? 'Repasar' : 
                   modulo.estado === 'en_progreso' ? 'Continuar' : 
                   modulo.estado === 'disponible' ? 'Iniciar' : 'Bloqueado'}
                </Button>
              </CardActions>
            </MotionCard>
          </Grid>
          ))}
        </Grid>
      )}

      {/* Sección de Práctica */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Próximas Actividades
              </Typography>
              <List>
                {proximasActividades.map((actividad, index) => (
                  <ListItem
                    key={index}
                    secondaryAction={
                      <IconButton edge="end" onClick={() => navigate(`/modulo/${actividad.modulo}`)}>
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
                onClick={() => navigate('/sandbox')}
              >
                Ir al Modo Práctica (Sandbox)
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
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
      </Grid>
    </Box>
  );
}

export default Dashboard;