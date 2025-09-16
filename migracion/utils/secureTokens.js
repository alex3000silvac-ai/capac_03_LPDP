/**
 * 🔒 GENERADOR DE TOKENS SEGUROS - REEMPLAZO DE TOKENS HARDCODEADOS
 * Elimina vulnerabilidades críticas de tokens hardcodeados
 */

export const SecureTokenGenerator = {
  
  // Generar token demo seguro (dinámico)
  generateSecureDemoToken: () => {
    const payload = {
      sub: 'demo_user',
      tenant: 'demo_empresa',
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hora
      iat: Math.floor(Date.now() / 1000),
      iss: 'lpdp-demo-system',
      jti: generateRandomId(), // JWT ID único
      demo: true
    };
    
    // Simular JWT sin exponer claves reales
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payloadB64 = btoa(JSON.stringify(payload));
    const signature = generateDemoSignature(header + '.' + payloadB64);
    
    return `${header}.${payloadB64}.${signature}`;
  },
  
  // Generar refresh token demo
  generateSecureDemoRefresh: () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 15);
    const hash = generateSimpleHash(`demo_refresh_${timestamp}_${random}`);
    
    return `demo_refresh_${timestamp}_${hash}`;
  },
  
  // Generar ID usuario demo único
  generateDemoUserId: () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 8);
    return `demo_user_${timestamp}_${random}`;
  },
  
  // Generar ID aleatorio seguro
  generateRandomId: () => {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  },
  
  // Generar signature demo (NO para producción)
  generateDemoSignature: (data) => {
    // Solo para demo - usar hash simple sin exponer claves
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convertir a 32bit
    }
    return btoa(Math.abs(hash).toString(36));
  },
  
  // Hash simple para demos
  generateSimpleHash: (input) => {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return btoa(Math.abs(hash).toString(36)).substr(0, 8);
  },
  
  // Validar token demo
  validateDemoToken: (token) => {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      
      const payload = JSON.parse(atob(parts[1]));
      
      // Verificar expiración
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        return false;
      }
      
      // Verificar que es token demo
      return payload.demo === true && payload.iss === 'lpdp-demo-system';
    } catch (error) {
      return false;
    }
  }
};

// Funciones globales para compatibilidad
window.generateDemoToken = SecureTokenGenerator.generateSecureDemoToken;
window.generateDemoRefreshToken = SecureTokenGenerator.generateSecureDemoRefresh; 
window.generateDemoUserId = SecureTokenGenerator.generateDemoUserId;

export default SecureTokenGenerator;