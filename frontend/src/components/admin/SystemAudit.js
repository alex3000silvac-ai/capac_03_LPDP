import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Alert,
  Snackbar,
  CircularProgress,
  TextField,
  InputAdornment,
  Tooltip,
  TablePagination,
  FormControl,
  Select,
  MenuItem,
  Grid,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Badge,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Download as ExportIcon,
  FilterList as FilterIcon,
  ExpandMore as ExpandMoreIcon,
  Security as SecurityIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  History as HistoryIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import { API_BASE_URL } from '../../config';

function SystemAudit() {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalLogs, setTotalLogs] = useState(0);
  
  // Estados para diálogos
  const [logDetailDialog, setLogDetailDialog] = useState({ open: false, log: null });
  
  // Estados para notificaciones
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  // Filtros
  const [filters, setFilters] = useState({
    action: 'all',
    user: 'all',
    tenant: 'all',
    severity: 'all',
    dateFrom: '',
    dateTo: '',
    module: 'all'
  });

  // Estadísticas
  const [stats, setStats] = useState({
    totalActions: 0,
    securityEvents: 0,
    dataChanges: 0,
    userActions: 0,
    systemEvents: 0
  });

  useEffect(() => {
    loadAuditLogs();
    loadAuditStats();
  }, [page, rowsPerPage, filters]);

  const loadAuditLogs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Construir query string con filtros
      const queryParams = new URLSearchParams({
        skip: page * rowsPerPage,
        limit: rowsPerPage,
        ...(searchTerm && { search: searchTerm }),
        ...(filters.action !== 'all' && { action: filters.action }),
        ...(filters.user !== 'all' && { user: filters.user }),
        ...(filters.tenant !== 'all' && { tenant: filters.tenant }),
        ...(filters.severity !== 'all' && { severity: filters.severity }),
        ...(filters.dateFrom && { date_from: filters.dateFrom }),
        ...(filters.dateTo && { date_to: filters.dateTo }),
        ...(filters.module !== 'all' && { module: filters.module })
      });

      const response = await fetch(
        `${API_BASE_URL}/api/v1/admin/audit/logs?${queryParams}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Error al cargar logs de auditoría');
      }

      const data = await response.json();
      setAuditLogs(data.items || data);
      setTotalLogs(data.total || data.length);
    } catch (error) {
      console.error('Error loading audit logs:', error);
      showNotification('Error al cargar logs de auditoría', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadAuditStats = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(
        `${API_BASE_URL}/api/v1/admin/audit/stats`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading audit stats:', error);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high': return <ErrorIcon />;
      case 'medium': return <WarningIcon />;
      case 'low': return <InfoIcon />;
      default: return <InfoIcon />;
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'create': return <CheckCircleIcon />;
      case 'update': return <EditIcon />;
      case 'delete': return <DeleteIcon />;
      case 'login': return <SecurityIcon />;
      case 'logout': return <SecurityIcon />;
      case 'access': return <PersonIcon />;
      default: return <InfoIcon />;
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'create': return 'success';
      case 'update': return 'info';
      case 'delete': return 'error';
      case 'login': return 'primary';
      case 'logout': return 'secondary';
      case 'access': return 'warning';
      default: return 'default';
    }
  };

  const handleSearch = () => {
    setPage(0);
    loadAuditLogs();
  };

  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const exportAuditLogs = () => {
    // Implementar exportación a CSV
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Fecha,Usuario,Acción,Módulo,Severidad,Detalles\n" +
      auditLogs.map(log => 
        `${new Date(log.timestamp).toLocaleString('es-CL')},${log.user_name || 'Sistema'},${log.action},${log.module},${log.severity},${log.description}`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `auditoria_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const actions = [
    'create', 'update', 'delete', 'login', 'logout', 'access', 'export', 'import', 'backup', 'restore'
  ];

  const modules = [
    'users', 'tenants', 'dpia', 'brechas', 'capacitacion', 'inventario', 'auditoria', 'reportes', 'system'
  ];

  const severities = ['low', 'medium', 'high'];

  return (
    <Box>
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5" component="h2">
              Auditoría del Sistema
            </Typography>
            <Box display="flex" gap={2}>
              <Button
                variant="outlined"
                startIcon={<ExportIcon />}
                onClick={exportAuditLogs}
              >
                Exportar
              </Button>
              <IconButton onClick={loadAuditLogs} color="primary">
                <RefreshIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Estadísticas rápidas */}
          <Grid container spacing={2} mb={3}>
            <Grid item xs={12} sm={6} md={2}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h6" color="primary">
                    {stats.totalActions}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Total Acciones
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h6" color="error">
                    {stats.securityEvents}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Eventos Seguridad
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h6" color="warning">
                    {stats.dataChanges}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Cambios Datos
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h6" color="info">
                    {stats.userActions}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Acciones Usuario
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h6" color="secondary">
                    {stats.systemEvents}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Eventos Sistema
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Filtros */}
          <Box mb={3}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  placeholder="Buscar en logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button onClick={handleSearch}>Buscar</Button>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <Select
                    value={filters.action}
                    onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                  >
                    <MenuItem value="all">Todas las acciones</MenuItem>
                    {actions.map(action => (
                      <MenuItem key={action} value={action}>
                        {action.charAt(0).toUpperCase() + action.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <Select
                    value={filters.module}
                    onChange={(e) => setFilters({ ...filters, module: e.target.value })}
                  >
                    <MenuItem value="all">Todos los módulos</MenuItem>
                    {modules.map(module => (
                      <MenuItem key={module} value={module}>
                        {module.charAt(0).toUpperCase() + module.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <Select
                    value={filters.severity}
                    onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
                  >
                    <MenuItem value="all">Todas las severidades</MenuItem>
                    {severities.map(severity => (
                      <MenuItem key={severity} value={severity}>
                        {severity.charAt(0).toUpperCase() + severity.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Desde"
                      value={filters.dateFrom}
                      onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Hasta"
                      value={filters.dateTo}
                      onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Box>

          {/* Tabla de logs */}
          {loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Timestamp</TableCell>
                    <TableCell>Usuario</TableCell>
                    <TableCell>Acción</TableCell>
                    <TableCell>Módulo</TableCell>
                    <TableCell>Severidad</TableCell>
                    <TableCell>Descripción</TableCell>
                    <TableCell>IP</TableCell>
                    <TableCell align="center">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {auditLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(log.timestamp).toLocaleString('es-CL')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <PersonIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            {log.user_name || 'Sistema'}
                          </Typography>
                          {log.tenant_name && (
                            <Chip 
                              label={log.tenant_name} 
                              size="small" 
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getActionIcon(log.action)}
                          label={log.action}
                          size="small"
                          color={getActionColor(log.action)}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={log.module} 
                          size="small" 
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getSeverityIcon(log.severity)}
                          label={log.severity}
                          size="small"
                          color={getSeverityColor(log.severity)}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                          {log.description}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="textSecondary">
                          {log.ip_address || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Ver detalles">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => setLogDetailDialog({ open: true, log })}
                          >
                            <TimelineIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              <TablePagination
                rowsPerPageOptions={[10, 25, 50, 100]}
                component="div"
                count={totalLogs}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Filas por página:"
                labelDisplayedRows={({ from, to, count }) =>
                  `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
                }
              />
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Diálogo de detalles del log */}
      <Dialog
        open={logDetailDialog.open}
        onClose={() => setLogDetailDialog({ open: false, log: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <HistoryIcon color="primary" />
            <Typography variant="h6">
              Detalles del Log de Auditoría
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {logDetailDialog.log && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Información General</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Timestamp
                </Typography>
                <Typography variant="body1">
                  {new Date(logDetailDialog.log.timestamp).toLocaleString('es-CL')}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  ID del Log
                </Typography>
                <Typography variant="body1">
                  {logDetailDialog.log.id}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>Usuario y Contexto</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Usuario
                </Typography>
                <Typography variant="body1">
                  {logDetailDialog.log.user_name || 'Sistema'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Empresa
                </Typography>
                <Typography variant="body1">
                  {logDetailDialog.log.tenant_name || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Dirección IP
                </Typography>
                <Typography variant="body1">
                  {logDetailDialog.log.ip_address || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  User Agent
                </Typography>
                <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
                  {logDetailDialog.log.user_agent || 'N/A'}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>Acción y Módulo</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Acción
                </Typography>
                <Chip
                  icon={getActionIcon(logDetailDialog.log.action)}
                  label={logDetailDialog.log.action}
                  color={getActionColor(logDetailDialog.log.action)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Módulo
                </Typography>
                <Chip 
                  label={logDetailDialog.log.module} 
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Severidad
                </Typography>
                <Chip
                  icon={getSeverityIcon(logDetailDialog.log.severity)}
                  label={logDetailDialog.log.severity}
                  color={getSeverityColor(logDetailDialog.log.severity)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Estado
                </Typography>
                <Chip
                  label={logDetailDialog.log.status || 'Completado'}
                  color={logDetailDialog.log.status === 'failed' ? 'error' : 'success'}
                  size="small"
                />
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>Detalles</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="textSecondary">
                  Descripción
                </Typography>
                <Typography variant="body1">
                  {logDetailDialog.log.description}
                </Typography>
              </Grid>
              
              {logDetailDialog.log.details && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Detalles Adicionales
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <pre style={{ margin: 0, fontSize: '0.875rem' }}>
                      {JSON.stringify(logDetailDialog.log.details, null, 2)}
                    </pre>
                  </Paper>
                </Grid>
              )}
              
              {logDetailDialog.log.metadata && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Metadatos
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <pre style={{ margin: 0, fontSize: '0.875rem' }}>
                      {JSON.stringify(logDetailDialog.log.metadata, null, 2)}
                    </pre>
                  </Paper>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogDetailDialog({ open: false, log: null })}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

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

export default SystemAudit;
