import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  IconButton,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Business as BusinessIcon,
  People as PeopleIcon,
  Security as SecurityIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { API_BASE_URL } from '../../config';

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalTenants: 0,
    activeTenants: 0,
    totalUsers: 0,
    activeUsers: 0,
    totalDPOs: 0,
    complianceRate: 0,
    recentActivity: [],
    systemHealth: 'healthy',
    alerts: []
  });
  const [loading, setLoading] = useState(true);
  const [recentTenants, setRecentTenants] = useState([]);
  const [systemMetrics, setSystemMetrics] = useState({});

  useEffect(() => {
    loadDashboardData();
    // Actualizar cada 5 minutos
    const interval = setInterval(loadDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Cargar estadísticas generales
      const statsResponse = await fetch(
        `${API_BASE_URL}/api/v1/admin/dashboard/stats`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Cargar empresas recientes
      const tenantsResponse = await fetch(
        `${API_BASE_URL}/api/v1/admin/tenants?skip=0&limit=5`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (tenantsResponse.ok) {
        const tenantsData = await tenantsResponse.json();
        setRecentTenants(tenantsData.items || tenantsData);
      }

      // Cargar métricas del sistema
      const metricsResponse = await fetch(
        `${API_BASE_URL}/api/v1/admin/dashboard/metrics`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json();
        setSystemMetrics(metricsData);
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSystemHealthColor = (health) => {
    switch (health) {
      case 'healthy': return 'success';
      case 'warning': return 'warning';
      case 'critical': return 'error';
      default: return 'info';
    }
  };

  const getSystemHealthIcon = (health) => {
    switch (health) {
      case 'healthy': return <CheckCircleIcon />;
      case 'warning': return <WarningIcon />;
      case 'critical': return <ErrorIcon />;
      default: return <CheckCircleIcon />;
    }
  };

  const StatCard = ({ title, value, subtitle, icon, color = 'primary', progress }) => (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="h6">
              {title}
            </Typography>
            <Typography variant="h4" component="h2" color={color}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="textSecondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box color={color}>
            {icon}
          </Box>
        </Box>
        {progress !== undefined && (
          <Box mt={2}>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              color={color}
              sx={{ height: 8, borderRadius: 4 }}
            />
            <Typography variant="caption" color="textSecondary">
              {progress}% completado
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const MetricCard = ({ title, children, actions }) => (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" component="h3">
            {title}
          </Typography>
          {actions && (
            <Box>
              {actions}
            </Box>
          )}
        </Box>
        {children}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header con botones de acción */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Dashboard de Administración
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadDashboardData}
          >
            Actualizar
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={() => {/* Implementar exportación */}}
          >
            Exportar Reporte
          </Button>
        </Box>
      </Box>

      {/* Estadísticas principales */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Empresas"
            value={stats.totalTenants}
            subtitle={`${stats.activeTenants} activas`}
            icon={<BusinessIcon fontSize="large" />}
            color="primary"
            progress={stats.totalTenants > 0 ? (stats.activeTenants / stats.totalTenants) * 100 : 0}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Usuarios"
            value={stats.totalUsers}
            subtitle={`${stats.activeUsers} activos`}
            icon={<PeopleIcon fontSize="large" />}
            color="secondary"
            progress={stats.totalUsers > 0 ? (stats.activeUsers / stats.totalUsers) * 100 : 0}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="DPOs Designados"
            value={stats.totalDPOs}
            subtitle="Data Protection Officers"
            icon={<SecurityIcon fontSize="large" />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Tasa de Cumplimiento"
            value={`${stats.complianceRate}%`}
            subtitle="Promedio general"
            icon={<AssessmentIcon fontSize="large" />}
            color="info"
            progress={stats.complianceRate}
          />
        </Grid>
      </Grid>

      {/* Estado del sistema y alertas */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={6}>
          <MetricCard 
            title="Estado del Sistema"
            actions={
              <Chip
                icon={getSystemHealthIcon(stats.systemHealth)}
                label={stats.systemHealth === 'healthy' ? 'Saludable' : 
                       stats.systemHealth === 'warning' ? 'Advertencia' : 'Crítico'}
                color={getSystemHealthColor(stats.systemHealth)}
                size="small"
              />
            }
          >
            <Box>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Estado general del sistema LPDP
              </Typography>
              <Box mt={2}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box textAlign="center">
                      <Typography variant="h6" color="success.main">
                        {systemMetrics.databaseStatus === 'online' ? 'Online' : 'Offline'}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Base de Datos
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box textAlign="center">
                      <Typography variant="h6" color="success.main">
                        {systemMetrics.apiStatus === 'online' ? 'Online' : 'Offline'}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        API
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </MetricCard>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <MetricCard title="Alertas del Sistema">
            {stats.alerts.length > 0 ? (
              <List dense>
                {stats.alerts.slice(0, 5).map((alert, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      {alert.severity === 'high' ? <ErrorIcon color="error" /> :
                       alert.severity === 'medium' ? <WarningIcon color="warning" /> :
                       <CheckCircleIcon color="success" />}
                    </ListItemIcon>
                    <ListItemText
                      primary={alert.message}
                      secondary={new Date(alert.timestamp).toLocaleString('es-CL')}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box textAlign="center" py={2}>
                <CheckCircleIcon color="success" sx={{ fontSize: 48 }} />
                <Typography variant="body2" color="textSecondary">
                  No hay alertas activas
                </Typography>
              </Box>
            )}
          </MetricCard>
        </Grid>
      </Grid>

      {/* Empresas recientes y actividad */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <MetricCard 
            title="Empresas Recientes"
            actions={
              <Button size="small" startIcon={<ViewIcon />}>
                Ver Todas
              </Button>
            }
          >
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Empresa</TableCell>
                    <TableCell>Plan</TableCell>
                    <TableCell>Usuarios</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Creada</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentTenants.map((tenant) => (
                    <TableRow key={tenant.id}>
                      <TableCell>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {tenant.company_name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {tenant.industry || 'Sin industria especificada'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={tenant.subscription_plan} 
                          size="small" 
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        {tenant.user_count || 0} / {tenant.max_users}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={tenant.is_active ? 'Activa' : 'Inactiva'}
                          color={tenant.is_active ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {tenant.created_at 
                          ? new Date(tenant.created_at).toLocaleDateString('es-CL')
                          : 'N/A'
                        }
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </MetricCard>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <MetricCard title="Actividad Reciente">
            {stats.recentActivity.length > 0 ? (
              <List dense>
                {stats.recentActivity.slice(0, 8).map((activity, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemIcon>
                        {activity.type === 'user_created' ? <PeopleIcon color="primary" /> :
                         activity.type === 'tenant_created' ? <BusinessIcon color="secondary" /> :
                         activity.type === 'login' ? <SecurityIcon color="info" /> :
                         <TrendingUpIcon color="success" />}
                      </ListItemIcon>
                      <ListItemText
                        primary={activity.description}
                        secondary={new Date(activity.timestamp).toLocaleString('es-CL')}
                      />
                    </ListItem>
                    {index < stats.recentActivity.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box textAlign="center" py={2}>
                <TrendingUpIcon color="action" sx={{ fontSize: 48 }} />
                <Typography variant="body2" color="textSecondary">
                  No hay actividad reciente
                </Typography>
              </Box>
            )}
          </MetricCard>
        </Grid>
      </Grid>

      {/* Métricas de rendimiento */}
      <Grid container spacing={3} mt={2}>
        <Grid item xs={12}>
          <MetricCard title="Métricas de Rendimiento">
            <Grid container spacing={3}>
              <Grid item xs={12} md={3}>
                <Box textAlign="center">
                  <Typography variant="h4" color="primary.main">
                    {systemMetrics.responseTime || '0'}ms
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Tiempo de Respuesta Promedio
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box textAlign="center">
                  <Typography variant="h4" color="secondary.main">
                    {systemMetrics.uptime || '99.9'}%
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Tiempo de Actividad
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box textAlign="center">
                  <Typography variant="h4" color="success.main">
                    {systemMetrics.activeConnections || '0'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Conexiones Activas
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box textAlign="center">
                  <Typography variant="h4" color="info.main">
                    {systemMetrics.storageUsed || '0'}GB
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Almacenamiento Usado
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </MetricCard>
        </Grid>
      </Grid>

      {/* Información adicional */}
      <Box mt={4}>
        <Alert severity="info" icon={<InfoIcon />}>
          <Typography variant="body2">
            <strong>Nota:</strong> Este dashboard se actualiza automáticamente cada 5 minutos. 
            Los datos mostrados reflejan el estado actual del sistema LPDP.
          </Typography>
        </Alert>
      </Box>
    </Box>
  );
}

export default AdminDashboard;
