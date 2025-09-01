# 🏛️ PROPUESTA: MÓDULO ADMINISTRATIVO LPDP

## 📋 **RESUMEN EJECUTIVO**

**Objetivo:** Crear módulo administrativo separado para gestión de holdings, empresas y usuarios con acceso restringido solo para super-administradores.

**Acceso:** Solo usuarios con rol `SUPER_ADMIN` pueden acceder al módulo.

**Ubicación:** `/admin` - Ruta protegida independiente del sistema principal.

---

## 🏗️ **ARQUITECTURA DEL MÓDULO**

### 📁 **ESTRUCTURA DE ARCHIVOS PROPUESTA:**

```
frontend/src/
├── admin/                          # 🆕 MÓDULO ADMINISTRATIVO
│   ├── AdminApp.js                 # App principal administrativa  
│   ├── AdminRoutes.js              # Rutas protegidas admin
│   ├── components/
│   │   ├── AdminLayout.js          # Layout base administrativo
│   │   ├── AdminSidebar.js         # Navegación lateral
│   │   ├── AdminHeader.js          # Header con usuario admin
│   │   ├── holdings/
│   │   │   ├── HoldingManager.js   # Gestión holdings
│   │   │   ├── HoldingList.js      # Lista holdings
│   │   │   ├── HoldingForm.js      # Crear/editar holding
│   │   │   └── HoldingDetail.js    # Detalles holding
│   │   ├── empresas/
│   │   │   ├── EmpresaManager.js   # Gestión empresas
│   │   │   ├── EmpresaList.js      # Lista empresas
│   │   │   ├── EmpresaForm.js      # Crear/editar empresa
│   │   │   └── EmpresaDetail.js    # Detalles empresa
│   │   ├── usuarios/
│   │   │   ├── UserManager.js      # Gestión usuarios
│   │   │   ├── UserList.js         # Lista usuarios
│   │   │   ├── UserForm.js         # Crear/editar usuario
│   │   │   ├── RoleManager.js      # Gestión roles
│   │   │   └── PermissionMatrix.js # Matriz permisos
│   │   └── dashboard/
│   │       ├── AdminDashboard.js   # Dashboard principal
│   │       ├── SystemStats.js     # Estadísticas sistema
│   │       └── AuditLog.js        # Log de auditoría
│   ├── services/
│   │   ├── adminService.js         # API administrativa
│   │   ├── holdingService.js       # Operaciones holdings
│   │   ├── empresaService.js       # Operaciones empresas
│   │   └── userService.js          # Operaciones usuarios
│   ├── utils/
│   │   ├── adminAuth.js            # Autenticación admin
│   │   ├── adminValidation.js      # Validaciones
│   │   └── adminPermissions.js     # Sistema permisos
│   └── styles/
│       └── adminTheme.js           # Tema administrativo
```

---

## 🎯 **FUNCIONALIDADES PRINCIPALES**

### 🏢 **1. GESTIÓN DE HOLDINGS**

**Características:**
- ✅ Crear/editar/eliminar holdings
- ✅ Configurar estructura jerárquica
- ✅ Definir políticas corporativas
- ✅ Dashboard consolidado por holding

**Campos del Holding:**
```javascript
const HOLDING_SCHEMA = {
  id: "UUID generado automáticamente",
  rut_holding: "12.345.678-9", 
  razon_social: "Holding Empresarial S.A.",
  direccion_matriz: "Av. Principal 123, Santiago",
  telefono_corporativo: "+56 2 2123 4567",
  email_corporativo: "contacto@holding.cl",
  
  // Configuración operativa
  configuracion: {
    permite_herencia_procesos: true,
    dashboard_consolidado: true,
    auditoria_centralizada: true,
    templates_corporativos: true,
    notificaciones_globales: true
  },
  
  // Responsables
  cdo_principal: "CDO Holding",
  email_cdo: "cdo@holding.cl",
  
  // Metadata
  fecha_creacion: "2025-01-01T00:00:00Z",
  estado: "ACTIVO|INACTIVO",
  total_empresas: 0,
  total_usuarios: 0
};
```

