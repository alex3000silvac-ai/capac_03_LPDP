/**
 * 🔒 SISTEMA DE ALMACENAMIENTO SEGURO
 * Cifra datos sensibles antes de guardar en localStorage
 * Previene exposición de tokens y datos personales
 */

export const SecureStorage = {
  
  // Clave base para cifrado (en producción debería venir del servidor)
  ENCRYPTION_KEY: 'lpdp-secure-storage-v1',
  
  // Cifrado simple XOR (para demo - en producción usar crypto real)
  encrypt: (data) => {
    try {
      const jsonStr = JSON.stringify(data);
      const key = SecureStorage.ENCRYPTION_KEY;
      let encrypted = '';
      
      for (let i = 0; i < jsonStr.length; i++) {
        const charCode = jsonStr.charCodeAt(i) ^ key.charCodeAt(i % key.length);
        encrypted += String.fromCharCode(charCode);
      }
      
      // Convertir a base64 para storage seguro
      return btoa(encrypted);
    } catch (error) {
      console.error('[SECURE STORAGE] Error cifrando datos:', error.message);
      return null;
    }
  },
  
  // Descifrado
  decrypt: (encryptedData) => {
    try {
      if (!encryptedData) return null;
      
      const encrypted = atob(encryptedData);
      const key = SecureStorage.ENCRYPTION_KEY;
      let decrypted = '';
      
      for (let i = 0; i < encrypted.length; i++) {
        const charCode = encrypted.charCodeAt(i) ^ key.charCodeAt(i % key.length);
        decrypted += String.fromCharCode(charCode);
      }
      
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('[SECURE STORAGE] Error descifrando datos:', error.message);
      return null;
    }
  },
  
  // Guardar token de forma segura
  setSecureToken: (token) => {
    if (!token) {
      localStorage.removeItem('lpdp_secure_token');
      return;
    }
    
    const encryptedToken = SecureStorage.encrypt({ token, timestamp: Date.now() });
    if (encryptedToken) {
      localStorage.setItem('lpdp_secure_token', encryptedToken);
    }
  },
  
  // Obtener token de forma segura
  getSecureToken: () => {
    const encryptedData = localStorage.getItem('lpdp_secure_token');
    if (!encryptedData) return null;
    
    const decrypted = SecureStorage.decrypt(encryptedData);
    if (!decrypted || !decrypted.token) return null;
    
    // Verificar que no sea muy antiguo (más de 24 horas)
    const maxAge = 24 * 60 * 60 * 1000; // 24 horas
    if (Date.now() - decrypted.timestamp > maxAge) {
      SecureStorage.removeSecureToken();
      return null;
    }
    
    return decrypted.token;
  },
  
  // Remover token de forma segura
  removeSecureToken: () => {
    localStorage.removeItem('lpdp_secure_token');
    localStorage.removeItem('lpdp_token'); // Limpiar también el legacy
  },
  
  // Guardar refresh token seguro
  setSecureRefreshToken: (refreshToken) => {
    if (!refreshToken) {
      localStorage.removeItem('lpdp_secure_refresh');
      return;
    }
    
    const encryptedData = SecureStorage.encrypt({ 
      refreshToken, 
      timestamp: Date.now() 
    });
    if (encryptedData) {
      localStorage.setItem('lpdp_secure_refresh', encryptedData);
    }
  },
  
  // Obtener refresh token seguro
  getSecureRefreshToken: () => {
    const encryptedData = localStorage.getItem('lpdp_secure_refresh');
    if (!encryptedData) return null;
    
    const decrypted = SecureStorage.decrypt(encryptedData);
    if (!decrypted || !decrypted.refreshToken) return null;
    
    return decrypted.refreshToken;
  },
  
  // Migrar datos legacy a formato seguro
  migrateLegacyTokens: () => {
    const legacyToken = localStorage.getItem('lpdp_token');
    const legacyRefresh = localStorage.getItem('lpdp_refresh_token');
    
    if (legacyToken) {
      SecureStorage.setSecureToken(legacyToken);
      localStorage.removeItem('lpdp_token');
    }
    
    if (legacyRefresh) {
      SecureStorage.setSecureRefreshToken(legacyRefresh);
      localStorage.removeItem('lpdp_refresh_token');
    }
  },
  
  // Limpiar todo localStorage de forma segura
  clearSecureStorage: () => {
    SecureStorage.removeSecureToken();
    localStorage.removeItem('lpdp_secure_refresh');
    // Limpiar cualquier dato legacy también
    localStorage.removeItem('lpdp_token');
    localStorage.removeItem('lpdp_refresh_token');
  }
  
};

export default SecureStorage;