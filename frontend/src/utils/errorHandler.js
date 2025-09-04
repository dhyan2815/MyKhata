/**
 * Enhanced Error Handling Utilities
 * Provides comprehensive error handling, user feedback, and fallback mechanisms
 */

import toast from 'react-hot-toast';

// Error types and their user-friendly messages
const ERROR_TYPES = {
  NETWORK_ERROR: {
    title: 'Connection Error',
    message: 'Unable to connect to the server. Please check your internet connection.',
    action: 'Retry'
  },
  OCR_ERROR: {
    title: 'Scanning Failed',
    message: 'Unable to process the receipt image. Please try again with a clearer image.',
    action: 'Try Again'
  },
  CLOUD_STORAGE_ERROR: {
    title: 'Upload Failed',
    message: 'Unable to upload the image to cloud storage. Using local storage as fallback.',
    action: 'Continue'
  },
  VALIDATION_ERROR: {
    title: 'Invalid Data',
    message: 'Please check the information and try again.',
    action: 'Fix & Retry'
  },
  AUTH_ERROR: {
    title: 'Authentication Required',
    message: 'Please log in to continue.',
    action: 'Login'
  },
  PERMISSION_ERROR: {
    title: 'Access Denied',
    message: 'You do not have permission to perform this action.',
    action: 'Go Back'
  },
  SERVER_ERROR: {
    title: 'Server Error',
    message: 'Something went wrong on our end. Please try again later.',
    action: 'Retry'
  },
  UNKNOWN_ERROR: {
    title: 'Unexpected Error',
    message: 'An unexpected error occurred. Please try again.',
    action: 'Retry'
  }
};

// Error severity levels
const ERROR_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

class ErrorHandler {
  constructor() {
    this.errorLog = [];
    this.maxLogSize = 100;
  }

  /**
   * Determine error type from error object
   */
  getErrorType(error) {
    if (!error) return 'UNKNOWN_ERROR';

    // Network errors
    if (error.code === 'NETWORK_ERROR' || 
        error.message?.includes('Network Error') ||
        error.message?.includes('fetch')) {
      return 'NETWORK_ERROR';
    }

    // OCR specific errors
    if (error.message?.includes('OCR') || 
        error.message?.includes('scanning') ||
        error.message?.includes('tesseract')) {
      return 'OCR_ERROR';
    }

    // Cloud storage errors
    if (error.message?.includes('cloudinary') || 
        error.message?.includes('upload') ||
        error.message?.includes('storage')) {
      return 'CLOUD_STORAGE_ERROR';
    }

    // Validation errors
    if (error.statusCode === 400 || 
        error.message?.includes('validation') ||
        error.message?.includes('Invalid')) {
      return 'VALIDATION_ERROR';
    }

    // Authentication errors
    if (error.statusCode === 401 || 
        error.message?.includes('token') ||
        error.message?.includes('unauthorized')) {
      return 'AUTH_ERROR';
    }

    // Permission errors
    if (error.statusCode === 403 || 
        error.message?.includes('permission') ||
        error.message?.includes('forbidden')) {
      return 'PERMISSION_ERROR';
    }

    // Server errors
    if (error.statusCode >= 500) {
      return 'SERVER_ERROR';
    }

    return 'UNKNOWN_ERROR';
  }

  /**
   * Get user-friendly error message
   */
  getErrorMessage(error, customMessage = null) {
    const errorType = this.getErrorType(error);
    const errorConfig = ERROR_TYPES[errorType];

    return {
      title: errorConfig.title,
      message: customMessage || errorConfig.message,
      action: errorConfig.action,
      type: errorType,
      severity: this.getErrorSeverity(errorType)
    };
  }

  /**
   * Get error severity level
   */
  getErrorSeverity(errorType) {
    const severityMap = {
      'NETWORK_ERROR': ERROR_SEVERITY.MEDIUM,
      'OCR_ERROR': ERROR_SEVERITY.LOW,
      'CLOUD_STORAGE_ERROR': ERROR_SEVERITY.LOW,
      'VALIDATION_ERROR': ERROR_SEVERITY.LOW,
      'AUTH_ERROR': ERROR_SEVERITY.HIGH,
      'PERMISSION_ERROR': ERROR_SEVERITY.HIGH,
      'SERVER_ERROR': ERROR_SEVERITY.HIGH,
      'UNKNOWN_ERROR': ERROR_SEVERITY.MEDIUM
    };

    return severityMap[errorType] || ERROR_SEVERITY.MEDIUM;
  }

  /**
   * Log error for debugging
   */
  logError(error, context = {}) {
    const errorLog = {
      timestamp: new Date().toISOString(),
      error: {
        message: error.message,
        stack: error.stack,
        statusCode: error.statusCode,
        type: this.getErrorType(error)
      },
      context,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    this.errorLog.push(errorLog);

    // Keep log size manageable
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(-this.maxLogSize);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error logged:', errorLog);
    }
  }

