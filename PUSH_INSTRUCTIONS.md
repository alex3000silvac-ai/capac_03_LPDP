# 📤 Instrucciones para Push a GitHub

## 1. Configurar credenciales (si no lo has hecho)

```bash
# Configurar tu nombre y email
git config --global user.name "Tu Nombre"
git config --global user.email "tu-email@ejemplo.com"

# Para Windows/WSL, usar credential manager
git config --global credential.helper manager
```

## 2. Ver estado actual

```bash
# Ver commits pendientes
git status
git log --oneline -5

# Ver remote configurado
git remote -v
```

## 3. Hacer Push

```bash
# Push al repositorio
git push origin main

# Si pide credenciales:
# Username: tu-usuario-github
# Password: tu-token-personal (no tu contraseña)
```

## 4. Si necesitas crear un Personal Access Token

1. Ve a GitHub → Settings → Developer settings
2. Personal access tokens → Tokens (classic)
3. Generate new token
4. Selecciona permisos: `repo` (completo)
5. Copia el token y úsalo como password

## 5. Verificar en GitHub

1. Ve a tu repositorio en GitHub
2. Verifica que los commits aparezcan
3. Render detectará los cambios automáticamente

## 📋 Commits que se subirán:

- fix: comentar endpoint categorias que causa ImportError
- fix: resolver errores de despliegue en Render  
- fix: script para corregir estructura de base de datos
- fix: comentar endpoint reportes que causa ImportError
- docs: agregar documentación de despliegue exitoso
- docs: agregar lista de endpoints activos

## ⚡ Después del Push

Render automáticamente:
1. Detectará los cambios
2. Iniciará un nuevo build
3. Ejecutará el deployment
4. La app estará lista en ~5 minutos

¡Éxito! 🚀