import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// Fallback to localhost for local dev
const API_URL = process.env.VITE_API_URL || 'http://localhost:5000';

export default defineConfig({
  plugins: [react()],
  base: '/', // keeps SPA routing correct
  server: {
    port: 3000,
    proxy: {
      // Only use proxy in local dev; Vercel production will use env directly
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
      },
    },
  },
  build: {
    outDir: 'dist', // ensure Vercel reads this folder
  },
});
