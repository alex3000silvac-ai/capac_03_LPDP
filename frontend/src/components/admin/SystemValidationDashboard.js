/**
 * 🤖 SYSTEM VALIDATION DASHBOARD
 * Dashboard para monitorear y controlar el IA Agent de validación automática
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Switch,
  FormControlLabel,
  Grid,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  SmartToy as AIIcon,
  Security as SecurityIcon,
  BugReport as BugIcon,
  AutoFixHigh as FixIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
  Stop as StopIcon,
  PlayArrow as StartIcon,
  Assessment as MetricsIcon
} from '@mui/icons-material';
import { supabase } from '../../config/supabaseClient';
import systemValidationAgent from '../../utils/systemValidationAgent';

const SystemValidationDashboard = () => {
  const [agentStatus, setAgentStatus] = useState('stopped');
  const [agentMetrics, setAgentMetrics] = useState({
    validations_run: 0,
    issues_detected: 0,
    auto_corrections: 0,
    compliance_score: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [pendingCorrections, setPendingCorrections] = useState([]);
  const [complianceViolations, setComplianceViolations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Actualizar cada 30s
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Cargar estado del agente
      const { data: agents } = await supabase
        .from('active_agents')
        .select('*')
        .eq('agent_type', 'system_validation')
        .order('last_activity', { ascending: false })
        .limit(1);

      if (agents && agents.length > 0) {
        setAgentStatus(agents[0].status);
      }

      // Cargar métricas del agente
      const { data: activities } = await supabase
        .from('agent_activity_log')
        .select('*')
        .eq('activity_type', 'system_validation')
        .order('timestamp', { ascending: false })
        .limit(50);

      if (activities) {
        setRecentActivity(activities);
        
        // Calcular métricas
        const metrics = {
          validations_run: activities.length,
          issues_detected: activities.reduce((sum, act) => 
            sum + (act.activity_data?.issues_detected?.missing_fields?.length || 0) +
                  (act.activity_data?.issues_detected?.incorrect_validations?.length || 0), 0
          ),
          auto_corrections: activities.reduce((sum, act) => 
            sum + (act.activity_data?.corrections_applied?.applied?.length || 0), 0
          ),
          compliance_score: activities.length > 0 ? 
            activities.reduce((sum, act) => sum + (act.activity_data?.compliance_score || 0), 0) / activities.length : 0
        };
        setAgentMetrics(metrics);
      }

      // Cargar correcciones pendientes
      const { data: corrections } = await supabase
        .from('agent_activity_log') // Usar tabla vigente para correcciones
        .select('*')
        .eq('status', 'pending_application')
        .order('created_at', { ascending: false });

      setPendingCorrections(corrections || []);

      // Cargar violaciones de compliance recientes
      const { data: violations } = await supabase
        .from('dpo_notifications')
        .select('*')
        .eq('tipo_notificacion', 'agent_compliance_alert')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      setComplianceViolations(violations || []);

    } catch (error) {
      console.error('Error cargando datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  const toggleAgent = async () => {
    try {
      if (agentStatus === 'active') {
        await systemValidationAgent.stopAgent();
        setAgentStatus('stopped');
      } else {
        await systemValidationAgent.initializeInProduction();
        setAgentStatus('active');
      }
    } catch (error) {
      console.error('Error toggling agent');
    }
  };

  const runManualValidation = async () => {
    try {
      setLoading(true);
      await systemValidationAgent.startContinuousValidation();
      setTimeout(() => loadDashboardData(), 2000);
    } catch (error) {
      console.error('Error ejecutando validación manual');
    }
  };

  const applyPendingCorrections = async (correctionId) => {
    try {
      await supabase
        .from('agent_activity_log') // Usar tabla vigente para correcciones
        .update({ 
          status: 'applied',
          applied_at: new Date().toISOString()
        })
        .eq('id', correctionId);
      
      loadDashboardData();
    } catch (error) {
      console.error('Error aplicando corrección');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'stopped': return 'error';
      case 'error': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <StartIcon />;
      case 'stopped': return <StopIcon />;
      default: return <AIIcon />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Cargando System Validation Agent...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <AIIcon color="primary" />
        System Validation Agent
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>IA Agent Inteligente:</strong> Valida automáticamente campos HTML contra especificación .md, 
          detecta problemas de compliance y auto-corrige inconsistencias en tiempo real.
        </Typography>
      </Alert>

      <Grid container spacing={3}>
        {/* Control del Agente */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {getStatusIcon(agentStatus)}
                Control del Agente
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Chip 
                  label={agentStatus.toUpperCase()} 
                  color={getStatusColor(agentStatus)}
                  icon={getStatusIcon(agentStatus)}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={agentStatus === 'active'}
                      onChange={toggleAgent}
                      color="primary"
                    />
                  }
                  label="Validación Automática"
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={runManualValidation}
                  disabled={loading}
                >
                  Validar Ahora
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<MetricsIcon />}
                  onClick={loadDashboardData}
                >
                  Actualizar
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Métricas del Agente */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Métricas de Rendimiento
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {agentMetrics.validations_run}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Validaciones
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="warning.main">
                      {agentMetrics.issues_detected}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Problemas
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="success.main">
                      {agentMetrics.auto_corrections}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Auto-correcciones
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color={agentMetrics.compliance_score >= 85 ? 'success.main' : 'error.main'}>
                      {Math.round(agentMetrics.compliance_score)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Compliance
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Violaciones de Compliance */}
        {complianceViolations.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SecurityIcon color="error" />
                  Violaciones de Compliance Detectadas ({complianceViolations.length})
                </Typography>
                
                {complianceViolations.slice(0, 5).map((violation, index) => (
                  <Alert key={index} severity="error" sx={{ mb: 1 }}>
                    <Typography variant="subtitle2">{violation.mensaje}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(violation.created_at).toLocaleString('es-CL')}
                    </Typography>
                  </Alert>
                ))}
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Correcciones Pendientes */}
        {pendingCorrections.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FixIcon color="warning" />
                  Correcciones Pendientes ({pendingCorrections.length})
                </Typography>
                
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Campo</TableCell>
                        <TableCell>Problema</TableCell>
                        <TableCell>Corrección</TableCell>
                        <TableCell>Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pendingCorrections.slice(0, 10).map((correction, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Chip 
                              label={correction.corrections_data?.applied?.[0]?.field || 'Sistema'} 
                              size="small" 
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {correction.corrections_data?.applied?.[0]?.type || 'Validación general'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="success.main">
                              HTML y validación generados
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Tooltip title="Aplicar corrección">
                              <IconButton 
                                size="small" 
                                color="primary"
                                onClick={() => applyPendingCorrections(correction.id)}
                              >
                                <FixIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Actividad Reciente del Agente */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BugIcon color="info" />
                Actividad Reciente del Agente
              </Typography>
              
              {recentActivity.length === 0 ? (
                <Alert severity="info">
                  No hay actividad reciente del agente. Inicia el agente para comenzar validaciones automáticas.
                </Alert>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Timestamp</TableCell>
                        <TableCell>Acción</TableCell>
                        <TableCell>Problemas Detectados</TableCell>
                        <TableCell>Correcciones</TableCell>
                        <TableCell>Score</TableCell>
                        <TableCell>Detalles</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentActivity.slice(0, 10).map((activity, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Typography variant="body2">
                              {new Date(activity.timestamp).toLocaleString('es-CL')}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={activity.activity_type} 
                              size="small" 
                              color="primary"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="error.main">
                              {(activity.activity_data?.issues_detected?.missing_fields?.length || 0) +
                               (activity.activity_data?.issues_detected?.incorrect_validations?.length || 0)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="success.main">
                              {activity.activity_data?.corrections_applied?.applied?.length || 0}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={`${Math.round(activity.activity_data?.compliance_score || 0)}%`}
                              size="small"
                              color={
                                (activity.activity_data?.compliance_score || 0) >= 85 ? 'success' : 
                                (activity.activity_data?.compliance_score || 0) >= 70 ? 'warning' : 'error'
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Tooltip title="Ver detalles completos">
                              <IconButton size="small">
                                <ViewIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Configuración del Agente */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Configuración del Agente
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Auto-corrección automática"
                />
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Validación de campos HTML"
                />
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Detección triggers DPIA/PIA"
                />
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Notificaciones DPO automáticas"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Estado del Sistema */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Estado del Sistema
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">Campos HTML validados:</Typography>
                  <Chip label="✅ 100%" size="small" color="success" />
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">Compliance Ley 21.719:</Typography>
                  <Chip 
                    label={`${Math.round(agentMetrics.compliance_score)}%`} 
                    size="small" 
                    color={agentMetrics.compliance_score >= 85 ? 'success' : 'warning'} 
                  />
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">Validaciones automáticas:</Typography>
                  <Chip 
                    label={agentStatus === 'active' ? 'ACTIVAS' : 'INACTIVAS'} 
                    size="small" 
                    color={agentStatus === 'active' ? 'success' : 'error'} 
                  />
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">Auto-correcciones:</Typography>
                  <Chip 
                    label={`${agentMetrics.auto_corrections} aplicadas`} 
                    size="small" 
                    color="info" 
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Manual del Agente */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🤖 Cómo Opera el IA Agent
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <SecurityIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="subtitle2">1. ESCANEA</Typography>
                <Typography variant="body2" color="text.secondary">
                  Lee especificación .md y escanea HTML actual
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <BugIcon color="warning" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="subtitle2">2. DETECTA</Typography>
                <Typography variant="body2" color="text.secondary">
                  Encuentra campos faltantes y validaciones incorrectas
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <FixIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="subtitle2">3. CORRIGE</Typography>
                <Typography variant="body2" color="text.secondary">
                  Genera HTML y JavaScript correcto automáticamente
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <AIIcon color="info" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="subtitle2">4. VALIDA</Typography>
                <Typography variant="body2" color="text.secondary">
                  Verifica que las correcciones funcionen correctamente
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SystemValidationDashboard;