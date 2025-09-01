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
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Grid,
  Divider,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  VpnKey as PasswordIcon,
  PersonAdd as AddUserIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Email as EmailIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  Save as SaveIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { supabase } from '../../config/supabaseClient';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  
  // Estados para diálogos
  const [resetPasswordDialog, setResetPasswordDialog] = useState({ open: false, user: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, user: null });
  const [createUserDialog, setCreateUserDialog] = useState({ open: false });
  const [editUserDialog, setEditUserDialog] = useState({ open: false, user: null });
  
  // Estados para notificaciones
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  // Estados para formularios
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    rut: '',
    phone: '',
    department: '',
    position: '',
    is_active: true,
    is_dpo: false,
    role_codes: []
  });

  const [editUser, setEditUser] = useState({
    email: '',
    first_name: '',
    last_name: '',
    rut: '',
    phone: '',
    department: '',
    position: '',
    is_active: true,
    is_dpo: false,
    role_codes: []
  });

  useEffect(() => {
    loadUsers();
    loadRoles();
  }, [page, rowsPerPage]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No autenticado');
      
      // Primero obtener el conteo total
      const countResponse = await fetch(
        `${API_BASE_URL}/api/v1/users?skip=0&limit=1000`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Tenant-ID': tenantId,
          },
        }
      );

      if (countResponse.ok) {
        const allUsers = await countResponse.json();
        setTotalUsers(allUsers.length);
      }

      // Luego obtener los usuarios para la página actual
      const response = await fetch(
        `${API_BASE_URL}/api/v1/users?skip=${page * rowsPerPage}&limit=${rowsPerPage}${searchTerm ? `&search=${searchTerm}` : ''}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Tenant-ID': tenantId,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Error al cargar usuarios');
      }

      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
      showNotification('Error al cargar usuarios', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No autenticado');
      
      const response = await fetch(
        `${API_BASE_URL}/api/v1/users/roles/`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Tenant-ID': tenantId,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setRoles(data);
      }
    } catch (error) {
      console.error('Error loading roles:', error);
    }
  };

  const handleCreateUser = async () => {
    try {
      // Validaciones
      if (newUser.password !== newUser.confirmPassword) {
        showNotification('Las contraseñas no coinciden', 'error');
        return;
      }

      if (newUser.password.length < 8) {
        showNotification('La contraseña debe tener al menos 8 caracteres', 'error');
        return;
      }

      if (!newUser.username.trim()) {
        showNotification('El username es obligatorio', 'error');
        return;
      }

      if (!newUser.email.trim()) {
        showNotification('El email es obligatorio', 'error');
        return;
      }

      // Validar formato de email básico
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newUser.email)) {
        showNotification('El formato del email no es válido', 'error');
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No autenticado');
      
      const userData = {
        username: newUser.username.trim(),
        email: newUser.email.trim(),
        password: newUser.password,
        first_name: newUser.first_name.trim() || null,
        last_name: newUser.last_name.trim() || null,
        rut: newUser.rut.trim() || null,
        phone: newUser.phone.trim() || null,
        department: newUser.department.trim() || null,
        position: newUser.position.trim() || null,
        is_active: newUser.is_active,
        is_dpo: newUser.is_dpo,
        role_codes: newUser.role_codes
      };

      const response = await fetch(
        `${API_BASE_URL}/api/v1/users/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Tenant-ID': tenantId,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al crear usuario');
      }

      showNotification('Usuario creado exitosamente', 'success');
      setCreateUserDialog({ open: false });
      resetNewUserForm();
      loadUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      showNotification(error.message, 'error');
    }
  };

  const handleUpdateUser = async () => {
    try {
      if (!editUser.email.trim()) {
        showNotification('El email es obligatorio', 'error');
        return;
      }

      // Validar formato de email básico
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editUser.email)) {
        showNotification('El formato del email no es válido', 'error');
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No autenticado');
      
      const userData = {
        email: editUser.email.trim(),
        first_name: editUser.first_name.trim() || null,
        last_name: editUser.last_name.trim() || null,
        rut: editUser.rut.trim() || null,
        phone: editUser.phone.trim() || null,
        department: editUser.department.trim() || null,
        position: editUser.position.trim() || null,
        is_active: editUser.is_active,
        is_dpo: editUser.is_dpo,
        role_codes: editUser.role_codes
      };

      const response = await fetch(
        `${API_BASE_URL}/api/v1/users/${editUserDialog.user.id}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Tenant-ID': tenantId,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al actualizar usuario');
      }

      showNotification('Usuario actualizado exitosamente', 'success');
      setEditUserDialog({ open: false, user: null });
      loadUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      showNotification(error.message, 'error');
    }
  };

  const handleResetPassword = async (user) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No autenticado');
      
      const response = await fetch(
        `${API_BASE_URL}/api/v1/users/${user.id}/reset-password`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Tenant-ID': tenantId,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Error al resetear contraseña');
      }

      const result = await response.json();
      
      if (result.success) {
        showNotification(
          `Contraseña reseteada exitosamente. ${result.email_sent ? 'Se envió un email al usuario.' : 'No se pudo enviar el email.'}`,
          'success'
        );
      }
    } catch (error) {
      console.error('Error al resetear contraseña');
      showNotification('Error al resetear contraseña', 'error');
    } finally {
      setResetPasswordDialog({ open: false, user: null });
    }
  };

  const handleDeleteUser = async (user) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No autenticado');
      
      const response = await fetch(
        `${API_BASE_URL}/api/v1/users/${user.id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Tenant-ID': tenantId,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Error al eliminar usuario');
      }

      showNotification('Usuario eliminado exitosamente', 'success');
      loadUsers(); // Recargar lista
    } catch (error) {
      console.error('Error deleting user:', error);
      showNotification('Error al eliminar usuario', 'error');
    } finally {
      setDeleteDialog({ open: false, user: null });
    }
  };

  const handleSearch = () => {
    setPage(0); // Resetear a primera página
    loadUsers();
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

  const resetNewUserForm = () => {
    setNewUser({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      first_name: '',
      last_name: '',
      rut: '',
      phone: '',
      department: '',
      position: '',
      is_active: true,
      is_dpo: false,
      role_codes: []
    });
  };

  const openEditDialog = (user) => {
    setEditUser({
      email: user.email,
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      rut: user.rut || '',
      phone: user.phone || '',
      department: user.department || '',
      position: user.position || '',
      is_active: user.is_active,
      is_dpo: user.is_dpo || false,
      role_codes: user.roles?.map(r => r.code) || []
    });
    setEditUserDialog({ open: true, user });
  };

  const handleRoleChange = (roleCode, checked) => {
    if (checked) {
      setNewUser(prev => ({
        ...prev,
        role_codes: [...prev.role_codes, roleCode]
      }));
    } else {
      setNewUser(prev => ({
        ...prev,
        role_codes: prev.role_codes.filter(code => code !== roleCode)
      }));
    }
  };

  const handleEditRoleChange = (roleCode, checked) => {
    if (checked) {
      setEditUser(prev => ({
        ...prev,
        role_codes: [...prev.role_codes, roleCode]
      }));
    } else {
      setEditUser(prev => ({
        ...prev,
        role_codes: prev.role_codes.filter(code => code !== roleCode)
      }));
    }
  };

  return (
    <Box>
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5" component="h2">
              Gestión de Usuarios
            </Typography>
            <Box display="flex" gap={2}>
              <Button
                variant="contained"
                startIcon={<AddUserIcon />}
                onClick={() => setCreateUserDialog({ open: true })}
              >
                Nuevo Usuario
              </Button>
              <IconButton onClick={loadUsers} color="primary">
                <RefreshIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Barra de búsqueda */}
          <Box mb={3}>
            <TextField
              fullWidth
              placeholder="Buscar por nombre, email o username..."
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
          </Box>

          {/* Tabla de usuarios */}
          {loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Usuario</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Nombre</TableCell>
                    <TableCell>RUT</TableCell>
                    <TableCell>Teléfono</TableCell>
                    <TableCell>Departamento/Cargo</TableCell>
                    <TableCell>Roles</TableCell>
                    <TableCell align="center">Estado</TableCell>
                    <TableCell>Último Acceso</TableCell>
                    <TableCell>Creado</TableCell>
                    <TableCell align="center">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <EmailIcon fontSize="small" color="action" />
                          <Tooltip title={`Usuario: ${user.username}`}>
                            <span>{user.email}</span>
                          </Tooltip>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          {user.first_name} {user.last_name}
                          {user.is_dpo && (
                            <Tooltip title="Data Protection Officer - Responsable de la protección de datos personales">
                              <Chip
                                label="DPO"
                                size="small"
                                color="secondary"
                                variant="outlined"
                              />
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          {user.rut ? (
                            <Tooltip title={`RUT: ${user.rut}`}>
                              <span>{user.rut}</span>
                            </Tooltip>
                          ) : (
                            <span style={{ color: 'text.secondary', fontStyle: 'italic' }}>No especificado</span>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          {user.phone ? (
                            <Tooltip title={`Teléfono: ${user.phone}`}>
                              <span>{user.phone}</span>
                            </Tooltip>
                          ) : (
                            <span style={{ color: 'text.secondary', fontStyle: 'italic' }}>No especificado</span>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          {user.department && user.position ? (
                            <Tooltip title={`Departamento: ${user.department}\nCargo: ${user.position}`}>
                              <span>{user.department} / {user.position}</span>
                            </Tooltip>
                          ) : (
                            <span style={{ color: 'text.secondary', fontStyle: 'italic' }}>No especificado</span>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={0.5} flexWrap="wrap">
                          {user.roles?.map((role) => (
                            <Chip
                              key={role.code}
                              label={role.name}
                              size="small"
                              color={role.code === 'admin' ? 'primary' : 'default'}
                            />
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        {user.is_active ? (
                          <Chip
                            icon={<ActiveIcon />}
                            label="Activo"
                            color="success"
                            size="small"
                          />
                        ) : (
                          <Chip
                            icon={<InactiveIcon />}
                            label="Inactivo"
                            color="error"
                            size="small"
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        {user.last_login 
                          ? new Date(user.last_login).toLocaleDateString('es-CL', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : 'Nunca'
                        }
                      </TableCell>
                      <TableCell>
                        {user.created_at 
                          ? new Date(user.created_at).toLocaleDateString('es-CL', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })
                          : 'N/A'
                        }
                      </TableCell>
                      <TableCell align="center">
                        <Box display="flex" gap={1} justifyContent="center">
                          <Tooltip title="Editar usuario">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => openEditDialog(user)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Resetear contraseña">
                            <IconButton
                              size="small"
                              color="warning"
                              onClick={() => setResetPasswordDialog({ open: true, user })}
                            >
                              <PasswordIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Eliminar usuario">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => setDeleteDialog({ open: true, user })}
                              disabled={user.username === 'admin'} // No permitir eliminar admin
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
                count={totalUsers}
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

      {/* Diálogo de creación de usuario */}
      <Dialog
        open={createUserDialog.open}
        onClose={() => setCreateUserDialog({ open: false })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Crear Nuevo Usuario</Typography>
            <IconButton onClick={() => setCreateUserDialog({ open: false })}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Username *"
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email *"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Contraseña *"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                required
                helperText="Mínimo 8 caracteres"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Confirmar Contraseña *"
                type="password"
                value={newUser.confirmPassword}
                onChange={(e) => setNewUser({ ...newUser, confirmPassword: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nombre"
                value={newUser.first_name}
                onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Apellido"
                value={newUser.last_name}
                onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="RUT"
                value={newUser.rut}
                onChange={(e) => setNewUser({ ...newUser, rut: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Teléfono"
                value={newUser.phone}
                onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Departamento"
                value={newUser.department}
                onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Cargo"
                value={newUser.position}
                onChange={(e) => setNewUser({ ...newUser, position: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" gutterBottom>
                Configuración
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={newUser.is_active}
                    onChange={(e) => setNewUser({ ...newUser, is_active: e.target.checked })}
                  />
                }
                label="Usuario Activo"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={newUser.is_dpo}
                    onChange={(e) => setNewUser({ ...newUser, is_dpo: e.target.checked })}
                  />
                }
                label="Data Protection Officer (DPO)"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Roles
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap">
                {roles.map((role) => (
                  <FormControlLabel
                    key={role.code}
                    control={
                      <Checkbox
                        checked={newUser.role_codes.includes(role.code)}
                        onChange={(e) => handleRoleChange(role.code, e.target.checked)}
                      />
                    }
                    label={role.name}
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateUserDialog({ open: false })}>
            Cancelar
          </Button>
          <Button 
            onClick={handleCreateUser}
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={!newUser.username || !newUser.email || !newUser.password || newUser.password !== newUser.confirmPassword}
          >
            Crear Usuario
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de edición de usuario */}
      <Dialog
        open={editUserDialog.open}
        onClose={() => setEditUserDialog({ open: false, user: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Editar Usuario: {editUserDialog.user?.username}</Typography>
            <IconButton onClick={() => setEditUserDialog({ open: false, user: null })}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email *"
                type="email"
                value={editUser.email}
                onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nombre"
                value={editUser.first_name}
                onChange={(e) => setEditUser({ ...editUser, first_name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Apellido"
                value={editUser.last_name}
                onChange={(e) => setEditUser({ ...editUser, last_name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="RUT"
                value={editUser.rut}
                onChange={(e) => setEditUser({ ...editUser, rut: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Teléfono"
                value={editUser.phone}
                onChange={(e) => setEditUser({ ...editUser, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Departamento"
                value={editUser.department}
                onChange={(e) => setEditUser({ ...editUser, department: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Cargo"
                value={editUser.position}
                onChange={(e) => setEditUser({ ...editUser, position: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" gutterBottom>
                Configuración
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={editUser.is_active}
                    onChange={(e) => setEditUser({ ...editUser, is_active: e.target.checked })}
                  />
                }
                label="Usuario Activo"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={editUser.is_dpo}
                    onChange={(e) => setEditUser({ ...editUser, is_dpo: e.target.checked })}
                  />
                }
                label="Data Protection Officer (DPO)"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Roles
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap">
                {roles.map((role) => (
                  <FormControlLabel
                    key={role.code}
                    control={
                      <Checkbox
                        checked={editUser.role_codes.includes(role.code)}
                        onChange={(e) => handleEditRoleChange(role.code, e.target.checked)}
                      />
                    }
                    label={role.name}
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditUserDialog({ open: false, user: null })}>
            Cancelar
          </Button>
          <Button 
            onClick={handleUpdateUser}
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={!editUser.email}
          >
            Guardar Cambios
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de confirmación para resetear contraseña */}
      <Dialog
        open={resetPasswordDialog.open}
        onClose={() => setResetPasswordDialog({ open: false, user: null })}
      >
        <DialogTitle>Resetear Contraseña</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas resetear la contraseña del usuario{' '}
            <strong>{resetPasswordDialog.user?.username}</strong>?
          </DialogContentText>
          <Alert severity="info" sx={{ mt: 2 }}>
            Se generará una nueva contraseña y se enviará al email del usuario:
            <br />
            <strong>{resetPasswordDialog.user?.email}</strong>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetPasswordDialog({ open: false, user: null })}>
            Cancelar
          </Button>
          <Button 
            onClick={() => handleResetPassword(resetPasswordDialog.user)}
            color="warning"
            variant="contained"
          >
            Resetear Contraseña
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de confirmación para eliminar */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, user: null })}
      >
        <DialogTitle>Eliminar Usuario</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar al usuario{' '}
            <strong>{deleteDialog.user?.username}</strong>?
          </DialogContentText>
          <Alert severity="error" sx={{ mt: 2 }}>
            Esta acción no se puede deshacer.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, user: null })}>
            Cancelar
          </Button>
          <Button 
            onClick={() => handleDeleteUser(deleteDialog.user)}
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

export default UserManagement;
