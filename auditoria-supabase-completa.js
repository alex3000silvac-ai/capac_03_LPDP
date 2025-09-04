/**
 * 🔍 AUDITORÍA COMPLETA SUPABASE - CONECTIVIDAD CRUD
 * 
 * Objetivo: Probar que TODAS las operaciones Supabase funcionen
 * sin importar lógica de negocio - solo conectividad básica
 */

import { supabase } from './frontend/src/config/supabaseClient.js';

class SupabaseAuditoria {
  constructor() {
    this.resultados = {};
    this.erroresEncontrados = [];
  }

  /**
   * 🚀 EJECUTAR AUDITORÍA COMPLETA
   */
  async ejecutarAuditoriaCompleta() {
    console.log('🔍 ========================================');
    console.log('🔍 INICIANDO AUDITORÍA COMPLETA SUPABASE');
    console.log('🔍 ========================================');

    // Prueba de conectividad básica
    await this.probarConectividadBasica();

    // Tablas identificadas en el código
    const tablasParaProbar = [
      'company_data_templates',
      'rats', 
      'system_error_logs',
      'organizaciones',
      'proveedores',
      'users',
      'tenants'
    ];

    // Probar cada tabla
    for (const tabla of tablasParaProbar) {
      await this.probarTablaCRUD(tabla);
    }

    // Resumen final
    this.mostrarResumenFinal();
  }

  /**
   * 🌐 PROBAR CONECTIVIDAD BÁSICA
   */
  async probarConectividadBasica() {
    console.log('\n🌐 === CONECTIVIDAD BÁSICA ===');
    
    try {
      // Test 1: Verificar cliente Supabase
      const { data: { user } } = await supabase.auth.getUser();
      console.log('✅ Cliente Supabase inicializado');
      console.log('👤 Usuario actual:', user?.email || 'Sin autenticar');

      // Test 2: Verificar base de datos accesible
      const { data, error } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .limit(1);
      
      if (!error) {
        console.log('✅ Base de datos accesible');
      } else {
        console.log('❌ Error accediendo BD:', error.message);
      }

      this.resultados.conectividad = { success: true };
    } catch (error) {
      console.log('❌ Error conectividad básica:', error.message);
      this.resultados.conectividad = { success: false, error: error.message };
      this.erroresEncontrados.push(`Conectividad: ${error.message}`);
    }
  }

  /**
   * 📋 PROBAR TABLA ESPECÍFICA - CRUD COMPLETO
   */
  async probarTablaCRUD(nombreTabla) {
    console.log(`\n📋 === PROBANDO TABLA: ${nombreTabla.toUpperCase()} ===`);
    
    const resultadosTabla = {
      existe: false,
      select: false,
      insert: false,
      update: false,
      delete: false,
      permisos: null,
      estructura: null,
      errores: []
    };

    // 1. Verificar si la tabla existe
    try {
      const { data, error } = await supabase
        .from(nombreTabla)
        .select('*')
        .limit(1);

      if (error) {
        if (error.code === '42P01') {
          console.log(`❌ Tabla '${nombreTabla}' NO EXISTE`);
          resultadosTabla.errores.push('Tabla no existe');
          this.erroresEncontrados.push(`Tabla ${nombreTabla}: no existe`);
          this.resultados[nombreTabla] = resultadosTabla;
          return;
        } else {
          console.log(`⚠️ Error accediendo tabla '${nombreTabla}':`, error.message);
          resultadosTabla.errores.push(error.message);
          resultadosTabla.permisos = 'SIN_ACCESO';
        }
      } else {
        console.log(`✅ Tabla '${nombreTabla}' EXISTE y es accesible`);
        resultadosTabla.existe = true;
        resultadosTabla.select = true;
        
        if (data && data[0]) {
          resultadosTabla.estructura = Object.keys(data[0]);
          console.log(`📊 Columnas detectadas:`, resultadosTabla.estructura.join(', '));
        }
      }
    } catch (error) {
      console.log(`💥 Exception en tabla '${nombreTabla}':`, error.message);
      resultadosTabla.errores.push(error.message);
    }

    // 2. Probar INSERT con datos dummy
    if (resultadosTabla.existe) {
      await this.probarInsertTabla(nombreTabla, resultadosTabla);
    }

    this.resultados[nombreTabla] = resultadosTabla;
  }

  /**
   * ➕ PROBAR INSERT EN TABLA ESPECÍFICA
   */
  async probarInsertTabla(nombreTabla, resultadosTabla) {
    const datosPrueba = this.generarDatosPrueba(nombreTabla);
    
    try {
      console.log(`➕ Probando INSERT en '${nombreTabla}'...`);
      
      const { data, error } = await supabase
        .from(nombreTabla)
        .insert([datosPrueba])
        .select();

      if (!error) {
        console.log(`✅ INSERT exitoso en '${nombreTabla}'`);
        resultadosTabla.insert = true;
        
        // Si se insertó exitosamente, probar UPDATE y DELETE
        if (data && data[0] && data[0].id) {
          await this.probarUpdateDelete(nombreTabla, data[0].id, resultadosTabla);
        }
      } else {
        console.log(`❌ INSERT falló en '${nombreTabla}':`, error.message);
        resultadosTabla.errores.push(`INSERT: ${error.message}`);
        this.erroresEncontrados.push(`${nombreTabla} INSERT: ${error.message}`);
      }
    } catch (error) {
      console.log(`💥 Exception INSERT '${nombreTabla}':`, error.message);
      resultadosTabla.errores.push(`INSERT Exception: ${error.message}`);
    }
  }

