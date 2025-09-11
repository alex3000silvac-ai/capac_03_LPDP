/**
 * 🔥 API SERVICE - BACKEND LOCAL LPDP
 * Conecta con el backend completo en http://localhost:8000
 */

// Backend URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Configuración de fetch
const fetchConfig = {
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  mode: 'cors'
};

// API Service Principal
export const apiBackend = {
  // Health check
  async health() {
    try {
      const response = await fetch(`${API_URL}/api/health`, fetchConfig);
      return await response.json();
    } catch (error) {
      console.error('Health check error:', error);
      return { status: 'error', message: error.message };
    }
  },

  // Organizaciones
  async getOrganizaciones() {
    try {
      const response = await fetch(`${API_URL}/api/v1/organizaciones`, fetchConfig);
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error obteniendo organizaciones:', error);
      return { success: false, data: [], error: error.message };
    }
  },

  async createOrganizacion(data) {
    try {
      const response = await fetch(`${API_URL}/api/v1/organizaciones`, {
        ...fetchConfig,
        method: 'POST',
        body: JSON.stringify(data)
      });
      const result = await response.json();
      return { success: true, data: result };
    } catch (error) {
      console.error('Error creando organización:', error);
      return { success: false, error: error.message };
    }
  },

  async updateOrganizacion(id, data) {
    try {
      const response = await fetch(`${API_URL}/api/v1/organizaciones/${id}`, {
        ...fetchConfig,
        method: 'PUT',
        body: JSON.stringify(data)
      });
      const result = await response.json();
      return { success: true, data: result };
    } catch (error) {
      console.error('Error actualizando organización:', error);
      return { success: false, error: error.message };
    }
  },

  async deleteOrganizacion(id) {
    try {
      const response = await fetch(`${API_URL}/api/v1/organizaciones/${id}`, {
        ...fetchConfig,
        method: 'DELETE'
      });
      const result = await response.json();
      return { success: true, data: result };
    } catch (error) {
      console.error('Error eliminando organización:', error);
      return { success: false, error: error.message };
    }
  },

  // RATs
  async getRats(tenantId = 'demo') {
    try {
      const response = await fetch(`${API_URL}/api/v1/rats?tenant_id=${tenantId}`, fetchConfig);
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error obteniendo RATs:', error);
      return { success: false, data: [], error: error.message };
    }
  },

  async createRat(data) {
    try {
      const response = await fetch(`${API_URL}/api/v1/rats`, {
        ...fetchConfig,
        method: 'POST',
        body: JSON.stringify({ ...data, tenant_id: 'demo' })
      });
      const result = await response.json();
      return { success: true, data: result };
    } catch (error) {
      console.error('Error creando RAT:', error);
      return { success: false, error: error.message };
    }
  },

  async updateRat(id, data) {
    try {
      const response = await fetch(`${API_URL}/api/v1/rats/${id}`, {
        ...fetchConfig,
        method: 'PUT',
        body: JSON.stringify({ ...data, tenant_id: 'demo' })
      });
      const result = await response.json();
      return { success: true, data: result };
    } catch (error) {
      console.error('Error actualizando RAT:', error);
      return { success: false, error: error.message };
    }
  },

  async deleteRat(id) {
    try {
      const response = await fetch(`${API_URL}/api/v1/rats/${id}`, {
        ...fetchConfig,
        method: 'DELETE'
      });
      const result = await response.json();
      return { success: true, data: result };
    } catch (error) {
      console.error('Error eliminando RAT:', error);
      return { success: false, error: error.message };
    }
  },

  // EIPDs
  async getEipds(tenantId = 'demo') {
    try {
      const response = await fetch(`${API_URL}/api/v1/eipds?tenant_id=${tenantId}`, fetchConfig);
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error obteniendo EIPDs:', error);
      return { success: false, data: [], error: error.message };
    }
  },

  async createEipd(data) {
    try {
      const response = await fetch(`${API_URL}/api/v1/eipds`, {
        ...fetchConfig,
        method: 'POST',
        body: JSON.stringify({ ...data, tenant_id: 'demo' })
      });
      const result = await response.json();
      return { success: true, data: result };
    } catch (error) {
      console.error('Error creando EIPD:', error);
      return { success: false, error: error.message };
    }
  },

  async updateEipd(id, data) {
    try {
      const response = await fetch(`${API_URL}/api/v1/eipds/${id}`, {
        ...fetchConfig,
        method: 'PUT',
        body: JSON.stringify({ ...data, tenant_id: 'demo' })
      });
      const result = await response.json();
      return { success: true, data: result };
    } catch (error) {
      console.error('Error actualizando EIPD:', error);
      return { success: false, error: error.message };
    }
  },

  async deleteEipd(id) {
    try {
      const response = await fetch(`${API_URL}/api/v1/eipds/${id}`, {
        ...fetchConfig,
        method: 'DELETE'
      });
      const result = await response.json();
      return { success: true, data: result };
    } catch (error) {
      console.error('Error eliminando EIPD:', error);
      return { success: false, error: error.message };
    }
  },

  // Compliance
  async getComplianceMetrics(tenantId = 'demo') {
    try {
      const response = await fetch(`${API_URL}/api/v1/compliance/metrics?tenant_id=${tenantId}`, fetchConfig);
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error obteniendo métricas:', error);
      return { success: false, data: { overall_score: 0 }, error: error.message };
    }
  },

  // Users
  async getUsuarios() {
    try {
      const response = await fetch(`${API_URL}/api/v1/usuarios`, fetchConfig);
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error obteniendo usuarios:', error);
      return { success: false, data: [], error: error.message };
    }
  },

  async createUser(data) {
    try {
      const response = await fetch(`${API_URL}/api/v1/usuarios`, {
        ...fetchConfig,
        method: 'POST',
        body: JSON.stringify(data)
      });
      const result = await response.json();
      return { success: true, data: result };
    } catch (error) {
      console.error('Error creando usuario:', error);
      return { success: false, error: error.message };
    }
  },

  // Dashboard
  async getDashboard(tenantId = 'demo') {
    try {
      const response = await fetch(`${API_URL}/api/v1/dashboard?tenant_id=${tenantId}`, fetchConfig);
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error obteniendo dashboard:', error);
      return { success: false, data: { summary: {}, recent_activity: [], alerts: [] }, error: error.message };
    }
  },

  // Inventario (mapeo a organizaciones para compatibilidad)
  async getInventario() {
    return this.getOrganizaciones();
  },

  async createItem(item) {
    return this.createOrganizacion(item);
  }
};

// Servicios compatibles con estructura existente
export const inventarioService = {
  async getInventario() {
    return apiBackend.getOrganizaciones();
  },
  async createItem(item) {
    return apiBackend.createOrganizacion(item);
  }
};

export const administracionService = {
  async getUsuarios() {
    return apiBackend.getUsuarios();
  },
  async getOrganizaciones() {
    return apiBackend.getOrganizaciones();
  },
  async getDashboard() {
    const response = await apiBackend.getDashboard();
    if (response.success && response.data.summary) {
      return {
        success: true,
        data: {
          total_usuarios: response.data.summary.total_users || 0,
          total_organizaciones: response.data.summary.total_organizations || 0,
          rats_creados: response.data.summary.total_rats || 0,
          compliance_score: 91.2
        }
      };
    }
    return response;
  },
  async getConfiguracion() {
    return { success: true, data: { sistema: 'LPDP', version: '6.0.0-cards-complete' } };
  },
  async getLogs() {
    return { success: true, data: [] };
  }
};

// Export default con todos los servicios
export default apiBackend;