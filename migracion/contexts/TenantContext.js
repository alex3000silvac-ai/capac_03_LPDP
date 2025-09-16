/**
 * TenantContext Supabase - SOLO SUPABASE
 * Máxima simplicidad para usar únicamente Supabase como plataforma única
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getCurrentTenant, getOrganizaciones } from '../config/supabaseConfig';

console.log('🚀 TenantContext SUPABASE-ONLY MODE');

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
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();

  // Cargar tenant del usuario actual desde Supabase
  const loadCurrentTenant = async () => {
    if (!user) {
      setCurrentTenant(null);
      setLoading(false);
      return;
    }

    try {
      console.log('🚀 Cargando tenant desde Supabase para usuario:', user.email);
      
      // Obtener el tenant_id del usuario
      const tenantId = await getCurrentTenant();
      if (tenantId) {
        setCurrentTenant(tenantId);
        console.log('✅ Tenant cargado:', tenantId);
        
        // Cargar organizaciones del tenant
        const orgResult = await getOrganizaciones();
        if (orgResult.success) {
          const tenants = orgResult.data.map(org => ({
            id: org.tenant_id,
            name: org.razon_social || org.template_name || 'Organización',
            organizacion: org
          }));
          setAvailableTenants(tenants);
        }
      }
    } catch (error) {
      console.error('❌ Error cargando tenant:', error);
    } finally {
      setLoading(false);
    }
  };

  // Efecto para cargar tenant cuando cambia el usuario
  useEffect(() => {
    if (isAuthenticated && user) {
      loadCurrentTenant();
    } else {
      setCurrentTenant(null);
      setAvailableTenants([]);
      setLoading(false);
    }
  }, [user, isAuthenticated]);

  // Cambiar tenant actual
  const switchTenant = async (tenantId) => {
    console.log('🔄 Cambiando a tenant:', tenantId);
    setCurrentTenant(tenantId);
  };

  const value = {
    currentTenant,
    availableTenants,
    loading,
    switchTenant,
    reloadTenants: loadCurrentTenant
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
};