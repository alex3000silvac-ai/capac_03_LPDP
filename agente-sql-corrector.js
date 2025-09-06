#!/usr/bin/env node

/**
 * 🔧 AGENTE SQL CORRECTOR - EJECUTA CORRECCIONES EN SUPABASE
 * Ejecuta automáticamente las correcciones SQL necesarias en Supabase
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

console.log(`
╔══════════════════════════════════════════════════════════════╗
║              🔧 AGENTE SQL CORRECTOR - SUPABASE              ║
║                                                              ║
║  OBJETIVO: Ejecutar correcciones SQL automáticamente        ║
║  ARCHIVO: fix-user-sessions-urgente.sql                     ║
╚══════════════════════════════════════════════════════════════╝
`);

// Configuración Supabase con anon key
const supabaseUrl = 'https://symkjkbejxexgrydmvqs.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5bWtqa2JlanhleGdyeWRtdnFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYwMDc5MjksImV4cCI6MjA1MTU4MzkyOX0.ojEJUgqUinLV7WxJxUpf0Q3__rtV9rCuUoV6X6GfhWs';

// Intentar diferentes configuraciones
const configs = [
  {
    name: 'Configuración con anon key',
    client: createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false }
    })
  }
];

async function ejecutarCorreccionSQL() {
  try {
    console.log('📋 PASO 1: Verificando conectividad...');
    
    // Probar conectividad básica
    for (const config of configs) {
      console.log(`\n🔌 Probando: ${config.name}`);
      
      try {
        // Test simple de conectividad
        const { data, error } = await config.client
          .from('user_sessions')
          .select('id')
          .limit(1);
        
        if (!error) {
          console.log('✅ Conectividad exitosa con', config.name);
          
          // Ejecutar corrección SQL por partes
          await ejecutarCorrecionPorPartes(config.client);
          return;
        } else {
          console.log('❌ Error:', error.message);
        }
      } catch (err) {
        console.log('❌ Error de conexión:', err.message);
      }
    }
    
    // Si no funciona conectividad directa, intentar vía API REST
    await ejecutarViaAPIREST();
    
  } catch (error) {
    console.error('❌ Error general:', error);
    await ejecutarPlanB();
  }
}

async function ejecutarCorrecionPorPartes(supabase) {
  console.log('\n📋 PASO 2: Ejecutando corrección SQL por partes...');
  
  const correcciones = [
    {
      nombre: 'Agregar columna is_active',
      sql: `ALTER TABLE public.user_sessions ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;`
    },
    {
      nombre: 'Agregar session_start',
      sql: `ALTER TABLE public.user_sessions ADD COLUMN IF NOT EXISTS session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW();`
    },
    {
      nombre: 'Agregar last_activity', 
      sql: `ALTER TABLE public.user_sessions ADD COLUMN IF NOT EXISTS last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW();`
    },
    {
      nombre: 'Agregar tenant_data',
      sql: `ALTER TABLE public.user_sessions ADD COLUMN IF NOT EXISTS tenant_data JSONB DEFAULT '{}';`
    }
  ];
  
  let exitos = 0;
  
  for (const correccion of correcciones) {
    try {
      console.log(`🔧 Ejecutando: ${correccion.nombre}`);
      
      // Intentar ejecutar vía RPC si está disponible
      const { data, error } = await supabase.rpc('exec_sql', { 
        query: correccion.sql 
      });
      
      if (!error) {
        console.log(`✅ ${correccion.nombre}: Exitoso`);
        exitos++;
      } else {
        console.log(`⚠️ ${correccion.nombre}: ${error.message}`);
      }
    } catch (err) {
      console.log(`⚠️ ${correccion.nombre}: ${err.message}`);
    }
  }
  
  // Verificar resultado
  console.log(`\n📊 Correcciones ejecutadas: ${exitos}/${correcciones.length}`);
  
  if (exitos > 0) {
    await verificarEstructura(supabase);
  }
}

async function ejecutarViaAPIREST() {
  console.log('\n📋 PASO 3: Intentando vía API REST...');
  
  const fetch = require('node-fetch') || (await import('node-fetch')).default;
  
  // Ejecutar ALTER TABLE via PostgREST (si está habilitado)
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
      },
      body: JSON.stringify({
        query: `ALTER TABLE public.user_sessions ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;`
      })
    });
    
    if (response.ok) {
      console.log('✅ Corrección ejecutada vía API REST');
    } else {
      console.log('⚠️ API REST no disponible');
    }
  } catch (err) {
    console.log('⚠️ Error API REST:', err.message);
  }
}

async function verificarEstructura(supabase) {
  console.log('\n📋 PASO 4: Verificando estructura de tabla...');
  
  try {
    // Intentar hacer una query que use is_active
    const { data, error } = await supabase
      .from('user_sessions')
      .select('id, is_active')
      .limit(1);
    
    if (!error) {
      console.log('✅ Columna is_active disponible');
      console.log('✅ Estructura de tabla corregida');
      
      // Actualizar registros existentes
      const { data: updateData, error: updateError } = await supabase
        .from('user_sessions')
        .update({ is_active: true })
        .is('is_active', null);
      
      if (!updateError) {
        console.log('✅ Registros existentes actualizados');
      }
      
    } else {
      console.log('⚠️ Columna is_active aún no disponible:', error.message);
    }
  } catch (err) {
    console.log('⚠️ Error verificando estructura:', err.message);
  }
}

async function ejecutarPlanB() {
  console.log('\n📋 PLAN B: Generando instrucciones manuales...');
  
  const instrucciones = `
╔══════════════════════════════════════════════════════════════╗
║                   INSTRUCCIONES MANUALES                    ║
╠══════════════════════════════════════════════════════════════╣
║ 1. Abrir: https://supabase.com/dashboard/project/           ║
║    symkjkbejxexgrydmvqs/sql                                  ║
║                                                              ║
║ 2. Copiar y ejecutar estos comandos SQL:                    ║
║                                                              ║
║    ALTER TABLE public.user_sessions                         ║
║    ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true; ║
║                                                              ║
║    ALTER TABLE public.user_sessions                         ║
║    ADD COLUMN IF NOT EXISTS session_start                   ║
║    TIMESTAMP WITH TIME ZONE DEFAULT NOW();                  ║
║                                                              ║
║    ALTER TABLE public.user_sessions                         ║
║    ADD COLUMN IF NOT EXISTS last_activity                   ║
║    TIMESTAMP WITH TIME ZONE DEFAULT NOW();                  ║
║                                                              ║
║    ALTER TABLE public.user_sessions                         ║
║    ADD COLUMN IF NOT EXISTS tenant_data JSONB DEFAULT '{}'; ║
║                                                              ║
║ 3. Hacer clic en "RUN" para ejecutar                        ║
║                                                              ║
║ 4. Confirmar que se ejecutaron sin errores                  ║
╚══════════════════════════════════════════════════════════════╝
`;
  
  console.log(instrucciones);
  
  // Guardar instrucciones en archivo
  fs.writeFileSync('INSTRUCCIONES_SQL_MANUAL.txt', instrucciones);
  console.log('💾 Instrucciones guardadas en: INSTRUCCIONES_SQL_MANUAL.txt');
}

// Ejecutar agente
console.log('🚀 Iniciando Agente SQL Corrector...');
ejecutarCorreccionSQL().then(() => {
  console.log('\n✅ Agente SQL Corrector completado');
  console.log('📋 Siguiente paso: Ejecutar agente de pruebas para verificar');
}).catch(error => {
  console.error('❌ Error en Agente SQL Corrector:', error);
  console.log('📋 Revisar instrucciones manuales generadas');
});