# oc-server

## 0.4.5

### Patch Changes

- Call callback outside try catch so errors on callback itself are not catched by wrapper

## 0.4.4

### Patch Changes

- fix plugin type

## 0.4.3

### Patch Changes

- Add plugins interface extend

## 0.4.2

### Patch Changes

- 5008296: Fix SSR for all new templates

## 0.4.1

### Patch Changes

- 1acfd78: Make actions and initial action public readonly for tests

## 0.3.3

### Patch Changes

- ab79d18: Add id prop to getSettings function

## 0.3.2

### Patch Changes

- 2212d0e: Forgot to actually export it :/

## 0.3.1

### Patch Changes

- 8617f98: Export ServerContext type

## 0.3.0

### Minor Changes

- 91385c0: Add getInitialData and getSettings to oc-server and compiler

## 0.2.0

### Minor Changes

- Rename Context to DataContext and ContextWithoutParams to ServerContext. Strip setEmptyResponse from ServerContext.

## 0.1.0

### Minor Changes

- b9f6ff6: Add InitialData type and update react template
