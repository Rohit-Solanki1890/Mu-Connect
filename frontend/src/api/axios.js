import axios from 'axios';

// Use VITE_API_URL if provided, append /api to reach the API root.
const rawEnvUrl = import.meta.env.VITE_API_URL;
const envUrl = rawEnvUrl ? rawEnvUrl.replace(/\/$/, '') : '';
// Use backend root (no /api appended) — frontend code calls /api/... endpoints
const base = envUrl || 'http://localhost:5000';

const api = axios.create({
  baseURL: base,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
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