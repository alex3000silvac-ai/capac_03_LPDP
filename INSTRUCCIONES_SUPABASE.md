# 🚀 CONFIGURACIÓN COMPLETA DEL SISTEMA LPDP CON SUPABASE

## 🎯 **OBJETIVO**
Conectar tu frontend en Render con tu base de datos en Supabase para que puedas acceder al sistema.

## 📋 **PASOS PARA CONFIGURAR**

### **PASO 1: Obtener Credenciales de Supabase**

1. **Ir a tu proyecto en Supabase**: https://supabase.com/dashboard
2. **Seleccionar tu proyecto**
3. **Ir a Settings > Database**
4. **Copiar la Connection String**

### **PASO 2: Configurar Variables de Entorno**

En tu proyecto de Render, configurar estas variables:

```bash
# Base de datos Supabase
DATABASE_URL=postgresql://postgres.[TU_PASSWORD]@db.[TU_PROJECT_ID].supabase.co:5432/postgres

# JWT
SECRET_KEY=tu_clave_secreta_muy_larga_y_segura_aqui_cambiala_en_produccion

# Sistema
ENVIRONMENT=production
DEBUG=false

# CORS
ALLOWED_ORIGINS=https://scldp-frontend.onrender.com
```

### **PASO 3: Crear Usuarios en Supabase**

1. **Ir a SQL Editor en Supabase**
2. **Ejecutar el script `CREATE_USERS_SUPABASE.sql`**
3. **Verificar que se crearon los usuarios**

### **PASO 4: Credenciales de Acceso**

Una vez configurado, podrás acceder con:

#### **👑 SUPER ADMINISTRADOR**
```
Username: admin
Password: Admin123!
```

#### **👤 USUARIO DEMO**
```
Username: demo
Password: Demo123!
```

#### **🔒 DATA PROTECTION OFFICER**
```
Username: dpo
Password: Dpo123!
```

## 🔧 **CONFIGURACIÓN ALTERNATIVA (Desarrollo Local)**

### **Opción A: Backend Local + Supabase Remoto**

1. **Crear archivo `.env` en el directorio `backend/`**:
```bash
DATABASE_URL=postgresql://postgres.[TU_PASSWORD]@db.[TU_PROJECT_ID].supabase.co:5432/postgres
SECRET_KEY=tu_clave_secreta_muy_larga_y_segura_aqui_cambiala_en_produccion
ENVIRONMENT=development
DEBUG=true
ALLOWED_ORIGINS=https://scldp-frontend.onrender.com,http://localhost:3000
```

2. **Ejecutar backend localmente**:
```bash
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

3. **Configurar frontend para usar backend local**:
   - Cambiar `REACT_APP_API_URL` a `http://localhost:8000/api/v1`

### **Opción B: Todo en Render (Recomendado para Producción)**

1. **Desplegar backend en Render**
2. **Configurar variables de entorno en Render**
3. **Conectar frontend con backend de Render**

## 🎯 **VERIFICACIÓN DEL SISTEMA**

### **1. Verificar Backend**
```bash
curl http://localhost:8000/docs
# Debe mostrar la documentación de FastAPI
```

### **2. Verificar Base de Datos**
```sql
-- En Supabase SQL Editor
SELECT username, email, is_active, is_superuser 
FROM users 
WHERE username IN ('admin', 'demo', 'dpo');
```

### **3. Verificar Login**
```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: demo" \
  -d '{"username": "admin", "password": "Admin123!", "tenant_id": "demo"}'
```

## 🚨 **PROBLEMAS COMUNES Y SOLUCIONES**

### **Error: "Failed to fetch"**
- ✅ **Solución**: Verificar que el backend esté ejecutándose
- ✅ **Verificar**: URL del backend en la configuración del frontend

### **Error: "Connection refused"**
- ✅ **Solución**: Verificar que el puerto 8000 esté libre
- ✅ **Verificar**: Firewall y configuraciones de red

### **Error: "Database connection failed"**
- ✅ **Solución**: Verificar `DATABASE_URL` en Supabase
- ✅ **Verificar**: Credenciales y permisos de la base de datos

### **Error: "Table users does not exist"**
- ✅ **Solución**: Ejecutar migraciones de Alembic
- ✅ **Comando**: `alembic upgrade head`

## 📱 **ACCESO AL FRONTEND**

Una vez configurado todo:

1. **Ir a**: https://scldp-frontend.onrender.com/login
2. **Usar credenciales**: admin/Admin123!
3. **¡Acceder al sistema completo!**

## 🎉 **RESULTADO ESPERADO**

- ✅ **Frontend**: Funcionando en Render
- ✅ **Backend**: Conectado a Supabase
- ✅ **Base de datos**: Usuarios creados y funcionales
- ✅ **Sistema**: Completamente operativo

---

## 🆘 **SOPORTE INMEDIATO**

Si sigues teniendo problemas:

1. **Verificar logs del backend**
2. **Verificar conexión a Supabase**
3. **Verificar variables de entorno**
4. **Verificar que las migraciones se hayan ejecutado**

**¡Con esta configuración deberías poder acceder inmediatamente al sistema!** 🚀
