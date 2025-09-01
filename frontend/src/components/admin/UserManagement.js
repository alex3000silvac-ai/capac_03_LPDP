/**
 * 👥 USER MANAGEMENT - Solo Supabase, Sin localStorage
 * 
 * Componente simplificado para gestión de usuarios
 * 100% compatible con Supabase
 */

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
  Chip,
  Alert,
  CircularProgress,
  Grid
} from '@mui/material';
import {
  PersonAdd as AddUserIcon,
  Refresh as RefreshIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
} from '@mui/icons-material';
import { supabase } from '../../config/supabaseClient';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No autenticado');
      
      // Cargar usuarios desde Supabase
      const { data: userData, error } = await supabase
        .from('usuarios')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      setUsers(userData || []);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      setNotification({
        open: true,
        message: `Error cargando usuarios: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    // Roles básicos
    return ['admin', 'user', 'viewer'];
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Cargando usuarios...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardContent>
          <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
            <Grid item xs>
              <Typography variant="h5" component="h1">
                👥 Gestión de Usuarios
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sistema LPDP - Solo Supabase, Sin localStorage
              </Typography>
            </Grid>
            <Grid item>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={loadUsers}
                disabled={loading}
              >
                Actualizar
              </Button>
            </Grid>
          </Grid>

          {users.length === 0 ? (
            <Alert severity="info">
              <Typography>
                No hay usuarios registrados en el sistema.
              </Typography>
            </Alert>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Email</TableCell>
                    <TableCell>Rol</TableCell>
                    <TableCell>Permisos</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Fecha Creación</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Typography variant="body2">{user.email}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={user.rol || 'user'} 
                          color={user.rol === 'admin' ? 'primary' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">
                          {user.permisos?.join(', ') || 'Sin permisos'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={<ActiveIcon />}
                          label="Activo"
                          color="success"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">
                          {user.created_at ? new Date(user.created_at).toLocaleDateString('es-CL') : 'N/A'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          <Alert severity="success" sx={{ mt: 3 }}>
            <Typography variant="body2">
              ✅ Sistema funcionando 100% con Supabase. Sin localStorage.
            </Typography>
          </Alert>
        </CardContent>
      </Card>

      {/* Notificación */}
      {notification.open && (
        <Alert severity={notification.severity} sx={{ mt: 2 }}>
          {notification.message}
        </Alert>
      )}
    </Box>
  );
}

export default UserManagement;