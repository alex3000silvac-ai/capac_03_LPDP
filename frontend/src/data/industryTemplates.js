import {
  Store,
  LocalHospital,
  School,
  Factory,
  AccountBalance,
  RestaurantMenu,
  DirectionsCar,
  Build,
  FlightTakeoff,
  LocalShipping,
  Agriculture,
  Biotech,
  TravelExplore,
  Apartment,
  SportsSoccer,
  LibraryBooks,
  Security,
  HealthAndSafety
} from '@mui/icons-material';

/**
 * TEMPLATES EXHAUSTIVOS POR INDUSTRIA CHILE
 * Basado en investigación de mercado y requisitos Ley 21.719
 * 
 * Cada template incluye:
 * - Procesos comunes obligatorios (RRHH, Clientes, Proveedores)
 * - Procesos específicos de la industria
 * - Campos predefinidos completos
 * - Bases legales apropiadas
 * - Períodos de conservación según normativa chilena
 * - Medidas de seguridad específicas
 */

// PROCESOS COMUNES A TODAS LAS INDUSTRIAS
const PROCESOS_COMUNES = {
  gestion_rrhh: {
    nombre: 'Gestión de Recursos Humanos',
    finalidad: 'Administración del personal, nóminas, beneficios sociales, evaluaciones de desempeño y cumplimiento de obligaciones laborales',
    baseLegal: 'obligacion_legal', // Código del Trabajo
    categoriasTitulares: ['Empleados', 'Candidatos a empleo', 'Ex empleados'],
    categoriasDatos: ['identificacion', 'contacto', 'laborales', 'financieros', 'salud'], // salud para exámenes preocupacionales
    fuenteDatos: 'Directamente del titular y organismos públicos',
    esFuentePublica: false,
    conservacion: '30 años desde término de relación laboral (Código del Trabajo)',
    transferenciasInternacionales: false,
    medidasTecnicas: ['Cifrado de datos', 'Control de acceso', 'Respaldos seguros', 'Firewalls'],
    medidasOrganizativas: ['Políticas de RRHH', 'Capacitación del personal', 'Contratos de confidencialidad'],
    decisionesAutomatizadas: false
  },
  
  gestion_clientes: {
    nombre: 'Gestión de Clientes y Ventas',
    finalidad: 'Gestión de la relación comercial, procesamiento de pedidos, facturación, soporte técnico y seguimiento post-venta',
    baseLegal: 'contrato', // Contrato de compraventa
    categoriasTitulares: ['Clientes', 'Clientes potenciales', 'Contactos comerciales'],
    categoriasDatos: ['identificacion', 'contacto', 'financieros'],
    fuenteDatos: 'Directamente del titular',
    esFuentePublica: false,
    conservacion: '6 años desde última transacción (obligaciones tributarias)',
    transferenciasInternacionales: false,
    medidasTecnicas: ['Cifrado de datos de pago', 'Sistemas CRM seguros', 'Tokenización de tarjetas'],
    medidasOrganizativas: ['Políticas comerciales', 'Procedimientos de venta', 'Capacitación en protección de datos'],
    decisionesAutomatizadas: false
  },
  
  gestion_proveedores: {
    nombre: 'Gestión de Proveedores',
    finalidad: 'Evaluación, selección, contratación y pago de proveedores, control de calidad y cumplimiento contractual',
    baseLegal: 'contrato',
    categoriasTitulares: ['Proveedores', 'Representantes de proveedores', 'Contactos comerciales'],
    categoriasDatos: ['identificacion', 'contacto', 'financieros'],
    fuenteDatos: 'Directamente del titular y registros públicos',
    esFuentePublica: true,
    conservacion: '6 años desde término de contrato',
    transferenciasInternacionales: false,
    medidasTecnicas: ['Sistema ERP seguro', 'Control de acceso', 'Auditoría de pagos'],
    medidasOrganizativas: ['Políticas de compras', 'Evaluación de proveedores', 'Contratos marco'],
    decisionesAutomatizadas: false
  },
  
  marketing_comunicaciones: {
    nombre: 'Marketing y Comunicaciones',
    finalidad: 'Envío de comunicaciones comerciales, newsletters, promociones, estudios de mercado y mejora de servicios',
    baseLegal: 'consentimiento',
    categoriasTitulares: ['Suscriptores', 'Clientes', 'Usuarios web'],
    categoriasDatos: ['identificacion', 'contacto'],
    fuenteDatos: 'Directamente del titular',
    esFuentePublica: false,
    conservacion: 'Mientras se mantenga el consentimiento activo',
    transferenciasInternacionales: true, // Muchas empresas usan MailChimp, HubSpot, etc.
    paisesDestino: ['Estados Unidos', 'España'],
    garantiasTransferencia: 'Cláusulas Contractuales Tipo',
    medidasTecnicas: ['Cifrado de base de datos', 'Protocolos HTTPS', 'Listas de supresión'],
    medidasOrganizativas: ['Política de privacidad', 'Gestión de consentimientos', 'Procedimientos de baja'],
    decisionesAutomatizadas: false
  },
  
  seguridad_instalaciones: {
    nombre: 'Seguridad de Instalaciones',
    finalidad: 'Control de acceso, videovigilancia, prevención de delitos y protección de activos',
    baseLegal: 'interes_legitimo',
    categoriasTitulares: ['Empleados', 'Visitantes', 'Contratistas'],
    categoriasDatos: ['identificacion', 'biometricos'], // Huellas, rostro
    fuenteDatos: 'Directamente del titular y sistemas de seguridad',
    esFuentePublica: false,
    conservacion: '30 días para grabaciones de video, 1 año para registros de acceso',
    transferenciasInternacionales: false,
    medidasTecnicas: ['Cifrado de video', 'Almacenamiento seguro', 'Control de acceso físico'],
    medidasOrganizativas: ['Política de seguridad', 'Protocolo de videovigilancia', 'Registro de visitantes'],
    decisionesAutomatizadas: true,
    logicaDecision: 'Sistema biométrico de reconocimiento facial/dactilar',
    consecuenciasDecision: 'Autorización o denegación de acceso a instalaciones'
  }
};

