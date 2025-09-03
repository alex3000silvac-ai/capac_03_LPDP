-- 🌐 TABLA PARA INTEGRACIONES API PARTNERS
-- Según especificaciones API_PARTNERS_INTEGRATION.md

CREATE TABLE IF NOT EXISTS public.partner_integrations (
    id BIGSERIAL PRIMARY KEY,
    tenant_id TEXT NOT NULL DEFAULT 'default',
    rat_id TEXT NOT NULL,
    partner_type TEXT NOT NULL, -- 'prelafit', 'datacompliance', 'rsm_chile', 'amsoft', 'fc_group'
    integration_type TEXT DEFAULT 'api_push', -- 'api_push', 'webhook', 'pull', 'sync'
    payload JSONB NOT NULL,
    status TEXT DEFAULT 'pendiente', -- 'pendiente', 'enviado', 'confirmado', 'error'
    response_data JSONB,
    webhook_url TEXT,
    api_endpoint TEXT,
    retry_count INTEGER DEFAULT 0,
    last_attempt_at TIMESTAMP WITH TIME ZONE,
    success_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    
    -- Índices para performance
    CONSTRAINT fk_partner_integrations_tenant 
        FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE,
    CONSTRAINT valid_partner_type 
        CHECK (partner_type IN ('prelafit', 'datacompliance', 'rsm_chile', 'amsoft', 'fc_group')),
    CONSTRAINT valid_status 
        CHECK (status IN ('pendiente', 'enviado', 'confirmado', 'error', 'cancelado'))
);

-- Índices optimizados
CREATE INDEX IF NOT EXISTS idx_partner_integrations_tenant_id ON public.partner_integrations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_partner_integrations_rat_id ON public.partner_integrations(rat_id);
CREATE INDEX IF NOT EXISTS idx_partner_integrations_partner_type ON public.partner_integrations(partner_type);
CREATE INDEX IF NOT EXISTS idx_partner_integrations_status ON public.partner_integrations(status);
CREATE INDEX IF NOT EXISTS idx_partner_integrations_created_at ON public.partner_integrations(created_at DESC);

-- RLS (Row Level Security)
ALTER TABLE public.partner_integrations ENABLE ROW LEVEL SECURITY;

-- Política: Solo el tenant propietario puede ver sus integraciones
CREATE POLICY "Users can view own tenant partner integrations" 
    ON public.partner_integrations 
    FOR SELECT 
    USING (
        tenant_id IN (
            SELECT t.id FROM public.tenants t 
            WHERE t.id = partner_integrations.tenant_id
        )
    );

-- Política: Solo usuarios autenticados pueden insertar
CREATE POLICY "Authenticated users can insert partner integrations" 
    ON public.partner_integrations 
    FOR INSERT 
    TO authenticated 
    WITH CHECK (true);

-- Política: Solo el tenant propietario puede actualizar
CREATE POLICY "Users can update own tenant partner integrations" 
    ON public.partner_integrations 
    FOR UPDATE 
    USING (
        tenant_id IN (
            SELECT t.id FROM public.tenants t 
            WHERE t.id = partner_integrations.tenant_id
        )
    );

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_partner_integrations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para updated_at
DROP TRIGGER IF EXISTS trigger_update_partner_integrations_updated_at ON public.partner_integrations;
CREATE TRIGGER trigger_update_partner_integrations_updated_at
    BEFORE UPDATE ON public.partner_integrations
    FOR EACH ROW EXECUTE FUNCTION update_partner_integrations_updated_at();

-- Insertar datos de ejemplo para testing
INSERT INTO public.partner_integrations (
    tenant_id,
    rat_id,
    partner_type,
    integration_type,
    payload,
    status,
    webhook_url,
    created_at
) VALUES 
(
    'default',
    '1',
    'prelafit',
    'api_push',
    '{
        "rat_id": "1",
        "empresa": "Jurídica Digital SpA",
        "nivel_riesgo": "ALTO",
        "compliance_status": {
            "requiere_eipd": true,
            "requiere_consulta_previa": true
        }
    }'::jsonb,
    'enviado',
    'https://prelafit.com/webhook/juridica-digital',
    NOW() - INTERVAL '2 days'
),
(
    'default',
    '2',
    'rsm_chile',
    'webhook',
    '{
        "rat_id": "2",
        "empresa": "Cliente Demo S.A.",
        "nivel_riesgo": "MEDIO",
        "documentos_generados": ["RAT", "DPA"]
    }'::jsonb,
    'confirmado',
    'https://rsm.cl/api/webhook/compliance',
    NOW() - INTERVAL '1 day'
) ON CONFLICT DO NOTHING;

-- Comentarios de documentación
COMMENT ON TABLE public.partner_integrations IS 'Integraciones con partners externos para compliance y RATs';
COMMENT ON COLUMN public.partner_integrations.partner_type IS 'Tipo de partner: prelafit, datacompliance, rsm_chile, amsoft, fc_group';
COMMENT ON COLUMN public.partner_integrations.integration_type IS 'Tipo de integración: api_push, webhook, pull, sync';
COMMENT ON COLUMN public.partner_integrations.payload IS 'Datos enviados al partner en formato JSON';
COMMENT ON COLUMN public.partner_integrations.response_data IS 'Respuesta del partner en formato JSON';
COMMENT ON COLUMN public.partner_integrations.status IS 'Estado: pendiente, enviado, confirmado, error, cancelado';

-- Mensaje de confirmación
SELECT 'Tabla partner_integrations creada exitosamente con políticas RLS y datos de ejemplo' as resultado;