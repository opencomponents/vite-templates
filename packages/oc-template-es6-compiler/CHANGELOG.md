# oc-template-es6-compiler

## 6.0.1

### Patch Changes

- Allow users to augment ocevents
- Updated dependencies
  - oc-vite-compiler@4.2.9

## 6.0.0

### Major Changes

- Fix SSR in es6 and create specific html that removes unneeded elements
  It's a breaking change because in cases where the template has no css the element will have no inner div container
  Not needed because there is no need to target it only to replace html without affecting styles

### Patch Changes

- Updated dependencies
  - oc-template-es6@2.0.0

## 5.1.9

### Patch Changes

- update build
- Updated dependencies
  - oc-vite-compiler@4.2.4

## 5.1.8

### Patch Changes

- Fix esm params/imports
- Updated dependencies
  - oc-vite-compiler@4.2.3

## 5.1.7

### Patch Changes

- fix packages
- Updated dependencies
  - oc-vite-compiler@4.2.2

## 5.1.6

### Patch Changes

- Add ESM support
- Updated dependencies
  - oc-vite-compiler@4.2.1

## 5.1.5

### Patch Changes

- Use new oc-vite
- Updated dependencies
  - oc-vite-compiler@4.1.2

## 5.1.4

### Patch Changes

- Update scaffold dependencies

## 5.1.3

### Patch Changes

- Fix svelte build and new withParameters build too
- Updated dependencies
  - oc-vite-compiler@4.1.1

## 5.1.2

### Patch Changes

- add svelte to createoc

## 5.1.1

### Patch Changes

- Add svelte

## 5.1.0

### Minor Changes

- Officially add withParameters and replace on package.json always on build

### Patch Changes

- Updated dependencies
  - oc-vite-compiler@4.1.0

## 5.0.3

### Patch Changes

- Fix SSR by checking document before looking for id
- Updated dependencies
  - oc-vite-compiler@4.0.2

## 5.0.2

### Patch Changes

- fix stream adding

## 5.0.1

### Patch Changes

- Fix vite dep
- Updated dependencies
  - oc-vite-compiler@4.0.1

## 5.0.0

### Major Changes

- 3346c80: Add streaming support
- aed2349: Update Vite to v6

### Patch Changes

- Updated dependencies [3346c80]
- Updated dependencies [aed2349]
  - oc-vite-compiler@4.0.0

## 4.5.0

### Minor Changes

- Update oc-statics-compiler to use new major version of babel

### Patch Changes

- Updated dependencies
  - oc-vite-compiler@3.9.0

## 4.4.6

### Patch Changes

- Add servererror util and make htmlrender of id stronger
- Updated dependencies
  - oc-vite-compiler@3.8.5

## 4.4.5

### Patch Changes

- pick element from data-id
- Updated dependencies
  - oc-vite-compiler@3.8.4

## 4.4.4

### Patch Changes

- Pass element to getsettings
- Updated dependencies
  - oc-vite-compiler@3.8.3

## 4.4.3

### Patch Changes

- Update react and solid deps

## 4.4.2

### Patch Changes

- Add ocserver dev

## 4.4.1

### Patch Changes

- Remove oc dependency from oc-server

## 4.4.0

### Minor Changes

- Add support for all templates except elm of HMR

## 4.3.6

### Patch Changes

- Fix server scaffold for oc-server 1.0+

## 4.3.5

### Patch Changes

- Fix plugins in dev

## 4.3.4

### Patch Changes

- Add HMR capabilities in oc-server. Add React support.

## 4.3.3

### Patch Changes

- Update templates

## 4.3.2

### Patch Changes

- Fix passing id when rerender
- Updated dependencies
  - oc-vite-compiler@3.8.2

## 4.3.1

### Patch Changes

- Update vite to oc-vite
- Updated dependencies
  - oc-vite-compiler@3.8.1

## 4.3.0

### Minor Changes

- abdda37: Update vite

### Patch Changes

- f64af50: Fix sending arrays or non-objects on actions
- Updated dependencies [f64af50]
- Updated dependencies [abdda37]
  - oc-vite-compiler@3.8.0

## 4.2.2

### Patch Changes

- Fix initial data closure by always recreating component closure
- Updated dependencies
  - oc-vite-compiler@3.7.2

## 4.2.1

### Patch Changes

- 7e41a55: Ignore cjs warnings
- Updated dependencies [7e41a55]
  - oc-vite-compiler@3.7.1

## 4.2.0

### Minor Changes

- Update to vite 5.1

### Patch Changes

- Updated dependencies
  - oc-vite-compiler@3.7.0

## 4.1.3

### Patch Changes

- Add element type to oc:rendered event
- Updated dependencies
  - oc-vite-compiler@3.6.3

## 4.1.2

### Patch Changes

- Fix checking server exports without making rollup angry
- Updated dependencies
  - oc-vite-compiler@3.6.2

## 4.1.1

### Patch Changes

- 5008296: Fix SSR for all new templates
- Updated dependencies [5008296]
  - oc-vite-compiler@3.6.1

## 4.1.0

### Minor Changes

- 78b3bdc: Add option to describe your own externals in your package.json over oc.files.template.externals

### Patch Changes

- Updated dependencies [78b3bdc]
  - oc-vite-compiler@3.6.0

## 4.0.10

### Patch Changes

- 989cdd6: Use default viewwrapper instead of custom for es6
- Updated dependencies [989cdd6]
  - oc-vite-compiler@3.5.8

## 4.0.9

### Patch Changes

- ab79d18: Add id prop to getSettings function
- Updated dependencies [ab79d18]
  - oc-vite-compiler@3.5.7

## 4.0.8

### Patch Changes

- Fix default view wrapper import
- Updated dependencies
  - oc-vite-compiler@3.5.6

## 4.0.7

### Patch Changes

- 18434e4: Add known oc events to the type definitions

## 4.0.6

### Patch Changes

- 622dd8e: Add OC types definitions
- Updated dependencies [622dd8e]
  - oc-vite-compiler@3.5.4

## 4.0.5

### Patch Changes

- f053326: Destruct props on default view wrapper
- Updated dependencies [f053326]
  - oc-vite-compiler@3.5.3

## 4.0.4

### Patch Changes

- bed46b0: Update templates and ignore CJS warnings on vite compiler
- Updated dependencies [bed46b0]
  - oc-vite-compiler@3.5.2

## 4.0.3

### Patch Changes

- 7b9d492: Fix ES6 template by passing htmlTemplate param to compiler
- Updated dependencies [7b9d492]
  - oc-vite-compiler@3.5.1
