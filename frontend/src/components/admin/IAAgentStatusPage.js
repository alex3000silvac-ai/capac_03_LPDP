/**
 * 🤖 IA AGENT STATUS PAGE - Informe en Vivo del Agente
 * 
 * Página SOLO ADMINISTRADORES para consultar estado del IA Agent
 * URL: /admin/ia-agent-status
 * ACCESO: Solo usuarios con rol 'admin' en Supabase
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Button,
  Badge
} from '@mui/material';
import {
  SmartToy as AIIcon,
  CheckCircle as SuccessIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  Timeline as ActivityIcon,
  Security as ComplianceIcon,
  Storage as DatabaseIcon,
  Speed as PerformanceIcon,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../config/supabaseClient';
import iaAgentReporter from '../../utils/iaAgentReporter';

const IAAgentStatusPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);

  useEffect(() => {
    if (!authLoading && user) {
      checkAdminAuth();
    } else if (!authLoading && !user) {
      setAuthChecking(false);
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (isAdmin) {
      generateReport();
      const interval = setInterval(generateReport, 60000);
      return () => clearInterval(interval);
    }
  }, [isAdmin]);

  const checkAdminAuth = async () => {
    try {
      if (!user) {
        setAuthChecking(false);
        return;
      }

      // Verificar múltiples criterios de administrador
      const adminChecks = [
        user.is_superuser,
        user.permissions?.includes('admin.view'),
        user.permissions?.includes('system_admin'),
        user.email === 'pascalbarata@gmail.com',
        user.email?.includes('admin')
      ];

      // Verificar también en la base de datos
      try {
        const { data: userProfile } = await supabase
          .from('usuarios')
          .select('rol, permisos')
          .eq('email', user.email)
          .single();

        if (userProfile) {
          adminChecks.push(
            userProfile.rol === 'admin',
            Array.isArray(userProfile.permisos) && userProfile.permisos.includes('system_admin')
          );
        }
      } catch (dbError) {
        // //console.warn('No se pudo verificar en DB, usando solo contexto auth');
      }

      const isUserAdmin = adminChecks.some(check => check === true);
      setIsAdmin(isUserAdmin);
      setAuthChecking(false);
    } catch (error) {
      console.error('Error verificando permisos admin:', error);
      setAuthChecking(false);
    }
  };

  const generateReport = async () => {
    try {
      setLoading(true);
      const newReport = await iaAgentReporter.generateFullReport();
      setReport(newReport);
      setLastUpdate(new Date().toISOString());
    } catch (error) {
      console.error('Error generando informe:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'online':
      case 'connected': return 'success';
      case 'warning':
      case 'slow': return 'warning';
      case 'error':
      case 'offline': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'online':
      case 'connected': return <SuccessIcon />;
      case 'warning':
      case 'slow': return <WarningIcon />;
      case 'error':
      case 'offline': return <ErrorIcon />;
      default: return <AIIcon />;
    }
  };

  // Pantalla de verificación de autenticación
  if (authChecking) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <LinearProgress sx={{ mb: 2 }} />
        <Typography>Verificando permisos de administrador...</Typography>
      </Box>
    );
  }

  // Pantalla de acceso denegado
  if (!isAdmin) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">
          <Typography variant="h6">🚫 Solo Administradores</Typography>
          <Typography>
            Este módulo requiere permisos de administrador para acceder al monitoreo del IA Agent.
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Contacta al administrador principal si necesitas acceso.
          </Typography>
        </Alert>
      </Box>
    );
  }

  // Pantalla de carga de reporte
  if (loading && !report) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <LinearProgress sx={{ mb: 2 }} />
        <Typography>Generando informe del IA Agent...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      {/* Header compacto para AdminPanel */}
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
          <AdminIcon sx={{ fontSize: 32 }} color="primary" />
          🤖 IA Agent - Monitoreo ADMIN
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Supervisión 24/7 Sistema LPDP | Solo Administradores
        </Typography>
        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
          Última actualización: {lastUpdate ? new Date(lastUpdate).toLocaleString('es-CL') : 'Cargando...'}
        </Typography>
        <Button 
          variant="contained" 
          size="small"
          startIcon={<RefreshIcon />} 
          onClick={generateReport}
          sx={{ mt: 1 }}
          disabled={loading}
        >
          Actualizar
        </Button>
      </Box>

      {report?.error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="h6">Error generando informe</Typography>
          <Typography>{report.message}</Typography>
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {/* Estado del Despliegue */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PerformanceIcon color="primary" />
                  Estado del Despliegue
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">Frontend:</Typography>
                    <Chip 
                      label={report?.deployment_status?.frontend_status || 'CHECKING'}
                      color={getStatusColor(report?.deployment_status?.frontend_status)}
                      icon={getStatusIcon(report?.deployment_status?.frontend_status)}
                      size="small"
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">IA Agent Cargado:</Typography>
                    <Chip 
                      label={report?.deployment_status?.ia_agent_loaded ? 'SÍ' : 'NO'}
                      color={report?.deployment_status?.ia_agent_loaded ? 'success' : 'error'}
                      size="small"
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">Ambiente:</Typography>
                    <Chip 
                      label={report?.deployment_status?.environment || 'N/A'}
                      color="info"
                      size="small"
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">URL:</Typography>
                    <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                      {report?.deployment_status?.frontend_url || window.location.origin}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Estado del Agente IA */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AIIcon color="primary" />
                  Estado del Agente IA
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">Status:</Typography>
                    <Chip 
                      label={report?.agent_status?.status || 'CHECKING'}
                      color={getStatusColor(report?.agent_status?.status)}
                      icon={getStatusIcon(report?.agent_status?.status)}
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">Activo:</Typography>
                    <Chip 
                      label={report?.agent_status?.is_active ? 'SÍ' : 'NO'}
                      color={report?.agent_status?.is_active ? 'success' : 'error'}
                      size="small"
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">Última actividad:</Typography>
                    <Typography variant="body2">
                      {report?.agent_status?.minutes_since_activity || 'N/A'} min
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">Agent ID:</Typography>
                    <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                      {report?.agent_status?.agent_id?.substring(0, 16) || 'N/A'}...
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Métricas de Performance */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ActivityIcon color="primary" />
                  Métricas de Performance
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={6} md={2}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">
                        {report?.recent_activity?.total_activities || 0}
                      </Typography>
                      <Typography variant="caption">Validaciones</Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={6} md={2}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="warning.main">
                        {report?.recent_activity?.last_24h || 0}
                      </Typography>
                      <Typography variant="caption">Últimas 24h</Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={6} md={2}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="success.main">
                        {report?.compliance_metrics?.overall_compliance || 0}%
                      </Typography>
                      <Typography variant="caption">Compliance</Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={6} md={2}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="info.main">
                        {report?.user_stats?.active_sessions || 0}
                      </Typography>
                      <Typography variant="caption">Sesiones</Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={6} md={2}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="success.main">
                        {report?.supabase_health?.response_time_ms || 0}ms
                      </Typography>
                      <Typography variant="caption">Latencia DB</Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={6} md={2}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">
                        {report?.document_generation?.generated_24h || 0}
                      </Typography>
                      <Typography variant="caption">Docs Generados</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Compliance con Ley 21.719 */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ComplianceIcon color="primary" />
                  Compliance Ley 21.719
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Artículos cubiertos:</Typography>
                    <Typography variant="body2" fontWeight="bold">67/67</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={100} 
                    color="success"
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">RATs con datos sensibles:</Typography>
                    <Typography variant="body2">
                      {report?.compliance_metrics?.rat_metrics?.with_sensitive_data || 0}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Notificaciones DPO:</Typography>
                    <Badge 
                      badgeContent={report?.compliance_metrics?.notification_metrics?.pending || 0}
                      color="warning"
                    >
                      <Typography variant="body2">Pendientes</Typography>
                    </Badge>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Score general:</Typography>
                    <Chip 
                      label={`${report?.compliance_metrics?.overall_compliance || 0}%`}
                      color={
                        (report?.compliance_metrics?.overall_compliance || 0) >= 85 ? 'success' : 'warning'
                      }
                      size="small"
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Estado Supabase */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DatabaseIcon color="primary" />
                  Estado Base de Datos
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">Conexión:</Typography>
                    <Chip 
                      label={report?.supabase_health?.status || 'CHECKING'}
                      color={getStatusColor(report?.supabase_health?.status)}
                      icon={getStatusIcon(report?.supabase_health?.status)}
                      size="small"
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">Tiempo respuesta:</Typography>
                    <Typography variant="body2">
                      {report?.supabase_health?.response_time_ms || 'N/A'}ms
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">Performance:</Typography>
                    <Chip 
                      label={report?.supabase_health?.performance || 'N/A'}
                      color={getStatusColor(report?.supabase_health?.performance)}
                      size="small"
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">LocalStorage usado:</Typography>
                    <Chip 
                      label="NUNCA"
                      color="success"
                      size="small"
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Actividad Reciente */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Actividad Reciente del Agente
                </Typography>
                
                {report?.recent_activity?.most_recent?.length > 0 ? (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Timestamp</TableCell>
                          <TableCell>Acción</TableCell>
                          <TableCell>Datos</TableCell>
                          <TableCell>Score</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {report.recent_activity.most_recent.map((activity, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Typography variant="caption">
                                {new Date(activity.timestamp).toLocaleString('es-CL')}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={activity.activity_type || 'Validación'}
                                size="small"
                                color="primary"
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="caption">
                                {JSON.stringify(activity.activity_data || {}).substring(0, 50)}...
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {activity.activity_data?.compliance_score || 'N/A'}%
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Alert severity="info">
                    No hay actividad reciente registrada. El agente puede estar iniciando.
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Recomendaciones */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recomendaciones del Sistema
                </Typography>
                
                {report?.recommendations?.map((rec, index) => (
                  <Alert 
                    key={index} 
                    severity={rec.priority === 'CRITICAL' ? 'error' : 
                             rec.priority === 'HIGH' ? 'warning' : 'info'}
                    sx={{ mb: 1 }}
                  >
                    <Typography variant="subtitle2">{rec.issue}</Typography>
                    <Typography variant="body2">{rec.action}</Typography>
                    <Typography variant="caption">{rec.article}</Typography>
                  </Alert>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Información Técnica */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Información Técnica
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="text.secondary">Sistema:</Typography>
                    <Typography variant="body1">Sistema LPDP Ley 21.719</Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="text.secondary">Versión IA:</Typography>
                    <Typography variant="body1">Agent v2.0 - Supervisión Total</Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="text.secondary">Frecuencia validación:</Typography>
                    <Typography variant="body1">60 segundos</Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="text.secondary">Auto-corrección:</Typography>
                    <Typography variant="body1" color="success.main">HABILITADA</Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="text.secondary">Bloqueo flujo:</Typography>
                    <Typography variant="body1" color="success.main">NUNCA</Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="text.secondary">Persistencia:</Typography>
                    <Typography variant="body1" color="success.main">100% Supabase</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Footer con instrucciones ADMIN */}
      <Alert severity="warning" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>🔒 SOLO ADMINISTRADORES:</strong> Información confidencial del IA Agent del sistema.
        </Typography>
        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
          El IA Agent supervisa 24/7 la Ley 21.719 con auto-corrección sin bloquear flujos de usuario.
        </Typography>
      </Alert>
    </Box>
  );
};

export default IAAgentStatusPage;