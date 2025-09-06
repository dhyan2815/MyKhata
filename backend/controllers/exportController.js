/**
 * Export Controller
 * 
 * Handles data export requests:
 * - PDF report generation
 * - CSV data export
 * - JSON data export
 * - Receipt image compilation
 * - Custom report generation
 */
import ExportService from '../utils/exportService.js';
import asyncHandler from 'express-async-handler';

const exportService = new ExportService();

// @desc    Generate PDF report
// @route   POST /api/export/pdf
// @access  Private
const generatePDFReport = asyncHandler(async (req, res) => {
  try {
    const { period = '30d', includeCharts = true, includeReceipts = true, reportType = 'comprehensive' } = req.body;

    // Generate PDF
    const pdfBuffer = await exportService.generatePDFReport(req.user.id, {
      period,
      includeCharts,
      includeReceipts,
      reportType
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="mykhata-report-${period}-${Date.now()}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    res.send(pdfBuffer);
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500);
    throw new Error(`Failed to generate PDF report: ${error.message}`);
  }
});

// @desc    Export data as CSV
// @route   POST /api/export/csv
// @access  Private
const exportCSV = asyncHandler(async (req, res) => {
  try {
    const { period = '30d', dataType = 'receipts' } = req.body;

    // Generate CSV
    const csvContent = await exportService.exportCSV(req.user.id, {
      period,
      dataType
    });

    // Set response headers
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="mykhata-${dataType}-${period}-${Date.now()}.csv"`);

    res.send(csvContent);
  } catch (error) {
    console.error('CSV export error:', error);
    res.status(500);
    throw new Error(`Failed to export CSV: ${error.message}`);
  }
});

// @desc    Export data as JSON
// @route   POST /api/export/json
// @access  Private
const exportJSON = asyncHandler(async (req, res) => {
  try {
    const { period = '30d' } = req.body;

    // Generate JSON
    const jsonContent = await exportService.exportJSON(req.user.id, {
      period
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="mykhata-data-${period}-${Date.now()}.json"`);

    res.send(jsonContent);
  } catch (error) {
    console.error('JSON export error:', error);
    res.status(500);
    throw new Error(`Failed to export JSON: ${error.message}`);
  }
});

// @desc    Get export options and formats
// @route   GET /api/export/options
// @access  Private
const getExportOptions = asyncHandler(async (req, res) => {
  try {
    const options = {
      formats: [
        {
          id: 'pdf',
          name: 'PDF Report',
          description: 'Comprehensive report with charts and analytics',
          icon: '📄',
          supportedTypes: ['receipts', 'transactions', 'analytics']
        },
        {
          id: 'csv',
          name: 'CSV Data',
          description: 'Raw data in spreadsheet format',
          icon: '📊',
          supportedTypes: ['receipts', 'transactions']
        },
        {
          id: 'json',
          name: 'JSON Data',
          description: 'Structured data for developers',
          icon: '🔧',
          supportedTypes: ['receipts', 'transactions', 'analytics']
        }
      ],
      periods: [
        { id: '7d', name: 'Last 7 days', days: 7 },
        { id: '30d', name: 'Last 30 days', days: 30 },
        { id: '90d', name: 'Last 90 days', days: 90 },
        { id: '1y', name: 'Last year', days: 365 }
      ],
      reportTypes: [
        { id: 'comprehensive', name: 'Comprehensive Report', description: 'Full analysis with all sections' },
        { id: 'summary', name: 'Summary Report', description: 'Key metrics and overview only' },
        { id: 'detailed', name: 'Detailed Report', description: 'In-depth analysis with charts' }
      ]
    };

    res.status(200).json({
      success: true,
      data: options
    });
  } catch (error) {
    console.error('Export options error:', error);
    res.status(500);
    throw new Error(`Failed to get export options: ${error.message}`);
  }
});

// @desc    Preview export data
// @route   POST /api/export/preview
// @access  Private
const previewExportData = asyncHandler(async (req, res) => {
  try {
    const { period = '30d', dataType = 'receipts', limit = 10 } = req.body;

    // Get preview data
    const previewData = await exportService.gatherReportData(
      req.user.id,
      new Date(Date.now() - parseInt(period.replace('d', '')) * 24 * 60 * 60 * 1000),
      new Date(),
      'summary'
    );

    // Limit results for preview
    if (previewData.receipts) {
      previewData.receipts = previewData.receipts.slice(0, limit);
    }
    if (previewData.transactions) {
      previewData.transactions = previewData.transactions.slice(0, limit);
    }

    res.status(200).json({
      success: true,
      data: {
        preview: previewData,
        totalCount: {
          receipts: previewData.receipts?.length || 0,
          transactions: previewData.transactions?.length || 0
        },
        period: {
          startDate: previewData.period.startDate,
          endDate: previewData.period.endDate,
          label: previewData.period.label
        }
      }
    });
  } catch (error) {
    console.error('Export preview error:', error);
    res.status(500);
    throw new Error(`Failed to preview export data: ${error.message}`);
  }
});

export {
  generatePDFReport,
  exportCSV,
  exportJSON,
  getExportOptions,
  previewExportData
};
