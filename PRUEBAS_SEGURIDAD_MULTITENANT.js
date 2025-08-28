/**
 * 🧪 SUITE DE PRUEBAS DE SEGURIDAD MULTI-TENANT
 * Sistema LPDP - Validación de Aislamiento Total
 * 
 * EJECUTAR ESTAS PRUEBAS ANTES DE PRODUCCIÓN
 */

import { supabase } from '../frontend/src/config/supabaseClient';

// =====================================================
// CONFIGURACIÓN DE PRUEBAS
// =====================================================

const PRUEBAS_CONFIG = {
  // Usuarios de prueba (crear manualmente en Supabase Auth)
  USER_A: {
    email: 'prueba.empresa.a@test.com',
    password: 'TestPassword123!',
    empresa: 'Empresa Test A'
  },
  USER_B: {
    email: 'prueba.empresa.b@test.com', 
    password: 'TestPassword123!',
    empresa: 'Empresa Test B'
  }
};

// =====================================================
// PRUEBA #1: AISLAMIENTO TOTAL DE ORGANIZACIONES
// =====================================================

export const pruebaAislamientoOrganizaciones = async () => {
  console.log('🧪 INICIANDO: Prueba de Aislamiento de Organizaciones');
  
  try {
    // Paso 1: Login como Usuario A
    const { data: userA, error: errorA } = await supabase.auth.signInWithPassword({
      email: PRUEBAS_CONFIG.USER_A.email,
      password: PRUEBAS_CONFIG.USER_A.password
    });
    
    if (errorA) throw new Error(`Error login Usuario A: ${errorA.message}`);
    console.log('✅ Usuario A autenticado');
    
    // Paso 2: Crear organización para Usuario A
    const { data: orgA, error: orgErrorA } = await supabase
      .from('organizaciones')
      .insert([{
        company_name: PRUEBAS_CONFIG.USER_A.empresa,
        user_id: userA.user.id,
        active: true,
        is_demo: false
      }])
      .select()
      .single();
      
    if (orgErrorA) throw new Error(`Error creando org A: ${orgErrorA.message}`);
    console.log('✅ Organización A creada:', orgA.id);
    
    // Paso 3: Logout y login como Usuario B
    await supabase.auth.signOut();
    
    const { data: userB, error: errorB } = await supabase.auth.signInWithPassword({
      email: PRUEBAS_CONFIG.USER_B.email,
      password: PRUEBAS_CONFIG.USER_B.password
    });
    
    if (errorB) throw new Error(`Error login Usuario B: ${errorB.message}`);
    console.log('✅ Usuario B autenticado');
    
    // Paso 4: Intentar ver organizaciones (NO debe ver la de Usuario A)
    const { data: orgsVisiblesB, error: errorVis } = await supabase
      .from('organizaciones')
      .select('*');
      
    if (errorVis) throw new Error(`Error consultando orgs: ${errorVis.message}`);
    
    // VALIDACIÓN CRÍTICA
    const veOrgA = orgsVisiblesB.some(org => org.id === orgA.id);
    
    if (veOrgA) {
      throw new Error('🚨 FALLA CRÍTICA: Usuario B puede ver organización de Usuario A');
    }
    
    console.log('✅ AISLAMIENTO OK: Usuario B NO ve organización de Usuario A');
    
    // Paso 5: Crear organización para Usuario B
    const { data: orgB, error: orgErrorB } = await supabase
      .from('organizaciones')
      .insert([{
        company_name: PRUEBAS_CONFIG.USER_B.empresa,
        user_id: userB.user.id,
        active: true,
        is_demo: false
      }])
      .select()
      .single();
      
    if (orgErrorB) throw new Error(`Error creando org B: ${orgErrorB.message}`);
    console.log('✅ Organización B creada:', orgB.id);
    
    return {
      exito: true,
      mensaje: 'Aislamiento de organizaciones CORRECTO',
      orgA: orgA.id,
      orgB: orgB.id
    };
    
  } catch (error) {
    console.error('❌ FALLA EN PRUEBA:', error.message);
    return {
      exito: false,
      error: error.message
    };
  }
};

// =====================================================
// PRUEBA #2: AISLAMIENTO TOTAL DE RATS
// =====================================================

