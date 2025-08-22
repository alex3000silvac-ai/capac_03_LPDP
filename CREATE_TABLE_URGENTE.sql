-- URGENTE: Crear tabla mapeo_datos_rat para producción
-- Esta tabla es crítica para el funcionamiento del sistema

CREATE TABLE IF NOT EXISTS public.mapeo_datos_rat (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Tenant y usuario
    tenant_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255),
    created_by VARCHAR(255),
    
    -- Identificación básica
    nombre_actividad VARCHAR(500) NOT NULL,
    area_responsable VARCHAR(200) NOT NULL,
    responsable_proceso VARCHAR(200),
    email_responsable VARCHAR(300),
    telefono_responsable VARCHAR(100),
    descripcion TEXT,
    
    -- Finalidades y base legal
    finalidades TEXT[],
    finalidad_principal TEXT,
    finalidades_secundarias TEXT[],
    base_licitud VARCHAR(100) NOT NULL,
    base_legal VARCHAR(100),
    base_legal_descripcion TEXT,
    justificacion_base TEXT,
    
    -- Categorías de datos  
    categorias_titulares TEXT[],
    categorias_datos JSONB DEFAULT '{}',
    datos_sensibles BOOLEAN DEFAULT FALSE,
    datos_menores BOOLEAN DEFAULT FALSE,
    menores_edad BOOLEAN DEFAULT FALSE,
    volumen_registros VARCHAR(200),
    frecuencia_actualizacion VARCHAR(100),
    
    -- Flujos y destinatarios
    origen_datos TEXT[],
    sistemas_almacenamiento TEXT[],
    sistemas_tratamiento TEXT[],
    destinatarios_internos TEXT[],
    destinatarios_externos TEXT[],
    terceros_encargados TEXT[],
    terceros_cesionarios TEXT[],
    transferencias_internacionales JSONB DEFAULT '{"existe": false, "paises": [], "garantias": "", "detalle": ""}',
    
    -- Seguridad
    medidas_seguridad_tecnicas TEXT[],
    medidas_seguridad_organizativas TEXT[],
    evaluacion_impacto BOOLEAN DEFAULT FALSE,
    requiere_dpia BOOLEAN DEFAULT FALSE,
    riesgos_identificados TEXT[],
    medidas_mitigacion TEXT[],
    nivel_riesgo VARCHAR(50) DEFAULT 'bajo',
    
    -- Retención
    plazo_conservacion VARCHAR(300) NOT NULL,
    criterio_conservacion TEXT,
    destino_posterior TEXT,
    criterio_eliminacion TEXT,
    
    -- Derechos ARCOPOL
    procedimiento_derechos TEXT,
    plazo_respuesta_derechos VARCHAR(100),
    
    -- Metadata
    status VARCHAR(50) DEFAULT 'active',
    estado VARCHAR(50) DEFAULT 'borrador',
    version VARCHAR(20) DEFAULT '1.0',
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices críticos para performance
CREATE INDEX IF NOT EXISTS idx_mapeo_rat_tenant ON mapeo_datos_rat(tenant_id);
CREATE INDEX IF NOT EXISTS idx_mapeo_rat_status ON mapeo_datos_rat(status);
CREATE INDEX IF NOT EXISTS idx_mapeo_rat_area ON mapeo_datos_rat(area_responsable);
CREATE INDEX IF NOT EXISTS idx_mapeo_rat_created ON mapeo_datos_rat(created_at DESC);

-- Habilitar RLS
ALTER TABLE mapeo_datos_rat ENABLE ROW LEVEL SECURITY;

-- Política permisiva temporal para pruebas (CAMBIAR EN PRODUCCIÓN)
CREATE POLICY "Acceso temporal para todos" ON mapeo_datos_rat
    FOR ALL 
    USING (true)
    WITH CHECK (true);

-- Función para actualizar timestamp
CREATE OR REPLACE FUNCTION update_mapeo_rat_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar timestamp
DROP TRIGGER IF EXISTS trigger_update_mapeo_rat_timestamp ON mapeo_datos_rat;
CREATE TRIGGER trigger_update_mapeo_rat_timestamp
    BEFORE UPDATE ON mapeo_datos_rat
    FOR EACH ROW
    EXECUTE FUNCTION update_mapeo_rat_timestamp();

-- Insertar un registro de prueba
INSERT INTO mapeo_datos_rat (
    tenant_id,
    nombre_actividad,
    area_responsable,
    finalidades,
    base_licitud,
    plazo_conservacion,
    status
) VALUES (
    'demo_empresa_lpdp_2024',
    'DEMO - Sistema de prueba',
    'TI',
    ARRAY['Demostración', 'Pruebas'],
    'consentimiento',
    '30 días',
    'active'
) ON CONFLICT DO NOTHING;

-- IMPORTANTE: Ejecutar este SQL en Supabase Dashboard
-- SQL Editor > New Query > Ejecutar todo el script