### 🏢 **2. GESTIÓN DE EMPRESAS**

**Características:**
- ✅ Crear empresas subsidiarias
- ✅ Asignar a holdings existentes
- ✅ Configurar industria/giro específico
- ✅ Gestionar DPOs por empresa

**Campos de la Empresa:**
```javascript
const EMPRESA_SCHEMA = {
  id: "UUID generado automáticamente",
  tenant_id: "holding_001_empresa_a", // Formato: holding_empresas
  holding_parent_id: "UUID del holding",
  
  // Datos legales
  rut_empresa: "98.765.432-1",
  razon_social: "Subsidiaria Tecnológica S.A.",
  direccion_comercial: "Av. Tecnología 456, Las Condes",
  giro_principal: "Desarrollo de software",
  industry_code: "tecnologia",
  
  // Configuración LPDP
  configuracion_lpdp: {
    permite_herencia_holding: true,
    requiere_aprobacion_templates: false,
    nivel_autonomia: "MEDIA|ALTA|BAJA",
    customizaciones_permitidas: ["finalidades", "bases_legales", "destinatarios"]
  },
  
  // Responsables
  dpo_principal: "Juan Pérez",
  email_dpo: "dpo@subsidiaria.cl",
  telefono_dpo: "+56 9 8765 4321",
  
  // Estados
  estado_compliance: "EN_PROGRESO|COMPLETO|CRITICO",
  fecha_ultimo_rat: "2025-01-01T00:00:00Z",
  total_rats_activos: 0
};
```

### 👥 **3. GESTIÓN DE USUARIOS**

**Características:**
- ✅ Crear usuarios con roles específicos
- ✅ Asignar permisos granulares
- ✅ Gestionar acceso multi-empresa
- ✅ Auditoría de acciones usuarios

**Roles del Sistema:**
```javascript
const ROLES_SISTEMA = {
  
  SUPER_ADMIN: {
    descripcion: "Administrador del sistema",
    nivel: 100,
    permisos: ["*"], // Todos los permisos
    tenant_access: ["*"], // Todos los tenants
    puede_acceder_admin: true
  },
  
  CDO_HOLDING: {
    descripcion: "Chief Data Officer - Holding", 
    nivel: 80,
    permisos: [
      "view_all_companies_in_holding",
      "create_corporate_templates",
      "manage_holding_policies", 
      "consolidated_reports",
      "cross_company_audit"
    ],
    tenant_access: ["holding_companies"], // Solo empresas de su holding
    puede_acceder_admin: false
  },
  
  DPO_EMPRESA: {
    descripcion: "Data Protection Officer - Empresa",
    nivel: 60,
    permisos: [
      "view_own_company", 
      "create_rats",
      "edit_own_rats",
      "inherit_templates",
      "customize_inherited_processes"
    ],
    tenant_access: ["own_tenant_only"], // Solo su empresa
    puede_acceder_admin: false
  },
  
  AUDITOR_EXTERNO: {
    descripcion: "Auditor Externo",
    nivel: 40,
    permisos: [
      "view_readonly_assigned_companies",
      "export_compliance_reports", 
      "view_audit_trail"
    ],
    tenant_access: ["assigned_companies"], // Solo empresas asignadas
    puede_acceder_admin: false
  },
  
  USUARIO_EMPRESA: {
    descripcion: "Usuario Operativo Empresa",
    nivel: 20,
    permisos: [
      "view_own_rats",
      "create_basic_rats",
      "view_company_dashboard"
    ],
    tenant_access: ["own_tenant_only"],
    puede_acceder_admin: false
  }
};
```

---

## 🎨 **DISEÑO DE INTERFAZ ADMINISTRATIVA**

### 🏛️ **DASHBOARD PRINCIPAL**

