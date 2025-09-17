/**
 * FileUpload Component
 * 
 * Provides drag-and-drop file upload functionality for receipt images:
 * - Drag and drop interface with visual feedback
 * - File type validation (images only)
 * - File size validation
 * - Click to browse functionality
 * - Responsive design with theme support
 * - Loading states during processing
 */
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useTheme } from '../../context/ThemeContext';
import { validateReceiptFile, formatFileSize } from '../../utils/scannerUtils';
import toast from 'react-hot-toast';

/**
 * Upload icon component
 */
const UploadIcon = () => (
  <div className="text-4xl mb-4">📄</div>
);

/**
 * Upload instructions component
 */
const UploadInstructions = ({ isDragActive, isDark }) => {
  if (isDragActive) {
    return <p className="text-blue-600">Drop the receipt image here...</p>;
  }

  return (
    <div>
      <p className={`mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
        Click here to choose a file or drag and drop a receipt here
      </p>
      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        JPG, JPEG, PNG & GIF formats are supported (Max: 10MB)
      </p>
    </div>
  );
};

/**
 * Upload progress component
 */
const UploadProgress = ({ isUploading }) => {
  if (!isUploading) return null;

  return (
    <div className="mt-4">
      <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mr-2"></div>
        <span className="text-sm text-gray-600">Processing image...</span>
      </div>
    </div>
  );
};

/**
 * File preview component
 */
const FilePreview = ({ file, isDark }) => {
  if (!file) return null;

  return (
    <div className={`mt-4 p-3 rounded border ${isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-sm font-medium">📁</span>
          <div className="ml-2">
            <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {file.name}
            </p>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {formatFileSize(file.size)}
            </p>
          </div>
        </div>
        <div className="text-green-500">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
    </div>
  );
};

/**
 * Main FileUpload component
 */
const FileUpload = ({ 
  onFileSelect, 
  isProcessing = false,
  selectedFile = null 
}) => {
  const { isDark } = useTheme();

  /**
   * Handles file drop and selection
   */
  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      let errorMessage = 'Invalid file selected';
      
      if (rejection.errors.some(error => error.code === 'file-too-large')) {
        errorMessage = 'File size must be less than 10MB';
      } else if (rejection.errors.some(error => error.code === 'file-invalid-type')) {
        errorMessage = 'Please upload a valid image file (JPG, JPEG, PNG, or GIF)';
      }
      
      toast.error(errorMessage, {
        duration: 4000,
        icon: '❌',
      });
      return;
    }

    // Handle accepted files
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      
      // Additional validation
      const validation = validateReceiptFile(file);
      if (!validation.isValid) {
        toast.error(validation.error, {
          duration: 4000,
          icon: '❌',
        });
        return;
      }

      // Success toast
      toast.success(`File selected: ${file.name}`, {
        duration: 2000,
        icon: '📁',
      });

      // Call the parent callback
      onFileSelect(file);
    }
  }, [onFileSelect]);

  // Configure dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: isProcessing
  });

  return (
    <div className={`rounded-lg shadow-lg p-6 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
        Upload Receipt Image
      </h2>
      
      {/* Dropzone Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : isDark 
              ? 'border-gray-600 hover:border-gray-500 bg-gray-900'
              : 'border-gray-300 hover:border-gray-400'
        } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        
        <UploadIcon />
        <UploadInstructions isDragActive={isDragActive} isDark={isDark} />
        
        {/* Upload Progress */}
        <UploadProgress isUploading={isProcessing} />
      </div>

      {/* File Preview */}
      <FilePreview file={selectedFile} isDark={isDark} />

      {/* Upload Tips */}
      <div className={`mt-4 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        <p className="mb-1">📸 <strong>Tips for better results:</strong></p>
        <ul className="list-disc list-inside space-y-1 ml-4">
          <li>Ensure the receipt is well-lit and clearly visible</li>
          <li>Avoid shadows and reflections</li>
          <li>Include the entire receipt in the image</li>
          <li>Higher resolution images work better</li>
        </ul>
      </div>
    </div>
  );
};

export default FileUpload;
