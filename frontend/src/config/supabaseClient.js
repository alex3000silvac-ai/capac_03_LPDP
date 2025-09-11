/**
 * ================================================================================
 * CLIENTE SUPABASE - SISTEMA LPDP MIGRADO
 * ================================================================================
 * Cliente completo de Supabase que reemplaza SQL Server
 * - Autenticación integrada con Supabase Auth
 * - API REST automática para todas las tablas
 * - RLS (Row Level Security) para multi-tenant
 * - Storage integrado para documentos
 * ================================================================================
 * - Supabase Cloud → SQL Server local (PASC\LPDP_Test)
 * - Configuración centralizada en database_config.py
 * - API compatible mantenida
 * ================================================================================
 */

// MIGRADO: Importar desde el nuevo cliente SQL Server
import { 
  supabase, 
  sqlServerClient,
  getCurrentTenant,
  getConnectivityStatus,
  sqlServerWithTenant 
} from './sqlServerClient';

console.log('⚠️ MIGRACIÓN: supabaseClient.js redirige a sqlServerClient.js');
console.log('🔄 Todas las conexiones ahora usan SQL Server PASC\\LPDP_Test');
console.log('📡 Configuración centralizada: database_config.py');

// MIGRADO: Exportar todas las funciones desde el nuevo cliente SQL Server
export { 
  supabase,           // Compatible con código existente 
  sqlServerClient,    // Nombre explícito del nuevo cliente
  getCurrentTenant,   // Función migrada
  getConnectivityStatus, // Función migrada  
  sqlServerWithTenant as supabaseWithTenant // Compatibilidad
};

// MIGRADO: Export por defecto compatible
export default supabase;

/**
 * NOTAS DE MIGRACIÓN:
 * 
 * ✅ COMPATIBILIDAD MANTENIDA:
 * - Todos los imports existentes siguen funcionando
 * - La API es idéntica (from, select, insert, etc.)
 * - Las funciones auxiliares están disponibles
 * 
 * 🔄 CAMBIOS INTERNOS:
 * - Conexiones van al backend FastAPI en lugar de Supabase
 * - El backend conecta a SQL Server PASC\LPDP_Test
 * - Configuración centralizada en database_config.py
 * 
 * 📝 USO:
 * const { data, error } = await supabase
 *   .from('usuarios')
 *   .select('*');
 * 
 * // Sigue funcionando igual, pero ahora usa SQL Server
 */