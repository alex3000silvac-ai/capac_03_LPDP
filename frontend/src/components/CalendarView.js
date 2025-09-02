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
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Badge,
  Avatar,
  Divider
} from '@mui/material';
import {
  Event as CalendarIcon,
  Today as TodayIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  Assignment as RATIcon,
  Gavel as DPAIcon,
  Shield as EIPDIcon,
  Security as AuditIcon,
  Notifications as ReminderIcon,
  ChevronLeft as PrevIcon,
  ChevronRight as NextIcon,
  Add as AddIcon,
  FilterList as FilterIcon,
  ViewModule as MonthIcon,
  ViewWeek as WeekIcon,
  ViewDay as DayIcon,
  Business as ProviderIcon,
  Group as TeamIcon,
  Assessment as TaskIcon
} from '@mui/icons-material';
import { ratService } from '../services/ratService';
import { supabase } from '../config/supabaseClient';
import { useTenant } from '../contexts/TenantContext';

const CalendarView = () => {
  const navigate = useNavigate();
  const { currentTenant } = useTenant();
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // month, week, day
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventDialog, setEventDialog] = useState(false);
  const [filterType, setFilterType] = useState('TODOS');
  const [filterPriority, setFilterPriority] = useState('TODAS');
  
  const [stats, setStats] = useState({
    proximosVencimientos: 0,
    eventosHoy: 0,
    eventosSemana: 0,
    críticos: 0,
    tareasPendientes: 0
  });

  // Tipos de eventos del calendario
  const eventTypes = {
    'RAT_VENCIMIENTO': {
      label: 'Vencimiento RAT',
      icon: <RATIcon />,
      color: '#f59e0b',
      backgroundColor: 'rgba(245, 158, 11, 0.1)'
    },
    'DPA_RENOVACION': {
      label: 'Renovación DPA',
      icon: <DPAIcon />,
      color: '#ef4444',
      backgroundColor: 'rgba(239, 68, 68, 0.1)'
    },
    'EIPD_DEADLINE': {
      label: 'Deadline EIPD',
      icon: <EIPDIcon />,
      color: '#8b5cf6',
      backgroundColor: 'rgba(139, 92, 246, 0.1)'
    },
    'AUDITORIA_PROGRAMADA': {
      label: 'Auditoría Programada',
      icon: <AuditIcon />,
      color: '#6b7280',
      backgroundColor: 'rgba(107, 114, 128, 0.1)'
    },
    'REVISION_PERIODICA': {
      label: 'Revisión Periódica',
      icon: <ScheduleIcon />,
      color: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)'
    },
    'CAPACITACION': {
      label: 'Capacitación Programada',
      icon: <TeamIcon />,
      color: '#60a5fa',
      backgroundColor: 'rgba(96, 165, 250, 0.1)'
    },
    'TAREA_COMPLIANCE': {
      label: 'Tarea Compliance',
      icon: <TaskIcon />,
      color: '#a78bfa',
      backgroundColor: 'rgba(167, 139, 250, 0.1)'
    }
  };

  const priorities = {
    'CRITICA': { label: 'Crítica', color: 'error' },
    'ALTA': { label: 'Alta', color: 'warning' },
    'NORMAL': { label: 'Normal', color: 'info' },
    'BAJA': { label: 'Baja', color: 'success' }
  };

  useEffect(() => {
    cargarEventos();
  }, [currentDate, viewMode]);

  const cargarEventos = async () => {
    try {
      setLoading(true);
      const tenantId = currentTenant?.id;
      
      // Calcular rango de fechas según vista
      const startDate = getViewStartDate();
      const endDate = getViewEndDate();
      
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('tenant_id', tenantId)
        .gte('fecha_evento', startDate.toISOString())
        .lte('fecha_evento', endDate.toISOString())
        .order('fecha_evento', { ascending: true });

      if (error) throw error;

      const eventsData = data || [];
      
      setEvents(eventsData);
      calcularEstadisticas(eventsData);
      
    } catch (error) {
      console.error('Error cargando eventos:', error);
    } finally {
      setLoading(false);
    }
  };


  const getViewStartDate = () => {
    switch (viewMode) {
      case 'month':
        return new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      case 'week':
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
        return startOfWeek;
      case 'day':
        return new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
      default:
        return new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    }
  };

  const getViewEndDate = () => {
    switch (viewMode) {
      case 'month':
        return new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      case 'week':
        const endOfWeek = new Date(currentDate);
        endOfWeek.setDate(currentDate.getDate() + (6 - currentDate.getDay()));
        return endOfWeek;
      case 'day':
        return new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1);
      default:
        return new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    }
  };

  const calcularEstadisticas = (eventsData) => {
    const hoy = new Date();
    const inicioSemana = new Date(hoy);
    inicioSemana.setDate(hoy.getDate() - hoy.getDay());
    const finSemana = new Date(inicioSemana);
    finSemana.setDate(inicioSemana.getDate() + 6);

    const stats = {
      proximosVencimientos: eventsData.filter(e => {
        const fechaEvento = new Date(e.fecha_evento);
        const diasRestantes = Math.floor((fechaEvento - hoy) / (1000 * 60 * 60 * 24));
        return diasRestantes <= 30 && diasRestantes >= 0;
      }).length,
      eventosHoy: eventsData.filter(e => {
        const fechaEvento = new Date(e.fecha_evento);
        return fechaEvento.toDateString() === hoy.toDateString();
      }).length,
      eventosSemana: eventsData.filter(e => {
        const fechaEvento = new Date(e.fecha_evento);
        return fechaEvento >= inicioSemana && fechaEvento <= finSemana;
      }).length,
      críticos: eventsData.filter(e => e.prioridad === 'CRITICA').length,
      tareasPendientes: eventsData.filter(e => e.estado === 'PENDIENTE').length
    };
    setStats(stats);
  };

  const navegarMes = (direccion) => {
    const nuevaFecha = new Date(currentDate);
    if (direccion === 'prev') {
      nuevaFecha.setMonth(currentDate.getMonth() - 1);
    } else {
      nuevaFecha.setMonth(currentDate.getMonth() + 1);
    }
    setCurrentDate(nuevaFecha);
  };

  const filtrarEventos = () => {
    return events.filter(event => {
      const matchType = filterType === 'TODOS' || event.tipo === filterType;
      const matchPriority = filterPriority === 'TODAS' || event.prioridad === filterPriority;
      
      return matchType && matchPriority;
    });
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Días del mes anterior para completar la primera semana
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({
        date: prevDate,
        isCurrentMonth: false,
        events: []
      });
    }

    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayEvents = filtrarEventos().filter(event => {
        const eventDate = new Date(event.fecha_evento);
        return eventDate.toDateString() === date.toDateString();
      });

      days.push({
        date,
        isCurrentMonth: true,
        events: dayEvents
      });
    }

    // Días del mes siguiente para completar la última semana
    const remainingDays = 42 - days.length; // 6 semanas × 7 días
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day);
      days.push({
        date: nextDate,
        isCurrentMonth: false,
        events: []
      });
    }

    return days;
  };

  const renderCalendarHeader = () => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton
          onClick={() => navegarMes('prev')}
          sx={{ color: '#9ca3af' }}
        >
          <PrevIcon />
        </IconButton>
        
        <Typography variant="h5" sx={{ color: '#f9fafb', fontWeight: 600 }}>
          {currentDate.toLocaleDateString('es-ES', { 
            month: 'long', 
            year: 'numeric' 
          }).replace(/^\w/, c => c.toUpperCase())}
        </Typography>
        
        <IconButton
          onClick={() => navegarMes('next')}
          sx={{ color: '#9ca3af' }}
        >
          <NextIcon />
        </IconButton>
      </Box>

      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          variant={viewMode === 'month' ? 'contained' : 'outlined'}
          size="small"
          startIcon={<MonthIcon />}
          onClick={() => setViewMode('month')}
          sx={{ 
            bgcolor: viewMode === 'month' ? '#4f46e5' : 'transparent',
            color: viewMode === 'month' ? '#fff' : '#9ca3af'
          }}
        >
          Mes
        </Button>
        
        <Button
          variant="outlined"
          size="small"
          startIcon={<TodayIcon />}
          onClick={() => setCurrentDate(new Date())}
          sx={{ color: '#60a5fa', borderColor: '#60a5fa' }}
        >
          Hoy
        </Button>
      </Box>
    </Box>
  );

  const renderStatsCards = () => (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12} md={2.4}>
        <Card sx={{ bgcolor: '#1f2937', border: '1px solid #374151', textAlign: 'center' }}>
          <CardContent sx={{ py: 3 }}>
            <Badge badgeContent={stats.proximosVencimientos} color="warning">
              <Typography variant="h3" sx={{ color: '#f59e0b', fontWeight: 700 }}>
                {stats.proximosVencimientos}
              </Typography>
            </Badge>
            <Typography variant="body2" sx={{ color: '#9ca3af' }}>
              Próx. 30 días
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={2.4}>
        <Card sx={{ bgcolor: '#1f2937', border: '1px solid #374151', textAlign: 'center' }}>
          <CardContent sx={{ py: 3 }}>
            <Typography variant="h3" sx={{ color: '#60a5fa', fontWeight: 700 }}>
              {stats.eventosHoy}
            </Typography>
            <Typography variant="body2" sx={{ color: '#9ca3af' }}>
              Hoy
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={2.4}>
        <Card sx={{ bgcolor: '#1f2937', border: '1px solid #374151', textAlign: 'center' }}>
          <CardContent sx={{ py: 3 }}>
            <Typography variant="h3" sx={{ color: '#10b981', fontWeight: 700 }}>
              {stats.eventosSemana}
            </Typography>
            <Typography variant="body2" sx={{ color: '#9ca3af' }}>
              Esta Semana
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={2.4}>
        <Card sx={{ bgcolor: '#1f2937', border: '1px solid #374151', textAlign: 'center' }}>
          <CardContent sx={{ py: 3 }}>
            <Typography variant="h3" sx={{ color: '#ef4444', fontWeight: 700 }}>
              {stats.críticos}
            </Typography>
            <Typography variant="body2" sx={{ color: '#9ca3af' }}>
              Críticos
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={2.4}>
        <Card sx={{ bgcolor: '#1f2937', border: '1px solid #374151', textAlign: 'center' }}>
          <CardContent sx={{ py: 3 }}>
            <Typography variant="h3" sx={{ color: '#8b5cf6', fontWeight: 700 }}>
              {stats.tareasPendientes}
            </Typography>
            <Typography variant="body2" sx={{ color: '#9ca3af' }}>
              Pendientes
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderCalendarGrid = () => {
    const days = getDaysInMonth();
    const today = new Date();
    const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    return (
      <Paper sx={{ bgcolor: '#1f2937', border: '1px solid #374151', p: 2 }}>
        {/* Header días de la semana */}
        <Grid container>
          {weekDays.map((day) => (
            <Grid item xs={12/7} key={day}>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  color: '#9ca3af', 
                  textAlign: 'center', 
                  py: 2,
                  fontWeight: 600
                }}
              >
                {day}
              </Typography>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ bgcolor: '#374151', mb: 1 }} />

        {/* Grid calendario */}
        <Grid container>
          {days.map((dayData, index) => {
            const isToday = dayData.date.toDateString() === today.toDateString();
            const hasEvents = dayData.events.length > 0;
            
            return (
              <Grid item xs={12/7} key={index}>
                <Box
                  sx={{
                    minHeight: 120,
                    border: '1px solid #374151',
                    p: 1,
                    bgcolor: dayData.isCurrentMonth ? 'transparent' : 'rgba(107, 114, 128, 0.1)',
                    position: 'relative',
                    '&:hover': {
                      bgcolor: '#374151'
                    }
                  }}
                >
                  {/* Número del día */}
                  <Typography
                    variant="body2"
                    sx={{
                      color: isToday ? '#4f46e5' : 
                             dayData.isCurrentMonth ? '#f9fafb' : '#6b7280',
                      fontWeight: isToday ? 'bold' : 'normal',
                      backgroundColor: isToday ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
                      borderRadius: isToday ? '50%' : '0',
                      width: isToday ? 24 : 'auto',
                      height: isToday ? 24 : 'auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 1
                    }}
                  >
                    {dayData.date.getDate()}
                  </Typography>

                  {/* Eventos del día */}
                  {dayData.events.slice(0, 3).map((event) => {
                    const eventConfig = eventTypes[event.tipo];
                    
                    return (
                      <Tooltip
                        key={event.id}
                        title={`${event.titulo} - ${event.usuario_responsable}`}
                      >
                        <Box
                          sx={{
                            bgcolor: eventConfig.backgroundColor,
                            border: `1px solid ${eventConfig.color}`,
                            borderRadius: 1,
                            p: 0.5,
                            mb: 0.5,
                            cursor: 'pointer',
                            '&:hover': {
                              bgcolor: eventConfig.color,
                              '& .event-text': { color: '#fff' }
                            }
                          }}
                          onClick={() => {
                            setSelectedEvent(event);
                            setEventDialog(true);
                          }}
                        >
                          <Typography
                            className="event-text"
                            variant="caption"
                            sx={{
                              color: eventConfig.color,
                              fontSize: '0.7rem',
                              fontWeight: 500,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              display: 'block'
                            }}
                          >
                            {event.titulo}
                          </Typography>
                        </Box>
                      </Tooltip>
                    );
                  })}

                  {/* Indicador eventos adicionales */}
                  {dayData.events.length > 3 && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: '#9ca3af',
                        fontSize: '0.6rem',
                        position: 'absolute',
                        bottom: 4,
                        right: 4
                      }}
                    >
                      +{dayData.events.length - 3}
                    </Typography>
                  )}
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Paper>
    );
  };

  const renderUpcomingEvents = () => (
    <Paper sx={{ bgcolor: '#1f2937', border: '1px solid #374151', p: 3, mt: 4 }}>
      <Typography variant="h6" sx={{ color: '#f9fafb', mb: 3 }}>
        🚨 Próximos Eventos Críticos
      </Typography>
      
      <List>
        {filtrarEventos()
          .filter(event => {
            const eventDate = new Date(event.fecha_evento);
            const today = new Date();
            const daysUntil = Math.floor((eventDate - today) / (1000 * 60 * 60 * 24));
            return daysUntil <= 15 && daysUntil >= 0;
          })
          .slice(0, 5)
          .map((event) => {
            const eventConfig = eventTypes[event.tipo];
            const eventDate = new Date(event.fecha_evento);
            
            return (
              <ListItem 
                key={event.id}
                sx={{ 
                  bgcolor: '#374151', 
                  mb: 1, 
                  borderRadius: 1,
                  cursor: 'pointer',
                  '&:hover': { bgcolor: '#4b5563' }
                }}
                onClick={() => {
                  setSelectedEvent(event);
                  setEventDialog(true);
                }}
              >
                <ListItemIcon>
                  <Avatar sx={{ bgcolor: eventConfig.color, width: 32, height: 32 }}>
                    {eventConfig.icon}
                  </Avatar>
                </ListItemIcon>
                
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="body2" sx={{ color: '#f9fafb' }}>
                        {event.titulo}
                      </Typography>
                      <Chip 
                        label={event.prioridad}
                        color={priorities[event.prioridad]?.color}
                        size="small"
                      />
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                        {event.descripcion}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#6b7280' }}>
                        📅 {eventDate.toLocaleDateString()} | 
                        👤 {event.usuario_responsable} | 
                        📊 {event.estado}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            );
          })}
      </List>
      
      {filtrarEventos().length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body2" sx={{ color: '#9ca3af' }}>
            No hay eventos próximos que coincidan con los filtros
          </Typography>
        </Box>
      )}
    </Paper>
  );

  const renderEventDialog = () => (
    <Dialog
      open={eventDialog}
      onClose={() => setEventDialog(false)}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { bgcolor: '#1f2937', border: '1px solid #374151' } }}
    >
      <DialogTitle sx={{ color: '#f9fafb' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {selectedEvent && eventTypes[selectedEvent.tipo]?.icon}
          Detalles del Evento
        </Box>
      </DialogTitle>
      
      {selectedEvent && (
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ color: '#f9fafb', mb: 1 }}>
                {selectedEvent.titulo}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Chip 
                  label={eventTypes[selectedEvent.tipo]?.label}
                  color="info"
                  size="small"
                />
                <Chip 
                  label={selectedEvent.prioridad}
                  color={priorities[selectedEvent.prioridad]?.color}
                  size="small"
                />
                <Chip 
                  label={selectedEvent.estado}
                  color={selectedEvent.estado === 'PENDIENTE' ? 'warning' : 'success'}
                  size="small"
                />
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="body2" sx={{ color: '#9ca3af', mb: 2 }}>
                {selectedEvent.descripcion}
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                <strong>📅 Fecha:</strong> {new Date(selectedEvent.fecha_evento).toLocaleDateString()}
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                <strong>👤 Responsable:</strong> {selectedEvent.usuario_responsable}
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                <strong>🔗 Recurso:</strong> {selectedEvent.recurso_tipo} #{selectedEvent.recurso_id}
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>
      )}
      
      <DialogActions>
        <Button onClick={() => setEventDialog(false)} sx={{ color: '#9ca3af' }}>
          Cerrar
        </Button>
        
        {selectedEvent && (
          <Button
            onClick={() => {
              // Navegar al recurso correspondiente
              const { recurso_tipo, recurso_id } = selectedEvent;
              
              switch (recurso_tipo) {
                case 'RAT':
                  navigate(`/rat-edit/${recurso_id}`);
                  break;
                case 'DPA':
                  navigate('/dpa-generator');
                  break;
                case 'EIPD':
                  navigate(`/eipd-creator/${recurso_id}`);
                  break;
                default:
                  navigate('/sistema-principal');
              }
              
              setEventDialog(false);
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
            <CalendarIcon sx={{ fontSize: 40, color: '#10b981' }} />
            Calendario de Compliance
          </Typography>
          <Typography variant="subtitle1" sx={{ color: '#9ca3af' }}>
            Vencimientos, deadlines y eventos críticos del sistema LPDP
          </Typography>
        </Box>

        {/* Dashboard Estadísticas */}
        {renderStatsCards()}

        {/* Controles */}
        <Paper sx={{ bgcolor: '#1f2937', border: '1px solid #374151', p: 3, mb: 4 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel sx={{ color: '#9ca3af' }}>Tipo de Evento</InputLabel>
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                sx={{ bgcolor: '#374151', color: '#f9fafb' }}
              >
                <MenuItem value="TODOS">Todos los Eventos</MenuItem>
                {Object.entries(eventTypes).map(([key, config]) => (
                  <MenuItem key={key} value={key}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {config.icon}
                      {config.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel sx={{ color: '#9ca3af' }}>Prioridad</InputLabel>
              <Select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                sx={{ bgcolor: '#374151', color: '#f9fafb' }}
              >
                <MenuItem value="TODAS">Todas</MenuItem>
                {Object.entries(priorities).map(([key, config]) => (
                  <MenuItem key={key} value={key}>{config.label}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => alert('Crear nuevo evento...')}
              sx={{ 
                color: '#10b981', 
                borderColor: '#10b981',
                '&:hover': { borderColor: '#10b981', bgcolor: 'rgba(16, 185, 129, 0.1)' }
              }}
            >
              Nuevo Evento
            </Button>
          </Box>
        </Paper>

        {/* Navegación Calendario */}
        {renderCalendarHeader()}

        {/* Grid Calendario */}
        {renderCalendarGrid()}

        {/* Próximos Eventos */}
        {renderUpcomingEvents()}

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
              📅 <strong>Calendario Compliance:</strong> Visualización centralizada de todos los 
              vencimientos, deadlines y eventos críticos. Integra RATs, DPAs, EIPDs y auditorías 
              para gestión proactiva de compliance.
            </Typography>
          </Alert>
        </Box>
      </Container>

      {/* Dialog Detalles Evento */}
      {renderEventDialog()}
    </Box>
  );
};

export default CalendarView;