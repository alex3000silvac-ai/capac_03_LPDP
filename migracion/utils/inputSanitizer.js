/**
 * Utilidad de sanitización y validación de entrada
 * Previene XSS, SQL Injection y otros ataques
 */

class InputSanitizer {
  /**
   * Sanitiza strings removiendo HTML y scripts peligrosos
   */
  static sanitizeString(input) {
    if (!input) return '';
    
    // Convertir a string si no lo es
    const str = String(input);
    
    // Remover tags HTML y scripts
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .replace(/[<>'"]/g, (char) => {
        const entities = {
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#x27;'
        };
        return entities[char];
      })
      .trim();
  }

  /**
   * Valida y sanitiza RUT chileno
   */
  static validateRUT(rut) {
    if (!rut) return { valid: false, error: 'RUT requerido' };
    
    // Limpiar RUT
    const cleaned = rut.replace(/[^\dkK-]/g, '').toUpperCase();
    
    // Validar formato
    const rutRegex = /^\d{1,2}\d{3}\d{3}-[\dkK]$/;
    if (!rutRegex.test(cleaned.replace(/\./g, ''))) {
      return { valid: false, error: 'Formato RUT inválido' };
    }
    
    // Validar dígito verificador
    const rutParts = cleaned.split('-');
    const rutNumber = rutParts[0];
    const dv = rutParts[1];
    
    let suma = 0;
    let multiplo = 2;
    
    for (let i = rutNumber.length - 1; i >= 0; i--) {
      suma += parseInt(rutNumber[i]) * multiplo;
      multiplo = multiplo === 7 ? 2 : multiplo + 1;
    }
    
    const expectedDV = 11 - (suma % 11);
    const calculatedDV = expectedDV === 11 ? '0' : expectedDV === 10 ? 'K' : String(expectedDV);
    
    if (calculatedDV !== dv) {
      return { valid: false, error: 'RUT inválido' };
    }
    
    return { valid: true, value: cleaned };
  }

  /**
   * Valida y sanitiza email
   */
  static validateEmail(email) {
    if (!email) return { valid: false, error: 'Email requerido' };
    
    const cleaned = email.toLowerCase().trim();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!emailRegex.test(cleaned)) {
      return { valid: false, error: 'Email inválido' };
    }
    
    // Prevenir emails con caracteres peligrosos
    if (cleaned.includes('<') || cleaned.includes('>') || cleaned.includes('"')) {
      return { valid: false, error: 'Email contiene caracteres no permitidos' };
    }
    
