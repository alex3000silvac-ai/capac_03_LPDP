# INFORME TÉCNICO COMPLETO - SISTEMA LPDP
## PARTE 1 DE 3: ARQUITECTURA, FRONTEND Y BASE DE DATOS

---

## ÍNDICE GENERAL DEL INFORME COMPLETO

### PARTE 1 (Este documento)
- 1. Arquitectura General del Sistema
- 2. Módulo Frontend - Análisis Detallado
- 3. Base de Datos Supabase - Esquema Completo

### PARTE 2 
- 4. Sistema de Autenticación y Seguridad
- 5. Módulo Backend - APIs y Servicios
- 6. Generación de Reportes (Excel, PDF, JSON)

### PARTE 3
- 7. Scripts y Utilidades del Sistema
- 8. Interconexiones entre Módulos
- 9. Diagrama de Flujo Completo
- 10. Historial de Problemas y Soluciones

---

# 1. ARQUITECTURA GENERAL DEL SISTEMA

## 1.1 Descripción General
El Sistema LPDP (Ley de Protección de Datos Personales) es una aplicación web completa desarrollada para el cumplimiento normativo de la Ley 21.719 de Chile. Es una solución **multi-tenant** que permite a múltiples organizaciones gestionar sus obligaciones de protección de datos de manera independiente y segura.

## 1.2 Stack Tecnológico

### Frontend
- **React 18.3.1** - Framework principal
- **Material-UI (MUI) 5.18.0** - Biblioteca de componentes
- **React Router DOM 6.30.1** - Enrutamiento
- **Emotion** - Styling (CSS-in-JS)

### Backend/Base de Datos
- **Supabase** - Backend as a Service
- **PostgreSQL** - Base de datos principal
- **Supabase Auth** - Sistema de autenticación
- **Row Level Security (RLS)** - Seguridad a nivel de filas

### Librerías Especializadas
- **jsPDF 2.5.2** - Generación de PDFs
- **jspdf-autotable 3.8.4** - Tablas en PDFs
- **xlsx 0.18.5** - Exportación a Excel
- **@supabase/supabase-js 2.57.4** - Cliente de Supabase

## 1.3 Arquitectura Multi-Tenant

### Concepto de Tenant
Cada **tenant** representa una organización independiente con:
- **tenant_id** único (UUID)
- Datos completamente aislados
- Usuarios específicos de la organización
- Configuraciones independientes

### Flujo de Aislamiento
```
Usuario → Autenticación → tenant_id → Datos Filtrados por RLS
```

## 1.4 Estructura de Directorios

```
/
├── frontend/
│   ├── src/
│   │   ├── components/       # Componentes reutilizables
│   │   ├── pages/           # Páginas principales
│   │   ├── services/        # Lógica de negocio
│   │   ├── contexts/        # Contextos de React
│   │   ├── config/          # Configuraciones
│   │   ├── api/             # APIs específicas
│   │   ├── hooks/           # Custom hooks
│   │   └── utils/           # Utilidades
├── sql/                     # Scripts de base de datos
├── scripts/                 # Scripts de utilidad
└── migration/              # Archivos de migración
```

---

# 2. MÓDULO FRONTEND - ANÁLISIS DETALLADO

## 2.1 Componente Principal: App.js

### Arquitectura de Enrutamiento
```javascript
<AuthProvider>
  <TenantProvider>
    <Router>
      <AppContent />
    </Router>
  </TenantProvider>
</AuthProvider>
```

### Rutas Principales
1. **/** → Redirige a `/sistema-principal`
2. **/login** → Página de autenticación
3. **/sistema-principal** → Dashboard principal
4. **/rat-system** → Sistema profesional de RAT
5. **/rat-list** → Listado de RAT
6. **/compliance-metrics** → Métricas de cumplimiento
7. **/dashboard-dpo** → Dashboard del DPO
8. **/eipd-creator** → Creador de EIPD
9. **/eipd-list** → Listado de EIPD
10. **/provider-manager** → Gestión de proveedores
11. **/admin-dashboard** → Panel de administración
12. **/dpa-generator** → Generador de DPA
13. **/notifications** → Centro de notificaciones
14. **/reports** → Generador de reportes
15. **/glosario** → Glosario LPDP

