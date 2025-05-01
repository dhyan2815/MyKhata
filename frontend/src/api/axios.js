import axios from 'axios';

// Create an axios instance
const api = axios.create({

  // Render backend server
  // baseURL: 'https://mykhata-backend.onrender.com/api',

  // Mobile backend server
  // baseURL: 'http://192.168.1.90:5000/api',

  // Local backend server
  baseURL: '/api',

  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token in requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('wealthflow_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 errors by redirecting to login
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('wealthflow_user');
      localStorage.removeItem('wealthflow_token');
      
      // Only redirect if we're not already on the login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;