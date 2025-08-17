# 🚀 SISTEMA LPDP COMPLETO - Ley 21.719

## 📋 Descripción General

Sistema integral de cumplimiento de la **Ley de Protección de Datos Personales de Chile (Ley 21.719)**. Plataforma multi-tenant que permite a las empresas gestionar todos los aspectos relacionados con la protección de datos personales.

---

## 🏗️ Arquitectura del Sistema

### **Backend (FastAPI + PostgreSQL)**
- **Framework**: FastAPI con Python 3.9+
- **Base de Datos**: PostgreSQL con esquemas multi-tenant
- **Autenticación**: JWT con roles y permisos granulares
- **Encriptación**: AES-128 para datos sensibles
- **API**: RESTful con documentación automática (Swagger/OpenAPI)

### **Frontend (React + Material-UI)**
- **Framework**: React 18 con hooks
- **UI Library**: Material-UI (MUI) v5
- **Estado**: Context API + useReducer
- **Routing**: React Router v6
- **Responsive**: Mobile-first design

### **Módulos Funcionales**
1. **Consentimientos** - Gestión de consentimientos de tratamiento
2. **ARCOPOL** - Ejercicio de derechos ARCO
3. **Inventario** - Registro de Actividades de Tratamiento (RAT)
4. **Brechas** - Gestión de incidentes de seguridad
5. **DPIA** - Evaluaciones de Impacto en Protección de Datos
6. **Transferencias** - Transferencias internacionales de datos
7. **Auditoría** - Sistema de auditoría y cumplimiento

---

## 🚀 Instalación y Configuración

### **Prerrequisitos**
- Python 3.9+
- PostgreSQL 13+
- Node.js 16+
- npm o yarn

### **1. Clonar el Repositorio**
```bash
git clone <repository-url>
cd Sistema-LPDP
```

### **2. Configurar Backend**
```bash
cd backend

# Crear entorno virtual
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp env.example .env
# Editar .env con tus configuraciones
```

### **3. Configurar Base de Datos**
```bash
# Crear base de datos PostgreSQL
createdb lpdp_master

# Ejecutar script de inicialización
python scripts/init_db_complete.py
```

### **4. Configurar Frontend**
```bash
cd ../frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con la URL del backend
```

---

## 🔧 Configuración de Variables de Entorno

### **Backend (.env)**
```env
# Base de Datos
DATABASE_URL=postgresql://usuario:password@localhost:5432/lpdp_master
DATABASE_URL_MASTER=postgresql://usuario:password@localhost:5432/lpdp_master

# Seguridad
SECRET_KEY=tu_clave_secreta_muy_larga_y_compleja_aqui_2024
LICENSE_ENCRYPTION_KEY=tu_clave_de_encriptacion_32_caracteres_aqui_2024

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASSWORD=tu_password_de_aplicacion

# Configuración del Sistema
ENVIRONMENT=development
DEBUG=true
HOST=0.0.0.0
PORT=8000
```

### **Frontend (.env)**
```env
REACT_APP_API_URL=http://localhost:8000/api/v1
REACT_APP_APP_NAME=Sistema LPDP
REACT_APP_VERSION=1.0.0
```

---

## 🚀 Iniciar el Sistema

### **Opción 1: Script Automático**
```bash
cd backend
python start_system.py
```

### **Opción 2: Inicio Manual**
```bash
# Terminal 1 - Backend
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2 - Frontend
cd frontend
npm start
```

---

## 🔐 Credenciales de Acceso

### **Usuarios de Demostración**
| Usuario | Contraseña | Rol | Descripción |
|---------|------------|-----|-------------|
| `admin` | `Admin123!` | Superadministrador | Acceso completo al sistema |
| `gerente` | `Gerente123!` | Administrador | Gestión de empresa |
| `dpo` | `DPO123!` | DPO | Data Protection Officer |
| `usuario1` | `Usuario123!` | Usuario | Usuario estándar |
| `usuario2` | `Usuario123!` | Usuario | Usuario estándar |

---

## 📚 Documentación de la API

### **Swagger UI**
- **URL**: http://localhost:8000/api/docs
- **Descripción**: Documentación interactiva de la API

### **ReDoc**
- **URL**: http://localhost:8000/api/redoc
- **Descripción**: Documentación alternativa de la API

### **OpenAPI JSON**
- **URL**: http://localhost:8000/api/openapi.json
- **Descripción**: Especificación OpenAPI en formato JSON

---

## 🏢 Estructura Multi-Tenant

