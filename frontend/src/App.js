import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, CircularProgress } from '@mui/material';
import darkTheme from './theme/darkTheme';

import './styles/responsive.css';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TenantProvider, useTenant } from './contexts/TenantContext';

import LayoutSimple from './components/LayoutSimple';
import Login from './components/auth/Login';
import SistemaPrincipal from './pages/SistemaPrincipal';
import RATSystemProfessional from './components/RATSystemProfessional';
import DashboardDPO from './pages/DashboardDPO';
import EIPDCreator from './pages/EIPDCreator';
import ProviderManager from './pages/ProviderManager';
import ComplianceMetrics from './components/ComplianceMetrics';
import NotificationCenter from './components/NotificationCenter';
import RATListPage from './pages/RATListPage';
import EIPDListPage from './pages/EIPDListPage';
import AdminDashboard from './components/AdminDashboard';
import DPAGenerator from './components/DPAGenerator';
import ReportGenerator from './components/ReportGenerator';
import GlosarioLPDP from './pages/GlosarioLPDP';

const theme = createTheme(darkTheme);

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

const AppContent = () => {
  const { user, loading } = useAuth();
  const { currentTenant } = useTenant();
  
  console.log('🔍 Debug AppContent:', { 
    user: user?.email, 
    tenant_id: user?.tenant_id,
    currentTenant, 
    loading 
  });

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Renderizar directamente el sistema principal
  console.log('🚀 RENDERIZANDO SISTEMA PRINCIPAL DIRECTAMENTE');
  
  return (
    <LayoutSimple>
      <Routes>
        <Route path="/" element={<Navigate to="/sistema-principal" replace />} />
        <Route path="/sistema-principal" element={<SistemaPrincipal />} />
        
        {/* Rutas principales de las tarjetas */}
        <Route path="/rat-system" element={<RATSystemProfessional />} />
        <Route path="/rat-list" element={<RATListPage />} />
        <Route path="/compliance-metrics" element={<ComplianceMetrics />} />
        <Route path="/dashboard-dpo" element={<DashboardDPO />} />
        <Route path="/eipd-creator" element={<EIPDCreator />} />
        <Route path="/eipd-list" element={<EIPDListPage />} />
        <Route path="/provider-manager" element={<ProviderManager />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/dpa-generator" element={<DPAGenerator />} />
        <Route path="/notifications" element={<NotificationCenter />} />
        <Route path="/reports" element={<ReportGenerator />} />
        <Route path="/glosario" element={<GlosarioLPDP />} />
        
        <Route path="*" element={<Navigate to="/sistema-principal" replace />} />
      </Routes>
    </LayoutSimple>
  );
};

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <TenantProvider>
          <Router 
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true
            }}
          >
            <AppContent />
          </Router>
        </TenantProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;