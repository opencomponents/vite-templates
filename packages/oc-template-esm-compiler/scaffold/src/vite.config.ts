import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  // Add your own plugins here for thinkgs like eslint or typecheckers
  resolve: {
    alias: {
      '@remix-run/dom':
        'https://esm.sh/@remix-run/dom@0.0.0-experimental-remix-jam.6',
      '@remix-run/events':
        'https://esm.sh/@remix-run/events@0.0.0-experimental-remix-jam.5',
      '@remix-run/events/':
        'https://esm.sh/@remix-run/events@0.0.0-experimental-remix-jam.5/',
    },
  },
  build: {
    rollupOptions: {
      external: ['@remix-run/dom', '@remix-run/events'],
    },
  },
});
