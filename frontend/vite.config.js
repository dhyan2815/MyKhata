import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: process.env.NODE_ENV === 'development'
      ? {
          '/api': {
            target: 'http://localhost:5000',
            changeOrigin: true,
          },
        }
      : undefined,
  },
  build: {
    // Optimize chunk splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor chunks for better caching
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          charts: ['chart.js', 'react-chartjs-2'],
          ui: ['framer-motion', 'lucide-react'],
          utils: ['date-fns', 'axios'],
        },
      },
    },
    // Enable source maps for debugging
    sourcemap: false,
    // Use default minification (esbuild)
    minify: 'esbuild',
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
});