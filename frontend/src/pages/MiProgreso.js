import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Button,
  Avatar,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/lab';
import {
  EmojiEvents,
  School,
  CheckCircle,
  Lock,
  Download,
  Star,
  WorkspacePremium,
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function MiProgreso() {
  // Datos de ejemplo
  const estadisticasGenerales = {
    progreso_total: 35,
    modulos_completados: 3,
    modulos_totales: 8,
    tiempo_total: '4.5 horas',
    puntos_experiencia: 450,
    nivel: 'Principiante',
    siguiente_nivel: 'Intermedio',
    puntos_siguiente_nivel: 1000,
  };

  const modulosProgreso = [
    { nombre: 'Introducción', progreso: 100, estado: 'completado' },
    { nombre: 'Descubrir Datos', progreso: 60, estado: 'en_progreso' },
    { nombre: 'Taller RAT', progreso: 0, estado: 'bloqueado' },
    { nombre: 'Datos Sensibles', progreso: 0, estado: 'bloqueado' },
    { nombre: 'Flujos de Datos', progreso: 0, estado: 'bloqueado' },
  ];

  const logros = [
    {
      id: 1,
      nombre: 'Primera Entrevista',
      descripcion: 'Completaste tu primera simulación de entrevista',
      icono: '🎤',
      fecha: '2024-07-28',
      puntos: 50,
      obtenido: true,
    },
    {
      id: 2,
      nombre: 'Explorador de Datos',
      descripcion: 'Identificaste 10 categorías de datos diferentes',
      icono: '🔍',
      fecha: '2024-07-30',
      puntos: 100,
      obtenido: true,
    },
    {
      id: 3,
      nombre: 'Maestro del RAT',
      descripcion: 'Documenta 5 actividades perfectamente',
      icono: '📋',
      fecha: null,
      puntos: 200,
      obtenido: false,
    },
    {
      id: 4,
      nombre: 'Guardián de Datos',
      descripcion: 'Completa todos los módulos de seguridad',
      icono: '🛡️',
      fecha: null,
      puntos: 300,
      obtenido: false,
    },
  ];

  const actividadReciente = [
    { fecha: '2024-08-02', actividad: 'Completaste Quiz de Conceptos', puntos: 25 },
    { fecha: '2024-08-01', actividad: 'Práctica Sandbox: Entrevista RRHH', puntos: 50 },
    { fecha: '2024-07-30', actividad: 'Módulo 1 completado', puntos: 100 },
    { fecha: '2024-07-28', actividad: 'Primera sesión de aprendizaje', puntos: 10 },
  ];

  const competencias = [
    { nombre: 'Identificación de Datos', valor: 80 },
    { nombre: 'Entrevistas Efectivas', valor: 65 },
    { nombre: 'Documentación RAT', valor: 40 },
    { nombre: 'Análisis de Riesgos', valor: 20 },
    { nombre: 'Bases de Licitud', valor: 70 },
  ];


  return (
    <Box>
      <Typography variant="h4" fontWeight={600} gutterBottom>
        Mi Progreso de Aprendizaje
      </Typography>

      {/* Resumen General */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5" fontWeight={600}>
                  Resumen General
                </Typography>
                <Chip 
                  label={estadisticasGenerales.nivel}
                  color="primary"
                  icon={<Star />}
                />
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light', color: 'white' }}>
                    <Typography variant="h3" fontWeight={600}>
                      {estadisticasGenerales.progreso_total}%
                    </Typography>
                    <Typography variant="body2">Progreso Total</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h3" fontWeight={600} color="success.main">
                      {estadisticasGenerales.modulos_completados}
                    </Typography>
                    <Typography variant="body2">Módulos Completados</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h3" fontWeight={600} color="primary">
                      {estadisticasGenerales.tiempo_total}
                    </Typography>
                    <Typography variant="body2">Tiempo Invertido</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h3" fontWeight={600} color="warning.main">
                      {estadisticasGenerales.puntos_experiencia}
                    </Typography>
                    <Typography variant="body2">Puntos XP</Typography>
                  </Paper>
                </Grid>
              </Grid>

              {/* Barra de progreso al siguiente nivel */}
              <Box mt={3}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Progreso al siguiente nivel</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {estadisticasGenerales.puntos_experiencia} / {estadisticasGenerales.puntos_siguiente_nivel} XP
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={(estadisticasGenerales.puntos_experiencia / estadisticasGenerales.puntos_siguiente_nivel) * 100}
                  sx={{ height: 10, borderRadius: 5 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Competencias Desarrolladas
              </Typography>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={competencias} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nombre" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="valor" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Progreso por Módulos */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Progreso por Módulos
              </Typography>
              <List>
                {modulosProgreso.map((modulo, idx) => (
                  <ListItem key={idx}>
                    <ListItemIcon>
                      {modulo.estado === 'completado' && <CheckCircle color="success" />}
                      {modulo.estado === 'en_progreso' && <School color="primary" />}
                      {modulo.estado === 'bloqueado' && <Lock color="disabled" />}
                    </ListItemIcon>
                    <ListItemText 
                      primary={modulo.nombre}
                      secondary={
                        <LinearProgress 
                          variant="determinate" 
                          value={modulo.progreso} 
                          sx={{ mt: 1 }}
                        />
                      }
                    />
                    <Typography variant="body2" color="text.secondary">
                      {modulo.progreso}%
                    </Typography>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Actividad Reciente
              </Typography>
              <Timeline>
                {actividadReciente.map((actividad, idx) => (
                  <TimelineItem key={idx}>
                    <TimelineOppositeContent>
                      <Typography variant="body2" color="text.secondary">
                        {actividad.fecha}
                      </Typography>
                    </TimelineOppositeContent>
                    <TimelineSeparator>
                      <TimelineDot color={idx === 0 ? 'primary' : 'grey'} />
                      {idx < actividadReciente.length - 1 && <TimelineConnector />}
                    </TimelineSeparator>
                    <TimelineContent>
                      <Typography variant="body2">{actividad.actividad}</Typography>
                      <Chip 
                        label={`+${actividad.puntos} XP`} 
                        size="small" 
                        color="success"
                        sx={{ mt: 0.5 }}
                      />
                    </TimelineContent>
                  </TimelineItem>
                ))}
              </Timeline>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Logros */}
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6">
              <EmojiEvents sx={{ verticalAlign: 'middle', mr: 1 }} />
              Logros y Certificaciones
            </Typography>
            <Button variant="outlined" startIcon={<Download />}>
              Descargar Certificados
            </Button>
          </Box>

          <Grid container spacing={2}>
            {logros.map((logro) => (
              <Grid item xs={12} sm={6} md={3} key={logro.id}>
                <Paper 
                  sx={{ 
                    p: 3, 
                    textAlign: 'center',
                    opacity: logro.obtenido ? 1 : 0.5,
                    filter: logro.obtenido ? 'none' : 'grayscale(100%)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {logro.obtenido && (
                    <Chip 
                      label="OBTENIDO" 
                      size="small" 
                      color="success"
                      sx={{ 
                        position: 'absolute', 
                        top: 8, 
                        right: 8,
                        fontSize: '0.7rem',
                      }}
                    />
                  )}
                  <Typography variant="h2" sx={{ mb: 1 }}>
                    {logro.icono}
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {logro.nombre}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" component="div">
                    {logro.descripcion}
                  </Typography>
                  {logro.obtenido && (
                    <Typography variant="caption" color="primary" sx={{ mt: 1 }}>
                      {logro.fecha}
                    </Typography>
                  )}
                  <Box mt={1}>
                    <Chip 
                      label={`${logro.puntos} XP`} 
                      size="small"
                      color={logro.obtenido ? 'primary' : 'default'}
                    />
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* Certificado especial */}
          <Paper sx={{ p: 3, mt: 3, bgcolor: 'primary.light', color: 'white' }}>
            <Grid container alignItems="center" spacing={2}>
              <Grid item>
                <Avatar sx={{ width: 64, height: 64, bgcolor: 'white', color: 'primary.main' }}>
                  <WorkspacePremium fontSize="large" />
                </Avatar>
              </Grid>
              <Grid item xs>
                <Typography variant="h6">
                  Próximo Certificado: Fundamentos de Protección de Datos
                </Typography>
                <Typography variant="body2">
                  Completa 5 módulos para obtener tu certificado oficial de fundamentos LPDP
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={60} 
                  sx={{ mt: 1, bgcolor: 'rgba(255,255,255,0.3)' }}
                />
              </Grid>
              <Grid item>
                <Button variant="contained" color="secondary">
                  Ver Requisitos
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </CardContent>
      </Card>
    </Box>
  );
}

export default MiProgreso;
