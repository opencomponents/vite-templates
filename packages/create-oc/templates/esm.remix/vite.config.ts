import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      external: ['@remix-run/dom', '@remix-run/events'],
    },
  },
});
