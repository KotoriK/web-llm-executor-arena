import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3002,
    headers: {
      // Required for SharedArrayBuffer
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
  },
  optimizeDeps: {
    exclude: ['@mlc-ai/web-llm'],
  },
});