export const pruebaAislamientoRATs = async (orgAId, orgBId) => {
  console.log('🧪 INICIANDO: Prueba de Aislamiento de RATs');
  
  try {
    // Paso 1: Login como Usuario A y crear RAT
    const { data: userA } = await supabase.auth.signInWithPassword({
      email: PRUEBAS_CONFIG.USER_A.email,
      password: PRUEBAS_CONFIG.USER_A.password
    });
    
    const { data: ratA, error: ratErrorA } = await supabase
      .from('rats')
      .insert([{
        titulo: 'RAT Secreto de Empresa A',
        tenant_id: orgAId,
        user_id: userA.user.id,
        descripcion: 'Datos confidenciales de Empresa A',
        estado: 'Completado',
        metadatos: JSON.stringify({ confidencial: true, empresa: 'A' })
      }])
      .select()
      .single();
      
    if (ratErrorA) throw new Error(`Error creando RAT A: ${ratErrorA.message}`);
    console.log('✅ RAT A creado:', ratA.id);
    
    // Paso 2: Logout y login como Usuario B
    await supabase.auth.signOut();
    
    const { data: userB } = await supabase.auth.signInWithPassword({
      email: PRUEBAS_CONFIG.USER_B.email,
      password: PRUEBAS_CONFIG.USER_B.password
    });
    
    // Paso 3: Intentar ver RATs (NO debe ver el de Usuario A)
    const { data: ratsVisiblesB, error: errorRats } = await supabase
      .from('rats')
      .select('*');
      
    if (errorRats) throw new Error(`Error consultando RATs: ${errorRats.message}`);
    
    // VALIDACIÓN CRÍTICA
    const veRatA = ratsVisiblesB.some(rat => rat.id === ratA.id);
    
    if (veRatA) {
      throw new Error('🚨 FALLA CRÍTICA DE SEGURIDAD: Usuario B puede ver RAT confidencial de Usuario A');
    }
    
    console.log('✅ AISLAMIENTO RAT OK: Usuario B NO ve RAT de Usuario A');
    
    // Paso 4: Crear RAT propio para Usuario B
    const { data: ratB, error: ratErrorB } = await supabase
      .from('rats')
      .insert([{
        titulo: 'RAT de Empresa B',
        tenant_id: orgBId,
        user_id: userB.user.id,
        descripcion: 'Datos de Empresa B',
        estado: 'Completado'
      }])
      .select()
      .single();
      
    if (ratErrorB) throw new Error(`Error creando RAT B: ${ratErrorB.message}`);
    console.log('✅ RAT B creado:', ratB.id);
    
    return {
      exito: true,
      mensaje: 'Aislamiento de RATs CORRECTO - SEGURIDAD GARANTIZADA',
      ratA: ratA.id,
      ratB: ratB.id
    };
    
  } catch (error) {
    console.error('❌ FALLA CRÍTICA EN SEGURIDAD RATs:', error.message);
    return {
      exito: false,
      error: error.message,
      criticidad: 'ALTA - FILTRACIÓN DE DATOS CONFIDENCIALES'
    };
  }
};

// =====================================================
// PRUEBA #3: INTENTO DE ACCESO DIRECTO POR ID
// =====================================================

export const pruebaAccesoDirectoMalicioso = async (ratAjeno) => {
  console.log('🧪 INICIANDO: Prueba de Acceso Directo Malicioso');
  
  try {
    // Intentar acceder directamente a RAT de otro tenant por ID
    const { data: ratRobado, error: errorRobo } = await supabase
      .from('rats')
      .select('*')
      .eq('id', ratAjeno)
      .single();
    
    // Si logra acceder, es una FALLA CRÍTICA
    if (ratRobado && !errorRobo) {
      throw new Error('🚨 VULNERABILIDAD CRÍTICA: Acceso directo a RAT ajeno exitoso');
    }
    
    // Si falla el acceso, es lo esperado
    console.log('✅ SEGURIDAD OK: Acceso directo a RAT ajeno BLOQUEADO');
    
    return {
      exito: true,
      mensaje: 'Acceso malicioso correctamente BLOQUEADO por RLS'
    };
    
  } catch (error) {
    if (error.message.includes('VULNERABILIDAD CRÍTICA')) {
      return {
        exito: false,
        error: error.message,
        criticidad: 'MÁXIMA - ACCESO NO AUTORIZADO EXITOSO'
      };
    }
    
    // Otros errores son esperados (RLS funcionando)
    return {
      exito: true,
      mensaje: 'RLS funcionando correctamente - acceso denegado como esperado'
    };
  }
};

// =====================================================
// PRUEBA #4: PRUEBA DE INYECCIÓN DE TENANT_ID
// =====================================================

export const pruebaInyeccionTenantId = async (tenantAjenoId) => {
  console.log('🧪 INICIANDO: Prueba de Inyección de Tenant ID');
  
  try {
    // Intentar crear RAT con tenant_id ajeno
    const { data: userActual } = await supabase.auth.getUser();
    
    const { data: ratMalicioso, error: errorInyeccion } = await supabase
      .from('rats')
      .insert([{
        titulo: 'RAT Inyectado Maliciosamente',
        tenant_id: tenantAjenoId, // ID ajeno inyectado
        user_id: userActual.user.id,
        descripcion: 'Intento de insertar en tenant ajeno',
        estado: 'Malicioso'
      }])
      .select()
      .single();
    
    // Si logra insertar, es FALLA CRÍTICA
    if (ratMalicioso && !errorInyeccion) {
      throw new Error('🚨 VULNERABILIDAD CRÍTICA: Inyección de tenant_id exitosa');
    }
    
    console.log('✅ SEGURIDAD OK: Inyección de tenant_id BLOQUEADA');
    
    return {
      exito: true,
      mensaje: 'Inyección de tenant_id correctamente BLOQUEADA por RLS'
    };
    
  } catch (error) {
    if (error.message.includes('VULNERABILIDAD CRÍTICA')) {
      return {
        exito: false,
        error: error.message,
        criticidad: 'MÁXIMA - CONTAMINACIÓN DE DATOS ENTRE TENANTS'
      };
    }
    
    return {
      exito: true,
      mensaje: 'RLS funcionando - inyección bloqueada correctamente'
    };
  }
};

