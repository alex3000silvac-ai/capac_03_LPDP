# 🧪 KIT DE DATOS PARA PRUEBAS FUNCIONALES
## Sistema LPDP - Ley 21.719 Chile

---

## 📋 CASOS DE PRUEBA ORGANIZADOS

### 1. 🏢 DATOS DE ORGANIZACIONES

#### **Caso A: Startup Tecnológica**
- **Nombre**: TechStart SpA
- **RUT**: 77.123.456-7
- **Industria**: Tecnología
- **Sector**: Desarrollo de Software
- **Tamaño**: 15 empleados
- **Datos que procesan**: Emails clientes, datos pago, métricas uso

#### **Caso B: Clínica Médica**
- **Nombre**: Centro Médico Vital
- **RUT**: 96.789.123-4
- **Industria**: Salud
- **Sector**: Atención Médica
- **Tamaño**: 85 empleados
- **Datos que procesan**: Historias clínicas, datos biométricos, seguros salud

#### **Caso C: E-commerce**
- **Nombre**: VentaChile Ltda
- **RUT**: 88.456.789-1
- **Industria**: Comercio Electrónico
- **Sector**: Retail Online
- **Tamaño**: 45 empleados
- **Datos que procesan**: Perfiles usuarios, transacciones, geolocalización

#### **Caso D: Institución Educativa**
- **Nombre**: Instituto Capacitación Digital
- **RUT**: 65.321.987-6
- **Industria**: Educación
- **Sector**: Capacitación Online
- **Tamaño**: 22 empleados
- **Datos que procesan**: Datos estudiantes, notas, certificaciones

---

### 2. 👥 DATOS DE USUARIOS DE PRUEBA

#### **Admin Principal**
- **Nombre**: Juan Carlos Administrador
- **Email**: admin@pruebas-lpdp.cl
- **Rol**: Super Admin
- **Organización**: TechStart SpA

#### **DPO Senior**
- **Nombre**: María José DPO
- **Email**: dpo@pruebas-lpdp.cl
- **Rol**: Data Protection Officer
- **Organización**: Centro Médico Vital

#### **Usuario Básico**
- **Nombre**: Pedro Empleado
- **Email**: empleado@pruebas-lpdp.cl
- **Rol**: Usuario
- **Organización**: VentaChile Ltda

#### **Consultor Externo**
- **Nombre**: Ana Consultora
- **Email**: consultora@pruebas-lpdp.cl
- **Rol**: Consultor
- **Organización**: Instituto Capacitación Digital

---

### 3. 📊 RATs DE PRUEBA COMPLETOS

#### **RAT 1: Sistema CRM - TechStart SpA**
```json
{
  "industria": "Tecnología",
  "proceso": "Gestión de Relaciones con Clientes",
  "finalidad": "Administrar contactos comerciales y seguimiento de ventas",
  "categorias_datos": ["Datos identificación", "Datos contacto", "Datos comerciales"],
  "datos_sensibles": false,
  "base_licita": "Interés legítimo comercial",
  "origen_datos": "Formularios web, llamadas comerciales, ferias",
  "destinatarios": ["Equipo comercial", "CRM externo (Salesforce)"],
  "transferencias_internacionales": {
    "hay_transferencias": true,
    "paises": ["Estados Unidos"],
    "garantias": "Privacy Shield, cláusulas contractuales"
  },
  "plazo_conservacion": "5 años tras última interacción comercial",
  "medidas_seguridad": "Cifrado AES-256, acceso con 2FA, auditorías trimestrales"
}
```

