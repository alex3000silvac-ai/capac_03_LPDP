/**
 * AuthContext Ultra Simplificado - SOLO SUPABASE
 * Máxima simplicidad para usar únicamente Supabase como plataforma única
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, signIn, signOut, getCurrentUser } from '../config/supabaseConfig';

console.log('🚀 AuthContext SUPABASE-ONLY MODE');

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
  const [loading, setLoading] = useState(true);

  // Inicialización con Supabase
  useEffect(() => {
    console.log('🚀 Iniciando Auth Supabase');
    
    // Escuchar cambios de autenticación
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Supabase Auth event:', event);
      
      if (session?.user) {
        const userData = await getCurrentUser();
        setUser(userData);
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    // Verificar sesión actual
    const checkUser = async () => {
      const userData = await getCurrentUser();
      setUser(userData);
      setLoading(false);
    };
    
    checkUser();

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Login simplificado
  const login = async (email, password) => {
    const result = await signIn(email, password);
    if (result.success) {
      setUser(result.user);
      return { success: true };
    }
    return { success: false, error: result.error };
  };

  // Logout simplificado
  const logout = async () => {
    const result = await signOut();
    if (result.success) {
      setUser(null);
      return { success: true };
    }
    return { success: false, error: result.error };
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};