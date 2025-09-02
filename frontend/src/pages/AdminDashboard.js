import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Alert,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Badge,
  Tooltip,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  AdminPanelSettings as AdminIcon,
  Business as HoldingIcon,
  AccountTree as HierarchyIcon,
  People as UsersIcon,
  Security as PermissionsIcon,
  Analytics as ReportsIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Settings as SettingsIcon,
  GroupWork as GroupIcon,
  SupervisorAccount as SupervisorIcon,
  Policy as PolicyIcon,
  Assessment as ComplianceIcon,
  Notifications as AlertIcon,
  PublicOff as InactiveIcon,
  CheckCircle as ActiveIcon
} from '@mui/icons-material';
import { ratService } from '../services/ratService';
import { supabase } from '../config/supabaseClient';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tenants, setTenants] = useState([]);
  const [users, setUsers] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [tenantDialog, setTenantDialog] = useState(false);
  const [userDialog, setUserDialog] = useState(false);
  
  const [stats, setStats] = useState({
    totalTenants: 0,
    activeUsers: 0,
    totalRATs: 0,
    complianceScore: 0,
    activeHoldings: 0,
    pendingApprovals: 0
  });

  const [newTenant, setNewTenant] = useState({
    company_name: '',
    rut: '',
    direccion: '',
    industry: '',
    tipo_tenant: 'EMPRESA',
    parent_tenant_id: null,
    configuracion: {
      max_usuarios: 50,
      max_rats: 100,
      funcionalidades_habilitadas: ['RAT', 'EIPD', 'DPO']
    }
  });

  useEffect(() => {
    cargarDatosAdministrativos();
  }, []);

  const cargarDatosAdministrativos = async () => {
    try {
      setLoading(true);
      
      await Promise.all([
        cargarTenants(),
        cargarUsuarios(),
        cargarLogsAuditoria()
      ]);
      
    } catch (error) {
      console.error('Error cargando datos administrativos:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarTenants = async () => {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select(`
          *,
          parent:parent_tenant_id(company_name),
          subsidiaries:tenants!parent_tenant_id(id, company_name, industry)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (error) {
        console.error('Error consultando tenants:', error);
        return;
      }

      const tenantsData = data || [];

      setTenants(tenantsData);
      await calcularEstadisticas(tenantsData);
      
    } catch (error) {
      console.error('Error cargando tenants:', error);
    }
  };

  const cargarUsuarios = async () => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select(`
          *,
          tenant:tenant_id(company_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (error) {
        console.error('Error consultando usuarios:', error);
        return;
      }

      const usersData = data || [];

      setUsers(usersData);
      
    } catch (error) {
      console.error('Error cargando usuarios:', error);
    }
  };

  const cargarLogsAuditoria = async () => {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select(`
          *,
          usuario:usuarios(first_name, last_name, email)
        `)
        .order('timestamp', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error consultando audit logs:', error);
        return;
      }

      setAuditLogs(data || []);
      
    } catch (error) {
      console.error('Error cargando logs auditoría:', error);
    }
  };

  const calcularComplianceAggregado = async (tenantsData) => {
    try {
      const { data, error } = await supabase
        .from('mapeo_datos_rat')
        .select('estado')
        .in('tenant_id', tenantsData.map(t => t.id));

      if (error) return 0;
      
      const totalRATs = data?.length || 0;
      const certificados = data?.filter(r => r.estado === 'CERTIFICADO').length || 0;
      
      return totalRATs > 0 ? Math.round((certificados / totalRATs) * 100) : 0;
    } catch (error) {
      console.error('Error calculando compliance:', error);
      return 0;
    }
  };

  const obtenerAprobacionesPendientes = async () => {
    try {
      const { data, error } = await supabase
        .from('mapeo_datos_rat')
        .select('id')
        .eq('estado', 'PENDIENTE_APROBACION');

      if (error) return 0;
      return data?.length || 0;
    } catch (error) {
      console.error('Error obteniendo pendientes:', error);
      return 0;
    }
  };

  const calcularEstadisticas = async (tenantsData) => {
    try {
      // Obtener conteo real de RATs por tenant
      const { data: ratsData, error: ratsError } = await supabase
        .from('mapeo_datos_rat')
        .select('tenant_id')
        .in('tenant_id', tenantsData.map(t => t.id));

      const totalRATs = ratsData?.length || 0;
      
      const stats = {
        totalTenants: tenantsData.length,
        activeUsers: users.filter(u => u.is_active).length,
        totalRATs: totalRATs,
        complianceScore: await calcularComplianceAggregado(tenantsData),
        activeHoldings: tenantsData.filter(t => t.tipo_tenant === 'HOLDING').length,
        pendingApprovals: await obtenerAprobacionesPendientes()
      };
      setStats(stats);
    } catch (error) {
      console.error('Error calculando estadísticas:', error);
    }
  };

  const crearTenant = async () => {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .insert([{
          ...newTenant,
          id: `tenant-${Date.now()}`,
          created_at: new Date().toISOString(),
          estado: 'ACTIVO'
        }])
        .select();

      if (error) throw error;

      await cargarTenants();
      setTenantDialog(false);
      setNewTenant({
        company_name: '', rut: '', direccion: '', industry: '',
        tipo_tenant: 'EMPRESA', parent_tenant_id: null,
        configuracion: {
          max_usuarios: 50, max_rats: 100,
          funcionalidades_habilitadas: ['RAT', 'EIPD', 'DPO']
        }
      });
      
    } catch (error) {
      console.error('Error creando tenant:', error);
      alert('Error al crear empresa');
    }
  };

  const renderTenantsTab = () => (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ color: '#f9fafb' }}>
          Gestión de Empresas y Holdings
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setTenantDialog(true)}
          sx={{ bgcolor: '#4f46e5', '&:hover': { bgcolor: '#4338ca' } }}
        >
          Nueva Empresa
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ bgcolor: '#1f2937', border: '1px solid #374151' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: '#9ca3af', borderColor: '#374151' }}>Empresa</TableCell>
              <TableCell sx={{ color: '#9ca3af', borderColor: '#374151' }}>Tipo</TableCell>
              <TableCell sx={{ color: '#9ca3af', borderColor: '#374151' }}>Industria</TableCell>
              <TableCell sx={{ color: '#9ca3af', borderColor: '#374151' }}>Filiales</TableCell>
              <TableCell sx={{ color: '#9ca3af', borderColor: '#374151' }}>Usuarios</TableCell>
              <TableCell sx={{ color: '#9ca3af', borderColor: '#374151' }}>Estado</TableCell>
              <TableCell sx={{ color: '#9ca3af', borderColor: '#374151' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tenants.map((tenant) => (
              <TableRow key={tenant.id} sx={{ '&:hover': { bgcolor: '#374151' } }}>
                <TableCell sx={{ color: '#f9fafb', borderColor: '#374151' }}>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {tenant.company_name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                      RUT: {tenant.rut}
                    </Typography>
                  </Box>
                </TableCell>
                
                <TableCell sx={{ borderColor: '#374151' }}>
                  <Chip 
                    label={tenant.tipo_tenant}
                    color={tenant.tipo_tenant === 'HOLDING' ? 'primary' : 'default'}
                    size="small"
                    icon={tenant.tipo_tenant === 'HOLDING' ? <HoldingIcon /> : <BusinessIcon />}
                  />
                </TableCell>
                
                <TableCell sx={{ color: '#f9fafb', borderColor: '#374151' }}>
                  {tenant.industry}
                </TableCell>
                
                <TableCell sx={{ borderColor: '#374151' }}>
                  <Badge badgeContent={tenant.subsidiaries?.length || 0} color="primary">
                    <HierarchyIcon sx={{ color: '#9ca3af' }} />
                  </Badge>
                </TableCell>
                
                <TableCell sx={{ color: '#f9fafb', borderColor: '#374151' }}>
                  {users.filter(u => u.tenant_id === tenant.id).length}
                </TableCell>
                
                <TableCell sx={{ borderColor: '#374151' }}>
                  <Chip 
                    label={tenant.estado || 'ACTIVO'}
                    color={tenant.estado === 'ACTIVO' ? 'success' : 'error'}
                    size="small"
                    icon={tenant.estado === 'ACTIVO' ? <ActiveIcon /> : <InactiveIcon />}
                  />
                </TableCell>
                
                <TableCell sx={{ borderColor: '#374151' }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Ver detalles">
                      <IconButton size="small" sx={{ color: '#60a5fa' }}>
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Configurar">
                      <IconButton size="small" sx={{ color: '#fbbf24' }}>
                        <SettingsIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Reportes">
                      <IconButton 
                        size="small" 
                        onClick={() => navigate(`/compliance-metrics?tenant=${tenant.id}`)}
                        sx={{ color: '#8b5cf6' }}
                      >
                        <ReportsIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const renderUsersTab = () => (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ color: '#f9fafb' }}>
          Gestión de Usuarios del Sistema
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setUserDialog(true)}
          sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } }}
        >
          Nuevo Usuario
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ bgcolor: '#1f2937', border: '1px solid #374151' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: '#9ca3af', borderColor: '#374151' }}>Usuario</TableCell>
              <TableCell sx={{ color: '#9ca3af', borderColor: '#374151' }}>Empresa</TableCell>
              <TableCell sx={{ color: '#9ca3af', borderColor: '#374151' }}>Rol</TableCell>
              <TableCell sx={{ color: '#9ca3af', borderColor: '#374151' }}>Permisos</TableCell>
              <TableCell sx={{ color: '#9ca3af', borderColor: '#374151' }}>Estado</TableCell>
              <TableCell sx={{ color: '#9ca3af', borderColor: '#374151' }}>Último Acceso</TableCell>
              <TableCell sx={{ color: '#9ca3af', borderColor: '#374151' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => {
              const tenant = tenants.find(t => t.id === user.tenant_id);
              
              return (
                <TableRow key={user.id} sx={{ '&:hover': { bgcolor: '#374151' } }}>
                  <TableCell sx={{ color: '#f9fafb', borderColor: '#374151' }}>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {user.first_name} {user.last_name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                        {user.email}
                      </Typography>
                    </Box>
                  </TableCell>
                  
                  <TableCell sx={{ color: '#f9fafb', borderColor: '#374151' }}>
                    {tenant?.company_name || 'No asignada'}
                  </TableCell>
                  
                  <TableCell sx={{ borderColor: '#374151' }}>
                    <Chip 
                      label={user.role}
                      color={user.role === 'DPO' ? 'primary' : user.role === 'ADMIN' ? 'error' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  
                  <TableCell sx={{ borderColor: '#374151' }}>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(user.permissions || []).slice(0, 2).map((perm, index) => (
                        <Chip 
                          key={index}
                          label={perm.split('.')[0]}
                          size="small"
                          sx={{ fontSize: '0.7rem', bgcolor: '#374151', color: '#9ca3af' }}
                        />
                      ))}
                      {user.permissions?.length > 2 && (
                        <Chip 
                          label={`+${user.permissions.length - 2}`}
                          size="small"
                          sx={{ fontSize: '0.7rem' }}
                        />
                      )}
                    </Box>
                  </TableCell>
                  
                  <TableCell sx={{ borderColor: '#374151' }}>
                    <FormControlLabel
                      control={
                        <Switch 
                          checked={user.is_active}
                          size="small"
                          sx={{ 
                            '& .MuiSwitch-switchBase.Mui-checked': { color: '#10b981' },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#10b981' }
                          }}
                        />
                      }
                      label=""
                    />
                  </TableCell>
                  
                  <TableCell sx={{ color: '#9ca3af', borderColor: '#374151' }}>
                    {new Date(user.last_login || user.created_at).toLocaleDateString()}
                  </TableCell>
                  
                  <TableCell sx={{ borderColor: '#374151' }}>
                    <IconButton size="small" sx={{ color: '#fbbf24' }}>
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const renderAuditTab = () => (
    <Box>
      <Typography variant="h6" sx={{ color: '#f9fafb', mb: 3 }}>
        Log de Auditoría Administrativa
      </Typography>
      
      <TableContainer component={Paper} sx={{ bgcolor: '#1f2937', border: '1px solid #374151' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: '#9ca3af', borderColor: '#374151' }}>Timestamp</TableCell>
              <TableCell sx={{ color: '#9ca3af', borderColor: '#374151' }}>Usuario</TableCell>
              <TableCell sx={{ color: '#9ca3af', borderColor: '#374151' }}>Acción</TableCell>
              <TableCell sx={{ color: '#9ca3af', borderColor: '#374151' }}>Recurso</TableCell>
              <TableCell sx={{ color: '#9ca3af', borderColor: '#374151' }}>Tenant</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {auditLogs.map((log) => (
              <TableRow key={log.id} sx={{ '&:hover': { bgcolor: '#374151' } }}>
                <TableCell sx={{ color: '#f9fafb', borderColor: '#374151' }}>
                  {new Date(log.timestamp).toLocaleString()}
                </TableCell>
                
                <TableCell sx={{ color: '#f9fafb', borderColor: '#374151' }}>
                  {log.usuario}
                </TableCell>
                
                <TableCell sx={{ borderColor: '#374151' }}>
                  <Chip 
                    label={log.accion}
                    color={log.accion.includes('CREATED') ? 'success' : 
                           log.accion.includes('DELETED') ? 'error' : 'default'}
                    size="small"
                  />
                </TableCell>
                
                <TableCell sx={{ color: '#f9fafb', borderColor: '#374151' }}>
                  {log.recurso}
                </TableCell>
                
                <TableCell sx={{ color: '#9ca3af', borderColor: '#374151' }}>
                  {log.tenant_id}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

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
            <AdminIcon sx={{ fontSize: 40, color: '#ef4444' }} />
            Panel Administrativo Holdings
          </Typography>
          <Typography variant="subtitle1" sx={{ color: '#9ca3af' }}>
            Gestión centralizada de holdings y empresas subsidiarias
          </Typography>
        </Box>

        {/* Dashboard Estadísticas */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={2}>
            <Card sx={{ bgcolor: '#1f2937', border: '1px solid #374151', textAlign: 'center' }}>
              <CardContent sx={{ py: 3 }}>
                <Typography variant="h3" sx={{ color: '#4f46e5', fontWeight: 700 }}>
                  {stats.totalTenants}
                </Typography>
                <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                  Empresas
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <Card sx={{ bgcolor: '#1f2937', border: '1px solid #374151', textAlign: 'center' }}>
              <CardContent sx={{ py: 3 }}>
                <Typography variant="h3" sx={{ color: '#10b981', fontWeight: 700 }}>
                  {stats.activeUsers}
                </Typography>
                <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                  Usuarios Activos
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <Card sx={{ bgcolor: '#1f2937', border: '1px solid #374151', textAlign: 'center' }}>
              <CardContent sx={{ py: 3 }}>
                <Typography variant="h3" sx={{ color: '#60a5fa', fontWeight: 700 }}>
                  {stats.totalRATs}
                </Typography>
                <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                  RATs Total
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <Card sx={{ bgcolor: '#1f2937', border: '1px solid #374151', textAlign: 'center' }}>
              <CardContent sx={{ py: 3 }}>
                <Typography variant="h3" sx={{ color: '#8b5cf6', fontWeight: 700 }}>
                  {stats.complianceScore}%
                </Typography>
                <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                  Compliance Agregado
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <Card sx={{ bgcolor: '#1f2937', border: '1px solid #374151', textAlign: 'center' }}>
              <CardContent sx={{ py: 3 }}>
                <Typography variant="h3" sx={{ color: '#f59e0b', fontWeight: 700 }}>
                  {stats.activeHoldings}
                </Typography>
                <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                  Holdings
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <Card sx={{ bgcolor: '#1f2937', border: '1px solid #374151', textAlign: 'center' }}>
              <CardContent sx={{ py: 3 }}>
                <Badge badgeContent={stats.pendingApprovals} color="error">
                  <Typography variant="h3" sx={{ color: '#ef4444', fontWeight: 700 }}>
                    {stats.pendingApprovals}
                  </Typography>
                </Badge>
                <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                  Pendientes
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs Administración */}
        <Paper sx={{ bgcolor: '#1f2937', border: '1px solid #374151' }}>
          <Tabs 
            value={activeTab} 
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{
              borderBottom: '1px solid #374151',
              '& .MuiTab-root': { color: '#9ca3af' },
              '& .MuiTab-root.Mui-selected': { color: '#ef4444' }
            }}
          >
            <Tab label="Empresas y Holdings" icon={<HoldingIcon />} />
            <Tab label="Usuarios" icon={<UsersIcon />} />
            <Tab label="Auditoría" icon={<AlertIcon />} />
          </Tabs>
          
          <Box sx={{ p: 3 }}>
            {activeTab === 0 && renderTenantsTab()}
            {activeTab === 1 && renderUsersTab()}
            {activeTab === 2 && renderAuditTab()}
          </Box>
        </Paper>

        {/* Información Administrativa */}
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
              🏢 <strong>Panel Super-Admin:</strong> Gestión centralizada de holdings empresariales, 
              configuración multi-tenant y administración de usuarios del sistema.
            </Typography>
          </Alert>
        </Box>
      </Container>

      {/* Dialog Nuevo Tenant */}
      <Dialog
        open={tenantDialog}
        onClose={() => setTenantDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { bgcolor: '#1f2937', border: '1px solid #374151' } }}
      >
        <DialogTitle sx={{ color: '#f9fafb' }}>
          Nueva Empresa / Holding
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nombre de la Empresa"
                value={newTenant.company_name}
                onChange={(e) => setNewTenant(prev => ({ ...prev, company_name: e.target.value }))}
                sx={{
                  '& .MuiOutlinedInput-root': { bgcolor: '#374151', color: '#f9fafb' },
                  '& .MuiInputLabel-root': { color: '#9ca3af' }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="RUT"
                value={newTenant.rut}
                onChange={(e) => setNewTenant(prev => ({ ...prev, rut: e.target.value }))}
                sx={{
                  '& .MuiOutlinedInput-root': { bgcolor: '#374151', color: '#f9fafb' },
                  '& .MuiInputLabel-root': { color: '#9ca3af' }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: '#9ca3af' }}>Tipo de Tenant</InputLabel>
                <Select
                  value={newTenant.tipo_tenant}
                  onChange={(e) => setNewTenant(prev => ({ ...prev, tipo_tenant: e.target.value }))}
                  sx={{ bgcolor: '#374151', color: '#f9fafb' }}
                >
                  <MenuItem value="EMPRESA">Empresa Individual</MenuItem>
                  <MenuItem value="HOLDING">Holding / Grupo</MenuItem>
                  <MenuItem value="SUBSIDIARIA">Empresa Subsidiaria</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: '#9ca3af' }}>Industria</InputLabel>
                <Select
                  value={newTenant.industry}
                  onChange={(e) => setNewTenant(prev => ({ ...prev, industry: e.target.value }))}
                  sx={{ bgcolor: '#374151', color: '#f9fafb' }}
                >
                  <MenuItem value="financiero">Financiero</MenuItem>
                  <MenuItem value="salud">Salud</MenuItem>
                  <MenuItem value="tecnologia">Tecnología</MenuItem>
                  <MenuItem value="retail">Retail</MenuItem>
                  <MenuItem value="manufactura">Manufactura</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTenantDialog(false)} sx={{ color: '#9ca3af' }}>
            Cancelar
          </Button>
          <Button 
            onClick={crearTenant}
            sx={{ bgcolor: '#4f46e5', color: '#fff' }}
          >
            Crear Empresa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;