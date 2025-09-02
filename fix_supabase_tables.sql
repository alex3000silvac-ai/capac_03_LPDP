-- ========================================
-- SCRIPT DE CORRECCIÓN PARA SUPABASE
-- CREA TABLAS FALTANTES Y CORRIGE ESQUEMA
-- ========================================

-- 1. CREAR TABLA ORGANIZACIONES (CRÍTICA - FALTANTE)
-- ========================================
CREATE TABLE IF NOT EXISTS public.organizaciones (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    industry VARCHAR(100),
    size VARCHAR(50),
    country VARCHAR(100) DEFAULT 'Chile',
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_demo BOOLEAN DEFAULT false,
    online_mode BOOLEAN DEFAULT true,
    active BOOLEAN DEFAULT true,
    -- Campos adicionales para compatibilidad
    rut VARCHAR(20),
    direccion VARCHAR(500),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Índices para organizaciones
CREATE INDEX IF NOT EXISTS idx_organizaciones_user_id ON public.organizaciones(user_id);
CREATE INDEX IF NOT EXISTS idx_organizaciones_active ON public.organizaciones(active);

-- 2. CREAR TABLA SYSTEM_ALERTS (FALTANTE)
-- ========================================
CREATE TABLE IF NOT EXISTS public.system_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id VARCHAR(255),
    alert_type VARCHAR(100) NOT NULL,
    severity VARCHAR(50) DEFAULT 'medium',
    title VARCHAR(255) NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    status VARCHAR(50) DEFAULT 'active',
    resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para system_alerts
CREATE INDEX IF NOT EXISTS idx_system_alerts_tenant_id ON public.system_alerts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_system_alerts_resolved ON public.system_alerts(resolved);
CREATE INDEX IF NOT EXISTS idx_system_alerts_created_at ON public.system_alerts(created_at DESC);

-- 3. AGREGAR COLUMNAS FALTANTES A MAPEO_DATOS_RAT (SI NO EXISTEN)
-- ========================================
-- Verificar si la columna metadata existe, si no, agregarla
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'mapeo_datos_rat' 
        AND column_name = 'metadata'
    ) THEN
        ALTER TABLE public.mapeo_datos_rat 
        ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;

-- 4. CREAR TABLA EVALUACIONES_IMPACTO (SI NO EXISTE)
-- ========================================
CREATE TABLE IF NOT EXISTS public.evaluaciones_impacto (
    id VARCHAR(255) PRIMARY KEY,
    rat_id VARCHAR(255),
    tenant_id INTEGER,
    user_id UUID,
    tipo VARCHAR(50) CHECK (tipo IN ('EIPD', 'DPIA', 'PIA')),
    titulo VARCHAR(255) NOT NULL,
    descripcion_tratamiento TEXT,
    base_legal VARCHAR(100),
    necesidad_proporcionalidad JSONB,
    riesgos_identificados TEXT[],
    medidas_mitigacion TEXT[],
    conclusion VARCHAR(100),
    fundamento_legal TEXT,
    status VARCHAR(50) DEFAULT 'GENERADO_AUTOMATICAMENTE',
    requiere_revision_dpo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para evaluaciones_impacto
CREATE INDEX IF NOT EXISTS idx_evaluaciones_impacto_rat_id ON public.evaluaciones_impacto(rat_id);
CREATE INDEX IF NOT EXISTS idx_evaluaciones_impacto_tenant_id ON public.evaluaciones_impacto(tenant_id);

-- 5. CREAR TABLA RAT_EIPD_ASSOCIATIONS (SI NO EXISTE)
-- ========================================
CREATE TABLE IF NOT EXISTS public.rat_eipd_associations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    rat_id VARCHAR(255) NOT NULL,
    eipd_id VARCHAR(255) NOT NULL,
    tenant_id INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    UNIQUE(rat_id, eipd_id)
);

-- Índices para rat_eipd_associations
CREATE INDEX IF NOT EXISTS idx_rat_eipd_associations_rat_id ON public.rat_eipd_associations(rat_id);
CREATE INDEX IF NOT EXISTS idx_rat_eipd_associations_eipd_id ON public.rat_eipd_associations(eipd_id);

