# 🚀 INSTALACIÓN SIMPLE - SISTEMA LPDP v2.0

## 📋 Pasos para Instalar

### 1. Base de Datos Supabase

1. **Ir a [Supabase](https://supabase.com/)**
2. **Crear nuevo proyecto o usar existente**
3. **Ir a SQL Editor**
4. **Ejecutar el archivo completo:** `database/SCHEMA_COMPLETO.sql`

```sql
-- Copiar y pegar todo el contenido de SCHEMA_COMPLETO.sql
-- Ejecutar en SQL Editor de Supabase
```

### 2. Backend Node.js

```bash
# 1. Instalar dependencias
cd backend
npm install

# 2. Configurar variables de entorno
cp .env.example .env

# Editar .env con tus datos:
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_ANON_KEY=eyJ...
JWT_SECRET=tu-jwt-secret-muy-seguro-2024

# 3. Iniciar servidor
npm start
```

### 3. Frontend (Actualizar configuración)

```javascript
// frontend/src/config.js
export const API_BASE_URL = 'http://localhost:8000/api'; // Desarrollo
// export const API_BASE_URL = 'https://tu-backend.render.com/api'; // Producción
```

## ✅ Verificación

### Backend funcionando:
```bash
curl http://localhost:8000/health
# Debe devolver: {"status":"healthy"...}
```

### Login de prueba:
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@juridicadigital.cl","password":"Admin123!","tenant_id":"juridica_digital_spa"}'
```

## 🎯 URLs Importantes

- **Backend:** http://localhost:8000
- **Health Check:** http://localhost:8000/health
- **API Base:** http://localhost:8000/api
- **Login:** POST /api/auth/login
- **RATs:** GET /api/rat

## 📁 Archivos Principales

- `database/SCHEMA_COMPLETO.sql` - **Ejecutar en Supabase**
- `backend/.env` - **Configurar con tus datos**
- `backend/src/app.js` - Aplicación principal
- `INSTRUCCIONES_COMPLETAS.md` - Documentación detallada

## 🚨 Credenciales por Defecto

- **Email:** admin@juridicadigital.cl
- **Password:** Admin123!
- **Tenant:** juridica_digital_spa

**¡CAMBIAR INMEDIATAMENTE EN PRODUCCIÓN!**

---

## ⚡ Instalación Automática

```bash
./install-backend.sh
```

¡Eso es todo! El sistema estará funcionando.