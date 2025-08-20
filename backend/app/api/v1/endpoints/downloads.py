"""
Endpoint para descargas de formatos, plantillas y archivos
"""
from typing import Dict, Any
from fastapi import APIRouter, HTTPException, Response
from fastapi.responses import FileResponse, StreamingResponse
import io
import os
import zipfile
from datetime import datetime

router = APIRouter()

# Plantillas y formatos disponibles
TEMPLATES = {
    "rat_plantilla": {
        "name": "Plantilla RAT - Ley 21.719",
        "description": "Registro de Actividades de Tratamiento según Ley chilena",
        "type": "excel",
        "size": "2.5 MB",
        "content": "plantilla_rat_ley21719.xlsx"
    },
    "formulario_entrevista_rrhh": {
        "name": "Formulario Entrevista RRHH",
        "description": "Cuestionario estructurado para área de recursos humanos",
        "type": "pdf",
        "size": "800 KB",
        "content": "formulario_entrevista_rrhh.pdf"
    },
    "formulario_entrevista_finanzas": {
        "name": "Formulario Entrevista Finanzas",
        "description": "Cuestionario estructurado para área financiera",
        "type": "pdf", 
        "size": "750 KB",
        "content": "formulario_entrevista_finanzas.pdf"
    },
    "matriz_clasificacion": {
        "name": "Matriz Clasificación de Datos",
        "description": "Herramienta para clasificar datos por nivel de sensibilidad",
        "type": "excel",
        "size": "1.2 MB",
        "content": "matriz_clasificacion_datos.xlsx"
    },
    "checklist_cumplimiento": {
        "name": "Checklist Cumplimiento LPDP",
        "description": "Lista de verificación para cumplimiento de la Ley 21.719",
        "type": "pdf",
        "size": "600 KB", 
        "content": "checklist_cumplimiento_lpdp.pdf"
    },
    "manual_dpo": {
        "name": "Manual DPO Completo",
        "description": "Manual de 150+ páginas para Oficiales de Protección de Datos",
        "type": "pdf",
        "size": "15.2 MB",
        "content": "manual_dpo_modulo3_completo.pdf"
    },
    "casos_practicos_iot": {
        "name": "Casos Prácticos IoT y Acuicultura",
        "description": "Casos reales de implementación en industria salmonera",
        "type": "pdf",
        "size": "5.8 MB",
        "content": "casos_practicos_acuicultura.pdf"
    }
}

PACKAGES = {
    "basico": {
        "name": "Paquete Básico DPO",
        "description": "Herramientas esenciales para cumplimiento LPDP",
        "templates": ["rat_plantilla", "formulario_entrevista_rrhh", "formulario_entrevista_finanzas", "checklist_cumplimiento"],
        "size": "4.7 MB"
    },
    "profesional": {
        "name": "Paquete Profesional DPO",
        "description": "Kit completo para profesionales en protección de datos",
        "templates": ["manual_dpo", "casos_practicos_iot", "matriz_clasificacion", "rat_plantilla"],
        "size": "24.2 MB"
    },
    "completo": {
        "name": "Paquete Completo LPDP",
        "description": "Todos los recursos disponibles del sistema",
        "templates": list(TEMPLATES.keys()),
        "size": "30.8 MB"
    }
}

