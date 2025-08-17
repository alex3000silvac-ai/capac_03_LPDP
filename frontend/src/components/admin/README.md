# 🚀 Sistema de Administración LPDP

## 📋 Descripción General

El **Sistema de Administración LPDP** es una plataforma integral para la gestión y administración del cumplimiento de la Ley de Protección de Datos Personales de Chile (Ley 21.719). Este sistema proporciona herramientas completas para administradores, empresas y usuarios finales.

## 🎯 Características Principales

### ✨ **Gestión Completa de Empresas (Tenants)**
- ✅ **Creación y configuración** de empresas
- ✅ **Planes de suscripción** personalizables
- ✅ **Gestión de usuarios** por empresa
- ✅ **Configuración de módulos** habilitados
- ✅ **Monitoreo de uso** y límites

### 👥 **Gestión Avanzada de Usuarios**
- ✅ **Creación y edición** de usuarios
- ✅ **Sistema de roles** granulares
- ✅ **Gestión de permisos** por módulo
- ✅ **Reset de contraseñas** automático
- ✅ **Auditoría de accesos** completa

### 📊 **Dashboard de Administración**
- ✅ **Métricas en tiempo real** del sistema
- ✅ **Estadísticas de cumplimiento** por empresa
- ✅ **Monitoreo de salud** del sistema
- ✅ **Alertas y notificaciones** automáticas
- ✅ **Vista general** de todas las empresas

### 🔍 **Sistema de Auditoría Completo**
- ✅ **Logs detallados** de todas las acciones
- ✅ **Filtros avanzados** por tipo, usuario, empresa
- ✅ **Exportación** de logs en múltiples formatos
- ✅ **Análisis de seguridad** y eventos
- ✅ **Retención configurable** de datos

### 📈 **Reportes Avanzados**
- ✅ **8 tipos de reportes** predefinidos
- ✅ **Generación automática** programable
- ✅ **Múltiples formatos** (PDF, Excel, CSV)
- ✅ **Filtros personalizables** por fecha y empresa
- ✅ **Vista previa** antes de la generación

## 🏗️ Arquitectura del Sistema

### **Componentes Principales**

```
AdminPanel (Componente Principal)
├── AdminDashboard (Dashboard de métricas)
├── TenantManagement (Gestión de empresas)
├── UserManagement (Gestión de usuarios)
├── SystemAudit (Auditoría del sistema)
├── SystemReports (Generación de reportes)
└── SecurityPanel (Panel de seguridad - En desarrollo)
```

### **Flujo de Datos**

```
Frontend (React + Material-UI)
    ↓
API Gateway (FastAPI)
    ↓
Backend Services
    ├── User Service
    ├── Tenant Service
    ├── Audit Service
    ├── Report Service
    └── Security Service
    ↓
Database (PostgreSQL + Multi-tenant)
```

## 🚀 Instalación y Configuración

### **Requisitos Previos**
- Node.js 16+ 
- React 18+
- Material-UI 5+
- API Backend funcionando

### **Instalación**

```bash
# Clonar el repositorio
git clone https://github.com/tu-org/lpdp-admin.git

# Instalar dependencias
cd lpdp-admin
npm install

# Configurar variables de entorno
cp .env.example .env

# Iniciar en modo desarrollo
npm start
```

### **Configuración de Variables de Entorno**

```env
# API Configuration
REACT_APP_API_BASE_URL=https://tu-api-backend.com
REACT_APP_API_VERSION=v1

# Authentication
REACT_APP_AUTH_ENABLED=true
REACT_APP_JWT_SECRET=tu-jwt-secret

# Features
REACT_APP_AUDIT_ENABLED=true
REACT_APP_REPORTS_ENABLED=true
REACT_APP_MFA_ENABLED=true
```

## 📱 Uso del Sistema

### **1. Acceso al Panel de Administración**

```javascript
// Importar el componente principal
import AdminPanel from './components/admin/AdminPanel';

// Usar en tu aplicación
function App() {
  return (
    <div className="App">
      <AdminPanel />
    </div>
  );
}
```

### **2. Gestión de Empresas**

```javascript
// Crear nueva empresa
const newTenant = {
  company_name: "Mi Empresa SPA",
  business_name: "Mi Empresa Sociedad por Acciones",
  rut: "12.345.678-9",
  industry: "Tecnología",
  subscription_plan: "professional",
  max_users: 50
};

// El sistema automáticamente:
// - Crea la base de datos del tenant
// - Configura los módulos habilitados
// - Establece límites de usuarios
// - Genera credenciales de acceso
```

### **3. Gestión de Usuarios**

