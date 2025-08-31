import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton
} from '@mui/material';
import {
  Assessment as RATIcon,
  Dashboard as DPOIcon,
  Shield as DPIAIcon,
  Business as ProveedoresIcon
} from '@mui/icons-material';

const SistemaPrincipal = () => {
  const navigate = useNavigate();

  const tarjetas = [
    {
      titulo: 'Construcción Registro de Actividades de Tratamiento (RAT)',
      subtitulo: 'Art. 15 Ley 21.719',
      icono: <RATIcon sx={{ fontSize: 48, color: '#60a5fa' }} />,
      ruta: '/rat-system',
      descripcion: 'Genera y gestiona tu RAT según normativa vigente'
    },
    {
      titulo: 'Módulo DPO',
      subtitulo: 'Art. 47 Ley 21.719',
      icono: <DPOIcon sx={{ fontSize: 48, color: '#fbbf24' }} />,
      ruta: '/dashboard-dpo',
      descripcion: 'Panel de control del Delegado de Protección de Datos'
    },
    {
      titulo: 'Módulo DPIA/PIA',
      subtitulo: 'Art. 19 Ley 21.719',
      icono: <DPIAIcon sx={{ fontSize: 48, color: '#34d399' }} />,
      ruta: '/evaluacion-impacto',
      descripcion: 'Evaluación de Impacto en Protección de Datos'
    },
    {
      titulo: 'Módulo Proveedores',
      subtitulo: 'Art. 25 Ley 21.719',
      icono: <ProveedoresIcon sx={{ fontSize: 48, color: '#a78bfa' }} />,
      ruta: '/gestion-proveedores',
      descripcion: 'Gestión de encargados del tratamiento'
    }
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#111827',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h3"
            sx={{
              color: '#f9fafb',
              fontWeight: 700,
              mb: 2,
              fontSize: { xs: '1.5rem', md: '2rem' }
            }}
          >
            Sistema de Cumplimiento LPDP
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              color: '#9ca3af',
              fontSize: '0.875rem'
            }}
          >
            Ley 21.719 de Protección de Datos Personales
          </Typography>
        </Box>

        <Grid container spacing={3} justifyContent="center">
          {tarjetas.map((tarjeta, index) => (
            <Grid item xs={12} sm={6} md={6} key={index}>
              <Card
                sx={{
                  bgcolor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '0.75rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  height: '100%',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    borderColor: '#4f46e5',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                  }
                }}
                onClick={() => navigate(tarjeta.ruta)}
              >
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <Box sx={{ mb: 3 }}>
                    {tarjeta.icono}
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{
                      color: '#f9fafb',
                      fontWeight: 600,
                      mb: 1,
                      fontSize: '1rem'
                    }}
                  >
                    {tarjeta.titulo}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#6b7280',
                      display: 'block',
                      mb: 2,
                      fontStyle: 'italic'
                    }}
                  >
                    {tarjeta.subtitulo}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#9ca3af',
                      fontSize: '0.813rem'
                    }}
                  >
                    {tarjeta.descripcion}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Typography
            variant="caption"
            sx={{
              color: '#6b7280',
              fontSize: '0.75rem'
            }}
          >
            Sistema desarrollado según normativa chilena vigente
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default SistemaPrincipal;