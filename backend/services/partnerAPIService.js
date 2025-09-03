/**
 * 🌐 PARTNER API SERVICE
 * Servicio backend para integraciones con partners según API_PARTNERS_INTEGRATION.md
 * Implementa todas las rutas y funcionalidades para partners externos
 */

const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
const crypto = require('crypto');

// Configuración Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Configuración Partners
const PARTNER_CONFIG = {
  prelafit: {
    name: 'Prelafit Compliance',
    webhook_base: 'https://prelafit.com/webhook',
    api_key_required: true,
    permanent: true,
    features: ['rats_sync', 'eipd_generation', 'compliance_reports']
  },
  datacompliance: {
    name: 'DataCompliance Legal',
    webhook_base: 'https://datacompliance.cl/api',
    api_key_required: true,
    permanent: false,
    features: ['legal_analysis', 'dpa_generation', 'consultation']
  },
  rsm_chile: {
    name: 'RSM Chile',
    webhook_base: 'https://rsm.cl/api/webhook',
    api_key_required: true,
    permanent: true,
    features: ['audit_integration', 'compliance_dashboard', 'reporting']
  },
  amsoft: {
    name: 'Amsoft',
    webhook_base: 'https://amsoft.cl/integration',
    api_key_required: false,
    permanent: false,
    features: ['system_integration', 'data_sync']
  },
  fc_group: {
    name: 'FC Group',
    webhook_base: 'https://fcgroup.cl/api/compliance',
    api_key_required: true,
    permanent: false,
    features: ['consulting', 'training', 'certification']
  }
};

class PartnerAPIService {
  
