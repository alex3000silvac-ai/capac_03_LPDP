# 🔧 CONFIGURACIÓN DE VARIABLES DE ENTORNO EN RENDER

## Variables Requeridas en Render Dashboard

### 1. Configuración JWT
```
JWT_SECRET_KEY=tu-clave-secreta-super-segura-cambiar-en-produccion
TOKEN_EXPIRY_MINUTES=30
PASSWORD_SALT=mi-salt-unico-para-passwords
```

### 2. Configuración de la App
```
APP_TITLE=Sistema LPDP
APP_DESCRIPTION=Sistema de Cumplimiento Ley 21.719
APP_VERSION=1.0.0
APP_MESSAGE=Backend funcionando sin hardcodeo
ENVIRONMENT=production
```

### 3. CORS
```
ALLOWED_ORIGINS=https://scldp-frontend.onrender.com,http://localhost:3000
```

### 4. Usuarios (JSON)
```
USERS_CONFIG={"admin":{"password_hash":"a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3","email":"admin@empresa.cl","name":"Administrador","is_superuser":true,"permissions":["read","write","admin"]},"demo":{"password_hash":"5994471abb01112afcc18159f6cc74b4f511b99806da59b3caf5a9c173cacfc5","email":"demo@empresa.cl","name":"Usuario Demo","is_superuser":false,"permissions":["read"]},"dpo":{"password_hash":"8d23cf6c86e834a7aa6eded54c26ce2bb2e74903538c61bdd5d2197997ab2f72","email":"dpo@empresa.cl","name":"Data Protection Officer","is_superuser":false,"permissions":["read","write"]}}
```

### 5. Módulos (JSON)
```
MODULES_CONFIG=[{"id":"mod-001","name":"Introducción a la LPDP","status":"available"},{"id":"mod-002","name":"Derechos ARCOPOL","status":"available"},{"id":"mod-003","name":"Inventario de Datos","status":"available"}]
```

## 🔑 Credenciales de Login

Con esta configuración, las credenciales son:
- **admin** / **hello** (password_hash de "hello")
- **demo** / **secret** (password_hash de "secret") 
- **dpo** / **mypass** (password_hash de "mypass")

## 📋 Cómo Configurar en Render

1. Ve a tu servicio en Render Dashboard
2. Environment > Add Environment Variable
3. Copia cada variable de arriba
4. Save Changes
5. El servicio se redesplegará automáticamente

## 🔒 Generar Nuevos Password Hash

Para generar un hash de una nueva contraseña:

```python
import hashlib
password = "tu_nueva_password"
salt = "mi-salt-unico-para-passwords"  # Usar el mismo SALT
hash_result = hashlib.sha256((password + salt).encode()).hexdigest()
print(hash_result)
```

## ✅ Verificación

Después de configurar las variables, el endpoint `/` debe retornar:
```json
{
  "message": "Backend funcionando sin hardcodeo",
  "status": "online",
  "version": "1.0.0",
  "environment": "production"
}
```