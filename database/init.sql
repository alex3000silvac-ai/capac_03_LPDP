-- Base de datos para el Sistema de Capacitación y Levantamiento de Datos Personales
-- Ley N° 21.719

-- Crear esquema principal
CREATE SCHEMA IF NOT EXISTS lpdp;

-- Tabla de organizaciones (multi-tenancy)
CREATE TABLE lpdp.organizaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL,
    rut VARCHAR(20) UNIQUE NOT NULL,
    sector VARCHAR(100),
    tamano VARCHAR(50), -- pequeña, mediana, grande
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT true
);

-- Tabla de usuarios del sistema
CREATE TABLE lpdp.usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizacion_id UUID REFERENCES lpdp.organizaciones(id),
    email VARCHAR(255) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    rol VARCHAR(50) NOT NULL, -- dpo, admin, usuario
    area_negocio VARCHAR(100),
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla principal: Actividades de Tratamiento (RAT)
CREATE TABLE lpdp.actividades_tratamiento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizacion_id UUID REFERENCES lpdp.organizaciones(id),
    codigo_actividad VARCHAR(50) UNIQUE NOT NULL, -- PRO-001, FIN-001, etc
    nombre_actividad VARCHAR(255) NOT NULL,
    descripcion TEXT,
    responsable_proceso UUID REFERENCES lpdp.usuarios(id),
    area_negocio VARCHAR(100),
    finalidad_principal TEXT NOT NULL,
    finalidades_adicionales TEXT[],
    base_licitud VARCHAR(100) NOT NULL,
    bases_licitud_adicionales VARCHAR(100)[],
    plazo_conservacion_general VARCHAR(255),
    politica_eliminacion TEXT,
    medidas_seguridad_desc TEXT,
    estado VARCHAR(50) DEFAULT 'borrador', -- borrador, revisión, aprobado
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    creado_por UUID REFERENCES lpdp.usuarios(id),
    actualizado_por UUID REFERENCES lpdp.usuarios(id)
);

-- Tabla de categorías de datos
CREATE TABLE lpdp.categorias_datos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizacion_id UUID REFERENCES lpdp.organizaciones(id),
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    clasificacion_sensibilidad VARCHAR(50) NOT NULL, -- común, sensible, nna
    ejemplos TEXT[],
    activo BOOLEAN DEFAULT true
);

-- Relación: Actividad <-> Datos
CREATE TABLE lpdp.actividad_datos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actividad_id UUID REFERENCES lpdp.actividades_tratamiento(id) ON DELETE CASCADE,
    categoria_dato_id UUID REFERENCES lpdp.categorias_datos(id),
    clasificacion_sensibilidad VARCHAR(50) NOT NULL,
    detalle_datos TEXT, -- descripción específica de qué datos de esta categoría se usan
    es_obligatorio BOOLEAN DEFAULT false,
    UNIQUE(actividad_id, categoria_dato_id)
);

-- Tabla de categorías de titulares
CREATE TABLE lpdp.categorias_titulares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizacion_id UUID REFERENCES lpdp.organizaciones(id),
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    es_nna BOOLEAN DEFAULT false, -- Niños, Niñas y Adolescentes
    activo BOOLEAN DEFAULT true
);

-- Relación: Actividad <-> Titulares
CREATE TABLE lpdp.actividad_titulares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actividad_id UUID REFERENCES lpdp.actividades_tratamiento(id) ON DELETE CASCADE,
    categoria_titular_id UUID REFERENCES lpdp.categorias_titulares(id),
    cantidad_aproximada VARCHAR(50), -- rangos: 1-100, 100-1000, etc
    UNIQUE(actividad_id, categoria_titular_id)
);

-- Tabla de sistemas y activos de datos
CREATE TABLE lpdp.sistemas_activos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizacion_id UUID REFERENCES lpdp.organizaciones(id),
    nombre VARCHAR(255) NOT NULL,
    tipo VARCHAR(50), -- base_datos, aplicacion, archivo_fisico, servicio_cloud, etc
    descripcion TEXT,
    ubicacion VARCHAR(255), -- servidor local, AWS, carpeta física, etc
    responsable_tecnico UUID REFERENCES lpdp.usuarios(id),
    nivel_seguridad VARCHAR(50),
    activo BOOLEAN DEFAULT true
);

-- Relación: Actividad <-> Sistemas
CREATE TABLE lpdp.actividad_sistemas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actividad_id UUID REFERENCES lpdp.actividades_tratamiento(id) ON DELETE CASCADE,
    sistema_id UUID REFERENCES lpdp.sistemas_activos(id),
    tipo_uso VARCHAR(50), -- almacenamiento, procesamiento, transmisión
    UNIQUE(actividad_id, sistema_id)
);

