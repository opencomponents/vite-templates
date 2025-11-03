import { defineConfig } from 'vite';
import { oc } from 'oc-server/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [oc()],
  build: {
    rollupOptions: {
      external: ['@remix-run/dom', '@remix-run/events'],
    },
  },
});
