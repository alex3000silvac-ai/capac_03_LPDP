// Configuración principal del frontend
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const APP_CONFIG = {
  name: 'SCLDP - Sistema de Cumplimiento LPDP',
  version: '1.0.0',
  environment: process.env.REACT_APP_ENVIRONMENT || 'development',
  apiTimeout: 30000,
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [5, 10, 25, 50, 100]
  }
};

export const AUTH_CONFIG = {
  tokenKey: 'lpdp_token',
  refreshTokenKey: 'lpdp_refresh_token',
  sessionTimeout: 3600 * 1000, // 1 hora en milisegundos
  autoRefresh: true
};

export const FEATURE_FLAGS = {
  enableMFA: true,
  enableAuditLog: true,
  enableReports: true,
  enableNotifications: true
};
