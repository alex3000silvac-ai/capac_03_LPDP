#!/usr/bin/env node

/**
 * ✅ AUDITOR INTEGRAL SQL SERVER - PLAN DE AUDITORÍA AUTOMATIZADA
 * 
 * Implementa las pruebas integrales del Plan de Auditoría adaptadas para SQL Server Local
 * - Verificación de Conectividad con SQL Server PASC/LPDP_Test
 * - Prueba de Inyección y Extracción en cada tabla
 * - Validación cruzada de esquema (tablas.txt vs Código)
 * - Integración con OpenAI para análisis inteligente
 * 
 * Reemplaza completamente las pruebas originales de Supabase
 */

const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch').default;

// ===================================================================
// CONFIGURACIÓN SQL SERVER (desde sqlServerClient.js)
// ===================================================================
const SQL_SERVER_CONFIG = {
    baseUrl: 'http://localhost:3001/api',
    server: 'PASC', 
    database: 'LPDP_Test',
    timeout: 10000,
    healthEndpoint: '/health'
};

// ===================================================================
// CONFIGURACIÓN OPENAI (para análisis inteligente)
// ===================================================================
const OPENAI_CONFIG = {
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4',
    maxTokens: 2000
};

// ===================================================================
// CLASE PRINCIPAL DEL AUDITOR
// ===================================================================
class SQLServerAuditor {
    constructor() {
        this.results = {
            connectivity: {},
            injectionTests: {},
            schemaValidation: {},
            summary: {},
            errors: []
        };
        this.startTime = new Date();
        this.testData = this.generateTestData();
    }

    /**
     * Genera datos de prueba únicos para inyección/extracción
     */
    generateTestData() {
        const timestamp = Date.now();
        return {
            string: `TEST_AUDIT_${timestamp}`,
            number: 12345 + timestamp % 1000,
            date: new Date().toISOString(),
            boolean: true,
            json: JSON.stringify({ test: true, timestamp }),
            uuid: `test-uuid-${timestamp}`
        };
    }

    /**
     * 🔗 FASE 1: VERIFICACIÓN DE CONECTIVIDAD SQL SERVER
     */
    async verifyConnectivity() {
        console.log('\n🔗 FASE 1: VERIFICACIÓN DE CONECTIVIDAD SQL SERVER');
        console.log('================================================');

        try {
            // 1.1 Health Check básico
            console.log('1.1 Probando conectividad básica...');
            const healthResponse = await fetch(`${SQL_SERVER_CONFIG.baseUrl}${SQL_SERVER_CONFIG.healthEndpoint}`, {
                method: 'GET',
                timeout: SQL_SERVER_CONFIG.timeout
            });

            if (!healthResponse.ok) {
                throw new Error(`Health check falló: HTTP ${healthResponse.status}`);
            }

            const healthData = await healthResponse.json();
            console.log('✅ Conectividad básica: OK');
            console.log(`   Servidor: ${SQL_SERVER_CONFIG.server}`);
            console.log(`   Base de datos: ${SQL_SERVER_CONFIG.database}`);
            console.log(`   Estado: ${JSON.stringify(healthData)}`);

            this.results.connectivity.health = {
                status: 'SUCCESS',
                response: healthData,
                timestamp: new Date().toISOString()
            };

            // 1.2 Test endpoints principales
            const endpoints = [
                '/organizaciones',
                '/user_sessions', 
                '/mapeo_datos_rat',
                '/actividades_dpo',
                '/proveedores',
                '/rats'
            ];

            console.log('\n1.2 Probando endpoints principales...');
            for (const endpoint of endpoints) {
                try {
                    const response = await fetch(`${SQL_SERVER_CONFIG.baseUrl}${endpoint}?tenant_id=demo&limit=1`, {
                        method: 'GET',
                        timeout: SQL_SERVER_CONFIG.timeout
                    });

                    const status = response.ok ? 'SUCCESS' : 'FAILED';
                    console.log(`   ${endpoint}: ${status} (HTTP ${response.status})`);
                    
                    this.results.connectivity[endpoint] = {
                        status,
                        httpStatus: response.status,
                        timestamp: new Date().toISOString()
                    };

                } catch (error) {
                    console.log(`   ${endpoint}: ERROR - ${error.message}`);
                    this.results.connectivity[endpoint] = {
                        status: 'ERROR',
                        error: error.message,
                        timestamp: new Date().toISOString()
                    };
                }
            }

            return true;

        } catch (error) {
            console.error('❌ Error en conectividad:', error);
            this.results.connectivity.error = error.message;
            this.results.errors.push(`Conectividad: ${error.message}`);
            return false;
        }
    }

