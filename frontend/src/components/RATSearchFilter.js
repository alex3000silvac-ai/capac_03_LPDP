import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Button,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  FormControlLabel,
  Slider,
  Typography,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Save as SaveIcon,
  Star as StarIcon,
  ExpandMore as ExpandMoreIcon,
  Download as DownloadIcon
} from '@mui/icons-material';

const RATSearchFilter = ({ 
  onFilterChange, 
  onExport, 
  totalResults = 0,
  isLoading = false 
}) => {
  const [filters, setFilters] = useState({
    // Búsqueda general
    searchText: '',
    
    // Filtros básicos
    estado: '',
    industria: '',
    nivelRiesgo: '',
    requiereEIPD: null,
    
    // Filtros avanzados
    responsable: '',
    areaResponsable: '',
    baseLegal: '',
    tiposTratamiento: [],
    tiposDatos: [],
    
    // Filtros de fecha
    fechaCreacionDesde: '',
    fechaCreacionHasta: '',
    fechaActualizacionDesde: '',
    fechaActualizacionHasta: '',
    
    // Filtros compliance
    certificado: null,
    conEIPD: null,
    transferenciasInternacionales: null,
    
    // Opciones de ordenamiento
    orderBy: 'updated_at',
    orderDirection: 'desc'
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [savedFilters, setSavedFilters] = useState([]);
  const [filterName, setFilterName] = useState('');

  // Opciones para dropdowns
  const estadosRAT = [
    { value: 'BORRADOR', label: 'Borrador' },
    { value: 'EN_REVISION', label: 'En Revisión' },
    { value: 'PENDIENTE_APROBACION', label: 'Pendiente Aprobación' },
    { value: 'CERTIFICADO', label: 'Certificado' },
    { value: 'ELIMINADO', label: 'Eliminado' }
  ];

  const industrias = [
    { value: 'financiero', label: 'Financiero' },
    { value: 'salud', label: 'Salud' },
    { value: 'educacion', label: 'Educación' },
    { value: 'retail', label: 'Retail' },
    { value: 'tecnologia', label: 'Tecnología' },
    { value: 'manufactura', label: 'Manufactura' },
    { value: 'servicios', label: 'Servicios' },
    { value: 'gobierno', label: 'Gobierno' }
  ];

  const nivelesRiesgo = [
    { value: 'BAJO', label: 'Bajo' },
    { value: 'MEDIO', label: 'Medio' },
    { value: 'ALTO', label: 'Alto' },
    { value: 'CRITICO', label: 'Crítico' }
  ];

  const basesLegales = [
    { value: 'consentimiento_titular', label: 'Consentimiento del Titular' },
    { value: 'ejecucion_contrato', label: 'Ejecución de Contrato' },
    { value: 'cumplimiento_obligacion_legal', label: 'Cumplimiento Obligación Legal' },
    { value: 'proteccion_intereses_vitales', label: 'Protección Intereses Vitales' },
    { value: 'interes_publico', label: 'Interés Público' },
    { value: 'interes_legitimo', label: 'Interés Legítimo' }
  ];

  const tiposDatosOptions = [
    'identificacion', 'contacto', 'financieros', 'laborales',
    'salud', 'biometricos', 'localizacion', 'navegacion',
    'preferencias', 'comportamiento', 'sensibles_especiales'
  ];

  const tiposTratamientoOptions = [
    'RECOPILACION', 'ALMACENAMIENTO', 'UTILIZACION', 
    'COMUNICACION', 'DESTRUCCION'
  ];

  const opcionesOrdenamiento = [
    { value: 'created_at', label: 'Fecha Creación' },
    { value: 'updated_at', label: 'Última Actualización' },
    { value: 'nombre_actividad', label: 'Nombre Actividad' },
    { value: 'estado', label: 'Estado' },
    { value: 'nivel_riesgo', label: 'Nivel de Riesgo' }
  ];

  // Aplicar filtros cuando cambien
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      onFilterChange(filters);
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [filters, onFilterChange]);

  // Cargar filtros guardados al iniciar
  useEffect(() => {
    const saved = localStorage.getItem('rat_saved_filters');
    if (saved) {
      try {
        setSavedFilters(JSON.parse(saved));
      } catch (e) {
        console.warn('Error cargando filtros guardados:', e);
      }
    }
  }, []);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMultiSelectChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: typeof value === 'string' ? value.split(',') : value
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      searchText: '',
      estado: '',
      industria: '',
      nivelRiesgo: '',
      requiereEIPD: null,
      responsable: '',
      areaResponsable: '',
      baseLegal: '',
      tiposTratamiento: [],
      tiposDatos: [],
      fechaCreacionDesde: '',
      fechaCreacionHasta: '',
      fechaActualizacionDesde: '',
      fechaActualizacionHasta: '',
      certificado: null,
      conEIPD: null,
      transferenciasInternacionales: null,
      orderBy: 'updated_at',
      orderDirection: 'desc'
    });
  };

  const saveCurrentFilter = () => {
    if (!filterName.trim()) return;

    const newFilter = {
      id: Date.now(),
      name: filterName,
      filters: { ...filters },
      createdAt: new Date().toISOString()
    };

    const updated = [...savedFilters, newFilter];
    setSavedFilters(updated);
    localStorage.setItem('rat_saved_filters', JSON.stringify(updated));
    setFilterName('');
  };

  const loadSavedFilter = (savedFilter) => {
    setFilters(savedFilter.filters);
  };

  const deleteSavedFilter = (filterId) => {
    const updated = savedFilters.filter(f => f.id !== filterId);
    setSavedFilters(updated);
    localStorage.setItem('rat_saved_filters', JSON.stringify(updated));
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.searchText) count++;
    if (filters.estado) count++;
    if (filters.industria) count++;
    if (filters.nivelRiesgo) count++;
    if (filters.requiereEIPD !== null) count++;
    if (filters.responsable) count++;
    if (filters.areaResponsable) count++;
    if (filters.baseLegal) count++;
    if (filters.tiposTratamiento.length > 0) count++;
    if (filters.tiposDatos.length > 0) count++;
    if (filters.fechaCreacionDesde) count++;
    if (filters.fechaCreacionHasta) count++;
    if (filters.certificado !== null) count++;
    if (filters.conEIPD !== null) count++;
    if (filters.transferenciasInternacionales !== null) count++;
    
    return count;
  };

  const exportFilters = () => {
    const exportData = {
      filters,
      timestamp: new Date().toISOString(),
      totalResults
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rat_filters_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3, bgcolor: '#1a1a1a', border: '1px solid #333' }}>
      {/* Header con estadísticas */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <FilterIcon sx={{ color: '#4fc3f7' }} />
          <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
            Filtros de Búsqueda RAT
          </Typography>
          <Chip 
            label={`${totalResults} resultados`}
            sx={{ 
              bgcolor: '#0d47a1',
              color: '#fff',
              fontWeight: 600
            }}
          />
          {getActiveFiltersCount() > 0 && (
            <Chip 
              label={`${getActiveFiltersCount()} filtros activos`}
              sx={{ 
                bgcolor: '#f57f17',
                color: '#fff'
              }}
              onDelete={clearAllFilters}
            />
          )}
        </Box>
        
        <Box display="flex" gap={1}>
          <Tooltip title="Exportar resultados">
            <IconButton 
              onClick={onExport}
              disabled={isLoading || totalResults === 0}
              sx={{ color: '#4fc3f7' }}
            >
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Exportar configuración filtros">
            <IconButton 
              onClick={exportFilters}
              sx={{ color: '#81c784' }}
            >
              <SaveIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Búsqueda principal */}
      <Grid container spacing={3} mb={2}>
        <Grid item xs={12} md={8}>
          <TextField
            fullWidth
            label="Buscar RATs"
            value={filters.searchText}
            onChange={(e) => handleFilterChange('searchText', e.target.value)}
            placeholder="Buscar por nombre, descripción, finalidad..."
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: '#666', mr: 1 }} />,
              sx: { color: '#fff' }
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: '#2a2a2a',
                '& fieldset': { borderColor: '#444' },
                '&:hover fieldset': { borderColor: '#666' },
                '&.Mui-focused fieldset': { borderColor: '#4fc3f7' }
              },
              '& .MuiInputLabel-root': { color: '#bbb' }
            }}
          />
        </Grid>
        
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel sx={{ color: '#bbb' }}>Ordenar por</InputLabel>
            <Select
              value={filters.orderBy}
              onChange={(e) => handleFilterChange('orderBy', e.target.value)}
              sx={{
                bgcolor: '#2a2a2a',
                color: '#fff',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#444' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#666' }
              }}
            >
              {opcionesOrdenamiento.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Filtros básicos */}
      <Grid container spacing={2} mb={2}>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel sx={{ color: '#bbb' }}>Estado</InputLabel>
            <Select
              value={filters.estado}
              onChange={(e) => handleFilterChange('estado', e.target.value)}
              sx={{
                bgcolor: '#2a2a2a',
                color: '#fff',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#444' }
              }}
            >
              <MenuItem value="">Todos</MenuItem>
              {estadosRAT.map(estado => (
                <MenuItem key={estado.value} value={estado.value}>
                  {estado.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel sx={{ color: '#bbb' }}>Industria</InputLabel>
            <Select
              value={filters.industria}
              onChange={(e) => handleFilterChange('industria', e.target.value)}
              sx={{
                bgcolor: '#2a2a2a',
                color: '#fff',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#444' }
              }}
            >
              <MenuItem value="">Todas</MenuItem>
              {industrias.map(industria => (
                <MenuItem key={industria.value} value={industria.value}>
                  {industria.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel sx={{ color: '#bbb' }}>Nivel de Riesgo</InputLabel>
            <Select
              value={filters.nivelRiesgo}
              onChange={(e) => handleFilterChange('nivelRiesgo', e.target.value)}
              sx={{
                bgcolor: '#2a2a2a',
                color: '#fff',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#444' }
              }}
            >
              <MenuItem value="">Todos</MenuItem>
              {nivelesRiesgo.map(nivel => (
                <MenuItem key={nivel.value} value={nivel.value}>
                  {nivel.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel sx={{ color: '#bbb' }}>Requiere EIPD</InputLabel>
            <Select
              value={filters.requiereEIPD || ''}
              onChange={(e) => handleFilterChange('requiereEIPD', e.target.value === '' ? null : e.target.value === 'true')}
              sx={{
                bgcolor: '#2a2a2a',
                color: '#fff',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#444' }
              }}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="true">Sí</MenuItem>
              <MenuItem value="false">No</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Toggle filtros avanzados */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <FormControlLabel
          control={
            <Switch
              checked={showAdvanced}
              onChange={(e) => setShowAdvanced(e.target.checked)}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': { color: '#4fc3f7' },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#0d47a1' }
              }}
            />
          }
          label={
            <Typography sx={{ color: '#bbb' }}>
              Filtros Avanzados
            </Typography>
          }
        />
        
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            size="small"
            onClick={clearAllFilters}
            disabled={getActiveFiltersCount() === 0}
            sx={{
              borderColor: '#666',
              color: '#fff',
              '&:hover': { borderColor: '#999', bgcolor: '#333' }
            }}
            startIcon={<ClearIcon />}
          >
            Limpiar
          </Button>
        </Box>
      </Box>

      {/* Filtros avanzados */}
      {showAdvanced && (
        <Accordion 
          expanded
          sx={{ 
            bgcolor: '#2a2a2a', 
            color: '#fff',
            '&:before': { display: 'none' }
          }}
        >
          <AccordionSummary sx={{ minHeight: 'auto', '& .MuiAccordionSummary-content': { m: 0 } }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              🔍 Filtros Avanzados
            </Typography>
          </AccordionSummary>
          
          <AccordionDetails>
            <Grid container spacing={2}>
              {/* Filtros de responsables */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Responsable del Proceso"
                  value={filters.responsable}
                  onChange={(e) => handleFilterChange('responsable', e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: '#333',
                      '& fieldset': { borderColor: '#555' }
                    },
                    '& .MuiInputLabel-root': { color: '#bbb' }
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Área Responsable"
                  value={filters.areaResponsable}
                  onChange={(e) => handleFilterChange('areaResponsable', e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: '#333',
                      '& fieldset': { borderColor: '#555' }
                    },
                    '& .MuiInputLabel-root': { color: '#bbb' }
                  }}
                />
              </Grid>

              {/* Base legal */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: '#bbb' }}>Base Legal</InputLabel>
                  <Select
                    value={filters.baseLegal}
                    onChange={(e) => handleFilterChange('baseLegal', e.target.value)}
                    sx={{
                      bgcolor: '#333',
                      color: '#fff',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#555' }
                    }}
                  >
                    <MenuItem value="">Todas</MenuItem>
                    {basesLegales.map(base => (
                      <MenuItem key={base.value} value={base.value}>
                        {base.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Tipos de datos */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: '#bbb' }}>Tipos de Datos</InputLabel>
                  <Select
                    multiple
                    value={filters.tiposDatos}
                    onChange={(e) => handleMultiSelectChange('tiposDatos', e.target.value)}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip 
                            key={value} 
                            label={value} 
                            size="small"
                            sx={{ bgcolor: '#0d47a1', color: '#fff' }}
                          />
                        ))}
                      </Box>
                    )}
                    sx={{
                      bgcolor: '#333',
                      color: '#fff',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#555' }
                    }}
                  >
                    {tiposDatosOptions.map(tipo => (
                      <MenuItem key={tipo} value={tipo}>
                        {tipo}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Fechas */}
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  type="date"
                  label="Creado Desde"
                  value={filters.fechaCreacionDesde}
                  onChange={(e) => handleFilterChange('fechaCreacionDesde', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: '#333',
                      '& fieldset': { borderColor: '#555' }
                    },
                    '& .MuiInputLabel-root': { color: '#bbb' }
                  }}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  type="date"
                  label="Creado Hasta"
                  value={filters.fechaCreacionHasta}
                  onChange={(e) => handleFilterChange('fechaCreacionHasta', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: '#333',
                      '& fieldset': { borderColor: '#555' }
                    },
                    '& .MuiInputLabel-root': { color: '#bbb' }
                  }}
                />
              </Grid>

              {/* Filtros booleanos */}
              <Grid item xs={12} md={6}>
                <Box display="flex" flexDirection="column" gap={1}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={filters.certificado === true}
                        onChange={(e) => handleFilterChange('certificado', e.target.checked ? true : null)}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': { color: '#4fc3f7' },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#0d47a1' }
                        }}
                      />
                    }
                    label={<Typography sx={{ color: '#bbb' }}>Solo Certificados</Typography>}
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={filters.conEIPD === true}
                        onChange={(e) => handleFilterChange('conEIPD', e.target.checked ? true : null)}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': { color: '#4fc3f7' },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#0d47a1' }
                        }}
                      />
                    }
                    label={<Typography sx={{ color: '#bbb' }}>Con EIPD Asociada</Typography>}
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={filters.transferenciasInternacionales === true}
                        onChange={(e) => handleFilterChange('transferenciasInternacionales', e.target.checked ? true : null)}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': { color: '#4fc3f7' },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#0d47a1' }
                        }}
                      />
                    }
                    label={<Typography sx={{ color: '#bbb' }}>Transferencias Internacionales</Typography>}
                  />
                </Box>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Filtros guardados */}
      {savedFilters.length > 0 && (
        <Box mt={2}>
          <Typography variant="subtitle2" sx={{ color: '#bbb', mb: 1 }}>
            🌟 Filtros Guardados:
          </Typography>
          
          <Box display="flex" flexWrap="wrap" gap={1}>
            {savedFilters.map(saved => (
              <Chip
                key={saved.id}
                label={saved.name}
                onClick={() => loadSavedFilter(saved)}
                onDelete={() => deleteSavedFilter(saved.id)}
                sx={{
                  bgcolor: '#3f51b5',
                  color: '#fff',
                  '&:hover': { bgcolor: '#303f9f' }
                }}
                icon={<StarIcon sx={{ color: '#fff !important' }} />}
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Guardar filtro actual */}
      {getActiveFiltersCount() > 0 && (
        <Box mt={2} display="flex" alignItems="center" gap={2}>
          <TextField
            size="small"
            label="Nombre del filtro"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            placeholder="Mi filtro personalizado..."
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: '#333',
                '& fieldset': { borderColor: '#555' }
              },
              '& .MuiInputLabel-root': { color: '#bbb' }
            }}
          />
          
          <Button
            variant="contained"
            size="small"
            onClick={saveCurrentFilter}
            disabled={!filterName.trim()}
            sx={{
              bgcolor: '#2e7d32',
              '&:hover': { bgcolor: '#1b5e20' }
            }}
            startIcon={<SaveIcon />}
          >
            Guardar Filtro
          </Button>
        </Box>
      )}

      {/* Resumen de filtros activos */}
      {getActiveFiltersCount() > 0 && (
        <Box mt={2} p={2} bgcolor="#333" borderRadius={1}>
          <Typography variant="body2" sx={{ color: '#ccc', mb: 1 }}>
            📋 Filtros Activos:
          </Typography>
          
          <Box display="flex" flexWrap="wrap" gap={1}>
            {filters.searchText && (
              <Chip label={`Texto: "${filters.searchText}"`} size="small" sx={{ bgcolor: '#424242', color: '#fff' }} />
            )}
            {filters.estado && (
              <Chip label={`Estado: ${estadosRAT.find(e => e.value === filters.estado)?.label}`} size="small" sx={{ bgcolor: '#424242', color: '#fff' }} />
            )}
            {filters.industria && (
              <Chip label={`Industria: ${industrias.find(i => i.value === filters.industria)?.label}`} size="small" sx={{ bgcolor: '#424242', color: '#fff' }} />
            )}
            {filters.nivelRiesgo && (
              <Chip label={`Riesgo: ${nivelesRiesgo.find(n => n.value === filters.nivelRiesgo)?.label}`} size="small" sx={{ bgcolor: '#424242', color: '#fff' }} />
            )}
            {filters.requiereEIPD !== null && (
              <Chip label={`EIPD: ${filters.requiereEIPD ? 'Requerida' : 'No requerida'}`} size="small" sx={{ bgcolor: '#424242', color: '#fff' }} />
            )}
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default RATSearchFilter;