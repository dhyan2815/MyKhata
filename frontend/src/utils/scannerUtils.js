/**
 * Utility functions for receipt scanning operations
 * Extracted from ReceiptScanner component for better maintainability
 */

/**
 * Validates transaction data before creating transaction
 * @param {object} transactionData - Transaction data to validate
 * @returns {object} Validation result with isValid flag and error message
 */
export const validateTransactionData = (transactionData) => {
  // Check required fields
  if (!transactionData.amount || !transactionData.merchant) {
    return {
      isValid: false,
      error: 'Amount and merchant are required fields'
    };
  }

  // Validate amount
  const amount = parseFloat(transactionData.amount);
  if (isNaN(amount) || amount <= 0) {
    return {
      isValid: false,
      error: 'Please enter a valid amount'
    };
  }

  return {
    isValid: true,
    error: null
  };
};

/**
 * Prepares transaction payload for backend API
 * @param {object} transactionData - Raw transaction data from form
 * @param {string} receiptId - ID of the scanned receipt
 * @returns {object} Prepared transaction payload
 */
export const prepareTransactionPayload = (transactionData, receiptId) => {
  const amount = parseFloat(transactionData.amount);
  
  return {
    merchant: transactionData.merchant,
    amount: amount,
    date: transactionData.date,
    description: transactionData.description,
    type: transactionData.type,
    receiptId: receiptId
  };
};

/**
 * Prepares initial transaction data from scan results
 * @param {object} scanResult - Raw scan result from OCR
 * @returns {object} Prepared transaction data for form
 */
export const prepareTransactionDataFromScan = (scanResult) => {
  return {
    merchant: scanResult.merchant || 'Unspecified',
    amount: scanResult.total || scanResult.subtotal || scanResult.amount || '',
    date: scanResult.date || new Date().toISOString().split('T')[0],
    description: scanResult.description || `Receipt from ${scanResult.merchant || 'Unspecified'}`,
    type: scanResult.type || 'expense',
    category: 'Uncategorized'
  };
};

/**
 * Gets the initial transaction data structure
 * @returns {object} Empty transaction data structure
 */
export const getInitialTransactionData = () => {
  return {
    merchant: '',
    amount: '',
    date: '',
    category: 'Uncategorized',
    description: '',
    type: 'expense'
  };
};

/**
 * Validates file type for receipt scanning
 * @param {File} file - File to validate
 * @returns {object} Validation result
 */
export const validateReceiptFile = (file) => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!validTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Please upload a valid image file (JPG, JPEG, PNG, or GIF)'
    };
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'File size must be less than 10MB'
    };
  }

  return {
    isValid: true,
    error: null
  };
};

/**
 * Formats file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Generates a random receipt filename
 * @returns {string} Random filename
 */
export const generateReceiptFileName = () => {
  const timestamp = new Date().getTime();
  const random = Math.random().toString(36).substring(2, 8);
  return `receipt_${timestamp}_${random}.jpg`;
};

/**
 * Checks if the browser supports camera features
 * @returns {boolean} True if camera is supported
 */
export const isCameraSupported = () => {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
};

/**
 * Gets camera constraints based on device type
 * @param {boolean} isMobile - Whether the device is mobile
 * @param {string} facingMode - Camera facing mode ('user' or 'environment')
 * @returns {object} Camera constraints object
 */
export const getCameraConstraints = (isMobile = false, facingMode = 'environment') => {
  const baseConstraints = {
    video: {
      facingMode: facingMode,
      width: { ideal: isMobile ? 1280 : 640 },
      height: { ideal: isMobile ? 720 : 480 }
    }
  };

  return baseConstraints;
};

/**
 * Extracts error message from various error types
 * @param {any} error - Error object or message
 * @returns {string} Extracted error message
 */
export const extractErrorMessage = (error) => {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  
  return 'An unknown error occurred';
};
