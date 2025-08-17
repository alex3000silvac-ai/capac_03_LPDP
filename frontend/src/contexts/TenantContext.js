import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

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

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

  // Cargar tenants disponibles cuando el usuario se autentica
  useEffect(() => {
    if (isAuthenticated && user) {
      loadAvailableTenants();
    }
  }, [isAuthenticated, user]);

  // Cargar tenant actual desde localStorage
  useEffect(() => {
    const savedTenant = localStorage.getItem('lpdp_current_tenant');
    if (savedTenant) {
      try {
        const tenant = JSON.parse(savedTenant);
        setCurrentTenant(tenant);
      } catch (error) {
        console.error('Error cargando tenant guardado:', error);
        localStorage.removeItem('lpdp_current_tenant');
      }
    }
  }, []);

  const loadAvailableTenants = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/tenants/available`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const tenants = await response.json();
        setAvailableTenants(tenants);

        // Si no hay tenant seleccionado y hay tenants disponibles, seleccionar el primero
        if (!currentTenant && tenants.length > 0) {
          const defaultTenant = tenants.find(t => t.id === 'demo') || tenants[0];
          setCurrentTenant(defaultTenant);
          localStorage.setItem('lpdp_current_tenant', JSON.stringify(defaultTenant));
        }
      }
    } catch (error) {
      console.error('Error cargando tenants:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectTenant = async (tenant) => {
    try {
      // Verificar acceso al tenant
      const response = await fetch(`${API_URL}/tenants/${tenant.id}/verify-access`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setCurrentTenant(tenant);
        localStorage.setItem('lpdp_current_tenant', JSON.stringify(tenant));
        return true;
      } else {
        throw new Error('No tienes acceso a esta empresa');
      }
    } catch (error) {
      console.error('Error seleccionando tenant:', error);
      throw error;
    }
  };

  const createTenant = async (tenantData) => {
    if (!token) throw new Error('No autenticado');

    try {
      const response = await fetch(`${API_URL}/tenants`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(tenantData)
      });

      if (response.ok) {
        const newTenant = await response.json();
        setAvailableTenants(prev => [...prev, newTenant]);
        return newTenant;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error creando empresa');
      }
    } catch (error) {
      console.error('Error creando tenant:', error);
      throw error;
    }
  };

  const updateTenant = async (tenantId, updateData) => {
    if (!token) throw new Error('No autenticado');

    try {
      const response = await fetch(`${API_URL}/tenants/${tenantId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        const updatedTenant = await response.json();
        
        // Actualizar en la lista
        setAvailableTenants(prev => 
          prev.map(t => t.id === tenantId ? updatedTenant : t)
        );

        // Si es el tenant actual, actualizarlo también
        if (currentTenant?.id === tenantId) {
          setCurrentTenant(updatedTenant);
          localStorage.setItem('lpdp_current_tenant', JSON.stringify(updatedTenant));
        }

        return updatedTenant;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error actualizando empresa');
      }
    } catch (error) {
      console.error('Error actualizando tenant:', error);
      throw error;
    }
  };

  const deleteTenant = async (tenantId) => {
    if (!token) throw new Error('No autenticado');

    try {
      const response = await fetch(`${API_URL}/tenants/${tenantId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Remover de la lista
        setAvailableTenants(prev => prev.filter(t => t.id !== tenantId));

        // Si es el tenant actual, limpiarlo
        if (currentTenant?.id === tenantId) {
          setCurrentTenant(null);
          localStorage.removeItem('lpdp_current_tenant');
        }

        return true;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error eliminando empresa');
      }
    } catch (error) {
      console.error('Error eliminando tenant:', error);
      throw error;
    }
  };

  const clearTenant = () => {
    setCurrentTenant(null);
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
