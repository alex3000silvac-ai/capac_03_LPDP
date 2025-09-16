/**
 * 📚 SERVICIO ESTÁNDARES Y FUENTES POR INDUSTRIA
 * Fundamentos técnicos, legales y normativos para clasificaciones sectoriales
 * Sistema desarrollado por Jurídica Digital SpA - Estudio especializado
 */

/**
 * 🏛️ FUENTES NORMATIVAS PRINCIPALES
 * Base legal y técnica para clasificación sectorial chilena
 */
export const fuentesNormativas = {
  primarias: [
    {
      codigo: "LEY_21719",
      titulo: "Ley 21.719 - Protección de Datos Personales",
      fecha: "2023-05-04",
      organismo: "Congreso Nacional de Chile",
      relevancia: "Marco legal principal para tratamiento datos personales Chile",
      aplicabilidad: "Todas las industrias y sectores económicos"
    },
    {
      codigo: "CIIU_4_CL",
      titulo: "Clasificación Internacional Industrial Uniforme Rev. 4 - Chile",
      fecha: "2012",
      organismo: "Instituto Nacional de Estadísticas (INE)",
      relevancia: "Clasificación estándar internacional de actividades económicas",
      aplicabilidad: "Base para categorización sectorial del sistema"
    },
    {
      codigo: "CODIGO_TRIBUTARIO",
      titulo: "Código Tributario - Clasificación Actividades Económicas",
      organismo: "Servicio de Impuestos Internos (SII)",
      relevancia: "Clasificación oficial actividades económicas para efectos tributarios",
      aplicabilidad: "Correlación con giros comerciales registrados"
    }
  ],
  
  sectoriales: [
    {
      sector: "FINANCIERO",
      fuentes: [
        {
          codigo: "LEY_BANCOS_CHILE",
          titulo: "DFL N° 3 - Ley General de Bancos",
          organismo: "Comisión para el Mercado Financiero (CMF)",
          relevancia: "Regulación específica sector bancario y financiero"
        },
        {
          codigo: "NCG_CMF_411",
          titulo: "NCG 411 - Norma sobre Modelos de Riesgo de Crédito",
          organismo: "CMF",
          relevancia: "Estándares para scoring crediticio y decisiones automatizadas"
        }
      ]
    },
    {
      sector: "SALUD",
      fuentes: [
        {
          codigo: "CODIGO_SANITARIO",
          titulo: "Código Sanitario - DFL N° 725/1967",
          organismo: "Ministerio de Salud (MINSAL)",
          relevancia: "Marco regulatorio general sector salud"
        },
        {
          codigo: "LEY_20584",
          titulo: "Ley 20.584 - Derechos y Deberes de Pacientes",
          organismo: "MINSAL",
          relevancia: "Protección específica datos sensibles de salud"
        },
        {
          codigo: "DS_466_MINSAL",
          titulo: "Decreto Supremo 466 - Reglamento Laboratorios Clínicos",
          organismo: "MINSAL",
          relevancia: "Requisitos específicos manejo datos genéticos"
        }
      ]
    },
    {
      sector: "EDUCACION",
      fuentes: [
        {
          codigo: "LEY_20370",
          titulo: "Ley General de Educación",
          organismo: "Ministerio de Educación",
          relevancia: "Marco regulatorio sector educacional"
        },
        {
          codigo: "LEY_19628",
          titulo: "Ley 19.628 sobre Protección de la Vida Privada (derogada parcialmente)",
          organismo: "Congreso Nacional",
          relevancia: "Antecedente histórico protección datos estudiantiles"
        }
      ]
    }
  ],

  internacionales: [
    {
      codigo: "GDPR_EU",
      titulo: "Reglamento General de Protección de Datos (RGPD/GDPR)",
      organismo: "Unión Europea",
      relevancia: "Estándar internacional de referencia - buenas prácticas",
      adaptacion_chile: "Inspiración para Ley 21.719, especialmente EIPD y principios"
    },
    {
      codigo: "ISO_27001",
      titulo: "ISO/IEC 27001:2013 - Sistemas de Gestión de Seguridad de la Información",
      organismo: "International Organization for Standardization",
      relevancia: "Estándar internacional para medidas técnicas de seguridad"
    },
    {
      codigo: "NIST_FRAMEWORK",
      titulo: "NIST Cybersecurity Framework",
      organismo: "National Institute of Standards and Technology (USA)",
      relevancia: "Framework técnico para medidas organizativas y técnicas"
    }
  ]
};

/**
 * 🏭 CLASIFICACIÓN SECTORIAL CON FUNDAMENTO TÉCNICO
 * Basado en CIIU Rev. 4 Chile + análisis riesgo sectorial específico
 */
