import api from './axios';

// Get all transactions with optional filters
export const getTransactions = async (filters = {}) => {
  const params = new URLSearchParams();
  
  // Add existing filter parameters
  if (filters.type) params.append('type', filters.type);
  if (filters.category) params.append('category', filters.category);
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.page) params.append('page', filters.page);
  if (filters.limit) params.append('limit', filters.limit);
  
  // Add sort parameters
  if (filters.sortBy && filters.sortOrder) {
    params.append('sort', `${filters.sortBy}:${filters.sortOrder}`);
  }
  
  const response = await api.get(`/transactions?${params}`);
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