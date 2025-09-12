import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Divider
} from '@mui/material';
import {
  Assessment,
  TrendingUp,
  Group,
  Storage,
  Security,
  Business
} from '@mui/icons-material';
import { supabase } from '../../config/supabaseConfig';

const UsageDashboard = () => {
  const [usageData, setUsageData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadUsageData();
  }, []);

  const loadUsageData = async () => {
    try {
      setLoading(true);
      
      // Obtener datos de uso y límites
      const { data: tenantUsage, error: usageError } = await supabase
        .from('tenant_usage')
        .select('*')
        .order('calculated_at', { ascending: false });

      const { data: tenantLimits, error: limitsError } = await supabase
        .from('tenant_limits')
        .select('*')
        .eq('is_active', true);

      if (usageError || limitsError) {
        throw new Error(usageError?.message || limitsError?.message);
      }

      // Combinar datos de uso y límites
      const combinedData = tenantUsage.map(usage => {
        const limits = tenantLimits.find(l => 
          l.tenant_id === usage.tenant_id || 
          l.tenant_id === `default_${usage.tenant_id.includes('demo') ? 'demo' : 'basic'}`
        ) || {};
        
        return {
          ...usage,
          limits,
          utilization: {
            rats: limits.max_rats_total ? (usage.current_rats_total / limits.max_rats_total) * 100 : 0,
            users: limits.max_users ? (usage.current_users / limits.max_users) * 100 : 0,
            storage: limits.max_storage_mb ? (usage.current_storage_mb / limits.max_storage_mb) * 100 : 0
          }
        };
      });

      setUsageData(combinedData);
      
    } catch (error) {
      console.error('Error cargando datos de uso:', error);
      setError('Error al cargar estadísticas de uso');
    } finally {
      setLoading(false);
    }
  };

  const getUtilizationColor = (percentage) => {
    if (percentage >= 90) return 'error';
    if (percentage >= 75) return 'warning';
    if (percentage >= 50) return 'info';
    return 'success';
  };

  const getUtilizationLabel = (percentage) => {
    if (percentage >= 90) return 'Crítico';
    if (percentage >= 75) return 'Alto';
    if (percentage >= 50) return 'Medio';
    return 'Bajo';
  };

  const getTotalStats = () => {
    const totals = usageData.reduce(
      (acc, tenant) => ({
        totalRATs: acc.totalRATs + (tenant.current_rats_total || 0),
        totalTenants: acc.totalTenants + 1,
        totalUsers: acc.totalUsers + (tenant.current_users || 0),
        totalStorage: acc.totalStorage + (tenant.current_storage_mb || 0)
      }),
      { totalRATs: 0, totalTenants: 0, totalUsers: 0, totalStorage: 0 }
    );
    return totals;
  };

  const stats = getTotalStats();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <Typography>Cargando estadísticas de uso...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        <Assessment sx={{ verticalAlign: 'middle', mr: 1 }} />
        Dashboard de Uso del Sistema
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Monitoreo de límites y uso por tenant • Límites configurados generosamente para excelente UX
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Estadísticas Globales */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Storage color="primary" sx={{ mr: 1 }} />
                <Box>
                  <Typography variant="h4">{stats.totalRATs}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    RATs Totales
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Business color="success" sx={{ mr: 1 }} />
                <Box>
                  <Typography variant="h4">{stats.totalTenants}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Organizaciones
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Group color="info" sx={{ mr: 1 }} />
                <Box>
                  <Typography variant="h4">{stats.totalUsers}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Usuarios Activos
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <TrendingUp color="warning" sx={{ mr: 1 }} />
                <Box>
                  <Typography variant="h4">{Math.round(stats.totalStorage)}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    MB Almacenados
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Tabla de Uso por Tenant */}
      <Typography variant="h5" gutterBottom>
        Uso por Organización
      </Typography>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tenant ID</TableCell>
              <TableCell>Plan</TableCell>
              <TableCell>RATs</TableCell>
              <TableCell>Usuarios</TableCell>
              <TableCell>Almacenamiento</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Última Actividad</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {usageData.map((tenant) => (
              <TableRow key={tenant.tenant_id}>
                <TableCell>
                  <Typography variant="body2" fontFamily="monospace">
                    {tenant.tenant_id}
                  </Typography>
                </TableCell>
                
                <TableCell>
                  <Chip 
                    label={tenant.limits?.plan_type || 'basic'}
                    size="small"
                    color={
                      tenant.limits?.plan_type === 'enterprise' ? 'primary' :
                      tenant.limits?.plan_type === 'premium' ? 'secondary' :
                      tenant.limits?.plan_type === 'demo' ? 'warning' : 'default'
                    }
                  />
                </TableCell>
                
                <TableCell>
                  <Box>
                    <Typography variant="body2">
                      {tenant.current_rats_total || 0} / {tenant.limits?.max_rats_total || '∞'}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(tenant.utilization?.rats || 0, 100)}
                      color={getUtilizationColor(tenant.utilization?.rats || 0)}
                      sx={{ mt: 0.5, height: 4 }}
                    />
                  </Box>
                </TableCell>
                
                <TableCell>
                  <Box>
                    <Typography variant="body2">
                      {tenant.current_users || 0} / {tenant.limits?.max_users || '∞'}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(tenant.utilization?.users || 0, 100)}
                      color={getUtilizationColor(tenant.utilization?.users || 0)}
                      sx={{ mt: 0.5, height: 4 }}
                    />
                  </Box>
                </TableCell>
                
                <TableCell>
                  <Typography variant="body2">
                    {Math.round(tenant.current_storage_mb || 0)} MB
                  </Typography>
                </TableCell>
                
                <TableCell>
                  <Chip
                    label={getUtilizationLabel(Math.max(
                      tenant.utilization?.rats || 0,
                      tenant.utilization?.users || 0
                    ))}
                    size="small"
                    color={getUtilizationColor(Math.max(
                      tenant.utilization?.rats || 0,
                      tenant.utilization?.users || 0
                    ))}
                  />
                </TableCell>
                
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {tenant.calculated_at ? 
                      new Date(tenant.calculated_at).toLocaleString('es-CL') : 
                      'No disponible'
                    }
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {usageData.length === 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          No hay datos de uso disponibles. Los datos se generan automáticamente cuando los usuarios crean RATs.
        </Alert>
      )}
    </Box>
  );
};

export default UsageDashboard;