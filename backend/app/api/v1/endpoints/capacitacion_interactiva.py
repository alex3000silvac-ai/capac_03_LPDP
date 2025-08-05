from typing import List, Dict, Any
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import Usuario, ProgresoCapacitacion
from app.services.contenido_capacitacion import (
    CONTENIDO_CAPACITACION,
    obtener_ruta_aprendizaje_personalizada,
    generar_certificado_completacion
)

router = APIRouter()


@router.get("/ruta-personalizada/{usuario_id}")
def obtener_ruta_aprendizaje(
    usuario_id: UUID,
    db: Session = Depends(get_db),
):
    """Obtiene una ruta de aprendizaje personalizada para el usuario"""
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    perfil = {
        "rol": usuario.rol,
        "area_negocio": usuario.area_negocio,
        "industria": "salmonicultura"  # TODO: Obtener de la organización
    }
    
    ruta = obtener_ruta_aprendizaje_personalizada(perfil)
    
    # Enriquecer con progreso actual
    for item in ruta:
        if "modulo" in item:
            progreso = db.query(ProgresoCapacitacion).filter(
                ProgresoCapacitacion.usuario_id == usuario_id,
                ProgresoCapacitacion.modulo == item["modulo"]
            ).first()
            
            item["estado"] = progreso.estado if progreso else "no_iniciado"
            item["progreso"] = progreso.porcentaje_completado if progreso else 0
    
    return {
        "usuario": usuario.nombre,
        "ruta_aprendizaje": ruta,
        "tiempo_estimado_total": "8 horas",
        "modalidad": "Auto-estudio con práctica guiada"
    }


@router.get("/contenido/{modulo_codigo}")
def obtener_contenido_modulo(modulo_codigo: str):
    """Obtiene el contenido completo de un módulo"""
    modulos = CONTENIDO_CAPACITACION["modulos"]
    modulo = next((m for m in modulos if m["codigo"] == modulo_codigo), None)
    
    if not modulo:
        raise HTTPException(status_code=404, detail="Módulo no encontrado")
    
    return modulo


@router.post("/lecciones/{leccion_codigo}/iniciar")
def iniciar_leccion(
    leccion_codigo: str,
    usuario_id: UUID,
    db: Session = Depends(get_db),
):
    """Marca el inicio de una lección y registra el progreso"""
    # Buscar la lección en el contenido
    leccion_encontrada = None
    modulo_codigo = None
    
    for modulo in CONTENIDO_CAPACITACION["modulos"]:
        for leccion in modulo.get("lecciones", []):
            if leccion["codigo"] == leccion_codigo:
                leccion_encontrada = leccion
                modulo_codigo = modulo["codigo"]
                break
    
    if not leccion_encontrada:
        raise HTTPException(status_code=404, detail="Lección no encontrada")
    
    # Actualizar o crear progreso del módulo
    progreso_modulo = db.query(ProgresoCapacitacion).filter(
        ProgresoCapacitacion.usuario_id == usuario_id,
        ProgresoCapacitacion.modulo == modulo_codigo
    ).first()
    
    if not progreso_modulo:
        progreso_modulo = ProgresoCapacitacion(
            usuario_id=usuario_id,
            modulo=modulo_codigo,
            estado="en_progreso",
            porcentaje_completado=0
        )
        db.add(progreso_modulo)
        db.commit()
    
    return {
        "mensaje": "Lección iniciada",
        "leccion": leccion_encontrada,
        "tipo_interaccion": leccion_encontrada["tipo"]
    }


