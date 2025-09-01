/**
 * LPDP HUB SDK
 * JavaScript SDK para integración con partners empresariales
 * Permite a OneTrust, Informatica, TrustArc, etc. integrarse fácilmente
 */

class LPDPHubSDK {
  constructor(config = {}) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || process.env.REACT_APP_LPDP_HUB_URL || 'https://api.lpdphub.cl';
    this.version = config.version || 'v1';
    this.timeout = config.timeout || 30000;
    this.retryAttempts = config.retryAttempts || 3;
    this.debug = config.debug || false;
    
    // Validar configuración requerida
    if (!this.apiKey) {
      throw new Error('API Key es requerido para usar LPDP Hub SDK');
    }
    
    this.baseEndpoint = `${this.baseUrl}/api/${this.version}/compliance`;
    
    // Event listeners para webhooks
    this.eventListeners = new Map();
    
    if (this.debug) {
      console.log('🚀 LPDP Hub SDK inicializado:', {
        baseUrl: this.baseUrl,
        version: this.version,
        endpoints: this.baseEndpoint
      });
    }
  }

  /**
   * EVALUACIÓN AUTOMÁTICA DE RAT
   * Función principal para partners: evaluar actividad RAT y obtener recomendaciones
   */
  async evaluateRAT(ratData) {
    try {
      this.log('📊 Evaluando actividad RAT:', ratData.nombre_actividad || ratData.name);
      
      const response = await this.makeRequest('POST', '/rat/evaluate', {
        rat_data: this.normalizeRATData(ratData)
      });
      
      // Procesar triggers automáticos si existen
      if (response.data.automation_triggers.length > 0) {
        await this.processAutomationTriggers(response.data.automation_triggers);
      }
      
      return new RATEvaluation(response.data);
      
    } catch (error) {
      this.logError('Error evaluating RAT:', error);
      throw new LPDPHubError('RAT_EVALUATION_FAILED', error.message, error);
    }
  }

  /**
   * DASHBOARD DE CUMPLIMIENTO AGREGADO  
   * Para partners que necesitan vista consolidada de múltiples clientes
   */
  async getDashboard(filters = {}) {
    try {
      this.log('📈 Obteniendo dashboard de cumplimiento');
      
      const queryParams = this.buildQueryParams(filters);
      const response = await this.makeRequest('GET', `/dashboard${queryParams}`);
      
      return new ComplianceDashboard(response.data);
      
    } catch (error) {
      this.logError('Error getting dashboard:', error);
      throw new LPDPHubError('DASHBOARD_FETCH_FAILED', error.message, error);
    }
  }

  /**
   * GENERACIÓN AUTOMÁTICA DE EIPD
   * Crear EIPD basada en evaluación de riesgo automática
   */
  async generateEIPD(ratId, options = {}) {
    try {
      this.log('🤖 Generando EIPD automática para RAT:', ratId);
      
      const response = await this.makeRequest('POST', '/eipd/auto-generate', {
        rat_id: ratId,
        options: {
          auto_complete_sections: options.autoComplete || true,
          include_suggestions: options.includeSuggestions || true,
          template_style: options.templateStyle || 'standard',
          language: options.language || 'es-CL'
        }
      });
      
      const eipd = new EIPDocument(response.data);
      
      // Notificar generación exitosa
      this.emit('document.generated', {
        type: 'EIPD',
        document: eipd,
        ratId: ratId
      });
      
      return eipd;
      
    } catch (error) {
      this.logError('Error generating EIPD:', error);
      throw new LPDPHubError('EIPD_GENERATION_FAILED', error.message, error);
    }
  }

  /**
   * GENERACIÓN AUTOMÁTICA DE DPA
   * Crear contrato de encargado de tratamiento basado en RAT
   */
  async generateDPA(ratId, providerInfo, options = {}) {
    try {
      this.log('📝 Generando DPA para proveedor:', providerInfo.name);
      
      const response = await this.makeRequest('POST', '/dpa/auto-generate', {
        rat_id: ratId,
        provider_info: this.normalizeProviderInfo(providerInfo),
        options: {
          include_chile_clauses: options.includeChileClauses !== false,
          security_level: options.securityLevel || 'standard',
          contract_language: options.language || 'es-CL'
        }
      });
      
      const dpa = new DPAContract(response.data);
      
      // Notificar generación exitosa
      this.emit('document.generated', {
        type: 'DPA',
        document: dpa,
        provider: providerInfo
      });
      
      return dpa;
      
    } catch (error) {
      this.logError('Error generating DPA:', error);
      throw new LPDPHubError('DPA_GENERATION_FAILED', error.message, error);
    }
  }

  /**
   * GESTIÓN DE WEBHOOKS
   * Registrar callbacks para eventos automáticos
   */
  async registerWebhook(webhookUrl, events = [], secret = null) {
    try {
      this.log('🔗 Registrando webhook:', webhookUrl);
      
      const response = await this.makeRequest('POST', '/webhooks/register', {
        url: webhookUrl,
        events: events.length > 0 ? events : [
          'rat.evaluated',
          'document.generated', 
          'compliance.alert',
          'regulatory.update'
        ],
        secret: secret || this.generateSecret()
      });
      
      return new WebhookRegistration(response.data);
      
    } catch (error) {
      this.logError('Error registering webhook:', error);
      throw new LPDPHubError('WEBHOOK_REGISTRATION_FAILED', error.message, error);
    }
  }

  /**
   * MONITOREO DE ACTUALIZACIONES NORMATIVAS
   * Obtener cambios en Ley 21.719 que afecten al cumplimiento
   */
  async getRegulatoryUpdates(since = null) {
    try {
      this.log('📋 Obteniendo actualizaciones normativas');
      
      const params = since ? `?since=${since}` : '';
      const response = await this.makeRequest('GET', `/regulatory-updates${params}`);
      
      return response.data.updates.map(update => new RegulatoryUpdate(update));
      
    } catch (error) {
      this.logError('Error getting regulatory updates:', error);
      throw new LPDPHubError('REGULATORY_UPDATES_FAILED', error.message, error);
    }
  }

  /**
   * BATCH PROCESSING
   * Evaluar múltiples RATs en lote (para partners con muchos clientes)
   */
  async batchEvaluateRATs(ratsData, options = {}) {
    try {
      this.log('🔄 Procesando evaluación en lote:', ratsData.length, 'RATs');
      
      const batchSize = options.batchSize || 10;
      const batches = this.chunkArray(ratsData, batchSize);
      const results = [];
      
      for (const batch of batches) {
        const batchPromises = batch.map(ratData => 
          this.evaluateRAT(ratData).catch(error => ({
            error: true,
            ratId: ratData.id,
            message: error.message
          }))
        );
        
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
        
        // Respetar rate limits
        if (batches.indexOf(batch) < batches.length - 1) {
          await this.sleep(1000); // 1 segundo entre lotes
        }
      }
      
      return {
        total: ratsData.length,
        successful: results.filter(r => !r.error).length,
        failed: results.filter(r => r.error).length,
        results: results
      };
      
    } catch (error) {
      this.logError('Error in batch processing:', error);
      throw new LPDPHubError('BATCH_PROCESSING_FAILED', error.message, error);
    }
  }

  /**
   * HEALTH CHECK
   * Verificar estado del servicio y conectividad
   */
  async healthCheck() {
    try {
      const startTime = Date.now();
      const response = await this.makeRequest('GET', '/health');
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'healthy',
        response_time_ms: responseTime,
        api_version: response.version,
        rate_limit_remaining: response.rate_limit_remaining,
        service_status: response.service_status
      };
      
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        last_check: new Date().toISOString()
      };
    }
  }

  // ========== EVENT MANAGEMENT ==========

  /**
   * Suscribirse a eventos del SDK
   */
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  /**
   * Emitir evento interno
   */
  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          this.logError(`Error in event callback for ${event}:`, error);
        }
      });
    }
  }

  // ========== UTILIDADES INTERNAS ==========

  async makeRequest(method, endpoint, data = null) {
    const url = `${this.baseEndpoint}${endpoint}`;
    const config = {
      method: method,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': `LPDPHubSDK/1.0.0`,
        'X-Client-Version': this.version
      }
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      config.body = JSON.stringify(data);
    }

    let lastError;
    
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        // Simulación de llamada HTTP (en producción sería fetch real)
        const response = await this.simulateHTTPCall(method, endpoint, data);
        
        if (!response.success) {
          throw new Error(response.error || 'API call failed');
        }
        
        return response;
        
      } catch (error) {
        lastError = error;
        
        if (attempt < this.retryAttempts && this.isRetryableError(error)) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          this.log(`Reintentando en ${delay}ms (intento ${attempt}/${this.retryAttempts})`);
          await this.sleep(delay);
        } else {
          break;
        }
      }
    }
    
    throw lastError;
  }

  // Simulación de llamadas HTTP (en producción usar fetch/axios)
  async simulateHTTPCall(method, endpoint, data) {
    // Importar la API local para simulación
    const complianceAPI = (await import('../api/complianceAPI.js')).default;
    
    // Simular latencia de red
    await this.sleep(Math.random() * 500 + 100);
    
    // Routear a la función correspondiente de la API
    switch (`${method} ${endpoint}`) {
      case 'POST /rat/evaluate':
        return await complianceAPI.evaluateRAT(this.apiKey, data.rat_data);
        
      case 'GET /dashboard':
        return await complianceAPI.getDashboard(this.apiKey, data);
        
      case 'POST /eipd/auto-generate':
        return await complianceAPI.autoGenerateEIPD(this.apiKey, data);
        
      case 'POST /dpa/auto-generate':
        return await complianceAPI.autoGenerateDPA(this.apiKey, data);
        
      case 'POST /webhooks/register':
        return await complianceAPI.registerWebhook(this.apiKey, data);
        
      case 'GET /regulatory-updates':
        return await complianceAPI.getRegulatoryUpdates(this.apiKey);
        
      case 'GET /health':
        return {
          success: true,
          version: this.version,
          rate_limit_remaining: 1000,
          service_status: 'operational'
        };
        
      default:
        throw new Error(`Endpoint not implemented: ${method} ${endpoint}`);
    }
  }

  normalizeRATData(ratData) {
    // Normalizar datos para compatibilidad entre partners
    return {
      id: ratData.id || ratData.activity_id,
      nombre_actividad: ratData.nombre_actividad || ratData.name || ratData.activity_name,
      finalidad: ratData.finalidad || ratData.purpose || ratData.purposes,
      base_licitud: ratData.base_licitud || ratData.legal_basis,
      categorias_datos: ratData.categorias_datos || ratData.data_categories || [],
      categorias_titulares: ratData.categorias_titulares || ratData.data_subjects || [],
      // ... mapear otros campos
    };
  }

  normalizeProviderInfo(providerInfo) {
    return {
      id: providerInfo.id,
      nombre: providerInfo.nombre || providerInfo.name,
      tipo: providerInfo.tipo || providerInfo.type || 'processor',
      pais: providerInfo.pais || providerInfo.country,
      contacto: providerInfo.contacto || providerInfo.contact
    };
  }

  buildQueryParams(filters) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value);
      }
    });
    return params.toString() ? `?${params.toString()}` : '';
  }

  chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  isRetryableError(error) {
    const retryableStatuses = [429, 500, 502, 503, 504];
    return retryableStatuses.includes(error.status) || error.message.includes('timeout');
  }

  generateSecret() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  log(...args) {
    if (this.debug) {
      console.log('[LPDP Hub SDK]', ...args);
    }
  }

  logError(...args) {
    console.error('[LPDP Hub SDK Error]', ...args);
  }
}

