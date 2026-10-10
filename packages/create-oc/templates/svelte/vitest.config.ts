import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// Vitest-only config. The packaging build reads vite.config.ts (which must
// stay plugin-free), so .svelte support for unit tests lives here. Tests
// render on the server (no DOM needed), which also makes the plugin emit
// server output for components.
export default defineConfig({
  plugins: [svelte()],
  test: {
    environment: 'node',
  },
});
