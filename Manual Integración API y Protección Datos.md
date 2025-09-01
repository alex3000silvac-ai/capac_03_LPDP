

# **Manual Estratégico y Técnico para el Cumplimiento de la Ley 21.719: Del Inventario de Datos a la Integración API**

## **Sección 1: El Mandato Regulatorio: El RAT como Piedra Angular de la Responsabilidad Proactiva**

La promulgación de la Ley N° 21.719 no representa una simple actualización normativa, sino una reestructuración fundamental del marco de protección de datos en Chile, estableciendo un cambio de paradigma que alinea al país con estándares globales como el Reglamento General de Protección de Datos (RGPD) de la Unión Europea.1 El objeto de la ley ha sido redefinido explícitamente como la "protección de los datos personales", sustituyendo el concepto anterior y más ambiguo de "protección de la vida privada", lo que señala una intención regulatoria mucho más precisa y enfocada.1

El elemento más disruptivo de esta nueva legislación es la creación de la Agencia de Protección de Datos Personales, una entidad reguladora activa con facultades normativas, fiscalizadoras y sancionadoras.1 La capacidad de la Agencia para dictar normas, realizar auditorías e imponer sanciones convierte el cumplimiento normativo, que antes era un ejercicio predominantemente teórico, en un riesgo operacional y financiero tangible y urgente para todas las organizaciones que operan en el territorio nacional.1 Este riesgo se materializa a través de un severo régimen de sanciones, con multas que pueden alcanzar hasta 20,000 Unidades Tributarias Mensuales (UTM) para las infracciones más serias.1 Este potencial impacto financiero es el principal motor del mercado para soluciones de cumplimiento, ya que crea un claro y medible retorno de la inversión (ROI) para la adopción de herramientas que mitiguen dicho riesgo. En este nuevo contexto, la estrategia de negocio no debe centrarse simplemente en "cumplir la ley", sino en "evitar multas millonarias" y "gestionar el riesgo operacional", un mensaje mucho más potente para los directivos y tomadores de decisiones.

En el corazón de este nuevo marco se encuentra el principio de **responsabilidad proactiva** (accountability), que obliga a las organizaciones no solo a cumplir con la ley, sino a ser capaces de *demostrar* dicho cumplimiento de manera continua y auditable.7 La herramienta central y la manifestación tangible de este principio es el

**Registro de Actividades de Tratamiento (RAT)**. Este inventario de datos es el punto de partida indispensable para toda la gobernanza de datos, ya que sin un conocimiento claro de qué datos se tienen, dónde están, por qué se tienen y cómo fluyen, es imposible cumplir con las demás obligaciones legales.1

La fuerte inspiración de la ley chilena en el RGPD europeo no es una mera coincidencia, sino una oportunidad estratégica invaluable.1 Para los actores del mercado chileno, esto funciona como un "atajo estratégico" que permite saltarse años de curva de aprendizaje. Al importar y adaptar las mejores prácticas, arquitecturas de software y modelos de negocio ya validados en el mercado europeo, es posible construir productos y servicios que no solo cumplan con la ley chilena actual, sino que anticipen las futuras necesidades y expectativas de reguladores y clientes. Esto permite, por ejemplo, utilizar como modelo probado para una estructura de RAT superior los registros de actividades publicados por entidades europeas, como la Fábrica Nacional de Moneda y Timbre de España, superando a competidores locales que puedan adoptar una visión más literal y menos estratégica de la ley.1

## **Sección 2: Anatomía del RAT Chileno: Guía de Implementación Granular**

La obligación de mantener un Registro de Actividades de Tratamiento (RAT) es una de las piedras angulares del nuevo principio de responsabilidad proactiva. La Ley N° 21.719 detalla con precisión el contenido mínimo que este registro debe incluir. A continuación, se desglosan los ocho componentes mandatorios, proporcionando un análisis que va desde el requisito legal hasta recomendaciones prácticas para su implementación en un sistema de software.1

### **Desglose de los 8 Campos Obligatorios**

1. **Identificación del Responsable y su Representante:**  
   * **Requisito Legal:** Nombre y datos de contacto del responsable del tratamiento, y del representante legal en Chile.1  
   * **Análisis e Interpretación Práctica:** Este campo establece la rendición de cuentas (accountability). Es crucial para las empresas extranjeras sujetas a la ley, que deben designar un representante local.1  
   * **Guía de Implementación en Software:** El sistema debe permitir el ingreso de datos estructurados para la persona jurídica responsable (Razón Social, RUT, dirección) y, de manera separada, los datos del representante legal. La interfaz debe diferenciar claramente entre ambos roles.1  
2. **Finalidades del Tratamiento y Derecho de Retiro del Consentimiento:**  
   * **Requisito Legal:** Los fines específicos y legítimos del tratamiento y, cuando se base en el consentimiento, la existencia del derecho a retirarlo en cualquier momento.1  
   * **Análisis e Interpretación Práctica:** Este campo es el corazón de la licitud del tratamiento. La finalidad debe estar vinculada a una de las bases legales reconocidas por la ley (consentimiento, contrato, obligación legal, etc.).1  
   * **Guía de Implementación en Software:** Ofrecer un menú desplegable con las bases de licitud predefinidas. Para el derecho a retirar el consentimiento, un checkbox podría añadir automáticamente un texto estándar a la descripción de la finalidad, asegurando el cumplimiento.1  
3. **Categorías de Titulares y Datos Personales:**  
   * **Requisito Legal:** Descripción de las categorías de titulares y de las categorías de datos personales tratados.1  
   * **Análisis e Interpretación Práctica:** La granularidad es clave para una correcta gestión de riesgos.  
   * **Guía de Implementación en Software:** Utilizar etiquetas predefinidas o selecciones múltiples para estandarizar la entrada. Para titulares: "Empleados", "Clientes", "Proveedores". Para datos: "Datos de identificación", "Datos de contacto", "Datos sensibles" (con una advertencia especial).1  
4. **Transferencias Internacionales de Datos:**  
   * **Requisito Legal:** Indicar si se transfieren datos a un tercer país y si este ofrece un nivel adecuado de protección, o si existen garantías que justifiquen la transferencia.1  
   * **Análisis e Interpretación Práctica:** Esta es una de las áreas de mayor complejidad legal.  
   * **Guía de Implementación en Software:** Implementar un flujo lógico guiado: 1\) ¿Hay transferencia? 2\) País de destino. 3\) Mecanismo legal que la ampara (ej. Cláusulas Contractuales Tipo). Proporcionar plantillas o enlaces a información sobre estos mecanismos sería un diferenciador de alto valor.1  
5. **Fuente de los Datos:**  
   * **Requisito Legal:** La fuente de la cual provienen los datos, y si provienen de fuentes de acceso público.1  
   * **Análisis e Interpretación Práctica:** Refuerza los principios de licitud y calidad de los datos.  
   * **Guía de Implementación en Software:** Permitir una selección múltiple ("Directo del titular", "Tercero", "Fuente pública") junto a un campo de texto libre para detalles.1  
