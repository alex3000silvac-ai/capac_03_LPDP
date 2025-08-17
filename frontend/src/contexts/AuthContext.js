import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

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

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        
        if (decoded.exp < currentTime) {
          // Token expirado
          localStorage.removeItem('lpdp_token');
          setToken(null);
          setUser(null);
        } else {
          // Token válido
          const userData = {
            id: decoded.sub,
            username: decoded.username,
            email: decoded.email,
            tenant_id: decoded.tenant_id || 'demo',
            is_superuser: decoded.is_superuser || false,
            permissions: decoded.permissions || [],
            first_name: decoded.first_name,
            last_name: decoded.last_name
          };
          setUser(userData);
        }
      } catch (error) {
        console.error('Error decodificando token:', error);
        localStorage.removeItem('lpdp_token');
        setToken(null);
        setUser(null);
      }
    }
    setLoading(false);
  }, [token]);

  const login = async (username, password, tenantId = 'demo') => {
    try {
      console.log('Intentando login con:', { username, password, tenantId });
      
      const response = await fetch(`${API_URL}/api/v1/auth/login`, {
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

      console.log('Respuesta del servidor:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Error de conexión' }));
        console.error('Error del servidor:', errorData);
        throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Datos de respuesta:', data);
      
      // Guardar token
      localStorage.setItem('lpdp_token', data.access_token);
      setToken(data.access_token);

      // Decodificar y establecer usuario
      const decoded = jwtDecode(data.access_token);
      const userData = {
        id: decoded.sub,
        username: decoded.username,
        email: decoded.email,
        tenant_id: decoded.tenant_id || tenantId,
        is_superuser: decoded.is_superuser || false,
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
      const refreshToken = localStorage.getItem('lpdp_refresh_token');
      if (!refreshToken) {
        throw new Error('No hay refresh token');
      }

      const response = await fetch(`${API_URL}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: refreshToken
        })
      });

      if (!response.ok) {
        throw new Error('Error al refrescar token');
      }

      const data = await response.json();
      localStorage.setItem('lpdp_token', data.access_token);
      setToken(data.access_token);

    } catch (error) {
      console.error('Error refrescando token:', error);
      logout();
    }
  };

  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }));
  };

  const isAuthenticated = () => {
    return !!user && !!token;
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    if (user.is_superuser) return true;
    return user.permissions.includes(permission);
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    refreshToken,
    updateUser,
    isAuthenticated,
    hasPermission
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
