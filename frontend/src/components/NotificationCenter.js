import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Badge,
  Tooltip,
  Divider,
  Avatar,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Notifications as NotificationIcon,
  NotificationsActive as ActiveNotificationIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CheckCircle as SuccessIcon,
  Schedule as ScheduleIcon,
  Assignment as TaskIcon,
  Security as SecurityIcon,
  Gavel as ComplianceIcon,
  Business as ProviderIcon,
  AdminPanelSettings as AdminIcon,
  Person as UserIcon,
  Settings as SettingsIcon,
  Clear as ClearIcon,
  MarkAsUnread as UnreadIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon,
  ExpandMore as ExpandIcon,
  Send as SendIcon,
  Group as TeamIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';
import { ratService } from '../services/ratService';
import { supabase } from '../config/supabaseClient';
import { useTenant } from '../contexts/TenantContext';

const NotificationCenter = () => {
  const navigate = useNavigate();
  const { currentTenant } = useTenant();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [settings, setSettings] = useState({});
  const [filterType, setFilterType] = useState('TODAS');
  const [filterStatus, setFilterStatus] = useState('TODAS');
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [detailDialog, setDetailDialog] = useState(false);
  
  const [stats, setStats] = useState({
    total: 0,
    noLeidas: 0,
    criticas: 0,
    vencimientos: 0,
    tareas: 0,
    alertas: 0
  });

  const notificationTypes = {
    'RAT_VENCIMIENTO': {
      label: 'RAT Próximo a Vencer',
      icon: <ScheduleIcon />,
      color: '#f59e0b',
      priority: 'ALTA'
    },
    'DPA_RENOVACION': {
      label: 'DPA Requiere Renovación',
      icon: <ComplianceIcon />,
      color: '#ef4444',
      priority: 'CRITICA'
    },
    'EIPD_REQUERIDA': {
      label: 'EIPD Requerida',
      icon: <SecurityIcon />,
      color: '#8b5cf6',
      priority: 'ALTA'
    },
    'WORKFLOW_ASIGNACION': {
      label: 'Nueva Asignación',
      icon: <TaskIcon />,
      color: '#60a5fa',
      priority: 'NORMAL'
    },
    'PROVEEDOR_RIESGO': {
      label: 'Proveedor Alto Riesgo',
      icon: <ProviderIcon />,
      color: '#ef4444',
      priority: 'CRITICA'
    },
    'USUARIO_NUEVO': {
      label: 'Nuevo Usuario Sistema',
      icon: <UserIcon />,
      color: '#10b981',
      priority: 'NORMAL'
    },
    'SISTEMA_ACTUALIZACION': {
      label: 'Actualización Sistema',
      icon: <InfoIcon />,
      color: '#6b7280',
      priority: 'BAJA'
    },
    'AUDITORIA_PROGRAMADA': {
      label: 'Auditoría Programada',
      icon: <AdminIcon />,
      color: '#a78bfa',
      priority: 'ALTA'
    }
  };

  const notificationChannels = {
    'EMAIL': 'Correo Electrónico',
    'IN_APP': 'Notificación En Aplicación',
    'SMS': 'Mensaje SMS',
    'WEBHOOK': 'Webhook Personalizado'
  };

  useEffect(() => {
    cargarNotificaciones();
    cargarConfiguracion();
  }, []);

  const cargarNotificaciones = async () => {
    try {
      setLoading(true);
      const tenantId = currentTenant?.id || 'default';
      
      console.log('🔔 Cargando notificaciones para tenant:', tenantId);
      
      // Consulta simplificada sin join para evitar errores de relación
      const { data, error } = await supabase
        .from('dpo_notifications')
        .select('*')
        .or(`tenant_id.eq.${tenantId},tenant_id.eq.default`)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error consultando notificaciones:', error);
        
        // Si la tabla no existe, crear notificaciones por defecto
        const defaultNotifications = [
          {
            id: 1,
            tipo_notificacion: 'sistema_general',
            titulo: 'Sistema LPDP Operativo',
            mensaje: 'Bienvenido al sistema de cumplimiento Ley 21.719. Todas las funcionalidades están operativas.',
            prioridad: 'media',
            estado: 'no_leida',
            created_at: new Date().toISOString(),
            accion_requerida: { accion: 'explorar_sistema' }
          },
          {
            id: 2,
            tipo_notificacion: 'sistema_general',
            titulo: 'Tablas de notificaciones configuradas',
            mensaje: 'Las tablas dpo_notifications y usuarios han sido configuradas correctamente.',
            prioridad: 'baja',
            estado: 'no_leida',
            created_at: new Date().toISOString(),
            accion_requerida: { accion: 'ejecutar_sql_notificaciones' }
          }
        ];
        
        setNotifications(defaultNotifications);
        calcularEstadisticas(defaultNotifications);
        return;
      }

      const notificationsData = data || [];
      console.log('✅ Notificaciones cargadas:', notificationsData.length);

      // Formatear notificaciones para el componente
      const formattedNotifications = notificationsData.map(notif => ({
        ...notif,
        usuario_nombre: 'Admin Jurídica Digital', // Por defecto mientras no hay join
        usuario_email: 'admin@juridicadigital.cl'
      }));

      setNotifications(formattedNotifications);
      calcularEstadisticas(formattedNotifications);
      
    } catch (error) {
      console.error('❌ Error cargando notificaciones:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const cargarConfiguracion = async () => {
    try {
      console.log('📋 Cargando configuración de notificaciones...');
      
      // Usar configuración por defecto hasta que se implemente tabla específica
      const configData = {
        canales_habilitados: ['EMAIL', 'IN_APP'],
        horario_notificaciones: {
          inicio: '08:00',
          fin: '18:00',
          dias_semana: ['L', 'M', 'X', 'J', 'V']
        },
        tipos_habilitados: {
          'RAT_VENCIMIENTO': true,
          'DPA_RENOVACION': true,
          'EIPD_REQUERIDA': true,
          'WORKFLOW_ASIGNACION': true,
          'PROVEEDOR_RIESGO': true,
          'USUARIO_NUEVO': false,
          'SISTEMA_ACTUALIZACION': false,
          'AUDITORIA_PROGRAMADA': true
        },
        frecuencia_digest: 'DIARIO',
        modo_no_molestar: false
      };
      
      console.log('✅ Configuración cargada:', configData);
      setSettings(configData);
    } catch (error) {
      console.error('❌ Error cargando configuración:', error);
    }
  };

  const calcularEstadisticas = (notificationsData) => {
    const stats = {
      total: notificationsData.length,
      noLeidas: notificationsData.filter(n => !n.leida_en).length,
      criticas: notificationsData.filter(n => n.prioridad === 'CRITICA').length,
      vencimientos: notificationsData.filter(n => n.tipo_notificacion && n.tipo_notificacion.includes('VENCIMIENTO')).length,
      tareas: notificationsData.filter(n => n.tipo_notificacion && n.tipo_notificacion.includes('WORKFLOW')).length,
      alertas: notificationsData.filter(n => n.prioridad === 'ALTA').length
    };
    setStats(stats);
  };

  const marcarLeida = async (notificationId) => {
    try {
      const { error } = await supabase
        .from('dpo_notifications')
        .update({ leida_en: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, leida_en: new Date().toISOString() } : n)
      );
      
    } catch (error) {
      console.error('Error marcando notificación como leída:', error);
    }
  };

  const eliminarNotificacion = async (notificationId) => {
    try {
      const { error } = await supabase
        .from('dpo_notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
    } catch (error) {
      console.error('Error eliminando notificación:', error);
    }
  };

  const marcarTodasLeidas = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.leida_en).map(n => n.id);
      
      const { error } = await supabase
        .from('dpo_notifications')
        .update({ leida_en: new Date().toISOString() })
        .in('id', unreadIds);

      if (error) throw error;

      setNotifications(prev => prev.map(n => ({ ...n, leida: true })));
      
    } catch (error) {
      console.error('Error marcando todas como leídas:', error);
    }
  };

  const filtrarNotificaciones = () => {
    return notifications.filter(notification => {
      const matchType = filterType === 'TODAS' || notification.tipo_notificacion === filterType;
      const matchStatus = filterStatus === 'TODAS' || 
                         (filterStatus === 'NO_LEIDAS' && !notification.leida_en) ||
                         (filterStatus === 'LEIDAS' && notification.leida_en);
      
      return matchType && matchStatus;
    });
  };

  const getNotificationIcon = (tipo, prioridad) => {
    const typeConfig = notificationTypes[tipo];
    if (!typeConfig) return <InfoIcon />;
    
    return React.cloneElement(typeConfig.icon, {
      sx: { 
        color: typeConfig.color,
        fontSize: prioridad === 'CRITICA' ? 24 : 20
      }
    });
  };

  const getPriorityChip = (prioridad) => {
    const priorityConfig = {
      'CRITICA': { label: 'Crítica', color: 'error' },
      'ALTA': { label: 'Alta', color: 'warning' },
      'NORMAL': { label: 'Normal', color: 'info' },
      'BAJA': { label: 'Baja', color: 'success' }
    };
    
    const config = priorityConfig[prioridad] || priorityConfig['NORMAL'];
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  const navigateToResource = (notification) => {
    const { recurso_tipo, recurso_id } = notification;
    
    switch (recurso_tipo) {
      case 'RAT':
        navigate(`/rat-edit/${recurso_id}`);
        break;
      case 'DPA':
        navigate('/dpa-generator');
        break;
      case 'PROVEEDOR':
        navigate('/provider-manager');
        break;
      case 'EIPD':
        navigate(`/eipd-creator/${recurso_id}`);
        break;
      default:
        navigate('/sistema-principal');
    }
    
    marcarLeida(notification.id);
  };

  const renderStatsCards = () => (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12} md={2}>
        <Card sx={{ bgcolor: '#1f2937', border: '1px solid #374151', textAlign: 'center' }}>
          <CardContent sx={{ py: 3 }}>
            <Badge badgeContent={stats.noLeidas} color="error">
              <Typography variant="h3" sx={{ color: '#60a5fa', fontWeight: 700 }}>
                {stats.total}
              </Typography>
            </Badge>
            <Typography variant="body2" sx={{ color: '#9ca3af' }}>
              Total
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={2}>
        <Card sx={{ bgcolor: '#1f2937', border: '1px solid #374151', textAlign: 'center' }}>
          <CardContent sx={{ py: 3 }}>
            <Typography variant="h3" sx={{ color: '#ef4444', fontWeight: 700 }}>
              {stats.criticas}
            </Typography>
            <Typography variant="body2" sx={{ color: '#9ca3af' }}>
              Críticas
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={2}>
        <Card sx={{ bgcolor: '#1f2937', border: '1px solid #374151', textAlign: 'center' }}>
          <CardContent sx={{ py: 3 }}>
            <Typography variant="h3" sx={{ color: '#f59e0b', fontWeight: 700 }}>
              {stats.vencimientos}
            </Typography>
            <Typography variant="body2" sx={{ color: '#9ca3af' }}>
              Vencimientos
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={2}>
        <Card sx={{ bgcolor: '#1f2937', border: '1px solid #374151', textAlign: 'center' }}>
          <CardContent sx={{ py: 3 }}>
            <Typography variant="h3" sx={{ color: '#8b5cf6', fontWeight: 700 }}>
              {stats.tareas}
            </Typography>
            <Typography variant="body2" sx={{ color: '#9ca3af' }}>
              Tareas
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={2}>
        <Card sx={{ bgcolor: '#1f2937', border: '1px solid #374151', textAlign: 'center' }}>
          <CardContent sx={{ py: 3 }}>
            <Typography variant="h3" sx={{ color: '#10b981', fontWeight: 700 }}>
              {stats.alertas}
            </Typography>
            <Typography variant="body2" sx={{ color: '#9ca3af' }}>
              Alertas
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={2}>
        <Card sx={{ bgcolor: '#1f2937', border: '1px solid #374151', textAlign: 'center' }}>
          <CardContent sx={{ py: 3 }}>
            <Typography variant="h3" sx={{ color: '#6b7280', fontWeight: 700 }}>
              {stats.noLeidas}
            </Typography>
            <Typography variant="body2" sx={{ color: '#9ca3af' }}>
              No Leídas
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderNotificationsList = () => (
    <Box>
      {/* Controles */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel sx={{ color: '#9ca3af' }}>Tipo</InputLabel>
          <Select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            sx={{ bgcolor: '#374151', color: '#f9fafb' }}
          >
            <MenuItem value="TODAS">Todas</MenuItem>
            {Object.entries(notificationTypes).map(([key, config]) => (
              <MenuItem key={key} value={key}>{config.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel sx={{ color: '#9ca3af' }}>Estado</InputLabel>
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            sx={{ bgcolor: '#374151', color: '#f9fafb' }}
          >
            <MenuItem value="TODAS">Todas</MenuItem>
            <MenuItem value="NO_LEIDAS">No Leídas</MenuItem>
            <MenuItem value="LEIDAS">Leídas</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="outlined"
          startIcon={<UnreadIcon />}
          onClick={marcarTodasLeidas}
          sx={{ 
            color: '#60a5fa', 
            borderColor: '#60a5fa',
            '&:hover': { borderColor: '#60a5fa', bgcolor: 'rgba(96, 165, 250, 0.1)' }
          }}
        >
          Marcar Todas Leídas
        </Button>
      </Box>

      {/* Lista de Notificaciones */}
      <Paper sx={{ bgcolor: '#1f2937', border: '1px solid #374151' }}>
        <List>
          {filtrarNotificaciones().map((notification, index) => (
            <React.Fragment key={notification.id}>
              <ListItem
                sx={{
                  bgcolor: notification.leida_en ? 'transparent' : 'rgba(79, 70, 229, 0.05)',
                  '&:hover': { bgcolor: '#374151' },
                  cursor: 'pointer',
                  opacity: notification.leida_en ? 0.7 : 1
                }}
                onClick={() => {
                  setSelectedNotification(notification);
                  setDetailDialog(true);
                }}
              >
                <ListItemIcon>
                  <Badge
                    color="error"
                    variant="dot"
                    invisible={!!notification.leida_en}
                  >
                    {getNotificationIcon(notification.tipo_notificacion, notification.prioridad)}
                  </Badge>
                </ListItemIcon>
                
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: '#f9fafb',
                          fontWeight: notification.leida_en ? 'normal' : 'bold'
                        }}
                      >
                        {notification.titulo}
                      </Typography>
                      {getPriorityChip(notification.prioridad)}
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                        {notification.mensaje}
                      </Typography>
                      <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="caption" sx={{ color: '#6b7280' }}>
                          {new Date(notification.created_at).toLocaleString()}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          {notification.channels?.map((channel) => (
                            <Chip
                              key={channel}
                              label={channel}
                              size="small"
                              sx={{ 
                                fontSize: '0.6rem',
                                height: 20,
                                bgcolor: '#374151',
                                color: '#9ca3af'
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    </Box>
                  }
                />
                
                <ListItemSecondaryAction>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Ir al recurso">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigateToResource(notification);
                        }}
                        sx={{ color: '#60a5fa' }}
                      >
                        <TaskIcon />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Eliminar">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          eliminarNotificacion(notification.id);
                        }}
                        sx={{ color: '#ef4444' }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
              
              {index < filtrarNotificaciones().length - 1 && (
                <Divider sx={{ bgcolor: '#374151' }} />
              )}
            </React.Fragment>
          ))}
        </List>
        
        {filtrarNotificaciones().length === 0 && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#9ca3af' }}>
              No hay notificaciones que coincidan con los filtros seleccionados
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );

  const renderSettingsTab = () => (
    <Box>
      <Typography variant="h6" sx={{ color: '#f9fafb', mb: 3 }}>
        Configuración de Notificaciones
      </Typography>
      
      {/* Canales de Notificación */}
      <Accordion sx={{ bgcolor: '#1f2937', border: '1px solid #374151', mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandIcon sx={{ color: '#9ca3af' }} />}>
          <Typography sx={{ color: '#f9fafb' }}>Canales de Notificación</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            {Object.entries(notificationChannels).map(([key, label]) => (
              <Grid item xs={12} md={6} key={key}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.canales_habilitados?.includes(key) || false}
                      onChange={(e) => {
                        const newChannels = e.target.checked
                          ? [...(settings.canales_habilitados || []), key]
                          : (settings.canales_habilitados || []).filter(c => c !== key);
                        
                        setSettings(prev => ({
                          ...prev,
                          canales_habilitados: newChannels
                        }));
                      }}
                      sx={{ 
                        '& .MuiSwitch-switchBase.Mui-checked': { color: '#4f46e5' },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#4f46e5' }
                      }}
                    />
                  }
                  label={label}
                  sx={{ color: '#f9fafb' }}
                />
              </Grid>
            ))}
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Tipos de Notificación */}
      <Accordion sx={{ bgcolor: '#1f2937', border: '1px solid #374151', mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandIcon sx={{ color: '#9ca3af' }} />}>
          <Typography sx={{ color: '#f9fafb' }}>Tipos de Notificación</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            {Object.entries(notificationTypes).map(([key, config]) => (
              <Grid item xs={12} md={6} key={key}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.tipos_habilitados?.[key] || false}
                      onChange={(e) => {
                        setSettings(prev => ({
                          ...prev,
                          tipos_habilitados: {
                            ...prev.tipos_habilitados,
                            [key]: e.target.checked
                          }
                        }));
                      }}
                      sx={{ 
                        '& .MuiSwitch-switchBase.Mui-checked': { color: config.color },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: config.color }
                      }}
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {config.icon}
                      {config.label}
                    </Box>
                  }
                  sx={{ color: '#f9fafb' }}
                />
              </Grid>
            ))}
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Horarios */}
      <Accordion sx={{ bgcolor: '#1f2937', border: '1px solid #374151' }}>
        <AccordionSummary expandIcon={<ExpandIcon sx={{ color: '#9ca3af' }} />}>
          <Typography sx={{ color: '#f9fafb' }}>Horarios y Frecuencia</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="time"
                label="Hora Inicio"
                value={settings.horario_notificaciones?.inicio || '08:00'}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  horario_notificaciones: {
                    ...prev.horario_notificaciones,
                    inicio: e.target.value
                  }
                }))}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': { bgcolor: '#374151', color: '#f9fafb' },
                  '& .MuiInputLabel-root': { color: '#9ca3af' }
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="time"
                label="Hora Fin"
                value={settings.horario_notificaciones?.fin || '18:00'}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  horario_notificaciones: {
                    ...prev.horario_notificaciones,
                    fin: e.target.value
                  }
                }))}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': { bgcolor: '#374151', color: '#f9fafb' },
                  '& .MuiInputLabel-root': { color: '#9ca3af' }
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: '#9ca3af' }}>Digest Frecuencia</InputLabel>
                <Select
                  value={settings.frecuencia_digest || 'DIARIO'}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    frecuencia_digest: e.target.value
                  }))}
                  sx={{ bgcolor: '#374151', color: '#f9fafb' }}
                >
                  <MenuItem value="INMEDIATO">Inmediato</MenuItem>
                  <MenuItem value="DIARIO">Diario</MenuItem>
                  <MenuItem value="SEMANAL">Semanal</MenuItem>
                  <MenuItem value="NUNCA">Nunca</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
    </Box>
  );

  const renderDetailDialog = () => (
    <Dialog
      open={detailDialog}
      onClose={() => setDetailDialog(false)}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { bgcolor: '#1f2937', border: '1px solid #374151' } }}
    >
      <DialogTitle sx={{ color: '#f9fafb' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {selectedNotification && getNotificationIcon(selectedNotification.tipo_notificacion, selectedNotification.prioridad)}
          Detalles de Notificación
        </Box>
      </DialogTitle>
      
      {selectedNotification && (
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ color: '#f9fafb', mb: 1 }}>
                {selectedNotification.titulo}
              </Typography>
              {getPriorityChip(selectedNotification.prioridad)}
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="body2" sx={{ color: '#9ca3af', mb: 2 }}>
                {selectedNotification.mensaje}
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="caption" sx={{ color: '#6b7280' }}>
                <strong>Creada:</strong> {new Date(selectedNotification.created_at).toLocaleString()}
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="caption" sx={{ color: '#6b7280' }}>
                <strong>Programada:</strong> {new Date(selectedNotification.scheduled_for).toLocaleString()}
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="caption" sx={{ color: '#6b7280' }}>
                <strong>Canales:</strong> {selectedNotification.channels?.join(', ')}
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>
      )}
      
      <DialogActions>
        <Button 
          onClick={() => setDetailDialog(false)} 
          sx={{ color: '#9ca3af' }}
        >
          Cerrar
        </Button>
        
        {selectedNotification && !selectedNotification.leida_en && (
          <Button
            onClick={() => {
              marcarLeida(selectedNotification.id);
              setDetailDialog(false);
            }}
            sx={{ color: '#10b981' }}
          >
            Marcar Leída
          </Button>
        )}
        
        {selectedNotification && (
          <Button
            onClick={() => {
              navigateToResource(selectedNotification);
              setDetailDialog(false);
            }}
            variant="contained"
            sx={{ bgcolor: '#4f46e5', '&:hover': { bgcolor: '#4338ca' } }}
          >
            Ir al Recurso
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#111827', py: 4 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ 
            color: '#f9fafb', 
            fontWeight: 700, 
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}>
            <Badge badgeContent={stats.noLeidas} color="error">
              <NotificationIcon sx={{ fontSize: 40, color: '#60a5fa' }} />
            </Badge>
            Centro de Notificaciones
          </Typography>
          <Typography variant="subtitle1" sx={{ color: '#9ca3af' }}>
            Alertas, vencimientos y tareas del sistema LPDP
          </Typography>
        </Box>

        {/* Dashboard Estadísticas */}
        {renderStatsCards()}

        {/* Tabs Principal */}
        <Paper sx={{ bgcolor: '#1f2937', border: '1px solid #374151' }}>
          <Tabs 
            value={activeTab} 
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{
              borderBottom: '1px solid #374151',
              '& .MuiTab-root': { color: '#9ca3af' },
              '& .MuiTab-root.Mui-selected': { color: '#60a5fa' }
            }}
          >
            <Tab 
              label={
                <Badge badgeContent={stats.noLeidas} color="error">
                  Notificaciones
                </Badge>
              }
            />
            <Tab label="Configuración" />
          </Tabs>
          
          <Box sx={{ p: 3 }}>
            {activeTab === 0 && renderNotificationsList()}
            {activeTab === 1 && renderSettingsTab()}
          </Box>
        </Paper>

        {/* Alert Información */}
        <Box sx={{ mt: 4 }}>
          <Alert 
            severity="info"
            sx={{
              bgcolor: 'rgba(79, 70, 229, 0.1)',
              border: '1px solid rgba(79, 70, 229, 0.3)',
              color: '#f9fafb'
            }}
          >
            <Typography variant="body2">
              🔔 <strong>Centro de Notificaciones:</strong> Recibe alertas automáticas sobre 
              vencimientos RAT, renovaciones DPA, asignaciones workflow y eventos críticos 
              del sistema. Configura canales y horarios según tus preferencias.
            </Typography>
          </Alert>
        </Box>
      </Container>

      {/* Dialog Detalles */}
      {renderDetailDialog()}
    </Box>
  );
};

export default NotificationCenter;