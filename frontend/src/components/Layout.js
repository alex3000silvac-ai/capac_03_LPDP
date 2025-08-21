import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Chip,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  School as SchoolIcon,
  Psychology as PsychologyIcon,
  Science as ScienceIcon,
  Timeline as TimelineIcon,
  EmojiEvents as TrophyIcon,
  ChevronLeft as ChevronLeftIcon,
  Inventory,
  Book,
  Science,
  Logout as LogoutIcon,
} from '@mui/icons-material';

const drawerWidth = 280;

const menuItems = [
  {
    text: 'Panel Principal',
    icon: <DashboardIcon />,
    path: '/dashboard',
    description: 'Vista general de tu aprendizaje',
  },
  {
    text: 'Módulos de Capacitación',
    icon: <SchoolIcon />,
    path: '/modulos',
    description: 'Contenido teórico y ejercicios',
  },
  {
    text: 'Módulo 3: Inventario RAT',
    icon: <Inventory />,
    path: '/modulo3',
    description: 'Registro de Actividades de Tratamiento',
    chip: 'NUEVO',
  },
  {
    text: 'Glosario LPDP',
    icon: <Book />,
    path: '/glosario',
    description: 'Términos clave Ley 21.719',
    chip: 'REF',
  },
  {
    text: 'Simulaciones',
    icon: <PsychologyIcon />,
    path: '/simulaciones',
    description: 'Entrevistas interactivas',
  },
  {
    text: 'Modo Práctica',
    icon: <ScienceIcon />,
    path: '/sandbox',
    description: 'Experimenta sin riesgos',
    chip: 'SANDBOX',
  },
  {
    text: 'Sandbox Completo',
    icon: <Science />,
    path: '/sandbox-completo',
    description: 'Sistema RAT profesional completo',
    chip: 'PRO',
  },
  {
    text: 'Mi Progreso',
    icon: <TimelineIcon />,
    path: '/mi-progreso',
    description: 'Logros y certificados',
  },
];

