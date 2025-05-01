import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://mykhata-backend.onrender.com',
        // target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});