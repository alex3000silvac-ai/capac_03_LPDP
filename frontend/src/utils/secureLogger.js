/**
 * 🔒 SISTEMA DE LOGGING SEGURO
 * Previene exposición accidental de datos sensibles en logs
 */

export const SecureLogger = {
  
  // Campos que nunca deben aparecer en logs
  SENSITIVE_FIELDS: [
    'password', 'token', 'api_key', 'secret', 'private_key', 
    'access_token', 'refresh_token', 'session_token', 'auth_token',
    'rut', 'email', 'telefono', 'direccion' // Datos personales bajo LPDP
  ],
  
  // Sanitizar objeto para logging seguro
  sanitizeForLogging: (obj, maxDepth = 3, currentDepth = 0) => {
    if (currentDepth >= maxDepth) return '[Max depth reached]';
    if (obj === null || obj === undefined) return obj;
    if (typeof obj !== 'object') return obj;
    
    if (Array.isArray(obj)) {
      return obj.map(item => SecureLogger.sanitizeForLogging(item, maxDepth, currentDepth + 1));
    }
    
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      const keyLower = key.toLowerCase();
      
      // Ocultar campos sensibles
      if (SecureLogger.SENSITIVE_FIELDS.some(field => keyLower.includes(field))) {
        sanitized[key] = SecureLogger.maskSensitiveValue(value);
      }
      // Recursión para objetos anidados
      else if (typeof value === 'object' && value !== null) {
        sanitized[key] = SecureLogger.sanitizeForLogging(value, maxDepth, currentDepth + 1);
      }
      // Valores seguros
      else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  },
  
  // Enmascarar valores sensibles
  maskSensitiveValue: (value) => {
    if (!value) return value;
    
    const strValue = String(value);
    if (strValue.length <= 3) return '***';
    if (strValue.length <= 6) return strValue.substring(0, 2) + '***';
    
    // Para tokens/claves largas, mostrar solo inicio y fin
    if (strValue.length > 20) {
      return strValue.substring(0, 6) + '...' + strValue.substring(strValue.length - 4);
    }
    
    return strValue.substring(0, 3) + '***';
  },
  
  // Métodos de logging seguros
  info: (message, data = null) => {
    const sanitized = data ? SecureLogger.sanitizeForLogging(data) : null;
    console.info(`[SECURE] ${message}`, sanitized);
  },
  
  warn: (message, data = null) => {
    const sanitized = data ? SecureLogger.sanitizeForLogging(data) : null;
    console.warn(`[SECURE] ${message}`, sanitized);
  },
  
  error: (message, error = null, data = null) => {
    const sanitized = data ? SecureLogger.sanitizeForLogging(data) : null;
    console.error(`[SECURE] ${message}`, {
      error: error?.message || error,
      stack: error?.stack?.substring(0, 200) + '...',
      data: sanitized
    });
  },
  
  // Log específico para autenticación
  authLog: (action, result, details = null) => {
    const sanitized = details ? SecureLogger.sanitizeForLogging(details) : null;
    console.info(`[AUTH] ${action}:`, {
      result: result,
      timestamp: new Date().toISOString(),
      details: sanitized
    });
  },
  
  // Log para operaciones administrativas
  adminLog: (action, user, resource, result) => {
    console.info(`[ADMIN] ${action}:`, {
      user: user?.substring(0, 8) + '***',
      resource: resource,
      result: result,
      timestamp: new Date().toISOString()
    });
  }
};

export default SecureLogger;