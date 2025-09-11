// Configuración de la aplicación - LOCAL SQL Server
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
export const API_V1_URL = `${API_BASE_URL}/api/v1`;

// Configuración para desarrollo local con SQL Server
export const LOCAL_CONFIG = {
  USE_LOCAL_BACKEND: process.env.REACT_APP_USE_LOCAL_BACKEND === 'true',
  API_TIMEOUT: parseInt(process.env.REACT_APP_REQUEST_TIMEOUT) || 30000,
  DEBUG: process.env.REACT_APP_DEBUG === 'true'
};