6. **Períodos de Conservación:**  
   * **Requisito Legal:** El período durante el cual se conservarán los datos.1  
   * **Análisis e Interpretación Práctica:** Materializa el principio de limitación del plazo. Valores como "indefinido" no son aceptables.  
   * **Guía de Implementación en Software:** Solicitar un plazo concreto (ej. "5 años desde la finalización del contrato") o una referencia a la política interna. Se podrían incluir alertas automáticas para notificar la proximidad de la expiración.1  
7. **Medidas de Seguridad:**  
   * **Requisito Legal:** Una descripción de las medidas técnicas y organizativas de seguridad implementadas.1  
   * **Análisis e Interpretación Práctica:** La descripción debe ser general para no exponer vulnerabilidades.  
   * **Guía de Implementación en Software:** Ofrecer un campo de texto enriquecido para descripciones de alto nivel (ej. "Cifrado de datos en reposo y en tránsito") y permitir adjuntar o enlazar a documentos internos más detallados.1  
8. **Decisiones Automatizadas y Perfilamiento:**  
   * **Requisito Legal:** La existencia de decisiones automatizadas, incluida la elaboración de perfiles, con información sobre la lógica aplicada y las consecuencias previstas.1  
   * **Análisis e Interpretación Práctica:** Aborda el uso de IA y algoritmos con impacto significativo en las personas.  
   * **Guía de Implementación en Software:** Si se marca esta opción, desplegar campos adicionales para describir la lógica subyacente y las consecuencias en un lenguaje claro y sencillo.1

### **Enriquecimiento del RAT (Más Allá del Mínimo Legal)**

Un sistema de referencia debe transformar el RAT de un documento estático a un centro de gobernanza dinámico. Esto se logra con adiciones estratégicas inspiradas en el RGPD 1:

* **Vinculación Explícita con la Base de Licitud:** Obligar al usuario a seleccionar y justificar una base legal para cada finalidad. Esto fuerza un análisis de cumplimiento mucho más riguroso y previene tratamientos sin fundamento legal válido.1  
* **Integración con Evaluaciones de Impacto (EIPD/DPIA):** La nueva ley introduce la obligación de realizar EIPD para tratamientos de alto riesgo.1 Un sistema avanzado debe permitir vincular una actividad de tratamiento en el RAT directamente con su correspondiente informe de EIPD, creando un registro cohesivo, trazable y fácilmente auditable.1  
* **Gestión de Encargados del Tratamiento:** Cada actividad que involucre a un proveedor debe tener una sección para identificarlo y enlazar al contrato correspondiente (Anexo de Encargado de Tratamiento o DPA). Esto centraliza la gestión de proveedores y asegura el cumplimiento contractual.1

La siguiente tabla traduce los requisitos legales en especificaciones funcionales, sirviendo como un plano para el desarrollo de software.

**Tabla 1: Estructura Detallada del RAT (Requisito Legal vs. Especificación Funcional)**

| N° | Campo (Según Ley) | Requisito Legal (Ley N° 21.719) | Interpretación Práctica y Guía | Tipo de Dato Recomendado | Ejemplo Práctico | Paralelo GDPR (Art. 30\) |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| 1 | Identificación del Responsable | Nombre y datos de contacto del responsable y del representante legal en Chile. | Campos estructurados para la empresa y, si aplica, para el representante en Chile. | Objeto con campos de texto (Nombre, RUT, Dirección, etc.). | Responsable: "Mi Empresa SpA", Representante: "Abogados de Datos Ltda." | Art. 30(1)(a) |
| 2 | Fines y Retiro de Consentimiento | Los fines específicos y legítimos del tratamiento... existencia del derecho a retirarlo... | Descripción del "para qué" del tratamiento, vinculada a una base legal. Nota explícita sobre el retiro. | Texto enriquecido, con checkbox para "Basado en Consentimiento". | Finalidad: "Envío de newsletter". Base Legal: Consentimiento. Se informa del derecho a retirar. | Art. 30(1)(b) |
| 3 | Categorías de Titulares y Datos | Descripción de las categorías de titulares y de las categorías de datos personales... | Uso de etiquetas o selecciones múltiples para estandarizar. Distinguir entre titulares (quiénes) y datos (qué). | Listas de selección múltiple (tags). | Titulares: Clientes. Datos: Identificación (nombre), Contacto (email). | Art. 30(1)(c) |
| 4 | Transferencias Internacionales | ...transferencia a un tercer país... si ofrecen o no un nivel adecuado de protección... informar si existen garantías... | Flujo guiado: ¿Hay transferencia? \-\> País \-\> Mecanismo de garantía (ej. CCT). | Lógica condicional en la UI. Campos de selección y texto. | Transferencia a EEUU para servicio de email marketing. Garantía: Cláusulas Contractuales Tipo. | Art. 30(1)(e) |
| 5 | Fuente de los Datos | La fuente de la cual provienen los datos... si provienen de fuentes de acceso público. | Especificar el origen para verificar licitud y calidad. | Selección (Directo del titular, Tercero, Fuente pública) \+ Texto. | Fuente: Directamente del titular a través de formulario web. | Inferido del principio de licitud. |
| 6 | Períodos de Conservación | ...el periodo durante el que se conservarán los datos personales... | Plazo específico o criterio objetivo. Evitar "indefinido". | Texto o campo numérico con unidad de tiempo. | Mientras el titular mantenga suscripción, y 24 meses de inactividad. | Art. 30(1)(f) |
| 7 | Medidas de Seguridad | Una descripción de las medidas técnicas y organizativas de seguridad... | Descripción general y no confidencial. Posibilidad de enlazar a políticas internas. | Texto enriquecido. | Cifrado de BD, acceso restringido, uso de HTTPS. | Art. 30(1)(g) |
| 8 | Decisiones Automatizadas | La existencia de decisiones automatizadas, incluida la elaboración de perfiles... | Si se usan algoritmos para decisiones con efectos significativos, explicar su lógica y consecuencias. | Lógica condicional en la UI. Campos de texto. | No aplica para esta actividad de tratamiento. | Art. 22 y Art. 13/14 (Información) |

## **Sección 3: Operacionalización de la Gobernanza de Datos: Flujo de Trabajo y Matriz de Roles**

La creación del RAT no es una tarea única de un solo departamento, sino un proceso de gobernanza continuo que requiere una metodología clara y la colaboración de múltiples áreas de la organización. El éxito de este ejercicio depende de un cambio fundamental de perspectiva: en lugar de centrarse en los sistemas de TI, el enfoque debe estar en los procesos de negocio que utilizan datos personales.1 Preguntar "¿qué bases de datos tenemos?" es insuficiente, ya que un mismo dato puede residir en varios sistemas y ser utilizado para distintas finalidades. La pregunta correcta es "¿qué