    return { valid: true, value: cleaned };
  }

  /**
   * Sanitiza nombre de empresa/organización
   */
  static sanitizeCompanyName(name) {
    if (!name) return '';
    
    // Permitir solo caracteres seguros
    return name
      .replace(/[<>'"]/g, '')
      .replace(/script/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .trim()
      .substring(0, 200); // Limitar longitud
  }

  /**
   * Valida y sanitiza teléfono chileno
   */
  static validatePhone(phone) {
    if (!phone) return { valid: false, error: 'Teléfono requerido' };
    
    // Limpiar número
    const cleaned = phone.replace(/[^\d+]/g, '');
    
    // Validar formato chileno
    const phoneRegex = /^(\+?56)?[29]\d{8}$/;
    
    if (!phoneRegex.test(cleaned)) {
      return { valid: false, error: 'Teléfono inválido (formato chileno)' };
    }
    
    return { valid: true, value: cleaned };
  }

  /**
   * Sanitiza texto largo (descripciones, comentarios)
   */
  static sanitizeLongText(text, maxLength = 5000) {
    if (!text) return '';
    
    return this.sanitizeString(text).substring(0, maxLength);
  }

  /**
   * Valida y sanitiza URL
   */
  static validateURL(url) {
    if (!url) return { valid: false, error: 'URL requerida' };
    
    try {
      const urlObj = new URL(url);
      
      // Solo permitir http y https
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return { valid: false, error: 'Solo se permiten URLs HTTP/HTTPS' };
      }
      
      // Prevenir javascript: y data: URLs
      if (url.includes('javascript:') || url.includes('data:')) {
        return { valid: false, error: 'URL no segura' };
      }
      
      return { valid: true, value: url };
    } catch {
      return { valid: false, error: 'URL inválida' };
    }
  }

  /**
   * Sanitiza objeto completo recursivamente
   */
  static sanitizeObject(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    
    const sanitized = {};
    
    for (const [key, value] of Object.entries(obj)) {
      // Sanitizar la clave también
      const sanitizedKey = this.sanitizeString(key);
      
      if (typeof value === 'string') {
        sanitized[sanitizedKey] = this.sanitizeString(value);
      } else if (Array.isArray(value)) {
        sanitized[sanitizedKey] = value.map(item => 
          typeof item === 'string' ? this.sanitizeString(item) : item
        );
      } else if (typeof value === 'object' && value !== null) {
        sanitized[sanitizedKey] = this.sanitizeObject(value);
      } else {
        sanitized[sanitizedKey] = value;
      }
    }
    
    return sanitized;
  }

  /**
   * Valida formato de fecha
   */
  static validateDate(date) {
    if (!date) return { valid: false, error: 'Fecha requerida' };
    
    const dateObj = new Date(date);
    
    if (isNaN(dateObj.getTime())) {
      return { valid: false, error: 'Fecha inválida' };
    }
    
    // Verificar que la fecha sea razonable (entre 1900 y 2100)
    const year = dateObj.getFullYear();
    if (year < 1900 || year > 2100) {
      return { valid: false, error: 'Fecha fuera de rango válido' };
    }
    
    return { valid: true, value: dateObj.toISOString() };
  }

  /**
   * Previene SQL Injection en parámetros
   */
  static sanitizeSQLParam(param) {
    if (!param) return '';
    
    return String(param)
      .replace(/['";\\]/g, '')
      .replace(/--/g, '')
      .replace(/\/\*/g, '')
      .replace(/\*\//g, '')
      .replace(/xp_/gi, '')
      .replace(/sp_/gi, '')
      .replace(/(union|select|insert|update|delete|drop|create|alter|exec|execute|script|javascript)/gi, '');
  }

  /**
   * Valida y sanitiza número
   */
  static validateNumber(num, min = null, max = null) {
    const parsed = Number(num);
    
    if (isNaN(parsed)) {
      return { valid: false, error: 'Debe ser un número válido' };
    }
    
    if (min !== null && parsed < min) {
      return { valid: false, error: `Debe ser mayor o igual a ${min}` };
    }
    
    if (max !== null && parsed > max) {
      return { valid: false, error: `Debe ser menor o igual a ${max}` };
    }
    
    return { valid: true, value: parsed };
  }

  /**
   * Valida contraseña segura
   */
  static validatePassword(password) {
    if (!password) return { valid: false, error: 'Contraseña requerida' };
    
    const errors = [];
    
    if (password.length < 8) {
      errors.push('Mínimo 8 caracteres');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Al menos una mayúscula');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Al menos una minúscula');
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push('Al menos un número');
    }
    
    if (!/[!@#$%^&*]/.test(password)) {
      errors.push('Al menos un carácter especial (!@#$%^&*)');
    }
    
    if (errors.length > 0) {
      return { valid: false, error: errors.join(', ') };
    }
    
    return { valid: true };
  }

  /**
   * Sanitiza nombre de archivo
   */
  static sanitizeFileName(fileName) {
    if (!fileName) return '';
    
    // Remover caracteres peligrosos y path traversal
    return fileName
      .replace(/[<>:"/\\|?*]/g, '')
      .replace(/\.\./g, '')
      .replace(/^\./, '')
      .substring(0, 255);
  }

  /**
   * Valida tamaño de archivo
   */
  static validateFileSize(sizeInBytes, maxSizeMB = 10) {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    
    if (sizeInBytes > maxSizeBytes) {
      return { valid: false, error: `Archivo muy grande (máximo ${maxSizeMB}MB)` };
    }
    
    return { valid: true };
  }

  /**
   * Valida tipo de archivo
   */
  static validateFileType(fileName, allowedTypes = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png']) {
    const extension = fileName.split('.').pop().toLowerCase();
    
    if (!allowedTypes.includes(extension)) {
      return { valid: false, error: `Tipo de archivo no permitido. Permitidos: ${allowedTypes.join(', ')}` };
    }
    
    return { valid: true };
  }
}

export default InputSanitizer;