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
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  FormGroup,
  Button,
  Alert,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import {
  Description as DocumentIcon,
  Security as SecurityIcon,
  Business as BusinessIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  GetApp as DownloadIcon,
  Send as SendIcon,
  Preview as PreviewIcon
} from '@mui/icons-material';
import { useTenant } from '../contexts/TenantContext';
import { supabase } from '../config/supabaseClient';

const DPAGenerator = () => {
  const navigate = useNavigate();
  const { currentTenant } = useTenant();
  
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [proveedores, setProveedores] = useState([]);
  const [selectedProveedor, setSelectedProveedor] = useState(null);
  const [dpaData, setDpaData] = useState({
    // Información del contrato
    contrato: {
      nombre_acuerdo: '',
      fecha_firma: new Date().toISOString().split('T')[0],
      duracion_meses: 12,
      responsable_firma: '',
      cargo_responsable: ''
    },
    
    // Datos del responsable (nuestra empresa)
    responsable: {
      nombre_empresa: '',
      rut: '',
      direccion: '',
      representante_legal: '',
      email_contacto: '',
      telefono: ''
    },
    
    // Datos del encargado (proveedor)
    encargado: {
      nombre_empresa: '',
      rut: '',
      direccion: '',
      pais: '',
      representante_legal: '',
      email_contacto: '',
      telefono: '',
      certificaciones: []
    },
    
    // Descripción del tratamiento
    tratamiento: {
      finalidad_tratamiento: '',
      categorias_datos: [],
      categorias_titulares: [],
      operaciones_tratamiento: [],
      plazo_conservacion: '',
      ubicacion_tratamiento: ''
    },
    
    // Medidas de seguridad
    seguridad: {
      medidas_tecnicas: [],
      medidas_organizativas: [],
      cifrado_datos: false,
      control_acceso: false,
      backup_seguro: false,
      monitoreo_accesos: false,
      capacitacion_personal: false,
      politicas_seguridad: false
    },
    
    // Transferencias internacionales
    transferencias: {
      hay_transferencias: false,
      paises_destino: [],
      salvaguardas: '',
      decision_adecuacion: false
    },
    
    // Derechos de los titulares
    derechos: {
      procedimiento_consultas: '',
      plazo_respuesta: '15',
      contacto_ejercicio: '',
      canal_comunicacion: ''
    }
  });

  const [generatedDPA, setGeneratedDPA] = useState('');
  const [previewDialog, setPreviewDialog] = useState(false);

  const steps = [
    'Información del Contrato',
    'Datos del Responsable',
    'Datos del Encargado',
    'Descripción del Tratamiento', 
    'Medidas de Seguridad',
    'Transferencias y Derechos',
    'Generar DPA'
  ];

  useEffect(() => {
    cargarProveedores();
    cargarDatosEmpresa();
  }, []);

  const cargarProveedores = async () => {
    try {
      const { data, error } = await supabase
        .from('proveedores')
        .select('*')
        .eq('tenant_id', currentTenant?.id)
        .eq('activo', true);
      
      if (error) throw error;
      setProveedores(data || []);
    } catch (error) {
      console.error('Error cargando proveedores:', error);
    }
  };

  const cargarDatosEmpresa = async () => {
    try {
      const { data, error } = await supabase
        .from('organizaciones')
        .select('*')
        .eq('id', currentTenant?.id)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setDpaData(prev => ({
          ...prev,
          responsable: {
            ...prev.responsable,
            nombre_empresa: data.company_name || data.display_name,
            rut: data.rut || '',
            direccion: data.direccion || '',
            email_contacto: data.metadata?.email || ''
          }
        }));
      }
    } catch (error) {
      console.error('Error cargando datos empresa:', error);
    }
  };

  const seleccionarProveedor = (proveedor) => {
    setSelectedProveedor(proveedor);
    setDpaData(prev => ({
      ...prev,
      encargado: {
        ...prev.encargado,
        nombre_empresa: proveedor.nombre,
        rut: proveedor.rut || '',
        direccion: proveedor.direccion || '',
        pais: proveedor.pais || 'Chile',
        email_contacto: proveedor.email || '',
        telefono: proveedor.telefono || ''
      },
      contrato: {
        ...prev.contrato,
        nombre_acuerdo: `DPA - ${proveedor.nombre}`
      }
    }));
  };

  const generarDPA = async () => {
    try {
      setLoading(true);
      
      const dpaContent = generarContenidoDPA();
      setGeneratedDPA(dpaContent);
      
      // Guardar DPA en base de datos
      const { data, error } = await supabase
        .from('documentos_dpa')
        .insert([{
          tenant_id: currentTenant?.id,
          proveedor_id: selectedProveedor?.id,
          nombre_documento: dpaData.contrato.nombre_acuerdo,
          contenido_dpa: dpaContent,
          datos_configuracion: dpaData,
          estado: 'GENERADO',
          fecha_generacion: new Date().toISOString()
        }]);

      if (error) throw error;
      
      alert('DPA generado exitosamente');
      setPreviewDialog(true);
      
    } catch (error) {
      console.error('Error generando DPA:', error);
      alert('Error al generar DPA');
    } finally {
      setLoading(false);
    }
  };

  const generarContenidoDPA = () => {
    return `
# ACUERDO DE TRATAMIENTO DE DATOS PERSONALES (DPA)
## ${dpaData.contrato.nombre_acuerdo}

**Fecha:** ${new Date(dpaData.contrato.fecha_firma).toLocaleDateString('es-CL')}

---

## 1. PARTES CONTRATANTES

### 1.1 RESPONSABLE DEL TRATAMIENTO
- **Nombre:** ${dpaData.responsable.nombre_empresa}
- **RUT:** ${dpaData.responsable.rut}
- **Dirección:** ${dpaData.responsable.direccion}
- **Representante Legal:** ${dpaData.responsable.representante_legal}
- **Email:** ${dpaData.responsable.email_contacto}

### 1.2 ENCARGADO DEL TRATAMIENTO  
- **Nombre:** ${dpaData.encargado.nombre_empresa}
- **RUT:** ${dpaData.encargado.rut}
- **Dirección:** ${dpaData.encargado.direccion}
- **País:** ${dpaData.encargado.pais}
- **Representante Legal:** ${dpaData.encargado.representante_legal}
- **Email:** ${dpaData.encargado.email_contacto}

---

## 2. OBJETO Y FINALIDAD DEL TRATAMIENTO

**Finalidad:** ${dpaData.tratamiento.finalidad_tratamiento}

**Categorías de Datos Personales:**
${dpaData.tratamiento.categorias_datos.map(cat => `- ${cat}`).join('\n')}

**Categorías de Titulares:**
${dpaData.tratamiento.categorias_titulares.map(cat => `- ${cat}`).join('\n')}

**Operaciones de Tratamiento:**
${dpaData.tratamiento.operaciones_tratamiento.map(op => `- ${op}`).join('\n')}

**Plazo de Conservación:** ${dpaData.tratamiento.plazo_conservacion}

---

## 3. OBLIGACIONES DEL ENCARGADO

### 3.1 Medidas de Seguridad Técnicas
${dpaData.seguridad.medidas_tecnicas.map(med => `- ${med}`).join('\n')}

### 3.2 Medidas de Seguridad Organizativas  
${dpaData.seguridad.medidas_organizativas.map(med => `- ${med}`).join('\n')}

### 3.3 Controles de Seguridad
- Cifrado de datos: ${dpaData.seguridad.cifrado_datos ? '✅ Implementado' : '❌ No implementado'}
- Control de acceso: ${dpaData.seguridad.control_acceso ? '✅ Implementado' : '❌ No implementado'}
- Backup seguro: ${dpaData.seguridad.backup_seguro ? '✅ Implementado' : '❌ No implementado'}
- Monitoreo de accesos: ${dpaData.seguridad.monitoreo_accesos ? '✅ Implementado' : '❌ No implementado'}

---

## 4. TRANSFERENCIAS INTERNACIONALES

${dpaData.transferencias.hay_transferencias ? `
**Se realizan transferencias internacionales:** SÍ

**Países de destino:** ${dpaData.transferencias.paises_destino.join(', ')}

**Salvaguardas aplicables:** ${dpaData.transferencias.salvaguardas}

**Decisión de adecuación:** ${dpaData.transferencias.decision_adecuacion ? 'SÍ' : 'NO'}
` : '**Se realizan transferencias internacionales:** NO'}

---

## 5. DERECHOS DE LOS TITULARES

**Procedimiento para consultas:** ${dpaData.derechos.procedimiento_consultas}

**Plazo de respuesta:** ${dpaData.derechos.plazo_respuesta} días hábiles

**Contacto para ejercicio de derechos:** ${dpaData.derechos.contacto_ejercicio}

**Canal de comunicación:** ${dpaData.derechos.canal_comunicacion}

---

## 6. VIGENCIA Y TERMINACIÓN

**Duración:** ${dpaData.contrato.duracion_meses} meses

**Fecha de inicio:** ${new Date(dpaData.contrato.fecha_firma).toLocaleDateString('es-CL')}

---

## 7. CUMPLIMIENTO NORMATIVO

Este DPA se suscribe en cumplimiento de la Ley 21.719 sobre Protección de Datos Personales de Chile, específicamente el Art. 24 sobre encargados del tratamiento.

---

**FIRMAS**

**RESPONSABLE**                    **ENCARGADO**
${dpaData.responsable.representante_legal}     ${dpaData.encargado.representante_legal}
${dpaData.responsable.nombre_empresa}          ${dpaData.encargado.nombre_empresa}

Fecha: ${new Date().toLocaleDateString('es-CL')}
    `;
  };

  const descargarDPA = () => {
    const blob = new Blob([generatedDPA], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DPA_${dpaData.contrato.nombre_acuerdo}_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return renderContratoInfo();
      case 1:
        return renderResponsableInfo();
      case 2:
        return renderEncargadoInfo();
      case 3:
        return renderTratamientoInfo();
      case 4:
        return renderSeguridadInfo();
      case 5:
        return renderTransferenciasDerechos();
      case 6:
        return renderGenerarDPA();
      default:
        return null;
    }
  };

  const renderContratoInfo = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" sx={{ color: '#f9fafb', mb: 2 }}>
          Información del Contrato DPA
        </Typography>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Nombre del Acuerdo"
          value={dpaData.contrato.nombre_acuerdo}
          onChange={(e) => setDpaData(prev => ({
            ...prev,
            contrato: { ...prev.contrato, nombre_acuerdo: e.target.value }
          }))}
          sx={getTextFieldStyles()}
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          type="date"
          label="Fecha de Firma"
          value={dpaData.contrato.fecha_firma}
          onChange={(e) => setDpaData(prev => ({
            ...prev,
            contrato: { ...prev.contrato, fecha_firma: e.target.value }
          }))}
          sx={getTextFieldStyles()}
          InputLabelProps={{ shrink: true }}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          type="number"
          label="Duración (meses)"
          value={dpaData.contrato.duracion_meses}
          onChange={(e) => setDpaData(prev => ({
            ...prev,
            contrato: { ...prev.contrato, duracion_meses: parseInt(e.target.value) }
          }))}
          sx={getTextFieldStyles()}
        />
      </Grid>

      <Grid item xs={12}>
        <Typography variant="h6" sx={{ color: '#f9fafb', mb: 2 }}>
          Seleccionar Proveedor
        </Typography>
        <Grid container spacing={2}>
          {proveedores.map((proveedor) => (
            <Grid item xs={12} md={4} key={proveedor.id}>
              <Card 
                sx={{ 
                  bgcolor: selectedProveedor?.id === proveedor.id ? '#4f46e5' : '#374151',
                  border: '1px solid #4b5563',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: '#4b5563' }
                }}
                onClick={() => seleccionarProveedor(proveedor)}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ color: '#f9fafb' }}>
                    {proveedor.nombre}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                    {proveedor.tipo_servicio}
                  </Typography>
                  {selectedProveedor?.id === proveedor.id && (
                    <Chip label="Seleccionado" color="success" size="small" sx={{ mt: 1 }} />
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Grid>
    </Grid>
  );

  const renderResponsableInfo = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" sx={{ color: '#f9fafb', mb: 2 }}>
          Datos del Responsable del Tratamiento
        </Typography>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Nombre de la Empresa"
          value={dpaData.responsable.nombre_empresa}
          onChange={(e) => setDpaData(prev => ({
            ...prev,
            responsable: { ...prev.responsable, nombre_empresa: e.target.value }
          }))}
          sx={getTextFieldStyles()}
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="RUT"
          value={dpaData.responsable.rut}
          onChange={(e) => setDpaData(prev => ({
            ...prev,
            responsable: { ...prev.responsable, rut: e.target.value }
          }))}
          sx={getTextFieldStyles()}
        />
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Dirección"
          value={dpaData.responsable.direccion}
          onChange={(e) => setDpaData(prev => ({
            ...prev,
            responsable: { ...prev.responsable, direccion: e.target.value }
          }))}
          sx={getTextFieldStyles()}
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Representante Legal"
          value={dpaData.responsable.representante_legal}
          onChange={(e) => setDpaData(prev => ({
            ...prev,
            responsable: { ...prev.responsable, representante_legal: e.target.value }
          }))}
          sx={getTextFieldStyles()}
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Email de Contacto"
          type="email"
          value={dpaData.responsable.email_contacto}
          onChange={(e) => setDpaData(prev => ({
            ...prev,
            responsable: { ...prev.responsable, email_contacto: e.target.value }
          }))}
          sx={getTextFieldStyles()}
        />
      </Grid>
    </Grid>
  );

  const renderEncargadoInfo = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" sx={{ color: '#f9fafb', mb: 2 }}>
          Datos del Encargado del Tratamiento
        </Typography>
        {selectedProveedor && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Datos pre-llenados desde: <strong>{selectedProveedor.nombre}</strong>
          </Alert>
        )}
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Nombre de la Empresa"
          value={dpaData.encargado.nombre_empresa}
          onChange={(e) => setDpaData(prev => ({
            ...prev,
            encargado: { ...prev.encargado, nombre_empresa: e.target.value }
          }))}
          sx={getTextFieldStyles()}
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="RUT"
          value={dpaData.encargado.rut}
          onChange={(e) => setDpaData(prev => ({
            ...prev,
            encargado: { ...prev.encargado, rut: e.target.value }
          }))}
          sx={getTextFieldStyles()}
        />
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Dirección"
          value={dpaData.encargado.direccion}
          onChange={(e) => setDpaData(prev => ({
            ...prev,
            encargado: { ...prev.encargado, direccion: e.target.value }
          }))}
          sx={getTextFieldStyles()}
        />
      </Grid>
      
      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="País"
          value={dpaData.encargado.pais}
          onChange={(e) => setDpaData(prev => ({
            ...prev,
            encargado: { ...prev.encargado, pais: e.target.value }
          }))}
          sx={getTextFieldStyles()}
        />
      </Grid>
      
      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="Representante Legal"
          value={dpaData.encargado.representante_legal}
          onChange={(e) => setDpaData(prev => ({
            ...prev,
            encargado: { ...prev.encargado, representante_legal: e.target.value }
          }))}
          sx={getTextFieldStyles()}
        />
      </Grid>
      
      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="Email de Contacto"
          type="email"
          value={dpaData.encargado.email_contacto}
          onChange={(e) => setDpaData(prev => ({
            ...prev,
            encargado: { ...prev.encargado, email_contacto: e.target.value }
          }))}
          sx={getTextFieldStyles()}
        />
      </Grid>
    </Grid>
  );

  const renderTratamientoInfo = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" sx={{ color: '#f9fafb', mb: 2 }}>
          Descripción del Tratamiento
        </Typography>
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          rows={4}
          label="Finalidad del Tratamiento"
          value={dpaData.tratamiento.finalidad_tratamiento}
          onChange={(e) => setDpaData(prev => ({
            ...prev,
            tratamiento: { ...prev.tratamiento, finalidad_tratamiento: e.target.value }
          }))}
          sx={getTextFieldStyles()}
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Typography variant="subtitle2" sx={{ color: '#f9fafb', mb: 1 }}>
          Categorías de Datos Personales
        </Typography>
        <FormGroup>
          {[
            'Datos de identificación',
            'Datos de contacto', 
            'Datos económicos',
            'Datos laborales',
            'Datos sensibles',
            'Datos biométricos'
          ].map((categoria) => (
            <FormControlLabel
              key={categoria}
              control={
                <Checkbox
                  checked={dpaData.tratamiento.categorias_datos.includes(categoria)}
                  onChange={(e) => {
                    const newCategorias = e.target.checked
                      ? [...dpaData.tratamiento.categorias_datos, categoria]
                      : dpaData.tratamiento.categorias_datos.filter(c => c !== categoria);
                    setDpaData(prev => ({
                      ...prev,
                      tratamiento: { ...prev.tratamiento, categorias_datos: newCategorias }
                    }));
                  }}
                  sx={{ color: '#4f46e5' }}
                />
              }
              label={<Typography variant="body2" sx={{ color: '#f9fafb' }}>{categoria}</Typography>}
            />
          ))}
        </FormGroup>
      </Grid>

      <Grid item xs={12} md={6}>
        <Typography variant="subtitle2" sx={{ color: '#f9fafb', mb: 1 }}>
          Operaciones de Tratamiento
        </Typography>
        <FormGroup>
          {[
            'Recogida',
            'Registro',
            'Estructuración',
            'Conservación',
            'Modificación',
            'Consulta',
            'Comunicación',
            'Supresión'
          ].map((operacion) => (
            <FormControlLabel
              key={operacion}
              control={
                <Checkbox
                  checked={dpaData.tratamiento.operaciones_tratamiento.includes(operacion)}
                  onChange={(e) => {
                    const newOperaciones = e.target.checked
                      ? [...dpaData.tratamiento.operaciones_tratamiento, operacion]
                      : dpaData.tratamiento.operaciones_tratamiento.filter(o => o !== operacion);
                    setDpaData(prev => ({
                      ...prev,
                      tratamiento: { ...prev.tratamiento, operaciones_tratamiento: newOperaciones }
                    }));
                  }}
                  sx={{ color: '#4f46e5' }}
                />
              }
              label={<Typography variant="body2" sx={{ color: '#f9fafb' }}>{operacion}</Typography>}
            />
          ))}
        </FormGroup>
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Plazo de Conservación"
          value={dpaData.tratamiento.plazo_conservacion}
          onChange={(e) => setDpaData(prev => ({
            ...prev,
            tratamiento: { ...prev.tratamiento, plazo_conservacion: e.target.value }
          }))}
          sx={getTextFieldStyles()}
          placeholder="ej: 5 años desde la última interacción"
        />
      </Grid>
    </Grid>
  );

  const renderSeguridadInfo = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" sx={{ color: '#f9fafb', mb: 2 }}>
          Medidas de Seguridad
        </Typography>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Card sx={{ bgcolor: '#374151', border: '1px solid #4b5563' }}>
          <CardHeader title="Controles de Seguridad" sx={{ color: '#f9fafb', py: 2 }} />
          <CardContent>
            <FormGroup>
              {[
                { key: 'cifrado_datos', label: 'Cifrado de datos' },
                { key: 'control_acceso', label: 'Control de acceso basado en roles' },
                { key: 'backup_seguro', label: 'Backup seguro' },
                { key: 'monitoreo_accesos', label: 'Monitoreo de accesos' },
                { key: 'capacitacion_personal', label: 'Capacitación del personal' },
                { key: 'politicas_seguridad', label: 'Políticas de seguridad' }
              ].map((control) => (
                <FormControlLabel
                  key={control.key}
                  control={
                    <Checkbox
                      checked={dpaData.seguridad[control.key]}
                      onChange={(e) => setDpaData(prev => ({
                        ...prev,
                        seguridad: { ...prev.seguridad, [control.key]: e.target.checked }
                      }))}
                      sx={{ color: '#4f46e5' }}
                    />
                  }
                  label={<Typography variant="body2" sx={{ color: '#f9fafb' }}>{control.label}</Typography>}
                />
              ))}
            </FormGroup>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderTransferenciasDerechos = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" sx={{ color: '#f9fafb', mb: 2 }}>
          Transferencias Internacionales y Derechos
        </Typography>
      </Grid>
      
      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Checkbox
              checked={dpaData.transferencias.hay_transferencias}
              onChange={(e) => setDpaData(prev => ({
                ...prev,
                transferencias: { ...prev.transferencias, hay_transferencias: e.target.checked }
              }))}
              sx={{ color: '#4f46e5' }}
            />
          }
          label={<Typography sx={{ color: '#f9fafb' }}>Se realizan transferencias internacionales</Typography>}
        />
      </Grid>

      {dpaData.transferencias.hay_transferencias && (
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Países de destino"
            value={dpaData.transferencias.paises_destino.join(', ')}
            onChange={(e) => setDpaData(prev => ({
              ...prev,
              transferencias: { ...prev.transferencias, paises_destino: e.target.value.split(', ') }
            }))}
            sx={getTextFieldStyles()}
            placeholder="Estados Unidos, Reino Unido"
          />
        </Grid>
      )}
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Procedimiento para ejercicio de derechos"
          value={dpaData.derechos.procedimiento_consultas}
          onChange={(e) => setDpaData(prev => ({
            ...prev,
            derechos: { ...prev.derechos, procedimiento_consultas: e.target.value }
          }))}
          sx={getTextFieldStyles()}
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Plazo de respuesta (días)"
          type="number"
          value={dpaData.derechos.plazo_respuesta}
          onChange={(e) => setDpaData(prev => ({
            ...prev,
            derechos: { ...prev.derechos, plazo_respuesta: e.target.value }
          }))}
          sx={getTextFieldStyles()}
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Contacto para ejercicio de derechos"
          value={dpaData.derechos.contacto_ejercicio}
          onChange={(e) => setDpaData(prev => ({
            ...prev,
            derechos: { ...prev.derechos, contacto_ejercicio: e.target.value }
          }))}
          sx={getTextFieldStyles()}
        />
      </Grid>
    </Grid>
  );

  const renderGenerarDPA = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" sx={{ color: '#f9fafb', mb: 2 }}>
          Generar Acuerdo DPA
        </Typography>
      </Grid>
      
      <Grid item xs={12}>
        <Card sx={{ bgcolor: '#1f2937', border: '1px solid #374151' }}>
          <CardContent>
            <Typography variant="body1" sx={{ color: '#f9fafb', mb: 2 }}>
              <DocumentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Resumen del DPA a generar:
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                  <strong>Responsable:</strong> {dpaData.responsable.nombre_empresa}
                </Typography>
                <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                  <strong>Encargado:</strong> {dpaData.encargado.nombre_empresa}
                </Typography>
                <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                  <strong>Finalidad:</strong> {dpaData.tratamiento.finalidad_tratamiento.substring(0, 100)}...
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                  <strong>Categorías de datos:</strong> {dpaData.tratamiento.categorias_datos.length} seleccionadas
                </Typography>
                <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                  <strong>Operaciones:</strong> {dpaData.tratamiento.operaciones_tratamiento.length} definidas
                </Typography>
                <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                  <strong>Transferencias internacionales:</strong> {dpaData.transferencias.hay_transferencias ? 'Sí' : 'No'}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} sx={{ textAlign: 'center' }}>
        <Button
          variant="contained"
          size="large"
          onClick={generarDPA}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : <DocumentIcon />}
          sx={{
            bgcolor: '#10b981',
            '&:hover': { bgcolor: '#059669' },
            px: 6,
            py: 2
          }}
        >
          {loading ? 'Generando...' : 'Generar DPA'}
        </Button>
      </Grid>
    </Grid>
  );

  const getTextFieldStyles = () => ({
    '& .MuiOutlinedInput-root': {
      bgcolor: '#374151',
      color: '#f9fafb',
      '& fieldset': { borderColor: '#4b5563' },
      '&:hover fieldset': { borderColor: '#6b7280' },
      '&.Mui-focused fieldset': { borderColor: '#4f46e5' },
    },
    '& .MuiInputLabel-root': { color: '#9ca3af' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#4f46e5' }
  });

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#111827', py: 4 }}>
      <Container maxWidth="xl">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ 
            color: '#f9fafb', 
            fontWeight: 700, 
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}>
            <SecurityIcon sx={{ fontSize: 40, color: '#10b981' }} />
            Generador de DPA (Data Processing Agreement)
          </Typography>
          <Typography variant="subtitle1" sx={{ color: '#9ca3af' }}>
            Art. 24 Ley 21.719 - Acuerdos obligatorios con encargados del tratamiento
          </Typography>
        </Box>

        <Paper sx={{ bgcolor: '#1f2937', border: '1px solid #374151', p: 3, mb: 3 }}>
          <Stepper 
            activeStep={currentStep}
            sx={{ 
              '& .MuiStepLabel-label': { color: '#9ca3af' },
              '& .MuiStepLabel-label.Mui-active': { color: '#10b981' },
              '& .MuiStepLabel-label.Mui-completed': { color: '#10b981' }
            }}
          >
            {steps.map((label, index) => (
              <Step 
                key={label}
                sx={{ cursor: 'pointer' }}
                onClick={() => setCurrentStep(index)}
              >
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        <Paper sx={{ bgcolor: '#1f2937', border: '1px solid #374151', p: 4, mb: 3 }}>
          {renderStepContent(currentStep)}
        </Paper>

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
            sx={{ color: '#9ca3af' }}
          >
            Anterior
          </Button>
          
          <Button
            onClick={() => setCurrentStep(prev => Math.min(steps.length - 1, prev + 1))}
            disabled={currentStep === steps.length - 1}
            sx={{ color: '#10b981' }}
          >
            Siguiente
          </Button>
        </Box>

        {/* Preview Dialog */}
        <Dialog 
          open={previewDialog} 
          onClose={() => setPreviewDialog(false)}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle sx={{ bgcolor: '#1f2937', color: '#f9fafb' }}>
            DPA Generado - Vista Previa
          </DialogTitle>
          <DialogContent sx={{ bgcolor: '#1f2937' }}>
            <Box sx={{ 
              bgcolor: '#374151', 
              p: 3, 
              borderRadius: 1, 
              maxHeight: '60vh', 
              overflow: 'auto',
              color: '#f9fafb',
              fontFamily: 'monospace',
              whiteSpace: 'pre-line'
            }}>
              {generatedDPA}
            </Box>
          </DialogContent>
          <DialogActions sx={{ bgcolor: '#1f2937' }}>
            <Button onClick={() => setPreviewDialog(false)} sx={{ color: '#9ca3af' }}>
              Cerrar
            </Button>
            <Button 
              onClick={descargarDPA}
              startIcon={<DownloadIcon />}
              sx={{ color: '#10b981' }}
            >
              Descargar
            </Button>
          </DialogActions>
        </Dialog>

        <Box sx={{ mt: 4 }}>
          <Alert 
            severity="info"
            sx={{
              bgcolor: 'rgba(79, 70, 229, 0.1)',
              border: '1px solid rgba(79, 70, 229, 0.3)',
              color: '#f9fafb'
            }}
          >
            <Typography variant="body2">
              ⚖️ <strong>Art. 24 Ley 21.719:</strong> Los encargados del tratamiento deben contar con 
              acuerdos escritos que definan las obligaciones de seguridad y protección de datos.
            </Typography>
          </Alert>
        </Box>
      </Container>
    </Box>
  );
};

export default DPAGenerator;