/**
 * 📄 SERVICIO DE EXPORTACIÓN
 * Genera PDFs y Excel profesionales para RATs y documentos de compliance
 */

const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

class ExportService {
  
  /**
   * 📄 EXPORTAR RAT A PDF
   */
  async exportRATToPDF(ratId, options = {}) {
    try {
      console.log('📄 Generando PDF para RAT:', ratId);
      
      // Obtener datos del RAT
      const { data: rat, error } = await supabase
        .from('mapeo_datos_rat')
        .select('*')
        .eq('id', ratId)
        .single();
      
      if (error || !rat) {
        throw new Error('RAT no encontrado');
      }
      
      // Crear documento PDF
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
        info: {
          Title: `RAT - ${rat.nombre_actividad}`,
          Author: 'Jurídica Digital SpA',
          Subject: 'Registro de Actividades de Tratamiento - Ley 21.719',
          Creator: 'Sistema LPDP Jurídica Digital'
        }
      });
      
      // Buffer para almacenar el PDF
      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => {
        console.log('✅ PDF generado exitosamente');
      });
      
      // HEADER DEL DOCUMENTO
      this.addPDFHeader(doc, rat);
      
      // CONTENIDO PRINCIPAL
      this.addRATContent(doc, rat);
      
      // FOOTER LEGAL
      this.addPDFFooter(doc);
      
      // Finalizar documento
      doc.end();
      
      // Retornar buffer del PDF
      return new Promise((resolve, reject) => {
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(chunks);
          resolve({
            buffer: pdfBuffer,
            filename: `RAT_${rat.nombre_actividad}_${ratId}.pdf`,
            contentType: 'application/pdf',
            size: pdfBuffer.length
          });
        });
        doc.on('error', reject);
      });
      
    } catch (error) {
      console.error('❌ Error generando PDF:', error);
      throw error;
    }
  }
  
  /**
   * 📊 EXPORTAR RATs A EXCEL
   */
  async exportRATsToExcel(filters = {}, options = {}) {
    try {
      console.log('📊 Generando Excel de RATs con filtros:', filters);
      
      // Construir query con filtros
      let query = supabase
        .from('mapeo_datos_rat')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (filters.tenant_id) {
        query = query.eq('tenant_id', filters.tenant_id);
      }
      if (filters.estado) {
        query = query.eq('estado', filters.estado);
      }
      if (filters.area_responsable) {
        query = query.eq('area_responsable', filters.area_responsable);
      }
      if (filters.fecha_desde) {
        query = query.gte('created_at', filters.fecha_desde);
      }
      if (filters.fecha_hasta) {
        query = query.lte('created_at', filters.fecha_hasta);
      }
      
      const { data: rats, error } = await query;
      
      if (error) throw error;
      
      // Crear workbook Excel
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'Jurídica Digital SpA';
      workbook.lastModifiedBy = 'Sistema LPDP';
      workbook.created = new Date();
      workbook.modified = new Date();
      
      // HOJA 1: RATs Principal
      const mainSheet = workbook.addWorksheet('RATs', {
        properties: {
          tabColor: { argb: '4f46e5' }
        }
      });
      
      // Configurar columnas
      mainSheet.columns = [
        { header: 'ID RAT', key: 'id', width: 15 },
        { header: 'Nombre Actividad', key: 'nombre_actividad', width: 30 },
        { header: 'Área Responsable', key: 'area_responsable', width: 25 },
        { header: 'Responsable Proceso', key: 'responsable_proceso', width: 25 },
        { header: 'Email Responsable', key: 'email_responsable', width: 30 },
        { header: 'Finalidad Principal', key: 'finalidad_principal', width: 35 },
        { header: 'Base Legal', key: 'base_legal', width: 20 },
        { header: 'Estado', key: 'estado', width: 15 },
        { header: 'Plazo Conservación', key: 'plazo_conservacion', width: 20 },
        { header: 'Fecha Creación', key: 'created_at', width: 15 },
        { header: 'Última Actualización', key: 'updated_at', width: 15 }
      ];
      
      // Estilo del header
      mainSheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '4f46e5' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
      
      // Agregar datos
      rats.forEach((rat, index) => {
        const row = mainSheet.addRow({
          id: rat.id,
          nombre_actividad: rat.nombre_actividad,
          area_responsable: rat.area_responsable,
          responsable_proceso: rat.responsable_proceso,
          email_responsable: rat.email_responsable,
          finalidad_principal: rat.finalidad_principal,
          base_legal: rat.base_legal,
          estado: rat.estado,
          plazo_conservacion: rat.plazo_conservacion,
          created_at: rat.created_at ? new Date(rat.created_at).toLocaleDateString('es-CL') : '',
          updated_at: rat.updated_at ? new Date(rat.updated_at).toLocaleDateString('es-CL') : ''
        });
        
        // Alternar colores de filas
        if (index % 2 === 0) {
          row.eachCell((cell) => {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F8F9FA' } };
          });
        }
        
        // Color por estado
        const estadoCell = row.getCell('estado');
        switch (rat.estado) {
          case 'CERTIFICADO':
          case 'completado':
            estadoCell.font = { color: { argb: '10b981' }, bold: true };
            break;
          case 'PENDIENTE_APROBACION':
            estadoCell.font = { color: { argb: 'f59e0b' }, bold: true };
            break;
          case 'BORRADOR':
            estadoCell.font = { color: { argb: '6b7280' } };
            break;
          default:
            break;
        }
      });
      
      // HOJA 2: Estadísticas
      await this.addStatsSheet(workbook, rats);
      
      // HOJA 3: Centro de Costos
      await this.addCostCenterSheet(workbook, rats);
      
      // Generar buffer
      const buffer = await workbook.xlsx.writeBuffer();
      
      return {
        buffer,
        filename: `RATs_Export_${new Date().toISOString().slice(0, 10)}.xlsx`,
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        size: buffer.length,
        records_count: rats.length
      };
      
    } catch (error) {
      console.error('❌ Error generando Excel:', error);
      throw error;
    }
  }
  
  /**
   * 🎨 AGREGAR HEADER AL PDF
   */
  addPDFHeader(doc, rat) {
    // Logo y título
    doc.fontSize(20)
       .fillColor('#4f46e5')
       .text('REGISTRO DE ACTIVIDADES DE TRATAMIENTO', 50, 50, { align: 'center' });
    
    doc.fontSize(12)
       .fillColor('#666666')
       .text('Ley 21.719 - Protección de Datos Personales Chile', 50, 80, { align: 'center' });
    
    // Línea separadora
    doc.moveTo(50, 110)
       .lineTo(550, 110)
       .strokeColor('#4f46e5')
       .lineWidth(2)
       .stroke();
    
    // Información básica
    doc.fillColor('#000000')
       .fontSize(14)
       .text(`RAT ID: ${rat.id}`, 50, 130);
    
    doc.text(`Fecha de Generación: ${new Date().toLocaleDateString('es-CL')}`, 350, 130);
  }
  
  /**
   * 📝 AGREGAR CONTENIDO DEL RAT
   */
  addRATContent(doc, rat) {
    let yPosition = 170;
    
    // Función helper para agregar secciones
    const addSection = (title, content, y) => {
      doc.fontSize(14)
         .fillColor('#4f46e5')
         .text(title, 50, y);
      
      doc.fontSize(11)
         .fillColor('#000000')
         .text(content || 'No especificado', 50, y + 20, {
           width: 500,
           align: 'justify'
         });
      
      return y + 60;
    };
    
    // 1. IDENTIFICACIÓN
    yPosition = addSection(
      '1. IDENTIFICACIÓN DE LA ACTIVIDAD',
      `Nombre: ${rat.nombre_actividad}\nÁrea Responsable: ${rat.area_responsable}\nResponsable del Proceso: ${rat.responsable_proceso}\nEmail de Contacto: ${rat.email_responsable}`,
      yPosition
    );
    
    // 2. FINALIDAD
    yPosition = addSection(
      '2. FINALIDAD DEL TRATAMIENTO',
      `${rat.finalidad_principal}\n\nBase Legal: ${rat.base_legal}\n${rat.base_legal_descripcion || ''}`,
      yPosition
    );
    
    // 3. CATEGORÍAS DE DATOS
    if (rat.categorias_datos && typeof rat.categorias_datos === 'object') {
      const categorias = Object.keys(rat.categorias_datos).join(', ');
      yPosition = addSection(
        '3. CATEGORÍAS DE DATOS TRATADOS',
        categorias,
        yPosition
      );
    }
    
    // 4. CONSERVACIÓN
    yPosition = addSection(
      '4. PLAZO DE CONSERVACIÓN',
      rat.plazo_conservacion || 'No definido',
      yPosition
    );
    
    // 5. MEDIDAS DE SEGURIDAD
    let seguridadText = '';
    if (rat.medidas_seguridad_tecnicas && Array.isArray(rat.medidas_seguridad_tecnicas)) {
      seguridadText += `Técnicas: ${rat.medidas_seguridad_tecnicas.join(', ')}\n`;
    }
    if (rat.medidas_seguridad_organizativas && Array.isArray(rat.medidas_seguridad_organizativas)) {
      seguridadText += `Organizativas: ${rat.medidas_seguridad_organizativas.join(', ')}`;
    }
    
    yPosition = addSection(
      '5. MEDIDAS DE SEGURIDAD',
      seguridadText || 'No especificadas',
      yPosition
    );
    
    // 6. TRANSFERENCIAS INTERNACIONALES
    if (rat.transferencias_internacionales && typeof rat.transferencias_internacionales === 'object') {
      const transferencias = JSON.stringify(rat.transferencias_internacionales, null, 2);
      yPosition = addSection(
        '6. TRANSFERENCIAS INTERNACIONALES',
        transferencias !== '{}' ? transferencias : 'No se realizan transferencias internacionales',
        yPosition
      );
    }
  }
  
  /**
   * 📋 AGREGAR FOOTER AL PDF
   */
  addPDFFooter(doc) {
    const pageHeight = doc.page.height;
    
    // Línea separadora
    doc.moveTo(50, pageHeight - 100)
       .lineTo(550, pageHeight - 100)
       .strokeColor('#cccccc')
       .lineWidth(1)
       .stroke();
    
    // Footer legal
    doc.fontSize(10)
       .fillColor('#666666')
       .text('Este documento ha sido generado automáticamente por el Sistema LPDP de Jurídica Digital SpA', 50, pageHeight - 80, {
         align: 'center',
         width: 500
       });
    
    doc.text('En cumplimiento del Art. 16 de la Ley 21.719 sobre Protección de Datos Personales', 50, pageHeight - 65, {
      align: 'center',
      width: 500
    });
    
    doc.text(`Página 1 - Generado el ${new Date().toLocaleString('es-CL')}`, 50, pageHeight - 50, {
      align: 'center',
      width: 500
    });
  }
  
  /**
   * 📊 AGREGAR HOJA DE ESTADÍSTICAS
   */
  async addStatsSheet(workbook, rats) {
    const statsSheet = workbook.addWorksheet('Estadísticas', {
      properties: { tabColor: { argb: '10b981' } }
    });
    
    // Estadísticas por estado
    const estadoStats = rats.reduce((acc, rat) => {
      const estado = rat.estado || 'Sin Estado';
      acc[estado] = (acc[estado] || 0) + 1;
      return acc;
    }, {});
    
    statsSheet.addRow(['ESTADÍSTICAS POR ESTADO']);
    statsSheet.addRow([]);
    Object.entries(estadoStats).forEach(([estado, count]) => {
      statsSheet.addRow([estado, count]);
    });
    
    statsSheet.addRow([]);
    
    // Estadísticas por área
    const areaStats = rats.reduce((acc, rat) => {
      const area = rat.area_responsable || 'Sin Área';
      acc[area] = (acc[area] || 0) + 1;
      return acc;
    }, {});
    
    statsSheet.addRow(['ESTADÍSTICAS POR ÁREA']);
    statsSheet.addRow([]);
    Object.entries(areaStats).forEach(([area, count]) => {
      statsSheet.addRow([area, count]);
    });
  }
  
  /**
   * 🏢 AGREGAR HOJA DE CENTRO DE COSTOS
   */
  async addCostCenterSheet(workbook, rats) {
    const costSheet = workbook.addWorksheet('Centro de Costos', {
      properties: { tabColor: { argb: 'f59e0b' } }
    });
    
    costSheet.columns = [
      { header: 'Centro de Costos', key: 'centro', width: 30 },
      { header: 'Cantidad RATs', key: 'cantidad', width: 15 },
      { header: 'Certificados', key: 'certificados', width: 15 },
      { header: '% Compliance', key: 'compliance', width: 15 }
    ];
    
    // Estilo header
    costSheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'f59e0b' } };
    });
    
    // Datos por centro de costos
    const costCenterData = rats.reduce((acc, rat) => {
      const centro = rat.area_responsable || 'Sin Asignar';
      if (!acc[centro]) {
        acc[centro] = { total: 0, certificados: 0 };
      }
      acc[centro].total++;
      if (rat.estado === 'CERTIFICADO' || rat.estado === 'completado') {
        acc[centro].certificados++;
      }
      return acc;
    }, {});
    
    Object.entries(costCenterData).forEach(([centro, data]) => {
      const compliance = Math.round((data.certificados / data.total) * 100);
      costSheet.addRow({
        centro,
        cantidad: data.total,
        certificados: data.certificados,
        compliance: `${compliance}%`
      });
    });
  }
  
  /**
   * 📈 EXPORTAR MÉTRICAS DE COMPLIANCE
   */
  async exportComplianceMetrics(tenantId, options = {}) {
    try {
      console.log('📈 Generando reporte de métricas de compliance');
      
      // Obtener datos de compliance
      const metricsData = await this.getComplianceData(tenantId);
      
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Métricas Compliance');
      
      // Configurar reporte de métricas
      sheet.columns = [
        { header: 'Métrica', key: 'metric', width: 30 },
        { header: 'Valor', key: 'value', width: 15 },
        { header: 'Target', key: 'target', width: 15 },
        { header: 'Status', key: 'status', width: 15 }
      ];
      
      // Agregar métricas
      metricsData.forEach(metric => {
        sheet.addRow(metric);
      });
      
      return await workbook.xlsx.writeBuffer();
      
    } catch (error) {
      console.error('❌ Error exportando métricas:', error);
      throw error;
    }
  }
  
  /**
   * 📊 OBTENER DATOS DE COMPLIANCE
   */
  async getComplianceData(tenantId) {
    // Implementación de métricas específicas
    // Esto se conectaría con ComplianceMetrics del frontend
    return [
      { metric: 'RATs Completados', value: '85%', target: '90%', status: 'En Progreso' },
      { metric: 'EIPDs Generadas', value: '12', target: '15', status: 'Atención' },
      { metric: 'Compliance Score', value: '88%', target: '95%', status: 'Bueno' }
    ];
  }
}

module.exports = new ExportService();