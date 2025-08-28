import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Alert,
  Paper,
} from '@mui/material';
import {
  PlayCircleOutline,
  School,
  ArrowForward,
  InfoOutlined,
  RocketLaunch as RocketLaunchIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

function Dashboard() {
  const navigate = useNavigate();
  const { user, isRestricted } = useAuth();

  return (
    <Box>
      {/* Mensaje de Bienvenida */}
      <Alert 
        severity={isRestricted() ? "warning" : (user?.is_superuser || user?.username === 'admin' ? "success" : "info")} 
        icon={<InfoOutlined />}
        sx={{ mb: 3 }}
      >
        <Typography variant="subtitle1" fontWeight={600}>
          {isRestricted() 
            ? '👀 Vista Demo - Solo Primera Página'
            : (user?.is_superuser || user?.username === 'admin' 
              ? '🔓 ¡Bienvenido, Administrador!' 
              : '📖 Curso Especializado: Inventario y Mapeo de Datos')}
        </Typography>
        <Typography variant="body2">
          {isRestricted()
            ? 'Estás en modo DEMO. Puedes ver únicamente la página de introducción para evaluar nuestro sistema. Para acceso completo al curso, contáctanos para obtener credenciales de acceso.'
            : (user?.is_superuser || user?.username === 'admin'
              ? 'Como administrador, tienes acceso completo a todos los módulos para revisión y demostración. Todos los módulos están desbloqueados.'
              : 'Este curso se enfoca exclusivamente en el proceso de creación del Registro de Actividades de Tratamiento. Este registro debe incluir información sobre los datos personales tratados, los fines de dicho tratamiento y otras medidas de seguridad, facilitando el cumplimiento normativo y demostrando la conformidad con la ley.')}
        </Typography>
        <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
          💡 <strong>Tip:</strong> Si encuentras términos técnicos durante el curso, consulta nuestro 
          <strong> Glosario LPDP completo</strong> que incluye más de 75 términos especializados con 
          definiciones detalladas, ejemplos prácticos y referencias legales específicas de Chile.
        </Typography>
      </Alert>

      {/* Acciones Principales */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Módulo Cero - Capacitación */}
        <Grid item xs={12} md={6}>
          <Card 
            sx={{ 
              height: '100%',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
              }
            }}
            onClick={() => navigate('/modulo-cero')}
          >
            <CardContent sx={{ p: 4 }}>
              <Box display="flex" alignItems="center" mb={3}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 64, height: 64 }}>
                  <School sx={{ fontSize: '2rem' }} />
                </Avatar>
                <Box ml={3}>
                  <Typography variant="h5" fontWeight={600}>
                    📚 Módulo Cero
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Capacitación express en 7 minutos
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
                Aprende los fundamentos de la Ley 21.719 de forma rápida y efectiva. 
                Tu primer paso hacia el cumplimiento normativo.
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={<PlayCircleOutline />}
                fullWidth
                sx={{ 
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600
                }}
              >
                Comenzar Capacitación
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* RAT Producción */}
        <Grid item xs={12} md={6}>
          <Card 
            sx={{ 
              height: '100%',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
              }
            }}
            onClick={() => navigate('/rat-produccion')}
          >
            <CardContent sx={{ p: 4 }}>
              <Box display="flex" alignItems="center" mb={3}>
                <Avatar sx={{ bgcolor: 'success.main', width: 64, height: 64 }}>
                  <RocketLaunchIcon sx={{ fontSize: '2rem' }} />
                </Avatar>
                <Box ml={3}>
                  <Typography variant="h5" fontWeight={600}>
                    🚀 RAT Producción
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Genera RATs completos por industria
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
                Crea Registros de Actividades de Tratamiento profesionales 
                en minutos, no en semanas. Específicos para tu industria.
              </Typography>
              <Button
                variant="contained"
                color="success"
                size="large"
                startIcon={<RocketLaunchIcon />}
                fullWidth
                sx={{ 
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600
                }}
              >
                Crear RAT Ahora
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Flujo Simple */}
      <Paper 
        sx={{ 
          p: 4, 
          mb: 4,
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          border: '1px solid rgba(0,0,0,0.1)'
        }}
      >
        <Typography variant="h6" fontWeight={600} textAlign="center" mb={3}>
          🎯 Proceso Simple y Efectivo
        </Typography>
        <Box display="flex" justifyContent="center" alignItems="center" flexWrap="wrap" gap={3}>
          <Box textAlign="center">
            <Typography variant="h6" fontWeight={600} color="primary.main">📚</Typography>
            <Typography variant="body2" fontWeight={600}>Aprende</Typography>
            <Typography variant="caption" color="text.secondary">7 min</Typography>
          </Box>
          <ArrowForward color="primary" sx={{ fontSize: '2rem' }} />
          <Box textAlign="center">
            <Typography variant="h6" fontWeight={600} color="success.main">🚀</Typography>
            <Typography variant="body2" fontWeight={600}>Produce</Typography>
            <Typography variant="caption" color="text.secondary">30 min</Typography>
          </Box>
          <ArrowForward color="primary" sx={{ fontSize: '2rem' }} />
          <Box textAlign="center">
            <Typography variant="h6" fontWeight={600} color="secondary.main">✅</Typography>
            <Typography variant="body2" fontWeight={600}>Cumples</Typography>
            <Typography variant="caption" color="text.secondary">Ley 21.719</Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

export default Dashboard;