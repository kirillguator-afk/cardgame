
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '', 
  define: {
    // PeerJS и некоторые другие библиотеки могут требовать global
    'global': 'window',
  },
  build: {
    outDir: 'dist',
    target: 'esnext', // Важно для поддержки современных фич WebRTC
  }
});
