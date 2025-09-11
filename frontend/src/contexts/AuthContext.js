/**
 * AuthContext Simplificado - Sin Supabase
 * Para desarrollo local con backend SQL Server
 */
import React, { createContext, useContext, useState, useEffect } from 'react';

console.log('🚀 AuthContext LOCAL MODE - SQL Server Backend');

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
  const [token, setToken] = useState('demo-token');
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(true);

  // Inicialización simple para desarrollo local
  useEffect(() => {
    console.log('🚀 Iniciando Auth Local');
    
    // Simular usuario demo automáticamente
    setTimeout(() => {
      const demoUser = {
        id: 'demo-user-001',
        email: 'demo@lpdp.cl',
        name: 'Usuario Demo',
        tenant_id: 'demo'
      };
      
      setUser(demoUser);
      setLoading(false);
      console.log('✅ Usuario demo cargado:', demoUser.email);
    }, 1000);
  }, []);

  // Función de login simplificada
  const login = async (email, password) => {
    try {
      setLoading(true);
      
      // Simular login exitoso
      const user = {
        id: 'user-' + Date.now(),
        email: email,
        name: email.split('@')[0],
        tenant_id: 'demo'
      };
      
      setUser(user);
      setToken('local-token-' + Date.now());
      setDemoMode(false);
      
      console.log('✅ Login exitoso:', user.email);
      return { success: true, user };
    } catch (error) {
      console.error('❌ Error en login:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Función de logout simplificada
  const logout = async () => {
    setUser(null);
    setToken(null);
    setDemoMode(true);
    console.log('✅ Logout exitoso');
  };

  // Función para obtener usuario actual
  const getCurrentUser = () => {
    return user;
  };

  // Función para verificar si el usuario tiene restricciones
  const isRestricted = () => {
    // En modo demo, el usuario tiene restricciones limitadas
    if (demoMode) {
      return true;
    }
    
    // Si el usuario no tiene permisos específicos, está restringido
    if (!user || !user.permissions || user.permissions.length === 0) {
      return true;
    }
    
    // Si es superuser, no tiene restricciones
    if (user.is_superuser) {
      return false;
    }
    
    // Por defecto, no restringido si tiene usuario válido
    return false;
  };

  const value = {
    user,
    token,
    loading,
    demoMode,
    login,
    logout,
    getCurrentUser,
    isRestricted,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;