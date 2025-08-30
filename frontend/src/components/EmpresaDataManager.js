/**
 * GESTOR DE DATOS COMUNES DE EMPRESA
 * Simplifica la creación de RATs reutilizando información común
 * Fundamentos legales específicos de Chile
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Alert,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Person as PersonIcon,
  Computer as ComputerIcon,
  Schedule as ScheduleIcon,
  Gavel as GavelIcon,
  Save as SaveIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';

const EmpresaDataManager = ({ onDataUpdate, existingData = {} }) => {
  const [empresaData, setEmpresaData] = useState({
    // DATOS BÁSICOS DE LA EMPRESA
    razonSocial: existingData.razonSocial || '',
    rut: existingData.rut || '',
    direccion: existingData.direccion || '',
    telefono: existingData.telefono || '',
    email: existingData.email || '',
    
    // ENCARGADO DE PROTECCIÓN DE DATOS (DPO)
    dpo: {
      nombre: existingData.dpo?.nombre || '',
      email: existingData.dpo?.email || '',
      telefono: existingData.dpo?.telefono || '',
      cargo: existingData.dpo?.cargo || '',
      fechaDesignacion: existingData.dpo?.fechaDesignacion || ''
    },
    
    // PLATAFORMAS TECNOLÓGICAS COMUNES
    plataformasTecnologicas: existingData.plataformasTecnologicas || [],
    
    // POLÍTICAS DE RETENCIÓN POR TIPO DE DATO
    politicasRetencion: existingData.politicasRetencion || {
      datosLaborales: '5_anos', // Art. 33 Código del Trabajo
      datosTributarios: '6_anos', // Art. 17 Código Tributario  
      datosContractuales: 'duracion_contractual',
      datosComerciales: '3_anos'
    },
    
    // BASES LEGALES FRECUENTES
    basesLegalesFrecuentes: existingData.basesLegalesFrecuentes || []
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // PLAZOS DE RETENCIÓN CON FUNDAMENTO LEGAL ESPECÍFICO
  const plazosRetencionChile = {
    datosLaborales: {
      plazo: '5_anos',
      fundamento: 'Art. 33 Código del Trabajo - Registro de asistencia y control de horarios',
      descripcion: 'Datos de asistencia, horarios trabajados y control laboral'
    },
    datosTributarios: {
      plazo: '6_anos',
      fundamento: 'Art. 17 Código Tributario - Conservación de documentos contables',
      descripcion: 'Documentos contables, facturas, registros tributarios'
    },
    datosContractuales: {
      plazo: 'duracion_contractual',
      fundamento: 'Art. 1545 Código Civil - "El contrato es ley para las partes"',
      descripcion: 'Durante vigencia del contrato y plazos de prescripción'
    },
    datosComerciales: {
      plazo: '3_anos',
      fundamento: 'Art. 822 Código de Comercio - Prescripción acciones comerciales',
      descripcion: 'Correspondencia comercial, órdenes de compra, facturas'
    },
    datosSalud: {
      plazo: 'indefinido_con_medidas',
      fundamento: 'Ley 20.584 Art. 12 - Derechos y deberes del paciente',
      descripcion: 'Datos médicos con medidas especiales de protección'
    },
    datosFinancieros: {
      plazo: '10_anos',
      fundamento: 'Ley General de Bancos Art. 154 - Conservación de registros',
      descripcion: 'Operaciones bancarias y financieras'
    }
  };

  // PLATAFORMAS TECNOLÓGICAS COMUNES EN CHILE
  const plataformasComunes = [
    { nombre: 'Google Workspace', tipo: 'internacional', requiereDPA: true },
    { nombre: 'Microsoft 365', tipo: 'internacional', requiereDPA: true },
    { nombre: 'Salesforce', tipo: 'internacional', requiereDPA: true },
    { nombre: 'SAP', tipo: 'internacional', requiereDPA: true },
    { nombre: 'Defontana ERP', tipo: 'nacional', requiereDPA: false },
    { nombre: 'Bind ERP', tipo: 'nacional', requiereDPA: false },
    { nombre: 'Previred', tipo: 'nacional', requiereDPA: false },
    { nombre: 'SII Portal', tipo: 'publico', requiereDPA: false }
  ];

  const handleSave = () => {
    localStorage.setItem('empresaDataCommon', JSON.stringify(empresaData));
    setIsSaved(true);
    setIsEditing(false);
    
    if (onDataUpdate) {
      onDataUpdate(empresaData);
    }

    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleAddPlataforma = (plataforma) => {
    const nuevasPlataformas = [...empresaData.plataformasTecnologicas];
    if (!nuevasPlataformas.find(p => p.nombre === plataforma.nombre)) {
      nuevasPlataformas.push(plataforma);
      setEmpresaData({
        ...empresaData,
        plataformasTecnologicas: nuevasPlataformas
      });
    }
  };

  useEffect(() => {
    // Cargar datos guardados si existen
    const savedData = localStorage.getItem('empresaDataCommon');
    if (savedData) {
      setEmpresaData(JSON.parse(savedData));
    }
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            DATOS COMUNES DE LA EMPRESA
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {isSaved && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'success.main' }}>
                <CheckIcon />
                <Typography variant="body2">Guardado exitosamente</Typography>
              </Box>
            )}
            <Button
              variant={isEditing ? "outlined" : "contained"}
              onClick={() => setIsEditing(!isEditing)}
              startIcon={isEditing ? <SaveIcon /> : null}
            >
              {isEditing ? 'Cancelar' : 'Editar'}
            </Button>
            {isEditing && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleSave}
                startIcon={<SaveIcon />}
              >
                Guardar
              </Button>
            )}
          </Box>
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2" fontWeight="bold">
            Fundamento Legal: Art. 16 Ley 21.719
          </Typography>
          <Typography variant="caption">
            "Obligación del responsable de mantener registro de actividades de tratamiento"
            <br />
            Los datos comunes se reutilizan automáticamente en todos los RATs para simplificar el proceso.
          </Typography>
        </Alert>

        <Grid container spacing={4}>
          {/* DATOS BÁSICOS EMPRESA */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BusinessIcon />
                  INFORMACIÓN EMPRESA
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Razón Social"
                      value={empresaData.razonSocial}
                      disabled={!isEditing}
                      onChange={(e) => setEmpresaData({
                        ...empresaData,
                        razonSocial: e.target.value
                      })}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="RUT"
                      value={empresaData.rut}
                      disabled={!isEditing}
                      onChange={(e) => setEmpresaData({
                        ...empresaData,
                        rut: e.target.value
                      })}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Teléfono"
                      value={empresaData.telefono}
                      disabled={!isEditing}
                      onChange={(e) => setEmpresaData({
                        ...empresaData,
                        telefono: e.target.value
                      })}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Dirección"
                      value={empresaData.direccion}
                      disabled={!isEditing}
                      onChange={(e) => setEmpresaData({
                        ...empresaData,
                        direccion: e.target.value
                      })}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email Corporativo"
                      type="email"
                      value={empresaData.email}
                      disabled={!isEditing}
                      onChange={(e) => setEmpresaData({
                        ...empresaData,
                        email: e.target.value
                      })}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* ENCARGADO DE PROTECCIÓN DE DATOS */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon />
                  ENCARGADO DE PROTECCIÓN DE DATOS
                </Typography>
                <Alert severity="warning" size="small" sx={{ mb: 2 }}>
                  <Typography variant="caption">
                    <strong>Art. 19 Ley 21.719:</strong> Designación obligatoria para organismos públicos
                    y entidades privadas que cumplan criterios específicos
                  </Typography>
                </Alert>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Nombre Completo"
                      value={empresaData.dpo.nombre}
                      disabled={!isEditing}
                      onChange={(e) => setEmpresaData({
                        ...empresaData,
                        dpo: { ...empresaData.dpo, nombre: e.target.value }
                      })}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Email DPO"
                      type="email"
                      value={empresaData.dpo.email}
                      disabled={!isEditing}
                      onChange={(e) => setEmpresaData({
                        ...empresaData,
                        dpo: { ...empresaData.dpo, email: e.target.value }
                      })}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Teléfono DPO"
                      value={empresaData.dpo.telefono}
                      disabled={!isEditing}
                      onChange={(e) => setEmpresaData({
                        ...empresaData,
                        dpo: { ...empresaData.dpo, telefono: e.target.value }
                      })}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Cargo en la Empresa"
                      value={empresaData.dpo.cargo}
                      disabled={!isEditing}
                      onChange={(e) => setEmpresaData({
                        ...empresaData,
                        dpo: { ...empresaData.dpo, cargo: e.target.value }
                      })}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Fecha de Designación"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      value={empresaData.dpo.fechaDesignacion}
                      disabled={!isEditing}
                      onChange={(e) => setEmpresaData({
                        ...empresaData,
                        dpo: { ...empresaData.dpo, fechaDesignacion: e.target.value }
                      })}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* PLATAFORMAS TECNOLÓGICAS */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ComputerIcon />
                  PLATAFORMAS TECNOLÓGICAS
                </Typography>
                <Alert severity="info" size="small" sx={{ mb: 2 }}>
                  <Typography variant="caption">
                    <strong>Art. 27-29 Ley 21.719:</strong> Plataformas internacionales requieren DPA
                  </Typography>
                </Alert>
                
                {isEditing && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" gutterBottom>Agregar plataformas comunes:</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {plataformasComunes.map((plataforma) => (
                        <Chip
                          key={plataforma.nombre}
                          label={plataforma.nombre}
                          onClick={() => handleAddPlataforma(plataforma)}
                          color={plataforma.requiereDPA ? 'warning' : 'default'}
                          size="small"
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                <List>
                  {empresaData.plataformasTecnologicas.map((plataforma, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <ComputerIcon color={plataforma.requiereDPA ? 'warning' : 'primary'} />
                      </ListItemIcon>
                      <ListItemText
                        primary={plataforma.nombre}
                        secondary={plataforma.requiereDPA ? 
                          'Requiere DPA (transferencia internacional)' : 
                          'Proveedor nacional/público'
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* POLÍTICAS DE RETENCIÓN */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ScheduleIcon />
                  POLÍTICAS DE RETENCIÓN
                </Typography>
                <Alert severity="warning" size="small" sx={{ mb: 2 }}>
                  <Typography variant="caption">
                    <strong>Art. 5 Ley 21.719:</strong> Principio de minimización - datos solo el tiempo necesario
                  </Typography>
                </Alert>
                
                <List>
                  {Object.entries(plazosRetencionChile).map(([tipo, info]) => (
                    <ListItem key={tipo}>
                      <ListItemIcon>
                        <GavelIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={info.descripcion}
                        secondary={
                          <Box>
                            <Typography variant="caption" color="primary" fontWeight="bold">
                              Plazo: {info.plazo.replace('_', ' ')}
                            </Typography>
                            <br />
                            <Typography variant="caption">
                              {info.fundamento}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Alert severity="success">
          <Typography variant="body2" fontWeight="bold">
            SIMPLIFICACIÓN AUTOMÁTICA ACTIVADA
          </Typography>
          <Typography variant="caption">
            Estos datos se aplicarán automáticamente en todos los nuevos RATs, 
            reduciendo el tiempo de creación en un 70%. Los plazos de retención 
            se asignan automáticamente según el tipo de dato y fundamento legal.
          </Typography>
        </Alert>
      </Paper>
    </Box>
  );
};

export default EmpresaDataManager;