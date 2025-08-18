/**
 * Configuración de API y servicios HTTP
 */
import axios from 'axios';

// URL base del backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://scldp-backend.onrender.com';

console.log('🔗 API Base URL:', API_BASE_URL);

// Configurar axios
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000, // 30 segundos
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para requests
api.interceptors.request.use(
    (config) => {
        console.log('📤 API Request:', config.method?.toUpperCase(), config.url);
        
        // Agregar token si existe
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
    },
    (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
    }
);

// Interceptor para responses
api.interceptors.response.use(
    (response) => {
        console.log('📥 API Response:', response.status, response.config.url);
        return response;
    },
    (error) => {
        console.error('❌ API Error:', error.response?.status, error.message);
        
        // Manejar errores específicos
        if (error.response?.status === 401) {
            localStorage.removeItem('auth_token');
            window.location.href = '/login';
        }
        
        return Promise.reject(error);
    }
);

// Servicios de API
export const apiService = {
    // Test de conectividad
    async testConnection() {
        try {
            const response = await api.get('/api/v1/test');
            return { success: true, data: response.data };
        } catch (error) {
            return { 
                success: false, 
                error: error.message,
                details: error.response?.data 
            };
        }
    },

    // Health check
    async healthCheck() {
        try {
            const response = await api.get('/health');
            return { success: true, data: response.data };
        } catch (error) {
            return { 
                success: false, 
                error: error.message,
                details: error.response?.data 
            };
        }
    },

    // Autenticación
    async login(credentials) {
        try {
            const response = await api.post('/api/v1/auth/login', credentials);
            if (response.data.access_token) {
                localStorage.setItem('auth_token', response.data.access_token);
            }
            return { success: true, data: response.data };
        } catch (error) {
            return { 
                success: false, 
                error: error.response?.data?.detail || error.message 
            };
        }
    },

    // Obtener usuario actual
    async getCurrentUser() {
        try {
            const response = await api.get('/api/v1/users/me');
            return { success: true, data: response.data };
        } catch (error) {
            return { 
                success: false, 
                error: error.response?.data?.detail || error.message 
            };
        }
    },

    // Obtener módulos disponibles
    async getModules() {
        try {
            const response = await api.get('/api/v1/modules');
            return { success: true, data: response.data };
        } catch (error) {
            return { 
                success: false, 
                error: error.response?.data?.detail || error.message 
            };
        }
    }
};

export default api;