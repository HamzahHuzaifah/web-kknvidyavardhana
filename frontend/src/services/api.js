import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const api = axios.create({
  baseURL: API_BASE_URL
});

// Attach token automatically on each request if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 Unauthorized automatically
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear storage and redirect if token is invalid/kicked
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      localStorage.removeItem('role');
      // Using window.location to force full reload to login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login?msg=session_expired';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
