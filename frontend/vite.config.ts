import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  // Dev server (vite / npm run dev)
  server: {
    port: 3001,
    proxy: {
      '/api': { target: 'http://localhost:5001', changeOrigin: true },
      '/uploads': { target: 'http://localhost:5001', changeOrigin: true },
    },
  },
  // Production preview (npm start / pm2) — serves dist/ and forwards API + assets
  // to the backend so relative "/api/v1/..." URLs work in the built app.
  preview: {
    port: 3001,
    host: true,
    // Domains allowed to reach the preview server (DNS-rebinding protection).
    // A leading dot also allows all subdomains of that domain.
    allowedHosts: ['.growwithloki.com', 'hub.growwithloki.com', 'localhost'],
    proxy: {
      '/api': { target: 'http://localhost:5001', changeOrigin: true },
      '/uploads': { target: 'http://localhost:5001', changeOrigin: true },
    },
  },
});
