import axios from './axios';
import errorHandler from '../utils/errorHandler';

// Generate PDF report
export const generatePDFReport = async (options = {}) => {
  try {
    const response = await axios.post('/export/pdf', options, {
      responseType: 'blob'
    });
    
    // Create blob URL and trigger download
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mykhata-report-${options.period || '30d'}-${Date.now()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return { success: true };
  } catch (error) {
    return errorHandler.handleApiError(error, () => generatePDFReport(options));
  }
};

// Export data as CSV
export const exportCSV = async (options = {}) => {
  try {
    const response = await axios.post('/export/csv', options, {
      responseType: 'blob'
    });
    
    // Create blob URL and trigger download
    const blob = new Blob([response.data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mykhata-${options.dataType || 'receipts'}-${options.period || '30d'}-${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return { success: true };
  } catch (error) {
    return errorHandler.handleApiError(error, () => exportCSV(options));
  }
};

// Export data as JSON
export const exportJSON = async (options = {}) => {
  try {
    const response = await axios.post('/export/json', options, {
      responseType: 'blob'
    });
    
    // Create blob URL and trigger download
    const blob = new Blob([response.data], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mykhata-data-${options.period || '30d'}-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return { success: true };
  } catch (error) {
    return errorHandler.handleApiError(error, () => exportJSON(options));
  }
};

// Get export options
export const getExportOptions = async () => {
  try {
    const response = await axios.get('/export/options');
    return response.data;
  } catch (error) {
    return errorHandler.handleApiError(error, () => getExportOptions());
  }
};

// Preview export data
export const previewExportData = async (options = {}) => {
  try {
    const response = await axios.post('/export/preview', options);
    return response.data;
  } catch (error) {
    return errorHandler.handleApiError(error, () => previewExportData(options));
  }
};
