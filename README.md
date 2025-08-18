# Sistema LPDP - Ley 21.719

Sistema integral de cumplimiento de la Ley de Protección de Datos Personales de Chile.

## 🚀 Stack Tecnológico

**Backend:** FastAPI + PostgreSQL + SQLAlchemy  
**Frontend:** React 18 + JavaScript  
**Deploy:** Render (automatizado)

## 📁 Estructura del Proyecto

```
/
├── backend/          # API FastAPI
│   ├── app/          # Código de la aplicación
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/         # App React
│   ├── src/          # Código fuente
│   ├── package.json
│   └── build/        # Build de producción
├── render.yaml       # Configuración de deploy
└── README.md
```

## 🔧 Configuración Rápida

### Local Development

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend  
cd frontend
npm install
npm start
```

### Production (Render)

El deploy es automático con `render.yaml`. Solo configura estas variables:

**Backend:**
- `DATABASE_URL`: URL de PostgreSQL/Supabase
- `SECRET_KEY`: Clave secreta para JWT

**Frontend:**
- `REACT_APP_API_URL`: URL del backend

## 👥 Usuarios por Defecto

- **admin** / **Admin123!** (Administrador)
- **demo** / **Demo123!** (Demo)
- **dpo** / **Dpo123!** (Data Protection Officer)

## 📚 Funcionalidades

✅ Multi-tenant  
✅ Inventario de datos personales  
✅ Evaluaciones DPIA  
✅ Sistema de capacitación  
✅ Auditoría completa  
✅ Gestión de brechas  
✅ Reportes de cumplimiento

## 🔗 Enlaces

- **API Docs:** `/api/docs`
- **Health Check:** `/health`

---

**Versión:** 3.0.0 | **Estado:** Producción