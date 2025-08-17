# 🔐 INSTRUCCIONES DE ACCESO AL SISTEMA LPDP

## 🚨 **PROBLEMA IDENTIFICADO**
No puedes acceder al sistema porque las credenciales no están configuradas correctamente.

## ✅ **SOLUCIÓN PASO A PASO**

### **PASO 1: Verificar que el Backend esté Ejecutándose**

```bash
# En una terminal, navegar al directorio backend
cd backend

# Ejecutar el servidor
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Verificar que aparezca:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### **PASO 2: Crear Usuarios en la Base de Datos**

#### **Opción A: Usar el Script Python (Recomendado)**

```bash
# En otra terminal, desde el directorio raíz
python create_users.py
```

#### **Opción B: Ejecutar SQL Directamente**

1. Conectar a tu base de datos PostgreSQL
2. Ejecutar el contenido de `create_simple_users.sql`

### **PASO 3: Credenciales de Acceso**

Una vez creados los usuarios, tendrás acceso con:

#### **👑 SUPER ADMINISTRADOR**
```
Username: admin
Password: Admin123!
Email: admin@lpdp.cl
```

#### **👤 USUARIO DEMO**
```
Username: demo
Password: Demo123!
Email: demo@lpdp.cl
```

#### **🔒 DATA PROTECTION OFFICER**
```
Username: dpo
Password: Dpo123!
Email: dpo@lpdp.cl
```

### **PASO 4: Acceder al Sistema**

#### **Frontend (Interfaz Web)**
1. Abrir navegador
2. Ir a: `http://localhost:3000` (si tienes el frontend ejecutándose)
3. Usar cualquiera de las credenciales arriba

#### **Backend API (Directo)**
```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: demo" \
  -d '{
    "username": "admin",
    "password": "Admin123!",
    "tenant_id": "demo"
  }'
```

## 🔧 **TROUBLESHOOTING**

### **Error: "No se puede conectar a la base de datos"**
- Verificar que PostgreSQL esté ejecutándose
- Verificar credenciales en `DATABASE_URL`
- Verificar que la base de datos `lpdp_db` exista

### **Error: "La tabla users no existe"**
```bash
cd backend
alembic upgrade head
```

### **Error: "Backend no responde"**
- Verificar que el servidor esté ejecutándose en puerto 8000
- Verificar logs del servidor
- Verificar que no haya conflictos de puerto

### **Error: "Credenciales inválidas"**
- Verificar que los usuarios se hayan creado correctamente
- Verificar que las contraseñas estén hasheadas
- Verificar que `is_active = true`

## 📋 **VERIFICACIÓN FINAL**

### **1. Verificar Backend**
```bash
curl http://localhost:8000/docs
# Debe mostrar la documentación de FastAPI
```

### **2. Verificar Base de Datos**
```sql
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

**Respuesta esperada:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer"
}
```

## 🎯 **PRÓXIMOS PASOS DESPUÉS DEL LOGIN**

1. **Crear tu primer tenant/empresa**
2. **Configurar usuarios adicionales**
3. **Personalizar configuraciones del sistema**
4. **Probar todas las funcionalidades**

## 📞 **SOPORTE**

Si sigues teniendo problemas:

1. **Verificar logs del backend** en la terminal
2. **Verificar conexión a la base de datos**
3. **Verificar que todas las dependencias estén instaladas**
4. **Verificar que las migraciones se hayan ejecutado**

---

## 🎉 **¡CON ESTAS CREDENCIALES DEBERÍAS PODER ACCEDER AL SISTEMA!**

**Recuerda: Las contraseñas son temporales. Cámbialas en producción.**
