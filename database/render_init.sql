-- Script optimizado para Render PostgreSQL
-- Basado en supabase_init.sql pero sin extensiones específicas de Supabase

-- Crear schema
CREATE SCHEMA IF NOT EXISTS lpdp;

-- Configurar search_path
SET search_path TO lpdp, public;

-- Tabla de organizaciones
CREATE TABLE IF NOT EXISTS lpdp.organizaciones (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    rut VARCHAR(20) UNIQUE NOT NULL,
    direccion TEXT,
    telefono VARCHAR(50),
    email VARCHAR(255),
    sitio_web VARCHAR(255),
    descripcion TEXT,
    logo_url VARCHAR(500),
    activo BOOLEAN DEFAULT true,
    configuracion JSONB DEFAULT '{}',
    fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS lpdp.usuarios (
    id SERIAL PRIMARY KEY,
    organizacion_id INTEGER REFERENCES lpdp.organizaciones(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    nombre_completo VARCHAR(255) NOT NULL,
    rut VARCHAR(20) UNIQUE,
    telefono VARCHAR(50),
    cargo VARCHAR(100),
    departamento VARCHAR(100),
    rol VARCHAR(50) NOT NULL CHECK (rol IN ('superadmin', 'admin', 'responsable', 'usuario')),
    password_hash VARCHAR(255) NOT NULL,
    activo BOOLEAN DEFAULT true,
    fecha_ultimo_acceso TIMESTAMP WITH TIME ZONE,
    intentos_fallidos INTEGER DEFAULT 0,
    bloqueado_hasta TIMESTAMP WITH TIME ZONE,
    debe_cambiar_password BOOLEAN DEFAULT false,
    token_recuperacion VARCHAR(255),
    token_expiracion TIMESTAMP WITH TIME ZONE,
    preferencias JSONB DEFAULT '{}',
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de categorías de datos personales
CREATE TABLE IF NOT EXISTS lpdp.categorias_datos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    nivel_sensibilidad VARCHAR(50) CHECK (nivel_sensibilidad IN ('bajo', 'medio', 'alto', 'muy_alto')),
    requiere_consentimiento_explicito BOOLEAN DEFAULT false,
    ejemplos TEXT[],
    normativa_aplicable TEXT[],
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de módulos de capacitación
CREATE TABLE IF NOT EXISTS lpdp.modulos_capacitacion (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    objetivos TEXT[],
    duracion_estimada INTEGER, -- en minutos
    nivel VARCHAR(50) CHECK (nivel IN ('basico', 'intermedio', 'avanzado')),
    orden INTEGER NOT NULL,
    activo BOOLEAN DEFAULT true,
    contenido JSONB DEFAULT '{}',
    requisitos_previos TEXT[],
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de contenido de capacitación
CREATE TABLE IF NOT EXISTS lpdp.contenido_capacitacion (
    id SERIAL PRIMARY KEY,
    modulo_id INTEGER REFERENCES lpdp.modulos_capacitacion(id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('video', 'texto', 'presentacion', 'documento', 'quiz', 'ejercicio', 'caso_estudio')),
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    contenido JSONB NOT NULL,
    orden INTEGER NOT NULL,
    duracion_estimada INTEGER, -- en minutos
    es_evaluable BOOLEAN DEFAULT false,
    puntos_posibles INTEGER DEFAULT 0,
    intentos_permitidos INTEGER DEFAULT 3,
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de progreso de capacitación
CREATE TABLE IF NOT EXISTS lpdp.progreso_capacitacion (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES lpdp.usuarios(id) ON DELETE CASCADE,
    modulo_id INTEGER REFERENCES lpdp.modulos_capacitacion(id) ON DELETE CASCADE,
    contenido_id INTEGER REFERENCES lpdp.contenido_capacitacion(id) ON DELETE CASCADE,
    estado VARCHAR(50) CHECK (estado IN ('no_iniciado', 'en_progreso', 'completado', 'aprobado', 'reprobado')),
    progreso_porcentaje DECIMAL(5,2) DEFAULT 0,
    puntos_obtenidos INTEGER DEFAULT 0,
    intentos_realizados INTEGER DEFAULT 0,
    tiempo_dedicado INTEGER DEFAULT 0, -- en segundos
    fecha_inicio TIMESTAMP WITH TIME ZONE,
    fecha_ultima_actividad TIMESTAMP WITH TIME ZONE,
    fecha_completado TIMESTAMP WITH TIME ZONE,
    respuestas JSONB DEFAULT '{}',
    UNIQUE(usuario_id, contenido_id)
);

-- Tabla de evaluaciones
CREATE TABLE IF NOT EXISTS lpdp.evaluaciones (
    id SERIAL PRIMARY KEY,
    modulo_id INTEGER REFERENCES lpdp.modulos_capacitacion(id) ON DELETE CASCADE,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    tipo VARCHAR(50) CHECK (tipo IN ('quiz', 'examen', 'practica', 'proyecto')),
    preguntas JSONB NOT NULL,
    tiempo_limite INTEGER, -- en minutos
    puntos_totales INTEGER NOT NULL,
    puntos_aprobacion INTEGER NOT NULL,
    intentos_permitidos INTEGER DEFAULT 1,
    mostrar_respuestas BOOLEAN DEFAULT false,
    orden_aleatorio BOOLEAN DEFAULT false,
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de resultados de evaluaciones
CREATE TABLE IF NOT EXISTS lpdp.resultados_evaluaciones (
    id SERIAL PRIMARY KEY,
    evaluacion_id INTEGER REFERENCES lpdp.evaluaciones(id) ON DELETE CASCADE,
    usuario_id INTEGER REFERENCES lpdp.usuarios(id) ON DELETE CASCADE,
    intento_numero INTEGER NOT NULL,
    puntos_obtenidos INTEGER NOT NULL,
    puntos_totales INTEGER NOT NULL,
    porcentaje DECIMAL(5,2) NOT NULL,
    aprobado BOOLEAN NOT NULL,
    tiempo_empleado INTEGER, -- en segundos
    respuestas JSONB NOT NULL,
    fecha_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
    fecha_fin TIMESTAMP WITH TIME ZONE NOT NULL,
    ip_address INET,
    feedback JSONB DEFAULT '{}'
);

-- Tabla de actividades y registros
CREATE TABLE IF NOT EXISTS lpdp.actividades (
    id SERIAL PRIMARY KEY,
    organizacion_id INTEGER REFERENCES lpdp.organizaciones(id) ON DELETE CASCADE,
    usuario_id INTEGER REFERENCES lpdp.usuarios(id) ON DELETE SET NULL,
    tipo_actividad VARCHAR(100) NOT NULL,
    descripcion TEXT,
    datos_adicionales JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    fecha_actividad TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de simulaciones de entrevistas SAG
CREATE TABLE IF NOT EXISTS lpdp.simulaciones_sag (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES lpdp.usuarios(id) ON DELETE CASCADE,
    escenario VARCHAR(255) NOT NULL,
    preguntas JSONB NOT NULL,
    respuestas JSONB NOT NULL,
    evaluacion JSONB DEFAULT '{}',
    puntuacion_total DECIMAL(5,2),
    duracion_segundos INTEGER,
    completado BOOLEAN DEFAULT false,
    fecha_inicio TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_fin TIMESTAMP WITH TIME ZONE
);

-- Tabla de casos de práctica sandbox
CREATE TABLE IF NOT EXISTS lpdp.casos_sandbox (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    categoria VARCHAR(100),
    dificultad VARCHAR(50) CHECK (dificultad IN ('facil', 'medio', 'dificil', 'experto')),
    escenario JSONB NOT NULL,
    objetivos TEXT[],
    pistas JSONB DEFAULT '[]',
    solucion_esperada JSONB,
    puntos_clave TEXT[],
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de prácticas sandbox de usuarios
CREATE TABLE IF NOT EXISTS lpdp.practicas_sandbox (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES lpdp.usuarios(id) ON DELETE CASCADE,
    caso_id INTEGER REFERENCES lpdp.casos_sandbox(id) ON DELETE CASCADE,
    respuestas JSONB NOT NULL,
    decisiones JSONB DEFAULT '[]',
    evaluacion JSONB DEFAULT '{}',
    puntuacion DECIMAL(5,2),
    tiempo_empleado INTEGER, -- en segundos
    completado BOOLEAN DEFAULT false,
    fecha_inicio TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_fin TIMESTAMP WITH TIME ZONE
);

-- Tabla de notificaciones
CREATE TABLE IF NOT EXISTS lpdp.notificaciones (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES lpdp.usuarios(id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    mensaje TEXT,
    datos JSONB DEFAULT '{}',
    leido BOOLEAN DEFAULT false,
    fecha_leido TIMESTAMP WITH TIME ZONE,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de configuración del sistema
CREATE TABLE IF NOT EXISTS lpdp.configuracion_sistema (
    id SERIAL PRIMARY KEY,
    clave VARCHAR(100) UNIQUE NOT NULL,
    valor JSONB NOT NULL,
    descripcion TEXT,
    tipo VARCHAR(50) CHECK (tipo IN ('string', 'number', 'boolean', 'json', 'array')),
    categoria VARCHAR(100),
    es_publico BOOLEAN DEFAULT false,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de auditoría
CREATE TABLE IF NOT EXISTS lpdp.auditoria (
    id SERIAL PRIMARY KEY,
    tabla_afectada VARCHAR(100) NOT NULL,
    operacion VARCHAR(20) CHECK (operacion IN ('INSERT', 'UPDATE', 'DELETE')),
    usuario_id INTEGER REFERENCES lpdp.usuarios(id) ON DELETE SET NULL,
    datos_anteriores JSONB,
    datos_nuevos JSONB,
    ip_address INET,
    user_agent TEXT,
    fecha_operacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_usuarios_email ON lpdp.usuarios(email);
CREATE INDEX idx_usuarios_organizacion ON lpdp.usuarios(organizacion_id);
CREATE INDEX idx_progreso_usuario_modulo ON lpdp.progreso_capacitacion(usuario_id, modulo_id);
CREATE INDEX idx_actividades_fecha ON lpdp.actividades(fecha_actividad);
CREATE INDEX idx_actividades_usuario ON lpdp.actividades(usuario_id);
CREATE INDEX idx_notificaciones_usuario ON lpdp.notificaciones(usuario_id, leido);

-- Insertar datos iniciales

-- Categorías de datos personales según la ley
INSERT INTO lpdp.categorias_datos (nombre, descripcion, nivel_sensibilidad, requiere_consentimiento_explicito, ejemplos) VALUES
('Identificación', 'Datos que permiten identificar a una persona', 'medio', false, ARRAY['Nombre', 'RUT', 'Dirección', 'Teléfono']),
('Laborales', 'Información relacionada con el empleo', 'medio', false, ARRAY['Cargo', 'Empleador', 'Salario', 'Evaluaciones']),
('Educación', 'Datos sobre formación académica', 'bajo', false, ARRAY['Títulos', 'Certificados', 'Cursos']),
('Salud', 'Información médica y de salud', 'muy_alto', true, ARRAY['Diagnósticos', 'Tratamientos', 'Alergias']),
('Financieros', 'Datos económicos y bancarios', 'alto', true, ARRAY['Cuentas bancarias', 'Tarjetas', 'Deudas']),
('Biométricos', 'Características físicas únicas', 'muy_alto', true, ARRAY['Huella digital', 'Reconocimiento facial', 'Iris']),
('Menores', 'Datos de personas menores de edad', 'muy_alto', true, ARRAY['Datos de hijos', 'Estudiantes menores']),
('Sensibles', 'Origen racial, opiniones políticas, etc.', 'muy_alto', true, ARRAY['Religión', 'Orientación sexual', 'Afiliación política']);

-- Módulos de capacitación
INSERT INTO lpdp.modulos_capacitacion (codigo, titulo, descripcion, objetivos, duracion_estimada, nivel, orden) VALUES
('MOD-001', 'Introducción a la Ley 21.719', 'Conceptos fundamentales de la protección de datos personales en Chile', 
 ARRAY['Comprender los principios de la ley', 'Identificar datos personales', 'Conocer derechos y obligaciones'], 
 60, 'basico', 1),
('MOD-002', 'Categorías de Datos y Consentimiento', 'Tipos de datos personales y requisitos de consentimiento', 
 ARRAY['Clasificar datos personales', 'Aplicar niveles de protección', 'Gestionar consentimientos'], 
 90, 'basico', 2),
('MOD-003', 'Derechos de los Titulares', 'Derechos ARCOP y su implementación práctica', 
 ARRAY['Conocer cada derecho', 'Implementar procedimientos', 'Responder solicitudes'], 
 120, 'intermedio', 3),
('MOD-004', 'Seguridad y Brechas de Datos', 'Medidas de seguridad y gestión de incidentes', 
 ARRAY['Implementar medidas de seguridad', 'Detectar brechas', 'Gestionar incidentes'], 
 150, 'avanzado', 4),
('MOD-005', 'Preparación para Auditorías SAG', 'Cómo prepararse para una fiscalización', 
 ARRAY['Documentar cumplimiento', 'Preparar evidencias', 'Responder requerimientos'], 
 180, 'avanzado', 5);

-- Configuración inicial del sistema
INSERT INTO lpdp.configuracion_sistema (clave, valor, descripcion, tipo, categoria, es_publico) VALUES
('tiempo_sesion', '{"minutos": 30}', 'Tiempo de duración de la sesión', 'json', 'seguridad', false),
('intentos_login', '{"max": 5, "bloqueo_minutos": 15}', 'Política de intentos de login', 'json', 'seguridad', false),
('notificaciones_email', '{"activado": true}', 'Configuración de notificaciones por email', 'json', 'comunicaciones', false),
('modo_mantenimiento', '{"activo": false}', 'Estado de mantenimiento del sistema', 'json', 'sistema', true);

-- Función para actualizar fecha_actualizacion automáticamente
CREATE OR REPLACE FUNCTION lpdp.update_fecha_actualizacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar fecha_actualizacion
CREATE TRIGGER update_organizaciones_fecha_actualizacion
    BEFORE UPDATE ON lpdp.organizaciones
    FOR EACH ROW
    EXECUTE FUNCTION lpdp.update_fecha_actualizacion();

CREATE TRIGGER update_usuarios_fecha_actualizacion
    BEFORE UPDATE ON lpdp.usuarios
    FOR EACH ROW
    EXECUTE FUNCTION lpdp.update_fecha_actualizacion();

CREATE TRIGGER update_modulos_fecha_actualizacion
    BEFORE UPDATE ON lpdp.modulos_capacitacion
    FOR EACH ROW
    EXECUTE FUNCTION lpdp.update_fecha_actualizacion();

-- Crear organización y usuario de demostración
INSERT INTO lpdp.organizaciones (nombre, rut, email, descripcion) VALUES
('Organización Demo', '76.123.456-7', 'demo@organizacion.cl', 'Organización para demostración del sistema');

-- Password: demo123 (deberás generar el hash con tu aplicación)
INSERT INTO lpdp.usuarios (organizacion_id, email, nombre_completo, rol, password_hash) VALUES
(1, 'admin@demo.cl', 'Administrador Demo', 'admin', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewYpfQaXYFHklGDi');

-- Mensaje de éxito
DO $$
BEGIN
    RAISE NOTICE 'Base de datos SCLDP creada exitosamente';
    RAISE NOTICE 'Usuario demo: admin@demo.cl / password: demo123';
END $$;