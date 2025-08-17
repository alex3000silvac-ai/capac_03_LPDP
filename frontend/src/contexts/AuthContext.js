import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('lpdp_token'));
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

  // Verificar token al cargar
  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        
        if (decoded.exp > currentTime) {
          setUser({
            id: decoded.sub,
            username: decoded.username,
            email: decoded.email,
            tenant_id: decoded.tenant_id,
            is_superuser: decoded.is_superuser,
            permissions: decoded.permissions || [],
            first_name: decoded.first_name,
            last_name: decoded.last_name
          });
        } else {
          // Token expirado
          localStorage.removeItem('lpdp_token');
          setToken(null);
        }
      } catch (error) {
        console.error('Error decodificando token:', error);
        localStorage.removeItem('lpdp_token');
        setToken(null);
      }
    }
    setLoading(false);
  }, [token]);

  const login = async (username, password, tenantId = 'demo') => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': tenantId
        },
        body: JSON.stringify({
          username,
          password,
          tenant_id: tenantId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error de autenticación');
      }

      const data = await response.json();
      
      // Guardar token
      localStorage.setItem('lpdp_token', data.access_token);
      setToken(data.access_token);

      // Decodificar y establecer usuario
      const decoded = jwtDecode(data.access_token);
      const userData = {
        id: decoded.sub,
        username: decoded.username,
        email: decoded.email,
        tenant_id: decoded.tenant_id,
        is_superuser: decoded.is_superuser,
        permissions: decoded.permissions || [],
        first_name: decoded.first_name,
        last_name: decoded.last_name
      };

      setUser(userData);
      return userData;

    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('lpdp_token');
    setToken(null);
    setUser(null);
  };

  const refreshToken = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('lpdp_token', data.access_token);
        setToken(data.access_token);
        return data.access_token;
      }
    } catch (error) {
      console.error('Error refrescando token:', error);
      logout();
    }
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    if (user.is_superuser) return true;
    return user.permissions.includes(permission);
  };

  const hasAnyPermission = (permissions) => {
    if (!user) return false;
    if (user.is_superuser) return true;
    return permissions.some(permission => user.permissions.includes(permission));
  };

  const hasAllPermissions = (permissions) => {
    if (!user) return false;
    if (user.is_superuser) return true;
    return permissions.every(permission => user.permissions.includes(permission));
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    refreshToken,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
