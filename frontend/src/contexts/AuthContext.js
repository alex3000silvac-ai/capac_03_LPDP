// 🔌 AUTHCONTEXT MODO OFFLINE COMPLETO
// Para desarrollo local sin backend externo
import React, { createContext, useContext, useState, useEffect } from 'react';

console.log('🔌 Iniciando AuthContext en modo OFFLINE');

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
  const [token, setToken] = useState(localStorage.getItem('offline_token'));
  const [loading, setLoading] = useState(false); // Sin loading en offline
  const [demoMode, setDemoMode] = useState(true);

  // Auto-login en modo offline
  useEffect(() => {
    console.log('🔌 AutoLogin modo offline');
    
    // Si ya hay token, restaurar usuario
    if (token) {
      const offlineUser = {
        id: 'offline_user_001',
        username: 'demo_offline',
        email: 'demo@offline.local',
        tenant_id: 'demo_offline',
        organizacion_id: 'demo_offline',
        organizacion_nombre: 'Empresa Demo Offline',
        is_superuser: false,
        permissions: ['rat:create', 'rat:read', 'rat:update', 'eipd:create', 'providers:manage'],
        first_name: 'Usuario',
        last_name: 'Demo',
        restricted_to: null,
        is_demo: true,
        offline_mode: true
      };
      setUser(offlineUser);
    } else {
      // Auto-crear token offline
      const offlineToken = 'offline_token_' + Date.now();
      localStorage.setItem('offline_token', offlineToken);
      localStorage.setItem('tenant_id', 'demo_offline');
      setToken(offlineToken);
      
      const offlineUser = {
        id: 'offline_user_001',
        username: 'demo_offline',
        email: 'demo@offline.local', 
        tenant_id: 'demo_offline',
        organizacion_id: 'demo_offline',
        organizacion_nombre: 'Empresa Demo Offline',
        is_superuser: false,
        permissions: ['rat:create', 'rat:read', 'rat:update', 'eipd:create', 'providers:manage'],
        first_name: 'Usuario',
        last_name: 'Demo',
        restricted_to: null,
        is_demo: true,
        offline_mode: true
      };
      setUser(offlineUser);
    }
    
    setLoading(false);
  }, [token]);

  const login = async (username, password, tenantId = 'demo_offline') => {
    console.log('🔌 Login offline:', { username, tenantId });
    
    // En modo offline, cualquier credencial funciona
    const offlineToken = 'offline_token_' + Date.now();
    localStorage.setItem('offline_token', offlineToken);
    localStorage.setItem('tenant_id', tenantId);
    setToken(offlineToken);
    
    const userData = {
      id: 'offline_user_' + Date.now(),
      username: username || 'demo_offline',
      email: `${username}@offline.local`,
      tenant_id: tenantId,
      organizacion_id: tenantId,
      organizacion_nombre: 'Empresa Demo Offline',
      is_superuser: username === 'admin',
      permissions: ['rat:create', 'rat:read', 'rat:update', 'eipd:create', 'providers:manage'],
      first_name: 'Usuario',
      last_name: 'Offline',
      restricted_to: null,
      is_demo: true,
      offline_mode: true
    };
    
    setUser(userData);
    return userData;
  };

  const logout = () => {
    console.log('🔌 Logout offline');
    localStorage.removeItem('offline_token');
    localStorage.removeItem('tenant_id');
    setToken(null);
    setUser(null);
  };

  const refreshToken = async () => {
    console.log('🔌 RefreshToken offline - no necesario');
    return Promise.resolve();
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
    return user.permissions?.includes(permission) || false;
  };

  const isRestricted = () => {
    return false; // Sin restricciones en modo offline
  };

  const value = {
    user,
    token,
    loading,
    demoMode,
    login,
    logout,
    refreshToken,
    updateUser,
    isAuthenticated,
    hasPermission,
    isRestricted
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;