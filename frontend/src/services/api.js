import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://scldp-backend.onrender.com';

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de autenticación
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Agregar tenant_id si existe
    const tenantId = localStorage.getItem('tenant_id');
    if (tenantId) {
      config.headers['X-Tenant-ID'] = tenantId;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('token');
      localStorage.removeItem('tenant_id');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Servicios de autenticación
export const authService = {
  login: async (username, password) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    
    const response = await api.post('/api/v1/auth/login', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      if (response.data.tenant_id) {
        localStorage.setItem('tenant_id', response.data.tenant_id);
      }
    }
    
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('tenant_id');
  },
  
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  
  register: async (userData) => {
    return api.post('/api/v1/auth/register', userData);
  }
};

// Servicios de organizaciones (empresas)
export const organizacionService = {
  getAll: async () => {
    const response = await api.get('/api/v1/organizaciones');
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/api/v1/organizaciones/${id}`);
    return response.data;
  },
  
  create: async (data) => {
    const response = await api.post('/api/v1/organizaciones', data);
    return response.data;
  },
  
  update: async (id, data) => {
    const response = await api.put(`/api/v1/organizaciones/${id}`, data);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/api/v1/organizaciones/${id}`);
    return response.data;
  },
  
  // Configurar DPO de la organización
  configurarDPO: async (id, dpoData) => {
    const response = await api.post(`/api/v1/organizaciones/${id}/dpo`, dpoData);
    return response.data;
  }
};

// Servicios de usuarios
export const usuarioService = {
  getAll: async () => {
    const response = await api.get('/api/v1/usuarios');
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/api/v1/usuarios/${id}`);
    return response.data;
  },
  
  create: async (data) => {
    const response = await api.post('/api/v1/usuarios', data);
    return response.data;
  },
  
  update: async (id, data) => {
    const response = await api.put(`/api/v1/usuarios/${id}`, data);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/api/v1/usuarios/${id}`);
    return response.data;
  },
  
  // Asignar rol a usuario
  asignarRol: async (userId, rol) => {
    const response = await api.post(`/api/v1/usuarios/${userId}/rol`, { rol });
    return response.data;
  },
  
  // Obtener usuarios por organización
  getByOrganizacion: async (orgId) => {
    const response = await api.get(`/api/v1/usuarios/organizacion/${orgId}`);
    return response.data;
  }
};

// Servicios del Módulo 3 - Inventario y Mapeo
export const inventarioService = {
  // Obtener configuración del módulo
  getConfiguracion: async () => {
    const response = await api.get('/api/v1/modulo3/configuracion');
    return response.data;
  },
  
  // Obtener ejemplos por área de negocio
  getEjemplosPorArea: async (area) => {
    const response = await api.get(`/api/v1/modulo3/ejemplos/${area}`);
    return response.data;
  },
  
  // Obtener todas las actividades RAT
  getActividades: async () => {
    const response = await api.get('/api/v1/modulo3/actividades');
    return response.data;
  },
  
  // Crear nueva actividad RAT
  crearActividad: async (actividad) => {
    const response = await api.post('/api/v1/modulo3/actividades', actividad);
    return response.data;
  },
  
  // Actualizar actividad RAT
  actualizarActividad: async (id, actividad) => {
    const response = await api.put(`/api/v1/modulo3/actividades/${id}`, actividad);
    return response.data;
  },
  
  // Eliminar actividad RAT
  eliminarActividad: async (id) => {
    const response = await api.delete(`/api/v1/modulo3/actividades/${id}`);
    return response.data;
  },
  
  // Generar RAT completo
  generarRAT: async (formato = 'json') => {
    const response = await api.get(`/api/v1/modulo3/generar-rat?formato=${formato}`);
    return response.data;
  },
  
  // Mapeo de flujos de datos
  crearFlujo: async (flujo) => {
    const response = await api.post('/api/v1/modulo3/flujos', flujo);
    return response.data;
  },
  
  getFlujos: async () => {
    const response = await api.get('/api/v1/modulo3/flujos');
    return response.data;
  },
  
  // Trazabilidad de datos
  getTrazabilidad: async (tipoDato) => {
    const response = await api.get(`/api/v1/modulo3/trazabilidad/${tipoDato}`);
    return response.data;
  },
  
  // Análisis de riesgos
  evaluarRiesgo: async (actividadId) => {
    const response = await api.post(`/api/v1/modulo3/actividades/${actividadId}/evaluar-riesgo`);
    return response.data;
  },
  
  // Evaluación de Impacto (PIA)
  crearPIA: async (actividadId, piaData) => {
    const response = await api.post(`/api/v1/modulo3/actividades/${actividadId}/pia`, piaData);
    return response.data;
  }
};

