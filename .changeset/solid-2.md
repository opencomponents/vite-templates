---
'oc-template-solid': minor
'oc-template-solid-compiler': major
---

Upgrade to Solid 2.0. The runtime now renders with `@solidjs/web`, and the compiler builds with `@solidjs/vite-plugin`. Components must migrate to Solid 2 (see https://docs.solidjs.com for the migration guide): set `jsxImportSource` to `@solidjs/web`, and import DOM APIs such as `render` from `@solidjs/web` instead of `solid-js/web`.
