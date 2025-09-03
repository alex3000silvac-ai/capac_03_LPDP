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
  Factory as ManufacturingIcon,
  LocalHospital as HealthIcon,
  AccountBalance as FinanceIcon,
  Store as RetailIcon,
  Build as TechIcon,
  School as EducationIcon,
  Restaurant as FoodIcon,
  DirectionsCar as TransportIcon
} from '@mui/icons-material';

const SistemaPrincipal = () => {
  const navigate = useNavigate();
  const [selectedIndustry, setSelectedIndustry] = useState('');
  
  // Configuración de industrias con regulaciones específicas
  const industries = [
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
      subtitulo: 'Art. 19 Ley 21.719',
      icono: <DPIAIcon sx={{ fontSize: 48, color: '#34d399' }} />,
      ruta: '/eipd-creator',
      descripcion: 'Evaluación de Impacto en Protección de Datos'
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
          
          {/* SELECTOR DE INDUSTRIAS */}
          <Box sx={{ maxWidth: 400, mx: 'auto', mb: 4 }}>
            <FormControl fullWidth>
              <InputLabel 
                id="industry-select-label"
                sx={{ color: '#9ca3af' }}
              >
                Seleccione su Industria
              </InputLabel>
              <Select
                labelId="industry-select-label"
                value={selectedIndustry}
                label="Seleccione su Industria"
                onChange={(e) => setSelectedIndustry(e.target.value)}
                sx={{
                  bgcolor: '#374151',
                  color: '#f9fafb',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#4b5563',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#6b7280',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#4f46e5',
                  },
                }}
              >
                <MenuItem value="">
                  <em>Todas las Industrias</em>
                </MenuItem>
                {industries.map((industry) => (
                  <MenuItem key={industry.id} value={industry.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {industry.icon}
                      {industry.name}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          
          {/* INFORMACIÓN DE LA INDUSTRIA SELECCIONADA */}
          {selectedIndustry && (
            <Alert 
              severity="info" 
              sx={{ 
                maxWidth: 600, 
                mx: 'auto', 
                mb: 4,
                bgcolor: 'rgba(79, 70, 229, 0.1)',
                border: '1px solid rgba(79, 70, 229, 0.3)',
                color: '#f9fafb'
              }}
            >
              <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
                🏢 {industries.find(i => i.id === selectedIndustry)?.name}
              </Typography>
              <Typography variant="caption" sx={{ mb: 1, display: 'block' }}>
                {industries.find(i => i.id === selectedIndustry)?.specialRequirements}
              </Typography>
              <Box sx={{ mt: 1 }}>
                {industries.find(i => i.id === selectedIndustry)?.regulations.map((reg, index) => (
                  <Chip 
                    key={index}
                    label={reg}
                    size="small"
                    sx={{
                      mr: 0.5,
                      mb: 0.5,
                      bgcolor: 'rgba(79, 70, 229, 0.2)',
                      color: '#a78bfa'
                    }}
                  />
                ))}
              </Box>
            </Alert>
          )}
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