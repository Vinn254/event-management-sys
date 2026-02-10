import axios from 'axios';

const BASE_URL = 'https://event-management-sys-63du.onrender.com';

const api = axios.create({
  baseURL: BASE_URL,
});

export default api;
