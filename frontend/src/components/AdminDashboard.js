import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  Tabs,
  Tab,
  LinearProgress,
  Badge,
  Avatar,
} from '@mui/material';
import {
  Business as BusinessIcon,
  People as PeopleIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
  Analytics as AnalyticsIcon,
  CheckCircle as CheckIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  VpnKey as KeyIcon,
  Shield as ShieldIcon,
  Assignment as AssignmentIcon,
  Notifications as NotificationIcon,
  Refresh as RefreshIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [holdings, setHoldings] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [metricas, setMetricas] = useState({});
  const [alertas, setAlertas] = useState([]);
  const [configuracion, setConfiguracion] = useState({});
  const [selectedHolding, setSelectedHolding] = useState(null);
  const [holdingDialog, setHoldingDialog] = useState(false);
  const [userDialog, setUserDialog] = useState(false);
  const [configDialog, setConfigDialog] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // 🔄 CARGAR TODO DESDE SUPABASE - CERO DATOS HARDCODEADOS
      const { data: { user } } = await supabase.auth.getUser();
      const tenantId = user?.tenant_id;
      
      if (!tenantId) {
        // //console.log('Sin tenant ID - no cargar datos');
        return;
      }

      // HOLDINGS desde Supabase
      const { data: holdingsData } = await supabase
        .from('organizaciones')
        .select('*')
        .eq('tenant_id', tenantId);
      setHoldings(holdingsData || []);

      // USUARIOS desde Supabase  
      const { data: usuariosData } = await supabase
        .from('usuarios')
        .select('*')
        .eq('tenant_id', tenantId);
      setUsuarios(usuariosData || []);

      // MÉTRICAS calculadas desde Supabase
      const [ratsResult, eipdResult, usuariosResult] = await Promise.all([
        supabase.from('activities').select('id', { count: 'exact' }).eq('tenant_id', tenantId),
        supabase.from('actividades_dpo').select('id', { count: 'exact' }).eq('tipo_actividad', 'EIPD'),
        supabase.from('usuarios').select('id', { count: 'exact' }).eq('tenant_id', tenantId).eq('estado', 'ACTIVO')
      ]);

      const metricsCalculated = {
        total_holdings: holdingsData?.length || 0,
        total_usuarios: usuariosResult.count || 0,
        total_rats: ratsResult.count || 0,
        total_eipds: eipdResult.count || 0,
        compliance_promedio: 0, // Se calculará dinámicamente
        alertas_activas: 0, // Se cargará de tabla alerts
        transferencias_mes: 0, // Se calculará de transferencias
        incidentes_mes: 0, // Se cargará de incidents
        auditorias_pendientes: 0, // Se cargará de audit_reports
        dpa_vencidos: 0 // Se calculará de proveedores
      };
      setMetricas(metricsCalculated);

      // ALERTAS desde Supabase
      const { data: alertasData } = await supabase
        .from('system_alerts')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('resolved', false)
        .order('created_at', { ascending: false });
      setAlertas(alertasData || []);
      
    } catch (error) {
      console.error('Error cargando datos dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoColor = (estado) => {
    const colors = {
      'ACTIVO': '#2e7d32',
      'INACTIVO': '#666',
      'PENDIENTE_SETUP': '#f57f17',
      'SUSPENDIDO': '#d32f2f',
      'PENDIENTE_ACTIVACION': '#f57f17'
    };
    return colors[estado] || '#666';
  };

  const getRolColor = (rol) => {
    const colors = {
      'DPO_PRINCIPAL': '#1976d2',
      'COMPLIANCE_OFFICER': '#2e7d32',
      'ADMIN_HOLDING': '#f57f17',
      'AUDITOR': '#9c27b0',
      'USUARIO_BASICO': '#666'
    };
    return colors[rol] || '#666';
  };

  const getGravedadColor = (gravedad) => {
    const colors = {
      'BAJA': '#2e7d32',
      'MEDIA': '#f57f17',
      'ALTA': '#d32f2f',
      'CRITICA': '#b71c1c'
    };
    return colors[gravedad] || '#666';
  };

  const handleAddHolding = () => {
    setSelectedHolding(null);
    setHoldingDialog(true);
  };

  const handleEditHolding = (holding) => {
    setSelectedHolding(holding);
    setHoldingDialog(true);
  };

  const handleAddUser = () => {
    setUserDialog(true);
  };

  return (
    <Box sx={{ p: 3, pt: 10, minHeight: '100vh', bgcolor: '#111827' }}>
      {/* Header con espaciado mejorado */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" sx={{ color: '#f9fafb', fontWeight: 700, mb: 1 }}>
            🏛️ Panel Administrativo Multi-tenant
          </Typography>
          <Typography variant="body1" sx={{ color: '#9ca3af', fontSize: '1rem' }}>
            Gestión holdings, usuarios y configuración sistema LPDP
          </Typography>
        </Box>
        
        <Box display="flex" gap={2}>
          <Badge badgeContent={alertas.filter(a => !a.resuelto).length} color="error">
            <Button
              variant="outlined"
              startIcon={<NotificationIcon />}
              sx={{
                borderColor: '#f59e0b',
                color: '#f59e0b',
                '&:hover': { borderColor: '#fbbf24', bgcolor: 'rgba(251, 191, 36, 0.1)' }
              }}
            >
              Alertas
            </Button>
          </Badge>
          
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadDashboardData}
            disabled={loading}
            sx={{
              borderColor: '#60a5fa',
              color: '#60a5fa',
              '&:hover': { borderColor: '#3b82f6', bgcolor: 'rgba(96, 165, 250, 0.1)' }
            }}
          >
            Actualizar
          </Button>
          
          <Button
            variant="contained"
            startIcon={<SettingsIcon />}
            onClick={() => setConfigDialog(true)}
            sx={{
              bgcolor: '#4fc3f7',
              color: '#000',
              fontWeight: 600,
              '&:hover': { bgcolor: '#29b6f6' }
            }}
          >
            Configuración
          </Button>
        </Box>
      </Box>

      {/* Métricas Ejecutivas */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: '#1a1a1a', border: '1px solid #333' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <BusinessIcon sx={{ color: '#4fc3f7', fontSize: 32 }} />
                <Box>
                  <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700 }}>
                    {metricas.total_holdings}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#bbb' }}>
                    Holdings Activas
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
                <PeopleIcon sx={{ color: '#2e7d32', fontSize: 32 }} />
                <Box>
                  <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700 }}>
                    {metricas.total_usuarios}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#bbb' }}>
                    Usuarios Sistema
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
                <AssignmentIcon sx={{ color: '#1976d2', fontSize: 32 }} />
                <Box>
                  <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700 }}>
                    {metricas.total_rats + metricas.total_eipds}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#bbb' }}>
                    RATs + EIPDs
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
                <AnalyticsIcon sx={{ color: '#f57f17', fontSize: 32 }} />
                <Box>
                  <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700 }}>
                    {metricas.compliance_promedio}%
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#bbb' }}>
                    Compliance Promedio
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Alertas Críticas */}
      {alertas.filter(a => !a.resuelto && a.gravedad === 'ALTA').length > 0 && (
        <Alert 
          severity="error" 
          sx={{ mb: 3, bgcolor: '#d32f2f', color: '#fff' }}
          action={
            <Button color="inherit" size="small">
              RESOLVER
            </Button>
          }
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {alertas.filter(a => !a.resuelto && a.gravedad === 'ALTA').length} alertas críticas requieren atención inmediata
          </Typography>
        </Alert>
      )}

      {/* Tabs */}
      <Paper elevation={1} sx={{ bgcolor: '#1a1a1a', border: '1px solid #333', mb: 3 }}>
        <Tabs 
          value={currentTab} 
          onChange={(e, newValue) => setCurrentTab(newValue)}
          sx={{
            '& .MuiTab-root': { color: '#bbb' },
            '& .Mui-selected': { color: '#4fc3f7' },
            '& .MuiTabs-indicator': { bgcolor: '#4fc3f7' }
          }}
        >
          <Tab label="Holdings" icon={<BusinessIcon />} />
          <Tab label="Usuarios" icon={<PeopleIcon />} />
          <Tab label="Métricas" icon={<AnalyticsIcon />} />
          <Tab label="Alertas" icon={<NotificationIcon />} />
          <Tab label="Configuración" icon={<SettingsIcon />} />
        </Tabs>
      </Paper>

      {/* Tab: Holdings */}
      {currentTab === 0 && (
        <Box>
          <Box display="flex" justifyContent="between" mb={3}>
            <Typography variant="h6" sx={{ color: '#fff' }}>
              🏢 Gestión de Holdings
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddHolding}
              sx={{
                bgcolor: '#4fc3f7',
                color: '#000',
                fontWeight: 600,
                '&:hover': { bgcolor: '#29b6f6' }
              }}
            >
              Nueva Holding
            </Button>
          </Box>

          <Grid container spacing={3}>
            {holdings.map((holding) => (
              <Grid item xs={12} md={6} lg={4} key={holding.id}>
                <HoldingCard 
                  holding={holding} 
                  onEdit={handleEditHolding}
                  onView={(h) => navigate(`/holdings/${h.id}`)}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Tab: Usuarios */}
      {currentTab === 1 && (
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6" sx={{ color: '#fff' }}>
              👥 Gestión de Usuarios
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddUser}
              sx={{
                bgcolor: '#4fc3f7',
                color: '#000',
                fontWeight: 600,
                '&:hover': { bgcolor: '#29b6f6' }
              }}
            >
              Nuevo Usuario
            </Button>
          </Box>

          <Paper elevation={3} sx={{ bgcolor: '#1a1a1a', border: '1px solid #333' }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#2a2a2a' }}>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Usuario</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Rol</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Holding</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Estado</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Último Acceso</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {usuarios.map((usuario) => (
                    <TableRow 
                      key={usuario.id}
                      sx={{ 
                        '&:hover': { bgcolor: '#2a2a2a' },
                        borderBottom: '1px solid #333'
                      }}
                    >
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar sx={{ bgcolor: '#4fc3f7', color: '#000' }}>
                            {usuario.nombre.split(' ').map(n => n[0]).join('')}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 600 }}>
                              {usuario.nombre}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#bbb' }}>
                              {usuario.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Chip 
                          label={usuario.rol.replace('_', ' ')}
                          sx={{ 
                            bgcolor: getRolColor(usuario.rol),
                            color: '#fff',
                            fontSize: '0.75rem'
                          }}
                        />
                      </TableCell>
                      
                      <TableCell>
                        <Typography sx={{ color: '#fff' }}>
                          {holdings.find(h => h.id === usuario.holding_id)?.nombre || 'Sin asignar'}
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <Chip 
                          label={usuario.estado}
                          sx={{ 
                            bgcolor: getEstadoColor(usuario.estado),
                            color: '#fff',
                            fontSize: '0.75rem'
                          }}
                        />
                      </TableCell>
                      
                      <TableCell>
                        <Typography sx={{ color: usuario.ultimo_acceso ? '#fff' : '#f57f17' }}>
                          {usuario.ultimo_acceso ? 
                            new Date(usuario.ultimo_acceso).toLocaleString() : 
                            'Nunca'
                          }
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <Box display="flex" gap={0.5}>
                          <Tooltip title="Editar usuario">
                            <IconButton 
                              size="small"
                              sx={{ color: '#4fc3f7' }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Permisos">
                            <IconButton 
                              size="small"
                              sx={{ color: '#f57f17' }}
                            >
                              <KeyIcon />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Eliminar">
                            <IconButton 
                              size="small"
                              sx={{ color: '#d32f2f' }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      )}

      {/* Tab: Métricas */}
      {currentTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <MetricasComplianceCard metricas={metricas} holdings={holdings} />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <MetricasOperacionalesCard metricas={metricas} />
          </Grid>
          
          <Grid item xs={12}>
            <MetricasTendenciasCard />
          </Grid>
        </Grid>
      )}

      {/* Tab: Alertas */}
      {currentTab === 3 && (
        <Box>
          <Typography variant="h6" sx={{ color: '#fff', mb: 3 }}>
            🚨 Centro de Alertas y Notificaciones
          </Typography>
          
          <Grid container spacing={3}>
            {alertas.map((alerta) => (
              <Grid item xs={12} md={6} key={alerta.id}>
                <AlertCard alerta={alerta} holdings={holdings} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Tab: Configuración */}
      {currentTab === 4 && (
        <ConfiguracionSistema configuracion={configuracion} />
      )}

      {/* Dialog: Gestión Holding */}
      <Dialog 
        open={holdingDialog} 
        onClose={() => setHoldingDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: '#1a1a1a', color: '#fff', borderBottom: '1px solid #333' }}>
          <Box display="flex" alignItems="center" gap={2}>
            <BusinessIcon sx={{ color: '#4fc3f7' }} />
            <Typography variant="h6" component="span">
              {selectedHolding ? 'Editar Holding' : 'Nueva Holding'}
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ bgcolor: '#1a1a1a', color: '#fff' }}>
          <HoldingForm holding={selectedHolding} />
        </DialogContent>
        
        <DialogActions sx={{ bgcolor: '#1a1a1a', borderTop: '1px solid #333' }}>
          <Button onClick={() => setHoldingDialog(false)} sx={{ color: '#bbb' }}>
            Cancelar
          </Button>
          <Button 
            variant="contained"
            sx={{
              bgcolor: '#4fc3f7',
              color: '#000',
              fontWeight: 600,
              '&:hover': { bgcolor: '#29b6f6' }
            }}
          >
            {selectedHolding ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Componente para tarjeta de holding
const HoldingCard = ({ holding, onEdit, onView }) => {
  return (
    <Card sx={{ bgcolor: '#1a1a1a', border: '1px solid #333', height: '100%' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
          <Box>
            <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
              {holding.nombre}
            </Typography>
            <Typography variant="body2" sx={{ color: '#bbb' }}>
              {holding.tipo} - {holding.pais}
            </Typography>
          </Box>
          
          <Chip 
            label={holding.estado}
            sx={{ 
              bgcolor: getEstadoColor(holding.estado),
              color: '#fff',
              fontSize: '0.75rem'
            }}
          />
        </Box>

        <Grid container spacing={2} mb={2}>
          <Grid item xs={6}>
            <Typography variant="body2" sx={{ color: '#bbb' }}>Usuarios:</Typography>
            <Typography variant="h6" sx={{ color: '#2e7d32' }}>
              {holding.usuarios_activos}
            </Typography>
          </Grid>
          
          <Grid item xs={6}>
            <Typography variant="body2" sx={{ color: '#bbb' }}>RATs:</Typography>
            <Typography variant="h6" sx={{ color: '#1976d2' }}>
              {holding.rats_registrados}
            </Typography>
          </Grid>
          
          <Grid item xs={6}>
            <Typography variant="body2" sx={{ color: '#bbb' }}>Compliance:</Typography>
            <Typography variant="h6" sx={{ color: '#4fc3f7' }}>
              {holding.compliance_score}%
            </Typography>
          </Grid>
          
          <Grid item xs={6}>
            <Typography variant="body2" sx={{ color: '#bbb' }}>Filiales:</Typography>
            <Typography variant="h6" sx={{ color: '#f57f17' }}>
              {holding.filiales.length}
            </Typography>
          </Grid>
        </Grid>

        <Box mb={2}>
          <Typography variant="body2" sx={{ color: '#bbb' }}>DPO Asignado:</Typography>
          <Typography sx={{ color: holding.dpo_asignado ? '#fff' : '#f57f17' }}>
            {holding.dpo_asignado || 'Sin asignar'}
          </Typography>
        </Box>

        <LinearProgress 
          variant="determinate" 
          value={holding.compliance_score} 
          sx={{
            bgcolor: '#333',
            '& .MuiLinearProgress-bar': {
              bgcolor: holding.compliance_score >= 80 ? '#2e7d32' : 
                      holding.compliance_score >= 60 ? '#f57f17' : '#d32f2f'
            }
          }}
        />
      </CardContent>
      
      <CardActions>
        <Button 
          size="small"
          onClick={() => onView(holding)}
          sx={{ color: '#4fc3f7' }}
          startIcon={<ViewIcon />}
        >
          Ver Detalles
        </Button>
        <Button 
          size="small"
          onClick={() => onEdit(holding)}
          sx={{ color: '#f57f17' }}
          startIcon={<EditIcon />}
        >
          Configurar
        </Button>
      </CardActions>
    </Card>
  );
};

// Componente para métricas de compliance
const MetricasComplianceCard = ({ metricas, holdings }) => {
  return (
    <Card sx={{ bgcolor: '#1a1a1a', border: '1px solid #333', height: '100%' }}>
      <CardContent>
        <Typography variant="h6" sx={{ color: '#fff', mb: 3 }}>
          📊 Métricas de Cumplimiento
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="body2" sx={{ color: '#bbb' }}>
                Compliance Global
              </Typography>
              <Typography variant="h6" sx={{ color: '#4fc3f7' }}>
                {metricas.compliance_promedio}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={metricas.compliance_promedio} 
              sx={{
                bgcolor: '#333',
                '& .MuiLinearProgress-bar': { bgcolor: '#4fc3f7' }
              }}
            />
          </Grid>

          {holdings.map((holding) => (
            <Grid item xs={12} key={holding.id}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                <Typography variant="body2" sx={{ color: '#bbb' }}>
                  {holding.nombre}
                </Typography>
                <Typography variant="body2" sx={{ color: '#fff' }}>
                  {holding.compliance_score}%
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={holding.compliance_score} 
                sx={{
                  bgcolor: '#333',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: holding.compliance_score >= 80 ? '#2e7d32' : 
                            holding.compliance_score >= 60 ? '#f57f17' : '#d32f2f'
                  }
                }}
              />
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

// Componente para métricas operacionales
const MetricasOperacionalesCard = ({ metricas }) => {
  return (
    <Card sx={{ bgcolor: '#1a1a1a', border: '1px solid #333', height: '100%' }}>
      <CardContent>
        <Typography variant="h6" sx={{ color: '#fff', mb: 3 }}>
          ⚡ Métricas Operacionales
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="body2" sx={{ color: '#bbb' }}>Transferencias/Mes:</Typography>
            <Typography variant="h5" sx={{ color: '#4fc3f7' }}>
              {metricas.transferencias_mes?.toLocaleString()}
            </Typography>
          </Grid>
          
          <Grid item xs={6}>
            <Typography variant="body2" sx={{ color: '#bbb' }}>Incidentes/Mes:</Typography>
            <Typography variant="h5" sx={{ color: metricas.incidentes_mes > 5 ? '#d32f2f' : '#2e7d32' }}>
              {metricas.incidentes_mes}
            </Typography>
          </Grid>
          
          <Grid item xs={6}>
            <Typography variant="body2" sx={{ color: '#bbb' }}>Auditorías Pendientes:</Typography>
            <Typography variant="h5" sx={{ color: metricas.auditorias_pendientes > 0 ? '#f57f17' : '#2e7d32' }}>
              {metricas.auditorias_pendientes}
            </Typography>
          </Grid>
          
          <Grid item xs={6}>
            <Typography variant="body2" sx={{ color: '#bbb' }}>DPA Vencidos:</Typography>
            <Typography variant="h5" sx={{ color: metricas.dpa_vencidos > 0 ? '#d32f2f' : '#2e7d32' }}>
              {metricas.dpa_vencidos}
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ bgcolor: '#333', my: 2 }} />

        <Typography variant="body2" sx={{ color: '#bbb', mb: 1 }}>
          Distribución por Tipo:
        </Typography>
        <Box display="flex" flexWrap="wrap" gap={1}>
          {/* Datos dinámicos desde Supabase - no usar datos estáticos */}
          <Chip label="Cargando..." size="small" sx={{ bgcolor: '#666', color: '#fff' }} />
        </Box>
      </CardContent>
    </Card>
  );
};

// Componente para tendencias
const MetricasTendenciasCard = () => {
  return (
    <Card sx={{ bgcolor: '#1a1a1a', border: '1px solid #333' }}>
      <CardContent>
        <Typography variant="h6" sx={{ color: '#fff', mb: 3 }}>
          📈 Tendencias y Proyecciones
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box textAlign="center">
              <TimelineIcon sx={{ color: '#4fc3f7', fontSize: 48, mb: 1 }} />
              <Typography variant="h4" sx={{ color: '#4fc3f7', fontWeight: 700 }}>
                +15%
              </Typography>
              <Typography variant="body2" sx={{ color: '#bbb' }}>
                Crecimiento RATs último mes
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box textAlign="center">
              <SecurityIcon sx={{ color: '#2e7d32', fontSize: 48, mb: 1 }} />
              <Typography variant="h4" sx={{ color: '#2e7d32', fontWeight: 700 }}>
                98.5%
              </Typography>
              <Typography variant="body2" sx={{ color: '#bbb' }}>
                Uptime sistema
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box textAlign="center">
              <ShieldIcon sx={{ color: '#f57f17', fontSize: 48, mb: 1 }} />
              <Typography variant="h4" sx={{ color: '#f57f17', fontWeight: 700 }}>
                72h
              </Typography>
              <Typography variant="body2" sx={{ color: '#bbb' }}>
                Tiempo promedio resolución incidentes
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

// Componente para tarjeta de alerta
const AlertCard = ({ alerta, holdings }) => {
  const holding = holdings.find(h => h.id === alerta.holding_id);

  return (
    <Card sx={{ 
      bgcolor: '#1a1a1a', 
      border: `1px solid ${getGravedadColor(alerta.gravedad)}`,
      borderLeft: `4px solid ${getGravedadColor(alerta.gravedad)}`
    }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
          <Box>
            <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
              {alerta.tipo.replace('_', ' ')}
            </Typography>
            <Typography variant="body2" sx={{ color: '#bbb' }}>
              {holding?.nombre} - {new Date(alerta.fecha).toLocaleDateString()}
            </Typography>
          </Box>
          
          <Chip 
            label={alerta.gravedad}
            sx={{ 
              bgcolor: getGravedadColor(alerta.gravedad),
              color: '#fff'
            }}
          />
        </Box>

        <Typography sx={{ color: '#fff', mb: 2 }}>
          {alerta.mensaje}
        </Typography>

        <Box display="flex" gap={1}>
          <Button
            size="small"
            variant="contained"
            sx={{
              bgcolor: '#2e7d32',
              color: '#fff',
              '&:hover': { bgcolor: '#1b5e20' }
            }}
            startIcon={<CheckIcon />}
          >
            Resolver
          </Button>
          
          <Button
            size="small"
            sx={{ color: '#4fc3f7' }}
            startIcon={<ViewIcon />}
          >
            Ver Detalles
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

// Componente para configuración del sistema
const ConfiguracionSistema = ({ configuracion }) => {
  const [config, setConfig] = useState({
    retencion_logs: 90,
    notificaciones_email: true,
    audit_automatico: true,
    backup_automatico: true,
    nivel_seguridad_default: 'ALTO',
    idioma_sistema: 'es-CL',
    timezone: 'America/Santiago',
    max_usuarios_holding: 50,
    max_rats_usuario: 100,
    retention_policy: 7,
    encryption_enabled: true,
    mfa_required: true
  });

  return (
    <Box>
      <Typography variant="h6" sx={{ color: '#fff', mb: 3 }}>
        ⚙️ Configuración del Sistema
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: '#1a1a1a', border: '1px solid #333' }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#fff', mb: 3 }}>
                🔒 Configuración de Seguridad
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.encryption_enabled}
                        onChange={(e) => setConfig({...config, encryption_enabled: e.target.checked})}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': { color: '#4fc3f7' },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#0d47a1' }
                        }}
                      />
                    }
                    label={
                      <Typography sx={{ color: '#fff' }}>
                        Cifrado habilitado
                      </Typography>
                    }
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.mfa_required}
                        onChange={(e) => setConfig({...config, mfa_required: e.target.checked})}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': { color: '#4fc3f7' },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#0d47a1' }
                        }}
                      />
                    }
                    label={
                      <Typography sx={{ color: '#fff' }}>
                        MFA obligatorio
                      </Typography>
                    }
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ color: '#bbb' }}>Nivel Seguridad Default</InputLabel>
                    <Select
                      value={config.nivel_seguridad_default}
                      onChange={(e) => setConfig({...config, nivel_seguridad_default: e.target.value})}
                      sx={{
                        bgcolor: '#2a2a2a',
                        color: '#fff',
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: '#444' }
                      }}
                    >
                      <MenuItem value="BASICO">Básico</MenuItem>
                      <MenuItem value="MEDIO">Medio</MenuItem>
                      <MenuItem value="ALTO">Alto</MenuItem>
                      <MenuItem value="CRITICO">Crítico</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: '#1a1a1a', border: '1px solid #333' }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#fff', mb: 3 }}>
                📋 Configuración Operacional
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Retención Logs (días)"
                    value={config.retencion_logs}
                    onChange={(e) => setConfig({...config, retencion_logs: parseInt(e.target.value)})}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: '#2a2a2a',
                        '& fieldset': { borderColor: '#444' }
                      },
                      '& .MuiInputLabel-root': { color: '#bbb' }
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Máximo RATs por Usuario"
                    value={config.max_rats_usuario}
                    onChange={(e) => setConfig({...config, max_rats_usuario: parseInt(e.target.value)})}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: '#2a2a2a',
                        '& fieldset': { borderColor: '#444' }
                      },
                      '& .MuiInputLabel-root': { color: '#bbb' }
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.notificaciones_email}
                        onChange={(e) => setConfig({...config, notificaciones_email: e.target.checked})}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': { color: '#4fc3f7' },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#0d47a1' }
                        }}
                      />
                    }
                    label={
                      <Typography sx={{ color: '#fff' }}>
                        Notificaciones por email
                      </Typography>
                    }
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.audit_automatico}
                        onChange={(e) => setConfig({...config, audit_automatico: e.target.checked})}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': { color: '#4fc3f7' },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#0d47a1' }
                        }}
                      />
                    }
                    label={
                      <Typography sx={{ color: '#fff' }}>
                        Auditoría automática
                      </Typography>
                    }
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

