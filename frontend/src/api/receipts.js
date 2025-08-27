import axios from './axios';

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
    throw error.response?.data?.message || error.message || 'Failed to scan receipt';
  }
};

// Create transaction from scanned receipt data
export const createTransactionFromReceipt = async (receiptData) => {
  try {
    const response = await axios.post('/receipts/create-transaction', receiptData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || error.message || 'Failed to create transaction from receipt';
  }
};

// Get receipt scanning history
export const getReceiptHistory = async () => {
  try {
    const response = await axios.get('/receipts/history');
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || error.message || 'Failed to fetch receipt history';
  }
};

// Update receipt data
export const updateReceipt = async (receiptId, updateData) => {
  try {
    const response = await axios.put(`/receipts/${receiptId}`, updateData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || error.message || 'Failed to update receipt';
  }
};

// Delete receipt
export const deleteReceipt = async (receiptId) => {
  try {
    const response = await axios.delete(`/receipts/${receiptId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || error.message || 'Failed to delete receipt';
  }
};
