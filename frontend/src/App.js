import React, { useEffect } from 'react';
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
import AdminPanel from './pages/AdminPanel';
import UserManagement from './components/admin/UserManagement';
import IAAgentStatusPage from './components/admin/IAAgentStatusPage';
import GlosarioLPDP from './pages/GlosarioLPDP';
import ModuloEIPD from './components/ModuloEIPD';
import PreventiveAIController from './components/PreventiveAIController';
import GestionProveedores from './components/GestionProveedores';
import RATFormWithCompliance from './components/RATFormWithCompliance';
import DashboardDPO from './pages/DashboardDPO';
import ProcesoCompletoPage from './pages/ProcesoCompleto';
import GestionAsociaciones from './pages/GestionAsociaciones';
import DPIAAlgoritmos from './pages/DPIAAlgoritmos';
import RATSystemProfessional from './components/RATSystemProfessional';
import RATListPage from './pages/RATListPage';
import RATEditPage from './pages/RATEditPage';
import DPOApprovalQueue from './pages/DPOApprovalQueue';
import ComplianceMetrics from './components/ComplianceMetrics';
import EIPDCreator from './pages/EIPDCreator';
import ProviderManager from './pages/ProviderManager';
import AdminDashboard from './components/AdminDashboard';
import RATSearchFilter from './components/RATSearchFilter';
import NotificationCenter from './components/NotificationCenter';
import APIPartnersIntegration from './components/APIPartnersIntegration';
import ReportGenerator from './components/ReportGenerator';
import EIPDTemplates from './components/EIPDTemplates';
import CalendarView from './components/CalendarView';
import ImmutableAuditLog from './components/ImmutableAuditLog';
import DiagnosticCenter from './components/DiagnosticCenter';
import PaletaColores from './pages/PaletaColores';
import SistemaPrincipal from './pages/SistemaPrincipal';

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

  if (isRestricted() && !allowDemo) {
    return <Navigate to="/dashboard-dpo" replace />;
  }

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

const AppContent = () => {
  const { user, loading } = useAuth();
  const { currentTenant } = useTenant();
  
  // 🛡️ ACTIVAR IA PREVENTIVA AUTOMÁTICAMENTE
  useEffect(() => {
    if (user && currentTenant?.id) {
      console.log('🛡️ Activando IA Preventiva para ecosistema completo');
      // El controlador se activa automáticamente cuando hay usuario y tenant
    }
  }, [user, currentTenant?.id]);

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

  if (!currentTenant && user?.tenant_id !== (process.env.REACT_APP_DEMO_TENANT_ID || 'demo')) {
    return (
      <Routes>
        <Route path="/select-tenant" element={<TenantSelector />} />
        <Route path="*" element={<Navigate to="/select-tenant" replace />} />
      </Routes>
    );
  }

  return (
    <LayoutSimple>
      {/* 🛡️ CONTROLADOR IA PREVENTIVA - ECOSISTEMA INTEGRADO */}
      <PreventiveAIController />
      <Routes>
        <Route path="/" element={<Navigate to="/sistema-principal" replace />} />
        
        <Route path="/sistema-principal" element={<SistemaPrincipal />} />
        
        <Route path="/paleta-colores" element={<PaletaColores />} />
        
        <Route path="/rat-system" element={
          <ProtectedRoute>
            <RATSystemProfessional />
          </ProtectedRoute>
        } />
        
        <Route path="/rat-list" element={
          <ProtectedRoute>
            <RATListPage />
          </ProtectedRoute>
        } />
        
        <Route path="/rat-edit/:ratId" element={
          <ProtectedRoute>
            <RATEditPage />
          </ProtectedRoute>
        } />
        
        
        <Route path="/compliance-metrics" element={
          <ProtectedRoute requiredPermissions={["dpo.view"]}>
            <ComplianceMetrics />
          </ProtectedRoute>
        } />
        
        <Route path="/eipd-creator" element={
          <ProtectedRoute>
            <EIPDCreator />
          </ProtectedRoute>
        } />
        
        <Route path="/eipd-creator/:ratId" element={
          <ProtectedRoute>
            <EIPDCreator />
          </ProtectedRoute>
        } />
        
        <Route path="/provider-manager" element={
          <ProtectedRoute>
            <ProviderManager />
          </ProtectedRoute>
        } />
        
        <Route path="/admin-dashboard" element={
          <ProtectedRoute requiredPermissions={["admin.view"]}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        
        
        
        <Route path="/notifications" element={
          <ProtectedRoute>
            <NotificationCenter />
          </ProtectedRoute>
        } />
        
        <Route path="/eipd-templates" element={
          <ProtectedRoute>
            <EIPDTemplates />
          </ProtectedRoute>
        } />
        
        <Route path="/calendar" element={
          <ProtectedRoute>
            <CalendarView />
          </ProtectedRoute>
        } />
        
        <Route path="/audit-log" element={
          <ProtectedRoute requiredPermissions={["audit.view"]}>
            <ImmutableAuditLog />
          </ProtectedRoute>
        } />
        
        <Route path="/diagnostic" element={
          <ProtectedRoute requiredPermissions={["admin.view"]}>
            <DiagnosticCenter />
          </ProtectedRoute>
        } />
        
        <Route path="/rat-search" element={
          <ProtectedRoute>
            <RATSearchFilter />
          </ProtectedRoute>
        } />
        
        
        
        <Route path="/dashboard-dpo" element={
          <ProtectedRoute>
            <DashboardDPO />
          </ProtectedRoute>
        } />
        
        <Route path="/proceso-completo" element={
          <ProtectedRoute>
            <ProcesoCompletoPage />
          </ProtectedRoute>
        } />
        
        <Route path="/gestion-asociaciones" element={
          <ProtectedRoute>
            <GestionAsociaciones />
          </ProtectedRoute>
        } />
        
        <Route path="/dpia-algoritmos" element={
          <ProtectedRoute>
            <DPIAAlgoritmos />
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
        
        <Route path="/rat-compliance" element={
          <ProtectedRoute>
            <RATFormWithCompliance />
          </ProtectedRoute>
        } />
        
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
        
        <Route 
          path="/admin/ia-agent" 
          element={
            <ProtectedRoute requiredPermissions={["admin.view"]}>
              <IAAgentStatusPage />
            </ProtectedRoute>
          } 
        />
        
        <Route path="/glosario" element={
          <ProtectedRoute>
            <GlosarioLPDP />
          </ProtectedRoute>
        } />
        
        <Route path="/reports" element={
          <ProtectedRoute>
            <ReportGenerator />
          </ProtectedRoute>
        } />
        
        <Route path="/admin/api-partners" element={
          <ProtectedRoute requiredPermissions={["admin.view"]}>
            <APIPartnersIntegration />
          </ProtectedRoute>
        } />
        
        <Route path="*" element={<Navigate to="/sistema-principal" replace />} />
      </Routes>
    </LayoutSimple>
  );
};

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
              border: '1px solid #374151',
              borderRadius: '0.5rem',
              background: '#1f2937',
              color: '#f9fafb',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#374151';
              e.target.style.borderColor = '#4f46e5';
              e.target.style.transform = 'translateY(-5px)';
              e.target.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#1f2937';
              e.target.style.borderColor = '#374151';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)';
            }}
          >
            {tenant.company_name}
          </button>
        ))}
      </Box>
    </Box>
  );
};

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