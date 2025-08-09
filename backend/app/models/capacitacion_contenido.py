from sqlalchemy import Column, String, Text, Integer, Boolean, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.models.base import BaseModel


class ModuloCapacitacion(BaseModel):
    __tablename__ = "modulos_capacitacion"
    
    codigo = Column(String(50), unique=True, nullable=False)
    nombre = Column(String(255), nullable=False)
    descripcion = Column(Text)
    duracion_estimada = Column(Integer)  # minutos
    orden = Column(Integer)
    activo = Column(Boolean, default=True)
    prerequisitos = Column(JSON)  # lista de códigos de módulos requeridos
    
    # Relaciones
    lecciones = relationship("LeccionCapacitacion", back_populates="modulo", order_by="LeccionCapacitacion.orden")
    evaluaciones = relationship("EvaluacionModulo", back_populates="modulo")


class LeccionCapacitacion(BaseModel):
    __tablename__ = "lecciones_capacitacion"
    
    modulo_id = Column(UUID(as_uuid=True), ForeignKey("modulos_capacitacion.id"))
    codigo = Column(String(50), unique=True, nullable=False)
    titulo = Column(String(255), nullable=False)
    tipo = Column(String(50))  # teoria, video, ejercicio_guiado, caso_practico, quiz
    contenido = Column(JSON)  # estructura flexible para diferentes tipos
    orden = Column(Integer)
    duracion_estimada = Column(Integer)  # minutos
    es_practica = Column(Boolean, default=False)
    puntos_clave = Column(JSON)  # lista de conceptos importantes
    
    # Relaciones
    modulo = relationship("ModuloCapacitacion", back_populates="lecciones")
    progresos = relationship("ProgresoLeccion", back_populates="leccion")


class EjercicioPractico(BaseModel):
    __tablename__ = "ejercicios_practicos"
    
    codigo = Column(String(50), unique=True, nullable=False)
    nombre = Column(String(255), nullable=False)
    descripcion = Column(Text)
    tipo = Column(String(50))  # entrevista_simulada, completar_rat, identificar_datos, mapear_flujos
    nivel_dificultad = Column(String(20))  # basico, intermedio, avanzado
    contexto_empresa = Column(JSON)  # datos de la empresa ficticia
    instrucciones = Column(JSON)  # pasos detallados
    datos_iniciales = Column(JSON)  # información de arranque
    solucion_esperada = Column(JSON)  # respuesta correcta para validación
    pistas = Column(JSON)  # ayudas progresivas
    criterios_evaluacion = Column(JSON)
    
    # Relaciones
    casos_uso = relationship("CasoUsoEjercicio", back_populates="ejercicio")


class CasoEstudio(BaseModel):
    __tablename__ = "casos_estudio"
    
    codigo = Column(String(50), unique=True, nullable=False)
    nombre = Column(String(255), nullable=False)
    industria = Column(String(100))  # salmonicultura, salud, retail, etc
    descripcion_empresa = Column(Text)
    contexto_negocio = Column(Text)
    desafios_especificos = Column(JSON)  # lista de desafíos únicos del sector
    areas_negocio = Column(JSON)  # áreas de la empresa ficticia
    
    # Datos precargados para el caso
    actividades_ejemplo = Column(JSON)
    sistemas_tipicos = Column(JSON)
    flujos_datos_comunes = Column(JSON)
    normativas_aplicables = Column(JSON)
    
    # Relaciones
    ejercicios = relationship("CasoUsoEjercicio", back_populates="caso_estudio")


class CasoUsoEjercicio(BaseModel):
    __tablename__ = "caso_uso_ejercicios"
    
    caso_estudio_id = Column(UUID(as_uuid=True), ForeignKey("casos_estudio.id"))
    ejercicio_id = Column(UUID(as_uuid=True), ForeignKey("ejercicios_practicos.id"))
    orden = Column(Integer)
    
    # Relaciones
    caso_estudio = relationship("CasoEstudio", back_populates="ejercicios")
    ejercicio = relationship("EjercicioPractico", back_populates="casos_uso")


class ProgresoLeccion(BaseModel):
    __tablename__ = "progreso_lecciones"
    
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id"))
    leccion_id = Column(UUID(as_uuid=True), ForeignKey("lecciones_capacitacion.id"))
    estado = Column(String(50))  # no_iniciado, en_progreso, completado
    tiempo_dedicado = Column(Integer)  # segundos
    intentos = Column(Integer, default=0)
    puntaje = Column(Integer)  # para quizzes y ejercicios
    respuestas = Column(JSON)  # respuestas del usuario
    retroalimentacion = Column(JSON)  # feedback específico
    
    # Relaciones
    leccion = relationship("LeccionCapacitacion", back_populates="progresos")


class EvaluacionModulo(BaseModel):
    __tablename__ = "evaluaciones_modulo"
    
    modulo_id = Column(UUID(as_uuid=True), ForeignKey("modulos_capacitacion.id"))
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id"))
    tipo = Column(String(50))  # quiz, ejercicio_completo, proyecto_final
    puntaje_obtenido = Column(Integer)
    puntaje_maximo = Column(Integer)
    tiempo_completado = Column(Integer)  # segundos
    aprobado = Column(Boolean)
    intentos = Column(Integer, default=1)
    detalles_respuestas = Column(JSON)
    areas_mejorar = Column(JSON)  # retroalimentación específica
    
    # Relaciones
    modulo = relationship("ModuloCapacitacion", back_populates="evaluaciones")


class RecursoApoyo(BaseModel):
    __tablename__ = "recursos_apoyo"
    
    tipo = Column(String(50))  # plantilla, guia_rapida, video, infografia
    nombre = Column(String(255), nullable=False)
    descripcion = Column(Text)
    url_recurso = Column(String(500))
    contenido = Column(JSON)
    tags = Column(JSON)  # etiquetas para búsqueda
    modulos_relacionados = Column(JSON)  # códigos de módulos donde aplica