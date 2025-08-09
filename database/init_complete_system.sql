-- Script completo de inicialización del sistema de capacitación LPDP
-- Incluye estructura multi-tenant y todos los módulos

-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Crear esquema master (public)
-- Tablas principales del sistema

-- Tabla de tenants (empresas cliente)
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) UNIQUE NOT NULL,
    schema_name VARCHAR(100) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    suspended_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Configuración de tenants
CREATE TABLE IF NOT EXISTS tenant_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    max_users INTEGER DEFAULT 10,
    max_storage_gb INTEGER DEFAULT 10,
    features_enabled JSONB DEFAULT '{}',
    custom_settings JSONB DEFAULT '{}',
    api_keys JSONB DEFAULT '[]',
    webhook_urls JSONB DEFAULT '[]',
    storage_used_gb DECIMAL(10,2) DEFAULT 0,
    last_activity_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Empresas (información comercial)
CREATE TABLE IF NOT EXISTS empresas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id),
    rut VARCHAR(20) UNIQUE NOT NULL,
    razon_social VARCHAR(255) NOT NULL,
    giro VARCHAR(255),
    direccion VARCHAR(500),
    comuna VARCHAR(100),
    ciudad VARCHAR(100),
    pais VARCHAR(100) DEFAULT 'Chile',
    telefono VARCHAR(50),
    email_contacto VARCHAR(255),
    sitio_web VARCHAR(255),
    cantidad_empleados INTEGER DEFAULT 0,
    es_activa BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Licencias comerciales
CREATE TABLE IF NOT EXISTS licencias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES empresas(id),
    tipo_licencia VARCHAR(50) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_expiracion DATE NOT NULL,
    activa BOOLEAN DEFAULT true,
    clave_licencia VARCHAR(255) UNIQUE NOT NULL,
    datos_encriptados TEXT,
    max_usuarios INTEGER DEFAULT 5,
    usuarios_actuales INTEGER DEFAULT 0,
    precio_total DECIMAL(12,2),
    moneda VARCHAR(3) DEFAULT 'CLP',
    fecha_suspension TIMESTAMP,
    fecha_renovacion TIMESTAMP,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Acceso a módulos por empresa
CREATE TABLE IF NOT EXISTS modulos_acceso (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES empresas(id),
    modulo_codigo VARCHAR(10) NOT NULL,
    activo BOOLEAN DEFAULT true,
    fecha_activacion DATE NOT NULL,
    fecha_expiracion DATE,
    fecha_desactivacion DATE,
    uso_actual INTEGER DEFAULT 0,
    limite_uso INTEGER,
    configuracion JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(empresa_id, modulo_codigo)
);