def generate_template_content(template_key: str) -> bytes:
    """Genera contenido simulado para las plantillas"""
    if template_key == "rat_plantilla":
        # Simular archivo Excel
        content = f"""
# PLANTILLA RAT - LEY 21.719
# Registro de Actividades de Tratamiento
# Generado: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## ACTIVIDAD DE TRATAMIENTO 1
Nombre: [Ejemplo] Gestión de Nómina
Finalidad: Calcular y pagar remuneraciones del personal
Base Legal: Cumplimiento de obligación legal (Art. 8 b)
Categorías de Datos: Datos de identificación, datos financieros
Destinatarios: Banco pagador, SII, AFP, Isapre
Transferencias: No aplica
Plazo de Conservación: 5 años desde término de relación laboral

## ACTIVIDAD DE TRATAMIENTO 2
Nombre: [Ejemplo] Reclutamiento y Selección
Finalidad: Seleccionar candidatos para puestos de trabajo
Base Legal: Consentimiento informado
Categorías de Datos: CV, datos de contacto, referencias
Destinatarios: Área RRHH, jefatura directa
Transferencias: No aplica
Plazo de Conservación: 2 años

## INSTRUCCIONES
1. Complete cada actividad identificada en su organización
2. Verifique que la base legal sea apropiada según el Art. 8 LPDP
3. Documente todos los destinatarios internos y externos
4. Establezca plazos de conservación específicos
5. Revise transferencias internacionales si aplican

## CAMPOS OBLIGATORIOS
- Nombre de la actividad
- Finalidad específica  
- Base legal (Art. 8 LPDP)
- Categorías de datos tratados
- Destinatarios de los datos
- Plazo de conservación

Para más información, consulte el Manual DPO Módulo 3.
"""
        return content.encode('utf-8')
    
    elif "formulario_entrevista" in template_key:
        area = "RRHH" if "rrhh" in template_key else "FINANZAS"
        content = f"""
# FORMULARIO DE ENTREVISTA - ÁREA {area}
# Sistema LPDP - Ley 21.719
# Generado: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## INFORMACIÓN GENERAL
Área: {area}
Entrevistado: ______________________
Cargo: ____________________________
Fecha: ____________________________

## FASE 1: IDENTIFICACIÓN DE ACTIVIDADES

1. ¿Cuáles son las 3 principales funciones de su área?
   a) _________________________________
   b) _________________________________  
   c) _________________________________

2. Para cada función, ¿qué datos personales maneja?
   - Función 1: _______________________
   - Función 2: _______________________
   - Función 3: _______________________

## FASE 2: MAPEO DE DATOS

3. ¿Cómo obtienen estos datos?
   □ Directamente del titular
   □ De otras áreas de la empresa
   □ De terceros (especificar): __________

4. ¿Con quién comparten esta información?
   □ Otras áreas internas
   □ Proveedores externos
   □ Organismos públicos
   □ Otros: __________________________

## FASE 3: CONSERVACIÓN Y ELIMINACIÓN

5. ¿Cuánto tiempo conservan los datos?
   _____________________________________

6. ¿Tienen procedimiento de eliminación?
   □ Sí (describir): ____________________
   □ No

## OBSERVACIONES
_____________________________________
_____________________________________
_____________________________________

Firma Entrevistado: ___________________
Firma DPO: ___________________________
"""
        return content.encode('utf-8')
    
    elif template_key == "matriz_clasificacion":
        content = f"""
# MATRIZ DE CLASIFICACIÓN DE DATOS
# Sistema LPDP - Ley 21.719
# Generado: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## NIVELES DE CLASIFICACIÓN

### DATOS PÚBLICOS
- Definición: Información disponible públicamente
- Ejemplos: Nombre comercial, teléfono corporativo
- Medidas: Ninguna específica

### DATOS INTERNOS
- Definición: Información para uso interno de la organización
- Ejemplos: Políticas internas, procedimientos
- Medidas: Control de acceso básico

### DATOS CONFIDENCIALES  
- Definición: Datos personales de identificación
- Ejemplos: RUT, nombre, dirección, teléfono
- Medidas: Cifrado en tránsito, control de acceso

### DATOS SENSIBLES
- Definición: Datos especialmente protegidos (Art. 2 LPDP)
- Ejemplos: Salud, origen racial, creencias religiosas
- Medidas: Cifrado extremo a extremo, auditoría completa

## MATRIZ DE CLASIFICACIÓN

| Tipo de Dato | Nivel | Base Legal | Medidas Técnicas | Plazo |
|--------------|-------|------------|------------------|-------|
| Nombres y apellidos | Confidencial | Art. 8(a) | Cifrado TLS | 5 años |
| RUT | Confidencial | Art. 8(a) | Cifrado TLS | 5 años |
| Correo electrónico | Confidencial | Art. 8(a) | Cifrado TLS | 3 años |
| Teléfono | Confidencial | Art. 8(a) | Cifrado TLS | 3 años |
| Datos bancarios | Confidencial | Art. 8(b) | Cifrado AES | 7 años |
| Salario | Confidencial | Art. 8(b) | Cifrado AES | 7 años |
| Datos de salud | Sensible | Art. 8(a) + consentimiento | Cifrado E2E | 10 años |
| Evaluaciones desempeño | Confidencial | Art. 8(b) | Cifrado TLS | 5 años |

## INSTRUCCIONES DE USO
1. Identifique todos los datos que maneja su organización
2. Clasifique según los niveles definidos
3. Asigne base legal apropiada
4. Implemente medidas técnicas correspondientes
5. Establezca plazos de conservación
6. Revise y actualice cada 6 meses

Para más información, consulte el Manual DPO.
"""
        return content.encode('utf-8')
    
    elif template_key == "checklist_cumplimiento":
        content = f"""
# CHECKLIST CUMPLIMIENTO LEY 21.719
# Sistema LPDP - Protección de Datos Personales
# Generado: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## OBLIGACIONES GENERALES

### Art. 4 - Principios
□ Licitud del tratamiento
□ Finalidad específica y legítima  
□ Proporcionalidad de los datos
□ Calidad de los datos
□ Responsabilidad proactiva
□ Transparencia en el tratamiento

### Art. 8 - Bases de Licitud
□ Consentimiento del titular (cuando aplique)
□ Cumplimiento de obligación legal
□ Protección de intereses vitales
□ Cumplimiento de función pública
□ Interés legítimo (evaluado)

## DERECHOS DE TITULARES (Art. 10-13)

□ Procedimiento para derecho de acceso
□ Procedimiento para derecho de rectificación
□ Procedimiento para derecho de cancelación
□ Procedimiento para derecho de oposición
□ Procedimiento para derecho de portabilidad
□ Derecho a no ser objeto de decisiones automatizadas

## REGISTRO DE ACTIVIDADES (Art. 25)

□ RAT documentado y actualizado
□ Todas las actividades identificadas
□ Finalidades específicas documentadas
□ Bases legales claramente establecidas
□ Categorías de datos identificadas
□ Destinatarios documentados
□ Transferencias internacionales (si aplican)
□ Plazos de conservación establecidos

## MEDIDAS DE SEGURIDAD (Art. 26)

□ Medidas técnicas implementadas
□ Medidas organizativas implementadas
□ Cifrado de datos en tránsito
□ Cifrado de datos en reposo
□ Control de acceso por roles
□ Registro de accesos (logs)
□ Backup y recuperación
□ Plan de continuidad

## TRANSFERENCIAS INTERNACIONALES (Art. 27)

□ Evaluación de nivel de protección del país
□ Garantías adecuadas establecidas
□ Cláusulas contractuales tipo (si aplican)
□ Normas corporativas vinculantes (si aplican)
□ Decisión de adecuación verificada

## EVALUACIÓN DE IMPACTO (Art. 28)

□ EIPD realizada para tratamientos de alto riesgo
□ Descripción del tratamiento
□ Evaluación de necesidad y proporcionalidad
□ Evaluación de riesgos para derechos
□ Medidas de mitigación implementadas
□ Consulta previa (si requerida)

## NOTIFICACIÓN DE BRECHAS (Art. 29)

□ Procedimiento de detección de brechas
□ Procedimiento de evaluación de riesgo
□ Notificación a autoridad (72 horas)
□ Comunicación a titulares (cuando aplique)
□ Registro de brechas
□ Medidas correctivas implementadas

## DELEGADO DE PROTECCIÓN (Art. 30)

□ DPO designado (cuando requerido)
□ Cualificaciones profesionales adecuadas
□ Independencia y ausencia de conflictos
□ Recursos suficientes asignados
□ Reporte a alta dirección
□ Contacto publicado

## CUMPLIMIENTO ORGANIZACIONAL

□ Políticas de protección de datos
□ Capacitación del personal
□ Contratos con encargados de tratamiento
□ Código de conducta (si aplica)
□ Certificación (si aplica)
□ Auditorías internas regulares

## FECHA DE REVISIÓN: _______________
## PRÓXIMA REVISIÓN: _______________
## RESPONSABLE: ____________________

ESTADO GENERAL DE CUMPLIMIENTO:
□ Completo (100%)
□ Avanzado (75-99%)
□ En proceso (50-74%)
□ Inicial (25-49%)
□ Sin iniciar (0-24%)

Observaciones:
_________________________________
_________________________________
_________________________________
"""
        return content.encode('utf-8')
    
    else:
        # Contenido genérico
        content = f"""
# {TEMPLATES[template_key]['name']}
# Sistema LPDP - Ley 21.719
# Generado: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

{TEMPLATES[template_key]['description']}

Este es un archivo de demostración del sistema LPDP.
En la versión completa, este archivo contendría la documentación
y herramientas profesionales correspondientes.

Para más información sobre el sistema completo de cumplimiento
de la Ley 21.719, contacte a Jurídica Digital SPA.
"""
        return content.encode('utf-8')

