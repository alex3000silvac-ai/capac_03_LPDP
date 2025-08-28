/**
 * PRUEBA EXHAUSTIVA DEL MOTOR DE INTELIGENCIA RAT
 * Valida TODAS las casuísticas implementadas
 */

import ratIntelligenceEngine from './src/services/ratIntelligenceEngine.js';

const testScenarios = [
  // ESCENARIO 1: TU PROCESO DE SALUD
  {
    nombre: 'PROCESO SALUD (TU CASO)',
    ratData: {
      area: 'salud',
      nombre_actividad: 'Procesamiento Datos Pacientes',
      finalidad: 'Atención médica y seguimiento de pacientes con situación socioeconómica',
      categorias_datos: ['datos_medicos', 'situacion_socioeconomica'],
      decisiones_automatizadas: true,
      cantidad_titulares: 15000,
      destinatarios_externos: [
        { nombre: 'AWS Cloud', pais: 'Estados Unidos' },
        { nombre: 'Microsoft Azure', pais: 'Estados Unidos' }
      ],
      base_licitud: 'consentimiento',
      tiempo_retencion: '10 años'
    }
  },
  
  // ESCENARIO 2: FINANCIERO CRÍTICO
  {
    nombre: 'BANCO SCORING CREDITICIO',
    ratData: {
      nombre_actividad: 'Sistema Scoring Crediticio',
      finalidad: 'Evaluación de riesgo crediticio y scoring económico automatizado',
      categorias_datos: ['situacion_socioeconomica', 'antecedentes'],
      decisiones_automatizadas: true,
      cantidad_titulares: 500000,
      destinatarios_externos: [
        { nombre: 'Equifax', pais: 'Estados Unidos' },
        { nombre: 'Dicom', pais: 'Chile' }
      ],
      volumen_datos: 'masivo'
    }
  },
  
  // ESCENARIO 3: EDUCACIÓN CON MENORES
  {
    nombre: 'UNIVERSIDAD CON MENORES',
    ratData: {
      nombre_actividad: 'Sistema Gestión Estudiantil',
      finalidad: 'Evaluación rendimiento académico estudiantes menores',
      categorias_datos: ['menores', 'datos_academicos'],
      decisiones_automatizadas: true,
      cantidad_titulares: 2000,
      base_licitud: '',  // Falta base de licitud
      tiempo_retencion: 'indefinido'  // Problemático
    }
  },
  
  // ESCENARIO 4: GOBIERNO TRANSPARENCIA
  {
    nombre: 'MUNICIPALIDAD SERVICIOS',
    ratData: {
      nombre_actividad: 'Servicios Municipales Digitales',
      finalidad: 'Atención ciudadana y trámites gobierno digital',
      categorias_datos: ['datos_personales', 'situacion_socioeconomica'],
      cantidad_titulares: 80000,
      destinatarios_externos: [
        { nombre: 'Google Cloud', pais: 'Estados Unidos' }
      ]
    }
  },
  
  // ESCENARIO 5: RETAIL PERFILADO
  {
    nombre: 'RETAIL RECOMENDACIONES',
    ratData: {
      nombre_actividad: 'Sistema Recomendación Productos',
      finalidad: 'Perfilado clientes y segmentación para recomendaciones personalizadas',
      categorias_datos: ['datos_personales', 'preferencias'],
      decisiones_automatizadas: true,
      cantidad_titulares: 1000000,
      volumen_datos: 'masivo'
    }
  },
  
  // ESCENARIO 6: TECNOLOGÍA BIOMÉTRICA
  {
    nombre: 'APP RECONOCIMIENTO FACIAL',
    ratData: {
      nombre_actividad: 'App Reconocimiento Biométrico',
      finalidad: 'Autenticación por reconocimiento facial y huella dactilar',
      categorias_datos: ['biometricos', 'huella'],
      decisiones_automatizadas: true,
      cantidad_titulares: 50000,
      destinatarios_externos: [
        { nombre: 'Amazon Rekognition', pais: 'Estados Unidos' }
      ]
    }
  },
  
  // ESCENARIO 7: CASO SIMPLE SIN PROBLEMAS
  {
    nombre: 'CASO SIMPLE RRHH',
    ratData: {
      nombre_actividad: 'Gestión Nómina',
      finalidad: 'Pago de sueldos empleados',
      categorias_datos: ['datos_personales'],
      cantidad_titulares: 50,
      base_licitud: 'contrato_laboral',
      tiempo_retencion: '7 años'
    }
  }
];

async function runTests() {
  console.log('🚀 INICIANDO PRUEBAS EXHAUSTIVAS DEL MOTOR DE INTELIGENCIA\n');
  
  for (let i = 0; i < testScenarios.length; i++) {
    const scenario = testScenarios[i];
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📋 ESCENARIO ${i + 1}: ${scenario.nombre}`);
    console.log(`${'='.repeat(60)}`);
    
    try {
      const resultado = await ratIntelligenceEngine.evaluateRATActivity(scenario.ratData);
      
      console.log(`🎯 ÁREA DETECTADA: ${resultado.area_detectada}`);
      console.log(`⚠️  NIVEL DE RIESGO: ${resultado.risk_level}`);
      console.log(`📄 DOCUMENTOS REQUERIDOS: ${resultado.total_documentos_requeridos}`);
      console.log(`🔔 NOTIFICACIONES GENERADAS: ${resultado.notificaciones_dpo.length}`);
      console.log(`⏰ URGENCIA MÁXIMA: ${resultado.urgencia_maxima}`);
      
      if (resultado.datos_sensibles_detectados.length > 0) {
        console.log(`🔍 DATOS SENSIBLES: ${resultado.datos_sensibles_detectados.join(', ')}`);
      }
      
      if (resultado.factores_riesgo.length > 0) {
        console.log(`⚡ FACTORES DE RIESGO: ${resultado.factores_riesgo.length}`);
        resultado.factores_riesgo.forEach(factor => console.log(`   • ${factor}`));
      }
      
      if (resultado.compliance_alerts.length > 0) {
        console.log(`\n📢 ALERTAS GENERADAS:`);
        resultado.compliance_alerts.forEach((alert, idx) => {
          console.log(`   ${idx + 1}. [${alert.tipo.toUpperCase()}] ${alert.titulo}`);
          console.log(`      📝 ${alert.descripcion}`);
          console.log(`      ⚖️  ${alert.fundamento_legal}`);
        });
      }
      
      if (resultado.notificaciones_dpo.length > 0) {
        console.log(`\n🔔 NOTIFICACIONES AL DPO:`);
        resultado.notificaciones_dpo.forEach((notif, idx) => {
          console.log(`   ${idx + 1}. ID: ${notif.id}`);
          console.log(`      📋 ${notif.titulo}`);
          console.log(`      ⏰ Vence en: ${notif.vencimiento} días`);
          console.log(`      🔗 Documento: ${notif.documentoId}`);
        });
      }
      
    } catch (error) {
      console.error(`❌ ERROR EN ESCENARIO ${scenario.nombre}:`, error);
    }
  }
  
  console.log(`\n${'🎉'.repeat(20)}`);
  console.log('✅ PRUEBAS COMPLETADAS - TODOS LOS ESCENARIOS ANALIZADOS');
  console.log(`${'🎉'.repeat(20)}\n`);
}

// Solo ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests();
}

export { testScenarios, runTests };