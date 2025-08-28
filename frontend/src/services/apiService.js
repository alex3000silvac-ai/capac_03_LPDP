/**
 * SERVICIO API PARA LPDP
 * Maneja todas las operaciones de base de datos y APIs
 */

// Configuración de Supabase (simulada para el ejemplo)
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

class APIService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`
    };
  }

  // ====== RAT API ======
  async crearRAT(ratData) {
    try {
      console.log('Creando RAT:', ratData);
      
      // Simular llamada a API
      const response = await this.mockApiCall('/rats', 'POST', {
        nombre_actividad: ratData.nombre_actividad,
        finalidad: ratData.finalidad,
        base_licitud: ratData.base_licitud,
        categorias_datos: ratData.categorias_datos,
        decisiones_automatizadas: ratData.decisiones_automatizadas,
        efectos_significativos: ratData.efectos_significativos,
        destinatarios_externos: ratData.destinatarios_externos,
        tenant_id: this.getCurrentTenant(),
        created_by: this.getCurrentUser(),
        created_at: new Date().toISOString()
      });

      return {
        success: true,
        data: {
          rat_id: `RAT-${Date.now()}`,
          ...response.data
        }
      };
    } catch (error) {
      console.error('Error creando RAT:', error);
      return { success: false, error: error.message };
    }
  }

  async actualizarRAT(ratId, ratData) {
    try {
      const response = await this.mockApiCall(`/rats/${ratId}`, 'PUT', {
        ...ratData,
        updated_at: new Date().toISOString(),
        updated_by: this.getCurrentUser()
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error actualizando RAT:', error);
      return { success: false, error: error.message };
    }
  }

  async obtenerRAT(ratId) {
    try {
      const response = await this.mockApiCall(`/rats/${ratId}`, 'GET');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async listarRATs(tenantId = null) {
    try {
      const tenant = tenantId || this.getCurrentTenant();
      const response = await this.mockApiCall(`/rats?tenant=${tenant}`, 'GET');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // ====== EIPD API ======
  async crearEIPD(eipdData) {
    try {
      const response = await this.mockApiCall('/eipds', 'POST', {
        nombre: eipdData.nombre,
        descripcion: eipdData.descripcion,
        rat_id: eipdData.rat_id,
        nivel_riesgo: eipdData.nivel_riesgo,
        medidas_mitigacion: eipdData.medidas_mitigacion,
        requiere_consulta_previa: eipdData.requiere_consulta_previa,
        estado: 'draft',
        progreso: 0,
        tenant_id: this.getCurrentTenant(),
        created_by: this.getCurrentUser(),
        created_at: new Date().toISOString()
      });

      return {
        success: true,
        data: {
          eipd_id: `EIPD-${Date.now()}`,
          ...response.data
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async actualizarEIPD(eipdId, eipdData) {
    try {
      const response = await this.mockApiCall(`/eipds/${eipdId}`, 'PUT', {
        ...eipdData,
        updated_at: new Date().toISOString()
      });

      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // ====== DPIA API ======
  async crearDPIA(dpiaData) {
    try {
      const response = await this.mockApiCall('/dpias', 'POST', {
        nombre: dpiaData.nombre,
        descripcion: dpiaData.descripcion,
        rat_id: dpiaData.rat_id,
        algoritmo_evaluado: dpiaData.algoritmo_evaluado,
        impacto_derechos: dpiaData.impacto_derechos,
        medidas_proteccion: dpiaData.medidas_proteccion,
        estado: 'draft',
        progreso: 0,
        tenant_id: this.getCurrentTenant(),
        created_by: this.getCurrentUser(),
        created_at: new Date().toISOString()
      });

      return {
        success: true,
        data: {
          dpia_id: `DPIA-${Date.now()}`,
          ...response.data
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // ====== DPA API ======
  async crearDPA(dpaData) {
    try {
      const response = await this.mockApiCall('/dpas', 'POST', {
        nombre: dpaData.nombre,
        proveedor: dpaData.proveedor,
        tipo_transferencia: dpaData.tipo_transferencia,
        pais_destino: dpaData.pais_destino,
        rat_id: dpaData.rat_id,
        clausulas_contractuales: dpaData.clausulas_contractuales,
        estado: 'draft',
        progreso: 0,
        tenant_id: this.getCurrentTenant(),
        created_by: this.getCurrentUser(),
        created_at: new Date().toISOString()
      });

      return {
        success: true,
        data: {
          dpa_id: `DPA-${Date.now()}`,
          ...response.data
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // ====== ASOCIACIONES API ======
  async crearAsociacion(asociacionData) {
    try {
      const response = await this.mockApiCall('/asociaciones', 'POST', {
        rat_id: asociacionData.rat_id,
        documento_id: asociacionData.documento_id,
        tipo_documento: asociacionData.tipo_documento,
        estado_asociacion: asociacionData.estado_asociacion || 'manual',
        confianza: asociacionData.confianza || 100,
        razon_asociacion: asociacionData.razon_asociacion,
        created_by: this.getCurrentUser(),
        created_at: new Date().toISOString()
      });

      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async eliminarAsociacion(ratId, documentoId) {
    try {
      const response = await this.mockApiCall(`/asociaciones/${ratId}/${documentoId}`, 'DELETE');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async obtenerAsociaciones(ratId) {
    try {
      const response = await this.mockApiCall(`/asociaciones/rat/${ratId}`, 'GET');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // ====== CONSULTA PREVIA AGENCIA API ======
  async enviarConsultaPrevia(consultaData) {
    try {
      const response = await this.mockApiCall('/consultas-previas', 'POST', {
        eipd_id: consultaData.eipd_id,
        rat_id: consultaData.rat_id,
        motivo_consulta: consultaData.motivo_consulta,
        nivel_riesgo: consultaData.nivel_riesgo,
        medidas_aplicadas: consultaData.medidas_aplicadas,
        contacto_responsable: consultaData.contacto_responsable,
        documentacion_adjunta: consultaData.documentacion_adjunta,
        estado: 'enviada',
        fecha_envio: new Date().toISOString(),
        expediente_numero: `CP-${Date.now()}`,
        tenant_id: this.getCurrentTenant(),
        created_by: this.getCurrentUser()
      });

      return {
        success: true,
        data: {
          expediente: `CP-${Date.now()}`,
          estado: 'enviada',
          tiempo_estimado_dias: 15,
          ...response.data
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async obtenerEstadoConsulta(expedienteId) {
    try {
      const response = await this.mockApiCall(`/consultas-previas/${expedienteId}`, 'GET');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // ====== NOTIFICACIONES API ======
  async crearNotificacion(notifData) {
    try {
      const response = await this.mockApiCall('/notificaciones', 'POST', {
        usuario_id: notifData.usuario_id || this.getCurrentUser(),
        tipo: notifData.tipo,
        titulo: notifData.titulo,
        descripcion: notifData.descripcion,
        documento_relacionado: notifData.documento_relacionado,
        rat_relacionado: notifData.rat_relacionado,
        prioridad: notifData.prioridad || 'medium',
        leida: false,
        fecha_vencimiento: notifData.fecha_vencimiento,
        tenant_id: this.getCurrentTenant(),
        created_at: new Date().toISOString()
      });

      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async marcarNotificacionLeida(notifId) {
    try {
      const response = await this.mockApiCall(`/notificaciones/${notifId}/leer`, 'PUT', {
        leida: true,
        fecha_lectura: new Date().toISOString()
      });

      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async obtenerNotificaciones(usuarioId = null) {
    try {
      const userId = usuarioId || this.getCurrentUser();
      const response = await this.mockApiCall(`/notificaciones/usuario/${userId}`, 'GET');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // ====== BÚSQUEDA DE DOCUMENTOS ======
  async buscarDocumentos(filtros) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filtros.tipo) queryParams.append('tipo', filtros.tipo);
      if (filtros.busqueda) queryParams.append('q', filtros.busqueda);
      if (filtros.tenant_id) queryParams.append('tenant', filtros.tenant_id);
      if (filtros.estado) queryParams.append('estado', filtros.estado);

      const response = await this.mockApiCall(`/documentos/buscar?${queryParams}`, 'GET');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // ====== MÉTODOS UTILITARIOS ======
  getCurrentUser() {
    return localStorage.getItem('user_id') || 'user-demo';
  }

  getCurrentTenant() {
    return localStorage.getItem('tenant_id') || 'tenant-demo';
  }

  // Simulador de llamadas a API (para desarrollo)
  async mockApiCall(endpoint, method, data = null) {
    console.log(`🔄 API Call: ${method} ${endpoint}`, data);
    
    // Simular latencia de red
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
    
    // Simular respuestas exitosas
    return {
      success: true,
      data: data || { message: 'Operation completed successfully' },
      timestamp: new Date().toISOString()
    };
  }

  // Método real para hacer llamadas HTTP (para producción)
  async httpCall(endpoint, method, data = null) {
    try {
      const config = {
        method,
        headers: this.headers,
        ...(data && { body: JSON.stringify(data) })
      };

      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('HTTP Error:', error);
      throw error;
    }
  }
}

// Exportar instancia singleton
export default new APIService();