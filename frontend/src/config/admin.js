// Configuración centralizada para el sistema de administración
export const ADMIN_CONFIG = {
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [5, 10, 25, 50, 100]
  },
  filters: {
    dateRange: {
      defaultDays: 30,
      maxDays: 365
    }
  },
  export: {
    csv: {
      encoding: 'utf-8',
      delimiter: ','
    }
  },
  audit: {
    logLevels: ['INFO', 'WARNING', 'ERROR', 'CRITICAL'],
    modules: ['AUTH', 'USERS', 'TENANTS', 'SYSTEM', 'SECURITY']
  },
  reports: {
    formats: ['PDF', 'Excel', 'CSV'],
    defaultFormat: 'PDF'
  },
  tenants: {
    plans: ['BASIC', 'PROFESSIONAL', 'ENTERPRISE'],
    industries: ['TECNOLOGIA', 'SALUD', 'FINANZAS', 'EDUCACION', 'GOBIERNO', 'OTROS']
  },
  users: {
    roles: ['USER', 'ADMIN', 'DPO', 'AUDITOR'],
    passwordMinLength: 8
  },
  security: {
    mfa: true,
    sessionTimeout: 3600,
    maxLoginAttempts: 5
  },
  notifications: {
    email: true,
    inApp: true,
    webhook: false
  },
  system: {
    autoBackup: true,
    monitoring: true,
    alerts: true
  }
};

// Endpoints de la API
export const ADMIN_API_ENDPOINTS = {
  dashboard: '/api/v1/admin/dashboard',
  tenants: '/api/v1/admin/tenants',
  users: '/api/v1/admin/users',
  audit: '/api/v1/admin/audit',
  reports: '/api/v1/admin/reports',
  system: '/api/v1/admin/system'
};

// Permisos del sistema
export const ADMIN_PERMISSIONS = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  TENANT_ADMIN: 'TENANT_ADMIN',
  USER_MANAGER: 'USER_MANAGER',
  AUDITOR: 'AUDITOR',
  REPORTS_VIEWER: 'REPORTS_VIEWER'
};

// Validaciones del cliente
export const ADMIN_VALIDATIONS = {
  user: {
    username: {
      minLength: 3,
      maxLength: 50,
      pattern: /^[a-zA-Z0-9_]+$/
    },
    email: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    password: {
      minLength: 8,
      requireSpecialChar: true,
      requireNumber: true,
      requireUppercase: true
    }
  },
  tenant: {
    name: {
      minLength: 2,
      maxLength: 100
    },
    maxUsers: {
      min: 1,
      max: 10000
    }
  }
};
