# 🏛️ Sistema de Cumplimiento Ley 21.719 - Protección de Datos Personales Chile

Sistema empresarial **multi-tenant completamente funcional** para capacitación y cumplimiento de la Ley 21.719. Diseñado para soportar múltiples empresas con aislamiento total de datos y gestión automatizada.

## 🌟 Características Principales

### Sistema Multi-tenant Real
- **Aislamiento completo**: Cada empresa tiene su propio esquema en la base de datos
- **Gestión de licencias**: Control de acceso por módulos con licencias encriptadas
- **Escalabilidad**: Soporta cientos de empresas con millones de registros
- **Seguridad**: Encriptación AES-256 para datos sensibles

### 7 Módulos Funcionales (NO es una maqueta)
1. **Gestión de Consentimientos** - Captura y gestión GDPR-compliant
2. **Derechos ARCOPOL** - Gestión completa de solicitudes
3. **Inventario de Datos** - Mapeo y clasificación de activos
4. **Notificación de Brechas** - Gestión de incidentes en 72 horas
5. **Evaluaciones de Impacto (DPIA)** - Wizard guiado
6. **Transferencias Internacionales** - Control y garantías
7. **Auditoría y Cumplimiento** - Logs inmutables y reportes

### Plataforma de Administración
- **Super Admin**: Gestión de todos los tenants
- **Admin por Empresa**: Control total de su organización
- **Control de Accesos**: Por módulo y tiempo
- **Dashboard**: Métricas y cumplimiento en tiempo real

## 🚀 Instalación Rápida

### Opción 1: Script Automatizado (Recomendado)

```bash
# Instalar dependencias del script
pip install psycopg2-binary python-dotenv

# Ejecutar el script de deployment
python scripts/deploy_to_supabase.py
```

El script:
1. Crea todas las tablas en tu Supabase
2. Configura el archivo .env
3. Sube el código a GitHub
4. Te guía para el deployment en Render

### Opción 2: Manual

1. **Base de Datos (Supabase)**
   - Crea un proyecto en [Supabase](https://supabase.com)
   - Ejecuta `database/init_multitenant.sql` en el SQL Editor

2. **Backend**
   ```bash
   cd backend
   pip install -r requirements.txt
   cp .env.example .env
   # Editar .env con tus credenciales
   python scripts/init_db.py
   uvicorn app.main:app --reload
   ```

3. **Frontend**
   ```bash
   cd frontend
   npm install
   npm start
   ```

## 🔧 Configuración

### Variables de Entorno Requeridas

```env
DATABASE_URL=postgresql://user:pass@host/dbname
SECRET_KEY=clave-segura-32-caracteres
LICENSE_ENCRYPTION_KEY=otra-clave-segura
ADMIN_EMAIL=admin@tudominio.cl
ADMIN_PASSWORD=PasswordSeguro123!
```

### Primer Acceso

1. **Tenant Demo** (creado automáticamente):
   - Usuario: `admin`
   - Password: `Admin123!`
   - 30 días de prueba con todos los módulos

2. **Super Admin**:
   - Usuario: `superadmin`
   - Password: Configurado en ADMIN_PASSWORD

## 📋 Uso del Sistema

### Para Empresas

1. **Activar Licencia**
   ```
   POST /api/v1/empresas/licencias/activate
   {
     "codigo_licencia": "JD-XXXX-XXXX-XXXX"
   }
   ```

2. **Acceder a Módulos**
   - El sistema valida automáticamente el acceso
   - Muestra solo módulos con licencia activa

### Para Administradores

1. **Crear Nueva Empresa**
   ```
   POST /api/v1/tenants/
   {
     "tenant_id": "empresa1",
     "company_name": "Mi Empresa SpA",
     "rut": "76.123.456-7"
   }
   ```

2. **Generar Licencia**
   ```
   POST /api/v1/empresas/licencias/
   {
     "empresa_id": "uuid",
     "modulos": ["MOD-1", "MOD-2"],
     "duracion_meses": 12
   }
   ```

## 🏗️ Arquitectura

```
┌─────────────────────────────────────┐
│          Frontend (React)           │
├─────────────────────────────────────┤
│           API (FastAPI)             │
├─────────────────────────────────────┤
│    PostgreSQL Multi-tenant          │
│  ┌─────────┐ ┌─────────┐           │
│  │ Tenant 1│ │ Tenant 2│ ...       │
│  └─────────┘ └─────────┘           │
└─────────────────────────────────────┘
```

## 📚 API Documentation

- Swagger UI: `http://localhost:8000/api/v1/docs`
- ReDoc: `http://localhost:8000/api/v1/redoc`

## 🔒 Seguridad

- JWT con refresh tokens
- Encriptación AES-256 para PII
- Auditoría inmutable con integridad blockchain-like
- Rate limiting y protección OWASP
- Aislamiento total entre tenants

## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este es software propietario. Todos los derechos reservados.

## 🆘 Soporte

- Email: soporte@juridicadigital.cl
- Issues: [GitHub Issues](https://github.com/tuusuario/turepositorio/issues)

---

**⚠️ IMPORTANTE**: Este es un sistema COMPLETAMENTE FUNCIONAL diseñado para cumplimiento real de la Ley 21.719. No es una demostración o mockup. Cada módulo genera documentos legales válidos y mantiene registros auditables.