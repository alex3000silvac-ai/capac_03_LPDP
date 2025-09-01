/**
 * Manejador seguro de errores
 * Previene exposición de información sensible
 */

import SecureLogger from './secureLogger';

class ErrorHandler {
  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.errorCodes = {
      VALIDATION_ERROR: 'E001',
      AUTH_ERROR: 'E002',
      NETWORK_ERROR: 'E003',
      PERMISSION_ERROR: 'E004',
      NOT_FOUND: 'E404',
      SERVER_ERROR: 'E500',
      RATE_LIMIT: 'E429',
      MAINTENANCE: 'E503'
    };
  }

  /**
   * Procesar error y devolver respuesta segura
   */
  handle(error, context = {}) {
    // Log interno completo (solo en desarrollo)
    if (this.isDevelopment) {
      console.error('Error completo:', error);
    }

    // Log seguro para producción
    SecureLogger.error('Error procesado', {
      code: this.getErrorCode(error),
      context: this.sanitizeContext(context),
      timestamp: new Date().toISOString()
    });

    // Retornar mensaje seguro al usuario
    return this.getSafeErrorMessage(error);
  }

  /**
   * Obtener código de error
   */
  getErrorCode(error) {
    if (error.response?.status === 401) return this.errorCodes.AUTH_ERROR;
    if (error.response?.status === 403) return this.errorCodes.PERMISSION_ERROR;
    if (error.response?.status === 404) return this.errorCodes.NOT_FOUND;
    if (error.response?.status === 429) return this.errorCodes.RATE_LIMIT;
    if (error.response?.status === 503) return this.errorCodes.MAINTENANCE;
    if (error.response?.status >= 500) return this.errorCodes.SERVER_ERROR;
    if (error.code === 'ECONNREFUSED') return this.errorCodes.NETWORK_ERROR;
    if (error.name === 'ValidationError') return this.errorCodes.VALIDATION_ERROR;
    
    return this.errorCodes.SERVER_ERROR;
  }

  /**
   * Obtener mensaje seguro para el usuario
   */
  getSafeErrorMessage(error) {
    const code = this.getErrorCode(error);
    
    const messages = {
      [this.errorCodes.VALIDATION_ERROR]: 'Los datos ingresados no son válidos. Por favor, revisa el formulario.',
      [this.errorCodes.AUTH_ERROR]: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
      [this.errorCodes.NETWORK_ERROR]: 'Error de conexión. Por favor, verifica tu conexión a internet.',
      [this.errorCodes.PERMISSION_ERROR]: 'No tienes permisos para realizar esta acción.',
      [this.errorCodes.NOT_FOUND]: 'El recurso solicitado no fue encontrado.',
      [this.errorCodes.RATE_LIMIT]: 'Demasiados intentos. Por favor, espera unos minutos antes de intentar nuevamente.',
      [this.errorCodes.MAINTENANCE]: 'El sistema está en mantenimiento. Por favor, intenta más tarde.',
      [this.errorCodes.SERVER_ERROR]: 'Ha ocurrido un error. Por favor, intenta nuevamente.'
    };

    return {
      message: messages[code] || messages[this.errorCodes.SERVER_ERROR],
      code: code,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Sanitizar contexto para logging
   */
  sanitizeContext(context) {
    const sanitized = { ...context };
    
    // Remover campos sensibles
    const sensitiveFields = [
      'password', 'token', 'apiKey', 'api_key', 
      'secret', 'credential', 'authorization',
      'credit_card', 'ssn', 'pin'
    ];
    
    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }
    
    return sanitized;
  }

  /**
   * Manejador para errores de formulario
   */
  handleFormError(error, formName) {
    const safeError = this.handle(error, { form: formName });
    
    // Extraer errores de validación específicos si existen
    if (error.response?.data?.errors) {
      const fieldErrors = {};
      
      for (const [field, messages] of Object.entries(error.response.data.errors)) {
        // No exponer nombres de campos internos
        const safeFieldName = this.getSafeFieldName(field);
        fieldErrors[safeFieldName] = Array.isArray(messages) ? messages[0] : messages;
      }
      
      safeError.fieldErrors = fieldErrors;
    }
    
    return safeError;
  }

  /**
   * Obtener nombre de campo seguro
   */
  getSafeFieldName(fieldName) {
    const fieldMap = {
      'user_password': 'contraseña',
      'user_email': 'correo electrónico',
      'tenant_id': 'organización',
      'api_key': 'clave de acceso',
      'username': 'nombre de usuario'
    };
    
    return fieldMap[fieldName] || fieldName;
  }

  /**
   * Manejador para errores de red
   */
  handleNetworkError(error) {
    if (error.code === 'ECONNREFUSED') {
      return {
        message: 'No se puede conectar con el servidor. Por favor, intenta más tarde.',
        code: this.errorCodes.NETWORK_ERROR,
        retry: true
      };
    }
    
    if (error.message === 'Network Error') {
      return {
        message: 'Error de red. Verifica tu conexión a internet.',
        code: this.errorCodes.NETWORK_ERROR,
        retry: true
      };
    }
    
    return this.handle(error);
  }

  /**
   * Manejador para errores de autenticación
   */
  handleAuthError(error) {
    const code = this.getErrorCode(error);
    
    if (code === this.errorCodes.AUTH_ERROR) {
      // Limpiar datos de sesión
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      return {
        message: 'Sesión expirada. Redirigiendo al login...',
        code: this.errorCodes.AUTH_ERROR,
        redirect: '/login'
      };
    }
    
    if (code === this.errorCodes.PERMISSION_ERROR) {
      return {
        message: 'No tienes permisos suficientes para esta acción.',
        code: this.errorCodes.PERMISSION_ERROR
      };
    }
    
    return this.handle(error);
  }

  /**
   * Crear boundary de error para React
   */
  createErrorBoundary() {
    return {
      componentDidCatch: (error, errorInfo) => {
        this.handle(error, { 
          component: errorInfo.componentStack,
          type: 'React Error Boundary'
        });
      }
    };
  }

  /**
   * Manejador global para promesas rechazadas
   */
  setupGlobalHandlers() {
    // Manejar promesas rechazadas no capturadas
    window.addEventListener('unhandledrejection', (event) => {
      this.handle(event.reason, { type: 'Unhandled Promise Rejection' });
      event.preventDefault();
    });

    // Manejar errores globales
    window.addEventListener('error', (event) => {
      this.handle(event.error, { 
        type: 'Global Error',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno
      });
    });
  }
}

// Singleton instance
const errorHandler = new ErrorHandler();

// Setup global handlers automáticamente
if (typeof window !== 'undefined') {
  errorHandler.setupGlobalHandlers();
}

export default errorHandler;