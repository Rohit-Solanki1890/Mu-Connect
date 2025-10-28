import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const API_URL = env.VITE_API_URL || 'http://localhost:5000';

  return {
    plugins: [react()],
    base: './',
    build: {
      outDir: 'dist',
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom'],
            router: ['react-router-dom'],
          },
        },
      },
      chunkSizeWarningLimit: 1000,
      // Ensure proper error handling during build
      reportCompressedSize: true,
      cssCodeSplit: true,
    },
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: API_URL,
          changeOrigin: true,
          secure: false,
          timeout: 30000,
        },
        '/uploads': {
          target: API_URL,
          changeOrigin: true,
          secure: false,
          timeout: 30000,
        },
        '/socket.io': {
          target: API_URL,
          changeOrigin: true,
          secure: false,
          ws: true,
          timeout: 30000,
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom'],
    },
    esbuild: {
      logLimit: 0,
    },
  };
});
