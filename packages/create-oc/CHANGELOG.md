# create-oc

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
