import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Alert,
  Button,
  CircularProgress,
  LinearProgress,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Badge,
  Tooltip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  SmartToy as AIIcon,
  Security as SecurityIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  Assignment as TaskIcon,
  Visibility as ViewIcon,
  Psychology as BrainIcon,
  AutoFixHigh as AutoFixIcon,
  Shield as ShieldIcon,
  Analytics as AnalyticsIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';

import aiSupervisor from '../../utils/aiSupervisor';
import aiSystemValidator from '../../utils/aiSystemValidator';
import supabase from '../../config/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';

const AISupervisorDashboard = () => {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState({
    totalSupervisions: 0,
    approvalRate: 0,
    averageQuality: 0,
    topInterventions: {},
    trends: []
  });
  const [validationReport, setValidationReport] = useState(null);
  const [supervisorStatus, setSupervisorStatus] = useState({ active: false });
  const [validatorStatus, setValidatorStatus] = useState({ enabled: false });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [dashboardData, validationData, supervisorData, validatorData] = await Promise.all([
        aiSupervisor.getSupervisionDashboard(user.tenant_id),
        aiSystemValidator.getValidationReport(7),
        aiSupervisor.initialize(),
        aiSystemValidator.initialize()
      ]);

      setDashboard(dashboardData);
      setValidationReport(validationData);
      setSupervisorStatus(supervisorData);
      setValidatorStatus(validatorData);

      await loadRecentActivity();
    } catch (error) {
      console.error('Error cargando dashboard AI');
    } finally {
      setLoading(false);
    }
  };

  const loadRecentActivity = async () => {
    try {
      const { data: activity, error } = await supabase
        .from('ai_supervision_log')
        .select('*')
        .eq('tenant_id', user.tenant_id)
        .order('timestamp', { ascending: false })
        .limit(10);

      if (!error) {
        setRecentActivity(activity);
      }
    } catch (error) {
      console.error('Error cargando actividad reciente');
    }
  };

  const toggleSupervisor = async () => {
    try {
      if (supervisorStatus.active) {
        const result = await aiSupervisor.disableSupervisor?.(user.id) || 
                      { success: true, message: 'Supervisor desactivado' };
        if (result.success) {
          setSupervisorStatus({ active: false });
        }
      } else {
        const result = await aiSupervisor.enableAISupervisor(user.id);
        if (result.success) {
          setSupervisorStatus({ active: true });
        }
      }
    } catch (error) {
      console.error('Error toggling supervisor');
    }
  };

  const toggleValidator = async () => {
    try {
      if (validatorStatus.enabled) {
        const result = await aiSystemValidator.disableValidation(user.id);
        if (result.success) {
          setValidatorStatus({ enabled: false });
        }
      } else {
        const result = await aiSystemValidator.enableValidation(user.id);
        if (result.success) {
          setValidatorStatus({ enabled: true });
        }
      }
    } catch (error) {
      console.error('Error toggling validator');
    }
  };

  const StatCard = ({ title, value, subtitle, icon, color = 'primary', progress, alert = false }) => (
    <Card sx={{ 
      height: '100%',
      ...(alert && {
        border: '2px solid',
        borderColor: 'warning.main',
        boxShadow: '0 4px 20px rgba(255, 152, 0, 0.2)'
      })
    }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="h6">
              {title}
            </Typography>
            <Typography variant="h4" component="h2" color={`${color}.main`}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="textSecondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box color={`${color}.main`}>
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

  const getQualityColor = (score) => {
    if (score >= 90) return 'success';
    if (score >= 70) return 'warning';
    return 'error';
  };

  const getApprovalColor = (rate) => {
    if (rate >= 95) return 'success';
    if (rate >= 80) return 'warning';
    return 'error';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <BrainIcon color="primary" sx={{ fontSize: '2.5rem' }} />
          <Typography variant="h4" component="h1" fontWeight={600}>
            Dashboard AI Supervisor
          </Typography>
          <Chip 
            label="La Garantía de la Garantía" 
            color="primary" 
            variant="filled"
            sx={{ fontWeight: 600 }}
          />
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadDashboardData}
            disabled={loading}
          >
            Actualizar
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Control de Sistemas AI
              </Typography>
              
              <Box display="flex" flexDirection="column" gap={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={supervisorStatus.active}
                      onChange={toggleSupervisor}
                      color="primary"
                    />
                  }
                  label={
                    <Box display="flex" alignItems="center" gap={1}>
                      <AIIcon color={supervisorStatus.active ? 'primary' : 'disabled'} />
                      <Typography>
                        AI Supervisor {supervisorStatus.active ? 'Activo' : 'Inactivo'}
                      </Typography>
                    </Box>
                  }
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={validatorStatus.enabled}
                      onChange={toggleValidator}
                      color="secondary"
                    />
                  }
                  label={
                    <Box display="flex" alignItems="center" gap={1}>
                      <ShieldIcon color={validatorStatus.enabled ? 'secondary' : 'disabled'} />
                      <Typography>
                        AI Validator {validatorStatus.enabled ? 'Habilitado' : 'Deshabilitado'}
                      </Typography>
                    </Box>
                  }
                />
              </Box>

              {(supervisorStatus.active || validatorStatus.enabled) && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  Sistema bajo supervisión inteligente activa
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Estado en Tiempo Real
              </Typography>
              
              <Box display="flex" flexDirection="column" gap={2}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2">Supervisiones Hoy:</Typography>
                  <Chip 
                    label={dashboard.totalSupervisions || 0} 
                    color="primary" 
                    size="small" 
                  />
                </Box>
                
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2">Validaciones:</Typography>
                  <Chip 
                    label={validationReport?.totalValidations || 0} 
                    color="secondary" 
                    size="small" 
                  />
                </Box>
                
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2">Última Actividad:</Typography>
                  <Typography variant="caption" color="textSecondary">
                    {recentActivity[0] ? 
                      new Date(recentActivity[0].timestamp).toLocaleTimeString('es-CL') : 
                      'Sin actividad'
                    }
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Supervisiones"
            value={dashboard.totalSupervisions}
            subtitle="Total realizadas"
            icon={<AIIcon fontSize="large" />}
            color="primary"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Tasa Aprobación"
            value={`${dashboard.approvalRate}%`}
            subtitle="RATs aprobados"
            icon={<CheckIcon fontSize="large" />}
            color={getApprovalColor(dashboard.approvalRate)}
            progress={dashboard.approvalRate}
            alert={dashboard.approvalRate < 80}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Calidad Promedio"
            value={`${dashboard.averageQuality}%`}
            subtitle="Score de calidad"
            icon={<AnalyticsIcon fontSize="large" />}
            color={getQualityColor(dashboard.averageQuality)}
            progress={dashboard.averageQuality}
            alert={dashboard.averageQuality < 70}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Issues Críticos"
            value={validationReport?.criticalIssues || 0}
            subtitle="Detectados por AI"
            icon={<ErrorIcon fontSize="large" />}
            color="error"
            alert={validationReport?.criticalIssues > 0}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={3}>
                Intervenciones Más Frecuentes
              </Typography>
              
              {Object.keys(dashboard.topInterventions).length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Tipo de Intervención</TableCell>
                        <TableCell align="center">Frecuencia</TableCell>
                        <TableCell align="center">Impacto</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(dashboard.topInterventions).map(([type, count]) => (
                        <TableRow key={type}>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={2}>
                              {type.includes('duplicate') ? <WarningIcon color="warning" /> :
                               type.includes('business_logic') ? <ErrorIcon color="error" /> :
                               type.includes('dpo_tasks') ? <TaskIcon color="primary" /> :
                               <SecurityIcon color="info" />}
                              <Box>
                                <Typography variant="subtitle2">
                                  {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  {type.includes('duplicate') ? 'Detección de duplicados' :
                                   type.includes('business_logic') ? 'Validación lógica' :
                                   type.includes('dpo_tasks') ? 'Asignación automática DPO' :
                                   'Validación legal'}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Chip label={count} color="primary" size="small" />
                          </TableCell>
                          <TableCell align="center">
                            {count > 10 ? (
                              <Chip label="Alto" color="error" size="small" />
                            ) : count > 5 ? (
                              <Chip label="Medio" color="warning" size="small" />
                            ) : (
                              <Chip label="Bajo" color="success" size="small" />
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box textAlign="center" py={4}>
                  <CheckIcon color="success" sx={{ fontSize: 48 }} />
                  <Typography variant="body2" color="textSecondary">
                    Sin intervenciones registradas
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={3}>
                Actividad Reciente
              </Typography>
              
              {recentActivity.length > 0 ? (
                <List dense>
                  {recentActivity.slice(0, 6).map((activity, index) => (
                    <ListItem key={index} divider={index < 5}>
                      <ListItemIcon>
                        {activity.approved ? (
                          <CheckIcon color="success" />
                        ) : (
                          <WarningIcon color="warning" />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="body2">
                            {activity.approved ? 'RAT Aprobado' : 'RAT Intervenido'}
                          </Typography>
                        }
                        secondary={
                          <Box>
                            <Typography variant="caption" color="textSecondary">
                              Score: {activity.quality_score}% • {' '}
                              {new Date(activity.timestamp).toLocaleTimeString('es-CL')}
                            </Typography>
                            {activity.interventions?.length > 0 && (
                              <Typography variant="caption" display="block" color="warning.main">
                                {activity.interventions.length} intervención(es)
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box textAlign="center" py={4}>
                  <AIIcon color="action" sx={{ fontSize: 48 }} />
                  <Typography variant="body2" color="textSecondary">
                    Sin supervisiones recientes
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {validationReport && (
        <Grid container spacing={3} mt={2}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} mb={3}>
                  Reporte de Validación AI (Últimos 7 días)
                </Typography>
                
                <Grid container spacing={4}>
                  <Grid item xs={12} md={3}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="primary.main">
                        {validationReport.successRate}%
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Tasa de Éxito
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="secondary.main">
                        {validationReport.averageConfidence}%
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Confianza Promedio
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="warning.main">
                        {validationReport.criticalIssues}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Issues Críticos
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="info.main">
                        {validationReport.totalValidations}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Total Validaciones
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                {Object.keys(validationReport.byOperation).length > 0 && (
                  <Box mt={4}>
                    <Typography variant="subtitle1" fontWeight={600} mb={2}>
                      Validaciones por Operación
                    </Typography>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Operación</TableCell>
                            <TableCell align="center">Total</TableCell>
                            <TableCell align="center">Válidas</TableCell>
                            <TableCell align="center">Tasa Éxito</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {Object.entries(validationReport.byOperation).map(([operation, stats]) => (
                            <TableRow key={operation}>
                              <TableCell>
                                <Typography variant="body2">
                                  {operation.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">{stats.total}</TableCell>
                              <TableCell align="center">{stats.valid}</TableCell>
                              <TableCell align="center">
                                <Chip
                                  label={`${Math.round((stats.valid / stats.total) * 100)}%`}
                                  color={stats.valid / stats.total >= 0.9 ? 'success' : 
                                         stats.valid / stats.total >= 0.7 ? 'warning' : 'error'}
                                  size="small"
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Box mt={4}>
        <Alert 
          severity="info" 
          icon={<BrainIcon />}
          action={
            <Button color="inherit" size="small">
              Ver Documentación
            </Button>
          }
        >
          <Typography variant="body2">
            <strong>AI Supervisor:</strong> Sistema de inteligencia artificial que supervisa todas las operaciones,
            garantiza la calidad de los datos, detecta duplicados inteligentemente y asigna automáticamente 
            tareas DPO cuando es necesario. Este es "la garantía de la garantía" del sistema.
          </Typography>
        </Alert>
      </Box>
    </Box>
  );
};

export default AISupervisorDashboard;