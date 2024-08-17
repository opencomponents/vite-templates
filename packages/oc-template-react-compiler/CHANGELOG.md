# oc-template-react-compiler

## 6.6.1

### Patch Changes

- Remove oc dependency from oc-server

## 6.6.0

### Minor Changes

- Add support for all templates except elm of HMR

## 6.5.3

### Patch Changes

- Fix server scaffold for oc-server 1.0+

## 6.5.2

### Patch Changes

- Fix custom html template rendering

## 6.5.1

### Patch Changes

- Fix plugins in dev

## 6.5.0

### Minor Changes

- Add HMR capabilities in oc-server. Add React support.

## 6.4.4

### Patch Changes

- Upgrade react plugin

## 6.4.3

### Patch Changes

- Update templates

## 6.4.2

### Patch Changes

- Fix passing id when rerender
- Updated dependencies
  - oc-vite-compiler@3.8.2

## 6.4.1

### Patch Changes

- Update vite to oc-vite
- Updated dependencies
  - oc-vite-compiler@3.8.1

## 6.4.0

### Minor Changes

- abdda37: Update vite

### Patch Changes

- f64af50: Fix sending arrays or non-objects on actions
- Updated dependencies [f64af50]
- Updated dependencies [abdda37]
  - oc-vite-compiler@3.8.0

## 6.3.2

### Patch Changes

- Fix initial data closure by always recreating component closure
- Updated dependencies
  - oc-vite-compiler@3.7.2

## 6.3.1

### Patch Changes

- 7e41a55: Ignore cjs warnings
- Updated dependencies [7e41a55]
  - oc-vite-compiler@3.7.1

## 6.3.0

### Minor Changes

- Update to vite 5.1

### Patch Changes

- Updated dependencies
  - oc-vite-compiler@3.7.0

## 6.2.3

### Patch Changes

- Add element type to oc:rendered event
- Updated dependencies
  - oc-vite-compiler@3.6.3

## 6.2.2

### Patch Changes

- Fix checking server exports without making rollup angry
- Updated dependencies
  - oc-vite-compiler@3.6.2

## 6.2.1

### Patch Changes

- 5008296: Fix SSR for all new templates
- Updated dependencies [5008296]
  - oc-vite-compiler@3.6.1
  - oc-template-react@4.0.2

## 6.2.0

### Minor Changes

- 78b3bdc: Add option to describe your own externals in your package.json over oc.files.template.externals

### Patch Changes

- Updated dependencies [78b3bdc]
  - oc-vite-compiler@3.6.0

## 6.1.4

### Patch Changes

- ab79d18: Add id prop to getSettings function
- Updated dependencies [ab79d18]
  - oc-vite-compiler@3.5.7

## 6.1.3

### Patch Changes

- 18434e4: Add known oc events to the type definitions

## 6.1.2

### Patch Changes

- 622dd8e: Add OC types definitions
- Updated dependencies [622dd8e]
  - oc-vite-compiler@3.5.4

## 6.1.1

### Patch Changes

- bed46b0: Update templates and ignore CJS warnings on vite compiler
- Updated dependencies [bed46b0]
  - oc-vite-compiler@3.5.2

## 6.0.4

### Patch Changes

- ffdeefb: Fix SSR for Vite compiler on React, adapt the rest
- Updated dependencies [ffdeefb]
  - oc-vite-compiler@3.4.0
  - oc-template-react@4.0.1
