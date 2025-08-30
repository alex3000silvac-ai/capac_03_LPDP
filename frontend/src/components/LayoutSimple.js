/**
 * LAYOUT SIMPLE SIN PANEL LATERAL
 * Diseño minimalista con navegación superior únicamente
 * Fondo azul oscuro profesional
 */

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
} from '@mui/material';
import {
  Menu as MenuIcon,
  Logout as LogoutIcon,
  Gavel as GavelIcon,
  Dashboard as DashboardIcon,
  Assessment as AssessmentIcon,
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

  // Navegación simplificada - solo 3 opciones principales
  const menuOptions = [
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
      label: 'GUÍA LEGAL', 
      path: '/glosario',
      icon: <GavelIcon />
    },
  ];

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      minHeight: '100vh',
      bgcolor: '#1a2332', // Azul oscuro profesional
    }}>
      {/* Barra superior minimalista */}
      <AppBar 
        position="fixed" 
        sx={{
          bgcolor: '#0d1117', // Azul más oscuro para la barra
          boxShadow: 'none',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {/* Logo y título */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700,
                color: '#ffffff',
                letterSpacing: '1px',
                cursor: 'pointer',
              }}
              onClick={() => navigate('/rat-system')}
            >
              JURÍDICA DIGITAL | LEY 21.719
            </Typography>
          </Box>

          {/* Navegación central */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            {menuOptions.map((option) => (
              <Button
                key={option.path}
                startIcon={option.icon}
                onClick={() => handleNavigation(option.path)}
                sx={{
                  color: location.pathname === option.path ? '#4fc3f7' : '#ffffff',
                  fontWeight: location.pathname === option.path ? 700 : 500,
                  '&:hover': {
                    bgcolor: 'rgba(79, 195, 247, 0.08)',
                    color: '#4fc3f7',
                  },
                }}
              >
                {option.label}
              </Button>
            ))}
          </Box>

          {/* Menú de usuario */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              onClick={handleMenu}
              sx={{ p: 0 }}
            >
              <Avatar 
                sx={{ 
                  bgcolor: '#2C3E50',
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
                  bgcolor: '#0d1117',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  '& .MuiMenuItem-root': {
                    '&:hover': {
                      bgcolor: 'rgba(79, 195, 247, 0.08)',
                    },
                  },
                },
              }}
            >
              <MenuItem disabled>
                <Typography variant="caption">
                  Sistema Profesional LPDP
                </Typography>
              </MenuItem>
              <Divider sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)' }} />
              <MenuItem onClick={handleLogout}>
                <LogoutIcon sx={{ mr: 1, fontSize: 18 }} />
                Cerrar Sesión
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Contenido principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: 8, // Espacio para la AppBar
          px: 3,
          py: 3,
          bgcolor: '#1a2332', // Fondo azul oscuro
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

export default LayoutSimple;