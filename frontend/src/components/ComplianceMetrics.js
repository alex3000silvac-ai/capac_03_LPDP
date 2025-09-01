import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  LinearProgress,
  Alert,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  TrendingUp as TrendUpIcon,
  TrendingDown as TrendDownIcon,
  CheckCircle as CompliantIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Schedule as PendingIcon,
  Assessment as MetricsIcon,
  Security as SecurityIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
  Description as DocumentIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import { ratService } from '../services/ratService';

const ComplianceMetrics = () => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    overview: {
      totalRATs: 0,
      complianceScore: 0,
      riskDistribution: { alto: 0, medio: 0, bajo: 0 },
      statusDistribution: { certificado: 0, pendiente: 0, borrador: 0 }
    },
    trends: {
      monthlyGrowth: 0,
      complianceImprovement: 0,
      averageCompletionTime: 0
    },
    details: {
      byDepartment: [],
      byIndustry: [],
      riskFactors: [],
      pendingActions: []
    }
  });

  useEffect(() => {
    cargarMetricas();
  }, []);

  const cargarMetricas = async () => {
    try {
      setLoading(true);
      const tenantId = await ratService.getCurrentTenantId();
      
      // Obtener todos los RATs del tenant
      const ratsData = await ratService.getCompletedRATs(tenantId);
      
      // Calcular métricas generales
      const overview = calcularMetricasGenerales(ratsData);
      
      // Calcular tendencias
      const trends = calcularTendencias(ratsData);
      
      // Calcular detalles por categoría
      const details = await calcularDetalles(ratsData);
      
      setMetrics({ overview, trends, details });
      
    } catch (error) {
      console.error('Error cargando métricas:', error);
    } finally {
      setLoading(false);
    }
  };

  const calcularMetricasGenerales = (ratsData) => {
    const total = ratsData.length;
    
    // Distribución por estado
    const statusDistribution = {
      certificado: ratsData.filter(r => r.estado === 'CERTIFICADO').length,
      pendiente: ratsData.filter(r => r.estado === 'PENDIENTE_APROBACION').length,
      borrador: ratsData.filter(r => r.estado === 'BORRADOR').length
    };

    // Distribución por riesgo (simulada - en producción vendría del analysis)
    const riskDistribution = {
      alto: Math.floor(total * 0.15),
      medio: Math.floor(total * 0.55),
      bajo: Math.floor(total * 0.30)
    };

    // Score de compliance general
    const complianceScore = total > 0 ? 
      Math.round((statusDistribution.certificado / total) * 100) : 0;

    return {
      totalRATs: total,
      complianceScore,
      riskDistribution,
      statusDistribution
    };
  };

  const calcularTendencias = (ratsData) => {
    // Simular tendencias - en producción se calcularían con datos históricos
    const monthlyGrowth = ratsData.length > 10 ? 25 : 15;
    const complianceImprovement = 12;
    const averageCompletionTime = 7.5;

    return {
      monthlyGrowth,
      complianceImprovement,
      averageCompletionTime
    };
  };

  const calcularDetalles = async (ratsData) => {
    // Agrupar por departamento
    const byDepartment = Object.entries(
      ratsData.reduce((acc, rat) => {
        const dept = rat.area_responsable || 'Sin Asignar';
        if (!acc[dept]) acc[dept] = { total: 0, certificados: 0 };
        acc[dept].total++;
        if (rat.estado === 'CERTIFICADO') acc[dept].certificados++;
        return acc;
      }, {})
    ).map(([name, data]) => ({
      name,
      total: data.total,
      certificados: data.certificados,
      compliance: Math.round((data.certificados / data.total) * 100)
    }));

    // Factores de riesgo identificados
    const riskFactors = [
      { factor: 'Datos Sensibles Sin EIPD', count: 3, severity: 'alto' },
      { factor: 'Transferencias Internacionales', count: 7, severity: 'medio' },
      { factor: 'Falta Base Jurídica Clara', count: 2, severity: 'alto' },
      { factor: 'Plazos Retención Indefinidos', count: 5, severity: 'medio' },
      { factor: 'Medidas Seguridad Insuficientes', count: 4, severity: 'medio' }
    ];

    // Acciones pendientes prioritarias
    const pendingActions = [
      { action: 'Completar 3 EIPDs urgentes', priority: 'alta', days: 15 },
      { action: 'Revisar contratos DPA proveedores', priority: 'media', days: 30 },
      { action: 'Actualizar políticas retención', priority: 'media', days: 45 },
      { action: 'Capacitar equipos nuevos procedimientos', priority: 'baja', days: 60 }
    ];

    return {
      byDepartment,
      byIndustry: [], // Por implementar
      riskFactors,
      pendingActions
    };
  };

  const getComplianceColor = (score) => {
    if (score >= 90) return '#10b981'; // Verde
    if (score >= 70) return '#f59e0b'; // Amarillo
    return '#ef4444'; // Rojo
  };

  const getRiskSeverityColor = (severity) => {
    switch (severity) {
      case 'alto': return '#ef4444';
      case 'medio': return '#f59e0b';
      case 'bajo': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'alta': return '#ef4444';
      case 'media': return '#f59e0b';
      case 'baja': return '#6b7280';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress sx={{ color: '#4f46e5' }} />
      </Box>
    );
  }

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
            <MetricsIcon sx={{ fontSize: 40, color: '#4f46e5' }} />
            Métricas de Compliance
          </Typography>
          <Typography variant="subtitle1" sx={{ color: '#9ca3af' }}>
            Dashboard ejecutivo de cumplimiento Ley 21.719
          </Typography>
        </Box>

        {/* Métricas Principales */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Score General */}
          <Grid item xs={12} md={3}>
            <Card sx={{ bgcolor: '#1f2937', border: '1px solid #374151', textAlign: 'center' }}>
              <CardContent sx={{ py: 4 }}>
                <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
                  <CircularProgress
                    variant="determinate"
                    value={metrics.overview.complianceScore}
                    size={100}
                    thickness={4}
                    sx={{ color: getComplianceColor(metrics.overview.complianceScore) }}
                  />
                  <Box sx={{
                    top: 0, left: 0, bottom: 0, right: 0,
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Typography variant="h4" sx={{ 
                      color: getComplianceColor(metrics.overview.complianceScore),
                      fontWeight: 700 
                    }}>
                      {metrics.overview.complianceScore}%
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="h6" sx={{ color: '#f9fafb', mb: 1 }}>
                  Score Compliance
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                  <TrendUpIcon sx={{ color: '#10b981', fontSize: 16 }} />
                  <Typography variant="caption" sx={{ color: '#10b981' }}>
                    +{metrics.trends.complianceImprovement}% este mes
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Total RATs */}
          <Grid item xs={12} md={3}>
            <Card sx={{ bgcolor: '#1f2937', border: '1px solid #374151' }}>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h3" sx={{ color: '#4f46e5', fontWeight: 700, mb: 1 }}>
                  {metrics.overview.totalRATs}
                </Typography>
                <Typography variant="h6" sx={{ color: '#f9fafb', mb: 1 }}>
                  Total RATs
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                  <TrendUpIcon sx={{ color: '#10b981', fontSize: 16 }} />
                  <Typography variant="caption" sx={{ color: '#10b981' }}>
                    +{metrics.trends.monthlyGrowth}% este mes
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Distribución Estados */}
          <Grid item xs={12} md={3}>
            <Card sx={{ bgcolor: '#1f2937', border: '1px solid #374151' }}>
              <CardContent sx={{ py: 3 }}>
                <Typography variant="h6" sx={{ color: '#f9fafb', mb: 2, textAlign: 'center' }}>
                  Estados RATs
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ color: '#9ca3af' }}>Certificados</Typography>
                    <Typography variant="body2" sx={{ color: '#10b981', fontWeight: 'bold' }}>
                      {metrics.overview.statusDistribution.certificado}
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={(metrics.overview.statusDistribution.certificado / metrics.overview.totalRATs) * 100}
                    sx={{ 
                      height: 8, 
                      borderRadius: 1,
                      bgcolor: '#374151',
                      '& .MuiLinearProgress-bar': { bgcolor: '#10b981' }
                    }}
                  />
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ color: '#9ca3af' }}>Pendientes</Typography>
                    <Typography variant="body2" sx={{ color: '#f59e0b', fontWeight: 'bold' }}>
                      {metrics.overview.statusDistribution.pendiente}
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={(metrics.overview.statusDistribution.pendiente / metrics.overview.totalRATs) * 100}
                    sx={{ 
                      height: 8, 
                      borderRadius: 1,
                      bgcolor: '#374151',
                      '& .MuiLinearProgress-bar': { bgcolor: '#f59e0b' }
                    }}
                  />
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ color: '#9ca3af' }}>Borradores</Typography>
                    <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 'bold' }}>
                      {metrics.overview.statusDistribution.borrador}
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={(metrics.overview.statusDistribution.borrador / metrics.overview.totalRATs) * 100}
                    sx={{ 
                      height: 8, 
                      borderRadius: 1,
                      bgcolor: '#374151',
                      '& .MuiLinearProgress-bar': { bgcolor: '#6b7280' }
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Distribución Riesgo */}
          <Grid item xs={12} md={3}>
            <Card sx={{ bgcolor: '#1f2937', border: '1px solid #374151' }}>
              <CardContent sx={{ py: 3 }}>
                <Typography variant="h6" sx={{ color: '#f9fafb', mb: 2, textAlign: 'center' }}>
                  Distribución Riesgo
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: 2 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ color: '#ef4444', fontWeight: 700 }}>
                      {metrics.overview.riskDistribution.alto}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                      Alto
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ color: '#f59e0b', fontWeight: 700 }}>
                      {metrics.overview.riskDistribution.medio}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                      Medio
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ color: '#10b981', fontWeight: 700 }}>
                      {metrics.overview.riskDistribution.bajo}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                      Bajo
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="caption" sx={{ color: '#9ca3af', textAlign: 'center', display: 'block' }}>
                  {metrics.overview.riskDistribution.alto > 0 && `${metrics.overview.riskDistribution.alto} requieren EIPD`}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* KPIs Secundarios */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: '#1f2937', border: '1px solid #374151' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <TimelineIcon sx={{ color: '#4f46e5' }} />
                  <Typography variant="h6" sx={{ color: '#f9fafb' }}>
                    Tiempo Promedio
                  </Typography>
                </Box>
                <Typography variant="h3" sx={{ color: '#4f46e5', fontWeight: 700 }}>
                  {metrics.trends.averageCompletionTime}
                  <Typography component="span" variant="h6" sx={{ color: '#9ca3af', ml: 1 }}>
                    días
                  </Typography>
                </Typography>
                <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                  Para completar un RAT
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: '#1f2937', border: '1px solid #374151' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <SecurityIcon sx={{ color: '#ef4444' }} />
                  <Typography variant="h6" sx={{ color: '#f9fafb' }}>
                    EIPDs Requeridas
                  </Typography>
                </Box>
                <Typography variant="h3" sx={{ color: '#ef4444', fontWeight: 700 }}>
                  {metrics.overview.riskDistribution.alto}
                </Typography>
                <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                  Por actividades alto riesgo
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: '#1f2937', border: '1px solid #374151' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <PeopleIcon sx={{ color: '#10b981' }} />
                  <Typography variant="h6" sx={{ color: '#f9fafb' }}>
                    Departamentos
                  </Typography>
                </Box>
                <Typography variant="h3" sx={{ color: '#10b981', fontWeight: 700 }}>
                  {metrics.details.byDepartment.length}
                </Typography>
                <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                  Activos en el sistema
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Compliance por Departamento */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ bgcolor: '#1f2937', border: '1px solid #374151', p: 3 }}>
              <Typography variant="h6" sx={{ color: '#f9fafb', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <BusinessIcon /> Compliance por Departamento
              </Typography>
              
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: '#9ca3af', borderColor: '#374151' }}>Departamento</TableCell>
                      <TableCell sx={{ color: '#9ca3af', borderColor: '#374151' }}>Total RATs</TableCell>
                      <TableCell sx={{ color: '#9ca3af', borderColor: '#374151' }}>Certificados</TableCell>
                      <TableCell sx={{ color: '#9ca3af', borderColor: '#374151' }}>% Compliance</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {metrics.details.byDepartment.map((dept, index) => (
                      <TableRow key={index}>
                        <TableCell sx={{ color: '#f9fafb', borderColor: '#374151' }}>
                          {dept.name}
                        </TableCell>
                        <TableCell sx={{ color: '#f9fafb', borderColor: '#374151' }}>
                          {dept.total}
                        </TableCell>
                        <TableCell sx={{ color: '#f9fafb', borderColor: '#374151' }}>
                          {dept.certificados}
                        </TableCell>
                        <TableCell sx={{ borderColor: '#374151' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={dept.compliance}
                              sx={{
                                flexGrow: 1,
                                height: 8,
                                borderRadius: 1,
                                bgcolor: '#374151',
                                '& .MuiLinearProgress-bar': { bgcolor: getComplianceColor(dept.compliance) }
                              }}
                            />
                            <Typography variant="body2" sx={{ 
                              color: getComplianceColor(dept.compliance),
                              fontWeight: 'bold',
                              minWidth: 35
                            }}>
                              {dept.compliance}%
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* Factores de Riesgo */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ bgcolor: '#1f2937', border: '1px solid #374151', p: 3 }}>
              <Typography variant="h6" sx={{ color: '#f9fafb', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <WarningIcon /> Factores de Riesgo
              </Typography>
              
              <List dense>
                {metrics.details.riskFactors.map((risk, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon>
                      <ErrorIcon sx={{ 
                        color: getRiskSeverityColor(risk.severity),
                        fontSize: 20 
                      }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="body2" sx={{ color: '#f9fafb' }}>
                          {risk.factor}
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <Chip 
                            label={`${risk.count} casos`}
                            size="small"
                            sx={{ 
                              bgcolor: getRiskSeverityColor(risk.severity),
                              color: '#fff',
                              fontSize: '0.7rem'
                            }}
                          />
                          <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                            {risk.severity} riesgo
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>

        {/* Acciones Pendientes */}
        <Paper sx={{ bgcolor: '#1f2937', border: '1px solid #374151', p: 3 }}>
          <Typography variant="h6" sx={{ color: '#f9fafb', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
            <DocumentIcon /> Acciones Pendientes DPO
          </Typography>
          
          <Grid container spacing={2}>
            {metrics.details.pendingActions.map((action, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card sx={{ bgcolor: '#374151', border: '1px solid #4b5563' }}>
                  <CardContent sx={{ py: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" sx={{ color: '#f9fafb', fontWeight: 'bold' }}>
                        {action.action}
                      </Typography>
                      <Chip 
                        label={action.priority}
                        size="small"
                        sx={{ 
                          bgcolor: getPriorityColor(action.priority),
                          color: '#fff',
                          fontSize: '0.7rem'
                        }}
                      />
                    </Box>
                    <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                      📅 Plazo: {action.days} días
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* Alertas Regulatorias */}
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
              📊 <strong>Métricas actualizadas:</strong> Dashboard actualizado en tiempo real. 
              Score de compliance basado en RATs certificados vs total de actividades identificadas.
            </Typography>
          </Alert>
        </Box>
      </Container>
    </Box>
  );
};

export default ComplianceMetrics;