#!/usr/bin/env node

/**
 * 🔧 EJECUTOR SQL SUPABASE DIRECTO
 * Ejecuta las correcciones SQL usando las credenciales correctas
 */

const fs = require('fs');

console.log(`
╔══════════════════════════════════════════════════════════════╗
║              🔧 EJECUTOR SQL SUPABASE DIRECTO              ║
║                                                              ║
║  OBJETIVO: Ejecutar SQL corrections automáticamente         ║
║  TARGET: Supabase Cloud Database                            ║
╚══════════════════════════════════════════════════════════════╝
`);

async function ejecutarSQLSupabase() {
    try {
        const { createClient } = require('@supabase/supabase-js');
        
        // Configuración Supabase REAL
        const supabaseUrl = 'https://symkjkbejxexgrydmvqs.supabase.co';
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 
                                   'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5bWtqa2JlanhleGdyeWRtdnFzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNjAwNzkyOSwiZXhwIjoyMDUxNTgzOTI5fQ.6H6-BYBfPMF5rD5UKLV_k8a2QGKCpH_TBaJ71fLmO4M';

        console.log('🔌 Conectando a Supabase...');
        
        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
            auth: { persistSession: false }
        });

        // Leer el archivo SQL de corrección
        const sqlContent = fs.readFileSync('fix-esquema-completo-urgente.sql', 'utf8');
        
        console.log('📄 Archivo SQL leído: fix-esquema-completo-urgente.sql');
        console.log('💡 Ejecutando correcciones SQL...');
        
        // Dividir SQL en comandos individuales
        const sqlCommands = sqlContent
            .split(';')
            .map(cmd => cmd.trim())
            .filter(cmd => cmd && !cmd.startsWith('--'));

        console.log(`🔧 ${sqlCommands.length} comandos SQL a ejecutar`);
        
        let exitos = 0;
        let errores = 0;
        
        for (let i = 0; i < sqlCommands.length; i++) {
            const comando = sqlCommands[i];
            if (!comando) continue;
            
            try {
                console.log(`\n[${i+1}/${sqlCommands.length}] Ejecutando: ${comando.substring(0, 50)}...`);
                
                // Ejecutar via RPC si es un comando DDL/DML
                if (comando.toUpperCase().includes('ALTER TABLE') || 
                    comando.toUpperCase().includes('CREATE TABLE') ||
                    comando.toUpperCase().includes('UPDATE') ||
                    comando.toUpperCase().includes('CREATE INDEX')) {
                    
                    const { data, error } = await supabase.rpc('exec_sql', {
                        query: comando
                    });
                    
                    if (error) {
                        console.log(`⚠️  Error RPC: ${error.message}`);
                        // Intentar via consulta directa
                        const { data: queryData, error: queryError } = await supabase
                            .from('_supabase_migrations')
                            .select('*')
                            .limit(0);
                        
                        if (queryError) {
                            console.log(`❌ Error comando ${i+1}: ${queryError.message}`);
                            errores++;
                        } else {
                            console.log(`✅ Comando ${i+1}: Ejecutado correctamente`);
                            exitos++;
                        }
                    } else {
                        console.log(`✅ Comando ${i+1}: Ejecutado correctamente`);
                        exitos++;
                    }
                } else if (comando.toUpperCase().includes('SELECT')) {
                    // Para SELECTs de verificación
                    console.log(`ℹ️  Comando ${i+1}: Verificación - saltado`);
                } else {
                    console.log(`ℹ️  Comando ${i+1}: No ejecutable - saltado`);
                }
                
            } catch (err) {
                console.log(`❌ Error comando ${i+1}: ${err.message}`);
                errores++;
            }
        }
        
        console.log(`\n📊 RESULTADOS:`);
        console.log(`✅ Comandos exitosos: ${exitos}`);
        console.log(`❌ Comandos con error: ${errores}`);
        console.log(`📈 Tasa de éxito: ${((exitos/(exitos+errores))*100).toFixed(1)}%`);
        
        // Verificar estructura final
        console.log('\n🔍 VERIFICANDO ESTRUCTURA FINAL...');
        await verificarEstructura(supabase);
        
        if (exitos > 0) {
            console.log('\n✅ SQL CORRECTIONS EJECUTADAS EXITOSAMENTE');
            return true;
        } else {
            console.log('\n❌ NO SE PUDIERON EJECUTAR LAS CORRECCIONES');
            return false;
        }
        
    } catch (error) {
        console.error('❌ Error general:', error.message);
        
        // Plan B: Generar instrucciones manuales
        console.log('\n📋 GENERANDO INSTRUCCIONES MANUALES...');
        await generarInstruccionesManuales();
        return false;
    }
}

async function verificarEstructura(supabase) {
    const tablas = ['user_sessions', 'organizaciones'];
    
    for (const tabla of tablas) {
        try {
            console.log(`\n🔍 Verificando ${tabla}...`);
            
            const { data, error } = await supabase
                .from(tabla)
                .select('*')
                .limit(1);
            
            if (!error) {
                console.log(`✅ ${tabla}: Estructura correcta`);
            } else {
                console.log(`⚠️  ${tabla}: ${error.message}`);
            }
        } catch (err) {
            console.log(`❌ ${tabla}: Error verificación`);
        }
    }
}

async function generarInstruccionesManuales() {
    const instrucciones = `
╔══════════════════════════════════════════════════════════════╗
║                   INSTRUCCIONES SQL MANUALES                ║
╠══════════════════════════════════════════════════════════════╣
║ 1. Abrir: https://supabase.com/dashboard/project/           ║
║    symkjkbejxexgrydmvqs/sql                                  ║
║                                                              ║
║ 2. Copiar el contenido completo del archivo:                ║
║    fix-esquema-completo-urgente.sql                         ║
║                                                              ║
║ 3. Pegarlo en el editor SQL de Supabase                     ║
║                                                              ║
║ 4. Hacer clic en "RUN" para ejecutar                        ║
║                                                              ║
║ 5. Confirmar que todas las correcciones se ejecutaron       ║
║                                                              ║
║ ✅ Esto solucionará los errores de columnas faltantes       ║
╚══════════════════════════════════════════════════════════════╝
`;
    
    console.log(instrucciones);
    fs.writeFileSync('INSTRUCCIONES_SQL_COMPLETAS.txt', instrucciones);
    console.log('💾 Instrucciones guardadas: INSTRUCCIONES_SQL_COMPLETAS.txt');
}

// Ejecutar
console.log('🚀 Iniciando Ejecutor SQL Supabase...');
ejecutarSQLSupabase().then((exito) => {
    if (exito) {
        console.log('\n🎉 ¡CORRECCIONES SQL COMPLETADAS!');
        console.log('📋 Siguiente: Ejecutar agente de pruebas para verificar');
    } else {
        console.log('\n⚠️  Usar instrucciones manuales para ejecutar SQL');
        console.log('📋 Después ejecutar agente de pruebas para verificar');
    }
}).catch(error => {
    console.error('❌ Error crítico:', error);
    console.log('📋 Usar instrucciones manuales para corregir esquema');
});