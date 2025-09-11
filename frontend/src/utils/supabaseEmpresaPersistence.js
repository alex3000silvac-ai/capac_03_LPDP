/**
 * 💾 SQL SERVER EMPRESA PERSISTENCE - SISTEMA 100% SQL SERVER
 * 
 * PERSISTENCIA UNIFICADA - SOLO SQL SERVER
 * Sin validaciones estrictas - Guardado progresivo en tiempo real
 */

import { sqlServerClient } from '../config/sqlServerClient';

class SqlServerEmpresaPersistence {
  constructor() {
    this.tableName = 'organizaciones';
    this.listeners = new Set();
    this.currentTenantId = 'demo'; // Default tenant
  }

  /**
   * 💾 GUARDAR DATOS DE EMPRESA - PERSISTENCIA UNIFICADA SQL SERVER
   * Sin validaciones estrictas - Guardado progresivo
   */
  async guardarDatosEmpresa(datosEmpresa, opciones = {}) {
    const {
      tenantId = this.currentTenantId,
      templateName = 'default_company_data',
      notificar = true
    } = opciones;

    console.log('🟢 PERSISTENCIA SQL SERVER:', datosEmpresa);
    
    // SIN VALIDACIÓN ESTRICTA - Guardado progresivo
    console.log('✅ GUARDADO PROGRESIVO - Sin validaciones restrictivas');
    
    try {
      // INCLUIR TODOS LOS METADATOS PARA QUE LA CONSULTA POSTERIOR LOS ENCUENTRE
      const registro = {
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

      // UPSERT DIRECTO SQL SERVER - Buscar existente por tenant_id + template_name
      const { data: existing, error: selectError } = await sqlServerClient
        .from(this.tableName)
        .select('id')
        .eq('tenant_id', tenantId)
        .eq('template_name', templateName)
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();

      if (selectError && selectError.code !== 'PGRST116') {
        throw selectError;
      }

      let result;
      if (existing) {
        // ACTUALIZAR SQL SERVER
        const { data, error } = await sqlServerClient
          .from(this.tableName)
          .update(registro)
          .eq('id', existing.id)
          .select()
          .single();
        
        if (error) throw error;
        result = data;
        console.log('🔄 UPDATE SQL SERVER exitoso:', result);
      } else {
        // INSERTAR NUEVO SQL SERVER
        const { data, error } = await sqlServerClient
          .from(this.tableName)
          .insert([registro])
          .select()
          .single();
        
        if (error) throw error;
        result = data;
        console.log('➕ INSERT SQL SERVER exitoso:', result);
      }

      if (notificar) {
        this.notificarCambio('datos_guardados', result);
      }

      return { success: true, datos: result };

    } catch (error) {
      console.error('❌ ERROR persistencia SQL Server:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 📖 CARGAR DATOS DE EMPRESA - SOLO SQL SERVER
   */
  async cargarDatosEmpresa(opciones = {}) {
    const {
      tenantId = this.currentTenantId,
      templateName = 'default_company_data'
    } = opciones;

    console.log('🔵 CARGAR desde SQL SERVER unificado');
    
    try {
      const { data, error } = await sqlServerClient
        .from(this.tableName)
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('template_name', templateName)
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('📖 No se encontraron datos empresa en SQL Server');
          return { success: false, datos: null };
        }
        throw error;
      }

      if (data) {
        // Convertir de formato BD a formato componente
        const datosFormateados = {
          razon_social: data.razon_social || '',
          rut: data.rut_empresa || '',
          email_empresa: data.email_empresa || '',
          telefono_empresa: data.telefono_empresa || '',
          direccion_empresa: data.direccion_empresa || '',
          dpo_nombre: data.dpo_nombre || '',
          dpo_email: data.dpo_email || '',
          dpo_telefono: data.dpo_telefono || ''
        };

        console.log('🔶 DEBUG: Datos cargados desde SQL Server:', datosFormateados);
        return { success: true, datos: datosFormateados };
      }

      return { success: false, datos: null };

    } catch (error) {
      console.error('❌ ERROR cargando desde SQL Server:', error);
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
      // Usar SQL Server en lugar de Supabase
      const response = await this.sqlServerClient.put(
        `${this.apiUrl}/organizaciones`,
        {
          is_active: false,
          template_name: templateName
        }
      );

      if (!response.ok && response.status !== 200) {
        throw new Error(`Error actualizando datos: ${response.statusText}`);
      }

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
const sqlServerEmpresaPersistence = new SqlServerEmpresaPersistence();

// Exports para uso desde componentes - SOLO SUPABASE
export const guardarDatosEmpresa = (datos, opciones) => 
  sqlServerEmpresaPersistence.guardarDatosEmpresa(datos, opciones);

export const cargarDatosEmpresa = (opciones) => 
  sqlServerEmpresaPersistence.cargarDatosEmpresa(opciones);

export const actualizarDatosEmpresa = (datos, opciones) => 
  sqlServerEmpresaPersistence.actualizarDatosEmpresa(datos, opciones);

export const limpiarDatosEmpresa = (opciones) => 
  sqlServerEmpresaPersistence.limpiarDatos(opciones);

export const existenDatosEmpresa = (opciones) => 
  sqlServerEmpresaPersistence.existenDatos(opciones);

export const autoCompletarFormulario = (setValues, opciones) => 
  sqlServerEmpresaPersistence.autoCompletarFormulario(setValues, opciones);

export const agregarListenerDatosEmpresa = (callback) => 
  sqlServerEmpresaPersistence.agregarListener(callback);

export default sqlServerEmpresaPersistence;