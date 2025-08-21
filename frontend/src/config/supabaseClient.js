import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://demo.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'demo-key';

// Cliente de Supabase para desarrollo
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 2,
    },
  },
});

// Cliente mock para desarrollo sin Supabase configurado
export const mockSupabase = {
  from: (table) => ({
    upsert: async (data) => {
      console.log(`Mock upsert to ${table}:`, data);
      return { 
        data: { ...data, id: 'mock-id-' + Date.now() }, 
        error: null 
      };
    },
    select: () => ({
      single: async () => {
        console.log(`Mock select from ${table}`);
        return { 
          data: { id: 'mock-id', ...{} }, 
          error: null 
        };
      }
    }),
    insert: async (data) => {
      console.log(`Mock insert to ${table}:`, data);
      return { 
        data: { ...data, id: 'mock-id-' + Date.now() }, 
        error: null 
      };
    }
  })
};

// Usar cliente mock si no hay configuración real
export default supabaseUrl.includes('demo') ? mockSupabase : supabase;