import axios from './axios';
import errorHandler from '../utils/errorHandler';

// Scan receipt image and extract data
export const scanReceipt = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append('receipt', imageFile);

    const response = await axios.post('/receipts/scan', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    // Enhanced error handling with retry mechanism
    return errorHandler.handleApiError(error, () => scanReceipt(imageFile));
  }
};

// Create transaction from scanned receipt data
export const createTransactionFromReceipt = async (receiptData) => {
  try {
    const response = await axios.post('/receipts/create-transaction', receiptData);
    return response.data;
  } catch (error) {
    return errorHandler.handleApiError(error, () => createTransactionFromReceipt(receiptData));
  }
};

// Get receipt scanning history
export const getReceiptHistory = async () => {
  try {
    const response = await axios.get('/receipts/history');
    return response.data;
  } catch (error) {
    return errorHandler.handleApiError(error, () => getReceiptHistory());
  }
};

// Update receipt data
export const updateReceipt = async (receiptId, updateData) => {
  try {
    const response = await axios.put(`/receipts/${receiptId}`, updateData);
    return response.data;
  } catch (error) {
    return errorHandler.handleApiError(error, () => updateReceipt(receiptId, updateData));
  }
};

// Delete receipt
export const deleteReceipt = async (receiptId) => {
  try {
    const response = await axios.delete(`/receipts/${receiptId}`);
    return response.data;
  } catch (error) {
    return errorHandler.handleApiError(error, () => deleteReceipt(receiptId));
  }
};

// Batch scan multiple receipts
export const batchScanReceipts = async (imageFiles) => {
  try {
    const formData = new FormData();
    imageFiles.forEach((file, index) => {
      formData.append('receipts', file);
    });

    const response = await axios.post('/receipts/batch-scan', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    return errorHandler.handleApiError(error, () => batchScanReceipts(imageFiles));
  }
};

// Batch create transactions from receipts
export const batchCreateTransactions = async (receiptIds, categoryMappings = {}) => {
  try {
    const response = await axios.post('/receipts/batch-create-transactions', {
      receiptIds,
      categoryMappings
    });
    return response.data;
  } catch (error) {
    return errorHandler.handleApiError(error, () => batchCreateTransactions(receiptIds, categoryMappings));
  }
};

// Get smart category suggestions for merchant
export const getSmartCategorySuggestions = async (merchant, transactionType = 'expense') => {
  try {
    const response = await axios.post('/receipts/smart-categorize', {
      merchant,
      transactionType
    });
    return response.data;
  } catch (error) {
    return errorHandler.handleApiError(error, () => getSmartCategorySuggestions(merchant, transactionType));
  }
};

// Learn from user's categorization decision
export const learnFromCategorization = async (merchant, categoryId, transactionId = null) => {
  try {
    const response = await axios.post('/receipts/learn-categorization', {
      merchant,
      categoryId,
      transactionId
    });
    return response.data;
  } catch (error) {
    return errorHandler.handleApiError(error, () => learnFromCategorization(merchant, categoryId, transactionId));
  }
};

// Auto-categorize receipt
export const autoCategorizeReceipt = async (merchant, transactionType = 'expense') => {
  try {
    const response = await axios.post('/receipts/auto-categorize', {
      merchant,
      transactionType
    });
    return response.data;
  } catch (error) {
    return errorHandler.handleApiError(error, () => autoCategorizeReceipt(merchant, transactionType));
  }
};

// Get cache statistics
export const getCacheStats = async () => {
  try {
    const response = await axios.get('/receipts/cache-stats');
    return response.data;
  } catch (error) {
    return errorHandler.handleApiError(error, () => getCacheStats());
  }
};
