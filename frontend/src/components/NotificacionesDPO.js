/**
 * SISTEMA DE NOTIFICACIONES PARA EL DPO - VERSION PRODUCCION LIMPIA
 * Este componente muestra SOLO datos reales desde Supabase
 * SIN datos demo, ejemplos o hardcodeados
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Badge,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Divider,
  Grid,
  Popover,
  Avatar,
  CircularProgress
} from '@mui/material';
import {
  Notifications as NotificationIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as CheckIcon,
  Assignment as DocumentIcon,
  Security as SecurityIcon,
  Business as BusinessIcon,
  Assessment as AssessmentIcon,
  Schedule as ScheduleIcon,
  PriorityHigh as PriorityIcon,
  Email as EmailIcon,
  Dashboard as DashboardIcon,
  FileCopy as FileIcon,
  Person as PersonIcon,
  LocalHospital as HealthIcon,
  Computer as TechIcon,
  Gavel as LegalIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabaseClient';

const NotificacionesDPO = () => {
  const { user } = useAuth();
  
  // Estados para datos reales desde Supabase
  const [notificaciones, setNotificaciones] = useState([]);
  const [actividades, setActividades] = useState([]);
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados UI
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // CARGAR DATOS REALES DESDE SUPABASE
  const cargarDatosReales = async () => {
    if (!user?.id) {
      console.log('👤 Usuario no disponible para cargar datos');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('📊 Cargando datos reales para usuario:', user.id);

      // 1. Cargar actividades DPO pendientes
      const { data: actividadesData, error: actividadesError } = await supabase
        .from('actividades_dpo')
        .select(`
          *,
          rats!inner(id, titulo, area, descripcion),
          organizaciones!inner(company_name)
        `)
        .eq('asignado_a', user.id)
        .order('fecha_creacion', { ascending: false });

      if (actividadesError) {
        console.error('❌ Error cargando actividades:', actividadesError);
        throw actividadesError;
      }

      // 2. Cargar documentos asociados
      const { data: documentosData, error: documentosError } = await supabase
        .from('documentos_asociados')
        .select(`
          *,
          rats!inner(titulo, area)
        `)
        .eq('user_id', user.id)
        .order('fecha_asociacion', { ascending: false });

      if (documentosError) {
        console.error('❌ Error cargando documentos:', documentosError);
        // No throw - documentos son opcionales
      }

      // 3. Convertir actividades a notificaciones
      const notificacionesReales = (actividadesData || []).map(actividad => ({
        id: `NOTIF-${actividad.id}`,
        tipo: determinarTipoNotificacion(actividad.prioridad),
        titulo: `${getIconoActividad(actividad.tipo_actividad)} ${actividad.descripcion}`,
        descripcion: `${actividad.rats.titulo} - ${actividad.organizaciones.company_name}`,
        fechaCreacion: new Date(actividad.fecha_creacion),
        vencimiento: calcularDiasVencimiento(actividad.fecha_vencimiento),
        documentoId: actividad.metadatos?.documento_id || `${actividad.tipo_actividad}-${actividad.id}`,
        ratOrigen: actividad.rats.titulo,
        progreso: 0,
        area: actividad.rats.area?.toLowerCase() || 'general',
        actividad_id: actividad.id,
        rat_id: actividad.rat_id,
        prioridad_original: actividad.prioridad
      }));

      setNotificaciones(notificacionesReales);
      setActividades(actividadesData || []);
      setDocumentos(documentosData || []);
      
      console.log(`✅ Datos cargados exitosamente:
        - Notificaciones: ${notificacionesReales.length}
        - Actividades: ${(actividadesData || []).length}
        - Documentos: ${(documentosData || []).length}`);

    } catch (error) {
      console.error('💥 Error cargando datos reales:', error);
      setError('Error cargando datos del DPO. Verifica la conexión con Supabase.');
      setNotificaciones([]);
      setActividades([]);
      setDocumentos([]);
    } finally {
      setLoading(false);
    }
  };

  // Efectos para cargar datos
  useEffect(() => {
    if (user?.id) {
      cargarDatosReales();
      
      // Recargar datos cada 60 segundos
      const interval = setInterval(cargarDatosReales, 60000);
      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
  }, [user]);

  // FUNCIONES AUXILIARES
  const determinarTipoNotificacion = (prioridad) => {
    switch(prioridad?.toLowerCase()) {
      case 'alta': return 'critico';
      case 'media': return 'urgente';
      case 'baja': return 'advertencia';
      default: return 'info';
    }
  };

  const getIconoActividad = (tipoActividad) => {
    const iconos = {
      'REVISION_EIPD': '🔍',
      'CREAR_EIPD': '📋',
      'REVISION_DPIA': '🤖',
      'CREAR_DPIA': '🤖',
      'REVISION_DPA': '📄',
      'CREAR_DPA': '📄',
      'CONSULTA_PREVIA': '🚨'
    };
    return iconos[tipoActividad] || '📊';
  };

  const calcularDiasVencimiento = (fechaVencimiento) => {
    if (!fechaVencimiento) return 999;
    
    const hoy = new Date();
    const vencimiento = new Date(fechaVencimiento);
    const diffTime = vencimiento - hoy;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  };

  const handleCompletarDocumento = (task) => {
    console.log('🚀 handleCompletarDocumento called with task:', task);
    
    if (!task) {
      console.error('❌ Task is null or undefined');
      return;
    }

    const tipoDoc = task.documentoId?.split('-')[0] || task.tipo_actividad || 'EIPD';
    console.log('📋 Tipo documento:', tipoDoc);

    // Determinar redirección según tipo de actividad
    const redirecciones = {
      'REVISION_EIPD': `/evaluacion-impacto?rat=${encodeURIComponent(task.ratOrigen)}&actividad=${task.actividad_id}`,
      'CREAR_EIPD': `/evaluacion-impacto?rat=${encodeURIComponent(task.ratOrigen)}&nuevo=true`,
      'REVISION_DPIA': `/dpia-algoritmos?rat=${encodeURIComponent(task.ratOrigen)}&actividad=${task.actividad_id}`,
      'CREAR_DPIA': `/dpia-algoritmos?rat=${encodeURIComponent(task.ratOrigen)}&nuevo=true`,
      'REVISION_DPA': `/gestion-proveedores?rat=${encodeURIComponent(task.ratOrigen)}&actividad=${task.actividad_id}`,
      'CREAR_DPA': `/gestion-proveedores?rat=${encodeURIComponent(task.ratOrigen)}&nuevo=true`,
      'CONSULTA_PREVIA': `/consulta-previa?rat=${encodeURIComponent(task.ratOrigen)}&actividad=${task.actividad_id}`
    };

    const tipoActividad = actividades.find(a => a.id === task.actividad_id)?.tipo_actividad;
    const url = redirecciones[tipoActividad] || `/evaluacion-impacto?rat=${encodeURIComponent(task.ratOrigen)}&nuevo=true`;

    console.log('📍 Redirigiendo a:', url);
    
    // Cerrar dialog y redireccionar
    setDialogOpen(false);
    setSelectedTask(null);
    window.location.href = url;
  };

  // RENDER ESTADOS DE CARGA Y ERROR
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Cargando notificaciones DPO...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        <Typography variant="h6">Error de Conexión</Typography>
        <Typography>{error}</Typography>
        <Button onClick={cargarDatosReales} sx={{ mt: 1 }}>
          Reintentar
        </Button>
      </Alert>
    );
  }

  if (!user) {
    return (
      <Alert severity="warning" sx={{ m: 2 }}>
        <Typography>Debes estar autenticado para ver las notificaciones DPO.</Typography>
      </Alert>
    );
  }

  // RENDER SISTEMA VACIO (SIN DATOS)
  if (notificaciones.length === 0) {
    return (
      <Card sx={{ m: 2, p: 3, textAlign: 'center' }}>
        <DashboardIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          Dashboard DPO - Sin Actividades Pendientes
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          No hay actividades DPO pendientes en este momento.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Las actividades aparecerán automáticamente cuando se creen RATs que requieran:
        </Typography>
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Chip icon={<SecurityIcon />} label="Evaluaciones EIPD" size="small" />
          <Chip icon={<AssessmentIcon />} label="Análisis DPIA" size="small" />
          <Chip icon={<DocumentIcon />} label="Contratos DPA" size="small" />
          <Chip icon={<WarningIcon />} label="Consultas Previas" size="small" />
        </Box>
        <Button 
          variant="outlined" 
          onClick={cargarDatosReales} 
          sx={{ mt: 3 }}
          startIcon={<NotificationIcon />}
        >
          Actualizar
        </Button>
      </Card>
    );
  }

  // RENDER NORMAL CON DATOS REALES
  return (
    <Box sx={{ p: 2 }}>
      {/* Header con estadísticas reales */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                🔔 Dashboard DPO
              </Typography>
              <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                Actividades Reales en Producción
              </Typography>
            </Box>
            <Box textAlign="center">
              <Typography variant="h2" sx={{ color: 'white', fontWeight: 'bold' }}>
                {notificaciones.length}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                Pendientes
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Tabla de actividades reales */}
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell><strong>Prioridad</strong></TableCell>
              <TableCell><strong>Actividad</strong></TableCell>
              <TableCell><strong>RAT Origen</strong></TableCell>
              <TableCell><strong>Área</strong></TableCell>
              <TableCell><strong>Vencimiento</strong></TableCell>
              <TableCell><strong>Acciones</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {notificaciones.map((notif) => (
              <TableRow
                key={notif.id}
                onClick={() => {
                  setSelectedTask(notif);
                  setDialogOpen(true);
                }}
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: '#f9f9f9' }
                }}
              >
                <TableCell>
                  <Chip
                    label={notif.prioridad_original || 'Media'}
                    color={
                      notif.tipo === 'critico' ? 'error' : 
                      notif.tipo === 'urgente' ? 'warning' : 'default'
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {notif.titulo}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {notif.descripcion}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {notif.ratOrigen}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {notif.area}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography 
                    variant="body2"
                    color={notif.vencimiento <= 2 ? 'error' : 'text.secondary'}
                  >
                    {notif.vencimiento === 999 ? 'Sin límite' : `${notif.vencimiento} días`}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    size="small"
                    color="primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCompletarDocumento(notif);
                    }}
                  >
                    Completar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog para detalles de tarea */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          📋 Detalle de Tarea Pendiente
        </DialogTitle>
        <DialogContent>
          {selectedTask && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedTask.titulo}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {selectedTask.descripcion}
              </Typography>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>RAT Origen:</strong> {selectedTask.ratOrigen}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Área:</strong> {selectedTask.area}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            Cerrar
          </Button>
          <Button 
            variant="contained" 
            onClick={() => handleCompletarDocumento(selectedTask)}
            color="primary"
          >
            Ir a Completar Documento
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NotificacionesDPO;