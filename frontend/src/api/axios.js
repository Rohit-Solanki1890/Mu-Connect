import axios from 'axios';

// Use explicit VITE_API_URL when provided, otherwise use current host with port 5000 and /api path
const envUrl = import.meta.env.VITE_API_URL;
const base = envUrl || `${window.location.protocol}//${window.location.hostname}:5000/api`;

const api = axios.create({
  baseURL: base,
  timeout: 10000,
});

// simple interceptor to log network errors
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API network/error:', error?.response?.status, error?.message, error);
    return Promise.reject(error);
  }
);

export default api;
