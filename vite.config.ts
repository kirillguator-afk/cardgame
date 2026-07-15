
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '', // Важно для GitHub Pages: пустая строка делает пути относительными
  build: {
    outDir: 'dist',
  }
});
