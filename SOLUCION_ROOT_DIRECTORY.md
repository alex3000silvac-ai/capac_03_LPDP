# 🔧 SOLUCIÓN ROOT DIRECTORY - RENDER

## ❌ **PROBLEMA:**
```
ERROR: Could not import module "main"
```

## ✅ **CAUSA:**
Render busca `main.py` en la raíz del repo, pero está en `/backend/main.py`

## 🚀 **SOLUCIÓN INMEDIATA:**

### **PASO 1: CONFIGURAR ROOT DIRECTORY**

En tu **Backend Service en Render:**

1. **Settings → Build & Deploy**
2. **Root Directory:** `backend`
3. **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. **Deploy Manual**

### **PASO 2: ESTRUCTURA CORRECTA**

Con Root Directory = `backend`, Render buscará:
```
/backend/main.py ✅ (existe)
/backend/requirements.txt ✅ (existe)
```

### **PASO 3: VERIFICACIÓN**

Después del deploy:
```
==> Running 'uvicorn main:app --host 0.0.0.0 --port $PORT'
INFO: Started server process
==> Your service is live 🎉
```

---

## 🎯 **CONFIGURACIÓN FINAL RENDER:**

**Build & Deploy:**
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Root Directory:** `backend`

**Environment:**
- `ENVIRONMENT=production`

---

## ✅ **RESULTADO ESPERADO:**

1. ✅ Render encuentra `main.py` en `/backend/`
2. ✅ Backend inicia correctamente  
3. ✅ Login funciona: **admin** / **Admin123!**
4. ✅ Error "Failed to fetch" resuelto

---

## 📞 **ALTERNATIVA SI NO FUNCIONA:**

**Start Command alternativo:**
```
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Pero la **OPCIÓN RECOMENDADA** es configurar Root Directory = `backend`

---

**🎯 Configura Root Directory = `backend` y haz Deploy Manual**