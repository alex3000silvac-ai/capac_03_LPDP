/**
 * 🚨 UTILIDAD DE EMERGENCIA: Test de conectividad ANTI-PLANCHA
 * Para detectar problemas DNS y evitar que se aleje el pan
 */

// Test rápido de conectividad con timeout manual
export const testSupabaseConnectivity = async (timeoutMs = 2000) => {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('TIMEOUT: Supabase no responde en tiempo esperado'));
    }, timeoutMs);

    fetch('${process.env.REACT_APP_SUPABASE_URL || 'https://symkjkbejxexgrydmvqs.supabase.co'}/rest/v1/', { 
      method: 'HEAD',
      cache: 'no-cache'
    })
    .then(response => {
      clearTimeout(timeout);
      if (response.ok || response.status === 401) {
        // 401 es normal sin API key, significa que responde
        resolve(true);
      } else {
        reject(new Error(`HTTP_ERROR: Status ${response.status}`));
      }
    })
    .catch(error => {
      clearTimeout(timeout);
      console.log('🚨 Error de conectividad:', error.message);
      
      // Detectar tipos específicos de error
      if (error.message.includes('Failed to fetch') || 
          error.message.includes('NAME_NOT_RESOLVED') ||
          error.message.includes('ERR_NETWORK') ||
          error.message.includes('NetworkError')) {
        reject(new Error('DNS_ERROR: No se puede resolver symkjkbejxexgrydmvqs.supabase.co'));
      } else {
        reject(error);
      }
    });
  });
};

// Test alternativo usando una imagen 1x1 pixel
export const testSupabaseConnectivityImage = async () => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const timeout = setTimeout(() => {
      reject(new Error('TIMEOUT: Supabase no accesible'));
    }, 1500);

    img.onload = () => {
      clearTimeout(timeout);
      resolve(true);
    };

    img.onerror = () => {
      clearTimeout(timeout);
      reject(new Error('DNS_ERROR: symkjkbejxexgrydmvqs.supabase.co no resuelve'));
    };

    // Intentar cargar favicon de Supabase
    img.src = '${process.env.REACT_APP_SUPABASE_URL || 'https://symkjkbejxexgrydmvqs.supabase.co'}/favicon.ico?' + Date.now();
  });
};

// Detectar si debemos usar localStorage inmediatamente
export const shouldUseLocalStorageFirst = async () => {
  try {
    await testSupabaseConnectivity(1500);
    console.log('✅ Supabase disponible');
    return false;
  } catch (error) {
    console.warn('⚠️ Supabase no disponible:', error.message);
    return true;
  }
};

// Función de respaldo completa
export const getConnectivityStatus = async () => {
  const tests = [];
  
  // Test 1: Fetch directo
  try {
    await testSupabaseConnectivity(1000);
    tests.push({ method: 'fetch', success: true });
  } catch (error) {
    tests.push({ method: 'fetch', success: false, error: error.message });
  }

  // Test 2: Image load
  try {
    await testSupabaseConnectivityImage();
    tests.push({ method: 'image', success: true });
  } catch (error) {
    tests.push({ method: 'image', success: false, error: error.message });
  }

  const anySuccess = tests.some(t => t.success);
  
  return {
    available: anySuccess,
    tests,
    recommendation: anySuccess ? 'use_supabase' : 'use_localStorage',
    message: anySuccess 
      ? '☁️ Supabase disponible' 
      : '📱 Usar localStorage (Supabase no accesible)'
  };
};