import axios from 'axios';

// Use explicit VITE_API_URL, removing any trailing slashes
const envUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '');
const base = envUrl || 'http://localhost:5000';

const api = axios.create({
  baseURL: base,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Attach JWT token from localStorage if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Log errors for easier debugging
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error?.response?.status, error?.message);
    return Promise.reject(error);
  }
);

export default api;