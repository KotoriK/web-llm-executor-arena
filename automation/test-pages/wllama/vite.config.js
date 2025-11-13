import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3001,
    headers: {
      // Required for SharedArrayBuffer
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
  },
  optimizeDeps: {
    exclude: ['@wllama/wllama'],
  },
});