// ========== CLASES DE RESPUESTA ==========

class RATEvaluation {
  constructor(data) {
    this.ratId = data.rat_id;
    this.evaluationId = data.evaluation_id;
    this.timestamp = data.timestamp;
    this.riskAssessment = data.risk_assessment;
    this.requiredDocuments = data.required_documents;
    this.automationTriggers = data.automation_triggers;
    this.complianceAlerts = data.compliance_alerts;
    this.metrics = data.compliance_metrics;
  }

  isHighRisk() {
    return this.riskAssessment.level === 'alto';
  }

  requiresEIPD() {
    return this.automationTriggers.some(t => t.trigger_type === 'EIPD_OBLIGATORIA');
  }

  requiresDPA() {
    return this.automationTriggers.some(t => t.trigger_type === 'DPA_REQUERIDO');
  }

  getComplianceScore() {
    return this.metrics.overall_score;
  }
}

class ComplianceDashboard {
  constructor(data) {
    this.summary = data.summary;
    this.criticalAlerts = data.critical_alerts;
    this.upcomingActions = data.upcoming_actions;
    this.trends = data.compliance_trends;
    this.enterpriseMetrics = data.enterprise_metrics;
  }

  getHealthStatus() {
    return this.summary.health_status;
  }

  getTotalActivities() {
    return this.summary.total_activities;
  }

