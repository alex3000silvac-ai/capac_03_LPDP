#!/usr/bin/env node

/**
 * 🧠 AGENTE DE PRUEBAS HUMANO INTELIGENTE - SISTEMA LPDP
 * 
 * Simula un Delegado de Protección de Datos (DPO) real utilizando el sistema
 * Se enfoca en errores de LÓGICA DE NEGOCIO, no solo conectividad
 * 
 * CARACTERÍSTICAS:
 * - Entiende el flujo real de cumplimiento LPDP
 * - Detecta errores funcionales y de experiencia usuario
 * - Integra OpenAI para análisis contextual inteligente
 * - Prueba flujos completos extremo a extremo
 * - Reporta errores como lo haría un usuario real
 * 
 * Versión: 2.0 - Para SQL Server PASC Local
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// ===================================================================
// CONFIGURACIÓN DEL AGENTE HUMANO
// ===================================================================
const AGENT_CONFIG = {
    // URL del sistema (ajustar según entorno)
    systemUrl: process.env.SYSTEM_URL || 'http://localhost:3000',
    
    // Credenciales de usuario real del sistema
    credentials: {
        admin: { email: 'admin@empresa.cl', password: 'Padmin123!' },
        demo: { email: 'demo@empresa.cl', password: 'Demo123!' },
        dpo: { email: 'dpo@empresa.cl', password: 'Dpo123!' }
    },
    
    // Configuración de navegador
    browser: {
        headless: false, // Visible para debug
        slowMo: 1000,   // Simula velocidad humana
        timeout: 30000  // 30 segundos timeout
    },
    
    // OpenAI para análisis inteligente
    openai: {
        apiKey: process.env.OPENAI_API_KEY,
        model: 'gpt-4',
        maxTokens: 3000
    }
};

// ===================================================================
// CLASE PRINCIPAL - AGENTE DPO HUMANO
// ===================================================================
class AgenteDPOHumano {
    constructor() {
        this.browser = null;
        this.page = null;
        this.currentUser = null;
        this.testResults = {
            startTime: new Date(),
            tests: [],
            errors: [],
            successes: [],
            businessLogicIssues: [],
            userExperienceIssues: []
        };
        this.sessionData = {};
    }

    /**
     * 🚀 INICIALIZACIÓN DEL AGENTE
     */
    async initialize() {
        console.log('🧠 Iniciando Agente DPO Humano Inteligente');
        console.log('==========================================');
        
        this.browser = await puppeteer.launch({
            headless: AGENT_CONFIG.browser.headless,
            slowMo: AGENT_CONFIG.browser.slowMo,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            defaultViewport: { width: 1366, height: 768 }
        });
        
        this.page = await this.browser.newPage();
        
        // Configurar interceptores para detectar errores
        await this.setupErrorHandlers();
        
        console.log('✅ Navegador inicializado');
    }

    /**
     * 🔍 CONFIGURAR DETECTORES DE ERRORES
     */
    async setupErrorHandlers() {
        // Interceptar errores JavaScript
        this.page.on('error', (error) => {
            this.reportError('JAVASCRIPT_ERROR', `Error de JS: ${error.message}`, 'high');
        });

        this.page.on('pageerror', (error) => {
            this.reportError('PAGE_ERROR', `Error de página: ${error.message}`, 'high');
        });

        // Interceptar respuestas HTTP con errores
        this.page.on('response', async (response) => {
            if (response.status() >= 400) {
                const url = response.url();
                const status = response.status();
                let body = '';
                
                try {
                    body = await response.text();
                } catch (e) {
                    body = 'No se pudo leer el body';
                }
                
                this.reportError('HTTP_ERROR', `HTTP ${status} en ${url}: ${body}`, 
                               status >= 500 ? 'high' : 'medium');
            }
        });

        // Interceptar console.error del frontend
        this.page.on('console', (message) => {
            if (message.type() === 'error') {
                this.reportError('CONSOLE_ERROR', `Console Error: ${message.text()}`, 'medium');
            }
        });
    }

    /**
     * 🔐 PROCESO DE LOGIN COMO USUARIO REAL
     */
    async loginAsUser(userType = 'admin') {
        console.log(`\n🔐 Iniciando sesión como ${userType}...`);
        
        const credentials = AGENT_CONFIG.credentials[userType];
        if (!credentials) {
            throw new Error(`Credenciales no encontradas para usuario: ${userType}`);
        }

        try {
            // Navegar a login
            await this.page.goto(`${AGENT_CONFIG.systemUrl}/login`, { waitUntil: 'networkidle2' });
            
            // Esperar elementos de login
            await this.page.waitForSelector('input[type="email"], input[name="email"]', 
                                           { timeout: AGENT_CONFIG.browser.timeout });
            
            // Llenar formulario como humano
            await this.page.type('input[type="email"], input[name="email"]', credentials.email, {delay: 100});
            await this.page.type('input[type="password"], input[name="password"]', credentials.password, {delay: 100});
            
            // Hacer click en login
            await this.page.click('button[type="submit"], input[type="submit"], button:contains("Ingresar")');
            
            // Esperar redirección exitosa
            await this.page.waitForNavigation({ waitUntil: 'networkidle2' });
            
            this.currentUser = userType;
            console.log(`✅ Login exitoso como ${userType}`);
            
            // Verificar que realmente esté logueado
            await this.verifyLoginSuccess();
            
        } catch (error) {
            this.reportError('LOGIN_ERROR', `Error en login como ${userType}: ${error.message}`, 'critical');
            throw error;
        }
    }

    async verifyLoginSuccess() {
        // Verificar indicadores de login exitoso
        try {
            await this.page.waitForSelector('[data-testid="user-menu"], .user-avatar, .logout-button', 
                                          { timeout: 10000 });
            console.log('✅ Login verificado correctamente');
        } catch (error) {
            this.reportError('LOGIN_VERIFICATION_ERROR', 
                           'No se encontraron indicadores de login exitoso', 'high');
        }
    }

    /**
     * 📋 PRUEBA 1: CREAR RAT COMPLETO (REGISTRO ACTIVIDADES TRATAMIENTO)
     * Esta es la funcionalidad CORE del sistema LPDP
     */
    async pruebaCrearRATCompleto() {
        console.log('\n📋 PRUEBA 1: Crear RAT Completo');
        console.log('==============================');
        
        const ratData = this.generateRealisticRATData();
        
        try {
            // 1.1 Navegar a módulo RAT
            console.log('🔹 Navegando a módulo RAT...');
            await this.navigateToModule('inventario-datos');
            
            // 1.2 Buscar botón crear nuevo RAT
            console.log('🔹 Buscando opción crear nuevo RAT...');
            await this.findAndClick([
                'button:contains("Nuevo RAT")',
                'button:contains("Crear RAT")',
                'a[href*="nuevo"]',
                '.btn-primary:contains("Crear")'
            ]);
            
            // 1.3 Llenar formulario paso a paso como usuario real
            await this.fillRATForm(ratData);
            
            // 1.4 Guardar y verificar persistencia
            await this.saveAndVerifyRAT(ratData);
            
            this.reportSuccess('RAT_CREATE', 'RAT creado exitosamente');
            
        } catch (error) {
            this.reportError('RAT_CREATE_ERROR', `Error creando RAT: ${error.message}`, 'critical');
        }
    }

    async fillRATForm(ratData) {
        console.log('🔹 Llenando formulario RAT...');
        
        // Llenar campos según el esquema del sistema
        const formFields = [
            { selector: 'input[name="nombre_actividad"]', value: ratData.nombreActividad },
            { selector: 'input[name="area_responsable"]', value: ratData.areaResponsable },
            { selector: 'input[name="responsable_proceso"]', value: ratData.responsableProceso },
            { selector: 'input[name="email_responsable"]', value: ratData.emailResponsable },
            { selector: 'textarea[name="descripcion"]', value: ratData.descripcion },
            { selector: 'textarea[name="finalidad_principal"]', value: ratData.finalidadPrincipal },
            { selector: 'select[name="base_licitud"]', value: ratData.baseLicitud },
            { selector: 'textarea[name="base_legal"]', value: ratData.baseLegal }
        ];

        for (const field of formFields) {
            try {
                await this.page.waitForSelector(field.selector, { timeout: 5000 });
                
                // Limpiar campo primero
                await this.page.click(field.selector, { clickCount: 3 });
                
                // Escribir valor con delay humano
                if (field.selector.includes('select')) {
                    await this.page.select(field.selector, field.value);
                } else {
                    await this.page.type(field.selector, field.value, { delay: 50 });
                }
                
                console.log(`   ✓ Campo ${field.selector} completado`);
                
            } catch (error) {
                this.reportError('FORM_FIELD_ERROR', 
                               `No se pudo llenar campo ${field.selector}: ${error.message}`, 'high');
            }
        }

        // Manejo de campos complejos (arrays, selección múltiple)
        await this.fillComplexRATFields(ratData);
    }

    async fillComplexRATFields(ratData) {
        // Categorías de datos (tags/chips)
        try {
            const categoriasSelector = '.categorias-datos-input, input[name="categorias_datos"]';
            if (await this.elementExists(categoriasSelector)) {
                for (const categoria of ratData.categoriasDatos) {
                    await this.page.type(categoriasSelector, categoria);
                    await this.page.keyboard.press('Enter');
                    await this.page.waitForTimeout(500);
                }
            }
        } catch (error) {
            this.reportBusinessLogicIssue('CATEGORIAS_DATOS_UX', 
                                         'Interfaz de categorías de datos poco intuitiva');
        }

        // Medidas de seguridad (checklist)
        try {
            const medidasSeguridad = [
                'Cifrado de datos en reposo',
                'Cifrado de datos en tránsito', 
                'Control de acceso basado en roles',
                'Auditoría de accesos'
            ];
            
            for (const medida of medidasSeguridad) {
                const checkbox = `input[type="checkbox"][value*="${medida}"]`;
                if (await this.elementExists(checkbox)) {
                    await this.page.click(checkbox);
                }
            }
        } catch (error) {
            this.reportError('SECURITY_MEASURES_ERROR', 
                           'Error completando medidas de seguridad', 'medium');
        }
    }

    async saveAndVerifyRAT(ratData) {
        console.log('🔹 Guardando RAT...');
        
        // Buscar y hacer click en guardar
        await this.findAndClick([
            'button:contains("Guardar")',
            'button:contains("Crear RAT")',
            'input[type="submit"]',
            'button[type="submit"]'
        ]);

        // Esperar confirmación
        await this.page.waitForTimeout(3000);
        
        // Verificar que se guardó correctamente
        try {
            // Buscar mensaje de éxito o redirección
            const successIndicators = [
                '.alert-success',
                '.notification-success',
                '.toast-success',
                '.success-message'
            ];
            
            let successFound = false;
            for (const indicator of successIndicators) {
                if (await this.elementExists(indicator)) {
                    console.log(`✅ RAT guardado - Confirmación: ${indicator}`);
                    successFound = true;
                    break;
                }
            }
            
            if (!successFound) {
                // Verificar si estamos en una página de detalle del RAT
                const urlContainsId = this.page.url().includes('/rat/');
                if (urlContainsId) {
                    console.log('✅ RAT guardado - Navegado a página de detalle');
                    successFound = true;
                }
            }
            
            if (!successFound) {
                this.reportBusinessLogicIssue('SAVE_FEEDBACK_MISSING', 
                                            'No hay retroalimentación clara al usuario sobre el guardado exitoso');
            }

        } catch (error) {
            this.reportError('SAVE_VERIFICATION_ERROR', 
                           `Error verificando guardado: ${error.message}`, 'high');
        }
    }

    /**
     * 👥 PRUEBA 2: GESTIÓN DE PROVEEDORES Y DPAs
     */
    async pruebaGestionProveedores() {
        console.log('\n👥 PRUEBA 2: Gestión de Proveedores');
        console.log('==================================');
        
        try {
            // Navegar a módulo proveedores
            await this.navigateToModule('proveedores');
            
            // Crear nuevo proveedor
            const proveedorData = this.generateRealisticProveedorData();
            await this.createProveedor(proveedorData);
            
            // Asociar proveedor a RAT existente
            await this.asociarProveedorARat();
            
            // Generar DPA (Data Processing Agreement)
            await this.generarDPA();
            
            this.reportSuccess('PROVEEDOR_MANAGEMENT', 'Gestión de proveedores completada');
            
        } catch (error) {
            this.reportError('PROVEEDOR_ERROR', `Error en gestión proveedores: ${error.message}`, 'high');
        }
    }

    /**
     * 📊 PRUEBA 3: EVALUACIÓN DPIA (DATA PROTECTION IMPACT ASSESSMENT)
     */
    async pruebaEvaluacionDPIA() {
        console.log('\n📊 PRUEBA 3: Evaluación DPIA');
        console.log('============================');
        
        try {
            await this.navigateToModule('evaluacion-impacto');
            
            const dpiaData = this.generateRealisticDPIAData();
            await this.createDPIA(dpiaData);
            
            // Vincular DPIA con RAT
            await this.vincularDPIAconRAT();
            
            this.reportSuccess('DPIA_EVALUATION', 'DPIA completada exitosamente');
            
        } catch (error) {
            this.reportError('DPIA_ERROR', `Error en DPIA: ${error.message}`, 'high');
        }
    }

    /**
     * 🔄 PRUEBA 4: FLUJO COMPLETO EXTREMO A EXTREMO
     * Simula el flujo real de un DPO creando un proceso completo
     */
    async pruebaFlujoCompletoE2E() {
        console.log('\n🔄 PRUEBA 4: Flujo Completo E2E');
        console.log('===============================');
        
        try {
            // 4.1 Crear RAT
            await this.pruebaCrearRATCompleto();
            
            // 4.2 Crear y asociar proveedor
            await this.pruebaGestionProveedores();
            
            // 4.3 Crear y asociar DPIA
            await this.pruebaEvaluacionDPIA();
            
            // 4.4 Generar documentación
            await this.generarDocumentacion();
            
            // 4.5 Verificar reportes
            await this.verificarReportes();
            
            this.reportSuccess('FULL_E2E_FLOW', 'Flujo completo E2E ejecutado sin errores');
            
        } catch (error) {
            this.reportError('E2E_FLOW_ERROR', `Error en flujo E2E: ${error.message}`, 'critical');
        }
    }

    /**
     * 🧠 ANÁLISIS INTELIGENTE CON IA
     */
    async analizarConIA() {
        console.log('\n🧠 ANÁLISIS INTELIGENTE CON IA');
        console.log('==============================');
        
        if (!AGENT_CONFIG.openai.apiKey) {
            console.log('⚠️  OpenAI API Key no configurada - Análisis IA saltado');
            return;
        }

        try {
            const context = this.prepareContextForAI();
            const analysis = await this.callOpenAI(context);
            
            console.log('🤖 ANÁLISIS DE IA:');
            console.log(analysis);
            
            this.testResults.aiAnalysis = analysis;
            
        } catch (error) {
            console.error('❌ Error en análisis IA:', error);
        }
    }

    prepareContextForAI() {
        return `Como experto en sistemas LPDP y experiencia de usuario, analiza estos resultados de pruebas:

ERRORES ENCONTRADOS:
${JSON.stringify(this.testResults.errors, null, 2)}

PROBLEMAS DE LÓGICA DE NEGOCIO:
${JSON.stringify(this.testResults.businessLogicIssues, null, 2)}

PROBLEMAS DE EXPERIENCIA USUARIO:
${JSON.stringify(this.testResults.userExperienceIssues, null, 2)}

ÉXITOS REGISTRADOS:
${JSON.stringify(this.testResults.successes, null, 2)}

Por favor proporciona:
1. Evaluación crítica del sistema desde perspectiva DPO real
2. Priorización de problemas por impacto en cumplimiento LPDP
3. Recomendaciones específicas de mejora
4. Problemas que podrían causar incumplimiento legal

Sé específico y enfócate en aspectos que afecten el uso real del sistema.`;
    }

    async callOpenAI(prompt) {
        const fetch = require('node-fetch');
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${AGENT_CONFIG.openai.apiKey}`
            },
            body: JSON.stringify({
                model: AGENT_CONFIG.openai.model,
                messages: [{
                    role: 'user',
                    content: prompt
                }],
                max_tokens: AGENT_CONFIG.openai.maxTokens,
                temperature: 0.3
            })
        });

        const data = await response.json();
        return data.choices[0].message.content;
    }

    // ===================================================================
    // MÉTODOS AUXILIARES
    // ===================================================================

    async navigateToModule(moduleName) {
        const moduleUrls = {
            'inventario-datos': '/inventario-datos',
            'proveedores': '/proveedores',
            'evaluacion-impacto': '/evaluacion-impacto',
            'dashboard': '/dashboard'
        };
        
        const url = `${AGENT_CONFIG.systemUrl}${moduleUrls[moduleName] || '/' + moduleName}`;
        await this.page.goto(url, { waitUntil: 'networkidle2' });
    }

    async findAndClick(selectors) {
        for (const selector of selectors) {
            try {
                await this.page.waitForSelector(selector, { timeout: 5000 });
                await this.page.click(selector);
                return;
            } catch (error) {
                continue;
            }
        }
        throw new Error(`No se encontró ningún selector clickeable: ${selectors.join(', ')}`);
    }

    async elementExists(selector, timeout = 1000) {
        try {
            await this.page.waitForSelector(selector, { timeout });
            return true;
        } catch {
            return false;
        }
    }

    generateRealisticRATData() {
        const timestamp = Date.now();
        return {
            nombreActividad: `Gestión Clientes Online ${timestamp}`,
            areaResponsable: 'Marketing Digital',
            responsableProceso: 'Juan Pérez Martinez',
            emailResponsable: `jperez-${timestamp}@empresa.cl`,
            telefono: '+56 9 8765 4321',
            descripcion: 'Procesamiento de datos personales de clientes para gestión de relación comercial y envío de comunicaciones promocionales',
            finalidadPrincipal: 'Mantener relación comercial con clientes y enviar ofertas personalizadas',
            baseLicitud: 'consentimiento',
            baseLegal: 'Consentimiento informado del titular según Art. 6 LPDP',
            categoriasDatos: [
                'Datos de identificación',
                'Datos de contacto',
                'Datos comerciales',
                'Datos de preferencias'
            ],
            destinatariosInternos: 'Departamento Marketing, Departamento Ventas',
            transferenciasInternacionales: 'No aplica',
            plazoConservacion: '5 años desde última interacción comercial',
            medidasSeguridad: [
                'Cifrado de datos en reposo',
                'Control de acceso basado en roles',
                'Auditoría de accesos',
                'Backup cifrado'
            ],
            decisionesAutomatizadas: false,
            requiereEIPD: false
        };
    }

    generateRealisticProveedorData() {
        const timestamp = Date.now();
        return {
            nombre: `CloudService Provider ${timestamp}`,
            tipo: 'software',
            pais: 'Estados Unidos',
            contacto: 'support@cloudservice.com',
            servicioProporcionado: 'Servicios de email marketing y CRM',
            categoriasDatos: 'Datos de contacto de clientes',
            medidasSeguridad: 'Certificación SOC2, GDPR compliant',
            contractoDPA: true,
            evaluacionRiesgo: 'Medio'
        };
    }

    generateRealisticDPIAData() {
        return {
            nombreEvaluacion: 'DPIA - Sistema CRM con IA de Recomendaciones',
            tipoEvaluacion: 'Completa',
            sistemaEvaluado: 'CRM con módulo de inteligencia artificial',
            descripcionTratamiento: 'Sistema CRM que utiliza algoritmos de IA para generar recomendaciones personalizadas de productos',
            riesgosIdentificados: [
                'Decisiones automatizadas que podrían discriminar',
                'Uso de datos sensibles para perfilado',
                'Transferencia internacional de datos'
            ],
            medidasMitigacion: [
                'Supervisión humana de decisiones IA',
                'Algoritmos auditados por sesgo',
                'Cláusulas contractuales para transferencias'
            ],
            nivelRiesgo: 'Alto',
            requiereConsulta: true
        };
    }

    reportError(type, message, severity) {
        const error = {
            type,
            message,
            severity,
            timestamp: new Date().toISOString(),
            url: this.page?.url(),
            user: this.currentUser
        };
        
        this.testResults.errors.push(error);
        console.error(`❌ [${severity.toUpperCase()}] ${type}: ${message}`);
    }

    reportSuccess(type, message) {
        const success = {
            type,
            message,
            timestamp: new Date().toISOString(),
            url: this.page?.url(),
            user: this.currentUser
        };
        
        this.testResults.successes.push(success);
        console.log(`✅ ${type}: ${message}`);
    }

    reportBusinessLogicIssue(type, message) {
        const issue = {
            type,
            message,
            timestamp: new Date().toISOString(),
            url: this.page?.url(),
            user: this.currentUser
        };
        
        this.testResults.businessLogicIssues.push(issue);
        console.warn(`⚠️  LÓGICA DE NEGOCIO - ${type}: ${message}`);
    }

    reportUserExperienceIssue(type, message) {
        const issue = {
            type,
            message,
            timestamp: new Date().toISOString(),
            url: this.page?.url(),
            user: this.currentUser
        };
        
        this.testResults.userExperienceIssues.push(issue);
        console.warn(`🔶 UX ISSUE - ${type}: ${message}`);
    }

    async generateFinalReport() {
        const endTime = new Date();
        const duration = (endTime - this.testResults.startTime) / 1000;
        
        const report = {
            ...this.testResults,
            endTime,
            duration: `${duration.toFixed(2)} segundos`,
            summary: {
                totalErrors: this.testResults.errors.length,
                criticalErrors: this.testResults.errors.filter(e => e.severity === 'critical').length,
                businessLogicIssues: this.testResults.businessLogicIssues.length,
                uxIssues: this.testResults.userExperienceIssues.length,
                successfulTests: this.testResults.successes.length,
                overallStatus: this.calculateOverallStatus()
            }
        };

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `reporte-pruebas-humano-${timestamp}.json`;
        
        fs.writeFileSync(filename, JSON.stringify(report, null, 2));
        
        console.log('\n📊 REPORTE FINAL DE PRUEBAS');
        console.log('============================');
        console.log(`Estado general: ${report.summary.overallStatus}`);
        console.log(`Duración: ${report.duration}`);
        console.log(`Errores críticos: ${report.summary.criticalErrors}`);
        console.log(`Errores totales: ${report.summary.totalErrors}`);
        console.log(`Problemas lógica negocio: ${report.summary.businessLogicIssues}`);
        console.log(`Problemas UX: ${report.summary.uxIssues}`);
        console.log(`Pruebas exitosas: ${report.summary.successfulTests}`);
        console.log(`\n💾 Reporte guardado: ${filename}`);
        
        return report;
    }

    calculateOverallStatus() {
        const criticalErrors = this.testResults.errors.filter(e => e.severity === 'critical').length;
        const businessIssues = this.testResults.businessLogicIssues.length;
        const totalErrors = this.testResults.errors.length;
        
        if (criticalErrors > 0 || businessIssues > 3) {
            return '🔴 SISTEMA NO APTO PARA PRODUCCIÓN';
        } else if (totalErrors > 5 || businessIssues > 0) {
            return '🟡 REQUIERE CORRECCIONES ANTES PRODUCCIÓN';
        } else {
            return '🟢 SISTEMA LISTO PARA PRODUCCIÓN';
        }
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
        }
    }

    // ===================================================================
    // EJECUTOR PRINCIPAL
    // ===================================================================
    async ejecutarPruebasCompletas() {
        try {
            await this.initialize();
            
            // Login como admin
            await this.loginAsUser('admin');
            
            // Ejecutar batería de pruebas
            await this.pruebaCrearRATCompleto();
            await this.pruebaGestionProveedores();
            await this.pruebaEvaluacionDPIA();
            await this.pruebaFlujoCompletoE2E();
            
            // Análisis inteligente
            await this.analizarConIA();
            
            // Generar reporte final
            const report = await this.generateFinalReport();
            
            return report.summary.overallStatus.includes('🟢');
            
        } catch (error) {
            console.error('💥 Error crítico en pruebas:', error);
            return false;
        } finally {
            await this.cleanup();
        }
    }
}

// ===================================================================
// EJECUCIÓN PRINCIPAL
// ===================================================================
async function main() {
    const agente = new AgenteDPOHumano();
    
    try {
        const success = await agente.ejecutarPruebasCompletas();
        console.log(`\n🎯 Resultado final: ${success ? 'ÉXITO' : 'FALLOS DETECTADOS'}`);
        process.exit(success ? 0 : 1);
    } catch (error) {
        console.error('💥 Error fatal:', error);
        process.exit(1);
    }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    main();
}

module.exports = { AgenteDPOHumano };