*hacen* con los datos de las personas?". Este enfoque centrado en el proceso revela la finalidad, la base legal y el flujo completo del dato, resultando en un RAT mucho más preciso y útil.1

### **Procedimiento de Mapeo de Datos (Data Discovery)**

El flujo de trabajo práctico para realizar el inventario inicial de datos se puede estructurar en los siguientes pasos 1:

1. **Conformación del Equipo de Trabajo:** El proceso debe ser liderado por el Delegado de Protección de Datos (DPO), quien conformará un equipo multidisciplinario. Este equipo debe incluir necesariamente a representantes de todas las áreas clave que tratan datos personales, como Recursos Humanos, Finanzas, Marketing, Ventas, Operaciones, TI y Legal.1  
2. **Metodología de Levantamiento:** Se deben realizar entrevistas estructuradas y talleres con los "dueños de los procesos" en cada departamento. El objetivo es identificar y documentar cada "actividad de tratamiento". Por ejemplo, en lugar de preguntar a RRHH por su base de datos de empleados, se les pregunta: "¿Cuál es el proceso completo desde que reciben un currículum hasta que se contrata a una persona? ¿Qué información solicitan? ¿Dónde la guardan? ¿Con quién la comparten?".1  
3. **Documentación y Clasificación:** Para cada actividad identificada, el equipo documenta en el sistema los campos del RAT. Un paso crucial es la clasificación de los datos por sensibilidad. El personal debe ser capacitado para identificar y etiquetar no solo datos personales comunes, sino también datos sensibles como los de salud u origen étnico. Se debe prestar especial atención a la categoría de "situación socioeconómica", una novedad de la ley chilena que la considera un dato sensible, lo que implica que información como el nivel de ingresos o el historial crediticio debe ser tratada con el máximo nivel de protección.1  
4. **Mapeo de Flujos y Definición de Retención:** El inventario debe ser un mapa dinámico. Se deben documentar los flujos de datos internos (ej. del CRM al ERP) y los flujos externos a terceros (ej. a una agencia de marketing). Finalmente, el DPO, junto con el área legal y los dueños de los procesos, debe definir políticas de retención claras para cada categoría de datos (ej. "Las facturas se conservan por 6 años por obligación tributaria") y establecer un procedimiento para su eliminación segura.1

### **Matriz de Roles y Responsabilidades (RACI)**

Para clarificar quién hace qué en este proceso colaborativo y evitar vacíos de responsabilidad, se puede utilizar una matriz RACI (Responsible, Accountable, Consulted, Informed). Esta herramienta de gestión traduce la directriz general de "formar un equipo" en un protocolo de gobernanza accionable.1

**Tabla 2: Matriz de Roles y Responsabilidades (RACI) para el Mapeo de Datos**

| Actividad/Tarea | DPO | Equipo Legal | Equipo de TI | RRHH | Marketing/Ventas | Operaciones |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| **Identificar Actividades de Tratamiento** | A | C | I | R | R | R |
| **Definir Finalidades del Tratamiento** | A | C | I | R | R | R |
| **Determinar Base Legal** | A | R | I | C | C | C |
| **Clasificar Categorías de Datos** | A | C | I | R | R | R |
| **Mapear Flujos de Datos a Terceros** | A | C | R | C | C | C |
| **Definir Plazos de Retención** | A | R | C | C | C | C |
| **Describir Medidas de Seguridad** | A | C | R | I | I | I |
| **Aprobar Registro en el RAT** | A | C | I | C | C | C |

*Leyenda: R \= Responsible (Responsable de ejecutar), A \= Accountable (Máximo responsable), C \= Consulted (Consultado), I \= Informed (Informado).*

## **Sección 4: El RAT en Acción: Casos de Uso Prácticos para la Gestión de Riesgos**

Un Registro de Actividades de Tratamiento bien construido y mantenido no es un mero ejercicio burocrático, sino una herramienta de gestión de riesgos indispensable y el "índice maestro" de toda la gobernanza de datos de una organización. No es el repositorio de todos los documentos de cumplimiento, sino el nexo que los conecta. Por ejemplo, una actividad como "Email Marketing" en el RAT se vincula lógicamente con la base de licitud "Consentimiento" (cuyos registros están en un módulo específico), con el "Encargado" (cuyo contrato DPA está en el gestor de proveedores) y, potencialmente, con una Evaluación de Impacto si se utiliza perfilamiento avanzado. A continuación, se presentan dos casos de uso que ilustran su valor práctico.

### **Caso de Uso 1: Respuesta Eficiente a Solicitudes de Derechos ARCOPOL**

* **Escenario:** Un cliente ejerce su derecho de acceso, solicitando una copia de todos los datos personales que la empresa trata sobre él.4 Según la ley, la empresa dispone de un plazo máximo de 30 días corridos para entregar una respuesta completa y detallada.7  
* **Solución con un RAT:** Sin un RAT, el Delegado de Protección de Datos (DPO) se enfrentaría a la ardua tarea de buscar a ciegas en todos los sistemas de la empresa (CRM, ERP, sistemas de marketing, etc.), un proceso propenso a errores y que consumiría un tiempo valioso. Con un RAT centralizado, el flujo de trabajo se simplifica drásticamente. El DPO puede consultar el registro filtrando por "Categoría de Titular \= Cliente". Esta simple acción devuelve una lista curada de todas las actividades de tratamiento que afectan a los clientes, como "Facturación", "Soporte Post-Venta", "Gestión de la Base de Clientes" y "Campañas de Marketing por Email". Para cada una de estas actividades, el RAT ya tiene documentado qué categorías de datos se tratan (ej. nombre, email, historial de compras), con qué finalidad, en qué sistemas se almacenan, con qué terceros se comparten y por cuánto tiempo se conservan.1 Esta información pre-mapeada permite al DPO localizar rápidamente los datos y generar un informe de acceso completo y preciso en una fracción del tiempo, asegurando el cumplimiento de los plazos legales y demostrando un control efectivo sobre los datos personales.9

### **Caso de Uso 2: Identificación Proactiva de la Necesidad de una EIPD**

* **Escenario:** El equipo de Marketing propone un nuevo proyecto para implementar un sistema de inteligencia artificial (IA) que analizará el comportamiento de navegación y compra de los clientes en el sitio web. El objetivo es crear perfiles de clientes detallados para ofrecer descuentos y productos altamente personalizados de forma automatizada.  
* **Solución con un RAT:** Este proyecto, antes de su lanzamiento, debe ser documentado como una nueva actividad de tratamiento en el RAT. Durante este proceso de registro, el sistema (o el DPO al revisar la entrada) detectaría inmediatamente varios "gatillos" de alto riesgo que, según el Artículo 15 ter de la ley, obligan a realizar una Evaluación de Impacto en la Protección de Datos (EIPD o DPIA, por sus siglas en inglés) *antes* de iniciar el tratamiento.1 Los gatillos identificados serían:  
  1. **Decisiones Automatizadas y Perfilamiento:** El campo correspondiente en el RAT se marcaría como "Sí", ya que el proyecto se basa en la elaboración de perfiles para tomar decisiones que afectan significativamente al titular (ej. qué precio o producto se le ofrece).1  
  2. **Tratamiento de Datos Sensibles:** El análisis del comportamiento de compra podría inferir la "situación socioeconómica" de un cliente, una categoría de dato considerada sensible por la ley chilena, lo que eleva el nivel de riesgo.1  
  3. **Uso de Nuevas Tecnologías y Tratamiento a Gran Escala:** El proyecto implica el uso de "nuevas tecnologías" (IA) y un "tratamiento a gran escala" de los datos de los clientes.1