## 2.2 Contextos del Sistema

### AuthContext.js
**Propósito**: Gestión centralizada de autenticación

**Funcionalidades**:
- Login/logout de usuarios
- Manejo de sesiones con Supabase Auth
- Verificación de estado de autenticación
- Integración con datos de usuario

**Estado Gestionado**:
```javascript
{
  user: null | UserObject,
  loading: boolean,
  isAuthenticated: boolean
}
```

**Métodos Principales**:
- `login(email, password)` - Autenticación
- `logout()` - Cierre de sesión
- `getCurrentUser()` - Usuario actual

### TenantContext.js
**Propósito**: Gestión multi-tenant

**Funcionalidades**:
- Selección de organización activa
- Filtrado de datos por tenant
- Cambio entre organizaciones
- Configuraciones específicas por tenant

## 2.3 Páginas Principales

### SistemaPrincipal.js
**Función**: Dashboard principal del sistema
**Características**:
- Grid de tarjetas de acceso rápido
- Métricas principales en tiempo real
- Navegación centralizada
- Estado de cumplimiento general

### AdminDashboard.js
**Función**: Panel de administración
**Características**:
- Gestión de usuarios
- Configuración del sistema
- Métricas de uso
- Alertas del sistema

### RATSystemProfessional.js
**Función**: Sistema profesional para RAT
**Características**:
- Formulario completo de RAT
- Validaciones automáticas
- Guardado incremental
- Motor de inteligencia integrado

### EIPDCreator.js
**Función**: Creador de Evaluaciones de Impacto
**Características**:
- Wizard paso a paso
- Cálculo automático de riesgos
- Integración con RAT
- Generación de documentos

### ProviderManager.js
**Función**: Gestión de proveedores
**Características**:
- CRUD completo de proveedores
- Gestión de DPA
- Seguimiento de vencimientos
- Clasificación de riesgos

## 2.4 Componentes Principales

### RATSystemProfessional.js (173,250 líneas)
**Descripción**: Componente más complejo del sistema

**Funcionalidades Principales**:
1. **Formulario Dinámico**: Campos que se adaptan según el tipo de tratamiento
2. **Motor de Inteligencia**: Sugerencias automáticas basadas en datos ingresados
3. **Validaciones en Tiempo Real**: Verificación instantánea de datos
4. **Guardado Automático**: Persistencia incremental de datos
5. **Generación de Documentos**: Exportación a PDF y Excel
6. **Historial de Versiones**: Control de cambios y auditoría

**Secciones del Formulario**:
- Identificación del tratamiento
- Responsable y encargado
- Categorías de datos personales
- Finalidades del tratamiento
- Base legal
- Destinatarios
- Transferencias internacionales
- Plazos de conservación
- Medidas de seguridad

### AdminDashboard.js (43,221 líneas)
**Descripción**: Panel de control administrativo

**Módulos Integrados**:
1. **Gestión de Usuarios**: CRUD completo de usuarios
2. **Configuración del Sistema**: Parámetros globales
3. **Métricas de Uso**: Estadísticas de utilización
4. **Alertas y Notificaciones**: Sistema de alertas
5. **Auditoría**: Logs de actividad
6. **Backup y Restauración**: Gestión de respaldos

### ReportGenerator.js (22,713 líneas)
**Descripción**: Generador universal de reportes

**Tipos de Reportes**:
1. **RAT Consolidado**: Resumen de todos los RAT
2. **EIPD Detallado**: Evaluaciones de impacto
3. **Proveedores**: Estado de proveedores y DPA
4. **Cumplimiento**: Métricas de cumplimiento
5. **Auditoría**: Reportes de auditoría