@router.post("/ejercicios/validar")
def validar_ejercicio(
    ejercicio_codigo: str,
    respuestas: Dict[str, Any],
    usuario_id: UUID,
    db: Session = Depends(get_db),
):
    """Valida las respuestas de un ejercicio y proporciona retroalimentación"""
    # Simulación de validación
    # En producción, esto compararía con las respuestas esperadas
    
    validacion = {
        "correcto": False,
        "puntaje": 0,
        "retroalimentacion": []
    }
    
    # Ejemplo de validación para ejercicio de RAT
    if ejercicio_codigo == "EJ-RAT-001":
        if respuestas.get("nombre_actividad"):
            if "selección" in respuestas["nombre_actividad"].lower() or \
               "reclutamiento" in respuestas["nombre_actividad"].lower():
                validacion["retroalimentacion"].append({
                    "campo": "nombre_actividad",
                    "estado": "correcto",
                    "mensaje": "¡Excelente! Has identificado correctamente la actividad"
                })
                validacion["puntaje"] += 25
            else:
                validacion["retroalimentacion"].append({
                    "campo": "nombre_actividad",
                    "estado": "mejorable",
                    "mensaje": "Piensa en la actividad principal, no en el sistema usado",
                    "pista": "¿Qué están haciendo en RRHH? Están ________ personal"
                })
        
        if respuestas.get("finalidad"):
            if "evaluar" in respuestas["finalidad"].lower() or \
               "idoneidad" in respuestas["finalidad"].lower():
                validacion["retroalimentacion"].append({
                    "campo": "finalidad",
                    "estado": "correcto",
                    "mensaje": "Muy bien, has captado el propósito del tratamiento"
                })
                validacion["puntaje"] += 25
        
        if respuestas.get("base_licitud") == "medidas_precontractuales":
            validacion["retroalimentacion"].append({
                "campo": "base_licitud",
                "estado": "correcto",
                "mensaje": "¡Correcto! El proceso de selección se basa en medidas precontractuales"
            })
            validacion["puntaje"] += 25
        
        # Categorías de datos
        datos_esperados = ["identificacion", "contacto", "experiencia_laboral"]
        datos_proporcionados = respuestas.get("categorias_datos", [])
        datos_correctos = [d for d in datos_proporcionados if d in datos_esperados]
        
        if len(datos_correctos) >= 2:
            validacion["retroalimentacion"].append({
                "campo": "categorias_datos",
                "estado": "correcto",
                "mensaje": f"Bien, identificaste {len(datos_correctos)} categorías importantes"
            })
            validacion["puntaje"] += 25
    
    validacion["correcto"] = validacion["puntaje"] >= 75
    
    # Guardar progreso
    # En producción, esto actualizaría ProgresoLeccion
    
    return validacion


@router.get("/simulacion/entrevista/{area_negocio}")
def obtener_simulacion_entrevista(area_negocio: str):
    """Obtiene un escenario de simulación de entrevista"""
    simulaciones = {
        "RRHH": {
            "personaje": {
                "nombre": "Carlos Mendoza",
                "cargo": "Jefe de Personal",
                "personalidad": "Técnico, le gusta hablar de sistemas",
                "avatar": "/avatars/carlos-rrhh.png"
            },
            "escenario": {
                "empresa": "Procesadora Marina del Sur",
                "contexto": "Empresa con 300 empleados, alta rotación en planta",
                "tiempo_disponible": "45 minutos"
            },
            "dialogo_inicial": "Hola, soy Carlos. Me dijeron que vienes a hablar sobre protección de datos. Te cuento que aquí usamos SAP para todo...",
            "objetivos_entrevista": [
                "Identificar al menos 3 actividades de tratamiento",
                "Mapear los sistemas donde se almacenan datos",
                "Descubrir con quién comparten información"
            ],
            "pistas_disponibles": 3
        },
        "FINANZAS": {
            "personaje": {
                "nombre": "Patricia Soto",
                "cargo": "Gerente de Finanzas",
                "personalidad": "Muy ocupada, directa al grano",
                "avatar": "/avatars/patricia-finanzas.png"
            },
            "escenario": {
                "empresa": "Exportadora AquaExport",
                "contexto": "Manejan facturación de clientes nacionales e internacionales",
                "tiempo_disponible": "30 minutos"
            }
        }
    }
    
    simulacion = simulaciones.get(area_negocio.upper())
    if not simulacion:
        raise HTTPException(status_code=404, detail="Simulación no disponible para esta área")
    
    return simulacion


@router.post("/certificado/generar")
def generar_certificado(
    usuario_id: UUID,
    db: Session = Depends(get_db),
):
    """Genera un certificado de completación si el usuario cumple los requisitos"""
    # Verificar módulos completados
    modulos_completados = db.query(ProgresoCapacitacion).filter(
        ProgresoCapacitacion.usuario_id == usuario_id,
        ProgresoCapacitacion.estado == "completado"
    ).all()
    
    if len(modulos_completados) < 3:  # Requisito mínimo
        raise HTTPException(
            status_code=400, 
            detail="Debes completar al menos 3 módulos para obtener el certificado"
        )
    
    # Generar información del certificado
    info_certificado = generar_certificado_completacion(
        str(usuario_id),
        [m.modulo for m in modulos_completados]
    )
    
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    
    return {
        "certificado": {
            "id": f"CERT-LPDP-{usuario_id.hex[:8]}",
            "nombre_completo": usuario.nombre,
            "fecha_emision": "2024-08-02",
            **info_certificado
        },
        "siguiente_paso": "Te recomendamos continuar con el curso de Implementación Práctica"
    }


@router.get("/recursos/plantillas")
def obtener_plantillas_descargables():
    """Obtiene la lista de plantillas y recursos descargables"""
    return {
        "plantillas": CONTENIDO_CAPACITACION["plantillas_descargables"],
        "mensaje": "Estas plantillas te ayudarán a practicar mientras aprendes"
    }