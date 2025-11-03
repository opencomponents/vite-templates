import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { oc } from 'oc-server/vite';

// https://vitejs.dev/config/
export default defineConfig({
  // Add your own plugins here for thinkgs like eslint or typecheckers
  plugins: [oc(), react()],
  build: {
    rollupOptions: {
      external: ['react', 'react-dom'],
    },
  },
  // @ts-ignore Missing test property
  test: {
    environment: 'jsdom',
  },
});