// TEMPLATES POR INDUSTRIA CON PROCESOS ESPECÍFICOS
export const INDUSTRY_TEMPLATES = {
  retail: {
    nombre: 'Retail y E-commerce',
    icono: Store,
    descripcion: 'Tiendas físicas, e-commerce, supermercados y retail en general',
    color: '#FF6B6B',
    sectores: ['Supermercados', 'Tiendas de ropa', 'Electrodomésticos', 'E-commerce', 'Farmacias', 'Librerías'],
    procesos: {
      ...PROCESOS_COMUNES,
      
      programa_fidelizacion: {
        nombre: 'Programa de Fidelización de Clientes',
        finalidad: 'Gestión de puntos, descuentos, ofertas personalizadas y análisis de comportamiento de compra',
        baseLegal: 'consentimiento',
        categoriasTitulares: ['Clientes registrados', 'Miembros del programa'],
        categoriasDatos: ['identificacion', 'contacto', 'historial_compras', 'preferencias'],
        fuenteDatos: 'Directamente del titular',
        conservacion: 'Mientras se mantenga la membresía activa',
        transferenciasInternacionales: false,
        medidasTecnicas: ['Base de datos de fidelización', 'Análisis de comportamiento', 'Segmentación'],
        medidasOrganizativas: ['Términos del programa', 'Política de puntos', 'Atención al cliente'],
        decisionesAutomatizadas: true,
        logicaDecision: 'Algoritmo de recomendaciones basado en historial de compras',
        consecuenciasDecision: 'Ofertas personalizadas y descuentos dirigidos'
      },
      
      gestion_inventario: {
        nombre: 'Gestión de Inventario con Proveedores',
        finalidad: 'Control de stock, reposición automática, trazabilidad de productos y gestión de cadena de suministro',
        baseLegal: 'contrato',
        categoriasTitulares: ['Proveedores', 'Transportistas', 'Personal de bodega'],
        categoriasDatos: ['identificacion', 'contacto', 'datos_operacionales'],
        fuenteDatos: 'Directamente del titular y sistemas EDI',
        conservacion: '5 años para efectos tributarios',
        transferenciasInternacionales: false,
        medidasTecnicas: ['Sistema WMS', 'Códigos de barras/RFID', 'Integración EDI'],
        medidasOrganizativas: ['Procedimientos de inventario', 'Controles de calidad', 'Auditorías'],
        decisionesAutomatizadas: true,
        logicaDecision: 'Sistema automatizado de reposición basado en niveles mínimos',
        consecuenciasDecision: 'Generación automática de órdenes de compra'
      },
      
      atencion_cliente_postventa: {
        nombre: 'Atención al Cliente y Post-venta',
        finalidad: 'Soporte técnico, garantías, devoluciones, reclamos y seguimiento de satisfacción',
        baseLegal: 'contrato',
        categoriasTitulares: ['Clientes', 'Usuarios de garantía'],
        categoriasDatos: ['identificacion', 'contacto', 'datos_producto', 'historial_servicio'],
        fuenteDatos: 'Directamente del titular',
        conservacion: '3 años desde resolución del caso',
        transferenciasInternacionales: false,
        medidasTecnicas: ['Sistema de tickets', 'Base de conocimiento', 'Chat en línea'],
        medidasOrganizativas: ['Procedimientos de servicio', 'Escalamiento de casos', 'Medición de satisfacción'],
        decisionesAutomatizadas: false
      }
    }
  },

  salud: {
    nombre: 'Sector Salud',
    icono: LocalHospital,
    descripcion: 'Hospitales, clínicas, centros médicos, laboratorios y servicios de salud',
    color: '#4ECDC4',
    sectores: ['Hospitales', 'Clínicas', 'Consultas médicas', 'Laboratorios', 'Centros de diagnóstico', 'Farmacias'],
    procesos: {
      ...PROCESOS_COMUNES,
      
      atencion_medica: {
        nombre: 'Atención Médica y Ficha Clínica',
        finalidad: 'Prestación de servicios de salud, diagnóstico, tratamiento, seguimiento médico y cumplimiento de normativa sanitaria',
        baseLegal: 'obligacion_legal', // Ley de Derechos del Paciente
        categoriasTitulares: ['Pacientes', 'Acompañantes', 'Tutores legales'],
        categoriasDatos: ['identificacion', 'contacto', 'salud', 'biometricos'], // Datos sensibles
        fuenteDatos: 'Directamente del titular y profesionales de salud',
        conservacion: '15 años desde última atención (Reglamento Orgánico de los Servicios de Salud)',
        transferenciasInternacionales: false,
        medidasTecnicas: ['Cifrado de historias clínicas', 'Control de acceso por roles', 'Firma electrónica'],
        medidasOrganizativas: ['Secreto médico', 'Comité de ética', 'Consentimiento informado'],
        decisionesAutomatizadas: false
      },
      
      gestion_citas_agenda: {
        nombre: 'Gestión de Citas y Agenda Médica',
        finalidad: 'Programación de citas, recordatorios, gestión de agenda médica y optimización de recursos',
        baseLegal: 'contrato',
        categoriasTitulares: ['Pacientes', 'Acompañantes'],
        categoriasDatos: ['identificacion', 'contacto', 'datos_cita'],
        fuenteDatos: 'Directamente del titular',
        conservacion: '2 años desde la cita',
        transferenciasInternacionales: false,
        medidasTecnicas: ['Sistema de agenda', 'Recordatorios SMS', 'Portal del paciente'],
        medidasOrganizativas: ['Política de citas', 'Procedimientos de agenda', 'Confirmación de citas'],
        decisionesAutomatizadas: true,
        logicaDecision: 'Asignación automática de citas basada en disponibilidad médica',
        consecuenciasDecision: 'Programación y confirmación de citas médicas'
      },
      
      facturacion_seguros: {
        nombre: 'Facturación y Seguros de Salud',
        finalidad: 'Facturación de prestaciones, liquidación con seguros, FONASA, ISAPRE y cobranzas',
        baseLegal: 'contrato',
        categoriasTitulares: ['Pacientes', 'Asegurados', 'Beneficiarios'],
        categoriasDatos: ['identificacion', 'contacto', 'financieros', 'datos_seguro'],
        fuenteDatos: 'Directamente del titular y aseguradoras',
        conservacion: '6 años para efectos tributarios',
        transferenciasInternacionales: false,
        medidasTecnicas: ['Sistema de facturación', 'Integración con seguros', 'Validación en línea'],
        medidasOrganizativas: ['Procedimientos de facturación', 'Convenios con seguros', 'Control de cobranzas'],
        decisionesAutomatizadas: true,
        logicaDecision: 'Verificación automática de cobertura de seguros',
        consecuenciasDecision: 'Aprobación o rechazo de cobertura médica'
      },
      
      investigacion_clinica: {
        nombre: 'Investigación Clínica y Estudios',
        finalidad: 'Investigación médica, estudios clínicos, estadísticas sanitarias y mejora de tratamientos',
        baseLegal: 'consentimiento',
        categoriasTitulares: ['Participantes de estudios', 'Pacientes'],
        categoriasDatos: ['identificacion', 'salud', 'geneticos'], // Datos muy sensibles
        fuenteDatos: 'Directamente del titular',
        conservacion: '25 años según protocolo de investigación',
        transferenciasInternacionales: true,
        paisesDestino: ['Estados Unidos', 'Europa'],
        garantiasTransferencia: 'Cláusulas Contractuales Tipo y consentimiento específico',
        medidasTecnicas: ['Anonimización', 'Pseudonimización', 'Cifrado avanzado'],
        medidasOrganizativas: ['Comité de bioética', 'Consentimiento informado específico', 'Protocolos de investigación'],
        decisionesAutomatizadas: false
      }
    }
  },

  educacion: {
    nombre: 'Educación',
    icono: School,
    descripcion: 'Colegios, universidades, institutos técnicos y centros de formación',
    color: '#45B7D1',
    sectores: ['Colegios', 'Universidades', 'Institutos técnicos', 'Jardines infantiles', 'Centros de formación', 'Academias'],
    procesos: {
      ...PROCESOS_COMUNES,
      
      gestion_academica: {
        nombre: 'Gestión Académica de Estudiantes',
        finalidad: 'Administración del proceso educativo, evaluación académica, seguimiento estudiantil y certificación',
        baseLegal: 'contrato', // Contrato educacional
        categoriasTitulares: ['Estudiantes', 'Apoderados', 'Ex estudiantes'],
        categoriasDatos: ['identificacion', 'contacto', 'academicos', 'menores'], // Especial protección menores
        fuenteDatos: 'Directamente del titular y MINEDUC',
        conservacion: '30 años para certificados y títulos (permanente para efectos académicos)',
        transferenciasInternacionales: false,
        medidasTecnicas: ['Sistema académico', 'Certificados digitales', 'Portal estudiantes'],
        medidasOrganizativas: ['Reglamento académico', 'Protección datos menores', 'Consentimiento apoderados'],
        decisionesAutomatizadas: true,
        logicaDecision: 'Sistema automatizado de cálculo de promedios y promoción',
        consecuenciasDecision: 'Aprobación o reprobación de asignaturas y cursos'
      },
      
      admision_matriculas: {
        nombre: 'Proceso de Admisión y Matrículas',
        finalidad: 'Selección de estudiantes, proceso de matrícula, asignación de cupos y becas',
        baseLegal: 'contrato',
        categoriasTitulares: ['Postulantes', 'Estudiantes', 'Apoderados'],
        categoriasDatos: ['identificacion', 'contacto', 'academicos', 'socieconomicos'], // Socioeconómicos = sensible
        fuenteDatos: 'Directamente del titular',
        conservacion: '5 años para postulantes no aceptados, permanente para matriculados',
        transferenciasInternacionales: false,
        medidasTecnicas: ['Sistema de admisión', 'Plataforma online', 'Validación de documentos'],
        medidasOrganizativas: ['Política de admisión', 'Comité de becas', 'Procedimientos transparentes'],
        decisionesAutomatizadas: true,
        logicaDecision: 'Sistema de puntajes para asignación de becas basado en rendimiento y situación socioeconómica',
        consecuenciasDecision: 'Asignación de becas y beneficios estudiantiles'
      },
      
      biblioteca_recursos: {
        nombre: 'Biblioteca y Recursos Digitales',
        finalidad: 'Préstamo de libros, acceso a recursos digitales, control de inventario y estadísticas de uso',
        baseLegal: 'interes_legitimo',
        categoriasTitulares: ['Estudiantes', 'Profesores', 'Usuarios externos'],
        categoriasDatos: ['identificacion', 'contacto', 'uso_biblioteca'],
        fuenteDatos: 'Directamente del titular',
        conservacion: '2 años desde último préstamo',
        transferenciasInternacionales: false,
        medidasTecnicas: ['Sistema bibliotecario', 'Control de acceso', 'Estadísticas de uso'],
        medidasOrganizativas: ['Reglamento de biblioteca', 'Políticas de préstamo', 'Conservación de colecciones'],
        decisionesAutomatizadas: true,
        logicaDecision: 'Sistema automatizado de renovaciones y multas por atraso',
        consecuenciasDecision: 'Aplicación de multas y restricciones de préstamo'
      },
      
      bienestar_estudiantil: {
        nombre: 'Bienestar Estudiantil y Apoyo',
        finalidad: 'Programas de bienestar, apoyo psicológico, becas de alimentación y asistencia social',
        baseLegal: 'consentimiento',
        categoriasTitulares: ['Estudiantes', 'Familias'],
        categoriasDatos: ['identificacion', 'contacto', 'salud', 'socieconomicos'], // Datos sensibles
        fuenteDatos: 'Directamente del titular',
        conservacion: '7 años desde egreso del estudiante',
        transferenciasInternacionales: false,
        medidasTecnicas: ['Sistema de bienestar', 'Fichas sociales', 'Control de beneficios'],
        medidasOrganizativas: ['Equipo psicosocial', 'Confidencialidad', 'Programas de apoyo'],
        decisionesAutomatizadas: false
      }
    }
  },

  manufactura: {
    nombre: 'Manufactura e Industria',
    icono: Factory,
    descripcion: 'Industrias manufactureras, producción y procesamiento industrial',
    color: '#96CEB4',
    sectores: ['Alimentos y bebidas', 'Textil', 'Metalmecánica', 'Química', 'Papelera', 'Automotriz'],
    procesos: {
      ...PROCESOS_COMUNES,
      
      produccion_calidad: {
        nombre: 'Control de Producción y Calidad',
        finalidad: 'Control de procesos productivos, trazabilidad de productos, control de calidad y cumplimiento de normas',
        baseLegal: 'obligacion_legal',
        categoriasTitulares: ['Operarios', 'Supervisores', 'Inspectores de calidad'],
        categoriasDatos: ['identificacion', 'datos_produccion', 'certificaciones'],
        fuenteDatos: 'Directamente del titular y sistemas de producción',
        conservacion: '10 años para trazabilidad de productos',
        transferenciasInternacionales: false,
        medidasTecnicas: ['Sistemas MES', 'Sensores IoT', 'Bases de datos de producción'],
        medidasOrganizativas: ['Procedimientos ISO', 'Control de calidad', 'Auditorías internas'],
        decisionesAutomatizadas: true,
        logicaDecision: 'Sistema automatizado de control de calidad basado en parámetros técnicos',
        consecuenciasDecision: 'Aprobación o rechazo de lotes de producción'
      },
      
      seguridad_ocupacional: {
        nombre: 'Seguridad y Salud Ocupacional',
        finalidad: 'Prevención de accidentes, control de riesgos, exámenes ocupacionales y cumplimiento normativa laboral',
        baseLegal: 'obligacion_legal', // Ley 16.744
        categoriasTitulares: ['Trabajadores', 'Contratistas', 'Visitantes'],
        categoriasDatos: ['identificacion', 'salud', 'incidentes', 'capacitaciones'],
        fuenteDatos: 'Directamente del titular y mutual de seguridad',
        conservacion: '30 años para registros de exposición ocupacional',
        transferenciasInternacionales: false,
        medidasTecnicas: ['Sistema de gestión HSE', 'Monitoreo ambiental', 'Registros médicos'],
        medidasOrganizativas: ['Comité paritario', 'Capacitación en seguridad', 'Investigación de accidentes'],
        decisionesAutomatizadas: false
      },
      
      mantenimiento_equipos: {
        nombre: 'Mantenimiento de Equipos e Infraestructura',
        finalidad: 'Mantenimiento preventivo y correctivo, gestión de repuestos, control de equipos críticos',
        baseLegal: 'interes_legitimo',
        categoriasTitulares: ['Técnicos de mantenimiento', 'Proveedores de servicio'],
        categoriasDatos: ['identificacion', 'contacto', 'certificaciones_tecnicas'],
        fuenteDatos: 'Directamente del titular',
        conservacion: '5 años desde término de servicio',
        transferenciasInternacionales: false,
        medidasTecnicas: ['Sistema CMMS', 'Historial de equipos', 'Planificación de mantenimiento'],
        medidasOrganizativas: ['Procedimientos de mantenimiento', 'Capacitación técnica', 'Control de repuestos'],
        decisionesAutomatizadas: true,
        logicaDecision: 'Sistema predictivo de mantenimiento basado en análisis de datos',
        consecuenciasDecision: 'Programación automática de mantenimientos'
      }
    }
  },

  banca_finanzas: {
    nombre: 'Banca y Finanzas',
    icono: AccountBalance,
    descripcion: 'Bancos, cooperativas de ahorro, financieras y servicios financieros',
    color: '#F7DC6F',
    sectores: ['Bancos', 'Cooperativas', 'Financieras', 'Casas de cambio', 'Seguros', 'AFPs'],
    procesos: {
      ...PROCESOS_COMUNES,
      
      evaluacion_crediticia: {
        nombre: 'Evaluación Crediticia y Scoring',
        finalidad: 'Evaluación de riesgo crediticio, aprobación de créditos, fijación de condiciones y seguimiento',
        baseLegal: 'contrato',
        categoriasTitulares: ['Solicitantes de crédito', 'Deudores', 'Avales'],
        categoriasDatos: ['identificacion', 'contacto', 'financieros', 'socieconomicos', 'comerciales'],
        fuenteDatos: 'Directamente del titular y centrales de riesgo',
        conservacion: '7 años desde cancelación del crédito',
        transferenciasInternacionales: true,
        paisesDestino: ['Estados Unidos'],
        garantiasTransferencia: 'Adequate decision de SBIF',
        medidasTecnicas: ['Modelos de scoring', 'Cifrado de datos financieros', 'APIs seguras'],
        medidasOrganizativas: ['Comité de crédito', 'Políticas de riesgo', 'Auditoría interna'],
        decisionesAutomatizadas: true,
        logicaDecision: 'Modelo automatizado de scoring crediticio basado en variables financieras y comportamentales',
        consecuenciasDecision: 'Aprobación/rechazo de créditos y determinación de condiciones'
      },
      
      prevencion_lavado: {
        nombre: 'Prevención de Lavado de Activos',
        finalidad: 'Cumplimiento normativo UAF, detección de operaciones sospechosas, conocimiento del cliente',
        baseLegal: 'obligacion_legal', // Ley 19.913
        categoriasTitulares: ['Clientes', 'Personas políticamente expuestas', 'Beneficiarios finales'],
        categoriasDatos: ['identificacion', 'financieros', 'politicos', 'comerciales'],
        fuenteDatos: 'Directamente del titular y bases públicas',
        conservacion: '5 años desde término de relación comercial',
        transferenciasInternacionales: false,
        medidasTecnicas: ['Sistema de monitoreo', 'Listas de control', 'Análisis de patrones'],
        medidasOrganizativas: ['Oficial de cumplimiento', 'Capacitación AML', 'Reportes UAF'],
        decisionesAutomatizadas: true,
        logicaDecision: 'Sistema automatizado de detección de patrones sospechosos',
        consecuenciasDecision: 'Generación de alertas y potenciales reportes a UAF'
      },
      
      gestion_inversiones: {
        nombre: 'Gestión de Inversiones y Patrimonio',
        finalidad: 'Asesoramiento financiero, gestión de carteras, análisis de perfil de riesgo del inversionista',
        baseLegal: 'contrato',
        categoriasTitulares: ['Inversionistas', 'Beneficiarios', 'Apoderados'],
        categoriasDatos: ['identificacion', 'financieros', 'perfil_riesgo'],
        fuenteDatos: 'Directamente del titular',
        conservacion: '10 años desde término del contrato',
        transferenciasInternacionales: true,
        paisesDestino: ['Estados Unidos', 'Europa'],
        garantiasTransferencia: 'Cláusulas Contractuales Tipo',
        medidasTecnicas: ['Plataformas de trading', 'Análisis de riesgo', 'Cifrado de transacciones'],
        medidasOrganizativas: ['Suitability test', 'Política de inversiones', 'Comité de inversiones'],
        decisionesAutomatizadas: true,
        logicaDecision: 'Algoritmos de asignación de activos basados en perfil de riesgo',
        consecuenciasDecision: 'Recomendaciones de inversión personalizadas'
      }
    }
  },

  construccion: {
    nombre: 'Construcción e Inmobiliaria',
    icono: Build,
    descripcion: 'Constructoras, inmobiliarias, arquitectura e ingeniería',
    color: '#D2B4DE',
    sectores: ['Constructoras', 'Inmobiliarias', 'Arquitectura', 'Ingeniería', 'Corretaje', 'Administración de edificios'],
    procesos: {
      ...PROCESOS_COMUNES,
      
      gestion_proyectos: {
        nombre: 'Gestión de Proyectos de Construcción',
        finalidad: 'Planificación, ejecución y seguimiento de proyectos, control de avance y costos',
        baseLegal: 'contrato',
        categoriasTitulares: ['Propietarios', 'Subcontratistas', 'Profesionales'],
        categoriasDatos: ['identificacion', 'contacto', 'proyecto', 'financieros'],
        fuenteDatos: 'Directamente del titular',
        conservacion: '15 años desde recepción de obra',
        transferenciasInternacionales: false,
        medidasTecnicas: ['Software de gestión', 'Control de avance', 'Documentación técnica'],
        medidasOrganizativas: ['Procedimientos de obra', 'Supervisión técnica', 'Control de calidad'],
        decisionesAutomatizadas: false
      },
      
      ventas_inmobiliarias: {
        nombre: 'Ventas y Corretaje Inmobiliario',
        finalidad: 'Comercialización de propiedades, evaluación de clientes, financiamiento y escrituración',
        baseLegal: 'contrato',
        categoriasTitulares: ['Compradores', 'Vendedores', 'Corredores'],
        categoriasDatos: ['identificacion', 'contacto', 'financieros', 'preferencias'],
        fuenteDatos: 'Directamente del titular',
        conservacion: '10 años desde escrituración',
        transferenciasInternacionales: false,
        medidasTecnicas: ['CRM inmobiliario', 'Portal de propiedades', 'Firma electrónica'],
        medidasOrganizativas: ['Contratos de corretaje', 'Evaluación crediticia', 'Proceso de escrituración'],
        decisionesAutomatizadas: true,
        logicaDecision: 'Sistema de matching entre propiedades y preferencias de clientes',
        consecuenciasDecision: 'Recomendaciones automáticas de propiedades'
      },
      
      administracion_edificios: {
        nombre: 'Administración de Edificios',
        finalidad: 'Administración de condominios, cobranza de gastos comunes, mantención y seguridad',
        baseLegal: 'contrato',
        categoriasTitulares: ['Propietarios', 'Arrendatarios', 'Residentes'],
        categoriasDatos: ['identificacion', 'contacto', 'financieros', 'acceso'],
        fuenteDatos: 'Directamente del titular',
        conservacion: '7 años para efectos tributarios',
        transferenciasInternacionales: false,
        medidasTecnicas: ['Sistema de administración', 'Control de acceso', 'Facturación electrónica'],
        medidasOrganizativas: ['Reglamento de copropiedad', 'Asambleas', 'Comité de administración'],
        decisionesAutomatizadas: true,
        logicaDecision: 'Cálculo automático de gastos comunes y reajustes',
        consecuenciasDecision: 'Determinación de montos a pagar por propietario'
      }
    }
  },

  // NUEVAS INDUSTRIAS CHILENAS - 10 SECTORES PRINCIPALES

  mineria: {
    nombre: 'Minería',
    icono: Build,
    descripcion: 'Minería del cobre, litio, oro y otros minerales - Sector clave de Chile',
    color: '#8B4513',
    sectores: ['Minería del cobre', 'Litio', 'Oro', 'Plata', 'Hierro', 'Salitre', 'Carbón'],
    procesos: {
      ...PROCESOS_COMUNES,
      
      operaciones_mineras: {
        nombre: 'Operaciones Mineras y Faenas',
        finalidad: 'Control de acceso a faenas, seguridad en minas, producción mineral y cumplimiento normativo minero',
        baseLegal: 'obligacion_legal',
        categoriasTitulares: ['Trabajadores mineros', 'Contratistas', 'Proveedores especializados'],
        categoriasDatos: ['identificacion', 'contacto', 'laborales', 'salud', 'biometricos'],
        fuenteDatos: 'Directamente del titular y SERNAGEOMIN',
        conservacion: '30 años por exposición ocupacional (SERNAGEOMIN)',
        transferenciasInternacionales: false,
        medidasTecnicas: ['Control biométrico', 'GPS tracking', 'Monitoreo salud ocupacional'],
        medidasOrganizativas: ['Protocolos de seguridad', 'Exámenes médicos', 'Capacitación especializada'],
        decisionesAutomatizadas: true,
        logicaDecision: 'Sistema automatizado de control de acceso basado en certificaciones y estado médico',
        consecuenciasDecision: 'Autorización o denegación de acceso a áreas restringidas'
      },

      gestion_ambiental: {
        nombre: 'Gestión Ambiental y Cumplimiento',
        finalidad: 'Monitoreo ambiental, reportes a autoridades, gestión de residuos y cumplimiento de normativa ambiental',
        baseLegal: 'obligacion_legal',
        categoriasTitulares: ['Inspectores ambientales', 'Comunidades aledañas', 'Autoridades'],
        categoriasDatos: ['identificacion', 'contacto', 'datos_monitoreo'],
        fuenteDatos: 'Directamente del titular y mediciones automáticas',
        conservacion: 'Permanente por normativa ambiental',
        transferenciasInternacionales: false,
        medidasTecnicas: ['Sensores ambientales', 'Reportes automáticos', 'GIS'],
        medidasOrganizativas: ['Planes de manejo ambiental', 'Reportes regulatorios', 'Auditorías ambientales'],
        decisionesAutomatizadas: true,
        logicaDecision: 'Sistema de alertas automáticas basado en umbrales ambientales',
        consecuenciasDecision: 'Activación de protocolos de emergencia ambiental'
      }
    }
  },

  pesca_acuicultura: {
    nombre: 'Pesca y Acuicultura',
    icono: LocalShipping,
    descripcion: 'Pesca industrial, acuicultura de salmón, mariscos y productos del mar',
    color: '#006994',
    sectores: ['Pesca industrial', 'Salmonicultura', 'Cultivo de mariscos', 'Procesamiento pesquero', 'Exportación productos del mar'],
    procesos: {
      ...PROCESOS_COMUNES,
      
      operaciones_acuicolas: {
        nombre: 'Operaciones de Acuicultura y Pesca',
        finalidad: 'Gestión de centros de cultivo, trazabilidad de productos, control sanitario y cumplimiento SERNAPESCA',
        baseLegal: 'obligacion_legal',
        categoriasTitulares: ['Trabajadores acuícolas', 'Pescadores', 'Técnicos especializados'],
        categoriasDatos: ['identificacion', 'contacto', 'laborales', 'certificaciones_tecnicas'],
        fuenteDatos: 'Directamente del titular y SERNAPESCA',
        conservacion: '10 años por trazabilidad alimentaria',
        transferenciasInternacionales: true,
        paisesDestino: ['Estados Unidos', 'Japón', 'China', 'Europa'],
        garantiasTransferencia: 'Certificaciones sanitarias internacionales',
        medidasTecnicas: ['Sistemas de trazabilidad', 'Monitoreo sanitario', 'Control de temperatura'],
        medidasOrganizativas: ['Protocolos HACCP', 'Certificaciones sanitarias', 'Control de calidad'],
        decisionesAutomatizadas: true,
        logicaDecision: 'Sistema automatizado de clasificación de productos por calidad y destino',
        consecuenciasDecision: 'Asignación automática de lotes a mercados específicos'
      },

      certificacion_exportacion: {
        nombre: 'Certificación y Exportación',
        finalidad: 'Certificados sanitarios, documentos de exportación, trazabilidad internacional y cumplimiento FDA/EU',
        baseLegal: 'obligacion_legal',
        categoriasTitulares: ['Exportadores', 'Certificadores', 'Transportistas'],
        categoriasDatos: ['identificacion', 'contacto', 'datos_certificacion'],
        fuenteDatos: 'Directamente del titular y organismos certificadores',
        conservacion: '7 años por regulaciones internacionales',
        transferenciasInternacionales: true,
        paisesDestino: ['Estados Unidos', 'Japón', 'China', 'Unión Europea'],
        garantiasTransferencia: 'Acuerdos comerciales Chile-USA, Chile-UE',
        medidasTecnicas: ['Blockchain trazabilidad', 'Certificados digitales', 'EDI aduanero'],
        medidasOrganizativas: ['Procedimientos de exportación', 'Auditorías internacionales', 'Compliance regulatorio'],
        decisionesAutomatizadas: false
      }
    }
  },

  agroindustria: {
    nombre: 'Agroindustria y Alimentos',
    icono: Agriculture,
    descripcion: 'Agricultura, ganadería, procesamiento de alimentos y exportación agrícola',
    color: '#228B22',
    sectores: ['Fruticultura', 'Vitivinícola', 'Ganadería', 'Procesamiento alimentos', 'Exportación agrícola', 'Semillas'],
    procesos: {
      ...PROCESOS_COMUNES,
      
      produccion_agricola: {
        nombre: 'Producción Agrícola y Trazabilidad',
        finalidad: 'Gestión de predios, trazabilidad de productos, control fitosanitario y certificaciones agrícolas',
        baseLegal: 'obligacion_legal',
        categoriasTitulares: ['Agricultores', 'Trabajadores agrícolas', 'Técnicos SAG'],
        categoriasDatos: ['identificacion', 'contacto', 'laborales', 'datos_produccion'],
        fuenteDatos: 'Directamente del titular y SAG',
        conservacion: '7 años por trazabilidad alimentaria',
        transferenciasInternacionales: true,
        paisesDestino: ['Estados Unidos', 'China', 'Europa', 'India'],
        garantiasTransferencia: 'Certificaciones GlobalGAP y orgánicas',
        medidasTecnicas: ['Sistemas de trazabilidad', 'Sensores IoT', 'Geolocalización'],
        medidasOrganizativas: ['Buenas Prácticas Agrícolas', 'Certificaciones sanitarias', 'Auditorías SAG'],
        decisionesAutomatizadas: true,
        logicaDecision: 'Sistema automatizado de riego y fertilización basado en sensores',
        consecuenciasDecision: 'Optimización automática de recursos hídricos y fertilizantes'
      },

      exportacion_frutas: {
        nombre: 'Exportación de Frutas y Vinos',
        finalidad: 'Logística de exportación, certificaciones fitosanitarias, control de calidad y distribución internacional',
        baseLegal: 'contrato',
        categoriasTitulares: ['Exportadores', 'Importadores', 'Distribuidores'],
        categoriasDatos: ['identificacion', 'contacto', 'datos_comerciales'],
        fuenteDatos: 'Directamente del titular',
        conservacion: '6 años por regulaciones comerciales',
        transferenciasInternacionales: true,
        paisesDestino: ['Estados Unidos', 'China', 'Europa', 'India', 'Brasil'],
        garantiasTransferencia: 'Tratados de libre comercio Chile',
        medidasTecnicas: ['Cadena de frío', 'Tracking GPS', 'Control de humedad'],
        medidasOrganizativas: ['Protocolos de exportación', 'Certificaciones internacionales', 'Control de calidad'],
        decisionesAutomatizadas: true,
        logicaDecision: 'Algoritmo de asignación de embarques basado en destino y calidad',
        consecuenciasDecision: 'Optimización de rutas y asignación de productos por mercado'
      }
    }
  },

  turismo: {
    nombre: 'Turismo y Hospitalidad',
    icono: TravelExplore,
    descripcion: 'Hoteles, turismo, restaurantes, tour operadores y servicios turísticos',
    color: '#FF8C00',
    sectores: ['Hoteles', 'Restaurantes', 'Tour operadores', 'Agencias de viaje', 'Turismo aventura', 'Centros de ski'],
    procesos: {
      ...PROCESOS_COMUNES,
      
      gestion_huespedes: {
        nombre: 'Gestión de Huéspedes y Reservas',
        finalidad: 'Reservas hoteleras, check-in/check-out, servicios de hospitalidad y programas de fidelización',
        baseLegal: 'contrato',
        categoriasTitulares: ['Huéspedes', 'Visitantes', 'Miembros programa fidelización'],
        categoriasDatos: ['identificacion', 'contacto', 'preferencias', 'datos_pago'],
        fuenteDatos: 'Directamente del titular y plataformas de reserva',
        conservacion: '5 años desde última estadía',
        transferenciasInternacionales: true,
        paisesDestino: ['Estados Unidos', 'Europa'],
        garantiasTransferencia: 'Plataformas certificadas de reservas (Booking, Expedia)',
        medidasTecnicas: ['PMS hotelero', 'Tarjetas de acceso', 'CRM hotelero'],
        medidasOrganizativas: ['Política de privacidad huéspedes', 'Procedimientos check-in', 'Servicio al cliente'],
        decisionesAutomatizadas: true,
        logicaDecision: 'Sistema de recomendaciones personalizado basado en historial de estadías',
        consecuenciasDecision: 'Ofertas personalizadas y upgrades automáticos'
      },

      servicios_turisticos: {
        nombre: 'Servicios Turísticos y Excursiones',
        finalidad: 'Tours, excursiones, actividades turísticas, seguros de viaje y servicios complementarios',
        baseLegal: 'contrato',
        categoriasTitulares: ['Turistas', 'Participantes tours', 'Contactos emergencia'],
        categoriasDatos: ['identificacion', 'contacto', 'salud_basica', 'emergencia'],
        fuenteDatos: 'Directamente del titular',
        conservacion: '3 años por seguros y responsabilidad',
        transferenciasInternacionales: false,
        medidasTecnicas: ['GPS tracking tours', 'Comunicaciones de emergencia', 'Sistemas de reserva'],
        medidasOrganizativas: ['Protocolos de seguridad', 'Guías certificados', 'Seguros de responsabilidad'],
        decisionesAutomatizadas: false
      }
    }
  },

  transporte_logistica: {
    nombre: 'Transporte y Logística',
    icono: DirectionsCar,
    descripcion: 'Transporte de carga, logística, puertos, aeropuertos y distribución',
    color: '#4169E1',
    sectores: ['Transporte carga', 'Puertos', 'Aeropuertos', 'Courier', 'Logística', 'Almacenamiento'],
    procesos: {
      ...PROCESOS_COMUNES,
      
      operaciones_transporte: {
        nombre: 'Operaciones de Transporte y Carga',
        finalidad: 'Gestión de flotas, tracking de carga, control de conductores y optimización de rutas',
        baseLegal: 'obligacion_legal',
        categoriasTitulares: ['Conductores', 'Despachadores', 'Clientes de carga'],
        categoriasDatos: ['identificacion', 'contacto', 'laborales', 'ubicacion', 'biometricos'],
        fuenteDatos: 'Directamente del titular y dispositivos GPS',
        conservacion: '5 años por regulaciones de transporte',
        transferenciasInternacionales: false,
        medidasTecnicas: ['GPS tracking', 'Control biométrico', 'Sistemas de gestión flota'],
        medidasOrganizativas: ['Protocolos de seguridad vial', 'Certificaciones conductores', 'Control de jornadas'],
        decisionesAutomatizadas: true,
        logicaDecision: 'Algoritmo de optimización de rutas basado en tráfico y carga',
        consecuenciasDecision: 'Asignación automática de rutas más eficientes'
      },

      gestion_portuaria: {
        nombre: 'Gestión Portuaria y Aduanera',
        finalidad: 'Control de acceso portuario, trazabilidad de contenedores, cumplimiento aduanero y seguridad portuaria',
        baseLegal: 'obligacion_legal',
        categoriasTitulares: ['Trabajadores portuarios', 'Transportistas', 'Agentes aduaneros'],
        categoriasDatos: ['identificacion', 'contacto', 'certificaciones', 'biometricos'],
        fuenteDatos: 'Directamente del titular y autoridades aduaneras',
        conservacion: '7 años por regulaciones aduaneras',
        transferenciasInternacionales: true,
        paisesDestino: ['Múltiples países según destino carga'],
        garantiasTransferencia: 'Convenios internacionales portuarios y aduaneros',
        medidasTecnicas: ['Control biométrico', 'RFID contenedores', 'Sistemas aduaneros'],
        medidasOrganizativas: ['Código ISPS', 'Protocolos seguridad', 'Certificaciones BASC'],
        decisionesAutomatizadas: true,
        logicaDecision: 'Sistema automatizado de asignación de muelles basado en tipo de carga',
        consecuenciasDecision: 'Optimización automática de operaciones portuarias'
      }
    }
  },

  banca_finanzas: {
    nombre: 'Banca y Servicios Financieros',
    icono: AccountBalance,
    descripcion: 'Bancos, financieras, seguros, AFP, administradoras de fondos y fintech',
    color: '#2E8B57',
    sectores: ['Banca comercial', 'Financieras', 'Seguros', 'AFP', 'Administradoras fondos', 'Fintech'],
    procesos: {
      ...PROCESOS_COMUNES,
      
      evaluacion_crediticia: {
        nombre: 'Evaluación Crediticia y Scoring',
        finalidad: 'Análisis de riesgo crediticio, scoring financiero, aprobación de créditos y seguimiento de deudores',
        baseLegal: 'interes_legitimo',
        categoriasTitulares: ['Solicitantes crédito', 'Deudores', 'Avalistas'],
        categoriasDatos: ['identificacion', 'contacto', 'financieros', 'socieconomicos', 'laborales'],
        fuenteDatos: 'Directamente del titular y centrales de riesgo',
        conservacion: '7 años desde cancelación del crédito',
        transferenciasInternacionales: false,
        medidasTecnicas: ['Modelos de scoring', 'Encriptación datos financieros', 'Fraud detection'],
        medidasOrganizativas: ['Comité de créditos', 'Políticas de riesgo', 'Segregación de funciones'],
        decisionesAutomatizadas: true,
        logicaDecision: 'Modelo automatizado de scoring crediticio basado en variables financieras y comportamentales',
        consecuenciasDecision: 'Aprobación o rechazo automático de créditos hasta cierto monto'
      },

      prevencion_lavado: {
        nombre: 'Prevención de Lavado de Activos',
        finalidad: 'Cumplimiento UAF, detección operaciones sospechosas, conocimiento del cliente y reportes regulatorios',
        baseLegal: 'obligacion_legal',
        categoriasTitulares: ['Clientes', 'Personas políticamente expuestas', 'Beneficiarios finales'],
        categoriasDatos: ['identificacion', 'contacto', 'financieros', 'politica_criminal'],
        fuenteDatos: 'Directamente del titular y listas internacionales',
        conservacion: '5 años desde término de relación comercial (Ley 19.913)',
        transferenciasInternacionales: false,
        medidasTecnicas: ['Sistemas de monitoreo transaccional', 'Listas de control', 'Alertas automáticas'],
        medidasOrganizativas: ['Oficial de cumplimiento', 'Procedimientos KYC', 'Reportes UAF'],
        decisionesAutomatizadas: true,
        logicaDecision: 'Sistema automatizado de detección de patrones sospechosos basado en ML',
        consecuenciasDecision: 'Generación automática de alertas y posible bloqueo de operaciones'
      }
    }
  },

  energia: {
    nombre: 'Energía y Utilities',
    icono: Factory,
    descripcion: 'Generación eléctrica, distribución, gas, agua, energías renovables y utilities',
    color: '#FFD700',
    sectores: ['Generación eléctrica', 'Distribución energía', 'Gas', 'Agua', 'Energías renovables', 'Utilities'],
    procesos: {
      ...PROCESOS_COMUNES,
      
      gestion_suministro: {
        nombre: 'Gestión de Suministro y Medición',
        finalidad: 'Facturación de servicios, lecturas de medidores, atención comercial y gestión de cortes/reconexiones',
        baseLegal: 'contrato',
        categoriasTitulares: ['Clientes residenciales', 'Clientes industriales', 'Propietarios'],
        categoriasDatos: ['identificacion', 'contacto', 'consumo_energia', 'financieros'],
        fuenteDatos: 'Directamente del titular y medidores inteligentes',
        conservacion: '6 años por regulaciones tributarias',
        transferenciasInternacionales: false,
        medidasTecnicas: ['Medidores inteligentes', 'Sistemas de facturación', 'AMI (Advanced Metering Infrastructure)'],
        medidasOrganizativas: ['Procedimientos comerciales', 'Atención al cliente', 'Políticas de cobranza'],
        decisionesAutomatizadas: true,
        logicaDecision: 'Sistema automatizado de detección de consumos anómalos y fraude eléctrico',
        consecuenciasDecision: 'Alertas automáticas de posibles fraudes o fallas en el suministro'
      },

      operacion_red: {
        nombre: 'Operación de Redes y Mantenimiento',
        finalidad: 'Control de redes eléctricas, mantenimiento preventivo, gestión de fallas y optimización energética',
        baseLegal: 'obligacion_legal',
        categoriasTitulares: ['Técnicos especializados', 'Contratistas', 'Operadores de red'],
        categoriasDatos: ['identificacion', 'contacto', 'laborales', 'certificaciones_tecnicas'],
        fuenteDatos: 'Directamente del titular y CNE',
        conservacion: '10 años por regulaciones eléctricas',
        transferenciasInternacionales: false,
        medidasTecnicas: ['SCADA', 'Sistemas de control distribuido', 'Monitoreo en tiempo real'],
        medidasOrganizativas: ['Procedimientos de seguridad eléctrica', 'Certificaciones técnicas', 'Protocolos de emergencia'],
        decisionesAutomatizadas: true,
        logicaDecision: 'Sistema automatizado de conmutación de redes basado en demanda y fallas',
        consecuenciasDecision: 'Reconfiguración automática de redes para optimizar suministro'
      }
    }
  },

  telecomunicaciones: {
    nombre: 'Telecomunicaciones y TI',
    icono: FlightTakeoff,
    descripción: 'Telefonía, internet, TV cable, servicios cloud, software y tecnología',
    color: '#9370DB',
    sectores: ['Telefonía móvil', 'Internet', 'TV cable', 'Cloud services', 'Software', 'Soporte TI'],
    procesos: {
      ...PROCESOS_COMUNES,
      
      servicios_telecomunicaciones: {
        nombre: 'Servicios de Telecomunicaciones',
        finalidad: 'Provisión de servicios móviles, internet, TV, facturación y atención al cliente',
        baseLegal: 'contrato',
        categoriasTitulares: ['Clientes personas', 'Clientes empresas', 'Usuarios prepago'],
        categoriasDatos: ['identificacion', 'contacto', 'uso_servicios', 'ubicacion', 'financieros'],
        fuenteDatos: 'Directamente del titular y equipos de red',
        conservacion: '5 años desde término del servicio',
        transferenciasInternacionales: false,
        medidasTecnicas: ['Cifrado de comunicaciones', 'Firewalls', 'Monitoreo de red'],
        medidasOrganizativas: ['Políticas de privacidad', 'Secreto de las comunicaciones', 'Procedimientos de atención'],
        decisionesAutomatizadas: true,
        logicaDecision: 'Sistema automatizado de asignación de recursos de red basado en demanda',
        consecuenciasDecision: 'Optimización automática de calidad de servicio por cliente'
      },

      cumplimiento_regulatorio: {
        nombre: 'Cumplimiento Regulatorio SUBTEL',
        finalidad: 'Cumplimiento regulaciones SUBTEL, retención de datos, intercepción legal y reportes regulatorios',
        baseLegal: 'obligacion_legal',
        categoriasTitulares: ['Usuarios de servicios', 'Autoridades'],
        categoriasDatos: ['identificacion', 'contacto', 'metadatos_comunicacion'],
        fuenteDatos: 'Directamente del titular y equipos de red',
        conservacion: '2 años por Ley de Telecomunicaciones',
        transferenciasInternacionales: false,
        medidasTecnicas: ['Sistemas de retención legal', 'Logs de conexión', 'Cifrado regulatorio'],
        medidasOrganizativas: ['Procedimientos SUBTEL', 'Intercepción legal', 'Reportes regulatorios'],
        decisionesAutomatizadas: false
      }
    }
  },

  construccion_inmobiliaria: {
    nombre: 'Construcción e Inmobiliaria',
    icono: Apartment,
    descripcion: 'Construcción, desarrollo inmobiliario, corredores de propiedades y administración',
    color: '#CD853F',
    sectores: ['Constructoras', 'Inmobiliarias', 'Corredores propiedades', 'Administración edificios', 'Arquitectura'],
    procesos: {
      ...PROCESOS_COMUNES,
      
      desarrollo_inmobiliario: {
        nombre: 'Desarrollo y Ventas Inmobiliarias',
        finalidad: 'Ventas de propiedades, gestión de clientes, financiamiento inmobiliario y post-venta',
        baseLegal: 'contrato',
        categoriasTitulares: ['Compradores', 'Inversionistas', 'Corredores'],
        categoriasDatos: ['identificacion', 'contacto', 'financieros', 'preferencias_vivienda'],
        fuenteDatos: 'Directamente del titular',
        conservacion: '10 años desde escrituración',
        transferenciasInternacionales: false,
        medidasTecnicas: ['CRM inmobiliario', 'Plataformas de venta', 'Simuladores de crédito'],
        medidasOrganizativas: ['Políticas de venta', 'Procedimientos post-venta', 'Garantías inmobiliarias'],
        decisionesAutomatizadas: true,
        logicaDecision: 'Sistema de recomendación de propiedades basado en perfil y presupuesto',
        consecuenciasDecision: 'Sugerencias automáticas de propiedades que se ajusten al perfil del cliente'
      },

      gestion_construccion: {
        nombre: 'Gestión de Proyectos de Construcción',
        finalidad: 'Control de obras, gestión de subcontratistas, seguridad laboral y cumplimiento técnico',
        baseLegal: 'obligacion_legal',
        categoriasTitulares: ['Trabajadores construcción', 'Subcontratistas', 'Profesionales'],
        categoriasDatos: ['identificacion', 'contacto', 'laborales', 'certificaciones', 'salud_ocupacional'],
        fuenteDatos: 'Directamente del titular y mutualidades',
        conservacion: '15 años desde recepción de obra',
        transferenciasInternacionales: false,
        medidasTecnicas: ['Control de acceso obras', 'Sistemas de prevención', 'Tracking de materiales'],
        medidasOrganizativas: ['Protocolos de seguridad', 'Certificaciones técnicas', 'Prevención de riesgos'],
        decisionesAutomatizadas: false
      }
    }
  },

  seguros: {
    nombre: 'Seguros y Reaseguros',
    icono: HealthAndSafety,
    descripcion: 'Compañías de seguros, brokers, peritos y servicios de reaseguros',
    color: '#20B2AA',
    sectores: ['Seguros generales', 'Seguros de vida', 'Brokers', 'Peritos', 'Reaseguros', 'Corredores'],
    procesos: {
      ...PROCESOS_COMUNES,
      
      suscripcion_seguros: {
        nombre: 'Suscripción y Evaluación de Riesgos',
        finalidad: 'Evaluación de riesgos, suscripción de pólizas, cálculo de primas y renovaciones',
        baseLegal: 'contrato',
        categoriasTitulares: ['Asegurados', 'Beneficiarios', 'Tomadores'],
        categoriasDatos: ['identificacion', 'contacto', 'financieros', 'salud', 'antecedentes_riesgo'],
        fuenteDatos: 'Directamente del titular y centrales de riesgo',
        conservacion: '10 años desde vencimiento de póliza',
        transferenciasInternacionales: true,
        paisesDestino: ['Reaseguradoras internacionales'],
        garantiasTransferencia: 'Contratos de reaseguros internacionales',
        medidasTecnicas: ['Modelos actuariales', 'Sistemas de suscripción', 'Bases de datos de riesgo'],
        medidasOrganizativas: ['Comité de suscripción', 'Políticas de riesgo', 'Auditorías actuariales'],
        decisionesAutomatizadas: true,
        logicaDecision: 'Modelo automatizado de evaluación de riesgos y cálculo de primas',
        consecuenciasDecision: 'Aprobación automática de pólizas de bajo riesgo y cálculo de primas'
      },

      gestion_siniestros: {
        nombre: 'Gestión de Siniestros y Liquidaciones',
        finalidad: 'Tramitación de siniestros, peritajes, liquidaciones y pagos de indemnizaciones',
        baseLegal: 'contrato',
        categoriasTitulares: ['Siniestrados', 'Peritos', 'Terceros afectados', 'Médicos'],
        categoriasDatos: ['identificacion', 'contacto', 'salud', 'financieros', 'detalles_siniestro'],
        fuenteDatos: 'Directamente del titular, peritos y profesionales médicos',
        conservacion: '15 años por posibles reclamos futuros',
        transferenciasInternacionales: false,
        medidasTecnicas: ['Sistemas de gestión siniestros', 'Evaluación automatizada', 'Fraud detection'],
        medidasOrganizativas: ['Red de peritos', 'Procedimientos de liquidación', 'Comité de siniestros'],
        decisionesAutomatizadas: true,
        logicaDecision: 'Sistema automatizado de evaluación de siniestros menores basado en patrones históricos',
        consecuenciasDecision: 'Aprobación automática de pagos de siniestros de bajo monto'
      }
    }
  }
};