```javascript
const AdminDashboard = () => {
  return (
    <AdminLayout>
      {/* Header con estadísticas globales */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <StatsCard 
            title="Holdings Activos"
            value={holdingsData.total}
            icon={<BusinessIcon />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatsCard 
            title="Empresas Registradas" 
            value={empresasData.total}
            icon={<CorporateFareIcon />}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatsCard 
            title="Usuarios Activos"
            value={usuariosData.activos}
            icon={<PeopleIcon />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatsCard 
            title="RATs Totales"
            value={systemStats.total_rats}
            icon={<AssignmentIcon />}
            color="info"
          />
        </Grid>
      </Grid>
      
      {/* Gráficos y alertas */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Cumplimiento por Holding
            </Typography>
            <ComplianceChart data={complianceData} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Alertas Críticas
            </Typography>
            <AlertasList alertas={alertasCriticas} />
          </Paper>
        </Grid>
      </Grid>
    </AdminLayout>
  );
};
```

### 🔒 **SISTEMA DE AUTENTICACIÓN ADMIN**

```javascript
// Middleware de autenticación administrativa
const AdminAuthGuard = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    verificarAccesoAdmin();
  }, []);
  
  const verificarAccesoAdmin = async () => {
    try {
      const user = await supabase.auth.getUser();
      const userRole = await getUserRole(user.data.user?.id);
      
      if (userRole?.nivel >= 100 && userRole?.puede_acceder_admin) {
        setIsAdmin(true);
      } else {
        // Redirigir a login o mostrar error 403
        window.location.href = '/login?error=access_denied';
      }
    } catch (error) {
      console.error('Error verificando acceso admin:', error);
      window.location.href = '/login';
    }
    setLoading(false);
  };
  
  if (loading) return <AdminLoadingScreen />;
  if (!isAdmin) return <AccessDeniedScreen />;
  
  return children;
};
```

---

## 🛠️ **FUNCIONALIDADES ESPECÍFICAS**

### 🏢 **MÓDULO HOLDINGS**

**Pantallas:**

1. **📊 Lista de Holdings**
   - Tabla con holdings registrados
   - Estadísticas por holding (empresas, usuarios, cumplimiento)
   - Acciones: Ver, Editar, Eliminar, Activar/Desactivar

2. **📝 Crear/Editar Holding**
   - Formulario datos corporativos
   - Configuración políticas internas
   - Asignación CDO principal

3. **🔍 Detalle de Holding**
   - Vista consolidada empresas subsidiarias
   - Métricas cumplimiento
   - Gestión templates corporativos

### 🏢 **MÓDULO EMPRESAS**

**Pantallas:**

1. **📊 Lista de Empresas**
   - Filtro por holding
   - Estado de cumplimiento por empresa
   - Acciones CRUD completas

2. **📝 Crear/Editar Empresa**
   - Asignación a holding existente
   - Configuración industry-specific
   - Asignación DPO

3. **🔍 Detalle de Empresa**
   - RATs activos de la empresa
   - Usuarios asignados
   - Configuración herencia procesos

### 👥 **MÓDULO USUARIOS**

**Pantallas:**

1. **📊 Lista de Usuarios**
   - Filtro por rol y empresa
   - Estado activo/inactivo
   - Último acceso

2. **📝 Crear/Editar Usuario**
   - Asignación roles múltiples
   - Permisos granulares
   - Acceso multi-tenant

3. **🔍 Matriz de Permisos**
   - Vista global permisos por rol
   - Gestión permisos específicos
   - Auditoría cambios permisos

---

## 🎯 **FLUJOS DE TRABAJO ADMINISTRATIVOS**

### 🔄 **FLUJO 1: CREAR NUEVO HOLDING**

