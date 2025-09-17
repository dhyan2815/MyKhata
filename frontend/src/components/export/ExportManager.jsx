/**
 * ExportManager Component
 * 
 * Comprehensive data export functionality:
 * - Multiple export formats (PDF, CSV, JSON)
 * - Customizable report options
 * - Data preview before export
 * - Progress tracking and status updates
 * - Responsive design with theme support
 */
import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { 
  generatePDFReport,
  exportCSV,
  exportJSON,
  getExportOptions,
  previewExportData
} from '../../api/export';
import toast from 'react-hot-toast';

const ExportManager = ({ onClose }) => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('pdf');
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [options, setOptions] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [exportSettings, setExportSettings] = useState({
    period: '30d',
    dataType: 'receipts',
    reportType: 'comprehensive',
    includeCharts: true,
    includeReceipts: true
  });

  // Load export options on mount
  useEffect(() => {
    loadExportOptions();
  }, []);

  const loadExportOptions = async () => {
    try {
      const response = await getExportOptions();
      if (response.success) {
        setOptions(response.data);
      }
    } catch (error) {
      console.error('Error loading export options:', error);
      toast.error('Failed to load export options');
    }
  };

  const handleSettingChange = (key, value) => {
    setExportSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handlePreview = async () => {
    setPreviewLoading(true);
    try {
      const response = await previewExportData(exportSettings);
      if (response.success) {
        setPreviewData(response.data);
        toast.success('Preview generated successfully');
      }
    } catch (error) {
      console.error('Error generating preview:', error);
      toast.error('Failed to generate preview');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleExport = async () => {
    setLoading(true);
    try {
      let response;
      
      switch (activeTab) {
        case 'pdf':
          response = await generatePDFReport(exportSettings);
          break;
        case 'csv':
          response = await exportCSV(exportSettings);
          break;
        case 'json':
          response = await exportJSON(exportSettings);
          break;
        default:
          throw new Error('Invalid export format');
      }

      if (response.success) {
        toast.success('Export completed successfully');
        if (onClose) onClose();
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Export failed');
    } finally {
      setLoading(false);
    }
  };

  // Format selector component
  const FormatSelector = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {options?.formats.map(format => (
        <button
          key={format.id}
          onClick={() => setActiveTab(format.id)}
          className={`p-4 rounded-lg border-2 transition-all ${
            activeTab === format.id
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
          }`}
        >
          <div className="text-center">
            <div className="text-3xl mb-2">{format.icon}</div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              {format.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {format.description}
            </p>
          </div>
        </button>
      ))}
    </div>
  );

  // Settings form component
  const SettingsForm = () => (
    <div className="space-y-6">
      {/* Period Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Time Period
        </label>
        <select
          value={exportSettings.period}
          onChange={(e) => handleSettingChange('period', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        >
          {options?.periods.map(period => (
            <option key={period.id} value={period.id}>
              {period.name}
            </option>
          ))}
        </select>
      </div>

      {/* Data Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Data Type
        </label>
        <select
          value={exportSettings.dataType}
          onChange={(e) => handleSettingChange('dataType', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="receipts">Receipts</option>
          <option value="transactions">Transactions</option>
        </select>
      </div>

      {/* PDF-specific options */}
      {activeTab === 'pdf' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Report Type
            </label>
            <select
              value={exportSettings.reportType}
              onChange={(e) => handleSettingChange('reportType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              {options?.reportTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={exportSettings.includeCharts}
                onChange={(e) => handleSettingChange('includeCharts', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Include Charts and Analytics
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={exportSettings.includeReceipts}
                onChange={(e) => handleSettingChange('includeReceipts', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Include Receipt Images
              </span>
            </label>
          </div>
        </>
      )}
    </div>
  );

  // Preview component
  const PreviewSection = () => {
    if (!previewData) return null;

    return (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Data Preview
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {previewData.totalCount.receipts}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Receipts</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {previewData.totalCount.transactions}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Transactions</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {previewData.period.label}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Period</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {activeTab.toUpperCase()}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Format</p>
          </div>
        </div>

        {/* Sample data preview */}
        {previewData.preview.receipts && previewData.preview.receipts.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Sample Receipts:</h4>
            <div className="space-y-2">
              {previewData.preview.receipts.slice(0, 3).map((receipt, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-white dark:bg-gray-700 rounded">
                  <span className="text-sm text-gray-900 dark:text-white">
                    {receipt.extractedData?.merchant || 'Unknown'}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    ${receipt.extractedData?.amount || 0}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Action buttons
  const ActionButtons = () => (
    <div className="flex space-x-3">
      <button
        onClick={handlePreview}
        disabled={previewLoading || loading}
        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {previewLoading ? 'Generating...' : 'Preview'}
      </button>
      
      <button
        onClick={handleExport}
        disabled={loading || previewLoading}
        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Exporting...' : 'Export'}
      </button>
      
      <button
        onClick={onClose}
        disabled={loading || previewLoading}
        className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
      >
        Cancel
      </button>
    </div>
  );

  if (!options) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Export Data</h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            Export your receipt and transaction data in various formats
          </p>
        </div>
      </div>

      {/* Format Selection */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Choose Export Format
        </h3>
        <FormatSelector />
      </div>

      {/* Settings */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Export Settings
        </h3>
        <SettingsForm />
      </div>

      {/* Preview */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Preview
        </h3>
        <PreviewSection />
      </div>

      {/* Actions */}
      <div className="flex justify-end">
        <ActionButtons />
      </div>
    </div>
  );
};

export default ExportManager;