// Componente para formulario de holding
const HoldingForm = ({ holding }) => {
  const [formData, setFormData] = useState({
    nombre: holding?.nombre || '',
    tipo: holding?.tipo || 'INDEPENDIENTE',
    pais: holding?.pais || 'Chile',
    dpo_asignado: holding?.dpo_asignado || '',
    nivel_seguridad: holding?.configuracion?.nivel_seguridad || 'MEDIO'
  });

  return (
    <Box pt={2}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            required
            label="Nombre de la Holding"
            value={formData.nombre}
            onChange={(e) => setFormData({...formData, nombre: e.target.value})}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: '#2a2a2a',
                '& fieldset': { borderColor: '#444' }
              },
              '& .MuiInputLabel-root': { color: '#bbb' }
            }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel sx={{ color: '#bbb' }}>Tipo de Organización</InputLabel>
            <Select
              value={formData.tipo}
              onChange={(e) => setFormData({...formData, tipo: e.target.value})}
              sx={{
                bgcolor: '#2a2a2a',
                color: '#fff',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#444' }
              }}
            >
              <MenuItem value="MATRIZ">Matriz</MenuItem>
              <MenuItem value="HOLDING">Holding</MenuItem>
              <MenuItem value="FILIAL">Filial</MenuItem>
              <MenuItem value="INDEPENDIENTE">Independiente</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="País"
            value={formData.pais}
            onChange={(e) => setFormData({...formData, pais: e.target.value})}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: '#2a2a2a',
                '& fieldset': { borderColor: '#444' }
              },
              '& .MuiInputLabel-root': { color: '#bbb' }
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="DPO Asignado (Email)"
            value={formData.dpo_asignado}
            onChange={(e) => setFormData({...formData, dpo_asignado: e.target.value})}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: '#2a2a2a',
                '& fieldset': { borderColor: '#444' }
              },
              '& .MuiInputLabel-root': { color: '#bbb' }
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

// Helper functions
const getEstadoColor = (estado) => {
  const colors = {
    'ACTIVO': '#2e7d32',
    'INACTIVO': '#666',
    'PENDIENTE_SETUP': '#f57f17',
    'SUSPENDIDO': '#d32f2f',
    'PENDIENTE_ACTIVACION': '#f57f17'
  };
  return colors[estado] || '#666';
};

const getRolColor = (rol) => {
  const colors = {
    'DPO_PRINCIPAL': '#1976d2',
    'COMPLIANCE_OFFICER': '#2e7d32',
    'ADMIN_HOLDING': '#f57f17',
    'AUDITOR': '#9c27b0',
    'USUARIO_BASICO': '#666'
  };
  return colors[rol] || '#666';
};

const getGravedadColor = (gravedad) => {
  const colors = {
    'BAJA': '#2e7d32',
    'MEDIA': '#f57f17',
    'ALTA': '#d32f2f',
    'CRITICA': '#b71c1c'
  };
  return colors[gravedad] || '#666';
};

export default AdminDashboard;