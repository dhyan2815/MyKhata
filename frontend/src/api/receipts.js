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

// Get cache statistics
export const getCacheStats = async () => {
  try {
    const response = await axios.get('/receipts/cache-stats');
    return response.data;
  } catch (error) {
    return errorHandler.handleApiError(error, () => getCacheStats());
  }
};
