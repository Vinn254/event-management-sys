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

export default api;
