# oc-vite-compiler

## 4.2.9

### Patch Changes

- Allow users to augment ocevents
- Updated dependencies
  - oc-vite@6.3.6

## 4.2.8

### Patch Changes

- Fix loading server data on all bundles

## 4.2.7

### Patch Changes

- fix getinitialdataa on esm

## 4.2.5

### Patch Changes

- use ocvite

## 4.2.4

### Patch Changes

- update build

## 4.2.3

### Patch Changes

- Fix esm params/imports

## 4.2.2

### Patch Changes

- fix packages

## 4.2.1

### Patch Changes

- Add ESM support

## 4.2.0

### Minor Changes

- Add ability to bundle react
  Breaking: drop support for React 17 and lower

## 4.1.2

### Patch Changes

- Use new oc-vite

## 4.1.1

### Patch Changes

- Fix svelte build and new withParameters build too

## 4.1.0

### Minor Changes

- Officially add withParameters and replace on package.json always on build

## 4.0.2

### Patch Changes

- Fix SSR by checking document before looking for id

## 4.0.1

### Patch Changes

- Fix vite dep

## 4.0.0

### Major Changes

- 3346c80: Add streaming support
- aed2349: Update Vite to v6

## 3.9.0

### Minor Changes

- Update oc-statics-compiler to use new major version of babel

## 3.8.6

### Patch Changes

- Add witbParameters param to server

## 3.8.5

### Patch Changes

- Add servererror util and make htmlrender of id stronger

## 3.8.4

### Patch Changes

- pick element from data-id

## 3.8.3

### Patch Changes

- Pass element to getsettings

## 3.8.2

### Patch Changes

- Fix passing id when rerender

## 3.8.1

### Patch Changes

- Update vite to oc-vite

## 3.8.0

### Minor Changes

- abdda37: Update vite

### Patch Changes

- f64af50: Fix sending arrays or non-objects on actions
- Updated dependencies [abdda37]
  - oc-vite@5.3.0

## 3.7.2

### Patch Changes

- Fix initial data closure by always recreating component closure

## 3.7.1

### Patch Changes

- 7e41a55: Ignore cjs warnings

## 3.7.0

### Minor Changes

- Update to vite 5.1

### Patch Changes

- Updated dependencies
  - oc-vite@5.1.0

## 3.6.3

### Patch Changes

- Add element type to oc:rendered event
- Updated dependencies
  - oc-vite@5.0.14

## 3.6.2

### Patch Changes

- Fix checking server exports without making rollup angry

## 3.6.1

### Patch Changes

- 5008296: Fix SSR for all new templates

## 3.6.0

### Minor Changes

- 78b3bdc: Add option to describe your own externals in your package.json over oc.files.template.externals

## 3.5.8

### Patch Changes

- 989cdd6: Use default viewwrapper instead of custom for es6

## 3.5.7

### Patch Changes

- ab79d18: Add id prop to getSettings function

## 3.5.6

### Patch Changes

- Fix default view wrapper import

## 3.5.4

### Patch Changes

- 622dd8e: Add OC types definitions
- Updated dependencies [622dd8e]
  - oc-vite@5.0.9

## 3.5.3

### Patch Changes

- f053326: Destruct props on default view wrapper

## 3.5.2

### Patch Changes

- bed46b0: Update templates and ignore CJS warnings on vite compiler

## 3.5.1

### Patch Changes

- 7b9d492: Fix ES6 template by passing htmlTemplate param to compiler

## 3.5.0

### Minor Changes

- 91385c0: Add getInitialData and getSettings to oc-server and compiler

## 3.4.0

### Minor Changes

- ffdeefb: Fix SSR for Vite compiler on React, adapt the rest
