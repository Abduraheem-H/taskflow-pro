import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import { taskflowApiPlugin } from './server/viteApiPlugin';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), taskflowApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            board: ['@hello-pangea/dnd'],
            motion: ['framer-motion'],
            markdown: ['react-markdown'],
            state: ['zustand', '@tanstack/react-query'],
            icons: ['lucide-react']
          }
        }
      }
    },
  };
});
