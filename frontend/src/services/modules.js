import api from './api';

export const modulesService = {
  async getDashboardStats() {
    const response = await api.get('/api/v1/empresas/dashboard');
    return response.data;
  },

  async getConsentimientos() {
    const response = await api.get('/api/v1/consentimientos');
    return response.data;
  },

  async createConsentimiento(data) {
    const response = await api.post('/api/v1/consentimientos', data);
    return response.data;
  },

  async getSolicitudesArcopol() {
    const response = await api.get('/api/v1/arcopol/solicitudes');
    return response.data;
  },

  async createSolicitudArcopol(data) {
    const response = await api.post('/api/v1/arcopol/solicitudes', data);
    return response.data;
  },

  async getInventario() {
    const response = await api.get('/api/v1/inventario/actividades');
    return response.data;
  },

  async createActividad(data) {
    const response = await api.post('/api/v1/inventario/actividades', data);
    return response.data;
  },

  async getBrechas() {
    const response = await api.get('/api/v1/brechas');
    return response.data;
  },

  async createBrecha(data) {
    const response = await api.post('/api/v1/brechas', data);
    return response.data;
  },

  async getDpias() {
    const response = await api.get('/api/v1/dpia');
    return response.data;
  },

  async createDpia(data) {
    const response = await api.post('/api/v1/dpia', data);
    return response.data;
  },

  async getTransferencias() {
    const response = await api.get('/api/v1/transferencias');
    return response.data;
  },

  async createTransferencia(data) {
    const response = await api.post('/api/v1/transferencias', data);
    return response.data;
  },

  async getAuditorias() {
    const response = await api.get('/api/v1/auditoria');
    return response.data;
  },

  async createAuditoria(data) {
    const response = await api.post('/api/v1/auditoria', data);
    return response.data;
  },

  async getUsers() {
    const response = await api.get('/api/v1/users');
    return response.data;
  },

  async getTenants() {
    const response = await api.get('/api/v1/tenants');
    return response.data;
  },

  async getEmpresas() {
    const response = await api.get('/api/v1/empresas');
    return response.data;
  },

  async createEmpresa(data) {
    const response = await api.post('/api/v1/empresas', data);
    return response.data;
  }
};
