// 🔌 TENANTCONTEXT MODO OFFLINE COMPLETO
// Para desarrollo local sin backend externo
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

console.log('🔌 Iniciando TenantContext en modo OFFLINE');

const TenantContext = createContext();

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant debe ser usado dentro de un TenantProvider');
  }
  return context;
};

export const TenantProvider = ({ children }) => {
  const [currentTenant, setCurrentTenant] = useState(null);
  const [availableTenants, setAvailableTenants] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, token, isAuthenticated } = useAuth();

  // Tenants offline predefinidos
  const offlineTenants = [
    {
      id: 'demo_offline',
      company_name: 'Empresa Demo Offline',
      display_name: 'Empresa Demo Offline',
      industry: 'Tecnología',
      size: 'Pequeña',
      country: 'Chile',
      created_at: new Date().toISOString(),
      is_demo: true,
      offline_mode: true
    },
    {
      id: 'empresa_chile_1',
      company_name: 'Empresa Chilena Ejemplo',
      display_name: 'Empresa Chilena Ejemplo',
      industry: 'Servicios',
      size: 'Mediana',
      country: 'Chile',
      created_at: new Date().toISOString(),
      is_demo: false,
      offline_mode: true
    },
    {
      id: 'juridica_digital_demo',
      company_name: 'Jurídica Digital SPA',
      display_name: 'Jurídica Digital SPA',
      industry: 'Legal Tech',
      size: 'Startup',
      country: 'Chile',
      created_at: new Date().toISOString(),
      is_demo: false,
      offline_mode: true
    }
  ];

  // Auto-setup cuando el usuario se autentica
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('🔌 Auto-setup tenants offline');
      
      setAvailableTenants(offlineTenants);
      setLoading(false);

      // Cargar tenant guardado o seleccionar el primero
      const savedTenantId = localStorage.getItem('tenant_id') || localStorage.getItem('lpdp_current_tenant');
      
      let selectedTenant;
      if (savedTenantId) {
        selectedTenant = offlineTenants.find(t => t.id === savedTenantId || savedTenantId.includes(t.id));
      }
      
      if (!selectedTenant) {
        selectedTenant = offlineTenants[0]; // Demo offline por defecto
      }
      
      setCurrentTenant(selectedTenant);
      localStorage.setItem('tenant_id', selectedTenant.id);
      localStorage.setItem('lpdp_current_tenant', JSON.stringify(selectedTenant));
      
      console.log('🔌 Tenant seleccionado automáticamente:', selectedTenant.company_name);
    }
  }, [isAuthenticated, user]);

  // Intentar restaurar tenant al inicializar
  useEffect(() => {
    const savedTenant = localStorage.getItem('lpdp_current_tenant');
    const savedTenantId = localStorage.getItem('tenant_id');
    
    if (savedTenant) {
      try {
        const tenant = JSON.parse(savedTenant);
        setCurrentTenant(tenant);
        console.log('🔌 Tenant restaurado desde localStorage:', tenant.company_name);
      } catch (error) {
        console.log('🔌 Error parseando tenant guardado, usando demo');
        const demoTenant = offlineTenants[0];
        setCurrentTenant(demoTenant);
        localStorage.setItem('tenant_id', demoTenant.id);
        localStorage.setItem('lpdp_current_tenant', JSON.stringify(demoTenant));
      }
    } else if (savedTenantId) {
      const tenant = offlineTenants.find(t => t.id === savedTenantId) || offlineTenants[0];
      setCurrentTenant(tenant);
      localStorage.setItem('lpdp_current_tenant', JSON.stringify(tenant));
      console.log('🔌 Tenant seleccionado por ID:', tenant.company_name);
    }
  }, []);

  const loadAvailableTenants = async () => {
    console.log('🔌 Cargando tenants offline');
    setAvailableTenants(offlineTenants);
    setLoading(false);
    return offlineTenants;
  };

  const selectTenant = async (tenant) => {
    console.log('🔌 Seleccionando tenant offline:', tenant.company_name);
    
    setCurrentTenant(tenant);
    localStorage.setItem('tenant_id', tenant.id);
    localStorage.setItem('lpdp_current_tenant', JSON.stringify(tenant));
    
    return true;
  };

  const createTenant = async (tenantData) => {
    console.log('🔌 Creando tenant offline:', tenantData);
    
    const newTenant = {
      id: `offline_${Date.now()}`,
      company_name: tenantData.company_name || 'Nueva Empresa',
      display_name: tenantData.company_name || 'Nueva Empresa',
      industry: tenantData.industry || 'Otros',
      size: tenantData.size || 'Pequeña',
      country: 'Chile',
      created_at: new Date().toISOString(),
      is_demo: false,
      offline_mode: true,
      ...tenantData
    };
    
    const updatedTenants = [...availableTenants, newTenant];
    setAvailableTenants(updatedTenants);
    
    // Guardar en localStorage para persistencia
    localStorage.setItem('offline_tenants', JSON.stringify(updatedTenants));
    
    return newTenant;
  };

  const updateTenant = async (tenantId, updateData) => {
    console.log('🔌 Actualizando tenant offline:', tenantId, updateData);
    
    const updatedTenants = availableTenants.map(t => 
      t.id === tenantId ? { ...t, ...updateData } : t
    );
    
    setAvailableTenants(updatedTenants);
    
    // Si es el tenant actual, actualizarlo
    if (currentTenant?.id === tenantId) {
      const updatedTenant = { ...currentTenant, ...updateData };
      setCurrentTenant(updatedTenant);
      localStorage.setItem('lpdp_current_tenant', JSON.stringify(updatedTenant));
    }
    
    localStorage.setItem('offline_tenants', JSON.stringify(updatedTenants));
    
    return updatedTenants.find(t => t.id === tenantId);
  };

  const deleteTenant = async (tenantId) => {
    console.log('🔌 Eliminando tenant offline:', tenantId);
    
    const filteredTenants = availableTenants.filter(t => t.id !== tenantId);
    setAvailableTenants(filteredTenants);
    
    // Si es el tenant actual, seleccionar otro
    if (currentTenant?.id === tenantId) {
      const newTenant = filteredTenants[0] || offlineTenants[0];
      setCurrentTenant(newTenant);
      localStorage.setItem('tenant_id', newTenant.id);
      localStorage.setItem('lpdp_current_tenant', JSON.stringify(newTenant));
    }
    
    localStorage.setItem('offline_tenants', JSON.stringify(filteredTenants));
    
    return true;
  };

  const clearTenant = () => {
    console.log('🔌 Limpiando tenant offline');
    setCurrentTenant(null);
    localStorage.removeItem('tenant_id');
    localStorage.removeItem('lpdp_current_tenant');
  };

  const value = {
    currentTenant,
    availableTenants,
    loading,
    selectTenant,
    createTenant,
    updateTenant,
    deleteTenant,
    clearTenant,
    loadAvailableTenants
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
};

export default TenantContext;