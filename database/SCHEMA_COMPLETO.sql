-- =====================================================
-- SCHEMA COMPLETO CONSOLIDADO PARA SISTEMA LPDP v2.0
-- Incluye: Tablas + Seguridad + Funciones + Índices + Datos
-- Ejecutar en Supabase SQL Editor en este orden
-- =====================================================

-- =====================================================
-- PARTE 1: EXTENSIONES Y CONFIGURACIÓN INICIAL
-- =====================================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- PARTE 2: CREACIÓN DE TABLAS PRINCIPALES
-- =====================================================

-- TABLA: organizaciones (Multi-tenant principal)
CREATE TABLE IF NOT EXISTS organizaciones (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tenant_id VARCHAR(255) UNIQUE NOT NULL,
  nombre VARCHAR(500) NOT NULL,
  rut VARCHAR(20) UNIQUE,
  razon_social VARCHAR(500),
  email VARCHAR(255),
  telefono VARCHAR(50),
  direccion TEXT,
  
  -- Información adicional del negocio  
  sector VARCHAR(100),
  tamano VARCHAR(50), -- pequena, mediana, empresa
  plan VARCHAR(50) DEFAULT 'basico',
  
  -- DPO y responsables
  dpo_nombre VARCHAR(255),
  dpo_email VARCHAR(255),
  dpo_telefono VARCHAR(50),
  responsable_legal VARCHAR(255),
  
  -- Estado y configuración
  activo BOOLEAN DEFAULT true,
  fecha_inicio DATE DEFAULT CURRENT_DATE,
  fecha_vencimiento DATE,
  usuarios_activos INTEGER DEFAULT 0,
  configuracion JSONB DEFAULT '{}',
  
  -- Fechas
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_tenant_id CHECK (tenant_id IS NOT NULL AND tenant_id != '' AND tenant_id != 'demo')
);

-- TABLA: usuarios (Gestión de usuarios por tenant)
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tenant_id VARCHAR(255) NOT NULL,
  
  -- Información personal (nombres exactos del frontend)
  username VARCHAR(255), -- Usado en AdminDashboard
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(255), -- Usado en AdminDashboard
  last_name VARCHAR(255),  -- Usado en AdminDashboard
  nombre VARCHAR(255), -- Alias para first_name
  apellidos VARCHAR(255), -- Alias para last_name
  telefono VARCHAR(50),
  
  -- Autenticación
  password_hash VARCHAR(255) NOT NULL,
  email_verified BOOLEAN DEFAULT false,
  ultimo_acceso TIMESTAMPTZ, -- Usado en AdminDashboard
  last_login TIMESTAMPTZ,
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMPTZ,
  
  -- Roles exactos del frontend
  rol VARCHAR(50) DEFAULT 'user', -- user, admin, super_admin, viewer
  
  -- Estado y configuración
  activo BOOLEAN DEFAULT true,
  estado VARCHAR(50) DEFAULT 'activo',
  
  -- Fechas
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT usuarios_email_tenant_unique UNIQUE (email, tenant_id),
  CONSTRAINT valid_rol CHECK (rol IN ('user', 'admin', 'super_admin', 'viewer')),
  
  FOREIGN KEY (tenant_id) REFERENCES organizaciones(tenant_id) ON DELETE CASCADE
);

