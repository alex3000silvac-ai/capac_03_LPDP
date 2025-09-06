#!/usr/bin/env node

/**
 * 🔐 CONFIGURACIÓN AUTENTICACIÓN SUPABASE
 * Script para crear usuarios y configurar autenticación correctamente
 */

const { createClient } = require('@supabase/supabase-js');

// Configuración Supabase
const supabaseUrl = 'https://symkjkbejxexgrydmvqs.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5bWtqa2JlanhleGdyeWRtdnFzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNjAwNzkyOSwiZXhwIjoyMDUxNTgzOTI5fQ.aaYLg7LhXZSB7YqgoW66CJmLZqD5WK0b8gjxPoOLwzY';

// IMPORTANTE: Necesitamos el service_role key para crear usuarios
// Si no la tienes, obtenerla desde Supabase Dashboard > Settings > API

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log(`
╔════════════════════════════════════════════════════════════╗
║       🔐 CONFIGURACIÓN AUTENTICACIÓN SUPABASE LPDP         ║
╚════════════════════════════════════════════════════════════╝
`);

async function configurarAuth() {
  try {
    console.log('📋 PASO 1: Verificando conexión...');
    
    // Test conexión
    const { data: test, error: testError } = await supabase
      .from('organizaciones')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Error conectando:', testError);
      console.log('🔑 Necesitas el service_role key de Supabase Dashboard');
      return;
    }
    
    console.log('✅ Conexión exitosa a Supabase');
    
    // PASO 2: Crear organización por defecto
    console.log('\n📋 PASO 2: Creando organización por defecto...');
    
    const { data: orgExiste } = await supabase
      .from('organizaciones')
      .select('id')
      .eq('id', 'demo_empresa')
      .single();
    
    if (!orgExiste) {
      const { data: newOrg, error: orgError } = await supabase
        .from('organizaciones')
        .insert({
          id: 'demo_empresa',
          nombre: 'Empresa Demo LPDP',
          rut: '76.123.456-7',
          direccion: 'Av. Providencia 1234, Santiago',
          telefono: '+56 2 2345 6789',
          email: 'contacto@empresademo.cl',
          sitio_web: 'https://empresademo.cl',
          active: true,
          plan_type: 'premium',
          config: {
            modulos_activos: ['rat', 'dpo', 'eipd', 'proveedores'],
            limite_usuarios: 10,
            limite_rats: 100
          }
        })
        .select()
        .single();
      
      if (orgError) {
        console.error('❌ Error creando organización:', orgError);
      } else {
        console.log('✅ Organización demo creada:', newOrg.id);
      }
    } else {
      console.log('✅ Organización demo ya existe');
    }
    
    // PASO 3: Crear usuarios de prueba
    console.log('\n📋 PASO 3: Creando usuarios de prueba...');
    
    const usuarios = [
      {
        email: 'admin@juridicadigital.cl',
        password: 'Admin2024!',
        user_metadata: {
          first_name: 'Admin',
          last_name: 'Sistema',
          role: 'admin',
          tenant_id: 'demo_empresa',
          organizacion_id: 'demo_empresa',
          is_superuser: true,
          permissions: ['*']
        }
      },
      {
        email: 'dpo@empresademo.cl',
        password: 'Dpo2024!',
        user_metadata: {
          first_name: 'DPO',
          last_name: 'Demo',
          role: 'dpo',
          tenant_id: 'demo_empresa',
          organizacion_id: 'demo_empresa',
          is_superuser: false,
          permissions: ['rat:*', 'eipd:*', 'providers:*', 'dpo:*']
        }
      },
      {
        email: 'usuario@empresademo.cl',
        password: 'Usuario2024!',
        user_metadata: {
          first_name: 'Usuario',
          last_name: 'Demo',
          role: 'user',
          tenant_id: 'demo_empresa',
          organizacion_id: 'demo_empresa',
          is_superuser: false,
          permissions: ['rat:read', 'eipd:read']
        }
      }
    ];
    
    for (const usuario of usuarios) {
      // Verificar si usuario existe
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const userExists = existingUsers?.users?.some(u => u.email === usuario.email);
      
      if (!userExists) {
        const { data: newUser, error: userError } = await supabase.auth.admin.createUser({
          email: usuario.email,
          password: usuario.password,
          email_confirm: true,
          user_metadata: usuario.user_metadata
        });
        
        if (userError) {
          console.error(`❌ Error creando ${usuario.email}:`, userError.message);
        } else {
          console.log(`✅ Usuario creado: ${usuario.email}`);
          
          // Crear registro en users_tenants
          await supabase
            .from('users_tenants')
            .insert({
              user_id: newUser.user.id,
              organizacion_id: 'demo_empresa',
              role: usuario.user_metadata.role,
              is_active: true
            });
        }
      } else {
        console.log(`✅ Usuario ya existe: ${usuario.email}`);
      }
    }
    
    // PASO 4: Configurar políticas RLS
    console.log('\n📋 PASO 4: Configurando políticas RLS...');
    
    const rlsPolicies = `
-- POLÍTICAS RLS PARA LPDP

-- Habilitar RLS en todas las tablas
ALTER TABLE organizaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE users_tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE mapeo_datos_rat ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventario_rats ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE actividades_dpo ENABLE ROW LEVEL SECURITY;
ALTER TABLE proveedores ENABLE ROW LEVEL SECURITY;

-- Política: Usuarios autenticados pueden ver sus organizaciones
CREATE POLICY "Users can view their organizations" ON organizaciones
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM users_tenants 
      WHERE organizacion_id = organizaciones.id
    )
  );

-- Política: Usuarios pueden ver/editar datos de su tenant
CREATE POLICY "Tenant isolation policy" ON mapeo_datos_rat
  FOR ALL USING (
    tenant_id IN (
      SELECT organizacion_id FROM users_tenants 
      WHERE user_id = auth.uid()
    )
  );

-- Política: Super admin puede ver todo
CREATE POLICY "Super admin full access" ON mapeo_datos_rat
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'is_superuser' = 'true'
    )
  );
`;
    
    console.log('📝 Políticas RLS generadas');
    console.log('⚠️  IMPORTANTE: Ejecutar en Supabase SQL Editor:');
    console.log('   1. Ir a https://supabase.com/dashboard/project/symkjkbejxexgrydmvqs/sql');
    console.log('   2. Copiar y ejecutar las políticas RLS');
    
    // Guardar políticas en archivo
    const fs = require('fs');
    fs.writeFileSync('rls-policies.sql', rlsPolicies);
    console.log('💾 Políticas guardadas en: rls-policies.sql');
    
    // PASO 5: Test de autenticación
    console.log('\n📋 PASO 5: Probando autenticación...');
    
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@juridicadigital.cl',
      password: 'Admin2024!'
    });
    
    if (authError) {
      console.error('❌ Error en login de prueba:', authError.message);
    } else {
      console.log('✅ Login exitoso!');
      console.log('   User ID:', authData.user.id);
      console.log('   Email:', authData.user.email);
      console.log('   Role:', authData.user.user_metadata.role);
    }
    
    console.log(`
╔════════════════════════════════════════════════════════════╗
║                   ✅ CONFIGURACIÓN COMPLETA                ║
╠════════════════════════════════════════════════════════════╣
║ USUARIOS CREADOS:                                          ║
║   • admin@juridicadigital.cl / Admin2024!                  ║
║   • dpo@empresademo.cl / Dpo2024!                         ║
║   • usuario@empresademo.cl / Usuario2024!                  ║
║                                                            ║
║ SIGUIENTE PASO:                                            ║
║   1. Ejecutar políticas RLS en Supabase SQL Editor        ║
║   2. Actualizar frontend con las credenciales             ║
║   3. Ejecutar agente de pruebas                          ║
╚════════════════════════════════════════════════════════════╝
`);
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar configuración
configurarAuth();