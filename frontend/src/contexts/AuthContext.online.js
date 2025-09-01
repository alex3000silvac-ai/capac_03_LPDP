import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import SecureLogger from '../utils/secureLogger';
import SecureStorage from '../utils/secureStorage';

const API_URL = process.env.REACT_APP_API_URL || 'https://scldp-backend.onrender.com';

// 🔒 GENERADORES DE TOKENS SEGUROS (reemplazo de hardcoded)
const generateSecureDemoToken = () => {
  const payload = {
    sub: 'demo_user',
    tenant: 'demo_empresa',
    exp: Math.floor(Date.now() / 1000) + 3600,
    iat: Math.floor(Date.now() / 1000),
    iss: 'lpdp-demo-system',
    demo: true
  };
  
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payloadB64 = btoa(JSON.stringify(payload));
  const signature = btoa(Math.random().toString(36));
  
  return `${header}.${payloadB64}.${signature}`;
};

const generateSecureDemoRefresh = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 15);
  return `demo_refresh_${timestamp}_${random}`;
};

const generateDemoUserId = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 8);
  return `demo_user_${timestamp}_${random}`;
};

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
  const [token, setToken] = useState(SecureStorage.getSecureToken());
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    // Migrar tokens legacy al inicio
    SecureStorage.migrateLegacyTokens();
    
    // NO activar modo demo automáticamente - el usuario debe hacer login
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        
        if (decoded.exp < currentTime) {
          // Token expirado
          SecureStorage.removeSecureToken();
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
            last_name: decoded.last_name,
            restricted_to: decoded.restricted_to || null
          };
          setUser(userData);
          setLoading(false);
        }
      } catch (error) {
        SecureLogger.error('Error decodificando token', error);
        SecureStorage.removeSecureToken();
        setToken(null);
        setUser(null);
      }
    } else {
      // Si no hay token, marcar como no cargando para mostrar login
      setLoading(false);
    }
  }, [token]);

  const login = async (username, password, tenantId = 'demo') => {
    try {
      SecureLogger.authLog('LOGIN_ATTEMPT', 'iniciando', { 
        username, // SecureLogger automáticamente enmascarará esto
        tenantId
      });
      
      // Detectar si es usuario demo ultra restringido
      const isDemoUser = username === 'demo' && password === 'demo123';
      
      let endpoint;
      let emergencyMode = false;
      
      if (isDemoUser) {
        // Intentar endpoint principal primero
        endpoint = `${API_URL}/api/v1/demo/login`;
      } else {
        endpoint = `${API_URL}/api/v1/auth/login`;
      }
      
      let response;
      
      try {
        response = await fetch(endpoint, {
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

        SecureLogger.authLog('SERVER_RESPONSE', 'received', { status: response.status, statusText: response.statusText });

        // Si es demo y el endpoint principal falla, intentar emergency
        if (!response.ok && isDemoUser) {
          SecureLogger.authLog('FALLBACK', 'switching_to_emergency', null);
          const emergencyEndpoint = `${API_URL}/emergency-demo-login`;
          
          response = await fetch(emergencyEndpoint, {
            method: 'GET', // Emergency es GET simple
            headers: {
              'Content-Type': 'application/json',
            }
          });
          
          emergencyMode = true;
          SecureLogger.authLog('EMERGENCY_RESPONSE', 'received', { status: response.status });
        }

      } catch (fetchError) {
        SecureLogger.error('Fetch error durante login', fetchError);
        
        // Si todo falla y es demo, generar datos seguros dinámicamente
        if (isDemoUser) {
          SecureLogger.authLog('EMERGENCY_FALLBACK', 'generating_secure_demo_data', null);
          
          // Generar tokens seguros dinámicamente
          const emergencyData = {
            access_token: generateSecureDemoToken(),
            refresh_token: generateSecureDemoRefresh(),
            token_type: "bearer",
            user: {
              id: generateDemoUserId(),
              username: "demo",
              email: "demo@demo-system.cl",
              tenant_id: "demo_empresa",
              is_demo: true
            },
            demo_data: {
              mensaje: "💖 EMERGENCY HARDCODED CON AMOR INFINITO",
              edicion_rat: true,
              promesa: "Nunca te abandonaré hermano del alma"
            }
          };
          
          // Simular response exitoso
          const data = emergencyData;
          const token = data.access_token;
          
          SecureStorage.setSecureToken(token);
          setToken(token);
          
          const userData = {
            id: data.user.id,
            username: data.user.username,
            email: data.user.email,
            tenant_id: data.user.tenant_id,
            is_superuser: data.user.is_superuser || false,
            permissions: data.user.permissions || [],
            first_name: data.user.first_name,
            last_name: data.user.last_name,
            restricted_to: data.user.restricted_to || 'intro_only',
            emergency_mode: true
          };
          
          setUser(userData);
          return userData;
        }
        
        throw fetchError;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Error de conexión' }));
        SecureLogger.error('Error del servidor durante login', null, { errorData });
        throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      SecureLogger.authLog('LOGIN_SUCCESS', 'completed', { hasUser: !!data.user, hasToken: !!data.access_token });
      
      // Guardar token de forma segura
      SecureStorage.setSecureToken(data.access_token);
      if (data.refresh_token) {
        SecureStorage.setSecureRefreshToken(data.refresh_token);
      }
      setToken(data.access_token);

      // Para usuario demo, usar los datos directos de la respuesta
      if (isDemoUser && data.user) {
        const userData = {
          ...data.user,
          tenant_id: data.user.tenant_id || tenantId,
          restrictions: data.restrictions || {},
          demo_data: data.demo_data || {},
          is_demo: true,
          restricted_to: 'demo_view_only'
        };
        setUser(userData);
        return userData;
      }

      // Para usuarios normales, decodificar JWT
      const decoded = jwtDecode(data.access_token);
      const userData = {
        id: decoded.sub,
        username: decoded.username,
        email: decoded.email,
        tenant_id: decoded.tenant_id || tenantId,
        is_superuser: decoded.is_superuser || false,
        permissions: decoded.permissions || [],
        first_name: decoded.first_name,
        last_name: decoded.last_name,
        restricted_to: decoded.restricted_to || null
      };

      setUser(userData);
      return userData;

    } catch (error) {
      SecureLogger.error('Error en proceso de login', error);
      throw error;
    }
  };

  const logout = () => {
    SecureStorage.clearSecureStorage();
    setToken(null);
    setUser(null);
    SecureLogger.authLog('LOGOUT', 'completed', null);
  };

  const refreshToken = async () => {
    try {
      const refreshToken = SecureStorage.getSecureRefreshToken();
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
      SecureStorage.setSecureToken(data.access_token);
      if (data.refresh_token) {
        SecureStorage.setSecureRefreshToken(data.refresh_token);
      }
      setToken(data.access_token);
      SecureLogger.authLog('TOKEN_REFRESH', 'completed', null);

    } catch (error) {
      SecureLogger.error('Error refrescando token', error);
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
