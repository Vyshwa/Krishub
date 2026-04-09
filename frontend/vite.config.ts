import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const rootDir = fileURLToPath(new URL('.', import.meta.url));

function preloadAssets() {
  return {
    name: 'preload-assets',
    writeBundle() {
      const distDir = resolve(rootDir, 'dist');
      const assetsDir = resolve(distDir, 'assets');
      const files = readdirSync(assetsDir);
      let html = readFileSync(resolve(distDir, 'index.html'), 'utf-8');

      // Add modulepreload for the main index JS chunk so browser discovers it from HTML
      const indexJs = files.find(f => /^index-.*\.js$/.test(f));
      if (indexJs && !html.includes(indexJs)) {
        html = html.replace('</head>', `<link rel="modulepreload" crossorigin href="/assets/${indexJs}">\n</head>`);
      }

      writeFileSync(resolve(distDir, 'index.html'), html);
    }
  };
}

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
  plugins: [react(), preloadAssets()],
  resolve: {
    alias: [
      { find: '@', replacement: fileURLToPath(new URL('./src', import.meta.url)) }
    ]
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['@tanstack/react-router'],
        }
      }
    }
  }
});
