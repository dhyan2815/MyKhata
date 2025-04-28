import api from './axios';

// Get all transactions with optional filters
export const getTransactions = async (filters = {}) => {
  const response = await api.get('/transactions', { params: filters });
  return response.data;
};

// Get transaction by ID
export const getTransactionById = async (id) => {
  const response = await api.get(`/transactions/${id}`);
  return response.data;
};

// Create a new transaction
export const createTransaction = async (transactionData) => {
  const response = await api.post('/transactions', transactionData);
  return response.data;
};

// Update a transaction
export const updateTransaction = async (id, transactionData) => {
  const response = await api.put(`/transactions/${id}`, transactionData);
  return response.data;
};

// Delete a transaction
export const deleteTransaction = async (id) => {
  const response = await api.delete(`/transactions/${id}`);
  return response.data;
};

// Get transaction summary
export const getTransactionSummary = async (dateRange = {}) => {
  const response = await api.get('/transactions/summary', { params: dateRange });
  return response.data;
};