-- Tabla de destinatarios
CREATE TABLE lpdp.destinatarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizacion_id UUID REFERENCES lpdp.organizaciones(id),
    nombre VARCHAR(255) NOT NULL,
    tipo VARCHAR(50) NOT NULL, -- interno, externo_encargado, externo_cesionario
    rut VARCHAR(20),
    pais VARCHAR(100) DEFAULT 'Chile',
    es_transferencia_internacional BOOLEAN DEFAULT false,
    garantias_transferencia TEXT,
    activo BOOLEAN DEFAULT true
);

-- Relación: Actividad <-> Flujos/Destinatarios
CREATE TABLE lpdp.actividad_flujos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actividad_id UUID REFERENCES lpdp.actividades_tratamiento(id) ON DELETE CASCADE,
    destinatario_id UUID REFERENCES lpdp.destinatarios(id),
    proposito_transferencia TEXT,
    frecuencia VARCHAR(50), -- diaria, semanal, mensual, eventual
    medio_transferencia VARCHAR(100), -- API, email, SFTP, manual
    UNIQUE(actividad_id, destinatario_id)
);

-- Tabla de políticas de retención
CREATE TABLE lpdp.politicas_retencion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizacion_id UUID REFERENCES lpdp.organizaciones(id),
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    periodo_retencion VARCHAR(100), -- "6 meses", "5 años", etc
    justificacion_legal TEXT,
    accion_post_retencion VARCHAR(50), -- eliminar, anonimizar, archivar
    activo BOOLEAN DEFAULT true
);

-- Relación: Actividad <-> Políticas de Retención
CREATE TABLE lpdp.actividad_politicas_retencion (
    actividad_id UUID REFERENCES lpdp.actividades_tratamiento(id) ON DELETE CASCADE,
    politica_id UUID REFERENCES lpdp.politicas_retencion(id),
    categoria_dato_id UUID REFERENCES lpdp.categorias_datos(id),
    PRIMARY KEY (actividad_id, politica_id, categoria_dato_id)
);

-- Tabla de progreso de capacitación
CREATE TABLE lpdp.progreso_capacitacion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES lpdp.usuarios(id),
    modulo VARCHAR(100),
    estado VARCHAR(50), -- no_iniciado, en_progreso, completado
    porcentaje_completado INTEGER DEFAULT 0,
    fecha_inicio TIMESTAMP,
    fecha_completado TIMESTAMP,
    UNIQUE(usuario_id, modulo)
);

-- Tabla de sesiones de entrevista
CREATE TABLE lpdp.sesiones_entrevista (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizacion_id UUID REFERENCES lpdp.organizaciones(id),
    entrevistador_id UUID REFERENCES lpdp.usuarios(id),
    entrevistado_id UUID REFERENCES lpdp.usuarios(id),
    area_negocio VARCHAR(100),
    fecha_entrevista TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(50), -- programada, en_progreso, completada, cancelada
    notas TEXT,
    duracion_minutos INTEGER
);

-- Tabla de respuestas de entrevista
CREATE TABLE lpdp.respuestas_entrevista (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sesion_id UUID REFERENCES lpdp.sesiones_entrevista(id) ON DELETE CASCADE,
    pregunta_clave VARCHAR(100), -- identificar_actividad, entender_proposito, etc
    respuesta TEXT,
    actividad_id UUID REFERENCES lpdp.actividades_tratamiento(id),
    orden INTEGER
);

-- Tabla de plantillas Excel para importación
CREATE TABLE lpdp.plantillas_excel (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizacion_id UUID REFERENCES lpdp.organizaciones(id),
    nombre_archivo VARCHAR(255),
    tipo_plantilla VARCHAR(50), -- actividades, datos, sistemas, etc
    estado VARCHAR(50), -- cargando, procesando, completado, error
    registros_totales INTEGER,
    registros_procesados INTEGER,
    registros_error INTEGER,
    fecha_carga TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cargado_por UUID REFERENCES lpdp.usuarios(id),
    log_errores TEXT
);

-- Tabla de auditoría (logs inmutables)
CREATE TABLE lpdp.auditoria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizacion_id UUID REFERENCES lpdp.organizaciones(id),
    usuario_id UUID REFERENCES lpdp.usuarios(id),
    fecha_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    accion VARCHAR(100), -- crear, actualizar, eliminar, aprobar, etc
    entidad VARCHAR(100), -- actividad_tratamiento, categoria_dato, etc
    entidad_id UUID,
    datos_anteriores JSONB,
    datos_nuevos JSONB,
    ip_address INET,
    user_agent TEXT,
    hash_anterior VARCHAR(64), -- para crear cadena inmutable
    hash_actual VARCHAR(64)
);

