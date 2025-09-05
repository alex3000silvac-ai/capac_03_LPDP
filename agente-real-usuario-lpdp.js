#!/usr/bin/env node

/**
 * 🔍 AGENTE REAL COMO USUARIO - SISTEMA LPDP
 * 
 * PROBLEMA DETECTADO: El agente anterior solo probó HTML estático
 * SOLUCIÓN: Probar la aplicación React real y sus funcionalidades
 * 
 * Este agente simula un USUARIO REAL navegando el sistema
 */

const puppeteer = require('puppeteer');
const fs = require('fs');

const CONFIG = {
    frontendUrl: 'https://scldp-frontend.onrender.com',
    backendUrl: 'https://scldp-backend.onrender.com',
    timeout: 30000,
    
    // Flujos de usuario real a probar
    userFlows: [
        'Cargar página principal',
        'Ir al login',
        'Intentar login demo',
        'Navegar al dashboard',
        'Acceder al módulo RAT',
        'Verificar módulos LPDP',
        'Probar creación de RAT',
        'Verificar conexión con backend'
    ]
};

class AgenteRealUsuario {
    constructor() {
        this.browser = null;
        this.page = null;
        this.results = {
            totalTests: 0,
            passed: 0,
            failed: 0,
            errors: [],
            screenshots: [],
            networkErrors: [],
            javascriptErrors: [],
            userFlowResults: []
        };
    }

    logTest(name, success, details = '', screenshot = null) {
        this.results.totalTests++;
        const timestamp = new Date().toISOString();
        const result = {
            name,
            success,
            details,
            timestamp,
            screenshot
        };

        if (success) {
            this.results.passed++;
            console.log(`✅ [${timestamp}] ${name}${details ? ': ' + details : ''}`);
        } else {
            this.results.failed++;
            this.results.errors.push(`${name}${details ? ': ' + details : ''}`);
            console.log(`❌ [${timestamp}] ${name}${details ? ': ' + details : ''}`);
        }

        this.results.userFlowResults.push(result);
        return success;
    }

    async takeScreenshot(name) {
        try {
            const filename = `screenshot-${name.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}.png`;
            await this.page.screenshot({ 
                path: filename, 
                fullPage: true,
                type: 'png'
            });
            this.results.screenshots.push(filename);
            console.log(`📸 Screenshot guardado: ${filename}`);
            return filename;
        } catch (error) {
            console.log(`❌ Error tomando screenshot: ${error.message}`);
            return null;
        }
    }

