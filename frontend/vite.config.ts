import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

const API_URL = process.env.VITE_API_URL || 'http://localhost:5000';

export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: API_URL,
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: API_URL,
        changeOrigin: true,
        secure: false,
      },
      '/socket.io': {
        target: API_URL,
        changeOrigin: true,
        secure: false,
        ws: true,
      }
    }
  }
});