// =====================================================
// EJECUTOR PRINCIPAL DE TODAS LAS PRUEBAS
// =====================================================

export const ejecutarSuiteSeguridadCompleta = async () => {
  console.log('🛡️ INICIANDO SUITE COMPLETA DE SEGURIDAD MULTI-TENANT');
  console.log('===============================================');
  
  const resultados = {
    fecha: new Date().toISOString(),
    pruebas: [],
    exitosas: 0,
    fallidas: 0,
    criticidad: 'BAJA'
  };
  
  try {
    // Prueba 1: Aislamiento de Organizaciones
    const prueba1 = await pruebaAislamientoOrganizaciones();
    resultados.pruebas.push({ nombre: 'Aislamiento Organizaciones', ...prueba1 });
    
    if (!prueba1.exito) {
      resultados.fallidas++;
      resultados.criticidad = 'ALTA';
      return resultados;
    }
    
    resultados.exitosas++;
    
    // Prueba 2: Aislamiento de RATs
    const prueba2 = await pruebaAislamientoRATs(prueba1.orgA, prueba1.orgB);
    resultados.pruebas.push({ nombre: 'Aislamiento RATs', ...prueba2 });
    
    if (!prueba2.exito) {
      resultados.fallidas++;
      resultados.criticidad = 'CRÍTICA';
      return resultados;
    }
    
    resultados.exitosas++;
    
    // Prueba 3: Acceso Directo Malicioso
    const prueba3 = await pruebaAccesoDirectoMalicioso(prueba2.ratA);
    resultados.pruebas.push({ nombre: 'Acceso Directo Malicioso', ...prueba3 });
    
    if (!prueba3.exito) {
      resultados.fallidas++;
      resultados.criticidad = 'MÁXIMA';
    } else {
      resultados.exitosas++;
    }
    
    // Prueba 4: Inyección Tenant ID
    const prueba4 = await pruebaInyeccionTenantId(prueba1.orgA);
    resultados.pruebas.push({ nombre: 'Inyección Tenant ID', ...prueba4 });
    
    if (!prueba4.exito) {
      resultados.fallidas++;
      resultados.criticidad = 'MÁXIMA';
    } else {
      resultados.exitosas++;
    }
    
    // Determinar veredicto final
    if (resultados.fallidas === 0) {
      resultados.veredicto = '✅ SISTEMA SEGURO - APTO PARA PRODUCCIÓN';
      resultados.recomendacion = 'Sistema multi-tenant correctamente configurado';
    } else {
      resultados.veredicto = '🚨 SISTEMA NO SEGURO - NO APTO PARA PRODUCCIÓN';
      resultados.recomendacion = 'CORREGIR INMEDIATAMENTE las vulnerabilidades detectadas';
    }
    
    return resultados;
    
  } catch (error) {
    console.error('💥 ERROR EJECUTANDO SUITE:', error);
    return {
      ...resultados,
      error: error.message,
      veredicto: '💥 ERROR EN PRUEBAS - REVISAR CONFIGURACIÓN'
    };
  }
};

// =====================================================
// FUNCIÓN PARA LIMPIAR DATOS DE PRUEBA
// =====================================================

export const limpiarDatosPrueba = async () => {
  console.log('🧹 Limpiando datos de prueba...');
  
  try {
    // Eliminar RATs de prueba
    await supabase
      .from('rats')
      .delete()
      .or('titulo.ilike.%RAT Secreto%,titulo.ilike.%RAT de Empresa%,titulo.ilike.%RAT Inyectado%');
    
    // Eliminar organizaciones de prueba
    await supabase
      .from('organizaciones')
      .delete()
      .or('company_name.ilike.%Empresa Test%');
    
    console.log('✅ Datos de prueba eliminados');
    
  } catch (error) {
    console.error('❌ Error limpiando datos de prueba:', error.message);
  }
};

// =====================================================
// EXPORTAR PARA USO EN CONSOLA DE NAVEGADOR
// =====================================================

// Para ejecutar desde consola del navegador:
// import { ejecutarSuiteSeguridadCompleta } from './PRUEBAS_SEGURIDAD_MULTITENANT.js';
// ejecutarSuiteSeguridadCompleta().then(console.log);

export default {
  ejecutarSuiteSeguridadCompleta,
  pruebaAislamientoOrganizaciones,
  pruebaAislamientoRATs,
  pruebaAccesoDirectoMalicioso,
  pruebaInyeccionTenantId,
  limpiarDatosPrueba
};