De esta manera, el RAT actúa como un sistema de alerta temprana. No solo documenta el tratamiento propuesto, sino que obliga a la organización a realizar un análisis de riesgos formal y a implementar medidas de mitigación *antes* de que el proyecto comience. Esto encarna el principio de privacidad por diseño, integrando la protección de datos en el ciclo de vida del proyecto desde su concepción y no como una ocurrencia tardía.17

## **Sección 5: Manual de Integración Técnica: Conectando el Ecosistema Empresarial Chileno**

### **5.1. Arquitectura y Principios de Diseño de la API**

La capacidad de un sistema de cumplimiento para conectarse con las herramientas operacionales donde los datos son tratados es fundamental. Adoptar una estrategia de desarrollo "API-first" no es una característica técnica opcional, sino una decisión de negocio estratégica. Una API robusta y bien documentada crea "barreras de salida" (defensive moat), ya que una vez que una empresa ha invertido en automatizar flujos de datos desde sus sistemas CRM y RRHH, el costo de migrar a un competidor sin estas integraciones se vuelve prohibitivamente alto. Además, fomenta un ecosistema de socios que pueden construir soluciones sobre la plataforma, aumentando su valor.1

El diseño de la API debe seguir los principios RESTful, que son el estándar de la industria 25:

* **Recursos basados en sustantivos:** Las URIs deben representar recursos (ej. /activities, /processors) y no acciones.25  
* **Uso de plurales:** Las colecciones de recursos deben estar en plural (ej. GET /api/v1/activities para listar todas las actividades).25  
* **Uso correcto de métodos HTTP:** Las acciones se definen por el método HTTP: GET para leer, POST para crear, PUT para actualizar/reemplazar, y DELETE para eliminar.26  
* **Estructura jerárquica:** Las relaciones se representan en la ruta (ej. GET /api/v1/activities/{activityId}).25

El formato de datos estándar para todas las comunicaciones de la API debe ser JSON, por su ligereza y universalidad en las APIs web modernas. La API debe ser documentada rigurosamente utilizando la especificación OpenAPI (anteriormente Swagger), lo que permite la generación automática de documentación interactiva y kits de desarrollo de software (SDKs) para los clientes.1 Finalmente, la seguridad debe estar integrada por diseño, siguiendo prácticas como las delineadas en el OWASP Top 10 y cifrando todos los datos en tránsito (TLS 1.2+) y en reposo. Legalmente, la relación con los clientes que consumen la API debe estar regulada por un Anexo de Encargado de Tratamiento (DPA) robusto, que defina las obligaciones y responsabilidades de ambas partes.1

### **5.2. Guía de Autenticación y Autorización**

Para asegurar que solo las aplicaciones autorizadas puedan acceder a la API, es imperativo utilizar el estándar OAuth 2.0. Este protocolo permite la autorización delegada, donde un usuario puede conceder a una aplicación un acceso limitado a sus datos sin compartir sus credenciales directamente.1 Los roles clave en OAuth 2.0 son: el

**Cliente** (la aplicación que solicita acceso), el **Servidor de Recursos** (la API que protege los datos), el **Propietario del Recurso** (el usuario final) y el **Servidor de Autorización** (el sistema que emite los tokens de acceso).33

Para las integraciones de servidor a servidor, como las de un ERP o un sistema de RRHH con la plataforma RAT, el flujo más seguro y recomendado es el **"Authorization Code Flow"**.34 Este flujo se desarrolla en los siguientes pasos:

1. **Redirección al Servidor de Autorización:** La aplicación cliente (ej. el ERP) redirige al navegador del usuario al punto de conexión /authorize del servidor de autorización. La solicitud incluye parámetros como client\_id (identificador público del cliente), redirect\_uri (a dónde devolver al usuario), response\_type=code, scope (los permisos solicitados, ej. activities:write) y un valor state para prevenir ataques CSRF.34  
2. **Autenticación y Consentimiento del Usuario:** El usuario se autentica en el servidor de autorización (si no lo ha hecho ya) y ve una pantalla de consentimiento que detalla los permisos que la aplicación cliente está solicitando. Si el usuario aprueba, continúa el flujo.  
3. **Recepción del Código de Autorización:** El servidor de autorización redirige al navegador del usuario de vuelta a la redirect\_uri especificada. En la URL de redirección, se incluye un authorization\_code de un solo uso y corta duración, junto con el valor state original.36  
4. **Intercambio del Código por un Token de Acceso:** Este es el paso crucial de seguridad. El servidor de la aplicación cliente (el backend del ERP) realiza una solicitud directa (back-channel) al punto de conexión /token del servidor de autorización. Esta solicitud incluye el authorization\_code recibido, junto con sus credenciales seguras: el client\_id y el client\_secret. Como esta comunicación ocurre de servidor a servidor, el client\_secret nunca se expone en el navegador.34  
5. **Recepción de Tokens:** Si el código y las credenciales son válidos, el servidor de autorización responde con un access\_token y, opcionalmente, un refresh\_token. El access\_token se utilizará para autenticar las futuras llamadas a la API, incluyéndolo en la cabecera Authorization como un "Bearer token".36

La elección del flujo de OAuth 2.0 es crítica para la seguridad. La siguiente tabla justifica por qué el "Authorization Code Flow" es la opción superior para este caso de uso.

**Tabla 3: Comparativa de Flujos de OAuth 2.0 y Justificación de la Elección**

| Flujo | Caso de Uso Principal | Nivel de Seguridad | Ventajas | Desventajas |
| :---- | :---- | :---- | :---- | :---- |
| **Authorization Code** | Aplicaciones web con backend (confidenciales), aplicaciones móviles. | **Alto** | El access\_token nunca se expone al navegador. El client\_secret se mantiene seguro. Admite refresh\_tokens. | Ligeramente más complejo de implementar que otros flujos. |
| **Implicit Grant** | SPAs (Single-Page Applications) sin backend. | **Bajo (Obsoleto)** | Simple de implementar. | El access\_token se expone directamente al navegador, vulnerable a ataques XSS. No admite refresh\_tokens. |
| **Resource Owner Password Credentials** | Aplicaciones de primera parte altamente confiables (ej. apps móviles oficiales). | **Muy Bajo (Desaconsejado)** | Simple para el usuario (solo usuario/contraseña). | La aplicación cliente maneja directamente las credenciales del usuario, rompiendo el principio de delegación de OAuth. |
| **Client Credentials** | Comunicaciones máquina a máquina (M2M) sin intervención del usuario. | **Alto** | Simple y directo para servicios de backend. | No se puede usar para actuar en nombre de un usuario; solo para acciones propias de la aplicación. |

