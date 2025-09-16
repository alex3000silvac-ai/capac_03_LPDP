/**
 * 🚀 HOOK UNIVERSAL PARA MODO DEMO
 *
 * Reemplaza automáticamente todas las llamadas a Supabase
 * con datos demo para funcionalidad completa sin base de datos
 */

import { useEffect, useState } from 'react';
import DemoService from '../services/demoService';

// Mock global de Supabase para interceptar todas las llamadas
const createSupabaseMock = () => {
  return {
    from: (table) => ({
      select: (columns = '*') => ({
        eq: (column, value) => ({
          limit: (count) => ({
            single: () => handleDemoQuery(table, 'select', { columns, eq: { column, value }, single: true }),
            order: (column, options) => handleDemoQuery(table, 'select', { columns, eq: { column, value }, order: { column, options } })
          }),
          order: (column, options) => ({
            limit: (count) => handleDemoQuery(table, 'select', { columns, eq: { column, value }, order: { column, options }, limit: count })
          }),
          then: (resolve) => handleDemoQuery(table, 'select', { columns, eq: { column, value } }).then(resolve)
        }),
        limit: (count) => ({
          single: () => handleDemoQuery(table, 'select', { columns, single: true, limit: count }),
          then: (resolve) => handleDemoQuery(table, 'select', { columns, limit: count }).then(resolve)
        }),
        order: (column, options) => ({
          limit: (count) => handleDemoQuery(table, 'select', { columns, order: { column, options }, limit: count }),
          then: (resolve) => handleDemoQuery(table, 'select', { columns, order: { column, options } }).then(resolve)
        }),
        then: (resolve) => handleDemoQuery(table, 'select', { columns }).then(resolve)
      }),
      insert: (data) => ({
        select: () => ({
          single: () => handleDemoQuery(table, 'insert', { data, select: true, single: true })
        }),
        then: (resolve) => handleDemoQuery(table, 'insert', { data }).then(resolve)
      }),
      update: (data) => ({
        eq: (column, value) => ({
          then: (resolve) => handleDemoQuery(table, 'update', { data, eq: { column, value } }).then(resolve)
        })
      }),
      upsert: (data) => ({
        then: (resolve) => handleDemoQuery(table, 'upsert', { data }).then(resolve)
      }),
      delete: () => ({
        eq: (column, value) => ({
          then: (resolve) => handleDemoQuery(table, 'delete', { eq: { column, value } }).then(resolve)
        })
      })
    }),
    auth: {
      getSession: () => Promise.resolve({
        data: {
          session: {
            user: {
              id: 'demo-user-admin',
              email: 'admin@juridicadigital.cl'
            }
          }
        }
      }),
      onAuthStateChange: (callback) => {
        // Simular autenticación exitosa
        setTimeout(() => {
          callback('SIGNED_IN', {
            user: {
              id: 'demo-user-admin',
              email: 'admin@juridicadigital.cl'
            }
          });
        }, 100);
        return { data: { subscription: { unsubscribe: () => {} } } };
      },
      signUp: (credentials) => Promise.resolve({
        data: { user: { id: 'demo-user', email: credentials.email } },
        error: null
      }),
      signIn: (credentials) => Promise.resolve({
        data: { user: { id: 'demo-user', email: credentials.email } },
        error: null
      }),
      signOut: () => Promise.resolve({ error: null })
    }
  };
};

// Manejador inteligente de consultas demo
const handleDemoQuery = async (table, operation, params = {}) => {
  console.log(`🚀 [DEMO] ${operation.toUpperCase()} en tabla: ${table}`, params);

  try {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));

    let data = [];
    let error = null;

    switch (table) {
      case 'rat':
      case 'mapeo_datos_rat':
        const ratsResult = await DemoService.getRATs();
        data = ratsResult.success ? ratsResult.data : [];
        break;

      case 'organizaciones':
        const empresaResult = await DemoService.getEmpresa();
        data = empresaResult.success ? [empresaResult.data] : [];
        break;

      case 'usuarios':
        const usuariosResult = await DemoService.getUsuarios();
        data = usuariosResult.success ? usuariosResult.data : [];
        break;

      case 'eipd':
        const eipdsResult = await DemoService.getEIPDs();
        data = eipdsResult.success ? eipdsResult.data : [];
        break;

      case 'proveedores':
        const proveedoresResult = await DemoService.getProveedores();
        data = proveedoresResult.success ? proveedoresResult.data : [];
        break;

      case 'notificaciones':
        const notifResult = await DemoService.getNotificaciones();
        data = notifResult.success ? notifResult.data : [];
        break;

      default:
        // Tabla desconocida, retornar array vacío
        console.log(`⚠️ [DEMO] Tabla no reconocida: ${table}`);
        data = [];
    }

    // Aplicar filtros básicos si están especificados
    if (params.eq && data.length > 0) {
      data = data.filter(item =>
        item[params.eq.column] === params.eq.value
      );
    }

    // Aplicar límite
    if (params.limit && data.length > params.limit) {
      data = data.slice(0, params.limit);
    }

    // Para operaciones de inserción/actualización, simular éxito
    if (operation === 'insert' || operation === 'update' || operation === 'upsert') {
      data = params.data;
      if (operation === 'insert') {
        data = { ...params.data, id: `demo-${table}-${Date.now()}` };
      }
    }

    // Para eliminación, simular éxito
    if (operation === 'delete') {
      data = { success: true };
    }

    // Retornar en formato single si se solicita
    if (params.single && data.length > 0) {
      data = data[0];
    }

    return { data, error };
  } catch (err) {
    console.error(`❌ [DEMO] Error simulado en ${table}:`, err);
    return { data: null, error: { message: 'Error simulado en modo demo' } };
  }
};

// Hook principal
export const useDemoMode = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    console.log('🚀 Inicializando MODO DEMO UNIVERSAL');

    // Reemplazar Supabase globalmente
    if (typeof window !== 'undefined') {
      window.supabase = createSupabaseMock();
    }

    setIsReady(true);
  }, []);

  return {
    isReady,
    supabase: createSupabaseMock(),
    DemoService
  };
};

export default useDemoMode;