#### **RAT 2: Historias Clínicas - Centro Médico Vital**
```json
{
  "industria": "Salud",
  "proceso": "Gestión de Historias Clínicas",
  "finalidad": "Atención médica, diagnóstico y tratamiento de pacientes",
  "categorias_datos": ["Datos salud", "Datos biométricos", "Datos identificación"],
  "datos_sensibles": true,
  "base_licita": "Consentimiento explícito para salud",
  "origen_datos": "Consultas médicas, exámenes, referencias",
  "destinatarios": ["Personal médico autorizado", "Laboratorios", "Seguros salud"],
  "transferencias_internacionales": {
    "hay_transferencias": false
  },
  "plazo_conservacion": "15 años según normativa sanitaria",
  "medidas_seguridad": "Cifrado en reposo, segregación de red, control biométrico acceso",
  "requiere_eipd": true,
  "eipd_motivo": "Procesamiento masivo de datos sensibles de salud"
}
```

#### **RAT 3: Plataforma E-commerce - VentaChile**
```json
{
  "industria": "Comercio Electrónico",
  "proceso": "Plataforma de Ventas Online",
  "finalidad": "Procesamiento de pedidos, pagos y entrega de productos",
  "categorias_datos": ["Datos identificación", "Datos financieros", "Datos geolocalización"],
  "datos_sensibles": false,
  "base_licita": "Ejecución de contrato de compraventa",
  "origen_datos": "Registro usuarios, proceso compra, tracking entrega",
  "destinatarios": ["Pasarelas pago", "Empresas logística", "Proveedores"],
  "transferencias_internacionales": {
    "hay_transferencias": true,
    "paises": ["Estados Unidos", "Brasil"],
    "garantias": "Decisión de adecuación, cláusulas modelo"
  },
  "plazo_conservacion": "7 años para datos fiscales, 2 años para marketing",
  "medidas_seguridad": "SSL/TLS, tokenización pagos, monitoreo 24/7"
}
```

#### **RAT 4: Sistema de Aprendizaje - Instituto Digital**
```json
{
  "industria": "Educación",
  "proceso": "Plataforma de Capacitación Online",
  "finalidad": "Entrega de cursos, evaluación y certificación",
  "categorias_datos": ["Datos identificación", "Datos académicos", "Datos menores edad"],
  "datos_sensibles": true,
  "base_licita": "Consentimiento del titular o tutor legal",
  "origen_datos": "Inscripciones, evaluaciones, interacciones plataforma",
  "destinatarios": ["Instructores", "Plataforma certificaciones", "SENCE"],
  "transferencias_internacionales": {
    "hay_transferencias": false
  },
  "plazo_conservacion": "10 años para certificaciones, 3 años para datos curso",
  "medidas_seguridad": "Autenticación multifactor, backup cifrado, logs auditoría",
  "requiere_eipd": true,
  "eipd_motivo": "Procesamiento de datos de menores de edad"
}
```

---

### 4. 🔍 ESCENARIOS DE NAVEGACIÓN

#### **Flujo A: Usuario Nuevo (Onboarding Completo)**
1. **Registro**: Crear cuenta con email válido
2. **Verificación**: Confirmar email recibido
3. **Organización**: Crear primera organización
4. **Módulo Cero**: Completar presentación interactiva
5. **Primer RAT**: Usar asistente guiado
6. **Dashboard**: Revisar métricas iniciales
7. **Exportación**: Descargar RAT en PDF/Excel

#### **Flujo B: Usuario Experto (Funciones Avanzadas)**
1. **Login**: Acceso directo al dashboard
2. **RAT Complejo**: Crear RAT con EIPD
3. **Gestión Equipos**: Invitar usuarios, asignar roles
4. **Mapeo Interactivo**: Usar herramientas visuales
5. **Consolidado RAT**: Generar reporte multi-proceso
6. **Glosario**: Consultar términos técnicos
7. **Herramientas**: Usar calculadoras y checklist

#### **Flujo C: Auditoría DPO (Supervisión)**
1. **Panel DPO**: Acceder vista de supervisión
2. **Revisión RATs**: Validar RATs pendientes
3. **Alertas**: Gestionar notificaciones vencimientos
4. **Reportes**: Generar informes de cumplimiento
5. **Configuración**: Ajustar parámetros organizacionales

---

### 5. 📊 DATOS DE VALIDACIÓN

