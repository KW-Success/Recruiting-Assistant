import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/Recruiting-Assistant/', // GitHub Pages base path
  build: {
    outDir: 'dist',
  },
});