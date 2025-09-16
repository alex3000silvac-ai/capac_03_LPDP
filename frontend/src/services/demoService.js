/**
 * 🚀 SERVICIO DEMO CENTRALIZADO PARA SISTEMA LPDP
 *
 * Proporciona datos de ejemplo para todas las funcionalidades
 * sin necesidad de conexión a Supabase
 */

export const DEMO_ENABLED = true;

// Datos demo de empresa
export const DEMO_EMPRESA = {
  id: 'demo-empresa-001',
  razon_social: 'Empresa Jurídica Digital Demo S.A.',
  rut: '76.123.456-7',
  direccion_empresa: 'Av. Providencia 123, Oficina 456, Providencia, Santiago',
  email_empresa: 'contacto@juridicadigital.cl',
  telefono_empresa: '+56 2 2345 6789',
  giro_comercial: 'Servicios de tecnología jurídica y consultoría LPDP',
  sector_economico: 'Tecnología y Servicios Profesionales',

  // Datos del DPO
  dpo_nombre: 'María José González Rodríguez',
  dpo_email: 'dpo@juridicadigital.cl',
  dpo_telefono: '+56 9 8765 4321',
  dpo_cargo: 'Delegada de Protección de Datos',

  // Configuración
  tenant_id: 'demo-tenant',
  is_active: true,
  created_at: new Date('2024-01-15').toISOString(),
  updated_at: new Date().toISOString()
};

// Datos demo de usuarios
export const DEMO_USUARIOS = [
  {
    id: 'demo-user-admin',
    email: 'admin@juridicadigital.cl',
    nombre: 'Administrador Sistema',
    rol: 'admin',
    is_active: true,
    tenant_id: 'demo-tenant',
    last_login: new Date().toISOString()
  },
  {
    id: 'demo-user-dpo',
    email: 'dpo@juridicadigital.cl',
    nombre: 'María José González',
    rol: 'dpo',
    is_active: true,
    tenant_id: 'demo-tenant',
    last_login: new Date(Date.now() - 3600000).toISOString()
  }
];

// Datos demo de RATs completados
export const DEMO_RATS = [
  {
    id: 'demo-rat-001',
    nombre_actividad: 'Sistema de Gestión de Clientes CRM',
    razon_social: DEMO_EMPRESA.razon_social,
    estado: 'CERTIFICADO',
    finalidad: 'Gestión y seguimiento de relaciones comerciales con clientes',
    base_legal: 'Ejecución de contrato',
    riesgo_calculado: 'MEDIO',
    puntuacion_riesgo: 65,
    created_at: new Date('2024-02-01').toISOString(),
    completed_at: new Date('2024-02-15').toISOString(),
    tenant_id: 'demo-tenant'
  },
  {
    id: 'demo-rat-002',
    nombre_actividad: 'Plataforma de Recursos Humanos',
    razon_social: DEMO_EMPRESA.razon_social,
    estado: 'CERTIFICADO',
    finalidad: 'Administración de personal y nóminas',
    base_legal: 'Obligación legal',
    riesgo_calculado: 'ALTO',
    puntuacion_riesgo: 85,
    created_at: new Date('2024-03-01').toISOString(),
    completed_at: new Date('2024-03-20').toISOString(),
    tenant_id: 'demo-tenant'
  }
];

// Datos demo de EIPDs
export const DEMO_EIPDS = [
  {
    id: 'demo-eipd-001',
    nombre_proyecto: 'Implementación Sistema IA Predictivo',
    descripcion: 'Sistema de inteligencia artificial para predicción de comportamiento de usuarios',
    estado: 'EN_REVISION',
    nivel_riesgo: 'ALTO',
    fecha_inicio: new Date('2024-04-01').toISOString(),
    responsable: 'Carlos Mendoza - CTO',
    tenant_id: 'demo-tenant'
  }
];

