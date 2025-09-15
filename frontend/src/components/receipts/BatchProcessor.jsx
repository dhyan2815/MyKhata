/**
 * BatchProcessor Component
 * 
 * Handles batch processing of multiple receipts:
 * - Multiple file selection and upload
 * - Batch OCR processing with progress tracking
 * - Batch transaction creation with category mapping
 * - Error handling and result display
 * - Responsive design with theme support
 */
import React, { useState, useCallback } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { batchScanReceipts, batchCreateTransactions } from '../../api/receipts';
import toast from 'react-hot-toast';

const BatchProcessor = ({ onComplete, onCancel }) => {
  const { isDark } = useTheme();
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCreatingTransactions, setIsCreatingTransactions] = useState(false);
  const [scanResults, setScanResults] = useState(null);
  const [currentStep, setCurrentStep] = useState('upload'); // 'upload', 'review', 'complete'

  // File drop handler
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 10) {
      toast.error('Maximum 10 files allowed');
      return;
    }
    
    const validFiles = acceptedFiles.filter(file => 
      file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024
    );
    
    if (validFiles.length !== acceptedFiles.length) {
      toast.error('Some files were rejected. Only image files under 5MB are allowed.');
    }
    
    setFiles(validFiles);
  }, []);

  // Drag state for visual feedback
  const [isDragActive, setIsDragActive] = useState(false);

  // Process batch scan
  const handleBatchScan = async () => {
    if (files.length === 0) {
      toast.error('Please select files to process');
      return;
    }

    setIsProcessing(true);
    try {
      const response = await batchScanReceipts(files);
      
      if (response.success) {
        setScanResults(response.data);
        setCurrentStep('review');
        toast.success(`Successfully processed ${response.data.successful}/${response.data.total} receipts`);
      } else {
        toast.error('Batch processing failed');
      }
    } catch (error) {
      console.error('Batch scan error:', error);
      toast.error('Failed to process receipts');
    } finally {
      setIsProcessing(false);
    }
  };

  // Create transactions from scanned receipts
  const handleCreateTransactions = async () => {
    if (!scanResults || !scanResults.results || scanResults.results.length === 0) {
      toast.error('No valid receipts to process');
      return;
    }

    setIsCreatingTransactions(true);
    try {
      const receiptIds = scanResults.results
        .filter(result => result?.receiptId) // Filter out any invalid results
        .map(result => result.receiptId);
      
      if (receiptIds.length === 0) {
        toast.error('No valid receipt IDs found');
        return;
      }
      
      const response = await batchCreateTransactions(receiptIds);
      
      if (response.success) {
        setCurrentStep('complete');
        toast.success(`Successfully created ${response.data.created} transactions`);
        if (onComplete) {
          onComplete(response.data);
        }
      } else {
        toast.error('Failed to create transactions');
      }
    } catch (error) {
      console.error('Batch transaction creation error:', error);
      toast.error('Failed to create transactions');
    } finally {
      setIsCreatingTransactions(false);
    }
  };

  // Reset component
  const handleReset = () => {
    setFiles([]);
    setScanResults(null);
    setCurrentStep('upload');
  };

  // File preview component
  const FilePreview = ({ file, index }) => (
    <div className="flex items-center space-x-3 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
      <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded flex items-center justify-center">
        <span className="text-xs font-medium">{index + 1}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {file.name}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {(file.size / 1024 / 1024).toFixed(2)} MB
        </p>
      </div>
    </div>
  );

  // Scan result item component
  const ScanResultItem = ({ result, index }) => {
    // Safely access result data with fallbacks
    const merchant = result?.data?.merchant || 'Unknown Merchant';
    const amount = result?.data?.amount || 'N/A';
    const date = result?.data?.date || 'No date';
    const receiptId = result?.receiptId || `receipt-${index}`;

    return (
      <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-blue-600 dark:text-blue-300">
                {index + 1}
              </span>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">
                {merchant}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Amount: ${amount}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-green-600 dark:text-green-400">
              ${amount}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {date}
            </p>
          </div>
        </div>
    </div>
    );
  };

  // Upload step
  const UploadStep = () => (
    <div className="space-y-6">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        } ${isProcessing || isCreatingTransactions ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          
          if (isProcessing || isCreatingTransactions) {
            return;
          }
          
          // Create and trigger file input
          const input = document.createElement('input');
          input.type = 'file';
          input.multiple = true;
          input.accept = 'image/*';
          input.style.display = 'none';
          
          input.onchange = (e) => {
            if (e.target.files && e.target.files.length > 0) {
              const fileArray = Array.from(e.target.files);
              
              // File validation
              if (fileArray.length > 10) {
                toast.error('Maximum 10 files allowed');
                return;
              }
              
              const validFiles = fileArray.filter(file => 
                file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024
              );
              
              if (validFiles.length !== fileArray.length) {
                toast.error('Some files were rejected. Only image files under 5MB are allowed.');
              }
              
              setFiles(validFiles);
            }
          };
          
          document.body.appendChild(input);
          input.click();
          document.body.removeChild(input);
        }}
        // Drag and drop functionality
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragActive(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragActive(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragActive(false);
          const droppedFiles = Array.from(e.dataTransfer.files);
          
          // File validation
          if (droppedFiles.length > 10) {
            toast.error('Maximum 10 files allowed');
            return;
          }
          
          const validFiles = droppedFiles.filter(file => 
            file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024
          );
          
          if (validFiles.length !== droppedFiles.length) {
            toast.error('Some files were rejected. Only image files under 5MB are allowed.');
          }
          
          setFiles(validFiles);
        }}
      >
        <div className="space-y-4">
          <div className="mx-auto w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div>
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              {isDragActive ? 'Drop files here' : 'Drag & drop receipt images'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              or click to select files (max 10 files, 5MB each)
            </p>
          </div>
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Selected Files ({files.length})
          </h3>
          <div className="space-y-2">
            {files.map((file, index) => (
              <FilePreview key={index} file={file} index={index} />
            ))}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleBatchScan}
              disabled={isProcessing}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Processing...' : 'Process Receipts'}
            </button>
            <button
              onClick={() => setFiles([])}
              disabled={isProcessing}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // Review step
  const ReviewStep = () => (
    <div className="space-y-6">
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <p className="text-green-800 dark:text-green-200">
            Successfully processed {scanResults?.successful || 0}/{scanResults?.total || 0} receipts
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Review Transactions
        </h3>
        <div className="space-y-3">
          {scanResults?.results?.map((result, index) => (
            <ScanResultItem key={result.receiptId} result={result} index={index} />
          ))}
        </div>
      </div>

      <div className="flex space-x-3">
        <button
          onClick={handleCreateTransactions}
          disabled={isCreatingTransactions}
          className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCreatingTransactions ? 'Creating...' : 'Create Transactions'}
        </button>
        <button
          onClick={() => setCurrentStep('upload')}
          disabled={isCreatingTransactions}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
        >
          Back
        </button>
      </div>
    </div>
  );

  // Complete step
  const CompleteStep = () => (
    <div className="text-center space-y-6">
      <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
        <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div>
        <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
          Batch Processing Complete!
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          All receipts have been processed and transactions created successfully.
        </p>
      </div>
      <div className="flex space-x-3 justify-center">
        <button
          onClick={handleReset}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
        >
          Process More Receipts
        </button>
        <button
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Close
        </button>
      </div>
    </div>
  );

  return (
    <div className={`max-w-4xl mx-auto p-6 ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Batch Receipt Processing
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Process multiple receipts at once and create transactions automatically
        </p>
      </div>

      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center space-x-4">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            currentStep === 'upload' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
          }`}>
            1
          </div>
          <div className={`flex-1 h-1 rounded ${
            currentStep === 'review' || currentStep === 'complete' ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
          }`} />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            currentStep === 'review' ? 'bg-blue-600 text-white' : 
            currentStep === 'complete' ? 'bg-green-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
          }`}>
            2
          </div>
          <div className={`flex-1 h-1 rounded ${
            currentStep === 'complete' ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-700'
          }`} />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            currentStep === 'complete' ? 'bg-green-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
          }`}>
            3
          </div>
        </div>
        <div className="flex justify-between mt-2 text-sm text-gray-600 dark:text-gray-400">
          <span>Upload Files</span>
          <span>Review</span>
          <span>Complete</span>
        </div>
      </div>

      {/* Step content */}
      {currentStep === 'upload' && <UploadStep />}
      {currentStep === 'review' && <ReviewStep />}
      {currentStep === 'complete' && <CompleteStep />}
    </div>
  );
};

export default BatchProcessor;