**Formatos de Salida**:
- **PDF**: Usando jsPDF con plantillas profesionales
- **Excel**: Usando xlsx con múltiples hojas
- **JSON**: Exportación de datos estructurados

## 2.5 Servicios Frontend

### ratService.js
**Función**: Gestión de RAT
**Métodos**:
- `getRats()` - Obtener lista de RAT
- `createRAT()` - Crear nuevo RAT
- `updateRAT()` - Actualizar RAT existente
- `deleteRAT()` - Eliminar RAT
- `generateRATReport()` - Generar reporte de RAT

### adminService.js
**Función**: Servicios administrativos
**Métodos**:
- `getUsers()` - Gestión de usuarios
- `getSystemMetrics()` - Métricas del sistema
- `getAuditLogs()` - Logs de auditoría
- `updateSystemConfig()` - Configuración del sistema

### dataService.js
**Función**: Servicio de datos general
**Métodos**:
- `syncData()` - Sincronización de datos
- `exportData()` - Exportación de datos
- `importData()` - Importación de datos
- `validateData()` - Validación de datos

---

# 3. BASE DE DATOS SUPABASE - ESQUEMA COMPLETO

## 3.1 Tablas Principales

### Tabla: organizaciones
**Propósito**: Almacenar datos de las empresas/organizaciones

**Campos Principales**:
```sql
id                    UUID PRIMARY KEY (uuid_generate_v4())
tenant_id             UUID NOT NULL
template_name         VARCHAR(100)
razon_social          VARCHAR(255) NOT NULL
rut_empresa           VARCHAR(20) UNIQUE NOT NULL
domicilio_legal       TEXT
telefono_empresa      VARCHAR(50)
email_empresa         VARCHAR(255)
nombre_representante  VARCHAR(255)
rut_representante     VARCHAR(20)
telefono_representante VARCHAR(50)
email_representante   VARCHAR(255)
nombre_dpo            VARCHAR(255)
telefono_dpo          VARCHAR(50)
email_dpo             VARCHAR(255)
is_active             BOOLEAN DEFAULT true
created_at            TIMESTAMPTZ DEFAULT NOW()
updated_at            TIMESTAMPTZ DEFAULT NOW()
created_by            UUID REFERENCES auth.users(id)
```

**Índices**:
- `idx_organizaciones_tenant_id` en `tenant_id`
- `unique_tenant_template` en `(tenant_id, template_name)`

**RLS Policy**:
```sql
CREATE POLICY "tenant_isolation_organizaciones" ON organizaciones
FOR ALL USING (
    tenant_id = (SELECT tenant_id FROM usuarios WHERE id = auth.uid())
);
```

### Tabla: usuarios
**Propósito**: Usuarios del sistema integrados con Supabase Auth

**Campos Principales**:
```sql
id                UUID REFERENCES auth.users(id) PRIMARY KEY
tenant_id         UUID NOT NULL
email             VARCHAR(255) UNIQUE NOT NULL
nombre            VARCHAR(255)
apellidos         VARCHAR(255)
telefono          VARCHAR(50)
cargo             VARCHAR(100)
rol               VARCHAR(50) DEFAULT 'user'
is_active         BOOLEAN DEFAULT true
created_at        TIMESTAMPTZ DEFAULT NOW()
updated_at        TIMESTAMPTZ DEFAULT NOW()
last_login        TIMESTAMPTZ
```

**Restricciones**:
- Email debe ser válido (regex)
- Rol debe ser: 'admin', 'dpo', 'user', 'viewer'

**RLS Policy**:
```sql
CREATE POLICY "tenant_isolation_usuarios" ON usuarios
FOR ALL USING (
    tenant_id = (SELECT tenant_id FROM usuarios WHERE id = auth.uid()) OR
    id = auth.uid()
);
```

