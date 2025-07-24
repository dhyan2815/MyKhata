import api from './axios';

export const fetchInsights = async () => {
  const response = await api.get('/insights');
  return response.data.insights;
};
