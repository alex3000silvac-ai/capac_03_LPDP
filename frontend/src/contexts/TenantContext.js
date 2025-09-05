// 🚀 TENANTCONTEXT MODO ONLINE - ARREGLADO COMPLETO
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import ratService from '../services/ratService';
import { supabase } from '../config/supabaseClient';

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

  // ✅ FUNCIÓN CORREGIDA: Cargar organizaciones desde Supabase
  const loadAvailableTenants = async () => {
    if (!isAuthenticated || !user) {
      console.log('🚀 Usuario no autenticado, no se cargan tenants');
      setLoading(false);
      return [];
    }
    
    try {
      console.log('🚀 Cargando organizaciones desde Supabase para user:', user.id);
      setLoading(true);
      
      const { data, error } = await supabase
        .from('organizaciones')
        .select('*')
        .eq('user_id', user.id)
        .eq('active', true)
        .order('created_at', { ascending: false });
      
      console.log('🚀 Query organizaciones result:', { data: data?.length || 0, error });
      
      if (error) {
        console.error('❌ Error cargando organizaciones:', error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        console.log('⚠️ No hay organizaciones, creando por defecto');
        const defaultOrg = await createDefaultOrganization();
        if (defaultOrg) {
          setAvailableTenants([defaultOrg]);
          return [defaultOrg];
        }
        setAvailableTenants([]);
        return [];
      }
      
      console.log('✅ Organizaciones cargadas:', data.map(o => o.company_name));
      setAvailableTenants(data);
      return data;
      
    } catch (error) {
      console.error('❌ Error cargando tenants:', error);
      // En caso de error, intentar crear organización por defecto
      try {
        const defaultOrg = await createDefaultOrganization();
        if (defaultOrg) {
          setAvailableTenants([defaultOrg]);
          return [defaultOrg];
        }
      } catch (createError) {
        console.error('❌ Error creando organización por defecto:', createError);
      }
      setAvailableTenants([]);
      return [];
    } finally {
      setLoading(false);
    }
  };
  
  // ✅ FUNCIÓN CORREGIDA: Crear organización por defecto
  const createDefaultOrganization = async () => {
    if (!user?.id) {
      console.error('🚨 No se puede crear organización sin usuario válido');
      return null;
    }
    
    const defaultOrg = {
      company_name: `Organización de ${user.email}`,
      display_name: `Organización de ${user.email}`,
      industry: 'General',
      size: 'Pequeña',
      country: 'Chile',
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_demo: false,
      online_mode: true,
      active: true
    };
    
    try {
      console.log('🏢 Creando organización por defecto:', defaultOrg);
      
      const { data, error } = await supabase
        .from('organizaciones')
        .insert([defaultOrg])
        .select()
        .single();
        
      if (error) {
        console.error('❌ Error creando organización por defecto:', error);
        // Devolver objeto temporal para uso local si falla la creación
        return { ...defaultOrg, id: `temp_${Date.now()}` };
      }
      
      console.log('✅ Organización por defecto creada:', data);
      return data;
      
    } catch (error) {
      console.error('❌ Error en createDefaultOrganization:', error);
      return { ...defaultOrg, id: `temp_${Date.now()}` };
    }
  };

  // ✅ EFECTO CORREGIDO: Auto-setup cuando el usuario se autentica
  useEffect(() => {
    const initializeTenants = async () => {
      if (!isAuthenticated || !user) {
        console.log('🚀 No hay usuario autenticado, limpiando tenants');
        setCurrentTenant(null);
        setAvailableTenants([]);
        setLoading(false);
        return;
      }
      
      try {
        console.log('🚀 Inicializando tenants para user:', user.id);
        
        const tenants = await loadAvailableTenants();
        console.log('🚀 Tenants cargados:', tenants?.length || 0);
        
        if (!tenants || tenants.length === 0) {
          console.log('⚠️ No hay tenants disponibles');
          setCurrentTenant(null);
          return;
        }
        
        let selectedTenant = null;
        
        // Intentar obtener tenant guardado
        try {
          console.log('🔍 Buscando tenant guardado...');
          const savedTenantResult = await ratService.getCurrentTenant(user.id);
          
          if (savedTenantResult.success && savedTenantResult.data && savedTenantResult.data.id) {
            console.log('📋 Tenant guardado encontrado:', savedTenantResult.data.company_name);
            
            // Buscar tenant en la lista cargada
            selectedTenant = tenants.find(t => t.id === savedTenantResult.data.id);
            
            if (!selectedTenant) {
              console.log('⚠️ Tenant guardado no está en la lista actual, usando datos guardados');
              selectedTenant = savedTenantResult.data;
            }
          } else {
            console.log('⚠️ No hay tenant guardado o es inválido');
          }
        } catch (error) {
          console.warn('⚠️ Error obteniendo tenant guardado:', error);
        }
        
        // Fallback: usar el primer tenant disponible
        if (!selectedTenant) {
          selectedTenant = tenants[0];
          console.log('🎯 Usando primer tenant disponible:', selectedTenant?.company_name);
        }
        
        if (selectedTenant) {
          console.log('✅ Estableciendo tenant:', selectedTenant.company_name);
          setCurrentTenant(selectedTenant);
          
          // Guardar en Supabase (sin await para no bloquear)
          ratService.setCurrentTenant(selectedTenant, user.id)
            .then(result => {
              if (result.success) {
                console.log('✅ Tenant persistido en Supabase');
              } else {
                console.warn('⚠️ Error persistiendo tenant:', result.error);
              }
            })
            .catch(error => {
              console.warn('⚠️ Error persistiendo tenant:', error);
            });
        } else {
          console.error('❌ No se pudo establecer ningún tenant');
        }
        
      } catch (error) {
        console.error('❌ Error en initializeTenants:', error);
        setCurrentTenant(null);
      }
    };
    
    initializeTenants();
  }, [isAuthenticated, user]);

  // ✅ FUNCIÓN CORREGIDA: Seleccionar tenant
  const selectTenant = async (tenant) => {
    if (!tenant || !tenant.id) {
      console.error('❌ Tenant inválido para selección:', tenant);
      return false;
    }
    
    console.log('🎯 Seleccionando tenant:', tenant.company_name);
    
    setCurrentTenant(tenant);
    
    if (user?.id) {
      try {
        const result = await ratService.setCurrentTenant(tenant, user.id);
        if (result.success) {
          console.log('✅ Tenant seleccionado y guardado');
          return true;
        } else {
          console.error('❌ Error guardando tenant seleccionado:', result.error);
          return false;
        }
      } catch (error) {
        console.error('❌ Error en selectTenant:', error);
        return false;
      }
    }
    
    return true;
  };

  const createTenant = async (tenantData) => {
    if (!user) throw new Error('Usuario no autenticado');
    
    console.log('🏢 Creando nuevo tenant:', tenantData);
    
    const newTenantData = {
      company_name: tenantData.company_name || 'Nueva Empresa',
      display_name: tenantData.display_name || tenantData.company_name || 'Nueva Empresa',
      industry: tenantData.industry || 'Otros',
      size: tenantData.size || 'Pequeña',
      country: tenantData.country || 'Chile',
      user_id: user.id,
      is_demo: false,
      online_mode: true,
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...tenantData
    };
    
    try {
      const { data, error } = await supabase
        .from('organizaciones')
        .insert([newTenantData])
        .select()
        .single();
        
      if (error) {
        console.error('❌ Error creando organización:', error);
        throw new Error(error.message);
      }
      
      const updatedTenants = [...availableTenants, data];
      setAvailableTenants(updatedTenants);
      
      console.log('✅ Organización creada exitosamente:', data);
      return data;
      
    } catch (error) {
      console.error('❌ Error creando tenant:', error);
      throw error;
    }
  };

  const updateTenant = async (tenantId, updateData) => {
    console.log('🔄 Actualizando tenant:', tenantId, updateData);
    
    try {
      const { data, error } = await supabase
        .from('organizaciones')
        .update({ ...updateData, updated_at: new Date().toISOString() })
        .eq('id', tenantId)
        .select()
        .single();
        
      if (error) {
        console.error('❌ Error actualizando organización:', error);
        throw new Error(error.message);
      }
      
      const updatedTenants = availableTenants.map(t => 
        t.id === tenantId ? data : t
      );
      setAvailableTenants(updatedTenants);
      
      if (currentTenant?.id === tenantId) {
        setCurrentTenant(data);
        await ratService.setCurrentTenant(data, user?.id);
      }
      
      console.log('✅ Organización actualizada exitosamente:', data);
      return data;
      
    } catch (error) {
      console.error('❌ Error actualizando tenant:', error);
      throw error;
    }
  };

  const deleteTenant = async (tenantId) => {
    console.log('🗑️ Eliminando tenant:', tenantId);
    
    try {
      const { error } = await supabase
        .from('organizaciones')
        .delete()
        .eq('id', tenantId);
        
      if (error) {
        console.error('❌ Error eliminando organización:', error);
        throw new Error(error.message);
      }
      
      const filteredTenants = availableTenants.filter(t => t.id !== tenantId);
      setAvailableTenants(filteredTenants);
      
      if (currentTenant?.id === tenantId) {
        if (filteredTenants.length > 0) {
          const newTenant = filteredTenants[0];
          setCurrentTenant(newTenant);
          await ratService.setCurrentTenant(newTenant, user?.id);
        } else {
          const defaultOrg = await createDefaultOrganization();
          if (defaultOrg) {
            setCurrentTenant(defaultOrg);
            setAvailableTenants([defaultOrg]);
            await ratService.setCurrentTenant(defaultOrg, user?.id);
          } else {
            setCurrentTenant(null);
          }
        }
      }
      
      console.log('✅ Organización eliminada exitosamente');
      return true;
      
    } catch (error) {
      console.error('❌ Error eliminando tenant:', error);
      throw error;
    }
  };

  const clearTenant = async () => {
    console.log('🧹 Limpiando tenant');
    setCurrentTenant(null);
    
    if (user?.id) {
      try {
        await supabase
          .from('user_sessions')
          .update({ is_active: false, updated_at: new Date().toISOString() })
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