### Tabla: rats
**Propósito**: Registro de Actividades de Tratamiento

**Campos Principales**:
```sql
id                              UUID PRIMARY KEY
tenant_id                       UUID NOT NULL
codigo_rat                      VARCHAR(50) UNIQUE NOT NULL
nombre_actividad                VARCHAR(255) NOT NULL
descripcion_actividad           TEXT
responsable_tratamiento         VARCHAR(255)
encargado_tratamiento          VARCHAR(255)
categorias_titulares           JSONB
categorias_datos               JSONB
finalidades                    JSONB
base_legal                     VARCHAR(255)
destinatarios                  JSONB
transferencias_internacionales BOOLEAN DEFAULT false
paises_transferencia           JSONB
garantias_transferencia        TEXT
plazo_conservacion             VARCHAR(255)
medidas_seguridad              JSONB
estado                         VARCHAR(50) DEFAULT 'borrador'
version                        INTEGER DEFAULT 1
fecha_aprobacion               TIMESTAMPTZ
aprobado_por                   UUID REFERENCES auth.users(id)
is_active                      BOOLEAN DEFAULT true
created_at                     TIMESTAMPTZ DEFAULT NOW()
updated_at                     TIMESTAMPTZ DEFAULT NOW()
created_by                     UUID REFERENCES auth.users(id)
```

**Estados Válidos**: 'borrador', 'en_revision', 'aprobado', 'rechazado', 'obsoleto'

**Estructura JSONB para categorias_titulares**:
```json
[
  {
    "categoria": "Clientes",
    "descripcion": "Personas que contratan servicios",
    "cantidad_estimada": "1000-5000"
  }
]
```

**Estructura JSONB para categorias_datos**:
```json
[
  {
    "categoria": "Datos Identificativos",
    "tipos": ["nombre", "rut", "email", "telefono"],
    "es_sensible": false
  },
  {
    "categoria": "Datos Financieros", 
    "tipos": ["ingresos", "historial_crediticio"],
    "es_sensible": true
  }
]
```

### Tabla: eipds
**Propósito**: Evaluaciones de Impacto en Protección de Datos

**Campos Principales**:
```sql
id                           UUID PRIMARY KEY
tenant_id                    UUID NOT NULL
rat_id                       UUID REFERENCES rats(id)
codigo_eipd                  VARCHAR(50) UNIQUE NOT NULL
nombre_evaluacion            VARCHAR(255) NOT NULL
descripcion_evaluacion       TEXT
riesgos_identificados        JSONB
probabilidad_riesgo          INTEGER CHECK (probabilidad_riesgo BETWEEN 1 AND 5)
impacto_riesgo              INTEGER CHECK (impacto_riesgo BETWEEN 1 AND 5)
nivel_riesgo                INTEGER
medidas_mitigacion          JSONB
riesgo_residual             INTEGER
requiere_consulta_autoridad  BOOLEAN DEFAULT false
fecha_consulta              TIMESTAMPTZ
respuesta_autoridad         TEXT
estado                      VARCHAR(50) DEFAULT 'borrador'
version                     INTEGER DEFAULT 1
fecha_aprobacion            TIMESTAMPTZ
aprobado_por                UUID REFERENCES auth.users(id)
is_active                   BOOLEAN DEFAULT true
created_at                  TIMESTAMPTZ DEFAULT NOW()
updated_at                  TIMESTAMPTZ DEFAULT NOW()
created_by                  UUID REFERENCES auth.users(id)
```

**Cálculo de Nivel de Riesgo**:
```
nivel_riesgo = probabilidad_riesgo × impacto_riesgo
```

**Estructura JSONB para riesgos_identificados**:
```json
[
  {
    "riesgo": "Acceso no autorizado",
    "descripcion": "Posible acceso indebido a datos personales",
    "probabilidad": 3,
    "impacto": 4,
    "controles_actuales": ["Autenticación", "Logs de acceso"]
  }
]
```

