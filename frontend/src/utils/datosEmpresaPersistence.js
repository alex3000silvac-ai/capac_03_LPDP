/**
 * 💾 PERSISTENCIA DE DATOS DE EMPRESA - FIX CRÍTICO
 * 
 * Soluciona la pérdida de datos de empresa entre navegación
 * Mantiene los datos automáticamente sin duplicar digitación
 */

class DatosEmpresaPersistence {
  constructor() {
    this.storageKey = 'lpdp_datos_empresa_persistentes';
    this.sessionKey = 'lpdp_sesion_actual_empresa';
    this.listeners = new Set();
  }

  /**
   * 💾 GUARDAR DATOS DE EMPRESA
   */
  guardarDatosEmpresa(datosEmpresa, opciones = {}) {
    const {
      persistir = true,          // Guardar en localStorage permanente
      soloSesion = false,       // Solo sessionStorage (se borra al cerrar)
      notificar = true          // Notificar a listeners
    } = opciones;

    console.log('🔴 DEBUG guardarDatosEmpresa llamado con:', datosEmpresa);
    
    // VALIDACIÓN OBLIGATORIA: TODOS LOS CAMPOS COMPLETOS
    const validacion = this.validarDatos(datosEmpresa);
    if (!validacion.valid) {
      console.log('❌ DEBUG: Validación fallida:', validacion);
      return { 
        success: false, 
        error: validacion.error,
        camposFaltantes: validacion.camposFaltantes || []
      };
    }
    
    try {
      const datosParaGuardar = {
        ...datosEmpresa,
        timestamp: Date.now(),
        version: '1.0',
        fuente: opciones.fuente || 'manual'
      };

      // Guardar en sessionStorage (siempre)
      sessionStorage.setItem(this.sessionKey, JSON.stringify(datosParaGuardar));

      // Guardar en localStorage (permanente) si se solicita
      if (persistir && !soloSesion) {
        localStorage.setItem(this.storageKey, JSON.stringify(datosParaGuardar));
        console.log('🟢 DEBUG: Guardado en localStorage con key:', this.storageKey);
        console.log('🟢 DEBUG: Datos guardados:', datosParaGuardar);
      }

      // Notificar cambio a listeners
      if (notificar) {
        this.notificarCambio('datos_guardados', datosParaGuardar);
      }

      // Log éxito a archivo TXT
      if (window.cumulativeErrorLogger) {
        window.cumulativeErrorLogger.logMediumError('DATOS_EMPRESA_SAVE_SUCCESS', {
          message: 'Datos empresa guardados exitosamente',
          persistir: persistir,
          solo_sesion: soloSesion,
          campos_guardados: Object.keys(datosEmpresa),
          timestamp: new Date().toISOString()
        }, 'DATOS_EMPRESA_PERSISTENCE');
      }
      
      return { success: true, datos: datosParaGuardar };

    } catch (error) {
      // Log error crítico a archivo TXT
      if (window.cumulativeErrorLogger) {
        window.cumulativeErrorLogger.logCriticalError('DATOS_EMPRESA_SAVE_FAILED', {
          error: error.message,
          stack: error.stack,
          datos_intentados: datosEmpresa,
          opciones: opciones,
          timestamp: new Date().toISOString()
        }, 'DATOS_EMPRESA_PERSISTENCE');
      }
      return { success: false, error: error.message };
    }
  }

