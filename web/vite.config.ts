import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwind from '@tailwindcss/vite';

export default defineConfig({
  root: __dirname,
  plugins: [react(), tailwind()],
  base: '/',
  build: {
    outDir: '../dist/web',
    emptyOutDir: true,
    target: 'es2022',
  },
  server: {
    port: 5174,
    proxy: {
      '/api': 'http://127.0.0.1:4000',
    },
  },
});
