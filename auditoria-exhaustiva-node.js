/**
 * 🔍 AUDITORÍA EXHAUSTIVA SUPABASE - NODE.JS COMPATIBLE
 * 
 * ANÁLISIS AUTOMÁTICO LÍNEA POR LÍNEA - SIN INTERVENCIÓN MANUAL
 */

const fs = require('fs').promises;
const path = require('path');

class AuditoriaExhaustiva {
  constructor() {
    this.resultados = {
      archivosEscaneados: 0,
      lineasEscaneadas: 0,
      llamadosSupabaseEncontrados: [],
      tablasEncontradas: new Set(),
      columnasEncontradas: new Map(),
      discrepancias: [],
      estructuraTablasTxt: new Map(),
      pruebasCRUD: new Map()
    };
    
    this.patronesSupabase = [
      /supabase\s*\.\s*from\s*\(\s*['"](.*?)['"].*?\)/gi,
      /\.from\s*\(\s*['"](.*?)['"].*?\)/gi,
      /\.select\s*\(\s*['"](.*?)['"].*?\)/gi,
      /\.insert\s*\(/gi,
      /\.update\s*\(/gi,
      /\.delete\s*\(/gi,
      /\.eq\s*\(\s*['"](.*?)['"].*?\)/gi,
      /\.filter\s*\(\s*['"](.*?)['"].*?\)/gi
    ];
  }

  /**
   * 🚀 EJECUTAR AUDITORÍA EXHAUSTIVA COMPLETA
   */
  async ejecutarAuditoriaCompleta() {
    console.log('🔍 ========================================');
    console.log('🔍 AUDITORÍA EXHAUSTIVA SUPABASE - AUTOMÁTICA');
    console.log('🔍 Análisis línea por línea - COMPLETO');
    console.log('🔍 ========================================\n');

    try {
      // FASE 1: Cargar estructura real de tablas.txt
      console.log('📋 FASE 1: Cargando estructura real de Tablas.txt...');
      await this.cargarEstructuraTablasTxt();
      
      // FASE 2: Escanear TODO el código fuente
      console.log('\n🔍 FASE 2: Escaneando TODO el código fuente...');
      await this.escanearCodigoCompleto();
      
      // FASE 3: Analizar llamados encontrados
      console.log('\n🔬 FASE 3: Analizando llamados Supabase encontrados...');
      await this.analizarLlamadosSupabase();
      
      // FASE 4: Comparar con estructura real
      console.log('\n⚖️ FASE 4: Comparando código vs estructura real...');
      await this.compararConEstructuraReal();
      
      // FASE 5: Generar reporte exhaustivo
      console.log('\n📊 FASE 5: Generando reporte exhaustivo...');
      await this.generarReporteCompleto();
      
      console.log('\n✅ AUDITORÍA EXHAUSTIVA COMPLETADA');
      console.log(`📁 Ver: auditoria-resultado-completo.json`);
      
    } catch (error) {
      console.error('💥 Error en auditoría exhaustiva:', error);
      throw error;
    }
  }

  /**
   * 📋 CARGAR ESTRUCTURA REAL DE TABLAS.TXT
   */
  async cargarEstructuraTablasTxt() {
    try {
      const rutaTablas = path.join(__dirname, 'Tablas.txt');
      const contenidoTablas = await fs.readFile(rutaTablas, 'utf8');
      
      console.log('📄 Archivo Tablas.txt cargado exitosamente');
      
      // Parsear estructura de tablas
      const lineas = contenidoTablas.split('\n');
      
      for (const linea of lineas) {
        const lineaLimpia = linea.trim();
        
        // Buscar líneas que definen tablas y columnas
        // Formato esperado: | nombre_tabla | BASE TABLE | nombre_columna |
        const matchTabla = lineaLimpia.match(/\|\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\|\s*BASE TABLE\s*\|\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\|/);
        
        if (matchTabla) {
          const nombreTabla = matchTabla[1];
          const nombreColumna = matchTabla[2];
          
          if (!this.resultados.estructuraTablasTxt.has(nombreTabla)) {
            this.resultados.estructuraTablasTxt.set(nombreTabla, {
              nombre: nombreTabla,
              columnas: [],
              tipoTabla: 'BASE TABLE'
            });
          }
          
          const tabla = this.resultados.estructuraTablasTxt.get(nombreTabla);
          if (!tabla.columnas.includes(nombreColumna)) {
            tabla.columnas.push(nombreColumna);
          }
        }
      }
      
      console.log(`✅ Estructura cargada: ${this.resultados.estructuraTablasTxt.size} tablas encontradas`);
      
      // Mostrar tablas encontradas
      for (const [nombre, info] of this.resultados.estructuraTablasTxt) {
        console.log(`   📋 ${nombre}: ${info.columnas.length} columnas`);
      }
      
    } catch (error) {
      console.error('❌ Error cargando Tablas.txt:', error.message);
      throw error;
    }
  }

  /**
   * 🔍 ESCANEAR TODO EL CÓDIGO FUENTE
   */
  async escanearCodigoCompleto() {
    const directoriosParaEscanear = [
      path.join(__dirname, 'frontend/src')
    ];
    
    for (const directorio of directoriosParaEscanear) {
      try {
        await fs.access(directorio);
        console.log(`📁 Escaneando directorio: ${directorio}`);
        await this.escanearDirectorioRecursivo(directorio);
      } catch (error) {
        console.log(`⚠️ Directorio no accesible: ${directorio}`);
      }
    }
    
    console.log(`\n📊 Escaneo completado:`);
    console.log(`   📁 Archivos escaneados: ${this.resultados.archivosEscaneados}`);
    console.log(`   📄 Líneas escaneadas: ${this.resultados.lineasEscaneadas}`);
    console.log(`   🔗 Llamados Supabase encontrados: ${this.resultados.llamadosSupabaseEncontrados.length}`);
  }

  /**
   * 📁 ESCANEAR DIRECTORIO RECURSIVO
   */
  async escanearDirectorioRecursivo(directorio) {
    try {
      const elementos = await fs.readdir(directorio, { withFileTypes: true });
      
      for (const elemento of elementos) {
        const rutaCompleta = path.join(directorio, elemento.name);
        
        if (elemento.isDirectory()) {
          // Saltar directorios innecesarios
          if (!['node_modules', '.git', 'build', 'dist', '__pycache__', '.cache'].includes(elemento.name)) {
            await this.escanearDirectorioRecursivo(rutaCompleta);
          }
        } else if (elemento.isFile()) {
          // Escanear archivos de código
          if (this.esArchivoDecodigo(elemento.name)) {
            await this.escanearArchivo(rutaCompleta);
          }
        }
      }
    } catch (error) {
      console.log(`⚠️ Error escaneando directorio ${directorio}:`, error.message);
    }
  }

  /**
   * 📄 DETERMINAR SI ES ARCHIVO DE CÓDIGO
   */
  esArchivoDecodigo(nombreArchivo) {
    const extensionesValidas = ['.js', '.jsx', '.ts', '.tsx'];
    return extensionesValidas.some(ext => nombreArchivo.endsWith(ext));
  }

  /**
   * 📄 ESCANEAR ARCHIVO INDIVIDUAL
   */
  async escanearArchivo(rutaArchivo) {
    try {
      const contenido = await fs.readFile(rutaArchivo, 'utf8');
      const lineas = contenido.split('\n');
      
      this.resultados.archivosEscaneados++;
      this.resultados.lineasEscaneadas += lineas.length;
      
      // Escanear cada línea
      for (let i = 0; i < lineas.length; i++) {
        const linea = lineas[i];
        const numeroLinea = i + 1;
        
        this.analizarLinea(linea, rutaArchivo, numeroLinea);
      }
      
      // Log progreso cada 10 archivos
      if (this.resultados.archivosEscaneados % 10 === 0) {
        console.log(`   📊 Progreso: ${this.resultados.archivosEscaneados} archivos escaneados...`);
      }
      
    } catch (error) {
      console.log(`⚠️ Error leyendo archivo ${rutaArchivo}:`, error.message);
    }
  }

  /**
   * 📝 ANALIZAR LÍNEA INDIVIDUAL
   */
  analizarLinea(linea, archivo, numeroLinea) {
    const lineaLimpia = linea.trim();
    
    // Buscar patrones de Supabase
    for (const patron of this.patronesSupabase) {
      patron.lastIndex = 0; // Reset regex
      
      let match;
      while ((match = patron.exec(lineaLimpia)) !== null) {
        const llamado = {
          archivo: archivo.replace(__dirname, ''),
          linea: numeroLinea,
          codigo: lineaLimpia,
          patron: patron.source,
          match: match[0],
          tabla: match[1] || null,
          columna: match[2] || null,
          tipo: this.determinarTipoOperacion(lineaLimpia)
        };
        
        this.resultados.llamadosSupabaseEncontrados.push(llamado);
        
        // Registrar tablas y columnas encontradas
        if (llamado.tabla) {
          this.resultados.tablasEncontradas.add(llamado.tabla);
          
          if (!this.resultados.columnasEncontradas.has(llamado.tabla)) {
            this.resultados.columnasEncontradas.set(llamado.tabla, new Set());
          }
        }
        
        if (llamado.columna) {
          const columnas = this.resultados.columnasEncontradas.get(llamado.tabla) || new Set();
          columnas.add(llamado.columna);
          this.resultados.columnasEncontradas.set(llamado.tabla, columnas);
        }
        
        // Evitar bucles infinitos en regex global
        if (!patron.global) break;
      }
    }
  }

  /**
   * 🔍 DETERMINAR TIPO DE OPERACIÓN
   */
  determinarTipoOperacion(linea) {
    if (linea.includes('.select(')) return 'SELECT';
    if (linea.includes('.insert(')) return 'INSERT';
    if (linea.includes('.update(')) return 'UPDATE';
    if (linea.includes('.delete(')) return 'DELETE';
    if (linea.includes('.from(')) return 'FROM';
    if (linea.includes('.eq(')) return 'FILTER_EQ';
    if (linea.includes('.filter(')) return 'FILTER';
    if (linea.includes('.maybeSingle(')) return 'MAYBE_SINGLE';
    if (linea.includes('.single(')) return 'SINGLE';
    return 'UNKNOWN';
  }

  /**
   * 🔬 ANALIZAR LLAMADOS SUPABASE ENCONTRADOS
   */
  async analizarLlamadosSupabase() {
    console.log('🔬 Analizando llamados Supabase encontrados...');
    
    // Agrupar por tabla
    const llamadosPorTabla = new Map();
    
    for (const llamado of this.resultados.llamadosSupabaseEncontrados) {
      if (llamado.tabla) {
        if (!llamadosPorTabla.has(llamado.tabla)) {
          llamadosPorTabla.set(llamado.tabla, []);
        }
        llamadosPorTabla.get(llamado.tabla).push(llamado);
      }
    }
    
    console.log(`📊 Llamados agrupados por tabla:`);
    for (const [tabla, llamados] of llamadosPorTabla) {
      const tipos = [...new Set(llamados.map(l => l.tipo))];
      console.log(`   📋 ${tabla}: ${llamados.length} llamados (${tipos.join(', ')})`);
    }
  }

  /**
   * ⚖️ COMPARAR CON ESTRUCTURA REAL
   */
  async compararConEstructuraReal() {
    console.log('⚖️ Comparando código vs estructura real...');
    
    // Comparar tablas
    const tablasEnCodigo = Array.from(this.resultados.tablasEncontradas);
    const tablasEnEstructura = Array.from(this.resultados.estructuraTablasTxt.keys());
    
    // Tablas en código pero no en estructura
    const tablasNoExisten = tablasEnCodigo.filter(tabla => 
      !tablasEnEstructura.includes(tabla)
    );
    
    // Tablas en estructura pero no usadas en código
    const tablasNoUsadas = tablasEnEstructura.filter(tabla => 
      !tablasEnCodigo.includes(tabla)
    );
    
    console.log(`📊 Comparación de tablas:`);
    console.log(`   ✅ Tablas válidas: ${tablasEnCodigo.filter(t => tablasEnEstructura.includes(t)).length}`);
    console.log(`   ❌ Tablas que no existen: ${tablasNoExisten.length}`);
    console.log(`   ⚠️ Tablas no usadas: ${tablasNoUsadas.length}`);
    
    if (tablasNoExisten.length > 0) {
      console.log(`   🚨 TABLAS QUE NO EXISTEN:`, tablasNoExisten);
    }
    
    // Registrar discrepancias
    for (const tabla of tablasNoExisten) {
      this.resultados.discrepancias.push({
        tipo: 'TABLA_NO_EXISTE',
        tabla: tabla,
        descripcion: `Tabla '${tabla}' usada en código pero no existe en BD`,
        severidad: 'CRÍTICA'
      });
    }
    
    // Comparar columnas
    for (const [tabla, columnasEnCodigo] of this.resultados.columnasEncontradas) {
      if (this.resultados.estructuraTablasTxt.has(tabla)) {
        const estructuraReal = this.resultados.estructuraTablasTxt.get(tabla);
        const columnasReales = estructuraReal.columnas;
        
        const columnasArray = Array.from(columnasEnCodigo);
        const columnasNoExisten = columnasArray.filter(col => 
          col && !columnasReales.includes(col)
        );
        
        for (const columna of columnasNoExisten) {
          this.resultados.discrepancias.push({
            tipo: 'COLUMNA_NO_EXISTE',
            tabla: tabla,
            columna: columna,
            descripcion: `Columna '${columna}' en tabla '${tabla}' no existe en BD`,
            severidad: 'ALTA'
          });
        }
      }
    }
  }

  /**
   * 📊 GENERAR REPORTE EXHAUSTIVO
   */
  async generarReporteCompleto() {
    const reporte = {
      timestamp: new Date().toISOString(),
      resumen: {
        archivosEscaneados: this.resultados.archivosEscaneados,
        lineasEscaneadas: this.resultados.lineasEscaneadas,
        llamadosSupabaseEncontrados: this.resultados.llamadosSupabaseEncontrados.length,
        tablasEncontradas: this.resultados.tablasEncontradas.size,
        discrepanciasEncontradas: this.resultados.discrepancias.length
      },
      estructuraRealBD: Object.fromEntries(
        Array.from(this.resultados.estructuraTablasTxt.entries()).map(([k, v]) => [
          k, 
          { columnas: v.columnas, totalColumnas: v.columnas.length }
        ])
      ),
      tablasUsadasEnCodigo: Array.from(this.resultados.tablasEncontradas),
      columnasUsadasEnCodigo: Object.fromEntries(
        Array.from(this.resultados.columnasEncontradas.entries()).map(([k, v]) => [
          k, 
          Array.from(v).filter(col => col !== null)
        ])
      ),
      discrepanciasCriticas: this.resultados.discrepancias,
      detalleLlamadosSupabase: this.resultados.llamadosSupabaseEncontrados,
      recomendaciones: this.generarRecomendaciones()
    };
    
    // Guardar reporte completo
    const rutaReporte = path.join(__dirname, 'auditoria-resultado-completo.json');
    await fs.writeFile(rutaReporte, JSON.stringify(reporte, null, 2));
    
    // Mostrar resumen en consola
    this.mostrarResumenConsola(reporte);
    
    console.log(`\n📁 Reporte completo guardado en: ${rutaReporte}`);
    
    return reporte;
  }

  /**
   * 💡 GENERAR RECOMENDACIONES
   */
  generarRecomendaciones() {
    const recomendaciones = [];
    
    // Recomendaciones por discrepancias
    const tablasNoExisten = this.resultados.discrepancias.filter(d => d.tipo === 'TABLA_NO_EXISTE');
    const columnasNoExisten = this.resultados.discrepancias.filter(d => d.tipo === 'COLUMNA_NO_EXISTE');
    
    if (tablasNoExisten.length > 0) {
      recomendaciones.push({
        prioridad: 'CRÍTICA',
        categoria: 'INFRAESTRUCTURA',
        descripcion: `${tablasNoExisten.length} tablas usadas en código NO EXISTEN en BD`,
        accion: 'Crear tablas faltantes con SQL CREATE TABLE',
        tablasFaltantes: tablasNoExisten.map(d => d.tabla),
        impacto: 'Sistema no funcionará - errores 404/500 en runtime'
      });
    }
    
    if (columnasNoExisten.length > 0) {
      recomendaciones.push({
        prioridad: 'ALTA',
        categoria: 'ESQUEMA_BD',
        descripcion: `${columnasNoExisten.length} columnas usadas en código NO EXISTEN`,
        accion: 'Agregar columnas faltantes con SQL ALTER TABLE',
        columnasFaltantes: columnasNoExisten.map(d => `${d.tabla}.${d.columna}`),
        impacto: 'Errores en queries específicas'
      });
    }
    
    // Recomendación general si todo está OK
    if (this.resultados.discrepancias.length === 0) {
      recomendaciones.push({
        prioridad: 'INFO',
        categoria: 'ESTADO',
        descripcion: 'Estructura BD y código están sincronizados',
        accion: 'Continuar con testing de funcionalidad',
        impacto: 'Sistema debería funcionar correctamente'
      });
    }
    
    return recomendaciones;
  }

  /**
   * 📊 MOSTRAR RESUMEN EN CONSOLA
   */
  mostrarResumenConsola(reporte) {
    console.log('\n📊 ========== RESUMEN AUDITORÍA EXHAUSTIVA ==========');
    console.log(`📁 Archivos escaneados: ${reporte.resumen.archivosEscaneados}`);
    console.log(`📄 Líneas analizadas: ${reporte.resumen.lineasEscaneadas.toLocaleString()}`);
    console.log(`🔗 Llamados Supabase encontrados: ${reporte.resumen.llamadosSupabaseEncontrados}`);
    console.log(`📋 Tablas identificadas en código: ${reporte.resumen.tablasEncontradas}`);
    console.log(`📊 Tablas en BD real: ${Object.keys(reporte.estructuraRealBD).length}`);
    console.log(`🚨 Discrepancias críticas: ${reporte.resumen.discrepanciasEncontradas}`);
    
    if (reporte.discrepanciasCriticas.length > 0) {
      console.log('\n🚨 PROBLEMAS CRÍTICOS IDENTIFICADOS:');
      reporte.discrepanciasCriticas.forEach((disc, i) => {
        console.log(`${i + 1}. [${disc.severidad}] ${disc.descripcion}`);
      });
    } else {
      console.log('\n✅ NO SE ENCONTRARON DISCREPANCIAS CRÍTICAS');
    }
    
    if (reporte.recomendaciones.length > 0) {
      console.log('\n💡 RECOMENDACIONES PRIORITARIAS:');
      reporte.recomendaciones.forEach((rec, i) => {
        console.log(`${i + 1}. [${rec.prioridad}] ${rec.descripcion}`);
        console.log(`   🔧 Acción: ${rec.accion}`);
        console.log(`   ⚡ Impacto: ${rec.impacto}`);
      });
    }
    
    console.log('\n===============================================');
  }
}

// Ejecutar auditoría automáticamente
const auditor = new AuditoriaExhaustiva();
auditor.ejecutarAuditoriaCompleta()
  .then(() => {
    console.log('\n🎉 AUDITORÍA COMPLETADA EXITOSAMENTE');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 ERROR FATAL EN AUDITORÍA:', error);
    process.exit(1);
  });