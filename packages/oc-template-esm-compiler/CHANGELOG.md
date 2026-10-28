# oc-template-esm-compiler

## 4.1.1

### Patch Changes

- Updated dependencies [0ad076b]
  - oc-server@4.0.4

## 4.1.0

### Minor Changes

- 05ee321: Resolve the shadow root a component is mounted in and expose it on the mount context.

  The `mount` context now includes `shadowRoot` (alongside the existing
  `styleElement`/`styleId`), populated both when the component creates its own
  shadow root via `oc.files.template.shadowDOM` and when the embedding page mounts
  the component inside a shadow root it owns. Detection uses `element.getRootNode()`
  instead of a manual `parentNode` walk, so closed and nested shadow roots are
  handled correctly.

  A `getShadowRoot(node)` helper is also exported from
  `oc-template-esm-compiler/renderer` for use outside `mount`. The template stays
  framework-agnostic: it reports where the component is rendered and leaves all
  styling and DOM decisions to the component.

### Patch Changes

- 92acebc: Reliability fixes found by the end-to-end suite, which now covers all templates:

  - Svelte and Solid providers crashed on load because `element.parentElement.unmount`
    ran at module scope; it now runs inside the renderer like the React provider.
  - The Svelte template and compiler used `@sveltejs/vite-plugin-svelte` v5, which
    peer-conflicts with Vite 7; both now use v6.
  - The Vue template used `className` instead of `class`, so component styles never
    applied; the Svelte template rendered raw `hobbies` instead of the formatted list.
  - The Elm provider dropped `staticPath` from the flags, so `Main.elm` fell back to
    empty initial data; it is now passed through from `_staticPath`.
  - The Elm template imported `serverClient` from `'oc-server'` (undefined) instead
    of `'oc-server/client'`, breaking the fun-fact action.
  - `oc-server` now declares its `oc-vite-compiler` dependency (previously imported
    without declaring it, which raced the monorepo build), and
    `oc-template-esm-compiler` declares its `oc-server` type dependency.

- e752a2f: Update scaffolded template libraries to latest (React template stays 18.x).

  Frameworks: solid-js 1.9, vue 3.5.43, svelte 5.57, preact 11, react-dom 19.3
  for esm.react. Toolchain: typescript 5.9, vitest 5, jsdom 30, happy-dom 20,
  jest-dom 7, vue-tsc 3. Deliberately untouched: vite and oc-\* pins (managed
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

- Updated dependencies [92acebc]
  - oc-server@4.0.3

## 4.0.3

### Patch Changes

- allow getSetting in componentdidmount to return the id
- Updated dependencies
  - oc-vite-compiler@6.0.2

## 4.0.2

### Patch Changes

- sourcemaps only in dev
- Updated dependencies
  - oc-vite-compiler@6.0.1

## 4.0.1

### Patch Changes

- Fix hmr for fn returning

## 4.0.0

### Major Changes

- Move to Vite 7

### Patch Changes

- Updated dependencies
  - oc-vite-compiler@6.0.0

## 3.0.3

### Patch Changes

- Fix callback fn uniqueness

## 3.0.2

### Patch Changes

- update examples with callback

## 3.0.1

### Patch Changes

- Accept a callback fn for createComponent

## 3.0.0

### Patch Changes

- Move oc-server dev to vite plugin
- Updated dependencies
  - oc-server@4.0.0

## 2.0.2

### Patch Changes

- Fix shadowdom global pollution
- Updated dependencies
  - oc-vite-compiler@5.1.4

## 2.0.1

### Patch Changes

- Add signal option to serverClient and getAction
- Updated dependencies
  - oc-server@3.2.1
  - oc-vite-compiler@5.1.3

## 2.0.0

### Patch Changes

- Updated dependencies
  - oc-server@3.2.0

## 1.1.2

### Patch Changes

- Fix publish of ssr fix
- Updated dependencies
  - oc-vite-compiler@5.1.2

## 1.1.1

### Patch Changes

- Fix SSR render
- Updated dependencies
  - oc-vite-compiler@5.1.1

## 1.1.0

### Minor Changes

- Add sourcemaps to dev servers

### Patch Changes

- Updated dependencies
  - oc-vite-compiler@5.1.0

## 1.0.1

### Patch Changes

- Add cursor rules

## 1.0.0

### Minor Changes

- Add option to browser logs

### Patch Changes

- Updated dependencies
  - oc-server@3.0.0
  - oc-vite-compiler@5.0.0

## 0.2.3

### Patch Changes

- Fix HMR on esm template
- Updated dependencies
  - oc-server@2.1.1

## 0.2.1

### Patch Changes

- Allow users to augment ocevents
- Updated dependencies
  - oc-vite-compiler@4.2.9

## 0.2.0

### Minor Changes

- Add unmount capabilities

## 0.1.0

### Minor Changes

- Fix loading server data on all bundles

### Patch Changes

- Updated dependencies
  - oc-vite-compiler@4.2.8

## 0.0.8

### Patch Changes

- fix getinitialdataa on esm
- Updated dependencies
  - oc-vite-compiler@4.2.7

## 0.0.6

### Patch Changes

- use ocvite
- Updated dependencies
  - oc-vite-compiler@4.2.5

## 0.0.5

### Patch Changes

- update build
- Updated dependencies
  - oc-vite-compiler@4.2.4

## 0.0.4

### Patch Changes

- Fix esm params/imports
- Updated dependencies
  - oc-vite-compiler@4.2.3

## 0.0.3

### Patch Changes

- fix packages
- Updated dependencies
  - oc-vite-compiler@4.2.2