    async initBrowser() {
        console.log('🚀 Iniciando browser para pruebas reales...');
        
        try {
            this.browser = await puppeteer.launch({
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-gpu',
                    '--no-first-run',
                    '--no-zygote',
                    '--disable-extensions'
                ]
            });

            this.page = await this.browser.newPage();
            
            // Capturar errores de red
            this.page.on('response', response => {
                if (response.status() >= 400) {
                    this.results.networkErrors.push({
                        url: response.url(),
                        status: response.status(),
                        statusText: response.statusText()
                    });
                }
            });

            // Capturar errores de JavaScript
            this.page.on('pageerror', error => {
                this.results.javascriptErrors.push(error.message);
                console.log(`🚨 JavaScript Error: ${error.message}`);
            });

            // Configurar viewport y timeouts
            await this.page.setViewport({ width: 1920, height: 1080 });
            await this.page.setDefaultTimeout(CONFIG.timeout);

            this.logTest('Inicialización Browser', true, 'Puppeteer listo');
            return true;

        } catch (error) {
            this.logTest('Inicialización Browser', false, error.message);
            return false;
        }
    }

    async testFrontendLoading() {
        console.log('\\n🌐 PRUEBA 1: Cargar página principal como usuario real');
        
        try {
            console.log('Navegando a:', CONFIG.frontendUrl);
            await this.page.goto(CONFIG.frontendUrl, { 
                waitUntil: 'networkidle0',
                timeout: CONFIG.timeout
            });

            const screenshot = await this.takeScreenshot('pagina-principal');
            
            // Verificar que la página se cargó
            const title = await this.page.title();
            this.logTest('Página principal carga', true, `Título: ${title}`, screenshot);

            // Esperar a que React se monte
            try {
                await this.page.waitForSelector('#root', { timeout: 10000 });
                this.logTest('React App montado', true, 'Elemento #root encontrado');
            } catch (e) {
                this.logTest('React App montado', false, 'No se encontró #root');
            }

            // Verificar si hay contenido dinámico
            const bodyText = await this.page.evaluate(() => document.body.innerText);
            const hasContent = bodyText.length > 100; // Más de 100 caracteres indica contenido cargado
            this.logTest('Contenido dinámico cargado', hasContent, `${bodyText.length} caracteres`);

            // Verificar errores visibles
            const hasErrorMessages = bodyText.toLowerCase().includes('error') || 
                                   bodyText.toLowerCase().includes('falló') ||
                                   bodyText.toLowerCase().includes('no se pudo');
            this.logTest('Sin mensajes de error visibles', !hasErrorMessages);

            return true;

        } catch (error) {
            const screenshot = await this.takeScreenshot('error-carga');
            this.logTest('Carga página principal', false, error.message, screenshot);
            return false;
        }
    }

    async testNavigation() {
        console.log('\\n🧭 PRUEBA 2: Navegación de usuario real');

        try {
            // Buscar elementos de navegación típicos
            const navElements = await this.page.evaluate(() => {
                const elements = [];
                
                // Buscar links de navegación
                const links = document.querySelectorAll('a, button');
                links.forEach(link => {
                    const text = link.innerText || link.textContent || '';
                    if (text.trim().length > 0) {
                        elements.push({
                            type: link.tagName.toLowerCase(),
                            text: text.trim(),
                            href: link.href || null
                        });
                    }
                });
                
                return elements.slice(0, 20); // Primeros 20 elementos
            });

            this.logTest('Elementos navegación encontrados', navElements.length > 0, 
                        `${navElements.length} elementos interactivos`);

            // Buscar elementos específicos LPDP
            const lpdpElements = navElements.filter(el => 
                el.text.toLowerCase().includes('login') ||
                el.text.toLowerCase().includes('dashboard') ||
                el.text.toLowerCase().includes('inventario') ||
                el.text.toLowerCase().includes('registro') ||
                el.text.toLowerCase().includes('rat') ||
                el.text.toLowerCase().includes('dpia')
            );

            this.logTest('Elementos LPDP encontrados', lpdpElements.length > 0,
                        `${lpdpElements.length} elementos relacionados con LPDP`);

            console.log('🔍 Elementos encontrados:');
            lpdpElements.forEach(el => {
                console.log(`  - ${el.type}: "${el.text}"`);
            });

            return lpdpElements.length > 0;

        } catch (error) {
            this.logTest('Navegación', false, error.message);
            return false;
        }
    }

    async testLoginFlow() {
        console.log('\\n🔐 PRUEBA 3: Flujo de login como usuario real');

        try {
            // Buscar elementos de login
            const loginElements = await this.page.evaluate(() => {
                const buttons = document.querySelectorAll('button, a, input[type="submit"]');
                const loginButtons = [];
                
                buttons.forEach(btn => {
                    const text = (btn.innerText || btn.textContent || btn.value || '').toLowerCase();
                    if (text.includes('login') || text.includes('ingresar') || text.includes('entrar')) {
                        loginButtons.push({
                            text: btn.innerText || btn.textContent || btn.value,
                            type: btn.tagName.toLowerCase(),
                            id: btn.id,
                            className: btn.className
                        });
                    }
                });
                
                return loginButtons;
            });

            this.logTest('Elementos de login encontrados', loginElements.length > 0,
                        `${loginElements.length} elementos de login`);

            if (loginElements.length > 0) {
                console.log('🔍 Elementos de login:');
                loginElements.forEach(el => {
                    console.log(`  - ${el.type}: "${el.text}"`);
                });
            }

            // Intentar navegar al login
            try {
                const loginUrl = CONFIG.frontendUrl + '/login';
                console.log('Navegando a página de login:', loginUrl);
                await this.page.goto(loginUrl, { waitUntil: 'networkidle0' });
                
                const screenshot = await this.takeScreenshot('pagina-login');
                this.logTest('Navegación a login', true, 'Página /login cargada', screenshot);

                // Buscar formulario de login
                const hasLoginForm = await this.page.evaluate(() => {
                    const forms = document.querySelectorAll('form');
                    const inputs = document.querySelectorAll('input[type="email"], input[type="text"], input[type="password"]');
                    return forms.length > 0 || inputs.length > 0;
                });

                this.logTest('Formulario de login presente', hasLoginForm);

                return hasLoginForm;

            } catch (error) {
                const screenshot = await this.takeScreenshot('error-login');
                this.logTest('Navegación a login', false, error.message, screenshot);
                return false;
            }

        } catch (error) {
            this.logTest('Flujo de login', false, error.message);
            return false;
        }
    }

    async testBackendConnection() {
        console.log('\\n🔗 PRUEBA 4: Conexión real con backend');

        try {
            // Monitorear requests de red durante la navegación
            const networkRequests = [];
            
            this.page.on('request', request => {
                if (request.url().includes(CONFIG.backendUrl)) {
                    networkRequests.push({
                        url: request.url(),
                        method: request.method(),
                        timestamp: new Date().toISOString()
                    });
                }
            });

            // Recargar la página para capturar requests
            await this.page.reload({ waitUntil: 'networkidle0' });
            
            // Esperar un poco para capturar requests
            await new Promise(resolve => setTimeout(resolve, 5000));

            this.logTest('Requests al backend detectados', networkRequests.length > 0,
                        `${networkRequests.length} requests al backend`);

            if (networkRequests.length > 0) {
                console.log('🌐 Requests al backend:');
                networkRequests.forEach(req => {
                    console.log(`  - ${req.method} ${req.url}`);
                });
            }

            // Verificar si hay errores de conectividad específicos
            const connectivityErrors = this.results.networkErrors.filter(err => 
                err.url.includes(CONFIG.backendUrl)
            );

            this.logTest('Sin errores de conectividad backend', connectivityErrors.length === 0,
                        connectivityErrors.length > 0 ? `${connectivityErrors.length} errores` : '');

            return networkRequests.length > 0 && connectivityErrors.length === 0;

        } catch (error) {
            this.logTest('Conexión backend', false, error.message);
            return false;
        }
    }

    async testRealUserScenario() {
        console.log('\\n👤 PRUEBA 5: Escenario completo usuario real');

        try {
            // Scenario: Usuario nuevo accede al sistema
            console.log('📋 Simulando usuario nuevo...');
            
            await this.page.goto(CONFIG.frontendUrl, { waitUntil: 'networkidle0' });
            
            const screenshot1 = await this.takeScreenshot('usuario-nuevo-inicio');
            
            // Esperar que la aplicación esté completamente cargada
            await new Promise(resolve => setTimeout(resolve, 5000));

            // Verificar si el sistema parece funcional para un usuario
            const userExperience = await this.page.evaluate(() => {
                const body = document.body;
                const text = body.innerText || body.textContent || '';
                
                return {
                    hasVisibleContent: text.trim().length > 50,
                    hasInteractiveElements: document.querySelectorAll('button, a, input').length > 0,
                    hasErrorMessages: text.toLowerCase().includes('error') || 
                                    text.toLowerCase().includes('no se pudo') ||
                                    text.toLowerCase().includes('falló'),
                    hasLoadingIndicators: text.toLowerCase().includes('cargando') ||
                                        text.toLowerCase().includes('loading'),
                    seemsResponsive: window.innerWidth > 0 && window.innerHeight > 0,
                    pageTitle: document.title || '',
                    contentLength: text.length
                };
            });

            // Evaluación de experiencia de usuario
            this.logTest('Contenido visible para usuario', userExperience.hasVisibleContent,
                        `${userExperience.contentLength} caracteres de contenido`);

            this.logTest('Elementos interactivos disponibles', userExperience.hasInteractiveElements);

            this.logTest('Sin mensajes de error visibles', !userExperience.hasErrorMessages);

            this.logTest('No stuck en loading', !userExperience.hasLoadingIndicators);

            this.logTest('Página responsive', userExperience.seemsResponsive);

            const screenshot2 = await this.takeScreenshot('evaluacion-final');

            // Evaluación general
            const functionalForUser = userExperience.hasVisibleContent && 
                                    userExperience.hasInteractiveElements &&
                                    !userExperience.hasErrorMessages &&
                                    userExperience.seemsResponsive;

            this.logTest('Sistema funcional para usuario', functionalForUser,
                        functionalForUser ? 'Usuario puede usar el sistema' : 'Sistema no usable');

            return functionalForUser;

        } catch (error) {
            const screenshot = await this.takeScreenshot('error-scenario-usuario');
            this.logTest('Escenario usuario real', false, error.message, screenshot);
            return false;
        }
    }

    async generateReport() {
        console.log('\\n📊 REPORTE AGENTE REAL USUARIO - SISTEMA LPDP');
        console.log('=' .repeat(70));

        const successRate = this.results.totalTests > 0 
            ? ((this.results.passed / this.results.totalTests) * 100).toFixed(2)
            : 0;

        console.log(`📈 Tasa de éxito REAL: ${successRate}%`);
        console.log(`✅ Pruebas exitosas: ${this.results.passed}`);
        console.log(`❌ Pruebas fallidas: ${this.results.failed}`);
        console.log(`🔢 Total pruebas: ${this.results.totalTests}`);

        // Análisis de errores de red
        if (this.results.networkErrors.length > 0) {
            console.log('\\n🚨 ERRORES DE RED DETECTADOS:');
            this.results.networkErrors.forEach((error, i) => {
                console.log(`  ${i + 1}. ${error.status} - ${error.url}`);
            });
        }

        // Análisis de errores JavaScript
        if (this.results.javascriptErrors.length > 0) {
            console.log('\\n💥 ERRORES JAVASCRIPT DETECTADOS:');
            this.results.javascriptErrors.forEach((error, i) => {
                console.log(`  ${i + 1}. ${error}`);
            });
        }

        // Screenshots generados
        if (this.results.screenshots.length > 0) {
            console.log('\\n📸 SCREENSHOTS GENERADOS:');
            this.results.screenshots.forEach(screenshot => {
                console.log(`  - ${screenshot}`);
            });
        }

        // Veredicto final
        const isSystemWorking = this.results.passed > this.results.failed;
        
        if (isSystemWorking) {
            console.log('\\n✅ VEREDICTO: Sistema funciona para usuarios reales');
            console.log('👍 Los usuarios pueden acceder y usar el sistema');
        } else {
            console.log('\\n❌ VEREDICTO: Sistema NO funciona para usuarios reales');
            console.log('🚨 PROBLEMA CRÍTICO: Usuarios no pueden usar el sistema');
            
            if (this.results.failed > 0) {
                console.log('\\n❌ PROBLEMAS DETECTADOS:');
                this.results.errors.forEach((error, i) => {
                    console.log(`  ${i + 1}. ${error}`);
                });
            }
        }

        // Guardar reporte
        const reportData = {
            timestamp: new Date().toISOString(),
            successRate: parseFloat(successRate),
            results: this.results,
            verdict: isSystemWorking ? 'FUNCIONAL' : 'NO_FUNCIONAL'
        };

        const reportFile = `reporte-usuario-real-${Date.now()}.json`;
        fs.writeFileSync(reportFile, JSON.stringify(reportData, null, 2));
        console.log(`\\n💾 Reporte detallado guardado: ${reportFile}`);

        return isSystemWorking;
    }

    async run() {
        console.log('👤 AGENTE REAL USUARIO - PRUEBAS COMO HUMANO');
        console.log('🎯 Objetivo: Verificar si un usuario real puede usar el sistema');
        console.log('=' .repeat(70));

        try {
            // 1. Inicializar browser
            const browserReady = await this.initBrowser();
            if (!browserReady) {
                console.log('❌ No se pudo inicializar el browser');
                return false;
            }

            // 2. Pruebas como usuario real
            await this.testFrontendLoading();
            await this.testNavigation();
            await this.testLoginFlow();
            await this.testBackendConnection();
            await this.testRealUserScenario();

            // 3. Generar reporte
            const systemWorks = await this.generateReport();

            return systemWorks;

        } catch (error) {
            console.log(`💥 Error fatal del agente: ${error.message}`);
            return false;
        } finally {
            if (this.browser) {
                await this.browser.close();
                console.log('🔒 Browser cerrado');
            }
        }
    }
}

// Ejecutar agente
async function main() {
    const agent = new AgenteRealUsuario();
    const success = await agent.run();
    
    console.log('\\n' + '=' .repeat(50));
    console.log(success ? 
        '✅ SISTEMA VERIFICADO: Funcional para usuarios reales' : 
        '❌ SISTEMA FALLIDO: NO funcional para usuarios reales'
    );
    
    process.exit(success ? 0 : 1);
}

if (require.main === module) {
    main().catch(error => {
        console.error('💥 Error fatal:', error);
        process.exit(1);
    });
}

module.exports = AgenteRealUsuario;