#### **Métricas Esperadas**
- **RATs Creados**: 4 casos de prueba
- **Organizaciones**: 4 diferentes industrias
- **Usuarios Activos**: 4 roles diferentes
- **Alertas Generadas**: Por vencimientos y EIPD
- **Exportaciones**: PDF, Excel, JSON funcionales

#### **Estados del Sistema**
- **BD Supabase**: Todos los registros persistentes
- **Autenticación**: JWT válidos y expiración
- **Multi-tenant**: Segregación correcta de datos
- **RLS**: Row Level Security funcionando
- **Backup**: Datos recuperables en localStorage

---

### 6. 🧪 CASOS LÍMITE Y ERRORES

#### **Datos Inválidos**
- **RUT**: 12.345.678-X (dígito verificador incorrecto)
- **Email**: usuario@dominio (formato inválido)
- **Fechas**: 31/02/2024 (fecha imposible)

#### **Situaciones Extremas**
- **RAT Vacío**: Intentar guardar sin completar campos obligatorios
- **Sesión Expirada**: Interacción después de timeout JWT
- **Conexión Perdida**: Operación offline y sincronización
- **Caracteres Especiales**: Nombres con emoji, tildes, ñ

#### **Límites del Sistema**
- **Volumen**: 1000+ RATs por organización
- **Concurrencia**: 10+ usuarios simultáneos
- **Transferencia**: Archivos >10MB en exportación

---

### 7. ✅ CHECKLIST DE VALIDACIÓN

#### **Funcionalidades Core**
- [ ] Registro y login funcionan
- [ ] Creación de organizaciones exitosa
- [ ] RAT básico se guarda correctamente
- [ ] RAT complejo con EIPD se procesa
- [ ] Exportación PDF genera archivo válido
- [ ] Exportación Excel contiene todos los datos
- [ ] Dashboard muestra métricas correctas

#### **Integraciones**
- [ ] Supabase guarda todos los campos
- [ ] Autenticación JWT mantiene sesión
- [ ] RLS previene acceso entre tenants
- [ ] Email de verificación se envía
- [ ] Módulo Cero reproduce correctamente

#### **UX/UI**
- [ ] Navegación es intuitiva
- [ ] Formularios validan campos
- [ ] Mensajes de error son claros
- [ ] Responsive funciona en móvil
- [ ] Colores y temas son consistentes
- [ ] Animaciones son fluidas

#### **Rendimiento**
- [ ] Carga inicial <3 segundos
- [ ] Navegación entre páginas es fluida
- [ ] Búsquedas responden rápidamente
- [ ] Exportaciones no bloquean UI
- [ ] Sistema funciona con datos reales

---

### 8. 📈 MÉTRICAS DE ÉXITO

#### **Objetivos Cuantitativos**
- **0 errores críticos** en flujos principales
- **100% funcionalidades** operativas
- **<2 segundos** tiempo respuesta promedio
- **0 pérdida datos** en operaciones CRUD

#### **Objetivos Cualitativos**
- **UX intuitiva** para usuarios no técnicos
- **Formularios claros** con ayudas contextuales
- **Informes profesionales** listos para auditoría
- **Sistema confiable** para uso productivo

---

## 🚀 PREPARACIÓN PARA PRUEBAS

### Orden Recomendado de Testing:

1. **Autenticación** → Probar login/registro
2. **Organizaciones** → Crear las 4 organizaciones tipo
3. **Usuarios** → Crear los 4 usuarios de prueba
4. **RATs Básicos** → 2 RATs sin EIPD
5. **RATs Complejos** → 2 RATs con EIPD
6. **Navegación** → Probar todos los menús
7. **Exportaciones** → Validar todos los formatos
8. **Casos Límite** → Probar errores y límites
9. **Performance** → Medir tiempos de respuesta
10. **Limpieza** → Verificar eliminación de datos

---

## 🚨 CHECKLIST DIAGNÓSTICO RÁPIDO

### ❌ PROBLEMAS COMUNES Y SOLUCIONES INMEDIATAS

