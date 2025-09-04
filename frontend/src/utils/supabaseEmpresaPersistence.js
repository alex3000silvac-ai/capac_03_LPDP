/**
 * 💾 SUPABASE EMPRESA PERSISTENCE - SISTEMA 100% SUPABASE
 * 
 * Reemplaza completamente localStorage - TODO desde Supabase
 * Usa tabla company_data_templates para persistencia
 */

import { supabase } from '../config/supabaseClient';

class SupabaseEmpresaPersistence {
  constructor() {
    this.tableName = 'company_data_templates';
    this.listeners = new Set();
    this.currentTenantId = 1; // Default tenant
  }

  /**
   * 💾 GUARDAR DATOS DE EMPRESA - SOLO SUPABASE
   */
  async guardarDatosEmpresa(datosEmpresa, opciones = {}) {
    const {
      tenantId = this.currentTenantId,
      templateName = 'default_company_data',
      notificar = true
    } = opciones;

    console.log('🔴 DEBUG guardarDatosEmpresa SUPABASE:', datosEmpresa);
    
    // VALIDACIÓN OBLIGATORIA
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
        tenant_id: tenantId,
        template_name: templateName,
        razon_social: datosEmpresa.razon_social,
        rut_empresa: datosEmpresa.rut,
        email_empresa: datosEmpresa.email_empresa,
        telefono_empresa: datosEmpresa.telefono_empresa || '',
        direccion_empresa: datosEmpresa.direccion_empresa,
        dpo_nombre: datosEmpresa.dpo_nombre,
        dpo_email: datosEmpresa.dpo_email || '',
        dpo_telefono: datosEmpresa.dpo_telefono || '',
        is_active: true,
        updated_at: new Date().toISOString()
      };

      // Buscar si ya existe un template para este tenant (sin RLS por ahora)
      const { data: existing, error: selectError } = await supabase
        .from(this.tableName)
        .select('id')
        .eq('template_name', templateName)
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();

      if (selectError && selectError.code !== 'PGRST116') {
        throw selectError;
      }

      let result;
      if (existing) {
        // Actualizar existente
        const { data, error } = await supabase
          .from(this.tableName)
          .update(datosParaGuardar)
          .eq('id', existing.id)
          .select()
          .single();
        
        if (error) throw error;
        result = data;
      } else {
        // Insertar nuevo
        const { data, error } = await supabase
          .from(this.tableName)
          .insert([datosParaGuardar])
          .select()
          .single();
        
        if (error) throw error;
        result = data;
      }

      console.log('🟢 DEBUG: Guardado en Supabase exitoso:', result);

      if (notificar) {
        this.notificarCambio('datos_guardados', result);
      }

      return { success: true, datos: result };

    } catch (error) {
      console.error('❌ ERROR guardando en Supabase:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 📖 CARGAR DATOS DE EMPRESA - SOLO SUPABASE
   */
  async cargarDatosEmpresa(opciones = {}) {
    const {
      tenantId = this.currentTenantId,
      templateName = 'default_company_data'
    } = opciones;

    console.log('🔵 DEBUG cargarDatosEmpresa SUPABASE');
    
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('template_name', templateName)
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('📖 No se encontraron datos empresa en Supabase');
          return { success: false, datos: null };
        }
        throw error;
      }

      if (data) {
        // Convertir de formato BD a formato componente
        const datosFormateados = {
          razon_social: data.razon_social,
          rut: data.rut_empresa,
          email_empresa: data.email_empresa,
          telefono_empresa: data.telefono_empresa || '',
          direccion_empresa: data.direccion_empresa,
          dpo_nombre: data.dpo_nombre,
          dpo_email: data.dpo_email || '',
          dpo_telefono: data.dpo_telefono || ''
        };

        console.log('🔶 DEBUG: Datos cargados desde Supabase:', datosFormateados);
        return { success: true, datos: datosFormateados };
      }

      return { success: false, datos: null };

    } catch (error) {
      console.error('❌ ERROR cargando desde Supabase:', error);
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

    try {
      if (!datos || typeof datos !== 'object') {
        return { valid: false, error: 'Datos no es un objeto válido' };
      }

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
    const rutRegex = /^(\d{1,2}\.?\d{3}\.?\d{3}-[\dkK]|\d{7,8}-[\dkK])$/;
    return rutRegex.test(rut.replace(/\s/g, ''));
  }

  /**
   * 🔄 ACTUALIZAR DATOS EXISTENTES
   */
  async actualizarDatosEmpresa(nuevosdatos, opciones = {}) {
    const datosActuales = await this.cargarDatosEmpresa(opciones);
    
    if (datosActuales.success && datosActuales.datos) {
      const datosActualizados = {
        ...datosActuales.datos,
        ...nuevosdatos
      };

      return await this.guardarDatosEmpresa(datosActualizados, opciones);
    } else {
      return await this.guardarDatosEmpresa(nuevosdatos, opciones);
    }
  }

  /**
   * 🧹 LIMPIAR DATOS
   */
  async limpiarDatos(opciones = {}) {
    const {
      tenantId = this.currentTenantId,
      templateName = 'default_company_data',
      notificar = true
    } = opciones;

    try {
      const { error } = await supabase
        .from(this.tableName)
        .update({ is_active: false })
        .eq('template_name', templateName);

      if (error) throw error;

      if (notificar) {
        this.notificarCambio('datos_limpiados', null);
      }

      console.log('🧹 Datos empresa limpiados en Supabase');
      return { success: true };

    } catch (error) {
      console.error('❌ Error limpiando datos empresa:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🔍 EXISTE DATOS
   */
  async existenDatos(opciones = {}) {
    const resultado = await this.cargarDatosEmpresa(opciones);
    return resultado.success && resultado.datos !== null;
  }

  /**
   * 👂 AGREGAR LISTENER PARA CAMBIOS
   */
  agregarListener(callback) {
    this.listeners.add(callback);
    
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
   * 📋 AUTO-COMPLETAR FORMULARIO DESDE SUPABASE
   */
  async autoCompletarFormulario(setValues, opciones = {}) {
    const { 
      sobreescribir = false,
      notificarUsuario = true
    } = opciones;

    const resultado = await this.cargarDatosEmpresa(opciones);
    
    if (resultado.success && resultado.datos) {
      const campos = resultado.datos;

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
        console.log('✅ Formulario auto-completado desde Supabase');
      }

      return { success: true, camposCompletados: Object.keys(campos) };
    }

    return { success: false, message: 'No hay datos para auto-completar' };
  }
}

// Instancia global
const supabaseEmpresaPersistence = new SupabaseEmpresaPersistence();

// Exports para uso desde componentes - SOLO SUPABASE
export const guardarDatosEmpresa = (datos, opciones) => 
  supabaseEmpresaPersistence.guardarDatosEmpresa(datos, opciones);

export const cargarDatosEmpresa = (opciones) => 
  supabaseEmpresaPersistence.cargarDatosEmpresa(opciones);

export const actualizarDatosEmpresa = (datos, opciones) => 
  supabaseEmpresaPersistence.actualizarDatosEmpresa(datos, opciones);

export const limpiarDatosEmpresa = (opciones) => 
  supabaseEmpresaPersistence.limpiarDatos(opciones);

export const existenDatosEmpresa = (opciones) => 
  supabaseEmpresaPersistence.existenDatos(opciones);

export const autoCompletarFormulario = (setValues, opciones) => 
  supabaseEmpresaPersistence.autoCompletarFormulario(setValues, opciones);

export const agregarListenerDatosEmpresa = (callback) => 
  supabaseEmpresaPersistence.agregarListener(callback);

export default supabaseEmpresaPersistence;