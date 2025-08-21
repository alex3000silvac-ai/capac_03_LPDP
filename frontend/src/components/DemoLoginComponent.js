/**
 * Componente de Login Demo Ultra Restringido
 * Usuario: demo
 * Password: demo123
 * Solo visualización, sin navegación, sin modificaciones
 */
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Divider,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Security,
  Schedule,
  Block,
  Info,
  ContactSupport,
  Preview,
  Lock,
  Warning,
  CheckCircle
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const DemoLoginComponent = ({ onDemoLogin }) => {
  const [username, setUsername] = useState('demo');
  const [password, setPassword] = useState('demo123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showInfo, setShowInfo] = useState(false);
  const [demoStatus, setDemoStatus] = useState(null);

  // Cargar estado del demo al montar
  useEffect(() => {
    loadDemoStatus();
  }, []);

  const loadDemoStatus = async () => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'https://scldp-backend.onrender.com';
      const response = await fetch(`${API_URL}/api/v1/demo/status`);
      
      if (response.ok) {
        const status = await response.json();
        setDemoStatus(status);
      }
    } catch (error) {
      console.error('Error cargando estado demo:', error);
    }
  };

  const handleDemoLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const API_URL = process.env.REACT_APP_API_URL || 'https://scldp-backend.onrender.com';
      
      const response = await fetch(`${API_URL}/api/v1/demo/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Error en login demo');
      }

      // Guardar datos demo en localStorage con prefijo especial
      localStorage.setItem('demo_token', data.access_token);
      localStorage.setItem('demo_refresh_token', data.refresh_token);
      localStorage.setItem('demo_user', JSON.stringify(data.user));
      localStorage.setItem('demo_data', JSON.stringify(data.demo_data));
      localStorage.setItem('demo_restrictions', JSON.stringify(data.restrictions));

      // Notificar al componente padre
      if (onDemoLogin) {
        onDemoLogin(data);
      }

      console.log('Demo login exitoso:', data);

    } catch (error) {
      console.error('Error en demo login:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      {/* Header Demo */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: 'warning.50', border: '2px solid', borderColor: 'warning.300' }}>
        <Box display="flex" alignItems="center" mb={2}>
          <Preview sx={{ fontSize: 32, color: 'warning.main', mr: 2 }} />
          <Typography variant="h4" color="warning.main" fontWeight="bold">
            MODO DEMO
          </Typography>
        </Box>
        
        <Typography variant="body1" color="text.primary" gutterBottom>
          Acceda a una demostración del Sistema LPDP con datos de ejemplo.
        </Typography>
        
        <Box display="flex" gap={1} flexWrap="wrap" mt={2}>
          <Chip 
            icon={<Lock />} 
            label="Solo Lectura" 
            color="warning" 
            variant="outlined" 
            size="small" 
          />
          <Chip 
            icon={<Schedule />} 
            label="15 min" 
            color="info" 
            variant="outlined" 
            size="small" 
          />
          <Chip 
            icon={<Block />} 
            label="Sin Edición" 
            color="error" 
            variant="outlined" 
            size="small" 
          />
        </Box>
      </Paper>

      {/* Formulario de Login Demo */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom align="center">
            Acceso Demo
          </Typography>
          
          <form onSubmit={handleDemoLogin}>
            <TextField
              fullWidth
              label="Usuario Demo"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              margin="normal"
              variant="outlined"
              disabled={loading}
              InputProps={{
                readOnly: true,
                sx: { bgcolor: 'grey.50' }
              }}
              helperText="Usuario predefinido para demostración"
            />
            
            <TextField
              fullWidth
              label="Contraseña Demo"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              variant="outlined"
              disabled={loading}
              InputProps={{
                readOnly: true,
                sx: { bgcolor: 'grey.50' },
                endAdornment: (
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                )
              }}
              helperText="Contraseña predefinida para demostración"
            />

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                type="submit"
                variant="contained"
                color="warning"
                size="large"
                fullWidth
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <Preview />}
              >
                {loading ? 'Ingresando...' : 'Acceder a Demo'}
              </Button>
              
              <Button
                variant="outlined"
                color="info"
                onClick={() => setShowInfo(true)}
                startIcon={<Info />}
              >
                Info
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>

      {/* Credenciales Visibles */}
      <Card sx={{ mb: 3, bgcolor: 'info.50' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom color="info.main">
            <Security sx={{ verticalAlign: 'middle', mr: 1 }} />
            Credenciales Demo
          </Typography>
          
          <Box sx={{ fontFamily: 'monospace', fontSize: '1.1rem', p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography><strong>Usuario:</strong> demo</Typography>
            <Typography><strong>Contraseña:</strong> demo123</Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Estado del Sistema Demo */}
      {demoStatus && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Estado del Sistema Demo
            </Typography>
            
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="success" />
                </ListItemIcon>
                <ListItemText 
                  primary="Demo Disponible" 
                  secondary="Sistema funcionando correctamente"
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <Schedule />
                </ListItemIcon>
                <ListItemText 
                  primary="Duración de Sesión" 
                  secondary="15 minutos por sesión"
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <Preview />
                </ListItemIcon>
                <ListItemText 
                  primary="Datos Disponibles" 
                  secondary={`${demoStatus.demo_data_available?.empresa || 'Empresa Demo'} - ${demoStatus.demo_data_available?.rats_ejemplo || 1} RAT de ejemplo`}
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      )}

      {/* Contacto para Versión Completa */}
      <Paper sx={{ p: 3, bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.200' }}>
        <Typography variant="h6" color="primary.main" gutterBottom>
          <ContactSupport sx={{ verticalAlign: 'middle', mr: 1 }} />
          ¿Necesita la Versión Completa?
        </Typography>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          Para acceso completo con todas las funcionalidades, creación de registros, 
          exportación y gestión completa de usuarios, solicite su cuenta empresarial.
        </Typography>
        
        <Box display="flex" gap={1} flexWrap="wrap">
          <Chip 
            label="ventas@lpdp-sistema.cl" 
            color="primary" 
            variant="outlined" 
            clickable
            onClick={() => window.open('mailto:ventas@lpdp-sistema.cl')}
          />
          <Chip 
            label="+56 2 2XXX XXXX" 
            color="primary" 
            variant="outlined" 
          />
        </Box>
      </Paper>

      {/* Dialog de Información */}
      <Dialog open={showInfo} onClose={() => setShowInfo(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <Info sx={{ mr: 1 }} />
            Información del Demo
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Typography variant="h6" gutterBottom>
            Restricciones del Demo
          </Typography>
          
          <List>
            <ListItem>
              <ListItemIcon><Block color="error" /></ListItemIcon>
              <ListItemText primary="Solo visualización de datos" secondary="No se pueden realizar cambios" />
            </ListItem>
            
            <ListItem>
              <ListItemIcon><Block color="error" /></ListItemIcon>
              <ListItemText primary="Sin navegación libre" secondary="Acceso limitado a secciones específicas" />
            </ListItem>
            
            <ListItem>
              <ListItemIcon><Block color="error" /></ListItemIcon>
              <ListItemText primary="Sin creación de registros" secondary="No se pueden agregar nuevos RATs o datos" />
            </ListItem>
            
            <ListItem>
              <ListItemIcon><Block color="error" /></ListItemIcon>
              <ListItemText primary="Sin exportación" secondary="No se pueden descargar reportes o datos" />
            </ListItem>
            
            <ListItem>
              <ListItemIcon><Schedule color="warning" /></ListItemIcon>
              <ListItemText primary="Sesión limitada" secondary="15 minutos de duración máxima" />
            </ListItem>
          </List>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="h6" gutterBottom>
            Datos de Demostración
          </Typography>
          
          <Typography variant="body2" color="text.secondary">
            El sistema incluye datos de ejemplo de una empresa ficticia con:
          </Typography>
          
          <List>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText primary="RAT completo de ejemplo" secondary="Registro de Actividades de Tratamiento detallado" />
            </ListItem>
            
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText primary="Datos de empresa demo" secondary="Información corporativa de muestra" />
            </ListItem>
            
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText primary="Visualización de módulos" secondary="Acceso a Módulo 0: Introducción LPDP" />
            </ListItem>
          </List>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setShowInfo(false)} variant="contained">
            Entendido
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DemoLoginComponent;