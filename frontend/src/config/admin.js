// Configuración del sistema de administración LPDP

export const ADMIN_CONFIG = {
  // Configuración de paginación
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [5, 10, 25, 50, 100],
    maxPageSize: 100
  },

  // Configuración de filtros
  filters: {
    dateFormat: 'YYYY-MM-DD',
    timeFormat: 'HH:mm:ss',
    defaultDateRange: 30 // días
  },

  // Configuración de exportación
  export: {
    formats: ['pdf', 'excel', 'csv'],
    defaultFormat: 'pdf',
    maxFileSize: 10 * 1024 * 1024 // 10MB
  },

  // Configuración de auditoría
  audit: {
    retentionDays: 365,
    maxLogSize: 1000,
    severityLevels: ['low', 'medium', 'high'],
    actionTypes: [
      'create', 'update', 'delete', 'login', 'logout', 'access',
      'export', 'import', 'backup', 'restore', 'configure'
    ],
    modules: [
      'users', 'tenants', 'dpia', 'brechas', 'capacitacion',
      'inventario', 'auditoria', 'reportes', 'system'
    ]
  },

  // Configuración de reportes
  reports: {
    types: [
      {
        id: 'compliance_summary',
        name: 'Resumen de Cumplimiento',
        description: 'Vista general del cumplimiento de todas las empresas',
        category: 'Cumplimiento',
        frequency: 'monthly',
        requiredPermissions: ['reports.read', 'compliance.read']
      },
      {
        id: 'user_activity',
        name: 'Actividad de Usuarios',
        description: 'Análisis de actividad y uso del sistema',
        category: 'Usuarios',
        frequency: 'weekly',
        requiredPermissions: ['reports.read', 'users.read']
      },
      {
        id: 'security_events',
        name: 'Eventos de Seguridad',
        description: 'Reporte de eventos de seguridad y accesos',
        category: 'Seguridad',
        frequency: 'daily',
        requiredPermissions: ['reports.read', 'security.read']
      },
      {
        id: 'tenant_performance',
        name: 'Rendimiento por Empresa',
        description: 'Métricas de rendimiento por empresa',
        category: 'Empresas',
        frequency: 'monthly',
        requiredPermissions: ['reports.read', 'tenants.read']
      },
      {
        id: 'dpia_status',
        name: 'Estado de DPIAs',
        description: 'Estado de las evaluaciones de impacto',
        category: 'DPIAs',
        frequency: 'weekly',
        requiredPermissions: ['reports.read', 'dpia.read']
      },
      {
        id: 'breach_analysis',
        name: 'Análisis de Brechas',
        description: 'Análisis de brechas de seguridad reportadas',
        category: 'Brechas',
        frequency: 'weekly',
        requiredPermissions: ['reports.read', 'breaches.read']
      },
      {
        id: 'training_progress',
        name: 'Progreso de Capacitación',
        description: 'Estado de la capacitación de usuarios',
        category: 'Capacitación',
        frequency: 'monthly',
        requiredPermissions: ['reports.read', 'training.read']
      },
      {
        id: 'inventory_status',
        name: 'Estado del Inventario',
        description: 'Estado del inventario de datos personales',
        category: 'Inventario',
        frequency: 'monthly',
        requiredPermissions: ['reports.read', 'inventory.read']
      }
    ]
  },

  // Configuración de empresas (tenants)
  tenants: {
    subscriptionPlans: [
      {
        id: 'basic',
        name: 'Básico',
        description: 'Plan básico para pequeñas empresas',
        maxUsers: 10,
        features: ['dpia', 'brechas', 'capacitacion', 'inventario'],
        price: 0,
        currency: 'CLP'
      },
      {
        id: 'professional',
        name: 'Profesional',
        description: 'Plan profesional para empresas medianas',
        maxUsers: 50,
        features: ['dpia', 'brechas', 'capacitacion', 'inventario', 'auditoria'],
        price: 50000,
        currency: 'CLP'
      },
      {
        id: 'enterprise',
        name: 'Empresarial',
        description: 'Plan empresarial para grandes organizaciones',
        maxUsers: 200,
        features: ['dpia', 'brechas', 'capacitacion', 'inventario', 'auditoria', 'reportes'],
        price: 150000,
        currency: 'CLP'
      },
      {
        id: 'custom',
        name: 'Personalizado',
        description: 'Plan personalizado según necesidades específicas',
        maxUsers: 1000,
        features: ['dpia', 'brechas', 'capacitacion', 'inventario', 'auditoria', 'reportes', 'api'],
        price: 300000,
        currency: 'CLP'
      }
    ],
    industries: [
      'Tecnología',
      'Salud',
      'Finanzas',
      'Educación',
      'Manufactura',
      'Retail',
      'Servicios',
      'Construcción',
      'Transporte',
      'Energía',
      'Agricultura',
      'Minería',
      'Turismo',
      'Medios',
      'Otros'
    ]
  },

  // Configuración de usuarios
  users: {
    roles: [
      {
        id: 'super_admin',
        name: 'Super Administrador',
        description: 'Acceso completo al sistema',
        permissions: ['*'],
        isSystem: true
      },
      {
        id: 'admin',
        name: 'Administrador',
        description: 'Administrador de empresa',
        permissions: [
          'users.manage', 'users.read', 'users.create', 'users.update', 'users.delete',
          'dpia.manage', 'dpia.read', 'dpia.create', 'dpia.update', 'dpia.delete',
          'breaches.manage', 'breaches.read', 'breaches.create', 'breaches.update',
          'training.manage', 'training.read', 'training.create', 'training.update',
          'inventory.manage', 'inventory.read', 'inventory.create', 'inventory.update',
          'reports.read', 'audit.read'
        ],
        isSystem: true
      },
      {
        id: 'dpo',
        name: 'Data Protection Officer',
        description: 'Responsable de protección de datos',
        permissions: [
          'dpia.manage', 'dpia.read', 'dpia.create', 'dpia.update',
          'breaches.manage', 'breaches.read', 'breaches.create', 'breaches.update',
          'training.read', 'training.create',
          'inventory.read', 'inventory.create', 'inventory.update',
          'reports.read', 'audit.read'
        ],
        isSystem: false
      },
      {
        id: 'user',
        name: 'Usuario',
        description: 'Usuario estándar del sistema',
        permissions: [
          'dpia.read', 'dpia.create',
          'breaches.read', 'breaches.create',
          'training.read', 'training.create',
          'inventory.read', 'inventory.create',
          'reports.read'
        ],
        isSystem: false
      }
    ],
    defaultPermissions: [
      'profile.read', 'profile.update',
      'dashboard.read'
    ]
  },

  // Configuración de seguridad
  security: {
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      maxAge: 90, // días
      preventReuse: 5 // últimas contraseñas
    },
    sessionPolicy: {
      maxDuration: 8, // horas
      idleTimeout: 30, // minutos
      maxConcurrentSessions: 3
    },
    mfa: {
      enabled: true,
      methods: ['totp', 'sms', 'email'],
      requiredForAdmin: true
    }
  },

  // Configuración de notificaciones
  notifications: {
    types: [
      'security_alert',
      'compliance_warning',
      'system_maintenance',
      'user_activity',
      'data_breach',
      'training_reminder'
    ],
    channels: ['email', 'sms', 'push', 'in_app'],
    defaultChannels: ['email', 'in_app']
  },

  // Configuración del sistema
  system: {
    name: 'Sistema LPDP',
    version: '1.0.0',
    description: 'Sistema integral de cumplimiento de la Ley de Protección de Datos Personales de Chile',
    supportEmail: 'soporte@lpdp.cl',
    supportPhone: '+56 2 2345 6789',
    documentationUrl: 'https://docs.lpdp.cl',
    apiVersion: 'v1',
    environment: process.env.NODE_ENV || 'development'
  }
};

