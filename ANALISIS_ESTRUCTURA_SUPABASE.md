# 🔍 ANÁLISIS DETALLADO DE LA ESTRUCTURA DE SUPABASE

## 📊 **ESTRUCTURA ACTUAL DE TABLAS**

### **🏢 TABLA: `empresas` (Empresas/Organizaciones)**
```sql
empresas:
├── id (uuid, PK) - Identificador único de la empresa
├── tenant_id (uuid, FK) - Referencia al tenant
├── rut (varchar(20)) - RUT de la empresa chilena
├── razon_social (varchar(255)) - Nombre legal de la empresa
├── giro (varchar(255)) - Giro comercial
├── direccion (varchar(500)) - Dirección física
├── comuna (varchar(100)) - Comuna
├── ciudad (varchar(100)) - Ciudad
├── email_contacto (varchar(255)) - Email de contacto
├── es_activa (boolean) - Estado activo/inactivo
├── metadata (jsonb) - Datos adicionales en formato JSON
└── created_at (timestamp) - Fecha de creación
```

### **🏗️ TABLA: `tenants` (Arrendatarios/Organizaciones)**
```sql
tenants:
├── id (uuid, PK) - Identificador único del tenant
├── name (varchar(255)) - Nombre del tenant
├── domain (varchar(255)) - Dominio web único
├── schema_name (varchar(100)) - Esquema de base de datos
├── is_active (boolean) - Estado activo/inactivo
├── suspended_at (timestamp) - Fecha de suspensión
├── created_at (timestamp) - Fecha de creación
└── updated_at (timestamp) - Fecha de actualización
```

### **🔐 TABLA: `licencias` (Licencias de Software)**
```sql
licencias:
├── id (uuid, PK) - Identificador único de la licencia
├── empresa_id (uuid, FK) - Referencia a la empresa
├── tipo_licencia (varchar(50)) - Tipo de licencia
├── fecha_inicio (date) - Fecha de inicio
├── fecha_expiracion (date) - Fecha de expiración
├── activa (boolean) - Estado activo/inactivo
├── clave_licencia (varchar(255)) - Clave de activación
├── max_usuarios (integer) - Máximo número de usuarios
└── created_at (timestamp) - Fecha de creación
```

### **🎯 TABLA: `modulos_acceso` (Módulos Disponibles)**
```sql
modulos_acceso:
├── id (uuid, PK) - Identificador único del módulo
├── empresa_id (uuid, FK) - Referencia a la empresa
├── modulo_codigo (varchar(10)) - Código del módulo
├── activo (boolean) - Estado activo/inactivo
├── fecha_activacion (date) - Fecha de activación
└── created_at (timestamp) - Fecha de creación
```

### **⚙️ TABLA: `tenant_configs` (Configuraciones)**
```sql
tenant_configs:
├── id (uuid, PK) - Identificador único de la configuración
├── tenant_id (uuid, FK) - Referencia al tenant
├── max_users (integer) - Máximo número de usuarios
├── max_storage_gb (integer) - Almacenamiento máximo en GB
├── features_enabled (jsonb) - Características habilitadas
├── custom_settings (jsonb) - Configuraciones personalizadas
└── created_at (timestamp) - Fecha de creación
```

## 🔗 **RELACIONES CLAVE IDENTIFICADAS**

### **1. JERARQUÍA ORGANIZACIONAL:**
```
tenants (1) ←→ (N) empresas
tenants (1) ←→ (N) tenant_configs
empresas (1) ←→ (N) licencias
empresas (1) ←→ (N) modulos_acceso
```

### **2. FLUJO DE ACCESO:**
```
Tenant → Empresa → Licencia → Módulos → Usuarios
```

### **3. CONTROL DE ACCESO:**
- **Tenant**: Define la organización principal
- **Empresa**: Entidad legal específica
- **Licencia**: Controla funcionalidades y límites
- **Módulos**: Funcionalidades específicas disponibles
- **Configuraciones**: Parámetros del sistema

## 🎯 **ELEMENTOS CLAVE IDENTIFICADOS**

### **🏢 EMPRESAS:**
- **RUT único** como identificador legal chileno
- **Metadata JSONB** para datos flexibles
- **Estado activo/inactivo** para control de acceso
- **Relación con tenant** para multi-tenancy

### **👥 USUARIOS:**
- **No existe tabla `users`** - ¡ESTO ES CLAVE!
- Los usuarios deben estar relacionados con:
  - `tenant_id` (organización)
  - `empresa_id` (empresa específica)

### **🔧 FUNCIONALIDADES:**
- **Sistema de licencias** por empresa
- **Módulos de acceso** controlados
- **Configuraciones** personalizables por tenant
- **Límites** de usuarios y almacenamiento

## 🚨 **PROBLEMAS IDENTIFICADOS**

### **1. FALTA TABLA `users`:**
- No hay tabla para almacenar usuarios del sistema
- Es fundamental para la autenticación

### **2. FALTA TABLA `tokens`:**
- No hay tabla para tokens de autenticación
- Necesaria para JWT y sesiones

### **3. FALTA TABLAS DE FUNCIONALIDADES:**
- No hay tablas para consentimientos, arcopol, inventario, etc.
- Estas son las funcionalidades del sistema LPDP

## 💡 **RECOMENDACIONES**

### **1. CREAR TABLA `users` PRIMERO:**
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_superuser BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    tenant_id UUID REFERENCES tenants(id),
    empresa_id UUID REFERENCES empresas(id),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### **2. RESPETAR LA JERARQUÍA EXISTENTE:**
- Usar `tenant_id` y `empresa_id` en todas las nuevas tablas
- Mantener la estructura de UUIDs
- Usar `TIMESTAMP WITHOUT TIME ZONE` y `CURRENT_TIMESTAMP`

### **3. INTEGRAR CON EL SISTEMA DE LICENCIAS:**
- Los usuarios deben respetar `max_usuarios` de la licencia
- Los módulos deben estar en `modulos_acceso`
- Las configuraciones deben venir de `tenant_configs`

## 🎯 **PRÓXIMOS PASOS**

1. **Crear tabla `users`** con la estructura correcta
2. **Crear tabla `tokens`** para autenticación
3. **Crear tablas de funcionalidades** respetando la jerarquía
4. **Integrar con el sistema de licencias existente**
5. **Crear usuarios de prueba** vinculados a tenant y empresa

**¡Esta estructura es mucho más robusta y profesional de lo que esperaba! 🚀**