// Servicios del Glosario LPDP
export const glosarioService = {
  // Obtener todos los términos
  getTerminos: async () => {
    const response = await api.get('/api/v1/glosario');
    return response.data;
  },
  
  // Buscar términos
  buscarTerminos: async (query) => {
    const response = await api.get(`/api/v1/glosario/buscar?q=${query}`);
    return response.data;
  },
  
  // Obtener términos por categoría
  getTerminosPorCategoria: async (categoria) => {
    const response = await api.get(`/api/v1/glosario/categoria/${categoria}`);
    return response.data;
  },
  
  // Obtener términos críticos
  getTerminosCriticos: async () => {
    const response = await api.get('/api/v1/glosario/criticos');
    return response.data;
  }
};

// Servicios del Sandbox
export const sandboxService = {
  // Inicializar sandbox para una empresa
  inicializar: async (empresaData) => {
    const response = await api.post('/api/v1/sandbox/inicializar', empresaData);
    return response.data;
  },
  
  // Obtener estado actual del sandbox
  getEstado: async () => {
    const response = await api.get('/api/v1/sandbox/estado');
    return response.data;
  },
  
  // Guardar progreso del sandbox
  guardarProgreso: async (progreso) => {
    const response = await api.post('/api/v1/sandbox/progreso', progreso);
    return response.data;
  },
  
  // Obtener escenarios de práctica
  getEscenarios: async () => {
    const response = await api.get('/api/v1/sandbox/escenarios');
    return response.data;
  },
  
  // Validar actividad en sandbox
  validarActividad: async (actividad) => {
    const response = await api.post('/api/v1/sandbox/validar', actividad);
    return response.data;
  },
  
  // Obtener retroalimentación
  getRetroalimentacion: async (actividadId) => {
    const response = await api.get(`/api/v1/sandbox/retroalimentacion/${actividadId}`);
    return response.data;
  }
};

// Servicios de capacitación
export const capacitacionService = {
  // Obtener todos los módulos
  getModulos: async () => {
    const response = await api.get('/api/v1/capacitacion/modulos');
    return response.data;
  },
  
  // Obtener módulo específico
  getModulo: async (id) => {
    const response = await api.get(`/api/v1/capacitacion/modulos/${id}`);
    return response.data;
  },
  
  // Obtener progreso del usuario
  getProgreso: async () => {
    const response = await api.get('/api/v1/capacitacion/progreso');
    return response.data;
  },
  
  // Actualizar progreso
  actualizarProgreso: async (moduloId, progreso) => {
    const response = await api.post(`/api/v1/capacitacion/modulos/${moduloId}/progreso`, progreso);
    return response.data;
  },
  
  // Completar módulo
  completarModulo: async (moduloId) => {
    const response = await api.post(`/api/v1/capacitacion/modulos/${moduloId}/completar`);
    return response.data;
  },
  
  // Obtener certificados
  getCertificados: async () => {
    const response = await api.get('/api/v1/capacitacion/certificados');
    return response.data;
  },
  
  // Generar certificado
  generarCertificado: async (moduloId) => {
    const response = await api.post(`/api/v1/capacitacion/certificados/${moduloId}`);
    return response.data;
  }
};

// Servicios de simulación de entrevistas
export const entrevistaService = {
  // Obtener personajes disponibles
  getPersonajes: async () => {
    const response = await api.get('/api/v1/entrevistas/personajes');
    return response.data;
  },
  
  // Iniciar entrevista
  iniciarEntrevista: async (personajeId, area) => {
    const response = await api.post('/api/v1/entrevistas/iniciar', { personajeId, area });
    return response.data;
  },
  
  // Enviar pregunta
  enviarPregunta: async (entrevistaId, pregunta) => {
    const response = await api.post(`/api/v1/entrevistas/${entrevistaId}/pregunta`, { pregunta });
    return response.data;
  },
  
  // Obtener respuesta del personaje
  obtenerRespuesta: async (entrevistaId) => {
    const response = await api.get(`/api/v1/entrevistas/${entrevistaId}/respuesta`);
    return response.data;
  },
  
  // Finalizar entrevista
  finalizarEntrevista: async (entrevistaId) => {
    const response = await api.post(`/api/v1/entrevistas/${entrevistaId}/finalizar`);
    return response.data;
  },
  
  // Obtener evaluación
  getEvaluacion: async (entrevistaId) => {
    const response = await api.get(`/api/v1/entrevistas/${entrevistaId}/evaluacion`);
    return response.data;
  }
};

