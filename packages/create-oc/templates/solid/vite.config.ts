import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [solidPlugin()],
  // @ts-ignore Missing test property
  test: {
    environment: 'jsdom',
    globals: true,
    transformMode: { web: [/\.[jt]sx?$/] },
    setupFiles: ['src/setupTests.js'],
    // otherwise, solid would be loaded twice:
    deps: { registerNodeLoader: true },
    // if you have few tests, try commenting one
    // or both out to improve performance:
    threads: false,
    isolate: false,
  },
});
