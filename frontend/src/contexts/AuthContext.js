// 🚀 AUTHCONTEXT MODO ONLINE - PRODUCCIÓN SUPABASE
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';

console.log('🚀 Iniciando AuthContext en modo PRODUCCIÓN SUPABASE');

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
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);

  // Verificar sesión de Supabase al iniciar
  useEffect(() => {
    console.log('🚀 Verificando sesión Supabase');
    
    // Obtener sesión inicial
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        console.log('🚀 Sesión encontrada:', session.user.email);
        const userData = {
          id: session.user.id,
          username: session.user.email.split('@')[0],
          email: session.user.email,
          tenant_id: session.user.user_metadata?.tenant_id || 'default',
          organizacion_id: session.user.user_metadata?.organizacion_id || 'default',
          organizacion_nombre: session.user.user_metadata?.organizacion_nombre || 'Empresa',
          is_superuser: session.user.user_metadata?.is_superuser || false,
          permissions: session.user.user_metadata?.permissions || ['rat:create', 'rat:read', 'rat:update', 'eipd:create', 'providers:manage'],
          first_name: session.user.user_metadata?.first_name || session.user.email.split('@')[0],
          last_name: session.user.user_metadata?.last_name || '',
          restricted_to: null,
          is_demo: false,
          online_mode: true
        };
        setUser(userData);
        setToken(session.access_token);
      } else {
        console.log('🚀 No hay sesión activa');
      }
      setLoading(false);
    };
    
    checkSession();
    
    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🚀 Auth state change:', event, session?.user?.email);
        
        if (session?.user) {
          const userData = {
            id: session.user.id,
            username: session.user.email.split('@')[0],
            email: session.user.email,
            tenant_id: session.user.user_metadata?.tenant_id || 'default',
            organizacion_id: session.user.user_metadata?.organizacion_id || 'default', 
            organizacion_nombre: session.user.user_metadata?.organizacion_nombre || 'Empresa',
            is_superuser: session.user.user_metadata?.is_superuser || false,
            permissions: session.user.user_metadata?.permissions || ['rat:create', 'rat:read', 'rat:update', 'eipd:create', 'providers:manage'],
            first_name: session.user.user_metadata?.first_name || session.user.email.split('@')[0],
            last_name: session.user.user_metadata?.last_name || '',
            restricted_to: null,
            is_demo: false,
            online_mode: true
          };
          setUser(userData);
          setToken(session.access_token);
        } else {
          setUser(null);
          setToken(null);
        }
      }
    );
    
    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password, tenantId = 'default') => {
    console.log('🚀 Login Supabase:', { email, tenantId });
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });
      
      if (error) {
        console.error('🚀 Error login Supabase:', error);
        throw new Error(error.message);
      }
      
      console.log('🚀 Login exitoso:', data.user.email);
      
      const userData = {
        id: data.user.id,
        username: data.user.email.split('@')[0],
        email: data.user.email,
        tenant_id: data.user.user_metadata?.tenant_id || tenantId,
        organizacion_id: data.user.user_metadata?.organizacion_id || tenantId,
        organizacion_nombre: data.user.user_metadata?.organizacion_nombre || 'Empresa',
        is_superuser: data.user.user_metadata?.is_superuser || false,
        permissions: data.user.user_metadata?.permissions || ['rat:create', 'rat:read', 'rat:update', 'eipd:create', 'providers:manage'],
        first_name: data.user.user_metadata?.first_name || data.user.email.split('@')[0],
        last_name: data.user.user_metadata?.last_name || '',
        restricted_to: null,
        is_demo: false,
        online_mode: true
      };
      
      setUser(userData);
      setToken(data.session.access_token);
      return userData;
      
    } catch (error) {
      console.error('🚀 Error en login:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    console.log('🚀 Logout Supabase');
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('🚀 Error logout:', error);
    }
    setToken(null);
    setUser(null);
  };

  const refreshToken = async () => {
    console.log('🚀 RefreshToken Supabase');
    const { data, error } = await supabase.auth.refreshSession();
    if (error) {
      console.error('🚀 Error refresh token:', error);
      logout();
    } else {
      setToken(data.session?.access_token);
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
    return user.permissions?.includes(permission) || false;
  };

  const isRestricted = () => {
    return user && (
      user.restricted_to === 'intro_only' || 
      user.restricted_to === 'demo_view_only' ||
      user.is_demo === true
    );
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