// ESTRUCTURA DE BASE DE DATOS COMPLETA
export const DATABASE_SCHEMA = {
  // Tabla principal de empresas (tenants)
  companies: {
    id: 'UUID PRIMARY KEY',
    name: 'VARCHAR(255) NOT NULL',
    rut: 'VARCHAR(12) UNIQUE',
    industry: 'VARCHAR(50)', // Referencia a INDUSTRY_TEMPLATES
    contact_email: 'VARCHAR(255)',
    phone: 'VARCHAR(20)',
    address: 'TEXT',
    legal_representative: 'VARCHAR(255)',
    is_foreign: 'BOOLEAN DEFAULT FALSE',
    created_at: 'TIMESTAMP DEFAULT NOW()',
    updated_at: 'TIMESTAMP DEFAULT NOW()'
  },
  
  // Usuarios del sistema (3 por empresa mínimo)
  users: {
    id: 'UUID PRIMARY KEY',
    company_id: 'UUID REFERENCES companies(id)',
    email: 'VARCHAR(255) UNIQUE NOT NULL',
    password_hash: 'VARCHAR(255) NOT NULL',
    first_name: 'VARCHAR(100)',
    last_name: 'VARCHAR(100)',
    role: 'ENUM("admin", "dpo", "user")',
    permissions: 'JSON', // Array de permisos específicos
    is_active: 'BOOLEAN DEFAULT TRUE',
    last_login: 'TIMESTAMP',
    created_at: 'TIMESTAMP DEFAULT NOW()',
    updated_at: 'TIMESTAMP DEFAULT NOW()'
  },
  
  // Registro de Actividades de Tratamiento (RAT)
  processing_activities: {
    id: 'UUID PRIMARY KEY',
    company_id: 'UUID REFERENCES companies(id)',
    created_by: 'UUID REFERENCES users(id)',
    
    // Campo 1: Identificación del Responsable
    responsible_name: 'VARCHAR(255) NOT NULL',
    responsible_contact: 'TEXT NOT NULL',
    legal_rep_name: 'VARCHAR(255)',
    legal_rep_contact: 'TEXT',
    is_foreign_company: 'BOOLEAN DEFAULT FALSE',
    
    // Campo 2: Finalidades del Tratamiento
    purpose_description: 'TEXT NOT NULL',
    legal_basis: 'ENUM("consentimiento", "contrato", "obligacion_legal", "interes_vital", "tarea_publica", "interes_legitimo") NOT NULL',
    is_consent_based: 'BOOLEAN DEFAULT FALSE',
    consent_withdrawal_info: 'TEXT',
    
    // Campo 3: Categorías de Titulares y Datos
    data_subjects: 'JSON NOT NULL', // Array de categorías
    personal_data_categories: 'JSON NOT NULL', // Objeto con booleanos y arrays
    
    // Campo 4: Transferencias Internacionales
    has_international_transfers: 'BOOLEAN DEFAULT FALSE',
    transfer_countries: 'JSON', // Array de países
    adequate_protection: 'BOOLEAN DEFAULT FALSE',
    transfer_safeguards: 'TEXT',
    
    // Campo 5: Fuente de los Datos
    data_source_type: 'ENUM("direct", "third_party", "public_source", "mixed")',
    data_source_description: 'TEXT',
    is_public_source: 'BOOLEAN DEFAULT FALSE',
    
    // Campo 6: Períodos de Conservación
    retention_period: 'TEXT NOT NULL',
    retention_criteria: 'TEXT',
    retention_justification: 'TEXT',
    
    // Campo 7: Medidas de Seguridad
    technical_measures: 'JSON', // Array de medidas técnicas
    organizational_measures: 'JSON', // Array de medidas organizativas
    security_description: 'TEXT NOT NULL',
    
    // Campo 8: Decisiones Automatizadas
    has_automated_decisions: 'BOOLEAN DEFAULT FALSE',
    automated_logic: 'TEXT',
    automated_consequences: 'TEXT',
    decision_data_sources: 'JSON', // Array de fuentes
    
    // Metadatos
    template_used: 'VARCHAR(50)', // Referencia a template de industria
    process_name: 'VARCHAR(255)', // Nombre del proceso específico
    status: 'ENUM("draft", "active", "archived") DEFAULT "draft"',
    version: 'INTEGER DEFAULT 1',
    review_date: 'DATE',
    created_at: 'TIMESTAMP DEFAULT NOW()',
    updated_at: 'TIMESTAMP DEFAULT NOW()'
  },
  
  // Templates de industria personalizados
  industry_templates: {
    id: 'UUID PRIMARY KEY',
    industry_key: 'VARCHAR(50) NOT NULL',
    process_key: 'VARCHAR(100) NOT NULL',
    name: 'VARCHAR(255) NOT NULL',
    description: 'TEXT',
    purpose: 'TEXT',
    legal_basis: 'VARCHAR(50)',
    data_subjects: 'JSON',
    data_categories: 'JSON',
    retention_period: 'TEXT',
    security_measures: 'JSON',
    is_active: 'BOOLEAN DEFAULT TRUE',
    created_at: 'TIMESTAMP DEFAULT NOW()'
  },
  
  // Configuración de empresa
  company_settings: {
    id: 'UUID PRIMARY KEY',
    company_id: 'UUID REFERENCES companies(id)',
    setting_key: 'VARCHAR(100) NOT NULL',
    setting_value: 'JSON',
    created_at: 'TIMESTAMP DEFAULT NOW()',
    updated_at: 'TIMESTAMP DEFAULT NOW()',
    'UNIQUE(company_id, setting_key)': ''
  },
  
  // Auditoría y logs
  audit_logs: {
    id: 'UUID PRIMARY KEY',
    company_id: 'UUID REFERENCES companies(id)',
    user_id: 'UUID REFERENCES users(id)',
    action: 'VARCHAR(100) NOT NULL',
    resource_type: 'VARCHAR(50)',
    resource_id: 'UUID',
    details: 'JSON',
    ip_address: 'INET',
    user_agent: 'TEXT',
    created_at: 'TIMESTAMP DEFAULT NOW()'
  },
  
  // Exportaciones y certificados
  exports: {
    id: 'UUID PRIMARY KEY',
    company_id: 'UUID REFERENCES companies(id)',
    created_by: 'UUID REFERENCES users(id)',
    export_type: 'ENUM("rat", "certificate", "audit_report")',
    format: 'ENUM("json", "pdf", "excel", "xml")',
    file_path: 'VARCHAR(255)',
    file_size: 'INTEGER',
    metadata: 'JSON',
    created_at: 'TIMESTAMP DEFAULT NOW()'
  }
};