-- Índices para mejorar performance
CREATE INDEX idx_actividades_organizacion ON lpdp.actividades_tratamiento(organizacion_id);
CREATE INDEX idx_actividades_estado ON lpdp.actividades_tratamiento(estado);
CREATE INDEX idx_auditoria_fecha ON lpdp.auditoria(fecha_hora);
CREATE INDEX idx_auditoria_usuario ON lpdp.auditoria(usuario_id);
CREATE INDEX idx_sesiones_fecha ON lpdp.sesiones_entrevista(fecha_entrevista);

-- Vistas útiles para reportes
CREATE OR REPLACE VIEW lpdp.vista_actividades_completas AS
SELECT 
    at.id,
    at.codigo_actividad,
    at.nombre_actividad,
    at.area_negocio,
    at.estado,
    at.finalidad_principal,
    at.base_licitud,
    u.nombre as responsable_nombre,
    COUNT(DISTINCT ad.id) as total_categorias_datos,
    COUNT(DISTINCT ati.id) as total_categorias_titulares,
    COUNT(DISTINCT as2.id) as total_sistemas,
    COUNT(DISTINCT af.id) as total_destinatarios
FROM lpdp.actividades_tratamiento at
LEFT JOIN lpdp.usuarios u ON at.responsable_proceso = u.id
LEFT JOIN lpdp.actividad_datos ad ON at.id = ad.actividad_id
LEFT JOIN lpdp.actividad_titulares ati ON at.id = ati.actividad_id
LEFT JOIN lpdp.actividad_sistemas as2 ON at.id = as2.actividad_id
LEFT JOIN lpdp.actividad_flujos af ON at.id = af.actividad_id
GROUP BY at.id, at.codigo_actividad, at.nombre_actividad, at.area_negocio, 
         at.estado, at.finalidad_principal, at.base_licitud, u.nombre;

-- Función para generar hash de auditoría
CREATE OR REPLACE FUNCTION lpdp.generar_hash_auditoria(
    p_accion VARCHAR,
    p_entidad VARCHAR,
    p_entidad_id UUID,
    p_datos JSONB,
    p_hash_anterior VARCHAR
) RETURNS VARCHAR AS $$
BEGIN
    RETURN encode(
        digest(
            p_accion || p_entidad || p_entidad_id::TEXT || 
            p_datos::TEXT || COALESCE(p_hash_anterior, ''),
            'sha256'
        ),
        'hex'
    );
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar fecha_actualizacion
CREATE OR REPLACE FUNCTION lpdp.actualizar_fecha_modificacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_fecha
BEFORE UPDATE ON lpdp.actividades_tratamiento
FOR EACH ROW
EXECUTE FUNCTION lpdp.actualizar_fecha_modificacion();

-- Datos iniciales de ejemplo para capacitación
INSERT INTO lpdp.organizaciones (nombre, rut, sector, tamano) VALUES
('Empresa Demo Capacitación', '11111111-1', 'Educación', 'mediana');

-- Categorías de datos predefinidas
INSERT INTO lpdp.categorias_datos (organizacion_id, nombre, clasificacion_sensibilidad, ejemplos) VALUES
((SELECT id FROM lpdp.organizaciones WHERE rut = '11111111-1'), 'Datos de Identificación', 'común', ARRAY['Nombre completo', 'RUT', 'Número de cédula']),
((SELECT id FROM lpdp.organizaciones WHERE rut = '11111111-1'), 'Datos de Contacto', 'común', ARRAY['Email', 'Teléfono', 'Dirección']),
((SELECT id FROM lpdp.organizaciones WHERE rut = '11111111-1'), 'Datos Laborales', 'común', ARRAY['Cargo', 'Área', 'Fecha ingreso']),
((SELECT id FROM lpdp.organizaciones WHERE rut = '11111111-1'), 'Datos de Salud', 'sensible', ARRAY['Historial médico', 'Licencias', 'Exámenes']),
((SELECT id FROM lpdp.organizaciones WHERE rut = '11111111-1'), 'Datos Socioeconómicos', 'sensible', ARRAY['Nivel de ingresos', 'Deudas', 'Scoring crediticio']);

-- Categorías de titulares predefinidas
INSERT INTO lpdp.categorias_titulares (organizacion_id, nombre, descripcion, es_nna) VALUES
((SELECT id FROM lpdp.organizaciones WHERE rut = '11111111-1'), 'Empleados', 'Personal con contrato vigente', false),
((SELECT id FROM lpdp.organizaciones WHERE rut = '11111111-1'), 'Postulantes', 'Candidatos a posiciones laborales', false),
((SELECT id FROM lpdp.organizaciones WHERE rut = '11111111-1'), 'Clientes', 'Personas naturales que compran productos/servicios', false),
((SELECT id FROM lpdp.organizaciones WHERE rut = '11111111-1'), 'Menores de edad', 'Niños, niñas y adolescentes', true);