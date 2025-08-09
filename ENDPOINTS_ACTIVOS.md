# 📋 Endpoints Activos - Sistema de Capacitación LPDP

## ✅ Endpoints Funcionales

### 🔐 Autenticación
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Refresh token
- `POST /api/v1/auth/logout` - Logout

### 🏢 Administración Comercial
- `GET /api/v1/admin-comercial/dashboard` - Dashboard admin
- `POST /api/v1/admin-comercial/empresas` - Crear empresa
- `GET /api/v1/admin-comercial/empresas` - Listar empresas
- `POST /api/v1/admin-comercial/licencias/{empresa_id}` - Crear licencia

### 👥 Usuarios
- `GET /api/v1/users/me` - Usuario actual
- `POST /api/v1/users` - Crear usuario
- `GET /api/v1/users` - Listar usuarios
- `PUT /api/v1/users/{user_id}` - Actualizar usuario

### 🏭 Empresas
- `GET /api/v1/empresas` - Listar empresas
- `GET /api/v1/empresas/{empresa_id}` - Detalle empresa
- `GET /api/v1/empresas/{empresa_id}/modulos` - Módulos activos

### 📚 Sistema de Capacitación
- `GET /api/v1/capacitacion/modulos` - Listar módulos
- `GET /api/v1/capacitacion/modulos/{codigo}` - Detalle módulo
- `GET /api/v1/capacitacion/modulos/{codigo}/contenido` - Contenido del módulo
- `POST /api/v1/capacitacion/progreso` - Registrar progreso
- `GET /api/v1/capacitacion/progreso/{modulo}` - Ver progreso
- `GET /api/v1/capacitacion/recursos/{modulo}` - Recursos descargables

### Módulos Específicos:

#### 📝 MOD-1: Consentimientos
- `GET /api/v1/consentimientos` - Listar consentimientos
- `POST /api/v1/consentimientos` - Crear consentimiento
- `GET /api/v1/consentimientos/{id}` - Detalle consentimiento

#### 🔒 MOD-2: Derechos ARCOPOL
- `GET /api/v1/arcopol/solicitudes` - Listar solicitudes
- `POST /api/v1/arcopol/solicitudes` - Crear solicitud
- `PUT /api/v1/arcopol/solicitudes/{id}/responder` - Responder solicitud

#### 📊 MOD-3: Inventario de Datos
- `GET /api/v1/inventario/actividades` - Listar actividades
- `POST /api/v1/inventario/actividades` - Crear actividad
- `GET /api/v1/inventario/categorias` - Categorías de datos

#### 🚨 MOD-4: Notificación de Brechas
- `GET /api/v1/brechas` - Listar brechas
- `POST /api/v1/brechas` - Reportar brecha
- `PUT /api/v1/brechas/{id}/actualizar` - Actualizar brecha

#### 📋 MOD-5: Evaluaciones DPIA
- `GET /api/v1/dpia` - Listar evaluaciones
- `POST /api/v1/dpia` - Crear evaluación
- `GET /api/v1/dpia/{id}` - Detalle evaluación

#### 🌍 MOD-6: Transferencias Internacionales
- `GET /api/v1/transferencias` - Listar transferencias
- `POST /api/v1/transferencias` - Crear transferencia
- `PUT /api/v1/transferencias/{id}` - Actualizar transferencia

#### 🔍 MOD-7: Auditoría
- `GET /api/v1/auditoria/logs` - Logs de auditoría
- `GET /api/v1/auditoria/metricas` - Métricas de cumplimiento
- `POST /api/v1/auditoria/reportes` - Generar reporte

### 🎤 Entrevistas
- `GET /api/v1/entrevistas/sesiones` - Listar sesiones
- `POST /api/v1/entrevistas/iniciar` - Iniciar entrevista
- `POST /api/v1/entrevistas/responder` - Guardar respuesta

## ❌ Endpoints Deshabilitados

Los siguientes endpoints fueron comentados por conflictos con los modelos antiguos:
- `/api/v1/actividades` - Conflicto con inventario
- `/api/v1/categorias` - Usa modelos antiguos
- `/api/v1/reportes` - Usa ActividadDato que no existe

## 🔧 Documentación Interactiva

- Swagger UI: `https://tu-app.onrender.com/docs`
- ReDoc: `https://tu-app.onrender.com/redoc`

## 📌 Notas Importantes

1. Todos los endpoints requieren autenticación excepto `/auth/login`
2. Use el token JWT en el header: `Authorization: Bearer <token>`
3. Los módulos están disponibles según la licencia de cada empresa
4. El sistema es multi-tenant con aislamiento por esquemas