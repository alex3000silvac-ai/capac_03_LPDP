# 🔐 VARIABLES DE ENTORNO PARA RENDER

## ⚠️ CONFIGURACIÓN CRÍTICA - SEGURIDAD

El sistema requiere configuración de variables de entorno en Render Dashboard.
**NUNCA** incluyas claves reales en archivos de código.

## 🎯 PASOS EN RENDER:

1. **Ir a Render Dashboard:**
   - https://dashboard.render.com
   - Seleccionar el servicio `scldp-frontend`

2. **Ir a Environment:**
   - Click en "Environment" en el menú lateral

3. **Agregar Variables:**

### 📋 VARIABLES REQUERIDAS:

```
REACT_APP_SUPABASE_URL=[CONFIGURAR_EN_RENDER]
```

```
REACT_APP_SUPABASE_ANON_KEY=[CONFIGURAR_EN_RENDER]
```

⚠️ **IMPORTANTE:** Obtén las claves reales desde:
- Supabase Dashboard > Settings > API
- NUNCA las incluyas en archivos de código
- SIEMPRE configúralas directamente en Render

4. **Click "Save Changes"**

5. **El servicio se redesplegará automáticamente**

## 🔍 VERIFICACIÓN:

Después del redespliegue, la aplicación debe funcionar en:
https://scldp-frontend.onrender.com

## 🆘 SI HAY ERROR:

Si ves error de "Variables de entorno no configuradas":
1. Verificar que las variables estén exactamente como se muestran arriba
2. Esperar que el redespliegue termine completamente
3. Refrescar la página

## 🔒 NOTA DE SEGURIDAD:

- La clave ANON_KEY es pública y segura para usar en frontend
- Está protegida por Row Level Security (RLS) en Supabase
- Solo permite operaciones autenticadas por usuario
- No es una clave secreta, es la clave anónima de acceso público