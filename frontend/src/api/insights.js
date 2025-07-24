import api from './axios';

export const fetchInsights = async () => {
  const response = await api.get('/api/insights');
  return response.data.insights;
};