  /**
   * 📖 CARGAR DATOS DE EMPRESA
   */
  cargarDatosEmpresa(preferencias = {}) {
    const {
      preferirSesion = true,     // Preferir datos de sesión (más recientes)
      soloSesion = false,       // Solo buscar en sessionStorage
      incluirMetadata = false   // Incluir timestamp, fuente, etc.
    } = preferencias;

    console.log('🔵 DEBUG cargarDatosEmpresa llamado');
    
    try {
      let datosEncontrados = null;
      let fuente = null;

      // Buscar primero en sessionStorage (datos más recientes)
      if (preferirSesion) {
        const datosSesion = sessionStorage.getItem(this.sessionKey);
        if (datosSesion) {
          datosEncontrados = JSON.parse(datosSesion);
          fuente = 'session';
        }
      }

      // Si no hay datos en sesión y no es solo sesión, buscar en localStorage
      if (!datosEncontrados && !soloSesion) {
        const datosLocales = localStorage.getItem(this.storageKey);
        if (datosLocales) {
          datosEncontrados = JSON.parse(datosLocales);
          fuente = 'localStorage';
        }
      }

      if (datosEncontrados) {
        console.log('🔶 DEBUG: Datos encontrados en storage:', datosEncontrados);
        // Validar datos antes de retornar
        const datosValidos = this.validarDatos(datosEncontrados);
        console.log('🔶 DEBUG: Resultado validación:', datosValidos);
        
        if (datosValidos.valid) {
          //console.log(`📖 Datos empresa cargados desde ${fuente}`);
          
          const resultado = incluirMetadata ? 
            { ...datosEncontrados, _metadata: { fuente, cargadoEn: Date.now() } } :
            datosEncontrados;

          return { success: true, datos: resultado, fuente };
        } else {
          // Log warning a archivo TXT acumulativo
          if (window.cumulativeErrorLogger) {
            window.cumulativeErrorLogger.logMediumError('DATOS_EMPRESA_INVALID', {
              message: 'Datos empresa inválidos encontrados, conservando parciales',
              datos: datosEncontrados,
              validacion: datosValidos,
              timestamp: new Date().toISOString()
            }, 'DATOS_EMPRESA_PERSISTENCE');
          }
          // NO limpiar - conservar datos parciales
        }
      }

      //console.log('📖 No se encontraron datos empresa guardados');
      return { success: false, datos: null, fuente: null };

    } catch (error) {
      // Log error a archivo TXT acumulativo
      if (window.cumulativeErrorLogger) {
        window.cumulativeErrorLogger.logCriticalError('DATOS_EMPRESA_LOAD_FAILED', {
          error: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString()
        }, 'DATOS_EMPRESA_PERSISTENCE');
      }
      return { success: false, error: error.message };
    }
  }

