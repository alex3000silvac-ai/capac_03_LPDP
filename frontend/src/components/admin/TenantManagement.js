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
  DialogContentText,
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
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  Download as ExportIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { API_BASE_URL } from '../../config';

function TenantManagement() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalTenants, setTotalTenants] = useState(0);
  
  // Estados para diálogos
  const [createTenantDialog, setCreateTenantDialog] = useState({ open: false });
  const [editTenantDialog, setEditTenantDialog] = useState({ open: false, tenant: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, tenant: null });
  
  // Estados para notificaciones
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  // Estados para formularios
  const [newTenant, setNewTenant] = useState({
    company_name: '',
    business_name: '',
    rut: '',
    address: '',
    city: '',
    region: '',
    country: 'Chile',
    phone: '',
    email: '',
    website: '',
    industry: '',
    employee_count: '',
    is_active: true,
    subscription_plan: 'basic',
    max_users: 10,
    features: {
      dpia: true,
      brechas: true,
      capacitacion: true,
      inventario: true,
      auditoria: true,
      reportes: true
    }
  });

  const [editTenant, setEditTenant] = useState({
    company_name: '',
    business_name: '',
    rut: '',
    address: '',
    city: '',
    region: '',
    country: 'Chile',
    phone: '',
    email: '',
    website: '',
    industry: '',
    employee_count: '',
    is_active: true,
    subscription_plan: 'basic',
    max_users: 10,
    features: {
      dpia: true,
      brechas: true,
      capacitacion: true,
      inventario: true,
      auditoria: true,
      reportes: true
    }
  });

  // Filtros
  const [filters, setFilters] = useState({
    status: 'all',
    plan: 'all',
    industry: 'all'
  });

  useEffect(() => {
    loadTenants();
  }, [page, rowsPerPage, filters]);

  const loadTenants = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Construir query string con filtros
      const queryParams = new URLSearchParams({
        skip: page * rowsPerPage,
        limit: rowsPerPage,
        ...(searchTerm && { search: searchTerm }),
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.plan !== 'all' && { plan: filters.plan }),
        ...(filters.industry !== 'all' && { industry: filters.industry })
      });

      const response = await fetch(
        `${API_BASE_URL}/api/v1/admin/tenants?${queryParams}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Error al cargar empresas');
      }

      const data = await response.json();
      setTenants(data.items || data);
      setTotalTenants(data.total || data.length);
    } catch (error) {
      console.error('Error loading tenants:', error);
      showNotification('Error al cargar empresas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTenant = async () => {
    try {
      // Validaciones
      if (!newTenant.company_name.trim()) {
        showNotification('El nombre de la empresa es obligatorio', 'error');
        return;
      }

      if (!newTenant.rut.trim()) {
        showNotification('El RUT es obligatorio', 'error');
        return;
      }

      const token = localStorage.getItem('token');
      
      const response = await fetch(
        `${API_BASE_URL}/api/v1/admin/tenants/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newTenant),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al crear empresa');
      }

      showNotification('Empresa creada exitosamente', 'success');
      setCreateTenantDialog({ open: false });
      resetNewTenantForm();
      loadTenants();
    } catch (error) {
      console.error('Error creating tenant:', error);
      showNotification(error.message, 'error');
    }
  };

  const handleUpdateTenant = async () => {
    try {
      if (!editTenant.company_name.trim()) {
        showNotification('El nombre de la empresa es obligatorio', 'error');
        return;
      }

      const token = localStorage.getItem('token');
      
      const response = await fetch(
        `${API_BASE_URL}/api/v1/admin/tenants/${editTenantDialog.tenant.id}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(editTenant),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al actualizar empresa');
      }

      showNotification('Empresa actualizada exitosamente', 'success');
      setEditTenantDialog({ open: false, tenant: null });
      loadTenants();
    } catch (error) {
      console.error('Error updating tenant:', error);
      showNotification(error.message, 'error');
    }
  };

  const handleDeleteTenant = async (tenant) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(
        `${API_BASE_URL}/api/v1/admin/tenants/${tenant.id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Error al eliminar empresa');
      }

      showNotification('Empresa eliminada exitosamente', 'success');
      loadTenants();
    } catch (error) {
      console.error('Error deleting tenant:', error);
      showNotification('Error al eliminar empresa', 'error');
    } finally {
      setDeleteDialog({ open: false, tenant: null });
    }
  };

  const resetNewTenantForm = () => {
    setNewTenant({
      company_name: '',
      business_name: '',
      rut: '',
      address: '',
      city: '',
      region: '',
      country: 'Chile',
      phone: '',
      email: '',
      website: '',
      industry: '',
      employee_count: '',
      is_active: true,
      subscription_plan: 'basic',
      max_users: 10,
      features: {
        dpia: true,
        brechas: true,
        capacitacion: true,
        inventario: true,
        auditoria: true,
        reportes: true
      }
    });
  };

  const openEditDialog = (tenant) => {
    setEditTenant({
      company_name: tenant.company_name || '',
      business_name: tenant.business_name || '',
      rut: tenant.rut || '',
      address: tenant.address || '',
      city: tenant.city || '',
      region: tenant.region || '',
      country: tenant.country || 'Chile',
      phone: tenant.phone || '',
      email: tenant.email || '',
      website: tenant.website || '',
      industry: tenant.industry || '',
      employee_count: tenant.employee_count || '',
      is_active: tenant.is_active,
      subscription_plan: tenant.subscription_plan || 'basic',
      max_users: tenant.max_users || 10,
      features: tenant.features || {
        dpia: true,
        brechas: true,
        capacitacion: true,
        inventario: true,
        auditoria: true,
        reportes: true
      }
    });
    setEditTenantDialog({ open: true, tenant });
  };

  const handleSearch = () => {
    setPage(0);
    loadTenants();
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

  const exportTenants = () => {
    // Implementar exportación a CSV
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Empresa,RUT,Email,Plan,Estado,Usuarios\n" +
      tenants.map(t => 
        `${t.company_name},${t.rut},${t.email},${t.subscription_plan},${t.is_active ? 'Activo' : 'Inactivo'},${t.user_count || 0}`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "empresas.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const industries = [
    'Tecnología', 'Salud', 'Finanzas', 'Educación', 'Manufactura', 
    'Retail', 'Servicios', 'Construcción', 'Transporte', 'Energía',
    'Agricultura', 'Minería', 'Turismo', 'Medios', 'Otros'
  ];

  const plans = [
    { value: 'basic', label: 'Básico', maxUsers: 10 },
    { value: 'professional', label: 'Profesional', maxUsers: 50 },
    { value: 'enterprise', label: 'Empresarial', maxUsers: 200 },
    { value: 'custom', label: 'Personalizado', maxUsers: 1000 }
  ];

  return (
    <Box>
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5" component="h2">
              Gestión de Empresas
            </Typography>
            <Box display="flex" gap={2}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setCreateTenantDialog({ open: true })}
              >
                Nueva Empresa
              </Button>
              <Button
                variant="outlined"
                startIcon={<ExportIcon />}
                onClick={exportTenants}
              >
                Exportar
              </Button>
              <IconButton onClick={loadTenants} color="primary">
                <RefreshIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Filtros */}
          <Box mb={3}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Buscar por nombre, RUT o email..."
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
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  >
                    <MenuItem value="all">Todos los estados</MenuItem>
                    <MenuItem value="active">Activas</MenuItem>
                    <MenuItem value="inactive">Inactivas</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <Select
                    value={filters.plan}
                    onChange={(e) => setFilters({ ...filters, plan: e.target.value })}
                  >
                    <MenuItem value="all">Todos los planes</MenuItem>
                    {plans.map(plan => (
                      <MenuItem key={plan.value} value={plan.value}>
                        {plan.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <Select
                    value={filters.industry}
                    onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
                  >
                    <MenuItem value="all">Todas las industrias</MenuItem>
                    {industries.map(industry => (
                      <MenuItem key={industry} value={industry}>
                        {industry}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>

          {/* Tabla de empresas */}
          {loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Empresa</TableCell>
                    <TableCell>RUT</TableCell>
                    <TableCell>Contacto</TableCell>
                    <TableCell>Plan</TableCell>
                    <TableCell>Usuarios</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Creada</TableCell>
                    <TableCell align="center">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tenants.map((tenant) => (
                    <TableRow key={tenant.id}>
                      <TableCell>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {tenant.company_name}
                          </Typography>
                          {tenant.business_name && (
                            <Typography variant="caption" color="text.secondary">
                              {tenant.business_name}
                            </Typography>
                          )}
                          {tenant.industry && (
                            <Chip 
                              label={tenant.industry} 
                              size="small" 
                              variant="outlined" 
                              sx={{ mt: 0.5 }}
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Tooltip title={`RUT: ${tenant.rut}`}>
                          <span>{tenant.rut}</span>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">
                            {tenant.email}
                          </Typography>
                          {tenant.phone && (
                            <Typography variant="caption" color="text.secondary">
                              {tenant.phone}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Chip 
                            label={plans.find(p => p.value === tenant.subscription_plan)?.label || tenant.subscription_plan}
                            size="small"
                            color={tenant.subscription_plan === 'enterprise' ? 'primary' : 'default'}
                          />
                          <Typography variant="caption" display="block" color="text.secondary">
                            Máx: {tenant.max_users} usuarios
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {tenant.user_count || 0} / {tenant.max_users}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {tenant.is_active ? (
                          <Chip
                            icon={<ActiveIcon />}
                            label="Activa"
                            color="success"
                            size="small"
                          />
                        ) : (
                          <Chip
                            icon={<InactiveIcon />}
                            label="Inactiva"
                            color="error"
                            size="small"
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        {tenant.created_at 
                          ? new Date(tenant.created_at).toLocaleDateString('es-CL')
                          : 'N/A'
                        }
                      </TableCell>
                      <TableCell align="center">
                        <Box display="flex" gap={1} justifyContent="center">
                          <Tooltip title="Editar empresa">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => openEditDialog(tenant)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Eliminar empresa">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => setDeleteDialog({ open: true, tenant })}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={totalTenants}
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

      {/* Diálogo de creación de empresa */}
      <Dialog
        open={createTenantDialog.open}
        onClose={() => setCreateTenantDialog({ open: false })}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Crear Nueva Empresa</Typography>
            <IconButton onClick={() => setCreateTenantDialog({ open: false })}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Información Básica</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nombre de la Empresa *"
                value={newTenant.company_name}
                onChange={(e) => setNewTenant({ ...newTenant, company_name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Razón Social"
                value={newTenant.business_name}
                onChange={(e) => setNewTenant({ ...newTenant, business_name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="RUT *"
                value={newTenant.rut}
                onChange={(e) => setNewTenant({ ...newTenant, rut: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <Select
                  value={newTenant.industry}
                  onChange={(e) => setNewTenant({ ...newTenant, industry: e.target.value })}
                >
                  <MenuItem value="">Seleccionar industria</MenuItem>
                  {industries.map(industry => (
                    <MenuItem key={industry} value={industry}>
                      {industry}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>Contacto</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={newTenant.email}
                onChange={(e) => setNewTenant({ ...newTenant, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Teléfono"
                value={newTenant.phone}
                onChange={(e) => setNewTenant({ ...newTenant, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Sitio Web"
                value={newTenant.website}
                onChange={(e) => setNewTenant({ ...newTenant, website: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Número de Empleados"
                type="number"
                value={newTenant.employee_count}
                onChange={(e) => setNewTenant({ ...newTenant, employee_count: e.target.value })}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>Configuración</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <Select
                  value={newTenant.subscription_plan}
                  onChange={(e) => {
                    const plan = plans.find(p => p.value === e.target.value);
                    setNewTenant({ 
                      ...newTenant, 
                      subscription_plan: e.target.value,
                      max_users: plan ? plan.maxUsers : 10
                    });
                  }}
                >
                  {plans.map(plan => (
                    <MenuItem key={plan.value} value={plan.value}>
                      {plan.label} - Máx {plan.maxUsers} usuarios
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Máximo de Usuarios"
                type="number"
                value={newTenant.max_users}
                onChange={(e) => setNewTenant({ ...newTenant, max_users: parseInt(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={newTenant.is_active}
                    onChange={(e) => setNewTenant({ ...newTenant, is_active: e.target.checked })}
                  />
                }
                label="Empresa Activa"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateTenantDialog({ open: false })}>
            Cancelar
          </Button>
          <Button 
            onClick={handleCreateTenant}
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={!newTenant.company_name.trim() || !newTenant.rut.trim()}
          >
            Crear Empresa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de edición de empresa */}
      <Dialog
        open={editTenantDialog.open}
        onClose={() => setEditTenantDialog({ open: false, tenant: null })}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Editar Empresa: {editTenantDialog.tenant?.company_name}</Typography>
            <IconButton onClick={() => setEditTenantDialog({ open: false, tenant: null })}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Información Básica</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nombre de la Empresa *"
                value={editTenant.company_name}
                onChange={(e) => setEditTenant({ ...editTenant, company_name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Razón Social"
                value={editTenant.business_name}
                onChange={(e) => setEditTenant({ ...editTenant, business_name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="RUT *"
                value={editTenant.rut}
                onChange={(e) => setEditTenant({ ...editTenant, rut: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <Select
                  value={editTenant.industry}
                  onChange={(e) => setEditTenant({ ...editTenant, industry: e.target.value })}
                >
                  <MenuItem value="">Seleccionar industria</MenuItem>
                  {industries.map(industry => (
                    <MenuItem key={industry} value={industry}>
                      {industry}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>Contacto</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={editTenant.email}
                onChange={(e) => setEditTenant({ ...editTenant, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Teléfono"
                value={editTenant.phone}
                onChange={(e) => setEditTenant({ ...editTenant, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Sitio Web"
                value={editTenant.website}
                onChange={(e) => setEditTenant({ ...editTenant, website: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Número de Empleados"
                type="number"
                value={editTenant.employee_count}
                onChange={(e) => setEditTenant({ ...editTenant, employee_count: e.target.value })}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>Configuración</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <Select
                  value={editTenant.subscription_plan}
                  onChange={(e) => {
                    const plan = plans.find(p => p.value === e.target.value);
                    setEditTenant({ 
                      ...editTenant, 
                      subscription_plan: e.target.value,
                      max_users: plan ? plan.maxUsers : editTenant.max_users
                    });
                  }}
                >
                  {plans.map(plan => (
                    <MenuItem key={plan.value} value={plan.value}>
                      {plan.label} - Máx {plan.maxUsers} usuarios
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Máximo de Usuarios"
                type="number"
                value={editTenant.max_users}
                onChange={(e) => setEditTenant({ ...editTenant, max_users: parseInt(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={editTenant.is_active}
                    onChange={(e) => setEditTenant({ ...editTenant, is_active: e.target.checked })}
                  />
                }
                label="Empresa Activa"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditTenantDialog({ open: false, tenant: null })}>
            Cancelar
          </Button>
          <Button 
            onClick={handleUpdateTenant}
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={!editTenant.company_name.trim() || !editTenant.rut.trim()}
          >
            Guardar Cambios
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de confirmación para eliminar */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, tenant: null })}
      >
        <DialogTitle>Eliminar Empresa</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar la empresa{' '}
            <strong>{deleteDialog.tenant?.company_name}</strong>?
          </DialogContentText>
          <Alert severity="error" sx={{ mt: 2 }}>
            Esta acción eliminará todos los usuarios y datos asociados a esta empresa.
            Esta acción no se puede deshacer.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, tenant: null })}>
            Cancelar
          </Button>
          <Button 
            onClick={() => handleDeleteTenant(deleteDialog.tenant)}
            color="error"
            variant="contained"
          >
            Eliminar
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

export default TenantManagement;