-- Función para crear esquema de tenant
CREATE OR REPLACE FUNCTION create_tenant_schema(schema_name TEXT)
RETURNS VOID AS $$
BEGIN
    -- Crear esquema
    EXECUTE format('CREATE SCHEMA IF NOT EXISTS %I', schema_name);
    
    -- Crear tablas del tenant
    
    -- Usuarios
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I.users (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            tenant_id UUID NOT NULL,
            username VARCHAR(100) NOT NULL,
            email VARCHAR(255) NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            first_name VARCHAR(255),
            last_name VARCHAR(255),
            rut VARCHAR(20),
            phone VARCHAR(50),
            is_active BOOLEAN DEFAULT true,
            is_superuser BOOLEAN DEFAULT false,
            is_dpo BOOLEAN DEFAULT false,
            mfa_enabled BOOLEAN DEFAULT false,
            mfa_secret VARCHAR(255),
            last_login TIMESTAMP,
            last_ip VARCHAR(45),
            failed_login_attempts INTEGER DEFAULT 0,
            locked_until TIMESTAMP,
            email_verified BOOLEAN DEFAULT false,
            email_verification_token VARCHAR(255),
            password_reset_token VARCHAR(255),
            password_reset_expires TIMESTAMP,
            language VARCHAR(5) DEFAULT ''es'',
            timezone VARCHAR(50) DEFAULT ''America/Santiago'',
            ui_preferences JSONB,
            notification_preferences JSONB DEFAULT ''{"email": {"all": true}, "in_app": {"all": true}}'',
            department VARCHAR(100),
            position VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(tenant_id, username),
            UNIQUE(tenant_id, email)
        )', schema_name);
    
    -- Roles
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I.roles (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            tenant_id UUID NOT NULL,
            name VARCHAR(100) NOT NULL,
            code VARCHAR(50) NOT NULL,
            description TEXT,
            permissions JSONB DEFAULT ''[]'',
            is_system BOOLEAN DEFAULT false,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(tenant_id, code)
        )', schema_name);
    
    -- Usuarios-Roles
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I.user_roles (
            user_id UUID REFERENCES %I.users(id) ON DELETE CASCADE,
            role_id UUID REFERENCES %I.roles(id) ON DELETE CASCADE,
            PRIMARY KEY (user_id, role_id)
        )', schema_name, schema_name, schema_name);
    
    -- Progreso de capacitación
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I.progreso_capacitacion (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            usuario_id UUID NOT NULL,
            modulo_codigo VARCHAR(10) NOT NULL,
            fecha_inicio TIMESTAMP NOT NULL,
            fecha_completado TIMESTAMP,
            porcentaje_completado DECIMAL(5,2) DEFAULT 0,
            tiempo_total_minutos INTEGER DEFAULT 0,
            lecciones_completadas JSONB DEFAULT ''[]'',
            ultima_leccion VARCHAR(50),
            ultima_actividad TIMESTAMP,
            completado BOOLEAN DEFAULT false,
            lecciones_terminadas BOOLEAN DEFAULT false,
            fecha_lecciones_completadas TIMESTAMP,
            evaluacion_iniciada BOOLEAN DEFAULT false,
            evaluacion_fecha_inicio TIMESTAMP,
            evaluacion_intentos INTEGER DEFAULT 0,
            evaluacion_puntaje DECIMAL(5,2),
            evaluacion_aprobada BOOLEAN DEFAULT false,
            evaluacion_fecha_completada TIMESTAMP,
            evaluacion_tiempo_minutos INTEGER,
            certificado_id UUID,
            certificado_fecha TIMESTAMP,
            respuestas_ejercicios JSONB DEFAULT ''{}'',
            metadata JSONB DEFAULT ''{}'',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(usuario_id, modulo_codigo)
        )', schema_name);
    
    -- Sesiones de entrevista/capacitación
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I.sesiones_entrevista (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            usuario_id UUID NOT NULL,
            modulo_codigo VARCHAR(10),
            tipo_sesion VARCHAR(50) NOT NULL,
            fecha_inicio TIMESTAMP NOT NULL,
            fecha_fin TIMESTAMP,
            duracion_minutos INTEGER,
            estado VARCHAR(50) DEFAULT ''en_progreso'',
            datos_sesion JSONB DEFAULT ''{}'',
            ip_address VARCHAR(45),
            user_agent TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )', schema_name);
    
    -- Respuestas de entrevista/evaluación
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I.respuestas_entrevista (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            sesion_id UUID NOT NULL,
            pregunta_id VARCHAR(50) NOT NULL,
            tipo_pregunta VARCHAR(50),
            pregunta_texto TEXT,
            respuesta_valor TEXT,
            respuesta_metadata JSONB DEFAULT ''{}'',
            tiempo_respuesta_segundos INTEGER,
            orden INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )', schema_name);
    
    -- Titulares de datos (Módulo 1: Consentimientos)
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I.titulares_datos (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            tenant_id UUID NOT NULL,
            tipo_identificacion VARCHAR(50) NOT NULL,
            numero_identificacion VARCHAR(255),
            nombre VARCHAR(255),
            email VARCHAR(255),
            telefono VARCHAR(255),
            direccion VARCHAR(500),
            fecha_nacimiento DATE,
            hash_unico VARCHAR(64) NOT NULL,
            activo BOOLEAN DEFAULT true,
            metadata JSONB DEFAULT ''{}'',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(tenant_id, hash_unico)
        )', schema_name);
    
    -- Propósitos de tratamiento
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I.propositos (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            tenant_id UUID NOT NULL,
            nombre VARCHAR(255) NOT NULL,
            descripcion TEXT,
            base_legal VARCHAR(100),
            categoria VARCHAR(100),
            duracion_dias INTEGER,
            requiere_consentimiento BOOLEAN DEFAULT true,
            es_sensible BOOLEAN DEFAULT false,
            activo BOOLEAN DEFAULT true,
            metadata JSONB DEFAULT ''{}'',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )', schema_name);
    
    -- Consentimientos
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I.consentimientos (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            tenant_id UUID NOT NULL,
            titular_id UUID NOT NULL,
            fecha_consentimiento TIMESTAMP NOT NULL,
            fecha_revocacion TIMESTAMP,
            metodo_obtencion VARCHAR(100),
            ip_origen VARCHAR(45),
            user_agent TEXT,
            ubicacion VARCHAR(255),
            estado VARCHAR(50) DEFAULT ''activo'',
            version_terminos VARCHAR(50),
            metadata JSONB DEFAULT ''{}'',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )', schema_name);
    
    -- Solicitudes ARCOPOL (Módulo 2)
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I.solicitudes_arcopol (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            tenant_id UUID NOT NULL,
            titular_id UUID NOT NULL,
            numero_solicitud VARCHAR(50) UNIQUE NOT NULL,
            tipo_derecho VARCHAR(50) NOT NULL,
            estado VARCHAR(50) DEFAULT ''recibida'',
            fecha_solicitud TIMESTAMP NOT NULL,
            fecha_limite_respuesta TIMESTAMP NOT NULL,
            fecha_inicio_proceso TIMESTAMP,
            fecha_respuesta TIMESTAMP,
            descripcion TEXT,
            canal_recepcion VARCHAR(50),
            datos_contacto TEXT,
            asignado_a UUID,
            respondida_a_tiempo BOOLEAN,
            notas_internas JSONB DEFAULT ''[]'',
            metadata JSONB DEFAULT ''{}'',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )', schema_name);
    
    -- Actividades de tratamiento (Módulo 3: Inventario)
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I.actividades_tratamiento (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            tenant_id UUID NOT NULL,
            nombre VARCHAR(255) NOT NULL,
            descripcion TEXT,
            finalidad TEXT,
            departamento VARCHAR(100),
            responsable_id UUID,
            origen_datos VARCHAR(100),
            plazo_conservacion VARCHAR(100),
            transferencias_internacionales BOOLEAN DEFAULT false,
            estado VARCHAR(50) DEFAULT ''activa'',
            fecha_inicio DATE,
            fecha_fin DATE,
            version INTEGER DEFAULT 1,
            metadata JSONB DEFAULT ''{}'',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )', schema_name);
    
    -- Notificaciones de brecha (Módulo 4)
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I.notificaciones_brecha (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            tenant_id UUID NOT NULL,
            codigo_brecha VARCHAR(50) UNIQUE NOT NULL,
            tipo_brecha VARCHAR(100),
            fecha_deteccion TIMESTAMP NOT NULL,
            fecha_ocurrencia TIMESTAMP,
            descripcion TEXT,
            gravedad VARCHAR(50),
            estado VARCHAR(50) DEFAULT ''detectada'',
            categorias_datos_afectadas JSONB DEFAULT ''[]'',
            numero_afectados_estimado INTEGER,
            numero_afectados_confirmado INTEGER DEFAULT 0,
            sistemas_afectados JSONB DEFAULT ''[]'',
            origen_brecha VARCHAR(100),
            detectada_por VARCHAR(255),
            requiere_notificacion_autoridad BOOLEAN DEFAULT false,
            requiere_notificacion_afectados BOOLEAN DEFAULT false,
            fecha_limite_notificacion TIMESTAMP,
            notificada_autoridad BOOLEAN DEFAULT false,
            fecha_notificacion_autoridad TIMESTAMP,
            numero_notificacion_autoridad VARCHAR(100),
            notificados_afectados BOOLEAN DEFAULT false,
            fecha_notificacion_afectados TIMESTAMP,
            fecha_cierre TIMESTAMP,
            resolucion TEXT,
            metadata JSONB DEFAULT ''{}'',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )', schema_name);
    
    -- Evaluaciones de impacto DPIA (Módulo 5)
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I.evaluaciones_impacto (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            tenant_id UUID NOT NULL,
            codigo_dpia VARCHAR(50) UNIQUE NOT NULL,
            actividad_id UUID,
            responsable_id UUID,
            estado VARCHAR(50) DEFAULT ''borrador'',
            version INTEGER DEFAULT 1,
            fecha_inicio TIMESTAMP NOT NULL,
            fecha_finalizacion TIMESTAMP,
            descripcion_proyecto TEXT,
            objetivos JSONB DEFAULT ''[]'',
            necesidad_proporcionalidad TEXT,
            partes_interesadas JSONB DEFAULT ''[]'',
            conclusiones TEXT,
            recomendaciones JSONB DEFAULT ''[]'',
            nivel_riesgo_global VARCHAR(50),
            metadata JSONB DEFAULT ''{}'',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )', schema_name);
    
    -- Transferencias internacionales (Módulo 6)
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I.transferencias_internacionales (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            tenant_id UUID NOT NULL,
            codigo_transferencia VARCHAR(50) UNIQUE NOT NULL,
            actividad_id UUID,
            pais_destino VARCHAR(100) NOT NULL,
            nombre_importador VARCHAR(255),
            tipo_importador VARCHAR(100),
            finalidad TEXT,
            categorias_datos JSONB DEFAULT ''[]'',
            volumen_estimado VARCHAR(100),
            frecuencia VARCHAR(100),
            fecha_inicio DATE NOT NULL,
            fecha_fin DATE,
            activa BOOLEAN DEFAULT true,
            pais_con_nivel_adecuado BOOLEAN DEFAULT false,
            tipo_garantia VARCHAR(100),
            garantia_id UUID,
            contacto_importador JSONB,
            estado VARCHAR(50) DEFAULT ''activa'',
            fecha_suspension TIMESTAMP,
            metadata JSONB DEFAULT ''{}'',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )', schema_name);
    
    -- Logs de auditoría (Módulo 7)
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I.logs_auditoria (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            tenant_id UUID NOT NULL,
            usuario_id UUID,
            fecha_hora TIMESTAMP NOT NULL,
            tipo_evento VARCHAR(100),
            entidad_tipo VARCHAR(100),
            entidad_id UUID,
            accion VARCHAR(100),
            descripcion TEXT,
            ip_origen VARCHAR(45),
            user_agent TEXT,
            datos_adicionales JSONB DEFAULT ''{}'',
            resultado VARCHAR(50),
            nivel_severidad VARCHAR(50),
            hash_evento VARCHAR(64),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )', schema_name);
    
    -- Crear índices
    EXECUTE format('CREATE INDEX idx_%I_users_tenant ON %I.users(tenant_id)', schema_name, schema_name);
    EXECUTE format('CREATE INDEX idx_%I_progreso_usuario ON %I.progreso_capacitacion(usuario_id)', schema_name, schema_name);
    EXECUTE format('CREATE INDEX idx_%I_consentimientos_titular ON %I.consentimientos(titular_id)', schema_name, schema_name);
    EXECUTE format('CREATE INDEX idx_%I_solicitudes_estado ON %I.solicitudes_arcopol(estado)', schema_name, schema_name);
    EXECUTE format('CREATE INDEX idx_%I_logs_fecha ON %I.logs_auditoria(fecha_hora)', schema_name, schema_name);
    
