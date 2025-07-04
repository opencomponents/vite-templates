import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  // Add your own plugins here for thinkgs like eslint or typecheckers
  plugins: [react()],
  resolve: {
    alias: {
      react: "https://esm.sh/react@19.1.0",
      "react-dom": "https://esm.sh/react-dom@19.1.0",
      "react-dom/": "https://esm.sh/react-dom@19.1.0/",
    },
  },
  build: {
    rollupOptions: {
      external: ["react", "react-dom"],
    },
  },
  // @ts-ignore Missing test property
  test: {
    environment: 'jsdom'
  }
});
