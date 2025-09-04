// 🚀 TENANTCONTEXT MODO ONLINE - PRODUCCIÓN SUPABASE
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import ratService from '../services/ratService';
import { supabase } from '../config/supabaseClient';

// console.log('🚀 Iniciando TenantContext en modo PRODUCCIÓN SUPABASE');

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
      // console.log('🚀 Usuario no autenticado, no se cargan tenants');
      return [];
    }
    
    try {
      // console.log('🚀 Cargando organizaciones desde Supabase para user:', user.id);
      setLoading(true);
      
      // SEGURIDAD: Query con validación explícita de usuario autenticado
      const { data, error } = await supabase
        .from('organizaciones')
        .select('*')
        .eq('user_id', user.id)
        .eq('active', true) // Solo organizaciones activas
        .order('created_at', { ascending: false });
      
      // console.log('🚀 Organizaciones cargadas:', data?.length || 0);
      
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
    if (!user?.id) {
      console.error('🚨 SEGURIDAD: No se puede crear organización sin usuario válido');
      return null;
    }
    
    // NO incluir ID - dejar que Supabase lo genere automáticamente (SERIAL)
    const defaultOrg = {
      company_name: `Organización de ${user.email}`,
      display_name: `Organización de ${user.email}`,
      industry: 'General',
      size: 'Pequeña',
      country: 'Chile',
      user_id: user.id, // CRÍTICO: Siempre vincular al usuario actual
      created_at: new Date().toISOString(),
      is_demo: false,
      online_mode: true,
      active: true // SEGURIDAD: Marcado como activo por defecto
    };
    
    try {
      const { data, error } = await supabase
        .from('organizaciones')
        .insert([defaultOrg])
        .select()
        .single();
        
      if (error) {
        console.error('🚀 Error creando organización por defecto:', error);
        // Si hay error, devolver objeto temporal para uso local
        return { ...defaultOrg, id: `temp_${Date.now()}` };
      }
      
      // console.log('🚀 Organización por defecto creada:', data);
      return data;
    } catch (error) {
      console.error('🚀 Error creando organización por defecto:', error);
      return { ...defaultOrg, id: `temp_${Date.now()}` };
    }
  };

  // Auto-setup cuando el usuario se autentica
  useEffect(() => {
    const initializeTenants = async () => {
      if (isAuthenticated && user) {
        // console.log('🚀 Auto-setup tenants online');
        
        const tenants = await loadAvailableTenants();
        
        if (tenants && tenants.length > 0) {
          // Cargar tenant guardado desde Supabase o seleccionar el primero
          let selectedTenant;
          try {
            const savedTenant = await ratService.getCurrentTenant(user.id);
            if (savedTenant) {
              selectedTenant = tenants.find(t => t.id === savedTenant.id) || savedTenant;
            }
          } catch (error) {
            // console.log('🚀 Error obteniendo tenant guardado desde Supabase');
          }
          
          if (!selectedTenant) {
            selectedTenant = tenants[0];
          }
          
          setCurrentTenant(selectedTenant);
          
          // CRÍTICO: Persistir en Supabase únicamente
          await ratService.setCurrentTenant(selectedTenant, user.id);
          
          // console.log('🚀 Tenant seleccionado automáticamente:', selectedTenant.company_name);
        }
      }
    };
    
    initializeTenants();
  }, [isAuthenticated, user]);

  // Intentar restaurar tenant desde Supabase al inicializar
  useEffect(() => {
    const restoreSavedTenant = async () => {
      if (!isAuthenticated && user?.id) {
        try {
          const savedTenant = await ratService.getCurrentTenant(user.id);
          if (savedTenant) {
            setCurrentTenant(savedTenant);
            // console.log('🚀 Tenant restaurado desde Supabase:', savedTenant.company_name);
          }
        } catch (error) {
          // console.log('🚀 Error obteniendo tenant guardado desde Supabase');
        }
      }
    };
    
    restoreSavedTenant();
  }, [user]);

  // loadAvailableTenants ya está definido arriba

  const selectTenant = async (tenant) => {
    // console.log('🚀 Seleccionando tenant online:', tenant.company_name);
    
    setCurrentTenant(tenant);
    
    // Persistir en Supabase únicamente
    const result = await ratService.setCurrentTenant(tenant, user?.id);
    
    return result.success;
  };

  const createTenant = async (tenantData) => {
    if (!user) throw new Error('Usuario no autenticado');
    
    // console.log('🚀 Creando tenant online:', tenantData);
    
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
      
      // console.log('🚀 Organización creada exitosamente:', data);
      return data;
      
    } catch (error) {
      console.error('🚀 Error creando tenant:', error);
      throw error;
    }
  };

  const updateTenant = async (tenantId, updateData) => {
    // console.log('🚀 Actualizando tenant online:', tenantId, updateData);
    
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
      
      // Si es el tenant actual, actualizarlo en Supabase
      if (currentTenant?.id === tenantId) {
        setCurrentTenant(data);
        await ratService.setCurrentTenant(data, user?.id);
      }
      
      // console.log('🚀 Organización actualizada exitosamente:', data);
      return data;
      
    } catch (error) {
      console.error('🚀 Error actualizando tenant:', error);
      throw error;
    }
  };

  const deleteTenant = async (tenantId) => {
    // console.log('🚀 Eliminando tenant online:', tenantId);
    
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
          await ratService.setCurrentTenant(newTenant, user?.id);
        } else {
          // Si no quedan tenants, crear uno por defecto
          const defaultOrg = await createDefaultOrganization();
          if (defaultOrg) {
            setCurrentTenant(defaultOrg);
            setAvailableTenants([defaultOrg]);
            await ratService.setCurrentTenant(defaultOrg, user?.id);
          }
        }
      }
      
      // console.log('🚀 Organización eliminada exitosamente');
      return true;
      
    } catch (error) {
      console.error('🚀 Error eliminando tenant:', error);
      throw error;
    }
  };

  const clearTenant = async () => {
    // console.log('🚀 Limpiando tenant online');
    setCurrentTenant(null);
    
    // Limpiar sesión en Supabase
    if (user?.id) {
      try {
        await supabase
          .from('user_sessions')
          .update({ is_active: false })
          .eq('user_id', user.id);
      } catch (error) {
        console.error('Error limpiando sesión:', error);
      }
    }
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