    /**
     * 🧪 FASE 2: PRUEBAS DE INYECCIÓN Y EXTRACCIÓN
     * Adapta las pruebas del plan original para SQL Server
     */
    async runInjectionExtractionTests() {
        console.log('\n🧪 FASE 2: PRUEBAS DE INYECCIÓN Y EXTRACCIÓN');
        console.log('============================================');

        // Tablas críticas para probar (selección representativa)
        const criticalTables = [
            'organizaciones',
            'mapeo_datos_rat', 
            'rats',
            'proveedores',
            'actividades_dpo',
            'user_sessions'
        ];

        for (const table of criticalTables) {
            console.log(`\n2.1 Probando tabla: ${table}`);
            await this.testTableOperations(table);
        }
    }

    /**
     * Prueba operaciones CRUD en una tabla específica
     */
    async testTableOperations(tableName) {
        const testResult = {
            table: tableName,
            operations: {},
            timestamp: new Date().toISOString()
        };

        try {
            // 2.1 TEST CREATE (Inyección)
            console.log(`   🔸 CREATE test para ${tableName}...`);
            const createData = this.generateCreateDataForTable(tableName);
            const createResult = await this.testCreate(tableName, createData);
            testResult.operations.create = createResult;
            
            if (createResult.status === 'SUCCESS' && createResult.insertedId) {
                
                // 2.2 TEST READ (Extracción) 
                console.log(`   🔸 READ test para ${tableName}...`);
                const readResult = await this.testRead(tableName, createResult.insertedId);
                testResult.operations.read = readResult;

                // 2.3 TEST UPDATE
                console.log(`   🔸 UPDATE test para ${tableName}...`);
                const updateData = this.generateUpdateDataForTable(tableName);
                const updateResult = await this.testUpdate(tableName, createResult.insertedId, updateData);
                testResult.operations.update = updateResult;

                // 2.4 TEST DELETE (Limpieza)
                console.log(`   🔸 DELETE test para ${tableName}...`);
                const deleteResult = await this.testDelete(tableName, createResult.insertedId);
                testResult.operations.delete = deleteResult;
            }

            // Evaluar resultado general
            const successCount = Object.values(testResult.operations).filter(op => op.status === 'SUCCESS').length;
            const totalOps = Object.keys(testResult.operations).length;
            testResult.successRate = totalOps > 0 ? (successCount / totalOps) * 100 : 0;

            console.log(`   ✅ ${tableName}: ${successCount}/${totalOps} operaciones exitosas (${testResult.successRate.toFixed(1)}%)`);

        } catch (error) {
            console.error(`   ❌ Error en ${tableName}:`, error.message);
            testResult.error = error.message;
            testResult.successRate = 0;
        }

        this.results.injectionTests[tableName] = testResult;
    }

