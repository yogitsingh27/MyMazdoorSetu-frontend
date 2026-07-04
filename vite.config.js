import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    // Dev-only: proxy API calls to the backend so the app and API share an
    // origin. This makes the httpOnly refresh cookie first-party (no CORS
    // credential issues) with no backend changes. Production calls the API
    // directly via an absolute VITE_API_URL.
    proxy: {
      '/api': { target: 'http://localhost:5199', changeOrigin: true },
    },
  },
});
