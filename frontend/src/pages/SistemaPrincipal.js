import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Chip
} from '@mui/material';
import {
  Assessment as RATIcon,
  Dashboard as DPOIcon,
  Shield as DPIAIcon,
  Business as ProveedoresIcon,
  List as RATListIcon,
  Notifications as ApprovalIcon,
  Analytics as MetricsIcon,
  AdminPanelSettings as AdminIcon,
  Gavel as ContractIcon,
  Notifications as NotificationIcon,
  Description as ReportIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { INDUSTRIES_CONFIG } from '../config/industries.config';

const SistemaPrincipal = () => {
  const navigate = useNavigate();
  
  // Usar configuración centralizada de industrias
  const industries = INDUSTRIES_CONFIG.filter(ind => ind.id !== 'general').map(ind => ({
    ...ind,
    icon: ind.icon ? <ind.icon /> : null
  }));
  
  // Mantener estructura original para compatibilidad
  const industriesLegacy = [
    {
      id: 'financiero',
      name: 'Sector Financiero',
      icon: <FinanceIcon />,
      color: '#059669',
      regulations: ['Ley 21.719', 'Ley 21.000 (CMF)', 'Basilea III', 'FATCA'],
      specialRequirements: 'Regulación CMF - Datos financieros sensibles'
    },
    {
      id: 'salud',
      name: 'Sector Salud',
      icon: <HealthIcon />,
      color: '#dc2626',
      regulations: ['Ley 21.719', 'Ley 20.584 (Derechos Pacientes)', 'Código Sanitario'],
      specialRequirements: 'Datos de salud - Protección especial Art. 12 Ley 21.719'
    },
    {
      id: 'educacion',
      name: 'Sector Educación',
      icon: <EducationIcon />,
      color: '#7c3aed',
      regulations: ['Ley 21.719', 'Ley 20.370 (LGE)', 'Protección Menores'],
      specialRequirements: 'Datos de menores - Consentimiento parental requerido'
    },
    {
      id: 'retail',
      name: 'Comercio y Retail',
      icon: <RetailIcon />,
      color: '#ea580c',
      regulations: ['Ley 21.719', 'Ley 19.496 (SERNAC)', 'Ley 20.009 (DICOM)'],
      specialRequirements: 'Datos comerciales - Información crediticia'
    },
    {
      id: 'tecnologia',
      name: 'Tecnología',
      icon: <TechIcon />,
      color: '#0891b2',
      regulations: ['Ley 21.719', 'Ciberseguridad', 'Transferencias Internacionales'],
      specialRequirements: 'Datos en la nube - Transferencias internacionales'
    },
    {
      id: 'manufactura',
      name: 'Manufactura',
      icon: <ManufacturingIcon />,
      color: '#4f46e5',
      regulations: ['Ley 21.719', 'Normativa Laboral', 'Medio Ambiente'],
      specialRequirements: 'Datos laborales - Medicina del trabajo'
    },
    {
      id: 'alimentos',
      name: 'Alimentos y Bebidas',
      icon: <FoodIcon />,
      color: '#be185d',
      regulations: ['Ley 21.719', 'Código Sanitario', 'Trazabilidad HACCP'],
      specialRequirements: 'Trazabilidad alimentaria - Seguridad sanitaria'
    },
    {
      id: 'transporte',
      name: 'Transporte y Logística',
      icon: <TransportIcon />,
      color: '#9333ea',
      regulations: ['Ley 21.719', 'Ley Tránsito', 'Normativa MTT'],
      specialRequirements: 'Datos de ubicación - Seguimiento GPS'
    }
  ];

  const tarjetas = [
    {
      titulo: 'Construcción Registro de Actividades de Tratamiento (RAT)',
      subtitulo: 'Art. 15 Ley 21.719',
      icono: <RATIcon sx={{ fontSize: 48, color: '#60a5fa' }} />,
      ruta: '/rat-system',
      descripcion: 'Genera y gestiona tu RAT según normativa vigente'
    },
    {
      titulo: 'Gestión de RATs Existentes',
      subtitulo: 'Control y Edición',
      icono: <RATListIcon sx={{ fontSize: 48, color: '#4f46e5' }} />,
      ruta: '/rat-list',
      descripcion: 'Ver, editar y gestionar RATs creados'
    },
    {
      titulo: 'Métricas de Compliance',
      subtitulo: 'Analytics y KPIs',
      icono: <MetricsIcon sx={{ fontSize: 48, color: '#8b5cf6' }} />,
      ruta: '/compliance-metrics',
      descripcion: 'Dashboard ejecutivo con métricas de cumplimiento'
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
      subtitulo: 'Art. 25 Ley 21.719',
      icono: <DPIAIcon sx={{ fontSize: 48, color: '#34d399' }} />,
      ruta: '/eipd-creator',
      descripcion: 'Evaluación de Impacto en Protección de Datos'
    },
    {
      titulo: 'Lista EIPDs Guardadas',
      subtitulo: 'Consultar y Descargar',
      icono: <AssessmentIcon sx={{ fontSize: 48, color: '#a78bfa' }} />,
      ruta: '/eipd-list',
      descripcion: 'Ver todas las evaluaciones de impacto guardadas'
    },
    {
      titulo: 'Módulo Proveedores',
      subtitulo: 'Art. 25 Ley 21.719',
      icono: <ProveedoresIcon sx={{ fontSize: 48, color: '#a78bfa' }} />,
      ruta: '/provider-manager',
      descripcion: 'Gestión de encargados del tratamiento'
    },
    {
      titulo: 'Panel Administrativo',
      subtitulo: 'Gestión Holdings',
      icono: <AdminIcon sx={{ fontSize: 48, color: '#ef4444' }} />,
      ruta: '/admin-dashboard',
      descripcion: 'Administración holdings y empresas subsidiarias'
    },
    {
      titulo: 'Generador DPA',
      subtitulo: 'Contratos Automáticos',
      icono: <ContractIcon sx={{ fontSize: 48, color: '#fbbf24' }} />,
      ruta: '/dpa-generator',
      descripcion: 'Generación automática contratos DPA'
    },
    {
      titulo: 'Centro Notificaciones',
      subtitulo: 'Alertas y Vencimientos',
      icono: <NotificationIcon sx={{ fontSize: 48, color: '#60a5fa' }} />,
      ruta: '/notifications',
      descripcion: 'Gestión de alertas y notificaciones sistema'
    },
    {
      titulo: 'Generador Reportes',
      subtitulo: 'Exportación PDF/Excel',
      icono: <ReportIcon sx={{ fontSize: 48, color: '#8b5cf6' }} />,
      ruta: '/reports',
      descripcion: 'Generación automática reportes consolidados'
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
              fontSize: '0.875rem',
              mb: 3
            }}
          >
            Ley 21.719 de Protección de Datos Personales
          </Typography>
          
          <Alert 
            severity="success" 
            sx={{ 
              maxWidth: 600, 
              mx: 'auto', 
              mb: 4,
              bgcolor: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              color: '#f9fafb'
            }}
          >
            <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
              ✨ Mejora de UX: Selección de Industria en el RAT
            </Typography>
            <Typography variant="caption" sx={{ display: 'block' }}>
              La selección de industria ahora se hace directamente al crear un RAT, 
              haciendo el proceso más intuitivo y evitando pasos innecesarios.
            </Typography>
          </Alert>
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