  /**
   * 🔄 PROBAR UPDATE Y DELETE
   */
  async probarUpdateDelete(nombreTabla, recordId, resultadosTabla) {
    // Probar UPDATE
    try {
      const { error: updateError } = await supabase
        .from(nombreTabla)
        .update({ updated_at: new Date().toISOString() })
        .eq('id', recordId);

      if (!updateError) {
        console.log(`✅ UPDATE exitoso en '${nombreTabla}'`);
        resultadosTabla.update = true;
      } else {
        console.log(`❌ UPDATE falló en '${nombreTabla}':`, updateError.message);
        resultadosTabla.errores.push(`UPDATE: ${updateError.message}`);
      }
    } catch (error) {
      resultadosTabla.errores.push(`UPDATE Exception: ${error.message}`);
    }

    // Probar DELETE (limpiar datos de prueba)
    try {
      const { error: deleteError } = await supabase
        .from(nombreTabla)
        .delete()
        .eq('id', recordId);

      if (!deleteError) {
        console.log(`✅ DELETE exitoso en '${nombreTabla}' - datos de prueba limpiados`);
        resultadosTabla.delete = true;
      } else {
        console.log(`❌ DELETE falló en '${nombreTabla}':`, deleteError.message);
        resultadosTabla.errores.push(`DELETE: ${deleteError.message}`);
      }
    } catch (error) {
      resultadosTabla.errores.push(`DELETE Exception: ${error.message}`);
    }
  }

  /**
   * 🎲 GENERAR DATOS DE PRUEBA POR TABLA
   */
  generarDatosPrueba(nombreTabla) {
    const timestamp = new Date().toISOString();
    const id = `audit_${Date.now()}`;

    const datosPorTabla = {
      company_data_templates: {
        tenant_id: 1,
        template_name: `audit_test_${Date.now()}`,
        template_type: 'audit_test',
        is_active: true,
        razon_social: 'Auditoría Test SpA',
        rut_empresa: '11111111-1', 
        direccion_empresa: 'Calle Test 123',
        email_empresa: 'test@audit.cl',
        nombre_dpo: 'Test DPO'
      },
      
      rats: {
        titulo: `RAT Auditoría ${Date.now()}`,
        estado: 'borrador',
        created_at: timestamp
      },

      system_error_logs: {
        tenant_id: 1,
        log_level: 'INFO',
        error_code: 'AUDIT_TEST',
        error_message: 'Test auditoría conectividad',
        source_component: 'AUDIT',
        category: 'TEST',
        timestamp: timestamp
      },

      organizaciones: {
        nombre: `Org Audit ${Date.now()}`,
        tipo: 'test'
      },

      proveedores: {
        nombre: `Proveedor Audit ${Date.now()}`,
        tipo: 'test'
      },

      users: {
        email: `audit_${Date.now()}@test.cl`,
        username: `audit_${Date.now()}`,
        tenant_id: 1,
        is_active: true
      },

      tenants: {
        name: `Tenant Audit ${Date.now()}`,
        is_active: true
      }
    };

    return datosPorTabla[nombreTabla] || {
      name: `Audit Test ${Date.now()}`,
      created_at: timestamp
    };
  }

  /**
   * 📊 MOSTRAR RESUMEN FINAL
   */
  mostrarResumenFinal() {
    console.log('\n📊 ========================================');
    console.log('📊 RESUMEN FINAL AUDITORÍA SUPABASE');
    console.log('📊 ========================================');

    let tablasOK = 0;
    let tablasFallas = 0;

    for (const [tabla, resultado] of Object.entries(this.resultados)) {
      if (tabla === 'conectividad') continue;

      console.log(`\n📋 ${tabla.toUpperCase()}:`);
      console.log(`  ✓ Existe: ${resultado.existe ? '✅' : '❌'}`);
      console.log(`  ✓ SELECT: ${resultado.select ? '✅' : '❌'}`);
      console.log(`  ✓ INSERT: ${resultado.insert ? '✅' : '❌'}`);
      console.log(`  ✓ UPDATE: ${resultado.update ? '✅' : '❌'}`);
      console.log(`  ✓ DELETE: ${resultado.delete ? '✅' : '❌'}`);
      
      if (resultado.errores.length > 0) {
        console.log(`  ⚠️ Errores: ${resultado.errores.join(', ')}`);
        tablasFallas++;
      } else if (resultado.existe) {
        tablasOK++;
      }
    }

    console.log(`\n🎯 RESULTADOS GENERALES:`);
    console.log(`  ✅ Tablas funcionando: ${tablasOK}`);
    console.log(`  ❌ Tablas con problemas: ${tablasFallas}`);
    console.log(`  🚨 Total errores encontrados: ${this.erroresEncontrados.length}`);

    if (this.erroresEncontrados.length > 0) {
      console.log(`\n🚨 ERRORES CRÍTICOS DETECTADOS:`);
      this.erroresEncontrados.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    }

    console.log('\n✨ Auditoría completada. Revisar errores antes de continuar con lógica de código.');
  }
}

// Ejecutar auditoría si se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const auditor = new SupabaseAuditoria();
  auditor.ejecutarAuditoriaCompleta().catch(console.error);
}

export default SupabaseAuditoria;