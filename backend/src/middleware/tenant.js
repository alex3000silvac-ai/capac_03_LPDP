const { setSessionConfig, supabaseAdmin } = require('../config/database');

const tenantMiddleware = async (req, res, next) => {
  try {
    // Obtener tenant_id desde headers, query params o usuario autenticado
    let tenantId = req.headers['x-tenant-id'] || 
                   req.query.tenant_id || 
                   req.body.tenant_id;

    // Si no hay tenant_id en headers/query, usar el del usuario autenticado
    if (!tenantId && req.user) {
      tenantId = req.user.tenant_id;
    }

    // Validar que el tenant_id esté presente para rutas que lo requieren
    const publicRoutes = ['/health', '/api/health'];
    const isPublicRoute = publicRoutes.some(route => req.path.startsWith(route));

    if (!isPublicRoute && !tenantId) {
      return res.status(400).json({
        error: 'Tenant ID requerido',
        code: 'MISSING_TENANT_ID',
        message: 'Debe especificar un tenant_id en los headers (x-tenant-id) o en la consulta'
      });
    }

    // Validar formato del tenant_id
    if (tenantId && (tenantId.length < 3 || tenantId.length > 255 || tenantId === 'demo')) {
      return res.status(400).json({
        error: 'Tenant ID inválido',
        code: 'INVALID_TENANT_ID',
        message: 'El tenant_id debe tener entre 3 y 255 caracteres y no puede ser "demo"'
      });
    }

    // Verificar que el tenant exista (solo para rutas protegidas)
    if (tenantId && !isPublicRoute) {
      const { data: tenant, error } = await supabaseAdmin
        .from('organizaciones')
        .select('tenant_id, estado')
        .eq('tenant_id', tenantId)
        .single();

      if (error || !tenant) {
        return res.status(404).json({
          error: 'Tenant no encontrado',
          code: 'TENANT_NOT_FOUND',
          tenant_id: tenantId
        });
      }

      if (tenant.estado !== 'activa') {
        return res.status(403).json({
          error: 'Tenant no activo',
          code: 'TENANT_INACTIVE',
          tenant_id: tenantId,
          estado: tenant.estado
        });
      }
    }

    // Agregar tenant_id al request
    req.tenant_id = tenantId;

    // Para usuario autenticado, verificar que pertenezca al tenant correcto
    if (req.user && req.user.tenant_id !== tenantId) {
      return res.status(403).json({
        error: 'Acceso denegado al tenant',
        code: 'TENANT_ACCESS_DENIED',
        user_tenant: req.user.tenant_id,
        requested_tenant: tenantId
      });
    }

    next();
  } catch (error) {
    console.error('❌ Error en middleware de tenant:', error);
    return res.status(500).json({
      error: 'Error interno de tenant',
      code: 'TENANT_ERROR'
    });
  }
};

// Middleware para validar que el tenant del usuario coincida con el solicitado
const validateTenantAccess = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Usuario no autenticado',
      code: 'NOT_AUTHENTICATED'
    });
  }

  if (!req.tenant_id) {
    return res.status(400).json({
      error: 'Tenant ID requerido',
      code: 'MISSING_TENANT_ID'
    });
  }

  // Super admins pueden acceder a cualquier tenant
  if (req.user.rol === 'super_admin') {
    return next();
  }

  // Otros usuarios solo pueden acceder a su propio tenant
  if (req.user.tenant_id !== req.tenant_id) {
    return res.status(403).json({
      error: 'Acceso denegado al tenant',
      code: 'TENANT_ACCESS_DENIED',
      user_tenant: req.user.tenant_id,
      requested_tenant: req.tenant_id
    });
  }

  next();
};

// Middleware para establecer contexto de RLS en Supabase
const setRLSContext = async (req, res, next) => {
  try {
    if (req.tenant_id) {
      // Establecer variables de sesión para RLS
      const config = {
        'app.current_tenant': req.tenant_id
      };

      if (req.user) {
        config['app.current_user_id'] = req.user.id;
        config['app.is_super_admin'] = req.user.rol === 'super_admin' ? 'true' : 'false';
      }

      // Nota: Esto se establecerá en cada consulta específica
      // ya que Supabase cliente maneja las conexiones de forma diferente
      req.rlsConfig = config;
    }

    next();
  } catch (error) {
    console.error('❌ Error estableciendo contexto RLS:', error);
    next(); // Continuar aunque falle el contexto RLS
  }
};

// Helper para obtener información completa del tenant
const getTenantInfo = async (tenantId) => {
  try {
    const { data: tenant, error } = await supabaseAdmin
      .from('organizaciones')
      .select(`
        tenant_id,
        nombre,
        rut,
        razon_social,
        email,
        estado,
        configuracion,
        dpo_nombre,
        dpo_email,
        created_at,
        updated_at
      `)
      .eq('tenant_id', tenantId)
      .single();

    if (error) {
      throw error;
    }

    return tenant;
  } catch (error) {
    console.error('❌ Error obteniendo información del tenant:', error);
    return null;
  }
};

// Middleware para inyectar información del tenant en el request
const injectTenantInfo = async (req, res, next) => {
  try {
    if (req.tenant_id && req.path !== '/health') {
      const tenantInfo = await getTenantInfo(req.tenant_id);
      if (tenantInfo) {
        req.tenantInfo = tenantInfo;
      }
    }
    next();
  } catch (error) {
    console.error('❌ Error inyectando información del tenant:', error);
    next(); // Continuar aunque falle
  }
};

module.exports = {
  tenantMiddleware,
  validateTenantAccess,
  setRLSContext,
  getTenantInfo,
  injectTenantInfo
};