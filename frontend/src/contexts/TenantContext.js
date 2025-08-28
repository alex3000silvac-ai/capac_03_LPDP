// 🚀 TENANTCONTEXT MODO ONLINE - PRODUCCIÓN SUPABASE
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { ratService } from '../services/ratService';
import { supabase } from '../config/supabaseClient';

console.log('🚀 Iniciando TenantContext en modo PRODUCCIÓN SUPABASE');

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
  const { user, token, isAuthenticated } = useAuth();

  // Cargar organizaciones desde Supabase
  const loadAvailableTenants = async () => {
    if (!isAuthenticated || !user) {
      console.log('🚀 Usuario no autenticado, no se cargan tenants');
      return [];
    }
    
    try {
      console.log('🚀 Cargando organizaciones desde Supabase para user:', user.id);
      setLoading(true);
      
      const { data, error } = await supabase
        .from('organizaciones')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) {
        console.error('🚀 Error cargando organizaciones:', error);
        // Si no hay organizaciones o hay error, crear una por defecto
        const defaultOrg = await createDefaultOrganization();
        return [defaultOrg];
      }
      
      console.log('🚀 Organizaciones cargadas:', data?.length || 0);
      
      if (!data || data.length === 0) {
        // Crear organización por defecto si no existe ninguna
        const defaultOrg = await createDefaultOrganization();
        setAvailableTenants([defaultOrg]);
        return [defaultOrg];
      }
      
      setAvailableTenants(data);
      return data;
      
    } catch (error) {
      console.error('🚀 Error cargando tenants:', error);
      const defaultOrg = await createDefaultOrganization();
      setAvailableTenants([defaultOrg]);
      return [defaultOrg];
    } finally {
      setLoading(false);
    }
  };
  
  const createDefaultOrganization = async () => {
    if (!user) return null;
    
    const defaultOrg = {
      id: `org_${user.id}`,
      company_name: `Organización de ${user.email}`,
      display_name: `Organización de ${user.email}`,
      industry: 'General',
      size: 'Pequeña',
      country: 'Chile',
      user_id: user.id,
      created_at: new Date().toISOString(),
      is_demo: false,
      online_mode: true
    };
    
    try {
      const { data, error } = await supabase
        .from('organizaciones')
        .insert([defaultOrg])
        .select()
        .single();
        
      if (error) {
        console.error('🚀 Error creando organización por defecto:', error);
        return defaultOrg; // Devolver sin ID de Supabase
      }
      
      console.log('🚀 Organización por defecto creada:', data);
      return data;
    } catch (error) {
      console.error('🚀 Error creando organización por defecto:', error);
      return defaultOrg;
    }
  };

  // Auto-setup cuando el usuario se autentica
  useEffect(() => {
    const initializeTenants = async () => {
      if (isAuthenticated && user) {
        console.log('🚀 Auto-setup tenants online');
        
        const tenants = await loadAvailableTenants();
        
        if (tenants && tenants.length > 0) {
          // Cargar tenant guardado o seleccionar el primero
          const savedTenantData = localStorage.getItem('lpdp_current_tenant');
          
          let selectedTenant;
          if (savedTenantData) {
            try {
              const savedTenant = JSON.parse(savedTenantData);
              selectedTenant = tenants.find(t => t.id === savedTenant.id);
            } catch (error) {
              console.log('🚀 Error parseando tenant guardado');
            }
          }
          
          if (!selectedTenant) {
            selectedTenant = tenants[0];
          }
          
          setCurrentTenant(selectedTenant);
          localStorage.setItem('tenant_id', selectedTenant.id);
          localStorage.setItem('lpdp_current_tenant', JSON.stringify(selectedTenant));
          
          // CRÍTICO: Notificar al ratService del tenant actual
          ratService.setCurrentTenant(selectedTenant);
          
          console.log('🚀 Tenant seleccionado automáticamente:', selectedTenant.company_name);
        }
      }
    };
    
    initializeTenants();
  }, [isAuthenticated, user]);

  // Intentar restaurar tenant al inicializar
  useEffect(() => {
    const restoreSavedTenant = () => {
      const savedTenant = localStorage.getItem('lpdp_current_tenant');
      
      if (savedTenant && !isAuthenticated) {
        try {
          const tenant = JSON.parse(savedTenant);
          setCurrentTenant(tenant);
          ratService.setCurrentTenant(tenant);
          console.log('🚀 Tenant restaurado desde localStorage:', tenant.company_name);
        } catch (error) {
          console.log('🚀 Error parseando tenant guardado');
          localStorage.removeItem('lpdp_current_tenant');
          localStorage.removeItem('tenant_id');
        }
      }
    };
    
    restoreSavedTenant();
  }, []);

  // loadAvailableTenants ya está definido arriba

  const selectTenant = async (tenant) => {
    console.log('🚀 Seleccionando tenant online:', tenant.company_name);
    
    setCurrentTenant(tenant);
    localStorage.setItem('tenant_id', tenant.id);
    localStorage.setItem('lpdp_current_tenant', JSON.stringify(tenant));
    
    // Notificar al ratService
    ratService.setCurrentTenant(tenant);
    
    return true;
  };

  const createTenant = async (tenantData) => {
    if (!user) throw new Error('Usuario no autenticado');
    
    console.log('🚀 Creando tenant online:', tenantData);
    
    const newTenantData = {
      company_name: tenantData.company_name || 'Nueva Empresa',
      display_name: tenantData.company_name || 'Nueva Empresa',
      industry: tenantData.industry || 'Otros',
      size: tenantData.size || 'Pequeña',
      country: 'Chile',
      user_id: user.id,
      is_demo: false,
      online_mode: true,
      ...tenantData
    };
    
    try {
      const { data, error } = await supabase
        .from('organizaciones')
        .insert([newTenantData])
        .select()
        .single();
        
      if (error) {
        console.error('🚀 Error creando organización:', error);
        throw new Error(error.message);
      }
      
      const updatedTenants = [...availableTenants, data];
      setAvailableTenants(updatedTenants);
      
      console.log('🚀 Organización creada exitosamente:', data);
      return data;
      
    } catch (error) {
      console.error('🚀 Error creando tenant:', error);
      throw error;
    }
  };

  const updateTenant = async (tenantId, updateData) => {
    console.log('🚀 Actualizando tenant online:', tenantId, updateData);
    
    try {
      const { data, error } = await supabase
        .from('organizaciones')
        .update(updateData)
        .eq('id', tenantId)
        .select()
        .single();
        
      if (error) {
        console.error('🚀 Error actualizando organización:', error);
        throw new Error(error.message);
      }
      
      const updatedTenants = availableTenants.map(t => 
        t.id === tenantId ? data : t
      );
      setAvailableTenants(updatedTenants);
      
      // Si es el tenant actual, actualizarlo
      if (currentTenant?.id === tenantId) {
        setCurrentTenant(data);
        localStorage.setItem('lpdp_current_tenant', JSON.stringify(data));
      }
      
      console.log('🚀 Organización actualizada exitosamente:', data);
      return data;
      
    } catch (error) {
      console.error('🚀 Error actualizando tenant:', error);
      throw error;
    }
  };

  const deleteTenant = async (tenantId) => {
    console.log('🚀 Eliminando tenant online:', tenantId);
    
    try {
      const { error } = await supabase
        .from('organizaciones')
        .delete()
        .eq('id', tenantId);
        
      if (error) {
        console.error('🚀 Error eliminando organización:', error);
        throw new Error(error.message);
      }
      
      const filteredTenants = availableTenants.filter(t => t.id !== tenantId);
      setAvailableTenants(filteredTenants);
      
      // Si es el tenant actual, seleccionar otro
      if (currentTenant?.id === tenantId) {
        if (filteredTenants.length > 0) {
          const newTenant = filteredTenants[0];
          setCurrentTenant(newTenant);
          localStorage.setItem('tenant_id', newTenant.id);
          localStorage.setItem('lpdp_current_tenant', JSON.stringify(newTenant));
        } else {
          // Si no quedan tenants, crear uno por defecto
          const defaultOrg = await createDefaultOrganization();
          if (defaultOrg) {
            setCurrentTenant(defaultOrg);
            setAvailableTenants([defaultOrg]);
            localStorage.setItem('tenant_id', defaultOrg.id);
            localStorage.setItem('lpdp_current_tenant', JSON.stringify(defaultOrg));
          }
        }
      }
      
      console.log('🚀 Organización eliminada exitosamente');
      return true;
      
    } catch (error) {
      console.error('🚀 Error eliminando tenant:', error);
      throw error;
    }
  };

  const clearTenant = () => {
    console.log('🚀 Limpiando tenant online');
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