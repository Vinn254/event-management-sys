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
      
      // Clear invalid token if session expired or user not found
      if (errorCode === 'TOKEN_INVALID' || errorCode === 'INVALID_TOKEN' || errorCode === 'TOKEN_EXPIRED' || error.response?.data?.message?.includes('not found')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Redirect to login if not already there
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          window.location.href = '/login?reason=session_expired';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