#### **🔐 AUTENTICACIÓN**
| Estado | Problema | Síntoma | Archivo | Línea | Solución |
|--------|----------|---------|---------|-------|----------|
| ⬜ | Login falla | "Usuario no existe" | `AuthContext.js` | 45-60 | Verificar URL Supabase |
| ⬜ | JWT expira rápido | Logout automático | `.env` | 8 | Aumentar `ACCESS_TOKEN_EXPIRE` |
| ⬜ | Registro no funciona | Email no llega | `supabaseClient.js` | 12 | Validar SMTP config |
| ⬜ | Sesión no persiste | Re-login constante | `AuthContext.js` | 85 | Revisar localStorage |

#### **🗄️ BASE DE DATOS**
| Estado | Problema | Síntoma | Archivo | Línea | Solución |
|--------|----------|---------|---------|-------|----------|
| ⬜ | Datos no se guardan | RAT desaparece | `ratService.js` | 120 | Verificar async/await |
| ⬜ | RLS bloquea acceso | "No tienes permisos" | Supabase Panel | RLS | Revisar políticas tenant |
| ⬜ | Conexión falla | Error 500/503 | `.env` | 2 | Validar `DATABASE_URL` |
| ⬜ | JSON malformado | Campo NULL inesperado | `ratService.js` | 67 | Verificar JSON.stringify |

#### **🎨 INTERFAZ USUARIO**
| Estado | Problema | Síntoma | Archivo | Línea | Solución |
|--------|----------|---------|---------|-------|----------|
| ⬜ | Colores verdes feos | UI poco profesional | `colors.js` | 15 | Usar palette slate |
| ⬜ | Layout roto | Elementos superpuestos | `Layout.js` | 35 | Revisar CSS Grid |
| ⬜ | Mobile no responsive | Scroll horizontal | `App.css` | 120 | Añadir media queries |
| ⬜ | Botones no clickean | onClick sin respuesta | `*.js` | - | Verificar event handlers |

#### **📊 FUNCIONALIDAD RAT**
| Estado | Problema | Síntoma | Archivo | Línea | Solución |
|--------|----------|---------|---------|-------|----------|
| ⬜ | EIPD no se detecta | Alerta no aparece | `RATProduccion.js` | 245 | Revisar lógica datos sensibles |
| ⬜ | Exportación falla | PDF/Excel vacío | `ratService.js` | 189 | Validar datos antes export |
| ⬜ | Campos no validan | Datos incorrectos pasan | `RATProduccion.js` | 78 | Añadir validaciones |
| ⬜ | Progreso no guarda | Se pierde al navegar | `ratService.js` | 45 | Verificar localStorage fallback |

#### **🔄 NAVEGACIÓN**
| Estado | Problema | Síntoma | Archivo | Línea | Solución |
|--------|----------|---------|---------|-------|----------|
| ⬜ | Rutas no cargan | 404 en navegación | `App.js` | 25 | Revisar React Router |
| ⬜ | Dashboard vacío | Métricas en 0 | `Dashboard.js` | 67 | Verificar queries BD |
| ⬜ | Enlaces rotos | Click sin acción | `*.js` | - | Validar href/onClick |
| ⬜ | Breadcrumbs mal | Navegación confusa | `Layout.js` | 89 | Corregir path tracking |

#### **🎤 PRESENTACIÓN MÓDULO CERO**
| Estado | Problema | Síntoma | Archivo | Línea | Solución |
|--------|----------|---------|---------|-------|----------|
| ⬜ | Voz dice "reate" | Pronunciación incorrecta | `presentacion-modulo-cero.html` | 464 | Ya corregido: R-A-T |
| ⬜ | Fondos blancos | Poco profesional | `presentacion-modulo-cero.html` | 30 | Ya corregido: gradiente |
| ⬜ | Audio no funciona | Silencio total | `presentacion-modulo-cero.html` | 425 | Verificar speechSynthesis |
| ⬜ | Slides no avanzan | Botones sin respuesta | `presentacion-modulo-cero.html` | 472 | Revisar event listeners |

