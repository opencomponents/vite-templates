---
'create-oc': patch
'oc-template-elm-compiler': patch
'oc-template-esm-compiler': patch
'oc-template-preact-compiler': patch
'oc-template-react-compiler': patch
'oc-template-solid-compiler': patch
'oc-template-svelte-compiler': patch
'oc-template-vue-compiler': patch
---

Update scaffolded template libraries to latest (React template stays 18.x).

Frameworks: solid-js 1.9, vue 3.5.43, svelte 5.57, preact 11, react-dom 19.3
for esm.react. Toolchain: typescript 5.9, vitest 5, jsdom 30, happy-dom 20,
jest-dom 7, vue-tsc 3. Deliberately untouched: vite and oc-* pins (managed
by create-oc/build.js), elm (frozen), vite-plugin-svelte v7 and plugin-vue
v6 in compilers (ESM-only, incompatible with the CJS compiler builds).

The esm.remix template migrates off experimental `@remix-run/ui` 0.4 to
stable `@remix-run/component` 1.0 (imports, jsxImportSource, rollup
externals, dependency and scaffold import map).

Test-infra fixes so template suites run green: added the missing
`@testing-library/jest-dom` dependency to react/preact, moved Vue SFC
support into a new `vitest.config.ts` (the packaging build reads
`vite.config.ts`, which must stay plugin-free), switched esm.react to the
happy-dom environment, and moved the preact suite to
`@testing-library/preact`.

The ESM template leaves beta: the `ESM (Beta)` picker label and README
section are now plain `ESM`.
