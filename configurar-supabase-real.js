#!/usr/bin/env node

/**
 * 🚀 CONFIGURACIÓN SUPABASE REAL - REINGENIERÍA COMPLETA
 * 
 * Este script configura la conexión REAL a Supabase
 * Elimina todos los mocks y conexiones imposibles a localhost
 */

console.log(`
╔════════════════════════════════════════════════════════════╗
║        🚀 CONFIGURACIÓN SUPABASE CLOUD - LPDP              ║
║                                                            ║
║  ARQUITECTURA CORRECTA:                                   ║
║  Frontend (Render) → Supabase Cloud → PostgreSQL          ║
║                                                            ║
║  ELIMINA:                                                  ║
║  ❌ Conexiones localhost imposibles                        ║
║  ❌ Mocks de autenticación                                 ║
║  ❌ CSP restrictivo                                        ║
╚════════════════════════════════════════════════════════════╝
`);

// PASO 1: Configuración Supabase REAL
const SUPABASE_CONFIG = {
  // IMPORTANTE: Reemplazar con valores reales de su proyecto Supabase
  url: 'https://[YOUR_PROJECT_REF].supabase.co',
  anonKey: 'eyJ...[YOUR_ANON_KEY]',
  serviceKey: 'eyJ...[YOUR_SERVICE_KEY]' // Solo para backend
};

console.log(`
📋 INSTRUCCIONES PARA OBTENER CREDENCIALES SUPABASE:

1. Crear cuenta en https://supabase.com (gratis)
2. Crear nuevo proyecto
3. Ir a Settings → API
4. Copiar:
   - Project URL
   - anon/public key
   - service_role key (para backend)

5. Reemplazar en este archivo y ejecutar
`);

// PASO 2: Crear archivo de configuración para frontend
const frontendConfig = `
import { createClient } from '@supabase/supabase-js'

// 🚀 CLIENTE SUPABASE REAL - NO MOCK
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL y Anon Key son requeridas')
}

// Cliente Supabase real con todas las funcionalidades
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'x-tenant-id': localStorage.getItem('currentTenant') || 'default'
    }
  }
})

// Helper para operaciones con tenant
export const supabaseWithTenant = (tenantId) => {
  return supabase
}

// Función para obtener tenant actual
export const getCurrentTenant = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user?.id) {
    const { data: session } = await supabase
      .from('user_sessions')
      .select('tenant_id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()
    
    return session?.tenant_id || 'default'
  }
  
  return 'default'
}

// Función para verificar conectividad
export const getConnectivityStatus = async () => {
  try {
    const { data, error } = await supabase
      .from('organizaciones')
      .select('count')
      .limit(1)
    
    if (error) throw error
    
    return {
      online: true,
      mode: 'supabase_cloud',
      message: 'Conectado a Supabase Cloud',
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    return {
      online: false,
      mode: 'error',
      message: error.message,
      timestamp: new Date().toISOString()
    }
  }
}

export default supabase
`;

// PASO 3: Variables de entorno para frontend
const frontendEnv = `
# SUPABASE CLOUD - Producción
REACT_APP_SUPABASE_URL=${SUPABASE_CONFIG.url}
REACT_APP_SUPABASE_ANON_KEY=${SUPABASE_CONFIG.anonKey}
REACT_APP_ENVIRONMENT=production
`;

// PASO 4: Variables de entorno para backend
const backendEnv = `
# SUPABASE CLOUD - Backend
SUPABASE_URL=${SUPABASE_CONFIG.url}
SUPABASE_SERVICE_KEY=${SUPABASE_CONFIG.serviceKey}
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
ENVIRONMENT=production
PORT=3001
`;

// PASO 5: Configuración RLS para multi-tenant
const rlsConfig = `
-- 🔒 ROW LEVEL SECURITY PARA LPDP MULTI-TENANT

-- Habilitar RLS en todas las tablas
ALTER TABLE mapeo_datos_rat ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventario_rats ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE users_tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE actividades_dpo ENABLE ROW LEVEL SECURITY;
ALTER TABLE proveedores ENABLE ROW LEVEL SECURITY;

-- Política: Usuarios solo ven datos de su tenant
CREATE POLICY "Tenant Isolation" ON mapeo_datos_rat
  FOR ALL 
  USING (tenant_id = current_setting('app.current_tenant')::text);

CREATE POLICY "Tenant Isolation" ON inventario_rats
  FOR ALL 
  USING (tenant_id = current_setting('app.current_tenant')::text);

CREATE POLICY "Tenant Isolation" ON generated_documents
  FOR ALL 
  USING (tenant_id = current_setting('app.current_tenant')::text);

-- Política especial para organizaciones (usuarios pueden ver sus propias)
CREATE POLICY "User Organizations" ON organizaciones
  FOR SELECT
  USING (
    id IN (
      SELECT organizacion_id 
      FROM users_tenants 
      WHERE user_id = auth.uid()
    )
  );

-- Super admin puede ver todo
CREATE POLICY "Super Admin Access" ON mapeo_datos_rat
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'is_superuser' = 'true'
    )
  );
`;

console.log(`
📁 ARCHIVOS A CREAR/MODIFICAR:

1. frontend/src/config/supabaseClient.js
2. frontend/.env.production
3. backend/.env
4. Ejecutar RLS en Supabase SQL Editor

✅ VENTAJAS DE ESTA ARQUITECTURA:

• Conexión directa Supabase Cloud (sin localhost)
• Autenticación real con JWT
• RLS para seguridad multi-tenant
• APIs REST automáticas
• Realtime subscriptions
• Storage integrado
• Backup automático

🚀 SIGUIENTE PASO: 
1. Crear proyecto en supabase.com
2. Obtener credenciales
3. Actualizar este archivo con credenciales reales
4. Ejecutar: node configurar-supabase-real.js --apply
`);

if (process.argv.includes('--apply')) {
  const fs = require('fs');
  
  // Guardar configuraciones
  fs.writeFileSync('frontend/src/config/supabaseClient.js', frontendConfig);
  fs.writeFileSync('frontend/.env.production', frontendEnv);
  fs.writeFileSync('backend/.env', backendEnv);
  fs.writeFileSync('database/rls-config.sql', rlsConfig);
  
  console.log('✅ Archivos de configuración creados');
  console.log('📋 Siguiente: Ejecutar RLS config en Supabase SQL Editor');
}