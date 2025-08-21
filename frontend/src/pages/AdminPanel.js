import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
  Alert,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Switch,
  Divider,
  Badge,
  LinearProgress,
  Tooltip,
  Stack,
  FormControlLabel,
  Checkbox,
  InputAdornment,
} from '@mui/material';
import {
  AdminPanelSettings,
  Business,
  People,
  Add,
  Edit,
  Delete,
  Block,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  Search,
  FilterList,
  Download,
  Upload,
  Settings,
  Security,
  Assignment,
  Assessment,
  TrendingUp,
  Groups,
  Domain,
  PersonAdd,
  Lock,
  LockOpen,
  Email,
  Phone,
  LocationOn,
  CalendarToday,
  VerifiedUser,
  Shield,
  Key,
  Visibility,
  VisibilityOff,
  Refresh,
  Save,
  Cancel,
  Info,
  AttachMoney,
  WorkspacePremium,
  School,
  EmojiEvents,
  Timeline,
  NotificationsActive,
  Backup,
  Restore,
  CloudUpload,
  CloudDownload,
  History,
  PolicyIcon,
} from '@mui/icons-material';
import { 
  adminService, 
  organizacionService, 
  usuarioService,
  reporteService 
} from '../services/api';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Estados para organizaciones
  const [organizaciones, setOrganizaciones] = useState([]);
  const [dialogOrg, setDialogOrg] = useState(false);
  const [orgActual, setOrgActual] = useState({
    id: null,
    nombre: '',
    rut: '',
    direccion: '',
    telefono: '',
    email: '',
    sector: '',
    tamano: '',
    plan: 'basico',
    activo: true,
    fecha_inicio: new Date(),
    fecha_vencimiento: null,
    dpo: {
      nombre: '',
      email: '',
      telefono: ''
    },
    configuracion: {
      max_usuarios: 3,
      modulos_activos: [],
      almacenamiento_gb: 10,
      soporte_prioritario: false
    }
  });
  
  // Estados para usuarios
  const [usuarios, setUsuarios] = useState([]);
  const [dialogUser, setDialogUser] = useState(false);
  const [userActual, setUserActual] = useState({
    id: null,
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    organizacion_id: '',
    rol: 'usuario',
    activo: true,
    password: '',
    confirmar_password: '',
    permisos: []
  });
  
  // Estados para estadísticas
  const [estadisticas, setEstadisticas] = useState({
    total_organizaciones: 0,
    organizaciones_activas: 0,
    total_usuarios: 0,
    usuarios_activos: 0,
    actividades_rat: 0,
    modulos_completados: 0,
    certificados_emitidos: 0,
    almacenamiento_usado_gb: 0
  });
  
  // Estados para configuración
  const [configuracion, setConfiguracion] = useState({
    nombre_sistema: 'Sistema LPDP Chile',
    version: '3.0.0',
    email_soporte: 'soporte@juridicadigital.cl',
    telefono_soporte: '+56 2 2345 6789',
    modo_mantenimiento: false,
    mensaje_mantenimiento: '',
    permitir_registro: true,
    requiere_aprobacion: true,
    dias_prueba: 30,
    notificaciones_email: true,
    backup_automatico: true,
    frecuencia_backup: 'diario',
    retencion_logs_dias: 90
  });
  
  // Estados para logs
  const [logs, setLogs] = useState([]);
  const [filtrosLogs, setFiltrosLogs] = useState({
    fecha_desde: '',
    fecha_hasta: '',
    tipo: 'todos',
    usuario: '',
    organizacion: ''
  });
  
  // Estados auxiliares
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    action: null
  });

  // Cargar datos al montar
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      // Cargar organizaciones
      const orgsData = await adminService.getOrganizaciones();
      setOrganizaciones(orgsData);
      
      // Cargar usuarios
      const usersData = await adminService.getUsuarios();
      setUsuarios(usersData);
      
      // Cargar estadísticas
      const statsData = await adminService.getDashboard();
      setEstadisticas(statsData);
      
      // Cargar configuración
      const configData = await adminService.getConfiguracion();
      setConfiguracion(configData);
      
      // Cargar logs recientes
      const logsData = await adminService.getLogs({ limite: 100 });
      setLogs(logsData);
    } catch (error) {
      console.error('Error cargando datos:', error);
      mostrarMensaje('Error al cargar datos', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Funciones para organizaciones
  const guardarOrganizacion = async () => {
    try {
      if (orgActual.id) {
        await adminService.actualizarOrganizacion(orgActual.id, orgActual);
        mostrarMensaje('Organización actualizada exitosamente', 'success');
      } else {
        await adminService.crearOrganizacion(orgActual);
        mostrarMensaje('Organización creada exitosamente', 'success');
      }
      setDialogOrg(false);
      cargarDatos();
      resetFormOrg();
    } catch (error) {
      console.error('Error guardando organización:', error);
      mostrarMensaje('Error al guardar organización', 'error');
    }
  };

  const desactivarOrganizacion = async (id) => {
    try {
      await adminService.desactivarOrganizacion(id);
      mostrarMensaje('Organización desactivada', 'success');
      cargarDatos();
    } catch (error) {
      console.error('Error desactivando organización:', error);
      mostrarMensaje('Error al desactivar organización', 'error');
    }
  };

  const resetFormOrg = () => {
    setOrgActual({
      id: null,
      nombre: '',
      rut: '',
      direccion: '',
      telefono: '',
      email: '',
      sector: '',
      tamano: '',
      plan: 'basico',
      activo: true,
      fecha_inicio: new Date(),
      fecha_vencimiento: null,
      dpo: {
        nombre: '',
        email: '',
        telefono: ''
      },
      configuracion: {
        max_usuarios: 3,
        modulos_activos: [],
        almacenamiento_gb: 10,
        soporte_prioritario: false
      }
    });
  };

  // Funciones para usuarios
  const guardarUsuario = async () => {
    // Validar passwords
    if (!userActual.id && userActual.password !== userActual.confirmar_password) {
      mostrarMensaje('Las contraseñas no coinciden', 'error');
      return;
    }
    
    try {
      if (userActual.id) {
        await adminService.actualizarUsuario(userActual.id, userActual);
        mostrarMensaje('Usuario actualizado exitosamente', 'success');
      } else {
        await adminService.crearUsuario(userActual);
        mostrarMensaje('Usuario creado exitosamente', 'success');
      }
      setDialogUser(false);
      cargarDatos();
      resetFormUser();
    } catch (error) {
      console.error('Error guardando usuario:', error);
      mostrarMensaje('Error al guardar usuario', 'error');
    }
  };

  const desactivarUsuario = async (id) => {
    try {
      await adminService.desactivarUsuario(id);
      mostrarMensaje('Usuario desactivado', 'success');
      cargarDatos();
    } catch (error) {
      console.error('Error desactivando usuario:', error);
      mostrarMensaje('Error al desactivar usuario', 'error');
    }
  };

  const resetPasswordUsuario = async (userId) => {
    try {
      const result = await adminService.resetPassword(userId);
      mostrarMensaje(`Nueva contraseña: ${result.new_password}`, 'info');
    } catch (error) {
      console.error('Error reseteando contraseña:', error);
      mostrarMensaje('Error al resetear contraseña', 'error');
    }
  };

  const resetFormUser = () => {
    setUserActual({
      id: null,
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      organizacion_id: '',
      rol: 'usuario',
      activo: true,
      password: '',
      confirmar_password: '',
      permisos: []
    });
  };

  // Funciones de configuración
  const guardarConfiguracion = async () => {
    try {
      await adminService.actualizarConfiguracion(configuracion);
      mostrarMensaje('Configuración actualizada exitosamente', 'success');
    } catch (error) {
      console.error('Error guardando configuración:', error);
      mostrarMensaje('Error al guardar configuración', 'error');
    }
  };

  // Funciones de respaldo
  const crearRespaldo = async () => {
    try {
      setLoading(true);
      const result = await adminService.crearRespaldo();
      mostrarMensaje(`Respaldo creado: ${result.filename}`, 'success');
    } catch (error) {
      console.error('Error creando respaldo:', error);
      mostrarMensaje('Error al crear respaldo', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Utilidades
  const mostrarMensaje = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const getPlanChip = (plan) => {
    const config = {
      basico: { label: 'Básico', color: 'default' },
      profesional: { label: 'Profesional', color: 'primary' },
      empresa: { label: 'Empresa', color: 'secondary' },
      premium: { label: 'Premium', color: 'success' }
    };
    return config[plan] || config.basico;
  };

  const getRolChip = (rol) => {
    const config = {
      super_admin: { label: 'Super Admin', color: 'error', icon: <Shield /> },
      admin: { label: 'Admin', color: 'warning', icon: <AdminPanelSettings /> },
      dpo: { label: 'DPO', color: 'primary', icon: <VerifiedUser /> },
      usuario: { label: 'Usuario', color: 'default', icon: <People /> }
    };
    return config[rol] || config.usuario;
  };

  // Componente Dashboard
  const Dashboard = () => (
    <Grid container spacing={3}>
      {/* Estadísticas principales */}
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                <Business />
              </Avatar>
              <Box>
                <Typography variant="h4">{estadisticas.total_organizaciones}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Organizaciones
                </Typography>
              </Box>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={(estadisticas.organizaciones_activas / estadisticas.total_organizaciones) * 100}
            />
            <Typography variant="caption">
              {estadisticas.organizaciones_activas} activas
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                <People />
              </Avatar>
              <Box>
                <Typography variant="h4">{estadisticas.total_usuarios}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Usuarios
                </Typography>
              </Box>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={(estadisticas.usuarios_activos / estadisticas.total_usuarios) * 100}
              color="success"
            />
            <Typography variant="caption">
              {estadisticas.usuarios_activos} activos
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                <Assignment />
              </Avatar>
              <Box>
                <Typography variant="h4">{estadisticas.actividades_rat}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Actividades RAT
                </Typography>
              </Box>
            </Box>
            <Chip 
              label={`${estadisticas.modulos_completados} módulos completados`}
              size="small"
              color="warning"
            />
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'error.main', mr: 2 }}>
                <WorkspacePremium />
              </Avatar>
              <Box>
                <Typography variant="h4">{estadisticas.certificados_emitidos}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Certificados
                </Typography>
              </Box>
            </Box>
            <Chip 
              label="DPO Certificados"
              size="small"
              color="error"
              icon={<EmojiEvents />}
            />
          </CardContent>
        </Card>
      </Grid>

      {/* Gráficos y actividad reciente */}
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Actividad Reciente
            </Typography>
            <List>
              {logs.slice(0, 5).map((log, index) => (
                <ListItem key={index}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: log.tipo === 'error' ? 'error.main' : 'primary.main' }}>
                      {log.tipo === 'error' ? <ErrorIcon /> : <Info />}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={log.descripcion}
                    secondary={`${log.usuario} - ${new Date(log.fecha).toLocaleString()}`}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Acciones Rápidas
            </Typography>
            <Stack spacing={2}>
              <Button
                variant="contained"
                startIcon={<Business />}
                onClick={() => setDialogOrg(true)}
                fullWidth
              >
                Nueva Organización
              </Button>
              <Button
                variant="contained"
                startIcon={<PersonAdd />}
                onClick={() => setDialogUser(true)}
                fullWidth
                color="success"
              >
                Nuevo Usuario
              </Button>
              <Button
                variant="outlined"
                startIcon={<Backup />}
                onClick={crearRespaldo}
                fullWidth
              >
                Crear Respaldo
              </Button>
              <Button
                variant="outlined"
                startIcon={<Download />}
                fullWidth
              >
                Exportar Reportes
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  // Componente Organizaciones
  const OrganizacionesTab = () => (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <TextField
          placeholder="Buscar organización..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ width: 300 }}
        />
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setDialogOrg(true)}
        >
          Nueva Organización
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Organización</TableCell>
              <TableCell>RUT</TableCell>
              <TableCell>Plan</TableCell>
              <TableCell>Usuarios</TableCell>
              <TableCell>DPO</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Vencimiento</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {organizaciones
              .filter(org => 
                org.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                org.rut.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((org) => (
                <TableRow key={org.id}>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2">{org.nombre}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {org.email}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{org.rut}</TableCell>
                  <TableCell>
                    <Chip 
                      label={getPlanChip(org.plan).label}
                      color={getPlanChip(org.plan).color}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {org.usuarios_activos}/{org.configuracion?.max_usuarios || 3}
                  </TableCell>
                  <TableCell>
                    {org.dpo?.nombre ? (
                      <Chip 
                        label={org.dpo.nombre}
                        size="small"
                        icon={<VerifiedUser />}
                        color="primary"
                      />
                    ) : (
                      <Chip 
                        label="No asignado"
                        size="small"
                        color="default"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={org.activo ? 'Activa' : 'Inactiva'}
                      color={org.activo ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {org.fecha_vencimiento ? 
                      new Date(org.fecha_vencimiento).toLocaleDateString() : 
                      'Sin vencimiento'
                    }
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      size="small"
                      onClick={() => {
                        setOrgActual(org);
                        setDialogOrg(true);
                      }}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton 
                      size="small"
                      onClick={() => desactivarOrganizacion(org.id)}
                      disabled={!org.activo}
                    >
                      <Block />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  // Componente Usuarios
  const UsuariosTab = () => (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <TextField
          placeholder="Buscar usuario..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ width: 300 }}
        />
        <Button
          variant="contained"
          startIcon={<PersonAdd />}
          onClick={() => setDialogUser(true)}
        >
          Nuevo Usuario
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Usuario</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Organización</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell>Último Acceso</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {usuarios
              .filter(user => 
                user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 2 }}>
                        {user.first_name?.[0]}{user.last_name?.[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2">
                          {user.first_name} {user.last_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          @{user.username}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.organizacion?.nombre || 'N/A'}</TableCell>
                  <TableCell>
                    <Chip 
                      label={getRolChip(user.rol).label}
                      color={getRolChip(user.rol).color}
                      size="small"
                      icon={getRolChip(user.rol).icon}
                    />
                  </TableCell>
                  <TableCell>
                    {user.ultimo_acceso ? 
                      new Date(user.ultimo_acceso).toLocaleString() : 
                      'Nunca'
                    }
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={user.activo ? 'Activo' : 'Inactivo'}
                      color={user.activo ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      size="small"
                      onClick={() => {
                        setUserActual(user);
                        setDialogUser(true);
                      }}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton 
                      size="small"
                      onClick={() => resetPasswordUsuario(user.id)}
                    >
                      <Key />
                    </IconButton>
                    <IconButton 
                      size="small"
                      onClick={() => desactivarUsuario(user.id)}
                      disabled={!user.activo}
                    >
                      <Block />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  // Componente Configuración
  const ConfiguracionTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Configuración General
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nombre del Sistema"
                  value={configuracion.nombre_sistema}
                  onChange={(e) => setConfiguracion({...configuracion, nombre_sistema: e.target.value})}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email de Soporte"
                  value={configuracion.email_soporte}
                  onChange={(e) => setConfiguracion({...configuracion, email_soporte: e.target.value})}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Teléfono de Soporte"
                  value={configuracion.telefono_soporte}
                  onChange={(e) => setConfiguracion({...configuracion, telefono_soporte: e.target.value})}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={configuracion.modo_mantenimiento}
                      onChange={(e) => setConfiguracion({...configuracion, modo_mantenimiento: e.target.checked})}
                    />
                  }
                  label="Modo Mantenimiento"
                />
              </Grid>
              {configuracion.modo_mantenimiento && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Mensaje de Mantenimiento"
                    value={configuracion.mensaje_mantenimiento}
                    onChange={(e) => setConfiguracion({...configuracion, mensaje_mantenimiento: e.target.value})}
                  />
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Configuración de Seguridad
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={configuracion.permitir_registro}
                      onChange={(e) => setConfiguracion({...configuracion, permitir_registro: e.target.checked})}
                    />
                  }
                  label="Permitir Auto-registro"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={configuracion.requiere_aprobacion}
                      onChange={(e) => setConfiguracion({...configuracion, requiere_aprobacion: e.target.checked})}
                    />
                  }
                  label="Requiere Aprobación de Admin"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="number"
                  label="Días de Prueba"
                  value={configuracion.dias_prueba}
                  onChange={(e) => setConfiguracion({...configuracion, dias_prueba: parseInt(e.target.value)})}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="number"
                  label="Retención de Logs (días)"
                  value={configuracion.retencion_logs_dias}
                  onChange={(e) => setConfiguracion({...configuracion, retencion_logs_dias: parseInt(e.target.value)})}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Respaldos y Recuperación
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={configuracion.backup_automatico}
                      onChange={(e) => setConfiguracion({...configuracion, backup_automatico: e.target.checked})}
                    />
                  }
                  label="Respaldo Automático"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Frecuencia de Respaldo</InputLabel>
                  <Select
                    value={configuracion.frecuencia_backup}
                    onChange={(e) => setConfiguracion({...configuracion, frecuencia_backup: e.target.value})}
                  >
                    <MenuItem value="diario">Diario</MenuItem>
                    <MenuItem value="semanal">Semanal</MenuItem>
                    <MenuItem value="mensual">Mensual</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    startIcon={<Backup />}
                    onClick={crearRespaldo}
                  >
                    Crear Respaldo Manual
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Restore />}
                  >
                    Restaurar desde Respaldo
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={guardarConfiguracion}
            size="large"
          >
            Guardar Configuración
          </Button>
        </Box>
      </Grid>
    </Grid>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <CardContent>
          <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'white' }}>
            <AdminPanelSettings /> Panel de Administración
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9, color: 'white' }}>
            Gestión completa del Sistema LPDP - Ley 21.719
          </Typography>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Dashboard" icon={<Assessment />} iconPosition="start" />
          <Tab label="Organizaciones" icon={<Business />} iconPosition="start" />
          <Tab label="Usuarios" icon={<People />} iconPosition="start" />
          <Tab label="Configuración" icon={<Settings />} iconPosition="start" />
        </Tabs>
      </Paper>

      {/* Contenido según tab activa */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <LoadingIndicator />
        </Box>
      ) : (
        <>
          {activeTab === 0 && <Dashboard />}
          {activeTab === 1 && <OrganizacionesTab />}
          {activeTab === 2 && <UsuariosTab />}
          {activeTab === 3 && <ConfiguracionTab />}
        </>
      )}

      {/* Dialog Organización */}
      <Dialog open={dialogOrg} onClose={() => setDialogOrg(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {orgActual.id ? 'Editar' : 'Nueva'} Organización
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nombre"
                value={orgActual.nombre}
                onChange={(e) => setOrgActual({...orgActual, nombre: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="RUT"
                value={orgActual.rut}
                onChange={(e) => setOrgActual({...orgActual, rut: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={orgActual.email}
                onChange={(e) => setOrgActual({...orgActual, email: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Teléfono"
                value={orgActual.telefono}
                onChange={(e) => setOrgActual({...orgActual, telefono: e.target.value})}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Dirección"
                value={orgActual.direccion}
                onChange={(e) => setOrgActual({...orgActual, direccion: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Sector</InputLabel>
                <Select
                  value={orgActual.sector}
                  onChange={(e) => setOrgActual({...orgActual, sector: e.target.value})}
                >
                  <MenuItem value="acuicultura">Acuicultura</MenuItem>
                  <MenuItem value="manufactura">Manufactura</MenuItem>
                  <MenuItem value="servicios">Servicios</MenuItem>
                  <MenuItem value="retail">Retail</MenuItem>
                  <MenuItem value="salud">Salud</MenuItem>
                  <MenuItem value="educacion">Educación</MenuItem>
                  <MenuItem value="tecnologia">Tecnología</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Plan</InputLabel>
                <Select
                  value={orgActual.plan}
                  onChange={(e) => setOrgActual({...orgActual, plan: e.target.value})}
                >
                  <MenuItem value="basico">Básico (3 usuarios)</MenuItem>
                  <MenuItem value="profesional">Profesional (10 usuarios)</MenuItem>
                  <MenuItem value="empresa">Empresa (50 usuarios)</MenuItem>
                  <MenuItem value="premium">Premium (Ilimitado)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" gutterBottom>
                Datos del DPO
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Nombre DPO"
                value={orgActual.dpo.nombre}
                onChange={(e) => setOrgActual({
                  ...orgActual, 
                  dpo: {...orgActual.dpo, nombre: e.target.value}
                })}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Email DPO"
                value={orgActual.dpo.email}
                onChange={(e) => setOrgActual({
                  ...orgActual, 
                  dpo: {...orgActual.dpo, email: e.target.value}
                })}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Teléfono DPO"
                value={orgActual.dpo.telefono}
                onChange={(e) => setOrgActual({
                  ...orgActual, 
                  dpo: {...orgActual.dpo, telefono: e.target.value}
                })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setDialogOrg(false);
            resetFormOrg();
          }}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={guardarOrganizacion}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Usuario */}
      <Dialog open={dialogUser} onClose={() => setDialogUser(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {userActual.id ? 'Editar' : 'Nuevo'} Usuario
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nombre de Usuario"
                value={userActual.username}
                onChange={(e) => setUserActual({...userActual, username: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={userActual.email}
                onChange={(e) => setUserActual({...userActual, email: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nombre"
                value={userActual.first_name}
                onChange={(e) => setUserActual({...userActual, first_name: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Apellido"
                value={userActual.last_name}
                onChange={(e) => setUserActual({...userActual, last_name: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Organización</InputLabel>
                <Select
                  value={userActual.organizacion_id}
                  onChange={(e) => setUserActual({...userActual, organizacion_id: e.target.value})}
                >
                  {organizaciones.map(org => (
                    <MenuItem key={org.id} value={org.id}>{org.nombre}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Rol</InputLabel>
                <Select
                  value={userActual.rol}
                  onChange={(e) => setUserActual({...userActual, rol: e.target.value})}
                >
                  <MenuItem value="usuario">Usuario</MenuItem>
                  <MenuItem value="dpo">DPO</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="super_admin">Super Admin</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {!userActual.id && (
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Contraseña"
                    type={showPassword ? 'text' : 'password'}
                    value={userActual.password}
                    onChange={(e) => setUserActual({...userActual, password: e.target.value})}
                    required
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Confirmar Contraseña"
                    type={showPassword ? 'text' : 'password'}
                    value={userActual.confirmar_password}
                    onChange={(e) => setUserActual({...userActual, confirmar_password: e.target.value})}
                    required
                  />
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setDialogUser(false);
            resetFormUser();
          }}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={guardarUsuario}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notificaciones */}
      <NotificationSnackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({...snackbar, open: false})}
      >
        <Alert 
          onClose={() => setSnackbar({...snackbar, open: false})} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </NotificationSnackbar>
    </Box>
  );
};

// Componentes auxiliares
const LoadingIndicator = () => <div>Cargando...</div>;
const NotificationSnackbar = ({ open, autoHideDuration, onClose, children }) => {
  if (!open) return null;
  setTimeout(onClose, autoHideDuration);
  return <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999 }}>{children}</div>;
};

export default AdminPanel;