```javascript
// Proceso paso a paso
const CrearHoldingFlow = {
  
  paso1_datos_basicos: {
    rut_holding: "Validación RUT chileno",
    razon_social: "Nombre legal completo", 
    direccion_matriz: "Dirección principal",
    contacto_corporativo: "Email y teléfono"
  },
  
  paso2_configuracion: {
    politicas_herencia: "¿Permite herencia procesos?",
    nivel_centralizacion: "ALTO|MEDIO|BAJO",
    dashboard_consolidado: "¿Dashboard unificado?",
    auditoria_corporativa: "¿Auditoría centralizada?"
  },
  
  paso3_responsables: {
    cdo_principal: "Chief Data Officer",
    email_cdo: "Contacto CDO",
    auditores_externos: "Lista auditores autorizados"
  },
  
  paso4_confirmacion: {
    revision_datos: "Validar información",
    generar_tenant_matriz: "Crear tenant holding_xxx_matriz",
    notificar_cdo: "Enviar credenciales acceso"
  }
};
```

### 🔄 **FLUJO 2: AGREGAR EMPRESA A HOLDING**

```javascript
const AgregarEmpresaFlow = {
  
  paso1_seleccion_holding: {
    holdings_disponibles: "Lista holdings activos",
    verificar_permisos: "Admin puede agregar a este holding"
  },
  
  paso2_datos_empresa: {
    rut_empresa: "RUT subsidiaria",
    razon_social: "Nombre empresa",
    giro_industria: "Sector/industria específica"
  },
  
  paso3_configuracion_lpdp: {
    hereda_procesos: "¿Hereda templates del holding?",
    autonomia_local: "Nivel customización permitida",
    dpo_asignado: "DPO específico empresa"
  },
  
  paso4_integracion: {
    generar_tenant_id: "Crear tenant empresa",
    heredar_templates: "Aplicar procesos base holding",
    notificar_dpo: "Enviar acceso al DPO"
  }
};
```

### 🔄 **FLUJO 3: CREAR USUARIO CON ROLES**

```javascript
const CrearUsuarioFlow = {
  
  paso1_datos_personales: {
    nombre_completo: "Nombre y apellidos",
    email: "Email corporativo",
    telefono: "Teléfono contacto"
  },
  
  paso2_asignacion_empresas: {
    holding_asignado: "¿A qué holding pertenece?",
    empresas_acceso: "¿A cuáles empresas tiene acceso?",
    tipo_acceso: "READONLY|READWRITE|ADMIN"
  },
  
  paso3_roles_permisos: {
    rol_principal: "CDO_HOLDING|DPO_EMPRESA|AUDITOR|USUARIO",
    permisos_especiales: "Permisos adicionales específicos",
    vigencia_acceso: "Fecha vencimiento (opcional)"
  },
  
  paso4_activacion: {
    generar_credenciales: "Login y password temporal",
    configurar_mfa: "Autenticación multi-factor", 
    enviar_bienvenida: "Email con credenciales"
  }
};
```

---

## 🎨 **MOCKUPS DE INTERFAZ**

### 🏛️ **SIDEBAR ADMINISTRATIVO**

```javascript
const AdminSidebar = () => {
  return (
    <Drawer variant="permanent">
      <List>
        {/* Dashboard */}
        <ListItem button>
          <ListItemIcon><DashboardIcon /></ListItemIcon>
          <ListItemText primary="Dashboard General" />
        </ListItem>
        
        {/* Holdings */}
        <ListItem button>
          <ListItemIcon><BusinessIcon /></ListItemIcon> 
          <ListItemText primary="Gestión Holdings" />
        </ListItem>
        
        {/* Empresas */}
        <ListItem button>
          <ListItemIcon><CorporateFareIcon /></ListItemIcon>
          <ListItemText primary="Gestión Empresas" />
        </ListItem>
        
        {/* Usuarios */}
        <ListItem button>
          <ListItemIcon><PeopleIcon /></ListItemIcon>
          <ListItemText primary="Gestión Usuarios" />
        </ListItem>
        
        {/* Configuración */}
        <ListItem button>
          <ListItemIcon><SettingsIcon /></ListItemIcon>
          <ListItemText primary="Configuración Sistema" />
        </ListItem>
        
        {/* Auditoría */}
        <ListItem button>
          <ListItemIcon><AuditIcon /></ListItemIcon>
          <ListItemText primary="Log de Auditoría" />
        </ListItem>
      </List>
    </Drawer>
  );
};
```