    /**
     * Genera datos de prueba específicos para cada tabla
     */
    generateCreateDataForTable(tableName) {
        const baseData = {
            tenant_id: 'audit_test',
            created_at: new Date().toISOString()
        };

        switch (tableName) {
            case 'organizaciones':
                return {
                    ...baseData,
                    company_name: `Test Org ${this.testData.string}`,
                    display_name: `Test Display ${this.testData.string}`,
                    industry: 'Technology',
                    size: 'Small',
                    country: 'Chile',
                    user_id: 'audit-user-test',
                    is_demo: true,
                    online_mode: true,
                    active: true
                };

            case 'mapeo_datos_rat':
                return {
                    ...baseData,
                    user_id: 'audit-user-test',
                    created_by: 'audit-user-test',
                    nombre_actividad: `Test RAT ${this.testData.string}`,
                    area_responsable: 'IT Test',
                    responsable_proceso: 'Test Manager',
                    email_responsable: 'test@audit.com',
                    descripcion: `Descripción de prueba ${this.testData.string}`,
                    finalidad_principal: 'Testing purposes',
                    base_licitud: 'Consentimiento',
                    base_legal: 'Art. 6 GDPR',
                    estado: 'draft',
                    nivel_riesgo: 'low'
                };

            case 'rats':
                return {
                    ...baseData,
                    user_id: 'audit-user-test',
                    nombre_actividad: `Test RAT ${this.testData.string}`,
                    responsable_proceso: 'Test Manager',
                    descripcion: `RAT de prueba ${this.testData.string}`,
                    status: 'active',
                    estado: 'draft',
                    ai_supervised: false
                };

            case 'proveedores':
                return {
                    ...baseData,
                    nombre: `Proveedor Test ${this.testData.string}`,
                    tipo: 'software',
                    pais: 'Chile',
                    dpa_info: JSON.stringify({ test: true }),
                    evaluacion_seguridad: JSON.stringify({ score: 85 })
                };

            default:
                return {
                    ...baseData,
                    name: `Test ${tableName} ${this.testData.string}`,
                    description: `Test entry for ${tableName}`
                };
        }
    }

    generateUpdateDataForTable(tableName) {
        switch (tableName) {
            case 'organizaciones':
                return { display_name: `Updated ${this.testData.string}` };
            case 'mapeo_datos_rat':
                return { descripcion: `Updated description ${this.testData.string}` };
            default:
                return { description: `Updated ${this.testData.string}` };
        }
    }

    async testCreate(tableName, data) {
        try {
            const response = await fetch(`${SQL_SERVER_CONFIG.baseUrl}/${tableName}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                timeout: SQL_SERVER_CONFIG.timeout
            });

            if (!response.ok) {
                return {
                    status: 'FAILED',
                    httpStatus: response.status,
                    error: `HTTP ${response.status}`,
                    timestamp: new Date().toISOString()
                };
            }

            const result = await response.json();
            return {
                status: 'SUCCESS',
                httpStatus: response.status,
                insertedId: result.id || result[0]?.id,
                data: result,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            return {
                status: 'ERROR',
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    async testRead(tableName, id) {
        try {
            const response = await fetch(`${SQL_SERVER_CONFIG.baseUrl}/${tableName}/${id}`, {
                method: 'GET',
                timeout: SQL_SERVER_CONFIG.timeout
            });

            if (!response.ok) {
                return {
                    status: 'FAILED',
                    httpStatus: response.status,
                    error: `HTTP ${response.status}`,
                    timestamp: new Date().toISOString()
                };
            }

            const result = await response.json();
            return {
                status: 'SUCCESS',
                httpStatus: response.status,
                data: result,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            return {
                status: 'ERROR', 
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    async testUpdate(tableName, id, updateData) {
        try {
            const response = await fetch(`${SQL_SERVER_CONFIG.baseUrl}/${tableName}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData),
                timeout: SQL_SERVER_CONFIG.timeout
            });

