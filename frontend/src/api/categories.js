import api from './axios';

// Get all categories with optional type filter
export const getCategories = async (type) => {
  const response = await api.get('/categories', { params: { type } });
  return response.data;
};

// Create a new category
export const createCategory = async (categoryData) => {
  const response = await api.post('/categories', categoryData);
  return response.data;
};

// Update a category
export const updateCategory = async (id, categoryData) => {
  const response = await api.put(`/categories/${id}`, categoryData);
  return response.data;
};

// Delete a category
export const deleteCategory = async (id) => {
  const response = await api.delete(`/categories/${id}`);
  return response.data;
};

// Initialize default categories for the current user
export const initializeDefaultCategories = async () => {
  const response = await api.post('/users/initialize-categories');
  return response.data;
};