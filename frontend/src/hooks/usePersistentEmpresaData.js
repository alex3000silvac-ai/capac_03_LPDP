/**
 * 🪝 HOOK PERSISTENCIA DATOS EMPRESA - AUTOMÁTICA Y TRANSPARENTE
 * 
 * Hook personalizado que maneja automáticamente la persistencia
 * de datos de empresa sin afectar el flujo existente
 */

import { useEffect, useCallback } from 'react';
import { 
  guardarDatosEmpresa, 
  cargarDatosEmpresa, 
  actualizarDatosEmpresa,
  existenDatosEmpresa 
} from '../utils/datosEmpresaPersistence';

export const usePersistentEmpresaData = (ratData, setRatData, opciones = {}) => {
  const {
    autoGuardar = true,          // Guardar automáticamente al cambiar
    autoCargar = true,           // Cargar automáticamente al montar
    debounceMs = 2000,          // Delay para auto-guardado (2 segundos)
    persistir = true,           // Guardar en localStorage permanente
    notificarCambios = false    // Logs en consola
  } = opciones;

  /**
   * 💾 EXTRAER DATOS DE EMPRESA DEL RAT
   */
  const extraerDatosEmpresa = useCallback((ratData) => {
    if (!ratData?.responsable) return null;

    const datos = {
      razon_social: ratData.responsable.razonSocial || '',
      rut: ratData.responsable.rut || '',
      email_empresa: ratData.responsable.email || '',
      telefono_empresa: ratData.responsable.telefono || '',
      direccion_empresa: ratData.responsable.direccion || '',
      dpo_nombre: ratData.responsable.nombre || '',
      dpo_email: ratData.responsable.email || '',
      dpo_telefono: ratData.responsable.telefono || ''
    };

    // Solo retornar si hay datos mínimos
    const tieneMinimos = datos.razon_social || datos.rut || datos.email_empresa;
    return tieneMinimos ? datos : null;
  }, []);

  /**
   * 💾 GUARDADO AUTOMÁTICO CON DEBOUNCE
   */
  const guardarAutomaticamente = useCallback((ratData) => {
    if (!autoGuardar) return;

    const datosEmpresa = extraerDatosEmpresa(ratData);
    if (!datosEmpresa) return;

    // Implementar debounce simple
    const timeoutId = setTimeout(() => {
      guardarDatosEmpresa(datosEmpresa, {
        persistir,
        fuente: 'auto_hook',
        notificar: notificarCambios
      });

      if (notificarCambios) {
        //console.log('💾 Datos empresa guardados automáticamente');
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [autoGuardar, extraerDatosEmpresa, debounceMs, persistir, notificarCambios]);

  /**
   * 📖 CARGAR DATOS AL INICIALIZAR
   */
  useEffect(() => {
    if (!autoCargar || !setRatData) return;

    // Solo cargar si no hay datos ya
    const hayDatosActuales = ratData?.responsable?.razonSocial || 
                            ratData?.responsable?.email || 
                            ratData?.responsable?.rut;

    if (hayDatosActuales) {
      if (notificarCambios) {
        //console.log('📖 Datos empresa ya presentes, omitiendo carga automática');
      }
      return;
    }

    const resultado = cargarDatosEmpresa({ preferirSesion: true });
    
    if (resultado.success && resultado.datos) {
      if (notificarCambios) {
        //console.log('📖 Cargando datos empresa desde persistencia (hook)');
      }

      setRatData(prevData => ({
        ...prevData,
        responsable: {
          ...prevData.responsable,
          razonSocial: resultado.datos.razon_social || '',
          rut: resultado.datos.rut || '',
          direccion: resultado.datos.direccion_empresa || '',
          nombre: resultado.datos.dpo_nombre || '',
          email: resultado.datos.email_empresa || '',
          telefono: resultado.datos.telefono_empresa || ''
        }
      }));

      if (notificarCambios) {
        //console.log('✅ Datos empresa restaurados automáticamente');
      }
    }
  }, [autoCargar, setRatData, notificarCambios]);

  /**
   * 🔄 GUARDADO AUTOMÁTICO CUANDO CAMBIAN LOS DATOS
   */
  useEffect(() => {
    if (!ratData?.responsable) return;

    const cleanup = guardarAutomaticamente(ratData);
    return cleanup;
  }, [ratData?.responsable, guardarAutomaticamente]);

  /**
   * 💾 FUNCIÓN MANUAL DE GUARDADO
   */
  const guardarManualmente = useCallback(() => {
    const datosEmpresa = extraerDatosEmpresa(ratData);
    
    if (!datosEmpresa) {
      return { success: false, message: 'No hay datos empresa para guardar' };
    }

    const resultado = guardarDatosEmpresa(datosEmpresa, {
      persistir: true,
      fuente: 'manual_hook',
      notificar: true
    });

    if (notificarCambios) {
      //console.log(resultado.success ? 
        '✅ Datos empresa guardados manualmente' : 
        '❌ Error guardando datos empresa manualmente'
      );
    }

    return resultado;
  }, [ratData, extraerDatosEmpresa, notificarCambios]);

  /**
   * 📖 FUNCIÓN MANUAL DE CARGA
   */
  const cargarManualmente = useCallback(() => {
    const resultado = cargarDatosEmpresa({ incluirMetadata: true });
    
    if (resultado.success && resultado.datos && setRatData) {
      setRatData(prevData => ({
        ...prevData,
        responsable: {
          ...prevData.responsable,
          razonSocial: resultado.datos.razon_social || '',
          rut: resultado.datos.rut || '',
          direccion: resultado.datos.direccion_empresa || '',
          nombre: resultado.datos.dpo_nombre || '',
          email: resultado.datos.email_empresa || '',
          telefono: resultado.datos.telefono_empresa || ''
        }
      }));

      if (notificarCambios) {
        //console.log('✅ Datos empresa cargados manualmente');
      }
    }

    return resultado;
  }, [setRatData, notificarCambios]);

  /**
   * 🧹 FUNCIÓN DE LIMPIEZA
   */
  const limpiarDatos = useCallback((soloSesion = false) => {
    const resultado = {
      limpiarDatos: (opciones) => {
        // Limpiar storage
        const limpiezaResult = require('../utils/datosEmpresaPersistence').limpiarDatosEmpresa(opciones);
        
        // Limpiar estado actual si se solicita
        if (setRatData && !soloSesion) {
          setRatData(prevData => ({
            ...prevData,
            responsable: {
              razonSocial: '',
              rut: '',
              direccion: '',
              nombre: '',
              email: '',
              telefono: ''
            }
          }));
        }

        if (notificarCambios) {
          //console.log('🧹 Datos empresa limpiados (hook)');
        }

        return limpiezaResult;
      }
    };

    return resultado.limpiarDatos({ soloSesion });
  }, [setRatData, notificarCambios]);

  /**
   * ✅ VERIFICAR SI EXISTEN DATOS
   */
  const verificarExistencia = useCallback(() => {
    return existenDatosEmpresa();
  }, []);

  /**
   * 📊 OBTENER ESTADÍSTICAS
   */
  const obtenerEstadisticas = useCallback(() => {
    const stats = require('../utils/datosEmpresaPersistence').obtenerEstadisticasDatos();
    
    return {
      ...stats,
      datos_actuales: !!extraerDatosEmpresa(ratData),
      hook_activo: true,
      auto_guardar: autoGuardar,
      auto_cargar: autoCargar
    };
  }, [ratData, autoGuardar, autoCargar, extraerDatosEmpresa]);

  // Retornar funciones y estado
  return {
    // Funciones principales
    guardarManualmente,
    cargarManualmente,
    limpiarDatos,
    
    // Información de estado
    hayDatosPersistentes: verificarExistencia(),
    hayDatosActuales: !!extraerDatosEmpresa(ratData),
    estadisticas: obtenerEstadisticas(),
    
    // Configuración actual
    configuracion: {
      autoGuardar,
      autoCargar,
      debounceMs,
      persistir,
      notificarCambios
    }
  };
};

export default usePersistentEmpresaData;