import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase PRODUCCIÓN
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://xvnfpkxbsmfhqcyvjwmz.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2bmZwa3hic21maHFjeXZqd216Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ3OTU5MDUsImV4cCI6MjA1MDM3MTkwNX0.hEUBw6tXs-_pAr2PUYjnAmiFsCFz9P42OUwTLqmeG_s';

// Cliente de Supabase para PRODUCCIÓN
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
  global: {
    headers: {
      'x-tenant-id': localStorage.getItem('tenant_id') || 'default'
    }
  }
});

// Función helper para operaciones con tenant
export const supabaseWithTenant = (tenantId) => {
  return {
    from: (table) => {
      const baseQuery = supabase.from(table);
      return {
        ...baseQuery,
        select: (columns = '*') => baseQuery.select(columns).eq('tenant_id', tenantId),
        insert: (data) => {
          const dataWithTenant = Array.isArray(data) 
            ? data.map(d => ({ ...d, tenant_id: tenantId }))
            : { ...data, tenant_id: tenantId };
          return baseQuery.insert(dataWithTenant);
        },
        update: (data) => baseQuery.update(data).eq('tenant_id', tenantId),
        upsert: (data) => {
          const dataWithTenant = Array.isArray(data)
            ? data.map(d => ({ ...d, tenant_id: tenantId }))
            : { ...data, tenant_id: tenantId };
          return baseQuery.upsert(dataWithTenant);
        },
        delete: () => baseQuery.delete().eq('tenant_id', tenantId)
      };
    }
  };
};

// Exportar cliente real de Supabase - NO MOCK
export default supabase;