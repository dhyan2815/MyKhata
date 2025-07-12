import axios from 'axios';

const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Automatically choose backend base URL
const api = axios.create({
  baseURL: isLocalhost
    ? '/api' // Handled by Vite proxy in development
    : 'https://mykhata-backend.onrender.com/api', // Production backend
  headers: {
    'Content-Type': 'application/json',
  },
});

// Include token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('wealthflow_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Token expiration handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('wealthflow_user');
      localStorage.removeItem('wealthflow_token');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
