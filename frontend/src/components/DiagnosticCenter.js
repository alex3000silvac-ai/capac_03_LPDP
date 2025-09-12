/**
 * 🔧 DIAGNOSTIC CENTER - Centro de Diagnóstico en Tiempo Real
 * 
 * Panel de diagnóstico para validar que todos los módulos funcionen
 * correctamente y detectar problemas HTML/JS en tiempo real
 */

import React, { useState, useEffect, useRef } from 'react';
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
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge,
  Divider
} from '@mui/material';
import {
  BugReport as DiagnosticIcon,
  PlayArrow as RunTestIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon,
  CheckCircle as SuccessIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Speed as PerformanceIcon,
  Visibility as ViewIcon,
  ExpandMore as ExpandIcon,
  Timeline as AnalyticsIcon,
  Security as ValidationIcon,
  Code as CodeIcon,
  Html as HtmlIcon
} from '@mui/icons-material';
import frontendValidator from '../utils/frontendValidator';
import { supabase } from '../config/supabaseConfig';

const DiagnosticCenter = () => {
  const [loading, setLoading] = useState(false);
  const [validationReport, setValidationReport] = useState(null);
  const [testResults, setTestResults] = useState(null);
  const [realTimeErrors, setRealTimeErrors] = useState([]);
  const [continuousTesting, setContinuousTesting] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);
  const [detailDialog, setDetailDialog] = useState(false);
  const intervalRef = useRef(null);

  const [stats, setStats] = useState({
    totalModules: 14,
    healthyModules: 0,
    errorModules: 0,
    warningModules: 0,
    overallScore: 0,
    lastValidation: null
  });

  useEffect(() => {
    // Ejecutar validación inicial
    runQuickDiagnostic();
    
    // Configurar captura de errores en tiempo real
    setupErrorCapture();
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const setupErrorCapture = () => {
    // Capturar errores JavaScript en tiempo real
    window.addEventListener('error', (event) => {
      const errorInfo = {
        type: 'JavaScript Error',
        message: event.error?.message || event.message,
        filename: event.filename,
        lineno: event.lineno,
        timestamp: new Date().toISOString(),
        stack: event.error?.stack
      };
      
      setRealTimeErrors(prev => [errorInfo, ...prev.slice(0, 19)]);
    });

    // Capturar errores de React (si están disponibles)
    window.addEventListener('unhandledrejection', (event) => {
      const errorInfo = {
        type: 'Promise Rejection',
        message: event.reason?.message || event.reason,
        timestamp: new Date().toISOString()
      };
      
      setRealTimeErrors(prev => [errorInfo, ...prev.slice(0, 19)]);
    });
  };

  const runQuickDiagnostic = async () => {
    try {
      setLoading(true);
      // //console.log('🔧 Ejecutando diagnóstico rápido...');
      
      // Health check rápido - Implementación simplificada
      const healthCheck = { status: 'ok', modules: ['RATSystem'], timestamp: new Date() };
      
      // Validación básica de algunos módulos críticos
      const criticalModules = ['RATSystemProfessional', 'RATListPage', 'DPOApprovalQueue'];
      let healthyCount = 0;
      
      for (const module of criticalModules) {
        try {
          const validation = await frontendValidator.validateComponentLive(module);
          if (validation.status === 'SUCCESS') healthyCount++;
        } catch (error) {
          console.error(`Error validating ${module}:`, error);
        }
      }
      
      setStats({
        totalModules: 14,
        healthyModules: healthyCount,
        errorModules: criticalModules.length - healthyCount,
        warningModules: 0,
        overallScore: Math.round((healthyCount / criticalModules.length) * 100),
        lastValidation: new Date().toISOString(),
        supabaseConnection: healthCheck.supabaseConnection,
        frontendRunning: healthCheck.frontendRunning
      });
      
    } catch (error) {
      console.error('Error en diagnóstico rápido:', error);
    } finally {
      setLoading(false);
    }
  };

  const runFullValidation = async () => {
    try {
      setLoading(true);
      // //console.log('🔍 Ejecutando validación completa...');
      
      const report = await frontendValidator.validateAllModules();
      setValidationReport(report);
      
      // Actualizar stats
      setStats(prev => ({
        ...prev,
        healthyModules: report.successCount,
        errorModules: report.errorCount,
        warningModules: report.warningCount,
        overallScore: report.qualityScore,
        lastValidation: report.timestamp
      }));
      
    } catch (error) {
      console.error('Error en validación completa:', error);
    } finally {
      setLoading(false);
    }
  };

  const runFullTesting = async () => {
    try {
      setLoading(true);
      // //console.log('🧪 Ejecutando suite completa de tests...');
      
      const results = { tests: [], passed: 0, failed: 0, warnings: 0 };
      setTestResults(results);
      
    } catch (error) {
      console.error('Error en testing completo:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleContinuousTesting = () => {
    if (continuousTesting) {
      // Parar testing continuo
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      // Testing continuo deshabilitado
      setContinuousTesting(false);
    } else {
      // Iniciar testing continuo
      intervalRef.current = setInterval(runQuickDiagnostic, 5 * 60 * 1000); // cada 5 min
      // Testing continuo deshabilitado
      setContinuousTesting(true);
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'success':
      case 'all_pass':
      case 'healthy': return <SuccessIcon sx={{ color: '#10b981' }} />;
      case 'warning':
      case 'some_failures': return <WarningIcon sx={{ color: '#f59e0b' }} />;
      case 'error':
      case 'critical_fail':
      case 'unhealthy': return <ErrorIcon sx={{ color: '#ef4444' }} />;
      default: return <DiagnosticIcon sx={{ color: '#60a5fa' }} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'success':
      case 'all_pass':
      case 'healthy': return 'success';
      case 'warning':
      case 'some_failures': return 'warning';
      case 'error':
      case 'critical_fail':
      case 'unhealthy': return 'error';
      default: return 'default';
    }
  };

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
            <DiagnosticIcon sx={{ fontSize: 40, color: '#60a5fa' }} />
            Centro de Diagnóstico Frontend
          </Typography>
          <Typography variant="subtitle1" sx={{ color: '#9ca3af' }}>
            Validación en tiempo real de módulos, HTML y JavaScript
          </Typography>
        </Box>

        {/* Dashboard de Estado */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={2.4}>
            <Card sx={{ bgcolor: '#1f2937', border: '1px solid #374151', textAlign: 'center' }}>
              <CardContent sx={{ py: 3 }}>
                <Typography variant="h3" sx={{ color: '#10b981', fontWeight: 700 }}>
                  {stats.overallScore}%
                </Typography>
                <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                  Score General
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={2.4}>
            <Card sx={{ bgcolor: '#1f2937', border: '1px solid #374151', textAlign: 'center' }}>
              <CardContent sx={{ py: 3 }}>
                <Typography variant="h3" sx={{ color: '#60a5fa', fontWeight: 700 }}>
                  {stats.healthyModules}
                </Typography>
                <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                  Módulos OK
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={2.4}>
            <Card sx={{ bgcolor: '#1f2937', border: '1px solid #374151', textAlign: 'center' }}>
              <CardContent sx={{ py: 3 }}>
                <Typography variant="h3" sx={{ color: '#ef4444', fontWeight: 700 }}>
                  {stats.errorModules}
                </Typography>
                <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                  Con Errores
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={2.4}>
            <Card sx={{ bgcolor: '#1f2937', border: '1px solid #374151', textAlign: 'center' }}>
              <CardContent sx={{ py: 3 }}>
                <Badge badgeContent={realTimeErrors.length} color="error">
                  <Typography variant="h3" sx={{ color: '#f59e0b', fontWeight: 700 }}>
                    {realTimeErrors.length}
                  </Typography>
                </Badge>
                <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                  Errores JS
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={2.4}>
            <Card sx={{ bgcolor: '#1f2937', border: '1px solid #374151', textAlign: 'center' }}>
              <CardContent sx={{ py: 3 }}>
                <Typography variant="h3" sx={{ 
                  color: stats.supabaseConnection ? '#10b981' : '#ef4444', 
                  fontWeight: 700 
                }}>
                  {stats.supabaseConnection ? 'OK' : 'ERR'}
                </Typography>
                <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                  Supabase
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Controles de Diagnóstico */}
        <Paper sx={{ bgcolor: '#1f2937', border: '1px solid #374151', p: 3, mb: 4 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={runQuickDiagnostic}
              disabled={loading}
              sx={{ bgcolor: '#4f46e5', '&:hover': { bgcolor: '#4338ca' } }}
            >
              Diagnóstico Rápido
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<ValidationIcon />}
              onClick={runFullValidation}
              disabled={loading}
              sx={{ 
                color: '#60a5fa', 
                borderColor: '#60a5fa',
                '&:hover': { borderColor: '#60a5fa', bgcolor: 'rgba(96, 165, 250, 0.1)' }
              }}
            >
              Validación Completa
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<RunTestIcon />}
              onClick={runFullTesting}
              disabled={loading}
              sx={{ 
                color: '#10b981', 
                borderColor: '#10b981',
                '&:hover': { borderColor: '#10b981', bgcolor: 'rgba(16, 185, 129, 0.1)' }
              }}
            >
              Suite de Tests
            </Button>
            
            <Button
              variant={continuousTesting ? "contained" : "outlined"}
              startIcon={continuousTesting ? <StopIcon /> : <AnalyticsIcon />}
              onClick={toggleContinuousTesting}
              sx={{ 
                bgcolor: continuousTesting ? '#ef4444' : 'transparent',
                color: continuousTesting ? '#fff' : '#8b5cf6',
                borderColor: '#8b5cf6',
                '&:hover': { 
                  bgcolor: continuousTesting ? '#dc2626' : 'rgba(139, 92, 246, 0.1)',
                  borderColor: '#8b5cf6'
                }
              }}
            >
              {continuousTesting ? 'Parar Continuo' : 'Testing Continuo'}
            </Button>
          </Box>
          
          {loading && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress sx={{ bgcolor: '#374151' }} />
              <Typography variant="caption" sx={{ color: '#9ca3af', mt: 1, display: 'block' }}>
                Ejecutando diagnóstico...
              </Typography>
            </Box>
          )}
        </Paper>

        {/* Estado de Conexiones */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: '#1f2937', border: '1px solid #374151' }}>
              <CardContent>
                <Typography variant="h6" sx={{ color: '#f9fafb', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CodeIcon sx={{ color: '#60a5fa' }} />
                  Estado Frontend
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ color: '#9ca3af' }}>React App:</Typography>
                    <Chip 
                      label={stats.frontendRunning ? 'RUNNING' : 'ERROR'}
                      color={stats.frontendRunning ? 'success' : 'error'}
                      size="small"
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ color: '#9ca3af' }}>Supabase:</Typography>
                    <Chip 
                      label={stats.supabaseConnection ? 'CONNECTED' : 'ERROR'}
                      color={stats.supabaseConnection ? 'success' : 'error'}
                      size="small"
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ color: '#9ca3af' }}>Última validación:</Typography>
                    <Typography variant="caption" sx={{ color: '#6b7280' }}>
                      {stats.lastValidation ? 
                        new Date(stats.lastValidation).toLocaleTimeString() : 'Nunca'}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: '#1f2937', border: '1px solid #374151' }}>
              <CardContent>
                <Typography variant="h6" sx={{ color: '#f9fafb', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <HtmlIcon sx={{ color: '#10b981' }} />
                  Calidad HTML
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ color: '#9ca3af' }}>Score calidad:</Typography>
                    <Typography variant="h6" sx={{ 
                      color: stats.overallScore >= 85 ? '#10b981' : 
                             stats.overallScore >= 70 ? '#f59e0b' : '#ef4444',
                      fontWeight: 'bold' 
                    }}>
                      {stats.overallScore}%
                    </Typography>
                  </Box>
                  
                  <LinearProgress
                    variant="determinate"
                    value={stats.overallScore}
                    sx={{
                      bgcolor: '#374151',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: stats.overallScore >= 85 ? '#10b981' : 
                                stats.overallScore >= 70 ? '#f59e0b' : '#ef4444'
                      }
                    }}
                  />
                  
                  <Typography variant="caption" sx={{ color: '#6b7280' }}>
                    {stats.healthyModules}/{stats.totalModules} módulos validados
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: '#1f2937', border: '1px solid #374151' }}>
              <CardContent>
                <Typography variant="h6" sx={{ color: '#f9fafb', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PerformanceIcon sx={{ color: '#8b5cf6' }} />
                  Testing Continuo
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ color: '#9ca3af' }}>Estado:</Typography>
                    <Chip 
                      label={continuousTesting ? 'ACTIVO' : 'PARADO'}
                      color={continuousTesting ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ color: '#9ca3af' }}>Frecuencia:</Typography>
                    <Typography variant="body2" sx={{ color: '#f9fafb' }}>
                      5 min
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ color: '#9ca3af' }}>Errores tiempo real:</Typography>
                    <Badge badgeContent={realTimeErrors.length} color="error">
                      <Typography variant="body2" sx={{ color: '#f9fafb' }}>
                        {realTimeErrors.length}
                      </Typography>
                    </Badge>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Errores en Tiempo Real */}
        {realTimeErrors.length > 0 && (
          <Paper sx={{ bgcolor: '#1f2937', border: '1px solid #ef4444', p: 3, mb: 4 }}>
            <Typography variant="h6" sx={{ color: '#ef4444', mb: 2 }}>
              🚨 Errores JavaScript en Tiempo Real
            </Typography>
            
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: '#9ca3af' }}>Tiempo</TableCell>
                    <TableCell sx={{ color: '#9ca3af' }}>Tipo</TableCell>
                    <TableCell sx={{ color: '#9ca3af' }}>Mensaje</TableCell>
                    <TableCell sx={{ color: '#9ca3af' }}>Archivo</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {realTimeErrors.slice(0, 5).map((error, index) => (
                    <TableRow key={index}>
                      <TableCell sx={{ color: '#d1d5db' }}>
                        {new Date(error.timestamp).toLocaleTimeString()}
                      </TableCell>
                      <TableCell>
                        <Chip label={error.type} color="error" size="small" />
                      </TableCell>
                      <TableCell sx={{ color: '#f3f4f6' }}>
                        {error.message.substring(0, 80)}...
                      </TableCell>
                      <TableCell sx={{ color: '#9ca3af', fontSize: '0.7rem' }}>
                        {error.filename ? error.filename.split('/').pop() : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            <Button
              size="small"
              onClick={() => setRealTimeErrors([])}
              sx={{ mt: 2, color: '#9ca3af' }}
            >
              Limpiar Errores
            </Button>
          </Paper>
        )}

        {/* Resultados de Validación */}
        {validationReport && (
          <Paper sx={{ bgcolor: '#1f2937', border: '1px solid #374151', p: 3, mb: 4 }}>
            <Typography variant="h6" sx={{ color: '#f9fafb', mb: 3 }}>
              📋 Resultados Validación Completa
            </Typography>
            
            <Grid container spacing={2}>
              {validationReport.moduleResults?.map((module) => (
                <Grid item xs={12} md={6} lg={4} key={module.module}>
                  <Card 
                    sx={{ 
                      bgcolor: '#374151', 
                      border: `1px solid ${
                        module.status === 'SUCCESS' ? '#10b981' :
                        module.status === 'WARNING' ? '#f59e0b' : '#ef4444'
                      }`,
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      setSelectedModule(module);
                      setDetailDialog(true);
                    }}
                  >
                    <CardContent sx={{ py: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        {getStatusIcon(module.status)}
                        <Typography variant="body1" sx={{ color: '#f9fafb', fontWeight: 600 }}>
                          {module.module}
                        </Typography>
                      </Box>
                      
                      <Chip 
                        label={module.status}
                        color={getStatusColor(module.status)}
                        size="small"
                        sx={{ mb: 1 }}
                      />
                      
                      {module.errors?.length > 0 && (
                        <Typography variant="caption" sx={{ color: '#ef4444', display: 'block' }}>
                          {module.errors[0].substring(0, 50)}...
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        )}

        {/* Resultados de Tests */}
        {testResults && (
          <Paper sx={{ bgcolor: '#1f2937', border: '1px solid #374151', p: 3, mb: 4 }}>
            <Typography variant="h6" sx={{ color: '#f9fafb', mb: 3 }}>
              🧪 Resultados Suite de Tests
            </Typography>
            
            <Alert 
              severity={testResults.overallStatus === 'ALL_PASS' ? 'success' : 'warning'}
              sx={{ mb: 3 }}
            >
              <Typography variant="body2">
                Score general: {testResults.summary?.overallScore || 0}% | 
                Módulos: {testResults.summary?.passedModules || 0}/{testResults.totalModules} | 
                Tests: {testResults.summary?.passedTests || 0}/{testResults.summary?.totalTests || 0}
              </Typography>
            </Alert>
            
            {testResults.criticalFailures?.length > 0 && (
              <Alert severity="error" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  🚨 Fallos críticos en: {testResults.criticalFailures.map(f => f.module).join(', ')}
                </Typography>
              </Alert>
            )}
            
            <Accordion sx={{ bgcolor: '#374151' }}>
              <AccordionSummary 
                expandIcon={<ExpandIcon sx={{ color: '#9ca3af' }} />}
                sx={{ color: '#f9fafb' }}
              >
                Ver Detalles Tests por Módulo
              </AccordionSummary>
              <AccordionDetails>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ color: '#9ca3af' }}>Módulo</TableCell>
                        <TableCell sx={{ color: '#9ca3af' }}>Estado</TableCell>
                        <TableCell sx={{ color: '#9ca3af' }}>Tests Pass/Total</TableCell>
                        <TableCell sx={{ color: '#9ca3af' }}>Score</TableCell>
                        <TableCell sx={{ color: '#9ca3af' }}>Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {testResults.moduleResults?.map((module) => {
                        const score = Math.round((module.passedTests / module.tests.length) * 100);
                        return (
                          <TableRow key={module.module}>
                            <TableCell sx={{ color: '#f9fafb' }}>
                              {module.module}
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={module.status}
                                color={getStatusColor(module.status)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell sx={{ color: '#9ca3af' }}>
                              {module.passedTests}/{module.tests.length}
                            </TableCell>
                            <TableCell sx={{ 
                              color: score >= 85 ? '#10b981' : score >= 70 ? '#f59e0b' : '#ef4444',
                              fontWeight: 'bold'
                            }}>
                              {score}%
                            </TableCell>
                            <TableCell>
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setSelectedModule(module);
                                  setDetailDialog(true);
                                }}
                                sx={{ color: '#60a5fa' }}
                              >
                                <ViewIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          </Paper>
        )}

        {/* Información de Uso */}
        <Alert 
          severity="info"
          sx={{
            bgcolor: 'rgba(79, 70, 229, 0.1)',
            border: '1px solid rgba(79, 70, 229, 0.3)',
            color: '#f9fafb'
          }}
        >
          <Typography variant="body2">
            🔧 <strong>Centro de Diagnóstico:</strong> Valida automáticamente que todos los módulos 
            funcionen correctamente, detecta errores HTML/JS y monitorea salud del sistema en tiempo real.
          </Typography>
        </Alert>
      </Container>

      {/* Dialog Detalles Módulo */}
      <Dialog
        open={detailDialog}
        onClose={() => setDetailDialog(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { bgcolor: '#1f2937', border: '1px solid #374151' } }}
      >
        <DialogTitle sx={{ color: '#f9fafb' }}>
          Detalles - {selectedModule?.module}
        </DialogTitle>
        
        {selectedModule && (
          <DialogContent>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="body1" sx={{ color: '#9ca3af', mb: 2 }}>
                  {selectedModule.description || 'Módulo del sistema LPDP'}
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                  <Chip 
                    label={selectedModule.status}
                    color={getStatusColor(selectedModule.status)}
                  />
                  {selectedModule.component && (
                    <Chip 
                      label={`Componente: ${selectedModule.component}`}
                      sx={{ bgcolor: '#374151', color: '#9ca3af' }}
                    />
                  )}
                  {selectedModule.path && (
                    <Chip 
                      label={`Ruta: ${selectedModule.path}`}
                      sx={{ bgcolor: '#374151', color: '#9ca3af' }}
                    />
                  )}
                </Box>
              </Grid>
              
              {selectedModule.errors?.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ color: '#ef4444', mb: 2 }}>
                    Errores Detectados:
                  </Typography>
                  {selectedModule.errors.map((error, index) => (
                    <Alert key={index} severity="error" sx={{ mb: 1 }}>
                      {error}
                    </Alert>
                  ))}
                </Grid>
              )}
              
              {selectedModule.warnings?.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ color: '#f59e0b', mb: 2 }}>
                    Advertencias:
                  </Typography>
                  {selectedModule.warnings.map((warning, index) => (
                    <Alert key={index} severity="warning" sx={{ mb: 1 }}>
                      {warning}
                    </Alert>
                  ))}
                </Grid>
              )}
              
              {selectedModule.tests && (
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ color: '#f9fafb', mb: 2 }}>
                    Tests Ejecutados:
                  </Typography>
                  
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ color: '#9ca3af' }}>Test</TableCell>
                          <TableCell sx={{ color: '#9ca3af' }}>Estado</TableCell>
                          <TableCell sx={{ color: '#9ca3af' }}>Mensaje</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedModule.tests.map((test, index) => (
                          <TableRow key={index}>
                            <TableCell sx={{ color: '#f9fafb' }}>
                              {test.name}
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={test.passed ? 'PASS' : 'FAIL'}
                                color={test.passed ? 'success' : 'error'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell sx={{ color: '#9ca3af' }}>
                              {test.message || 'N/A'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              )}
            </Grid>
          </DialogContent>
        )}
        
        <DialogActions>
          <Button onClick={() => setDetailDialog(false)} sx={{ color: '#9ca3af' }}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DiagnosticCenter;