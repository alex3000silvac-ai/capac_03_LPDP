-- 📊 TABLAS ADICIONALES PARA BACKEND COMPLETO
-- Complementa partner_integrations con todas las tablas necesarias

-- 1. TABLA PARA LOGS DE ACCESO DE PARTNERS
CREATE TABLE IF NOT EXISTS public.partner_access_logs (
    id BIGSERIAL PRIMARY KEY,
    partner_type TEXT NOT NULL,
    action TEXT NOT NULL, -- 'get_completed_rats', 'intelligent_analysis', 'document_download', etc.
    endpoint TEXT,
    ip_address INET,
    user_agent TEXT,
    api_key_used TEXT, -- Último fragmento de la API key para auditoría
    request_size INTEGER,
    response_size INTEGER,
    response_time_ms INTEGER,
    status_code INTEGER,
    error_message TEXT,
    metadata JSONB,
    tenant_id TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_partner_access_type 
        CHECK (partner_type IN ('prelafit', 'datacompliance', 'rsm_chile', 'amsoft', 'fc_group'))
);

-- Índices para logs de acceso
CREATE INDEX IF NOT EXISTS idx_partner_access_logs_partner_type ON public.partner_access_logs(partner_type);
CREATE INDEX IF NOT EXISTS idx_partner_access_logs_action ON public.partner_access_logs(action);
CREATE INDEX IF NOT EXISTS idx_partner_access_logs_timestamp ON public.partner_access_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_partner_access_logs_status_code ON public.partner_access_logs(status_code);

-- 2. TABLA PARA CONFIGURACIÓN DE WEBHOOKS
CREATE TABLE IF NOT EXISTS public.partner_webhooks (
    id BIGSERIAL PRIMARY KEY,
    partner_type TEXT NOT NULL,
    webhook_url TEXT NOT NULL,
    events TEXT[] NOT NULL, -- ['rat_completed', 'document_generated', etc.]
    signature_secret TEXT,
    is_active BOOLEAN DEFAULT true,
    last_ping_at TIMESTAMP WITH TIME ZONE,
    last_ping_status INTEGER,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    timeout_seconds INTEGER DEFAULT 30,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    
    CONSTRAINT valid_webhook_partner_type 
        CHECK (partner_type IN ('prelafit', 'datacompliance', 'rsm_chile', 'amsoft', 'fc_group')),
    CONSTRAINT valid_webhook_url 
        CHECK (webhook_url ~ '^https?://.*')
);

-- Índices para webhooks
CREATE INDEX IF NOT EXISTS idx_partner_webhooks_partner_type ON public.partner_webhooks(partner_type);
CREATE INDEX IF NOT EXISTS idx_partner_webhooks_is_active ON public.partner_webhooks(is_active);

-- 3. TABLA PARA API KEYS DE PARTNERS
CREATE TABLE IF NOT EXISTS public.partner_api_keys (
    id BIGSERIAL PRIMARY KEY,
    partner_type TEXT NOT NULL,
    key_name TEXT NOT NULL, -- Nombre descriptivo
    api_key_hash TEXT NOT NULL, -- Hash de la API key real
    api_key_preview TEXT NOT NULL, -- Primeros y últimos caracteres para mostrar
    permissions JSONB DEFAULT '[]'::jsonb, -- ['rats:read', 'documents:read', etc.]
    rate_limit_per_minute INTEGER DEFAULT 60,
    rate_limit_per_hour INTEGER DEFAULT 1000,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE,
    last_used_at TIMESTAMP WITH TIME ZONE,
    usage_count BIGINT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    
    CONSTRAINT valid_api_key_partner_type 
        CHECK (partner_type IN ('prelafit', 'datacompliance', 'rsm_chile', 'amsoft', 'fc_group')),
    CONSTRAINT unique_partner_key_name 
        UNIQUE (partner_type, key_name)
);

-- Índices para API keys
CREATE INDEX IF NOT EXISTS idx_partner_api_keys_partner_type ON public.partner_api_keys(partner_type);
CREATE INDEX IF NOT EXISTS idx_partner_api_keys_is_active ON public.partner_api_keys(is_active);
CREATE INDEX IF NOT EXISTS idx_partner_api_keys_expires_at ON public.partner_api_keys(expires_at);

-- 4. TABLA PARA DOCUMENTOS GENERADOS (si no existe)
CREATE TABLE IF NOT EXISTS public.documentos_generados (
    id BIGSERIAL PRIMARY KEY,
    tenant_id TEXT NOT NULL DEFAULT 'default',
    rat_id TEXT NOT NULL,
    tipo_documento TEXT NOT NULL, -- 'EIPD', 'DPA', 'CONSULTA_PREVIA', etc.
    titulo TEXT,
    contenido TEXT,
    content_url TEXT, -- URL del archivo generado
    file_url TEXT, -- URL del archivo PDF/Word
    estado TEXT DEFAULT 'generado', -- 'generado', 'firmado', 'enviado', 'archivado'
    hash_verificacion TEXT, -- Hash para verificar integridad
    metadata JSONB,
    generated_by_ai BOOLEAN DEFAULT false,
    template_version TEXT,
    file_size_bytes INTEGER,
    mime_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    
    CONSTRAINT valid_documento_tipo 
        CHECK (tipo_documento IN ('EIPD', 'DPIA', 'DPA', 'CONSENTIMIENTO_MEDICO', 'AUTORIZACION_PARENTAL', 'CONSULTA_PREVIA', 'POLITICA_PRIVACIDAD')),
    CONSTRAINT valid_documento_estado 
        CHECK (estado IN ('generado', 'borrador', 'firmado', 'enviado', 'archivado'))
);

-- Índices para documentos
CREATE INDEX IF NOT EXISTS idx_documentos_generados_rat_id ON public.documentos_generados(rat_id);
CREATE INDEX IF NOT EXISTS idx_documentos_generados_tipo ON public.documentos_generados(tipo_documento);
CREATE INDEX IF NOT EXISTS idx_documentos_generados_estado ON public.documentos_generados(estado);

-- 5. TABLA PARA ESTADÍSTICAS DE USO DE PARTNERS
CREATE TABLE IF NOT EXISTS public.partner_usage_stats (
    id BIGSERIAL PRIMARY KEY,
    partner_type TEXT NOT NULL,
    date_period DATE NOT NULL, -- Fecha del período (día)
    total_requests INTEGER DEFAULT 0,
    successful_requests INTEGER DEFAULT 0,
    failed_requests INTEGER DEFAULT 0,
    total_rats_accessed INTEGER DEFAULT 0,
    total_documents_downloaded INTEGER DEFAULT 0,
    total_analyses_performed INTEGER DEFAULT 0,
    avg_response_time_ms DECIMAL(10,2),
    total_data_transferred_mb DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_usage_stats_partner_type 
        CHECK (partner_type IN ('prelafit', 'datacompliance', 'rsm_chile', 'amsoft', 'fc_group')),
    CONSTRAINT unique_partner_date_period 
        UNIQUE (partner_type, date_period)
);

-- Índices para estadísticas de uso
CREATE INDEX IF NOT EXISTS idx_partner_usage_stats_partner_type ON public.partner_usage_stats(partner_type);
CREATE INDEX IF NOT EXISTS idx_partner_usage_stats_date_period ON public.partner_usage_stats(date_period DESC);

-- ==================== FUNCIONES Y TRIGGERS ====================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
DROP TRIGGER IF EXISTS trigger_update_partner_webhooks_updated_at ON public.partner_webhooks;
CREATE TRIGGER trigger_update_partner_webhooks_updated_at
    BEFORE UPDATE ON public.partner_webhooks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_partner_api_keys_updated_at ON public.partner_api_keys;
CREATE TRIGGER trigger_update_partner_api_keys_updated_at
    BEFORE UPDATE ON public.partner_api_keys
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_documentos_generados_updated_at ON public.documentos_generados;
CREATE TRIGGER trigger_update_documentos_generados_updated_at
    BEFORE UPDATE ON public.documentos_generados
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para limpiar logs antiguos (mantener solo 90 días)
CREATE OR REPLACE FUNCTION cleanup_old_partner_logs()
RETURNS void AS $$
BEGIN
    DELETE FROM public.partner_access_logs 
    WHERE timestamp < NOW() - INTERVAL '90 days';
    
    DELETE FROM public.partner_usage_stats 
    WHERE date_period < CURRENT_DATE - INTERVAL '365 days';
END;
$$ LANGUAGE plpgsql;