### **5.3. Manual para Clientes del Sistema: Configuración de Integraciones Nativas**

Esta sección está dirigida a los usuarios finales del sistema (ej. DPO, administradores de TI) para guiarles en la conexión de la plataforma RAT con su software empresarial existente.

#### **Integración con ERPs (Ej. Defontana)**

* **Objetivo:** Sincronizar automáticamente actividades de tratamiento como "Gestión de Proveedores" y "Facturación a Clientes" desde Defontana al RAT.  
* **Pasos:**  
  1. **Obtener Credenciales:** Inicie sesión en su cuenta de Defontana. Navegue a la sección de configuración de API o integraciones para generar sus credenciales de API (Client ID y Client Secret).37  
  2. **Configurar en la Plataforma RAT:** En el sistema RAT, vaya a la sección Integraciones \> Añadir Nueva Integración y seleccione "Defontana".  
  3. **Autenticar:** Ingrese el Client ID y Client Secret obtenidos. El sistema le redirigirá a Defontana para autorizar la conexión (utilizando el flujo OAuth 2.0 descrito anteriormente).  
  4. **Mapear y Sincronizar:** Una vez conectado, el sistema presentará una interfaz para mapear los datos. Por ejemplo, podrá asociar la entidad "Proveedores" de Defontana con la categoría "Encargados del Tratamiento" en el RAT. Cada vez que se cree un nuevo proveedor en Defontana, se creará automáticamente una entrada correspondiente en el RAT.

#### **Integración con Sistemas de RRHH (Ej. Buk)**

* **Objetivo:** Automatizar el registro en el RAT de actividades como "Gestión de Nómina", "Reclutamiento y Selección" y "Capacitaciones".  
* **Pasos:**  
  1. **Obtener API Key:** En su plataforma Buk, acceda a la sección de administración o integraciones para generar una API Key específica para la conexión.40  
  2. **Configurar en la Plataforma RAT:** En la sección de Integraciones, seleccione "Buk" e introduzca la API Key.  
  3. **Definir Reglas de Sincronización:** Configure reglas para que, por ejemplo, cada vez que se inicie un nuevo proceso de selección en Buk, se cree un borrador de actividad de tratamiento "Reclutamiento" en el RAT, pre-poblado con las categorías de datos de los candidatos y una política de retención estándar (ej. "6 meses para candidatos no seleccionados").

#### **Integración con CRMs (Ej. HubSpot)**

* **Objetivo:** Registrar automáticamente en el RAT actividades como "Campañas de Marketing por Email" y "Gestión de Leads" desde HubSpot.  
* **Pasos:**  
  1. **Autorizar Conexión:** En la plataforma RAT, seleccione "HubSpot" en la sección de integraciones. Será redirigido a HubSpot para iniciar sesión y autorizar el acceso de la plataforma a los datos de su cuenta.42  
  2. **Configurar Disparadores (Triggers):** Establezca disparadores automáticos. Por ejemplo, configure una regla para que cada vez que se cree una nueva lista de contactos para una campaña de email en HubSpot, se genere automáticamente una nueva actividad de tratamiento en el RAT con la finalidad "Marketing Directo", la base legal "Consentimiento", y las categorías de datos correspondientes (nombre, email). Esto permite al DPO tener una visibilidad en tiempo real de las nuevas actividades de tratamiento y asegurar su conformidad.

### **5.4. Manual para Desarrolladores Externos: Consumo de la API Pública**

Esta sección está dirigida a desarrolladores de software de terceros que deseen integrar sus propias aplicaciones con la plataforma RAT.

#### **Onboarding y Entorno de Pruebas (Sandbox)**

Para comenzar a desarrollar, siga estos pasos:

1. **Registro de Aplicación:** Regístrese en el portal de desarrolladores de la plataforma para crear una nueva aplicación. Se le proporcionará un client\_id y un client\_secret para el entorno de pruebas (sandbox).  
2. **Configurar redirect\_uri:** Especifique las URIs de redirección válidas para su aplicación. Estas son las URLs a las que nuestro servidor de autorización redirigirá a los usuarios después de que autoricen su aplicación.  
3. **Probar en Sandbox:** Utilice las credenciales de sandbox para desarrollar y probar su integración contra un entorno aislado que no afecta los datos de producción.44 El entorno sandbox replicará completamente la funcionalidad de la API de producción.  
4. **Solicitar Acceso a Producción:** Una vez que su integración esté completa y probada, puede solicitar credenciales de producción a través del portal de desarrolladores.

#### **Especificación Detallada de Endpoints de la API**

La API RESTful proporciona un control programático completo sobre el Registro de Actividades de Tratamiento. A continuación se detallan los endpoints clave.

**Tabla 4: Especificación Detallada de Endpoints de la API**

| Endpoint y Método HTTP | Descripción | Parámetros de Ruta | Parámetros de Consulta | Cabeceras Requeridas | Ejemplo de Request Body (JSON) | Ejemplo de Response Body (JSON) |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| **POST /api/v1/activities** | Crea una nueva actividad de tratamiento en el RAT. | Ninguno | Ninguno | Authorization: Bearer \<token\> Content-Type: application/json | { "responsible\_party": { "name": "Mi Empresa SpA" }, "treatment\_purpose": { "description": "Gestión de nómina de empleados", "is\_consent\_based": false },... } | 201 Created { "status": "success", "activity\_id": "uuid-1234" } |
| **GET /api/v1/activities/{id}** | Obtiene los detalles de una actividad de tratamiento específica. | id: UUID de la actividad. | Ninguno | Authorization: Bearer \<token\> | N/A | 200 OK { "activity\_id": "uuid-1234", "purpose": "...",... } |
| **PUT /api/v1/activities/{id}** | Actualiza una actividad de tratamiento existente. | id: UUID de la actividad. | Ninguno | Authorization: Bearer \<token\> Content-Type: application/json | { "treatment\_purpose": { "description": "Gestión de remuneraciones y beneficios" } } | 200 OK { "status": "success", "activity\_id": "uuid-1234" } |
| **GET /api/v1/activities** | Lista todas las actividades de tratamiento con filtros y paginación. | Ninguno | status (ej. 'active') limit (ej. 20\) offset (ej. 40\) | Authorization: Bearer \<token\> | N/A | 200 OK { "data": \[ {...}, {...} \], "total": 150 } |
| **GET /api/v1/rat/export** | Exporta el RAT completo en un formato específico. | Ninguno | format: 'json' o 'csv'. | Authorization: Bearer \<token\> | N/A | 200 OK \[ { "activity\_id": "...",... }, {...} \] |

