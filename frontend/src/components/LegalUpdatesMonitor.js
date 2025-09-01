import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Alert,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Badge,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { Timeline, TimelineItem, TimelineSeparator, TimelineConnector, TimelineContent, TimelineDot } from '@mui/lab';
import {
  Gavel as GavelIcon,
  Notifications as NotificationIcon,
  NewReleases as NewsIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  OpenInNew as OpenIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Refresh as RefreshIcon,
  Email as EmailIcon,
  Article as ArticleIcon,
  Policy as PolicyIcon,
  ExpandMore as ExpandMoreIcon,
  Close as CloseIcon,
  Info as InfoIcon
} from '@mui/icons-material';

const LegalUpdatesMonitor = () => {
  const [updates, setUpdates] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedUpdate, setSelectedUpdate] = useState(null);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastSync, setLastSync] = useState(null);

  useEffect(() => {
    loadLegalUpdates();
    loadNotifications();
  }, []);

  const loadLegalUpdates = async () => {
    try {
      setLoading(true);
      
      // Mock data - en prod conectaría con APIs oficiales
      const mockUpdates = [
        {
          id: 1,
          titulo: 'Modificación Reglamento Ley 21.719 - Artículo 15',
          fuente: 'Diario Oficial',
          url_oficial: 'https://www.diariooficial.interior.gob.cl',
          fecha_publicacion: '2024-01-10T10:00:00Z',
          fecha_vigencia: '2024-03-10T00:00:00Z',
          tipo: 'REGLAMENTO',
          prioridad: 'ALTA',
          impacto_estimado: 'ALTO',
          categoria: 'DERECHOS_TITULAR',
          resumen: 'Nueva regulación sobre plazos de respuesta para derechos del titular de datos.',
          cambios_principales: [
            'Reducción de plazo respuesta de 30 a 20 días hábiles',
            'Nuevos requisitos documentación solicitudes',
            'Procedimiento simplificado para rectificación datos'
          ],
          areas_afectadas: ['rats', 'derechos_titular', 'procedimientos'],
          acciones_requeridas: [
            'Actualizar formularios web derechos titular',
            'Revisar procedimientos internos respuesta',
            'Capacitar personal sobre nuevos plazos'
          ],
          estado_implementacion: 'PENDIENTE',
          asignado_a: 'dpo@empresa.cl',
          fecha_limite_implementacion: '2024-03-09T23:59:59Z',
          relevancia_empresa: 95,
          bookmark: false
        },
        {
          id: 2,
          titulo: 'Circular APDP N° 003-2024: Transferencias Internacionales',
          fuente: 'APDP',
          url_oficial: 'https://www.agenciaprotecciondatos.cl',
          fecha_publicacion: '2024-01-08T15:30:00Z',
          fecha_vigencia: '2024-01-08T15:30:00Z',
          tipo: 'CIRCULAR',
          prioridad: 'MEDIA',
          impacto_estimado: 'MEDIO',
          categoria: 'TRANSFERENCIAS_INTERNACIONALES',
          resumen: 'Aclaraciones sobre garantías adecuadas para transferencias internacionales de datos.',
          cambios_principales: [
            'Lista actualizada países con nivel adecuado protección',
            'Nuevos modelos cláusulas contractuales tipo',
            'Criterios evaluación garantías apropiadas'
          ],
          areas_afectadas: ['providers', 'eipds', 'contratos_dpa'],
          acciones_requeridas: [
            'Revisar contratos proveedores internacionales',
            'Actualizar evaluaciones impacto transferencias',
            'Implementar nuevas cláusulas contractuales'
          ],
          estado_implementacion: 'EN_PROGRESO',
          asignado_a: 'legal@empresa.cl',
          fecha_limite_implementacion: '2024-02-08T23:59:59Z',
          relevancia_empresa: 80,
          bookmark: true
        },
        {
          id: 3,
          titulo: 'Decreto Supremo N° 567: Multas y Sanciones Actualizadas',
          fuente: 'Ministerio Secretaría General Presidencia',
          url_oficial: 'https://www.bcn.cl',
          fecha_publicacion: '2024-01-05T12:00:00Z',
          fecha_vigencia: '2024-04-05T00:00:00Z',
          tipo: 'DECRETO',
          prioridad: 'CRITICA',
          impacto_estimado: 'ALTO',
          categoria: 'SANCIONES',
          resumen: 'Actualización del régimen sancionatorio con nuevos montos de multas.',
          cambios_principales: [
            'Incremento multas hasta 15,000 UTA para infracciones graves',
            'Nuevas categorías infracciones específicas',
            'Criterios agravantes y atenuantes actualizados'
          ],
          areas_afectadas: ['compliance', 'auditoria', 'riesgos'],
          acciones_requeridas: [
            'Actualizar matriz riesgos y sanciones',
            'Revisar procedimientos internos compliance',
            'Reforzar controles preventivos críticos'
          ],
          estado_implementacion: 'PENDIENTE',
          asignado_a: 'compliance@empresa.cl',
          fecha_limite_implementacion: '2024-04-04T23:59:59Z',
          relevancia_empresa: 98,
          bookmark: false
        }
      ];
      
      setUpdates(mockUpdates);
      setLastSync(new Date());
      
    } catch (error) {
      console.error('Error cargando actualizaciones legales:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNotifications = async () => {
    try {
      // Mock notifications
      const mockNotifications = [
        {
          id: 1,
          tipo: 'NUEVA_REGULACION',
          titulo: 'Nueva modificación Ley 21.719 publicada',
          mensaje: 'Se ha publicado modificación que afecta derechos del titular',
          prioridad: 'ALTA',
          leida: false,
          fecha: '2024-01-10T10:00:00Z'
        },
        {
          id: 2,
          tipo: 'PLAZO_VENCIMIENTO',
          titulo: 'Plazo implementación próximo a vencer',
          mensaje: 'Decreto N° 567 debe implementarse antes del 5 de abril',
          prioridad: 'CRITICA',
          leida: false,
          fecha: '2024-01-09T09:00:00Z'
        }
      ];
      
      setNotifications(mockNotifications);
      
    } catch (error) {
      console.error('Error cargando notificaciones:', error);
    }
  };

  const getPrioridadColor = (prioridad) => {
    const colors = {
      'BAJA': '#2e7d32',
      'MEDIA': '#f57f17',
      'ALTA': '#f57c00',
      'CRITICA': '#d32f2f'
    };
    return colors[prioridad] || '#666';
  };

  const getImpactoColor = (impacto) => {
    const colors = {
      'BAJO': '#2e7d32',
      'MEDIO': '#f57f17',
      'ALTO': '#d32f2f'
    };
    return colors[impacto] || '#666';
  };

  const getEstadoColor = (estado) => {
    const colors = {
      'PENDIENTE': '#f57f17',
      'EN_PROGRESO': '#1976d2',
      'COMPLETADO': '#2e7d32',
      'VENCIDO': '#d32f2f'
    };
    return colors[estado] || '#666';
  };

  const getTipoIcon = (tipo) => {
    const icons = {
      'LEY': <GavelIcon />,
      'REGLAMENTO': <PolicyIcon />,
      'CIRCULAR': <ArticleIcon />,
      'DECRETO': <ArticleIcon />,
      'RESOLUCION': <PolicyIcon />
    };
    return icons[tipo] || <InfoIcon />;
  };

  const handleViewDetails = (update) => {
    setSelectedUpdate(update);
    setDetailsDialog(true);
  };

  const toggleBookmark = async (updateId) => {
    try {
      setUpdates(prev => prev.map(update => 
        update.id === updateId 
          ? { ...update, bookmark: !update.bookmark }
          : update
      ));
      
      // En prod: actualizar bookmark en backend
      console.log('Toggle bookmark:', updateId);
      
    } catch (error) {
      console.error('Error toggle bookmark:', error);
    }
  };

  const markAsImplemented = async (updateId) => {
    try {
      setUpdates(prev => prev.map(update => 
        update.id === updateId 
          ? { ...update, estado_implementacion: 'COMPLETADO' }
          : update
      ));
      
      // En prod: actualizar estado en backend
      console.log('Marcar como implementado:', updateId);
      
    } catch (error) {
      console.error('Error marcando como implementado:', error);
    }
  };

  const refreshUpdates = async () => {
    await loadLegalUpdates();
    await loadNotifications();
  };

  const getDiasHastaVigencia = (fechaVigencia) => {
    const dias = Math.ceil((new Date(fechaVigencia) - new Date()) / (1000 * 60 * 60 * 24));
    return dias;
  };

  const unreadNotifications = notifications.filter(n => !n.leida).length;

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box display="flex" alignItems="center" gap={2}>
          <GavelIcon sx={{ color: '#4fc3f7', fontSize: 32 }} />
          <Box>
            <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700 }}>
              Monitor Actualizaciones Legales
            </Typography>
            <Typography variant="body1" sx={{ color: '#bbb' }}>
              Seguimiento normativa chilena protección datos
            </Typography>
          </Box>
        </Box>
        
        <Box display="flex" alignItems="center" gap={2}>
          <Badge badgeContent={unreadNotifications} color="error">
            <NotificationIcon sx={{ color: '#4fc3f7', fontSize: 28 }} />
          </Badge>
          
          <Tooltip title="Actualizar">
            <IconButton 
              onClick={refreshUpdates} 
              disabled={loading}
              sx={{ color: '#4fc3f7' }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Estadísticas rápidas */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: '#1a1a1a', border: '1px solid #333' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <NewsIcon sx={{ color: '#4fc3f7', fontSize: 24 }} />
                <Box>
                  <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700 }}>
                    {updates.length}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#bbb' }}>
                    Actualizaciones Totales
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: '#1a1a1a', border: '1px solid #333' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <WarningIcon sx={{ color: '#f57f17', fontSize: 24 }} />
                <Box>
                  <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700 }}>
                    {updates.filter(u => u.estado_implementacion === 'PENDIENTE').length}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#bbb' }}>
                    Pendientes Implementar
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: '#1a1a1a', border: '1px solid #333' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <CheckIcon sx={{ color: '#2e7d32', fontSize: 24 }} />
                <Box>
                  <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700 }}>
                    {updates.filter(u => u.estado_implementacion === 'COMPLETADO').length}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#bbb' }}>
                    Implementadas
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: '#1a1a1a', border: '1px solid #333' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <ScheduleIcon sx={{ color: '#1976d2', fontSize: 24 }} />
                <Box>
                  <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700 }}>
                    {updates.filter(u => getDiasHastaVigencia(u.fecha_vigencia) < 30).length}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#bbb' }}>
                    Próximas a Vencer
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Última sincronización */}
      <Alert 
        severity="info" 
        sx={{ 
          bgcolor: '#0d47a1', 
          color: '#fff', 
          mb: 3,
          '& .MuiAlert-icon': { color: '#4fc3f7' }
        }}
      >
        🔄 <strong>Última sincronización:</strong> {lastSync ? lastSync.toLocaleString('es-CL') : 'Nunca'}
        - Monitoreando: Diario Oficial, APDP, BCN, LeyChile
      </Alert>

      <Grid container spacing={3}>
        {/* Actualizaciones legales */}
        <Grid item xs={12} lg={8}>
          <Paper elevation={3} sx={{ bgcolor: '#1a1a1a', border: '1px solid #333', p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
                📜 Actualizaciones Normativas
              </Typography>
              
              <Button
                variant="outlined"
                size="small"
                onClick={refreshUpdates}
                disabled={loading}
                sx={{
                  borderColor: '#4fc3f7',
                  color: '#4fc3f7',
                  '&:hover': { borderColor: '#29b6f6', bgcolor: '#333' }
                }}
                startIcon={<RefreshIcon />}
              >
                Sincronizar
              </Button>
            </Box>
            
            {loading ? (
              <Box>
                <LinearProgress sx={{ mb: 2 }} />
                <Typography sx={{ color: '#ccc' }}>Sincronizando con fuentes oficiales...</Typography>
              </Box>
            ) : updates.length === 0 ? (
              <Alert severity="info" sx={{ bgcolor: '#0d47a1', color: '#fff' }}>
                📄 No hay actualizaciones legales disponibles
              </Alert>
            ) : (
              <Box>
                {updates.map((update) => {
                  const diasVigencia = getDiasHastaVigencia(update.fecha_vigencia);
                  
                  return (
                    <Card 
                      key={update.id} 
                      sx={{ 
                        bgcolor: '#2a2a2a', 
                        border: '1px solid #444',
                        mb: 2,
                        '&:hover': { bgcolor: '#333' }
                      }}
                    >
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                          <Box display="flex" alignItems="start" gap={2}>
                            {getTipoIcon(update.tipo)}
                            <Box>
                              <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
                                {update.titulo}
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#bbb' }}>
                                📍 {update.fuente} - {new Date(update.fecha_publicacion).toLocaleDateString('es-CL')}
                              </Typography>
                            </Box>
                          </Box>
                          
                          <Box display="flex" alignItems="center" gap={1}>
                            <Tooltip title={update.bookmark ? "Quitar marcador" : "Marcar importante"}>
                              <IconButton 
                                onClick={() => toggleBookmark(update.id)}
                                sx={{ color: update.bookmark ? '#f57f17' : '#666' }}
                              >
                                {update.bookmark ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>
                        
                        <Typography variant="body1" sx={{ color: '#ccc', mb: 2 }}>
                          {update.resumen}
                        </Typography>
                        
                        <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                          <Chip 
                            label={update.tipo}
                            size="small"
                            sx={{ bgcolor: '#0d47a1', color: '#fff' }}
                          />
                          <Chip 
                            label={`Prioridad ${update.prioridad}`}
                            size="small"
                            sx={{ 
                              bgcolor: getPrioridadColor(update.prioridad),
                              color: '#fff'
                            }}
                          />
                          <Chip 
                            label={`Impacto ${update.impacto_estimado}`}
                            size="small"
                            sx={{ 
                              bgcolor: getImpactoColor(update.impacto_estimado),
                              color: '#fff'
                            }}
                          />
                          <Chip 
                            label={update.estado_implementacion}
                            size="small"
                            sx={{ 
                              bgcolor: getEstadoColor(update.estado_implementacion),
                              color: '#fff'
                            }}
                          />
                        </Box>

                        {diasVigencia > 0 && diasVigencia < 60 && (
                          <Alert 
                            severity={diasVigencia < 30 ? "warning" : "info"}
                            sx={{ 
                              mb: 2,
                              bgcolor: diasVigencia < 30 ? '#f57f17' : '#0d47a1',
                              color: '#fff'
                            }}
                          >
                            ⏰ <strong>Vigencia:</strong> {diasVigencia} días - {new Date(update.fecha_vigencia).toLocaleDateString('es-CL')}
                          </Alert>
                        )}

                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="body2" sx={{ color: '#bbb' }}>
                              📊 Relevancia empresa: {update.relevancia_empresa}%
                            </Typography>
                            <LinearProgress 
                              variant="determinate" 
                              value={update.relevancia_empresa}
                              sx={{ 
                                width: 60,
                                bgcolor: '#444',
                                '& .MuiLinearProgress-bar': { bgcolor: '#4fc3f7' }
                              }}
                            />
                          </Box>
                          
                          <Box display="flex" gap={1}>
                            <Button
                              size="small"
                              onClick={() => handleViewDetails(update)}
                              sx={{ color: '#4fc3f7' }}
                            >
                              Ver Detalles
                            </Button>
                            {update.estado_implementacion === 'PENDIENTE' && (
                              <Button
                                size="small"
                                onClick={() => markAsImplemented(update.id)}
                                sx={{ color: '#81c784' }}
                              >
                                Marcar Implementado
                              </Button>
                            )}
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  );
                })}
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Panel lateral notificaciones */}
        <Grid item xs={12} lg={4}>
          <Paper elevation={3} sx={{ bgcolor: '#1a1a1a', border: '1px solid #333', p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ color: '#fff', mb: 3, fontWeight: 600 }}>
              🔔 Notificaciones Legales
            </Typography>
            
            {notifications.length === 0 ? (
              <Alert severity="info" sx={{ bgcolor: '#0d47a1', color: '#fff' }}>
                ✅ No hay notificaciones pendientes
              </Alert>
            ) : (
              <List>
                {notifications.map((notification) => (
                  <ListItem 
                    key={notification.id}
                    sx={{ 
                      bgcolor: notification.leida ? 'transparent' : '#2a2a2a',
                      borderRadius: 1,
                      mb: 1
                    }}
                  >
                    <ListItemIcon>
                      <NotificationIcon sx={{ 
                        color: getPrioridadColor(notification.prioridad)
                      }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 600 }}>
                          {notification.titulo}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" sx={{ color: '#ccc' }}>
                            {notification.mensaje}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#999' }}>
                            {new Date(notification.fecha).toLocaleString('es-CL')}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>

          {/* Fuentes monitoreadas */}
          <Paper elevation={3} sx={{ bgcolor: '#1a1a1a', border: '1px solid #333', p: 3 }}>
            <Typography variant="h6" sx={{ color: '#fff', mb: 2, fontWeight: 600 }}>
              📡 Fuentes Monitoreadas
            </Typography>
            
            <List dense>
              {[
                { nombre: 'Diario Oficial', url: 'diariooficial.interior.gob.cl', activa: true },
                { nombre: 'APDP', url: 'agenciaprotecciondatos.cl', activa: true },
                { nombre: 'BCN', url: 'bcn.cl', activa: true },
                { nombre: 'LeyChile', url: 'leychile.cl', activa: true },
                { nombre: 'Ministerio Secretaría General', url: 'minsegpres.gob.cl', activa: false }
              ].map((fuente, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <Box 
                      width={8} 
                      height={8} 
                      borderRadius="50%" 
                      bgcolor={fuente.activa ? '#2e7d32' : '#d32f2f'}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="body2" sx={{ color: '#fff' }}>
                        {fuente.nombre}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" sx={{ color: '#bbb' }}>
                        {fuente.url}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Dialog: Detalles de actualización */}
      <Dialog 
        open={detailsDialog} 
        onClose={() => setDetailsDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: '#1a1a1a', color: '#fff', borderBottom: '1px solid #333' }}>
          <Box display="flex" alignItems="center" gap={2}>
            {selectedUpdate && getTipoIcon(selectedUpdate.tipo)}
            <Typography variant="h6" component="span">
              {selectedUpdate?.titulo}
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ bgcolor: '#1a1a1a', color: '#fff' }}>
          {selectedUpdate && (
            <UpdateDetails update={selectedUpdate} />
          )}
        </DialogContent>
        
        <DialogActions sx={{ bgcolor: '#1a1a1a', borderTop: '1px solid #333' }}>
          <Button onClick={() => setDetailsDialog(false)} sx={{ color: '#bbb' }}>
            Cerrar
          </Button>
          <Button 
            onClick={() => window.open(selectedUpdate?.url_oficial, '_blank')}
            variant="contained"
            sx={{
              bgcolor: '#4fc3f7',
              color: '#000',
              fontWeight: 600,
              '&:hover': { bgcolor: '#29b6f6' }
            }}
            startIcon={<OpenIcon />}
          >
            Ver Documento Oficial
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Componente detalles de actualización
const UpdateDetails = ({ update }) => {
  // Función auxiliar para obtener color de estado
  const getEstadoColor = (estado) => {
    const colors = {
      'PENDIENTE': '#f57f17',
      'EN_PROGRESO': '#1976d2',
      'COMPLETADO': '#2e7d32',
      'VENCIDO': '#d32f2f'
    };
    return colors[estado] || '#666';
  };

  return (
    <Box>
      {/* Información general */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={6}>
          <Typography variant="body2" sx={{ color: '#bbb' }}>Fuente Oficial:</Typography>
          <Typography variant="body1" sx={{ color: '#fff', fontWeight: 600 }}>
            {update.fuente}
          </Typography>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Typography variant="body2" sx={{ color: '#bbb' }}>Categoría:</Typography>
          <Typography variant="body1" sx={{ color: '#fff' }}>
            {update.categoria.replace(/_/g, ' ')}
          </Typography>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Typography variant="body2" sx={{ color: '#bbb' }}>Fecha Publicación:</Typography>
          <Typography variant="body1" sx={{ color: '#fff' }}>
            {new Date(update.fecha_publicacion).toLocaleString('es-CL')}
          </Typography>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Typography variant="body2" sx={{ color: '#bbb' }}>Fecha Vigencia:</Typography>
          <Typography variant="body1" sx={{ color: '#fff' }}>
            {new Date(update.fecha_vigencia).toLocaleString('es-CL')}
          </Typography>
        </Grid>
      </Grid>

      <Divider sx={{ bgcolor: '#444', my: 3 }} />

      {/* Cambios principales */}
      <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>
        📝 Cambios Principales
      </Typography>
      
      <List>
        {update.cambios_principales.map((cambio, index) => (
          <ListItem key={index}>
            <ListItemIcon>
              <NewsIcon sx={{ color: '#4fc3f7', fontSize: 20 }} />
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography variant="body1" sx={{ color: '#fff' }}>
                  {cambio}
                </Typography>
              }
            />
          </ListItem>
        ))}
      </List>

      <Divider sx={{ bgcolor: '#444', my: 3 }} />

      {/* Áreas afectadas */}
      <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>
        🎯 Áreas del Sistema Afectadas
      </Typography>
      
      <Box display="flex" flexWrap="wrap" gap={1} mb={3}>
        {update.areas_afectadas.map((area, index) => (
          <Chip 
            key={index}
            label={area.replace(/_/g, ' ')}
            sx={{ bgcolor: '#f57f17', color: '#fff' }}
          />
        ))}
      </Box>

      <Divider sx={{ bgcolor: '#444', my: 3 }} />

      {/* Acciones requeridas */}
      <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>
        ✅ Acciones Requeridas
      </Typography>
      
      <List>
        {update.acciones_requeridas.map((accion, index) => (
          <ListItem key={index}>
            <ListItemIcon>
              <CheckIcon sx={{ color: '#2e7d32', fontSize: 20 }} />
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography variant="body1" sx={{ color: '#fff' }}>
                  {accion}
                </Typography>
              }
            />
          </ListItem>
        ))}
      </List>

      {/* Estado implementación */}
      <Paper elevation={1} sx={{ bgcolor: '#333', p: 2, mt: 3 }}>
        <Typography variant="subtitle1" sx={{ color: '#fff', mb: 1 }}>
          📊 Estado de Implementación
        </Typography>
        
        <Box display="flex" alignItems="center" gap={2} mb={1}>
          <Typography variant="body2" sx={{ color: '#bbb' }}>Estado Actual:</Typography>
          <Chip 
            label={update.estado_implementacion}
            sx={{ 
              bgcolor: getEstadoColor(update.estado_implementacion),
              color: '#fff'
            }}
          />
        </Box>
        
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="body2" sx={{ color: '#bbb' }}>Asignado a:</Typography>
          <Typography variant="body1" sx={{ color: '#fff' }}>{update.asignado_a}</Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default LegalUpdatesMonitor;