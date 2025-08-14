# oc-server

## 3.0.0

### Major Changes

- Add option to browser logs

## 2.1.1

### Patch Changes

- Fix HMR on esm template

## 2.1.0

### Minor Changes

- Strict types for input and output (any to unknown)

## 2.0.6

### Patch Changes

- Export HandlerParameters type

## 2.0.5

### Patch Changes

- Add svelte

## 2.0.4

### Patch Changes

- fix tojson when returning optional params

## 2.0.3

### Patch Changes

- Fix checking for streamsymbol only if is returning object and improve type for empty param-actions

## 2.0.2

### Patch Changes

- fix stream adding

## 2.0.1

### Patch Changes

- fix streaming types

## 2.0.0

### Major Changes

- 3346c80: Add streaming support

## 1.1.11

### Patch Changes

- Add witbParameters param to server

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
