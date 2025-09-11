/**
 * Configuración de API para el backend local LPDP
 * Conecta con el backend completo en http://localhost:8000
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const apiConfig = {
  baseURL: API_BASE_URL,
  endpoints: {
    // Health y status
    health: '/api/health',
    
    // Organizations
    organizations: '/api/v1/organizaciones',
    organization: (id) => `/api/v1/organizaciones/${id}`,
    
    // RATs
    rats: '/api/v1/rats',
    rat: (id) => `/api/v1/rats/${id}`,
    
    // EIPDs
    eipds: '/api/v1/eipds',
    eipd: (id) => `/api/v1/eipds/${id}`,
    
    // Compliance
    complianceMetrics: '/api/v1/compliance/metrics',
    
    // Users
    users: '/api/v1/usuarios',
    user: (id) => `/api/v1/usuarios/${id}`,
    
    // Dashboard
    dashboard: '/api/v1/dashboard'
  }
};

/**
 * Función helper para hacer peticiones al backend
 */
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

export default apiConfig;