// API ENDPOINTS PARA INTEGRACIÓN
export const API_ENDPOINTS = {
  // CRUD básico de RAT
  'GET /api/v1/rat': 'Listar todas las actividades de tratamiento',
  'POST /api/v1/rat': 'Crear nueva actividad de tratamiento',
  'GET /api/v1/rat/:id': 'Obtener actividad específica',
  'PUT /api/v1/rat/:id': 'Actualizar actividad',
  'DELETE /api/v1/rat/:id': 'Archivar actividad',
  
  // Templates y procesos
  'GET /api/v1/templates': 'Obtener templates por industria',
  'GET /api/v1/templates/:industry': 'Templates específicos de industria',
  'POST /api/v1/templates/apply': 'Aplicar template a RAT',
  
  // Exportación e integración
  'GET /api/v1/export/rat': 'Exportar RAT completo',
  'GET /api/v1/export/certificate': 'Generar certificado de cumplimiento',
  'POST /api/v1/import/rat': 'Importar RAT desde sistemas externos',
  
  // Futuros sistemas de protección de datos
  'GET /api/v1/compliance/status': 'Estado general de cumplimiento',
  'GET /api/v1/compliance/gaps': 'Brechas de cumplimiento identificadas',
  'POST /api/v1/compliance/alerts': 'Configurar alertas de cumplimiento',
  
  // Integración con sistemas RRHH
  'POST /api/v1/integrations/hrms': 'Sincronizar con sistemas RRHH',
  'GET /api/v1/integrations/hrms/employees': 'Obtener datos de empleados',
  
  // Integración con CRM
  'POST /api/v1/integrations/crm': 'Sincronizar con CRM',
  'GET /api/v1/integrations/crm/customers': 'Obtener datos de clientes',
  
  // Webhooks para notificaciones
  'POST /api/v1/webhooks/rat-updated': 'Notificación de cambio en RAT',
  'POST /api/v1/webhooks/compliance-alert': 'Alerta de cumplimiento'
};

export default INDUSTRY_TEMPLATES;