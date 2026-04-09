import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  server: {
    port: 3000
  },
  preview: {
    allowedHosts: ['krishub.in', 'www.krishub.in'],
    headers: {
      'Cache-Control': 'no-cache',
    },
  },
  plugins: [react()],
  resolve: {
    alias: [
      { find: '@', replacement: fileURLToPath(new URL('./src', import.meta.url)) }
    ]
  }
});
