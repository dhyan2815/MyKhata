/**
 * ReceiptScanner Component
 * 
 * Main component for scanning receipts and creating transactions:
 * - Camera capture for both mobile and desktop
 * - File upload with drag and drop functionality
 * - OCR processing and data extraction
 * - Transaction form with validation
 * - Responsive design with theme support
 * 
 * This component has been refactored into smaller, maintainable pieces:
 * - CameraCapture: Camera interface and photo capture
 * - FileUpload: Drag and drop file upload
 * - ScanResults: Scanned data display and transaction form
 * - useScannerOperations: Scanner operations and state management
 * - useCameraOperations: Camera management utilities
 * - scannerUtils: Utility functions for validation and data processing
 */
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useScannerOperations } from '../hooks/useScannerOperations';
import CameraCapture from './CameraCapture';
import FileUpload from './FileUpload';
import ScanResults from './ScanResults';

const ReceiptScanner = () => {
  const [activeTab, setActiveTab] = useState('upload'); // 'camera' or 'upload'
  const [selectedFile, setSelectedFile] = useState(null);
  
  const { user } = useAuth();
  const { isDark } = useTheme();
  
  // Use scanner operations hook for all scanner functionality
  const {
    isScanning,
    scanResult,
    error,
    transactionData,
    isCreatingTransaction,
    validationError,
    processReceipt,
    createTransaction,
    handleInputChange,
    scanAnotherReceipt,
  } = useScannerOperations();

  // Handle file selection from upload component
  const handleFileSelect = (file) => {
    setSelectedFile(file);
    processReceipt(file);
  };

  // Handle scan another receipt
  const handleScanAnother = () => {
    setSelectedFile(null);
    scanAnotherReceipt();
  };

  // Loading state component
  const LoadingState = () => (
    <div className="text-center py-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <p className="text-lg">Scanning receipt...</p>
      <p className="text-sm text-gray-500">This may take a few seconds</p>
    </div>
  );

  // Error display component
  const ErrorDisplay = () => (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
      <strong>Error:</strong> {error}
    </div>
  );

  // Tab navigation component
  const TabNavigation = () => (
    <div className="flex mb-6 border-b border-gray-300">
      <button
        onClick={() => setActiveTab('camera')}
        className={`px-4 py-2 font-medium ${
          activeTab === 'camera'
            ? 'border-b-2 border-blue-500 text-blue-600'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        Camera
      </button>
      <button
        onClick={() => setActiveTab('upload')}
        className={`px-4 py-2 font-medium ${
          activeTab === 'upload'
            ? 'border-b-2 border-blue-500 text-blue-600'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        Upload File
      </button>
    </div>
  );

  // Main render - simplified with extracted components
  return (
    <div className={`min-h-screen p-6 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Receipt Scanner</h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1 mb-8">
          Scan receipts to create transactions seamlessly
        </p>
        
        {/* Tab Navigation */}
        <TabNavigation />

        {/* Camera Tab */}
        {activeTab === 'camera' && (
          <div className="mb-8">
            <CameraCapture 
              onCapture={processReceipt}
              isScanning={isScanning}
            />
          </div>
        )}

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="mb-8">
            <FileUpload 
              onFileSelect={handleFileSelect}
              isProcessing={isScanning}
              selectedFile={selectedFile}
            />
          </div>
        )}

        {/* Loading State */}
        {isScanning && <LoadingState />}

        {/* Error Display */}
        {error && <ErrorDisplay />}

        {/* Scan Results */}
        <ScanResults
          scanResult={scanResult}
          transactionData={transactionData}
          onInputChange={handleInputChange}
          onCreateTransaction={createTransaction}
          onScanAnother={handleScanAnother}
          isCreating={isCreatingTransaction}
          validationError={validationError}
        />
      </div>
    </div>
  );
};

export default ReceiptScanner;
