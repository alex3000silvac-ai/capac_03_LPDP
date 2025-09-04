// 🎯 CONSTANTES DE ESTADOS - SISTEMA LPDP LEY 21.719
// Centralizar todos los estados para evitar inconsistencias

export const RAT_ESTADOS = {
  BORRADOR: 'BORRADOR',
  REVISION: 'REVISION', 
  PENDIENTE_APROBACION: 'PENDIENTE_APROBACION',
  MODIFICACION_REQUERIDA: 'MODIFICACION_REQUERIDA',
  APROBADO: 'APROBADO',
  ACTIVO: 'ACTIVO',
  CERTIFICADO: 'CERTIFICADO',
  INACTIVO: 'INACTIVO',
  RECHAZADO: 'RECHAZADO'
};

export const RAT_ESTADOS_LABELS = {
  [RAT_ESTADOS.BORRADOR]: 'Borrador',
  [RAT_ESTADOS.REVISION]: 'En Revisión',
  [RAT_ESTADOS.PENDIENTE_APROBACION]: 'Pendiente Aprobación',
  [RAT_ESTADOS.MODIFICACION_REQUERIDA]: 'Modificación Requerida', 
  [RAT_ESTADOS.APROBADO]: 'Aprobado',
  [RAT_ESTADOS.ACTIVO]: 'Activo',
  [RAT_ESTADOS.CERTIFICADO]: 'Certificado',
  [RAT_ESTADOS.INACTIVO]: 'Inactivo',
  [RAT_ESTADOS.RECHAZADO]: 'Rechazado'
};

export const RAT_ESTADOS_COLORS = {
  [RAT_ESTADOS.BORRADOR]: { color: '#9ca3af', bg: '#f3f4f6' },
  [RAT_ESTADOS.REVISION]: { color: '#f59e0b', bg: '#fef3c7' },
  [RAT_ESTADOS.PENDIENTE_APROBACION]: { color: '#f59e0b', bg: '#fef3c7' },
  [RAT_ESTADOS.MODIFICACION_REQUERIDA]: { color: '#ef4444', bg: '#fee2e2' },
  [RAT_ESTADOS.APROBADO]: { color: '#10b981', bg: '#d1fae5' },
  [RAT_ESTADOS.ACTIVO]: { color: '#10b981', bg: '#d1fae5' },
  [RAT_ESTADOS.CERTIFICADO]: { color: '#059669', bg: '#10b981' },
  [RAT_ESTADOS.INACTIVO]: { color: '#6b7280', bg: '#f9fafb' },
  [RAT_ESTADOS.RECHAZADO]: { color: '#dc2626', bg: '#fecaca' }
};

export const PROVEEDOR_ESTADOS = {
  ACTIVO: 'ACTIVO',
  INACTIVO: 'INACTIVO', 
  EN_REVISION: 'EN_REVISION',
  SUSPENDIDO: 'SUSPENDIDO',
  TERMINADO: 'TERMINADO'
};

export const DPA_ESTADOS = {
  BORRADOR: 'BORRADOR',
  PENDIENTE_FIRMA: 'PENDIENTE_FIRMA',
  FIRMADO: 'FIRMADO',
  VIGENTE: 'VIGENTE',
  VENCIDO: 'VENCIDO',
  TERMINADO: 'TERMINADO'
};

export const EIPD_ESTADOS = {
  BORRADOR: 'BORRADOR',
  EN_EVALUACION: 'EN_EVALUACION',
  PENDIENTE: 'PENDIENTE',
  COMPLETADA: 'COMPLETADA',
  IMPLEMENTANDO: 'IMPLEMENTANDO',
  CERRADA: 'CERRADA'
};

export const ACTIVIDAD_DPO_ESTADOS = {
  PENDIENTE: 'pendiente',
  EN_PROCESO: 'en_proceso', 
  COMPLETADA: 'completada',
  CANCELADA: 'cancelada'
};

export const NOTIFICACION_ESTADOS = {
  NO_LEIDA: 'no_leida',
  LEIDA: 'leida',
  ARCHIVADA: 'archivada'
};

// Funciones auxiliares
export const getRAT_EstadoLabel = (estado) => {
  return RAT_ESTADOS_LABELS[estado] || estado;
};

export const getRAT_EstadoColor = (estado) => {
  return RAT_ESTADOS_COLORS[estado] || { color: '#6b7280', bg: '#f9fafb' };
};

// Validadores
export const isRAT_EstadoValido = (estado) => {
  return Object.values(RAT_ESTADOS).includes(estado);
};

export const canRAT_TransitionTo = (estadoActual, estadoDestino) => {
  const transicionesPermitidas = {
    [RAT_ESTADOS.BORRADOR]: [RAT_ESTADOS.REVISION, RAT_ESTADOS.PENDIENTE_APROBACION],
    [RAT_ESTADOS.REVISION]: [RAT_ESTADOS.APROBADO, RAT_ESTADOS.MODIFICACION_REQUERIDA, RAT_ESTADOS.RECHAZADO],
    [RAT_ESTADOS.PENDIENTE_APROBACION]: [RAT_ESTADOS.APROBADO, RAT_ESTADOS.MODIFICACION_REQUERIDA, RAT_ESTADOS.RECHAZADO],
    [RAT_ESTADOS.MODIFICACION_REQUERIDA]: [RAT_ESTADOS.REVISION, RAT_ESTADOS.BORRADOR],
    [RAT_ESTADOS.APROBADO]: [RAT_ESTADOS.ACTIVO, RAT_ESTADOS.CERTIFICADO],
    [RAT_ESTADOS.ACTIVO]: [RAT_ESTADOS.CERTIFICADO, RAT_ESTADOS.INACTIVO],
    [RAT_ESTADOS.CERTIFICADO]: [RAT_ESTADOS.INACTIVO],
    [RAT_ESTADOS.RECHAZADO]: [RAT_ESTADOS.BORRADOR],
    [RAT_ESTADOS.INACTIVO]: [RAT_ESTADOS.ACTIVO]
  };

  return transicionesPermitidas[estadoActual]?.includes(estadoDestino) || false;
};

export default {
  RAT_ESTADOS,
  RAT_ESTADOS_LABELS, 
  RAT_ESTADOS_COLORS,
  PROVEEDOR_ESTADOS,
  DPA_ESTADOS,
  EIPD_ESTADOS,
  ACTIVIDAD_DPO_ESTADOS,
  NOTIFICACION_ESTADOS,
  getRAT_EstadoLabel,
  getRAT_EstadoColor,
  isRAT_EstadoValido,
  canRAT_TransitionTo
};