import axios from 'axios';

// Prefer explicit backend URL provided via VITE_API_URL (set in Vercel/production)
// If provided, ensure it doesn't end with a slash and append /api so requests go to the API root.
const rawEnvUrl = import.meta.env.VITE_API_URL;
const envUrl = rawEnvUrl ? rawEnvUrl.replace(/\/$/, '') : '';
// Use backend root (no /api appended) — frontend code calls /api/... endpoints
const API_BASE_URL = envUrl || 'http://localhost:5000';

export const api = axios.create({
  baseURL: API_BASE_URL,
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