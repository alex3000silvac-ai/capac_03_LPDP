# 🚀 Backend Sistema LPDP v2.0

Backend completamente nuevo construido desde cero para el Sistema LPDP (Ley de Protección de Datos Personales de Chile).

## 📋 Características

- **Arquitectura**: Node.js + Express + Supabase
- **Autenticación**: JWT con refresh tokens
- **Base de datos**: PostgreSQL (Supabase)
- **Multi-tenant**: Aislamiento completo por organización
- **Seguridad**: Row Level Security (RLS), validación completa
- **API RESTful**: Endpoints organizados por funcionalidad
- **Auditoría**: Logging completo de todas las operaciones

## 🏗️ Estructura del Proyecto

```
backend/
├── src/
│   ├── app.js                 # Aplicación principal
│   ├── config/
│   │   └── database.js        # Configuración Supabase
│   ├── middleware/
│   │   ├── auth.js           # Autenticación JWT
│   │   ├── tenant.js         # Multi-tenant
│   │   ├── validation.js     # Validación Joi
│   │   └── errorHandler.js   # Manejo de errores
│   ├── routes/
│   │   ├── auth.js          # Autenticación
│   │   ├── rat.js           # RATs (Registro Actividades)
│   │   ├── admin.js         # Administración
│   │   ├── dashboard.js     # Estadísticas
│   │   ├── audit.js         # Auditoría
│   │   └── health.js        # Health checks
│   └── utils/
│       └── migration.js     # Migraciones DB
├── database/
│   ├── schema/              # Esquemas SQL
│   └── seeds/              # Datos iniciales
├── package.json
└── server.js               # Punto de entrada
```

## 🚀 Instalación

### 1. Instalar dependencias

```bash
cd backend
npm install
```

### 2. Configurar variables de entorno

Copiar `.env.example` a `.env` y configurar:

```env
# Puerto del servidor
PORT=8000
NODE_ENV=production

# Supabase Configuration
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# JWT Configuration
JWT_SECRET=tu-jwt-secret-muy-seguro-aqui-2024
JWT_EXPIRE_IN=24h

# CORS Configuration
FRONTEND_URLS=http://localhost:3000,https://tu-frontend.vercel.app
```

### 3. Configurar Base de Datos

```bash
# Ejecutar migraciones (crear tablas)
npm run db:migrate

# Cargar datos iniciales
npm run db:seed
```

### 4. Iniciar servidor

```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## 🔧 Scripts Disponibles

```bash
npm start          # Iniciar en producción
npm run dev        # Desarrollo con nodemon
npm test          # Ejecutar tests
npm run lint      # Verificar código
npm run db:migrate # Ejecutar migraciones
npm run db:seed   # Cargar datos iniciales
```

## 🌐 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario  
- `POST /api/auth/refresh` - Renovar token
- `POST /api/auth/logout` - Cerrar sesión

### RATs (Registro de Actividades de Tratamiento)
- `GET /api/rat` - Listar RATs
- `GET /api/rat/:id` - Obtener RAT por ID
- `POST /api/rat` - Crear nuevo RAT
- `PUT /api/rat/:id` - Actualizar RAT
- `DELETE /api/rat/:id` - Eliminar RAT

### Dashboard
- `GET /api/dashboard/stats` - Estadísticas generales
- `GET /api/dashboard/trends` - Tendencias temporales
- `GET /api/dashboard/compliance` - Análisis de cumplimiento

### Administración
- `GET /api/admin/users` - Listar usuarios
- `POST /api/admin/users` - Crear usuario
- `PUT /api/admin/users/:id` - Actualizar usuario
- `GET /api/admin/organizations` - Listar organizaciones

### Auditoría
- `GET /api/audit` - Logs de auditoría
- `GET /api/audit/stats` - Estadísticas de auditoría
- `GET /api/audit/security/alerts` - Alertas de seguridad

### Health Check
- `GET /health` - Estado del servidor
- `GET /api/health` - Estado detallado

## 🔐 Autenticación

El sistema usa JWT con refresh tokens:

1. **Login**: Enviar credenciales a `/api/auth/login`
2. **Token**: Incluir `Authorization: Bearer <token>` en headers
3. **Refresh**: Renovar con `/api/auth/refresh` cuando expire
4. **Tenant**: Incluir `x-tenant-id` en headers para multi-tenant

### Ejemplo de uso:

```javascript
// Login
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password',
    tenant_id: 'mi_organizacion'
  })
});

// Usar token
const ratsResponse = await fetch('/api/rat', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'x-tenant-id': 'mi_organizacion'
  }
});
```

## 🏢 Multi-tenant

El sistema soporta múltiples organizaciones:

- Cada organización tiene su `tenant_id` único
- Los datos están completamente aislados por tenant
- Se usa Row Level Security (RLS) en PostgreSQL
- Los headers deben incluir `x-tenant-id`

## 🔒 Seguridad

### Implementadas:
- ✅ Row Level Security (RLS) en base de datos
- ✅ Validación de entrada con Joi
- ✅ Rate limiting
- ✅ Helmet para headers de seguridad
- ✅ CORS configurado
- ✅ Logs de auditoría completos
- ✅ Encriptación de contraseñas (bcrypt)
- ✅ Tokens JWT seguros

### Headers de seguridad:
- Content Security Policy
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy

## 📊 Logging y Monitoreo

### Logs de auditoría incluyen:
- Todas las operaciones CRUD
- Intentos de login (exitosos y fallidos)
- Cambios de configuración
- Acceso a datos sensibles
- Errores y excepciones

### Health checks:
- Estado de conexión a base de datos
- Memoria y rendimiento
- Tiempo de respuesta
- Verificación de servicios externos

## 🚀 Despliegue

### Render.com (recomendado)
```yaml
# render.yaml
services:
  - type: web
    name: lpdp-backend
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
```

### Variables de entorno en producción:
- Configurar `SUPABASE_URL` y claves
- Generar `JWT_SECRET` seguro
- Configurar `FRONTEND_URLS` con dominio real
- Establecer `NODE_ENV=production`

## 🛠️ Desarrollo

### Estructura de datos confirmada del frontend:
- Tabla principal: `mapeo_datos_rat`
- Campos JSONB para datos complejos
- tenant_id como INTEGER (no UUID)
- Estados: BORRADOR, ACTIVO, INACTIVO, ARCHIVADO
- Niveles de riesgo: BAJO, MEDIO, ALTO, CRÍTICO

### Comandos útiles:
```bash
# Ver logs en tiempo real
npm run dev

# Verificar conexión DB
curl http://localhost:8000/health

# Probar login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@juridicadigital.cl","password":"Admin123!","tenant_id":"juridica_digital_spa"}'
```

## 📝 Notas Importantes

1. **Base de datos**: El esquema está optimizado para la estructura que espera el frontend
2. **tenant_id**: Usar INTEGER en lugar de UUID para compatibilidad
3. **Campos JSONB**: Mantener estructura exacta para categorias_datos
4. **Soft delete**: Usar deleted_at en lugar de eliminar registros
5. **Estados**: Usar valores exactos del frontend (MAYÚSCULAS)

## 🤝 Contribuir

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto es propiedad de **Jurídica Digital SPA** y está protegido por derechos de autor.