#### **Ejemplos de Código**

A continuación se presentan fragmentos de código para realizar operaciones comunes.

**Python: Crear una nueva actividad de tratamiento**

Python

import requests  
import json

access\_token \= "SU\_ACCESS\_TOKEN"  
api\_url \= "https://api.plataforma-rat.cl/api/v1/activities"

headers \= {  
    "Authorization": f"Bearer {access\_token}",  
    "Content-Type": "application/json"  
}

new\_activity\_data \= {  
    "responsible\_party": {  
        "name": "Empresa Ejemplo SpA",  
        "contact\_details": "contacto@ejemplo.cl"  
    },  
    "treatment\_purpose": {  
        "description": "Proceso de reclutamiento y selección de personal.",  
        "is\_consent\_based": True,  
        "consent\_withdrawal\_info": "El candidato puede retirar su consentimiento en cualquier momento contactando a rrhh@ejemplo.cl."  
    },  
    "data\_categories": {  
        "data\_subjects": \["Candidatos a empleo"\],  
        "personal\_data":  
    }  
    \#... completar los demás campos del RAT  
}

response \= requests.post(api\_url, headers=headers, data=json.dumps(new\_activity\_data))

if response.status\_code \== 201:  
    print("Actividad creada exitosamente:")  
    print(response.json())  
else:  
    print(f"Error al crear la actividad: {response.status\_code}")  
    print(response.text)

**JavaScript (Node.js): Exportar el RAT completo en formato JSON**

JavaScript

const axios \= require('axios');

const accessToken \= 'SU\_ACCESS\_TOKEN';  
const apiUrl \= 'https://api.plataforma-rat.cl/api/v1/rat/export';