END;
$$ LANGUAGE plpgsql;

-- Crear roles predefinidos
INSERT INTO roles (id, name, code, description, permissions, is_system) VALUES
    (uuid_generate_v4(), 'Administrador', 'admin', 'Administrador del sistema', '["*"]', true),
    (uuid_generate_v4(), 'DPO', 'dpo', 'Data Protection Officer', '["privacy.*", "audit.*", "reports.*"]', true),
    (uuid_generate_v4(), 'Usuario', 'user', 'Usuario estándar', '["capacitacion.*", "recursos.read"]', true),
    (uuid_generate_v4(), 'Auditor', 'auditor', 'Auditor de cumplimiento', '["audit.read", "reports.*"]', true)
ON CONFLICT DO NOTHING;

-- Insertar datos de ejemplo para desarrollo
-- Crear tenant de prueba
INSERT INTO tenants (id, name, domain, schema_name, is_active) VALUES
    ('550e8400-e29b-41d4-a716-446655440000', 'Empresa Demo', 'demo.juridicadigital.cl', 'tenant_demo', true)
ON CONFLICT DO NOTHING;

-- Crear empresa demo
INSERT INTO empresas (id, tenant_id, rut, razon_social, giro, comuna, ciudad, email_contacto) VALUES
    ('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 
     '76.123.456-7', 'Empresa Demo S.A.', 'Tecnología', 'Las Condes', 'Santiago', 'admin@demo.cl')
