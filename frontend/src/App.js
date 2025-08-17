import React, { useState, useEffect } from 'react';
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
import SimulacionEntrevista from './pages/SimulacionEntrevista';
import MiProgreso from './pages/MiProgreso';
import AdminPanel from './components/admin/AdminPanel';
import UserManagement from './components/admin/UserManagement';

// Tema personalizado
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
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
const ProtectedRoute = ({ children, requiredPermissions = [] }) => {
  const { user, loading } = useAuth();
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
        <Route path="/modulo/:moduloId" element={<ModuloCapacitacion />} />
        <Route path="/simulacion/:area" element={<SimulacionEntrevista />} />
        <Route path="/sandbox" element={<PracticaSandbox />} />
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
              border: '2px solid #1976d2',
              borderRadius: '8px',
              background: 'white',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
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