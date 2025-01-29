# oc-server

## 1.1.10

### Patch Changes

- Convert return from handler and actions to JSON

## 1.1.9

### Patch Changes

- Add servererror util and make htmlrender of id stronger

## 1.1.8

### Patch Changes

- Pass element to getsettings

## 1.1.7

### Patch Changes

- Fix packages

## 1.1.6

### Patch Changes

- Swap express with fastify

## 1.1.5

### Patch Changes

- Remove oc dependency from oc-server

## 1.1.4

### Patch Changes

- Allow empty plugin

## 1.1.3

### Patch Changes

- Add oc-client if not added externally on html

## 1.1.2

### Patch Changes

- Fix custom html template rendering

## 1.1.1

### Patch Changes

- Fix plugins in dev

## 1.1.0

### Minor Changes

- Add HMR capabilities in oc-server. Add React support.

## 1.0.0

### Major Changes

- Change API to correctly type all parts

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