// Configuración de endpoints de la API
export const ADMIN_API_ENDPOINTS = {
  // Dashboard
  dashboard: {
    stats: '/api/v1/admin/dashboard/stats',
    metrics: '/api/v1/admin/dashboard/metrics'
  },

  // Empresas
  tenants: {
    list: '/api/v1/admin/tenants',
    create: '/api/v1/admin/tenants/',
    get: (id) => `/api/v1/admin/tenants/${id}`,
    update: (id) => `/api/v1/admin/tenants/${id}`,
    delete: (id) => `/api/v1/admin/tenants/${id}`,
    stats: '/api/v1/admin/tenants/stats'
  },

  // Usuarios
  users: {
    list: '/api/v1/admin/users',
    create: '/api/v1/admin/users/',
    get: (id) => `/api/v1/admin/users/${id}`,
    update: (id) => `/api/v1/admin/users/${id}`,
    delete: (id) => `/api/v1/admin/users/${id}`,
    resetPassword: (id) => `/api/v1/admin/users/${id}/reset-password`,
    roles: '/api/v1/admin/users/roles'
  },

  // Auditoría
  audit: {
    logs: '/api/v1/admin/audit/logs',
    stats: '/api/v1/admin/audit/stats',
    export: '/api/v1/admin/audit/export'
  },

  // Reportes
  reports: {
    list: '/api/v1/admin/reports/list',
    generate: '/api/v1/admin/reports/generate',
    download: (id) => `/api/v1/admin/reports/${id}/download`,
    schedule: '/api/v1/admin/reports/schedule'
  }
};

// Configuración de permisos
export const ADMIN_PERMISSIONS = {
  // Permisos de usuarios
  USERS: {
    READ: 'users.read',
    CREATE: 'users.create',
    UPDATE: 'users.update',
    DELETE: 'users.delete',
    MANAGE: 'users.manage',
    RESET_PASSWORD: 'users.reset_password'
  },

  // Permisos de empresas
  TENANTS: {
    READ: 'tenants.read',
    CREATE: 'tenants.create',
    UPDATE: 'tenants.update',
    DELETE: 'tenants.delete',
    MANAGE: 'tenants.manage'
  },

  // Permisos de auditoría
  AUDIT: {
    READ: 'audit.read',
    EXPORT: 'audit.export',
    MANAGE: 'audit.manage'
  },

  // Permisos de reportes
  REPORTS: {
    READ: 'reports.read',
    GENERATE: 'reports.generate',
    SCHEDULE: 'reports.schedule',
    MANAGE: 'reports.manage'
  },

  // Permisos del sistema
  SYSTEM: {
    CONFIGURE: 'system.configure',
    MONITOR: 'system.monitor',
    MAINTAIN: 'system.maintain'
  }
};

// Configuración de validaciones
export const ADMIN_VALIDATIONS = {
  // Validaciones de usuarios
  user: {
    username: {
      minLength: 3,
      maxLength: 50,
      pattern: /^[a-zA-Z0-9_-]+$/
    },
    email: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    password: {
      minLength: 8,
      maxLength: 128
    }
  },

  // Validaciones de empresas
  tenant: {
    companyName: {
      minLength: 2,
      maxLength: 200
    },
    rut: {
      pattern: /^\d{1,2}\.\d{3}\.\d{3}[-][0-9kK]$/
    },
    email: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    }
  }
};

export default ADMIN_CONFIG;
