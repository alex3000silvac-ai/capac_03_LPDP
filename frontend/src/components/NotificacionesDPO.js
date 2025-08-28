/**
 * SISTEMA DE NOTIFICACIONES PARA EL DPO
 * Este componente muestra todas las notificaciones y tareas pendientes del DPO
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Badge,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Divider,
  Grid,
  Popover,
  Avatar
} from '@mui/material';
import {
  Notifications as NotificationIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as CheckIcon,
  Assignment as DocumentIcon,
  Security as SecurityIcon,
  Business as BusinessIcon,
  Assessment as AssessmentIcon,
  Schedule as ScheduleIcon,
  PriorityHigh as PriorityIcon,
  Email as EmailIcon,
  Dashboard as DashboardIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';

const NotificacionesDPO = () => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  // Simular carga de notificaciones al montar
  useEffect(() => {
    cargarNotificaciones();
    // Simular notificaciones en tiempo real
    const interval = setInterval(() => {
      checkNuevasNotificaciones();
    }, 30000); // Cada 30 segundos

    return () => clearInterval(interval);
  }, []);

  const cargarNotificaciones = () => {
    // Simulación de notificaciones del sistema - INCLUYENDO ÁREA SALUD
    const notificacionesNuevas = [
      {
        id: 'NOTIF-SALUD-001',
        tipo: 'urgente',
        titulo: '🏥 EIPD REQUERIDA - Datos Sensibles de Salud',
        descripcion: 'El RAT-SALUD-2024 requiere EIPD por procesamiento de datos médicos y situación socioeconómica',
        fechaCreacion: new Date(Date.now() - 1 * 60 * 60 * 1000), // Hace 1 hora
        vencimiento: 2,
        documentoId: 'EIPD-SALUD-2024-001',
        ratOrigen: 'RAT-SALUD-2024',
        progreso: 15,
        area: 'salud'
      },
      {
        id: 'NOTIF-SALUD-002',
        tipo: 'critico',
        titulo: '🚨 CONSULTA PREVIA OBLIGATORIA - Alto Riesgo Salud',
        descripcion: 'Tratamiento masivo de datos médicos + algoritmos IA requiere consulta a Agencia Nacional',
        fechaCreacion: new Date(Date.now() - 30 * 60 * 1000), // Hace 30 minutos
        vencimiento: 1,
        documentoId: 'CONSULTA-PREVIA-SALUD-2024',
        ratOrigen: 'RAT-SALUD-2024',
        progreso: 0,
        area: 'salud'
      },
      {
        id: 'NOTIF-001',
        tipo: 'urgente',
        titulo: 'DPIA Pendiente - Scoring Crediticio',
        descripcion: 'El RAT-2024-001 requiere DPIA por decisiones automatizadas',
        fechaCreacion: new Date(Date.now() - 2 * 60 * 60 * 1000), // Hace 2 horas
        vencimiento: 3,
        documentoId: 'DPIA-2024-001',
        ratOrigen: 'RAT-2024-001',
        progreso: 40
      },
      {
        id: 'NOTIF-002',
        tipo: 'urgente',
        titulo: 'EIPD Incompleta - Datos Sensibles',
        descripcion: 'Evaluación de impacto al 60% para situación socioeconómica',
        fechaCreacion: new Date(Date.now() - 5 * 60 * 60 * 1000),
        vencimiento: 5,
        documentoId: 'EIPD-2024-001',
        ratOrigen: 'RAT-2024-001',
        progreso: 60
      },
      {
        id: 'NOTIF-003',
        tipo: 'advertencia',
        titulo: 'DPA Sin Firmar - AWS',
        descripcion: 'Contrato de procesamiento con AWS pendiente de firma',
        fechaCreacion: new Date(Date.now() - 24 * 60 * 60 * 1000),
        vencimiento: 10,
        documentoId: 'DPA-2024-002',
        ratOrigen: 'RAT-2024-001',
        progreso: 70
      },
      {
        id: 'NOTIF-004',
        tipo: 'advertencia',
        titulo: 'DPA Revisión - Dicom',
        descripcion: 'Contrato con Equifax Chile requiere revisión final',
        fechaCreacion: new Date(Date.now() - 48 * 60 * 60 * 1000),
        vencimiento: 15,
        documentoId: 'DPA-2024-001',
        ratOrigen: 'RAT-2024-001',
        progreso: 85
      },
      {
        id: 'NOTIF-005',
        tipo: 'success',
        titulo: '🏁 PROCESO LISTO PARA CERRAR',
        descripcion: 'RAT-2024-001 puede cerrarse - todos los documentos completos',
        fechaCreacion: new Date(Date.now() - 6 * 60 * 60 * 1000),
        vencimiento: 999,
        documentoId: 'PROCESO-COMPLETO',
        ratOrigen: 'RAT-2024-001',
        progreso: 100
      }
    ];

    setNotificaciones(notificacionesNuevas);
    setNotificationCount(notificacionesNuevas.filter(n => n.tipo === 'urgente').length);
  };

  const checkNuevasNotificaciones = () => {
    // Simular llegada de nueva notificación
    const random = Math.random();
    if (random > 0.7) {
      const nuevaNotificacion = {
        id: `NOTIF-${Date.now()}`,
        tipo: 'info',
        titulo: 'Nuevo RAT Creado',
        descripcion: 'El área de Marketing creó un RAT que podría requerir EIPD',
        fechaCreacion: new Date(),
        vencimiento: 30,
        documentoId: `RAT-${Date.now()}`,
        ratOrigen: `RAT-${Date.now()}`,
        progreso: 0
      };

      setNotificaciones(prev => [nuevaNotificacion, ...prev]);
      setNotificationCount(prev => prev + 1);
      
      // Mostrar notificación del navegador si tiene permisos
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Sistema LPDP - Nueva Tarea', {
          body: nuevaNotificacion.titulo,
          icon: '/favicon.ico'
        });
      }
    }
  };

  const handleNotificationClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleTaskClick = (task) => {
    console.log('🔄 handleTaskClick called with:', task);
    
    if (task.documentoId === 'PROCESO-COMPLETO') {
      console.log('🏁 Redirecting to proceso-completo');
      window.location.href = '/proceso-completo';
      return;
    }
    
    console.log('🔧 Setting selectedTask and opening dialog');
    setSelectedTask(task);
    setShowTaskDialog(true);
    handleClose();
  };
  
  // Nueva función para manejar la acción de completar documento
  const handleCompletarDocumento = (task) => {
    console.log('🚀 handleCompletarDocumento called with task:', task);
    
    const tipoDoc = task.documentoId.split('-')[0]; // EIPD, DPIA, DPA, etc.
    console.log('📋 Tipo documento:', tipoDoc);
    
    // Analizar si ya existe un documento o hay que crearlo/asociarlo
    const estadoDocumento = analizarEstadoDocumento(task);
    console.log('📊 Estado documento:', estadoDocumento);
    
    // Cerrar el dialog inmediatamente
    setShowTaskDialog(false);
    
    // Mostrar el sistema de gestión de asociaciones
    mostrarSistemaAsociaciones(task, estadoDocumento);
  };
  
  // Sistema inteligente de gestión de asociaciones
  const mostrarSistemaAsociaciones = (task, estadoDocumento) => {
    const tipoDoc = task.documentoId.split('-')[0];
    console.log('🎯 Sistema de asociaciones para:', tipoDoc, 'Estado:', estadoDocumento);

    // Crear mensaje detallado basado en el análisis
    let mensaje = `🔍 ANÁLISIS DEL SISTEMA LPDP\n\n`;
    mensaje += `📋 Documento requerido: ${tipoDoc}\n`;
    mensaje += `🏥 RAT origen: ${task.ratOrigen}\n`;
    mensaje += `⚡ Detección automática: ${estadoDocumento.mensaje}\n\n`;

    if (estadoDocumento.accion === 'CREAR_NUEVO') {
      mensaje += `💡 RECOMENDACIÓN: Crear nuevo documento\n\n`;
      mensaje += `¿Qué deseas hacer?\n\n`;
      mensaje += `✅ CREAR NUEVO: Crear ${tipoDoc} desde cero\n`;
      mensaje += `🔗 VER ASOCIACIONES: Ir al panel de gestión\n`;
      mensaje += `❌ CANCELAR: Volver al dashboard`;
      
      const respuesta = window.confirm(mensaje);
      if (respuesta) {
        crearNuevoDocumento(task);
      }
    } 
    else if (estadoDocumento.accion === 'COMPLETAR_EXISTENTE') {
      mensaje += `🎯 DOCUMENTO COMPATIBLE ENCONTRADO:\n`;
      mensaje += `📄 ${estadoDocumento.documento.nombre}\n`;
      mensaje += `📊 Progreso actual: ${estadoDocumento.documento.progreso}%\n\n`;
      mensaje += `💡 RECOMENDACIÓN: Completar documento existente\n\n`;
      mensaje += `¿Qué deseas hacer?\n\n`;
      mensaje += `✅ COMPLETAR: Abrir editor del documento existente\n`;
      mensaje += `🆕 CREAR NUEVO: Crear ${tipoDoc} diferente\n`;
      mensaje += `🔗 GESTIONAR: Ver todas las opciones de asociación`;
      
      const respuesta = window.confirm(mensaje);
      if (respuesta) {
        abrirDocumentoExistente(task);
      } else {
        // Mostrar opciones adicionales
        abrirGestionAsociaciones(task);
      }
    }
    else if (estadoDocumento.accion === 'ASOCIAR_EXISTENTE') {
      mensaje += `📋 MÚLTIPLES DOCUMENTOS ENCONTRADOS:\n\n`;
      estadoDocumento.documentos.forEach((doc, index) => {
        mensaje += `${index + 1}. ${doc.nombre} (${doc.progreso}%) ${doc.compatible ? '✅' : '⚠️'}\n`;
      });
      mensaje += `\n💡 RECOMENDACIÓN: Revisar opciones de asociación\n\n`;
      mensaje += `Se abrirá el panel de gestión de asociaciones para que puedas:\n`;
      mensaje += `• Asociar un documento existente\n`;
      mensaje += `• Crear un nuevo documento\n`;
      mensaje += `• Ver compatibilidad detallada`;
      
      alert(mensaje);
      abrirGestionAsociaciones(task);
    }
  };

  const analizarEstadoDocumento = (task) => {
    const tipoDoc = task.documentoId.split('-')[0];
    
    // Base de datos simulada más realista para el área de SALUD
    const documentosExistentes = {
      'EIPD': [
        { 
          id: 'EIPD-SALUD-2024-001', 
          nombre: 'EIPD Datos Médicos Generales', 
          progreso: 85, 
          compatible: task.area === 'salud',
          descripcion: 'Evaluación para datos médicos y diagnósticos',
          fecha_creacion: '2024-08-20',
          responsable: 'Dr. Juan Pérez (DPO Salud)'
        },
        { 
          id: 'EIPD-FINANCIERO-2024', 
          nombre: 'EIPD Sistema Scoring', 
          progreso: 60, 
          compatible: task.area === 'financiero',
          descripcion: 'Evaluación para datos financieros y crediticios',
          fecha_creacion: '2024-08-15',
          responsable: 'María López (DPO)'
        }
      ],
      'DPIA': [
        { 
          id: 'DPIA-SALUD-IA-2024', 
          nombre: 'DPIA Algoritmos Diagnóstico Médico', 
          progreso: 40, 
          compatible: task.area === 'salud',
          descripcion: 'DPIA para IA en diagnósticos automáticos',
          fecha_creacion: '2024-08-25',
          responsable: 'Dr. Carlos Ruiz (Auditoría Médica)'
        },
        { 
          id: 'DPIA-ALGORITMOS-GENERAL', 
          nombre: 'DPIA Scoring Crediticio', 
          progreso: 90, 
          compatible: task.area === 'financiero',
          descripcion: 'DPIA para decisiones crediticias automatizadas',
          fecha_creacion: '2024-08-10',
          responsable: 'Ana Torres (Auditoría)'
        }
      ],
      'DPA': [
        {
          id: 'DPA-CLOUD-SALUD-2024',
          nombre: 'DPA Servicios Cloud Médicos',
          progreso: 95,
          compatible: task.area === 'salud',
          descripcion: 'Contrato para procesamiento de datos médicos en la nube',
          fecha_creacion: '2024-08-12',
          responsable: 'Legal + DPO Salud'
        }
      ],
      'CONSULTA': []
    };
    
    const docsDelTipo = documentosExistentes[tipoDoc] || [];
    const docCompatible = docsDelTipo.find(d => d.compatible);
    const docsIncompatibles = docsDelTipo.filter(d => !d.compatible);
    
    console.log(`📋 Análisis para ${tipoDoc}:`, {
      totalDocs: docsDelTipo.length,
      compatibles: docCompatible ? 1 : 0,
      incompatibles: docsIncompatibles.length
    });
    
    if (docsDelTipo.length === 0) {
      return { 
        accion: 'CREAR_NUEVO', 
        mensaje: `No existe ningún documento ${tipoDoc} en el sistema`,
        documentos: []
      };
    } else if (docCompatible && docCompatible.progreso < 100) {
      return { 
        accion: 'COMPLETAR_EXISTENTE', 
        mensaje: `Documento compatible encontrado: ${docCompatible.nombre} (${docCompatible.progreso}% completo)`,
        documento: docCompatible,
        documentos: docsDelTipo
      };
    } else if (docCompatible && docCompatible.progreso === 100) {
      return {
        accion: 'ASOCIAR_EXISTENTE',
        mensaje: `Documento compatible completo disponible: ${docCompatible.nombre}`,
        documento: docCompatible,
        documentos: docsDelTipo
      };
    } else if (docsDelTipo.length > 0) {
      return { 
        accion: 'ASOCIAR_EXISTENTE', 
        mensaje: `${docsDelTipo.length} documentos ${tipoDoc} disponibles (revisar compatibilidad)`,
        documentos: docsDelTipo
      };
    } else {
      return { accion: 'CREAR_NUEVO', mensaje: 'Crear nuevo documento' };
    }
  };
  
  // Función para abrir el panel de gestión de asociaciones
  const abrirGestionAsociaciones = (task) => {
    console.log('🔗 Abriendo gestión de asociaciones para:', task);
    const tipoDoc = task.documentoId.split('-')[0];
    const url = `/gestion-asociaciones?rat=${task.ratOrigen}&tipo=${tipoDoc}&documento=${task.documentoId}`;
    console.log('🚀 Redirecting to:', url);
    window.location.href = url;
  };

  const crearNuevoDocumento = (task) => {
    console.log('📝 crearNuevoDocumento called with:', task);
    
    const tipoDoc = task.documentoId.split('-')[0];
    console.log('📋 Tipo documento extraído:', tipoDoc);
    
    const mensajes = {
      'EIPD': '📋 Creando nueva Evaluación de Impacto en Protección de Datos...',
      'DPIA': '🤖 Creando nueva Evaluación de Impacto de Algoritmos...',
      'DPA': '📄 Creando nuevo Contrato de Procesamiento de Datos...',
      'CONSULTA': '🏛️ Preparando consulta a la Agencia Nacional...'
    };
    
    const mensaje = mensajes[tipoDoc] || '📝 Creando documento...';
    console.log('💬 Mostrando mensaje:', mensaje);
    
    const confirmacion = window.confirm(
      `${mensaje}\n\n` +
      `✅ Se pre-llenará con datos del ${task.ratOrigen}\n` +
      `✅ Se asociará automáticamente al RAT\n` +
      `✅ Recibirás notificación cuando esté listo\n\n` +
      `¿Continuar con la redirección?`
    );
    
    if (!confirmacion) {
      console.log('❌ Usuario canceló la redirección');
      return;
    }
    
    // URLs de redirección
    const urls = {
      'EIPD': '/evaluacion-impacto',
      'DPIA': '/dpia-algoritmos', 
      'DPA': '/gestion-proveedores',
      'CONSULTA': '/consulta-previa'
    };
    
    const url = urls[tipoDoc] || '/dashboard-dpo';
    const fullUrl = `${url}?rat=${task.ratOrigen}&nuevo=true`;
    
    console.log('🚀 Redirecting to:', fullUrl);
    
    // Redirección inmediata
    window.location.href = fullUrl;
  };
  
  const mostrarOpcionesAsociacion = (task) => {
    const estado = analizarEstadoDocumento(task);
    const tipoDoc = task.documentoId.split('-')[0];
    
    const opciones = estado.documentos.map(doc => 
      `• ${doc.nombre} (${doc.progreso}% completo) ${doc.compatible ? '✅ Compatible' : '⚠️ Revisar'}`
    ).join('\n');
    
    const respuesta = window.confirm(
      `📋 ${estado.mensaje}\n\n${opciones}\n\n` +
      `¿Qué deseas hacer?\n\n` +
      `✅ OK = Ir a gestión de asociaciones\n` +
      `❌ Cancelar = Crear nuevo documento`
    );
    
    if (respuesta) {
      window.location.href = `/gestion-asociaciones?rat=${task.ratOrigen}&tipo=${tipoDoc}`;
    } else {
      crearNuevoDocumento(task);
    }
  };
  
  const abrirDocumentoExistente = (task) => {
    const estado = analizarEstadoDocumento(task);
    const doc = estado.documento;
    
    alert(`📋 Abriendo documento existente:\n\n` +
          `📄 ${doc.nombre}\n` +
          `📊 Progreso: ${doc.progreso}%\n` +
          `🔗 Ya asociado a ${task.ratOrigen}\n\n` +
          `🚀 Redirigiendo al editor...`);
    
    setTimeout(() => {
      const tipoDoc = task.documentoId.split('-')[0];
      const urls = {
        'EIPD': '/evaluacion-impacto',
        'DPIA': '/dpia-algoritmos',
        'DPA': '/gestion-proveedores'
      };
      
      const url = urls[tipoDoc] || '/dashboard-dpo';
      window.location.href = `${url}?documento=${doc.id}&editar=true`;
    }, 1500);
  };
  
  const mostrarOpcionesGenerales = (task) => {
    alert(`🔧 Opciones disponibles para ${task.titulo}:\n\n` +
          `1. 📝 Crear nuevo documento\n` +
          `2. 🔗 Asociar documento existente\n` +
          `3. 📋 Ver detalles de la tarea\n\n` +
          `Usa el menú de Gestión de Asociaciones para más opciones.`);
  };
  
  // Función auxiliar para mostrar estado en la tabla
  const getEstadoDocumento = (task) => {
    return analizarEstadoDocumento(task);
  };

  const getIconByType = (tipo) => {
    switch(tipo) {
      case 'urgente': return <ErrorIcon color="error" />;
      case 'advertencia': return <WarningIcon color="warning" />;
      case 'info': return <CheckIcon color="info" />;
      default: return <CheckIcon color="success" />;
    }
  };

  const getPriorityColor = (vencimiento) => {
    if (vencimiento <= 3) return 'error';
    if (vencimiento <= 7) return 'warning';
    return 'info';
  };

  const formatTimeAgo = (date) => {
    const hours = Math.floor((Date.now() - date) / (1000 * 60 * 60));
    if (hours < 1) return 'Hace menos de 1 hora';
    if (hours < 24) return `Hace ${hours} horas`;
    const days = Math.floor(hours / 24);
    return `Hace ${days} días`;
  };

  const open = Boolean(anchorEl);

  return (
    <Box sx={{ width: '100%' }}>
      {/* Botón de Prueba */}
      <Box sx={{ mb: 2 }}>
        <Button 
          variant="contained" 
          color="secondary"
          onClick={() => {
            console.log('🧪 BOTÓN DE PRUEBA FUNCIONA');
            alert('🧪 Los event handlers SÍ funcionan!');
          }}
        >
          🧪 PRUEBA - Click aquí para verificar que los botones funcionan
        </Button>
      </Box>

      {/* Barra Superior con Notificaciones */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 3,
        p: 2,
        bgcolor: 'background.paper',
        borderRadius: 2
      }}>
        <Typography variant="h5" fontWeight={700}>
          <DashboardIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Panel de Control DPO
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip 
            avatar={<Avatar>{notificationCount}</Avatar>}
            label="Tareas Urgentes"
            color="error"
            variant={notificationCount > 0 ? "filled" : "outlined"}
          />
          
          <IconButton onClick={handleNotificationClick}>
            <Badge badgeContent={notificationCount} color="error">
              <NotificationIcon sx={{ 
                fontSize: 28,
                animation: notificationCount > 0 ? 'ring 4s infinite' : 'none',
                '@keyframes ring': {
                  '0%, 100%': { transform: 'rotate(0)' },
                  '10%, 30%': { transform: 'rotate(14deg)' },
                  '20%, 40%': { transform: 'rotate(-14deg)' },
                  '50%': { transform: 'rotate(0)' }
                }
              }} />
            </Badge>
          </IconButton>
        </Box>
      </Box>

      {/* Panel Desplegable de Notificaciones */}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Box sx={{ width: 400, maxHeight: 500, overflow: 'auto' }}>
          <Box sx={{ 
            p: 2, 
            bgcolor: 'error.main', 
            color: 'error.contrastText',
            position: 'sticky',
            top: 0,
            zIndex: 1
          }}>
            <Typography variant="subtitle1" fontWeight={700} color="inherit">
              ⚠️ Notificaciones Pendientes
            </Typography>
          </Box>
          
          <List>
            {notificaciones.map((notif) => (
              <ListItem 
                key={notif.id}
                button
                onClick={() => {
                  console.log('🔔 NOTIFICACIÓN CLICKEADA desde Popover:', notif.documentoId);
                  // EJECUTAR DIRECTAMENTE SIN DIALOG
                  const tipoDoc = notif.documentoId.split('-')[0];
                  const estadoDocumento = analizarEstadoDocumento(notif);
                  
                  // Cerrar popover
                  handleClose();
                  
                  // Ejecutar análisis directo
                  mostrarSistemaAsociaciones(notif, estadoDocumento);
                }}
                sx={{
                  borderLeft: 4,
                  borderLeftColor: notif.tipo === 'urgente' ? 'error.main' : 
                                   notif.tipo === 'advertencia' ? 'warning.main' : 'info.main'
                }}
              >
                <ListItemIcon>
                  {getIconByType(notif.tipo)}
                </ListItemIcon>
                <ListItemText
                  primary={notif.titulo}
                  secondary={
                    <>
                      <Typography variant="caption" display="block">
                        {notif.descripcion}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatTimeAgo(notif.fechaCreacion)} • Vence en {notif.vencimiento} días
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Popover>

      {/* Alerta Principal */}
      {notificationCount > 0 && (
        <Alert 
          severity="warning" 
          icon={<PriorityIcon />}
          sx={{ mb: 3 }}
        >
          <Typography variant="subtitle1" fontWeight={600}>
            ATENCIÓN DPO: Tienes {notificationCount} documentos críticos pendientes de revisión
          </Typography>
          <Typography variant="body2">
            El sistema detectó automáticamente que los RATs requieren documentación adicional obligatoria según Ley 21.719
          </Typography>
        </Alert>
      )}

      {/* Estadísticas */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                📄 Documentos Pendientes
              </Typography>
              <Typography variant="h3" color="error">
                {notificaciones.length}
              </Typography>
              <Typography variant="caption">
                {notificaciones.filter(n => n.tipo === 'urgente').length} urgentes
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                ⏰ Próximo Vencimiento
              </Typography>
              <Typography variant="h3" color="warning.main">
                3 días
              </Typography>
              <Typography variant="caption">
                DPIA Sistema Scoring
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                🔗 Enlaces Activos
              </Typography>
              <Typography variant="h3" color="info.main">
                12
              </Typography>
              <Typography variant="caption">
                Todos sincronizados
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                ✅ Completados
              </Typography>
              <Typography variant="h3" color="success.main">
                8
              </Typography>
              <Typography variant="caption">
                92% cumplimiento
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabla de Tareas Pendientes */}
      <Card>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>
            📋 Tareas Pendientes del DPO
          </Typography>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Prioridad</TableCell>
                  <TableCell>Documento</TableCell>
                  <TableCell>Descripción</TableCell>
                  <TableCell>RAT Origen</TableCell>
                  <TableCell>Progreso</TableCell>
                  <TableCell>Vencimiento</TableCell>
                  <TableCell>Acción</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {notificaciones.map((task) => (
                  <TableRow 
                    key={task.id}
                    sx={{ 
                      '&:hover': { bgcolor: 'action.hover' },
                      // DESHABILITADO: Click en fila ya no abre dialog roto
                      // onClick={() => handleTaskClick(task)},
                      // cursor: 'pointer' 
                    }}
                  >
                    <TableCell>
                      <Chip 
                        label={task.tipo.toUpperCase()}
                        color={getPriorityColor(task.vencimiento)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {task.documentoId}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {getEstadoDocumento(task).mensaje}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{task.descripcion}</TableCell>
                    <TableCell>{task.ratOrigen}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={task.progreso} 
                          sx={{ flexGrow: 1, height: 8 }}
                        />
                        <Typography variant="caption">
                          {task.progreso}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        color={getPriorityColor(task.vencimiento)}
                      >
                        {task.vencimiento} días
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {task.documentoId === 'PROCESO-COMPLETO' ? (
                        <Button
                          variant="contained"
                          size="small"
                          color="success"
                          onClick={() => handleTaskClick(task)}
                        >
                          Cerrar Proceso
                        </Button>
                      ) : (
                        <Button
                          variant="contained"
                          size="small"
                          color={getEstadoDocumento(task).accion === 'CREAR_NUEVO' ? 'primary' : 
                                 getEstadoDocumento(task).accion === 'COMPLETAR_EXISTENTE' ? 'warning' : 'info'}
                          onClick={(e) => {
                            console.log('🎯 BOTÓN TABLA CLICKEADO DIRECTO:', task.documentoId);
                            e.preventDefault();
                            e.stopPropagation();
                            
                            // EJECUTAR DIRECTAMENTE SIN DIALOG
                            const tipoDoc = task.documentoId.split('-')[0];
                            const estadoDocumento = analizarEstadoDocumento(task);
                            console.log('📊 Estado directo:', estadoDocumento);
                            
                            // Mostrar alert INMEDIATO
                            alert(`🔍 ANÁLISIS SISTEMA LPDP\n\n` +
                                  `📋 Documento: ${tipoDoc}\n` +
                                  `🏥 RAT: ${task.ratOrigen}\n` +
                                  `⚡ Estado: ${estadoDocumento.mensaje}\n\n` +
                                  `🚀 Ejecutando acción recomendada...`);
                            
                            // Ejecutar acción DIRECTA
                            if (estadoDocumento.accion === 'CREAR_NUEVO') {
                              crearNuevoDocumento(task);
                            } else if (estadoDocumento.accion === 'COMPLETAR_EXISTENTE') {
                              abrirDocumentoExistente(task);
                            } else {
                              abrirGestionAsociaciones(task);
                            }
                          }}
                        >
                          {getEstadoDocumento(task).accion === 'CREAR_NUEVO' ? 'Crear' : 
                           getEstadoDocumento(task).accion === 'COMPLETAR_EXISTENTE' ? 'Completar' : 'Asociar'}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Timeline de Eventos */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>
            <TimelineIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Línea de Tiempo - Cómo Llegaron las Notificaciones
          </Typography>
          
          <Box sx={{ mt: 2 }}>
            {[
              { time: 'Hoy 14:30', evento: '🏥 Área Salud crea RAT', desc: 'RAT-SALUD-2024: "Procesamiento Datos Pacientes"' },
              { time: 'Hoy 14:31', evento: '🔍 Sistema analiza contenido', desc: 'Detecta: datos_medicos + situacion_socioeconomica + algoritmos IA' },
              { time: 'Hoy 14:32', evento: '⚠️ Trigger de alto riesgo', desc: 'Múltiples datos sensibles + tratamiento masivo' },
              { time: 'Hoy 14:33', evento: '🚨 Alerta crítica generada', desc: 'CONSULTA PREVIA OBLIGATORIA - Agencia Nacional' },
              { time: 'Hoy 14:34', evento: '🔔 Notificación inmediata DPO', desc: 'Email + Push + Dashboard + SMS de emergencia' },
              { time: 'Hoy 15:00', evento: '👤 DPO debe actuar YA', desc: 'Vencimiento: 24 horas para consulta previa' }
            ].map((item, index) => (
              <Box key={index} sx={{ 
                display: 'flex', 
                mb: 2,
                pl: 2,
                borderLeft: '3px solid',
                borderLeftColor: index === 1 ? 'warning.main' : 'primary.main'
              }}>
                <Box sx={{ minWidth: 100 }}>
                  <Typography variant="caption" color="text.secondary">
                    {item.time}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" fontWeight={600}>
                    {item.evento}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.desc}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Dialog de Tarea Detallada */}
      <Dialog open={showTaskDialog} onClose={() => setShowTaskDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          📋 Detalle de Tarea Pendiente
        </DialogTitle>
        <DialogContent>
          {selectedTask && (
            <Box>
              <Alert severity={selectedTask.tipo === 'urgente' ? 'error' : selectedTask.tipo === 'critico' ? 'error' : 'warning'} sx={{ mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={600}>{selectedTask.titulo}</Typography>
                <Typography variant="body2">{selectedTask.descripcion}</Typography>
              </Alert>
              
              {/* Mostrar estado del documento */}
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={600}>🔍 Estado del Documento</Typography>
                <Typography variant="body2">
                  {getEstadoDocumento(selectedTask).mensaje}
                </Typography>
              </Alert>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Documento ID:</Typography>
                  <Typography variant="body1" fontWeight={600}>{selectedTask.documentoId}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">RAT Origen:</Typography>
                  <Typography variant="body1" fontWeight={600}>{selectedTask.ratOrigen}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Progreso Actual:</Typography>
                  <LinearProgress variant="determinate" value={selectedTask.progreso} />
                  <Typography variant="caption">{selectedTask.progreso}% completado</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Vencimiento:</Typography>
                  <Chip 
                    label={`${selectedTask.vencimiento} días`} 
                    color={getPriorityColor(selectedTask.vencimiento)}
                  />
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>Próximos Pasos:</Typography>
              <List>
                <ListItem>
                  <ListItemIcon><CheckIcon /></ListItemIcon>
                  <ListItemText primary="Revisar datos pre-llenados desde el RAT" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckIcon /></ListItemIcon>
                  <ListItemText primary="Completar campos faltantes" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckIcon /></ListItemIcon>
                  <ListItemText primary="Validar con equipo legal" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckIcon /></ListItemIcon>
                  <ListItemText primary="Firmar y archivar documento" />
                </ListItem>
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTaskDialog(false)}>Cerrar</Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => {
              console.log('🔥 Dialog button clicked, selectedTask:', selectedTask);
              if (selectedTask) {
                handleCompletarDocumento(selectedTask);
              } else {
                alert('❌ Error: No hay tarea seleccionada. Por favor cierra el dialog e intenta de nuevo.');
              }
            }}
          >
            {selectedTask ? (
              (() => {
                const estado = getEstadoDocumento(selectedTask);
                switch(estado.accion) {
                  case 'CREAR_NUEVO': return '📝 Crear Nuevo Documento';
                  case 'COMPLETAR_EXISTENTE': return '✏️ Completar Documento Existente';
                  case 'ASOCIAR_EXISTENTE': return '🔗 Gestionar Asociaciones';
                  default: return 'Ir a Completar Documento';
                }
              })()
            ) : 'Ir a Completar Documento'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NotificacionesDPO;