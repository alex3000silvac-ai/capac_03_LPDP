# Manual Completo del Sistema de Capacitación y Levantamiento de Datos Personales (SCLDP)

## Tabla de Contenidos

1. [Introducción](#introducción)
2. [Objetivo del Sistema](#objetivo-del-sistema)
3. [Filosofía y Enfoque](#filosofía-y-enfoque)
4. [Arquitectura del Sistema](#arquitectura-del-sistema)
5. [Módulos Principales](#módulos-principales)
6. [Guía de Instalación](#guía-de-instalación)
7. [Manual de Uso](#manual-de-uso)
8. [API y Endpoints](#api-y-endpoints)
9. [Base de Datos](#base-de-datos)
10. [Seguridad y Auditoría](#seguridad-y-auditoría)
11. [Preguntas Frecuentes](#preguntas-frecuentes)
12. [Soporte y Contacto](#soporte-y-contacto)

---

## Introducción

El Sistema de Capacitación y Levantamiento de Datos Personales (SCLDP) es una plataforma educativa integral diseñada para ayudar a las organizaciones chilenas a comprender y cumplir con la Ley N° 21.719 de Protección de Datos Personales.

### Características Principales

- 🎓 **Capacitación Interactiva**: Módulos educativos gamificados
- 📋 **Levantamiento Guiado**: Proceso paso a paso para identificar datos personales
- 📊 **Registro de Actividades de Tratamiento (RAT)**: Documentación automatizada
- 🔍 **Simulaciones Prácticas**: Casos reales para practicar
- 📈 **Reportes y Visualizaciones**: Mapeo de flujos de datos
- 🔐 **Auditoría Completa**: Trazabilidad de todas las acciones

---

## Objetivo del Sistema

### Misión Principal
Democratizar el conocimiento sobre protección de datos personales, proporcionando herramientas prácticas y educativas que permitan a organizaciones de todos los tamaños cumplir con la legislación vigente.

### Objetivos Específicos

1. **Educar**: Proporcionar conocimiento claro y estructurado sobre la Ley 21.719
2. **Guiar**: Acompañar paso a paso en el proceso de levantamiento de datos
3. **Documentar**: Generar automáticamente la documentación requerida
4. **Practicar**: Ofrecer un entorno seguro para aprender haciendo
5. **Auditar**: Mantener registro completo de todas las actividades

---

## Filosofía y Enfoque

> **"No entregamos el pescado, enseñamos a pescar"**

El sistema no busca ser una solución mágica que resuelva todo automáticamente, sino un asesor digital que:

- **Empodera** a los usuarios con conocimiento
- **Desarrolla** competencias internas en la organización
- **Fomenta** una cultura de privacidad
- **Acompaña** sin crear dependencia

### Principios de Diseño

1. **Simplicidad**: Interfaz intuitiva y procesos claros
2. **Progresividad**: Aprendizaje paso a paso
3. **Interactividad**: Aprender haciendo
4. **Contextualización**: Ejemplos relevantes para Chile
5. **Gamificación**: Hacer el aprendizaje entretenido

---

## Arquitectura del Sistema

### Stack Tecnológico

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React 18)                   │
│  Material-UI │ React Router │ Recharts │ Framer Motion  │
├─────────────────────────────────────────────────────────┤
│                    NGINX (Reverse Proxy)                 │
├─────────────────────────────────────────────────────────┤
│                   BACKEND (FastAPI)                      │
│         Python 3.11 │ Pydantic │ SQLAlchemy            │
├─────────────────────────────────────────────────────────┤
│     PostgreSQL 15          │          Redis 7            │
└─────────────────────────────────────────────────────────┘
```

### Componentes Principales

1. **Frontend SPA**
   - React 18 con TypeScript
   - Material-UI para componentes
   - Recharts para visualizaciones
   - React Flow para diagramas de flujo

2. **API REST**
   - FastAPI con validación automática
   - Documentación OpenAPI (Swagger)
   - Autenticación JWT
   - Rate limiting

3. **Base de Datos**
   - PostgreSQL para datos persistentes
   - Redis para caché y sesiones
   - Migración con Alembic

4. **Infraestructura**
   - Docker Compose para orquestación
   - Nginx como reverse proxy
   - Healthchecks automáticos

---

## Módulos Principales

### 1. 📚 Módulo de Capacitación

**Objetivo**: Proporcionar formación interactiva sobre la Ley 21.719

**Funcionalidades**:
- Lecciones progresivas con teoría y práctica
- Videos explicativos y animaciones
- Evaluaciones interactivas
- Certificados de completitud
- Sistema de logros y gamificación

**Contenido**:
1. Introducción a la Protección de Datos
2. Principios Fundamentales
3. Derechos de los Titulares
4. Obligaciones del Responsable
5. Medidas de Seguridad
6. Casos Prácticos

### 2. 🎯 Módulo de Entrevistas Estructuradas

**Objetivo**: Guiar el proceso de levantamiento de información

**Funcionalidades**:
- Cuestionarios dinámicos por área
- Preguntas contextualizadas
- Sugerencias en tiempo real
- Grabación de respuestas
- Generación automática de actividades

**Proceso**:
1. Selección del área de negocio
2. Identificación de procesos
3. Descubrimiento de datos
4. Clasificación de sensibilidad
5. Documentación de flujos

### 3. 📋 Módulo de Registro de Actividades de Tratamiento (RAT)

**Objetivo**: Documentar todas las actividades de tratamiento de datos

**Funcionalidades**:
- Formularios inteligentes
- Validación de cumplimiento
- Versionado de documentos
- Exportación en múltiples formatos
- Alertas de actualización

**Elementos del RAT**:
- Identificación de la actividad
- Finalidades del tratamiento
- Base de licitud
- Categorías de datos
- Categorías de titulares
- Destinatarios
- Transferencias internacionales
- Plazos de conservación
- Medidas de seguridad

### 4. 🗺️ Módulo de Visualización y Mapeo

**Objetivo**: Representar gráficamente los flujos de datos

**Funcionalidades**:
- Diagramas de flujo interactivos
- Mapas de calor de riesgo
- Visualización de conexiones
- Análisis de impacto
- Exportación de diagramas

**Tipos de Visualización**:
- Flujo de datos entre sistemas
- Matriz de riesgo
- Timeline de retención
- Mapa de terceros
- Dashboard ejecutivo

### 5. 🎮 Módulo de Práctica Sandbox

**Objetivo**: Ambiente seguro para experimentar

**Funcionalidades**:
- Casos de uso predefinidos
- Datos ficticios realistas
- Simulación de incidentes
- Ejercicios prácticos
- Feedback inmediato

**Escenarios de Práctica**:
- Atención de derechos ARCO
- Evaluación de impacto
- Gestión de brechas
- Consentimiento informado
- Auditorías internas

### 6. 📊 Módulo de Reportes

**Objetivo**: Generar documentación y métricas

**Funcionalidades**:
- Reportes automáticos
- Métricas de cumplimiento
- Exportación PDF/Excel
- Programación de informes
- Plantillas personalizables

**Tipos de Reportes**:
- Estado de cumplimiento
- Inventario de datos
- Registro de actividades
- Métricas de capacitación
- Auditoría de accesos

---

## Guía de Instalación

### Requisitos Previos

- Docker Desktop (Windows/Mac) o Docker Engine (Linux)
- Docker Compose
- 4GB RAM mínimo
- 10GB espacio en disco
- Puerto 80 disponible

### Instalación Rápida

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-organizacion/scldp.git
cd scldp
```

2. **Ejecutar el script de inicio**
```bash
./start-demo.sh
```

3. **Acceder al sistema**
- Plataforma: http://localhost
- API Docs: http://localhost/api/v1/docs

### Instalación Manual

1. **Crear archivo de configuración**
```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

2. **Construir contenedores**
```bash
docker-compose build
```

3. **Iniciar servicios**
```bash
docker-compose up -d
```

4. **Verificar estado**
```bash
docker-compose ps
```

### Configuración Inicial

1. **Acceder con usuario demo**
   - Email: demo@scldp.cl
   - Contraseña: Demo1234

2. **Crear organización**
   - Completar datos de la empresa
   - Definir sector y tamaño

3. **Invitar usuarios**
   - Asignar roles (DPO, Admin, Usuario)
   - Configurar permisos por área

---

## Manual de Uso

### 🚀 Primeros Pasos

#### 1. Registro e Inicio de Sesión

1. Acceder a http://localhost
2. Click en "Registrar Organización"
3. Completar formulario con:
   - Nombre de la organización
   - RUT
   - Sector de negocio
   - Tamaño (pequeña/mediana/grande)
   - Datos del primer usuario (DPO)

#### 2. Configuración Inicial

**Panel de Administración**:
1. Definir áreas de negocio
2. Crear categorías de datos
3. Identificar sistemas y activos
4. Configurar destinatarios frecuentes

### 📚 Usando el Módulo de Capacitación

#### Navegación

1. **Dashboard de Capacitación**
   - Ver progreso general
   - Acceder a módulos disponibles
   - Revisar logros obtenidos

2. **Dentro de cada Módulo**
   - Lección teórica con ejemplos
   - Actividades interactivas
   - Evaluación de conocimientos
   - Recursos adicionales

#### Ejemplo: Módulo "Principios Fundamentales"

1. **Ver video introductorio** (5 min)
2. **Leer material teórico** con ejemplos chilenos
3. **Completar ejercicio interactivo**: Clasificar situaciones según principios
4. **Realizar evaluación**: 10 preguntas de selección múltiple
5. **Obtener certificado** al aprobar con 80%+

### 🎯 Realizando Entrevistas de Levantamiento

#### Preparación

1. **Seleccionar área** a entrevistar
2. **Revisar guía** de preguntas sugeridas
3. **Programar sesión** con responsable del área

#### Durante la Entrevista

1. **Pantalla dividida**:
   - Izquierda: Preguntas guiadas
   - Derecha: Espacio para respuestas

2. **Proceso iterativo**:
   ```
   Pregunta → Respuesta → Análisis → Nueva pregunta contextual
   ```

3. **Herramientas de ayuda**:
   - Ejemplos de respuestas
   - Definiciones emergentes
   - Validación en tiempo real

#### Post-Entrevista

1. **Revisión de respuestas**
2. **Generación automática** de actividades de tratamiento
3. **Validación** con el entrevistado
4. **Aprobación** y documentación

### 📋 Gestionando el RAT

#### Crear Nueva Actividad

1. **Información Básica**
   ```
   - Código: FIN-001
   - Nombre: Gestión de Facturación
   - Área: Finanzas
   - Responsable: Juan Pérez
   ```

2. **Finalidades**
   - Principal: Emisión de facturas legales
   - Adicionales: Control contable, auditoría

3. **Base de Licitud**
   - Seleccionar: Cumplimiento de obligación legal
   - Justificar con normativa específica

4. **Datos Tratados**
   - Marcar categorías aplicables
   - Especificar datos exactos
   - Clasificar sensibilidad

5. **Flujos y Destinatarios**
   - Agregar cada destinatario
   - Definir propósito de transferencia
   - Especificar frecuencia

#### Gestión Continua

- **Revisiones periódicas**: Alertas cada 6 meses
- **Control de cambios**: Versionado automático
- **Aprobaciones**: Flujo de validación
- **Exportación**: PDF para auditorías

### 🗺️ Visualizando Flujos de Datos

#### Crear Diagrama de Flujo

1. **Seleccionar actividad** desde el RAT
2. **Modo de edición** visual
3. **Arrastrar elementos**:
   - Sistemas origen
   - Procesos de transformación
   - Destinos finales
4. **Conectar con flechas**
5. **Agregar metadatos**:
   - Tipo de datos
   - Volumen
   - Frecuencia

#### Análisis de Riesgo

1. **Matriz automática** basada en:
   - Sensibilidad de datos
   - Volumen de titulares
   - Exposición a terceros

2. **Heatmap interactivo**
3. **Recomendaciones** de mitigación

### 🎮 Practicando en Sandbox

#### Casos Disponibles

1. **"Primera Brecha de Seguridad"**
   - Duración: 30 minutos
   - Objetivo: Gestionar incidente paso a paso
   - Aprendizaje: Protocolo de respuesta

2. **"Solicitud de Derechos ARCO"**
   - Duración: 20 minutos
   - Objetivo: Atender solicitud completa
   - Aprendizaje: Plazos y procedimientos

3. **"Auditoría Sorpresa"**
   - Duración: 45 minutos
   - Objetivo: Preparar documentación
   - Aprendizaje: Qué esperar en auditoría

#### Mecánica del Sandbox

1. **Seleccionar escenario**
2. **Recibir contexto** y rol a desempeñar
3. **Tomar decisiones** en tiempo real
4. **Ver consecuencias** de cada acción
5. **Recibir feedback** y puntuación

### 📊 Generando Reportes

#### Reportes Rápidos

1. **Dashboard Ejecutivo**
   - Click en "Generar Reporte"
   - Seleccionar período
   - Descargar PDF

2. **Inventario de Datos**
   - Menú Reportes → Inventario
   - Filtrar por área/sensibilidad
   - Exportar Excel

#### Reportes Personalizados

1. **Constructor de Reportes**
2. **Seleccionar métricas**:
   - Actividades por área
   - Datos por categoría
   - Cumplimiento por principio
3. **Diseñar layout**
4. **Programar envío** automático

---

## API y Endpoints

### Autenticación

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "usuario@empresa.cl",
  "password": "contraseña"
}
```

### Endpoints Principales

#### Organizaciones
```http
GET    /api/v1/organizaciones          # Listar organizaciones
POST   /api/v1/organizaciones          # Crear organización
GET    /api/v1/organizaciones/{id}     # Obtener organización
PUT    /api/v1/organizaciones/{id}     # Actualizar organización
DELETE /api/v1/organizaciones/{id}     # Eliminar organización
```

#### Usuarios
```http
GET    /api/v1/usuarios                # Listar usuarios
POST   /api/v1/usuarios                # Crear usuario
GET    /api/v1/usuarios/{id}           # Obtener usuario
PUT    /api/v1/usuarios/{id}           # Actualizar usuario
DELETE /api/v1/usuarios/{id}           # Eliminar usuario
```

#### Actividades de Tratamiento
```http
GET    /api/v1/actividades             # Listar actividades
POST   /api/v1/actividades             # Crear actividad
GET    /api/v1/actividades/{id}        # Obtener actividad
PUT    /api/v1/actividades/{id}        # Actualizar actividad
DELETE /api/v1/actividades/{id}        # Eliminar actividad
GET    /api/v1/actividades/{id}/flujos # Obtener flujos de datos
```

#### Capacitación
```http
GET    /api/v1/capacitacion/modulos    # Listar módulos
GET    /api/v1/capacitacion/progreso   # Ver progreso personal
POST   /api/v1/capacitacion/completar  # Marcar lección completada
GET    /api/v1/capacitacion/certificados # Descargar certificados
```

#### Entrevistas
```http
GET    /api/v1/entrevistas             # Listar entrevistas
POST   /api/v1/entrevistas             # Crear entrevista
GET    /api/v1/entrevistas/{id}        # Obtener entrevista
PUT    /api/v1/entrevistas/{id}        # Actualizar respuestas
POST   /api/v1/entrevistas/{id}/generar # Generar actividades
```

#### Reportes
```http
GET    /api/v1/reportes/dashboard      # Dashboard ejecutivo
GET    /api/v1/reportes/inventario     # Inventario de datos
GET    /api/v1/reportes/cumplimiento   # Estado de cumplimiento
POST   /api/v1/reportes/personalizado  # Generar reporte custom
```

### Ejemplos de Uso

#### Crear Nueva Actividad
```python
import requests

headers = {
    "Authorization": "Bearer {token}",
    "Content-Type": "application/json"
}

data = {
    "codigo_actividad": "RRHH-001",
    "nombre_actividad": "Gestión de Nómina",
    "area_negocio": "Recursos Humanos",
    "finalidad_principal": "Pago de remuneraciones",
    "base_licitud": "ejecucion_contrato",
    "responsable_proceso": "uuid-del-usuario"
}

response = requests.post(
    "http://localhost/api/v1/actividades",
    headers=headers,
    json=data
)
```

#### Obtener Progreso de Capacitación
```javascript
const getProgress = async () => {
  const response = await fetch('/api/v1/capacitacion/progreso', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  console.log('Módulos completados:', data.completados);
  console.log('Progreso total:', data.porcentaje_total);
};
```

---

## Base de Datos

### Esquema Principal

#### Tablas Principales

1. **organizaciones**
   - Información de cada empresa
   - Multi-tenancy
   - Configuración global

2. **usuarios**
   - Usuarios del sistema
   - Roles y permisos
   - Vinculación con organización

3. **actividades_tratamiento**
   - Registro central del RAT
   - Versionado de cambios
   - Estados de aprobación

4. **categorias_datos**
   - Taxonomía de datos
   - Clasificación de sensibilidad
   - Ejemplos por categoría

5. **sistemas_activos**
   - Inventario de sistemas
   - Ubicación y responsables
   - Nivel de seguridad

### Relaciones Clave

```sql
-- Actividad <-> Datos (N:M)
actividad_datos

-- Actividad <-> Titulares (N:M)
actividad_titulares

-- Actividad <-> Sistemas (N:M)
actividad_sistemas

-- Actividad <-> Destinatarios (N:M)
actividad_flujos
```

### Vistas Importantes

```sql
-- Vista completa de actividades con conteos
vista_actividades_completas

-- Vista de cumplimiento por área
vista_cumplimiento_areas

-- Vista de datos sensibles
vista_datos_sensibles
```

---

## Seguridad y Auditoría

### Medidas de Seguridad

1. **Autenticación y Autorización**
   - JWT con expiración configurable
   - Roles basados en permisos (RBAC)
   - 2FA opcional

2. **Cifrado**
   - HTTPS obligatorio en producción
   - Cifrado de base de datos
   - Hashing de contraseñas (bcrypt)

3. **Validación**
   - Input validation en frontend y backend
   - SQL injection prevention
   - XSS protection

4. **Rate Limiting**
   - Por IP y por usuario
   - Configuración por endpoint
   - Bloqueo automático

### Sistema de Auditoría

#### Registro Inmutable

Cada acción genera un registro con:
- Usuario y timestamp
- Acción realizada
- Datos antes/después
- Hash criptográfico
- IP y user agent

#### Cadena de Hash

```python
hash_actual = sha256(
    accion + 
    entidad + 
    datos + 
    hash_anterior
)
```

#### Consulta de Auditoría

```sql
-- Ver todas las acciones de un usuario
SELECT * FROM lpdp.auditoria 
WHERE usuario_id = 'uuid'
ORDER BY fecha_hora DESC;

-- Verificar integridad de la cadena
SELECT 
    fecha_hora,
    accion,
    hash_actual,
    hash_anterior,
    hash_actual = generar_hash_auditoria(...) as valido
FROM lpdp.auditoria
ORDER BY fecha_hora;
```

---

## Preguntas Frecuentes

### General

**¿El sistema es gratuito?**
Sí, el sistema educativo es completamente gratuito para uso con datos de prueba.

**¿Puedo usar datos reales de mi empresa?**
El sistema está diseñado para educación. Para uso productivo, consulte la versión enterprise.

**¿Necesito conocimientos técnicos?**
No, el sistema está diseñado para usuarios sin conocimientos técnicos.

### Instalación

**¿Funciona en Windows?**
Sí, mediante Docker Desktop o WSL2.

**¿Cuánto espacio necesito?**
Aproximadamente 10GB incluyendo las imágenes Docker.

**¿Puedo instalarlo en la nube?**
Sí, es compatible con AWS, Azure, Google Cloud.

### Uso

**¿Cuánto tiempo toma la capacitación completa?**
Aproximadamente 20 horas distribuidas en 6 módulos.

**¿Los certificados tienen validez legal?**
Son certificados de participación educativa, no tienen validez oficial.

**¿Puedo personalizar los módulos?**
La versión enterprise permite personalización completa.

### Técnico

**¿Qué navegadores son compatibles?**
Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

**¿Hay API para integración?**
Sí, API REST completa con documentación OpenAPI.

**¿Se puede integrar con otros sistemas?**
Sí, mediante API o exportación de datos.

---

## Soporte y Contacto

### Recursos de Ayuda

1. **Documentación Técnica**
   - API Docs: http://localhost/api/v1/docs
   - Wiki: https://wiki.scldp.cl

2. **Videos Tutoriales**
   - Canal YouTube: SCLDP Oficial
   - Webinars mensuales

3. **Comunidad**
   - Foro: https://foro.scldp.cl
   - Slack: scldp.slack.com

### Reportar Problemas

1. **Issues GitHub**
   ```
   https://github.com/scldp/sistema/issues
   ```

2. **Email Soporte**
   ```
   soporte@scldp.cl
   ```

### Contribuir

El proyecto es open source y acepta contribuciones:

1. Fork del repositorio
2. Crear feature branch
3. Commit con mensajes claros
4. Pull request con descripción

### Licencia

Este software se distribuye bajo licencia MIT. Ver archivo LICENSE para más detalles.

---

## Conclusión

El SCLDP es más que un software: es un ecosistema educativo completo para la protección de datos personales. Su enfoque en "enseñar a pescar" garantiza que las organizaciones no solo cumplan con la ley, sino que desarrollen una verdadera cultura de privacidad.

**¡Bienvenido a la comunidad SCLDP!** 🎓🔐📊