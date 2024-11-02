import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
          'vendor': ['react', 'react-dom', 'react-router-dom']
        }
      }
    },
    // Remove terser minification since it's causing issues
    minify: 'esbuild',
    // Optimize chunks
    chunkSizeWarningLimit: 1000
  },
  base: './', // This ensures assets are loaded correctly in static deployment
  server: {
    host: true,
    port: 3000
  },
  preview: {
    host: true,
    port: 3000
  }
});