ON CONFLICT DO NOTHING;

-- Crear licencia demo con todos los módulos
INSERT INTO licencias (empresa_id, tipo_licencia, fecha_inicio, fecha_expiracion, clave_licencia, max_usuarios) VALUES
    ('550e8400-e29b-41d4-a716-446655440000', 'demo', CURRENT_DATE, CURRENT_DATE + INTERVAL '90 days', 
     'DEMO-2024-0001', 50)
ON CONFLICT DO NOTHING;

-- Activar todos los módulos para empresa demo
INSERT INTO modulos_acceso (empresa_id, modulo_codigo, fecha_activacion) VALUES
    ('550e8400-e29b-41d4-a716-446655440000', 'MOD-1', CURRENT_DATE),
    ('550e8400-e29b-41d4-a716-446655440000', 'MOD-2', CURRENT_DATE),
    ('550e8400-e29b-41d4-a716-446655440000', 'MOD-3', CURRENT_DATE),
    ('550e8400-e29b-41d4-a716-446655440000', 'MOD-4', CURRENT_DATE),
    ('550e8400-e29b-41d4-a716-446655440000', 'MOD-5', CURRENT_DATE),
    ('550e8400-e29b-41d4-a716-446655440000', 'MOD-6', CURRENT_DATE),
    ('550e8400-e29b-41d4-a716-446655440000', 'MOD-7', CURRENT_DATE)
ON CONFLICT DO NOTHING;

-- Crear esquema para tenant demo
SELECT create_tenant_schema('tenant_demo');

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE 'Base de datos inicializada correctamente';
    RAISE NOTICE 'Tenant demo creado: demo.juridicadigital.cl';
    RAISE NOTICE 'Todos los módulos activados para empresa demo';
END $$;