### 📊 **TABLA HOLDINGS**

```javascript
const HoldingsList = () => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>RUT Holding</TableCell>
            <TableCell>Razón Social</TableCell>
            <TableCell>Empresas</TableCell>
            <TableCell>Usuarios</TableCell>
            <TableCell>Cumplimiento</TableCell>
            <TableCell>Estado</TableCell>
            <TableCell>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {holdings.map((holding) => (
            <TableRow key={holding.id}>
              <TableCell>{holding.rut_holding}</TableCell>
              <TableCell>{holding.razon_social}</TableCell>
              <TableCell>
                <Chip label={`${holding.total_empresas} empresas`} size="small" />
              </TableCell>
              <TableCell>
                <Chip label={`${holding.total_usuarios} usuarios`} size="small" />
              </TableCell>
              <TableCell>
                <LinearProgress 
                  variant="determinate" 
                  value={holding.cumplimiento_promedio}
                  sx={{ width: 80 }}
                />
              </TableCell>
              <TableCell>
                <Chip 
                  label={holding.estado}
                  color={holding.estado === 'ACTIVO' ? 'success' : 'error'}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <IconButton onClick={() => verHolding(holding.id)}>
                  <VisibilityIcon />
                </IconButton>
                <IconButton onClick={() => editarHolding(holding.id)}>
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => eliminarHolding(holding.id)}>
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
```

---

## 🔒 **SEGURIDAD Y PERMISOS**

### 🛡️ **AUTENTICACIÓN REFORZADA**

```javascript
// Sistema de autenticación específico para admin
const AdminAuth = {
  
  // Verificación doble factor para admins
  async authenticateAdmin(email, password, mfaCode) {
    // 1. Verificar credenciales básicas
    const { user, error } = await supabase.auth.signInWithPassword({
      email, password
    });
    
    if (error) throw new Error('Credenciales inválidas');
    
    // 2. Verificar rol administrativo
    const userRole = await this.getUserRole(user.id);
    if (userRole.nivel < 100) {
      throw new Error('Acceso denegado - Permisos insuficientes');
    }
    
    // 3. Verificar MFA (si está habilitado)
    if (userRole.requiere_mfa && !this.verifyMFA(mfaCode)) {
      throw new Error('Código MFA inválido');
    }
    
    // 4. Registrar acceso en auditoría
    await this.logAdminAccess(user.id, 'LOGIN_ADMIN');
    
    return { user, role: userRole };
  },
  
  // Middleware para rutas administrativas
  requireAdminAccess: (WrappedComponent) => {
    return (props) => {
      const [authorized, setAuthorized] = useState(false);
      
      useEffect(() => {
        this.verifyAdminAccess().then(setAuthorized);
      }, []);
      
      if (!authorized) return <AccessDeniedScreen />;
      return <WrappedComponent {...props} />;
    };
  }
};
```

### 🔐 **MATRIZ DE PERMISOS GRANULARES**

```javascript
const PERMISOS_GRANULARES = {
  
  // Gestión Holdings
  holdings: {
    create: ["SUPER_ADMIN"],
    read: ["SUPER_ADMIN", "CDO_HOLDING"],
    update: ["SUPER_ADMIN"],
    delete: ["SUPER_ADMIN"],
    view_stats: ["SUPER_ADMIN", "CDO_HOLDING"]
  },
  
  // Gestión Empresas  
  empresas: {
    create: ["SUPER_ADMIN"],
    read: ["SUPER_ADMIN", "CDO_HOLDING"],
    update: ["SUPER_ADMIN", "CDO_HOLDING"],
    delete: ["SUPER_ADMIN"],
    assign_to_holding: ["SUPER_ADMIN"]
  },
  
  // Gestión Usuarios
  usuarios: {
    create: ["SUPER_ADMIN"],
    read: ["SUPER_ADMIN", "CDO_HOLDING"],
    update: ["SUPER_ADMIN"],
    delete: ["SUPER_ADMIN"],
    change_permissions: ["SUPER_ADMIN"],
    reset_password: ["SUPER_ADMIN"]
  },
  
  // Auditoría
  auditoria: {
    view_all: ["SUPER_ADMIN"],
    view_holding: ["CDO_HOLDING"],
    export_logs: ["SUPER_ADMIN", "AUDITOR_EXTERNO"]
  }
};
```

