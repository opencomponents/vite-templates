import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

// Vitest-only config. The packaging build reads vite.config.ts (which must
// stay plugin-free), so .vue support for unit tests lives here.
export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['src/setupTests.js'],
  },
});