            return {
                status: response.ok ? 'SUCCESS' : 'FAILED',
                httpStatus: response.status,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            return {
                status: 'ERROR',
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    async testDelete(tableName, id) {
        try {
            const response = await fetch(`${SQL_SERVER_CONFIG.baseUrl}/${tableName}/${id}`, {
                method: 'DELETE',
                timeout: SQL_SERVER_CONFIG.timeout
            });

            return {
                status: response.ok ? 'SUCCESS' : 'FAILED',
                httpStatus: response.status,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            return {
                status: 'ERROR',
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * 🗄️ FASE 3: VALIDACIÓN CRUZADA DE ESQUEMA
     * Compara tablas.txt vs uso real en código
     */
    async validateSchema() {
        console.log('\n🗄️ FASE 3: VALIDACIÓN CRUZADA DE ESQUEMA');
        console.log('======================================');

        try {
            // 3.1 Leer tablas.txt
            console.log('3.1 Leyendo esquema de tablas.txt...');
            const schemaFromFile = await this.parseTablesFile();

            // 3.2 Escanear código para encontrar tablas usadas
            console.log('3.2 Escaneando código para detectar uso de tablas...');
            const tablesFromCode = await this.scanCodeForTables();

            // 3.3 Análisis comparativo
            console.log('3.3 Realizando análisis comparativo...');
            const comparison = this.compareSchemas(schemaFromFile, tablesFromCode);

            this.results.schemaValidation = {
                schemaFromFile,
                tablesFromCode,
                comparison,
                timestamp: new Date().toISOString()
            };

            // 3.4 Mostrar resultados
            this.printSchemaValidationResults(comparison);

        } catch (error) {
            console.error('❌ Error en validación de esquema:', error);
            this.results.schemaValidation.error = error.message;
        }
    }

    async parseTablesFile() {
        const tablasPath = path.join(process.cwd(), 'Tablas.txt');
        const content = fs.readFileSync(tablasPath, 'utf8');
        
        const tables = new Map();
        const lines = content.split('\n');
        
        for (const line of lines) {
            const match = line.match(/^\|\s*([^|]+?)\s*\|\s*BASE TABLE\s*\|\s*([^|]+?)\s*\|/);
            if (match) {
                const tableName = match[1].trim();
                const columnName = match[2].trim();
                
                if (!tables.has(tableName)) {
                    tables.set(tableName, []);
                }
                tables.get(tableName).push(columnName);
            }
        }

        return Object.fromEntries(tables);
    }

    async scanCodeForTables() {
        const tablesUsed = new Set();
        
        // Escanear archivos JavaScript/TypeScript
        const jsFiles = this.findFiles(['.js', '.ts', '.tsx', '.jsx']);
        
        for (const file of jsFiles) {
            const content = fs.readFileSync(file, 'utf8');
            
            // Buscar patrones de uso de tablas
            const patterns = [
                /from\(['"`]([^'"`]+)['"`]\)/g,
                /table\(['"`]([^'"`]+)['"`]\)/g,
                /\/([a-z_]+)[\?\&]/g,
                /api\/([a-z_]+)/g
            ];

            for (const pattern of patterns) {
                let match;
                while ((match = pattern.exec(content)) !== null) {
                    if (match[1] && match[1].length < 50) { // Filtrar nombres razonables
                        tablesUsed.add(match[1]);
                    }
                }
            }
        }

        return Array.from(tablesUsed);
    }

    findFiles(extensions) {
        const files = [];
        const searchDirs = ['./frontend/src', './backend'];
        
        function scanDir(dir) {
            if (!fs.existsSync(dir)) return;
            
            const items = fs.readdirSync(dir);
            for (const item of items) {
                const fullPath = path.join(dir, item);
                const stat = fs.lstatSync(fullPath);
                
                if (stat.isDirectory() && !item.includes('node_modules')) {
                    scanDir(fullPath);
                } else if (stat.isFile()) {
                    const ext = path.extname(fullPath).toLowerCase();
                    if (extensions.includes(ext)) {
                        files.push(fullPath);
                    }
                }
            }
        }

        searchDirs.forEach(scanDir);
        return files;
    }

    compareSchemas(schemaFromFile, tablesFromCode) {
        const schemaTableNames = new Set(Object.keys(schemaFromFile));
        const codeTableNames = new Set(tablesFromCode);

        return {
            totalSchemaTable: schemaTableNames.size,
            totalCodeTables: codeTableNames.size,
            tablesInSchemaOnly: Array.from(schemaTableNames).filter(t => !codeTableNames.has(t)),
            tablesInCodeOnly: Array.from(codeTableNames).filter(t => !schemaTableNames.has(t)),
            tablesInBoth: Array.from(schemaTableNames).filter(t => codeTableNames.has(t)),
            schemaUsageRate: schemaTableNames.size > 0 ? (Array.from(schemaTableNames).filter(t => codeTableNames.has(t)).length / schemaTableNames.size) * 100 : 0
        };
    }

    printSchemaValidationResults(comparison) {
        console.log(`\n📊 RESULTADOS DE VALIDACIÓN DE ESQUEMA:`);
        console.log(`   Tablas en esquema: ${comparison.totalSchemaTable}`);
        console.log(`   Tablas detectadas en código: ${comparison.totalCodeTables}`);
        console.log(`   Tablas utilizadas: ${comparison.tablesInBoth.length}`);
        console.log(`   Tasa de uso del esquema: ${comparison.schemaUsageRate.toFixed(1)}%`);
        
        if (comparison.tablesInSchemaOnly.length > 0) {
            console.log(`\n⚠️  Tablas definidas pero no utilizadas (${comparison.tablesInSchemaOnly.length}):`);
            comparison.tablesInSchemaOnly.slice(0, 10).forEach(table => console.log(`     - ${table}`));
            if (comparison.tablesInSchemaOnly.length > 10) {
                console.log(`     ... y ${comparison.tablesInSchemaOnly.length - 10} más`);
            }
        }
        
        if (comparison.tablesInCodeOnly.length > 0) {
            console.log(`\n🔍 Tablas utilizadas pero no definidas en esquema (${comparison.tablesInCodeOnly.length}):`);
            comparison.tablesInCodeOnly.forEach(table => console.log(`     - ${table}`));
        }
    }

    /**
     * 🤖 FASE 4: ANÁLISIS CON IA (OPENAI)
     */
    async analyzeWithAI() {
        if (!OPENAI_CONFIG.apiKey) {
            console.log('\n🤖 FASE 4: ANÁLISIS CON IA - SALTADA (No hay API key de OpenAI)');
            return;
        }

        console.log('\n🤖 FASE 4: ANÁLISIS CON IA');
        console.log('========================');

        try {
            const prompt = this.generateAIAnalysisPrompt();
            
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${OPENAI_CONFIG.apiKey}`
                },
                body: JSON.stringify({
                    model: OPENAI_CONFIG.model,
                    messages: [{
                        role: 'user',
                        content: prompt
                    }],
                    max_tokens: OPENAI_CONFIG.maxTokens,
                    temperature: 0.3
                })
            });

            if (response.ok) {
                const aiData = await response.json();
                const analysis = aiData.choices[0].message.content;
                
                console.log('✅ Análisis de IA completado');
                console.log('\n📋 RECOMENDACIONES DE IA:');
                console.log(analysis);
                
                this.results.aiAnalysis = {
                    status: 'SUCCESS',
                    analysis,
                    timestamp: new Date().toISOString()
                };
            } else {
                throw new Error(`API OpenAI error: ${response.status}`);
            }

        } catch (error) {
            console.error('❌ Error en análisis de IA:', error);
            this.results.aiAnalysis = {
                status: 'ERROR',
                error: error.message
            };
        }
    }

    generateAIAnalysisPrompt() {
        return `Como experto en bases de datos y sistemas LPDP, analiza los siguientes resultados de auditoría de SQL Server:

CONECTIVIDAD: ${JSON.stringify(this.results.connectivity, null, 2)}

PRUEBAS DE INYECCIÓN/EXTRACCIÓN: ${JSON.stringify(this.results.injectionTests, null, 2)}

VALIDACIÓN DE ESQUEMA: ${JSON.stringify(this.results.schemaValidation?.comparison, null, 2)}

Por favor proporciona:
1. Evaluación general de la salud del sistema
2. Identificación de problemas críticos
3. Recomendaciones de mejora priorizadas
4. Próximos pasos sugeridos

Sé conciso y enfócate en aspectos críticos para producción.`;
    }

    /**
     * 📋 GENERAR INFORME FINAL
     */
    generateSummaryReport() {
        const endTime = new Date();
        const duration = (endTime - this.startTime) / 1000;

        // Calcular métricas generales
        const connectivityTests = Object.keys(this.results.connectivity).length;
        const connectivitySuccess = Object.values(this.results.connectivity).filter(r => r.status === 'SUCCESS').length;
        
        const injectionTests = Object.keys(this.results.injectionTests).length;
        const injectionSuccess = Object.values(this.results.injectionTests).filter(r => r.successRate >= 75).length;

        this.results.summary = {
            startTime: this.startTime.toISOString(),
            endTime: endTime.toISOString(),
            duration: `${duration.toFixed(2)} segundos`,
            totalTests: connectivityTests + injectionTests,
            connectivityRate: connectivityTests > 0 ? (connectivitySuccess / connectivityTests) * 100 : 0,
            injectionSuccessRate: injectionTests > 0 ? (injectionSuccess / injectionTests) * 100 : 0,
            overallStatus: this.calculateOverallStatus(),
            errors: this.results.errors
        };

        return this.results.summary;
    }

    calculateOverallStatus() {
        const errorCount = this.results.errors.length;
        const connectivityOk = this.results.connectivity.health?.status === 'SUCCESS';
        const hasSuccessfulInjections = Object.values(this.results.injectionTests).some(r => r.successRate > 50);

        if (errorCount === 0 && connectivityOk && hasSuccessfulInjections) {
            return '🟢 EXCELENTE';
        } else if (errorCount < 3 && connectivityOk) {
            return '🟡 ACEPTABLE';
        } else {
            return '🔴 REQUIERE ATENCIÓN';
        }
    }

    /**
     * 💾 GUARDAR RESULTADOS
     */
    async saveResults() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `audit-sql-server-${timestamp}.json`;
        
        fs.writeFileSync(filename, JSON.stringify(this.results, null, 2));
        console.log(`\n💾 Resultados guardados en: ${filename}`);
        
        return filename;
    }

    /**
     * 🎯 EJECUTOR PRINCIPAL
     */
    async runFullAudit() {
        console.log('🎯 INICIANDO AUDITORÍA INTEGRAL SQL SERVER');
        console.log('===========================================');
        console.log(`Servidor: ${SQL_SERVER_CONFIG.server}`);
        console.log(`Base de datos: ${SQL_SERVER_CONFIG.database}`);
        console.log(`API: ${SQL_SERVER_CONFIG.baseUrl}`);
        console.log(`Hora inicio: ${this.startTime.toISOString()}`);

        // Ejecutar fases de auditoría
        const connectivityOk = await this.verifyConnectivity();
        
        if (connectivityOk) {
            await this.runInjectionExtractionTests();
            await this.validateSchema();
            await this.analyzeWithAI();
        } else {
            console.log('❌ Auditoría detenida por fallas de conectividad críticas');
        }

        // Generar informe final
        const summary = this.generateSummaryReport();
        
        console.log('\n📋 RESUMEN FINAL DE AUDITORÍA');
        console.log('=============================');
        console.log(`Estado general: ${summary.overallStatus}`);
        console.log(`Duración: ${summary.duration}`);
        console.log(`Tasa conectividad: ${summary.connectivityRate.toFixed(1)}%`);
        console.log(`Tasa éxito inyección: ${summary.injectionSuccessRate.toFixed(1)}%`);
        console.log(`Errores: ${summary.errors.length}`);
        
        if (summary.errors.length > 0) {
            console.log('\n❌ Errores encontrados:');
            summary.errors.forEach((error, index) => {
                console.log(`   ${index + 1}. ${error}`);
            });
        }

        // Guardar resultados
        await this.saveResults();

        console.log('\n✅ AUDITORÍA COMPLETA');
        
        return summary.overallStatus.includes('🟢');
    }
}

// ===================================================================
// EJECUCIÓN PRINCIPAL
// ===================================================================
async function main() {
    const auditor = new SQLServerAuditor();
    
    try {
        const success = await auditor.runFullAudit();
        process.exit(success ? 0 : 1);
    } catch (error) {
        console.error('💥 Error crítico en auditoría:', error);
        process.exit(1);
    }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    main();
}

module.exports = { SQLServerAuditor };