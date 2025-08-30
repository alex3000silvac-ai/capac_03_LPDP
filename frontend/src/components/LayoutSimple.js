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
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

export default LayoutSimple;