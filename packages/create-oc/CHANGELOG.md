# create-oc

## 1.1.42

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

- 071f6fb: Redesigned scaffold example shared by every template. The server drops the
  fake user database for `name` + `year` parameters with a tiny fun-fact lookup
  backing a single `funFact` action, and the UI becomes a modern greeting card
  (dark hero, white card, year pill, full-width button) with button loading and
  inline error states on the action call.
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

## 1.1.41

### Patch Changes

- Remove the experimental label from the Remix ESM template option.

## 1.1.40

### Patch Changes

- Update the Remix ESM template to use the stable `@remix-run/ui` runtime.

## 1.1.35

### Patch Changes

- Fix rendering on vue

## 1.1.33

### Patch Changes

- Move to Vite 7

## 1.1.31

### Patch Changes

- update examples with callback

## 1.1.30

### Patch Changes

- Move oc-server dev to vite plugin

## 1.1.25

### Patch Changes

- Add cursor rules

## 1.1.24

### Patch Changes

- Add option to browser logs

## 1.1.22

### Patch Changes

- Allow users to augment ocevents

## 1.1.21

### Patch Changes

- Fix SSR in es6 and create specific html that removes unneeded elements
  It's a breaking change because in cases where the template has no css the element will have no inner div container
  Not needed because there is no need to target it only to replace html without affecting styles

## 1.1.19

### Patch Changes

- fix getinitialdataa on esm

## 1.1.17

### Patch Changes

- use ocvite

## 1.1.16

### Patch Changes

- update build

## 1.1.14

### Patch Changes

- fix packages

## 1.1.12

### Patch Changes

- Add ESM support

## 1.1.11

### Patch Changes

- fix type import

## 1.1.9

### Patch Changes

- Allow parameters for create oc cli for name and template

## 1.1.8

### Patch Changes

- Update scaffold dependencies

## 1.1.7

### Patch Changes

- Add check against ctrl-c escape

## 1.1.6

### Patch Changes

- Add Svelte again not its fixed

## 1.1.5

### Patch Changes

- Fix tsconfig

## 1.1.4

### Patch Changes

- Fix svelte build and new withParameters build too

## 1.1.3

### Patch Changes

- remove svelte until fix esm issue

## 1.1.2

### Patch Changes

- add svelte to createoc

## 1.1.1

### Patch Changes

- Add svelte

## 1.1.0

### Minor Changes

- Officially add withParameters and replace on package.json always on build

## 1.0.1

### Patch Changes

- fix stream adding

## 1.0.0

### Major Changes

- aed2349: Update Vite to v6

## 0.0.31

### Patch Changes

- Update react and solid deps

## 0.0.30

### Patch Changes

- Add ocserver dev

## 0.0.29

### Patch Changes

- Remove oc dependency from oc-server

## 0.0.28

### Patch Changes

- Fix server scaffold for oc-server 1.0+

## 0.0.27

### Patch Changes

- Fix plugins in dev

## 0.0.26

### Patch Changes

- Add HMR capabilities in oc-server. Add React support.

## 0.0.24

### Patch Changes

- Fix initial data closure by always recreating component closure

## 0.0.12

### Patch Changes

- bed46b0: Update templates and ignore CJS warnings on vite compiler

## 0.0.11

### Patch Changes

- b2ac9fa: Compile preact useData with preact. update templates.

## 0.0.10

### Patch Changes

- b9f6ff6: Add InitialData type and update react template
