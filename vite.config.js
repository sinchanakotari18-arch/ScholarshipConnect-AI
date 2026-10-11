import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import http from 'http';
import { spawn } from 'child_process';
import path from 'path';

function backendAutoStartPlugin() {
  let backendProc = null;
  return {
    name: 'backend-auto-start',
    configureServer() {
      const checkReq = http.get('http://127.0.0.1:5000/api/health', (res) => {
        // Backend is already alive
      });
      checkReq.on('error', () => {
        console.log('[Vite] Backend is not active on port 5000. Launching Node server...');
        const serverPath = path.resolve(__dirname, 'src/backend/server.js');
        backendProc = spawn('node', [serverPath], {
          stdio: 'inherit',
          shell: true,
        });
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), backendAutoStartPlugin()],
  server: {
    port: 5173,
    open: false,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
});