-- TABLA: mapeo_datos_rat (ESTRUCTURA REAL DEL FRONTEND)
CREATE TABLE IF NOT EXISTS mapeo_datos_rat (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tenant_id INTEGER NOT NULL DEFAULT 1, -- El frontend usa INTEGER
  organizacion_id UUID, -- Referencia opcional a organizaciones
  
  -- CAMPOS OBLIGATORIOS según el frontend
  nombre_actividad VARCHAR(500) NOT NULL,
  descripcion TEXT,
  finalidad_principal TEXT, -- Campo real usado en RATEditPage
  razon_social VARCHAR(500), -- Usado en dataIntegrityValidator
  email_empresa VARCHAR(255), -- Usado en dataIntegrityValidator
  
  -- ÁREA Y RESPONSABILIDAD
  area_responsable VARCHAR(255),
  responsable_proceso VARCHAR(255),
  email_responsable VARCHAR(255),
  telefono_responsable VARCHAR(50),
  rut VARCHAR(20), -- Usado en dataIntegrityValidator
  telefono_empresa VARCHAR(50), -- Usado en dataIntegrityValidator
  
  -- BASE DE LICITUD (campos reales del frontend)
  base_licitud VARCHAR(255), -- consentimiento, contrato, obligacion_legal, interes_legitimo
  base_legal TEXT, -- Texto explicativo detallado
  
  -- CATEGORÍAS DATOS (JSONB exacto según RATEditPage líneas 85-98)
  categorias_datos JSONB DEFAULT '{
    "identificacion": {
      "basicos": [],
      "contacto": [],
      "identificadores": []
    },
    "sensibles_art14": {},
    "especiales": {},
    "tecnicas": {
      "sistemas": [],
      "comportamiento": [],
      "dispositivo": []
    }
  }',
  
  -- DESTINATARIOS (estructura del frontend)
  destinatarios_internos JSONB DEFAULT '[]',
  destinatarios_externos JSONB DEFAULT '[]',
  transferencias_internacionales JSONB DEFAULT '{}',
  
  -- CONSERVACIÓN
  plazo_conservacion VARCHAR(255),
  criterio_conservacion TEXT,
  destino_posterior VARCHAR(255),
  
  -- SEGURIDAD (arrays del frontend)
  medidas_seguridad_tecnicas JSONB DEFAULT '[]',
  medidas_seguridad_organizativas JSONB DEFAULT '[]',
  
  -- EVALUACIÓN DE RIESGO (valores exactos del frontend)
  nivel_riesgo VARCHAR(20) DEFAULT 'MEDIO', -- BAJO, MEDIO, ALTO, CRÍTICO
  requiere_eipd BOOLEAN DEFAULT false,
  requiere_dpia BOOLEAN DEFAULT false,
  eipd_realizada BOOLEAN DEFAULT false,
  fecha_eipd DATE,
  
  -- DERECHOS ARCOPOL
  procedimiento_derechos TEXT,
  plazo_respuesta_derechos VARCHAR(100) DEFAULT '15 días',
  
  -- DECISIONES AUTOMATIZADAS (campos del frontend)
  decision_automatizada BOOLEAN DEFAULT false,
  efectos_significativos BOOLEAN DEFAULT false,
  perfilado BOOLEAN DEFAULT false,
  
  -- DATOS ESPECIALES (campos confirmados)
  datos_sensibles BOOLEAN DEFAULT false,
  datos_menores BOOLEAN DEFAULT false,
  
  -- ESTADO Y CONTROL (valores del frontend)
  estado VARCHAR(50) DEFAULT 'BORRADOR', -- BORRADOR, ACTIVO, INACTIVO, ARCHIVADO
  proxima_revision DATE,
  fecha_revision DATE,
  
  -- METADATOS Y AUDITORÍA
  metadata JSONB DEFAULT '{}',
  created_by VARCHAR(255),
  
  -- FECHAS
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ, -- Soft delete
  
  -- CONSTRAINTS
  CONSTRAINT valid_nivel_riesgo CHECK (nivel_riesgo IN ('BAJO', 'MEDIO', 'ALTO', 'CRÍTICO')),
  CONSTRAINT valid_estado CHECK (estado IN ('BORRADOR', 'ACTIVO', 'INACTIVO', 'ARCHIVADO')),
  
  FOREIGN KEY (organizacion_id) REFERENCES organizaciones(id) ON DELETE SET NULL
);

-- TABLA: proveedores (Confirmado del dataIntegrityValidator)
CREATE TABLE IF NOT EXISTS proveedores (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  rat_id UUID NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  telefono VARCHAR(50),
  direccion TEXT,
  pais VARCHAR(100),
  categoria VARCHAR(100),
  
  -- Información de transferencia
  garantias_transferencia TEXT,
  medidas_seguridad TEXT,
  
  -- Estado
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  FOREIGN KEY (rat_id) REFERENCES mapeo_datos_rat(id) ON DELETE CASCADE
);

-- TABLA: agent_activity_log (Confirmado en api.js línea 103)
CREATE TABLE IF NOT EXISTS agent_activity_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tenant_id VARCHAR(255),
  action VARCHAR(100),
  description TEXT,
  user_id VARCHAR(255),
  metadata JSONB DEFAULT '{}',
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  success BOOLEAN DEFAULT true
);

