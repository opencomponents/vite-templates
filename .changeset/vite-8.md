---
'oc-vite-compiler': major
'oc-server': minor
'oc-template-react-compiler': major
'oc-template-vue-compiler': major
'oc-template-svelte-compiler': major
'oc-template-preact-compiler': major
'oc-template-elm-compiler': major
'oc-template-es6-compiler': major
'oc-template-esm-compiler': major
'oc-template-solid-compiler': major
---

Build with Vite 8 (Rolldown) through oc-vite 8.3.8. Components need `vite@^8` and the framework plugins that support it: `@vitejs/plugin-react@^5.2`, `@vitejs/plugin-vue@^6`, `@sveltejs/vite-plugin-svelte@^7` (with `svelte@^5.46.4`), `@preact/preset-vite@^2.10.6` and `vite-plugin-elm@^3.1`. Externals required from CommonJS dependencies are now converted to imports, as Rolldown leaves those `require()` calls in the bundle. `oc-server` accepts Vite 8 as a peer and depends on `esbuild` directly, which Vite 8 no longer installs.