### Tabla: proveedores
**Propósito**: Gestión de terceros y proveedores

**Campos Principales**:
```sql
id                     UUID PRIMARY KEY
tenant_id              UUID NOT NULL
nombre_proveedor       VARCHAR(255) NOT NULL
rut_proveedor          VARCHAR(20) UNIQUE NOT NULL
direccion              TEXT
telefono               VARCHAR(50)
email                  VARCHAR(255)
nombre_contacto        VARCHAR(255)
email_contacto         VARCHAR(255)
telefono_contacto      VARCHAR(50)
tipo_proveedor         VARCHAR(100)
categoria_datos        VARCHAR(100)
nivel_riesgo           VARCHAR(50) DEFAULT 'medio'
tiene_dpa              BOOLEAN DEFAULT false
fecha_firma_dpa        TIMESTAMPTZ
fecha_vencimiento_dpa  TIMESTAMPTZ
certificaciones        JSONB
estado                 VARCHAR(50) DEFAULT 'activo'
is_active              BOOLEAN DEFAULT true
created_at             TIMESTAMPTZ DEFAULT NOW()
updated_at             TIMESTAMPTZ DEFAULT NOW()
created_by             UUID REFERENCES auth.users(id)
```

**Niveles de Riesgo**: 'bajo', 'medio', 'alto', 'critico'
**Estados**: 'activo', 'inactivo', 'suspendido', 'terminado'

**Estructura JSONB para certificaciones**:
```json
[
  {
    "certificacion": "ISO 27001",
    "fecha_obtencion": "2023-01-15",
    "fecha_vencimiento": "2026-01-15",
    "organismo_certificador": "Bureau Veritas"
  }
]
```

### Tabla: notificaciones
**Propósito**: Sistema de alertas y notificaciones

**Campos Principales**:
```sql
id              UUID PRIMARY KEY
tenant_id       UUID NOT NULL
titulo          VARCHAR(255) NOT NULL
mensaje         TEXT NOT NULL
tipo            VARCHAR(50) NOT NULL
prioridad       VARCHAR(20) DEFAULT 'normal'
usuario_id      UUID REFERENCES auth.users(id)
leida           BOOLEAN DEFAULT false
fecha_lectura   TIMESTAMPTZ
created_at      TIMESTAMPTZ DEFAULT NOW()
```

**Tipos**: 'info', 'warning', 'error', 'success'
**Prioridades**: 'baja', 'normal', 'alta', 'urgente'

## 3.2 Funciones y Triggers

### Función: get_current_tenant_id()
**Propósito**: Obtener tenant_id del usuario autenticado

```sql
CREATE OR REPLACE FUNCTION get_current_tenant_id()
RETURNS UUID AS $$
BEGIN
    RETURN (SELECT tenant_id FROM usuarios WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Trigger: trigger_set_timestamp()
**Propósito**: Actualizar automáticamente campo `updated_at`

```sql
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Aplicado a**:
- organizaciones
- usuarios  
- rats
- eipds
- proveedores

## 3.3 Políticas de Seguridad (RLS)

### Aislamiento por Tenant
Todas las tablas principales implementan aislamiento estricto por `tenant_id`:

```sql
tenant_id = (SELECT tenant_id FROM usuarios WHERE id = auth.uid())
```

### Acceso a Datos Propios
Los usuarios pueden acceder a sus propios datos:

```sql
id = auth.uid() OR usuario_id = auth.uid()
```

### Índices de Rendimiento
Cada tabla tiene índices optimizados para consultas por tenant:

```sql
CREATE INDEX idx_[tabla]_tenant_id ON [tabla](tenant_id);
```

---

**FIN DE LA PARTE 1**

**Continúa en**: INFORME_TECNICO_SISTEMA_LPDP_PARTE_2.md