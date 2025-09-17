/**
 * Custom hook for receipt scanner operations
 * 
 * Handles all scanner-related operations including:
 * - Receipt scanning and OCR processing
 * - Transaction data management
 * - Transaction creation from scanned data
 * - Form state management and validation
 * - Loading states and error handling
 * - Toast notifications for user feedback
 */
import { useState } from 'react';
import { scanReceipt, createTransactionFromReceipt } from '../api/receipts';
import { 
  validateTransactionData, 
  prepareTransactionPayload, 
  prepareTransactionDataFromScan, 
  getInitialTransactionData,
  extractErrorMessage 
} from '../utils/scannerUtils';
import toast from 'react-hot-toast';

export const useScannerOperations = () => {
  // Scanner state
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const [receiptId, setReceiptId] = useState(null);
  
  // Transaction state
  const [transactionData, setTransactionData] = useState(getInitialTransactionData());
  const [isCreatingTransaction, setIsCreatingTransaction] = useState(false);
  const [validationError, setValidationError] = useState(null);

  /**
   * Processes a receipt image using OCR
   * @param {File} imageFile - The image file to process
   */
  const processReceipt = async (imageFile) => {
    setIsScanning(true);
    setError(null);
    setValidationError(null);
    
    // Show loading toast
    const loadingToast = toast.loading('Scanning receipt...', {
      duration: Infinity,
    });
    
    try {
      const result = await scanReceipt(imageFile);
      setScanResult(result.data);
      setReceiptId(result.data.receiptId);
      
      // Pre-fill transaction data with scanned values
      const preparedData = prepareTransactionDataFromScan(result.data);
      setTransactionData(preparedData);
      
      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success('Receipt scanned successfully!', {
        duration: 3000,
        icon: '📄',
      });
      
    } catch (err) {
      const errorMessage = extractErrorMessage(err);
      setError(errorMessage);
      setScanResult(null);
      
      // Dismiss loading toast and show error
      toast.dismiss(loadingToast);
      toast.error(`Failed to scan receipt: ${errorMessage}`, {
        duration: 5000,
        icon: '❌',
      });
    } finally {
      setIsScanning(false);
    }
  };

  /**
   * Creates a transaction from the scanned receipt data
   */
  const createTransaction = async () => {
    try {
      setValidationError(null);
      
      // Validate transaction data
      const validation = validateTransactionData(transactionData);
      if (!validation.isValid) {
        setValidationError(validation.error);
        toast.error(validation.error, {
          duration: 4000,
          icon: '⚠️',
        });
        return;
      }

      setIsCreatingTransaction(true);
      
      // Prepare payload for backend
      const transactionPayload = prepareTransactionPayload(transactionData, receiptId);
      
      console.log('Creating transaction with data:', transactionPayload);
      
      // Show loading toast
      const loadingToast = toast.loading('Creating transaction...', {
        duration: Infinity,
      });
      
      const result = await createTransactionFromReceipt(transactionPayload);
      console.log('Transaction created successfully:', result);
      
      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success('Transaction created successfully!', {
        duration: 4000,
        icon: '✅',
      });
      
      // Reset all state after successful creation
      resetScanner();
      
    } catch (err) {
      const errorMessage = extractErrorMessage(err);
      console.error('Transaction creation failed:', err);
      setError(errorMessage);
      
      toast.error(`Failed to create transaction: ${errorMessage}`, {
        duration: 5000,
        icon: '❌',
      });
    } finally {
      setIsCreatingTransaction(false);
    }
  };

  /**
   * Updates transaction data
   * @param {Event} e - Input change event
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTransactionData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError(null);
    }
  };

  /**
   * Resets the scanner to initial state
   */
  const resetScanner = () => {
    setTransactionData(getInitialTransactionData());
    setScanResult(null);
    setError(null);
    setValidationError(null);
    setReceiptId(null);
    setIsScanning(false);
    setIsCreatingTransaction(false);
  };

  /**
   * Handles scanning another receipt
   */
  const scanAnotherReceipt = () => {
    resetScanner();
    toast.success('Ready to scan another receipt!', {
      duration: 2000,
      icon: '🔄',
    });
  };

  /**
   * Updates specific transaction data fields
   * @param {object} updates - Object with field updates
   */
  const updateTransactionData = (updates) => {
    setTransactionData(prev => ({
      ...prev,
      ...updates
    }));
  };

  /**
   * Validates current transaction data without submitting
   * @returns {object} Validation result
   */
  const validateCurrentData = () => {
    return validateTransactionData(transactionData);
  };

  // Return all state and handlers for component use
  return {
    // Scanner state
    isScanning,
    scanResult,
    error,
    receiptId,
    
    // Transaction state
    transactionData,
    isCreatingTransaction,
    validationError,
    
    // Operations
    processReceipt,
    createTransaction,
    handleInputChange,
    resetScanner,
    scanAnotherReceipt,
    updateTransactionData,
    validateCurrentData,
    
    // Utilities
    extractErrorMessage,
  };
};
