// Datos de videos animados para diferentes módulos del curso LPDP

export const videosModulos = {
  introduccion_lpdp: {
    titulo: "Introducción a la LPDP",
    frames: [
      {
        title: "¿Qué es la Ley 21.719?",
        content: "La Ley de Protección de Datos Personales de Chile",
        icon: "🇨🇱",
        description: "Una nueva ley que protege la privacidad de todas las personas en Chile"
      },
      {
        title: "¿Qué son los datos personales?",
        content: "Cualquier información que identifique a una persona",
        icon: "👤",
        description: "Nombre, RUT, email, teléfono, dirección, fotos, videos"
      },
      {
        title: "Datos Sensibles en Chile",
        content: "Información especialmente protegida",
        icon: "🔐",
        description: "Salud, situación socioeconómica, biométricos, origen étnico"
      },
      {
        title: "Derechos de las Personas",
        content: "Tus derechos sobre tus datos",
        icon: "⚖️",
        description: "Acceso, rectificación, cancelación, oposición, portabilidad"
      },
      {
        title: "Responsabilidades de las Empresas",
        content: "Lo que deben hacer las organizaciones",
        icon: "🏢",
        description: "Proteger, documentar, informar y respetar los derechos"
      },
      {
        title: "¿Por qué es importante?",
        content: "Protege tu privacidad y dignidad",
        icon: "🛡️",
        description: "Evita el mal uso de tu información personal"
      }
    ]
  },

  conceptos_basicos: {
    titulo: "Conceptos Básicos LPDP",
    frames: [
      {
        title: "Titular de Datos",
        content: "La persona dueña de los datos",
        icon: "👨‍💼",
        description: "Quien tiene derechos sobre su información personal"
      },
      {
        title: "Responsable del Tratamiento",
        content: "Quien decide cómo usar los datos",
        icon: "🎯",
        description: "La empresa u organización que define finalidades"
      },
      {
        title: "Encargado del Tratamiento",
        content: "Quien procesa datos por encargo",
        icon: "🤝",
        description: "Proveedores externos que manejan datos por contrato"
      },
      {
        title: "Tratamiento de Datos",
        content: "Cualquier operación con datos",
        icon: "⚙️",
        description: "Recoger, almacenar, usar, modificar, eliminar datos"
      },
      {
        title: "Consentimiento",
        content: "Autorización libre e informada",
        icon: "✅",
        description: "Permiso claro y específico del titular"
      },
      {
        title: "Finalidad",
        content: "Para qué se usan los datos",
        icon: "🎯",
        description: "Propósito específico y legítimo del tratamiento"
      }
    ]
  },

  modulo3_inventario: {
    titulo: "Inventario y Mapeo de Datos",
    frames: [
      {
        title: "¿Qué es el RAT?",
        content: "Registro de Actividades de Tratamiento",
        icon: "📋",
        description: "Documento obligatorio que lista todas las actividades de datos"
      },
      {
        title: "Data Discovery",
        content: "Encontrar todos los datos personales",
        icon: "🔍",
        description: "Identificar qué datos tiene la empresa y dónde están"
      },
      {
        title: "Clasificación de Datos",
        content: "Catalogar según nivel de sensibilidad",
        icon: "📊",
        description: "Público, Interno, Confidencial, Sensible"
      },
      {
        title: "Mapeo de Flujos",
        content: "Cómo se mueven los datos",
        icon: "🌊",
        description: "Seguir el recorrido de los datos en la organización"
      },
      {
        title: "Bases de Licitud",
        content: "Justificación legal para tratar datos",
        icon: "⚖️",
        description: "Consentimiento, contrato, obligación legal, interés legítimo"
      },
      {
        title: "Retención y Eliminación",
        content: "Cuánto tiempo guardar los datos",
        icon: "🗓️",
        description: "Definir plazos según finalidad y normativa"
      }
    ]
  },

  capacitacion_dpo: {
    titulo: "Capacitación para DPO",
    frames: [
      {
        title: "Rol del DPO",
        content: "Delegado de Protección de Datos",
        icon: "👨‍⚖️",
        description: "Responsable de supervisar el cumplimiento de la LPDP"
      },
      {
        title: "Evaluación de Impacto",
        content: "EIPD para tratamientos de alto riesgo",
        icon: "📈",
        description: "Análisis previo de riesgos para derechos de titulares"
      },
      {
        title: "Gestión de Brechas",
        content: "Respuesta ante incidentes de seguridad",
        icon: "🚨",
        description: "Detectar, evaluar, notificar y remediar brechas"
      },
      {
        title: "Transferencias Internacionales",
        content: "Envío de datos fuera de Chile",
        icon: "🌍",
        description: "Garantías y protecciones para datos en otros países"
      },
      {
        title: "Derechos de Titulares",
        content: "Gestión de solicitudes de derechos",
        icon: "📝",
        description: "Procedimientos para acceso, rectificación, cancelación"
      },
      {
        title: "Auditoría y Cumplimiento",
        content: "Verificación continua del cumplimiento",
        icon: "🔍",
        description: "Revisiones periódicas y mejora continua"
      }
    ]
  },

  herramientas_practicas: {
    titulo: "Herramientas Prácticas",
    frames: [
      {
        title: "Plantillas RAT",
        content: "Formatos Excel personalizados",
        icon: "📄",
        description: "Plantillas listas para documentar actividades"
      },
      {
        title: "Formularios de Entrevista",
        content: "Cuestionarios por área de negocio",
        icon: "📋",
        description: "Guías estructuradas para identificar tratamientos"
      },
      {
        title: "Matriz de Riesgos",
        content: "Evaluación sistemática de riesgos",
        icon: "⚠️",
        description: "Herramienta para priorizar medidas de seguridad"
      },
      {
        title: "Mapeo de Flujos",
        content: "Diagramas de movimiento de datos",
        icon: "🗺️",
        description: "Visualización de flujos internos y externos"
      },
      {
        title: "Checklist de Cumplimiento",
        content: "Lista de verificación completa",
        icon: "✅",
        description: "Revisión de todos los requisitos de la Ley 21.719"
      },
      {
        title: "Base de Datos Integrada",
        content: "Todo queda registrado automáticamente",
        icon: "💾",
        description: "Sistema guarda tu progreso para uso futuro"
      }
    ]
  },

  sandbox_practica: {
    titulo: "Modo Práctica - Sandbox",
    frames: [
      {
        title: "Simulación Segura",
        content: "Practica sin riesgos",
        icon: "🧪",
        description: "Entorno controlado para aprender"
      },
      {
        title: "Casos Reales",
        content: "Situaciones de la industria chilena",
        icon: "🏭",
        description: "Ejemplos de acuicultura, manufactura, servicios"
      },
      {
        title: "Entrevistas Simuladas",
        content: "Practica la metodología de data discovery",
        icon: "🎤",
        description: "Aprende a identificar actividades de tratamiento"
      },
      {
        title: "Construcción de RAT",
        content: "Documenta paso a paso",
        icon: "🔧",
        description: "Experiencia práctica creando registros"
      },
      {
        title: "Evaluación de Riesgos",
        content: "Analiza y mitiga riesgos",
        icon: "🎯",
        description: "Identifica vulnerabilidades y controles"
      },
      {
        title: "Validación de Expertos",
        content: "Recibe retroalimentación",
        icon: "👨‍🏫",
        description: "Sistema evalúa tu trabajo y sugiere mejoras"
      }
    ]
  },

  entrevistas_areas: {
    titulo: "Entrevistas por Áreas",
    frames: [
      {
        title: "Recursos Humanos",
        content: "Datos de empleados y candidatos",
        icon: "👥",
        description: "Nómina, reclutamiento, evaluaciones de desempeño"
      },
      {
        title: "Finanzas",
        content: "Datos económicos y crediticios",
        icon: "💰",
        description: "Situación socioeconómica, scoring, pagos"
      },
      {
        title: "Marketing y Ventas",
        content: "Datos de clientes y campañas",
        icon: "📢",
        description: "Perfilamiento, decisiones automatizadas, cookies"
      },
      {
        title: "Tecnología (TI)",
        content: "Infraestructura y seguridad",
        icon: "💻",
        description: "Sistemas, logs, respaldos, brechas de seguridad"
      },
      {
        title: "Operaciones",
        content: "Datos de producción y IoT",
        icon: "⚙️",
        description: "Sensores, geolocalización, monitoreo en tiempo real"
      },
      {
        title: "Metodología Sistemática",
        content: "Preguntar por PROCESOS, no por datos",
        icon: "🔄",
        description: "Enfoque en actividades que involucren personas"
      }
    ]
  },

  uso_sistema: {
    titulo: "Uso del Sistema SCLDP",
    frames: [
      {
        title: "Dashboard Inteligente",
        content: "Panel de control centralizado",
        icon: "📊",
        description: "Vista general de progreso y actividades"
      },
      {
        title: "Navegación Intuitiva",
        content: "Diseño pensado para profesionales",
        icon: "🧭",
        description: "Acceso rápido a todas las funcionalidades"
      },
      {
        title: "Glosario Completo",
        content: "75+ términos especializados",
        icon: "📚",
        description: "Definiciones, ejemplos y referencias legales"
      },
      {
        title: "Progreso Automático",
        content: "El sistema recuerda tu avance",
        icon: "📈",
        description: "Continúa donde lo dejaste"
      },
      {
        title: "Exportación de Datos",
        content: "Descarga tus herramientas",
        icon: "📤",
        description: "Formatos Excel listos para usar"
      },
      {
        title: "Soporte Continuo",
        content: "Tips y ayuda contextual",
        icon: "💡",
        description: "Asistencia integrada en cada paso"
      }
    ]
  }
};