  /**
   * ✅ VALIDAR ESTRUCTURA DE DATOS
   */
  validarDatos(datos) {
    const camposObligatorios = [
      'razon_social',
      'rut', 
      'email_empresa',
      'direccion_empresa',
      'dpo_nombre'
    ];

    const camposOpcionales = [
      'telefono_empresa',
      'dpo_email',
      'dpo_telefono'
    ];

    try {
      // Validar que sea un objeto
      if (!datos || typeof datos !== 'object') {
        return { valid: false, error: 'Datos no es un objeto válido' };
      }

      // VALIDACIÓN ESTRICTA: TODOS LOS CAMPOS OBLIGATORIOS
      const camposFaltantes = [];
      
      camposObligatorios.forEach(campo => {
        if (!datos[campo] || typeof datos[campo] !== 'string' || datos[campo].trim().length === 0) {
          camposFaltantes.push(campo);
        }
      });
      
      if (camposFaltantes.length > 0) {
        return { 
          valid: false, 
          error: `Campos obligatorios faltantes: ${camposFaltantes.join(', ')}`,
          camposFaltantes: camposFaltantes
        };
      }

      // Validar formato RUT básico
      if (datos.rut && !this.validarFormatoRUT(datos.rut)) {
        return { valid: false, error: 'Formato de RUT inválido' };
      }

      // Validar formato email
      if (datos.email_empresa && !this.validarEmail(datos.email_empresa)) {
        return { valid: false, error: 'Formato de email inválido' };
      }

      return { valid: true };

    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  /**
   * 📧 VALIDAR EMAIL
   */
  validarEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * 🆔 VALIDAR FORMATO RUT
   */
  validarFormatoRUT(rut) {
    // Formato básico: XX.XXX.XXX-X o XXXXXXXX-X
    const rutRegex = /^(\d{1,2}\.?\d{3}\.?\d{3}-[\dkK]|\d{7,8}-[\dkK])$/;
    return rutRegex.test(rut.replace(/\s/g, ''));
  }

  /**
   * 🔄 ACTUALIZAR DATOS EXISTENTES
   */
  actualizarDatosEmpresa(nuevosdatos, opciones = {}) {
    const datosActuales = this.cargarDatosEmpresa();
    
    if (datosActuales.success) {
      // Merge inteligente manteniendo datos existentes válidos
      const datosActualizados = {
        ...datosActuales.datos,
        ...nuevosdatos,
        timestamp: Date.now(),
        ultima_actualizacion: new Date().toISOString()
      };

      return this.guardarDatosEmpresa(datosActualizados, opciones);
    } else {
      // No hay datos previos, guardar nuevos
      return this.guardarDatosEmpresa(nuevosdatos, opciones);
    }
  }

  /**
   * 🧹 LIMPIAR DATOS
   */
  limpiarDatos(opciones = {}) {
    const { soloSesion = false, notificar = true } = opciones;

    try {
      // Limpiar sessionStorage
      sessionStorage.removeItem(this.sessionKey);

      // Limpiar localStorage si no es solo sesión
      if (!soloSesion) {
        localStorage.removeItem(this.storageKey);
      }

      if (notificar) {
        this.notificarCambio('datos_limpiados', null);
      }

      //console.log('🧹 Datos empresa limpiados');
      return { success: true };

    } catch (error) {
      console.error('❌ Error limpiando datos empresa:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🔍 EXISTE DATOS
   */
  existenDatos(preferencias = {}) {
    const resultado = this.cargarDatosEmpresa(preferencias);
    return resultado.success && resultado.datos !== null;
  }

  /**
   * 👂 AGREGAR LISTENER PARA CAMBIOS
   */
  agregarListener(callback) {
    this.listeners.add(callback);
    
    // Retornar función para remover listener
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * 📢 NOTIFICAR CAMBIO A LISTENERS
   */
  notificarCambio(tipo, datos) {
    this.listeners.forEach(callback => {
      try {
        callback({ tipo, datos, timestamp: Date.now() });
      } catch (error) {
        console.error('❌ Error en listener de datos empresa:', error);
      }
    });
  }

  /**
   * 📊 OBTENER ESTADÍSTICAS
   */
  obtenerEstadisticas() {
    const datosLocal = localStorage.getItem(this.storageKey);
    const datosSesion = sessionStorage.getItem(this.sessionKey);

    return {
      hay_datos_permanentes: !!datosLocal,
      hay_datos_sesion: !!datosSesion,
      ultimo_guardado: datosLocal ? JSON.parse(datosLocal).timestamp : null,
      sesion_actual: datosSesion ? JSON.parse(datosSesion).timestamp : null,
      listeners_activos: this.listeners.size,
      storage_disponible: this.verificarStorageDisponible()
    };
  }

  /**
   * ✅ VERIFICAR STORAGE DISPONIBLE
   */
  verificarStorageDisponible() {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return { localStorage: true, sessionStorage: true };
    } catch (error) {
      return { localStorage: false, sessionStorage: true };
    }
  }

  /**
   * 📋 AUTO-COMPLETAR FORMULARIO
   */
  autoCompletarFormulario(setValues, opciones = {}) {
    const { 
      sobreescribir = false,     // Sobreescribir valores existentes
      notificarUsuario = true    // Mostrar notificación al usuario
    } = opciones;

    const resultado = this.cargarDatosEmpresa();
    
    if (resultado.success && resultado.datos) {
      const campos = {
        razon_social: resultado.datos.razon_social,
        rut: resultado.datos.rut,
        email_empresa: resultado.datos.email_empresa,
        telefono_empresa: resultado.datos.telefono_empresa || '',
        direccion_empresa: resultado.datos.direccion_empresa || '',
        dpo_nombre: resultado.datos.dpo_nombre || '',
        dpo_email: resultado.datos.dpo_email || '',
        dpo_telefono: resultado.datos.dpo_telefono || ''
      };

      // Aplicar valores al formulario
      Object.entries(campos).forEach(([campo, valor]) => {
        if (valor && (sobreescribir || !setValues[campo])) {
          if (typeof setValues === 'function') {
            setValues(prevState => ({ ...prevState, [campo]: valor }));
          } else if (setValues[campo]) {
            setValues[campo](valor);
          }
        }
      });

      if (notificarUsuario) {
        //console.log('✅ Formulario auto-completado con datos guardados');
        // Aquí podrías mostrar una notificación toast al usuario
      }

      return { success: true, camposCompletados: Object.keys(campos) };
    }

    return { success: false, message: 'No hay datos para auto-completar' };
  }
}

// Instancia global
const datosEmpresaPersistence = new DatosEmpresaPersistence();

// Exports para uso desde componentes
export const guardarDatosEmpresa = (datos, opciones) => 
  datosEmpresaPersistence.guardarDatosEmpresa(datos, opciones);

export const cargarDatosEmpresa = (preferencias) => 
  datosEmpresaPersistence.cargarDatosEmpresa(preferencias);

export const actualizarDatosEmpresa = (datos, opciones) => 
  datosEmpresaPersistence.actualizarDatosEmpresa(datos, opciones);

export const limpiarDatosEmpresa = (opciones) => 
  datosEmpresaPersistence.limpiarDatos(opciones);

export const existenDatosEmpresa = (preferencias) => 
  datosEmpresaPersistence.existenDatos(preferencias);

export const autoCompletarFormulario = (setValues, opciones) => 
  datosEmpresaPersistence.autoCompletarFormulario(setValues, opciones);

export const agregarListenerDatosEmpresa = (callback) => 
  datosEmpresaPersistence.agregarListener(callback);

export const obtenerEstadisticasDatos = () => 
  datosEmpresaPersistence.obtenerEstadisticas();

export default datosEmpresaPersistence;