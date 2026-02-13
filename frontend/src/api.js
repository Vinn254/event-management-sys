import axios from 'axios';

const BASE_URL = 'https://event-management-sys-63du.onrender.com';

const api = axios.create({
  baseURL: BASE_URL,
});

// Request interceptor to add auth token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const errorCode = error.response?.data?.code;
      const errorMessage = error.response?.data?.message || '';
      
      // Only clear tokens and redirect if it's specifically an invalid/expired token
      // Don't clear tokens for general "not authorized" errors to avoid aggressive logout
      if (errorCode === 'TOKEN_INVALID' || errorCode === 'INVALID_TOKEN' || errorCode === 'TOKEN_EXPIRED') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Redirect to login if not already there
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          window.location.href = '/login?reason=session_expired';
        }
      }
      // For other 401 errors (user not found, etc.), don't auto-logout
      // The user will be prompted to login again when they try to access protected resources
    }
    return Promise.reject(error);
  }
);

export default api;