---

## 📊 **BASES DE DATOS - SCHEMA EXTENDIDO**

### 🗄️ **NUEVAS TABLAS REQUERIDAS**

```sql
-- =====================================================
-- TABLA: holdings (Gestión de holdings empresariales)
-- =====================================================
CREATE TABLE IF NOT EXISTS holdings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  rut_holding VARCHAR(20) UNIQUE NOT NULL,
  razon_social VARCHAR(500) NOT NULL,
  direccion_matriz TEXT,
  telefono_corporativo VARCHAR(50),
  email_corporativo VARCHAR(255),
  
  -- Configuración
  configuracion JSONB DEFAULT '{}',
  
  -- Responsables
  cdo_principal VARCHAR(255),
  email_cdo VARCHAR(255),
  
  -- Estados y metadata
  estado VARCHAR(20) DEFAULT 'ACTIVO',
  total_empresas INTEGER DEFAULT 0,
  total_usuarios INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- =====================================================
-- TABLA: empresas_holding (Empresas subsidiarias)
-- =====================================================
CREATE TABLE IF NOT EXISTS empresas_holding (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  holding_id UUID REFERENCES holdings(id) ON DELETE CASCADE,
  tenant_id VARCHAR(255) UNIQUE NOT NULL,
  
  -- Datos empresa
  rut_empresa VARCHAR(20) UNIQUE NOT NULL,
  razon_social VARCHAR(500) NOT NULL,
  direccion_comercial TEXT,
  giro_principal VARCHAR(255),
  industry_code VARCHAR(100),
  
  -- Configuración LPDP
  configuracion_lpdp JSONB DEFAULT '{}',
  
  -- DPO asignado
  dpo_principal VARCHAR(255),
  email_dpo VARCHAR(255),
  telefono_dpo VARCHAR(50),
  
  -- Estados
  estado_compliance VARCHAR(50) DEFAULT 'EN_PROGRESO',
  fecha_ultimo_rat TIMESTAMPTZ,
  total_rats_activos INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- =====================================================
-- TABLA: usuarios_sistema (Gestión usuarios y roles)
-- =====================================================
CREATE TABLE IF NOT EXISTS usuarios_sistema (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Datos personales
  nombre_completo VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  telefono VARCHAR(50),
  
  -- Asignaciones
  holding_id UUID REFERENCES holdings(id),
  empresa_ids JSONB, -- Array de IDs empresas con acceso
  
  -- Roles y permisos
  rol_principal VARCHAR(100) NOT NULL,
  permisos_adicionales JSONB DEFAULT '[]',
  nivel_acceso INTEGER DEFAULT 20,
  
  -- Estados
  estado VARCHAR(20) DEFAULT 'ACTIVO',
  ultimo_acceso TIMESTAMPTZ,
  fecha_vencimiento DATE,
  requiere_cambio_password BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- =====================================================
-- ÍNDICES Y POLÍTICAS RLS
-- =====================================================

-- Índices para performance
CREATE INDEX idx_holdings_estado ON holdings(estado);
CREATE INDEX idx_empresas_holding_id ON empresas_holding(holding_id);
CREATE INDEX idx_empresas_tenant ON empresas_holding(tenant_id);
CREATE INDEX idx_usuarios_rol ON usuarios_sistema(rol_principal);
CREATE INDEX idx_usuarios_holding ON usuarios_sistema(holding_id);

-- RLS para seguridad
ALTER TABLE holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE empresas_holding ENABLE ROW LEVEL SECURITY; 
ALTER TABLE usuarios_sistema ENABLE ROW LEVEL SECURITY;

-- Solo SUPER_ADMIN puede acceder a estas tablas
CREATE POLICY "Super admin only access" ON holdings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM usuarios_sistema 
      WHERE auth_user_id = auth.uid() 
      AND rol_principal = 'SUPER_ADMIN'
      AND estado = 'ACTIVO'
    )
  );

-- Aplicar misma política a todas las tablas admin
CREATE POLICY "Super admin only access" ON empresas_holding
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM usuarios_sistema 
      WHERE auth_user_id = auth.uid() 
      AND rol_principal = 'SUPER_ADMIN'
      AND estado = 'ACTIVO'
    )
  );

CREATE POLICY "Super admin only access" ON usuarios_sistema
  FOR ALL  
  USING (
    EXISTS (
      SELECT 1 FROM usuarios_sistema 
      WHERE auth_user_id = auth.uid() 
      AND rol_principal = 'SUPER_ADMIN'
      AND estado = 'ACTIVO'
    )
  );
```