@router.get("/templates")
async def list_templates():
    """Listar todas las plantillas disponibles"""
    return {
        "templates": TEMPLATES,
        "total_count": len(TEMPLATES),
        "categories": {
            "forms": ["formulario_entrevista_rrhh", "formulario_entrevista_finanzas"],
            "excel": ["rat_plantilla", "matriz_clasificacion"],
            "documents": ["checklist_cumplimiento", "manual_dpo"],
            "cases": ["casos_practicos_iot"]
        }
    }

@router.get("/packages")
async def list_packages():
    """Listar paquetes de descarga disponibles"""
    return {
        "packages": PACKAGES,
        "total_count": len(PACKAGES)
    }

@router.get("/template/{template_key}")
async def download_template(template_key: str):
    """Descargar una plantilla específica"""
    if template_key not in TEMPLATES:
        raise HTTPException(status_code=404, detail="Plantilla no encontrada")
    
    template = TEMPLATES[template_key]
    content = generate_template_content(template_key)
    
    # Determinar tipo de contenido
    if template["type"] == "excel":
        media_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        extension = ".xlsx"
    elif template["type"] == "pdf":
        media_type = "application/pdf"
        extension = ".pdf"
    else:
        media_type = "text/plain"
        extension = ".txt"
    
    filename = f"{template_key}{extension}"
    
    return StreamingResponse(
        io.BytesIO(content),
        media_type=media_type,
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.get("/package/{package_key}")
async def download_package(package_key: str):
    """Descargar un paquete completo"""
    if package_key not in PACKAGES:
        raise HTTPException(status_code=404, detail="Paquete no encontrado")
    
    package = PACKAGES[package_key]
    
    # Crear archivo ZIP en memoria
    zip_buffer = io.BytesIO()
    
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        # Agregar README del paquete
        readme_content = f"""
# {package['name']}
{package['description']}

## Contenido del Paquete
Tamaño total: {package['size']}

## Archivos Incluidos:
"""
        for template_key in package['templates']:
            template = TEMPLATES[template_key]
            readme_content += f"- {template['name']} ({template['size']})\n"
        
        readme_content += f"""
## Instalación
1. Descomprima todos los archivos en su directorio de trabajo
2. Abra las plantillas con Microsoft Office 2016 o superior
3. Siga las instrucciones incluidas en cada documento

## Soporte
Este paquete incluye 90 días de soporte técnico.
Contacto: soporte@juridicadigital.cl

## Generado
{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
Sistema LPDP v3.0.0
"""
        
        zip_file.writestr("README.txt", readme_content.encode('utf-8'))
        
        # Agregar cada plantilla
        for template_key in package['templates']:
            if template_key in TEMPLATES:
                template = TEMPLATES[template_key]
                content = generate_template_content(template_key)
                
                # Determinar extensión
                if template["type"] == "excel":
                    extension = ".xlsx"
                elif template["type"] == "pdf":
                    extension = ".pdf"
                else:
                    extension = ".txt"
                
                filename = f"{template_key}{extension}"
                zip_file.writestr(filename, content)
    
    zip_buffer.seek(0)
    
    return StreamingResponse(
        io.BytesIO(zip_buffer.read()),
        media_type="application/zip",
        headers={"Content-Disposition": f"attachment; filename={package_key}_package.zip"}
    )

@router.get("/preview/{template_key}")
async def preview_template(template_key: str):
    """Vista previa de una plantilla"""
    if template_key not in TEMPLATES:
        raise HTTPException(status_code=404, detail="Plantilla no encontrada")
    
    template = TEMPLATES[template_key]
    content = generate_template_content(template_key).decode('utf-8')
    
    # Mostrar solo las primeras 1000 caracteres para preview
    preview_content = content[:1000]
    if len(content) > 1000:
        preview_content += "\n\n... [contenido truncado para vista previa] ..."
    
    return {
        "template": template,
        "preview": preview_content,
        "full_size": len(content),
        "download_url": f"/api/v1/downloads/template/{template_key}"
    }