-- ==================== ROW LEVEL SECURITY ====================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.partner_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentos_generados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_usage_stats ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (administradores pueden ver todo)
CREATE POLICY "Admins can view all partner logs" 
    ON public.partner_access_logs 
    FOR SELECT 
    TO authenticated 
    USING (true);

CREATE POLICY "Admins can manage partner webhooks" 
    ON public.partner_webhooks 
    FOR ALL 
    TO authenticated 
    USING (true);

CREATE POLICY "Admins can manage partner API keys" 
    ON public.partner_api_keys 
    FOR ALL 
    TO authenticated 
    USING (true);

CREATE POLICY "Users can view own tenant documents" 
    ON public.documentos_generados 
    FOR SELECT 
    USING (
        tenant_id IN (
            SELECT t.id FROM public.tenants t 
            WHERE t.id = documentos_generados.tenant_id
        )
    );

-- ==================== DATOS DE EJEMPLO ====================

-- API Keys de ejemplo (en producción estos serían hashes reales)
INSERT INTO public.partner_api_keys (
    partner_type,
    key_name,
    api_key_hash,
    api_key_preview,
    permissions,
    rate_limit_per_minute,
    rate_limit_per_hour
) VALUES 
(
    'prelafit',
    'Prelafit Production Key',
    'hash_pk_prelafit_abc123',
    'pk_prel...abc123',
    '["rats:read", "documents:read", "analysis:create", "webhooks:configure"]'::jsonb,
    100,
    2000
),
(
    'rsm_chile',
    'RSM Chile Integration',
    'hash_pk_rsm_chile_ghi789',
    'pk_rsm_...ghi789',
    '["rats:read", "documents:read", "analysis:create"]'::jsonb,
    100,
    2000
),
(
    'datacompliance',
    'DataCompliance API',
    'hash_pk_datacompliance_def456',
    'pk_data...def456',
    '["rats:read", "analysis:create"]'::jsonb,
    50,
    1000
) ON CONFLICT DO NOTHING;

-- Webhooks de ejemplo
INSERT INTO public.partner_webhooks (
    partner_type,
    webhook_url,
    events
) VALUES 
(
    'prelafit',
    'https://prelafit.com/webhook/juridica-digital',
    ARRAY['rat_completed', 'document_generated', 'high_risk_detected']
),
(
    'rsm_chile',
    'https://rsm.cl/api/webhook/compliance',
    ARRAY['rat_completed', 'compliance_alert']
) ON CONFLICT DO NOTHING;

-- Documentos de ejemplo
INSERT INTO public.documentos_generados (
    tenant_id,
    rat_id,
    tipo_documento,
    titulo,
    estado,
    generated_by_ai,
    mime_type
) VALUES 
(
    'default',
    '1',
    'EIPD',
    'Evaluación de Impacto - RAT Sistema Financiero',
    'generado',
    true,
    'application/pdf'
),
(
    'default',
    '1',
    'DPA',
    'Data Processing Agreement - Proveedor Cloud',
    'firmado',
    false,
    'application/pdf'
) ON CONFLICT DO NOTHING;

-- Estadísticas de ejemplo
INSERT INTO public.partner_usage_stats (
    partner_type,
    date_period,
    total_requests,
    successful_requests,
    failed_requests,
    total_rats_accessed,
    avg_response_time_ms
) VALUES 
(
    'prelafit',
    CURRENT_DATE - INTERVAL '1 day',
    150,
    145,
    5,
    50,
    245.5
),
(
    'rsm_chile',
    CURRENT_DATE - INTERVAL '1 day',
    80,
    78,
    2,
    25,
    189.2
) ON CONFLICT DO NOTHING;

-- ==================== COMENTARIOS DE DOCUMENTACIÓN ====================

COMMENT ON TABLE public.partner_access_logs IS 'Logs de acceso y auditoría para todas las requests de partners';
COMMENT ON TABLE public.partner_webhooks IS 'Configuración de webhooks por partner para notificaciones en tiempo real';
COMMENT ON TABLE public.partner_api_keys IS 'Gestión de API Keys por partner con permisos y rate limiting';
COMMENT ON TABLE public.documentos_generados IS 'Documentos de compliance generados (PDFs, contratos, evaluaciones)';
COMMENT ON TABLE public.partner_usage_stats IS 'Estadísticas agregadas de uso por partner y período';

-- Mensaje de confirmación
SELECT 'Todas las tablas backend para Partners API creadas exitosamente' as resultado;