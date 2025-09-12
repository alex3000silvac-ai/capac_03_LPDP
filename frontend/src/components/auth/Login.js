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
  Divider,
  useTheme
} from '@mui/material';
import { LockOutlined, Business, Security, VerifiedUser } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const theme = useTheme();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validar campos requeridos
      if (!formData.email || !formData.password) {
        throw new Error('Por favor completa todos los campos');
      }

      // Login con email para Supabase
      const result = await login(formData.email, formData.password);
      if (!result.success) {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };


  return (
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      sx={{
        background: 'linear-gradient(135deg, #212529 0%, #343a40 25%, #495057 50%, #6c757d 75%, #868e96 100%)',
        padding: 2,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Elementos de fondo decorativos */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
          background: 'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.3) 0%, transparent 50%)',
          pointerEvents: 'none'
        }}
      />
      
      <Container maxWidth="sm">
        <Card
          elevation={24}
          sx={{
            borderRadius: 4,
            overflow: 'hidden',
            backgroundColor: 'rgba(15, 15, 35, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
            position: 'relative'
          }}
        >
          {/* Header con gradiente */}
          <Box
            sx={{
              background: 'linear-gradient(135deg, #495057 0%, #6c757d 100%)',
              p: 4,
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Elementos decorativos del header */}
            <Box
              sx={{
                position: 'absolute',
                top: -50,
                right: -50,
                width: 100,
                height: 100,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.1)',
                animation: 'pulse 2s infinite'
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: -30,
                left: -30,
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.1)',
                animation: 'pulse 2s infinite 1s'
              }}
            />
            
            <Security 
              sx={{ 
                fontSize: 56, 
                color: 'white',
                mb: 2,
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
              }} 
            />
            <Typography 
              variant="h3" 
              component="h1" 
              gutterBottom
              sx={{
                color: 'white',
                fontWeight: 700,
                textShadow: '0 4px 8px rgba(0,0,0,0.3)',
                letterSpacing: '0.5px'
              }}
            >
              Jurídica Digital SPA
            </Typography>
            <Typography 
              variant="h6" 
              sx={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontWeight: 300,
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}
            >
              Sistema de Cumplimiento LPDP
            </Typography>
            <Typography 
              variant="body2" 
              sx={{
                color: 'rgba(255, 255, 255, 0.8)',
                mt: 1,
                fontWeight: 300
              }}
            >
              Ley de Protección de Datos Personales - Chile
            </Typography>
          </Box>

          <CardContent sx={{ p: 4, backgroundColor: 'rgba(15, 15, 35, 0.95)' }}>
            {/* Formulario */}
            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {/* Campo Usuario */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    variant="outlined"
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: 2,
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.08)',
                          borderColor: 'rgba(255, 255, 255, 0.2)',
                        },
                        '&.Mui-focused': {
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          borderColor: '#6c757d',
                          boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)'
                        }
                      },
                      '& .MuiInputLabel-root': {
                        color: 'rgba(255, 255, 255, 0.7)',
                        '&.Mui-focused': {
                          color: '#6c757d'
                        }
                      },
                      '& .MuiInputBase-input': {
                        color: 'white',
                        '&::placeholder': {
                          color: 'rgba(255, 255, 255, 0.5)'
                        }
                      }
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
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: 2,
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.08)',
                          borderColor: 'rgba(255, 255, 255, 0.2)',
                        },
                        '&.Mui-focused': {
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          borderColor: '#6c757d',
                          boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)'
                        }
                      },
                      '& .MuiInputLabel-root': {
                        color: 'rgba(255, 255, 255, 0.7)',
                        '&.Mui-focused': {
                          color: '#6c757d'
                        }
                      },
                      '& .MuiInputBase-input': {
                        color: 'white',
                        '&::placeholder': {
                          color: 'rgba(255, 255, 255, 0.5)'
                        }
                      }
                    }}
                  />
                </Grid>

                {/* Botón de Login */}
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{
                      py: 2,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      background: 'linear-gradient(45deg, #495057 30%, #6c757d 90%)',
                      borderRadius: 3,
                      textTransform: 'none',
                      boxShadow: '0 8px 25px rgba(73, 80, 87, 0.3)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #343a40 30%, #495057 90%)',
                        boxShadow: '0 12px 35px rgba(108, 117, 125, 0.4)',
                        transform: 'translateY(-2px)'
                      },
                      '&:disabled': {
                        background: 'rgba(255, 255, 255, 0.1)',
                        color: 'rgba(255, 255, 255, 0.5)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      <>
                        <LockOutlined sx={{ mr: 1.5 }} />
                        Iniciar Sesión
                      </>
                    )}
                  </Button>
                </Grid>

              </Grid>
            </Box>

            {/* Mensaje de Error */}
            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mt: 3,
                  backgroundColor: 'rgba(244, 67, 54, 0.1)',
                  border: '1px solid rgba(244, 67, 54, 0.3)',
                  color: '#c0392b'
                }}
              >
                {error}
              </Alert>
            )}



            {/* Footer */}
            <Box mt={4} textAlign="center" pt={2} borderTop="1px solid rgba(255, 255, 255, 0.1)">
              <Typography 
                variant="caption" 
                sx={{
                  color: 'rgba(255, 255, 255, 0.4)',
                  fontSize: '0.75rem'
                }}
              >
                © 2024 Jurídica Digital SPA. Todos los derechos reservados.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>

      {/* Estilos CSS para animaciones */}
      <style jsx>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.1; }
          50% { transform: scale(1.1); opacity: 0.2; }
          100% { transform: scale(1); opacity: 0.1; }
        }
      `}</style>
    </Box>
  );
};

export default Login;