```javascript
// Crear nuevo usuario
const newUser = {
  username: "juan.perez",
  email: "juan.perez@miempresa.cl",
  password: "Contraseña123!",
  first_name: "Juan",
  last_name: "Pérez",
  role_codes: ["admin", "dpo"],
  is_dpo: true
};

// El sistema automáticamente:
// - Encripta la contraseña
// - Asigna permisos según roles
// - Crea clave de encriptación única
// - Envía email de bienvenida
```

### **4. Generación de Reportes**

```javascript
// Generar reporte de cumplimiento
const reportConfig = {
  report_id: 'compliance_summary',
  filters: {
    dateFrom: '2024-01-01',
    dateTo: '2024-12-31',
    tenant: 'all',
    module: 'all'
  },
  format: 'pdf'
};

// El sistema automáticamente:
// - Valida permisos del usuario
// - Ejecuta consultas en background
// - Genera el reporte en el formato solicitado
// - Proporciona URL de descarga
```

## 🔐 Sistema de Seguridad

### **Autenticación y Autorización**
- **JWT Tokens** con expiración configurable
- **Multi-Factor Authentication (MFA)** opcional
- **Sistema de roles** granulares
- **Permisos por módulo** y acción
- **Auditoría completa** de accesos

### **Encriptación de Datos**
- **Encriptación AES-256** para datos sensibles
- **Claves únicas** por usuario
- **Hash seguro** para contraseñas
- **Transmisión HTTPS** obligatoria

### **Cumplimiento Normativo**
- **Ley 21.719** de Protección de Datos Personales
- **Reglamento de la Ley** (cuando se publique)
- **Estándares ISO 27001** de seguridad
- **GDPR** para empresas internacionales

## 📊 Módulos del Sistema

### **1. Módulo DPIA (Evaluación de Impacto)**
- ✅ Creación de evaluaciones
- ✅ Plantillas predefinidas
- ✅ Flujos de aprobación
- ✅ Reportes de cumplimiento

### **2. Módulo de Brechas de Seguridad**
- ✅ Reporte de incidentes
- ✅ Clasificación por severidad
- ✅ Notificaciones automáticas
- ✅ Seguimiento de resolución

### **3. Módulo de Capacitación**
- ✅ Cursos interactivos
- ✅ Evaluaciones automáticas
- ✅ Certificados digitales
- ✅ Seguimiento de progreso

### **4. Módulo de Inventario**
- ✅ Catálogo de datos personales
- ✅ Mapeo de flujos de datos
- ✅ Clasificación por sensibilidad
- ✅ Reportes de cumplimiento

## 🔧 Personalización y Extensión

### **Configuración de Empresas**

```javascript
// Configurar módulos habilitados
const tenantConfig = {
  features: {
    dpia: true,
    brechas: true,
    capacitacion: true,
    inventario: true,
    auditoria: true,
    reportes: true
  },
  limits: {
    max_users: 100,
    max_dpia: 50,
    max_breaches: 100,
    storage_gb: 10
  }
};
```

### **Roles Personalizados**

```javascript
// Crear rol personalizado
const customRole = {
  name: "Analista de Cumplimiento",
  code: "compliance_analyst",
  permissions: [
    "dpia.read", "dpia.create", "dpia.update",
    "breaches.read", "breaches.create",
    "reports.read", "reports.generate"
  ],
  description: "Analista especializado en cumplimiento normativo"
};
```

### **Reportes Personalizados**

```javascript
// Configurar reporte personalizado
const customReport = {
  id: 'custom_compliance',
  name: 'Reporte de Cumplimiento Personalizado',
  query: 'SELECT * FROM compliance_data WHERE tenant_id = :tenant_id',
  parameters: ['tenant_id'],
  schedule: '0 9 * * 1', // Lunes a las 9 AM
  recipients: ['admin@empresa.cl', 'dpo@empresa.cl']
};
```

## 📈 Monitoreo y Métricas

### **Métricas del Sistema**
- **Tiempo de respuesta** promedio de la API
- **Uso de recursos** (CPU, memoria, almacenamiento)
- **Número de conexiones** activas
- **Estado de la base de datos** y servicios

### **Métricas de Negocio**
- **Tasa de cumplimiento** por empresa
- **Progreso de capacitación** de usuarios
- **Estado de DPIAs** y evaluaciones
- **Incidentes de seguridad** reportados

### **Alertas Automáticas**
- **Sistema crítico** (errores 500, base de datos offline)
- **Advertencias** (uso alto de recursos, muchos errores 4xx)
- **Notificaciones** (nuevas empresas, usuarios inactivos)

## 🚀 Despliegue en Producción

### **Requisitos de Servidor**
- **CPU**: 4+ cores
- **RAM**: 8+ GB
- **Almacenamiento**: 100+ GB SSD
- **Red**: 100+ Mbps

### **Configuración de Nginx**

