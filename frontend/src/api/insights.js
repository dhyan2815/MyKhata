import api from './axios';

export const fetchInsights = async () => {
  const response = await api.get('/insights');
  return Array.isArray(response.data.insights) ? response.data.insights : [];
};
