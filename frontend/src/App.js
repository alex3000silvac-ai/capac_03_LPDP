import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, CircularProgress } from '@mui/material';
import { COLORS, rgba } from './theme/colors';

// Contextos
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TenantProvider, useTenant } from './contexts/TenantContext';

// Componentes
import Layout from './components/Layout';
import Login from './components/auth/Login';
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
import ConsolidadoRAT from './components/ConsolidadoRAT';
import RutaCapacitacionLPDP from './pages/RutaCapacitacionLPDP';
import PlanesLPDP from './pages/PlanesLPDP';
import ModuloEIPD from './components/ModuloEIPD';
import GestionProveedores from './components/GestionProveedores';
import RATProduccion from './pages/RATProduccion';
import RATFormWithCompliance from './components/RATFormWithCompliance';
import DashboardDPO from './pages/DashboardDPO';
import ProcesoCompletoPage from './pages/ProcesoCompleto';
import GestionAsociaciones from './pages/GestionAsociaciones';
import DPIAAlgoritmos from './pages/DPIAAlgoritmos';
import ConsultaPreviaAgencia from './components/ConsultaPreviaAgencia';

// Tema oscuro profesional - SIN HARDCODEO
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: COLORS.primary,
    secondary: COLORS.secondary,
    background: COLORS.background,
    text: COLORS.text,
    success: COLORS.semantic.success,
    warning: COLORS.semantic.warning,
    error: COLORS.semantic.error,
    info: COLORS.semantic.info,
    divider: COLORS.divider,
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      color: COLORS.text.primary,
    },
    h2: {
      fontWeight: 600,
      color: COLORS.text.primary,
    },
    h3: {
      fontWeight: 600,
      color: COLORS.text.primary,
    },
    h4: {
      fontWeight: 600,
      color: COLORS.text.primary,
    },
    h5: {
      fontWeight: 500,
      color: COLORS.text.primary,
    },
    h6: {
      fontWeight: 500,
      color: COLORS.text.primary,
    },
    body1: {
      color: COLORS.text.primary,
    },
    body2: {
      color: COLORS.text.secondary,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: COLORS.background.default,
          color: COLORS.text.primary,
          scrollbarColor: `${COLORS.border.strong} ${COLORS.background.paper}`,
          '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
            borderRadius: '4px',
            backgroundColor: COLORS.border.strong,
            '&:hover': {
              backgroundColor: COLORS.border.medium,
            },
          },
          '&::-webkit-scrollbar-track, & *::-webkit-scrollbar-track': {
            backgroundColor: COLORS.background.paper,
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: COLORS.background.paper,
          borderBottom: `1px solid ${COLORS.divider}`,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: COLORS.background.paper,
          borderRadius: '12px',
          border: `1px solid ${COLORS.divider}`,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: COLORS.background.paper,
          borderRadius: '12px',
          border: `1px solid ${COLORS.divider}`,
          boxShadow: `0 4px 20px ${rgba(COLORS.background.default, 0.5)}`,
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
          boxShadow: `0 2px 10px ${rgba(COLORS.primary.main, 0.3)}`,
          '&:hover': {
            boxShadow: `0 4px 20px ${rgba(COLORS.primary.main, 0.4)}`,
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: COLORS.background.surface,
            '& fieldset': {
              borderColor: COLORS.border.light,
            },
            '&:hover fieldset': {
              borderColor: COLORS.border.strong,
            },
            '&.Mui-focused fieldset': {
              borderColor: COLORS.primary.main,
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: COLORS.background.surface,
          color: COLORS.text.primary,
          border: `1px solid ${COLORS.border.light}`,
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          backgroundColor: COLORS.divider,
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

  // Si es usuario restringido y la ruta no permite acceso, bloquear
  if (isRestricted() && !allowDemo) {
    return <Navigate to="/dashboard-dpo" replace />;
  }

  // Verificar permisos si se especifican
  if (requiredPermissions && requiredPermissions.length > 0) {
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

  // Si hay usuario pero no hay tenant seleccionado (excepto en modo demo)
  if (!currentTenant && user?.tenant_id !== 'demo') {
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
        <Route path="/" element={<Navigate to="/dashboard-dpo" replace />} />
        
        {/* Dashboard Principal del DPO */}
        <Route path="/dashboard-dpo" element={
          <ProtectedRoute>
            <DashboardDPO />
          </ProtectedRoute>
        } />
        
        {/* Proceso Completo - Cierre de RAT */}
        <Route path="/proceso-completo" element={
          <ProtectedRoute>
            <ProcesoCompletoPage />
          </ProtectedRoute>
        } />
        
        {/* Gestión de Asociaciones */}
        <Route path="/gestion-asociaciones" element={
          <ProtectedRoute>
            <GestionAsociaciones />
          </ProtectedRoute>
        } />
        
        {/* DPIA Algoritmos */}
        <Route path="/dpia-algoritmos" element={
          <ProtectedRoute>
            <DPIAAlgoritmos />
          </ProtectedRoute>
        } />
        
        {/* Consulta Previa Agencia Nacional */}
        <Route path="/consulta-previa" element={
          <ProtectedRoute>
            <ConsultaPreviaAgencia />
          </ProtectedRoute>
        } />
        
        <Route 
          path="/modulo-cero" 
          element={
            <ProtectedRoute allowDemo={true}>
              <ModuloCero />
            </ProtectedRoute>
          } 
        />
        <Route path="/modulo/:moduloId" element={
          <ProtectedRoute>
            <ModuloCapacitacion />
          </ProtectedRoute>
        } />
        <Route 
          path="/modulo/introduccion_lpdp" 
          element={
            <ProtectedRoute allowDemo={true}>
              <IntroduccionLPDP />
            </ProtectedRoute>
          } 
        />
        <Route path="/modulo/conceptos_basicos" element={
          <ProtectedRoute>
            <ConceptosBasicos />
          </ProtectedRoute>
        } />
        <Route path="/modulo3" element={
          <ProtectedRoute>
            <Modulo3Inventario />
          </ProtectedRoute>
        } />
        <Route path="/glosario" element={
          <ProtectedRoute>
            <GlosarioLPDP />
          </ProtectedRoute>
        } />
        <Route path="/sandbox" element={
          <ProtectedRoute>
            <PracticaSandbox />
          </ProtectedRoute>
        } />
        <Route path="/sandbox-completo" element={
          <ProtectedRoute>
            <SandboxCompleto />
          </ProtectedRoute>
        } />
        <Route path="/herramientas" element={
          <ProtectedRoute>
            <HerramientasLPDP />
          </ProtectedRoute>
        } />
        <Route path="/mi-progreso" element={
          <ProtectedRoute>
            <MiProgreso />
          </ProtectedRoute>
        } />
        <Route path="/consolidado-rat" element={
          <ProtectedRoute>
            <ConsolidadoRAT />
          </ProtectedRoute>
        } />
        <Route path="/ruta-capacitacion" element={
          <ProtectedRoute>
            <RutaCapacitacionLPDP />
          </ProtectedRoute>
        } />
        <Route path="/evaluacion-impacto" element={
          <ProtectedRoute>
            <ModuloEIPD />
          </ProtectedRoute>
        } />
        <Route path="/gestion-proveedores" element={
          <ProtectedRoute>
            <GestionProveedores />
          </ProtectedRoute>
        } />
        <Route path="/rat-produccion" element={
          <ProtectedRoute>
            <RATProduccion />
          </ProtectedRoute>
        } />
        <Route path="/reportes" element={
          <ProtectedRoute>
            <ConsolidadoRAT />
          </ProtectedRoute>
        } />
        
        {/* RAT con Compliance - Sistema Real */}
        <Route path="/rat-compliance" element={
          <ProtectedRoute>
            <RATFormWithCompliance />
          </ProtectedRoute>
        } />
        
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
        <Route path="*" element={<Navigate to="/modulo-cero" replace />} />
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
              border: `2px solid ${COLORS.primary.main}`,
              borderRadius: '12px',
              background: COLORS.background.paper,
              color: COLORS.text.primary,
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              boxShadow: `0 4px 15px ${rgba(COLORS.background.default, 0.3)}`
            }}
            onMouseEnter={(e) => {
              e.target.style.background = COLORS.background.surface;
              e.target.style.borderColor = COLORS.primary.light;
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = `0 6px 25px ${rgba(COLORS.primary.main, 0.4)}`;
            }}
            onMouseLeave={(e) => {
              e.target.style.background = COLORS.background.paper;
              e.target.style.borderColor = COLORS.primary.main;
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = `0 4px 15px ${rgba(COLORS.background.default, 0.3)}`;
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