### **Esquemas de Base de Datos**
- **Master**: `public` - Gestión de tenants y usuarios
- **Tenants**: `tenant_{id}` - Datos específicos de cada empresa

### **Aislamiento de Datos**
- Cada empresa tiene su propio esquema
- Usuarios solo acceden a datos de su tenant
- Superusuarios pueden acceder a todos los tenants

---

## 🔒 Sistema de Seguridad

### **Autenticación**
- JWT tokens con expiración configurable
- Refresh tokens para sesiones largas
- Bloqueo por intentos fallidos

### **Autorización**
- Roles predefinidos (Superadmin, Admin, DPO, Usuario)
- Permisos granulares por módulo y acción
- Verificación de acceso a módulos licenciados

### **Encriptación**
- Contraseñas hasheadas con bcrypt
- Datos sensibles encriptados con AES-128
- Claves de licencia encriptadas

---

## 📊 Módulo de Inventario (RAT)

### **Características Principales**
- **Plantillas Descargables**: Excel con formato profesional
- **Entrevista Guiada**: Wizard de 8 pasos adaptativo
- **Ejemplos por Industria**: Casos reales aplicables
- **Import/Export**: Carga masiva y exportación en múltiples formatos

### **Flujo de Trabajo**
1. **Descargar Plantilla** o **Ver Ejemplos**
2. **Entrevista Guiada** o **Completar Excel**
3. **Importar Datos** al sistema
4. **Revisar y Validar** información
5. **Exportar RAT** finalizado

### **Formatos de Salida**
- Excel formateado profesionalmente
- JSON estructurado para integraciones
- PDF con informe ejecutivo

---

## 🧪 Testing

### **Backend**
```bash
cd backend
pytest
```

### **Frontend**
```bash
cd frontend
npm test
```

---

## 📦 Despliegue

### **Desarrollo Local**
```bash
# Backend
cd backend
python start_system.py

# Frontend
cd frontend
npm start
```

### **Producción**
```bash
# Backend
cd backend
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker

# Frontend
cd frontend
npm run build
# Servir archivos estáticos con nginx o similar
```

---

## 🔧 Mantenimiento

### **Backup de Base de Datos**
```bash
# Backup completo
pg_dump lpdp_master > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup por tenant
pg_dump -n tenant_demo > tenant_demo_backup.sql
```

### **Logs del Sistema**
- **Backend**: `backend/logs/`
- **Frontend**: Console del navegador
- **Base de Datos**: Logs de PostgreSQL

---

## 🆘 Solución de Problemas

### **Problemas Comunes**

#### **1. Error de Conexión a Base de Datos**
```bash
# Verificar que PostgreSQL esté ejecutándose
sudo systemctl status postgresql

# Verificar credenciales en .env
# Probar conexión manual
psql -h localhost -U usuario -d lpdp_master
```

#### **2. Error de Dependencias**
```bash
# Reinstalar dependencias
pip install -r requirements.txt --force-reinstall

# Verificar versión de Python
python --version  # Debe ser 3.9+
```

#### **3. Error de Permisos**
```bash
# Verificar permisos de archivos
chmod +x scripts/*.py
chmod +x start_system.py
```

---

## 📞 Soporte

### **Documentación**
- **README**: Este archivo
- **API Docs**: http://localhost:8000/api/docs
- **Código**: Comentarios en el código fuente

### **Contacto**
- **Desarrollador**: Tu equipo de desarrollo
- **Email**: soporte@lpdp.cl
- **Issues**: GitHub Issues del proyecto

---

## 🎯 Próximos Pasos

### **Mejoras Planificadas**
1. **Dashboard Avanzado**: Métricas y KPIs en tiempo real
2. **Notificaciones**: Sistema de alertas y recordatorios
3. **Integraciones**: APIs para sistemas externos
4. **Mobile App**: Aplicación móvil nativa
5. **Machine Learning**: Análisis automático de riesgos

### **Módulos Adicionales**
1. **Capacitación**: Sistema de entrenamiento para empleados
2. **Incidentes**: Gestión avanzada de brechas de seguridad
3. **Compliance**: Verificación automática de cumplimiento
4. **Reporting**: Reportes regulatorios automáticos

---

## 📄 Licencia

Este proyecto está bajo la licencia [MIT](LICENSE).

---

## 🙏 Agradecimientos

- **Ley 21.719**: Marco legal chileno de protección de datos
- **FastAPI**: Framework web moderno y rápido
- **Material-UI**: Componentes de UI profesionales
- **Comunidad Open Source**: Contribuciones y librerías

---

**🎉 ¡El Sistema LPDP está listo para usar!**
