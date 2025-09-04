/**
 * Rate Limiter para prevenir ataques de fuerza bruta y DoS
 */

class RateLimiter {
  constructor() {
    this.attempts = new Map();
    this.blocked = new Map();
    this.config = {
      maxAttempts: 5,           // Máximo de intentos
      windowMs: 15 * 60 * 1000, // Ventana de 15 minutos
      blockDuration: 60 * 60 * 1000, // Bloqueo de 1 hora
      maxRequestsPerMinute: 30  // Máximo de requests por minuto
    };
    this.requestCounts = new Map();
  }

  /**
   * Verificar si una acción está permitida
   */
  isAllowed(key, action = 'default') {
    const compositeKey = `${key}:${action}`;
    
    // Verificar si está bloqueado
    if (this.isBlocked(compositeKey)) {
      return false;
    }

    // Verificar rate limit general
    if (!this.checkRateLimit(key)) {
      this.block(compositeKey);
      return false;
    }

    return true;
  }

  /**
   * Registrar un intento
   */
  recordAttempt(key, action = 'default', success = false) {
    const compositeKey = `${key}:${action}`;
    const now = Date.now();

    if (!this.attempts.has(compositeKey)) {
      this.attempts.set(compositeKey, []);
    }

    const userAttempts = this.attempts.get(compositeKey);
    
    // Limpiar intentos antiguos
    const recentAttempts = userAttempts.filter(
      attempt => now - attempt.timestamp < this.config.windowMs
    );

    // Agregar nuevo intento
    recentAttempts.push({ timestamp: now, success });
    this.attempts.set(compositeKey, recentAttempts);

    // Si hay demasiados intentos fallidos, bloquear
    const failedAttempts = recentAttempts.filter(a => !a.success);
    if (failedAttempts.length >= this.config.maxAttempts) {
      this.block(compositeKey);
      return false;
    }

    return true;
  }

  /**
   * Verificar si está bloqueado
   */
  isBlocked(key) {
    if (!this.blocked.has(key)) {
      return false;
    }

    const blockTime = this.blocked.get(key);
    const now = Date.now();

    if (now - blockTime > this.config.blockDuration) {
      this.blocked.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Bloquear una key
   */
  block(key) {
    this.blocked.set(key, Date.now());
    // console.warn(`⚠️ Rate limiter: Bloqueado ${key}`);
  }

  /**
   * Verificar rate limit general
   */
  checkRateLimit(key) {
    const now = Date.now();
    const minute = Math.floor(now / 60000);
    const rateKey = `${key}:${minute}`;

    if (!this.requestCounts.has(rateKey)) {
      this.requestCounts.set(rateKey, 1);
      // Limpiar contadores antiguos
      this.cleanupOldCounts();
      return true;
    }

    const count = this.requestCounts.get(rateKey);
    if (count >= this.config.maxRequestsPerMinute) {
      return false;
    }

    this.requestCounts.set(rateKey, count + 1);
    return true;
  }

  /**
   * Limpiar contadores antiguos
   */
  cleanupOldCounts() {
    const now = Date.now();
    const currentMinute = Math.floor(now / 60000);
    
    for (const [key] of this.requestCounts) {
      const keyMinute = parseInt(key.split(':').pop());
      if (currentMinute - keyMinute > 5) {
        this.requestCounts.delete(key);
      }
    }
  }

  /**
   * Obtener tiempo restante de bloqueo
   */
  getBlockTimeRemaining(key, action = 'default') {
    const compositeKey = `${key}:${action}`;
    
    if (!this.isBlocked(compositeKey)) {
      return 0;
    }

    const blockTime = this.blocked.get(compositeKey);
    const now = Date.now();
    const remaining = this.config.blockDuration - (now - blockTime);
    
    return Math.max(0, Math.ceil(remaining / 1000)); // Retornar en segundos
  }

  /**
   * Limpiar intentos de una key
   */
  clearAttempts(key, action = 'default') {
    const compositeKey = `${key}:${action}`;
    this.attempts.delete(compositeKey);
    this.blocked.delete(compositeKey);
  }

  /**
   * Obtener estadísticas
   */
  getStats() {
    return {
      totalAttempts: this.attempts.size,
      blockedUsers: this.blocked.size,
      activeRequests: this.requestCounts.size
    };
  }
}

// Singleton instance
const rateLimiter = new RateLimiter();

// Rate limiter para login
export const loginRateLimiter = {
  checkLogin: (username) => {
    const key = `login:${username}`;
    return rateLimiter.isAllowed(key, 'login');
  },
  
  recordLoginAttempt: (username, success) => {
    const key = `login:${username}`;
    return rateLimiter.recordAttempt(key, 'login', success);
  },
  
  getLoginBlockTime: (username) => {
    const key = `login:${username}`;
    return rateLimiter.getBlockTimeRemaining(key, 'login');
  }
};

// Rate limiter para API calls
export const apiRateLimiter = {
  checkApiCall: (endpoint, userId) => {
    const key = `api:${userId}:${endpoint}`;
    return rateLimiter.isAllowed(key, 'api');
  },
  
  recordApiCall: (endpoint, userId) => {
    const key = `api:${userId}:${endpoint}`;
    return rateLimiter.recordAttempt(key, 'api', true);
  }
};

// Rate limiter para formularios
export const formRateLimiter = {
  checkFormSubmit: (formId, sessionId) => {
    const key = `form:${sessionId}:${formId}`;
    return rateLimiter.isAllowed(key, 'form');
  },
  
  recordFormSubmit: (formId, sessionId, success = true) => {
    const key = `form:${sessionId}:${formId}`;
    return rateLimiter.recordAttempt(key, 'form', success);
  }
};

export default rateLimiter;