-- TABLA: audit_log (Tabla principal de auditoría)
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tenant_id VARCHAR(255) NOT NULL,
  usuario_id UUID,
  
  -- Acción realizada
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100) NOT NULL,
  resource_id VARCHAR(255),
  
  -- Detalles de la acción
  descripcion TEXT,
  datos_anteriores JSONB,
  datos_nuevos JSONB,
  metadata JSONB DEFAULT '{}',
  
  -- Información técnica
  ip_address VARCHAR(45),
  user_agent TEXT,
  endpoint VARCHAR(500),
  metodo_http VARCHAR(10),
  
  -- Resultados
  exitosa BOOLEAN DEFAULT true,
  codigo_respuesta INTEGER,
  mensaje_error TEXT,
  
  -- Fechas
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  
  FOREIGN KEY (tenant_id) REFERENCES organizaciones(tenant_id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- TABLA: sesiones (Gestión de sesiones)
CREATE TABLE IF NOT EXISTS sesiones (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  usuario_id UUID NOT NULL,
  tenant_id VARCHAR(255) NOT NULL,
  
  -- Token information
  token_hash VARCHAR(255) NOT NULL,
  refresh_token_hash VARCHAR(255),
  
  -- Session details
  ip_address VARCHAR(45),
  user_agent TEXT,
  
  -- Dates
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  
  -- Status
  estado VARCHAR(20) DEFAULT 'activa',
  
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- TABLA: configuracion_sistema (Configuración del sistema)
CREATE TABLE IF NOT EXISTS configuracion_sistema (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tenant_id VARCHAR(255) NOT NULL,
  
  -- Clave de configuración
  clave VARCHAR(255) NOT NULL,
  valor JSONB NOT NULL,
  descripcion TEXT,
  
  -- Tipo y categoría
  tipo VARCHAR(100) NOT NULL,
  categoria VARCHAR(100) NOT NULL,
  
  -- Control de acceso
  visible_usuario BOOLEAN DEFAULT false,
  modificable_usuario BOOLEAN DEFAULT false,
  
  -- Fechas
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT configuracion_tenant_clave_unique UNIQUE (tenant_id, clave),
  
  FOREIGN KEY (tenant_id) REFERENCES organizaciones(tenant_id) ON DELETE CASCADE
);

-- =====================================================
-- PARTE 3: FUNCIONES Y TRIGGERS
-- =====================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar triggers de updated_at
CREATE TRIGGER update_organizaciones_updated_at
  BEFORE UPDATE ON organizaciones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_usuarios_updated_at
  BEFORE UPDATE ON usuarios  
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_rat_updated_at
  BEFORE UPDATE ON mapeo_datos_rat
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_proveedores_updated_at
  BEFORE UPDATE ON proveedores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_config_updated_at
  BEFORE UPDATE ON configuracion_sistema
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- PARTE 4: FUNCIONES DE NEGOCIO
-- =====================================================

-- Función para calcular nivel de riesgo automático
CREATE OR REPLACE FUNCTION calcular_nivel_riesgo_rat(
  p_datos_sensibles BOOLEAN,
  p_datos_menores BOOLEAN,
  p_transferencias_internacionales JSONB,
  p_decision_automatizada BOOLEAN,
  p_volumen_datos INTEGER DEFAULT 1000
)
RETURNS VARCHAR(20) AS $$
DECLARE
  puntos_riesgo INTEGER := 0;
  tiene_transferencias BOOLEAN := false;
BEGIN
  -- Puntos por datos sensibles
  IF p_datos_sensibles THEN
    puntos_riesgo := puntos_riesgo + 3;
  END IF;
  
  -- Puntos por datos de menores
  IF p_datos_menores THEN
    puntos_riesgo := puntos_riesgo + 3;
  END IF;
  
  -- Verificar transferencias internacionales
  IF p_transferencias_internacionales IS NOT NULL AND 
     jsonb_array_length(p_transferencias_internacionales) > 0 THEN
    puntos_riesgo := puntos_riesgo + 2;
    tiene_transferencias := true;
  END IF;
  
  -- Puntos por decisiones automatizadas
  IF p_decision_automatizada THEN
    puntos_riesgo := puntos_riesgo + 2;
  END IF;
  
  -- Puntos por volumen alto
  IF p_volumen_datos > 10000 THEN
    puntos_riesgo := puntos_riesgo + 1;
  END IF;
  
  -- Casos especiales de alto riesgo
  IF (p_datos_sensibles AND p_datos_menores) OR
     (p_decision_automatizada AND tiene_transferencias) THEN
    puntos_riesgo := puntos_riesgo + 2;
  END IF;
  
  -- Determinar nivel de riesgo
  IF puntos_riesgo >= 7 THEN
    RETURN 'CRÍTICO';
  ELSIF puntos_riesgo >= 5 THEN
    RETURN 'ALTO';
  ELSIF puntos_riesgo >= 2 THEN
    RETURN 'MEDIO';
  ELSE
    RETURN 'BAJO';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función para generar código RAT automático
CREATE OR REPLACE FUNCTION generar_codigo_rat(
  p_tenant_id INTEGER,
  p_area_responsable VARCHAR(255)
)
RETURNS VARCHAR(100) AS $$
DECLARE
  prefijo VARCHAR(10);
  contador INTEGER;
  area_codigo VARCHAR(5);
BEGIN
  -- Obtener prefijo del tenant (primeras 3 letras en mayúscula)
  prefijo := UPPER(LEFT(p_tenant_id::TEXT, 3));
  
  -- Generar código del área (primeras 2 letras)
  IF p_area_responsable IS NOT NULL THEN
    area_codigo := UPPER(LEFT(REPLACE(p_area_responsable, ' ', ''), 2));
  ELSE
    area_codigo := 'GE'; -- General
  END IF;
  
  -- Obtener siguiente número
  SELECT COALESCE(MAX(CAST(RIGHT(codigo, 4) AS INTEGER)), 0) + 1
  INTO contador
  FROM mapeo_datos_rat 
  WHERE tenant_id = p_tenant_id 
    AND codigo LIKE prefijo || '-' || area_codigo || '-%';
  
  -- Formatear código final
  RETURN prefijo || '-' || area_codigo || '-' || LPAD(contador::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Función para obtener estadísticas generales de un tenant
CREATE OR REPLACE FUNCTION obtener_estadisticas_tenant(p_tenant_id INTEGER)
RETURNS TABLE(
  total_rats INTEGER,
  total_usuarios INTEGER,
  rats_alto_riesgo INTEGER,
  rats_con_datos_sensibles INTEGER,
  rats_requieren_eipd INTEGER,
  rats_pendientes_revision INTEGER,
  ultima_actividad TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(r.id)::INTEGER as total_rats,
    COUNT(DISTINCT r.created_by)::INTEGER as total_usuarios,
    COUNT(CASE WHEN r.nivel_riesgo IN ('ALTO', 'CRÍTICO') THEN 1 END)::INTEGER as rats_alto_riesgo,
    COUNT(CASE WHEN r.datos_sensibles = true THEN 1 END)::INTEGER as rats_con_datos_sensibles,
    COUNT(CASE WHEN r.requiere_eipd = true AND r.eipd_realizada = false THEN 1 END)::INTEGER as rats_requieren_eipd,
    COUNT(CASE WHEN r.proxima_revision <= CURRENT_DATE THEN 1 END)::INTEGER as rats_pendientes_revision,
    MAX(r.updated_at) as ultima_actividad
  FROM mapeo_datos_rat r
  WHERE r.tenant_id = p_tenant_id 
    AND r.estado != 'ARCHIVADO'
    AND r.deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PARTE 5: ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

-- Índices para organizaciones
CREATE INDEX IF NOT EXISTS idx_organizaciones_tenant ON organizaciones(tenant_id);
CREATE INDEX IF NOT EXISTS idx_organizaciones_activo ON organizaciones(activo);

-- Índices para usuarios
CREATE INDEX IF NOT EXISTS idx_usuarios_tenant ON usuarios(tenant_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_activo ON usuarios(activo);

-- Índices para mapeo_datos_rat (tabla principal)
CREATE INDEX IF NOT EXISTS idx_rat_tenant ON mapeo_datos_rat(tenant_id);
CREATE INDEX IF NOT EXISTS idx_rat_organizacion ON mapeo_datos_rat(organizacion_id);
CREATE INDEX IF NOT EXISTS idx_rat_estado ON mapeo_datos_rat(estado);
CREATE INDEX IF NOT EXISTS idx_rat_nivel_riesgo ON mapeo_datos_rat(nivel_riesgo);
CREATE INDEX IF NOT EXISTS idx_rat_created ON mapeo_datos_rat(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rat_nombre ON mapeo_datos_rat(nombre_actividad);
CREATE INDEX IF NOT EXISTS idx_rat_deleted ON mapeo_datos_rat(deleted_at) WHERE deleted_at IS NULL;

-- Índice parcial para RATs con datos sensibles
CREATE INDEX IF NOT EXISTS idx_rat_datos_sensibles 
ON mapeo_datos_rat(tenant_id, nivel_riesgo, created_at DESC) 
WHERE datos_sensibles = true;

-- Índice GIN para búsqueda de texto en nombre de actividad
CREATE INDEX IF NOT EXISTS idx_rat_nombre_gin 
ON mapeo_datos_rat USING gin(to_tsvector('spanish', nombre_actividad));

-- Índices GIN para campos JSONB
CREATE INDEX IF NOT EXISTS idx_rat_categorias_datos_gin 
ON mapeo_datos_rat USING gin(categorias_datos);

-- Índices para proveedores
CREATE INDEX IF NOT EXISTS idx_proveedores_rat ON proveedores(rat_id);
CREATE INDEX IF NOT EXISTS idx_proveedores_activo ON proveedores(activo);

-- Índices para auditoría
CREATE INDEX IF NOT EXISTS idx_audit_tenant ON audit_log(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_usuario ON audit_log(usuario_id);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_log(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_agent_log_tenant ON agent_activity_log(tenant_id);

-- Índices para sesiones
CREATE INDEX IF NOT EXISTS idx_sesiones_usuario ON sesiones(usuario_id);
CREATE INDEX IF NOT EXISTS idx_sesiones_expires ON sesiones(expires_at);
CREATE INDEX IF NOT EXISTS idx_sesiones_estado ON sesiones(estado);

-- =====================================================
-- PARTE 6: ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE organizaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE sesiones ENABLE ROW LEVEL SECURITY;
ALTER TABLE mapeo_datos_rat ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion_sistema ENABLE ROW LEVEL SECURITY;

-- Funciones helper para seguridad
CREATE OR REPLACE FUNCTION get_current_tenant()
RETURNS TEXT AS $$
BEGIN
  RETURN current_setting('app.current_tenant', true);
EXCEPTION
  WHEN undefined_object THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS UUID AS $$
BEGIN
  RETURN current_setting('app.current_user_id', true)::UUID;
EXCEPTION
  WHEN undefined_object OR invalid_text_representation THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Políticas RLS básicas (permitir acceso desde el backend)
CREATE POLICY "Allow backend access to organizations" ON organizaciones
  FOR ALL USING (true);

CREATE POLICY "Allow backend access to users" ON usuarios
  FOR ALL USING (true);

CREATE POLICY "Allow backend access to RATs" ON mapeo_datos_rat
  FOR ALL USING (true);

CREATE POLICY "Allow backend access to providers" ON proveedores
  FOR ALL USING (true);

CREATE POLICY "Allow backend access to audit logs" ON audit_log
  FOR ALL USING (true);

CREATE POLICY "Allow backend access to sessions" ON sesiones
  FOR ALL USING (true);

CREATE POLICY "Allow backend access to config" ON configuracion_sistema
  FOR ALL USING (true);

-- =====================================================
-- PARTE 7: VISTAS ÚTILES
-- =====================================================

-- Vista para inventario (usado en frontend)
CREATE OR REPLACE VIEW inventario_rats AS
SELECT 
  r.id,
  r.tenant_id,
  r.nombre_actividad,
  r.descripcion,
  r.area_responsable,
  r.nivel_riesgo,
  r.estado,
  r.requiere_eipd,
  r.datos_sensibles,
  r.datos_menores,
  r.created_at,
  r.updated_at,
  o.nombre as organizacion_nombre
FROM mapeo_datos_rat r
LEFT JOIN organizaciones o ON r.organizacion_id = o.id
WHERE r.deleted_at IS NULL;

-- Vista para dashboard
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT 
  r.tenant_id,
  COUNT(r.id) as total_rats,
  COUNT(CASE WHEN r.nivel_riesgo = 'CRÍTICO' THEN 1 END) as rats_criticos,
  COUNT(CASE WHEN r.nivel_riesgo IN ('ALTO', 'CRÍTICO') THEN 1 END) as rats_alto_riesgo,
  COUNT(CASE WHEN r.datos_sensibles = true THEN 1 END) as rats_datos_sensibles,
  COUNT(CASE WHEN r.requiere_eipd = true AND r.eipd_realizada = false THEN 1 END) as eipds_pendientes,
  COUNT(CASE WHEN r.proxima_revision <= CURRENT_DATE THEN 1 END) as revisiones_vencidas
FROM mapeo_datos_rat r
WHERE r.estado != 'ARCHIVADO' AND r.deleted_at IS NULL
GROUP BY r.tenant_id;

-- =====================================================
-- PARTE 8: DATOS INICIALES
-- =====================================================

-- Insertar organización demo para pruebas
INSERT INTO organizaciones (
  tenant_id,
  nombre,
  rut,
  razon_social,
  giro,
  direccion,
  telefono,
  email,
  dpo_nombre,
  dpo_email,
  responsable_legal,
  activo,
  configuracion
) VALUES (
  'juridica_digital_spa',
  'Jurídica Digital SPA',
  '76.123.456-7',
  'Jurídica Digital Servicios Profesionales SPA',
  'Servicios de consultoría legal y tecnológica',
  'Av. Providencia 1234, Providencia, Santiago',
  '+56912345678',
  'contacto@juridicadigital.cl',
  'María González',
  'dpo@juridicadigital.cl',
  'Juan Pérez',
  true,
  '{"logo_url": "", "color_primario": "#1976d2", "idioma_predeterminado": "es", "zona_horaria": "America/Santiago"}'::jsonb
) ON CONFLICT (tenant_id) DO NOTHING;

-- Insertar usuario administrador inicial
-- Contraseña: Admin123! (será hasheada por el backend)
INSERT INTO usuarios (
  tenant_id,
  username,
  email,
  first_name,
  last_name,
  nombre,
  apellidos,
  telefono,
  password_hash,
  email_verified,
  rol,
  activo,
  estado
) VALUES (
  'juridica_digital_spa',
  'admin',
  'admin@juridicadigital.cl',
  'Administrador',
  'del Sistema',
  'Administrador',
  'del Sistema',
  '+56912345678',
  '$2b$12$placeholder.hash.will.be.replaced.by.backend.during.setup',
  true,
  'super_admin',
  true,
  'activo'
) ON CONFLICT (email, tenant_id) DO NOTHING;

-- Configuraciones iniciales del sistema
INSERT INTO configuracion_sistema (tenant_id, clave, valor, descripcion, tipo, categoria, visible_usuario, modificable_usuario) VALUES
('juridica_digital_spa', 'max_login_attempts', '5', 'Máximo número de intentos de login fallidos', 'number', 'security', false, false),
('juridica_digital_spa', 'session_timeout_minutes', '480', 'Timeout de sesión en minutos (8 horas)', 'number', 'security', false, false),
('juridica_digital_spa', 'auto_generate_rat_code', 'true', 'Generar códigos RAT automáticamente', 'boolean', 'business', true, true),
('juridica_digital_spa', 'default_review_period_months', '12', 'Período predeterminado de revisión de RATs en meses', 'number', 'business', true, true),
('juridica_digital_spa', 'records_per_page', '25', 'Registros por página en listados', 'number', 'ui', true, true),
('juridica_digital_spa', 'enable_audit_log', 'true', 'Habilitar registro de auditoría', 'boolean', 'system', false, false)
ON CONFLICT (tenant_id, clave) DO NOTHING;

-- =====================================================
-- FIN DEL SCHEMA COMPLETO
-- =====================================================

-- Mensaje de finalización
DO $$
BEGIN
  RAISE NOTICE '✅ SCHEMA COMPLETO LPDP v2.0 INSTALADO';
  RAISE NOTICE '📧 Usuario admin: admin@juridicadigital.cl';
  RAISE NOTICE '🔒 Contraseña temporal: Admin123! (cambiar en primer login)';
  RAISE NOTICE '🏢 Tenant: juridica_digital_spa';
  RAISE NOTICE '🗃️  Base de datos lista para el backend Node.js';
END $$;