---

## 🚀 **PLAN DE IMPLEMENTACIÓN**

### 📅 **CRONOGRAMA PROPUESTO:**

**🎯 FASE 1: FUNDAMENTOS (3-4 días)**
- ✅ Crear estructura carpetas `/admin`
- ✅ Implementar autenticación administrativa  
- ✅ Crear layout base administrativo
- ✅ Implementar esquema base de datos

**🏢 FASE 2: MÓDULO HOLDINGS (2-3 días)**
- ✅ HoldingManager y CRUD completo
- ✅ Dashboard específico holdings
- ✅ Configuración políticas corporativas

**🏢 FASE 3: MÓDULO EMPRESAS (2-3 días)**  
- ✅ EmpresaManager y CRUD completo
- ✅ Asignación a holdings
- ✅ Configuración herencia procesos

**👥 FASE 4: MÓDULO USUARIOS (3-4 días)**
- ✅ UserManager y sistema roles
- ✅ Matriz permisos granulares
- ✅ Asignación multi-tenant

**📊 FASE 5: DASHBOARDS (1-2 días)**
- ✅ Dashboard administrativo principal
- ✅ Métricas consolidadas
- ✅ Sistema alertas críticas

**🔒 FASE 6: SEGURIDAD (1-2 días)**
- ✅ Auditoría completa
- ✅ Logs de acciones administrativas
- ✅ Backup y recovery

### ⏱️ **ESTIMACIÓN TOTAL: 12-18 días de desarrollo**

---

## 🎯 **PROPUESTA DE VALOR**

### 💼 **BENEFICIOS INMEDIATOS:**

1. **🔒 Seguridad Corporativa Reforzada**
   - Acceso administrativo completamente separado
   - Auditoría granular de todas las acciones
   - Permisos específicos por rol y empresa

2. **⚡ Eficiencia Operativa**
   - Gestión centralizada de múltiples holdings
   - Configuración rápida nuevas empresas
   - Automatización de asignación usuarios

3. **📊 Visibilidad Ejecutiva**
   - Dashboard consolidado tiempo real
   - Métricas cumplimiento por holding
   - Alertas proactivas para directorio

### 🏆 **CASOS DE USO CORPORATIVOS:**

**Grupo Empresarial con 15 empresas:**
- Configuración inicial: 2 días
- Onboarding nuevas empresas: 30 minutos c/u
- Gestión usuarios: Interface unificada
- **ROI:** 300% reducción tiempo administrativo

---

## ❓ **PREGUNTA PARA CONTINUAR:**

**¿Te parece bien esta propuesta?** 

Si apruebas, comenzaré implementando:

1. **🔒 Autenticación administrativa** 
2. **🏛️ Layout base del módulo admin**
3. **🏢 CRUD de holdings** como primer módulo

**¿Alguna modificación o priorización específica que prefieras?**