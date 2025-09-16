# CARPETA DE MIGRACIÓN - SISTEMA LPDP

## Descripción
Esta carpeta contiene todos los archivos críticos del sistema LPDP (Ley de Protección de Datos Personales) que incluyen:
- Lógica de negocio
- Conexiones a base de datos
- Configuraciones del sistema
- Componentes principales
- Scripts SQL

## Estructura de Archivos Copiados

### 📁 /config - Configuración del Sistema
- **supabaseConfig.js** - Configuración principal de Supabase con autenticación
- **postgresClient.js** - Cliente PostgreSQL para conexiones directas
- **industries.config.js** - Configuración de industrias y categorías

### 📁 /contexts - Contextos de React
- **AuthContext.js** - Contexto de autenticación del sistema
- **TenantContext.js** - Contexto multi-tenant para organizaciones
- **ComplianceContext.js** - Contexto de cumplimiento normativo

### 📁 /auth - Componentes de Autenticación
- **Login.js** - Componente de inicio de sesión
- **ProtectedRoute.js** - Rutas protegidas
- **SessionManager.js** - Gestión de sesiones

### 📁 /components - Componentes Principales
- **RATSystemProfessional.js** - Sistema profesional de RAT (Registro de Actividades de Tratamiento)
- **AdminDashboard.js** - Panel de administración principal
- **ReportGenerator.js** - Generador de reportes (PDF, Excel, JSON)
- **ProviderManager.js** - Gestión de proveedores
- **ModuloEIPD.js** - Módulo de Evaluación de Impacto
- **NotificationCenter.js** - Centro de notificaciones
- **ComplianceMetrics.js** - Métricas de cumplimiento
- **DPAGenerator.js** - Generador de DPA (Data Processing Agreement)

### 📁 /services - Servicios de Negocio
- **adminService.js** - Servicios de administración
- **api.js** - Configuración base de API
- **categoryAnalysisEngine.js** - Motor de análisis de categorías
- **dataService.js** - Servicio de datos principal
- **dataSync.js** - Sincronización de datos
- **industryStandardsService.js** - Estándares por industria
- **partnerSyncEngine.js** - Sincronización con partners
- **proveedoresService.js** - Servicio de proveedores
- **ratIntelligenceEngine.js** - Motor inteligente para RAT
- **ratService.js** - Servicio principal de RAT
- **riskCalculationEngine.js** - Motor de cálculo de riesgos
- **specificCasesEngine.js** - Motor de casos específicos
- **testBalancingEngine.js** - Motor de balanceo de pruebas

### 📁 /api - APIs del Sistema
- **authAPI.js** - API de autenticación
- **complianceAPI.js** - API de cumplimiento
- **dataAPI.js** - API de datos
- **dashboardAPI.js** - API del dashboard
- **documentsAPI.js** - API de documentos
- **partnerAPI.js** - API de partners

### 📁 /pages - Páginas Principales
- **SistemaPrincipal.js** - Página principal del sistema
- **AdminDashboard.js** - Dashboard administrativo
- **AdminPanel.js** - Panel de administración
- **DPIAAlgoritmos.js** - Evaluación de algoritmos
- **DPOApprovalQueue.js** - Cola de aprobación DPO
- **Dashboard.js** - Dashboard principal
- **DashboardDPO.js** - Dashboard específico DPO
- **EIPDCreator.js** - Creador de EIPD
- **EIPDListPage.js** - Listado de EIPD
- **GestionAsociaciones.js** - Gestión de asociaciones
- **GlosarioLPDP.js** - Glosario de términos LPDP
- **ProviderManager.js** - Gestión de proveedores
- **RATEditPage.js** - Edición de RAT
- **RATListPage.js** - Listado de RAT

### 📁 /sql - Scripts de Base de Datos
- **EJECUTAR_EN_SUPABASE_DASHBOARD.sql** - Script principal de creación de tablas
- **CORREGIR_POLITICAS_RLS.sql** - Corrección de políticas RLS
- **supabase_schema.sql** - Esquema completo de Supabase
- **EJECUTAR_INMEDIATAMENTE_EN_SUPABASE.sql** - Scripts de ejecución inmediata
- **CREATE_ADMIN_USER.sql** - Creación de usuario administrador

### 📁 /scripts - Scripts de Utilidad
- **create_admin_user.js** - Script para crear usuario admin
- **confirm_admin_user.js** - Script para confirmar usuario admin
- **apply_migrations.py** - Aplicar migraciones de BD
- **validar_tablas.py** - Validación de tablas

### 📁 /utils - Utilidades
- Funciones auxiliares y helpers del sistema

### 📁 Archivos de Configuración Principal
- **App.js** - Componente principal de React con rutas
- **package.json** - Dependencias del proyecto principal
- **frontend-package.json** - Dependencias del frontend
- **.env.secrets** - Variables de entorno secretas
- **.env.supabase.example** - Ejemplo de configuración Supabase
- **render.yaml** - Configuración de Render
- **vercel.json** - Configuración de Vercel
- **netlify.toml** - Configuración de Netlify

## Tablas de Base de Datos Principales

### Tablas Core
1. **organizaciones** - Multi-tenant, datos de empresas
2. **usuarios** - Usuarios del sistema integrado con Auth
3. **rats** - Registro de Actividades de Tratamiento
4. **eipds** - Evaluaciones de Impacto
5. **proveedores** - Gestión de terceros
6. **notificaciones** - Sistema de alertas

### Tablas de Soporte
- **mapeo_datos_rat** - Mapeo de datos para RAT
- **actividades_dpo** - Actividades del DPO
- **generated_documents** - Documentos generados
- **api_partners** - Partners de API
- **webhook_configs** - Configuración de webhooks
- **system_alerts** - Alertas del sistema
- **tenant_usage** - Uso por tenant
- **tenant_limits** - Límites por tenant

## Variables de Entorno Importantes

```bash
# Supabase
REACT_APP_SUPABASE_URL=https://vkyhsnlivgwgrhdbvynm.supabase.co
REACT_APP_SUPABASE_ANON_KEY=[KEY_ENCRIPTADA]

# Proyecto
NODE_ENV=production
REACT_APP_API_URL=/api
```

## Flujo de Autenticación

1. Usuario ingresa credenciales en Login.js
2. AuthContext valida con Supabase Auth
3. Se obtiene tenant_id del usuario
4. TenantContext carga organización actual
5. Se habilitan rutas protegidas

## Generación de Reportes

### Formatos Soportados:
- **PDF** - Usando jsPDF y jspdf-autotable
- **Excel** - Usando xlsx
- **JSON** - Exportación directa de datos

## Notas Importantes

- Sistema multi-tenant con aislamiento por tenant_id
- Autenticación integrada con Supabase Auth
- RLS (Row Level Security) habilitado en todas las tablas
- Sistema de notificaciones en tiempo real
- Generación de documentos con plantillas

## Conexión a Base de Datos

El sistema usa Supabase como backend principal con:
- PostgreSQL como base de datos
- Auth integrado de Supabase
- RLS para seguridad a nivel de filas
- Realtime para actualizaciones en vivo