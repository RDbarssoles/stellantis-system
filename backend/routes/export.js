import express from 'express';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { dfmeaStorage, edpsStorage, dvpStorage } from '../models/storage.js';

export const exportRouter = express.Router();

/**
 * GET /api/export/dfmea/:id/excel
 * Export DFMEA to Excel format
 */
exportRouter.get('/dfmea/:id/excel', async (req, res, next) => {
  try {
    const entry = await dfmeaStorage.getById(req.params.id);
    if (!entry) {
      return res.status(404).json({ success: false, error: 'DFMEA entry not found' });
    }

    // Populate linked data
    if (entry.preventionControl?.edpsId) {
      entry.preventionControl.edpsData = await edpsStorage.getById(entry.preventionControl.edpsId);
    }
    if (entry.detectionControl?.dvpId) {
      entry.detectionControl.dvpData = await dvpStorage.getById(entry.detectionControl.dvpId);
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('DFMEA');

    // Add header
    worksheet.columns = [
      { header: 'Field', key: 'field', width: 30 },
      { header: 'Value', key: 'value', width: 50 }
    ];

    // Add data
    worksheet.addRow({ field: 'DFMEA ID', value: entry.id });
    worksheet.addRow({ field: 'Generic Failure', value: entry.genericFailure });
    worksheet.addRow({ field: 'Failure Mode', value: entry.failureMode });
    worksheet.addRow({ field: 'Cause', value: entry.cause });
    worksheet.addRow({ field: '', value: '' }); // Empty row

    // Prevention Control
    worksheet.addRow({ field: 'Prevention Control', value: '' });
    if (entry.preventionControl?.edpsData) {
      worksheet.addRow({ field: '  - EDPS Norm Number', value: entry.preventionControl.edpsData.normNumber });
      worksheet.addRow({ field: '  - EDPS Title', value: entry.preventionControl.edpsData.title });
      worksheet.addRow({ field: '  - Description', value: entry.preventionControl.edpsData.description });
    }
    worksheet.addRow({ field: '', value: '' }); // Empty row

    // Detection Control
    worksheet.addRow({ field: 'Detection Control', value: '' });
    if (entry.detectionControl?.dvpData) {
      worksheet.addRow({ field: '  - DVP Procedure ID', value: entry.detectionControl.dvpData.procedureId });
      worksheet.addRow({ field: '  - Test Name', value: entry.detectionControl.dvpData.testName });
      worksheet.addRow({ field: '  - Acceptance Criteria', value: entry.detectionControl.dvpData.acceptanceCriteria });
    }
    worksheet.addRow({ field: '', value: '' }); // Empty row

    // Risk ratings
    worksheet.addRow({ field: 'Severity', value: entry.severity });
    worksheet.addRow({ field: 'Occurrence', value: entry.occurrence });
    worksheet.addRow({ field: 'Detection', value: entry.detection });
    worksheet.addRow({ field: 'RPN', value: entry.rpn });

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=DFMEA_${entry.id}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/export/dfmea/:id/pdf
 * Export DFMEA to PDF format
 */
exportRouter.get('/dfmea/:id/pdf', async (req, res, next) => {
  try {
    const entry = await dfmeaStorage.getById(req.params.id);
    if (!entry) {
      return res.status(404).json({ success: false, error: 'DFMEA entry not found' });
    }

    // Populate linked data
    if (entry.preventionControl?.edpsId) {
      entry.preventionControl.edpsData = await edpsStorage.getById(entry.preventionControl.edpsId);
    }
    if (entry.detectionControl?.dvpId) {
      entry.detectionControl.dvpData = await dvpStorage.getById(entry.detectionControl.dvpId);
    }

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=DFMEA_${entry.id}.pdf`);

    doc.pipe(res);

    // Title
    doc.fontSize(20).text('DFMEA Report', { align: 'center' });
    doc.moveDown();

    // Basic info
    doc.fontSize(14).text('Failure Information', { underline: true });
    doc.fontSize(10);
    doc.text(`Generic Failure: ${entry.genericFailure}`);
    doc.text(`Failure Mode: ${entry.failureMode}`);
    doc.text(`Cause: ${entry.cause}`);
    doc.moveDown();

    // Prevention Control
    doc.fontSize(14).text('Prevention Control', { underline: true });
    doc.fontSize(10);
    if (entry.preventionControl?.edpsData) {
      doc.text(`EDPS Norm: ${entry.preventionControl.edpsData.normNumber}`);
      doc.text(`Title: ${entry.preventionControl.edpsData.title}`);
      doc.text(`Description: ${entry.preventionControl.edpsData.description}`);
    } else {
      doc.text('No prevention control defined');
    }
    doc.moveDown();

    // Detection Control
    doc.fontSize(14).text('Detection Control', { underline: true });
    doc.fontSize(10);
    if (entry.detectionControl?.dvpData) {
      doc.text(`DVP Procedure: ${entry.detectionControl.dvpData.procedureId}`);
      doc.text(`Test Name: ${entry.detectionControl.dvpData.testName}`);
      doc.text(`Acceptance Criteria: ${entry.detectionControl.dvpData.acceptanceCriteria}`);
    } else {
      doc.text('No detection control defined');
    }
    doc.moveDown();

    // Risk Assessment
    doc.fontSize(14).text('Risk Assessment', { underline: true });
    doc.fontSize(10);
    doc.text(`Severity: ${entry.severity || 'N/A'}`);
    doc.text(`Occurrence: ${entry.occurrence || 'N/A'}`);
    doc.text(`Detection: ${entry.detection || 'N/A'}`);
    doc.text(`RPN (Risk Priority Number): ${entry.rpn || 'N/A'}`);
    doc.moveDown();

    // Footer
    doc.fontSize(8).text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.text(`Document ID: ${entry.id}`, { align: 'center' });

    doc.end();
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/export/dfmea/all/excel
 * Export all DFMEA entries to Excel
 */
exportRouter.get('/dfmea/all/excel', async (req, res, next) => {
  try {
    const entries = await dfmeaStorage.getAll();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('DFMEA List');

    // Add header
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Generic Failure', key: 'genericFailure', width: 25 },
      { header: 'Failure Mode', key: 'failureMode', width: 25 },
      { header: 'Cause', key: 'cause', width: 25 },
      { header: 'Prevention (EDPS)', key: 'prevention', width: 20 },
      { header: 'Detection (DVP)', key: 'detection', width: 20 },
      { header: 'Severity', key: 'severity', width: 10 },
      { header: 'Occurrence', key: 'occurrence', width: 10 },
      { header: 'Detection', key: 'detectionRating', width: 10 },
      { header: 'RPN', key: 'rpn', width: 10 },
      { header: 'Status', key: 'status', width: 10 }
    ];

    // Add data
    for (const entry of entries) {
      worksheet.addRow({
        id: entry.id.substring(0, 8),
        genericFailure: entry.genericFailure,
        failureMode: entry.failureMode,
        cause: entry.cause,
        prevention: entry.preventionControl?.edpsId ? 'Linked' : 'None',
        detection: entry.detectionControl?.dvpId ? 'Linked' : 'None',
        severity: entry.severity,
        occurrence: entry.occurrence,
        detectionRating: entry.detection,
        rpn: entry.rpn,
        status: entry.status
      });
    }

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=DFMEA_All.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
});

