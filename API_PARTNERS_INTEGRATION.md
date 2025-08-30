# API INTEGRATION FOR PARTNERS - JURÍDICA DIGITAL LPDP SYSTEM

## OVERVIEW
Sistema de integración para partners especializados en protección de datos en Chile. Nuestro sistema genera RATs y documentos de compliance que pueden ser integrados por empresas partner como:
- Prelafit Compliance
- DataCompliance Legal  
- RSM Chile
- Amsoft
- FC Group

## API ENDPOINTS DISPONIBLES PARA PARTNERS

### 1. OBTENER RATS COMPLETADOS
```http
GET /api/v1/rats/completed
Authorization: Bearer {partner_api_key}
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "fecha_creacion": "2025-08-29T14:00:00Z",
      "responsable": {
        "razon_social": "Empresa Chile S.A.",
        "rut": "76.123.456-7",
        "email": "dpo@empresa.cl"
      },
      "area_detectada": "financiero",
      "base_legal": "consentimiento",
      "finalidad": "Evaluación crediticia",
      "datos_sensibles": ["situacion_socioeconomica"],
      "nivel_riesgo": "ALTO",
      "documentos_generados": [
        {
          "tipo": "EIPD",
          "url": "/api/v1/documents/eipd/{id}",
          "estado": "generado"
        }
      ],
      "compliance_status": {
        "requiere_eipd": true,
        "requiere_dpia": false,
        "requiere_consulta_previa": true
      }
    }
  ],
  "total": 150,
  "page": 1
}
```

### 2. OBTENER DOCUMENTOS GENERADOS
```http
GET /api/v1/documents/{tipo}/{rat_id}
Authorization: Bearer {partner_api_key}
```

**Tipos disponibles:** `EIPD`, `DPIA`, `DPA`, `CONSENTIMIENTO_MEDICO`, `AUTORIZACION_PARENTAL`

### 3. WEBHOOK PARA NOTIFICACIONES EN TIEMPO REAL
Partners pueden configurar un webhook para recibir notificaciones cuando:
- Se completa un nuevo RAT
- Se genera un documento de compliance
- Se detecta un tratamiento de alto riesgo

```http
POST {partner_webhook_url}
Content-Type: application/json

{
  "event": "rat_completed",
  "timestamp": "2025-08-29T14:00:00Z",
  "data": {
    "rat_id": "uuid",
    "empresa": "Empresa Chile S.A.",
    "nivel_riesgo": "ALTO",
    "documentos_pendientes": ["EIPD", "CONSULTA_PREVIA"]
  }
}
```

### 4. API DE ANÁLISIS INTELIGENTE
Partners pueden enviar datos de tratamiento para análisis automático:

```http
POST /api/v1/analysis/intelligent
Authorization: Bearer {partner_api_key}
Content-Type: application/json

{
  "empresa": {
    "razon_social": "Cliente Partner S.A.",
    "rut": "76.987.654-3",
    "industria": "salud"
  },
  "tratamiento": {
    "finalidad": "Gestión de historiales médicos",
    "categorias_datos": ["datos_medicos", "datos_identificacion"],
    "volumen_titulares": 50000,
    "decisiones_automatizadas": false,
    "transferencias_internacionales": true
  }
}
```

**Respuesta de análisis:**
```json
{
  "success": true,
  "analysis_result": {
    "nivel_riesgo": "CRITICO",
    "documentos_requeridos": [
      {
        "tipo": "EIPD",
        "urgencia": "alta",
        "plazo_dias": 15,
        "fundamento_legal": "Art. 25 Ley 21.719"
      },
      {
        "tipo": "CONSULTA_PREVIA",
        "urgencia": "critica", 
        "plazo_dias": 5,
        "fundamento_legal": "Art. 26 Ley 21.719"
      }
    ],
    "alertas_compliance": [
      {
        "tipo": "urgente",
        "titulo": "EIPD REQUERIDA - Datos Médicos Sector Salud",
        "descripcion": "Detectados datos sensibles de salud. Evaluación obligatoria",
        "fundamento_legal": "Art. 25 Ley 21.719"
      }
    ],
    "recomendaciones_partner": [
      "Implementar políticas de retención específicas",
      "Configurar consentimiento médico explícito",
      "Establecer acuerdos DPA para transferencias"
    ]
  }
}
```

## FLUJO DE INTEGRACIÓN RECOMENDADO

### 1. AUTENTICACIÓN PARTNER
```http
POST /api/v1/auth/partner
Content-Type: application/json

{
  "partner_id": "prelafit",
  "api_secret": "{secret_key}",
  "integration_type": "full_access"
}
```

### 2. CONFIGURACIÓN DE WEBHOOK
```http
POST /api/v1/webhooks/configure
Authorization: Bearer {partner_api_key}

{
  "webhook_url": "https://partner.sistema.cl/webhook/juridica-digital",
  "events": ["rat_completed", "document_generated", "high_risk_detected"],
  "signature_secret": "{webhook_secret}"
}
```

### 3. SINCRONIZACIÓN INICIAL
```http
GET /api/v1/sync/initial?partner_id=prelafit&since=2025-01-01
```

## CASOS DE USO ESPECÍFICOS PARA PARTNERS

### A) PRELAFIT COMPLIANCE
- Recibe RATs completados
- Integra con su sistema de gestión de riesgos
- Genera reportes ejecutivos personalizados

### B) DATACOMPLIANCE LEGAL  
- Obtiene análisis de tratamientos complejos
- Recibe alertas de alto riesgo para consultoría especializada
- Integra documentos DPA en su flujo legal

### C) RSM CHILE / FC GROUP
- Acceso a reportes consolidados por cliente
- Integración con herramientas de auditoría
- Dashboard ejecutivo personalizado

## ESTÁNDARES DE CALIDAD

### FORMATO DE DOCUMENTOS
- **PDF**: Documentos finales firmados digitalmente
- **JSON**: Datos estructurados para integración
- **XML**: Intercambio con sistemas legacy

### TRAZABILIDAD COMPLETA
- Cada documento incluye:
  - Timestamp de generación
  - Usuario responsable  
  - Fundamentos legales aplicados
  - Hash de integridad

### SEGURIDAD
- Autenticación OAuth2 + API Keys
- Encriptación TLS 1.3
- Rate limiting por partner
- Logs de auditoría completos

## DOCUMENTACIÓN TÉCNICA ADICIONAL

### CÓDIGOS DE ERROR ESTÁNDAR
- `401` - API Key inválida
- `403` - Sin permisos para el recurso
- `429` - Rate limit excedido  
- `500` - Error interno del sistema

### FORMATOS DE FECHA
Todas las fechas en formato ISO 8601: `2025-08-29T14:00:00Z`

### PAGINACIÓN
```http
GET /api/v1/rats/completed?page=1&limit=50&sort=fecha_creacion&order=desc
```

## SOPORTE TÉCNICO

**Contacto de Integración:**
- Email: partners@juridica-digital.cl
- Slack: #partners-integration
- Documentación: https://api.juridica-digital.cl/docs

**SLA para Partners:**
- Disponibilidad: 99.9%
- Tiempo de respuesta: < 200ms
- Soporte 24/7 para partners premium

---

*Jurídica Digital SPA - Sistema de cumplimiento Ley 21.719*
*Versión API: v1.0 - Agosto 2025*