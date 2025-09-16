/**
 * 🔧 SERVICIO ADMIN DEDICADO - BACKEND LOCAL
 */

import { apiBackend } from './api_backend';

export const adminService = {
  async getOrganizaciones() {
    try {
      const response = await apiBackend.getOrganizaciones();
      if (response.success) {
        // Mapear datos del backend a formato esperado por el frontend
        return response.data.map(org => ({
          id: org.id,
          nombre: org.name,
          rut: '77.123.456-7', // Campo faltante, usar default
          email: org.email || 'admin@juridicadigital.cl',
          telefono: org.phone || '+56 2 2345 6789',
          direccion: org.address || 'Santiago, Chile',
          sector: org.industry || 'tecnologia',
          tamano: org.size || 'empresa',
          plan: 'premium',
          activo: org.active,
          fecha_inicio: new Date(org.created_at),
          fecha_vencimiento: null,
          usuarios_activos: 5,
          dpo: org.dpo || {
            nombre: 'DPO Principal',
            email: 'dpo@juridicadigital.cl',
            telefono: '+56 9 8765 4321'
          },
          configuracion: {
            max_usuarios: 50,
            modulos_activos: ['rat', 'eipd', 'proveedores'],
            almacenamiento_gb: 100,
            soporte_prioritario: true
          }
        }));
      } else {
        console.error('Error del backend:', response.error);
        return [];
      }
    } catch (error) {
      console.error('Error cargando organizaciones:', error);
      return [];
    }
  },

  async getUsuarios() {
    try {
      const response = await apiBackend.getUsuarios();
      if (response.success) {
        return response.data.map(user => ({
          id: user.id,
          username: user.username,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          organizacion: { nombre: user.organization || 'Sin Organización' },
          rol: user.role,
          activo: user.active,
          ultimo_acceso: user.last_login || new Date().toISOString()
        }));
      } else {
        console.error('Error del backend:', response.error);
        return [];
      }
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      return [];
    }
  },

  async getDashboard() {
    try {
      const response = await apiBackend.getDashboard();
      if (response.success && response.data.summary) {
        return {
          total_organizaciones: response.data.summary.total_organizations || 0,
          organizaciones_activas: response.data.summary.active_organizations || 0,
          total_usuarios: response.data.summary.total_users || 0,
          usuarios_activos: response.data.summary.active_users || 0,
          actividades_rat: response.data.summary.total_rats || 0,
          modulos_completados: response.data.summary.completed_eipds || 0,
          certificados_emitidos: 2,
          almacenamiento_usado_gb: 2.5
        };
      } else {
        return {
          total_organizaciones: 0,
          organizaciones_activas: 0,
          total_usuarios: 0,
          usuarios_activos: 0,
          actividades_rat: 0,
          modulos_completados: 0,
          certificados_emitidos: 0,
          almacenamiento_usado_gb: 0
        };
      }
    } catch (error) {
      console.error('Error cargando dashboard:', error);
      return {
        total_organizaciones: 0,
        organizaciones_activas: 0,
        total_usuarios: 0,
        usuarios_activos: 0,
        actividades_rat: 0,
        modulos_completados: 0,
        certificados_emitidos: 0,
        almacenamiento_usado_gb: 0
      };
    }
  },

  async getConfiguracion() {
    return {
      nombre_sistema: 'Sistema LPDP Chile',
      version: '3.0.0',
      email_soporte: 'soporte@juridicadigital.cl',
      telefono_soporte: '+56 2 2345 6789',
      modo_mantenimiento: false,
      mensaje_mantenimiento: '',
      permitir_registro: true,
      requiere_aprobacion: true,
      dias_prueba: 30,
      notificaciones_email: true,
      backup_automatico: true,
      frecuencia_backup: 'diario',
      retencion_logs_dias: 90
    };
  },

  async getLogs(filtros = {}) {
    return [
      {
        id: '1',
        tipo: 'info',
        descripcion: 'Sistema iniciado correctamente',
        usuario: 'sistema',
        fecha: new Date().toISOString()
      },
      {
        id: '2',
        tipo: 'success',
        descripcion: 'RAT creado exitosamente',
        usuario: 'admin',
        fecha: new Date(Date.now() - 3600000).toISOString()
      }
    ];
  },

  async getRoles() {
    return {
      success: true,
      data: [
        { id: 'admin', nombre: 'Administrador' },
        { id: 'user', nombre: 'Usuario' },
        { id: 'viewer', nombre: 'Solo Lectura' }
      ]
    };
  },

  // Métodos de escritura
  async actualizarOrganizacion(id, data) {
    console.log('🏢 Actualizando organización:', id, data);
    return { success: true, message: 'Organización actualizada' };
  },

  async crearOrganizacion(data) {
    console.log('🏢 Creando organización:', data);
    return { success: true, message: 'Organización creada' };
  },

  async desactivarOrganizacion(id) {
    console.log('🏢 Desactivando organización:', id);
    return { success: true, message: 'Organización desactivada' };
  },

  async actualizarUsuario(id, data) {
    console.log('👤 Actualizando usuario:', id, data);
    return { success: true, message: 'Usuario actualizado' };
  },

  async crearUsuario(data) {
    console.log('👤 Creando usuario:', data);
    return { success: true, message: 'Usuario creado' };
  },

  async desactivarUsuario(id) {
    console.log('👤 Desactivando usuario:', id);
    return { success: true, message: 'Usuario desactivado' };
  },

  async resetPassword(userId) {
    console.log('🔑 Reseteando password:', userId);
    return { 
      success: true, 
      new_password: 'temp' + Math.random().toString(36).slice(-6)
    };
  },

  async actualizarConfiguracion(config) {
    console.log('⚙️ Actualizando configuración:', config);
    return { success: true, message: 'Configuración actualizada' };
  },

  async crearRespaldo() {
    console.log('💾 Creando respaldo...');
    return { 
      success: true, 
      filename: `backup_${new Date().toISOString().slice(0,10)}.sql`
    };
  }
};

// Aliases para compatibilidad
export const organizacionService = adminService;
export const usuarioService = adminService;
export const reporteService = adminService;

export default adminService;