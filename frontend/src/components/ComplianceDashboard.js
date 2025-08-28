/**
 * DASHBOARD DE CUMPLIMIENTO INTELIGENTE
 * Componente que muestra el estado de cumplimiento basado en evaluaciones automáticas
 * Se integra como widget opcional sin modificar flujos existentes
 */

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
  Collapse,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Badge,
  Tooltip
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  TrendingUp as TrendingUpIcon,
  Security as SecurityIcon,
  Assignment as AssignmentIcon,
  Business as BusinessIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon
} from '@mui/icons-material';

import { useComplianceDashboard } from '../hooks/useComplianceIntegration.js';

const ComplianceDashboard = ({ compact = false, ratId = null }) => {
  const {
    dashboard,
    loading,
    alerts,
    hasAlerts,
    refresh,
    totalActivities,
    highRiskCount,
    averageScore,
    requiredEIPDs,
    requiredDPAs,
    isHealthy,
    needsAttention,
    hasUpcomingActions
  } = useComplianceDashboard();

  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    alerts: hasAlerts,
    actions: hasUpcomingActions
  });

  // Auto-refresh cada 5 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      refresh();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [refresh]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const getHealthIcon = () => {
    if (loading) return <CircularProgress size={24} />;
    if (isHealthy) return <CheckIcon color="success" />;
    if (needsAttention) return <WarningIcon color="warning" />;
    return <ErrorIcon color="error" />;
  };

  if (compact) {
    return (
      <CompactDashboard 
        averageScore={averageScore}
        highRiskCount={highRiskCount}
        hasAlerts={hasAlerts}
        loading={loading}
        onExpand={() => setExpandedSections(prev => ({ ...prev, overview: true }))}
      />
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <SecurityIcon color="primary" sx={{ fontSize: '2rem' }} />
          <Typography variant="h4" fontWeight={600}>
            Dashboard de Cumplimiento LPDP
          </Typography>
          {getHealthIcon()}
        </Box>
        
        <Box display="flex" gap={2}>
          <Tooltip title="Actualizar datos">
            <IconButton onClick={refresh} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          
          <Chip 
            label={`Score: ${averageScore}%`}
            color={getScoreColor(averageScore)}
            variant="filled"
            sx={{ fontWeight: 600 }}
          />
        </Box>
      </Box>

      {/* Resumen Principal */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={3}>
          <MetricCard
            title="Actividades RAT"
            value={totalActivities}
            subtitle="Total registradas"
            icon={<AssignmentIcon />}
            color="primary"
          />
        </Grid>
        
        <Grid item xs={12} md={3}>
          <MetricCard
            title="Alto Riesgo"
            value={highRiskCount}
            subtitle="Requieren atención"
            icon={<WarningIcon />}
            color="warning"
            alert={highRiskCount > 0}
          />
        </Grid>
        
        <Grid item xs={12} md={3}>
          <MetricCard
            title="EIPDs Requeridas"
            value={requiredEIPDs}
            subtitle="Por completar"
            icon={<SecurityIcon />}
            color="info"
            alert={requiredEIPDs > 0}
          />
        </Grid>
        
        <Grid item xs={12} md={3}>
          <MetricCard
            title="DPAs Requeridos"
            value={requiredDPAs}
            subtitle="Proveedores pendientes"
            icon={<BusinessIcon />}
            color="secondary"
            alert={requiredDPAs > 0}
          />
        </Grid>
      </Grid>

      {/* Score de Cumplimiento */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" justify="space-between" mb={2}>
            <Typography variant="h6" fontWeight={600}>
              Índice de Cumplimiento General
            </Typography>
            <Typography variant="h4" color={`${getScoreColor(averageScore)}.main`} fontWeight={700}>
              {averageScore}%
            </Typography>
          </Box>
          
          <LinearProgress
            variant="determinate"
            value={averageScore}
            color={getScoreColor(averageScore)}
            sx={{ height: 8, borderRadius: 4, mb: 2 }}
          />
          
          <Typography variant="body2" color="text.secondary">
            Basado en evaluación automática de {totalActivities} actividades RAT
          </Typography>
        </CardContent>
      </Card>

      {/* Alertas Críticas */}
      {hasAlerts && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box 
              display="flex" 
              justifyContent="space-between" 
              alignItems="center"
              onClick={() => toggleSection('alerts')}
              sx={{ cursor: 'pointer' }}
            >
              <Box display="flex" alignItems="center" gap={1}>
                <ErrorIcon color="error" />
                <Typography variant="h6" fontWeight={600}>
                  Alertas Críticas
                </Typography>
                <Chip label={alerts.length} color="error" size="small" />
              </Box>
              {expandedSections.alerts ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </Box>
            
            <Collapse in={expandedSections.alerts}>
              <List sx={{ mt: 2 }}>
                {alerts.slice(0, 5).map((alert, index) => (
                  <ListItem key={index} divider={index < 4}>
                    <ListItemIcon>
                      <ErrorIcon color="error" />
                    </ListItemIcon>
                    <ListItemText
                      primary={alert.message}
                      secondary={alert.action}
                    />
                  </ListItem>
                ))}
              </List>
              
              {alerts.length > 5 && (
                <Button variant="text" color="primary" sx={{ mt: 1 }}>
                  Ver todas las alertas ({alerts.length})
                </Button>
              )}
            </Collapse>
          </CardContent>
        </Card>
      )}

      {/* Próximas Acciones */}
      {dashboard?.proximas_acciones && dashboard.proximas_acciones.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box 
              display="flex" 
              justifyContent="space-between" 
              alignItems="center"
              onClick={() => toggleSection('actions')}
              sx={{ cursor: 'pointer' }}
            >
              <Box display="flex" alignItems="center" gap={1}>
                <AssessmentIcon color="primary" />
                <Typography variant="h6" fontWeight={600}>
                  Próximas Acciones
                </Typography>
                <Chip label={dashboard.proximas_acciones.length} color="primary" size="small" />
              </Box>
              {expandedSections.actions ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </Box>
            
            <Collapse in={expandedSections.actions}>
              <List sx={{ mt: 2 }}>
                {dashboard.proximas_acciones.slice(0, 10).map((action, index) => (
                  <ListItem key={index} divider={index < 9}>
                    <ListItemIcon>
                      {action.priority === 'critical' ? (
                        <ErrorIcon color="error" />
                      ) : action.priority === 'high' ? (
                        <WarningIcon color="warning" />
                      ) : (
                        <InfoIcon color="info" />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={action.action}
                      secondary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Chip 
                            label={action.type} 
                            size="small" 
                            variant="outlined"
                          />
                          <Typography variant="caption">
                            Prioridad: {action.priority}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Collapse>
          </CardContent>
        </Card>
      )}

      {/* Tendencias */}
      {dashboard?.tendencias && (
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={600} mb={2}>
              Tendencias de Cumplimiento
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Box display="flex" alignItems="center" gap={2}>
                  <TrendingUpIcon color="success" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Mejora General
                    </Typography>
                    <Typography variant="h6" color="success.main">
                      +{dashboard.tendencias.mejora_cumplimiento?.percentage || 0}%
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Box display="flex" alignItems="center" gap={2}>
                  <WarningIcon color="warning" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Nuevos Riesgos
                    </Typography>
                    <Typography variant="h6">
                      {dashboard.tendencias.nuevos_riesgos?.length || 0}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Box display="flex" alignItems="center" gap={2}>
                  <ErrorIcon color="error" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Docs. Vencidos
                    </Typography>
                    <Typography variant="h6" color="error.main">
                      {dashboard.tendencias.documentos_vencidos?.length || 0}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Estado de Carga */}
      {loading && (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
};

// Componente para tarjetas métricas
const MetricCard = ({ title, value, subtitle, icon, color, alert = false }) => (
  <Card sx={{ 
    height: '100%',
    ...(alert && {
      border: '2px solid',
      borderColor: 'warning.main',
      boxShadow: '0 4px 20px rgba(255, 152, 0, 0.2)'
    })
  }}>
    <CardContent>
      <Box display="flex" justifyContent="between" alignItems="flex-start" mb={2}>
        <Box sx={{ color: `${color}.main` }}>
          {icon}
        </Box>
        {alert && (
          <Badge badgeContent="!" color="error">
            <Box />
          </Badge>
        )}
      </Box>
      
      <Typography variant="h3" fontWeight={700} color={`${color}.main`} mb={1}>
        {value || 0}
      </Typography>
      
      <Typography variant="h6" fontWeight={600} mb={0.5}>
        {title}
      </Typography>
      
      <Typography variant="body2" color="text.secondary">
        {subtitle}
      </Typography>
    </CardContent>
  </Card>
);

// Versión compacta para sidebars
const CompactDashboard = ({ averageScore, highRiskCount, hasAlerts, loading, onExpand }) => (
  <Card sx={{ m: 2 }}>
    <CardContent sx={{ p: 2 }}>
      <Box display="flex" justifyContent="between" alignItems="center" mb={2}>
        <Typography variant="subtitle1" fontWeight={600}>
          Estado LPDP
        </Typography>
        {loading ? <CircularProgress size={16} /> : (
          <Chip 
            label={`${averageScore}%`}
            color={averageScore >= 80 ? 'success' : averageScore >= 60 ? 'warning' : 'error'}
            size="small"
          />
        )}
      </Box>
      
      {hasAlerts && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {highRiskCount} actividades de alto riesgo
        </Alert>
      )}
      
      <Button 
        variant="outlined" 
        size="small" 
        fullWidth
        onClick={onExpand}
        startIcon={<AssessmentIcon />}
      >
        Ver Dashboard Completo
      </Button>
    </CardContent>
  </Card>
);

export default ComplianceDashboard;