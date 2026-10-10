import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  // Add your own plugins here for things like eslint or typecheckers
  // NOTE: do not add plugins here. oc loads this file into the component
  // packaging build, where template plugins break compilation. Test-only
  // config (including the svelte plugin) lives in vitest.config.ts instead.
  plugins: [],
});
