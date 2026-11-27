import { defineConfig } from 'vite';
import { oc } from 'oc-server/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [oc()],
  // @ts-ignore Missing test property
  test: {
    environment: 'happy-dom',
  },
});
