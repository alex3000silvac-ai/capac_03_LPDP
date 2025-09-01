import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  Fab,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Logout as LogoutIcon,
  Gavel as GavelIcon,
  Dashboard as DashboardIcon,
  Assessment as AssessmentIcon,
  Home as HomeIcon,
  School as SchoolIcon,
  AdminPanelSettings as AdminIcon,
  Business as BusinessIcon,
  ArrowBack as BackIcon,
  ArrowForward as ForwardIcon,
} from '@mui/icons-material';

function LayoutSimple({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNavigation = (path) => {
    navigate(path);
    handleClose();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuOptions = [
    { 
      label: 'INICIO', 
      path: '/sistema-principal',
      icon: <HomeIcon />
    },
    { 
      label: 'SISTEMA RAT', 
      path: '/rat-system',
      icon: <AssessmentIcon />
    },
    { 
      label: 'PANEL DPO', 
      path: '/dashboard-dpo',
      icon: <DashboardIcon />
    },
    { 
      label: 'CAPACITACIÓN', 
      path: '/modulo-cero',
      icon: <SchoolIcon />
    },
    { 
      label: 'PROVEEDORES', 
      path: '/gestion-proveedores',
      icon: <BusinessIcon />
    },
    { 
      label: 'GUÍA LEGAL', 
      path: '/glosario',
      icon: <GavelIcon />
    },
    { 
      label: 'ADMIN', 
      path: '/admin',
      icon: <AdminIcon />
    },
  ];

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      minHeight: '100vh',
      bgcolor: '#111827',
    }}>
      <AppBar 
        position="fixed" 
        sx={{
          bgcolor: '#1f2937',
          color: '#f9fafb',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
          borderBottom: '1px solid #374151',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700,
                color: '#f9fafb',
                letterSpacing: '0.025em',
                cursor: 'pointer',
              }}
              onClick={() => navigate('/rat-system')}
            >
              JURÍDICA DIGITAL | LEY 21.719
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            {menuOptions.map((option) => (
              <Button
                key={option.path}
                startIcon={option.icon}
                onClick={() => handleNavigation(option.path)}
                sx={{
                  color: location.pathname === option.path ? '#a78bfa' : '#9ca3af',
                  fontWeight: location.pathname === option.path ? 700 : 500,
                  '&:hover': {
                    bgcolor: 'rgba(79, 70, 229, 0.08)',
                    color: '#f9fafb',
                  },
                  borderRadius: '0.5rem',
                  px: 2,
                  py: 1,
                }}
              >
                {option.label}
              </Button>
            ))}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              onClick={handleMenu}
              sx={{ p: 0 }}
            >
              <Avatar 
                sx={{ 
                  bgcolor: '#4f46e5',
                  color: '#ffffff',
                  width: 36,
                  height: 36,
                  fontSize: '1rem',
                }}
              >
                JD
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              PaperProps={{
                sx: {
                  bgcolor: '#1f2937',
                  color: '#f9fafb',
                  border: '1px solid #374151',
                  borderRadius: '0.5rem',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                  '& .MuiMenuItem-root': {
                    color: '#d1d5db',
                    '&:hover': {
                      bgcolor: '#374151',
                    },
                  },
                },
              }}
            >
              <MenuItem disabled>
                <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                  Sistema Profesional LPDP
                </Typography>
              </MenuItem>
              <Divider sx={{ bgcolor: '#374151' }} />
              <MenuItem onClick={handleLogout}>
                <LogoutIcon sx={{ mr: 1, fontSize: 18, color: '#9ca3af' }} />
                Cerrar Sesión
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: 8,
          px: 3,
          py: 3,
          bgcolor: '#111827',
          position: 'relative',
        }}
      >
        {children}
        
        {/* Botones de navegación flotantes */}
        <NavigationButtons currentPath={location.pathname} navigate={navigate} />
      </Box>
    </Box>
  );
}

// Componente de botones de navegación flotantes
const NavigationButtons = ({ currentPath, navigate }) => {
  const routes = [
    { path: '/sistema-principal', label: 'Inicio', icon: <HomeIcon /> },
    { path: '/modulo-cero', label: 'Módulo 0', icon: <SchoolIcon /> },
    { path: '/rat-system', label: 'RAT System', icon: <AssessmentIcon /> },
    { path: '/dashboard-dpo', label: 'DPO Panel', icon: <DashboardIcon /> },
    { path: '/gestion-proveedores', label: 'Proveedores', icon: <BusinessIcon /> },
    { path: '/admin', label: 'Admin', icon: <AdminIcon /> },
  ];

  const currentIndex = routes.findIndex(route => route.path === currentPath);
  const prevRoute = currentIndex > 0 ? routes[currentIndex - 1] : null;
  const nextRoute = currentIndex < routes.length - 1 ? routes[currentIndex + 1] : null;

  if (currentPath === '/login' || currentPath.includes('/select-')) {
    return null; // No mostrar en páginas de login/setup
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        zIndex: 1000,
      }}
    >
      {/* Botón Anterior */}
      {prevRoute && (
        <Tooltip title={`← ${prevRoute.label}`} placement="left">
          <Fab
            size="medium"
            onClick={() => navigate(prevRoute.path)}
            sx={{
              bgcolor: '#374151',
              color: '#f9fafb',
              '&:hover': {
                bgcolor: '#4b5563',
              },
            }}
          >
            <BackIcon />
          </Fab>
        </Tooltip>
      )}

      {/* Botón Siguiente */}
      {nextRoute && (
        <Tooltip title={`${nextRoute.label} →`} placement="left">
          <Fab
            size="medium"
            onClick={() => navigate(nextRoute.path)}
            sx={{
              bgcolor: '#1e40af',
              color: '#f9fafb',
              '&:hover': {
                bgcolor: '#1d4ed8',
              },
            }}
          >
            <ForwardIcon />
          </Fab>
        </Tooltip>
      )}

      {/* Botón Inicio siempre disponible */}
      {currentPath !== '/sistema-principal' && (
        <Tooltip title="🏠 Inicio" placement="left">
          <Fab
            size="small"
            onClick={() => navigate('/sistema-principal')}
            sx={{
              bgcolor: '#059669',
              color: '#f9fafb',
              '&:hover': {
                bgcolor: '#047857',
              },
            }}
          >
            <HomeIcon />
          </Fab>
        </Tooltip>
      )}
    </Box>
  );
};

export default LayoutSimple;