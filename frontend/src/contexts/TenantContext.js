/**
 * TenantContext Simplificado - Sin Supabase
 * Para desarrollo local con backend SQL Server
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

console.log('🚀 TenantContext LOCAL MODE - SQL Server Backend');

const TenantContext = createContext();

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant debe ser usado dentro de un TenantProvider');
  }
  return context;
};

export const TenantProvider = ({ children }) => {
  const [currentTenant, setCurrentTenant] = useState('demo');
  const [availableTenants, setAvailableTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();

  // Cargar tenants simulados para desarrollo local
  const loadAvailableTenants = async () => {
    console.log('🚀 Cargando tenants locales');
    
    try {
      // Tenants demo para desarrollo
      const demoTenants = [
        {
          id: 'demo',
          name: 'Empresa Demo',
          description: 'Organización de demostración',
          industry: 'Tecnología',
          status: 'active'
        },
        {
          id: 'test',
          name: 'Empresa Test',
          description: 'Organización de pruebas',
          industry: 'Servicios',
          status: 'active'
        }
      ];
      
      setAvailableTenants(demoTenants);
      
      if (!currentTenant && demoTenants.length > 0) {
        setCurrentTenant(demoTenants[0].id);
      }
      
      console.log('✅ Tenants cargados:', demoTenants.length);
      return demoTenants;
    } catch (error) {
      console.error('❌ Error cargando tenants:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Inicializar tenants
  useEffect(() => {
    if (isAuthenticated) {
      loadAvailableTenants();
    } else {
      // Si no está autenticado, usar tenant por defecto
      setCurrentTenant('demo');
      setAvailableTenants([{
        id: 'demo',
        name: 'Demo',
        description: 'Modo demostración'
      }]);
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  // Cambiar tenant actual
  const switchTenant = async (tenantId) => {
    try {
      console.log('🔄 Cambiando a tenant:', tenantId);
      setCurrentTenant(tenantId);
      
      // Aquí se podría hacer una llamada al backend para cambiar el tenant
      // Por ahora solo cambiamos el estado local
      
      console.log('✅ Tenant cambiado a:', tenantId);
      return true;
    } catch (error) {
      console.error('❌ Error cambiando tenant:', error);
      return false;
    }
  };

  // Obtener información del tenant actual
  const getCurrentTenantInfo = () => {
    return availableTenants.find(t => t.id === currentTenant) || {
      id: currentTenant,
      name: 'Tenant Actual',
      description: 'Información no disponible'
    };
  };

  const value = {
    currentTenant,
    availableTenants,
    loading,
    loadAvailableTenants,
    switchTenant,
    getCurrentTenantInfo,
    setCurrentTenant
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
};