  /**
   * Show error toast with appropriate styling
   */
  showErrorToast(error, customMessage = null) {
    const errorInfo = this.getErrorMessage(error, customMessage);
    
    const toastOptions = {
      duration: this.getToastDuration(errorInfo.severity),
      style: this.getToastStyle(errorInfo.severity),
      icon: this.getToastIcon(errorInfo.severity)
    };

    toast.error(`${errorInfo.title}: ${errorInfo.message}`, toastOptions);
  }

  /**
   * Show success toast
   */
  showSuccessToast(message, duration = 4000) {
    toast.success(message, {
      duration,
      style: {
        background: '#10B981',
        color: '#fff',
        fontWeight: '500'
      }
    });
  }

  /**
   * Show warning toast
   */
  showWarningToast(message, duration = 4000) {
    toast(message, {
      duration,
      icon: '⚠️',
      style: {
        background: '#F59E0B',
        color: '#fff',
        fontWeight: '500'
      }
    });
  }

  /**
   * Get toast duration based on severity
   */
  getToastDuration(severity) {
    const durationMap = {
      [ERROR_SEVERITY.LOW]: 3000,
      [ERROR_SEVERITY.MEDIUM]: 5000,
      [ERROR_SEVERITY.HIGH]: 7000,
      [ERROR_SEVERITY.CRITICAL]: 10000
    };

    return durationMap[severity] || 5000;
  }

  /**
   * Get toast style based on severity
   */
  getToastStyle(severity) {
    const styleMap = {
      [ERROR_SEVERITY.LOW]: {
        background: '#6B7280',
        color: '#fff',
        fontWeight: '500'
      },
      [ERROR_SEVERITY.MEDIUM]: {
        background: '#F59E0B',
        color: '#fff',
        fontWeight: '500'
      },
      [ERROR_SEVERITY.HIGH]: {
        background: '#EF4444',
        color: '#fff',
        fontWeight: '500'
      },
      [ERROR_SEVERITY.CRITICAL]: {
        background: '#DC2626',
        color: '#fff',
        fontWeight: '600',
        border: '2px solid #FEE2E2'
      }
    };

    return styleMap[severity] || styleMap[ERROR_SEVERITY.MEDIUM];
  }

  /**
   * Get toast icon based on severity
   */
  getToastIcon(severity) {
    const iconMap = {
      [ERROR_SEVERITY.LOW]: 'ℹ️',
      [ERROR_SEVERITY.MEDIUM]: '⚠️',
      [ERROR_SEVERITY.HIGH]: '❌',
      [ERROR_SEVERITY.CRITICAL]: '🚨'
    };

    return iconMap[severity] || iconMap[ERROR_SEVERITY.MEDIUM];
  }

  /**
   * Handle API errors with retry mechanism
   */
  async handleApiError(error, retryFn = null, maxRetries = 3) {
    this.logError(error, { retryFn: !!retryFn, maxRetries });

    const errorInfo = this.getErrorMessage(error);

    // Show error toast
    this.showErrorToast(error, errorInfo.message);

    // If retry function provided and error is retryable
    if (retryFn && this.isRetryableError(error) && maxRetries > 0) {
      // Wait a bit before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      try {
        return await retryFn();
      } catch (retryError) {
        return this.handleApiError(retryError, retryFn, maxRetries - 1);
      }
    }

    throw error;
  }

  /**
   * Check if error is retryable
   */
  isRetryableError(error) {
    const retryableTypes = ['NETWORK_ERROR', 'SERVER_ERROR'];
    const errorType = this.getErrorType(error);
    
    return retryableTypes.includes(errorType) && 
           error.statusCode !== 401 && 
           error.statusCode !== 403;
  }

  /**
   * Get error logs for debugging
   */
  getErrorLogs() {
    return this.errorLog;
  }

  /**
   * Clear error logs
   */
  clearErrorLogs() {
    this.errorLog = [];
  }

  /**
   * Handle OCR processing errors with fallback
   */
  handleOCRError(error, fallbackAction = null) {
    this.logError(error, { context: 'OCR_PROCESSING' });
    
    const errorInfo = this.getErrorMessage(error);
    
    // Show specific OCR error message
    this.showErrorToast(error, 'Unable to read the receipt. Please ensure the image is clear and try again.');
    
    // If fallback action provided, execute it
    if (fallbackAction && typeof fallbackAction === 'function') {
      setTimeout(() => {
        fallbackAction();
      }, 2000);
    }
  }

  /**
   * Handle cloud storage errors with fallback
   */
  handleCloudStorageError(error, fallbackAction = null) {
    this.logError(error, { context: 'CLOUD_STORAGE' });
    
    // Show warning instead of error for cloud storage issues
    this.showWarningToast('Using local storage as cloud upload failed. Your data is still safe.');
    
    // Execute fallback action
    if (fallbackAction && typeof fallbackAction === 'function') {
      fallbackAction();
    }
  }
}

// Create singleton instance
const errorHandler = new ErrorHandler();

export default errorHandler;
export { ERROR_TYPES, ERROR_SEVERITY };