// Servicios de reportes y analytics
export const reporteService = {
  // Dashboard general
  getDashboard: async () => {
    const response = await api.get('/api/v1/reportes/dashboard');
    return response.data;
  },
  
  // Estadísticas de cumplimiento
  getCumplimiento: async () => {
    const response = await api.get('/api/v1/reportes/cumplimiento');
    return response.data;
  },
  
  // Reporte de actividades por área
  getActividadesPorArea: async () => {
    const response = await api.get('/api/v1/reportes/actividades-area');
    return response.data;
  },
  
  // Reporte de datos sensibles
  getDatosSensibles: async () => {
    const response = await api.get('/api/v1/reportes/datos-sensibles');
    return response.data;
  },
  
  // Reporte de transferencias internacionales
  getTransferenciasInternacionales: async () => {
    const response = await api.get('/api/v1/reportes/transferencias');
    return response.data;
  },
  
  // Reporte de riesgos
  getRiesgos: async () => {
    const response = await api.get('/api/v1/reportes/riesgos');
    return response.data;
  },
  
  // Exportar reporte
  exportarReporte: async (tipo, formato = 'pdf') => {
    const response = await api.get(`/api/v1/reportes/exportar/${tipo}?formato=${formato}`, {
      responseType: 'blob'
    });
    return response.data;
  }
};

// Servicios de notificaciones
export const notificacionService = {
  // Obtener notificaciones del usuario
  getNotificaciones: async () => {
    const response = await api.get('/api/v1/notificaciones');
    return response.data;
  },
  
  // Marcar como leída
  marcarLeida: async (id) => {
    const response = await api.put(`/api/v1/notificaciones/${id}/leida`);
    return response.data;
  },
  
  // Marcar todas como leídas
  marcarTodasLeidas: async () => {
    const response = await api.put('/api/v1/notificaciones/marcar-todas-leidas');
    return response.data;
  },
  
  // Obtener configuración de notificaciones
  getConfiguracion: async () => {
    const response = await api.get('/api/v1/notificaciones/configuracion');
    return response.data;
  },
  
  // Actualizar configuración
  actualizarConfiguracion: async (config) => {
    const response = await api.put('/api/v1/notificaciones/configuracion', config);
    return response.data;
  }
};

// Servicio de administración (solo para admins)
export const adminService = {
  // Dashboard de administración
  getDashboard: async () => {
    const response = await api.get('/api/v1/admin/dashboard');
    return response.data;
  },
  
  // Gestión de organizaciones
  getOrganizaciones: async () => {
    const response = await api.get('/api/v1/admin/organizaciones');
    return response.data;
  },
  
  crearOrganizacion: async (data) => {
    const response = await api.post('/api/v1/admin/organizaciones', data);
    return response.data;
  },
  
  actualizarOrganizacion: async (id, data) => {
    const response = await api.put(`/api/v1/admin/organizaciones/${id}`, data);
    return response.data;
  },
  
  desactivarOrganizacion: async (id) => {
    const response = await api.put(`/api/v1/admin/organizaciones/${id}/desactivar`);
    return response.data;
  },
  
  // Gestión de usuarios
  getUsuarios: async () => {
    const response = await api.get('/api/v1/admin/usuarios');
    return response.data;
  },
  
  crearUsuario: async (data) => {
    const response = await api.post('/api/v1/admin/usuarios', data);
    return response.data;
  },
  
  actualizarUsuario: async (id, data) => {
    const response = await api.put(`/api/v1/admin/usuarios/${id}`, data);
    return response.data;
  },
  
  desactivarUsuario: async (id) => {
    const response = await api.put(`/api/v1/admin/usuarios/${id}/desactivar`);
    return response.data;
  },
  
  resetPassword: async (userId) => {
    const response = await api.post(`/api/v1/admin/usuarios/${userId}/reset-password`);
    return response.data;
  },
  
  // Logs y auditoría
  getLogs: async (filtros = {}) => {
    const params = new URLSearchParams(filtros);
    const response = await api.get(`/api/v1/admin/logs?${params}`);
    return response.data;
  },
  
  // Configuración del sistema
  getConfiguracion: async () => {
    const response = await api.get('/api/v1/admin/configuracion');
    return response.data;
  },
  
  actualizarConfiguracion: async (config) => {
    const response = await api.put('/api/v1/admin/configuracion', config);
    return response.data;
  },
  
  // Respaldo y restauración
  crearRespaldo: async () => {
    const response = await api.post('/api/v1/admin/respaldo');
    return response.data;
  },
  
  restaurarRespaldo: async (respaldoId) => {
    const response = await api.post(`/api/v1/admin/restaurar/${respaldoId}`);
    return response.data;
  }
};

export default api;