# oc-template-vue-compiler

## 4.0.3

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

## 4.0.2

### Patch Changes

- allow getSetting in componentdidmount to return the id
- Updated dependencies
  - oc-vite-compiler@6.0.2

## 4.0.1

### Patch Changes

- Fix rendering on vue

## 4.0.0

### Major Changes

- Move to Vite 7

### Patch Changes

- Updated dependencies
  - oc-vite-compiler@6.0.0

## 3.1.4

### Patch Changes

- Move oc-server dev to vite plugin

## 3.1.3

### Patch Changes

- Add signal option to serverClient and getAction
- Updated dependencies
  - oc-vite-compiler@5.1.3

## 3.1.2

### Patch Changes

- Fix publish of ssr fix
- Updated dependencies
  - oc-vite-compiler@5.1.2

## 3.1.1

### Patch Changes

- Fix SSR render
- Updated dependencies
  - oc-vite-compiler@5.1.1

## 3.1.0

### Minor Changes

- Add sourcemaps to dev servers

### Patch Changes

- Updated dependencies
  - oc-vite-compiler@5.1.0

## 3.0.1

### Patch Changes

- Add cursor rules

## 3.0.0

### Major Changes

- Add option to browser logs

### Patch Changes

- Updated dependencies
  - oc-vite-compiler@5.0.0

## 2.0.1

### Patch Changes

- Allow users to augment ocevents
- Updated dependencies
  - oc-vite-compiler@4.2.9

## 2.0.0

### Major Changes

- Add unmount capabilities

## 1.1.9

### Patch Changes

- update build
- Updated dependencies
  - oc-vite-compiler@4.2.4

## 1.1.8

### Patch Changes

- Fix esm params/imports
- Updated dependencies
  - oc-vite-compiler@4.2.3

## 1.1.7

### Patch Changes

- fix packages
- Updated dependencies
  - oc-vite-compiler@4.2.2

## 1.1.6

### Patch Changes

- Add ESM support
- Updated dependencies
  - oc-vite-compiler@4.2.1

## 1.1.5

### Patch Changes

- Use new oc-vite
- Updated dependencies
  - oc-vite-compiler@4.1.2

## 1.1.4

### Patch Changes

- Update scaffold dependencies

## 1.1.3

### Patch Changes

- Fix svelte build and new withParameters build too
- Updated dependencies
  - oc-vite-compiler@4.1.1

## 1.1.2

### Patch Changes

- add svelte to createoc

## 1.1.1

### Patch Changes

- Add svelte

## 1.1.0

### Minor Changes

- Officially add withParameters and replace on package.json always on build

### Patch Changes

- Updated dependencies
  - oc-vite-compiler@4.1.0

## 1.0.3

### Patch Changes

- Fix SSR by checking document before looking for id
- Updated dependencies
  - oc-vite-compiler@4.0.2

## 1.0.2

### Patch Changes

- fix stream adding

## 1.0.1

### Patch Changes

- Fix vite dep
- Updated dependencies
  - oc-vite-compiler@4.0.1

## 1.0.0

### Major Changes

- 3346c80: Add streaming support
- aed2349: Update Vite to v6

### Patch Changes

- Updated dependencies [3346c80]
- Updated dependencies [aed2349]
  - oc-vite-compiler@4.0.0

## 0.7.0

### Minor Changes

- Update oc-statics-compiler to use new major version of babel

### Patch Changes

- Updated dependencies
  - oc-vite-compiler@3.9.0

## 0.6.6

### Patch Changes

- Add servererror util and make htmlrender of id stronger
- Updated dependencies
  - oc-vite-compiler@3.8.5

## 0.6.5

### Patch Changes

- pick element from data-id
- Updated dependencies
  - oc-vite-compiler@3.8.4

## 0.6.4

### Patch Changes

- Pass element to getsettings
- Updated dependencies
  - oc-vite-compiler@3.8.3

## 0.6.3

### Patch Changes

- Update react and solid deps

## 0.6.2

### Patch Changes

- Add ocserver dev

## 0.6.1

### Patch Changes

- Remove oc dependency from oc-server

## 0.6.0

### Minor Changes

- Add support for all templates except elm of HMR

## 0.5.6

### Patch Changes

- Fix server scaffold for oc-server 1.0+

## 0.5.5

### Patch Changes

- Fix plugins in dev

## 0.5.4

### Patch Changes

- Add HMR capabilities in oc-server. Add React support.

## 0.5.3

### Patch Changes

- Update templates

## 0.5.2

### Patch Changes

- Fix passing id when rerender
- Updated dependencies
  - oc-vite-compiler@3.8.2

## 0.5.1

### Patch Changes

- Update vite to oc-vite
- Updated dependencies
  - oc-vite-compiler@3.8.1

## 0.5.0

### Minor Changes

- abdda37: Update vite

### Patch Changes

- f64af50: Fix sending arrays or non-objects on actions
- Updated dependencies [f64af50]
- Updated dependencies [abdda37]
  - oc-vite-compiler@3.8.0

## 0.4.2

### Patch Changes

- Fix initial data closure by always recreating component closure
- Updated dependencies
  - oc-vite-compiler@3.7.2

## 0.4.1

### Patch Changes

- 7e41a55: Ignore cjs warnings
- Updated dependencies [7e41a55]
  - oc-vite-compiler@3.7.1

## 0.4.0

### Minor Changes

- Update to vite 5.1

### Patch Changes

- Updated dependencies
  - oc-vite-compiler@3.7.0

## 0.3.3

### Patch Changes

- Add element type to oc:rendered event
- Updated dependencies
  - oc-vite-compiler@3.6.3

## 0.3.2

### Patch Changes

- Fix checking server exports without making rollup angry
- Updated dependencies
  - oc-vite-compiler@3.6.2

## 0.3.1

### Patch Changes

- 5008296: Fix SSR for all new templates
- Updated dependencies [5008296]
  - oc-vite-compiler@3.6.1

## 0.3.0

### Minor Changes

- 78b3bdc: Add option to describe your own externals in your package.json over oc.files.template.externals

### Patch Changes

- Updated dependencies [78b3bdc]
  - oc-vite-compiler@3.6.0

## 0.2.4

### Patch Changes

- ab79d18: Add id prop to getSettings function
- Updated dependencies [ab79d18]
  - oc-vite-compiler@3.5.7

## 0.2.3

### Patch Changes

- 18434e4: Add known oc events to the type definitions

## 0.2.2

### Patch Changes

- 622dd8e: Add OC types definitions
- Updated dependencies [622dd8e]
  - oc-vite-compiler@3.5.4

## 0.2.1

### Patch Changes

- bed46b0: Update templates and ignore CJS warnings on vite compiler
- Updated dependencies [bed46b0]
  - oc-vite-compiler@3.5.2

## 0.1.0

### Minor Changes

- e9a24bc: Make Vue external instead of bundled

### Patch Changes

- Updated dependencies [e9a24bc]
  - oc-template-vue@0.1.0

## 0.0.3

### Patch Changes

- ffdeefb: Fix SSR for Vite compiler on React, adapt the rest
- Updated dependencies [ffdeefb]
  - oc-vite-compiler@3.4.0
  - oc-template-vue@0.0.2
