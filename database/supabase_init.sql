-- Script optimizado para Supabase
-- Sistema de Capacitación y Levantamiento de Datos Personales

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Crear esquema principal
CREATE SCHEMA IF NOT EXISTS lpdp;

-- Configurar path de búsqueda
ALTER DATABASE postgres SET search_path TO public, lpdp;

-- Tabla de organizaciones (multi-tenancy)
CREATE TABLE IF NOT EXISTS lpdp.organizaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    rut VARCHAR(20) UNIQUE NOT NULL,
    sector VARCHAR(100),
    tamano VARCHAR(50), -- pequeña, mediana, grande
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT true
);

-- Tabla de usuarios del sistema
CREATE TABLE IF NOT EXISTS lpdp.usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organizacion_id UUID REFERENCES lpdp.organizaciones(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255),
    rol VARCHAR(50) NOT NULL, -- dpo, admin, usuario
    area_negocio VARCHAR(100),
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla principal: Actividades de Tratamiento (RAT)
CREATE TABLE IF NOT EXISTS lpdp.actividades_tratamiento (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organizacion_id UUID REFERENCES lpdp.organizaciones(id) ON DELETE CASCADE,
    codigo_actividad VARCHAR(50) NOT NULL,
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
    estado VARCHAR(50) DEFAULT 'borrador',
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    creado_por UUID REFERENCES lpdp.usuarios(id),
    actualizado_por UUID REFERENCES lpdp.usuarios(id),
    UNIQUE(organizacion_id, codigo_actividad)
);

-- Tabla de categorías de datos
CREATE TABLE IF NOT EXISTS lpdp.categorias_datos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organizacion_id UUID REFERENCES lpdp.organizaciones(id) ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    clasificacion_sensibilidad VARCHAR(50) NOT NULL,
    ejemplos TEXT[],
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Relación: Actividad <-> Datos
CREATE TABLE IF NOT EXISTS lpdp.actividad_datos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actividad_id UUID REFERENCES lpdp.actividades_tratamiento(id) ON DELETE CASCADE,
    categoria_dato_id UUID REFERENCES lpdp.categorias_datos(id) ON DELETE CASCADE,
    clasificacion_sensibilidad VARCHAR(50) NOT NULL,
    detalle_datos TEXT,
    es_obligatorio BOOLEAN DEFAULT false,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(actividad_id, categoria_dato_id)
);

-- Tabla de categorías de titulares
CREATE TABLE IF NOT EXISTS lpdp.categorias_titulares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organizacion_id UUID REFERENCES lpdp.organizaciones(id) ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    es_nna BOOLEAN DEFAULT false,
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Relación: Actividad <-> Titulares
CREATE TABLE IF NOT EXISTS lpdp.actividad_titulares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actividad_id UUID REFERENCES lpdp.actividades_tratamiento(id) ON DELETE CASCADE,
    categoria_titular_id UUID REFERENCES lpdp.categorias_titulares(id) ON DELETE CASCADE,
    cantidad_aproximada VARCHAR(50),
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(actividad_id, categoria_titular_id)
);

