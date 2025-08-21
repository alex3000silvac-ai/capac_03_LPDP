import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  IconButton,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  Alert,
  Avatar
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Stop,
  NavigateBefore,
  NavigateNext,
  School,
  Security,
  Assessment,
  BusinessCenter,
  Timeline,
  People,
  AttachMoney,
  Engineering,
  LocalShipping,
  Gavel,
  Computer,
  Construction,
  Lightbulb,
  RocketLaunch,
  DataObject
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import MapeoInteractivo from '../components/MapeoInteractivo';

const ModuloCero = () => {
  const { user } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [narrationState, setNarrationState] = useState('stopped'); // 'stopped', 'playing', 'paused'
  const [maleVoice, setMaleVoice] = useState(null);
  const utteranceRef = useRef(null);
  const slideRefs = useRef([]);
  const [activeSection, setActiveSection] = useState(1);
  const [showMapeoDialog, setShowMapeoDialog] = useState(false);
  const [empresaInfo, setEmpresaInfo] = useState({
    nombre: user?.organizacion_nombre || 'Mi Empresa',
    sector: 'General'
  });

  const totalSlides = 12;
  const maxDuration = 7 * 60; // 7 minutos en segundos
  const slideMaxDuration = maxDuration / totalSlides; // ~35 segundos por slide

  // Configuración de slides
  const slidesConfig = [
    {
      id: 1,
      title: "¿Qué es un Tratamiento de Datos?",
      icon: <School />,
      content: {
        description: "Según la Ley 21.719, es un concepto amplio que abarca cualquier operación, automatizada o no, realizada sobre datos personales. No se trata solo de almacenar información, sino de gestionar todo su ciclo de vida de forma responsable, desde que un dato ingresa a la organización hasta que es destruido de manera segura.",
        cards: [
          {
            icon: "📥",
            title: "Recolección",
            description: "Es el punto de partida. Implica obtener datos a través de cualquier medio, como formularios web, contratos de trabajo, encuestas de satisfacción o al registrar un nuevo cliente en el sistema."
          },
          {
            icon: "⚙️",
            title: "Uso y Proceso",
            description: "Aquí es donde los datos generan valor. Incluye organizar la información en bases de datos, analizarla para tomar decisiones de negocio, consultarla para atender a un cliente o simplemente almacenarla para uso futuro."
          },
          {
            icon: "📤",
            title: "Comunicación",
            description: "Se refiere a cualquier transferencia de datos. Puede ser interna, entre distintas áreas de la empresa, o externa, al compartir información con proveedores, entidades gubernamentales o socios comerciales."
          },
          {
            icon: "🗑️",
            title: "Supresión",
            description: "Es la fase final. Consiste en eliminar o anonimizar los datos de forma segura una vez que ya no son necesarios para la finalidad por la cual fueron recolectados, cumpliendo con los plazos legales."
          }
        ]
      }
    },
    {
      id: 2,
      title: "Mapa Maestro de Cumplimiento",
      icon: <Timeline />,
      content: {
        description: "Este es el proceso completo de implementación en 4 pasos clave: Identificar, Documentar, Proteger y Cumplir.",
        roadmap: [
          {
            step: 1,
            title: "Identificar",
            description: "¿Qué datos tenemos? Mapear por área, proceso y sistema."
          },
          {
            step: 2,
            title: "Documentar",
            description: "Crear el RAT, definiendo finalidad, base legal y retención."
          },
          {
            step: 3,
            title: "Proteger",
            description: "Implementar seguridad: encriptar, gestionar accesos, hacer backups."
          },
          {
            step: 4,
            title: "Cumplir",
            description: "Realizar auditorías continuas, reportar brechas y gestionar derechos."
          }
        ]
      }
    },
    {
      id: 3,
      title: "Clasificación por Sensibilidad",
      icon: <Security />,
      content: {
        description: "La ley obliga a clasificar los datos según el nivel de riesgo, aplicando medidas de seguridad proporcionales. Una correcta clasificación es fundamental para priorizar los esfuerzos de protección.",
        cards: [
          {
            icon: "👤",
            title: "Datos Comunes",
            description: "Información que identifica a una persona pero no revela su esfera íntima.",
            examples: ["Nombre, RUT, email, teléfono, dirección, cargo, historial de compras."],
            risk: "Su filtración puede llevar a suplantación de identidad, phishing, estafas o marketing no deseado."
          },
          {
            icon: "❤️‍🩹",
            title: "Datos Sensibles",
            description: "Datos íntimos cuyo tratamiento indebido puede generar discriminación o perjuicios graves.",
            examples: ["Diagnósticos médicos, afiliación sindical, datos biométricos, situación socioeconómica, opiniones políticas."],
            risk: "Su mal uso puede afectar el empleo, acceso a seguros, libertades personales o generar exclusión social."
          },
          {
            icon: "👶",
            title: "Datos de Niños, Niñas y Adolescentes",
            description: "Cualquier dato de menores de 18 años, considerados especialmente vulnerables.",
            examples: ["Ficha de matrícula escolar, datos de salud pediátrica, imágenes en redes sociales, uso de apps."],
            risk: "Pueden ser usados para grooming, bullying, manipulación comercial o explotación. Requieren el máximo nivel de protección."
          }
        ]
      }
    },
    {
      id: 4,
      title: "Inventario y Mapeo de Datos (RAT)",
      icon: <Assessment />,
      content: {
        description: "El Registro de Actividades de Tratamiento es la piedra angular del cumplimiento. Se construye entrevistando a todas las áreas que manejan datos personales para entender sus procesos de negocio.",
        cards: [
          {
            icon: <People />,
            title: "RRHH",
            description: "Maneja datos de postulantes y empleados."
          },
          {
            icon: <BusinessCenter />,
            title: "Marketing y Ventas",
            description: "Trata datos de clientes y prospectos en el CRM."
          },
          {
            icon: <AttachMoney />,
            title: "Finanzas",
            description: "Gestiona datos de facturación y proveedores."
          },
          {
            icon: <LocalShipping />,
            title: "Operaciones y Logística",
            description: "Usa datos de contacto para despachos."
          },
          {
            icon: <Computer />,
            title: "Tecnologías de la Información",
            description: "Administra logs de acceso y sistemas."
          },
          {
            icon: <Gavel />,
            title: "Legal y Cumplimiento",
            description: "Trata datos en litigios o denuncias."
          }
        ]
      }
    },
    {
      id: 5,
      title: "Hoja de Ruta de 4 Semanas para Cumplir",
      icon: <Timeline />,
      content: {
        description: "Un plan de acción para implementar el programa de cumplimiento de forma estructurada.",
        roadmap: [
          {
            step: 1,
            title: "Semana 1: Mapeo Inicial",
            description: "Identificar 10 procesos principales, clasificar sus datos y mapear flujos."
          },
          {
            step: 2,
            title: "Semana 2: Documentación",
            description: "Crear el RAT completo, redactar políticas de privacidad y actualizar contratos."
          },
          {
            step: 3,
            title: "Semana 3: Implementación",
            description: "Aplicar medidas técnicas, capacitar al equipo y formalizar procedimientos."
          },
          {
            step: 4,
            title: "Semana 4: Validación",
            description: "Realizar auditoría interna, aplicar correcciones y preparar la certificación."
          }
        ]
      }
    },
    {
      id: 6,
      title: "Ficha de Proceso: Marketing",
      icon: <BusinessCenter />,
      content: {
        processTitle: "Proceso: Captura de Leads en Landing Page",
        fields: [
          {
            label: "Finalidad",
            value: "Registrar prospectos interesados en nuestros servicios para contacto comercial posterior."
          },
          {
            label: "Base Legal",
            value: "Consentimiento (El usuario acepta activamente la política de privacidad al enviar el formulario)."
          },
          {
            label: "Datos Tratados",
            value: "Nombre (Común), Apellido (Común), Email Corporativo (Común), Cargo (Común), Nombre de Empresa (No personal)."
          },
          {
            label: "Sistemas Implicados",
            value: "HubSpot (CRM), Servidor Web."
          },
          {
            label: "Flujos",
            value: "Los datos viajan desde la web al CRM. Son accedidos por el equipo de Ventas."
          },
          {
            label: "Retención",
            value: "2 años desde el último contacto con el prospecto."
          }
        ]
      }
    },
    {
      id: 7,
      title: "Ficha de Proceso: Finanzas",
      icon: <AttachMoney />,
      content: {
        processTitle: "Proceso: Facturación a Clientes",
        fields: [
          {
            label: "Finalidad",
            value: "Emitir documentos tributarios (facturas) por los servicios prestados y gestionar su cobro."
          },
          {
            label: "Base Legal",
            value: "Ejecución de un contrato y Cumplimiento de una obligación legal (Normativa del SII)."
          },
          {
            label: "Datos Tratados",
            value: "Razón Social (No personal), RUT de la empresa (No personal), Nombre del contacto de facturación (Común), Email de facturación (Común)."
          },
          {
            label: "Sistemas Implicados",
            value: "SAP (ERP), Portal del SII."
          },
          {
            label: "Flujos",
            value: "Los datos se comparten con el Servicio de Impuestos Internos al emitir la factura."
          },
          {
            label: "Retención",
            value: "6 años, según lo exige la normativa tributaria chilena."
          }
        ]
      }
    },
    {
      id: 8,
      title: "Ficha de Proceso: Recursos Humanos",
      icon: <People />,
      content: {
        processTitle: "Proceso: Selección de Personal",
        fields: [
          {
            label: "Finalidad",
            value: "Evaluar la idoneidad de postulantes para cubrir una vacante específica."
          },
          {
            label: "Base Legal",
            value: "Medidas pre-contractuales a petición del interesado."
          },
          {
            label: "Datos Tratados",
            value: "CV (Comunes), Resultados de test psicométrico (Sensible), Verificación de referencias (Comunes), Certificado de antecedentes (Sensible)."
          },
          {
            label: "Sistemas Implicados",
            value: "Workday (HRIS), Email."
          },
          {
            label: "Flujos",
            value: "El CV se comparte con el gerente del área solicitante. Los datos del finalista se comparten con una empresa externa para chequeo de referencias."
          },
          {
            label: "Retención",
            value: "Postulantes no seleccionados: 6 meses. Contratado: pasa al legajo del empleado."
          }
        ]
      }
    },
    {
      id: 9,
      title: "Ficha de Proceso: Tecnologías de la Información",
      icon: <Computer />,
      content: {
        processTitle: "Proceso: Monitoreo de Seguridad y Logs",
        fields: [
          {
            label: "Finalidad",
            value: "Garantizar la seguridad de los sistemas, detectar incidentes y responder a ellos."
          },
          {
            label: "Base Legal",
            value: "Interés legítimo de la empresa en proteger sus activos de información."
          },
          {
            label: "Datos Tratados",
            value: "Dirección IP (Común), Logs de acceso con ID de usuario (Común), Registros de actividad en sistemas."
          },
          {
            label: "Sistemas Implicados",
            value: "Firewall, SIEM, Servidores de Aplicaciones."
          },
          {
            label: "Flujos",
            value: "Los logs se centralizan en el SIEM. En caso de incidente, se comparten con el equipo de respuesta."
          },
          {
            label: "Retención",
            value: "Logs de seguridad: 1 año para análisis forense."
          }
        ]
      }
    },
    {
      id: 10,
      title: "Ficha de Proceso: Operaciones y Logística",
      icon: <LocalShipping />,
      content: {
        processTitle: "Proceso: Despacho de Productos",
        fields: [
          {
            label: "Finalidad",
            value: "Coordinar la entrega de productos a los domicilios de los clientes."
          },
          {
            label: "Base Legal",
            value: "Ejecución de un contrato (la compra del cliente)."
          },
          {
            label: "Datos Tratados",
            value: "Nombre del cliente (Común), Dirección de despacho (Común), Teléfono de contacto (Común)."
          },
          {
            label: "Sistemas Implicados",
            value: "WMS (Sistema de Gestión de Almacenes), Plataforma del Courier."
          },
          {
            label: "Flujos",
            value: "Los datos de despacho se comparten con la empresa de courier externa para que realice la entrega."
          },
          {
            label: "Retención",
            value: "1 año para gestionar posibles reclamos o garantías."
          }
        ]
      }
    },
    {
      id: 11,
      title: "Ficha de Proceso: Legal y Cumplimiento",
      icon: <Gavel />,
      content: {
        processTitle: "Proceso: Gestión de Reclamos y Litigios",
        fields: [
          {
            label: "Finalidad",
            value: "Administrar y responder a requerimientos legales, reclamos de clientes o defensa en juicios."
          },
          {
            label: "Base Legal",
            value: "Cumplimiento de una obligación legal y defensa de derechos en juicio."
          },
          {
            label: "Datos Tratados",
            value: "Nombre del reclamante (Común), Detalles del caso (puede incluir Sensibles), Comunicaciones asociadas."
          },
          {
            label: "Sistemas Implicados",
            value: "Gestor Documental Legal, Email."
          },
          {
            label: "Flujos",
            value: "La información se comparte con abogados externos y, eventualmente, con tribunales de justicia."
          },
          {
            label: "Retención",
            value: "Según los plazos de prescripción legal de las acciones correspondientes (generalmente 5 años o más)."
          }
        ]
      }
    },
    {
      id: 12,
      title: "Simulación DPO: Creación de un Registro RAT",
      icon: <Engineering />,
      content: {
        description: "Esta es una simulación de cómo un DPO documentaría un proceso en un sistema de gobernanza, llenando los campos clave del Registro de Actividades de Tratamiento.",
        sections: [
          {
            id: 1,
            title: "1. Identificación del Tratamiento",
            fields: [
              { label: "ID de Actividad", value: "RRHH-001" },
              { label: "Nombre de la Actividad", value: "Proceso de Selección de Personal" },
              { label: "Área Responsable", value: "Gerencia de Recursos Humanos" },
              { label: "Dueño del Proceso", value: "Jefe de Reclutamiento" }
            ]
          },
          {
            id: 2,
            title: "2. Datos, Finalidad y Base Legal",
            fields: [
              { label: "Finalidad", value: "Evaluar la idoneidad de los postulantes para cubrir vacantes." },
              { label: "Base de Licitud", value: "Medidas pre-contractuales a petición del interesado." },
              { label: "Categorías de Titulares", value: "Postulantes a empleos." },
              { label: "Categorías de Datos", value: "CV (Común), Test Psicométricos (Sensible), Referencias (Común)." }
            ]
          },
          {
            id: 3,
            title: "3. Flujos y Destinatarios",
            fields: [
              { label: "Destinatarios Internos", value: "Gerente del área solicitante, equipo de RRHH." },
              { label: "Destinatarios Externos", value: "Empresa de chequeo de referencias, proveedor de test psicométricos." },
              { label: "Transferencias Internacionales", value: "Sí, a proveedor de test en EE.UU. (con cláusulas contractuales tipo)." }
            ]
          },
          {
            id: 4,
            title: "4. Retención y Medidas de Seguridad",
            fields: [
              { label: "Plazo de Conservación", value: "6 meses para postulantes no seleccionados." },
              { label: "Medidas de Seguridad", value: "Cifrado de la base de datos, control de acceso basado en roles (RBAC) en el sistema HRIS, acuerdos de confidencialidad con proveedores." }
            ]
          }
        ]
      }
    }
  ];

  // Configurar voz masculina latina
  useEffect(() => {
    const setupVoice = () => {
      const getVoices = () => {
        const voices = speechSynthesis.getVoices();
        // Priorizar voces masculinas latinas
        const spanishMaleVoice = 
          voices.find(v => (v.lang === 'es-MX' || v.lang === 'es-US') && v.name.includes('Google')) ||
          voices.find(v => (v.lang.startsWith('es-')) && (v.name.toLowerCase().includes('jorge') || v.name.toLowerCase().includes('diego'))) ||
          voices.find(v => v.lang.startsWith('es-'));
        
        setMaleVoice(spanishMaleVoice);
      };

      if (speechSynthesis.getVoices().length) {
        getVoices();
      } else {
        speechSynthesis.onvoiceschanged = getVoices;
      }
    };

    setupVoice();
  }, []);

  // Función para obtener texto narrable de un slide
  const getSlideNarrationText = (slideIndex) => {
    const slide = slidesConfig[slideIndex];
    let text = `${slide.title}. `;
    
    if (slide.content.description) {
      text += `${slide.content.description}. `;
    }

    if (slide.content.cards) {
      slide.content.cards.forEach(card => {
        text += `${card.title}. ${card.description}. `;
        if (card.examples) {
          text += `Ejemplos: ${card.examples.join(', ')}. `;
        }
        if (card.risk) {
          text += `Riesgo: ${card.risk}. `;
        }
      });
    }

    if (slide.content.roadmap) {
      slide.content.roadmap.forEach(step => {
        text += `${step.title}. ${step.description}. `;
      });
    }

    if (slide.content.processTitle) {
      text += `${slide.content.processTitle}. `;
      slide.content.fields.forEach(field => {
        text += `${field.label}: ${field.value}. `;
      });
    }

    if (slide.content.sections) {
      slide.content.sections.forEach(section => {
        if (section.id === activeSection) {
          text += `${section.title}. `;
          section.fields.forEach(field => {
            text += `${field.label}: ${field.value}. `;
          });
        }
      });
    }

    return text;
  };

  // Función de narración
  const narrateSlide = (slideIndex) => {
    if (slideIndex >= totalSlides || narrationState === 'stopped') {
      setNarrationState('stopped');
      return;
    }

    const text = getSlideNarrationText(slideIndex);
    
    if (!text.trim()) {
      setTimeout(() => narrateSlide(slideIndex + 1), 500);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    if (maleVoice) {
      utterance.voice = maleVoice;
    }
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      // Avance automático al siguiente slide después de la narración
      setTimeout(() => {
        if (slideIndex + 1 < totalSlides && narrationState === 'playing') {
          setCurrentSlide(slideIndex + 1);
          narrateSlide(slideIndex + 1);
        } else {
          setNarrationState('stopped');
        }
      }, 1000);
    };

    utteranceRef.current = utterance;
    speechSynthesis.speak(utterance);
  };

  // Controles de narración
  const handlePlay = () => {
    if (narrationState === 'stopped') {
      setNarrationState('playing');
      speechSynthesis.cancel();
      setCurrentSlide(0);
      narrateSlide(0);
    } else if (narrationState === 'paused') {
      setNarrationState('playing');
      speechSynthesis.resume();
    }
  };

  const handlePause = () => {
    if (narrationState === 'playing') {
      setNarrationState('paused');
      speechSynthesis.pause();
    }
  };

  const handleStop = () => {
    setNarrationState('stopped');
    speechSynthesis.cancel();
    setCurrentSlide(0);
  };

  // Navegación manual
  const handlePrevious = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
      if (narrationState === 'playing') {
        speechSynthesis.cancel();
        narrateSlide(currentSlide - 1);
      }
    }
  };

  const handleNext = () => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide(currentSlide + 1);
      if (narrationState === 'playing') {
        speechSynthesis.cancel();
        narrateSlide(currentSlide + 1);
      }
    }
  };

  // Renderizar slides
  const renderSlide = (slide) => {
    switch (slide.id) {
      case 1:
      case 3:
      case 4:
        return (
          <Box>
            <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
              {slide.content.description}
            </Typography>
            <Grid container spacing={3}>
              {slide.content.cards.map((card, index) => (
                <Grid item xs={12} sm={6} md={slide.id === 4 ? 4 : 6} key={index}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      transition: 'transform 0.3s ease-in-out',
                      '&:hover': { transform: 'translateY(-4px)' }
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        {typeof card.icon === 'string' ? (
                          <Typography variant="h4" sx={{ mr: 2 }}>{card.icon}</Typography>
                        ) : (
                          card.icon
                        )}
                        <Typography variant="h6" component="h3">
                          {card.title}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {card.description}
                      </Typography>
                      {card.examples && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                            Ejemplos: {card.examples.join(', ')}
                          </Typography>
                        </Box>
                      )}
                      {card.risk && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2" sx={{ color: 'warning.main' }}>
                            Riesgo: {card.risk}
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        );

      case 2:
      case 5:
        return (
          <Box>
            <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
              {slide.content.description}
            </Typography>
            <Stepper activeStep={-1} orientation="horizontal" sx={{ mb: 4 }}>
              {slide.content.roadmap.map((step, index) => (
                <Step key={step.step}>
                  <StepLabel>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" color="primary">
                        {step.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {step.description}
                      </Typography>
                    </Box>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>
        );

      case 6:
      case 7:
      case 8:
      case 9:
      case 10:
      case 11:
        return (
          <Paper sx={{ p: 4, borderLeft: 4, borderColor: 'primary.main' }}>
            <Typography variant="h5" sx={{ mb: 3, color: 'primary.main' }}>
              {slide.content.processTitle}
            </Typography>
            <Grid container spacing={3}>
              {slide.content.fields.map((field, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}>
                      {field.label}:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {field.value}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        );

      case 12:
        return (
          <Box>
            {/* Mensaje de culminación */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography variant="h2" sx={{ mb: 2 }}>🎉</Typography>
              <Typography variant="h4" sx={{ mb: 2, color: 'primary.main', fontWeight: 600 }}>
                ¡Felicitaciones!
              </Typography>
              <Typography variant="h6" sx={{ mb: 3, color: 'text.secondary' }}>
                Has completado los fundamentos de la LPDP en solo 7 minutos
              </Typography>
              
              <Alert severity="success" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
                <Typography variant="body1" fontWeight={600}>
                  ✅ Ahora conoces los conceptos clave de la Ley 21.719
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Es momento de aplicar este conocimiento en la construcción de tu propio mapeo de datos
                </Typography>
              </Alert>
            </Box>

            {/* Transición al sistema RAT */}
            <Paper sx={{ 
              p: 4, 
              textAlign: 'center',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              mb: 4
            }}>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                🚀 ¡Es hora de pasar de la teoría a la práctica!
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
                Utiliza nuestro <strong>Constructor RAT Profesional</strong> para crear tu Registro de Actividades de Tratamiento en tiempo real
              </Typography>
              
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={3}>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56, mx: 'auto', mb: 1 }}>
                    <Construction />
                  </Avatar>
                  <Typography variant="body2" fontWeight={600}>
                    Wizard Guiado
                  </Typography>
                  <Typography variant="caption">
                    5 fases estructuradas
                  </Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56, mx: 'auto', mb: 1 }}>
                    <DataObject />
                  </Avatar>
                  <Typography variant="body2" fontWeight={600}>
                    Templates
                  </Typography>
                  <Typography variant="caption">
                    Por industria
                  </Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56, mx: 'auto', mb: 1 }}>
                    <Assessment />
                  </Avatar>
                  <Typography variant="body2" fontWeight={600}>
                    Validación Legal
                  </Typography>
                  <Typography variant="caption">
                    Cumple Ley 21.719
                  </Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56, mx: 'auto', mb: 1 }}>
                    <RocketLaunch />
                  </Avatar>
                  <Typography variant="body2" fontWeight={600}>
                    Exportación
                  </Typography>
                  <Typography variant="caption">
                    PDF y Excel
                  </Typography>
                </Grid>
              </Grid>

              <Button
                variant="contained"
                color="secondary"
                size="large"
                onClick={() => setShowMapeoDialog(true)}
                sx={{ 
                  px: 4, 
                  py: 2, 
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 16px rgba(0,0,0,0.4)'
                  }
                }}
                startIcon={<Construction />}
              >
                🏗️ CONSTRUIR MI MAPEO DE DATOS
              </Button>
            </Paper>

            {/* Resumen de lo aprendido */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, color: 'primary.main' }}>
                📚 Lo que has aprendido:
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Lightbulb sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                    <Typography variant="body2" fontWeight={600}>
                      Conceptos Fundamentales
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Datos personales, LPDP, derechos
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Security sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                    <Typography variant="body2" fontWeight={600}>
                      Principios de Protección
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Licitud, finalidad, minimización
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <People sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                    <Typography variant="body2" fontWeight={600}>
                      Derechos ARCOPOL
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Acceso, rectificación, portabilidad
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <BusinessCenter sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                    <Typography variant="body2" fontWeight={600}>
                      Obligaciones Empresariales
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      RAT, DPO, medidas de seguridad
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* Call to action final */}
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary' }}>
                El conocimiento sin acción es solo potencial.
              </Typography>
              <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 600 }}>
                ¡Convierte tu empresa en experta en protección de datos!
              </Typography>
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header con controles */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h3" component="h1" gutterBottom color="primary">
            Módulo Cero: LPDP en 7 minutos
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Tratamiento y Mapeo de Datos - Presentación Interactiva
          </Typography>
        </Box>
        
        {/* Controles de navegación y reproducción */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <IconButton 
            onClick={handlePlay} 
            disabled={narrationState === 'playing'}
            color="primary"
            size="large"
          >
            <PlayArrow />
          </IconButton>
          <IconButton 
            onClick={handlePause} 
            disabled={narrationState !== 'playing'}
            color="primary"
            size="large"
          >
            <Pause />
          </IconButton>
          <IconButton 
            onClick={handleStop} 
            disabled={narrationState === 'stopped'}
            color="primary"
            size="large"
          >
            <Stop />
          </IconButton>
          
          <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
          
          <IconButton 
            onClick={handlePrevious} 
            disabled={currentSlide === 0}
            color="primary"
          >
            <NavigateBefore />
          </IconButton>
          <Chip 
            label={`${currentSlide + 1} / ${totalSlides}`} 
            color="primary" 
            variant="outlined" 
          />
          <IconButton 
            onClick={handleNext} 
            disabled={currentSlide === totalSlides - 1}
            color="primary"
          >
            <NavigateNext />
          </IconButton>
        </Box>
      </Box>

      {/* Indicador de progreso */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Progreso de la presentación
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {Math.round(((currentSlide + 1) / totalSlides) * 100)}%
          </Typography>
        </Box>
        <Box
          sx={{
            width: '100%',
            height: 4,
            backgroundColor: 'grey.300',
            borderRadius: 2,
            overflow: 'hidden'
          }}
        >
          <Box
            sx={{
              width: `${((currentSlide + 1) / totalSlides) * 100}%`,
              height: '100%',
              backgroundColor: 'primary.main',
              transition: 'width 0.3s ease-in-out'
            }}
          />
        </Box>
      </Box>

      {/* Contenido del slide actual */}
      <Paper sx={{ p: 4, minHeight: '60vh' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          {slidesConfig[currentSlide].icon}
          <Typography variant="h4" component="h2" sx={{ ml: 2, color: 'primary.main' }}>
            {slidesConfig[currentSlide].title}
          </Typography>
        </Box>
        
        {renderSlide(slidesConfig[currentSlide])}
      </Paper>

      {/* Footer con información adicional */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Sistema de Capacitación LPDP - Ley 21.719 | Usuario: {user?.first_name} {user?.last_name}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          Estado de narración: {narrationState === 'playing' ? '🔊 Reproduciendo' : narrationState === 'paused' ? '⏸️ Pausado' : '⏹️ Detenido'}
        </Typography>
      </Box>

      {/* Diálogo del Constructor RAT */}
      <Dialog 
        open={showMapeoDialog} 
        onClose={() => setShowMapeoDialog(false)}
        maxWidth="xl"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            height: '90vh',
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center">
              <Construction sx={{ mr: 2, color: 'primary.main' }} />
              <Box>
                <Typography variant="h5" fontWeight={600}>
                  Constructor RAT Profesional
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Sistema de Mapeo de Datos - Ley 21.719 Chile
                </Typography>
              </Box>
            </Box>
            <Alert severity="info" sx={{ maxWidth: 400 }}>
              <Typography variant="caption">
                📄 Basado en el Manual de Procedimientos LPDP - Cumple con todos los requisitos legales
              </Typography>
            </Alert>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <MapeoInteractivo 
            onClose={() => setShowMapeoDialog(false)}
            empresaInfo={empresaInfo}
          />
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default ModuloCero;