import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Snackbar,
  FormControl,
  Select,
  MenuItem,
  TextField,
  InputLabel,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
  Security as SecurityIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  CalendarToday as CalendarIcon,
  FilterList as FilterIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  TableChart as TableChartIcon,
} from '@mui/icons-material';
import { API_BASE_URL } from '../../config';

function SystemReports() {
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [filters, setFilters] = useState({
    dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    dateTo: new Date().toISOString().split('T')[0],
    tenant: 'all',
    module: 'all',
    format: 'pdf'
  });
  
  // Estados para notificaciones
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  // Tipos de reportes disponibles
  const availableReports = [
    {
      id: 'compliance_summary',
      name: 'Resumen de Cumplimiento',
      description: 'Vista general del cumplimiento de todas las empresas',
      icon: <CheckCircleIcon />,
      color: 'success',
      category: 'Cumplimiento'
    },
    {
      id: 'user_activity',
      name: 'Actividad de Usuarios',
      description: 'Análisis de actividad y uso del sistema',
      icon: <PeopleIcon />,
      color: 'primary',
      category: 'Usuarios'
    },
    {
      id: 'security_events',
      name: 'Eventos de Seguridad',
      description: 'Reporte de eventos de seguridad y accesos',
      icon: <SecurityIcon />,
      color: 'warning',
      category: 'Seguridad'
    },
    {
      id: 'tenant_performance',
      name: 'Rendimiento por Empresa',
      description: 'Métricas de rendimiento por empresa',
      icon: <BusinessIcon />,
      color: 'info',
      category: 'Empresas'
    },
    {
      id: 'dpia_status',
      name: 'Estado de DPIAs',
      description: 'Estado de las evaluaciones de impacto',
      icon: <AssessmentIcon />,
      color: 'secondary',
      category: 'DPIAs'
    },
    {
      id: 'breach_analysis',
      name: 'Análisis de Brechas',
      description: 'Análisis de brechas de seguridad reportadas',
      icon: <WarningIcon />,
      color: 'error',
      category: 'Brechas'
    },
    {
      id: 'training_progress',
      name: 'Progreso de Capacitación',
      description: 'Estado de la capacitación de usuarios',
      icon: <TrendingUpIcon />,
      color: 'success',
      category: 'Capacitación'
    },
    {
      id: 'inventory_status',
      name: 'Estado del Inventario',
      description: 'Estado del inventario de datos personales',
      icon: <TableChartIcon />,
      color: 'primary',
      category: 'Inventario'
    }
  ];

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(
        `${API_BASE_URL}/api/v1/admin/reports/list`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setReports(data);
      }
    } catch (error) {
      console.error('Error loading reports:', error);
    }
  };

  const generateReport = async (reportId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(
        `${API_BASE_URL}/api/v1/admin/reports/generate`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            report_id: reportId,
            filters: filters,
            format: filters.format
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Error al generar reporte');
      }

      const data = await response.json();
      
      if (data.download_url) {
        // Descargar reporte
        window.open(data.download_url, '_blank');
        showNotification('Reporte generado y descargado exitosamente', 'success');
      } else {
        setReportData(data);
        showNotification('Reporte generado exitosamente', 'success');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      showNotification('Error al generar reporte', 'error');
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async (reportId) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(
        `${API_BASE_URL}/api/v1/admin/reports/${reportId}/download`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Error al descargar reporte');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte_${reportId}_${new Date().toISOString().split('T')[0]}.${filters.format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      showNotification('Reporte descargado exitosamente', 'success');
    } catch (error) {
      console.error('Error downloading report:', error);
      showNotification('Error al descargar reporte', 'error');
    }
  };

  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const getReportIcon = (category) => {
    switch (category) {
      case 'Cumplimiento': return <CheckCircleIcon />;
      case 'Usuarios': return <PeopleIcon />;
      case 'Seguridad': return <SecurityIcon />;
      case 'Empresas': return <BusinessIcon />;
      case 'DPIAs': return <AssessmentIcon />;
      case 'Brechas': return <WarningIcon />;
      case 'Capacitación': return <TrendingUpIcon />;
      case 'Inventario': return <TableChartIcon />;
      default: return <InfoIcon />;
    }
  };

  const getReportColor = (category) => {
    switch (category) {
      case 'Cumplimiento': return 'success';
      case 'Usuarios': return 'primary';
      case 'Seguridad': return 'warning';
      case 'Empresas': return 'info';
      case 'DPIAs': return 'secondary';
      case 'Brechas': return 'error';
      case 'Capacitación': return 'success';
      case 'Inventario': return 'primary';
      default: return 'default';
    }
  };

  const renderReportPreview = (report) => {
    if (!reportData) return null;

    switch (report.id) {
      case 'compliance_summary':
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Resumen de Cumplimiento</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="success.main">
                    {reportData.total_compliance || 0}%
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Cumplimiento General
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="primary.main">
                    {reportData.total_tenants || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Empresas Evaluadas
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="warning.main">
                    {reportData.compliant_tenants || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Empresas Cumplidoras
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="error.main">
                    {reportData.non_compliant_tenants || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Empresas No Cumplidoras
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        );

      case 'user_activity':
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Actividad de Usuarios</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>Usuarios Activos</Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={reportData.active_users_percentage || 0} 
                    sx={{ height: 20, borderRadius: 10 }}
                  />
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    {reportData.active_users || 0} de {reportData.total_users || 0} usuarios
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>Actividad por Módulo</Typography>
                  <List dense>
                    {reportData.module_activity?.map((module, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <TrendingUpIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={module.name}
                          secondary={`${module.usage_count || 0} accesos`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        );

      default:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Vista Previa del Reporte</Typography>
            <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="body2" color="textSecondary">
                Selecciona un reporte para ver la vista previa
              </Typography>
            </Paper>
          </Box>
        );
    }
  };

  return (
    <Box>
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5" component="h2">
              Reportes del Sistema
            </Typography>
            <Box display="flex" gap={2}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={loadReports}
              >
                Actualizar
              </Button>
            </Box>
          </Box>

          {/* Filtros */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Filtros del Reporte</Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  type="date"
                  label="Desde"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  type="date"
                  label="Hasta"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Empresa</InputLabel>
                  <Select
                    value={filters.tenant}
                    onChange={(e) => setFilters({ ...filters, tenant: e.target.value })}
                    label="Empresa"
                  >
                    <MenuItem value="all">Todas las empresas</MenuItem>
                    <MenuItem value="specific">Empresa específica</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Módulo</InputLabel>
                  <Select
                    value={filters.module}
                    onChange={(e) => setFilters({ ...filters, module: e.target.value })}
                    label="Módulo"
                  >
                    <MenuItem value="all">Todos los módulos</MenuItem>
                    <MenuItem value="dpia">DPIAs</MenuItem>
                    <MenuItem value="brechas">Brechas</MenuItem>
                    <MenuItem value="capacitacion">Capacitación</MenuItem>
                    <MenuItem value="inventario">Inventario</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Formato</InputLabel>
                  <Select
                    value={filters.format}
                    onChange={(e) => setFilters({ ...filters, format: e.target.value })}
                    label="Formato"
                  >
                    <MenuItem value="pdf">PDF</MenuItem>
                    <MenuItem value="excel">Excel</MenuItem>
                    <MenuItem value="csv">CSV</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>

          {/* Reportes disponibles */}
          <Grid container spacing={3}>
            {availableReports.map((report) => (
              <Grid item xs={12} sm={6} md={4} key={report.id}>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    height: '100%',
                    cursor: 'pointer',
                    '&:hover': { boxShadow: 2 }
                  }}
                  onClick={() => setSelectedReport(report)}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <Box color={report.color}>
                        {report.icon}
                      </Box>
                      <Box>
                        <Typography variant="h6" component="h3">
                          {report.name}
                        </Typography>
                        <Chip 
                          label={report.category} 
                          size="small" 
                          color={getReportColor(report.category)}
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                    <Typography variant="body2" color="textSecondary" mb={2}>
                      {report.description}
                    </Typography>
                    <Box display="flex" gap={1}>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<AssessmentIcon />}
                        onClick={(e) => {
                          e.stopPropagation();
                          generateReport(report.id);
                        }}
                        disabled={loading}
                      >
                        Generar
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadReport(report.id);
                        }}
                      >
                        Descargar
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Vista previa del reporte seleccionado */}
          {selectedReport && (
            <Box mt={4}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">
                      Vista Previa: {selectedReport.name}
                    </Typography>
                    <IconButton onClick={() => setSelectedReport(null)}>
                      <ExpandMoreIcon />
                    </IconButton>
                  </Box>
                  {renderReportPreview(selectedReport)}
                </CardContent>
              </Card>
            </Box>
          )}

          {/* Reportes generados recientemente */}
          {reports.length > 0 && (
            <Box mt={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Reportes Generados Recientemente
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Reporte</TableCell>
                          <TableCell>Generado</TableCell>
                          <TableCell>Estado</TableCell>
                          <TableCell>Tamaño</TableCell>
                          <TableCell align="center">Acciones</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {reports.slice(0, 5).map((report) => (
                          <TableRow key={report.id}>
                            <TableCell>
                              <Box>
                                <Typography variant="subtitle2">
                                  {report.name}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  {report.description}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              {new Date(report.generated_at).toLocaleString('es-CL')}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={report.status}
                                color={report.status === 'completed' ? 'success' : 'warning'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              {report.file_size ? `${(report.file_size / 1024).toFixed(1)} KB` : 'N/A'}
                            </TableCell>
                            <TableCell align="center">
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<DownloadIcon />}
                                onClick={() => downloadReport(report.id)}
                              >
                                Descargar
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Loading overlay */}
      {loading && (
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bgcolor="rgba(0,0,0,0.5)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex={9999}
        >
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <CircularProgress size={60} />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Generando Reporte...
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Esto puede tomar unos minutos
            </Typography>
          </Paper>
        </Box>
      )}

      {/* Notificación */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default SystemReports;
