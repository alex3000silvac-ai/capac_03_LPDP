import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Badge,
  Tooltip,
  LinearProgress,
  InputAdornment
} from '@mui/material';
import {
  Business as BusinessIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  Security as SecurityIcon,
  Description as ContractIcon,
  Language as InternationalIcon,
  Warning as WarningIcon,
  CheckCircle as CompliantIcon,
  Schedule as PendingIcon,
  Gavel as LegalIcon,
  Assessment as RiskIcon,
  ContactMail as ContactIcon,
  Public as CountryIcon
} from '@mui/icons-material';
import { ratService } from '../services/ratService';
import { supabase } from '../config/supabaseClient';

const ProviderManager = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [providers, setProviders] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('TODOS');
  const [filterRisk, setFilterRisk] = useState('TODOS');
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [providerDialog, setProviderDialog] = useState(false);
  const [contractDialog, setContractDialog] = useState(false);
  
  const [stats, setStats] = useState({
    totalProviders: 0,
    activeContracts: 0,
    internationalTransfers: 0,
    highRiskProviders: 0,
    pendingRenewals: 0
  });

  const [newProvider, setNewProvider] = useState({
    nombre: '',
    rut: '',
    direccion: '',
    contacto_principal: '',
    email: '',
    telefono: '',
    tipo_proveedor: 'NACIONAL',
    servicios_prestados: '',
    nivel_riesgo: 'BAJO',
    pais_origen: 'Chile',
    estado: 'ACTIVO'
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const tenantId = await ratService.getCurrentTenantId();
      
      await Promise.all([
        cargarProveedores(tenantId),
        cargarContratos(tenantId),
        cargarTransferencias(tenantId)
      ]);
      
    } catch (error) {
      console.error('Error cargando datos proveedores:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarProveedores = async (tenantId) => {
    try {
      const { data, error } = await supabase
        .from('proveedores')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Simular datos si no existen en BD
      const providersData = data?.length > 0 ? data : [
        {
          id: 1,
          nombre: 'AWS Amazon Web Services',
          rut: '97.123.456-7',
          tipo_proveedor: 'INTERNACIONAL',
          servicios_prestados: 'Infraestructura cloud, almacenamiento datos',
          nivel_riesgo: 'MEDIO',
          pais_origen: 'Estados Unidos',
          estado: 'ACTIVO',
          fecha_evaluacion: '2024-01-15',
          contacto_principal: 'Juan Pérez',
          email: 'juan.perez@aws.com'
        },
        {
          id: 2,
          nombre: 'Microsoft Chile',
          rut: '96.789.123-4',
          tipo_proveedor: 'NACIONAL',
          servicios_prestados: 'Office 365, Azure, Teams',
          nivel_riesgo: 'BAJO',
          pais_origen: 'Chile',
          estado: 'ACTIVO',
          fecha_evaluacion: '2024-02-20',
          contacto_principal: 'María González',
          email: 'maria.gonzalez@microsoft.cl'
        },
        {
          id: 3,
          nombre: 'Salesforce',
          rut: '98.456.789-1',
          tipo_proveedor: 'INTERNACIONAL',
          servicios_prestados: 'CRM, gestión clientes',
          nivel_riesgo: 'ALTO',
          pais_origen: 'Estados Unidos',
          estado: 'REVISION',
          fecha_evaluacion: '2024-03-10',
          contacto_principal: 'Carlos Rodriguez',
          email: 'carlos.rodriguez@salesforce.com'
        }
      ];

      setProviders(providersData);
      calcularEstadisticas(providersData);
      
    } catch (error) {
      console.error('Error cargando proveedores:', error);
    }
  };

  const cargarContratos = async (tenantId) => {
    // Simular contratos DPA
    const contractsData = [
      {
        id: 1,
        proveedor_id: 1,
        tipo_contrato: 'DPA',
        estado: 'VIGENTE',
        fecha_inicio: '2024-01-15',
        fecha_vencimiento: '2025-01-15',
        clausulas_especiales: 'Transferencia datos UE-Chile',
        nivel_riesgo: 'MEDIO'
      },
      {
        id: 2,
        proveedor_id: 2,
        tipo_contrato: 'DPA',
        estado: 'VIGENTE',
        fecha_inicio: '2024-02-20',
        fecha_vencimiento: '2025-02-20',
        clausulas_especiales: 'Proveedor nacional estándar',
        nivel_riesgo: 'BAJO'
      },
      {
        id: 3,
        proveedor_id: 3,
        tipo_contrato: 'DPA',
        estado: 'PENDIENTE',
        fecha_inicio: '2024-03-10',
        fecha_vencimiento: '2025-03-10',
        clausulas_especiales: 'Transferencia internacional alta criticidad',
        nivel_riesgo: 'ALTO'
      }
    ];
    
    setContracts(contractsData);
  };

  const cargarTransferencias = async (tenantId) => {
    // Simular transferencias internacionales
    const transfersData = [
      {
        id: 1,
        proveedor_id: 1,
        pais_destino: 'Estados Unidos',
        tipo_datos: 'Logs aplicación, métricas uso',
        garantias: 'Standard Contractual Clauses (SCC)',
        fecha_inicio: '2024-01-15',
        estado: 'ACTIVA'
      },
      {
        id: 2,
        proveedor_id: 3,
        pais_destino: 'Estados Unidos',
        tipo_datos: 'Datos clientes, información comercial',
        garantias: 'Binding Corporate Rules (BCR)',
        fecha_inicio: '2024-03-10',
        estado: 'PENDIENTE_APROBACION'
      }
    ];
    
    setTransfers(transfersData);
  };

  const calcularEstadisticas = (providersData) => {
    const stats = {
      totalProviders: providersData.length,
      activeContracts: contracts.filter(c => c.estado === 'VIGENTE').length,
      internationalTransfers: providersData.filter(p => p.tipo_proveedor === 'INTERNACIONAL').length,
      highRiskProviders: providersData.filter(p => p.nivel_riesgo === 'ALTO').length,
      pendingRenewals: contracts.filter(c => {
        const vencimiento = new Date(c.fecha_vencimiento);
        const hoy = new Date();
        const diasRestantes = Math.floor((vencimiento - hoy) / (1000 * 60 * 60 * 24));
        return diasRestantes <= 90 && diasRestantes > 0;
      }).length
    };
    setStats(stats);
  };

  const agregarProveedor = async () => {
    try {
      const tenantId = await ratService.getCurrentTenantId();
      
      const { data, error } = await supabase
        .from('proveedores')
        .insert([{
          ...newProvider,
          tenant_id: tenantId,
          created_at: new Date().toISOString()
        }])
        .select();

      if (error) throw error;

      await cargarProveedores(tenantId);
      setProviderDialog(false);
      setNewProvider({
        nombre: '', rut: '', direccion: '', contacto_principal: '',
        email: '', telefono: '', tipo_proveedor: 'NACIONAL',
        servicios_prestados: '', nivel_riesgo: 'BAJO',
        pais_origen: 'Chile', estado: 'ACTIVO'
      });
      
    } catch (error) {
      console.error('Error agregando proveedor:', error);
      alert('Error al agregar proveedor');
    }
  };

  const getRiskChip = (riskLevel) => {
    const riskConfig = {
      'ALTO': { label: 'Alto', color: 'error' },
      'MEDIO': { label: 'Medio', color: 'warning' },
      'BAJO': { label: 'Bajo', color: 'success' }
    };
    
    const config = riskConfig[riskLevel] || riskConfig['BAJO'];
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  const getStatusChip = (estado) => {
    const statusConfig = {
      'ACTIVO': { label: 'Activo', color: 'success' },
      'REVISION': { label: 'En Revisión', color: 'warning' },
      'SUSPENDIDO': { label: 'Suspendido', color: 'error' },
      'INACTIVO': { label: 'Inactivo', color: 'default' }
    };
    
    const config = statusConfig[estado] || statusConfig['ACTIVO'];
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  const getContractStatusChip = (estado) => {
    const statusConfig = {
      'VIGENTE': { label: 'Vigente', color: 'success' },
      'PENDIENTE': { label: 'Pendiente', color: 'warning' },
      'VENCIDO': { label: 'Vencido', color: 'error' },
      'RENOVACION': { label: 'Renovación', color: 'info' }
    };
    
    const config = statusConfig[estado] || statusConfig['PENDIENTE'];
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  const filtrarProveedores = () => {
    return providers.filter(provider => {
      const matchSearch = provider.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         provider.servicios_prestados?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = filterStatus === 'TODOS' || provider.estado === filterStatus;
      const matchRisk = filterRisk === 'TODOS' || provider.nivel_riesgo === filterRisk;
      
      return matchSearch && matchStatus && matchRisk;
    });
  };

  const renderProveedoresTab = () => (
    <Box>
      {/* Controles */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          placeholder="Buscar proveedores..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#9ca3af' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            minWidth: 300,
            '& .MuiOutlinedInput-root': {
              bgcolor: '#374151',
              color: '#f9fafb'
            }
          }}
        />
        
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel sx={{ color: '#9ca3af' }}>Estado</InputLabel>
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            sx={{ bgcolor: '#374151', color: '#f9fafb' }}
          >
            <MenuItem value="TODOS">Todos</MenuItem>
            <MenuItem value="ACTIVO">Activos</MenuItem>
            <MenuItem value="REVISION">En Revisión</MenuItem>
            <MenuItem value="SUSPENDIDO">Suspendidos</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setProviderDialog(true)}
          sx={{ bgcolor: '#4f46e5', '&:hover': { bgcolor: '#4338ca' } }}
        >
          Nuevo Proveedor
        </Button>
      </Box>

      {/* Tabla Proveedores */}
      <TableContainer component={Paper} sx={{ bgcolor: '#1f2937', border: '1px solid #374151' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: '#9ca3af', borderColor: '#374151' }}>Proveedor</TableCell>
              <TableCell sx={{ color: '#9ca3af', borderColor: '#374151' }}>Servicios</TableCell>
              <TableCell sx={{ color: '#9ca3af', borderColor: '#374151' }}>Tipo</TableCell>
              <TableCell sx={{ color: '#9ca3af', borderColor: '#374151' }}>Riesgo</TableCell>
              <TableCell sx={{ color: '#9ca3af', borderColor: '#374151' }}>Estado</TableCell>
              <TableCell sx={{ color: '#9ca3af', borderColor: '#374151' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtrarProveedores().map((provider) => (
              <TableRow key={provider.id} sx={{ '&:hover': { bgcolor: '#374151' } }}>
                <TableCell sx={{ color: '#f9fafb', borderColor: '#374151' }}>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {provider.nombre}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                      RUT: {provider.rut} • {provider.pais_origen}
                    </Typography>
                  </Box>
                </TableCell>
                
                <TableCell sx={{ color: '#f9fafb', borderColor: '#374151' }}>
                  <Typography variant="body2" sx={{ maxWidth: 300 }}>
                    {provider.servicios_prestados}
                  </Typography>
                </TableCell>
                
                <TableCell sx={{ borderColor: '#374151' }}>
                  <Chip 
                    label={provider.tipo_proveedor}
                    color={provider.tipo_proveedor === 'INTERNACIONAL' ? 'warning' : 'default'}
                    size="small"
                    icon={provider.tipo_proveedor === 'INTERNACIONAL' ? <InternationalIcon /> : <BusinessIcon />}
                  />
                </TableCell>
                
                <TableCell sx={{ borderColor: '#374151' }}>
                  {getRiskChip(provider.nivel_riesgo)}
                </TableCell>
                
                <TableCell sx={{ borderColor: '#374151' }}>
                  {getStatusChip(provider.estado)}
                </TableCell>
                
                <TableCell sx={{ borderColor: '#374151' }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Ver detalles">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedProvider(provider);
                          setProviderDialog(true);
                        }}
                        sx={{ color: '#60a5fa' }}
                      >
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Gestionar contrato DPA">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedProvider(provider);
                          setContractDialog(true);
                        }}
                        sx={{ color: '#fbbf24' }}
                      >
                        <ContractIcon />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Evaluar riesgo">
                      <IconButton
                        size="small"
                        onClick={() => evaluarRiesgoProveedor(provider)}
                        sx={{ color: '#ef4444' }}
                      >
                        <RiskIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const renderContratosTab = () => (
    <Box>
      <Typography variant="h6" sx={{ color: '#f9fafb', mb: 3 }}>
        Contratos DPA (Data Processing Agreements)
      </Typography>
      
      <TableContainer component={Paper} sx={{ bgcolor: '#1f2937', border: '1px solid #374151' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: '#9ca3af', borderColor: '#374151' }}>Proveedor</TableCell>
              <TableCell sx={{ color: '#9ca3af', borderColor: '#374151' }}>Tipo Contrato</TableCell>
              <TableCell sx={{ color: '#9ca3af', borderColor: '#374151' }}>Vigencia</TableCell>
              <TableCell sx={{ color: '#9ca3af', borderColor: '#374151' }}>Estado</TableCell>
              <TableCell sx={{ color: '#9ca3af', borderColor: '#374151' }}>Próximo Vencimiento</TableCell>
              <TableCell sx={{ color: '#9ca3af', borderColor: '#374151' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {contracts.map((contract) => {
              const provider = providers.find(p => p.id === contract.proveedor_id);
              const vencimiento = new Date(contract.fecha_vencimiento);
              const hoy = new Date();
              const diasRestantes = Math.floor((vencimiento - hoy) / (1000 * 60 * 60 * 24));
              
              return (
                <TableRow key={contract.id} sx={{ '&:hover': { bgcolor: '#374151' } }}>
                  <TableCell sx={{ color: '#f9fafb', borderColor: '#374151' }}>
                    {provider?.nombre || 'Proveedor no encontrado'}
                  </TableCell>
                  
                  <TableCell sx={{ color: '#f9fafb', borderColor: '#374151' }}>
                    <Chip 
                      label={contract.tipo_contrato}
                      color="info"
                      size="small"
                      icon={<LegalIcon />}
                    />
                  </TableCell>
                  
                  <TableCell sx={{ color: '#f9fafb', borderColor: '#374151' }}>
                    {new Date(contract.fecha_inicio).toLocaleDateString()} - {new Date(contract.fecha_vencimiento).toLocaleDateString()}
                  </TableCell>
                  
                  <TableCell sx={{ borderColor: '#374151' }}>
                    {getContractStatusChip(contract.estado)}
                  </TableCell>
                  
                  <TableCell sx={{ borderColor: '#374151' }}>
                    <Chip 
                      label={`${diasRestantes} días`}
                      color={diasRestantes <= 30 ? 'error' : diasRestantes <= 90 ? 'warning' : 'success'}
                      size="small"
                    />
                  </TableCell>
                  
                  <TableCell sx={{ borderColor: '#374151' }}>
                    <IconButton size="small" sx={{ color: '#60a5fa' }}>
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const renderTransferenciasTab = () => (
    <Box>
      <Typography variant="h6" sx={{ color: '#f9fafb', mb: 3 }}>
        Transferencias Internacionales
      </Typography>
      
      <Alert severity="warning" sx={{ mb: 3, bgcolor: 'rgba(239, 68, 68, 0.1)' }}>
        <Typography variant="body2">
          🌍 <strong>Art. 26-30 Ley 21.719:</strong> Transferencias internacionales requieren 
          garantías apropiadas y pueden necesitar autorización previa de la APDP.
        </Typography>
      </Alert>
      
      <TableContainer component={Paper} sx={{ bgcolor: '#1f2937', border: '1px solid #374151' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: '#9ca3af', borderColor: '#374151' }}>Proveedor</TableCell>
              <TableCell sx={{ color: '#9ca3af', borderColor: '#374151' }}>País Destino</TableCell>
              <TableCell sx={{ color: '#9ca3af', borderColor: '#374151' }}>Tipo de Datos</TableCell>
              <TableCell sx={{ color: '#9ca3af', borderColor: '#374151' }}>Garantías</TableCell>
              <TableCell sx={{ color: '#9ca3af', borderColor: '#374151' }}>Estado</TableCell>
              <TableCell sx={{ color: '#9ca3af', borderColor: '#374151' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transfers.map((transfer) => {
              const provider = providers.find(p => p.id === transfer.proveedor_id);
              
              return (
                <TableRow key={transfer.id} sx={{ '&:hover': { bgcolor: '#374151' } }}>
                  <TableCell sx={{ color: '#f9fafb', borderColor: '#374151' }}>
                    {provider?.nombre || 'Proveedor no encontrado'}
                  </TableCell>
                  
                  <TableCell sx={{ color: '#f9fafb', borderColor: '#374151' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CountryIcon sx={{ fontSize: 16, color: '#9ca3af' }} />
                      {transfer.pais_destino}
                    </Box>
                  </TableCell>
                  
                  <TableCell sx={{ color: '#f9fafb', borderColor: '#374151' }}>
                    {transfer.tipo_datos}
                  </TableCell>
                  
                  <TableCell sx={{ color: '#f9fafb', borderColor: '#374151' }}>
                    <Chip 
                      label={transfer.garantias}
                      color="info"
                      size="small"
                    />
                  </TableCell>
                  
                  <TableCell sx={{ borderColor: '#374151' }}>
                    <Chip 
                      label={transfer.estado}
                      color={transfer.estado === 'ACTIVA' ? 'success' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                  
                  <TableCell sx={{ borderColor: '#374151' }}>
                    <IconButton size="small" sx={{ color: '#60a5fa' }}>
                      <ViewIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const evaluarRiesgoProveedor = (provider) => {
    alert(`Evaluando riesgo de ${provider.nombre}...`);
    // Aquí iría la lógica de evaluación de riesgo
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#111827', py: 4 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ 
            color: '#f9fafb', 
            fontWeight: 700, 
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}>
            <BusinessIcon sx={{ fontSize: 40, color: '#a78bfa' }} />
            Gestión de Proveedores y Encargados
          </Typography>
          <Typography variant="subtitle1" sx={{ color: '#9ca3af' }}>
            Art. 25 Ley 21.719 - Control de encargados del tratamiento
          </Typography>
        </Box>

        {/* Dashboard Estadísticas */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={2.4}>
            <Card sx={{ bgcolor: '#1f2937', border: '1px solid #374151', textAlign: 'center' }}>
              <CardContent sx={{ py: 3 }}>
                <Typography variant="h3" sx={{ color: '#a78bfa', fontWeight: 700 }}>
                  {stats.totalProviders}
                </Typography>
                <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                  Total Proveedores
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={2.4}>
            <Card sx={{ bgcolor: '#1f2937', border: '1px solid #374151', textAlign: 'center' }}>
              <CardContent sx={{ py: 3 }}>
                <Typography variant="h3" sx={{ color: '#10b981', fontWeight: 700 }}>
                  {stats.activeContracts}
                </Typography>
                <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                  Contratos DPA
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={2.4}>
            <Card sx={{ bgcolor: '#1f2937', border: '1px solid #374151', textAlign: 'center' }}>
              <CardContent sx={{ py: 3 }}>
                <Typography variant="h3" sx={{ color: '#f59e0b', fontWeight: 700 }}>
                  {stats.internationalTransfers}
                </Typography>
                <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                  Transf. Internac.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={2.4}>
            <Card sx={{ bgcolor: '#1f2937', border: '1px solid #374151', textAlign: 'center' }}>
              <CardContent sx={{ py: 3 }}>
                <Typography variant="h3" sx={{ color: '#ef4444', fontWeight: 700 }}>
                  {stats.highRiskProviders}
                </Typography>
                <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                  Alto Riesgo
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={2.4}>
            <Card sx={{ bgcolor: '#1f2937', border: '1px solid #374151', textAlign: 'center' }}>
              <CardContent sx={{ py: 3 }}>
                <Badge badgeContent={stats.pendingRenewals} color="error">
                  <Typography variant="h3" sx={{ color: '#6b7280', fontWeight: 700 }}>
                    {stats.pendingRenewals}
                  </Typography>
                </Badge>
                <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                  Próx. Renovar
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Paper sx={{ bgcolor: '#1f2937', border: '1px solid #374151' }}>
          <Tabs 
            value={activeTab} 
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{
              borderBottom: '1px solid #374151',
              '& .MuiTab-root': { color: '#9ca3af' },
              '& .MuiTab-root.Mui-selected': { color: '#a78bfa' }
            }}
          >
            <Tab label="Proveedores" />
            <Tab label="Contratos DPA" />
            <Tab label="Transferencias Internacionales" />
          </Tabs>
          
          <Box sx={{ p: 3 }}>
            {activeTab === 0 && renderProveedoresTab()}
            {activeTab === 1 && renderContratosTab()}
            {activeTab === 2 && renderTransferenciasTab()}
          </Box>
        </Paper>

        {/* Dialog Proveedor */}
        <Dialog
          open={providerDialog}
          onClose={() => setProviderDialog(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{ sx: { bgcolor: '#1f2937', border: '1px solid #374151' } }}
        >
          <DialogTitle sx={{ color: '#f9fafb' }}>
            {selectedProvider ? 'Detalles del Proveedor' : 'Nuevo Proveedor'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nombre del Proveedor"
                  value={selectedProvider?.nombre || newProvider.nombre}
                  onChange={(e) => setNewProvider(prev => ({ ...prev, nombre: e.target.value }))}
                  sx={{
                    '& .MuiOutlinedInput-root': { bgcolor: '#374151', color: '#f9fafb' },
                    '& .MuiInputLabel-root': { color: '#9ca3af' }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="RUT"
                  value={selectedProvider?.rut || newProvider.rut}
                  onChange={(e) => setNewProvider(prev => ({ ...prev, rut: e.target.value }))}
                  sx={{
                    '& .MuiOutlinedInput-root': { bgcolor: '#374151', color: '#f9fafb' },
                    '& .MuiInputLabel-root': { color: '#9ca3af' }
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Servicios Prestados"
                  value={selectedProvider?.servicios_prestados || newProvider.servicios_prestados}
                  onChange={(e) => setNewProvider(prev => ({ ...prev, servicios_prestados: e.target.value }))}
                  sx={{
                    '& .MuiOutlinedInput-root': { bgcolor: '#374151', color: '#f9fafb' },
                    '& .MuiInputLabel-root': { color: '#9ca3af' }
                  }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setProviderDialog(false)} sx={{ color: '#9ca3af' }}>
              Cancelar
            </Button>
            {!selectedProvider && (
              <Button 
                onClick={agregarProveedor}
                sx={{ bgcolor: '#4f46e5', color: '#fff' }}
              >
                Agregar Proveedor
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default ProviderManager;