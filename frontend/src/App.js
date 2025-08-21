import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, CircularProgress } from '@mui/material';

// Contextos
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TenantProvider, useTenant } from './contexts/TenantContext';

// Componentes
import Layout from './components/Layout';
import Login from './components/auth/Login';
import Dashboard from './pages/Dashboard';
import ModuloCapacitacion from './pages/ModuloCapacitacion';
import PracticaSandbox from './pages/PracticaSandbox';
import MiProgreso from './pages/MiProgreso';
import AdminPanel from './pages/AdminPanel';
import UserManagement from './components/admin/UserManagement';
import Modulo3Inventario from './pages/Modulo3Inventario';
import GlosarioLPDP from './pages/GlosarioLPDP';
import SandboxCompleto from './pages/SandboxCompleto';
import IntroduccionLPDP from './pages/IntroduccionLPDP';
import HerramientasLPDP from './pages/HerramientasLPDP';
import ConceptosBasicos from './pages/ConceptosBasicos';
import ModuloCero from './pages/ModuloCero';

// Tema oscuro profesional
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00bcd4', // Cyan para el tema LPDP
      light: '#33d9f0',
      dark: '#00838f',
      contrastText: '#000000',
    },
    secondary: {
      main: '#ff9800', // Naranja para acentos
      light: '#ffb74d',
      dark: '#f57c00',
      contrastText: '#000000',
    },
    background: {
      default: '#0a0a0a', // Negro profundo
      paper: '#1a1a1a', // Gris oscuro para componentes
    },
    surface: {
      main: '#2a2a2a',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0b0b0',
    },
    success: {
      main: '#4caf50',
      light: '#81c784',
      dark: '#388e3c',
    },
    warning: {
      main: '#ff9800',
      light: '#ffb74d',
      dark: '#f57c00',
    },
    error: {
      main: '#f44336',
      light: '#e57373',
      dark: '#d32f2f',
    },
    info: {
      main: '#2196f3',
      light: '#64b5f6',
      dark: '#1976d2',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      color: '#ffffff',
    },
    h2: {
      fontWeight: 600,
      color: '#ffffff',
    },
    h3: {
      fontWeight: 600,
      color: '#ffffff',
    },
    h4: {
      fontWeight: 600,
      color: '#ffffff',
    },
    h5: {
      fontWeight: 500,
      color: '#ffffff',
    },
    h6: {
      fontWeight: 500,
      color: '#ffffff',
    },
    body1: {
      color: '#ffffff',
    },
    body2: {
      color: '#b0b0b0',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#0a0a0a',
          color: '#ffffff',
          scrollbarColor: '#666 #1a1a1a',
          '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
            borderRadius: '4px',
            backgroundColor: '#666',
            '&:hover': {
              backgroundColor: '#888',
            },
          },
          '&::-webkit-scrollbar-track, & *::-webkit-scrollbar-track': {
            backgroundColor: '#1a1a1a',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a1a1a',
          borderBottom: '1px solid #333',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a1a1a',
          borderRadius: '12px',
          border: '1px solid #333',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a1a1a',
          borderRadius: '12px',
          border: '1px solid #333',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none',
          fontWeight: 600,
        },
        contained: {
          boxShadow: '0 2px 10px rgba(0, 188, 212, 0.3)',
          '&:hover': {
            boxShadow: '0 4px 20px rgba(0, 188, 212, 0.4)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#2a2a2a',
            '& fieldset': {
              borderColor: '#444',
            },
            '&:hover fieldset': {
              borderColor: '#666',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#00bcd4',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: '#2a2a2a',
          color: '#ffffff',
          border: '1px solid #444',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          backgroundColor: '#333',
        },
      },
    },
  },
});

// Componente de carga
const LoadingScreen = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    minHeight="100vh"
    flexDirection="column"
    gap={2}
  >
    <CircularProgress size={60} />
    <h2>Cargando Sistema LPDP...</h2>
  </Box>
);

