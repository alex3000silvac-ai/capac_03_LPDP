import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Container,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Divider
} from '@mui/material';
import { LockOutlined, Business, Security } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    tenantId: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showTenantField, setShowTenantField] = useState(false);

  const { login } = useAuth();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Si se está escribiendo en username, mostrar campo de tenant
    if (name === 'username' && value.length > 3) {
      setShowTenantField(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validar campos requeridos
      if (!formData.username || !formData.password) {
        throw new Error('Por favor completa todos los campos');
      }

      // Si no se especifica tenant, usar 'demo' por defecto
      const tenantId = formData.tenantId || 'demo';

      await login(formData.username, formData.password, tenantId);
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setFormData({
      username: 'admin',
      password: 'Admin123!',
      tenantId: 'demo'
    });
    setShowTenantField(true);
  };

  return (
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bgcolor="background.default"
      p={2}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={8}
          sx={{
            p: 4,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }}
        >
          {/* Header */}
          <Box textAlign="center" mb={4}>
            <Security sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h4" component="h1" gutterBottom>
              Sistema LPDP
            </Typography>
            <Typography variant="h6" component="h2">
              Ley de Protección de Datos Personales
            </Typography>
            <Typography variant="body1" sx={{ mt: 1, opacity: 0.9 }}>
              Chile - Ley 21.719
            </Typography>
          </Box>

          {/* Formulario de Login */}
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Campo Usuario/Email */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Usuario o Email"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  variant="outlined"
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 1)',
                      },
                    },
                  }}
                />
              </Grid>

              {/* Campo Contraseña */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Contraseña"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  variant="outlined"
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 1)',
                      },
                    },
                  }}
                />
              </Grid>

              {/* Campo Tenant (se muestra dinámicamente) */}
              {showTenantField && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="ID de Empresa (opcional)"
                    name="tenantId"
                    value={formData.tenantId}
                    onChange={handleInputChange}
                    variant="outlined"
                    placeholder="demo"
                    helperText="Deja vacío para usar la empresa demo"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 1)',
                        },
                      },
                    }}
                  />
                </Grid>
              )}

              {/* Botón de Login */}
              <Grid item xs={12}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{
                    py: 1.5,
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.3)',
                      border: '2px solid rgba(255, 255, 255, 0.5)',
                    },
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    <>
                      <LockOutlined sx={{ mr: 1 }} />
                      Iniciar Sesión
                    </>
                  )}
                </Button>
              </Grid>
            </Grid>

            {/* Mensaje de Error */}
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </Box>

          <Divider sx={{ my: 3, borderColor: 'rgba(255, 255, 255, 0.3)' }} />

          {/* Información de Demo */}
          <Box textAlign="center">
            <Typography variant="h6" gutterBottom>
              🚀 Acceso de Demostración
            </Typography>
            <Button
              variant="outlined"
              onClick={handleDemoLogin}
              sx={{
                color: 'white',
                borderColor: 'rgba(255, 255, 255, 0.5)',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              Usar Credenciales Demo
            </Button>
          </Box>

          {/* Características del Sistema */}
          <Box mt={4}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Card sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'white' }}>
                  <CardContent textAlign="center">
                    <Business sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h6">Multi-Tenant</Typography>
                    <Typography variant="body2">
                      Cada empresa tiene su espacio seguro
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'white' }}>
                  <CardContent textAlign="center">
                    <Security sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h6">Seguro</Typography>
                    <Typography variant="body2">
                      Encriptación AES-128 y JWT
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'white' }}>
                  <CardContent textAlign="center">
                    <LockOutlined sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h6">Compliant</Typography>
                    <Typography variant="body2">
                      Cumple Ley 21.719 Chile
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