```nginx
server {
    listen 80;
    server_name admin.lpdp.cl;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name admin.lpdp.cl;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### **Variables de Entorno de Producción**

```env
NODE_ENV=production
REACT_APP_API_BASE_URL=https://api.lpdp.cl
REACT_APP_AUTH_ENABLED=true
REACT_APP_MFA_ENABLED=true
REACT_APP_AUDIT_ENABLED=true
REACT_APP_REPORTS_ENABLED=true
```

## 🧪 Testing y Calidad

### **Tests Unitarios**

```bash
# Ejecutar tests unitarios
npm run test

# Tests con cobertura
npm run test:coverage

# Tests en modo watch
npm run test:watch
```

### **Tests de Integración**

```bash
# Tests de API
npm run test:api

# Tests de componentes
npm run test:components

# Tests end-to-end
npm run test:e2e
```

### **Linting y Formateo**

```bash
# Verificar código
npm run lint

# Corregir problemas automáticamente
npm run lint:fix

# Formatear código
npm run format
```

## 📚 Documentación de la API

### **Endpoints Principales**

```yaml
# Dashboard
GET /api/v1/admin/dashboard/stats
GET /api/v1/admin/dashboard/metrics

# Empresas
GET /api/v1/admin/tenants
POST /api/v1/admin/tenants/
GET /api/v1/admin/tenants/{id}
PATCH /api/v1/admin/tenants/{id}
DELETE /api/v1/admin/tenants/{id}

# Usuarios
GET /api/v1/admin/users
POST /api/v1/admin/users/
GET /api/v1/admin/users/{id}
PATCH /api/v1/admin/users/{id}
DELETE /api/v1/admin/users/{id}
POST /api/v1/admin/users/{id}/reset-password

# Auditoría
GET /api/v1/admin/audit/logs
GET /api/v1/admin/audit/stats
POST /api/v1/admin/audit/export

# Reportes
GET /api/v1/admin/reports/list
POST /api/v1/admin/reports/generate
GET /api/v1/admin/reports/{id}/download
```

## 🤝 Contribución y Desarrollo

### **Estructura del Proyecto**

```
src/
├── components/
│   └── admin/
│       ├── AdminPanel.js          # Panel principal
│       ├── AdminDashboard.js      # Dashboard de métricas
│       ├── TenantManagement.js    # Gestión de empresas
│       ├── UserManagement.js      # Gestión de usuarios
│       ├── SystemAudit.js        # Auditoría del sistema
│       ├── SystemReports.js      # Generación de reportes
│       └── README.md             # Esta documentación
├── config/
│   └── admin.js                  # Configuración del sistema
├── utils/
│   └── admin.js                  # Utilidades de administración
└── services/
    └── admin.js                  # Servicios de administración
```

### **Convenciones de Código**

```javascript
// Nomenclatura de componentes
// PascalCase para componentes React
function AdminDashboard() { ... }

// camelCase para funciones y variables
const handleUserCreation = () => { ... }

// UPPER_SNAKE_CASE para constantes
const MAX_USERS_PER_TENANT = 1000;

// kebab-case para archivos CSS
.admin-dashboard.css

// snake_case para endpoints de API
/api/v1/admin/user-management
```

### **Flujo de Desarrollo**

1. **Fork** del repositorio principal
2. **Crear rama** para nueva funcionalidad
3. **Desarrollar** con tests incluidos
4. **Commit** con mensajes descriptivos
5. **Push** a tu fork
6. **Pull Request** con descripción detallada

## 📞 Soporte y Contacto

### **Canales de Soporte**
- **Email**: soporte@lpdp.cl
- **Teléfono**: +56 2 2345 6789
- **Documentación**: https://docs.lpdp.cl
- **Issues**: GitHub Issues del proyecto

### **Horarios de Soporte**
- **Lunes a Viernes**: 9:00 AM - 6:00 PM (CLT)
- **Soporte 24/7**: Para clientes Enterprise
- **Respuesta**: Máximo 4 horas en horario laboral

### **Escalación de Problemas**
1. **Nivel 1**: Soporte básico (4 horas)
2. **Nivel 2**: Problemas técnicos (8 horas)
3. **Nivel 3**: Problemas críticos (2 horas)
4. **Nivel 4**: Emergencias (1 hora)

## 📄 Licencia

Este proyecto está bajo la licencia **MIT**. Ver el archivo `LICENSE` para más detalles.

## 🙏 Agradecimientos

- **Equipo de desarrollo** del Sistema LPDP
- **Comunidad de Material-UI** por el excelente framework
- **FastAPI** por la robusta API backend
- **PostgreSQL** por la base de datos confiable
- **Render** por la plataforma de hosting

---

**Desarrollado con ❤️ para el cumplimiento de la Ley 21.719 de Protección de Datos Personales de Chile**

*Última actualización: Diciembre 2024*