function Layout({ children }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleLogoutClick = () => {
    setLogoutDialogOpen(true);
  };

  const handleLogoutConfirm = () => {
    logout();
    navigate('/login');
    setLogoutDialogOpen(false);
  };

  const handleLogoutCancel = () => {
    setLogoutDialogOpen(false);
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ px: 2, py: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <Avatar
            sx={{
              bgcolor: 'transparent',
              border: '2px solid',
              borderColor: theme.palette.primary.main,
              width: 56,
              height: 56,
              fontSize: '1.8rem',
              fontWeight: 'bold',
              color: theme.palette.primary.main,
            }}
          >
            JD
          </Avatar>
          <Box sx={{ ml: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2, letterSpacing: '0.5px' }}>
              Jurídica Digital SPA
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
              Sistema de Capacitación LPDP
            </Typography>
          </Box>
        </Box>
      </Toolbar>
      <Divider />
      
      <List sx={{ flex: 1, px: 2, py: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              onClick={() => handleNavigation(item.path)}
              selected={location.pathname === item.path}
              sx={{
                borderRadius: 2,
                '&.Mui-selected': {
                  bgcolor: theme.palette.primary.light + '20',
                  '&:hover': {
                    bgcolor: theme.palette.primary.light + '30',
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: location.pathname === item.path 
                    ? theme.palette.primary.main 
                    : 'inherit',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                secondary={item.description}
                primaryTypographyProps={{
                  fontSize: '0.95rem',
                  fontWeight: location.pathname === item.path ? 600 : 400,
                }}
                secondaryTypographyProps={{
                  fontSize: '0.75rem',
                }}
              />
              {item.chip && (
                <Chip 
                  label={item.chip} 
                  size="small" 
                  color="secondary"
                  sx={{ ml: 1 }}
                />
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider />
      <Box sx={{ p: 2 }}>
        <Box sx={{ 
          p: 2, 
          background: 'linear-gradient(135deg, #00bcd4 0%, #33d9f0 100%)',
          borderRadius: 2, 
          color: '#000',
          boxShadow: '0 4px 20px 0 rgba(0, 188, 212, 0.3)',
          border: '1px solid rgba(0, 188, 212, 0.3)',
        }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, opacity: 0.9 }}>
            Tu Progreso
          </Typography>
          <Typography variant="h4" sx={{ mt: 1, fontWeight: 700 }}>
            0%
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.9 }}>
            0 de 8 módulos completados
          </Typography>
        </Box>
        
        {/* Botón de Logout */}
        <ListItem disablePadding sx={{ mt: 2 }}>
          <ListItemButton
            onClick={handleLogoutClick}
            sx={{
              borderRadius: 2,
              bgcolor: 'error.main',
              color: 'error.contrastText',
              border: '2px solid',
              borderColor: 'error.main',
              '&:hover': {
                bgcolor: 'error.dark',
                borderColor: 'error.dark',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(244, 67, 54, 0.4)',
              },
              transition: 'all 0.2s ease-in-out',
              boxShadow: '0 2px 8px rgba(244, 67, 54, 0.3)',
            }}
          >
            <ListItemIcon sx={{ color: 'inherit' }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText
              primary="🚪 SALIR DEL SISTEMA"
              primaryTypographyProps={{
                fontSize: '0.95rem',
                fontWeight: 700,
              }}
            />
          </ListItemButton>
        </ListItem>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: 'background.paper',
          color: 'text.primary',
          boxShadow: '0 1px 3px rgba(0,0,0,0.5)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" noWrap component="div">
              {menuItems.find(item => item.path === location.pathname)?.text || 'Jurídica Digital'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip
              icon={<TrophyIcon />}
              label="DPO Profesional"
              color="primary"
              variant="outlined"
              sx={{
                backgroundColor: 'rgba(0, 188, 212, 0.1)',
                borderColor: '#00bcd4',
                color: '#00bcd4',
                fontWeight: 600,
              }}
            />
            
            {/* Botón de Salir del Sistema */}
            <IconButton
              onClick={handleLogoutClick}
              color="error"
              sx={{
                bgcolor: 'error.main',
                color: 'error.contrastText',
                '&:hover': {
                  bgcolor: 'error.dark',
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.2s ease-in-out',
                boxShadow: '0 2px 8px rgba(244, 67, 54, 0.3)',
              }}
              title="Salir del Sistema"
            >
              <LogoutIcon />
            </IconButton>
            
            <Avatar sx={{ 
              bgcolor: theme.palette.primary.main,
              color: '#000',
              fontWeight: 'bold',
              boxShadow: '0 2px 10px rgba(0, 188, 212, 0.3)',
            }}>
              JD
            </Avatar>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? mobileOpen : true}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              bgcolor: 'background.paper',
              borderRight: '1px solid',
              borderColor: 'divider',
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: '64px',
          bgcolor: 'background.default',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        <Box className="fade-in">
          {children}
        </Box>
      </Box>

      {/* Diálogo de confirmación de logout */}
      <Dialog
        open={logoutDialogOpen}
        onClose={handleLogoutCancel}
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-description"
        PaperProps={{
          sx: {
            bgcolor: 'background.paper',
            border: '2px solid',
            borderColor: 'error.main',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(244, 67, 54, 0.3)',
          }
        }}
      >
        <DialogTitle id="logout-dialog-title" sx={{ 
          color: 'error.main', 
          fontWeight: 700,
          textAlign: 'center',
          fontSize: '1.25rem'
        }}>
          🚪 ¿Salir del Sistema?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="logout-dialog-description" sx={{ 
            color: 'text.primary',
            textAlign: 'center',
            fontSize: '1rem',
            py: 2
          }}>
            Se cerrará tu sesión y tendrás que iniciar sesión nuevamente para acceder al sistema.
            <br />
            <strong>¿Estás seguro que deseas continuar?</strong>
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', gap: 2, pb: 3 }}>
          <Button 
            onClick={handleLogoutCancel} 
            variant="outlined"
            color="primary"
            sx={{ 
              minWidth: 120,
              fontWeight: 600,
              borderRadius: 2
            }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleLogoutConfirm} 
            variant="contained"
            color="error"
            sx={{ 
              minWidth: 120,
              fontWeight: 700,
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(244, 67, 54, 0.4)',
              '&:hover': {
                boxShadow: '0 6px 20px rgba(244, 67, 54, 0.6)',
              }
            }}
          >
            Sí, Salir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Layout;