export const clasificacionIndustrial = {
  // SECTOR FINANCIERO - ALTO RIESGO
  financiero: {
    ciiu_codes: ["K64", "K65", "K66"], // Servicios financieros, seguros, fondos
    denominacion_oficial: "Actividades de servicios financieros y de seguros",
    fuente_primaria: "CIIU Rev. 4 - Sección K",
    regulador_sectorial: "Comisión para el Mercado Financiero (CMF)",
    nivel_riesgo_inherente: "ALTO",
    fundamento_riesgo: "Manejo masivo datos financieros sensibles, scoring crediticio, decisiones automatizadas",
    subcategorias: {
      banca: {
        codigo: "K641",
        descripcion: "Intermediación monetaria",
        datos_tipicos: ["scoring_crediticio", "historial_financiero", "ingresos", "patrimonio"],
        regulacion_especifica: "Ley General de Bancos, NCG CMF"
      },
      seguros: {
        codigo: "K651",
        descripcion: "Seguros generales",
        datos_tipicos: ["datos_salud", "antecedentes_riesgo", "siniestros"],
        regulacion_especifica: "DFL N° 251 Ley de Seguros"
      }
    },
    medidas_reforzadas: [
      "Encriptación datos financieros AES-256",
      "Auditorías trimestrales CMF",
      "Registro operaciones críticas",
      "Planes contingencia específicos"
    ]
  },

  // SECTOR SALUD - RIESGO EXTREMO
  salud: {
    ciiu_codes: ["Q86", "Q87", "Q88"], // Actividades de atención de salud humana
    denominacion_oficial: "Actividades de atención de la salud humana",
    fuente_primaria: "CIIU Rev. 4 - Sección Q",
    regulador_sectorial: "Ministerio de Salud (MINSAL)",
    nivel_riesgo_inherente: "EXTREMO",
    fundamento_riesgo: "Datos especialmente sensibles Art. 2 f) Ley 21.719 - salud, genéticos, biométricos",
    subcategorias: {
      laboratorios: {
        codigo: "Q8690",
        descripcion: "Otras actividades de atención de la salud humana",
        datos_tipicos: ["resultados_examenes", "datos_geneticos", "biometricos"],
        regulacion_especifica: "DS 466 MINSAL, Autorización ISP"
      },
      hospitales: {
        codigo: "Q8610",
        descripcion: "Actividades de hospitales y clínicas",
        datos_tipicos: ["historia_clinica", "diagnosticos", "tratamientos"],
        regulacion_especifica: "Ley 20.584 Derechos Pacientes"
      }
    },
    medidas_reforzadas: [
      "EIPD obligatoria para datos genéticos",
      "Consentimiento específico reforzado",
      "Personal certificado para acceso datos",
      "Auditorías MINSAL periódicas"
    ]
  },

  // SECTOR EDUCACIÓN - RIESGO MEDIO-ALTO
  educacion: {
    ciiu_codes: ["P85"], // Enseñanza
    denominacion_oficial: "Enseñanza",
    fuente_primaria: "CIIU Rev. 4 - Sección P",
    regulador_sectorial: "Ministerio de Educación",
    nivel_riesgo_inherente: "MEDIO_ALTO",
    fundamento_riesgo: "Datos menores de edad Art. 12 Ley 21.719 - consentimiento representantes",
    subcategorias: {
      educacion_basica: {
        codigo: "P8510",
        descripcion: "Enseñanza preescolar y primaria",
        datos_tipicos: ["rendimiento_academico", "datos_menores", "situacion_familiar"],
        regulacion_especifica: "Ley General Educación, protección menores"
      },
      universidades: {
        codigo: "P8530",
        descripcion: "Enseñanza superior",
        datos_tipicos: ["datos_estudiantes", "investigacion", "datos_funcionarios"],
        regulacion_especifica: "Ley Universidades, investigación con personas"
      }
    }
  },

  // SECTOR TECNOLOGÍA - RIESGO VARIABLE
  tecnologia: {
    ciiu_codes: ["J62", "J63"], // Programación, consultoría informática
    denominacion_oficial: "Programación, consultoría y otras actividades relacionadas con la informática",
    fuente_primaria: "CIIU Rev. 4 - Sección J",
    regulador_sectorial: "Ministerio de Economía (indirecto)",
    nivel_riesgo_inherente: "VARIABLE",
    fundamento_riesgo: "Riesgo según datos procesados - desde bajo (desarrollo software) hasta extremo (IA, big data)",
    subcategorias: {
      legal_tech: {
        codigo: "J6201",
        descripcion: "Actividades de programación informática - Servicios legales digitalizados",
        datos_tipicos: ["datos_clientes", "documentos_legales", "procesos_judiciales"],
        regulacion_especifica: "Ley 21.719, secreto profesional abogados",
        medidas_especiales: [
          "Secreto profesional reforzado",
          "Medidas técnicas y organizativas específicas",
          "Auditorías compliance periódicas"
        ]
      }
    }
  }
};

/**
 * 📊 METODOLOGÍA DE CLASIFICACIÓN
 * Explicación técnica del método utilizado
 */
