-- 🔧 SCRIPT DE CORRECCIÓN TABLAS SUPABASE
-- Ejecutar en Supabase SQL Editor

-- 1. Corregir tabla organizaciones (cambiar id de text a integer con autoincrement)
ALTER TABLE organizaciones DROP CONSTRAINT IF EXISTS organizaciones_pkey CASCADE;
ALTER TABLE organizaciones DROP COLUMN IF EXISTS id;
ALTER TABLE organizaciones ADD COLUMN id SERIAL PRIMARY KEY;

-- Agregar columnas faltantes si no existen
ALTER TABLE organizaciones ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE organizaciones ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE organizaciones ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE organizaciones ADD COLUMN IF NOT EXISTS size TEXT;
ALTER TABLE organizaciones ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Chile';
ALTER TABLE organizaciones ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE organizaciones ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE organizaciones ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT false;
ALTER TABLE organizaciones ADD COLUMN IF NOT EXISTS online_mode BOOLEAN DEFAULT true;
ALTER TABLE organizaciones ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;

-- 2. Crear tabla user_sessions si no existe
CREATE TABLE IF NOT EXISTS user_sessions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) UNIQUE,
  tenant_id INTEGER REFERENCES organizaciones(id),
  tenant_data JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Crear tabla tenants (alias para organizaciones)
CREATE OR REPLACE VIEW tenants AS
SELECT 
  id,
  company_name AS name,
  display_name,
  industry,
  size,
  country,
  user_id,
  created_at,
  is_demo,
  online_mode,
  active
FROM organizaciones;

-- 4. Crear tabla active_agents para IA monitoring
CREATE TABLE IF NOT EXISTS active_agents (
  id SERIAL PRIMARY KEY,
  agent_id TEXT UNIQUE DEFAULT gen_random_uuid()::text,
  agent_type TEXT DEFAULT 'system_validation',
  status TEXT DEFAULT 'active',
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  configuration JSONB DEFAULT '{"auto_correction": true, "block_flow": false}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Crear tabla agent_activity_log
CREATE TABLE IF NOT EXISTS agent_activity_log (
  id SERIAL PRIMARY KEY,
  agent_id TEXT,
  activity_type TEXT,
  activity_data JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Crear tabla dpo_notifications
CREATE TABLE IF NOT EXISTS dpo_notifications (
  id SERIAL PRIMARY KEY,
  rat_id TEXT,
  notification_type TEXT,
  status TEXT DEFAULT 'pending',
  priority TEXT DEFAULT 'normal',
  message TEXT,
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Crear tabla error_logs
CREATE TABLE IF NOT EXISTS error_logs (
  id SERIAL PRIMARY KEY,
  error_type TEXT,
  error_message TEXT,
  severity TEXT DEFAULT 'low',
  stack_trace TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Crear tabla generated_documents
CREATE TABLE IF NOT EXISTS generated_documents (
  id SERIAL PRIMARY KEY,
  rat_id TEXT,
  document_type TEXT,
  document_data JSONB,
  status TEXT DEFAULT 'generated',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Crear tabla ia_agent_reports
CREATE TABLE IF NOT EXISTS ia_agent_reports (
  id SERIAL PRIMARY KEY,
  report_id TEXT UNIQUE,
  report_type TEXT DEFAULT 'full_status',
  report_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Tabla usuarios con rol admin
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE,
  rol TEXT DEFAULT 'user',
  permisos TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Insertar usuario admin si no existe
INSERT INTO usuarios (id, email, rol, permisos)
SELECT 
  id,
  email,
  'admin',
  ARRAY['system_admin', 'view_all', 'edit_all']
FROM auth.users
WHERE email IN ('admin@juridicadigital.cl', 'pascalbarata@gmail.com')
ON CONFLICT (id) DO UPDATE
SET rol = 'admin',
    permisos = ARRAY['system_admin', 'view_all', 'edit_all'];

-- 12. Crear políticas RLS básicas
ALTER TABLE organizaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE dpo_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE ia_agent_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Políticas permisivas para desarrollo (ajustar en producción)
CREATE POLICY "Enable all for authenticated users" ON organizaciones
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all for authenticated users" ON user_sessions
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all for authenticated users" ON active_agents
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all for authenticated users" ON agent_activity_log
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all for authenticated users" ON dpo_notifications
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all for authenticated users" ON ia_agent_reports
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read for authenticated users" ON usuarios
  FOR SELECT USING (auth.role() = 'authenticated');

-- 13. Insertar agente IA activo
INSERT INTO active_agents (agent_type, status, configuration)
VALUES (
  'system_validation',
  'active',
  '{
    "auto_correction": true,
    "block_flow": false,
    "validation_frequency": 60000,
    "compliance_threshold": 85,
    "supabase_only": true
  }'::jsonb
)
ON CONFLICT (agent_id) DO NOTHING;

-- 14. Log de actividad inicial
INSERT INTO agent_activity_log (activity_type, activity_data)
VALUES (
  'system_initialized',
  '{
    "message": "Sistema IA Agent inicializado",
    "compliance_score": 100,
    "timestamp": "now"
  }'::jsonb
);

COMMIT;