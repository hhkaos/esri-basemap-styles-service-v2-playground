import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  // Use repository path by default for GitHub Pages builds.
  // Override with VITE_BASE_PATH (for example '/' when using a root custom domain).
  base:
    command === 'build'
      ? process.env.VITE_BASE_PATH || '/esri-basemap-styles-service-v2-playground/'
      : '/',
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  server: {
    port: 5173,
    open: true,
  },
}));