-- 6. CREAR TABLA DPO_NOTIFICATIONS (SI NO EXISTE)
-- ========================================
CREATE TABLE IF NOT EXISTS public.dpo_notifications (
    id SERIAL PRIMARY KEY,
    rat_id VARCHAR(255),
    eipd_id VARCHAR(255),
    tenant_id INTEGER,
    user_id UUID,
    tipo VARCHAR(100),
    mensaje TEXT,
    fundamento TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para dpo_notifications
CREATE INDEX IF NOT EXISTS idx_dpo_notifications_rat_id ON public.dpo_notifications(rat_id);
CREATE INDEX IF NOT EXISTS idx_dpo_notifications_status ON public.dpo_notifications(status);

-- 7. INSERTAR ORGANIZACIÓN POR DEFECTO (SI NO EXISTE)
-- ========================================
INSERT INTO public.organizaciones (
    company_name,
    display_name,
    industry,
    size,
    country,
    active,
    metadata
) 
SELECT 
    'Jurídica Digital SpA',
    'Jurídica Digital SpA',
    'Legal Tech',
    'Mediana',
    'Chile',
    true,
    jsonb_build_object(
        'default_org', true,
        'created_by', 'system_init',
        'version', '1.0'
    )
WHERE NOT EXISTS (
    SELECT 1 FROM public.organizaciones WHERE company_name = 'Jurídica Digital SpA'
);

-- 8. CREAR FUNCIONES DE UTILIDAD
-- ========================================

-- Función para obtener tenant_id actual
CREATE OR REPLACE FUNCTION get_current_tenant_id(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_tenant_id INTEGER;
BEGIN
    SELECT id INTO v_tenant_id
    FROM public.organizaciones
    WHERE user_id = p_user_id
    AND active = true
    ORDER BY created_at DESC
    LIMIT 1;
    
    -- Si no encuentra, devolver el tenant por defecto
    IF v_tenant_id IS NULL THEN
        SELECT id INTO v_tenant_id
        FROM public.organizaciones
        WHERE metadata->>'default_org' = 'true'
        LIMIT 1;
    END IF;
    
    RETURN COALESCE(v_tenant_id, 1);
END;
$$ LANGUAGE plpgsql;

-- 9. CREAR TRIGGERS PARA ACTUALIZAR updated_at
-- ========================================

-- Función genérica para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a todas las tablas nuevas
CREATE TRIGGER update_organizaciones_updated_at 
    BEFORE UPDATE ON public.organizaciones 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_alerts_updated_at 
    BEFORE UPDATE ON public.system_alerts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_evaluaciones_impacto_updated_at 
    BEFORE UPDATE ON public.evaluaciones_impacto 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dpo_notifications_updated_at 
    BEFORE UPDATE ON public.dpo_notifications 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 10. POLÍTICAS RLS (Row Level Security)
-- ========================================

-- Habilitar RLS en las tablas nuevas
ALTER TABLE public.organizaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluaciones_impacto ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rat_eipd_associations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dpo_notifications ENABLE ROW LEVEL SECURITY;

-- Políticas para organizaciones
CREATE POLICY "Users can view their own organizations" 
    ON public.organizaciones FOR SELECT 
    USING (auth.uid() = user_id OR metadata->>'default_org' = 'true');

CREATE POLICY "Users can insert their own organizations" 
    ON public.organizaciones FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own organizations" 
    ON public.organizaciones FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own organizations" 
    ON public.organizaciones FOR DELETE 
    USING (auth.uid() = user_id);

-- Políticas para system_alerts
CREATE POLICY "Users can view all alerts" 
    ON public.system_alerts FOR SELECT 
    USING (true);

CREATE POLICY "System can insert alerts" 
    ON public.system_alerts FOR INSERT 
    WITH CHECK (true);

-- Políticas para evaluaciones_impacto
CREATE POLICY "Users can view their evaluaciones" 
    ON public.evaluaciones_impacto FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert evaluaciones" 
    ON public.evaluaciones_impacto FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their evaluaciones" 
    ON public.evaluaciones_impacto FOR UPDATE 
    USING (auth.uid() = user_id);

-- Políticas para rat_eipd_associations
CREATE POLICY "Users can view associations" 
    ON public.rat_eipd_associations FOR SELECT 
    USING (auth.uid() = created_by);

CREATE POLICY "Users can create associations" 
    ON public.rat_eipd_associations FOR INSERT 
    WITH CHECK (auth.uid() = created_by);

-- Políticas para dpo_notifications
CREATE POLICY "Users can view their notifications" 
    ON public.dpo_notifications FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" 
    ON public.dpo_notifications FOR INSERT 
    WITH CHECK (true);

-- 11. VERIFICACIÓN FINAL
-- ========================================
DO $$
DECLARE
    v_count INTEGER;
BEGIN
    -- Verificar que las tablas críticas existen
    SELECT COUNT(*) INTO v_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN ('organizaciones', 'system_alerts', 'evaluaciones_impacto');
    
    IF v_count = 3 THEN
        RAISE NOTICE '✅ Todas las tablas críticas han sido creadas exitosamente';
    ELSE
        RAISE WARNING '⚠️ Algunas tablas críticas no se crearon correctamente';
    END IF;
    
    -- Verificar que existe al menos una organización
    SELECT COUNT(*) INTO v_count FROM public.organizaciones;
    
    IF v_count > 0 THEN
        RAISE NOTICE '✅ Organización por defecto creada exitosamente';
    ELSE
        RAISE WARNING '⚠️ No se pudo crear la organización por defecto';
    END IF;
END $$;

-- ========================================
-- FIN DEL SCRIPT DE CORRECCIÓN
-- ========================================
-- INSTRUCCIONES DE USO:
-- 1. Ejecuta este script en tu base de datos Supabase
-- 2. Puedes ejecutarlo desde el SQL Editor de Supabase
-- 3. El script es idempotente (seguro ejecutar múltiples veces)
-- 4. Después de ejecutar, reinicia tu aplicación React
-- ========================================