// Datos demo de proveedores
export const DEMO_PROVEEDORES = [
  {
    id: 'demo-prov-001',
    nombre: 'CloudTech Solutions S.A.',
    tipo: 'ENCARGADO',
    servicios: 'Hosting y almacenamiento en la nube',
    ubicacion: 'Chile',
    certificaciones: ['ISO 27001', 'SOC 2'],
    estado: 'ACTIVO',
    tenant_id: 'demo-tenant'
  },
  {
    id: 'demo-prov-002',
    nombre: 'DataAnalytics Corp',
    tipo: 'SUBENCARGADO',
    servicios: 'Análisis de datos y reportería',
    ubicacion: 'Estados Unidos',
    certificaciones: ['Privacy Shield', 'GDPR Compliance'],
    estado: 'ACTIVO',
    tenant_id: 'demo-tenant'
  }
];

// Datos demo de métricas de cumplimiento
export const DEMO_METRICAS = {
  cumplimiento_general: 87,
  rats_completados: 12,
  eipds_pendientes: 3,
  incidentes_mes: 0,
  capacitaciones_pendientes: 2,
  politicas_actualizadas: 8,
  ultima_auditoria: new Date('2024-01-15').toISOString(),
  proxima_revision: new Date('2024-07-15').toISOString()
};

// Datos demo de notificaciones
export const DEMO_NOTIFICACIONES = [
  {
    id: 'demo-notif-001',
    tipo: 'INFO',
    titulo: 'Nueva regulación LPDP publicada',
    mensaje: 'Se ha publicado una actualización menor al reglamento de la Ley 21.719',
    fecha: new Date().toISOString(),
    leida: false
  },
  {
    id: 'demo-notif-002',
    tipo: 'WARNING',
    titulo: 'Revisión de políticas pendiente',
    mensaje: 'Es necesario revisar y actualizar las políticas de privacidad',
    fecha: new Date(Date.now() - 86400000).toISOString(),
    leida: false
  },
  {
    id: 'demo-notif-003',
    tipo: 'SUCCESS',
    titulo: 'RAT completado exitosamente',
    mensaje: 'El RAT del sistema CRM ha sido certificado',
    fecha: new Date(Date.now() - 172800000).toISOString(),
    leida: true
  }
];

// Simulador de respuestas de API
export class DemoService {
  static async delay(ms = 500) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static async getEmpresa() {
    if (!DEMO_ENABLED) throw new Error('Demo mode disabled');
    await this.delay();
    return { success: true, data: DEMO_EMPRESA };
  }

  static async getUsuarios() {
    if (!DEMO_ENABLED) throw new Error('Demo mode disabled');
    await this.delay();
    return { success: true, data: DEMO_USUARIOS };
  }

  static async getRATs() {
    if (!DEMO_ENABLED) throw new Error('Demo mode disabled');
    await this.delay();
    return { success: true, data: DEMO_RATS };
  }

  static async getEIPDs() {
    if (!DEMO_ENABLED) throw new Error('Demo mode disabled');
    await this.delay();
    return { success: true, data: DEMO_EIPDS };
  }

  static async getProveedores() {
    if (!DEMO_ENABLED) throw new Error('Demo mode disabled');
    await this.delay();
    return { success: true, data: DEMO_PROVEEDORES };
  }

  static async getMetricas() {
    if (!DEMO_ENABLED) throw new Error('Demo mode disabled');
    await this.delay();
    return { success: true, data: DEMO_METRICAS };
  }

  static async getNotificaciones() {
    if (!DEMO_ENABLED) throw new Error('Demo mode disabled');
    await this.delay();
    return { success: true, data: DEMO_NOTIFICACIONES };
  }

  static async saveData(data, tipo = 'general') {
    if (!DEMO_ENABLED) throw new Error('Demo mode disabled');
    await this.delay();
    console.log(`🚀 [DEMO] Guardando ${tipo}:`, data);
    return { success: true, data: { ...data, id: `demo-${tipo}-${Date.now()}` } };
  }

  static async deleteData(id, tipo = 'general') {
    if (!DEMO_ENABLED) throw new Error('Demo mode disabled');
    await this.delay();
    console.log(`🚀 [DEMO] Eliminando ${tipo} con ID:`, id);
    return { success: true };
  }
}

export default DemoService;