  getAverageScore() {
    return this.summary.average_compliance_score;
  }
}

class EIPDocument {
  constructor(data) {
    this.id = data.eipd_id;
    this.ratId = data.rat_id;
    this.status = data.status;
    this.completionPercentage = data.completion_percentage;
    this.sections = data.sections;
    this.nextSteps = data.next_steps;
  }

  isComplete() {
    return this.completionPercentage >= 100;
  }

  getNextRequiredAction() {
    return this.nextSteps[0];
  }
}

class DPAContract {
  constructor(data) {
    this.id = data.dpa_id;
    this.ratId = data.rat_id;
    this.providerId = data.provider_id;
    this.providerName = data.provider_name;
    this.status = data.status;
    this.contractClauses = data.contract_clauses;
    this.nextActions = data.next_actions;
    this.legalValidity = data.legal_validity;
  }

  isReadyForSigning() {
    return this.status === 'draft_ready';
  }

  getRequiredActions() {
    return this.nextActions;
  }
}

class WebhookRegistration {
  constructor(data) {
    this.id = data.webhook_id;
    this.events = data.events_subscribed;
    this.testEndpoint = data.test_endpoint;
    this.signatureValidation = data.signature_validation;
  }
}

class RegulatoryUpdate {
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.date = data.date;
    this.impactLevel = data.impact_level;
    this.affectedProcesses = data.affected_processes;
    this.summary = data.summary;
    this.recommendedActions = data.recommended_actions;
    this.deadline = data.implementation_deadline;
  }

  isHighImpact() {
    return this.impactLevel === 'high';
  }
}

// Clase de error personalizada
class LPDPHubError extends Error {
  constructor(code, message, originalError = null) {
    super(message);
    this.code = code;
    this.originalError = originalError;
    this.timestamp = new Date().toISOString();
  }
}

export default LPDPHubSDK;
export { 
  RATEvaluation, 
  ComplianceDashboard, 
  EIPDocument, 
  DPAContract, 
  WebhookRegistration, 
  RegulatoryUpdate, 
  LPDPHubError 
};