// Componente de rutas protegidas
const ProtectedRoute = ({ children, requiredPermissions = [], allowDemo = false }) => {
  const { user, loading, isRestricted } = useAuth();
  const { currentTenant } = useTenant();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!currentTenant) {
    return <Navigate to="/select-tenant" replace />;
  }

  // Si es usuario demo restringido y la ruta no permite demo, bloquear
  if (isRestricted() && !allowDemo) {
    return <Navigate to="/dashboard" replace />;
  }

  // Verificar permisos si se especifican
  if (requiredPermissions.length > 0) {
    const hasPermission = requiredPermissions.some(permission => 
      user.permissions?.includes(permission) || user.is_superuser
    );
    
    if (!hasPermission) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
};

// Componente principal de la aplicación
const AppContent = () => {
  const { user, loading } = useAuth();
  const { currentTenant } = useTenant();

  if (loading) {
    return <LoadingScreen />;
  }

  // Si no hay usuario, mostrar login
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Si hay usuario pero no hay tenant seleccionado
  if (!currentTenant) {
    return (
      <Routes>
        <Route path="/select-tenant" element={<TenantSelector />} />
        <Route path="*" element={<Navigate to="/select-tenant" replace />} />
      </Routes>
    );
  }

  // Usuario autenticado y tenant seleccionado
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route 
          path="/modulo-cero" 
          element={
            <ProtectedRoute allowDemo={true}>
              <ModuloCero />
            </ProtectedRoute>
          } 
        />
        <Route path="/modulo/:moduloId" element={<ModuloCapacitacion />} />
        <Route 
          path="/modulo/introduccion_lpdp" 
          element={
            <ProtectedRoute allowDemo={true}>
              <IntroduccionLPDP />
            </ProtectedRoute>
          } 
        />
        <Route path="/modulo/conceptos_basicos" element={<ConceptosBasicos />} />
        <Route path="/modulo3" element={<Modulo3Inventario />} />
        <Route path="/glosario" element={<GlosarioLPDP />} />
        <Route path="/sandbox" element={<PracticaSandbox />} />
        <Route path="/sandbox-completo" element={<SandboxCompleto />} />
        <Route path="/herramientas" element={<HerramientasLPDP />} />
        <Route path="/mi-progreso" element={<MiProgreso />} />
        
        {/* Rutas de administración */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requiredPermissions={["admin.view"]}>
              <AdminPanel />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/users" 
          element={
            <ProtectedRoute requiredPermissions={["users.manage"]}>
              <UserManagement />
            </ProtectedRoute>
          } 
        />
        
        {/* Ruta por defecto */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
};

// Componente selector de tenant
const TenantSelector = () => {
  const { user } = useAuth();
  const { setCurrentTenant, availableTenants } = useTenant();

  const handleTenantSelect = (tenant) => {
    setCurrentTenant(tenant);
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      gap={3}
      p={3}
    >
      <h1>Selecciona tu Empresa</h1>
      <p>Bienvenido, {user?.first_name} {user?.last_name}</p>
      
      <Box display="flex" flexDirection="column" gap={2} maxWidth={400}>
        {availableTenants?.map((tenant) => (
          <button
            key={tenant.id}
            onClick={() => handleTenantSelect(tenant)}
            style={{
              padding: '16px',
              border: '2px solid #00bcd4',
              borderRadius: '12px',
              background: '#1a1a1a',
              color: '#ffffff',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#2a2a2a';
              e.target.style.borderColor = '#33d9f0';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 25px rgba(0, 188, 212, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#1a1a1a';
              e.target.style.borderColor = '#00bcd4';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
            }}
          >
            {tenant.company_name}
          </button>
        ))}
      </Box>
    </Box>
  );
};

// Componente principal
const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <TenantProvider>
          <Router>
            <AppContent />
          </Router>
        </TenantProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;