-- Tabla de módulos de capacitación
CREATE TABLE IF NOT EXISTS lpdp.modulos_capacitacion (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo VARCHAR(50) UNIQUE NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    orden_secuencia INTEGER NOT NULL,
    duracion_estimada INTEGER, -- en minutos
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de progreso de capacitación
CREATE TABLE IF NOT EXISTS lpdp.progreso_capacitacion (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES lpdp.usuarios(id) ON DELETE CASCADE,
    modulo_id UUID REFERENCES lpdp.modulos_capacitacion(id) ON DELETE CASCADE,
    estado VARCHAR(50) DEFAULT 'no_iniciado',
    progreso_porcentaje INTEGER DEFAULT 0,
    fecha_inicio TIMESTAMP WITH TIME ZONE,
    fecha_completado TIMESTAMP WITH TIME ZONE,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(usuario_id, modulo_id)
);

-- Tabla de sesiones de entrevista
CREATE TABLE IF NOT EXISTS lpdp.sesiones_entrevista (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organizacion_id UUID REFERENCES lpdp.organizaciones(id) ON DELETE CASCADE,
    entrevistador_id UUID REFERENCES lpdp.usuarios(id),
    entrevistado_id UUID REFERENCES lpdp.usuarios(id),
    area_negocio VARCHAR(100),
    estado VARCHAR(50) DEFAULT 'programada',
    fecha_programada TIMESTAMP WITH TIME ZONE,
    fecha_realizada TIMESTAMP WITH TIME ZONE,
    duracion_minutos INTEGER,
    notas TEXT,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_actividades_organizacion ON lpdp.actividades_tratamiento(organizacion_id);
CREATE INDEX IF NOT EXISTS idx_actividades_estado ON lpdp.actividades_tratamiento(estado);
CREATE INDEX IF NOT EXISTS idx_usuarios_organizacion ON lpdp.usuarios(organizacion_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON lpdp.usuarios(email);
CREATE INDEX IF NOT EXISTS idx_progreso_usuario ON lpdp.progreso_capacitacion(usuario_id);

-- Triggers para actualizar fecha_actualizacion
CREATE OR REPLACE FUNCTION lpdp.update_fecha_actualizacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a tablas principales
CREATE TRIGGER update_organizaciones_fecha_actualizacion
    BEFORE UPDATE ON lpdp.organizaciones
    FOR EACH ROW
    EXECUTE FUNCTION lpdp.update_fecha_actualizacion();

CREATE TRIGGER update_usuarios_fecha_actualizacion
    BEFORE UPDATE ON lpdp.usuarios
    FOR EACH ROW
    EXECUTE FUNCTION lpdp.update_fecha_actualizacion();

CREATE TRIGGER update_actividades_fecha_actualizacion
    BEFORE UPDATE ON lpdp.actividades_tratamiento
    FOR EACH ROW
    EXECUTE FUNCTION lpdp.update_fecha_actualizacion();

-- Datos semilla para demostración
INSERT INTO lpdp.modulos_capacitacion (codigo, titulo, descripcion, orden_secuencia, duracion_estimada) VALUES
('MOD-001', 'Introducción a la Ley 21.719', 'Conceptos fundamentales y principios de la protección de datos personales', 1, 30),
('MOD-002', 'Identificación de Datos Personales', 'Cómo identificar y clasificar datos personales en tu organización', 2, 45),
('MOD-003', 'Bases de Licitud', 'Fundamentos legales para el tratamiento de datos', 3, 40),
('MOD-004', 'Derechos de los Titulares', 'Derechos ARCOP y cómo garantizarlos', 4, 35),
('MOD-005', 'Registro de Actividades de Tratamiento', 'Cómo documentar correctamente las actividades', 5, 60);

-- Comentarios para Supabase
COMMENT ON SCHEMA lpdp IS 'Sistema de Capacitación y Levantamiento de Datos Personales - Ley 21.719';
COMMENT ON TABLE lpdp.organizaciones IS 'Organizaciones registradas en el sistema';
COMMENT ON TABLE lpdp.usuarios IS 'Usuarios del sistema con roles específicos';
COMMENT ON TABLE lpdp.actividades_tratamiento IS 'Registro de Actividades de Tratamiento (RAT)';

-- Row Level Security (RLS) para Supabase
ALTER TABLE lpdp.organizaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE lpdp.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE lpdp.actividades_tratamiento ENABLE ROW LEVEL SECURITY;

-- Políticas básicas de seguridad (ajustar según necesidad)
CREATE POLICY "Usuarios pueden ver su propia organización" ON lpdp.organizaciones
    FOR SELECT USING (auth.uid()::text IN (
        SELECT u.id::text FROM lpdp.usuarios u WHERE u.organizacion_id = organizaciones.id
    ));

CREATE POLICY "Usuarios pueden ver otros usuarios de su organización" ON lpdp.usuarios
    FOR SELECT USING (organizacion_id IN (
        SELECT organizacion_id FROM lpdp.usuarios WHERE id = auth.uid()::uuid
    ));