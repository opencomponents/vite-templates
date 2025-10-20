import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  // Add your own plugins here for thinkgs like eslint or typecheckers
  plugins: [react()],
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