  /**
   * 📊 OBTENER RATs COMPLETADOS
   * GET /api/v1/rats/completed
   */
  async getCompletedRATs(req, res) {
    try {
      const { partner_api_key } = req.headers;
      const { page = 1, limit = 50, tenant_id } = req.query;
      
      // Validar API key del partner
      const partner = await this.validatePartnerAPIKey(partner_api_key);
      if (!partner) {
        return res.status(401).json({ error: 'API Key inválida' });
      }
      
      console.log('📊 Obteniendo RATs completados para partner:', partner.type);
      
      // Consultar RATs completados
      let query = supabase
        .from('mapeo_datos_rat')
        .select(`
          id,
          nombre_actividad,
          area_responsable,
          responsable_proceso,
          email_responsable,
          finalidad_principal,
          estado,
          metadata,
          created_at,
          updated_at
        `)
        .eq('estado', 'completado')
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);
      
      if (tenant_id) {
        query = query.eq('tenant_id', tenant_id);
      }
      
      const { data: rats, error, count } = await query;
      
      if (error) throw error;
      
      // Formatear respuesta según API spec
      const formattedRATs = rats.map(rat => ({
        id: rat.id,
        fecha_creacion: rat.created_at,
        responsable: {
          razon_social: rat.area_responsable,
          email: rat.email_responsable
        },
        area_detectada: rat.area_responsable?.toLowerCase() || 'general',
        finalidad: rat.finalidad_principal,
        nivel_riesgo: rat.metadata?.riskLevel || 'MEDIO',
        compliance_status: {
          requiere_eipd: rat.metadata?.riskLevel === 'ALTO',
          requiere_dpia: false,
          requiere_consulta_previa: rat.metadata?.riskLevel === 'ALTO'
        },
        documentos_generados: await this.getGeneratedDocuments(rat.id)
      }));
      
      // Registrar acceso del partner
      await this.logPartnerAccess(partner.type, 'get_completed_rats', {
        total_rats: formattedRATs.length,
        page,
        limit
      });
      
      res.json({
        success: true,
        data: formattedRATs,
        total: count,
        page: parseInt(page),
        partner: partner.name
      });
      
    } catch (error) {
      console.error('❌ Error obteniendo RATs completados:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
  
  /**
   * 🤖 ANÁLISIS INTELIGENTE
   * POST /api/v1/analysis/intelligent
   */
  async intelligentAnalysis(req, res) {
    try {
      const { partner_api_key } = req.headers;
      const { empresa, tratamiento } = req.body;
      
      // Validar API key del partner
      const partner = await this.validatePartnerAPIKey(partner_api_key);
      if (!partner) {
        return res.status(401).json({ error: 'API Key inválida' });
      }
      
      console.log('🤖 Análisis inteligente para:', empresa.razon_social);
      
      // Lógica de análisis inteligente
      const riskAnalysis = await this.performRiskAnalysis(tratamiento);
      const requiredDocuments = await this.determineRequiredDocuments(riskAnalysis);
      const complianceAlerts = await this.generateComplianceAlerts(riskAnalysis, tratamiento);
      
      const analysisResult = {
        nivel_riesgo: riskAnalysis.level,
        documentos_requeridos: requiredDocuments,
        alertas_compliance: complianceAlerts,
        recomendaciones_partner: await this.getPartnerRecommendations(partner.type, riskAnalysis)
      };
      
      // Registrar análisis
      await this.logPartnerAccess(partner.type, 'intelligent_analysis', {
        empresa: empresa.razon_social,
        riesgo_calculado: riskAnalysis.level,
        documentos_requeridos: requiredDocuments.length
      });
      
      res.json({
        success: true,
        analysis_result: analysisResult,
        partner: partner.name,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('❌ Error en análisis inteligente:', error);
      res.status(500).json({ error: 'Error en análisis' });
    }
  }
  
  /**
   * 📄 OBTENER DOCUMENTOS GENERADOS
   * GET /api/v1/documents/{tipo}/{rat_id}
   */
  async getGeneratedDocument(req, res) {
    try {
      const { partner_api_key } = req.headers;
      const { tipo, rat_id } = req.params;
      
      // Validar API key del partner
      const partner = await this.validatePartnerAPIKey(partner_api_key);
      if (!partner) {
        return res.status(401).json({ error: 'API Key inválida' });
      }
      
      console.log(`📄 Obteniendo documento ${tipo} para RAT ${rat_id}`);
      
      // Buscar documento
      const { data: documento, error } = await supabase
        .from('documentos_generados')
        .select('*')
        .eq('rat_id', rat_id)
        .eq('tipo_documento', tipo.toUpperCase())
        .single();
      
      if (error || !documento) {
        return res.status(404).json({ error: 'Documento no encontrado' });
      }
      
      // Registrar descarga
      await this.logPartnerAccess(partner.type, 'document_download', {
        rat_id,
        documento_tipo: tipo,
        documento_id: documento.id
      });
      
      res.json({
        success: true,
        documento: {
          id: documento.id,
          tipo: documento.tipo_documento,
          rat_id: documento.rat_id,
          url: documento.file_url || documento.content_url,
          estado: documento.estado,
          fecha_generacion: documento.created_at,
          hash_integridad: documento.hash_verificacion
        }
      });
      
    } catch (error) {
      console.error('❌ Error obteniendo documento:', error);
      res.status(500).json({ error: 'Error obteniendo documento' });
    }
  }
  
  /**
   * 🔄 ENVIAR A PARTNER
   */
  async sendToPartner(ratId, partnerType, payload) {
    try {
      console.log(`🌐 Enviando RAT ${ratId} a partner ${partnerType}`);
      
      const partnerConfig = PARTNER_CONFIG[partnerType];
      if (!partnerConfig) {
        throw new Error(`Partner ${partnerType} no configurado`);
      }
      
      // Crear registro de integración
      const { data: integration, error: insertError } = await supabase
        .from('partner_integrations')
        .insert({
          rat_id: ratId,
          partner_type: partnerType,
          integration_type: 'api_push',
          payload,
          status: 'pendiente',
          webhook_url: partnerConfig.webhook_base,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (insertError) throw insertError;
      
      try {
        // Envío real al partner
        const response = await axios.post(partnerConfig.webhook_base, {
          event: 'rat_completed',
          timestamp: new Date().toISOString(),
          data: payload,
          source: 'juridica-digital-lpdp'
        }, {
          headers: {
            'Content-Type': 'application/json',
            'X-Source': 'juridica-digital',
            'X-Signature': this.generateWebhookSignature(payload)
          },
          timeout: 30000
        });
        
        // Actualizar estado exitoso
        await supabase
          .from('partner_integrations')
          .update({
            status: 'enviado',
            response_data: response.data,
            success_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', integration.id);
        
        console.log(`✅ RAT enviado exitosamente a ${partnerType}`);
        return { success: true, integration_id: integration.id };
        
      } catch (sendError) {
        // Actualizar estado de error
        await supabase
          .from('partner_integrations')
          .update({
            status: 'error',
            error_message: sendError.message,
            retry_count: 1,
            last_attempt_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', integration.id);
        
        throw sendError;
      }
      
    } catch (error) {
      console.error(`❌ Error enviando a partner ${partnerType}:`, error);
      throw error;
    }
  }
  
  /**
   * 🔐 VALIDAR API KEY PARTNER
   */
  async validatePartnerAPIKey(apiKey) {
    try {
      if (!apiKey) return null;
      
      // En producción real, esto estaría en una tabla de API keys
      // Por ahora simulamos la validación
      const apiKeyMap = {
        'pk_prelafit_abc123': { type: 'prelafit', name: PARTNER_CONFIG.prelafit.name },
        'pk_datacompliance_def456': { type: 'datacompliance', name: PARTNER_CONFIG.datacompliance.name },
        'pk_rsm_chile_ghi789': { type: 'rsm_chile', name: PARTNER_CONFIG.rsm_chile.name },
        'pk_amsoft_jkl012': { type: 'amsoft', name: PARTNER_CONFIG.amsoft.name },
        'pk_fc_group_mno345': { type: 'fc_group', name: PARTNER_CONFIG.fc_group.name }
      };
      
      return apiKeyMap[apiKey] || null;
      
    } catch (error) {
      console.error('❌ Error validando API key:', error);
      return null;
    }
  }
  
  /**
   * 📈 ANÁLISIS DE RIESGO
   */
  async performRiskAnalysis(tratamiento) {
    const riskFactors = [];
    let riskScore = 0;
    
    // Factor 1: Datos sensibles
    if (tratamiento.categorias_datos?.includes('datos_medicos')) {
      riskFactors.push('Datos médicos detectados');
      riskScore += 40;
    }
    if (tratamiento.categorias_datos?.includes('datos_financieros')) {
      riskFactors.push('Datos financieros detectados');
      riskScore += 30;
    }
    
    // Factor 2: Volumen de titulares
    if (tratamiento.volumen_titulares > 10000) {
      riskFactors.push('Alto volumen de titulares');
      riskScore += 20;
    }
    
    // Factor 3: Transferencias internacionales
    if (tratamiento.transferencias_internacionales) {
      riskFactors.push('Transferencias internacionales');
      riskScore += 25;
    }
    
    // Factor 4: Decisiones automatizadas
    if (tratamiento.decisiones_automatizadas) {
      riskFactors.push('Decisiones automatizadas');
      riskScore += 15;
    }
    
    // Determinar nivel de riesgo
    let level = 'BAJO';
    if (riskScore >= 70) level = 'CRITICO';
    else if (riskScore >= 40) level = 'ALTO';
    else if (riskScore >= 20) level = 'MEDIO';
    
    return {
      level,
      score: riskScore,
      factors: riskFactors
    };
  }
  
  /**
   * 📋 DETERMINAR DOCUMENTOS REQUERIDOS
   */
  async determineRequiredDocuments(riskAnalysis) {
    const documents = [];
    
    if (riskAnalysis.level === 'CRITICO' || riskAnalysis.level === 'ALTO') {
      documents.push({
        tipo: 'EIPD',
        urgencia: 'alta',
        plazo_dias: 15,
        fundamento_legal: 'Art. 25 Ley 21.719'
      });
      
      documents.push({
        tipo: 'CONSULTA_PREVIA',
        urgencia: 'critica',
        plazo_dias: 5,
        fundamento_legal: 'Art. 26 Ley 21.719'
      });
    }
    
    if (riskAnalysis.factors.includes('Transferencias internacionales')) {
      documents.push({
        tipo: 'DPA',
        urgencia: 'media',
        plazo_dias: 30,
        fundamento_legal: 'Art. 19 Ley 21.719'
      });
    }
    
    return documents;
  }
  
  /**
   * 🚨 GENERAR ALERTAS DE COMPLIANCE
   */
  async generateComplianceAlerts(riskAnalysis, tratamiento) {
    const alerts = [];
    
    if (riskAnalysis.level === 'CRITICO') {
      alerts.push({
        tipo: 'urgente',
        titulo: 'EIPD REQUERIDA - Tratamiento de Alto Riesgo',
        descripcion: 'Detectado tratamiento crítico que requiere Evaluación de Impacto obligatoria',
        fundamento_legal: 'Art. 25 Ley 21.719'
      });
    }
    
    if (tratamiento.categorias_datos?.includes('datos_medicos')) {
      alerts.push({
        tipo: 'urgente',
        titulo: 'DATOS SENSIBLES DE SALUD',
        descripcion: 'Tratamiento de datos médicos requiere consentimiento explícito y medidas especiales',
        fundamento_legal: 'Art. 13 Ley 21.719'
      });
    }
    
    return alerts;
  }
  
  /**
   * 💡 RECOMENDACIONES POR PARTNER
   */
  async getPartnerRecommendations(partnerType, riskAnalysis) {
    const baseRecommendations = [
      'Implementar políticas de retención específicas',
      'Establecer procedimientos de ejercicio de derechos ARCO',
      'Documentar base de licitud del tratamiento'
    ];
    
    if (partnerType === 'prelafit') {
      baseRecommendations.push('Integrar con sistema Prelafit de gestión de riesgos');
    } else if (partnerType === 'datacompliance') {
      baseRecommendations.push('Solicitar consultoría legal especializada DataCompliance');
    }
    
    if (riskAnalysis.level === 'ALTO' || riskAnalysis.level === 'CRITICO') {
      baseRecommendations.push('Ejecutar EIPD antes de iniciar tratamiento');
    }
    
    return baseRecommendations;
  }
  
  /**
   * 📊 OBTENER DOCUMENTOS GENERADOS
   */
  async getGeneratedDocuments(ratId) {
    try {
      const { data: docs, error } = await supabase
        .from('documentos_generados')
        .select('tipo_documento, estado, file_url')
        .eq('rat_id', ratId);
      
      if (error) return [];
      
      return docs.map(doc => ({
        tipo: doc.tipo_documento,
        url: `/api/v1/documents/${doc.tipo_documento}/${ratId}`,
        estado: doc.estado
      }));
      
    } catch (error) {
      console.error('Error obteniendo documentos:', error);
      return [];
    }
  }
  
  /**
   * 🔐 GENERAR FIRMA WEBHOOK
   */
  generateWebhookSignature(payload) {
    const secret = process.env.WEBHOOK_SECRET || 'juridica-digital-webhook-secret';
    return crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');
  }
  
  /**
   * 📝 REGISTRAR ACCESO PARTNER
   */
  async logPartnerAccess(partnerType, action, metadata) {
    try {
      await supabase
        .from('partner_access_logs')
        .insert({
          partner_type: partnerType,
          action,
          metadata,
          timestamp: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error logging partner access:', error);
    }
  }
}

module.exports = new PartnerAPIService();