export const metodologiaClasificacion = {
  criterios_principales: [
    {
      factor: "Tipo de datos procesados",
      peso: 40,
      fundamento: "Art. 2 f) Ley 21.719 - datos especialmente sensibles tienen mayor riesgo inherente"
    },
    {
      factor: "Volumen de datos",
      peso: 20,
      fundamento: "Principio proporcionalidad - mayor volumen, mayor riesgo potencial"
    },
    {
      factor: "Regulación sectorial específica",
      peso: 25,
      fundamento: "Sectores regulados tienen obligaciones adicionales"
    },
    {
      factor: "Riesgo para derechos fundamentales",
      peso: 15,
      fundamento: "Art. 1 Ley 21.719 - protección dignidad humana"
    }
  ],

  matriz_riesgo: {
    EXTREMO: {
      descripcion: "Datos genéticos, salud mental, biométricos para identificación",
      medidas_obligatorias: ["EIPD", "DPO certificado", "Auditorías externas", "Consulta previa APPDP"],
      ejemplos_sectores: ["Laboratorios genéticos", "Salud mental", "Investigación biomédica"]
    },
    ALTO: {
      descripcion: "Datos financieros, scoring, decisiones automatizadas significativas",
      medidas_obligatorias: ["EIPD probable", "Medidas técnicas reforzadas", "Auditorías regulares"],
      ejemplos_sectores: ["Bancos", "Seguros", "Fintech", "Telecomunicaciones"]
    },
    MEDIO_ALTO: {
      descripcion: "Datos menores, educacional, laboral sensible",
      medidas_obligatorias: ["Evaluación riesgo", "Consentimiento específico menores"],
      ejemplos_sectores: ["Educación", "Recursos Humanos", "Investigación académica"]
    },
    MEDIO: {
      descripcion: "Datos personales estándar, sin características especiales",
      medidas_obligatorias: ["Medidas básicas seguridad", "Información transparente"],
      ejemplos_sectores: ["Retail básico", "Servicios generales", "Turismo"]
    },
    BAJO: {
      descripcion: "Datos mínimos, finalidades básicas, bajo impacto",
      medidas_obligatorias: ["Medidas organizativas básicas"],
      ejemplos_sectores: ["Newsletter", "Contacto básico", "Servicios simples"]
    }
  },

  fuentes_tecnicas: [
    "Análisis jurisprudencia comparada GDPR",
    "Estudios de impacto sectorial Agencia Española Protección Datos",
    "Guías técnicas CNIL Francia",
    "Mejores prácticas ICO Reino Unido",
    "Análisis riesgo sectorial propio Jurídica Digital SpA"
  ]
};

/**
 * 🎯 FUNCIÓN OBTENER INFORMACIÓN SECTORIAL COMPLETA
 */
export function obtenerInformacionSectorial(industria, incluirFundamentos = true) {
  const info = clasificacionIndustrial[industria];
  
  if (!info) {
    return {
      error: `Industria '${industria}' no encontrada en clasificación`,
      industriasDisponibles: Object.keys(clasificacionIndustrial)
    };
  }

  const resultado = {
    industria: industria,
    informacion_basica: {
      denominacion_oficial: info.denominacion_oficial,
      fuente_clasificacion: info.fuente_primaria,
      regulador: info.regulador_sectorial,
      nivel_riesgo: info.nivel_riesgo_inherente
    }
  };

  if (incluirFundamentos) {
    resultado.fundamentos_tecnicos = {
      base_legal: info.fundamento_riesgo,
      codigos_ciiu: info.ciiu_codes,
      subcategorias: info.subcategorias,
      medidas_reforzadas: info.medidas_reforzadas || []
    };

    resultado.referencias_normativas = fuentesNormativas.sectoriales
      .find(s => s.sector === industria.toUpperCase())?.fuentes || [];
  }

  return resultado;
}

/**
 * 📋 GENERAR REPORTE FUNDAMENTOS PARA PRESENTACIÓN
 */
export function generarReporteFundamentos(industrias = null) {
  const industriasAnalizar = industrias || Object.keys(clasificacionIndustrial);
  
  return {
    fecha_generacion: new Date().toISOString(),
    metodologia: metodologiaClasificacion,
    fuentes_normativas: fuentesNormativas,
    analisis_sectorial: industriasAnalizar.map(industria => 
      obtenerInformacionSectorial(industria, true)
    ),
    elaborado_por: "Jurídica Digital SpA - Estudio jurídico especializado en Derecho Digital",
    contacto_tecnico: "admin@juridicadigital.cl",
    version_sistema: "1.0.0",
    nota_legal: "Análisis basado en normativa vigente a la fecha. Consulte actualizaciones normativas."
  };
}

export default {
  fuentesNormativas,
  clasificacionIndustrial,
  metodologiaClasificacion,
  obtenerInformacionSectorial,
  generarReporteFundamentos
};