async function exportRat() {  
  try {  
    const response \= await axios.get(apiUrl, {  
      headers: {  
        'Authorization': \`Bearer ${accessToken}\`  
      },  
      params: {  
        'format': 'json'  
      }  
    });

    if (response.status \=== 200) {  
      console.log('Exportación del RAT exitosa:');  
      // response.data contendrá el array de objetos de actividades  
      console.log(JSON.stringify(response.data, null, 2));  
    }  
  } catch (error) {  
    console.error(\`Error al exportar el RAT: ${error.response.status}\`);  
    console.error(error.response.data);  
  }  
}

exportRat();

## **Sección 6: Conclusiones y Recomendaciones Estratégicas**

El análisis del nuevo marco regulatorio de protección de datos en Chile, la arquitectura técnica requerida y el panorama empresarial converge en una conclusión clara: el cumplimiento de la Ley N° 21.719 exige una aproximación que sea tanto estratégica como tecnológicamente robusta. El Registro de Actividades de Tratamiento (RAT) no debe ser visto como una carga administrativa, sino como el núcleo de un programa de gobernanza de datos proactivo.

### **Resumen de Factores Críticos de Éxito**

* **Vender "Tranquilidad", no solo Software:** La principal motivación del mercado es la mitigación del riesgo financiero y reputacional derivado de las nuevas y severas sanciones. La comunicación debe centrarse en los beneficios de negocio: seguridad, confianza y control en un entorno regulatorio incierto.1  
* **Construir sobre una Base Técnica Abierta (API-First):** Una arquitectura abierta es un imperativo estratégico. La capacidad de integrarse con el ecosistema de software empresarial chileno (RRHH, CRM, ERP) crea un producto más valioso, con mayores barreras de salida y defendible frente a la competencia.1  
* **Usabilidad para Usuarios No Legales:** La tarea de documentar las actividades de tratamiento recaerá a menudo en profesionales de negocio (marketing, RRHH). Un sistema que los guíe a través del proceso con un lenguaje claro y flujos de trabajo intuitivos tendrá una ventaja competitiva masiva.1  
* **Aprovechar el Conocimiento del RGPD:** La similitud con la normativa europea es una ventaja que permite anticipar las necesidades del mercado y las expectativas del regulador, adoptando soluciones y mejores prácticas ya probadas.1

### **Hoja de Ruta Recomendada para la Adopción Empresarial**

Se recomienda un enfoque por fases para que las organizaciones implementen su programa de cumplimiento, alineado con la madurez de sus operaciones de datos:

1. **Fase 1 (Cumplimiento Fundamental):** El primer y más urgente paso es realizar el mapeo de datos interno y generar la versión inicial del RAT. Este esfuerzo debe involucrar a todos los departamentos clave y centrarse en documentar todas las actividades de tratamiento existentes.  
2. **Fase 2 (Gestión de Riesgos Avanzada):** Una vez establecido el inventario, las organizaciones deben enfocarse en los procesos de mayor riesgo. Esto implica implementar un procedimiento formal para realizar Evaluaciones de Impacto (EIPD) para nuevos proyectos y establecer una gestión centralizada de los contratos (DPAs) con todos los proveedores que actúen como encargados del tratamiento.1  
3. **Fase 3 (Madurez Operativa):** En esta etapa, la organización debe integrar y automatizar los procesos de cara al titular de los datos. Esto incluye la implementación de una plataforma para la gestión centralizada del consentimiento y la creación de un portal para recibir y gestionar de forma trazable las solicitudes de derechos ARCOPOL.1

### **Visión a Futuro**

La Ley N° 21.719 marca el comienzo de una nueva era de la privacidad en Chile. Las organizaciones que aborden este desafío de manera proactiva, invirtiendo en herramientas y procesos que integren la protección de datos en el tejido de sus operaciones, no solo evitarán sanciones, sino que construirán una ventaja competitiva basada en la confianza. El RAT, cuando se implementa de manera estratégica y se integra tecnológicamente con el ecosistema empresarial, trasciende su obligación legal para convertirse en un activo que genera valor, optimiza procesos y mitiga riesgos de manera inteligente y continua.

#### **Obras citadas**

1. Plan Estratégico para un Sistema Lí.txt  
2. Ley de protección de datos personales en Chile: guía completa \- Prey Project, fecha de acceso: agosto 31, 2025, [https://preyproject.com/es/blog/ley-de-proteccion-de-datos-en-chile](https://preyproject.com/es/blog/ley-de-proteccion-de-datos-en-chile)  
3. Ley 21.719: Regulación y Tratamiento de Datos Personales y Creación de la Agencia de Protección de Datos, fecha de acceso: agosto 31, 2025, [https://www.uhc.cl/wp-content/uploads/2025/02/proteccion-datos-personales.pdf](https://www.uhc.cl/wp-content/uploads/2025/02/proteccion-datos-personales.pdf)  
4. Guía simplificada Ley 21.719: Protección de Datos Personales en Chile \- Valuetech, fecha de acceso: agosto 31, 2025, [https://www.valuetech.cl/guia-simplificada-ley-21-719-proteccion-de-datos-personales-en-chile/](https://www.valuetech.cl/guia-simplificada-ley-21-719-proteccion-de-datos-personales-en-chile/)  
5. Descripción y síntesis de la ley N° 21.719, que regula la ... \- BCN, fecha de acceso: agosto 31, 2025, [https://www.bcn.cl/obtienearchivo?id=repositorio/10221/37137/1/Informe\_12\_25\_Ley\_Datos\_Personales\_rev.pdf](https://www.bcn.cl/obtienearchivo?id=repositorio/10221/37137/1/Informe_12_25_Ley_Datos_Personales_rev.pdf)  
6. GUÍA PARA LA IMPLEMENTACIÓN DE LA LEY DE PROTECCIÓN ..., fecha de acceso: agosto 31, 2025, [https://www.ccs.cl/wp-content/uploads/2024/09/GUIA\_DATOS\_PERSONALES.pdf](https://www.ccs.cl/wp-content/uploads/2024/09/GUIA_DATOS_PERSONALES.pdf)  
7. La nueva Ley de Privacidad de Datos de Chile: Una guía de cumplimiento para la legislación aprobada 21.719 \- BigID, fecha de acceso: agosto 31, 2025, [https://bigid.com/es/blog/chile-new-data-privacy-law-21-719/](https://bigid.com/es/blog/chile-new-data-privacy-law-21-719/)  
8. Ejemplos de Registro de Actividades de Tratamiento de Datos \- Seifti, fecha de acceso: agosto 31, 2025, [https://seifti.io/es/ejemplos-de-registro-de-actividades-de-tratamiento-de-datos/](https://seifti.io/es/ejemplos-de-registro-de-actividades-de-tratamiento-de-datos/)  
9. Guía para ejercer los derechos de Acceso, Rectificación, Cancelación y Oposición de datos personales \- Gob MX, fecha de acceso: agosto 31, 2025, [https://www.gob.mx/cms/uploads/attachment/file/428335/DDP\_Gu\_a\_derechos\_ARCO\_13Dic18.pdf](https://www.gob.mx/cms/uploads/attachment/file/428335/DDP_Gu_a_derechos_ARCO_13Dic18.pdf)  
10. Ejercicio de Derechos ARCO \- Secretaría de Relaciones Exteriores, fecha de acceso: agosto 31, 2025, [https://sre.gob.mx/component/phocadownload/category/6-rendicion-de-cuentas?download=1245:guia-para-acceder-a-los-derechos-arco](https://sre.gob.mx/component/phocadownload/category/6-rendicion-de-cuentas?download=1245:guia-para-acceder-a-los-derechos-arco)  
11. EL EJERCICIO DE DERECHOS ARCO Y MEDIOS DE IMPUGNACIÓN \- IDAIPQROO, fecha de acceso: agosto 31, 2025, [http://www.idaipqroo.org.mx/archivos/institucion/datos-personales/material\_de\_consulta/3er\_taller\_datos\_personales/ejercicio\_de\_derechos\_arco\_y\_medios\_de\_impugnacion\_2.pdf](http://www.idaipqroo.org.mx/archivos/institucion/datos-personales/material_de_consulta/3er_taller_datos_personales/ejercicio_de_derechos_arco_y_medios_de_impugnacion_2.pdf)  
12. Guía Práctica para ejercer el Derecho a la Protección de Datos Personales (INAI) \- ICHITAIP, fecha de acceso: agosto 31, 2025, [https://www.ichitaip.org/l/wp-content/uploads/capacitacion/files/Datos%20Personales/Publicaciones%20y%20guias/01GuiaPracticaEjercerelDerecho%20S.pdf](https://www.ichitaip.org/l/wp-content/uploads/capacitacion/files/Datos%20Personales/Publicaciones%20y%20guias/01GuiaPracticaEjercerelDerecho%20S.pdf)  
13. Derechos ARCO: Conoce qué son, tipos y quién puede solicitarlos \- Legitec, fecha de acceso: agosto 31, 2025, [https://legitec.com/derechos-arco-que-son/](https://legitec.com/derechos-arco-que-son/)  
14. Evaluación de Impacto DPIA: qué es y cuándo es necesaria en protección de datos, fecha de acceso: agosto 31, 2025, [https://legalveritas.es/evaluacion-impacto-dpia-proteccion-de-datos/](https://legalveritas.es/evaluacion-impacto-dpia-proteccion-de-datos/)  
15. listas de tipos de tratamientos de datos que requieren evaluación de impacto relativa a protección de, fecha de acceso: agosto 31, 2025, [https://www.aepd.es/documento/listas-dpia-es-35-4.pdf](https://www.aepd.es/documento/listas-dpia-es-35-4.pdf)  
16. Evaluación del Impacto de Protección de Datos (DPIA) \- Google Cloud, fecha de acceso: agosto 31, 2025, [https://cloud.google.com/privacy/data-protection-impact-assessment?hl=es-419](https://cloud.google.com/privacy/data-protection-impact-assessment?hl=es-419)  
17. La AEPD publica el listado de tratamientos en los que no es necesario realizar una evaluación de impacto, fecha de acceso: agosto 31, 2025, [https://www.aepd.es/prensa-y-comunicacion/notas-de-prensa/la-aepd-publica-el-listado-de-tratamientos-en-los-que-no-es](https://www.aepd.es/prensa-y-comunicacion/notas-de-prensa/la-aepd-publica-el-listado-de-tratamientos-en-los-que-no-es)  
18. Evalúa-Riesgo RGPD v2 | AEPD \- Agencia Española de Protección de Datos, fecha de acceso: agosto 31, 2025, [https://www.aepd.es/guias-y-herramientas/herramientas/evalua-riesgo-rgpd](https://www.aepd.es/guias-y-herramientas/herramientas/evalua-riesgo-rgpd)  
19. 2.10.- EVALUACIÓN DE IMPACTO | AEPD \- Agencia Española de Protección de Datos, fecha de acceso: agosto 31, 2025, [https://www.aepd.es/preguntas-frecuentes/2-rgpd/10-evaluacion-de-impacto](https://www.aepd.es/preguntas-frecuentes/2-rgpd/10-evaluacion-de-impacto)  
20. Herramientas gratuitas de la aepd, fecha de acceso: agosto 31, 2025, [https://www.probonoespana.org/wp-content/uploads/Instrucciones-caso-practico.pdf](https://www.probonoespana.org/wp-content/uploads/Instrucciones-caso-practico.pdf)  
21. Guía práctica para la protección de datos personales en salud | Fundar, fecha de acceso: agosto 31, 2025, [https://fund.ar/wp-content/uploads/2023/03/Fundar\_Ciecti\_Guia\_Proteccion\_Datos\_Salud\_WEB.pdf](https://fund.ar/wp-content/uploads/2023/03/Fundar_Ciecti_Guia_Proteccion_Datos_Salud_WEB.pdf)  
22. La AEPD presenta unas guías prácticas para acompañar a las entidades en las evaluaciones de riesgos sobre protección de datos \- finReg360, fecha de acceso: agosto 31, 2025, [https://finreg360.com/alerta/la-aepd-presenta-unas-guias-practicas-para-acompanar-a-las-entidades-en-las-evaluaciones-de-riesgos-sobre-proteccion-de-datos/](https://finreg360.com/alerta/la-aepd-presenta-unas-guias-practicas-para-acompanar-a-las-entidades-en-las-evaluaciones-de-riesgos-sobre-proteccion-de-datos/)  
23. Guía del Reglamento General de Protección de Datos para responsables de tratamiento, fecha de acceso: agosto 31, 2025, [https://www.avpd.eus/contenidos/informacion/20161118/es\_def/adjuntos/guiaRGPDpararesponsablestratamiento-es.pdf](https://www.avpd.eus/contenidos/informacion/20161118/es_def/adjuntos/guiaRGPDpararesponsablestratamiento-es.pdf)  
24. Guía de Evaluación de Impacto en la Protección de Datos \- Argentina.gob.ar, fecha de acceso: agosto 31, 2025, [https://www.argentina.gob.ar/sites/default/files/guia\_final.pdf](https://www.argentina.gob.ar/sites/default/files/guia_final.pdf)  
25. Procedimientos recomendados para el diseño de LA API web RESTful, fecha de acceso: agosto 31, 2025, [https://learn.microsoft.com/es-es/azure/architecture/best-practices/api-design](https://learn.microsoft.com/es-es/azure/architecture/best-practices/api-design)  
26. What is RESTful API? \- AWS, fecha de acceso: agosto 31, 2025, [https://aws.amazon.com/what-is/restful-api/](https://aws.amazon.com/what-is/restful-api/)  
27. Consejos para diseñar una API REST | by Chema Diez del Corral | Secuoyas Experience, fecha de acceso: agosto 31, 2025, [https://medium.com/secuoyas/consejos-para-dise%C3%B1ar-una-api-rest-4e92b9acfda5](https://medium.com/secuoyas/consejos-para-dise%C3%B1ar-una-api-rest-4e92b9acfda5)  
28. Las Mejores Prácticas de Endpoints REST que Todo Desarrollador Debe Conocer, fecha de acceso: agosto 31, 2025, [https://codigomovil.mx/blog/las-mejores-practicas-de-endpoints-rest-que-todo-desarrollador-debe-conocer](https://codigomovil.mx/blog/las-mejores-practicas-de-endpoints-rest-que-todo-desarrollador-debe-conocer)  
29. APIs RESTful: Principios y Mejores Prácticas \- API7.ai, fecha de acceso: agosto 31, 2025, [https://api7.ai/es/learning-center/api-101/restful-api-best-practices](https://api7.ai/es/learning-center/api-101/restful-api-best-practices)  
30. Mejores prácticas de API REST \- AppMaster, fecha de acceso: agosto 31, 2025, [https://appmaster.io/es/blog/mejores-practicas-de-la-api-de-descanso](https://appmaster.io/es/blog/mejores-practicas-de-la-api-de-descanso)  
31. Las 10 mejores herramientas de documentación de OpenAPI (gratuitas y de pago) \- Apidog, fecha de acceso: agosto 31, 2025, [https://apidog.com/es/blog/best-openapi-documentation-tools-4/](https://apidog.com/es/blog/best-openapi-documentation-tools-4/)  
32. Securing Internet & SaaS APIs with OAuth 2.0 \- Zscaler Help, fecha de acceso: agosto 31, 2025, [https://help.zscaler.com/unified/securing-internet-saas-apis-oauth-2-0](https://help.zscaler.com/unified/securing-internet-saas-apis-oauth-2-0)  
33. OAuth 2.0 and OpenID Connect overview \- Okta Developer, fecha de acceso: agosto 31, 2025, [https://developer.okta.com/docs/concepts/oauth-openid/](https://developer.okta.com/docs/concepts/oauth-openid/)  
34. Implement authorization by grant type | Okta Developer, fecha de acceso: agosto 31, 2025, [https://developer.okta.com/docs/guides/implement-grant-type/authcode/main/](https://developer.okta.com/docs/guides/implement-grant-type/authcode/main/)  
35. Authorization Code Flow \- Auth0, fecha de acceso: agosto 31, 2025, [https://auth0.com/docs/get-started/authentication-and-authorization-flow/authorization-code-flow](https://auth0.com/docs/get-started/authentication-and-authorization-flow/authorization-code-flow)  
36. What is the OAuth 2.0 Authorization Code Grant Type? | Okta ..., fecha de acceso: agosto 31, 2025, [https://developer.okta.com/blog/2018/04/10/oauth-authorization-code-grant-type](https://developer.okta.com/blog/2018/04/10/oauth-authorization-code-grant-type)  
37. Swagger UI, fecha de acceso: agosto 31, 2025, [https://onboarding-dashboard-ecs-api-cert.defontana.com/index.html](https://onboarding-dashboard-ecs-api-cert.defontana.com/index.html)  
38. Swagger UI \- Defontana, fecha de acceso: agosto 31, 2025, [https://replapi-v2.defontana.com/swagger/index.html](https://replapi-v2.defontana.com/swagger/index.html)  
39. Swagger UI \- Defontana, fecha de acceso: agosto 31, 2025, [https://api.defontana.com/swagger/index.html](https://api.defontana.com/swagger/index.html)  
40. Buk integration \- TestGorilla Support, fecha de acceso: agosto 31, 2025, [https://support.testgorilla.com/hc/en-us/articles/13639988181147-Buk-integration](https://support.testgorilla.com/hc/en-us/articles/13639988181147-Buk-integration)  
41. API Buk Capacitaciones \- API Platform, fecha de acceso: agosto 31, 2025, [https://superdemo.boostworld.com/capacitaciones/docs](https://superdemo.boostworld.com/capacitaciones/docs)  
42. Mejores CRM para Pequeñas Empresas \[TOP 8\] \- Isvisoft, fecha de acceso: agosto 31, 2025, [https://isvisoft.com/software-crm-pequenas-empresas/](https://isvisoft.com/software-crm-pequenas-empresas/)  
43. Los 8 mejores CRM para Pymes en 2025 \[y Guía de uso\] \- SoftDoit, fecha de acceso: agosto 31, 2025, [https://www.softwaredoit.es/software-crm/mejor-crm-pymes-comparacion.html](https://www.softwaredoit.es/software-crm/mejor-crm-pymes-comparacion.html)  
44. Privacy Sandbox en Android | Google for Developers, fecha de acceso: agosto 31, 2025, [https://developers.google.com/admob/android/privacy/sandbox?hl=es-419](https://developers.google.com/admob/android/privacy/sandbox?hl=es-419)  
45. Factura Digital API v5, fecha de acceso: agosto 31, 2025, [https://docs.facturadigital.com.mx/](https://docs.facturadigital.com.mx/)