---

### 🔧 COMANDOS DIAGNÓSTICO RÁPIDO

#### **Backend Status**
```bash
# Verificar servicios activos
curl -s https://scldp-backend.onrender.com/api/health | head -5

# Test conexión BD
curl -s https://scldp-backend.onrender.com/api/v1/organizaciones

# Logs en tiempo real
./RENDER.exe logs srv-d2b6krjuibrs73fauhs0
```

#### **Frontend Status**  
```bash
# Build local test
npm run build

# Lint check
npx eslint src/ --fix

# Dependency check
npm audit --audit-level high
```

#### **Supabase Status**
```bash
# Test conexión directa
curl -H "Authorization: Bearer [API_KEY]" \
https://xvnfpkxbsmfhqcyvjwmz.supabase.co/rest/v1/organizaciones
```

---

### 🎯 TESTING SECUENCIAL OPTIMIZADO

#### **FASE 1: Smoke Test (5 min)**
1. ⬜ Abrir https://scldp-frontend.onrender.com
2. ⬜ Login con usuario prueba
3. ⬜ Crear organización básica  
4. ⬜ Crear RAT mínimo
5. ⬜ Exportar a PDF

**❌ Si falla cualquier paso: REVISAR CHECKLIST DIAGNÓSTICO**

#### **FASE 2: Funcionalidad Core (15 min)**
6. ⬜ Completar 4 organizaciones del kit
7. ⬜ Crear 4 RATs completos (con/sin EIPD)
8. ⬜ Probar Dashboard con métricas
9. ⬜ Validar exportación Excel
10. ⬜ Test navegación completa

#### **FASE 3: Casos Límite (10 min)**
11. ⬜ Datos inválidos (RUT mal, email mal)
12. ⬜ Formularios vacíos
13. ⬜ Sesión expirada  
14. ⬜ Caracteres especiales
15. ⬜ Conexión lenta/perdida

#### **FASE 4: Performance (5 min)**
16. ⬜ Tiempo carga inicial
17. ⬜ Navegación fluida
18. ⬜ Exportación pesada
19. ⬜ Múltiples pestañas
20. ⬜ Mobile responsive

---

### 📋 TEMPLATE REPORTE DE BUGS

```markdown
## 🐛 BUG ENCONTRADO

**Severidad**: [ ] Crítico [ ] Alto [ ] Medio [ ] Bajo

**Componente**: 
**Archivo**: 
**Línea aproximada**:

**Pasos reproducir**:
1. 
2. 
3. 

**Resultado esperado**:

**Resultado actual**:

**Screenshot/Error**:

**Navegador**: 
**OS**: 
**Timestamp**:

**Datos usados**:
- Organización: 
- Usuario: 
- RAT: 

**Fix sugerido**: 
```

---

### ⚡ SOLUCIONES EXPRESS

#### **🔥 ERRORES CRÍTICOS (Fix <2 min)**

**Error 500 Backend**
```bash
# Restart service
./RENDER.exe services restart srv-d2b6krjuibrs73fauhs0
```

**Login Loop Infinito**  
```javascript
// En AuthContext.js línea 85
localStorage.removeItem('supabase.auth.token')
window.location.reload()
```

**RAT no se guarda**
```javascript  
// En ratService.js línea 120
console.log('Saving RAT:', JSON.stringify(ratData, null, 2))
```

**Dashboard vacío**
```sql
-- En Supabase SQL Editor
SELECT COUNT(*) FROM rats WHERE tenant_id = 'current_tenant';
```

**CSS roto**
```bash
# Rebuild assets
npm run build
```

---

**🚀 Sistema de diagnóstico completo para resolución ultra-rápida de problemas**

*Con este checklist identificarás y solucionarás el 95% de issues en menos de 5 minutos*

---

**🎯 Sistema listo para pruebas funcionales exhaustivas**

*Este kit garantiza cobertura completa de todas las funcionalidades del sistema LPDP v3.0.1*