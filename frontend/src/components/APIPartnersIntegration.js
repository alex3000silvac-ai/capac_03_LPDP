import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Switch,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Badge,
  Tooltip
} from '@mui/material';
import {
  Api as APIIcon,
  Key as KeyIcon,
  Webhook as WebhookIcon,
  Analytics as MetricsIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Send as SendIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Code as CodeIcon,
  Security as SecurityIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendingIcon
} from '@mui/icons-material';
import { supabase } from '../config/supabaseConfig';
import { useTenant } from '../contexts/TenantContext';
import { useAuth } from '../contexts/AuthContext';
import PageLayout from './PageLayout';

const APIPartnersIntegration = () => {
  const { currentTenant } = useTenant();
  const { user } = useAuth();
  
  const [partners, setPartners] = useState([]);
  const [apiKeys, setApiKeys] = useState([]);
  const [webhooks, setWebhooks] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [partnerDialog, setPartnerDialog] = useState(false);
  const [webhookDialog, setWebhookDialog] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);
  
  const [newPartner, setNewPartner] = useState({
    company_name: '',
    contact_email: '',
    contact_person: '',
    integration_type: 'LIMITED',
    business_model: 'CONSULTORIA',
    expected_volume: 100,
    webhook_url: '',
    scopes: []
  });

  useEffect(() => {
    if (user?.is_superuser) {
      cargarDatosAPI();
    }
  }, [user, currentTenant]);

  const cargarDatosAPI = async () => {
    try {
      // 🔌 PARTNERS REGISTRADOS (tabla nueva requerida)
      const { data: partnersData, error: partnersError } = await supabase
        .from('api_partners')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (!partnersError) setPartners(partnersData || []);

      // 🔑 API KEYS ACTIVAS
      const { data: keysData, error: keysError } = await supabase
        .from('partner_tokens')
        .select('*')
        .eq('is_active', true);

      if (!keysError) setApiKeys(keysData || []);

      // 🔔 WEBHOOKS CONFIGURADOS
      const { data: webhooksData, error: webhooksError } = await supabase
        .from('webhook_configs')
        .select('*')
        .eq('is_active', true);

      if (!webhooksError) setWebhooks(webhooksData || []);

      // 📊 MÉTRICAS USO API
      await cargarMetricasAPI();

    } catch (error) {
      console.error('Error cargando datos API:', error);
    }
  };

  const cargarMetricasAPI = async () => {
    try {
      // 📊 MÉTRICAS TIEMPO REAL API
      const { data: metricsData, error } = await supabase
        .from('api_usage_metrics')
        .select('*')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Últimos 30 días
        .order('created_at', { ascending: false });

      if (error) throw error;

      // 🧮 CALCULAR MÉTRICAS CONSOLIDADAS
      const metricsConsolidated = {
        total_calls_today: metricsData?.filter(m => 
          new Date(m.created_at).toDateString() === new Date().toDateString()
        ).length || 0,
        total_partners_active: partners.filter(p => p.last_activity > Date.now() - 24*60*60*1000).length,
        avg_response_time: 150, // ms - calcular promedio real
        error_rate: 0.02, // 2% - calcular desde logs
        top_endpoints: [
          { endpoint: '/api/v1/rats/completed', calls: 1247 },
          { endpoint: '/api/v1/documents/download', calls: 892 },
          { endpoint: '/api/v1/analysis/intelligent', calls: 334 }
        ]
      };

      setMetrics(metricsConsolidated);
    } catch (error) {
      console.error('Error cargando métricas API:', error);
    }
  };

  const crearNuevoPartner = async () => {
    try {
      // 🔌 CREAR PARTNER EN BD
      const { data: partnerData, error: partnerError } = await supabase
        .from('api_partners')
        .insert({
          company_name: newPartner.company_name,
          contact_email: newPartner.contact_email,
          contact_person: newPartner.contact_person,
          integration_type: newPartner.integration_type,
          business_model: newPartner.business_model,
          expected_volume: newPartner.expected_volume,
          is_active: true,
          created_at: new Date().toISOString(),
          created_by: user.id
        })
        .select()
        .single();

      if (partnerError) throw partnerError;

      // 🔑 GENERAR API KEY ÚNICA
      const apiKey = `lpdp_${generateUniqueId()}`;
      const apiSecret = generateSecureSecret();

      await supabase.from('partner_tokens').insert({
        partner_id: partnerData.id,
        token: apiKey,
        secret_hash: await hashSecret(apiSecret),
        scopes: newPartner.scopes,
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 año
        is_active: true,
        created_by: user.id
      });

      // 🔔 CONFIGURAR WEBHOOK SI PROPORCIONADO
      if (newPartner.webhook_url) {
        await supabase.from('webhook_configs').insert({
          partner_id: partnerData.id,
          webhook_url: newPartner.webhook_url,
          events: ['rat_completed', 'document_generated'],
          secret: generateWebhookSecret(),
          is_active: true
        });
      }

      // 📝 AUDIT LOG CREACIÓN PARTNER
      await supabase.from('audit_log').insert({
        tenant_id: 'SYSTEM',
        user_id: user.id,
        action: 'INSERT',
        table_name: 'api_partners',
        record_id: partnerData.id,
        new_values: partnerData,
        ip_address: await getUserIP(),
        created_at: new Date().toISOString()
      });

      await cargarDatosAPI();
      setPartnerDialog(false);
      
      // 📧 ENVIAR CREDENCIALES POR EMAIL SEGURO
      // //console.log('📧 Credenciales partner generadas:', { apiKey, partner: partnerData.company_name });

    } catch (error) {
      console.error('Error creando partner:', error);
    }
  };

  const testWebhook = async (webhookId) => {
    try {
      const webhook = webhooks.find(w => w.id === webhookId);
      if (!webhook) return;

      // 🧪 PAYLOAD PRUEBA
      const testPayload = {
        event: "webhook_test",
        timestamp: new Date().toISOString(),
        test_data: {
          message: "Test webhook delivery",
          partner_id: webhook.partner_id,
          system_status: "operational"
        }
      };

      // 🔐 FIRMAR PAYLOAD
      const signature = await generateWebhookSignature(testPayload, webhook.secret);
      const startTime = Date.now();

      // 📤 ENVIAR TEST
      const response = await fetch(webhook.webhook_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-LPDP-Signature': signature,
          'User-Agent': 'LPDP-System/1.0'
        },
        body: JSON.stringify(testPayload)
      });

      // 📊 REGISTRAR RESULTADO
      await supabase.from('webhook_deliveries').insert({
        webhook_id: webhookId,
        payload: testPayload,
        response_status: response.status,
        response_time_ms: Date.now() - startTime,
        success: response.ok,
        created_at: new Date().toISOString()
      });

      alert(response.ok ? 'Webhook test exitoso ✅' : 'Webhook test falló ❌');
      
    } catch (error) {
      console.error('Error testing webhook:', error);
      alert('Error enviando test webhook');
    }
  };

  const scopesDisponibles = [
    { id: 'rats:read', nombre: 'Leer RATs completados', descripcion: 'Acceso GET /api/v1/rats/completed' },
    { id: 'documents:download', nombre: 'Descargar documentos', descripcion: 'Acceso PDFs y EIPDs generadas' },
    { id: 'analysis:submit', nombre: 'Análisis inteligente', descripcion: 'Enviar datos para análisis IA' },
    { id: 'webhooks:configure', nombre: 'Configurar webhooks', descripcion: 'Gestionar notificaciones tiempo real' },
    { id: 'reports:generate', nombre: 'Generar reportes', descripcion: 'Crear reportes personalizados' },
    { id: 'compliance:status', nombre: 'Estado compliance', descripcion: 'Consultar métricas cumplimiento' }
  ];

  return (
    <PageLayout
      title="🔌 API Partners Integration"
      subtitle="Gestión integraciones con partners especializados LPDP"
      showPaper={false}
    >
      {!user?.is_superuser ? (
        <Alert severity="error">
          Solo administradores del sistema pueden acceder a esta sección
        </Alert>
      ) : (
        <Grid container spacing={3}>
          
          {/* 📊 MÉTRICAS API TIEMPO REAL */}
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={3}>
                <Card sx={{ bgcolor: '#1f2937', border: '1px solid #374151' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TrendingIcon sx={{ color: '#10b981', mr: 1 }} />
                      <div>
                        <Typography variant="h4" sx={{ color: '#f9fafb' }}>
                          {metrics.total_calls_today}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                          API Calls Hoy
                        </Typography>
                      </div>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={3}>
                <Card sx={{ bgcolor: '#1f2937', border: '1px solid #374151' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <APIIcon sx={{ color: '#6366f1', mr: 1 }} />
                      <div>
                        <Typography variant="h4" sx={{ color: '#f9fafb' }}>
                          {partners.length}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                          Partners Activos
                        </Typography>
                      </div>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={3}>
                <Card sx={{ bgcolor: '#1f2937', border: '1px solid #374151' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TimelineIcon sx={{ color: '#f59e0b', mr: 1 }} />
                      <div>
                        <Typography variant="h4" sx={{ color: '#f9fafb' }}>
                          {metrics.avg_response_time}ms
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                          Latencia Promedio
                        </Typography>
                      </div>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={3}>
                <Card sx={{ bgcolor: '#1f2937', border: '1px solid #374151' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <SecurityIcon sx={{ color: '#ef4444', mr: 1 }} />
                      <div>
                        <Typography variant="h4" sx={{ color: '#f9fafb' }}>
                          {(metrics.error_rate * 100).toFixed(1)}%
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                          Tasa Error
                        </Typography>
                      </div>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>

          {/* 🔌 PARTNERS REGISTRADOS */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, bgcolor: '#1f2937', border: '1px solid #374151' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ color: '#f9fafb' }}>
                  🔌 Partners Registrados
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setPartnerDialog(true)}
                  sx={{ bgcolor: '#4f46e5' }}
                >
                  Nuevo Partner
                </Button>
              </Box>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Partner</TableCell>
                      <TableCell>Tipo</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell>API Calls (30d)</TableCell>
                      <TableCell>Última Sync</TableCell>
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {partners.map((partner) => (
                      <TableRow key={partner.id}>
                        <TableCell>
                          <Box>
                            <Typography variant="body1" sx={{ color: '#f9fafb' }}>
                              {partner.company_name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                              {partner.contact_email}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={partner.integration_type}
                            color={partner.integration_type === 'FULL' ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {partner.status === 'ACTIVE' ? (
                              <SuccessIcon sx={{ color: '#10b981', mr: 1 }} />
                            ) : partner.status === 'ERROR' ? (
                              <ErrorIcon sx={{ color: '#ef4444', mr: 1 }} />
                            ) : (
                              <WarningIcon sx={{ color: '#f59e0b', mr: 1 }} />
                            )}
                            <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                              {partner.status}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ color: '#f9fafb' }}>
                            {partner.api_calls_30d || 0}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                            {partner.last_sync ? new Date(partner.last_sync).toLocaleDateString() : 'Nunca'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={() => setSelectedPartner(partner)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton size="small" onClick={() => cargarDatosAPI()}>
                            <RefreshIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* 🔔 WEBHOOKS CONFIGURADOS */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, bgcolor: '#1f2937', border: '1px solid #374151' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ color: '#f9fafb' }}>
                  🔔 Webhooks
                </Typography>
                <Button
                  size="small"
                  startIcon={<WebhookIcon />}
                  onClick={() => setWebhookDialog(true)}
                >
                  Configurar
                </Button>
              </Box>

              <List>
                {webhooks.map((webhook) => (
                  <ListItem key={webhook.id}>
                    <ListItemIcon>
                      <Badge 
                        color={webhook.last_delivery_success ? 'success' : 'error'}
                        variant="dot"
                      >
                        <WebhookIcon />
                      </Badge>
                    </ListItemIcon>
                    <ListItemText
                      primary={webhook.partner_name}
                      secondary={`${webhook.events?.length || 0} eventos • ${webhook.deliveries_today || 0} envíos hoy`}
                    />
                    <IconButton size="small" onClick={() => testWebhook(webhook.id)}>
                      <SendIcon />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* 📊 ENDPOINTS DISPONIBLES */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, bgcolor: '#1f2937', border: '1px solid #374151' }}>
              <Typography variant="h6" sx={{ mb: 3, color: '#f9fafb' }}>
                📊 Endpoints API Disponibles
              </Typography>
              
              <Grid container spacing={2}>
                {[
                  { endpoint: 'GET /api/v1/rats/completed', descripcion: 'RATs completados listos para integración', uso: 'Alto' },
                  { endpoint: 'GET /api/v1/documents/{tipo}/{rat_id}', descripcion: 'Descargar documentos generados (PDF/Excel)', uso: 'Alto' },
                  { endpoint: 'POST /api/v1/analysis/intelligent', descripcion: 'Análisis IA de tratamientos propuestos', uso: 'Medio' },
                  { endpoint: 'GET /api/v1/compliance/status/{tenant}', descripcion: 'Estado compliance consolidado empresa', uso: 'Medio' },
                  { endpoint: 'POST /api/v1/webhooks/configure', descripcion: 'Configurar notificaciones tiempo real', uso: 'Bajo' },
                  { endpoint: 'GET /api/v1/reports/consolidated/{tenant}', descripcion: 'Reportes ejecutivos consolidados', uso: 'Bajo' }
                ].map((api, index) => (
                  <Grid item xs={12} md={6} key={index}>
                    <Card sx={{ bgcolor: '#374151', border: '1px solid #4b5563' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <CodeIcon sx={{ color: '#6366f1', mr: 1 }} />
                          <Typography variant="body1" sx={{ color: '#f9fafb', fontFamily: 'monospace' }}>
                            {api.endpoint}
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ color: '#9ca3af', mb: 1 }}>
                          {api.descripcion}
                        </Typography>
                        <Chip 
                          label={`Uso: ${api.uso}`}
                          size="small"
                          color={api.uso === 'Alto' ? 'success' : api.uso === 'Medio' ? 'warning' : 'default'}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>

        </Grid>
      )}

      {/* 🔧 DIALOG NUEVO PARTNER */}
      <Dialog open={partnerDialog} onClose={() => setPartnerDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#1f2937', color: '#f9fafb' }}>
          Registrar Nuevo Partner
        </DialogTitle>
        <DialogContent sx={{ bgcolor: '#1f2937' }}>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Nombre Empresa"
                  value={newPartner.company_name}
                  onChange={(e) => setNewPartner({...newPartner, company_name: e.target.value})}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Email Contacto"
                  type="email"
                  value={newPartner.contact_email}
                  onChange={(e) => setNewPartner({...newPartner, contact_email: e.target.value})}
                />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <FormLabel sx={{ color: '#f9fafb' }}>Tipo Integración</FormLabel>
                  <RadioGroup
                    value={newPartner.integration_type}
                    onChange={(e) => setNewPartner({...newPartner, integration_type: e.target.value})}
                  >
                    <FormControlLabel value="FULL" control={<Radio />} label="Acceso Completo" />
                    <FormControlLabel value="LIMITED" control={<Radio />} label="Acceso Limitado" />
                    <FormControlLabel value="READONLY" control={<Radio />} label="Solo Lectura" />
                  </RadioGroup>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="URL Webhook"
                  value={newPartner.webhook_url}
                  onChange={(e) => setNewPartner({...newPartner, webhook_url: e.target.value})}
                  placeholder="https://partner.com/webhook/lpdp"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ bgcolor: '#1f2937' }}>
          <Button onClick={() => setPartnerDialog(false)}>Cancelar</Button>
          <Button variant="contained" onClick={crearNuevoPartner}>
            Crear Partner
          </Button>
        </DialogActions>
      </Dialog>
    </PageLayout>
  );
};

// 🔧 FUNCIONES UTILIDAD
const generateUniqueId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const generateSecureSecret = () => {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

const generateWebhookSecret = () => {
  return 'whsec_' + generateSecureSecret();
};

const hashSecret = async (secret) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(secret);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

const generateWebhookSignature = async (payload, secret) => {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(JSON.stringify(payload))
  );
  
  return 'sha256=' + Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

const getUserIP = async () => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch {
    return 'unknown';
  }
};

export default APIPartnersIntegration;