// Configuraciones de video por módulo
export const configuracionesVideo = {
  introduccion_lpdp: {
    duracionFrame: 4000,
    autoPlay: true,
    loop: true,
    gradiente: 'linear-gradient(135deg, #2196F3 0%, #21CBF3 100%)'
  },
  
  conceptos_basicos: {
    duracionFrame: 3500,
    autoPlay: false,
    loop: true,
    gradiente: 'linear-gradient(135deg, #4CAF50 0%, #45A049 100%)'
  },
  
  modulo3_inventario: {
    duracionFrame: 4500,
    autoPlay: false,
    loop: true,
    gradiente: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)'
  },
  
  capacitacion_dpo: {
    duracionFrame: 4000,
    autoPlay: false,
    loop: true,
    gradiente: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)'
  },
  
  herramientas_practicas: {
    duracionFrame: 3000,
    autoPlay: false,
    loop: true,
    gradiente: 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)'
  },
  
  sandbox_practica: {
    duracionFrame: 3500,
    autoPlay: false,
    loop: true,
    gradiente: 'linear-gradient(135deg, #FF5722 0%, #D84315 100%)'
  },
  
  entrevistas_areas: {
    duracionFrame: 4000,
    autoPlay: false,
    loop: true,
    gradiente: 'linear-gradient(135deg, #607D8B 0%, #455A64 100%)'
  },
  
  uso_sistema: {
    duracionFrame: 3500,
    autoPlay: false,
    loop: true,
    gradiente: 'linear-gradient(135deg, #795548 0%, #5D4037 100%)'
  }
};

// Función para obtener datos de video por módulo
export const getVideoData = (moduloId) => {
  return {
    frames: videosModulos[moduloId]?.frames || [],
    titulo: videosModulos[moduloId]?.titulo || '',
    configuracion: configuracionesVideo[moduloId] || configuracionesVideo.introduccion_lpdp
  };
};