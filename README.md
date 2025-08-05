# Sistema de Capacitación y Levantamiento de Datos Personales (SCLDP)

Sistema diseñado para guiar a las organizaciones en el proceso de descubrimiento, documentación y clasificación de datos personales según la Ley N° 21.719.

## Filosofía del Sistema

"No entregamos el pescado, enseñamos a pescar" - El sistema actúa como un asesor digital que guía al usuario paso a paso a través del proceso de levantamiento de datos.

## Estructura del Proyecto

```
/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── utils/
│   ├── alembic/
│   ├── tests/
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── modules/
│   │   ├── services/
│   │   └── utils/
│   ├── public/
│   └── package.json
├── database/
│   └── init.sql
├── docker/
├── docs/
└── docker-compose.yml
```

## Módulos Principales

1. **Módulo de Capacitación**: Guías interactivas y material educativo
2. **Módulo de Entrevistas Estructuradas**: Proceso guiado de levantamiento
3. **Módulo de Documentación RAT**: Registro de Actividades de Tratamiento
4. **Módulo de Visualización**: Mapeo y flujos de datos
5. **Módulo de Simulación**: Casos prácticos y ejercicios

## Stack Tecnológico

- **Backend**: Python 3.11 + FastAPI
- **Frontend**: React 18 + TypeScript + Material-UI
- **Base de Datos**: PostgreSQL 15
- **Contenedores**: Docker + Docker Compose